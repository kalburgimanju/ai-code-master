# Architecture

## System Overview

FaceFlow is a Next.js 15 application that automates faceless YouTube channel management. It uses a modular architecture with clear separation between frontend, API routes, and core pipeline logic.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                   │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────┐  │
│  │  Pages   │ │Components│ │  Data   │ │    Types    │  │
│  └─────────┘ └─────────┘ └─────────┘ └─────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                   API ROUTES (Next.js)                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ channels │ │ scripts  │ │  ideas   │ │ pipeline │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐               │
│  │ youtube  │ │  upload  │ │ daily    │               │
│  └──────────┘ └──────────┘ └──────────┘               │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                   CORE LIBRARIES                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │   ai     │ │voiceover │ │  video   │ │thumbnail │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ youtube  │ │ trends   │ │pipeline  │ │ cost     │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│  ┌──────────┐ ┌──────────┐                             │
│  │   db     │ │storage   │                             │
│  └──────────┘ └──────────┘                             │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                 EXTERNAL SERVICES                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │OpenRouter│ │Pollinations│ │ YouTube │ │ Vercel   │  │
│  │  (AI)    │ │  (Images) │ │  API    │ │ KV/Blob  │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Directory Structure

```
ytfaceless/
├── docs/                          # Documentation
│   ├── README.md                  # Project overview
│   ├── ARCHITECTURE.md            # This file
│   ├── API.md                     # API reference
│   └── DEPLOYMENT.md             # Deployment guide
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── api/                   # API routes
│   │   │   ├── channels/          # Channel CRUD
│   │   │   ├── daily-upload/      # Cron endpoint
│   │   │   ├── ideas/             # Trending ideas
│   │   │   ├── pipeline/          # Pipeline status
│   │   │   ├── scripts/           # Script generation
│   │   │   └── youtube/           # OAuth flow
│   │   ├── analytics/             # Analytics dashboard
│   │   ├── channels/              # Channel management
│   │   ├── ideas/                 # Video ideas
│   │   ├── login/                 # User login
│   │   ├── pipeline/              # Pipeline monitor
│   │   ├── pricing/               # Pricing plans
│   │   ├── scripts/               # Script generator
│   │   ├── seo/                   # SEO tools
│   │   ├── signup/                # User registration
│   │   ├── layout.tsx             # Root layout
│   │   ├── page.tsx               # Landing page
│   │   └── globals.css            # Global styles
│   ├── components/                # React components
│   │   ├── ChannelCard.tsx        # Channel display
│   │   ├── Footer.tsx             # Site footer
│   │   ├── Navbar.tsx             # Navigation
│   │   ├── PipelineStatus.tsx     # Pipeline progress
│   │   ├── TrendingIdeasList.tsx  # Ideas list
│   │   └── VideoHistoryTable.tsx  # Video history
│   ├── data/                      # Mock data
│   │   └── content.ts             # Sample content
│   ├── lib/                       # Core libraries
│   │   ├── ai.ts                  # OpenRouter integration
│   │   ├── cost-tracker.ts        # Cost tracking
│   │   ├── db.ts                  # Database abstraction
│   │   ├── pipeline.ts            # Pipeline orchestrator
│   │   ├── storage.ts             # File storage
│   │   ├── thumbnail.ts           # Image generation
│   │   ├── trends.ts              # Topic discovery
│   │   ├── video.ts               # Video generation
│   │   ├── voiceover.ts           # Text-to-speech
│   │   └── youtube.ts             # YouTube API
│   └── types/                     # TypeScript types
│       └── index.ts               # Shared interfaces
├── vercel.json                    # Vercel config
├── package.json                   # Dependencies
└── .env.example                   # Environment template
```

## Core Modules

### 1. AI Module (`src/lib/ai.ts`)

**Purpose:** Generate YouTube scripts using free AI models

**Implementation:**
- Uses OpenRouter API with free models
- Fallback chain: Nemotron 3 Ultra → Nemotron 3 Super → Gemma 4 → GPT-OSS
- Returns structured JSON with title, hook, sections, CTA, tags, SEO metadata

**Key Functions:**
- `generateScript(topic, niche, duration)` — Main generation function
- `tryGenerateScript(model, ...)` — Single model attempt
- `getFreeModels()` — List available free models

