from fastapi import Header, Depends, status
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from global_utils import CustomException
from config import JWT_SECRET, JWT_ALGORITHM, ADMIN_ROLE


ACCESS_TOKEN_EXPIRE_MINUTES = 60


def generate_access_token(user_id: int, tenant_id: int = None, role: str = ADMIN_ROLE):
    payload = {
        "user_id": user_id,
        "role": role,
        "exp": datetime.now(timezone.utc)
        + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    }
    if tenant_id:
        payload["tenant_id"] = tenant_id

    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def validate_access_token(access_token: str):
    try:
        payload = jwt.decode(access_token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except JWTError:
        return None


def get_current_user(authorization: str = Header(None)):
    if not authorization:
        raise CustomException(status_code=401, detail="Authorization header is missing")

    if not authorization.startswith("Bearer "):
        raise CustomException(status_code=401, detail="Invalid authorization header")

    token = authorization.split(" ")[1]
    payload = validate_access_token(token)

    if not payload:
        raise CustomException(status_code=401, detail="Token expired or invalid")

    return payload


def require_admin(token_user=Depends(get_current_user)):
    if token_user.get("role") != ADMIN_ROLE:
        raise CustomException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied for super admin user"
        )

    if not token_user.get("tenant_id"):
        raise CustomException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tenant ID not found"
        )

    return token_user