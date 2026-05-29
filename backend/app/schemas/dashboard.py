from pydantic import BaseModel


class DashboardStats(BaseModel):
    total_meters: int
    active_meters: int
    fault_meters: int
    open_leak_alerts: int
    critical_alerts: int
    total_consumption_kl: float
    non_compliant_readings: int
    avg_ph: float | None
    avg_turbidity: float | None
    avg_chlorine: float | None


class ConsumptionByMeter(BaseModel):
    meter_code: str
    location_name: str
    total_kl: float


class DashboardOverview(BaseModel):
    stats: DashboardStats
    top_consumers: list[ConsumptionByMeter]
    recent_alerts: list[dict]
