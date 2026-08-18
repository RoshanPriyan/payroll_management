from fastapi import Depends, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import select, func
import traceback
from database import get_db
from apis.business.models import BusinessModel
from apis.locations.models import CountryModel, StateModel, CityModel
from apis.users.models import UserModel
from apis.tenant.models import TenantModel
from apis.workers.models import WorkerModel
from global_utils import success_response, CustomException
from apis.platform_users.utils import require_super_admin


async def tenant_list_api(
    session: Session = Depends(get_db),
    _=Depends(require_super_admin)
) -> dict:
    try:
        # ==========================================================
        # Dashboard Counts
        # ==========================================================

        total_tenants = session.scalar(
            select(func.count(TenantModel.id))
        ) or 0

        active_tenants = session.scalar(
            select(func.count(TenantModel.id))
            .where(TenantModel.status == "ACTIVE")
        ) or 0

        expired_tenants = session.scalar(
            select(func.count(TenantModel.id))
            .where(TenantModel.status == "TRIAL_EXPIRED")
        ) or 0

        total_workers = session.scalar(
            select(func.count(WorkerModel.id))
        ) or 0

        # ==========================================================
        # Worker Count Per Tenant
        # ==========================================================

        worker_counts = dict(
            session.execute(
                select(
                    WorkerModel.tenant_id,
                    func.count(WorkerModel.id)
                )
                .group_by(WorkerModel.tenant_id)
            ).all()
        )

        # ==========================================================
        # Tenant List
        # ==========================================================

        tenant_stmt = (
            select(
                TenantModel.id,
                TenantModel.subscription_plan,
                TenantModel.subscription_end,
                TenantModel.status,
                UserModel.first_name,
                UserModel.last_name,
                BusinessModel.business_name,
                BusinessModel.business_type,
                CountryModel.name.label("country"),
                StateModel.name.label("state"),
                CityModel.name.label("city"),
            )
            .select_from(TenantModel)
            .outerjoin(UserModel, UserModel.tenant_id == TenantModel.id)
            .outerjoin(BusinessModel, BusinessModel.tenant_id == TenantModel.id)
            .outerjoin(CountryModel, CountryModel.id == BusinessModel.country_id)
            .outerjoin(StateModel, StateModel.id == BusinessModel.state_id)
            .outerjoin(CityModel, CityModel.id == BusinessModel.city_id)
        )

        tenant_res = session.execute(
            tenant_stmt
        ).mappings().all()

        tenant_list = []

        for row in tenant_res:
            data = dict(row)

            tenant_id = data["id"]

            first_name = data.pop("first_name", None)
            last_name = data.pop("last_name", None)

            data["admin_name"] = (
                f"{first_name or ''} {last_name or ''}".strip()
                if first_name or last_name
                else None
            )

            data["employee_count"] = worker_counts.get(
                tenant_id,
                0
            )

            tenant_list.append(data)
        data = {
                "tenant_counts": {
                    "total_tenants": total_tenants,
                    "active_tenants": active_tenants,
                    "expired_tenants": expired_tenants,
                    "total_workers": total_workers
                },
                "tenant_list": tenant_list
            }
        return success_response(
            status_code=status.HTTP_200_OK,
            details="Tenant list fetched successfully",
            data={
                "tenant_counts": {
                    "total_tenants": total_tenants,
                    "active_tenants": active_tenants,
                    "expired_tenants": expired_tenants,
                    "total_workers": total_workers
                },
                "tenant_list": tenant_list
            }
        )

    except SQLAlchemyError as e:
        raise CustomException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal Server Error",
            error=str(e),
            trace_back=traceback.format_exc()
        )
