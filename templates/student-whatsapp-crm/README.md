# Student WhatsApp CRM

A SaaS platform combining **Student CRM + WhatsApp Automation + AI Assistant + Analytics** for
education-coaching businesses. Import students, segment by interest, send personalized WhatsApp
campaigns, automate follow-ups with a visual workflow builder, track opens/replies/enrollments, and
let your counseling team collaborate in a shared inbox.

> Built with **Node.js + NestJS** (backend) and **React + Vite + Tailwind** (dashboard) — matching the
> stack recommended in the product plan. Runs end-to-end with **zero credentials** using mock adapters.

## Features

| Module | What it does |
| --- | --- |
| **Student CRM** | Store name, phone, email, city, course, status, lead source. CRUD + filters. |
| **Contact Import** | Bulk import via CSV / Excel (XLSX). Google Sheets adapter scaffolded. |
| **Campaign Builder** | Broadcast personalized messages with `{name}`/`{course}`/`{city}` tokens. |
| **Workflow Builder** | Visual (react-flow) automation: trigger → send → wait → condition → branch → assign. |
| **AI WhatsApp Agent** | Answers FAQs (fees, duration, curriculum, timings, placements). Mock + OpenAI. |
| **Team Inbox** | Counselors view threads, reply manually, and trigger AI auto-replies. |
| **Analytics** | Messages sent, delivery rate, response rate, enrollment, revenue. |
| **Lead Scoring** | open +5, click +10, reply +20, webinar +30; auto-assign counselor by city. |
| **Payments** | Razorpay / Stripe stubs (mock by default). |

## Architecture

```
dashboard/ (React + Vite)  ──/api proxy──▶  backend/ (NestJS)
                                          ├─ Students / Campaigns / Workflows
                                          ├─ Conversations / Team / Scoring
                                          ├─ Analytics / Payments
                                          └─ common/providers  (WhatsApp · AI · Payment — mock + real)
                                                  │
                                          Queue (in-memory or BullMQ+Redis)
                                                  │
                                          Database (SQLite locally · Postgres via DATABASE_URL)
```

**Provider adapters** are selected by env vars and fall back to mocks:
- `WHATSAPP_PROVIDER` → `mock` (default) | `cloud` | `twilio` | `interakt`
- `AI_PROVIDER` → `mock` (default) | `openai`
- `PAYMENT_PROVIDER` → `mock` (default) | `razorpay` | `stripe`

**Queue**: in-memory fallback when `REDIS_URL` is unset; BullMQ + Redis when set.

## Quick Start

```bash
cd templates/student-whatsapp-crm

# 1. Install (root installs concurrently; both apps install their deps)
npm install
npm run install:all

# 2. Configure — copy the defaults (mock adapters, no creds needed)
cp .env.example .env
#    backend reads .env automatically. The dashboard proxies /api → :4000.

# 3. Seed example data (Rahul, Priya, counselors, campaign, workflow, payment)
npm run seed

# 4. Run backend (:4000) + dashboard (:5173) together
npm run dev

# 5. Open http://localhost:5173
```

## API (backend on `:4000`, prefix `/api`)

- `GET/POST /students` · `POST /students/import` (CSV) · `POST /students/import/xlsx`
- `GET/POST /campaigns` · `POST /campaigns/:id/send` · `GET /campaigns/:id/messages`
- `GET/POST/PUT /workflows` · `POST /workflows/:id/run`
- `GET /conversations` · `GET/POST /conversations/:id/messages` · `POST /conversations/:id/ai-reply`
- `GET/POST /team`
- `GET /scoring/:studentId` · `POST /scoring/:studentId/event` · `POST /scoring/:studentId/assign`
- `GET /analytics/overview` · `GET /analytics/messages`
- `POST /payments` · `GET /payments` · `GET /payments/:id`

## Tests

```bash
npm run test        # unit tests: lead scoring, auto-assignment, workflow engine
npm run test:e2e    # import + campaign send through the mock provider
```

## Production notes

- Set `DATABASE_URL=postgres://…` for Postgres (TypeORM `synchronize` creates tables on boot).
- Set `REDIS_URL=redis://…` to use BullMQ instead of the in-memory queue.
- Set the real provider env vars to activate WhatsApp Cloud / Twilio / Interakt, OpenAI, Razorpay / Stripe.
- The recommended deployment is Docker + AWS ECS / S3 / CloudFront (per the original plan).
