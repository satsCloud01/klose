import json
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy import select, func, desc, and_, update
from sqlalchemy.ext.asyncio import AsyncSession
from ..database import get_db
from ..models import NegotiationChat, Deal, Property

router = APIRouter(prefix="/api/negotiation", tags=["negotiation"])

CANNED_RESPONSES = [
    "Based on recent transactions in this micro-market, the asking price is about 5-8% above the current fair value. I'd recommend starting your counter-offer at 4% below asking and settling around 2-3% below.",
    "The buyer seems genuinely interested but is testing your flexibility. Hold firm on the base price but consider offering a flexible payment plan — staggered milestones often close deals faster than outright discounts.",
    "Market momentum favours sellers right now with inventory tightening. You have leverage. I'd suggest holding your price and sweetening the deal with a waiver on one maintenance charge or a parking upgrade.",
    "This is a strong lead. The key concern appears to be EMI affordability. Consider connecting them with our preferred banking partner who can offer 15 bps lower than market rate — that often bridges the gap.",
    "Looking at comparable sales in the last 90 days, your pricing is competitive. Focus the conversation on value — RERA compliance, construction quality, and upcoming infrastructure projects nearby.",
]


def _pick_response(message: str) -> str:
    msg_lower = message.lower()
    if any(w in msg_lower for w in ("price", "cost", "expensive", "budget")):
        return CANNED_RESPONSES[0]
    if any(w in msg_lower for w in ("interest", "buyer", "keen", "serious")):
        return CANNED_RESPONSES[1]
    if any(w in msg_lower for w in ("market", "trend", "demand")):
        return CANNED_RESPONSES[2]
    if any(w in msg_lower for w in ("emi", "loan", "bank", "finance")):
        return CANNED_RESPONSES[3]
    return CANNED_RESPONSES[4]


@router.get("/{deal_id}/history")
async def chat_history(deal_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(NegotiationChat).where(NegotiationChat.deal_id == deal_id)
    )
    chat = result.scalar_one_or_none()
    if not chat:
        return []
    return json.loads(chat.messages)


@router.post("/chat")
async def send_message(body: dict, db: AsyncSession = Depends(get_db)):
    deal_id = body["deal_id"]
    user_message = body["message"]

    result = await db.execute(
        select(NegotiationChat).where(NegotiationChat.deal_id == deal_id)
    )
    chat = result.scalar_one_or_none()

    if chat:
        messages = json.loads(chat.messages)
    else:
        chat = NegotiationChat(deal_id=deal_id, messages="[]")
        db.add(chat)
        messages = []

    now = datetime.now(timezone.utc).isoformat()
    messages.append({"role": "user", "content": user_message, "timestamp": now})

    ai_response = _pick_response(user_message)
    messages.append({"role": "assistant", "content": ai_response, "timestamp": now})

    chat.messages = json.dumps(messages)
    chat.updated_at = datetime.now(timezone.utc)
    await db.commit()
    return {"messages": messages}


@router.get("/{deal_id}/comps")
async def comparable_properties(deal_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Deal).where(Deal.id == deal_id))
    deal = result.scalar_one_or_none()
    if not deal:
        raise HTTPException(404, "Deal not found")

    if not deal.property_id:
        return []

    prop_result = await db.execute(select(Property).where(Property.id == deal.property_id))
    prop = prop_result.scalar_one_or_none()
    if not prop or not prop.price_min:
        return []

    mid_price = (prop.price_min + (prop.price_max or prop.price_min)) / 2
    low = mid_price * 0.7
    high = mid_price * 1.3

    comps_result = await db.execute(
        select(Property)
        .where(
            and_(
                Property.id != prop.id,
                Property.price_min >= low,
                Property.price_min <= high,
            )
        )
        .limit(3)
    )
    comps = comps_result.scalars().all()
    return [
        {
            "id": c.id,
            "name": c.name,
            "location": c.location,
            "price": c.price_min,
            "status": c.status,
        }
        for c in comps
    ]


@router.get("/{deal_id}/health")
async def deal_health(deal_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Deal).where(Deal.id == deal_id))
    deal = result.scalar_one_or_none()
    if not deal:
        raise HTTPException(404, "Deal not found")
    return {
        "buyer_interest": 88,
        "price_alignment": 65,
        "market_position": "strong",
        "days_in_stage": 12,
    }


@router.post("/{deal_id}/counter-offer")
async def counter_offer(deal_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Deal).where(Deal.id == deal_id))
    deal = result.scalar_one_or_none()
    if not deal:
        raise HTTPException(404, "Deal not found")
    recommended = round((deal.value or 0) * 1.02, 2)
    return {
        "text": "Based on market analysis and comparable transactions in this micro-market, a slight upward revision is justified given current demand-supply dynamics.",
        "recommended_price": recommended,
        "talking_points": [
            "Recent sales in this locality averaged 3-5% higher than 6 months ago",
            "RERA-registered project with strong developer track record",
            "Upcoming metro line within 1.5 km will boost future appreciation",
            "Limited unsold inventory in this phase — scarcity advantage",
        ],
    }
