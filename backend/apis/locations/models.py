from sqlalchemy import Column, Integer,String, ForeignKey, TIMESTAMP, func
from sqlalchemy.orm import relationship
from database import Base


class CountryModel(Base):
    __tablename__ = "country"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp(), nullable=False)
    updated_at = Column(TIMESTAMP, server_default=func.current_timestamp(), onupdate=func.current_timestamp(),
                        nullable=False)
    states = relationship("StateModel", back_populates="country", cascade="all, delete-orphan")


class StateModel(Base):
    __tablename__ = "state"

    id = Column(Integer, primary_key=True, index=True)
    country_id = Column(Integer, ForeignKey("country.id", ondelete="RESTRICT"), nullable=False)
    name = Column(String(100), nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp(), nullable=False)
    updated_at = Column(TIMESTAMP, server_default=func.current_timestamp(),
                        onupdate=func.current_timestamp(), nullable=False)
    country = relationship("CountryModel", back_populates="states")
    cities = relationship("CityModel", back_populates="state", cascade="all, delete-orphan")


class CityModel(Base):
    __tablename__ = "city"

    id = Column(Integer, primary_key=True, index=True)
    state_id = Column(Integer, ForeignKey("state.id", ondelete="RESTRICT"), nullable=False)
    name = Column(String(100), nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.current_timestamp(), nullable=False)
    updated_at = Column(TIMESTAMP, server_default=func.current_timestamp(),
                        onupdate=func.current_timestamp(), nullable=False)

    state = relationship("StateModel", back_populates="cities")
