from sqlalchemy import Column, Integer, String, Enum, func, DateTime, Boolean
from database import Base


class PlatformUserModel(Base):
    __tablename__ = "platform_users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=True)
    email = Column(String(255), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(Enum("SUPER_ADMIN", name="platform_user_role"), nullable=False, server_default="SUPER_ADMIN")
    is_active = Column(Boolean, nullable=False, server_default="1")
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())
