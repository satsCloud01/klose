from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models import ChannelPartner, Commission

router = APIRouter(prefix="/api/partners", tags=["partners"])


def _partner_dict(p) -> dict:
    return {c.name: getattr(p, c.name) for c in p.__table__.columns}


def _commission_dict(c) -> dict:
    return {col.name: getattr(c, col.name) for col in c.__table__.columns}


@router.get("/")
async def list_partners(
    tier: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(ChannelPartner).order_by(desc(ChannelPartner.total_commission))
    if tier:
        stmt = stmt.where(ChannelPartner.tier == tier)
    result = await db.execute(stmt)
    return [_partner_dict(p) for p in result.scalars().all()]


@router.get("/stats")
async def partner_stats(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(
            func.count(ChannelPartner.id),
            func.coalesce(func.sum(ChannelPartner.total_commission), 0),
            func.coalesce(func.avg(ChannelPartner.conversion_rate), 0),
        )
    )
    total, commission, avg_rate = result.one()

    tier_result = await db.execute(
        select(ChannelPartner.tier, func.count(ChannelPartner.id)).group_by(ChannelPartner.tier)
    )
    tier_breakdown = {row[0]: row[1] for row in tier_result.all()}
    for t in ("gold", "silver", "bronze"):
        tier_breakdown.setdefault(t, 0)

    return {
        "total_partners": total,
        "total_commission": commission,
        "avg_conversion_rate": round(float(avg_rate), 1),
        "tier_breakdown": tier_breakdown,
    }


@router.get("/{partner_id}")
async def get_partner(partner_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ChannelPartner).where(ChannelPartner.id == partner_id))
    partner = result.scalar_one_or_none()
    if not partner:
        raise HTTPException(status_code=404, detail="Partner not found")

    comm_result = await db.execute(
        select(Commission).where(Commission.partner_id == partner_id).order_by(desc(Commission.created_at))
    )
    commissions = [_commission_dict(c) for c in comm_result.scalars().all()]

    data = _partner_dict(partner)
    data["commissions"] = commissions
    return data


@router.post("/")
async def create_partner(body: dict, db: AsyncSession = Depends(get_db)):
    partner = ChannelPartner(**{k: v for k, v in body.items() if hasattr(ChannelPartner, k)})
    db.add(partner)
    await db.commit()
    await db.refresh(partner)
    return _partner_dict(partner)


@router.put("/{partner_id}")
async def update_partner(partner_id: int, body: dict, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ChannelPartner).where(ChannelPartner.id == partner_id))
    partner = result.scalar_one_or_none()
    if not partner:
        raise HTTPException(status_code=404, detail="Partner not found")

    for k, v in body.items():
        if hasattr(partner, k) and k != "id":
            setattr(partner, k, v)
    await db.commit()
    await db.refresh(partner)
    return _partner_dict(partner)


@router.get("/{partner_id}/commissions")
async def list_commissions(partner_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Commission).where(Commission.partner_id == partner_id).order_by(desc(Commission.created_at))
    )
    return [_commission_dict(c) for c in result.scalars().all()]
