import pytest

pytestmark = pytest.mark.anyio


async def test_list_team(client):
    r = await client.get("/api/team/")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) > 0


async def test_list_team_sorted_by_revenue(client):
    r = await client.get("/api/team/")
    revenues = [m["revenue"] or 0 for m in r.json()]
    assert revenues == sorted(revenues, reverse=True)


async def test_leaderboard(client):
    r = await client.get("/api/team/leaderboard")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) > 0


async def test_leaderboard_structure(client):
    r = await client.get("/api/team/leaderboard")
    item = r.json()[0]
    for key in ("rank", "id", "name", "role", "deals_closed", "revenue", "active_leads"):
        assert key in item


async def test_leaderboard_ranks_sequential(client):
    r = await client.get("/api/team/leaderboard")
    ranks = [m["rank"] for m in r.json()]
    assert ranks == list(range(1, len(ranks) + 1))


async def test_team_stats(client):
    r = await client.get("/api/team/stats")
    assert r.status_code == 200
    data = r.json()
    for key in ("total_members", "total_revenue", "total_deals_closed", "avg_capacity"):
        assert key in data
    assert data["total_members"] > 0


async def test_team_stats_types(client):
    r = await client.get("/api/team/stats")
    data = r.json()
    assert isinstance(data["total_members"], int)
    assert isinstance(data["avg_capacity"], (int, float))


async def test_assignment_rules(client):
    r = await client.get("/api/team/assignment-rules")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) >= 3


async def test_assignment_rules_structure(client):
    r = await client.get("/api/team/assignment-rules")
    rule = r.json()[0]
    for key in ("name", "key", "enabled", "description"):
        assert key in rule


async def test_update_assignment_rules(client):
    r = await client.put("/api/team/assignment-rules", json={
        "rules": [{"key": "geo_routing", "enabled": True}]
    })
    assert r.status_code == 200
    data = r.json()
    geo = next(r for r in data if r["key"] == "geo_routing")
    assert geo["enabled"] is True


async def test_auto_assign(client):
    r = await client.post("/api/team/auto-assign")
    assert r.status_code == 200
    data = r.json()
    assert "assigned" in data
    assert "message" in data
    assert data["assigned"] == 3


async def test_get_member(client):
    members = (await client.get("/api/team/")).json()
    mid = members[0]["id"]
    r = await client.get(f"/api/team/{mid}")
    assert r.status_code == 200
    assert r.json()["id"] == mid


async def test_get_member_not_found(client):
    r = await client.get("/api/team/999999")
    assert r.status_code == 404


async def test_update_member(client):
    members = (await client.get("/api/team/")).json()
    mid = members[0]["id"]
    r = await client.put(f"/api/team/{mid}", json={"role": "Senior Agent"})
    assert r.status_code == 200
    assert r.json()["role"] == "Senior Agent"


async def test_update_member_not_found(client):
    r = await client.put("/api/team/999999", json={"role": "Agent"})
    assert r.status_code == 404


async def test_member_has_expected_fields(client):
    members = (await client.get("/api/team/")).json()
    m = members[0]
    for key in ("id", "name", "role", "active_leads", "deals_closed", "revenue", "capacity_pct"):
        assert key in m
