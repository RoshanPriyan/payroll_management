from fastapi import status, Depends
from datetime import datetime
import os
import secrets
from global_utils import CustomException
from auth import validate_access_token, get_current_user
from config import SUPER_ADMIN_ROLE

def require_super_admin(token_user=Depends(get_current_user)):
    if token_user.get("role") != SUPER_ADMIN_ROLE:
        raise CustomException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied for admin user"
        )
    return token_user


def generate_api_token(tenant_code: str):
    now = datetime.now()

    date_part = now.strftime("%Y%m%d")
    time_part = now.strftime("%H%M%S")

    random_part = secrets.token_urlsafe(16)

    return (
        f"pp_live_"
        f"{tenant_code}_"
        f"{date_part}_"
        f"{time_part}_"
        f"{random_part}"
    )
