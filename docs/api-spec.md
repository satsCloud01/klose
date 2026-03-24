# Klose — API Specification

> Base URL: `http://localhost:8007/api`
> All endpoints return JSON. AI-powered endpoints accept an optional `X-API-Key` header.

---

## 1. Dashboard (`/api/dashboard`)

### GET `/api/dashboard/summary`

Returns aggregated KPI metrics for the dashboard.

**Response**:
```json
{
  "total_leads": 45,
  "active_deals": 12,
  "deals_won": 8,
  "revenue_crores": 34.5,
  "conversion_rate": 17.8,
  "avg_deal_cycle_days": 42,
  "leads_by_source": {"99acres": 12, "referral": 10, ...},
  "leads_by_status": {"new": 8, "qualified": 15, ...},
  "pipeline_value_crores": 120.5
}
```

### GET `/api/dashboard/activity`

Returns recent activity feed across all entities.

**Response**:
```json
{
  "activities": [
    {"type": "lead_created", "description": "New lead: Priya Sharma", "timestamp": "2026-03-23T10:30:00", "entity_id": 12},
    {"type": "deal_stage_changed", "description": "Deal #5 moved to negotiation", "timestamp": "2026-03-23T09:15:00", "entity_id": 5}
  ]
}
```

### GET `/api/dashboard/briefing`

AI-generated morning briefing for the broker. Requires `X-API-Key` header for real AI; returns mock briefing otherwise.

**Response**:
```json
{
  "briefing": "Good morning! You have 3 follow-ups due today...",
  "priorities": ["Follow up with Rahul Mehta on 4BHK Worli", "Site visit at 2pm - Lodha Bellissimo"],
  "ai_powered": true
}
```

### GET `/api/dashboard/recommendations`

AI-generated action recommendations based on current pipeline state.

**Response**:
```json
{
  "recommendations": [
    {"action": "Follow up", "lead": "Amit Patel", "reason": "No contact in 5 days, high AI score (85)", "priority": "high"},
    {"action": "Schedule visit", "lead": "Sneha Reddy", "reason": "Qualified lead, matched 3 properties", "priority": "medium"}
  ]
}
```

---

## 2. Leads (`/api/leads`)

### GET `/api/leads`

List all leads with optional filtering.

**Query parameters**:
| Param | Type | Description |
|-------|------|-------------|
| `status` | string | Filter by status |
| `source` | string | Filter by lead source |
| `assigned_to` | integer | Filter by team member ID |
| `search` | string | Search name, email, phone |

**Response**: `Lead[]`

### GET `/api/leads/{id}`

Get a single lead by ID.

**Response**: `Lead`

### POST `/api/leads`

Create a new lead.

**Request body**:
```json
{
  "name": "Rahul Mehta",
  "phone": "+919876543210",
  "source": "99acres",
  "budget_min": 2.0,
  "budget_max": 4.0,
  "preferred_location": "Bandra West",
  "property_type": "apartment",
  "bedrooms": 3,
  "notes": "Looking for sea-facing flat"
}
```

**Response**: `Lead` (201 Created)

### PUT `/api/leads/{id}`

Update an existing lead. Accepts partial updates.

**Request body**: Partial `Lead` fields.

**Response**: `Lead`

### DELETE `/api/leads/{id}`

Delete a lead. Returns 409 Conflict if the lead has associated deals or visits.

**Response**: `{"message": "Lead deleted"}`

### POST `/api/leads/{id}/score`

Trigger AI scoring for a lead. Requires `X-API-Key` header for real AI.

**Response**:
```json
{
  "score": 82.5,
  "reason": "High budget range matches premium inventory. Active engagement pattern. Source (referral) has 3x conversion rate.",
  "ai_powered": true
}
```

---

## 3. Properties (`/api/properties`)

### GET `/api/properties`

List all properties with optional filtering.

**Query parameters**:
| Param | Type | Description |
|-------|------|-------------|
| `city` | string | Filter by city |
| `property_type` | string | Filter by type |
| `min_price` | float | Minimum price in Crores |
| `max_price` | float | Maximum price in Crores |
| `status` | string | Filter by status |
| `search` | string | Search name, developer, location |

**Response**: `Property[]`

### GET `/api/properties/{id}`

Get a single property by ID.

**Response**: `Property`

### POST `/api/properties`

Create a new property.

