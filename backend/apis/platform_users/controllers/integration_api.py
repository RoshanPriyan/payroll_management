from fastapi import Depends, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from datetime import date, timedelta
import traceback
from database import get_db
from global_utils import success_response, CustomException, generate_tenant_code
from apis.tenant.models import TenantModel
from apis.platform_users.models import ApiTokenModel
from apis.business.models import BusinessModel
from auth import generate_api_token
from apis.platform_users.schemas import CreateIntegrationApiSchema


async def integration_api(
        data: CreateIntegrationApiSchema,
        session: Session = Depends(get_db)
) -> dict:
    try:
        data_dict = data.model_dump()
        tenant_name = data_dict.get("tenant_name")

        existing_tenant = session.query(TenantModel).filter(TenantModel.tenant_name == tenant_name).first()

        if existing_tenant:
            raise CustomException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Tenant already exists"
            )
        
        tenant_data = TenantModel(
            tenant_name=tenant_name,
            tenant_code=generate_tenant_code(tenant_name),
            subscription_plan="FREE",
            subscription_start=date.today(),
            subscription_end=date.today() + timedelta(days=30),
            status="ACTIVE"
        )
        session.add(tenant_data)
        session.flush()

        token = generate_api_token(tenant_name)

        api_token = ApiTokenModel(
            tenant_id=tenant_data.id,
            token=token
        )
        session.add(api_token)

        business_entry = BusinessModel(
            tenant_id=tenant_data.id,
            business_name = tenant_name
        )
        session.add(business_entry)
        session.commit()

        response = {
            'tenant_name': tenant_name,
            'api_key': token,
        }
        return success_response(
            status_code=status.HTTP_200_OK,
            details="Api integration created successfully",
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
