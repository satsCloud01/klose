import pytest

pytestmark = pytest.mark.anyio


async def test_list_leads(client):
    r = await client.get("/api/leads/")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) > 0


async def test_list_leads_has_agent_name(client):
    r = await client.get("/api/leads/")
    item = r.json()[0]
    assert "assigned_agent_name" in item


async def test_list_leads_filter_status(client):
    r = await client.get("/api/leads/", params={"status": "new"})
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    for lead in data:
        assert lead["status"] == "new"


async def test_list_leads_filter_source(client):
    r = await client.get("/api/leads/", params={"source": "99acres"})
    assert r.status_code == 200
    for lead in r.json():
        assert lead["source"] == "99acres"


async def test_list_leads_search(client):
    all_leads = (await client.get("/api/leads/")).json()
    if all_leads:
        name_part = all_leads[0]["name"][:3]
        r = await client.get("/api/leads/", params={"search": name_part})
        assert r.status_code == 200
        assert len(r.json()) >= 1


async def test_get_lead_by_id(client):
    leads = (await client.get("/api/leads/")).json()
    lead_id = leads[0]["id"]
    r = await client.get(f"/api/leads/{lead_id}")
    assert r.status_code == 200
    assert r.json()["id"] == lead_id


async def test_get_lead_not_found(client):
    r = await client.get("/api/leads/999999")
    assert r.status_code == 404


async def test_create_lead(client):
    payload = {
        "name": "Test Lead",
        "phone": "9876543210",
        "email": "test@example.com",
        "source": "Website",
        "status": "new",
        "budget_min": 5000000,
        "budget_max": 10000000,
        "preferred_bhk": "3BHK",
    }
    r = await client.post("/api/leads/", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert data["name"] == "Test Lead"
    assert data["phone"] == "9876543210"
    assert data["id"] is not None


async def test_update_lead(client):
    leads = (await client.get("/api/leads/")).json()
    lead_id = leads[0]["id"]
    r = await client.put(f"/api/leads/{lead_id}", json={"status": "contacted"})
    assert r.status_code == 200
    assert r.json()["status"] == "contacted"


async def test_update_lead_not_found(client):
    r = await client.put("/api/leads/999999", json={"status": "contacted"})
    assert r.status_code == 404


async def test_delete_lead(client):
    create_r = await client.post("/api/leads/", json={"name": "ToDelete", "source": "Test"})
    lead_id = create_r.json()["id"]
    r = await client.delete(f"/api/leads/{lead_id}")
    assert r.status_code == 200
    assert r.json()["ok"] is True
    r2 = await client.get(f"/api/leads/{lead_id}")
    assert r2.status_code == 404


async def test_delete_lead_not_found(client):
    r = await client.delete("/api/leads/999999")
    assert r.status_code == 404


async def test_score_lead(client):
    leads = (await client.get("/api/leads/")).json()
    lead_id = leads[0]["id"]
    r = await client.post(f"/api/leads/{lead_id}/score")
    assert r.status_code == 200
    data = r.json()
    assert "score" in data
    assert "reasoning" in data
    assert 40 <= data["score"] <= 98


async def test_score_lead_not_found(client):
    r = await client.post("/api/leads/999999/score")
    assert r.status_code == 404


async def test_list_leads_sorted_by_intent(client):
    leads = (await client.get("/api/leads/")).json()
    scores = [l["intent_score"] or 0 for l in leads]
    assert scores == sorted(scores, reverse=True)
