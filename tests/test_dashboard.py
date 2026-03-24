import pytest

pytestmark = pytest.mark.anyio


async def test_summary_returns_metrics(client):
    r = await client.get("/api/dashboard/summary")
    assert r.status_code == 200
    data = r.json()
    for key in ("pipeline_value", "active_deals", "win_rate", "leads_count", "properties_count"):
        assert key in data
    assert isinstance(data["pipeline_value"], (int, float))
    assert isinstance(data["win_rate"], (int, float))
    assert data["leads_count"] >= 0
    assert data["properties_count"] >= 0


async def test_summary_counts_positive(client):
    r = await client.get("/api/dashboard/summary")
    data = r.json()
    assert data["leads_count"] > 0
    assert data["properties_count"] > 0


async def test_activity_returns_list(client):
    r = await client.get("/api/dashboard/activity")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) > 0


async def test_activity_item_structure(client):
    r = await client.get("/api/dashboard/activity")
    item = r.json()[0]
    for key in ("id", "name", "source", "message", "time_ago", "channel"):
        assert key in item


async def test_activity_max_ten(client):
    r = await client.get("/api/dashboard/activity")
    assert len(r.json()) <= 10


async def test_briefing_returns_object(client):
    r = await client.get("/api/dashboard/briefing")
    assert r.status_code == 200
    data = r.json()
    assert "summary" in data
    assert "actions" in data
    assert isinstance(data["summary"], str)


async def test_briefing_actions_structure(client):
    r = await client.get("/api/dashboard/briefing")
    actions = r.json()["actions"]
    assert isinstance(actions, list)
    assert len(actions) > 0
    for a in actions:
        assert "label" in a
        assert "type" in a


async def test_recommendations_returns_list(client):
    r = await client.get("/api/dashboard/recommendations")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) > 0


async def test_recommendations_item_structure(client):
    r = await client.get("/api/dashboard/recommendations")
    item = r.json()[0]
    for key in ("id", "name", "location", "price_range", "bhk", "tags"):
        assert key in item


async def test_recommendations_max_five(client):
    r = await client.get("/api/dashboard/recommendations")
    assert len(r.json()) <= 5


async def test_recommendations_tags_is_list(client):
    r = await client.get("/api/dashboard/recommendations")
    for item in r.json():
        assert isinstance(item["tags"], list)


async def test_summary_win_rate_percentage(client):
    r = await client.get("/api/dashboard/summary")
    wr = r.json()["win_rate"]
    assert 0 <= wr <= 100


async def test_activity_time_ago_is_string(client):
    r = await client.get("/api/dashboard/activity")
    for item in r.json():
        assert isinstance(item["time_ago"], str)


async def test_root_endpoint(client):
    r = await client.get("/")
    assert r.status_code == 200
    assert r.json()["app"] == "Klose CRM"
