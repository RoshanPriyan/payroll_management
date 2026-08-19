from pydantic import BaseModel
from typing import Optional


class UpdateBusinessSchema(BaseModel):
    id: int
    business_name: Optional[str] = None
    address: Optional[str] = None
    country_id: Optional[str] = None
    state_id: Optional[str] = None
    city_id: Optional[str] = None
    zip_code: Optional[str] = None
