import pytest

pytestmark = pytest.mark.anyio


async def test_emi_calculation(client):
    payload = {"principal": 5000000, "rate": 8.5, "tenure_years": 20}
    r = await client.post("/api/finance/emi", json=payload)
    assert r.status_code == 200
    data = r.json()
    for key in ("emi", "total_payment", "total_interest", "principal", "rate", "tenure_years"):
        assert key in data
    assert data["emi"] > 0
    assert data["total_payment"] > data["principal"]
    assert data["total_interest"] > 0


async def test_emi_known_value(client):
    payload = {"principal": 1000000, "rate": 12, "tenure_years": 1}
    r = await client.post("/api/finance/emi", json=payload)
    data = r.json()
    assert 88000 < data["emi"] < 90000


async def test_emi_invalid_zero_principal(client):
    r = await client.post("/api/finance/emi", json={"principal": 0, "rate": 8, "tenure_years": 20})
    assert r.status_code == 400


async def test_emi_invalid_zero_rate(client):
    r = await client.post("/api/finance/emi", json={"principal": 5000000, "rate": 0, "tenure_years": 20})
    assert r.status_code == 400


async def test_emi_invalid_zero_tenure(client):
    r = await client.post("/api/finance/emi", json={"principal": 5000000, "rate": 8, "tenure_years": 0})
    assert r.status_code == 400


async def test_emi_negative_values(client):
    r = await client.post("/api/finance/emi", json={"principal": -100, "rate": 8, "tenure_years": 20})
    assert r.status_code == 400


async def test_emi_total_equals_principal_plus_interest(client):
    r = await client.post("/api/finance/emi", json={"principal": 3000000, "rate": 9, "tenure_years": 15})
    data = r.json()
    assert data["total_payment"] == data["principal"] + data["total_interest"]


async def test_affordability(client):
    payload = {"monthly_income": 200000, "existing_emi": 20000, "rate": 8.5, "tenure_years": 20}
    r = await client.post("/api/finance/affordability", json=payload)
    assert r.status_code == 200
    data = r.json()
    for key in ("max_emi", "max_loan_amount", "monthly_income", "dti_ratio"):
        assert key in data
    assert data["max_emi"] > 0
    assert data["max_loan_amount"] > 0
    assert data["dti_ratio"] == 40


async def test_affordability_max_emi_is_40pct(client):
    r = await client.post("/api/finance/affordability", json={
        "monthly_income": 100000, "existing_emi": 0
    })
    data = r.json()
    assert data["max_emi"] == 40000


async def test_affordability_with_existing_emi(client):
    r = await client.post("/api/finance/affordability", json={
        "monthly_income": 100000, "existing_emi": 30000
    })
    data = r.json()
    assert data["max_emi"] == round((100000 - 30000) * 0.40)


async def test_affordability_invalid_income(client):
    r = await client.post("/api/finance/affordability", json={"monthly_income": 0})
    assert r.status_code == 400


async def test_bank_rates(client):
    r = await client.get("/api/finance/bank-rates")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) > 0


async def test_bank_rates_structure(client):
    r = await client.get("/api/finance/bank-rates")
    rate = r.json()[0]
    for key in ("id", "name", "floating_rate_min", "floating_rate_max", "max_tenure"):
        assert key in rate


async def test_emi_returns_input_values(client):
    payload = {"principal": 7000000, "rate": 9.5, "tenure_years": 25}
    r = await client.post("/api/finance/emi", json=payload)
    data = r.json()
    assert data["principal"] == 7000000
    assert data["rate"] == 9.5
    assert data["tenure_years"] == 25
