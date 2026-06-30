# API Reference

All API routes are located under `src/app/api/` and follow Next.js App Router conventions.

## Base URL

- **Local:** http://localhost:3001/api
- **Production:** https://ytfaceless.vercel.app/api

## Authentication

Most API routes are currently open. The following routes require authentication:
- `GET /api/daily-upload` — Requires `CRON_SECRET` in Authorization header

## Endpoints

### 1. Script Generation

#### `POST /api/scripts/generate`

Generate a YouTube script using AI.

**Request Body:**
```json
{
  "topic": "5 AI tools nobody knows about",
  "niche": "tech",
  "duration": 600
}
```

**Parameters:**
- `topic` (string, required) — Video topic
- `niche` (string, required) — Content niche (tech, psychology, motivation, finance, entertainment)
- `duration` (number, optional) — Target duration in seconds (default: 600)

**Response:**
```json
{
  "script": {
    "title": "5 Hidden AI Tools That Will Change How You Work",
    "hook": "Stop using ChatGPT for everything...",
    "sections": [
      {
        "heading": "Tool #1: Runway ML",
        "content": "Runway ML's Gen-2 Video Editor..."
      }
    ],
    "cta": "If this opened your eyes...",
    "tags": ["AI tools", "productivity", "free"],
    "seoTitle": "5 Free AI Tools You Need in 2026",
    "seoDescription": "Discover five powerful AI tools...",
    "fullText": "Stop using ChatGPT...",
    "wordCount": 1250
  }
}
```

**Errors:**
- `400` — Missing required fields
- `500` — AI model failure (all free models unavailable)

---

### 2. Channel Management

#### `GET /api/channels`

List all connected YouTube channels.

**Response:**
```json
{
  "channels": [
    {
      "id": "uuid",
      "name": "Tech Uncovered",
      "youtubeChannelId": "UC...",
      "niche": "tech",
      "subscriberCount": 42000,
      "totalViews": 1500000,
      "videoCount": 87,
      "uploadHourUtc": 12,
      "isActive": true,
      "createdAt": "2026-01-15T10:00:00Z"
    }
  ]
}
```

#### `POST /api/channels`

Create a new channel.

**Request Body:**
```json
{
  "name": "Tech Uncovered",
  "youtubeChannelId": "UC...",
  "niche": "tech"
}
```

**Response:**
```json
{
  "channel": {
    "id": "uuid",
    "name": "Tech Uncovered",
    "youtubeChannelId": "UC...",
    "niche": "tech",
    "isActive": true,
    "createdAt": "2026-06-30T12:00:00Z"
  }
}
```

#### `GET /api/channels/[id]`

Get a specific channel.

#### `PUT /api/channels/[id]`

Update a channel.

**Request Body:**
```json
{
  "isActive": false,
  "uploadHourUtc": 14
}
```

#### `DELETE /api/channels/[id]`

Delete a channel.

---

### 3. Ideas

#### `GET /api/ideas`

List discovered trending ideas.

**Query Parameters:**
- `status` (string, optional) — Filter by status (discovered, selected, used, expired)

**Response:**
```json
{
  "ideas": [
    {
      "id": "uuid",
      "title": "5 AI Tools Nobody Is Talking About",
      "niche": "Tech & AI",
      "trendScore": 87.5,
      "competition": "Low",
      "estimatedViews": "150K-500K",
      "keywords": ["AI tools", "productivity"],
      "status": "discovered",
      "createdAt": "2026-06-30T12:00:00Z"
    }
  ]
}
```

#### `POST /api/ideas`

Discover new trending topics.

**Request Body:**
```json
{
  "niches": ["tech", "psychology", "finance"]
}
```

**Response:**
```json
{
  "ideas": [...],
  "count": 15
}
```

---

### 4. Pipeline

#### `GET /api/pipeline/status`

Check pipeline status.

**Query Parameters:**
- `videoId` (string, optional) — Get status for specific video

**Response (single video):**
```json
{
  "video": {
    "id": "uuid",
    "title": "5 Hidden AI Tools",
    "status": "uploaded",
    "youtubeUrl": "https://youtu.be/...",
    "estimatedCostCents": 0,
    "startedAt": "2026-06-30T12:00:00Z",
    "completedAt": "2026-06-30T12:05:00Z"
  }
}
```

**Response (all videos):**
```json
{
  "videos": [...]
}
```

---

### 5. YouTube OAuth

#### `GET /api/youtube/auth`

Initiate YouTube OAuth flow. Redirects to Google consent screen.

**Redirect:** Google OAuth → `/api/youtube/callback`

#### `GET /api/youtube/callback`

Handle OAuth callback from Google.

**Query Parameters:**
- `code` (string) — Authorization code
- `error` (string, optional) — Error if denied

**Redirect:** `/channels?success=true` or `/channels?error=...`

---

### 6. Daily Upload (Cron)

#### `GET /api/daily-upload`

Trigger the daily content pipeline. Protected by `CRON_SECRET`.

**Headers:**
```
Authorization: Bearer <CRON_SECRET>
```

**Response:**
```json
{
  "message": "Pipeline complete for 1 channel(s)",
  "results": [
    {
      "channelId": "uuid",
      "channelName": "Tech Uncovered",
      "success": true,
      "videoId": "uuid",
      "youtubeUrl": "https://youtu.be/..."
    }
  ]
}
```

**Errors:**
- `401` — Invalid or missing CRON_SECRET

---

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

Common error codes:
- `400` — Bad request (missing fields)
- `401` — Unauthorized
- `404` — Resource not found
- `500` — Internal server error

## Rate Limits

- **OpenRouter:** Rate-limited by model provider
- **YouTube API:** 10,000 units/day free
- **Vercel:** Function execution limits apply
