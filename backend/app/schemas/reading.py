import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class ReadingBase(BaseModel):
    meter_id: uuid.UUID
    reading_value_kl: float
    flow_rate_lps: float = 0.0
    pressure_bar: float | None = None
    recorded_at: datetime


class ReadingCreate(ReadingBase):
    pass


class ReadingOut(ReadingBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    created_at: datetime


class ReadingList(BaseModel):
    items: list[ReadingOut]
    total: int
