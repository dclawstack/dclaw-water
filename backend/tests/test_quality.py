import pytest
from datetime import datetime
from httpx import AsyncClient


async def _create_meter(client: AsyncClient, code: str = "M-Q01") -> str:
    resp = await client.post("/api/v1/meters/", json={
        "meter_code": code,
        "location_name": "Quality Zone",
        "location_type": "zone",
        "status": "active",
    })
    return resp.json()["id"]


@pytest.mark.asyncio
async def test_create_quality_reading_compliant(client: AsyncClient):
    meter_id = await _create_meter(client)
    resp = await client.post("/api/v1/quality/", json={
        "meter_id": meter_id,
        "ph": 7.2,
        "turbidity_ntu": 1.5,
        "chlorine_mgl": 1.0,
        "temperature_c": 18.5,
        "recorded_at": datetime.utcnow().isoformat(),
    })
    assert resp.status_code == 201
    data = resp.json()
    assert data["is_compliant"] is True


@pytest.mark.asyncio
async def test_create_quality_reading_non_compliant_ph(client: AsyncClient):
    meter_id = await _create_meter(client, "M-Q02")
    resp = await client.post("/api/v1/quality/", json={
        "meter_id": meter_id,
        "ph": 9.5,
        "turbidity_ntu": 1.0,
        "chlorine_mgl": 1.0,
        "recorded_at": datetime.utcnow().isoformat(),
    })
    assert resp.status_code == 201
    assert resp.json()["is_compliant"] is False


@pytest.mark.asyncio
async def test_create_quality_unknown_meter(client: AsyncClient):
    resp = await client.post("/api/v1/quality/", json={
        "meter_id": "00000000-0000-0000-0000-000000000000",
        "ph": 7.0,
        "turbidity_ntu": 1.0,
        "chlorine_mgl": 1.0,
        "recorded_at": datetime.utcnow().isoformat(),
    })
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_list_quality(client: AsyncClient):
    resp = await client.get("/api/v1/quality/")
    assert resp.status_code == 200
    assert "items" in resp.json()
