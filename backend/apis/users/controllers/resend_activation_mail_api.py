from fastapi import Depends, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime, timezone
import traceback
from database import get_db
from global_utils import success_response, CustomException, send_activation_email
from auth import create_activation_token
from apis.tenant.models import TenantModel
from apis.users.models import UserModel
from apis.users.schemas import ResendActivationSchema
from apis.users.utils import get_full_name
from apis.users.models import ActivationTokenModel


async def resend_activation_email_api(
    data: ResendActivationSchema,
    session: Session = Depends(get_db),
) -> dict:
    generic_message = (
        "If the account is registered and requires activation, "
        "an activation email will be sent."
    )

    try:
        email = str(data.email).strip()

        # Find the user by registered email
        existing_user = (
            session.query(UserModel)
            .filter(UserModel.email == email)
            .first()
        )

        # Return a generic response to avoid revealing account existence
        if not existing_user:
            return success_response(
                status_code=status.HTTP_200_OK,
                details=generic_message,
            )

        tenant_id = existing_user.tenant_id

        # Check the associated tenant
        existing_tenant = (
            session.query(TenantModel)
            .filter(TenantModel.id == tenant_id)
            .first()
        )

        if not existing_tenant:
            return success_response(
                status_code=status.HTTP_200_OK,
                details=generic_message,
            )

        # Already active: no new activation email is required
        if existing_user.status == "ACTIVE" and existing_tenant.status == "ACTIVE":
            return success_response(
                status_code=status.HTTP_200_OK,
                details=generic_message,
            )

        # Invalidate previous unused tokens for this tenant
        # The old links will no longer be accepted.
        session.query(ActivationTokenModel).filter(
            ActivationTokenModel.tenant_id == tenant_id,
            ActivationTokenModel.used_at.is_(None),
        ).update(
            {"used_at": datetime.now(timezone.utc)},
            synchronize_session=False,
        )

        # Generate and save the new token hash
        activation_token = create_activation_token(session=session, tenant_id=tenant_id)

        # Commit token changes before sending the email.
        # If SMTP fails, the database transaction is already committed.
        session.commit()

        user_name = get_full_name(existing_user.first_name, existing_user.last_name)
        subscription_plan = existing_tenant.subscription_plan

        send_activation_email(tenant_id, user_name, existing_user.email, activation_token, subscription_plan)

        return success_response(
            status_code=status.HTTP_200_OK,
            details=generic_message,
        )

    except SQLAlchemyError as e:
        session.rollback()
        raise CustomException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to process the activation request.",
            error=str(e),
            trace_back=traceback.format_exc(),
        )

    except CustomException:
        session.rollback()
        raise

    except Exception as e:
        # Email sending may fail after the database commit.
        # A resend request can generate a replacement token.
        session.rollback()
        raise CustomException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to send the activation email. Please try again later.",
            error=str(e),
            trace_back=traceback.format_exc(),
        )
