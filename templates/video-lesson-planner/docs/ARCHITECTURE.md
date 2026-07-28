# Video Lesson Planner — Architecture

An AI-powered YouTube video lesson planner. Enter a topic, get a structured
lesson plan, generate a full recording script and slide deck, then upload the
finished video to YouTube and track its analytics — all stored in one place.

---

## Tech Stack

| Layer     | Technology                                              |
|-----------|---------------------------------------------------------|
| Backend   | Python 3.14, FastAPI, SQLAlchemy 2.0, SQLite            |
| AI        | OpenRouter API (free models: `openrouter/free`, etc.)   |
| PPT       | `python-pptx` (server-side deck generation)             |
| YouTube   | Google API Python Client + OAuth2 (PKCE)                |
| Frontend  | React 19, Vite, TypeScript, Tailwind CSS v4, Wouter     |

---

## High-Level Flow

```
User types topic + prompt
        │
        ▼
POST /api/agent/generate ──► OpenRouter (plan) ──► LessonPlan + Lessons  (SQLite)
        │
        ▼  (per lesson, on demand)
POST /api/plans/{id}/lessons/{lid}/generate-script
        ├─► OpenRouter (script)        ──► full_script + script_author
        ├─► OpenRouter (image, best-eff.) ──► script_image (base64)
        └─► OpenRouter (metadata)      ──► YouTube title + description
POST /api/plans/{id}/lessons/{lid}/generate-ppt
        └─► OpenRouter (outline) ──► python-pptx ──► data/ppt/{lid}.pptx
        │
        ▼
Upload: POST /api/youtube/upload (file or in-browser recording) ──► YouTube
        │
        ▼
Analytics: GET /api/youtube/analytics/{vid} ──► view/like/comment counts
```

---

## Backend Layout

```
backend/
├── main.py              # FastAPI app, CORS, router includes, startup init_db()
├── config.py            # Settings from env (.env), auto-finds env file up the tree
├── database.py          # Engine, session, Base; init_db() + SQLite column migrations
├── models.py            # SQLAlchemy ORM: LessonPlan, Lesson, YouTubeVideo, PromptHistory
├── schemas.py           # Pydantic request/response models
├── routers/
│   ├── plans.py         # Plan + lesson CRUD, get_lesson, generate-script,
│   │                     #   generate-metadata, generate-ppt, ppt download
│   ├── agent.py         # POST /api/agent/generate (full plan from prompt)
│   └── youtube.py       # OAuth auth-url, callback, status, upload, analytics
└── services/
    ├── openrouter.py    # All OpenRouter calls: plan, script, image, metadata, ppt outline
    ├── youtube.py       # YouTube OAuth + upload + analytics (google-api-python-client);
    │                     #   also exposes get_drive_service() reusing the same token
    ├── drive.py         # Google Drive upload: script -> Google Doc, PPT -> .pptx
    └── ppt.py           # python-pptx builder (welcome + content + thank-you slides)
```

### Data Model

- **LessonPlan** — `id`, `title`, `prompt`, `status`, `ai_model`, timestamps. Has many `Lesson`s and `PromptHistory`.
- **Lesson** — `plan_id` FK, `lesson_number`, `title`, `description`, `key_points`, `talking_points`, `script_outline`, `full_script`, `script_author`, `script_image` (base64), `image_prompt`, `ppt_path`, `resources` (JSON), `duration_minutes`, `status`. Has one `YouTubeVideo`.
- **YouTubeVideo** — `lesson_id` FK, `youtube_video_id`, `title`, `description`, `tags`, stats (`view_count`, `like_count`, `comment_count`), `upload_date`, `last_fetched_at`.
- **PromptHistory** — `plan_id` FK, `raw_prompt`, `ai_response` (JSON), `model_used`, `tokens_used`.

### Key Design Notes

