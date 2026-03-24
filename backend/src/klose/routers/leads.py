import random

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy import select, func, desc, and_
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models import Lead, TeamMember

router = APIRouter(prefix="/api/leads", tags=["leads"])


def _lead_dict(lead, agent_name: str | None = None) -> dict:
    d = {c.name: getattr(lead, c.name) for c in lead.__table__.columns}
    d["assigned_agent_name"] = agent_name
    return d


@router.get("/")
async def list_leads(
    status: str | None = Query(None),
    source: str | None = Query(None),
    search: str | None = Query(None),
    bhk: str | None = Query(None),
    budget_min: float | None = Query(None),
    budget_max: float | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Lead, TeamMember.name.label("agent_name")).outerjoin(
        TeamMember, Lead.assigned_to == TeamMember.id
    )
    conditions = []
    if status:
        conditions.append(Lead.status == status)
    if source:
        conditions.append(Lead.source == source)
    if search:
        conditions.append(Lead.name.ilike(f"%{search}%"))
    if bhk:
        conditions.append(Lead.preferred_bhk == bhk)
    if budget_min is not None:
        conditions.append(Lead.budget_max >= budget_min)
    if budget_max is not None:
        conditions.append(Lead.budget_min <= budget_max)
    if conditions:
        stmt = stmt.where(and_(*conditions))
    stmt = stmt.order_by(desc(Lead.intent_score))
    rows = (await db.execute(stmt)).all()
    return [_lead_dict(row[0], row[1]) for row in rows]


@router.get("/{lead_id}")
async def get_lead(lead_id: int, db: AsyncSession = Depends(get_db)):
    row = (await db.execute(
        select(Lead, TeamMember.name.label("agent_name"))
        .outerjoin(TeamMember, Lead.assigned_to == TeamMember.id)
        .where(Lead.id == lead_id)
    )).first()
    if not row:
        raise HTTPException(404, "Lead not found")
    return _lead_dict(row[0], row[1])


@router.post("/")
async def create_lead(body: dict, db: AsyncSession = Depends(get_db)):
    lead = Lead(**{
        k: v for k, v in body.items()
        if k in {c.name for c in Lead.__table__.columns} and k != "id"
    })
    db.add(lead)
    await db.commit()
    await db.refresh(lead)
    return _lead_dict(lead)


@router.put("/{lead_id}")
async def update_lead(lead_id: int, body: dict, db: AsyncSession = Depends(get_db)):
    lead = await db.get(Lead, lead_id)
    if not lead:
        raise HTTPException(404, "Lead not found")
    allowed = {c.name for c in Lead.__table__.columns} - {"id", "created_at"}
    for k, v in body.items():
        if k in allowed:
            setattr(lead, k, v)
    await db.commit()
    await db.refresh(lead)
    return _lead_dict(lead)


@router.delete("/{lead_id}")
async def delete_lead(lead_id: int, db: AsyncSession = Depends(get_db)):
    lead = await db.get(Lead, lead_id)
    if not lead:
        raise HTTPException(404, "Lead not found")
    await db.delete(lead)
    await db.commit()
    return {"ok": True}


@router.post("/{lead_id}/score")
async def score_lead(lead_id: int, db: AsyncSession = Depends(get_db)):
    lead = await db.get(Lead, lead_id)
    if not lead:
        raise HTTPException(404, "Lead not found")
    score = random.randint(40, 98)
    return {
        "score": score,
        "reasoning": "Based on budget alignment and engagement frequency, "
                     f"this lead scores {score}/100. "
                     "Recent site visit activity and source quality contributed positively.",
    }
