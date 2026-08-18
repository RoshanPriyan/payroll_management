from fastapi import status, Depends
import os
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