# FaceFlow — AI-Powered Faceless YouTube Channel Automation

A complete platform for creating, growing, and monetizing faceless YouTube channels using free AI models. The system automates the entire content pipeline from trending topic discovery to YouTube upload.

## What It Does

- **Discovers trending topics** across niches (Tech, Psychology, Finance, etc.)
- **Generates scripts** using free AI models via OpenRouter
- **Creates thumbnails** using Pollinations.ai (free)
- **Produces videos** using HTML/CSS interactive presentations
- **Uploads to YouTube** automatically via YouTube Data API v3
- **Tracks analytics** and costs in real-time

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| AI Models | OpenRouter free tier |
| Image Gen | Pollinations.ai |
| Video | HTML/CSS interactive |
| Hosting | Vercel (serverless) |
| Storage | Vercel Blob |
| Database | Vercel KV |

## Live Demo

https://ytfaceless.vercel.app

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with features and testimonials |
| `/login` | User login |
| `/signup` | User registration |
| `/ideas` | Browse and discover trending video ideas |
| `/scripts` | Generate AI scripts on-demand |
| `/seo` | SEO keyword research and optimization |
| `/analytics` | Channel analytics dashboard |
| `/pricing` | Subscription plans |
| `/channels` | Manage connected YouTube channels |
| `/pipeline` | Real-time pipeline monitoring |

## Quick Start

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local` and add your API keys
4. Run the dev server: `npm run dev`
5. Open http://localhost:3001

## Environment Variables

```bash
# Required: OpenRouter (free AI models)
OPENROUTER_API_KEY=sk-or-...

# Required: YouTube OAuth
YOUTUBE_CLIENT_ID=...
YOUTUBE_CLIENT_SECRET=...
YOUTUBE_REDIRECT_URI=http://localhost:3001/api/youtube/callback

# Required: Vercel Cron
CRON_SECRET=...

# Required: Vercel Blob (file storage)
BLOB_READ_WRITE_TOKEN=...

# Required: Vercel KV (database)
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
```

## Documentation

- [Architecture](./ARCHITECTURE.md) — System design and data flow
- [API Reference](./API.md) — API endpoints documentation
- [Deployment](./DEPLOYMENT.md) — How to deploy to production
