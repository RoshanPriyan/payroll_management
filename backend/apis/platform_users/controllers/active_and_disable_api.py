from fastapi import Depends, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import select
import traceback
from database import get_db
from global_utils import success_response, CustomException
from apis.platform_users.models import PlatformUserModel
from apis.platform_users.schemas import UpdateStatusSchema
from apis.platform_users.utils import require_super_admin


async def update_status_api(
    data: UpdateStatusSchema,
    session: Session = Depends(get_db),
    _=Depends(require_super_admin)
) -> dict:
    try:
        data_dict = data.model_dump()
        user_id = data_dict.get("user_id")
        is_active = data_dict.get("is_active")

        existing_user_stmt = select(PlatformUserModel).where(PlatformUserModel.id == user_id)
        existing_user = session.execute(existing_user_stmt).scalars().one_or_none()

        if not existing_user:
            raise CustomException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        if existing_user.is_active == is_active:
            status_text = "active" if is_active else "inactive"

            raise CustomException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"User is already {status_text}"
            )

        existing_user.is_active = is_active

        session.commit()
        session.refresh(existing_user)

        status_text = "activated" if is_active else "deactivated"

        return success_response(
            status_code=status.HTTP_200_OK,
            details=f"User {status_text} successfully"
        )

    except SQLAlchemyError as e:
        session.rollback()
        raise CustomException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal Server Error {e}",
            error=str(e),
            trace_back=traceback.format_exc()
        )
