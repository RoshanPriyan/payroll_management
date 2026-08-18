from pydantic import BaseModel
from typing import Optional


class PlatFormUserRegisterSchema(BaseModel):
    first_name: str
    last_name: Optional[str]
    email: str
    password: str
    confirm_password: str

class UpdateStatusSchema(BaseModel):
    user_id: int
    is_active: bool
