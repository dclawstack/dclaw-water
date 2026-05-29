import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_dashboard_empty(client: AsyncClient):
    resp = await client.get("/api/v1/dashboard/")
    assert resp.status_code == 200
    data = resp.json()
    assert "stats" in data
    assert data["stats"]["total_meters"] == 0
    assert data["stats"]["open_leak_alerts"] == 0
    assert data["top_consumers"] == []
    assert data["recent_alerts"] == []


@pytest.mark.asyncio
async def test_dashboard_with_data(client: AsyncClient):
    meter = await client.post("/api/v1/meters/", json={
        "meter_code": "M-D01",
        "location_name": "Main Building",
        "location_type": "building",
        "status": "active",
    })
    meter_id = meter.json()["id"]

    from datetime import datetime
    await client.post("/api/v1/readings/", json={
        "meter_id": meter_id,
        "reading_value_kl": 120.5,
        "flow_rate_lps": 3.2,
        "recorded_at": datetime.utcnow().isoformat(),
    })

    await client.post("/api/v1/leaks/", json={
        "meter_id": meter_id,
        "alert_type": "pressure_drop",
        "severity": "critical",
    })

    resp = await client.get("/api/v1/dashboard/")
    assert resp.status_code == 200
    data = resp.json()
    assert data["stats"]["total_meters"] == 1
    assert data["stats"]["active_meters"] == 1
    assert data["stats"]["total_consumption_kl"] == 120.5
    assert data["stats"]["open_leak_alerts"] >= 1
    assert data["stats"]["critical_alerts"] >= 1
    assert len(data["top_consumers"]) == 1
    assert len(data["recent_alerts"]) == 1
