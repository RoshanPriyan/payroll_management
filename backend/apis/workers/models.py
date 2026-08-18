from sqlalchemy import Column, Integer, String, Enum, Date, DECIMAL, TIMESTAMP, ForeignKey, func, Text
from database import Base


class WorkerModel(Base):
    __tablename__ = "workers"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    business_id = Column(Integer, ForeignKey("businesses.id"), nullable=False)
    first_name = Column(String(150), nullable=False)
    last_name = Column(String(150), nullable=True)
    phone = Column(String(20), nullable=False)
    email = Column(String(150), unique=True, nullable=True)
    gender = Column(Enum("MALE", "FEMALE", name="gender_enum"), nullable=True)
    joining_date = Column(Date, nullable=False)
    salary_type = Column(Enum("DAILY", "WEEKLY", "MONTHLY", name="salary_type_enum"), nullable=False)
    salary_amount = Column(DECIMAL(10, 2), nullable=False)
    payment_mode = Column(Enum("CASH", "BANK", "UPI", name="payment_mode_enum"),nullable=False)
    bank_name = Column(String(150), nullable=True)
    account_number = Column(String(50), nullable=True)
    ifsc_code = Column(String(20), nullable=True)
    upi_id = Column(String(150), nullable=True)
    status = Column(Enum("ACTIVE", "INACTIVE", name="worker_status_enum"), nullable=False, default="ACTIVE")
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())


class AttendanceModel(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    business_id = Column(Integer, ForeignKey("businesses.id"), nullable=False)
    worker_id = Column(Integer, ForeignKey("workers.id"), nullable=False)
    attendance_date = Column(Date, nullable=False)
    attendance_status = Column(Enum("PRESENT", "ABSENT", "HALF_DAY", "LEAVE", name="attendance_status_enum"), nullable=False)
    remarks = Column(Text, nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
