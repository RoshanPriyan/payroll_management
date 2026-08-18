from passlib.context import CryptContext


BCRYPT_MAX_PASSWORD_BYTES = 72

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__truncate_error=True)


def password_byte_length(plain_password: str) -> int:
    return len(plain_password.encode("utf-8"))


def validate_bcrypt_password_length(plain_password: str) -> None:
    if password_byte_length(plain_password) > BCRYPT_MAX_PASSWORD_BYTES:
        raise ValueError(f"Password cannot be longer than {BCRYPT_MAX_PASSWORD_BYTES} bytes")
