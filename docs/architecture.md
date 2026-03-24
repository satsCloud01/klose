# Klose — Architecture (C1-C4)

> Premium Real Estate CRM for Indian Luxury Brokers

---

## C1 — System Context

Klose is a single-tenant CRM designed for premium real estate brokers operating in the Indian luxury property market. It centralises lead management, property tracking, deal pipeline, site-visit scheduling, negotiation coaching, and financial analysis into one browser-based application.

### External Actors

| Actor | Type | Interaction |
|-------|------|-------------|
| **Broker / Agent** | Primary user | Full CRUD on leads, properties, deals, visits, negotiations, partners, team. Accesses dashboard briefings and AI coaching. |
| **Channel Partners** | External referral network | Registered in-app with tiered commission structure (Gold / Silver / Bronze). Commissions tracked per deal. |
| **Property Portals** | Lead sources | 99acres, MagicBricks, Housing.com. Leads are imported manually; portal is recorded as `source` on the Lead entity. |
| **WhatsApp / Instagram / Facebook** | Communication channels | Outreach tracked manually via lead activity fields. No direct API integration. |
| **AI Engine** | Optional service | BYOK (Bring Your Own Key) integration with Claude / OpenAI. Provides lead scoring, negotiation coaching, dashboard briefings, and property comparisons. Falls back to deterministic mocks when no key is configured. |
| **Banks** | Reference data | SBI, HDFC, ICICI, Axis, Kotak. EMI base rates stored in `BankRate` table for affordability and EMI calculations. |

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│  Broker /    │────▶│              │────▶│  SQLite DB      │
│  Agent       │◀────│   Klose      │◀────│  (10 tables)    │
└─────────────┘     │   (SPA +     │     └─────────────────┘
                    │    API)       │
┌─────────────┐     │              │     ┌─────────────────┐
│  Channel     │───▶│              │────▶│  AI Engine       │
│  Partners    │     └──────────────┘     │  (BYOK/Optional) │
└─────────────┘            ▲              └─────────────────┘
                           │
              ┌────────────┴────────────┐
              │  Manual Import / Ref     │
              ├──────────┬───────────────┤
              │ 99acres  │ MagicBricks   │
              │ Housing  │ WhatsApp/IG   │
              │ Banks    │ Facebook      │
              └──────────┴───────────────┘
```

---

## C2 — Container Diagram

Klose is a two-container web application with an optional AI sidecar.

### Containers

| Container | Technology | Port | Description |
|-----------|-----------|------|-------------|
| **React SPA** | React 18, Vite, Tailwind CSS v4, Material Design 3 tokens | 5179 | 11-page single-page application. Communicates with the backend via REST. BYOK AI keys stored in browser `localStorage`. |
| **FastAPI Backend** | Python 3.12, FastAPI, async SQLAlchemy, Pydantic v2 | 8007 | 10 API routers serving JSON. Handles all business logic, AI orchestration, and database access. |
| **SQLite Database** | SQLite 3 (single file) | — | 10 tables. Auto-seeded with demo data on first run when empty. No migration framework. |
| **AI Service** (logical) | Claude / OpenAI via HTTP | — | Optional. Invoked from `ai_service.py` when an API key is provided via `X-API-Key` header. Returns scoring, coaching, briefings, comparisons. Mock responses used when absent. |

```
┌────────────────────────────────────────────────────┐
│                    Browser                          │
│  ┌──────────────────────────────────────────────┐  │
│  │  React SPA (Vite + Tailwind v4)              │  │
│  │  Port 5179                                   │  │
│  │  11 pages, MD3 tokens, @hello-pangea/dnd     │  │
│  │  localStorage: AI keys, tour state           │  │
│  └──────────────┬───────────────────────────────┘  │
└─────────────────┼──────────────────────────────────┘
                  │ HTTP/JSON (proxy → :8007)
┌─────────────────▼──────────────────────────────────┐
│  FastAPI Backend (Python 3.12)                      │
│  Port 8007                                          │
│  10 routers, async SQLAlchemy, Pydantic v2          │
│  ┌────────────┐  ┌────────────┐  ┌──────────────┐  │
│  │ Routers    │  │ Services   │  │ Models (10)  │  │
│  │ (10)       │──│ ai_service │──│ SQLAlchemy   │  │
│  └────────────┘  └─────┬──────┘  └──────┬───────┘  │
└─────────────────────────┼───────────────┼──────────┘
                          │               │
              ┌───────────▼──┐    ┌───────▼────────┐
              │ AI Provider  │    │ SQLite DB       │
              │ (Optional)   │    │ klose.db        │
              └──────────────┘    └────────────────┘
