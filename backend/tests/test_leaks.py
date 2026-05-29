import pytest
from httpx import AsyncClient


async def _create_meter(client: AsyncClient, code: str = "M-L01") -> str:
    resp = await client.post("/api/v1/meters/", json={
        "meter_code": code,
        "location_name": "Test Zone",
        "location_type": "zone",
        "status": "active",
    })
    return resp.json()["id"]


@pytest.mark.asyncio
async def test_create_leak_alert(client: AsyncClient):
    meter_id = await _create_meter(client)
    resp = await client.post("/api/v1/leaks/", json={
        "meter_id": meter_id,
        "alert_type": "pressure_drop",
        "severity": "high",
        "description": "Significant pressure drop detected at Zone A",
        "estimated_loss_lph": 450.0,
    })
    assert resp.status_code == 201
    data = resp.json()
    assert data["alert_type"] == "pressure_drop"
    assert data["status"] == "open"


@pytest.mark.asyncio
async def test_list_leaks(client: AsyncClient):
    meter_id = await _create_meter(client, "M-L02")
    await client.post("/api/v1/leaks/", json={
        "meter_id": meter_id,
        "alert_type": "consumption_spike",
        "severity": "medium",
    })
    resp = await client.get("/api/v1/leaks/")
    assert resp.status_code == 200
    assert resp.json()["total"] >= 1


@pytest.mark.asyncio
async def test_update_leak_status(client: AsyncClient):
    meter_id = await _create_meter(client, "M-L03")
    create = await client.post("/api/v1/leaks/", json={
        "meter_id": meter_id,
        "alert_type": "acoustic",
        "severity": "low",
    })
    alert_id = create.json()["id"]
    resp = await client.put(f"/api/v1/leaks/{alert_id}", json={"status": "resolved"})
    assert resp.status_code == 200
    assert resp.json()["status"] == "resolved"


@pytest.mark.asyncio
async def test_create_leak_unknown_meter(client: AsyncClient):
    resp = await client.post("/api/v1/leaks/", json={
        "meter_id": "00000000-0000-0000-0000-000000000000",
        "alert_type": "pressure_drop",
        "severity": "low",
    })
    assert resp.status_code == 404
