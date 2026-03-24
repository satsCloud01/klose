import pytest

pytestmark = pytest.mark.anyio


async def test_list_visits(client):
    r = await client.get("/api/visits/")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)


async def test_visit_item_structure(client):
    r = await client.get("/api/visits/")
    data = r.json()
    if data:
        item = data[0]
        for key in ("id", "lead_id", "property_id", "status", "scheduled_at"):
            assert key in item


async def test_visit_stats(client):
    r = await client.get("/api/visits/stats")
    assert r.status_code == 200
    data = r.json()
    for key in ("confirmed", "pending", "completed", "cancelled"):
        assert key in data
        assert isinstance(data[key], int)


async def test_visit_calendar(client):
    r = await client.get("/api/visits/calendar")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, dict)
    for date_key, visits in data.items():
        assert isinstance(visits, list)


async def test_create_visit(client):
    leads = (await client.get("/api/leads/")).json()
    props = (await client.get("/api/properties/")).json()
    payload = {
        "lead_id": leads[0]["id"],
        "property_id": props[0]["id"],
        "status": "pending",
    }
    r = await client.post("/api/visits/", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert data["lead_id"] == leads[0]["id"]
    assert data["property_id"] == props[0]["id"]
    assert data["status"] == "pending"


async def test_create_visit_with_agent(client):
    leads = (await client.get("/api/leads/")).json()
    props = (await client.get("/api/properties/")).json()
    team = (await client.get("/api/team/")).json()
    payload = {
        "lead_id": leads[0]["id"],
        "property_id": props[0]["id"],
        "agent_id": team[0]["id"],
    }
    r = await client.post("/api/visits/", json=payload)
    assert r.status_code == 200
    assert r.json()["agent_id"] == team[0]["id"]


async def test_update_visit(client):
    visits = (await client.get("/api/visits/")).json()
    if visits:
        vid = visits[0]["id"]
        r = await client.put(f"/api/visits/{vid}", json={"status": "confirmed", "rating": 4})
        assert r.status_code == 200
        assert r.json()["status"] == "confirmed"
        assert r.json()["rating"] == 4


async def test_update_visit_feedback(client):
    visits = (await client.get("/api/visits/")).json()
    if visits:
        vid = visits[0]["id"]
        r = await client.put(f"/api/visits/{vid}", json={"feedback": "Great property"})
        assert r.status_code == 200
        assert r.json()["feedback"] == "Great property"


async def test_update_visit_not_found(client):
    r = await client.put("/api/visits/999999", json={"status": "confirmed"})
    assert r.status_code == 404


async def test_delete_visit(client):
    leads = (await client.get("/api/leads/")).json()
    props = (await client.get("/api/properties/")).json()
    create_r = await client.post("/api/visits/", json={
        "lead_id": leads[0]["id"],
        "property_id": props[0]["id"],
    })
    vid = create_r.json()["id"]
    r = await client.delete(f"/api/visits/{vid}")
    assert r.status_code == 200
    assert r.json()["ok"] is True


async def test_delete_visit_not_found(client):
    r = await client.delete("/api/visits/999999")
    assert r.status_code == 404


async def test_list_visits_filter_status(client):
    r = await client.get("/api/visits/", params={"status": "pending"})
    assert r.status_code == 200
    for v in r.json():
        assert v["status"] == "pending"


async def test_visit_stats_counts_non_negative(client):
    r = await client.get("/api/visits/stats")
    data = r.json()
    for key in ("confirmed", "pending", "completed", "cancelled"):
        assert data[key] >= 0
