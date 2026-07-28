# Video Lesson Planner

AI-powered YouTube video lesson planner with OpenRouter AI and YouTube Data API v3 integration.

## Features

- **AI Lesson Plan Generation** — Enter a title and prompt, get a complete structured lesson plan
- **Lesson Script Generation** — Click any lesson to generate a full, professional, educational video script (authored by you)
- **Script Regeneration** — Regenerate any script for fine-tuning if needed
- **Lesson Editor** — View, edit, and manage each lesson's content
- **YouTube Upload** — OAuth2 flow to connect your channel and upload videos
- **Analytics Dashboard** — Track views, likes, and comments for uploaded videos
- **Prompt History** — Every AI generation is stored with the full prompt and response

## Quick Start

### 1. Environment Setup

```bash
cp .env.example .env
# Edit .env with your OpenRouter API key and YouTube OAuth2 credentials
```

### 2. Backend

```bash
cd backend
uv run uvicorn backend.main:app --reload --port 8000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` and proxies API calls to the backend.

## YouTube Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project and enable YouTube Data API v3
3. Create OAuth2 credentials (Web Application)
4. Add `http://localhost:8000/api/youtube/callback` as authorized redirect URI
5. Copy Client ID and Secret to `.env`

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/plans` | Create empty plan |
| GET | `/api/plans` | List all plans |
| GET | `/api/plans/{id}` | Get plan with lessons |
| PUT | `/api/plans/{id}` | Update plan |
| DELETE | `/api/plans/{id}` | Delete plan |
| PUT | `/api/plans/{id}/lessons/{lid}` | Update lesson |
| POST | `/api/agent/generate` | AI generates lesson plan |
| POST | `/api/plans/{id}/lessons/{lid}/generate-script` | Generate/regenerate full lesson script |
| GET | `/api/youtube/auth-url` | Get YouTube OAuth URL |
| GET | `/api/youtube/callback` | YouTube OAuth callback |
| GET | `/api/youtube/status` | Check YouTube auth status |
| POST | `/api/youtube/upload` | Upload video |
| GET | `/api/youtube/analytics/{vid}` | Get video analytics |
| POST | `/api/youtube/refresh` | Refresh all analytics |

## Tech Stack

- **Backend**: Python FastAPI, SQLAlchemy, SQLite
- **Frontend**: React, Vite, TypeScript, Tailwind CSS v4
- **AI**: OpenRouter API (uses free models by default — `openrouter/free`)
- **YouTube**: Google API Python Client + OAuth2
