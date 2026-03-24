# Klose — Domain Model

> 10 entities, Indian luxury real estate domain

---

## Entity Overview

```
Lead ──────────┬──▶ SiteVisit ◀── Property
  │            │        ▲
  │            ▼        │
  │          Deal ──────┘
  │            │
  │            ├──▶ NegotiationChat
  │            └──▶ Commission ──▶ ChannelPartner
  │
  └──▶ TeamMember

BankRate (standalone reference)
Setting  (standalone key-value)
```

---

## 1. Lead

The core entity. Represents a prospective buyer in the Indian luxury property market.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | Integer | PK, auto-increment | Unique identifier |
| `name` | String(200) | NOT NULL | Full name of the prospect |
| `email` | String(200) | Optional | Email address |
| `phone` | String(20) | NOT NULL | Indian mobile number (+91) |
| `source` | String(50) | NOT NULL | Origin: `99acres`, `magicbricks`, `housing`, `whatsapp`, `instagram`, `facebook`, `referral`, `walk_in`, `website` |
| `status` | String(30) | NOT NULL, default `new` | `new`, `contacted`, `qualified`, `negotiating`, `won`, `lost` |
| `budget_min` | Float | Optional | Minimum budget in Crores (INR) |
| `budget_max` | Float | Optional | Maximum budget in Crores (INR) |
| `preferred_location` | String(200) | Optional | Locality / micro-market preference |
| `property_type` | String(50) | Optional | `apartment`, `villa`, `penthouse`, `plot`, `commercial` |
| `bedrooms` | Integer | Optional | BHK requirement (1-6+) |
| `notes` | Text | Optional | Free-form broker notes |
| `ai_score` | Float | Optional | AI-computed lead quality score (0-100) |
| `ai_score_reason` | Text | Optional | AI explanation for the score |
| `assigned_to` | Integer | FK → TeamMember.id, Optional | Assigned broker/agent |
| `partner_id` | Integer | FK → ChannelPartner.id, Optional | Referring channel partner |
| `last_contacted` | DateTime | Optional | Timestamp of last outreach |
| `next_followup` | DateTime | Optional | Scheduled follow-up date |
| `created_at` | DateTime | NOT NULL, default now | Record creation timestamp |
| `updated_at` | DateTime | NOT NULL, auto-update | Last modification timestamp |

**Relationships**: Has many SiteVisits, has many Deals. Belongs to one TeamMember (optional). Belongs to one ChannelPartner (optional).

---

## 2. Property

Represents a real estate listing in the Indian market.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | Integer | PK, auto-increment | Unique identifier |
| `name` | String(300) | NOT NULL | Property or project name |
| `developer` | String(200) | Optional | Builder / developer name |
| `location` | String(300) | NOT NULL | Full address or locality |
| `city` | String(100) | NOT NULL | City (Mumbai, Delhi, Bangalore, etc.) |
| `property_type` | String(50) | NOT NULL | `apartment`, `villa`, `penthouse`, `plot`, `commercial` |
| `bedrooms` | Integer | Optional | BHK configuration |
| `area_sqft` | Float | Optional | Carpet/super built-up area in sq. ft. |
| `price_crores` | Float | NOT NULL | Listed price in Crores (INR) |
| `price_per_sqft` | Float | Optional | Derived or explicit rate per sq. ft. |
| `rera_number` | String(100) | Optional | RERA registration number |
| `rera_verified` | Boolean | Default False | Whether RERA number has been verified |
| `amenities` | Text (JSON) | Optional | JSON array of amenity strings |
| `description` | Text | Optional | Marketing description |
| `status` | String(30) | NOT NULL, default `available` | `available`, `under_offer`, `sold` |
| `created_at` | DateTime | NOT NULL, default now | Record creation timestamp |

**Relationships**: Has many SiteVisits, has many Deals.

**Business rule**: Properties with `rera_verified = True` display a verification badge in the UI.

---

## 3. SiteVisit

Tracks physical property visits scheduled for leads.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | Integer | PK, auto-increment | Unique identifier |
| `lead_id` | Integer | FK → Lead.id, NOT NULL | The visiting prospect |
| `property_id` | Integer | FK → Property.id, NOT NULL | The property being visited |
| `agent_id` | Integer | FK → TeamMember.id, Optional | Accompanying agent |
| `scheduled_at` | DateTime | NOT NULL | Scheduled date and time |
| `status` | String(20) | NOT NULL, default `scheduled` | `scheduled`, `completed`, `cancelled`, `no_show` |
| `feedback` | Text | Optional | Post-visit notes from broker or client |
| `rating` | Integer | Optional, 1-5 | Client interest rating |
| `created_at` | DateTime | NOT NULL, default now | Record creation timestamp |

