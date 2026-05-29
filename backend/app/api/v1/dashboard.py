from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.repositories.meter_repo import MeterRepository
from app.repositories.reading_repo import ReadingRepository
from app.repositories.leak_repo import LeakRepository
from app.repositories.quality_repo import QualityRepository
from app.models.water_meter import MeterStatus
from app.models.leak_alert import AlertStatus
from app.schemas.dashboard import DashboardOverview, DashboardStats, ConsumptionByMeter
from sqlalchemy import select
from app.models.water_meter import WaterMeter

router = APIRouter()


@router.get("/", response_model=DashboardOverview)
async def get_dashboard(db: AsyncSession = Depends(get_db)):
    meter_repo = MeterRepository(db)
    reading_repo = ReadingRepository(db)
    leak_repo = LeakRepository(db)
    quality_repo = QualityRepository(db)

    all_meters, total_meters = await meter_repo.list_all(limit=1000)
    active_meters = sum(1 for m in all_meters if m.status == MeterStatus.active)
    fault_meters = sum(1 for m in all_meters if m.status == MeterStatus.fault)

    open_alerts = await leak_repo.count_by_status(AlertStatus.open)
    critical_alerts = await leak_repo.count_critical()

    total_kl = await reading_repo.total_consumption()
    non_compliant = await quality_repo.count_non_compliant()
    params = await quality_repo.avg_parameters()

    stats = DashboardStats(
        total_meters=total_meters,
        active_meters=active_meters,
        fault_meters=fault_meters,
        open_leak_alerts=open_alerts,
        critical_alerts=critical_alerts,
        total_consumption_kl=round(total_kl, 2),
        non_compliant_readings=non_compliant,
        avg_ph=params.get("avg_ph"),
        avg_turbidity=params.get("avg_turbidity"),
        avg_chlorine=params.get("avg_chlorine"),
    )

    consumption_rows = await reading_repo.consumption_by_meter()
    meter_map = {m.id: m for m in all_meters}
    top_consumers = []
    for meter_id, total in consumption_rows[:5]:
        m = meter_map.get(meter_id)
        if m:
            top_consumers.append(
                ConsumptionByMeter(
                    meter_code=m.meter_code,
                    location_name=m.location_name,
                    total_kl=round(total, 2),
                )
            )

    recent = await leak_repo.recent(limit=5)
    recent_alerts = [
        {
            "id": str(a.id),
            "alert_type": a.alert_type,
            "severity": a.severity,
            "status": a.status,
            "detected_at": a.detected_at.isoformat(),
        }
        for a in recent
    ]

    return DashboardOverview(stats=stats, top_consumers=top_consumers, recent_alerts=recent_alerts)
