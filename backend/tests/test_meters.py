import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_meter(client: AsyncClient):
    resp = await client.post("/api/v1/meters/", json={
        "meter_code": "M-001",
        "location_name": "Building A",
        "location_type": "building",
        "status": "active",
    })
    assert resp.status_code == 201
    data = resp.json()
    assert data["meter_code"] == "M-001"
    assert data["location_name"] == "Building A"


@pytest.mark.asyncio
async def test_create_meter_duplicate_code(client: AsyncClient):
    payload = {"meter_code": "M-DUP", "location_name": "Zone 1", "location_type": "zone", "status": "active"}
    await client.post("/api/v1/meters/", json=payload)
    resp = await client.post("/api/v1/meters/", json=payload)
    assert resp.status_code == 409


@pytest.mark.asyncio
async def test_list_meters_empty(client: AsyncClient):
    resp = await client.get("/api/v1/meters/")
    assert resp.status_code == 200
    assert resp.json()["total"] == 0


@pytest.mark.asyncio
async def test_get_meter_not_found(client: AsyncClient):
    resp = await client.get("/api/v1/meters/00000000-0000-0000-0000-000000000000")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_update_meter(client: AsyncClient):
    create = await client.post("/api/v1/meters/", json={
        "meter_code": "M-UPD",
        "location_name": "Zone 2",
        "location_type": "zone",
        "status": "active",
    })
    meter_id = create.json()["id"]
    resp = await client.put(f"/api/v1/meters/{meter_id}", json={"status": "fault"})
    assert resp.status_code == 200
    assert resp.json()["status"] == "fault"


@pytest.mark.asyncio
async def test_delete_meter(client: AsyncClient):
    create = await client.post("/api/v1/meters/", json={
        "meter_code": "M-DEL",
        "location_name": "Zone 3",
        "location_type": "zone",
        "status": "active",
    })
    meter_id = create.json()["id"]
    resp = await client.delete(f"/api/v1/meters/{meter_id}")
    assert resp.status_code == 204
