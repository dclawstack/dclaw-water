import logging
from datetime import datetime, timedelta, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.models.user import User
from app.models.water_meter import WaterMeter, LocationType, MeterStatus
from app.models.meter_reading import MeterReading
from app.models.leak_alert import LeakAlert, AlertType, AlertSeverity, AlertStatus
from app.models.quality_reading import QualityReading
from app.repositories.user_repo import UserRepository
from app.services.auth_service import hash_password

log = logging.getLogger(__name__)

DEFAULT_ADMIN_EMAIL = "oc@dclaw.dev"
DEFAULT_ADMIN_PASSWORD = "oc123"
DEFAULT_ADMIN_NAME = "OC Admin"


def _dt(days_ago: float, hour: int = 8) -> datetime:
    base = datetime.now(timezone.utc) - timedelta(days=days_ago)
    return base.replace(hour=hour, minute=0, second=0, microsecond=0, tzinfo=None)


async def seed_default_admin(db: AsyncSession) -> None:
    repo = UserRepository(db)
    existing = await repo.get_by_email(DEFAULT_ADMIN_EMAIL)
    if existing:
        return
    admin = User(
        email=DEFAULT_ADMIN_EMAIL,
        hashed_password=hash_password(DEFAULT_ADMIN_PASSWORD),
        full_name=DEFAULT_ADMIN_NAME,
        is_active=True,
        is_admin=True,
    )
    await repo.create(admin)
    log.info(f"Seeded default admin: {DEFAULT_ADMIN_EMAIL}")


