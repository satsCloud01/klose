# Klose — Constraints & Decisions

> Architectural decisions, trade-offs, and design constraints for the Klose Premium Real Estate CRM.

---

## 1. No Authentication

**Decision**: Klose has no login, session management, or role-based access control.

**Rationale**: This is a demo/pitch application designed to showcase CRM capabilities to prospective buyers. Removing authentication eliminates friction during live demos and allows instant access to all features.

**Implication**: The app is single-tenant by design. All data is visible to all users. Not suitable for production multi-user deployment without adding an auth layer.

---

## 2. BYOK AI Keys (Bring Your Own Key)

**Decision**: AI API keys are stored exclusively in the browser's `localStorage` and passed to the backend via the `X-API-Key` HTTP header on each request. Keys are never persisted server-side.

**Rationale**:
- Eliminates the need for server-side secret management in a demo app
- Each user controls their own AI spend
- No risk of key exposure in the database or server logs

**Implementation**:
- Frontend stores key in `localStorage` under `klose_api_key`
- `api.js` attaches `X-API-Key` header to every request when a key exists
- Backend `ai_service.py` reads the header; if absent, returns mock/deterministic responses
- Settings page provides a UI for entering and clearing the key

---

## 3. SQLite Database

**Decision**: Single-file SQLite database (`klose.db`) with no migration framework.

**Rationale**:
- Zero-configuration deployment — no external database server required
- Ideal for demo/pitch scenarios where data persistence is secondary
- Schema is created via SQLAlchemy `create_all()` on startup
- Demo data is auto-seeded by `seed.py` when tables are empty

**Trade-offs**:
- Single-writer limitation (acceptable for single-user demo)
- No concurrent multi-process access
- Database reset is trivial: delete `klose.db` and restart

**Configuration**: WAL mode enabled for concurrent read access. Foreign key enforcement enabled via `PRAGMA foreign_keys = ON`.

---

## 4. No WebSocket (Polling-Based)

**Decision**: The application does not use WebSockets. All data freshness relies on page-level fetch-on-mount and manual refresh.

**Rationale**:
- Simplifies the backend architecture (no connection management, no pub/sub)
- Adequate for a single-user demo application
- Reduces deployment complexity (no sticky sessions, no WebSocket upgrade handling)

**Implication**: Dashboard data and activity feeds reflect the state at page load time. Users must navigate away and back, or refresh, to see updates.

---

## 5. Indian Market Focus

**Decision**: All domain terminology, currency, regulatory references, and data models are specific to the Indian luxury real estate market.

**Specifics**:
- **Currency**: Indian Rupees (INR), displayed as `₹`. Property values and deal sizes in Crores (1 Cr = ₹1,00,00,000).
- **RERA**: Real Estate Regulatory Authority compliance. Properties carry `rera_number` and `rera_verified` fields. RERA is mandatory for new construction in India.
- **Property portals**: 99acres, MagicBricks, Housing.com — the three dominant Indian real estate listing platforms.
- **Banks**: SBI, HDFC, ICICI, Axis Bank, Kotak Mahindra Bank — the five largest home loan providers in India.
- **EMI calculations**: Use Indian banking conventions (monthly reducing balance, floating rates).
- **Locations**: Seeded data uses real Indian cities and micro-markets (Bandra, Worli, Whitefield, Gurgaon, etc.).

---

## 6. Mock AI Fallback

**Decision**: Every AI-powered feature has a deterministic mock fallback that activates when no API key is provided.

**Affected features**:
| Feature | AI Behaviour | Mock Behaviour |
|---------|-------------|----------------|
| Lead scoring | Claude/OpenAI analysis of lead attributes | Heuristic score based on budget, source, engagement |
| Dashboard briefing | Natural language morning briefing | Template-based summary of today's tasks |
| Recommendations | AI-prioritised action items | Rule-based recommendations (overdue follow-ups, unassigned leads) |
| Property comparison | Multi-dimensional AI analysis | Tabular comparison of numeric fields |
| Negotiation coaching | Contextual AI chat responses | Pre-written coaching templates based on price gap |
| Counter-offer generation | AI strategy with market context | Formula-based midpoint counter with standard talking points |

**Rationale**: Demos must work reliably without external dependencies. Mock responses are clearly labelled in the API response (`"ai_powered": false`).

---

## 7. Tailwind CSS v4 with @theme

