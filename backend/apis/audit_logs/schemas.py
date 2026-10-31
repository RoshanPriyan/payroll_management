from pydantic import BaseModel, Field
from typing import Optional
from datetime import date


class PageNation(BaseModel):
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=10, ge=1, le=100)


class AuditLogSchema(PageNation):
    tenant_id: Optional[int] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
