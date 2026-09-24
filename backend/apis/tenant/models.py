from sqlalchemy import Column, Integer, String, Date, Enum, TIMESTAMP, func, ForeignKey, Boolean, Time
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


class TenantConfigurationModel(Base):
    __tablename__ = "tenant_configuration"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id", ondelete="CASCADE"), unique=True, nullable=False)
    daily_payout_enabled = Column(Boolean, nullable=False, default=False)
    daily_payout_time = Column(Time, nullable=True)
    weekly_payout_enabled = Column(Boolean, nullable=False, default=False)
    weekly_payout_day = Column(Enum("SATURDAY", "SUNDAY", name="weekly_payout_day_enum"), nullable=True)
    weekly_payout_time = Column(Time, nullable=True)
    monthly_payout_enabled = Column(Boolean, nullable=False, default=False)
    monthly_payout_type = Column(Enum("JOINING_DATE", "FIXED_DATE", name="monthly_payout_type_enum"), nullable=True)
    monthly_fixed_day = Column(Integer, nullable=True)
    monthly_payout_time = Column(Time, nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
