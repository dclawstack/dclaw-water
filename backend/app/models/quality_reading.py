import uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey, Boolean
from app.models.base import Base
from app.core.utils import utc_now
from datetime import datetime


class QualityReading(Base):
    __tablename__ = "quality_readings"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    meter_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("water_meters.id", ondelete="CASCADE"), nullable=False, index=True
    )
    ph: Mapped[float] = mapped_column(nullable=False)
    turbidity_ntu: Mapped[float] = mapped_column(nullable=False)
    chlorine_mgl: Mapped[float] = mapped_column(nullable=False)
    temperature_c: Mapped[float | None] = mapped_column(nullable=True)
    is_compliant: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    recorded_at: Mapped[datetime] = mapped_column(nullable=False, default=utc_now, index=True)
    created_at: Mapped[datetime] = mapped_column(nullable=False, default=utc_now)

    meter: Mapped["WaterMeter"] = relationship(  # noqa: F821
        "WaterMeter", back_populates="quality_readings", lazy="selectin"
    )
