from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy import select, func, desc, and_, update
from sqlalchemy.ext.asyncio import AsyncSession
from ..database import get_db
from ..models import Deal, Lead, Property, TeamMember

router = APIRouter(prefix="/api/pipeline", tags=["pipeline"])

STAGES = [
    "lead_capture",
    "qualification",
    "site_visit",
    "negotiation",
    "agreement",
    "documentation",
    "registration",
    "possession",
]


def _deal_row(row):
    d, lead_name, prop_name, agent_name = row
    return {
        "id": d.id,
        "lead_id": d.lead_id,
        "property_id": d.property_id,
        "lead_name": lead_name,
        "property_name": prop_name,
        "stage": d.stage,
        "value": d.value,
        "probability": d.probability,
        "expected_close": d.expected_close.isoformat() if d.expected_close else None,
        "assigned_to": d.assigned_to,
        "assigned_to_name": agent_name,
        "notes": d.notes,
        "created_at": d.created_at.isoformat() if d.created_at else None,
        "updated_at": d.updated_at.isoformat() if d.updated_at else None,
    }


@router.get("/")
async def list_pipeline(db: AsyncSession = Depends(get_db)):
    stmt = (
        select(Deal, Lead.name, Property.name, TeamMember.name)
        .outerjoin(Lead, Deal.lead_id == Lead.id)
        .outerjoin(Property, Deal.property_id == Property.id)
        .outerjoin(TeamMember, Deal.assigned_to == TeamMember.id)
    )
    result = await db.execute(stmt)
    grouped: dict[str, list] = {s: [] for s in STAGES}
    for r in result.all():
        stage = r[0].stage or "lead_capture"
        if stage in grouped:
            grouped[stage].append(_deal_row(r))
    stages = []
    for s in STAGES:
        deals = grouped[s]
        stages.append({
            "name": s,
            "deals": deals,
            "total_value": sum(d["value"] or 0 for d in deals),
            "count": len(deals),
        })
    return {"stages": stages}


@router.get("/stats")
async def pipeline_stats(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(
            Deal.stage,
            func.count(Deal.id),
            func.coalesce(func.sum(Deal.value), 0),
        ).group_by(Deal.stage)
    )
    per_stage = []
    total_value = 0
    total_deals = 0
    prob_sum = 0
    for stage, count, value in result.all():
        per_stage.append({"stage": stage, "count": count, "total_value": value})
        total_value += value
        total_deals += count

    # avg probability
    avg_result = await db.execute(select(func.avg(Deal.probability)))
    avg_prob = avg_result.scalar() or 0

    return {
        "per_stage": per_stage,
        "overall": {
            "total_value": total_value,
            "total_deals": total_deals,
            "avg_probability": round(float(avg_prob), 1),
        },
    }


@router.post("/")
async def create_deal(body: dict, db: AsyncSession = Depends(get_db)):
    deal = Deal(
        lead_id=body["lead_id"],
        property_id=body.get("property_id"),
        stage=body.get("stage", "lead_capture"),
        value=body.get("value"),
        probability=body.get("probability", 10),
        expected_close=body.get("expected_close"),
        notes=body.get("notes"),
        assigned_to=body.get("assigned_to"),
    )
    db.add(deal)
    await db.commit()
    await db.refresh(deal)
    return {
        "id": deal.id,
        "lead_id": deal.lead_id,
        "property_id": deal.property_id,
        "stage": deal.stage,
        "value": deal.value,
        "probability": deal.probability,
        "created_at": deal.created_at.isoformat() if deal.created_at else None,
    }


@router.put("/{deal_id}")
async def update_deal(deal_id: int, body: dict, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Deal).where(Deal.id == deal_id))
    deal = result.scalar_one_or_none()
    if not deal:
        raise HTTPException(404, "Deal not found")
    for field in ("stage", "value", "probability", "expected_close", "notes", "assigned_to", "property_id"):
        if field in body:
            setattr(deal, field, body[field])
    deal.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(deal)
    return {
        "id": deal.id,
        "lead_id": deal.lead_id,
        "property_id": deal.property_id,
        "stage": deal.stage,
        "value": deal.value,
        "probability": deal.probability,
        "expected_close": deal.expected_close.isoformat() if deal.expected_close else None,
        "notes": deal.notes,
        "assigned_to": deal.assigned_to,
        "updated_at": deal.updated_at.isoformat() if deal.updated_at else None,
    }


@router.delete("/{deal_id}")
async def delete_deal(deal_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Deal).where(Deal.id == deal_id))
    deal = result.scalar_one_or_none()
    if not deal:
        raise HTTPException(404, "Deal not found")
    await db.delete(deal)
    await db.commit()
    return {"ok": True}
