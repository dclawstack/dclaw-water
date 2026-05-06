from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_create_report():
    response = client.post("/reports", json={"facility_id": "FAC-001"})
    assert response.status_code == 200
    data = response.json()
    assert data["facility_id"] == "FAC-001"
    assert "id" in data

def test_get_zones():
    response = client.get("/reports/abc/zones")
    assert response.status_code == 200
    assert len(response.json()) == 3
