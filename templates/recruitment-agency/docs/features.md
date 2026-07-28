# Features

## Core Features

### 1. Autonomous Agent System

Six specialized AI agents that work together to automate the full recruiting lifecycle:

| Agent | Purpose | Trigger |
|-------|---------|---------|
| **Company Discovery** | Finds qualified companies via LinkedIn/Crunchbase scraping | Scheduled (weekly) or manual |
| **Company Research** | Deep research on companies, finds decision makers | After discovery or manual |
| **Outreach** | Sends personalized cold emails via SendGrid | Campaign launch or manual |
| **Follow-up** | Manages multi-step email sequences for non-responders | Scheduled (daily) or manual |
| **Scheduler** | Books discovery calls via Cal.com | After reply detected |
| **Pipeline** | Manages deal stages and HubSpot CRM sync | Scheduled or manual |

**Key capabilities:**
- Real-time progress tracking with step-by-step updates
- Dry-run mode for testing without sending emails
- Automatic error recovery and model fallback
- Configurable daily limits and delays between actions
- Full audit trail of every action taken

### 2. Multi-Model LLM with Automatic Fallback

Uses OpenRouter to access 12 free open-source models with automatic rotation:

```
Primary:    qwen/qwen3-coder:free
Fallback 1: nvidia/nemotron-3-ultra-550b-a55b:free
Fallback 2: nvidia/nemotron-3-super-120b-a12b:free
Fallback 3: meta-llama/llama-3.3-70b-instruct:free
... (12 models total)
```

**How it works:**
- Each LLM call starts with the current model
- If a call fails (rate limit, timeout, 500 error), automatically rotates to the next model
- No interruption to the agent's workflow
- Logs which model was used for each call
- Supports both text generation and structured JSON output

### 3. Personalized Email Outreach

AI-generated, personalized cold emails for each prospect:

- **Personalization inputs:** Company name, industry, tech stack, hiring needs, pain points, recent funding, contact name/title
- **Template system:** Configurable email templates with variable substitution
- **Tone options:** professional_peer, friendly, formal, casual
- **Compliance:** Built-in unsubscribe link, suppression list checking, bounce detection
- **Sequences:** Multi-step follow-up sequences (3-touch, 5-touch, custom)
- **Tracking:** Open, click, reply, and bounce tracking via SendGrid webhooks

**Email templates included:**
- Initial outreach (cold email)
- Follow-up 1: Value add (share relevant resource)
- Follow-up 2: Case study (social proof)
- Follow-up 3: Breakup (final attempt)
- Engaged follow-up (for opened but not replied)

### 4. Pipeline Management

Kanban-style deal pipeline with automatic stage progression:

```
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│Discovered│ │Researched│ │ Contacted│ │ Replied  │ │Call Bookd│ │Qualified │ │Proposal  │
│    (5%)  │ │   (15%)  │ │   (25%)  │ │   (40%)  │ │   (60%)  │ │   (75%)  │ │   (90%)  │
├──────────┤ ├──────────┤ ├──────────┤ ├──────────┤ ├──────────┤ ├──────────┤ ├──────────┤
│ Deal 1   │ │ Deal 3   │ │ Deal 5   │ │ Deal 7   │ │          │ │          │ │          │
│ Deal 2   │ │ Deal 4   │ │          │ │          │ │          │ │          │ │          │
└──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘
```

**Stage progression rules:**
- discovered → researched: Company enriched with data
- researched → contacted: Email sent to contact
- contacted → replied: Prospect replied to email
- replied → call_booked: Discovery call scheduled
- call_booked → qualified: Call completed
- qualified → proposal_sent: Proposal/quote sent
- proposal_sent → closed_won: Deal closed

**Additional features:**
- Deal value estimation based on company size and hiring needs
- Weighted pipeline value calculation
- Activity timeline per deal (emails, calls, stage changes)
- Win/loss tracking and conversion rates

### 5. CRM Integration (HubSpot)

Two-way sync with HubSpot CRM:

- **Contacts:** Create/update contacts with email, title, LinkedIn URL
- **Companies:** Create/update company records with industry, size, funding
- **Deals:** Create/update pipeline deals with stage, value, probability
- **Sync logic:** Only syncs records that have changed since last sync
- **Offline mode:** Works without HubSpot API key (local database only)

### 6. Calendar Booking (Cal.com)

Automated discovery call scheduling:

- Finds available time slots via Cal.com API
- Creates calendar events with meeting details
- Includes prospect context in event description
- Supports multiple calendar providers (Cal.com, Calendly)
- Mock mode for testing without API key

### 7. Background Scheduler

APScheduler-based job scheduling with 6 automated jobs:

| Job | Schedule | What it does |
|-----|----------|--------------|
| `discovery_run` | Weekly (Mon 8am) | Runs discovery for all active agents |
| `research_batch` | Daily (6am) | Researches companies needing enrichment |
| `followup_check` | Daily (9am) | Sends pending follow-up emails |
| `pipeline_sync` | Hourly | Syncs pipeline with HubSpot CRM |
| `email_bounce_check` | Daily (midnight) | Checks for bounced emails |
| `analytics_rollup` | Daily (11pm) | Generates daily analytics snapshots |

**Configuration in `config.yaml`:**
```yaml
scheduler:
  timezone: "UTC"
  jobs:
    - name: "discovery_run"
      trigger: "cron"
      hour: 8
      day_of_week: "mon"
      enabled: true
```

### 8. Analytics Dashboard

Real-time metrics and reporting:

**Email metrics:**
- Total emails sent / delivered / opened / clicked / replied / bounced
- Open rate, click rate, reply rate, bounce rate
- Trend over time (line chart)

