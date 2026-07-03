# AI Agronomist — Architecture

## Overview

AI Agronomist is a single-page React application that delivers AI-powered farming advice tailored to Indian agriculture. It combines satellite data concepts, weather integration, and regional language support through an OpenRouter-backed LLM.

## Tech Stack

| Layer       | Technology              |
|-------------|------------------------|
| Framework   | React 18 + TypeScript  |
| Bundler     | Vite 6                 |
| Styling     | Tailwind CSS v4        |
| Icons       | Lucide React           |
| API         | OpenRouter (LLM proxy) |

## File Structure

```
agri-advisor/
├── index.html              # Entry HTML
├── vite.config.ts          # Vite + React + Tailwind plugins
├── tsconfig.json           # TypeScript config (React JSX)
├── postcss.config.mjs      # PostCSS (empty, Tailwind v4 via Vite plugin)
├── package.json
├── public/
├── docs/
│   ├── ARCHITECTURE.md     # This file
│   └── README.md           # User-facing docs
└── src/
    ├── main.tsx            # React entry point
    ├── index.css           # Tailwind v4 theme + global styles
    ├── App.tsx             # SPA page router (state-based)
    ├── vite-env.d.ts       # Vite type declarations
    ├── lib/
    │   └── api.ts          # OpenRouter API client + demo fallback
    └── pages/
        ├── LandingPage.tsx  # Marketing landing page
        └── DemoPage.tsx     # Interactive demo with advice results
```

## Data Flow

1. **User opens the app** → `App.tsx` renders `LandingPage` by default.
2. **User clicks "Try Demo" or "Get Farming Advice"** → `App.tsx` switches to `DemoPage`.
3. **User fills form** (state, crop, soil type) and clicks submit.
4. **`DemoPage` calls `fetchFarmAdvice()`** from `src/lib/api.ts`.
5. **`api.ts`** checks for `VITE_OPENROUTER_API_KEY`:
   - **If present**: sends a chat completion request to OpenRouter (`nvidia/nemotron-3-ultra-550b-a55b:free`).
   - **If absent**: returns a hardcoded demo response contextualized to the user's selections.
6. **Response is parsed** into a `FarmAdvice` object and displayed as categorized advice cards.

## Styling

Tailwind CSS v4 is used via the `@tailwindcss/vite` plugin (no PostCSS processing needed). The custom theme defines:

- **Green palette** (`--color-primary-*`) — main brand color (#16A34A)
- **Earth tones** (`--color-earth-*`) — soil-related elements
- **Sky blue** (`--color-sky`) — irrigation-related elements
- **Wheat gold** (`--color-wheat`) — seasonal/timing elements

## API Integration

The OpenRouter API is called via `fetch()` in `src/lib/api.ts`. Key details:

- **Model**: `nvidia/nemotron-3-ultra-550b-a55b:free`
- **Endpoint**: `https://openrouter.ai/api/v1/chat/completions`
- **Prompt engineering**: Asks the LLM to respond in structured JSON with six advice categories
- **Graceful fallback**: If no API key is set, or if the request fails, a demo response is returned

## Environment Variables

| Variable                 | Required | Description                        |
|--------------------------|----------|------------------------------------|
| `VITE_OPENROUTER_API_KEY`| No       | OpenRouter API key for live LLM    |

Without the API key, the app runs in **demo mode** with static advice.
