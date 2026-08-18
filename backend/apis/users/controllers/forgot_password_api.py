from fastapi import Depends, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import select
import traceback
from database import get_db
from global_utils import success_response, CustomException
from apis.users.models import UserModel
from apis.users.schemas import ForgotPasswordSchema
from auth import require_admin
from db_service import DBService


async def update_forgot_password_api(
    data: ForgotPasswordSchema,
    session: Session = Depends(get_db),
    token_user=Depends(require_admin)
) -> dict:
    try:
        data = data.model_dump()

        user_id = token_user.get("user_id")
        tenant_id = token_user.get("tenant_id")
        password = data.get("password")

        user = DBService.scalars_first(session=session, model=UserModel, tenant_id=tenant_id, id=user_id)
        user.set_password(password)
        session.commit()

        return success_response(
            status_code=status.HTTP_200_OK,
            details="Password updated successfully",
        )
    except SQLAlchemyError as e:
        session.rollback()
        raise CustomException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal Server Error {e}",
            error=str(e),
            trace_back=traceback.format_exc()
        )
