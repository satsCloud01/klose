from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models import TeamMember

router = APIRouter(prefix="/api/team", tags=["team"])

# In-memory assignment rules
_assignment_rules = [
    {"name": "Round Robin", "key": "round_robin", "enabled": True, "description": "Equally distribute new leads across available agents in rotation"},
    {"name": "Luxury Tier Lock", "key": "luxury_lock", "enabled": True, "description": "Leads > $5M routed to Senior Agents only"},
    {"name": "Geo-Routing", "key": "geo_routing", "enabled": False, "description": "Assign based on zip code proximity to agent territory"},
]


def _member_dict(m) -> dict:
    return {c.name: getattr(m, c.name) for c in m.__table__.columns}


@router.get("/")
async def list_members(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(TeamMember).order_by(desc(TeamMember.revenue)))
    return [_member_dict(m) for m in result.scalars().all()]


@router.get("/leaderboard")
async def leaderboard(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(TeamMember).order_by(desc(TeamMember.revenue)))
    members = result.scalars().all()
    return [
        {
            "rank": i + 1,
            "id": m.id,
            "name": m.name,
            "role": m.role,
            "avatar_url": m.avatar_url,
            "deals_closed": m.deals_closed,
            "revenue": m.revenue,
            "active_leads": m.active_leads,
        }
        for i, m in enumerate(members)
    ]


@router.get("/stats")
async def team_stats(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(
            func.count(TeamMember.id),
            func.coalesce(func.sum(TeamMember.revenue), 0),
            func.coalesce(func.sum(TeamMember.deals_closed), 0),
            func.coalesce(func.avg(TeamMember.capacity_pct), 0),
        )
    )
    total, revenue, deals, avg_cap = result.one()
    return {
        "total_members": total,
        "total_revenue": revenue,
        "total_deals_closed": deals,
        "avg_capacity": round(float(avg_cap), 1),
    }


@router.get("/assignment-rules")
async def get_assignment_rules():
    return _assignment_rules


@router.put("/assignment-rules")
async def update_assignment_rules(body: dict):
    rules_update = body.get("rules", [])
    key_map = {r["key"]: r for r in rules_update}
    for rule in _assignment_rules:
        if rule["key"] in key_map:
            rule["enabled"] = key_map[rule["key"]].get("enabled", rule["enabled"])
    return _assignment_rules


@router.post("/auto-assign")
async def auto_assign():
    return {"assigned": 3, "message": "3 leads auto-assigned based on active rules"}


@router.get("/{member_id}")
async def get_member(member_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(TeamMember).where(TeamMember.id == member_id))
    member = result.scalar_one_or_none()
    if not member:
        raise HTTPException(status_code=404, detail="Team member not found")
    return _member_dict(member)


@router.put("/{member_id}")
async def update_member(member_id: int, body: dict, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(TeamMember).where(TeamMember.id == member_id))
    member = result.scalar_one_or_none()
    if not member:
        raise HTTPException(status_code=404, detail="Team member not found")

    for k, v in body.items():
        if hasattr(member, k) and k != "id":
            setattr(member, k, v)
    await db.commit()
    await db.refresh(member)
    return _member_dict(member)
