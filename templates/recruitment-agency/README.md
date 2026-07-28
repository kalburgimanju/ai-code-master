# Recruitment Agency Autonomous Agents Platform

An AI-powered recruitment agency platform with autonomous agents for full-cycle recruiting — from company discovery to call booking.

## Architecture

```
recruitment-agency/
├── backend/                  # Python backend (FastAPI + SQLAlchemy)
│   ├── agents/              # Autonomous agent implementations
│   │   ├── base.py          # Base agent framework with lifecycle management
│   │   ├── discovery.py     # Company discovery via LinkedIn/Crunchbase
│   │   ├── research.py      # Deep company research & contact finding
│   │   ├── outreach.py      # Personalized email outreach
│   │   ├── followup.py      # Multi-step follow-up sequences
│   │   ├── scheduler.py     # Call booking via Cal.com
│   │   └── pipeline.py      # Deal pipeline & CRM sync
│   ├── services/            # External API integrations
│   │   ├── llm.py           # OpenRouter LLM client with multi-model fallback
│   │   ├── email.py         # SendGrid email service
│   │   ├── linkedin.py      # Apify LinkedIn/Crunchbase scraping
│   │   ├── calendar.py      # Cal.com calendar integration
│   │   └── crm.py           # HubSpot CRM integration
│   ├── storage/             # Database layer
│   │   ├── database.py      # Async SQLAlchemy session management
│   │   └── models.py        # ORM models (15 tables)
│   ├── config.py            # Pydantic settings with YAML + env vars
│   ├── main.py              # FastAPI application
│   ├── scheduler.py         # Background job scheduler (APScheduler)
│   └── seed.py              # Sample data seeder
├── cli/main.py              # CLI entry point (Click)
├── dashboard/               # React dashboard (Vite + Tailwind)
│   └── src/
│       ├── pages/           # Dashboard, Agents, Companies, etc.
│       ├── api/             # API client layer
│       ├── hooks/           # React Query hooks
│       └── types/           # TypeScript type definitions
├── tests/                   # Test suite
├── scripts/                 # CI scripts
├── config.yaml              # Main configuration
└── pyproject.toml           # Python project configuration
```

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+ (for dashboard)
- [uv](https://github.com/astral-sh/uv) package manager

### 1. Install dependencies

```bash
cd templates/recruitment-agency
uv sync
cd dashboard && npm install && cd ..
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your API keys (OPENROUTER_API_KEY is required)
```

### 3. Initialize the database

```bash
uv run python -m cli.main db-init
```

### 4. Seed sample data (optional)

```bash
uv run python -m cli.main seed --confirm
```

This creates 3 agents, 8 companies, 9 contacts, 3 campaigns, and 7 pipeline deals.

### 5. Start the API server

```bash
uv run python -m cli.main serve --port 8000 --reload
```

### 6. Start the dashboard

```bash
cd dashboard && npm run dev
```

Open http://localhost:5173 in your browser.

## CLI Commands

```bash
# Agent management
uv run python -m cli.main agent-create --name "My Agent" --type discovery --persona saas_hunter
uv run python -m cli.main agent-run --name "My Agent" --mode full --dry-run
uv run python -m cli.main agent-list

# Campaign management
uv run python -m cli.main campaign-create --name "Q1 Outreach" --agent "My Agent"
uv run python -m cli.main campaign-launch --name "Q1 Outreach" --dry-run

# Database
uv run python -m cli.main db-init
uv run python -m cli.main db-migrate

# Server
uv run python -m cli.main serve --port 8000
uv run python -m cli.main dashboard

# Scheduler
uv run python -m cli.main schedule-start

# Development
uv run python -m cli.main config-show
uv run python -m cli.main seed --confirm
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/agents` | GET/POST | List/create agents |
| `/api/agents/{id}` | GET | Get agent details |
| `/api/agents/{id}/run` | POST | Run an agent |
| `/api/agents/{id}/runs` | GET | Get run history |
| `/api/agents/{id}/runs/{run_id}` | GET | Get run detail with step log |
| `/api/companies` | GET | List companies (filterable) |
| `/api/companies/{id}` | GET | Get company with contacts |
| `/api/contacts` | GET | List contacts |
| `/api/campaigns` | GET/POST | List/create campaigns |
| `/api/campaigns/{id}/launch` | POST | Launch a campaign |
| `/api/pipeline` | GET | Pipeline overview |
| `/api/pipeline/deals` | GET | List deals |
| `/api/analytics/overview` | GET | Analytics overview |

## Agent Types

1. **Company Discovery** — Finds qualified companies via LinkedIn/Crunchbase scraping
2. **Company Research** — Deep research on companies, finds decision makers
3. **Outreach** — Sends personalized cold emails via SendGrid
4. **Follow-up** — Manages multi-step email sequences
5. **Scheduler** — Books discovery calls via Cal.com
6. **Pipeline** — Manages deal stages and CRM sync

## Agent Personas

- **SaaS Hunter** — Targets Series A-C SaaS companies hiring engineers
- **FinTech Recruiter** — Targets FinTech companies needing compliant talent
- **AI/ML Specialist** — Targets AI/ML companies hiring research engineers

## External Integrations

| Service | Purpose | Required |
|---------|---------|----------|
| OpenRouter | LLM provider (free models) | Yes |
| Apify | LinkedIn/Crunchbase scraping | Optional |
| SendGrid | Email delivery | Optional |
| Cal.com | Calendar scheduling | Optional |
| HubSpot | CRM sync | Optional |

## Development

```bash
# Run CI checks
./scripts/ci.sh

# Run specific checks
./scripts/ci.sh --only pytest
./scripts/ci.sh --skip ruff-format

# Run tests
uv run pytest -v --tb=short

# Lint and format
uv run ruff format .
uv run ruff check --fix .
```

## License

MIT
