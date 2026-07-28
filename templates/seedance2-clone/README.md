# Highfi 2 — Clone

A clone of [highfi2.ai](https://highfi2.ai/) built with **Next.js 15 + React 19 + Tailwind CSS**, with all AI generation driven through the **OpenRouter API**. It reproduces the site's look and the multimodal video/image studio, and adds an **Agents** page where each specialized agent is a real OpenRouter-backed model.

## Features

- **Multimodal video studio** — text/ image/ video/ audio → video, with model + resolution + duration controls and async task polling.
- **AI Agents** (`/agents`) — Prompt Enhancer, Storyboard, Motion Director and Audio agents, each calling OpenRouter.
- **AI Image** (`/image`) — text/image → image via an OpenRouter image model.
- **API docs** (`/api-docs`), **Guide** (`/guide`) and **Pricing** (`/pricing`) pages matching the original.

## How the OpenRouter integration works

OpenRouter has no video model, so the clone's `/api/video` route uses OpenRouter **agents** to orchestrate production: the Prompt Enhancer + Storyboard agents plan the shot, and the image model renders representative still frames. The client polls task status exactly like Highfi 2's async API.

| Endpoint | Purpose |
| --- | --- |
| `POST /api/video` | Create async generation task, reserve credits |
| `GET  /api/video?id=` | Poll task status + frames |
| `POST /api/image` | Generate a still image |
| `POST /api/chat`  | Run a Highfi agent |

## Setup

```bash
cp .env.example .env.local
# edit .env.local and set OPENROUTER_API_KEY
npm install
npm run dev   # http://localhost:3003
```

### Environment variables

| Var | Default | Description |
| --- | --- | --- |
| `OPENROUTER_API_KEY` | — | Required. Your OpenRouter key. |
| `OPENROUTER_CHAT_MODEL` | `anthropic/claude-3.5-sonnet` | Model for agent orchestration. |
| `OPENROUTER_IMAGE_MODEL` | `openai/dall-e-3` | Model for image generation (must support images on OpenRouter). |
| `OPENROUTER_REFERER` | — | Referer sent to OpenRouter. |
| `OPENROUTER_SITE_NAME` | `Highfi 2 Clone` | Site name sent to OpenRouter. |

## Notes

- The in-memory task store is per server instance. Swap for Redis/DB for production.
- Video output is rendered as still frames (OpenRouter has no video model); wire in a real video provider if needed.