**Relationships**: Belongs to Lead, Property, and TeamMember.

---

## 4. Deal

Represents a transaction moving through the 8-stage Indian real estate pipeline.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | Integer | PK, auto-increment | Unique identifier |
| `lead_id` | Integer | FK → Lead.id, NOT NULL | The buyer |
| `property_id` | Integer | FK → Property.id, NOT NULL | The property |
| `agent_id` | Integer | FK → TeamMember.id, Optional | Handling agent |
| `stage` | String(30) | NOT NULL, default `lead_capture` | Current pipeline stage (see below) |
| `value_crores` | Float | Optional | Deal value in Crores (INR) |
| `notes` | Text | Optional | Deal-specific notes |
| `created_at` | DateTime | NOT NULL, default now | Record creation timestamp |
| `updated_at` | DateTime | NOT NULL, auto-update | Last modification timestamp |

**Pipeline stages** (ordered):

1. `lead_capture` — Initial lead recorded
2. `qualification` — Budget, timeline, preferences confirmed
3. `site_visit` — Property visit scheduled or completed
4. `negotiation` — Price/terms discussion active
5. `booking` — Token amount paid, unit booked
6. `agreement` — Sale agreement signed
7. `loan_processing` — Bank loan in progress
8. `possession` — Keys handed over, deal closed

**Relationships**: Belongs to Lead, Property, TeamMember. Has many NegotiationChats, has many Commissions.

---

## 5. ChannelPartner

External referral partners with tiered commission structures.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | Integer | PK, auto-increment | Unique identifier |
| `name` | String(200) | NOT NULL | Partner name or firm |
| `phone` | String(20) | Optional | Contact number |
| `email` | String(200) | Optional | Email address |
| `tier` | String(20) | NOT NULL, default `bronze` | `gold`, `silver`, `bronze` |
| `commission_rate` | Float | NOT NULL | Default commission percentage |
| `total_referrals` | Integer | Default 0 | Lifetime referral count |
| `total_earned` | Float | Default 0.0 | Lifetime commission earned (INR) |
| `status` | String(20) | NOT NULL, default `active` | `active`, `inactive` |
| `created_at` | DateTime | NOT NULL, default now | Record creation timestamp |

**Tier rules**:
- **Gold**: >= 2.5% commission rate, priority listing, dedicated support
- **Silver**: >= 1.5% commission rate, standard listing
- **Bronze**: >= 0.5% commission rate, basic listing

**Relationships**: Has many Leads (referrals), has many Commissions.

---

## 6. Commission

Tracks commissions earned by channel partners on closed deals.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | Integer | PK, auto-increment | Unique identifier |
| `partner_id` | Integer | FK → ChannelPartner.id, NOT NULL | Earning partner |
| `deal_id` | Integer | FK → Deal.id, NOT NULL | Associated deal |
| `amount` | Float | NOT NULL | Commission amount in INR |
| `rate` | Float | NOT NULL | Commission percentage applied |
| `status` | String(20) | NOT NULL, default `pending` | `pending`, `approved`, `paid` |
| `created_at` | DateTime | NOT NULL, default now | Record creation timestamp |

**Relationships**: Belongs to ChannelPartner and Deal.

---

## 7. TeamMember

Internal broker/agent team members with capacity tracking.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | Integer | PK, auto-increment | Unique identifier |
| `name` | String(200) | NOT NULL | Full name |
| `email` | String(200) | Optional | Email address |
| `phone` | String(20) | Optional | Contact number |
| `role` | String(50) | NOT NULL, default `agent` | `admin`, `senior_agent`, `agent`, `trainee` |
| `specialization` | String(100) | Optional | e.g., `luxury_apartments`, `villas`, `commercial` |
| `active_leads` | Integer | Default 0 | Current active lead count |
| `max_capacity` | Integer | Default 20 | Maximum concurrent leads |
| `deals_closed` | Integer | Default 0 | Lifetime deals closed |
| `revenue_generated` | Float | Default 0.0 | Lifetime revenue in Crores |
| `status` | String(20) | NOT NULL, default `active` | `active`, `on_leave`, `inactive` |
| `created_at` | DateTime | NOT NULL, default now | Record creation timestamp |

