"""AI Service — Claude Haiku integration with mock fallback."""
import json
import random


def _get_client(api_key: str):
    if not api_key:
        return None
    try:
        from anthropic import Anthropic
        return Anthropic(api_key=api_key)
    except Exception:
        return None


async def get_priority_briefing(leads: list, deals: list, api_key: str = "") -> dict:
    hot = [l for l in leads if l.get("intent_score", 0) >= 70]
    overdue = len([l for l in leads if l.get("status") == "contacted"])
    return {
        "summary": f"{len(hot)} hot leads from 99acres are overdue for follow-up. One inquiry matches your new listing in Palm Jumeirah.",
        "hot_leads": len(hot),
        "overdue_followups": overdue,
        "actions": [
            {"label": "Review High-Priority Leads", "type": "primary"},
            {"label": "View Full Brief", "type": "secondary"},
        ],
    }


async def score_lead_intent(lead_data: dict, api_key: str = "") -> dict:
    client = _get_client(api_key)
    if client:
        try:
            msg = client.messages.create(
                model="claude-haiku-4-5-20251001",
                max_tokens=300,
                messages=[{
                    "role": "user",
                    "content": f"Score this real estate lead's intent from 0-100. Return JSON with 'score' (int) and 'reasoning' (string). Lead: {json.dumps(lead_data)}"
                }],
            )
            text = msg.content[0].text
            if "{" in text:
                return json.loads(text[text.index("{"):text.rindex("}") + 1])
        except Exception:
            pass

    score = random.randint(40, 98)
    reasons = [
        "High budget alignment with available inventory and frequent engagement signals.",
        "Strong digital engagement pattern with multiple property views in target area.",
        "Budget matches premium segment. Referral source indicates serious buyer.",
        "Repeated inquiries and site visit requests suggest high purchase readiness.",
    ]
    return {"score": score, "reasoning": random.choice(reasons)}


async def negotiation_chat(messages: list, deal_context: dict, user_message: str, api_key: str = "") -> str:
    client = _get_client(api_key)
    if client:
        try:
            system = f"""You are an elite real estate negotiation coach.
Deal context: Property value ${deal_context.get('value', 0):,.0f}, Stage: {deal_context.get('stage', 'negotiation')}.
Give concise, strategic negotiation advice. Be specific with numbers and tactics."""
            chat_messages = [{"role": m["role"], "content": m["content"]} for m in messages[-6:]]
            chat_messages.append({"role": "user", "content": user_message})
            msg = client.messages.create(
                model="claude-haiku-4-5-20251001",
                max_tokens=500,
                system=system,
                messages=chat_messages,
            )
            return msg.content[0].text
        except Exception:
            pass

    responses = [
        "Based on current market comps, I'd recommend countering at 2% above their offer. The scarcity in this district gives you leverage — only 3 similar properties are available within a 5km radius.",
        "The buyer's quick contingency period is actually your advantage. I suggest accepting the timeline but holding firm on price. Offer a small credit ($15-25k) for cosmetic updates instead of a price reduction.",
        "Market data shows inventory in this area dropped 12% month-over-month. Position this as urgency — if they don't close within the week, you have 2 backup offers waiting.",
        "I'd recommend a split strategy: accept their price point but negotiate on the closing timeline and earnest money deposit. Increase the deposit to 3% to show commitment.",
    ]
    return random.choice(responses)


async def recommend_properties(lead: dict, properties: list, api_key: str = "") -> list:
    budget_min = lead.get("budget_min", 0)
    budget_max = lead.get("budget_max", float("inf"))
    matched = []
    for p in properties:
        if p.get("price_min", 0) <= budget_max and p.get("price_max", float("inf")) >= budget_min:
            matched.append(p)
    return sorted(matched, key=lambda x: x.get("price_max", 0), reverse=True)[:5]


async def generate_counter_offer(deal: dict, api_key: str = "") -> dict:
    value = deal.get("value", 0)
    return {
        "text": f"Based on comprehensive market analysis of comparable properties in the area, we recommend a counter-offer positioned at ${value * 1.02:,.0f}, representing a 2% premium justified by the property's unique features and current market scarcity.",
        "recommended_price": round(value * 1.02),
        "talking_points": [
            "Only 3 comparable properties available in the district",
            "Recent sale at nearby address closed 2% above asking",
            "Property includes certified solar-grid adding $150k in long-term value",
            "Short contingency period demonstrates serious buyer intent",
        ],
        "market_context": {
            "inventory_change": "-12% MoM",
            "avg_days_on_market": 28,
            "price_trend": "+3.2% QoQ",
        },
    }
