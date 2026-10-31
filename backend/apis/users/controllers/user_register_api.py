from fastapi import Depends, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from datetime import date, timedelta
import traceback
from database import get_db
from global_utils import success_response, CustomException, generate_tenant_code, send_activation_email
from apis.tenant.models import TenantModel
from apis.business.models import BusinessModel
from apis.users.models import UserModel, UserProfileModel
from apis.users.schemas import UserRegisterSchema
from auth import create_activation_token
from apis.users.utils import get_full_name
from config import SUBSCRIPTION_PLAN, SUBSCRIPTION_DAY_COUNT


async def user_register_api(
    data: UserRegisterSchema,
    session: Session = Depends(get_db)
) -> dict:
    try:
        data_dict = data.model_dump()

        business_name = data_dict.get("business_name")
        first_name = data_dict.get("first_name")
        last_name = data_dict.get("last_name")
        email = data_dict.get("email")
        phone = data_dict.get("phone")
        password = data_dict.get("password")
        confirm_password = data_dict.get("confirm_password")
        subscription_plan_id = data_dict.get("subscription_plan")

        if subscription_plan_id not in SUBSCRIPTION_PLAN:
            raise CustomException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported subscription plan.")
        plan_name = SUBSCRIPTION_PLAN[subscription_plan_id]
        duration_days = SUBSCRIPTION_DAY_COUNT[subscription_plan_id]

        if password != confirm_password:
            raise CustomException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password and confirm password do not match"
            )

        existing_user = session.query(UserModel).filter(UserModel.email == email).first()

        if existing_user:
            raise CustomException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered"
            )

        existing_tenant = session.query(TenantModel).filter(TenantModel.tenant_name == business_name).first()

        if existing_tenant:
            raise CustomException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Business already exists"
            )

        is_free_plan = plan_name == "FREE"
        today = date.today()
        tenant_data = TenantModel(
            tenant_name=business_name,
            tenant_code=generate_tenant_code(business_name),
            subscription_plan=plan_name,
            subscription_start=today if is_free_plan else None,
            subscription_end=today + timedelta(days=duration_days) if is_free_plan else None,
        )

        session.add(tenant_data)
        session.flush()

        business_data = BusinessModel(
            tenant_id=tenant_data.id,
            business_name=business_name
        )

        session.add(business_data)

        user_data = UserModel(
            tenant_id=tenant_data.id,
            first_name=first_name,
            last_name=last_name,
            email=email,
            phone=phone
        )

        user_data.set_password(password)
        session.add(user_data)
        session.flush()

        user_profile = UserProfileModel(
            user_id=user_data.id,
            first_name=first_name,
            last_name=last_name,
            tenant_id=tenant_data.id
        )
        session.add(user_profile)

        activation_token = create_activation_token(session, tenant_data.id)
        user_name = get_full_name(first_name, last_name)
        send_activation_email(tenant_data.id, user_name, email, activation_token, plan_name)

        session.commit()

        return success_response(
            status_code=status.HTTP_201_CREATED,
            details=(
                "Registration successful. Please verify your email to continue with payment."
                if plan_name == "STANDARD"
                else "Registration successful. Please check your email to activate your account."
            )
        )
    except CustomException:
        session.rollback()
        raise
    except SQLAlchemyError as e:
        session.rollback()
        raise CustomException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal Server Error {e}",
            error=str(e),
            trace_back=traceback.format_exc()
        )
    except Exception as e:
        # The transaction is committed before sending mail. Keep the new account
        # inactive if SMTP fails and surface the failure without duplicating rows.
        session.rollback()
        raise CustomException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration was saved, but the activation email could not be sent. Please contact support.",
            error=str(e),
            trace_back=traceback.format_exc()
        )
