from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime
import uuid, random
from app.database import get_db

router = APIRouter()

class CreateReportRequest(BaseModel):
    facility_id: str

class WaterReport(BaseModel):
    id: str
    facility_id: str
    total_consumption_kl: float
    leak_detected: bool
    irrigation_efficiency: str
    recycling_potential: str
    created_at: datetime

    class Config:
        from_attributes = True

@router.post("/reports", response_model=WaterReport)
def create_report(req: CreateReportRequest, db: Session = Depends(get_db)):
    return WaterReport(
        id=str(uuid.uuid4()),
        facility_id=req.facility_id,
        total_consumption_kl=round(random.uniform(10, 500), 2),
        leak_detected=True,
        irrigation_efficiency="78%",
        recycling_potential="High",
        created_at=datetime.utcnow(),
    )

@router.get("/reports/{id}/zones")
def get_zones(id: str, db: Session = Depends(get_db)):
    return [
        {"zone_name": "Zone A", "consumption_kl": round(random.uniform(5, 150), 2)},
        {"zone_name": "Zone B", "consumption_kl": round(random.uniform(5, 150), 2)},
        {"zone_name": "Zone C", "consumption_kl": round(random.uniform(5, 150), 2)},
    ]