### 2. Thumbnail Module (`src/lib/thumbnail.ts`)

**Purpose:** Generate YouTube thumbnails

**Implementation:**
- Uses Pollinations.ai (free, no API key required)
- Generates prompts based on niche and title
- Downloads and stores via storage module

**Key Functions:**
- `generateThumbnail(title, niche)` — Generate and store thumbnail
- `generateThumbnailPrompt(title, niche)` — Create style-appropriate prompt

### 3. Video Module (`src/lib/video.ts`)

**Purpose:** Create video content from scripts

**Implementation:**
- Generates HTML/CSS interactive presentations
- Supports multiple styles: cinematic, documentary, educational
- Includes auto-advance and keyboard navigation
- Exports SVG frames for video editors

**Key Functions:**
- `generateVideo(request)` — Create HTML video
- `generateVideoHTML(script, style)` — Build interactive HTML
- `generateSVGFrame(heading, content, index)` — Create static frame

### 4. Voiceover Module (`src/lib/voiceover.ts`)

**Purpose:** Generate voiceover scripts and SSML

**Implementation:**
- Creates formatted script files for manual recording
- Exports SSML for TTS engines
- Provides free TTS options list

**Key Functions:**
- `generateVoiceover(text)` — Create script file
- `generateSSML(text)` — Export as SSML
- `getFreeTTSOptions()` — List free TTS services

### 5. YouTube Module (`src/lib/youtube.ts`)

**Purpose:** Handle YouTube API integration

**Implementation:**
- OAuth2 authentication flow
- Video upload with metadata
- Thumbnail upload
- Channel info retrieval
- Automatic token refresh

**Key Functions:**
- `getYouTubeAuthUrl()` — Generate OAuth URL
- `exchangeCodeForTokens(code)` — Exchange auth code
- `uploadToYouTube(params)` — Upload video
- `getChannelInfo(accessToken)` — Get channel details

### 6. Trends Module (`src/lib/trends.ts`)

**Purpose:** Discover trending topics

**Implementation:**
- Fetches from Google Trends RSS (with fallback)
- Generates realistic trending topics per niche
- Scores topics by trend score and competition
- Stores discovered ideas in database

**Key Functions:**
- `discoverTrendingTopics(niches)` — Find trending topics
- `selectBestTopic(topics)` — Pick optimal topic
- `getFallbackTopics(niche)` — Generate mock data

### 7. Pipeline Module (`src/lib/pipeline.ts`)

**Purpose:** Orchestrate the full content pipeline

**Implementation:**
- 9-step pipeline with retry logic
- Status tracking for each step
- Error handling and recovery
- Cost tracking per video

**Pipeline Stages:**
1. `trending_fetched` — Discover trending topics
2. `idea_selected` — Pick best topic
3. `script_generated` — Generate AI script
4. `voiceover_generated` — Create voiceover
5. `video_generated` — Generate video
6. `thumbnail_generated` — Create thumbnail
7. `combined` — Merge assets
8. `uploaded` — Upload to YouTube

**Key Functions:**
- `runDailyPipeline(channelId)` — Execute full pipeline
- `getPipelineStatus(videoId)` — Check progress
- `retryWithBackoff(fn)` — Retry failed steps

### 8. Database Module (`src/lib/db.ts`)

**Purpose:** Data persistence abstraction

**Implementation:**
- In-memory store for development
- Ready for Vercel KV integration
- CRUD for channels, videos, ideas

**Key Functions:**
- `getChannel(id)` / `getAllChannels()` / `createChannel()`
- `getVideo(id)` / `getVideosByChannel()` / `updateVideo()`
- `getIdea(id)` / `getIdeas()` / `createIdea()`

### 9. Storage Module (`src/lib/storage.ts`)

**Purpose:** File upload and retrieval

**Implementation:**
- In-memory storage for development
- Ready for Vercel Blob integration
- Handles buffer and URL uploads

**Key Functions:**
- `uploadBuffer(buffer, filename, contentType)` — Store buffer
- `uploadFromUrl(url, filename)` — Download and store
- `getBuffer(url)` — Retrieve stored file

### 10. Cost Tracker (`src/lib/cost-tracker.ts`)

**Purpose:** Track API usage costs

**Implementation:**
- Logs all API calls with costs
- All current services are free ($0)
- Provides cost breakdown by service