async def seed_demo_data(db: AsyncSession) -> None:
    count = (await db.execute(select(func.count()).select_from(WaterMeter))).scalar_one()
    if count > 0:
        return

    # ── Meters ──────────────────────────────────────────────────────────────
    meters_data = [
        dict(meter_code="WM-001", location_name="Main Distribution Hub",
             location_type=LocationType.distribution, status=MeterStatus.active,
             latitude=17.4065, longitude=78.4772),
        dict(meter_code="WM-002", location_name="Building A — East Wing",
             location_type=LocationType.building, status=MeterStatus.active,
             latitude=17.4071, longitude=78.4780),
        dict(meter_code="WM-003", location_name="Industrial Process Line 1",
             location_type=LocationType.process, status=MeterStatus.active,
             latitude=17.4058, longitude=78.4765),
        dict(meter_code="WM-004", location_name="Zone 4 — Residential North",
             location_type=LocationType.zone, status=MeterStatus.active,
             latitude=17.4090, longitude=78.4755),
        dict(meter_code="WM-005", location_name="Building B — West Wing",
             location_type=LocationType.building, status=MeterStatus.fault,
             latitude=17.4063, longitude=78.4790),
        dict(meter_code="WM-006", location_name="Zone 7 — Commercial District",
             location_type=LocationType.zone, status=MeterStatus.inactive,
             latitude=17.4045, longitude=78.4800),
    ]
    meters = [WaterMeter(**d) for d in meters_data]
    db.add_all(meters)
    await db.flush()  # populate .id

    m = {m.meter_code: m for m in meters}

    # ── Meter Readings — 30 days of daily readings ────────────────────────
    # Base cumulative kL values per meter (realistic for each type)
    base_kl = {"WM-001": 12400.0, "WM-002": 3200.0, "WM-003": 8750.0,
               "WM-004": 5100.0, "WM-005": 1850.0, "WM-006": 920.0}
    daily_delta = {"WM-001": 48.0, "WM-002": 12.5, "WM-003": 32.0,
                   "WM-004": 18.0, "WM-005": 6.0, "WM-006": 0.0}
    flow_lps = {"WM-001": 2.8, "WM-002": 0.72, "WM-003": 1.85,
                "WM-004": 1.04, "WM-005": 0.35, "WM-006": 0.0}
    pressure_bar = {"WM-001": 3.2, "WM-002": 2.8, "WM-003": 4.1,
                    "WM-004": 2.6, "WM-005": 1.4, "WM-006": None}

    readings = []
    for code, meter in m.items():
        kl = base_kl[code]
        for day in range(29, -1, -1):  # oldest to newest
            # slight variation: morning/evening pair
            for hour_offset, factor in [(8, 0.45), (20, 0.55)]:
                kl += daily_delta[code] * factor
                # add a spike on day 5 for WM-001 (feeds the leak alert)
                spike = 1.0
                if code == "WM-001" and day == 5:
                    spike = 2.3
                readings.append(MeterReading(
                    meter_id=meter.id,
                    reading_value_kl=round(kl, 2),
                    flow_rate_lps=round(flow_lps[code] * spike, 3),
                    pressure_bar=pressure_bar[code],
                    recorded_at=_dt(day, hour_offset),
                ))
    db.add_all(readings)

    # ── Leak Alerts ───────────────────────────────────────────────────────
    alerts = [
        LeakAlert(
            meter_id=m["WM-001"].id,
            alert_type=AlertType.consumption_spike,
            severity=AlertSeverity.critical,
            status=AlertStatus.open,
            description="Flow rate 130% above baseline for 6+ hours — suspected main pipe burst near distribution hub.",
            estimated_loss_lph=420.0,
            detected_at=_dt(5, 14),
        ),
        LeakAlert(
            meter_id=m["WM-003"].id,
            alert_type=AlertType.pressure_drop,
            severity=AlertSeverity.high,
            status=AlertStatus.investigating,
            description="Sustained pressure drop from 4.1 to 2.3 bar on Process Line 1. Field team dispatched.",
            estimated_loss_lph=185.0,
            detected_at=_dt(12, 9),
        ),
        LeakAlert(
            meter_id=m["WM-004"].id,
            alert_type=AlertType.acoustic,
            severity=AlertSeverity.medium,
            status=AlertStatus.open,
            description="Acoustic sensor detected irregular vibration pattern consistent with micro-leak in Zone 4.",
            estimated_loss_lph=42.0,
            detected_at=_dt(3, 7),
        ),
        LeakAlert(
            meter_id=m["WM-005"].id,
            alert_type=AlertType.consumption_spike,
            severity=AlertSeverity.high,
            status=AlertStatus.resolved,
            description="Overnight consumption spike caused by broken toilet flush valve in Building B. Repaired.",
            estimated_loss_lph=95.0,
            detected_at=_dt(18, 2),
            resolved_at=_dt(17, 11),
        ),
        LeakAlert(
            meter_id=m["WM-002"].id,
            alert_type=AlertType.pressure_drop,
            severity=AlertSeverity.low,
            status=AlertStatus.resolved,
            description="Minor pressure drop during scheduled maintenance window on East Wing. Normal after flush.",
            estimated_loss_lph=12.0,
            detected_at=_dt(25, 6),
            resolved_at=_dt(25, 10),
        ),
    ]
    db.add_all(alerts)

    # ── Quality Readings — 30 days on WM-001 and WM-004 ──────────────────
    quality_profiles = [
        # (meter_code, ph, turbidity, chlorine, temp, days_ago, compliant)
        # WM-001: mostly good, one turbidity spike
        ("WM-001", 7.2, 1.8, 0.8, 22.0, 0),
        ("WM-001", 7.1, 2.1, 0.9, 22.5, 3),
        ("WM-001", 7.3, 1.5, 0.7, 21.8, 6),
        ("WM-001", 7.0, 5.2, 0.6, 23.1, 9),   # non-compliant: turbidity > 4.0
        ("WM-001", 7.4, 1.9, 0.8, 22.0, 12),
        ("WM-001", 7.2, 2.0, 0.9, 21.5, 15),
        ("WM-001", 7.1, 1.7, 1.0, 22.2, 18),
        ("WM-001", 7.3, 1.6, 0.8, 22.0, 21),
        ("WM-001", 7.2, 1.8, 0.9, 21.9, 24),
        ("WM-001", 7.4, 2.2, 0.7, 22.3, 27),
        # WM-004: mostly good, one pH excursion
        ("WM-004", 7.5, 1.2, 1.1, 24.0, 0),
        ("WM-004", 7.6, 1.0, 1.2, 24.2, 3),
        ("WM-004", 6.2, 1.3, 1.0, 23.8, 6),   # non-compliant: pH < 6.5
        ("WM-004", 7.4, 1.1, 1.1, 24.1, 9),
        ("WM-004", 7.5, 1.0, 1.3, 24.3, 12),
        ("WM-004", 7.6, 1.2, 1.0, 24.0, 15),
        ("WM-004", 7.4, 0.9, 1.2, 23.9, 18),
        ("WM-004", 7.5, 1.1, 1.1, 24.2, 21),
        ("WM-004", 7.3, 1.0, 1.2, 24.0, 24),
        ("WM-004", 7.6, 1.3, 1.0, 24.4, 27),
    ]
    quality_rows = []
    for code, ph, turb, chl, temp, days_ago in quality_profiles:
        compliant = (6.5 <= ph <= 8.5) and (turb <= 4.0) and (0.2 <= chl <= 4.0)
        quality_rows.append(QualityReading(
            meter_id=m[code].id,
            ph=ph,
            turbidity_ntu=turb,
            chlorine_mgl=chl,
            temperature_c=temp,
            is_compliant=compliant,
            recorded_at=_dt(days_ago, 6),
        ))
    db.add_all(quality_rows)

    await db.commit()
    log.info("Seeded demo data: 6 meters, %d readings, 5 alerts, %d quality readings",
             len(readings), len(quality_rows))
