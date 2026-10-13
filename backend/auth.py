from fastapi import Header, Depends, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
import secrets
from jose import jwt, JWTError
from global_utils import CustomException
from config import JWT_SECRET, JWT_ALGORITHM, ADMIN_ROLE
from apis.platform_users.models import ApiTokenModel
from apis.tenant.models import TenantModel
from database import get_db


ACCESS_TOKEN_EXPIRE_MINUTES = 120


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


def get_current_user(
        authorization: str = Header(None),
        session: Session = Depends(get_db)
):
    if not authorization:
        raise CustomException(
            status_code=401,
            detail="Authorization header is missing"
        )

    if not authorization.startswith("Bearer "):
        raise CustomException(
            status_code=401,
            detail="Invalid authorization header"
        )

    token = authorization.removeprefix("Bearer ").strip()

    if not token:
        raise CustomException(
            status_code=401,
            detail="Token is missing"
        )

    # 1. Check whether this is a third-party API token.
    api_token = session.query(ApiTokenModel).filter(ApiTokenModel.token == token).first()

    if api_token:
        if not api_token.is_active:
            raise CustomException(
                status_code=401,
                detail="API token is inactive"
            )

        tenant = session.query(TenantModel).filter(
            TenantModel.id == api_token.tenant_id
        ).first()

        if not tenant or tenant.status != "ACTIVE":
            raise CustomException(
                status_code=403,
                detail="Tenant is inactive"
            )

        return {
            "tenant_id": tenant.id,
            "role": ADMIN_ROLE,
            "auth_type": "API_TOKEN",
            "api_token_id": api_token.id
        }

    # 2. Otherwise, validate it as a normal JWT.
    payload = validate_access_token(token)

    if not payload:
        raise CustomException(
            status_code=401,
            detail="Token expired or invalid"
        )

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


def generate_api_token(tenant_code: str):
    now = datetime.now()

    date_part = now.strftime("%Y%m%d")
    time_part = now.strftime("%H%M%S")

    random_part = secrets.token_urlsafe(16)

    return f"{tenant_code}{date_part}{time_part}{random_part}"
