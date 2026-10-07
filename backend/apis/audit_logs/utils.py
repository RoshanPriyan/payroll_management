from fastapi import Depends
from database import SessionLocal
from database import get_db
from apis.audit_logs.models import AuditLogModel


async def save_audit_log(tenant_id, user_id, method, endpoint, status_code, ip_address, device_type):
    try:
        session = SessionLocal()
        audit_log = AuditLogModel(
            tenant_id=tenant_id,
            user_id=user_id,
            method=method,
            endpoint=endpoint,
            ip_address=ip_address,
            device_type=device_type,
            status_code=status_code
        )
        session.add(audit_log)
        session.commit()

    except Exception:
        session.rollback()
