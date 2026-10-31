from fastapi import Depends, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import select, func
from math import ceil
import traceback
from database import get_db
from global_utils import success_response, CustomException, format_datetime
from apis.users.models import UserModel
from apis.audit_logs.models import AuditLogModel
from apis.platform_users.utils import require_super_admin
from apis.users.utils import get_full_name
from apis.audit_logs.schemas import AuditLogSchema


async def audit_logs_list_api(
        payload_data: AuditLogSchema,
        session: Session = Depends(get_db),
        _=Depends(require_super_admin)
) -> dict:
    try:
        payload = payload_data.model_dump()

        tenant_id = payload.get("tenant_id")
        start_date = payload.get("start_date")
        end_date = payload.get("end_date")

        page = payload.get("page")
        limit = payload.get("limit")

        # Filters
        filters = []

        if tenant_id:
            filters.append(AuditLogModel.tenant_id == tenant_id)

        if start_date:
            filters.append(AuditLogModel.created_at >= start_date)

        if end_date:
            filters.append(AuditLogModel.created_at <= end_date)

        # Total Records Count
        total_records_stmt = (select(func.count()).select_from(AuditLogModel).where(*filters))
        total_records = session.execute(total_records_stmt).scalar_one()

        # Pagination
        offset = (page - 1) * limit

        # Audit Logs Query
        audit_log_stmt = (
            select(
                AuditLogModel.id,
                AuditLogModel.tenant_id,
                AuditLogModel.method,
                AuditLogModel.endpoint,
                AuditLogModel.ip_address,
                AuditLogModel.device_type,
                AuditLogModel.status_code,
                AuditLogModel.created_at,
                UserModel.first_name,
                UserModel.last_name
            )
            .select_from(AuditLogModel)
            .outerjoin(UserModel, UserModel.id == AuditLogModel.user_id)
            .where(*filters)
            .order_by(AuditLogModel.id.desc())
            .offset(offset)
            .limit(limit)
        )
        audit_log_res = (session.execute(audit_log_stmt).mappings().all())

        audit_logs = []

        for data in audit_log_res:
            data = dict(data)

            first_name = data.pop("first_name")
            last_name = data.pop("last_name")
            created_at = data.pop("created_at")

            data["username"] = get_full_name(first_name, last_name)
            data["created_at"] = format_datetime(created_at)
            audit_logs.append(data)

        # Total Pages
        total_pages = ceil(total_records / limit) if total_records else 0

        return success_response(
            status_code=status.HTTP_200_OK,
            details="Audit logs retrieved successfully",
            data=audit_logs,
            pagination={
                "total_records": total_records,
                "total_pages": total_pages,
                "previous_page": page - 1 if page > 1 else None,
                "current_page": page,
                "next_page": page + 1 if page < total_pages else None
            }
        )

    except SQLAlchemyError as e:
        raise CustomException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal Server Error {e}",
            error=str(e),
            trace_back=traceback.format_exc()
        )
