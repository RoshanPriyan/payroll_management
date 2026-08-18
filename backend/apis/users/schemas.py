from fastapi import status
from pydantic import BaseModel, field_validator, model_validator
from typing import Optional
from security import BCRYPT_MAX_PASSWORD_BYTES, password_byte_length
from global_utils import CustomException


class UserRegisterSchema(BaseModel):
    business_name: str
    first_name: str
    last_name: Optional[str]
    phone: str
    email: str
    password: str
    confirm_password: str

    @field_validator("password", "confirm_password")
    @classmethod
    def validate_password_length(cls, value: str) -> str:
        if password_byte_length(value) > BCRYPT_MAX_PASSWORD_BYTES:
            raise ValueError(
                f"Password cannot be longer than {BCRYPT_MAX_PASSWORD_BYTES} bytes"
            )

        return value


class UserLoginSchema(BaseModel):
    email: str
    password: str


class UpdateUserProfileSchema(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    address: Optional[str] = None
    country_id: Optional[int] = None
    state_id: Optional[int] = None
    city_id: Optional[int] = None
    zip_code: Optional[str] = None


class ForgotPasswordSchema(BaseModel):
    password: str
    confirm_password: str

    @model_validator(mode="after")
    def validate_passwords_match(self):
        if self.password != self.confirm_password:
            raise CustomException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="Password and confirm password do not match"
                )
        return self
