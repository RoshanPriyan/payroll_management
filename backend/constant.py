from enum import Enum


class SalaryType(str, Enum):
    DAILY = "DAILY"
    WEEKLY = "WEEKLY"
    MONTHLY = "MONTHLY"


class AttendanceStatus(str, Enum):
    PRESENT = "PRESENT"
    ABSENT = "ABSENT"
    HALF_DAY = "HALF_DAY"
    LEAVE = "LEAVE"


class PaymentStatus(str, Enum):
    PENDING = "PENDING"
    PAID = "PAID"


class PaymentMode(str, Enum):
    CASH = "CASH"
    BANK = "BANK"
    UPI = "UPI"