```

### Communication

- **SPA → Backend**: Vite dev proxy rewrites `/api/*` to `http://localhost:8007`. In production, Nginx or similar reverse proxy handles routing.
- **Backend → AI**: Outbound HTTPS to Claude/OpenAI API. Key forwarded from `X-API-Key` request header. Never stored server-side.
- **Backend → SQLite**: Async SQLAlchemy with `aiosqlite` driver. Single-writer, WAL mode for concurrent reads.

---

## C3 — Component Diagram (Backend)

### Routers (10)

| Router | Prefix | Responsibility |
|--------|--------|---------------|
| `dashboard` | `/api/dashboard` | Summary metrics, activity feed, AI briefing, recommendations |
| `leads` | `/api/leads` | Lead CRUD, AI scoring, filtering by status/source/assignee |
| `properties` | `/api/properties` | Property CRUD, AI comparison, RERA verification tracking |
| `visits` | `/api/visits` | Site visit CRUD, calendar view, visit statistics |
| `pipeline` | `/api/pipeline` | Deal CRUD grouped by 8 pipeline stages, stage transitions |
| `negotiation` | `/api/negotiation` | AI chat coaching, negotiation history, comps, health scoring, counter-offers |
| `finance` | `/api/finance` | EMI calculator, affordability analysis, bank rate reference |
| `partners` | `/api/partners` | Channel partner CRUD, commission tracking, partner statistics |
| `team` | `/api/team` | Team member CRUD, leaderboard, assignment rules, auto-assign |
| `settings` | `/api/settings` | Key-value settings store |

### Core Services

| Module | Purpose |
|--------|---------|
| `ai_service.py` | Unified AI gateway. Accepts provider key, dispatches to Claude/OpenAI, returns structured results. Falls back to mock responses. |
| `seed.py` | Demo data seeder. Populates all 10 tables with realistic Indian real estate data when the database is empty. |
| `database.py` | Async SQLAlchemy engine, session factory, Base declarative class. Configures SQLite with WAL and foreign key enforcement. |
| `models.py` | 10 SQLAlchemy ORM models with relationships, defaults, and column constraints. |
| `main.py` | FastAPI app factory. Mounts routers, configures CORS, triggers seed on startup. |

### Internal Dependencies

```
main.py
 ├── router/dashboard.py ──▶ database.py, models.py, ai_service.py
 ├── router/leads.py ──────▶ database.py, models.py, ai_service.py
 ├── router/properties.py ─▶ database.py, models.py, ai_service.py
 ├── router/visits.py ─────▶ database.py, models.py
 ├── router/pipeline.py ───▶ database.py, models.py
 ├── router/negotiation.py ▶ database.py, models.py, ai_service.py
 ├── router/finance.py ────▶ database.py, models.py
 ├── router/partners.py ───▶ database.py, models.py
 ├── router/team.py ───────▶ database.py, models.py
 └── router/settings.py ───▶ database.py, models.py
```

---

## C3 — Component Diagram (Frontend)

### Pages (11)

| Page | Route | Key Features |
|------|-------|-------------|
| `Landing` | `/` | Hero section, feature showcase, CTA to dashboard |
| `Dashboard` | `/dashboard` | KPI cards, activity feed, AI briefing panel, recommendation carousel |
| `Leads` | `/leads` | Filterable lead table, inline status badges, AI score display, add/edit modal |
| `Properties` | `/properties` | Property grid/list view, RERA badge, AI comparison tool |
| `SiteVisits` | `/visits` | Calendar + list view, visit scheduling, status tracking, statistics |
| `Pipeline` | `/pipeline` | Kanban board (8 stages), drag-drop via `@hello-pangea/dnd`, deal cards with value display |
| `NegotiationCoach` | `/negotiation` | AI chat interface, deal health meter, comparable analysis, counter-offer generator |
| `Finance` | `/finance` | EMI calculator, affordability analyzer, bank rate comparison table |
| `Partners` | `/partners` | Partner directory, tier badges, commission tracker, performance stats |
| `Team` | `/team` | Team roster, leaderboard, capacity indicators, auto-assignment config |
| `Settings` | `/settings` | API key configuration, app preferences, data management |

### Shared Components

| Component | Purpose |
|-----------|---------|
| `Layout` | Persistent shell with collapsible desktop sidebar and mobile bottom navigation bar. Material Symbols icons throughout. |
| `TourWizard` | 9-step interactive guided tour. Highlights UI regions with spotlight overlay. Stores completion state in `localStorage`. |
| `KanbanBoard` | Generic drag-and-drop board powered by `@hello-pangea/dnd`. Used by the Pipeline page for 8-stage deal management. |
| `api.js` | Centralised HTTP client. Prepends `/api`, attaches `X-API-Key` header from `localStorage` when present, handles error responses. |

### State Management

- No global store (Redux, Zustand, etc.). Each page manages its own state via `useState` and `useEffect`.
- API keys and tour completion stored in `localStorage`.
- Page-level data fetched on mount via `useEffect` → `api.js` → backend.

---

## C4 — Code Level Patterns

### Backend Patterns

**Async SQLAlchemy sessions**
```python
# database.py
engine = create_async_engine("sqlite+aiosqlite:///klose.db", echo=False)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        yield session
```

**FastAPI dependency injection**
```python
# routers use Depends(get_db) for session access
@router.get("/leads")
async def list_leads(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Lead).order_by(Lead.created_at.desc()))
    return result.scalars().all()
```

**AI service with mock fallback**
```python
async def score_lead(lead_data: dict, api_key: str | None) -> dict:
    if not api_key:
        return _mock_lead_score(lead_data)
    # Call Claude/OpenAI with structured prompt
    ...
```

### Frontend Patterns

**BYOK header pattern (api.js)**
```javascript
const headers = { "Content-Type": "application/json" };
const apiKey = localStorage.getItem("klose_api_key");
if (apiKey) headers["X-API-Key"] = apiKey;
```

**Tailwind CSS v4 with @theme**
```css
@theme {
  --color-primary: #1a237e;
  --color-surface: #fafafa;
  --radius-card: 1rem;
}
```

**Material Symbols usage**
```jsx
<span className="material-symbols-outlined">apartment</span>
```

**Drag-and-drop Kanban**
```jsx
<DragDropContext onDragEnd={handleDragEnd}>
  {stages.map(stage => (
    <Droppable droppableId={stage.id} key={stage.id}>
      {(provided) => (
        <div ref={provided.innerRef} {...provided.droppableProps}>
          {deals.filter(d => d.stage === stage.id).map((deal, index) => (
            <Draggable draggableId={deal.id} index={index} key={deal.id}>
              {(provided) => <DealCard ref={provided.innerRef} {...provided.draggableProps} />}
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  ))}
</DragDropContext>
```
