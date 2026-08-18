from fastapi import Depends, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import select
from dotenv import load_dotenv
import traceback
from database import get_db
from global_utils import success_response, CustomException
from apis.platform_users.models import PlatformUserModel
from apis.users.schemas import UserLoginSchema
from auth import generate_access_token
from security import pwd_context
from config import SUPER_ADMIN_ROLE


load_dotenv()

async def admin_login_api(
    data: UserLoginSchema,
    session: Session = Depends(get_db)
) -> dict:
    try:
        data = data.model_dump()
        email = data.get("email")
        password = data.get("password")
        role = SUPER_ADMIN_ROLE

        user_stmt = select(PlatformUserModel).where(PlatformUserModel.email == email)
        user = session.execute(user_stmt).scalar_one_or_none()

        if not user:
            raise CustomException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        if not pwd_context.verify(password, user.password):
            raise CustomException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        token = generate_access_token(user_id=user.id, role=role)
        response = {
            'user_id': user.id,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': user.role,
            'access_token': token,
        }
        return success_response(
            status_code=status.HTTP_200_OK,
            details="User login successfully",
            data=response
        )
    except SQLAlchemyError as e:
        raise CustomException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal Server Error {e}",
            error=str(e),
            trace_back=traceback.format_exc()
        )
