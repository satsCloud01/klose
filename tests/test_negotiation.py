import pytest

pytestmark = pytest.mark.anyio


async def _get_deal_id(client):
    r = await client.get("/api/pipeline/")
    for stage in r.json()["stages"]:
        if stage["deals"]:
            return stage["deals"][0]["id"]
    return None


async def test_chat_history_empty(client):
    deal_id = await _get_deal_id(client)
    if deal_id:
        r = await client.get(f"/api/negotiation/{deal_id}/history")
        assert r.status_code == 200
        assert isinstance(r.json(), list)


async def test_send_chat_message(client):
    deal_id = await _get_deal_id(client)
    if deal_id:
        r = await client.post("/api/negotiation/chat", json={
            "deal_id": deal_id,
            "message": "What is the best price for this property?",
        })
        assert r.status_code == 200
        msgs = r.json()["messages"]
        assert len(msgs) >= 2
        assert msgs[-2]["role"] == "user"
        assert msgs[-1]["role"] == "assistant"


async def test_chat_price_keyword_response(client):
    deal_id = await _get_deal_id(client)
    if deal_id:
        r = await client.post("/api/negotiation/chat", json={
            "deal_id": deal_id,
            "message": "The price seems too expensive",
        })
        msgs = r.json()["messages"]
        assert "fair value" in msgs[-1]["content"].lower() or "counter-offer" in msgs[-1]["content"].lower()


async def test_chat_emi_keyword_response(client):
    deal_id = await _get_deal_id(client)
    if deal_id:
        r = await client.post("/api/negotiation/chat", json={
            "deal_id": deal_id,
            "message": "Can the buyer afford the EMI?",
        })
        msgs = r.json()["messages"]
        assert msgs[-1]["role"] == "assistant"
        assert len(msgs[-1]["content"]) > 10  # AI gave a substantive response


async def test_chat_history_persists(client):
    deal_id = await _get_deal_id(client)
    if deal_id:
        await client.post("/api/negotiation/chat", json={
            "deal_id": deal_id, "message": "Hello"
        })
        r = await client.get(f"/api/negotiation/{deal_id}/history")
        assert r.status_code == 200
        assert len(r.json()) >= 2


async def test_deal_comps(client):
    deal_id = await _get_deal_id(client)
    if deal_id:
        r = await client.get(f"/api/negotiation/{deal_id}/comps")
        assert r.status_code == 200
        assert isinstance(r.json(), list)


async def test_deal_comps_structure(client):
    deal_id = await _get_deal_id(client)
    if deal_id:
        r = await client.get(f"/api/negotiation/{deal_id}/comps")
        data = r.json()
        if data:
            for key in ("id", "name", "location", "price", "status"):
                assert key in data[0]


async def test_deal_comps_not_found(client):
    r = await client.get("/api/negotiation/999999/comps")
    assert r.status_code == 404


async def test_deal_health(client):
    deal_id = await _get_deal_id(client)
    if deal_id:
        r = await client.get(f"/api/negotiation/{deal_id}/health")
        assert r.status_code == 200
        data = r.json()
        for key in ("buyer_interest", "price_alignment", "market_position", "days_in_stage"):
            assert key in data


async def test_deal_health_not_found(client):
    r = await client.get("/api/negotiation/999999/health")
    assert r.status_code == 404


async def test_counter_offer(client):
    deal_id = await _get_deal_id(client)
    if deal_id:
        r = await client.post(f"/api/negotiation/{deal_id}/counter-offer")
        assert r.status_code == 200
        data = r.json()
        for key in ("text", "recommended_price", "talking_points"):
            assert key in data
        assert isinstance(data["talking_points"], list)


async def test_counter_offer_not_found(client):
    r = await client.post("/api/negotiation/999999/counter-offer")
    assert r.status_code == 404


async def test_deal_health_values(client):
    deal_id = await _get_deal_id(client)
    if deal_id:
        r = await client.get(f"/api/negotiation/{deal_id}/health")
        data = r.json()
        assert data["buyer_interest"] == 88
        assert data["market_position"] == "strong"


async def test_chat_message_has_timestamp(client):
    deal_id = await _get_deal_id(client)
    if deal_id:
        r = await client.post("/api/negotiation/chat", json={
            "deal_id": deal_id, "message": "Test timestamp"
        })
        for msg in r.json()["messages"]:
            assert "timestamp" in msg
