import uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey
from app.models.base import Base
from app.core.utils import utc_now
from datetime import datetime


class MeterReading(Base):
    __tablename__ = "meter_readings"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    meter_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("water_meters.id", ondelete="CASCADE"), nullable=False, index=True
    )
    reading_value_kl: Mapped[float] = mapped_column(nullable=False)
    flow_rate_lps: Mapped[float] = mapped_column(nullable=False, default=0.0)
    pressure_bar: Mapped[float | None] = mapped_column(nullable=True)
    recorded_at: Mapped[datetime] = mapped_column(nullable=False, default=utc_now, index=True)
    created_at: Mapped[datetime] = mapped_column(nullable=False, default=utc_now)

    meter: Mapped["WaterMeter"] = relationship(  # noqa: F821
        "WaterMeter", back_populates="readings", lazy="selectin"
    )
