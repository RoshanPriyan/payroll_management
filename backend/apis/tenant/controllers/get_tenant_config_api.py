from fastapi import Depends, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import select
import traceback
from database import get_db
from auth import require_admin
from apis.tenant.models import TenantConfigurationModel
from global_utils import success_response, CustomException
from db_service import DBService


async def get_tenant_config_api(
        session: Session = Depends(get_db),
        token_user = Depends(require_admin)
) -> dict:
    try:
        tenant_id = token_user.get("tenant_id")
        # tenant_config_stmt = select(
        #     TenantConfigurationModel.id,
        #     TenantConfigurationModel.daily_payout_enabled,
        #     TenantConfigurationModel.daily_payout_time,
        #     TenantConfigurationModel.weekly_payout_enabled,
        #     TenantConfigurationModel.weekly_payout_day,
        #     TenantConfigurationModel.weekly_payout_time,
        #     TenantConfigurationModel.monthly_payout_enabled,
        #     TenantConfigurationModel.monthly_payout_type,
        #     TenantConfigurationModel.monthly_fixed_day,
        #     TenantConfigurationModel.monthly_payout_time
        # )
        tenant_config = DBService.scalars_first(session=session, model=TenantConfigurationModel, tenant_id=tenant_id)
        print(tenant_config)


        return success_response(
            status_code=status.HTTP_200_OK,
            details="tenant configuration retrieved successfully",
            data=""
        )
    except SQLAlchemyError as e:
        raise CustomException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal Server Error",
            error=str(e),
            trace_back=traceback.format_exc()
        )
