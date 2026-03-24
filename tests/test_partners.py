import pytest

pytestmark = pytest.mark.anyio


async def test_list_partners(client):
    r = await client.get("/api/partners/")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) > 0


async def test_list_partners_filter_tier(client):
    r = await client.get("/api/partners/", params={"tier": "gold"})
    assert r.status_code == 200
    for p in r.json():
        assert p["tier"] == "gold"


async def test_partner_stats(client):
    r = await client.get("/api/partners/stats")
    assert r.status_code == 200
    data = r.json()
    for key in ("total_partners", "total_commission", "avg_conversion_rate", "tier_breakdown"):
        assert key in data
    assert data["total_partners"] > 0
    assert isinstance(data["tier_breakdown"], dict)


async def test_partner_stats_tier_breakdown(client):
    r = await client.get("/api/partners/stats")
    breakdown = r.json()["tier_breakdown"]
    for tier in ("gold", "silver", "bronze"):
        assert tier in breakdown


async def test_get_partner_detail(client):
    partners = (await client.get("/api/partners/")).json()
    pid = partners[0]["id"]
    r = await client.get(f"/api/partners/{pid}")
    assert r.status_code == 200
    data = r.json()
    assert data["id"] == pid
    assert "commissions" in data
    assert isinstance(data["commissions"], list)


async def test_get_partner_not_found(client):
    r = await client.get("/api/partners/999999")
    assert r.status_code == 404


async def test_partner_commissions(client):
    partners = (await client.get("/api/partners/")).json()
    pid = partners[0]["id"]
    r = await client.get(f"/api/partners/{pid}/commissions")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


async def test_partner_commissions_structure(client):
    partners = (await client.get("/api/partners/")).json()
    pid = partners[0]["id"]
    r = await client.get(f"/api/partners/{pid}/commissions")
    data = r.json()
    if data:
        for key in ("id", "partner_id", "amount", "status"):
            assert key in data[0]


async def test_create_partner(client):
    payload = {
        "name": "Test Partner",
        "company": "Test Realty",
        "phone": "9876543210",
        "email": "partner@test.com",
        "tier": "silver",
    }
    r = await client.post("/api/partners/", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert data["name"] == "Test Partner"
    assert data["tier"] == "silver"
    assert data["id"] is not None


async def test_create_partner_defaults(client):
    r = await client.post("/api/partners/", json={"name": "Minimal Partner"})
    assert r.status_code == 200
    data = r.json()
    assert data["tier"] == "bronze"
    assert data["total_commission"] == 0


async def test_update_partner(client):
    partners = (await client.get("/api/partners/")).json()
    pid = partners[0]["id"]
    r = await client.put(f"/api/partners/{pid}", json={"tier": "gold"})
    assert r.status_code == 200
    assert r.json()["tier"] == "gold"


async def test_update_partner_not_found(client):
    r = await client.put("/api/partners/999999", json={"tier": "gold"})
    assert r.status_code == 404


async def test_list_partners_sorted_by_commission(client):
    r = await client.get("/api/partners/")
    data = r.json()
    commissions = [p["total_commission"] or 0 for p in data]
    assert commissions == sorted(commissions, reverse=True)


async def test_partner_has_expected_fields(client):
    partners = (await client.get("/api/partners/")).json()
    p = partners[0]
    for key in ("id", "name", "company", "tier", "total_leads", "total_deals", "total_commission", "conversion_rate"):
        assert key in p