**Relationships**: Has many Leads (assigned), has many SiteVisits, has many Deals.

**Business rule**: Auto-assignment skips members where `active_leads >= max_capacity` or `status != active`.

---

## 8. NegotiationChat

Stores AI-assisted negotiation coaching conversations per deal.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | Integer | PK, auto-increment | Unique identifier |
| `deal_id` | Integer | FK → Deal.id, NOT NULL | Associated deal |
| `messages` | Text (JSON) | NOT NULL | JSON array of `{role, content, timestamp}` objects |
| `health_score` | Float | Optional | AI-computed negotiation health (0-100) |
| `created_at` | DateTime | NOT NULL, default now | Record creation timestamp |
| `updated_at` | DateTime | NOT NULL, auto-update | Last modification timestamp |

**Relationships**: Belongs to Deal.

**Message format**:
```json
[
  {"role": "user", "content": "Client wants 10% discount on 4.5 Cr flat", "timestamp": "2026-03-23T10:30:00"},
  {"role": "assistant", "content": "Counter with 5% + parking waiver...", "timestamp": "2026-03-23T10:30:05"}
]
```

---

## 9. BankRate

Reference data for EMI calculations. Pre-seeded with 5 major Indian banks.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | Integer | PK, auto-increment | Unique identifier |
| `bank_name` | String(100) | NOT NULL, UNIQUE | Bank name |
| `base_rate` | Float | NOT NULL | Current floating rate (%) |
| `max_tenure_years` | Integer | NOT NULL | Maximum loan tenure |
| `max_ltv` | Float | NOT NULL | Maximum loan-to-value ratio (%) |
| `processing_fee` | Float | Optional | Processing fee percentage |
| `updated_at` | DateTime | NOT NULL | Rate last updated |

**Seeded banks**: SBI, HDFC, ICICI, Axis, Kotak Mahindra.

---

## 10. Setting

Generic key-value store for application configuration.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | Integer | PK, auto-increment | Unique identifier |
| `key` | String(100) | NOT NULL, UNIQUE | Setting key |
| `value` | Text | Optional | Setting value (string-encoded) |
| `updated_at` | DateTime | NOT NULL, auto-update | Last modification timestamp |

---

## Entity Relationship Summary

```
TeamMember (1) ◀──────── (N) Lead
TeamMember (1) ◀──────── (N) SiteVisit
TeamMember (1) ◀──────── (N) Deal

Lead (1) ─────────────── (N) SiteVisit
Lead (1) ─────────────── (N) Deal

Property (1) ─────────── (N) SiteVisit
Property (1) ─────────── (N) Deal

Deal (1) ─────────────── (N) NegotiationChat
Deal (1) ─────────────── (N) Commission

ChannelPartner (1) ────── (N) Lead
ChannelPartner (1) ────── (N) Commission

BankRate — standalone (no FK relationships)
Setting  — standalone (no FK relationships)
```

---

## Business Invariants

1. **Budget in Crores**: All monetary values for property prices and deal values are stored in Crores (1 Crore = 10,000,000 INR). The UI displays the `₹` symbol and `Cr` suffix.

2. **Pipeline ordering**: Deals progress through 8 stages in sequence. Backward transitions are permitted (e.g., returning from `negotiation` to `site_visit`) but the UI warns on regression.

3. **Capacity constraint**: A TeamMember cannot be auto-assigned new leads when `active_leads >= max_capacity`. Manual assignment by an admin overrides this constraint.

4. **Commission integrity**: A Commission record can only be created for a Deal that has reached at least the `booking` stage.

5. **RERA compliance**: Properties in the Indian market should carry a RERA registration number. The `rera_verified` flag is set manually by the broker after verification. Unverified properties display a warning indicator.

6. **Channel partner tiers**: Commission rates are defaults per partner; individual commissions on specific deals may override the partner's default rate.

7. **AI scores are advisory**: `ai_score` on Lead is informational only and does not gate any workflow transitions. Scores refresh on explicit user action, not automatically.

8. **No cascading deletes**: Deleting a Lead does not auto-delete associated SiteVisits or Deals. The API returns a conflict error if dependent records exist.