**Request body**:
```json
{
  "name": "Lodha Bellissimo",
  "developer": "Lodha Group",
  "location": "Mahalaxmi, Mumbai",
  "city": "Mumbai",
  "property_type": "apartment",
  "bedrooms": 4,
  "area_sqft": 3200,
  "price_crores": 12.5,
  "rera_number": "P51800025432",
  "amenities": "[\"Swimming Pool\", \"Gym\", \"Concierge\"]"
}
```

**Response**: `Property` (201 Created)

### PUT `/api/properties/{id}`

Update an existing property.

**Response**: `Property`

### DELETE `/api/properties/{id}`

Delete a property. Returns 409 if associated deals exist.

**Response**: `{"message": "Property deleted"}`

### POST `/api/properties/compare`

AI-powered comparison of 2-4 properties. Requires `X-API-Key` for real AI.

**Request body**:
```json
{
  "property_ids": [1, 3, 7]
}
```

**Response**:
```json
{
  "comparison": "Lodha Bellissimo offers the best price-per-sqft at ₹39,062...",
  "winner": {"id": 1, "reason": "Best value with premium amenities"},
  "matrix": [
    {"property_id": 1, "score": 88, "strengths": ["Location", "RERA verified"], "weaknesses": ["No parking included"]}
  ],
  "ai_powered": true
}
```

---

## 4. Visits (`/api/visits`)

### GET `/api/visits`

List all site visits with optional filtering.

**Query parameters**:
| Param | Type | Description |
|-------|------|-------------|
| `status` | string | Filter by visit status |
| `lead_id` | integer | Filter by lead |
| `property_id` | integer | Filter by property |
| `from_date` | string (ISO) | Visits from this date |
| `to_date` | string (ISO) | Visits until this date |

**Response**: `SiteVisit[]` (with nested Lead and Property names)

### GET `/api/visits/{id}`

Get a single visit by ID.

**Response**: `SiteVisit`

### POST `/api/visits`

Schedule a new site visit.

**Request body**:
```json
{
  "lead_id": 5,
  "property_id": 3,
  "agent_id": 2,
  "scheduled_at": "2026-03-25T14:00:00"
}
```

**Response**: `SiteVisit` (201 Created)

### PUT `/api/visits/{id}`

Update a visit (reschedule, add feedback, change status).

**Response**: `SiteVisit`

### DELETE `/api/visits/{id}`

Cancel/delete a visit.

**Response**: `{"message": "Visit deleted"}`

### GET `/api/visits/calendar`

Returns visits grouped by date for calendar rendering.

**Query parameters**: `month` (YYYY-MM)

**Response**:
```json
{
  "2026-03-25": [{"id": 1, "lead_name": "Rahul Mehta", "property_name": "Lodha Bellissimo", "time": "14:00", "status": "scheduled"}],
  "2026-03-27": [...]
}
```

### GET `/api/visits/stats`

Visit statistics and conversion metrics.

**Response**:
```json
{
  "total_visits": 45,
  "completed": 32,
  "cancelled": 5,
  "no_show": 3,
  "scheduled": 5,
  "avg_rating": 3.8,
  "visit_to_deal_rate": 28.1
}
```

---

## 5. Pipeline (`/api/pipeline`)

### GET `/api/pipeline`

Returns all deals grouped by pipeline stage.

**Response**:
```json
{
  "lead_capture": [{"id": 1, "lead_name": "Rahul", "property_name": "Lodha", "value_crores": 4.5, ...}],
  "qualification": [...],
  "site_visit": [...],
  "negotiation": [...],
  "booking": [...],
  "agreement": [...],
  "loan_processing": [...],
  "possession": [...]
}
```

### GET `/api/pipeline/{id}`

Get a single deal by ID.

**Response**: `Deal` (with nested Lead, Property, TeamMember names)

### POST `/api/pipeline`

Create a new deal.

**Request body**:
```json
{
  "lead_id": 5,
  "property_id": 3,
  "agent_id": 2,
  "stage": "lead_capture",
  "value_crores": 4.5
}
```

**Response**: `Deal` (201 Created)

### PUT `/api/pipeline/{id}`

Update a deal (change stage, update value, reassign).

**Request body**: Partial `Deal` fields. Stage changes trigger activity logging.

**Response**: `Deal`

### DELETE `/api/pipeline/{id}`

Delete a deal.

**Response**: `{"message": "Deal deleted"}`

---

## 6. Negotiation (`/api/negotiation`)

