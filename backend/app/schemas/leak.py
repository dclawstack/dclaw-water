import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.models.leak_alert import AlertType, AlertSeverity, AlertStatus


class LeakBase(BaseModel):
    meter_id: uuid.UUID
    alert_type: AlertType
    severity: AlertSeverity = AlertSeverity.medium
    description: str = ""
    estimated_loss_lph: float | None = None


class LeakCreate(LeakBase):
    pass


class LeakUpdate(BaseModel):
    status: AlertStatus | None = None
    severity: AlertSeverity | None = None
    description: str | None = None
    estimated_loss_lph: float | None = None
    resolved_at: datetime | None = None


class LeakOut(LeakBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    status: AlertStatus
    detected_at: datetime
    resolved_at: datetime | None
    created_at: datetime


class LeakList(BaseModel):
    items: list[LeakOut]
    total: int
