from pydantic import BaseModel
from datetime import date
from typing import Optional, List
from enum import Enum


class CreateWorkerSchema(BaseModel):
    first_name: str
    last_name: Optional[str] = None
    phone: str
    email: str
    gender: str
    joining_date: date
    salary_type: str
    salary_amount: float
    payment_mode: str
    bank_name: Optional[str] = None
    account_number: Optional[str] = None
    ifsc_code: Optional[str] = None
    upi_id: Optional[str] = None


class SalaryTypeEnum(str, Enum):
    DAILY = "DAILY"
    WEEKLY = "WEEKLY"
    MONTHLY = "MONTHLY"


class PaymentModeEnum(str, Enum):
    CASH = "CASH"
    BANK = "BANK"
    UPI = "UPI"


class UpdateWorkerSchema(CreateWorkerSchema):
    worker_id: int
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    gender: Optional[str] = None
    email: Optional[str] = None
    joining_date: Optional[date] = None
    salary_type: Optional[str] = None
    salary_amount: Optional[float] = None
    payment_mode: Optional[str] = None
    bank_name: Optional[str] = None
    account_number: Optional[str] = None
    ifsc_code: Optional[str] = None
    upi_id: Optional[str] = None


class WorkerAttendanceSchema(BaseModel):
    worker_id: int
    attendance_status: str


class CreateAttendanceSchema(BaseModel):
    attendance_date: date
    workers: List[WorkerAttendanceSchema]