### POST `/api/negotiation/{deal_id}/chat`

Send a message to the AI negotiation coach for a specific deal.

**Request body**:
```json
{
  "message": "Client is asking for 10% discount on the 4.5 Cr asking price. What should I counter with?"
}
```

**Response**:
```json
{
  "reply": "A 10% discount on ₹4.5 Cr is aggressive. Counter with a 5% reduction (₹4.275 Cr) plus complimentary parking and club membership...",
  "health_score": 65.0,
  "ai_powered": true
}
```

### GET `/api/negotiation/{deal_id}/history`

Retrieve full negotiation chat history for a deal.

**Response**:
```json
{
  "deal_id": 5,
  "messages": [
    {"role": "user", "content": "Client wants 10% off", "timestamp": "2026-03-23T10:30:00"},
    {"role": "assistant", "content": "Counter with 5%...", "timestamp": "2026-03-23T10:30:05"}
  ],
  "health_score": 65.0
}
```

### GET `/api/negotiation/{deal_id}/comps`

Get comparable transactions for negotiation leverage.

**Response**:
```json
{
  "comparables": [
    {"property": "Oberoi Sky Heights", "location": "Worli", "price_crores": 4.2, "sqft": 2800, "date": "2026-01-15"},
    {"property": "Raheja Artesia", "location": "Worli", "price_crores": 4.8, "sqft": 3100, "date": "2025-11-20"}
  ],
  "avg_price_per_sqft": 15500,
  "ai_powered": false
}
```

### GET `/api/negotiation/{deal_id}/health`

Get the current negotiation health score and analysis.

**Response**:
```json
{
  "health_score": 65.0,
  "factors": [
    {"factor": "Price gap", "score": 50, "detail": "15% gap between ask and offer"},
    {"factor": "Engagement", "score": 80, "detail": "Active communication, 3 rounds completed"},
    {"factor": "Timeline", "score": 70, "detail": "Within normal negotiation window"}
  ],
  "recommendation": "Focus on non-price concessions to bridge the gap"
}
```

### POST `/api/negotiation/{deal_id}/counter-offer`

Generate an AI-powered counter-offer strategy.

**Request body**:
```json
{
  "client_offer_crores": 4.05,
  "asking_price_crores": 4.5,
  "client_concerns": ["Price too high", "Wants parking included"]
}
```

**Response**:
```json
{
  "counter_offer_crores": 4.275,
  "strategy": "Offer 5% discount with complimentary parking (value ₹15L). This bridges 50% of the gap while adding tangible value.",
  "talking_points": [
    "Recent comparable at ₹4.2 Cr was 400 sqft smaller",
    "Parking spot market value is ₹12-18L in this micro-market",
    "RERA-registered with possession in 6 months — no risk premium needed"
  ],
  "ai_powered": true
}
```

---

## 7. Finance (`/api/finance`)

### POST `/api/finance/emi`

Calculate EMI for given loan parameters.

**Request body**:
```json
{
  "principal_crores": 3.5,
  "rate_percent": 8.5,
  "tenure_years": 20
}
```

**Response**:
```json
{
  "emi_monthly": 30378,
  "total_payment": 72907200,
  "total_interest": 37907200,
  "principal": 35000000,
  "amortization_summary": {
    "year_1_principal": 1245000,
    "year_1_interest": 2953416
  }
}
```

### POST `/api/finance/affordability`

Analyse buyer affordability given income and commitments.

**Request body**:
```json
{
  "monthly_income": 500000,
  "existing_emis": 25000,
  "property_price_crores": 4.5,
  "down_payment_percent": 20
}
```

**Response**:
```json
{
  "affordable": true,
  "max_emi_capacity": 200000,
  "available_emi_capacity": 175000,
  "recommended_banks": [
    {"bank": "SBI", "rate": 8.25, "emi": 28560, "eligible": true},
    {"bank": "HDFC", "rate": 8.50, "emi": 29150, "eligible": true}
  ],
  "dti_ratio": 40.5,
  "ltv_ratio": 80.0
}
```

### GET `/api/finance/bank-rates`

List current bank rates from the BankRate table.

**Response**:
```json
{
  "rates": [
    {"bank_name": "SBI", "base_rate": 8.25, "max_tenure_years": 30, "max_ltv": 80.0, "processing_fee": 0.35},
    {"bank_name": "HDFC", "base_rate": 8.50, "max_tenure_years": 30, "max_ltv": 75.0, "processing_fee": 0.50}
  ]
}
```

