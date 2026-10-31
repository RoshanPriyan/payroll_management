from sqlalchemy import Column, Integer, Enum, ForeignKey, func, DateTime, DECIMAL, text, String
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


class PaymentTransactionModel(Base):
    __tablename__ = "payment_transactions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    subscription_id = Column(Integer, nullable=False)
    razorpay_order_id = Column(String(100), nullable=False, unique=True)
    razorpay_payment_id = Column(String(100), nullable=True, unique=True)

    # Store INR amounts in paise.
    # Example: ₹499 = 49900 paise.
    amount = Column(Integer, nullable=False)
    payment_status = Column(
        Enum("PENDING", "SUCCESS", "FAILED", name="payment_status_enum"),
        nullable=False, default="PENDING", server_default=text("'PENDING'")
        )
    created_at = Column(DateTime, nullable=False, server_default=func.current_timestamp())
    updated_at = Column(DateTime, nullable=False, server_default=func.current_timestamp(),
                        onupdate=func.current_timestamp()
                        )
