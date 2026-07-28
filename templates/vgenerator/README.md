# VGenerator — AI Video Generator

An AI-powered video generation webapp built with React + TypeScript + FastAPI, wrapping **MoneyPrinterTurbo**.

## Features

- 🎯 **Prompt-based video creation** — Enter a topic, AI generates the full video
- ✍️ **Custom scripts** — Provide your own or let AI write it
- 🎙️ **Multi-voice TTS** — Indian English, US/UK English, Chinese, and more
- 🎬 **Multiple video sources** — Pexels, Pixabay, Coverr, or local files
- 📐 **Aspect ratios** — 9:16 (Reels/TikTok), 16:9 (YouTube), 1:1 (Instagram)
- 📺 **Live preview** — Watch generated videos directly in the browser
- 📥 **Download** — Download finished videos
- 🔄 **Regenerate** — Tweak settings and regenerate
- 📚 **History** — All your generated videos saved locally

## Quick Start

### 1. Install dependencies

```bash
# Frontend
npm install

# Backend
pip install fastapi uvicorn pydantic
```

### 2. Set up API keys

Copy `.env.example` to `.env` and fill in:

- **OpenRouter API key** (free tier available) — [openrouter.ai/keys](https://openrouter.ai/keys)
- **Pexels API key** (free) — [pexels.com/api](https://www.pexels.com/api/)

```
MPT_LLM_API_KEY=sk-or-v1-your-key
MPT_PEXELS_API_KEY=your-pexels-key
```

### 3. Start development servers

```bash
# Option A: Start both together
./start_dev.sh

# Option B: Start separately
# Terminal 1 — Backend
python3 server.py 8090

# Terminal 2 — Frontend
npx vite
```

Open **http://localhost:5173**

### Prerequisites

- **MoneyPrinterTurbo** — Auto-installed on first run to `~/MoneyPrinterTurbo/`
- **uv** — Python package manager
- **ffmpeg** — For video processing

## Architecture

```
vgenerator/
├── src/                    # React frontend
│   ├── components/         # UI components
│   │   ├── PromptInput.tsx
│   │   ├── VideoPreview.tsx
│   │   ├── VideoCard.tsx
│   │   └── GenerationProgress.tsx
│   ├── services/           # API & storage
│   │   ├── api.ts
│   │   └── videoStore.ts
│   └── types/              # Shared types
├── server.py               # FastAPI backend
├── start_dev.sh            # Dev launcher
└── .env.example            # Environment template
```

## How it Works

1. **You enter a topic** (and optionally a custom script)
2. **Backend runs MoneyPrinterTurbo** — generates script via LLM, creates TTS audio, downloads footage, renders video
3. **Frontend polls for progress** — shows live stage updates
4. **Video appears** — ready to preview and download

---

Built on [MoneyPrinterTurbo](https://github.com/harry0703/MoneyPrinterTurbo)