---

## 8. Partners (`/api/partners`)

### GET `/api/partners`

List all channel partners with optional filtering.

**Query parameters**: `tier`, `status`, `search`

**Response**: `ChannelPartner[]`

### GET `/api/partners/{id}`

Get a single partner by ID.

**Response**: `ChannelPartner`

### POST `/api/partners`

Register a new channel partner.

**Request body**:
```json
{
  "name": "PropConnect Realty",
  "phone": "+919876543210",
  "email": "info@propconnect.in",
  "tier": "silver",
  "commission_rate": 2.0
}
```

**Response**: `ChannelPartner` (201 Created)

### PUT `/api/partners/{id}`

Update a partner.

**Response**: `ChannelPartner`

### DELETE `/api/partners/{id}`

Delete a partner. Returns 409 if active commissions exist.

**Response**: `{"message": "Partner deleted"}`

### GET `/api/partners/{id}/stats`

Get performance statistics for a partner.

**Response**:
```json
{
  "total_referrals": 15,
  "converted_deals": 5,
  "conversion_rate": 33.3,
  "total_earned": 450000,
  "pending_commission": 120000,
  "avg_deal_value_crores": 3.8
}
```

### GET `/api/partners/{id}/commissions`

List all commissions for a partner.

**Response**: `Commission[]`

---

## 9. Team (`/api/team`)

### GET `/api/team`

List all team members.

**Query parameters**: `role`, `status`, `search`

**Response**: `TeamMember[]`

### GET `/api/team/{id}`

Get a single team member by ID.

**Response**: `TeamMember`

### POST `/api/team`

Add a new team member.

**Request body**:
```json
{
  "name": "Vikram Singh",
  "email": "vikram@klose.in",
  "phone": "+919876543210",
  "role": "senior_agent",
  "specialization": "luxury_apartments",
  "max_capacity": 25
}
```

**Response**: `TeamMember` (201 Created)

### PUT `/api/team/{id}`

Update a team member.

**Response**: `TeamMember`

### DELETE `/api/team/{id}`

Delete a team member. Returns 409 if active leads are assigned.

**Response**: `{"message": "Team member deleted"}`

### GET `/api/team/leaderboard`

Team performance leaderboard.

**Response**:
```json
{
  "leaderboard": [
    {"id": 1, "name": "Vikram Singh", "deals_closed": 12, "revenue_crores": 48.5, "active_leads": 8, "conversion_rate": 24.0},
    {"id": 2, "name": "Priya Nair", "deals_closed": 10, "revenue_crores": 38.2, "active_leads": 15, "conversion_rate": 20.0}
  ]
}
```

### GET `/api/team/assignment-rules`

Get current auto-assignment rules.

**Response**:
```json
{
  "rules": {
    "method": "round_robin",
    "respect_capacity": true,
    "respect_specialization": true,
    "skip_on_leave": true
  }
}
```

### POST `/api/team/auto-assign`

Trigger auto-assignment for unassigned leads.

**Request body**:
```json
{
  "lead_ids": [12, 15, 18]
}
```

**Response**:
```json
{
  "assignments": [
    {"lead_id": 12, "assigned_to": 1, "agent_name": "Vikram Singh", "reason": "Round robin, specialization match"},
    {"lead_id": 15, "assigned_to": 2, "agent_name": "Priya Nair", "reason": "Round robin, available capacity"}
  ]
}
```

---

## 10. Settings (`/api/settings`)

### GET `/api/settings`

Get all settings as key-value pairs.

**Response**:
```json
{
  "settings": {
    "company_name": "Klose Realty",
    "default_city": "Mumbai",
    "currency": "INR",
    "auto_assign_enabled": "true"
  }
}
```

### PUT `/api/settings`

Update one or more settings.

**Request body**:
```json
{
  "company_name": "Klose Premium Realty",
  "default_city": "Mumbai"
}
```

**Response**:
```json
{
  "message": "Settings updated",
  "settings": {"company_name": "Klose Premium Realty", "default_city": "Mumbai"}
}
```

---

## Error Responses

All endpoints use standard HTTP status codes:

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad request (validation error) |
| 404 | Entity not found |
| 409 | Conflict (e.g., delete with dependencies) |
| 500 | Internal server error |

Error body format:
```json
{
  "detail": "Lead with id 99 not found"
}
```