**Decision**: The frontend uses Tailwind CSS version 4 with the new `@theme` directive for custom design tokens, replacing the v3 `tailwind.config.js` approach.

**Implementation**:
```css
@import "tailwindcss";

@theme {
  --color-primary: #1a237e;
  --color-primary-light: #534bae;
  --color-secondary: #c8a951;
  --color-surface: #fafafa;
  --color-surface-dim: #f0f0f0;
  --radius-card: 1rem;
  --radius-button: 0.5rem;
}
```

**Rationale**: Tailwind v4 provides native CSS custom properties, better performance (no PostCSS plugin chain), and cleaner token management. The `@theme` directive is the idiomatic v4 way to define design tokens.

---

## 8. Material Design 3 Color Tokens

**Decision**: The UI follows Material Design 3 (Material You) colour semantics with a custom luxury palette.

**Token mapping**:
| MD3 Token | Klose Value | Usage |
|-----------|-------------|-------|
| Primary | `#1a237e` (Indigo 900) | Navigation, CTAs, headers |
| Secondary | `#c8a951` (Gold) | Accents, premium badges, highlights |
| Surface | `#fafafa` | Card backgrounds, page backgrounds |
| On-Surface | `#1a1a1a` | Body text |
| Error | `#b71c1c` | Validation errors, lost deals |
| Success | `#2e7d32` | Won deals, completed visits |

**Icon system**: Material Symbols Outlined (variable font), loaded via Google Fonts CDN. Used throughout the sidebar, cards, and action buttons.

---

## 9. 8-Stage Pipeline (Indian Real Estate Lifecycle)

**Decision**: The deal pipeline uses 8 stages that reflect the actual Indian real estate transaction lifecycle, rather than a generic sales funnel.

| Stage | Description | Typical Duration |
|-------|-------------|-----------------|
| `lead_capture` | Initial lead recorded from any source | 0-1 days |
| `qualification` | Budget, timeline, and preferences confirmed | 1-3 days |
| `site_visit` | Physical property visit completed | 3-7 days |
| `negotiation` | Price and terms discussion | 7-21 days |
| `booking` | Token/booking amount paid | 1-3 days |
| `agreement` | Sale agreement drafted and signed | 7-14 days |
| `loan_processing` | Bank loan application and disbursement | 30-60 days |
| `possession` | Keys handed over, registration complete | 1-7 days |

**Rationale**: Indian real estate transactions involve specific legal and financial steps (token booking, RERA-compliant agreements, bank loan processing) that differ from Western real estate or generic B2B sales pipelines.

**UI**: Implemented as a Kanban board with drag-and-drop (`@hello-pangea/dnd`). Deals can be dragged between any stages, though backward moves display a visual warning.

---

## 10. Responsive Layout: Mobile Bottom Nav + Desktop Sidebar

**Decision**: The application uses two distinct navigation patterns based on viewport width.

| Viewport | Navigation | Breakpoint |
|----------|-----------|------------|
| Desktop (>= 1024px) | Collapsible left sidebar with icons + labels | `lg:` Tailwind prefix |
| Mobile (< 1024px) | Fixed bottom navigation bar with 5 primary icons | Default |

**Rationale**: Real estate brokers frequently use the app on-the-go (at site visits, in meetings). The mobile bottom nav provides thumb-friendly access to the 5 most-used sections (Dashboard, Leads, Pipeline, Visits, More). The desktop sidebar exposes all 11 pages.

**Implementation**: Single `Layout` component conditionally renders sidebar or bottom nav based on a `useMediaQuery` hook or Tailwind responsive classes. Page content occupies the remaining viewport with appropriate padding.

---

## Summary Table

| Constraint | Category | Flexibility |
|-----------|----------|-------------|
| No authentication | Security | Add auth layer for production |
| BYOK AI keys | Integration | Could add server-side key management |
| SQLite | Data | Swap to PostgreSQL for production |
| No WebSocket | Architecture | Add for real-time collaboration |
| Indian market | Domain | Localisation layer for other markets |
| Mock AI fallback | Reliability | Always available, by design |
| Tailwind CSS v4 | Frontend | Locked to v4 @theme syntax |
| MD3 tokens | Design | Themeable via @theme overrides |
| 8-stage pipeline | Domain | Configurable stages for other markets |
| Responsive nav | UX | Fixed pattern, not configurable |
