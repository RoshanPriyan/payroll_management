from sqlalchemy import Column, Integer, String, Date, Enum, TIMESTAMP, func
from database import Base


class TenantModel(Base):
    __tablename__ = "tenants"

    id = Column(Integer, primary_key=True, index=True)
    tenant_code = Column(String(50), unique=True, nullable=False)
    tenant_name = Column(String(150), nullable=False)
    subscription_plan = Column(Enum("FREE", "STANDARD", name="subscription_plan_enum"), nullable=False, default="FREE")
    subscription_start = Column(Date, nullable=False)
    subscription_end = Column(Date, nullable=False)
    status = Column(Enum("ACTIVE", "TRIAL_EXPIRED", "SUSPENDED", name="tenant_status_enum"), nullable=False,
                    default="ACTIVE")
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
