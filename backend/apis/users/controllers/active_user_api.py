from fastapi import Depends, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
import hashlib
import traceback
from datetime import datetime, timezone, date, timedelta
from database import get_db
from global_utils import success_response, CustomException
from apis.tenant.models import TenantModel
from apis.users.models import UserModel
from apis.users.schemas import ActivationTokenSchema
from apis.users.models import ActivationTokenModel
from config import SUBSCRIPTION_PLAN, SUBSCRIPTION_DAY_COUNT
from auth import create_payment_flow_token



async def user_status_active_api(
        data: ActivationTokenSchema,
        session: Session = Depends(get_db)
) -> dict:
    try:
        # 1. Hash the token received from React
        token_hash = hashlib.sha256(data.token.encode("utf-8")).hexdigest()
        # 2. Find and lock the activation-token record
        activation_record = (
            session.query(ActivationTokenModel)
            .filter(
                ActivationTokenModel.token_hash == token_hash
            )
            .with_for_update()
            .first()
        )

        if not activation_record:
            raise CustomException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid activation link."
            )

        # 3. Reject tokens that have already been used
        if activation_record.used_at is not None:
            raise CustomException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This activation link has already been used."
            )

        # 4. Check token expiry
        now = datetime.now(timezone.utc)
        expires_at = activation_record.expires_at

        # MySQL DATETIME may return a naive datetime
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)

        if expires_at <= now:
            raise CustomException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Activation link has expired. Please request a new one."
            )

        # 5. Get tenant_id from the validated database record
        tenant_id = activation_record.tenant_id

        existing_tenant = (
            session.query(TenantModel)
            .filter(TenantModel.id == tenant_id)
            .first()
        )

        if not existing_tenant:
            raise CustomException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tenant not found."
            )

        existing_user = (
            session.query(UserModel)
            .filter(UserModel.tenant_id == tenant_id)
            .first()
        )

        if not existing_user:
            raise CustomException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found for this tenant."
            )

        plan = existing_tenant.subscription_plan
        if plan not in SUBSCRIPTION_PLAN.values():
            raise CustomException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported subscription plan.")

        # Consume the email token before either plan can proceed.
        activation_record.used_at = datetime.now(timezone.utc)
        subscription_plans = {name: plan_id for plan_id, name in SUBSCRIPTION_PLAN.items()}
        subscription_plans_id = subscription_plans.get(plan)
        duration_days = SUBSCRIPTION_DAY_COUNT[subscription_plans_id]

        if plan == "STANDARD":
            if existing_tenant.status == "ACTIVE" or existing_user.status == "ACTIVE":
                raise CustomException(status_code=status.HTTP_409_CONFLICT, detail="Standard account is already active.")
            payment_token = create_payment_flow_token(tenant_id)
            session.commit()
            return success_response(
                status_code=status.HTTP_200_OK,
                details="Email verified. Payment is required to activate your STANDARD subscription.",
                data={"plan": "STANDARD", "status": "PENDING_PAYMENT", "payment_required": True, "payment_token": payment_token},
            )

        existing_tenant.status = "ACTIVE"
        existing_user.status = "ACTIVE"
        subscription_start = date.today()
        subscription_end = subscription_start + timedelta(days=duration_days)
        existing_tenant.subscription_start = subscription_start
        existing_tenant.subscription_end = subscription_end

        subscription = {
            "plan": plan,
            "status": "ACTIVE",
            "duration_days": duration_days,
            "start_date": subscription_start.isoformat(),
            "end_date": subscription_end.isoformat()
        }
        session.commit()
        return success_response(
            status_code=status.HTTP_200_OK,
            details="Your PayrollPro account has been activated successfully.",
            data=subscription
        )
    except SQLAlchemyError as e:
        session.rollback()
        raise CustomException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error. {e}",
            error=str(e),
            trace_back=traceback.format_exc()
        )
    except CustomException:
        session.rollback()
        raise
    except Exception as e:
        session.rollback()
        raise CustomException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to verify the activation link.",
            error=str(e),
            trace_back=traceback.format_exc(),
        )

