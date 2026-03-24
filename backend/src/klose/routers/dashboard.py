from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models import Lead, Property, Deal

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


def _time_ago(dt: datetime | None) -> str:
    if dt is None:
        return "just now"
    now = datetime.now(timezone.utc)
    naive = dt.replace(tzinfo=timezone.utc) if dt.tzinfo is None else dt
    delta = now - naive
    minutes = int(delta.total_seconds() / 60)
    if minutes < 1:
        return "just now"
    if minutes < 60:
        return f"{minutes}m ago"
    hours = minutes // 60
    if hours < 24:
        return f"{hours}h ago"
    days = hours // 24
    return f"{days}d ago"


@router.get("/summary")
async def summary(db: AsyncSession = Depends(get_db)):
    pipeline_value = (await db.execute(select(func.coalesce(func.sum(Deal.value), 0)))).scalar()
    active_deals = (await db.execute(
        select(func.count(Deal.id)).where(Deal.stage != "possession")
    )).scalar()
    total_deals = (await db.execute(select(func.count(Deal.id)))).scalar()
    possession_deals = (await db.execute(
        select(func.count(Deal.id)).where(Deal.stage == "possession")
    )).scalar()
    win_rate = round((possession_deals / total_deals * 100) if total_deals else 0, 1)
    leads_count = (await db.execute(select(func.count(Lead.id)))).scalar()
    properties_count = (await db.execute(select(func.count(Property.id)))).scalar()
    return {
        "pipeline_value": pipeline_value,
        "active_deals": active_deals,
        "win_rate": win_rate,
        "leads_count": leads_count,
        "properties_count": properties_count,
    }


@router.get("/activity")
async def activity(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Lead).order_by(Lead.updated_at.desc()).limit(10)
    )
    leads = result.scalars().all()
    items = []
    for l in leads:
        items.append({
            "id": l.id,
            "name": l.name,
            "avatar_url": l.avatar_url,
            "source": l.source,
            "message": f"{l.status.replace('_', ' ').title()} lead from {l.source}",
            "time_ago": _time_ago(l.created_at),
            "channel": l.source,
        })
    return items


@router.get("/recommendations")
async def recommendations(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Property).order_by(Property.price_max.desc()).limit(5)
    )
    properties = result.scalars().all()
    items = []
    for p in properties:
        tags = []
        if p.rera_verified:
            tags.append("RERA Verified")
        if p.construction_status:
            tags.append(p.construction_status.replace("_", " ").title())
        price_min_cr = round((p.price_min or 0) / 10000000, 2)
        price_max_cr = round((p.price_max or 0) / 10000000, 2)
        items.append({
            "id": p.id,
            "name": p.name,
            "location": p.location,
            "price_range": f"₹{price_min_cr} - {price_max_cr} Cr",
            "image_url": p.image_url,
            "bhk": p.bhk,
            "tags": tags,
        })
    return items


@router.get("/briefing")
async def briefing(db: AsyncSession = Depends(get_db)):
    return {
        "summary": "3 hot leads from 99acres are overdue for follow-up. 2 site visits scheduled today. Pipeline value crossed ₹12 Cr this week.",
        "actions": [
            {"label": "Follow up with overdue leads", "type": "urgent"},
            {"label": "Confirm today's site visits", "type": "reminder"},
            {"label": "Review 2 negotiation deals expiring soon", "type": "warning"},
        ],
    }
