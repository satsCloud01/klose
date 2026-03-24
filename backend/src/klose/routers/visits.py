from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy import select, func, desc, and_, update
from sqlalchemy.ext.asyncio import AsyncSession
from ..database import get_db
from ..models import SiteVisit, Lead, Property, TeamMember

router = APIRouter(prefix="/api/visits", tags=["visits"])


def _visit_row(row):
    v, lead_name, prop_name, agent_name = row
    return {
        "id": v.id,
        "lead_id": v.lead_id,
        "property_id": v.property_id,
        "agent_id": v.agent_id,
        "scheduled_at": v.scheduled_at.isoformat() if v.scheduled_at else None,
        "status": v.status,
        "feedback": v.feedback,
        "rating": v.rating,
        "lead_name": lead_name,
        "property_name": prop_name,
        "agent_name": agent_name,
        "created_at": v.created_at.isoformat() if v.created_at else None,
    }


def _build_query(status, agent_id, date_from, date_to):
    stmt = (
        select(SiteVisit, Lead.name, Property.name, TeamMember.name)
        .outerjoin(Lead, SiteVisit.lead_id == Lead.id)
        .outerjoin(Property, SiteVisit.property_id == Property.id)
        .outerjoin(TeamMember, SiteVisit.agent_id == TeamMember.id)
    )
    filters = []
    if status:
        filters.append(SiteVisit.status == status)
    if agent_id is not None:
        filters.append(SiteVisit.agent_id == agent_id)
    if date_from:
        filters.append(SiteVisit.scheduled_at >= date_from)
    if date_to:
        filters.append(SiteVisit.scheduled_at <= date_to)
    if filters:
        stmt = stmt.where(and_(*filters))
    return stmt.order_by(SiteVisit.scheduled_at.asc())


@router.get("/")
async def list_visits(
    status: str | None = Query(None),
    agent_id: int | None = Query(None),
    date_from: str | None = Query(None),
    date_to: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    stmt = _build_query(status, agent_id, date_from, date_to)
    result = await db.execute(stmt)
    return [_visit_row(r) for r in result.all()]


@router.get("/calendar")
async def calendar_visits(
    status: str | None = Query(None),
    agent_id: int | None = Query(None),
    date_from: str | None = Query(None),
    date_to: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    stmt = _build_query(status, agent_id, date_from, date_to)
    result = await db.execute(stmt)
    calendar: dict[str, list] = {}
    for r in result.all():
        v = r[0]
        date_key = v.scheduled_at.strftime("%Y-%m-%d") if v.scheduled_at else "unscheduled"
        calendar.setdefault(date_key, []).append(_visit_row(r))
    return calendar


@router.get("/stats")
async def visit_stats(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(SiteVisit.status, func.count(SiteVisit.id)).group_by(SiteVisit.status)
    )
    counts = {row[0]: row[1] for row in result.all()}
    return {
        "confirmed": counts.get("confirmed", 0),
        "pending": counts.get("pending", 0),
        "completed": counts.get("completed", 0),
        "cancelled": counts.get("cancelled", 0),
    }


@router.post("/")
async def create_visit(body: dict, db: AsyncSession = Depends(get_db)):
    visit = SiteVisit(
        lead_id=body["lead_id"],
        property_id=body["property_id"],
        agent_id=body.get("agent_id"),
        scheduled_at=body.get("scheduled_at"),
        status=body.get("status", "pending"),
    )
    db.add(visit)
    await db.commit()
    await db.refresh(visit)
    return {
        "id": visit.id,
        "lead_id": visit.lead_id,
        "property_id": visit.property_id,
        "agent_id": visit.agent_id,
        "scheduled_at": visit.scheduled_at.isoformat() if visit.scheduled_at else None,
        "status": visit.status,
        "created_at": visit.created_at.isoformat() if visit.created_at else None,
    }


@router.put("/{visit_id}")
async def update_visit(visit_id: int, body: dict, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(SiteVisit).where(SiteVisit.id == visit_id))
    visit = result.scalar_one_or_none()
    if not visit:
        raise HTTPException(404, "Visit not found")
    for field in ("status", "feedback", "rating"):
        if field in body:
            setattr(visit, field, body[field])
    await db.commit()
    await db.refresh(visit)
    return {
        "id": visit.id,
        "lead_id": visit.lead_id,
        "property_id": visit.property_id,
        "agent_id": visit.agent_id,
        "scheduled_at": visit.scheduled_at.isoformat() if visit.scheduled_at else None,
        "status": visit.status,
        "feedback": visit.feedback,
        "rating": visit.rating,
    }


@router.delete("/{visit_id}")
async def delete_visit(visit_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(SiteVisit).where(SiteVisit.id == visit_id))
    visit = result.scalar_one_or_none()
    if not visit:
        raise HTTPException(404, "Visit not found")
    await db.delete(visit)
    await db.commit()
    return {"ok": True}
