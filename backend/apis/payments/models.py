from sqlalchemy import Column, Integer, Enum, ForeignKey, func, DateTime, DECIMAL
from database import Base


class PaymentHistoryModel(Base):
    __tablename__ = "payment_history"

    id = Column(Integer, primary_key=True, autoincrement=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    worker_id = Column(Integer, ForeignKey("workers.id"), nullable=False)
    attendance_id = Column(Integer, ForeignKey("attendance.id"), nullable=False)
    payment_status = Column(Enum("PAID", "PENDING"), nullable=False)
    amount_paid = Column(DECIMAL(10, 2), nullable=False, default=0.00)
    payment_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.current_timestamp())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())