**Key Functions:**
- `trackCost(service, amount, description)` — Log cost
- `getTotalCost()` — Sum all costs
- `getCostsByService()` — Breakdown by service
- `getFreeTierLimits()` — Show free tier info

## Data Flow

### Script Generation Flow

```
User Input (topic, niche)
    │
    ▼
POST /api/scripts/generate
    │
    ▼
generateScript() [ai.ts]
    │
    ▼
OpenRouter API (free models)
    │
    ▼
Structured JSON Response
    │
    ▼
Display on /scripts page
```

### Daily Pipeline Flow

```
Vercel Cron (noon UTC)
    │
    ▼
GET /api/daily-upload
    │
    ▼
runDailyPipeline() [pipeline.ts]
    │
    ├──▶ discoverTrendingTopics() [trends.ts]
    │        │
    │        ▼
    │    selectBestTopic()
    │
    ├──▶ generateScript() [ai.ts]
    │        │
    │        ▼
    │    OpenRouter API
    │
    ├──▶ generateVoiceover() [voiceover.ts]
    │        │
    │        ▼
    │    Script file / SSML
    │
    ├──▶ generateVideo() [video.ts]
    │        │
    │        ▼
    │    HTML presentation
    │
    ├──▶ generateThumbnail() [thumbnail.ts]
    │        │
    │        ▼
    │    Pollinations.ai
    │
    ├──▶ uploadToYouTube() [youtube.ts]
    │        │
    │        ▼
    │    YouTube Data API v3
    │
    └──▶ updateDatabase() [db.ts]
             │
             ▼
         Mark complete
```

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/daily-upload` | GET | Cron endpoint for daily pipeline |
| `/api/scripts/generate` | POST | Generate script on-demand |
| `/api/channels` | GET/POST | List/create channels |
| `/api/channels/[id]` | GET/PUT/DELETE | Manage individual channel |
| `/api/youtube/auth` | GET | Initiate OAuth flow |
| `/api/youtube/callback` | GET | Handle OAuth callback |
| `/api/pipeline/status` | GET | Check pipeline progress |
| `/api/ideas` | GET/POST | List/discover ideas |

## External APIs

### OpenRouter (Free Tier)

- **Purpose:** Script generation
- **Models:** Nemotron 3 Ultra, Nemotron 3 Super, Gemma 4, GPT-OSS
- **Cost:** $0 (free models)
- **Limits:** Rate-limited, not guaranteed availability

### Pollinations.ai

- **Purpose:** Thumbnail generation
- **Cost:** $0 (free)
- **Limits:** None stated

### YouTube Data API v3

- **Purpose:** Video upload and channel management
- **Cost:** $0 (10,000 units/day free)
- **Auth:** OAuth2 with refresh tokens

### Vercel Services

- **Blob:** File storage (500MB free)
- **KV:** Database (30,000 commands/day free)
- **Cron:** Scheduled tasks (included in plan)

## Deployment Architecture

```
GitHub Repository
    │
    ▼
Vercel (Auto-deploy on push)
    │
    ├──▶ Build (Next.js)
    │
    ├──▶ Serverless Functions
    │    ├── /api/daily-upload
    │    ├── /api/scripts/generate
    │    └── ...
    │
    ├──▶ Static Pages
    │    ├── /
    │    ├── /login
    │    └── ...
    │
    └──▶ Cron Job
         └── /api/daily-upload (noon UTC)
```

## Security Considerations

- API keys stored in Vercel environment variables (encrypted at rest)
- OAuth tokens encrypted in database
- CRON_SECRET required for cron endpoints
- No sensitive data in client-side code
- HTTPS enforced on all endpoints

## Future Enhancements

1. **Real Auth:** Integrate NextAuth or Clerk for user management
2. **Database:** Migrate from in-memory to Vercel KV/PostgreSQL
3. **Video Generation:** Add Runway/Pika integration for real AI video
4. **Voiceover:** Add ElevenLabs integration for AI voice
5. **Analytics:** Connect to YouTube Analytics API for real data
6. **Multi-tenant:** Support multiple users with channel isolation
7. **Webhooks:** Add Discord/Slack notifications on pipeline events
8. **Queue:** Add job queue for long-running tasks (Inngest/Trigger.dev)
