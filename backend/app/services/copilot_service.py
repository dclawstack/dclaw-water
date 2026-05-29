from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.copilot import CopilotMessage, MessageRole
from app.models.water_meter import WaterMeter, MeterStatus
from app.models.leak_alert import LeakAlert, AlertStatus
from app.core.utils import utc_now


_DOMAIN_CONTEXT = """You are the DClaw Water AI Copilot. You help water utility operators
monitor usage, detect leaks, analyze water quality, and optimize distribution.
You have access to real-time meter data, leak alerts, and quality readings."""


def _build_response(message: str, context: dict) -> str:
    msg_lower = message.lower()

    if any(w in msg_lower for w in ["leak", "alert", "burst"]):
        open_count = context.get("open_alerts", 0)
        critical = context.get("critical_alerts", 0)
        if critical:
            return (
                f"⚠️ There are currently **{open_count} open leak alerts**, "
                f"including **{critical} critical** issues requiring immediate attention. "
                "I recommend dispatching field crews to the critical sites first. "
                "Pressure-drop alerts typically indicate main breaks; acoustic alerts suggest pinhole leaks."
            )
        elif open_count:
            return (
                f"There are **{open_count} open leak alerts** active right now. "
                "None are currently flagged as critical. "
                "Monitor pressure trends and flow-rate anomalies for early escalation signals."
            )
        return "No active leak alerts detected. The network appears stable. Continue scheduled acoustic surveys."

    if any(w in msg_lower for w in ["quality", "ph", "chlorine", "turbidity", "compliance"]):
        non_compliant = context.get("non_compliant", 0)
        avg_ph = context.get("avg_ph")
        if non_compliant:
            return (
                f"⚠️ **{non_compliant} non-compliant quality readings** detected. "
                "Immediate corrective action may be required. Check chlorine dosing at treatment plants "
                "and inspect the flagged distribution zones for potential contamination sources."
            )
        ph_note = f" Average pH is **{avg_ph:.1f}** (target 6.5–8.5)." if avg_ph else ""
        return f"All quality parameters are within regulatory limits.{ph_note} Continue scheduled monitoring."

    if any(w in msg_lower for w in ["consumption", "usage", "demand", "flow"]):
        total_kl = context.get("total_kl", 0)
        active = context.get("active_meters", 0)
        return (
            f"Total recorded consumption is **{total_kl:,.1f} kL** across **{active} active meters**. "
            "To reduce non-revenue water (NRW), focus on zones with high night-flow readings — "
            "these are the strongest indicators of hidden leakage."
        )

    if any(w in msg_lower for w in ["meter", "sensor", "device", "fault"]):
        fault = context.get("fault_meters", 0)
        total = context.get("total_meters", 0)
        if fault:
            return (
                f"**{fault} meter(s)** are currently in fault status out of {total} total. "
                "Faulted meters create data blind spots — prioritize repairs to maintain network visibility."
            )
        return f"All **{total} meters** are reporting normally. Network telemetry coverage is complete."

    if any(w in msg_lower for w in ["recommend", "suggest", "next", "action", "improve"]):
        return (
            "**Recommended next actions:**\n"
            "1. Review open leak alerts and dispatch field crews to high-severity sites\n"
            "2. Audit meters with fault status to restore full network visibility\n"
            "3. Analyze night-flow data (01:00–04:00) for minimum night flow (MNF) baseline\n"
            "4. Check quality readings in distribution zones with >24h since last sample\n"
            "5. Update pressure zone setpoints based on latest demand patterns"
        )

    return (
        "I'm the DClaw Water AI Copilot. I can help you with:\n"
        "- **Leak detection** — analyzing pressure and flow anomalies\n"
        "- **Usage monitoring** — consumption trends and demand forecasting\n"
        "- **Water quality** — compliance checks and parameter analysis\n"
        "- **Next best actions** — prioritized operational recommendations\n\n"
        "What would you like to investigate?"
    )


async def chat(db: AsyncSession, session_id: str, user_message: str) -> tuple[CopilotMessage, CopilotMessage]:
    from app.repositories.leak_repo import LeakRepository
    from app.repositories.quality_repo import QualityRepository

    leak_repo = LeakRepository(db)
    quality_repo = QualityRepository(db)

    meter_count = await db.execute(select(WaterMeter))
    meters = list(meter_count.scalars().all())
    open_alerts = await leak_repo.count_by_status(AlertStatus.open)
    critical = await leak_repo.count_critical()
    non_compliant = await quality_repo.count_non_compliant()
    params = await quality_repo.avg_parameters()

    from app.repositories.reading_repo import ReadingRepository
    reading_repo = ReadingRepository(db)
    total_kl = await reading_repo.total_consumption()

    active_meters = sum(1 for m in meters if m.status == MeterStatus.active)
    fault_meters = sum(1 for m in meters if m.status == MeterStatus.fault)

    context = {
        "total_meters": len(meters),
        "active_meters": active_meters,
        "fault_meters": fault_meters,
        "open_alerts": open_alerts,
        "critical_alerts": critical,
        "non_compliant": non_compliant,
        "total_kl": total_kl,
        **params,
    }

    response_text = _build_response(user_message, context)

    user_msg = CopilotMessage(
        session_id=session_id,
        role=MessageRole.user,
        content=user_message,
        created_at=utc_now(),
    )
    db.add(user_msg)

    assistant_msg = CopilotMessage(
        session_id=session_id,
        role=MessageRole.assistant,
        content=response_text,
        created_at=utc_now(),
    )
    db.add(assistant_msg)
    await db.commit()
    await db.refresh(user_msg)
    await db.refresh(assistant_msg)

    return user_msg, assistant_msg
