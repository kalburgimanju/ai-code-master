# Architecture

## Overview

Single-page React app with client-side routing via state. No server required for the frontend.

```
credit-scorer/
├── index.html              Entry point
├── vite.config.ts          Vite + React + Tailwind v4 plugin
├── tsconfig.json           TypeScript config
├── package.json            Dependencies
├── .env                    API key (VITE_OPENROUTER_API_KEY)
├── src/
│   ├── main.tsx            React root mount
│   ├── index.css           Tailwind CSS v4 with theme tokens
│   └── App.tsx             All components, pages, and logic
└── docs/
    ├── README.md
    └── ARCHITECTURE.md
```

## Component Tree

```
App
├── LandingPage
│   ├── Nav
│   ├── Hero section
│   ├── Features grid (4 cards)
│   ├── How It Works (3 steps)
│   ├── Stats row
│   ├── Pricing cards (3 tiers)
│   └── Footer
├── DemoPage
│   ├── Business type selector (6 options)
│   ├── Monthly income input
│   └── Calculate button → AI scorer
└── Results page
    └── ScoreDisplay
        ├── SVG score ring (animated)
        ├── Breakdown progress bars
        ├── Loan eligibility cards
        └── Recommendations list
```

## Data Flow

1. User selects business type + enters income on DemoPage
2. `aiScore()` calls OpenRouter API with a structured prompt
3. API returns JSON with score, breakdown, loan eligibility, recommendations
4. If API fails or key is missing, `fallbackScore()` generates deterministic results
5. Results rendered in ScoreDisplay with animated SVG ring and progress bars

## AI Scoring

- **Model**: nvidia/nemotron-3-ultra-550b-a55b:free (via OpenRouter)
- **Prompt**: Structured credit assessment prompt returning JSON
- **Fallback**: Local algorithm based on income log-scale + business type weighting
- **Client-side**: API key exposed via VITE_ env var (demo/prototype use only)

## Color Theme

Primary green (#059669) with financial/fintech aesthetic. Tailwind v4 CSS theme tokens defined in index.css.
