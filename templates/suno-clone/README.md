# Suno Clone

A clone of [suno.com](https://suno.com/) built with **Next.js 15 + React 19 + Tailwind CSS**. Describe a song
and the app composes **lyrics, music and cover art** — driven entirely by **free models**:

- **Lyrics & style** → OpenRouter **free** chat models (`openrouter/auto`), in English / Hindi / Kannada / Marathi
- **Audio** → a real **instrumental track synthesized in the browser** (chord progression + bass + drums + a melody tracked to the lyrics' syllables, mixed to WAV). An optional SpeechSynthesis "vocal" layer can read the lyrics in the chosen language on top.
- **Cover art** → Pollinations.ai free text-to-image

No paid APIs are required.

## Why audio is generated in the browser

Hosted free music APIs (Hugging Face Inference, Pollinations audio, Replicate) are
frequently unreachable from the server/CI environment (we verified HF inference and
Pollinations audio both fail with connection errors here). To guarantee the user
**always gets real, playable music**, the studio renders an actual song arrangement
in the browser — a seeded chord progression, bassline, drum pattern and a melody
whose pitches follow the lyrics — mixed to a WAV. An optional SpeechSynthesis
"vocal" layer can read the words on top. This keeps the whole flow free and
dependency-free for sound.

## Features

- **Song studio** (`/`) — prompt (or paste your own lyrics) → async generation of lyrics, a playable melody + spoken voice, and cover art.
- **Multilingual** — English, Hindi, Kannada, Marathi. Lyrics are written in the chosen language and the voice reads them in `hi-IN` / `kn-IN` / `mr-IN` / `en-US`.
- **Live polling** — the client polls task status and streams in style, lyrics, audio and art.
- **Guide** (`/guide`), **API docs** (`/api-docs`), **Pricing** (`/pricing`), **Library** (`/library`).
- **Auth** — NextAuth demo login (demo@example.com / password).

## How generation works

The `/api/song` route orchestrates free models for text + art; audio is client-side:

1. A free chat model writes a **style line** from your idea.
2. The same model writes **lyrics** in the selected language (or your pasted lyrics are used).
3. Pollinations renders **cover art**.
4. In the browser, the lyrics drive a **Web Audio melody** and a **SpeechSynthesis** voice reading the lyrics aloud.

| Endpoint | Purpose |
| --- | --- |
| `POST /api/song` | Create async song task → `{ ok, id, status }` |
| `GET  /api/song?id=` | Poll task status + lyrics/cover |
| `POST /api/lyrics` | Synchronously return `{ style, lyrics }` (supports `lang`) |
| `POST /api/cover` | Return free cover-art PNG (base64) |

## Setup

```bash
cp .env.example .env.local
# edit .env.local and set OPENROUTER_API_KEY (and optionally HF_TOKEN)
npm install
npm run dev   # http://localhost:3003
```

### Environment variables

| Var | Default | Description |
| --- | --- | --- |
| `OPENROUTER_API_KEY` | — | Required. Your OpenRouter key. |
| `OPENROUTER_CHAT_MODEL` | `openrouter/auto` | Free chat model for lyrics/style. |
| `HF_TOKEN` | — | Optional. Improves Pollinations/cover rate limits. |
| `OPENROUTER_REFERER` | — | Referer sent to OpenRouter. |
| `OPENROUTER_SITE_NAME` | `Suno Clone` | Site name sent to OpenRouter. |
| `AUTH_SECRET` | — | NextAuth session secret. |

## Notes

- The in-memory task store is per server instance. Swap for Redis/DB for production.
- Audio quality depends on the browser's SpeechSynthesis voices (regional voices need OS language packs). The melody synth works everywhere.
- A valid `OPENROUTER_API_KEY` is required for AI-written lyrics; you can always paste your own.
