import pytest

pytestmark = pytest.mark.anyio


async def test_get_pipeline_grouped(client):
    r = await client.get("/api/pipeline/")
    assert r.status_code == 200
    data = r.json()
    assert "stages" in data
    assert isinstance(data["stages"], list)
    assert len(data["stages"]) == 8


async def test_pipeline_stage_names(client):
    r = await client.get("/api/pipeline/")
    stage_names = [s["name"] for s in r.json()["stages"]]
    expected = [
        "lead_capture", "qualification", "site_visit", "negotiation",
        "agreement", "documentation", "registration", "possession",
    ]
    assert stage_names == expected


async def test_pipeline_stage_structure(client):
    r = await client.get("/api/pipeline/")
    stage = r.json()["stages"][0]
    for key in ("name", "deals", "total_value", "count"):
        assert key in stage
    assert isinstance(stage["deals"], list)


async def test_pipeline_stats(client):
    r = await client.get("/api/pipeline/stats")
    assert r.status_code == 200
    data = r.json()
    assert "per_stage" in data
    assert "overall" in data
    overall = data["overall"]
    for key in ("total_value", "total_deals", "avg_probability"):
        assert key in overall


async def test_pipeline_stats_per_stage_structure(client):
    r = await client.get("/api/pipeline/stats")
    per_stage = r.json()["per_stage"]
    assert isinstance(per_stage, list)
    if per_stage:
        for s in per_stage:
            assert "stage" in s
            assert "count" in s
            assert "total_value" in s


async def test_create_deal(client):
    leads = (await client.get("/api/leads/")).json()
    payload = {
        "lead_id": leads[0]["id"],
        "stage": "qualification",
        "value": 7500000,
        "probability": 30,
    }
    r = await client.post("/api/pipeline/", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert data["lead_id"] == leads[0]["id"]
    assert data["stage"] == "qualification"
    assert data["value"] == 7500000


async def test_create_deal_defaults(client):
    leads = (await client.get("/api/leads/")).json()
    r = await client.post("/api/pipeline/", json={"lead_id": leads[0]["id"]})
    assert r.status_code == 200
    assert r.json()["stage"] == "lead_capture"
    assert r.json()["probability"] == 10


async def test_update_deal_stage(client):
    r = await client.get("/api/pipeline/")
    all_deals = []
    for stage in r.json()["stages"]:
        all_deals.extend(stage["deals"])
    if all_deals:
        deal_id = all_deals[0]["id"]
        r2 = await client.put(f"/api/pipeline/{deal_id}", json={"stage": "negotiation"})
        assert r2.status_code == 200
        assert r2.json()["stage"] == "negotiation"


async def test_update_deal_value(client):
    r = await client.get("/api/pipeline/")
    all_deals = []
    for stage in r.json()["stages"]:
        all_deals.extend(stage["deals"])
    if all_deals:
        deal_id = all_deals[0]["id"]
        r2 = await client.put(f"/api/pipeline/{deal_id}", json={"value": 9999999})
        assert r2.status_code == 200
        assert r2.json()["value"] == 9999999


async def test_update_deal_not_found(client):
    r = await client.put("/api/pipeline/999999", json={"stage": "negotiation"})
    assert r.status_code == 404


async def test_delete_deal(client):
    leads = (await client.get("/api/leads/")).json()
    create_r = await client.post("/api/pipeline/", json={"lead_id": leads[0]["id"]})
    deal_id = create_r.json()["id"]
    r = await client.delete(f"/api/pipeline/{deal_id}")
    assert r.status_code == 200
    assert r.json()["ok"] is True


async def test_delete_deal_not_found(client):
    r = await client.delete("/api/pipeline/999999")
    assert r.status_code == 404


async def test_pipeline_total_value_matches(client):
    r = await client.get("/api/pipeline/")
    for stage in r.json()["stages"]:
        expected = sum(d["value"] or 0 for d in stage["deals"])
        assert stage["total_value"] == expected


async def test_pipeline_count_matches(client):
    r = await client.get("/api/pipeline/")
    for stage in r.json()["stages"]:
        assert stage["count"] == len(stage["deals"])
