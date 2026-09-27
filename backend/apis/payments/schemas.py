from pydantic import BaseModel, Field
from typing import Optional
from datetime import date


class UpdateBusinessSchema(BaseModel):
    id: int
    business_name: Optional[str] = None
    address: Optional[str] = None
    country_id: Optional[str] = None
    state_id: Optional[str] = None
    city_id: Optional[str] = None
    zip_code: Optional[str] = None


class PageNation(BaseModel):
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=10, ge=1, le=100)


class PaymentHistorySchema(PageNation):
    payment_type: Optional[str] = None
    payment_mode: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
