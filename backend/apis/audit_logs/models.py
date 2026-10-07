from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, func, DateTime
from database import Base


class AuditLogModel(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id", ondelete="SET NULL"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    method = Column(String(10), nullable=False)
    endpoint = Column(String(500), nullable=False)
    status_code = Column(Integer, nullable=True)
    ip_address = Column(String(45), nullable=True)
    device_type = Column(String(20), nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
