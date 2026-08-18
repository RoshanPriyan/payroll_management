from sqlalchemy import Column, Integer, String, Enum, TIMESTAMP, func, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from database import Base
from security import pwd_context, validate_bcrypt_password_length


class UserModel(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    first_name = Column(String(150), nullable=False)
    last_name = Column(String(150), nullable=True)
    email = Column(String(255), unique=True, nullable=False)
    phone = Column(String(20), nullable=False)
    password_hash = Column(String(255), nullable=False)
    status = Column(Enum("ACTIVE", "INACTIVE", name="user_status_enum"), nullable=False, default="ACTIVE")
    last_login = Column(DateTime, nullable=True )
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    def set_password(self, plain_password: str):
        validate_bcrypt_password_length(plain_password)
        self.password_hash = pwd_context.hash(plain_password)

    def verify_password(self, plain_password: str) -> bool:
        try:
            validate_bcrypt_password_length(plain_password)
        except ValueError:
            return False

        return pwd_context.verify(plain_password, self.password_hash)

    profile = relationship("UserProfileModel", back_populates="user", uselist=False, cascade="all, delete-orphan")


class UserProfileModel(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=True)
    address = Column(Text, nullable=True)
    country_id = Column(Integer, ForeignKey("country.id", ondelete="RESTRICT"), nullable=True)
    state_id = Column(Integer, ForeignKey("state.id", ondelete="RESTRICT"), nullable=True)
    city_id = Column(Integer, ForeignKey("city.id", ondelete="RESTRICT"), nullable=True)
    zip_code = Column(String(20), nullable=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=True)

    # Relationships
    user = relationship("UserModel", back_populates="profile")
    country = relationship("CountryModel")
    state = relationship("StateModel")
    city = relationship("CityModel")
