from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models import BankRate

router = APIRouter(prefix="/api/finance", tags=["finance"])


@router.post("/emi")
async def calculate_emi(body: dict):
    principal = body.get("principal", 0)
    rate = body.get("rate", 0)
    tenure_years = body.get("tenure_years", 0)

    if principal <= 0 or rate <= 0 or tenure_years <= 0:
        raise HTTPException(status_code=400, detail="principal, rate, and tenure_years must be positive")

    r = rate / 12 / 100
    n = tenure_years * 12
    emi = principal * r * (1 + r) ** n / ((1 + r) ** n - 1)
    total_payment = emi * n
    total_interest = total_payment - principal

    return {
        "emi": round(emi),
        "total_payment": round(total_payment),
        "total_interest": round(total_interest),
        "principal": principal,
        "rate": rate,
        "tenure_years": tenure_years,
    }


@router.post("/affordability")
async def affordability(body: dict):
    monthly_income = body.get("monthly_income", 0)
    existing_emi = body.get("existing_emi", 0)
    rate = body.get("rate", 8.5)
    tenure_years = body.get("tenure_years", 20)

    if monthly_income <= 0:
        raise HTTPException(status_code=400, detail="monthly_income must be positive")

    max_emi = (monthly_income - existing_emi) * 0.40
    r = rate / 12 / 100
    n = tenure_years * 12

    if r > 0 and n > 0:
        max_loan_amount = max_emi * ((1 + r) ** n - 1) / (r * (1 + r) ** n)
    else:
        max_loan_amount = 0

    return {
        "max_emi": round(max_emi),
        "max_loan_amount": round(max_loan_amount),
        "monthly_income": monthly_income,
        "dti_ratio": 40,
    }


@router.get("/bank-rates")
async def list_bank_rates(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(BankRate))
    rates = result.scalars().all()
    return [{c.name: getattr(r, c.name) for c in r.__table__.columns} for r in rates]
