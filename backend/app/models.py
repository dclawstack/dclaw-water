from sqlalchemy import Column, String, Float, Boolean, DateTime, func
from app.database import Base

class WaterReportDB(Base):
    __tablename__ = "water_reports"
    id = Column(String, primary_key=True)
    facility_id = Column(String, nullable=False)
    total_consumption_kl = Column(Float, nullable=False)
    leak_detected = Column(Boolean, default=False)
    irrigation_efficiency = Column(String)
    recycling_potential = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
