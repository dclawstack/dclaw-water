import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.models.water_meter import LocationType, MeterStatus


class MeterBase(BaseModel):
    meter_code: str
    location_name: str
    location_type: LocationType = LocationType.zone
    status: MeterStatus = MeterStatus.active
    latitude: float | None = None
    longitude: float | None = None


class MeterCreate(MeterBase):
    pass


class MeterUpdate(BaseModel):
    location_name: str | None = None
    location_type: LocationType | None = None
    status: MeterStatus | None = None
    latitude: float | None = None
    longitude: float | None = None


class MeterOut(MeterBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    created_at: datetime
    updated_at: datetime


class MeterList(BaseModel):
    items: list[MeterOut]
    total: int
