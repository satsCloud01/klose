from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy import select, desc, and_
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models import Property

router = APIRouter(prefix="/api/properties", tags=["properties"])


def _prop_dict(prop) -> dict:
    return {c.name: getattr(prop, c.name) for c in prop.__table__.columns}


@router.get("/")
async def list_properties(
    type: str | None = Query(None),
    bhk: str | None = Query(None),
    price_min: float | None = Query(None),
    price_max: float | None = Query(None),
    status: str | None = Query(None),
    construction_status: str | None = Query(None),
    search: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Property)
    conditions = []
    if type:
        conditions.append(Property.type == type)
    if bhk:
        conditions.append(Property.bhk == bhk)
    if price_min is not None:
        conditions.append(Property.price_max >= price_min)
    if price_max is not None:
        conditions.append(Property.price_min <= price_max)
    if status:
        conditions.append(Property.status == status)
    if construction_status:
        conditions.append(Property.construction_status == construction_status)
    if search:
        conditions.append(Property.name.ilike(f"%{search}%"))
    if conditions:
        stmt = stmt.where(and_(*conditions))
    stmt = stmt.order_by(desc(Property.created_at))
    rows = (await db.execute(stmt)).scalars().all()
    return [_prop_dict(p) for p in rows]


@router.get("/{property_id}")
async def get_property(property_id: int, db: AsyncSession = Depends(get_db)):
    prop = await db.get(Property, property_id)
    if not prop:
        raise HTTPException(404, "Property not found")
    return _prop_dict(prop)


@router.post("/")
async def create_property(body: dict, db: AsyncSession = Depends(get_db)):
    prop = Property(**{
        k: v for k, v in body.items()
        if k in {c.name for c in Property.__table__.columns} and k != "id"
    })
    db.add(prop)
    await db.commit()
    await db.refresh(prop)
    return _prop_dict(prop)


@router.put("/{property_id}")
async def update_property(property_id: int, body: dict, db: AsyncSession = Depends(get_db)):
    prop = await db.get(Property, property_id)
    if not prop:
        raise HTTPException(404, "Property not found")
    allowed = {c.name for c in Property.__table__.columns} - {"id", "created_at"}
    for k, v in body.items():
        if k in allowed:
            setattr(prop, k, v)
    await db.commit()
    await db.refresh(prop)
    return _prop_dict(prop)


@router.delete("/{property_id}")
async def delete_property(property_id: int, db: AsyncSession = Depends(get_db)):
    prop = await db.get(Property, property_id)
    if not prop:
        raise HTTPException(404, "Property not found")
    await db.delete(prop)
    await db.commit()
    return {"ok": True}


@router.post("/compare")
async def compare_properties(body: dict, db: AsyncSession = Depends(get_db)):
    ids = body.get("ids", [])
    if not ids:
        raise HTTPException(400, "No property IDs provided")
    result = await db.execute(select(Property).where(Property.id.in_(ids)))
    properties = result.scalars().all()
    return [_prop_dict(p) for p in properties]
