from fastapi import Depends, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from datetime import date, timedelta
import traceback
from database import get_db
from global_utils import success_response, CustomException, generate_tenant_code
from apis.tenant.models import TenantModel
from apis.business.models import BusinessModel
from apis.users.models import UserModel, UserProfileModel
from apis.users.schemas import UserRegisterSchema


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

        tenant_data = TenantModel(
            tenant_name=business_name,
            tenant_code=generate_tenant_code(business_name),
            subscription_plan="FREE",
            subscription_start=date.today(),
            subscription_end=date.today() + timedelta(days=30),
            status="ACTIVE"
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
            last_name=last_name
        )
        session.add(user_profile)
        session.commit()

        return success_response(
            status_code=status.HTTP_201_CREATED,
            details="User registered successfully"
        )
    except SQLAlchemyError as e:
        session.rollback()
        raise CustomException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal Server Error {e}",
            error=str(e),
            trace_back=traceback.format_exc()
        )
