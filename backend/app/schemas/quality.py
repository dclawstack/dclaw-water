import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class QualityBase(BaseModel):
    meter_id: uuid.UUID
    ph: float
    turbidity_ntu: float
    chlorine_mgl: float
    temperature_c: float | None = None
    is_compliant: bool = True
    recorded_at: datetime


class QualityCreate(QualityBase):
    pass


class QualityOut(QualityBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    created_at: datetime


class QualityList(BaseModel):
    items: list[QualityOut]
    total: int
