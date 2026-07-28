# Architecture

## System Overview

The Recruitment Agency Autonomous Agents Platform is a full-stack application that automates the entire recruiting lifecycle — from company discovery to call booking — using AI agents powered by open-source LLMs.

```
┌─────────────────────────────────────────────────────────────────┐
│                        React Dashboard                          │
│                     (Vite + Tailwind CSS)                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │Dashboard │ │ Agents   │ │Companies │ │ Pipeline │ ...       │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘           │
│       └────────────┴────────────┴────────────┘                  │
│                         │ React Query                           │
└─────────────────────────┼───────────────────────────────────────┘
                          │ REST API (fetch)
┌─────────────────────────┼───────────────────────────────────────┐
│                    FastAPI Backend                               │
│  ┌──────────────────────┴──────────────────────┐                │
│  │              API Router (main.py)            │                │
│  │  /api/agents  /api/companies  /api/pipeline  │                │
│  └──────┬──────────────┬──────────────┬────────┘                │
│         │              │              │                          │
│  ┌──────▼──────┐ ┌─────▼─────┐ ┌─────▼─────┐                   │
│  │   Agents    │ │ Services  │ │  Storage   │                   │
│  │  (6 types)  │ │ (5 clients)│ │ (SQLAlchemy)│                 │
│  └──────┬──────┘ └─────┬─────┘ └─────┬─────┘                   │
│         │              │              │                          │
│  ┌──────▼──────────────▼──────────────▼──────┐                   │
│  │           SQLite + aiosqlite              │                   │
│  └──────────────────────────────────────────┘                   │
└──────────────────────────────────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
    ┌─────▼─────┐  ┌─────▼─────┐  ┌─────▼─────┐
    │ OpenRouter│  │  SendGrid  │  │   Apify    │
    │  (12 LLMs)│  │  (Email)   │  │ (Scraping) │
    └───────────┘  └───────────┘  └───────────┘
```

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18 + TypeScript | Dashboard UI |
| Styling | Tailwind CSS | Utility-first CSS framework |
| State | React Query | Server state management |
| Routing | React Router v6 | Client-side routing |
| Charts | Recharts | Data visualization |
| Icons | Lucide React | Icon library |
| Backend | FastAPI (Python 3.14) | Async REST API |
| ORM | SQLAlchemy 2.0 (async) | Database abstraction |
| Database | SQLite + aiosqlite | Embedded async database |
| Validation | Pydantic v2 | Data validation |
| Config | pydantic-settings + YAML | Hierarchical config |
| CLI | Click + Rich | Terminal interface |
| Scheduler | APScheduler | Background job scheduling |
| LLM | OpenRouter (OpenAI SDK) | Multi-model LLM access |
| Email | SendGrid API | Transactional email |
| Scraping | Apify | LinkedIn/Crunchbase data |
| Calendar | Cal.com | Meeting booking |
| CRM | HubSpot API | Contact/deal sync |

## Backend Architecture

### Package Structure

```
backend/
├── __init__.py           # Package init
├── config.py             # Pydantic settings + YAML loader
├── main.py               # FastAPI app + all API routes
├── scheduler.py          # APScheduler background jobs
├── seed.py               # Sample data seeder
├── agents/               # Autonomous agent implementations
│   ├── __init__.py       # Agent registry + factory
│   ├── base.py           # BaseAgent + AgentContext + AgentResult
│   ├── discovery.py      # Company discovery via scraping
│   ├── research.py       # Deep company research
│   ├── outreach.py       # Email outreach campaigns
│   ├── followup.py       # Multi-step follow-up sequences
│   ├── scheduler.py      # Call booking via Cal.com
│   └── pipeline.py       # Deal pipeline + CRM sync
├── services/             # External API integrations
│   ├── llm.py            # OpenRouter client with model fallback
│   ├── email.py          # SendGrid email service
│   ├── linkedin.py       # Apify LinkedIn/Crunchbase scraping
│   ├── calendar.py       # Cal.com calendar integration
│   └── crm.py            # HubSpot CRM integration
└── storage/              # Database layer
    ├── __init__.py        # Session management
    ├── database.py        # Async SQLAlchemy engine
    └── models.py          # 15 ORM models
```

### Agent Framework

All agents extend `BaseAgent` and implement the `run()` method:

```python
class BaseAgent(ABC):
    """Base class with lifecycle management."""

    async def execute(self, context: AgentContext) -> AgentResult:
        # 1. Create run record (RUNNING)
        # 2. Call self.run(context)
        # 3. Update run record (COMPLETED/FAILED)
        # 4. Update agent last_run_at

    @abstractmethod
    async def run(self, context: AgentContext) -> AgentResult:
        """Implement agent-specific logic."""
        pass
```

**Key patterns:**
- `log_step()` / `complete_step_log()` — track progress for live frontend updates
- `_save_run_progress()` — persist step log to DB during execution
- `LLMMixin` — adds `generate()` and `generate_structured()` for LLM-powered agents
- `AgentContext` — Pydantic model with agent config, run ID, mode, and input data
- `AgentResult` — Pydantic model with success status, metrics, output data, and step log

### Configuration System

Three-layer config resolution:

1. **`config.yaml`** — hierarchical defaults (agents, LLM, APIs, scheduler)
2. **`.env`** — environment-specific overrides (API keys, database URL)
3. **Environment variables** — highest priority, supports `${VAR}` interpolation

