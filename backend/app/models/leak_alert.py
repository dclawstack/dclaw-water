import uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey, String, Enum as SAEnum, Text
from app.models.base import Base
from app.core.utils import utc_now
from datetime import datetime
import enum


class AlertType(str, enum.Enum):
    consumption_spike = "consumption_spike"
    pressure_drop = "pressure_drop"
    acoustic = "acoustic"


class AlertSeverity(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class AlertStatus(str, enum.Enum):
    open = "open"
    investigating = "investigating"
    resolved = "resolved"


class LeakAlert(Base):
    __tablename__ = "leak_alerts"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    meter_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("water_meters.id", ondelete="CASCADE"), nullable=False, index=True
    )
    alert_type: Mapped[str] = mapped_column(
        SAEnum(AlertType, name="alert_type"), nullable=False
    )
    severity: Mapped[str] = mapped_column(
        SAEnum(AlertSeverity, name="alert_severity"), nullable=False, default=AlertSeverity.medium
    )
    status: Mapped[str] = mapped_column(
        SAEnum(AlertStatus, name="alert_status"), nullable=False, default=AlertStatus.open
    )
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    estimated_loss_lph: Mapped[float | None] = mapped_column(nullable=True)
    detected_at: Mapped[datetime] = mapped_column(nullable=False, default=utc_now, index=True)
    resolved_at: Mapped[datetime | None] = mapped_column(nullable=True)
    created_at: Mapped[datetime] = mapped_column(nullable=False, default=utc_now)

    meter: Mapped["WaterMeter"] = relationship(  # noqa: F821
        "WaterMeter", back_populates="leak_alerts", lazy="selectin"
    )