**Pipeline metrics:**
- Deals created, pipeline value, weighted pipeline value
- Deals by stage (bar chart)
- Win rate, average deal cycle

**Agent metrics:**
- Companies discovered, contacts found
- Emails sent per agent
- Run history with duration and success rate

### 9. Agent Personas

Three pre-configured persona templates for different recruiting specialties:

#### SaaS Hunter
- **Industries:** SaaS, B2B Software, Cloud Infrastructure
- **Company size:** 10-500 employees
- **Hiring signals:** Engineering hiring, scaling teams, Series A-C
- **Tone:** Technical peer, focuses on engineering culture

#### FinTech Recruiter
- **Industries:** FinTech, Banking, Insurance, Payments
- **Company size:** 50-2000 employees
- **Hiring signals:** Compliance hiring, engineering at scale, regulated industries
- **Tone:** Professional, emphasizes compliance expertise

#### AI/ML Specialist
- **Industries:** AI/ML, Machine Learning, Data Science
- **Company size:** 10-1000 employees
- **Hiring signals:** Research engineer hiring, AI lab scaling
- **Tone:** Technical, focuses on research pedigree

### 10. Dashboard UI

React-based single-page application:

**Pages:**
- **Dashboard:** Overview with key metrics, charts, recent activity
- **Agents:** List all agents, create new, view status
- **Agent Detail:** Configuration, live run progress, step timeline, run history
- **Companies:** Searchable list with filters (stage, industry, size)
- **Contacts:** All contacts with engagement scores
- **Pipeline:** Kanban board with drag-and-drop deal management
- **Campaigns:** Campaign list with email metrics
- **Analytics:** Detailed charts and metrics
- **Settings:** Configuration page (UI only, not persisted yet)

**UI features:**
- Dark mode support (toggle in header)
- Responsive design (mobile-friendly sidebar)
- Real-time notifications (bell icon in header)
- Loading skeletons and spinners
- Error states with retry options

## CLI Commands

Full command-line interface for all operations:

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
uv run python -m cli.main serve --port 8000 --reload
uv run python -m cli.main dashboard

# Scheduler
uv run python -m cli.main schedule-start

# Development
uv run python -m cli.main config-show
uv run python -m cli.main seed --confirm
```

## External Integrations

### Required

| Service | Purpose | Free Tier |
|---------|---------|-----------|
| OpenRouter | LLM provider (12 free models) | Yes, unlimited |

### Optional

| Service | Purpose | Free Tier |
|---------|---------|-----------|
| Apify | LinkedIn/Crunchbase scraping | 1000 results/month |
| SendGrid | Email delivery | 100 emails/day |
| Cal.com | Calendar scheduling | 1 event type |
| HubSpot | CRM sync | Free CRM tier |

**All services have mock fallbacks** — the platform works fully offline for development and testing. When API keys are empty, agents use simulated data.

## Configuration

### Feature Flags

Enable/disable features in `config.yaml`:

```yaml
features:
  enable_ai_research: true
  enable_auto_outreach: true
  enable_auto_followup: true
  enable_auto_scheduling: true
  enable_crm_sync: true
  enable_analytics: true
  enable_ab_testing: true
  enable_multi_agent: true
  enable_human_review: false
  dry_run_mode: false  # Set true to test without sending emails
```

### Agent Configuration

Per-agent settings stored in database:

- **Discovery:** industries, company_size, hiring_signals, locations, funding_stages
- **Research:** depth (standard/deep), focus_areas, sources
- **Outreach:** tone, daily_limit, delay_seconds, templates_dir
- **Follow-up:** sequence_name (standard_3_touch, etc.)
- **Scheduler:** meeting_type, duration_minutes, calendar_provider

## Data Model

### Key Entities

```
AgentConfig ──┬── AgentRun (execution history)
              ├── Company (discovered companies)
              └── Campaign (outreach campaigns)

Company ──┬── Contact (decision makers)
          ├── EmailLog (sent emails)
          ├── PipelineDeal (opportunities)
          └── CallBooking (scheduled calls)

PipelineDeal ─── DealActivity (activity timeline)
```

### Sample Data (from seeder)

The `seed` command creates:
- 3 agent personas (SaaS Hunter, FinTech Recruiter, AI/ML Specialist)
- 8 real companies (Vercel, Supabase, Railway, Retool, Anthropic, Resend, PlanetScale, Neon)
- 9 contacts with real executive names and titles
- 3 outreach campaigns with realistic metrics
- 7 pipeline deals across all stages ($124K total value)

## Development Workflow

### Local Development

```bash
# Terminal 1: API server (hot reload)
uv run python -m cli.main serve --port 8000 --reload

# Terminal 2: Dashboard (hot reload)
cd dashboard && npm run dev

# Terminal 3: Background scheduler (optional)
uv run python -m cli.main schedule-start
```

### Testing

```bash
# Run all tests
uv run pytest -v --tb=short

# Run specific test file
uv run pytest tests/test_models.py -v

# Run with coverage
uv run pytest --cov=backend --cov-report=term-missing
```

### CI/CD

```bash
# Run full CI sequence
./scripts/ci.sh

# Run specific checks
./scripts/ci.sh --only pytest
./scripts/ci.sh --skip ruff-format

# Dry run (print commands without executing)
./scripts/ci.sh --dry-run
```

**CI checks (5 gates):**
1. `ruff format --check` — code formatting
2. `ruff check` — linting
3. `ty check` — type checking
4. `pytest` — unit tests
5. Suppression grep — ensures no `# type: ignore` comments