```python
# config.yaml
llm:
  model: "qwen/qwen3-coder:free"
  temperature: 0.7

# .env
OPENROUTER_API_KEY=sk-or-v1-...
DATABASE_URL=sqlite+aiosqlite:///./data/agency.db
```

### Database Schema (15 Tables)

```
agent_configs          — Agent configuration and persona
agent_runs             — Execution log per run
companies              — Discovered companies
contacts               — Decision makers found
outreach_campaigns     — Email campaign definitions
email_logs             — All sent email records
pipeline_deals         — Recruitment pipeline opportunities
deal_activities        — Activity log per deal
call_bookings          — Scheduled calls
unsubscribe_records    — Email compliance
analytics_snapshots    — Daily metrics rollup
```

**Key relationships:**
- AgentConfig → AgentRun (1:many)
- AgentConfig → Company (1:many)
- Company → Contact (1:many)
- Company → EmailLog (1:many)
- Company → PipelineDeal (1:many)
- PipelineDeal → DealActivity (1:many)
- Company → CallBooking (1:many)

### API Design

All endpoints return JSON. Key route groups:

| Prefix | Purpose |
|--------|---------|
| `/api/agents` | CRUD + run management |
| `/api/companies` | Company listing + details |
| `/api/contacts` | Contact listing |
| `/api/campaigns` | Campaign CRUD + launch |
| `/api/pipeline` | Deal pipeline + overview |
| `/api/analytics` | Metrics and reporting |
| `/api/webhooks` | SendGrid/Cal.com callbacks |

**Live progress tracking:**
- `POST /api/agents/{id}/run` — starts agent in background
- `GET /api/agents/{id}/runs/{run_id}` — returns `steps_log` from `output_data`
- Frontend polls this endpoint every 2s while agent is running

## Frontend Architecture

### Dashboard Structure

```
dashboard/src/
├── main.tsx              # App entry + React Router
├── App.tsx               # Layout wrapper
├── index.css             # Tailwind imports + custom styles
├── api/
│   └── client.ts         # Fetch wrapper (base URL, error handling)
├── hooks/
│   └── useApi.ts         # React Query hooks for all endpoints
├── types/
│   └── index.ts          # TypeScript interfaces (18 types)
├── components/
│   └── Layout.tsx        # Sidebar + header + notification bell
└── pages/
    ├── Dashboard.tsx     # Overview metrics + charts
    ├── Agents.tsx        # Agent list + create dialog
    ├── AgentDetail.tsx   # Agent config + live run progress
    ├── Companies.tsx     # Company list with filters
    ├── Contacts.tsx      # Contact list
    ├── Pipeline.tsx      # Kanban board (deal stages)
    ├── Campaigns.tsx     # Campaign list + metrics
    ├── Analytics.tsx     # Charts + metrics
    └── Settings.tsx      # Configuration page
```

### State Management

- **Server state**: React Query handles caching, refetching, and optimistic updates
- **UI state**: Local `useState` for modals, filters, selections
- **No global store**: Each page is self-contained with its own queries

### Routing

```
/                   → Dashboard overview
/agents             → Agent list
/agents/:id         → Agent detail (config + runs)
/companies          → Company list
/contacts           → Contact list
/pipeline           → Deal pipeline (Kanban)
/campaigns          → Campaign list
/analytics          → Metrics dashboard
/settings           → Configuration
```

## Data Flow

### Agent Execution Flow

```
1. User clicks "Run Agent" in dashboard
2. Frontend POST /api/agents/{id}/run { mode: "full" }
3. Backend creates AgentRun (status: RUNNING)
4. Backend instantiates agent class, calls execute()
5. Agent runs steps, calls log_step() + _save_run_progress()
6. Frontend polls GET /api/agents/{id}/runs/{run_id}
7. Steps appear in real-time on the dashboard
8. Agent completes, updates AgentRun (status: COMPLETED)
9. Frontend shows final results + output data
```

### Email Outreach Flow

```
1. Campaign created via API or CLI
2. OutreachAgent._run_campaign() called
3. For each target contact:
   a. Check unsubscribe list
   b. Check recent email history (14-day window)
   c. Generate personalized email via LLM
   d. Create EmailLog record (PENDING)
   e. Send via SendGrid (or dry run)
   f. Update EmailLog (SENT/FAILED)
4. Campaign metrics updated
```

### Pipeline Progression

```
discovered → researched → contacted → replied → call_booked
    → qualified → proposal_sent → closed_won / closed_lost
```

Each stage transition is:
- Triggered by agent activity (email sent, call booked, etc.)
- Logged in DealActivity
- Probability updated automatically
- Synced to HubSpot CRM (if enabled)

## Deployment

### Development

```bash
# Backend
uv sync
uv run python -m cli.main db-init
uv run python -m cli.main seed --confirm
uv run python -m cli.main serve --port 8000 --reload

# Frontend
cd dashboard && npm install && npm run dev
```

### Production

- Backend: Uvicorn behind Nginx/Caddy
- Frontend: `npm run build` → static files served by FastAPI
- Database: SQLite for small scale, swap to PostgreSQL for production
- Scheduler: Run as separate process via `cli.main schedule-start`