- **Migrations are automatic.** `init_db()` creates tables then runs `_migrate_columns()` which `ALTER TABLE`s in any new columns (`full_script`, `script_author`, `script_image`, `image_prompt`, `ppt_path`). Existing SQLite DBs are upgraded in place — no manual migration step.
- **Free models by default.** `OPENROUTER_MODEL` defaults to `openrouter/free`. Image generation uses Gemini image models (requires an OpenRouter key with image access).
- **Image generation is best-effort.** If the image model is unavailable (e.g. key lacks access), the script still saves and `image_prompt` records why — the flow never blocks on image failure.
- **YouTube PKCE is handled.** `get_auth_url()` persists the `code_verifier` to `data/youtube_verifier.json`; `complete_auth()` restores it before `fetch_token`. This fixes the `invalid_grant: Missing code verifier` error that occurs when a fresh flow object is used at callback time.
- **Robust JSON parsing.** `_extract_json()` in `openrouter.py` strips code fences, extracts the first `{...}` block, and falls back to wrapping raw text — so free models that return malformed JSON don't crash generation.

---

## Frontend Layout

```
frontend/src/
├── App.tsx             # Wouter routes: /, /create, /plan/:id, /upload/:lessonId, /analytics
├── main.tsx            # React entry
├── index.css           # Tailwind v4 + dark theme tokens
├── components/
│   ├── Layout.tsx      # Fixed header nav, gradient logo
│   ├── LessonCard.tsx  # Lesson summary; Generate/Regenerate Script button
│   ├── PromptInput.tsx # Title + prompt + num_lessons form
│   └── VideoUploader.tsx # File vs Record toggle, generate metadata, upload
├── pages/
│   ├── Dashboard.tsx   # All plans, delete
│   ├── CreatePlan.tsx  # Prompt form → generates plan
│   ├── PlanDetail.tsx  # Lessons, inline edit, View Script (with image), Generate PPT
│   ├── UploadVideo.tsx # YouTube connect + VideoUploader
│   └── Analytics.tsx   # Aggregate views/likes + per-video stats
└── lib/
    ├── api.ts          # Fetch-based client for every endpoint
    └── types.ts        # TypeScript interfaces matching backend schemas
```

### Frontend Conventions

- **No state library.** Local `useState` + fetch; API responses reconcile into component state.
- **Proxy.** Vite proxies `/api` → `http://localhost:8000` in dev (`vite.config.ts`).
- **Dark theme** uses CSS variables defined in `index.css`, consumed via Tailwind utility classes.

---

## Environment Variables (`.env`)

| Variable                  | Purpose                                         |
|---------------------------|-------------------------------------------------|
| `OPENROUTER_API_KEY`      | OpenRouter auth (required for AI features)      |
| `OPENROUTER_MODEL`        | Default model (`openrouter/free`)               |
| `OPENROUTER_API_URL`      | OpenRouter base URL                             |
| `YOUTUBE_CLIENT_ID`       | Google OAuth client id                          |
| `YOUTUBE_CLIENT_SECRET`   | Google OAuth client secret                      |
| `YOUTUBE_REDIRECT_URI`    | Must equal `http://localhost:8000/api/youtube/callback` |
| `GOOGLE_DRIVE_SCRIPT_FOLDER_ID` | Drive folder for uploaded script Google Docs (reuses YouTube token) |
| `GOOGLE_DRIVE_PPT_FOLDER_ID`    | Drive folder for uploaded PPT `.pptx` files (reuses YouTube token) |
| `DATABASE_URL`            | SQLite path (default `sqlite:///./data/lesson_planner.db`) |
| `FRONTEND_URL`            | CORS allow-origin for the dev frontend          |

---

## Running Locally

```bash
# Backend
uv run uvicorn backend.main:app --reload --port 8000

# Frontend (separate terminal)
cd frontend && npm install && npm run dev   # http://localhost:5173
```

Generate a plan at `/create`, open it, click **Generate Script** on a lesson,
then **Generate PPT** / **Generate Title & Description**, and **Upload Video**.
