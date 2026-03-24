import pytest

pytestmark = pytest.mark.anyio


async def test_list_properties(client):
    r = await client.get("/api/properties/")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) > 0


async def test_list_properties_filter_type(client):
    r = await client.get("/api/properties/", params={"type": "Apartment"})
    assert r.status_code == 200
    for p in r.json():
        assert p["type"] == "Apartment"


async def test_list_properties_filter_status(client):
    r = await client.get("/api/properties/", params={"status": "available"})
    assert r.status_code == 200
    for p in r.json():
        assert p["status"] == "available"


async def test_list_properties_search(client):
    all_props = (await client.get("/api/properties/")).json()
    if all_props:
        name_part = all_props[0]["name"][:4]
        r = await client.get("/api/properties/", params={"search": name_part})
        assert r.status_code == 200
        assert len(r.json()) >= 1


async def test_get_property_by_id(client):
    props = (await client.get("/api/properties/")).json()
    pid = props[0]["id"]
    r = await client.get(f"/api/properties/{pid}")
    assert r.status_code == 200
    assert r.json()["id"] == pid


async def test_get_property_not_found(client):
    r = await client.get("/api/properties/999999")
    assert r.status_code == 404


async def test_create_property(client):
    payload = {
        "name": "Test Residences",
        "developer": "Test Builders",
        "location": "Pune",
        "type": "Apartment",
        "bhk": "2BHK",
        "price_min": 4000000,
        "price_max": 6000000,
        "carpet_area": 850,
        "rera_verified": True,
    }
    r = await client.post("/api/properties/", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert data["name"] == "Test Residences"
    assert data["id"] is not None


async def test_update_property(client):
    props = (await client.get("/api/properties/")).json()
    pid = props[0]["id"]
    r = await client.put(f"/api/properties/{pid}", json={"status": "sold"})
    assert r.status_code == 200
    assert r.json()["status"] == "sold"


async def test_update_property_not_found(client):
    r = await client.put("/api/properties/999999", json={"status": "sold"})
    assert r.status_code == 404


async def test_delete_property(client):
    create_r = await client.post("/api/properties/", json={"name": "ToDelete", "location": "X"})
    pid = create_r.json()["id"]
    r = await client.delete(f"/api/properties/{pid}")
    assert r.status_code == 200
    assert r.json()["ok"] is True


async def test_delete_property_not_found(client):
    r = await client.delete("/api/properties/999999")
    assert r.status_code == 404


async def test_compare_properties(client):
    props = (await client.get("/api/properties/")).json()
    ids = [p["id"] for p in props[:2]]
    r = await client.post("/api/properties/compare", json={"ids": ids})
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) == len(ids)


async def test_compare_properties_empty_ids(client):
    r = await client.post("/api/properties/compare", json={"ids": []})
    assert r.status_code == 400


async def test_property_has_expected_fields(client):
    props = (await client.get("/api/properties/")).json()
    p = props[0]
    for key in ("id", "name", "location", "type", "bhk", "price_min", "price_max", "rera_verified"):
        assert key in p
