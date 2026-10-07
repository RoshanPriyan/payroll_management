from fastapi import Depends, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import select
import traceback
from database import get_db
from global_utils import success_response, CustomException
from apis.users.models import UserModel
from apis.audit_logs.models import AuditLogModel
from apis.platform_users.utils import require_super_admin
from apis.users.utils import get_full_name


async def audit_logs_list_api(
        session: Session = Depends(get_db),
        _=Depends(require_super_admin)
) -> dict:
    try:
        audit_log_stmt =(
            select(
                AuditLogModel.id,
                AuditLogModel.tenant_id,
                AuditLogModel.method,
                AuditLogModel.endpoint,
                AuditLogModel.ip_address,
                AuditLogModel.device_type,
                AuditLogModel.status_code,
                UserModel.first_name,
                UserModel.last_name
            ).
            select_from(AuditLogModel)
            .outerjoin(UserModel, UserModel.id == AuditLogModel.user_id)
        )
        audit_log_res = session.execute(audit_log_stmt).mappings().all()

        audit_logs = []
        for data in audit_log_res:
            data = dict(data)
            first_name = data.pop("first_name")
            last_name = data.pop("last_name")
            
            data["username"] = get_full_name(first_name, last_name)
            audit_logs.append(data)
        return success_response(
            status_code=status.HTTP_200_OK,
            details="Audit logs retrieved successfully",
            data=audit_logs
        )
    except SQLAlchemyError as e:
        raise CustomException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal Server Error {e}",
            error=str(e),
            trace_back=traceback.format_exc()
        )
