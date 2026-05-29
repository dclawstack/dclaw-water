import uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Enum as SAEnum
from app.models.base import Base
from app.core.utils import utc_now
from datetime import datetime
import enum


class LocationType(str, enum.Enum):
    building = "building"
    process = "process"
    zone = "zone"
    distribution = "distribution"


class MeterStatus(str, enum.Enum):
    active = "active"
    inactive = "inactive"
    fault = "fault"


class WaterMeter(Base):
    __tablename__ = "water_meters"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    meter_code: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    location_name: Mapped[str] = mapped_column(String(256), nullable=False)
    location_type: Mapped[str] = mapped_column(
        SAEnum(LocationType, name="location_type"), nullable=False, default=LocationType.zone
    )
    status: Mapped[str] = mapped_column(
        SAEnum(MeterStatus, name="meter_status"), nullable=False, default=MeterStatus.active
    )
    latitude: Mapped[float | None] = mapped_column(nullable=True)
    longitude: Mapped[float | None] = mapped_column(nullable=True)
    created_at: Mapped[datetime] = mapped_column(nullable=False, default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(nullable=False, default=utc_now, onupdate=utc_now)

    readings: Mapped[list["MeterReading"]] = relationship(  # noqa: F821
        "MeterReading", back_populates="meter", lazy="selectin", cascade="all, delete-orphan"
    )
    leak_alerts: Mapped[list["LeakAlert"]] = relationship(  # noqa: F821
        "LeakAlert", back_populates="meter", lazy="selectin", cascade="all, delete-orphan"
    )
    quality_readings: Mapped[list["QualityReading"]] = relationship(  # noqa: F821
        "QualityReading", back_populates="meter", lazy="selectin", cascade="all, delete-orphan"
    )
