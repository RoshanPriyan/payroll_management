from fastapi import Depends, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
import traceback
from database import get_db
from global_utils import success_response, CustomException
from apis.platform_users.models import PlatformUserModel
from apis.platform_users.schemas import PlatFormUserRegisterSchema
from script import pwd_context
from apis.platform_users.utils import require_super_admin


async def admin_register_api(
        data: PlatFormUserRegisterSchema,
        session: Session = Depends(get_db),
        _ = Depends(require_super_admin)
) -> dict:
    try:
        data_dict = data.model_dump()

        first_name = data_dict.get("first_name")
        last_name = data_dict.get("last_name")
        email = data_dict.get("email")
        password = data_dict.get("password")
        confirm_password = data_dict.get("confirm_password")

        if password != confirm_password:
            raise CustomException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password and confirm password do not match"
            )

        existing_user = session.query(PlatformUserModel).filter(PlatformUserModel.email == email).first()

        if existing_user:
            raise CustomException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Platform user already registered"
            )

        user_data = PlatformUserModel(
            first_name=first_name,
            last_name=last_name,
            email=email,
            password=pwd_context.hash(password)
        )

        session.add(user_data)
        session.commit()

        return success_response(
            status_code=status.HTTP_201_CREATED,
            details="Admin user registered successfully"
        )
    except SQLAlchemyError as e:
        session.rollback()
        raise CustomException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal Server Error {e}",
            error=str(e),
            trace_back=traceback.format_exc()
        )
