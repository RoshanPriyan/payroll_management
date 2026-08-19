from sqlalchemy import Column, Integer, String, Text, Enum, TIMESTAMP, ForeignKey, func
from database import Base
from apis.tenant.models import TenantModel
from apis.locations.models import CountryModel, StateModel, CityModel


class BusinessModel(Base):
    __tablename__ = "businesses"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, unique=True)
    business_name = Column(String(150), nullable=False)
    business_type = Column(String(100), nullable=True)
    address = Column(Text, nullable=True)
    country_id = Column(Integer, ForeignKey("country.id"), nullable=True)
    state_id = Column(Integer, ForeignKey("state.id"), nullable=True)
    city_id = Column(Integer, ForeignKey("city.id"), nullable=True)
    zip_code = Column(String(20), nullable=True)
    status = Column(Enum("ACTIVE", "INACTIVE", name="business_status_enum"), nullable=False, default="ACTIVE")
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
