from fastapi import Depends, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import select
from datetime import datetime
import traceback
from database import get_db
from global_utils import success_response, CustomException
from apis.users.models import UserModel
from apis.tenant.models import TenantModel
from apis.users.schemas import UserLoginSchema
from auth import generate_access_token


async def user_login_api(
    data: UserLoginSchema,
    session: Session = Depends(get_db)
) -> dict:
    try:
        data = data.model_dump()
        email = data.get("email")
        password = data.get("password")

        user_stmt = select(UserModel).where(UserModel.email == email)
        user = session.execute(user_stmt).scalar_one_or_none()

        if not user:
            raise CustomException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        if not user.verify_password(password):
            raise CustomException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        user.last_login = datetime.now()

        tenant_stmt = select(TenantModel.tenant_name).where(TenantModel.id == user.tenant_id)
        tenant_name = session.execute(tenant_stmt).scalars().first()

        token = generate_access_token(user.id, user.tenant_id)
        response = {
            "user_id": user.id,
            "first_name": user.first_name,
            "last_name": user.last_name if user.last_name else None,
            "access_token": token,
            "tenant_name": tenant_name
        }

        session.commit()

        return success_response(
            status_code=status.HTTP_200_OK,
            details="User login successfully",
            data=response
        )
    except SQLAlchemyError as e:
        session.rollback()
        raise CustomException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal Server Error {e}",
            error=str(e),
            trace_back=traceback.format_exc()
        )
