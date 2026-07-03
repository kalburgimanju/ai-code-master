# Architecture — Vernacular Voice-Commerce (ONDC)

## Overview

A React + Vite + TypeScript single-page application that provides a multilingual, voice-first shopping experience for Indian users on the ONDC (Open Network for Digital Commerce) network.

## Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 19 |
| Bundler | Vite 6 |
| Language | TypeScript ~5.7 |
| Styling | Tailwind CSS v4 (via `@tailwindcss/vite`) |
| Icons | Lucide React |
| API | OpenRouter (client-side fetch) |

## Directory Structure

```
voice-commerce/
├── docs/                    # Documentation
│   ├── ARCHITECTURE.md
│   └── README.md
├── public/                  # Static assets (if any)
├── src/
│   ├── main.tsx             # App entry point
│   ├── App.tsx              # Root component with page routing
│   ├── index.css            # Tailwind CSS v4 + custom theme
│   ├── types.ts             # TypeScript interfaces
│   ├── data.ts              # Static data (languages, mock products, plans)
│   ├── api.ts               # OpenRouter API client + demo mode fallback
│   ├── vite-env.d.ts        # Vite environment type declarations
│   └── components/
│       ├── LandingPage.tsx   # Marketing landing page
│       └── DemoPage.tsx      # Interactive voice commerce demo
├── index.html               # HTML entry point
├── package.json
├── tsconfig.json
├── vite.config.ts
├── postcss.config.mjs
└── .env.example
```

## Page Routing

The app uses simple state-based routing (no React Router needed for 2 pages):

- `Page = "home"` → renders `LandingPage`
- `Page = "demo"` → renders `DemoPage`

Navigation is handled by passing `onNavigate` / `onBack` callbacks.

## Data Flow

```
User Input (text simulating voice)
    ↓
DemoPage captures query + selected language code
    ↓
searchProducts(query, langCode) in api.ts
    ↓
┌─────────────────────────────┐
│ VITE_OPENROUTER_API_KEY set?│
├─────────┬───────────────────┤
│ Yes     │ No (demo mode)    │
│         │                   │
│ POST to │ Return curated    │
│ OpenRtr │ MOCK_PRODUCTS     │
│ with NL │ filtered by       │
│ prompt  │ keyword matching  │
└─────────┴───────────────────┘
    ↓
SearchResult { query, language, intent, products[] }
    ↓
Render ProductCard grid
```

## API Integration

The app calls OpenRouter's chat completions endpoint with:
- **Model**: `nvidia/nemotron-3-ultra-550b-a55b:free` (free tier)
- **System prompt**: Instructs the model to return structured JSON with product search results
- **User prompt**: The vernacular query + language code
- **Fallback**: On API failure or missing key, curated mock products are returned with keyword filtering

## Supported Languages (12)

Hindi, Kannada, Tamil, Telugu, Bengali, Marathi, Gujarati, Malayalam, Punjabi, Odia, Assamese, English.

## Design System

- **Primary**: Orange (#EA580C) — warm, trustworthy
- **Accent**: Red (#DC2626) — energy, action
- **Warm**: Gold/Amber — prosperity, celebration
- **Theme**: Gradient backgrounds, rounded corners, card-based layouts
- **Typography**: Inter + Noto Sans (Indic scripts)
