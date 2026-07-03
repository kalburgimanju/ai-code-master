# HyperRoute — Architecture

## Overview

HyperRoute is a hyper-local logistics route optimization system designed for Indian cities. It uses AI to factor in real-time traffic, monsoon weather, and festival road closures to generate optimal multi-stop delivery routes.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI Framework | React 19 |
| Build Tool | Vite 6 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) |
| Routing | React Router v7 |
| Icons | Lucide React |
| AI Backend | OpenRouter API (free model) |

## Directory Structure

```
logistics-optimizer/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── src/
│   ├── main.tsx              # Entry point
│   ├── App.tsx               # Router setup
│   ├── index.css             # Tailwind v4 + custom theme
│   ├── types.ts              # TypeScript interfaces
│   ├── data.ts               # City data, sample addresses, time options
│   ├── vite-env.d.ts         # Vite env type declarations
│   ├── pages/
│   │   ├── LandingPage.tsx   # Marketing landing page
│   │   └── DemoPage.tsx      # Interactive route optimization demo
│   ├── components/
│   │   ├── Navbar.tsx        # Fixed top navigation
│   │   ├── Hero.tsx          # Landing hero section
│   │   ├── Features.tsx      # 8-feature grid
│   │   ├── HowItWorks.tsx    # 4-step process
│   │   ├── Pricing.tsx       # 3-tier pricing cards
│   │   ├── Footer.tsx        # Site footer
│   │   ├── RouteMap.tsx      # SVG route visualization
│   │   ├── DeliveryCard.tsx  # Turn-by-turn stop card
│   │   └── ResultsPanel.tsx  # Summary metrics + conditions
│   └── utils/
│       └── openRouter.ts     # OpenRouter API client + demo fallback
├── docs/
│   ├── ARCHITECTURE.md
│   └── README.md
```

## Data Flow

```
User Input (city, stops, time, conditions)
         │
         ▼
  DemoPage.tsx (state management)
         │
         ▼
  openRouter.ts → OpenRouter API
         │
         ├── Success → Parse JSON → RouteResult
         │
         └── Fallback → generateDemoRoute() → RouteResult
                          (deterministic demo with city-specific logic)
         │
         ▼
  RouteMap.tsx (SVG visualization)
  ResultsPanel.tsx (metrics + conditions)
  DeliveryCard.tsx (turn-by-turn list)
```

## City Data Model

Each supported city includes:
- **Traffic peak hours**: Morning and evening rush windows
- **Common festivals**: Major events that affect road conditions
- **Average rainfall**: Monsoon characteristics
- **Sample addresses**: 8 real-world delivery destinations

## Route Optimization

### AI Mode (with API key)
- Sends a detailed prompt to `nvidia/nemotron-ultra-253b:free` via OpenRouter
- Prompt includes city-specific traffic knowledge, road names, and landmarks
- Returns structured JSON with optimized stop order and directions

### Demo Mode (no API key)
- Uses deterministic routing based on city factors and time-of-day multipliers
- Traffic levels assigned based on time period
- City-specific landmarks used for realistic turn-by-turn directions
- Rain and festival toggles apply multipliers to time estimates

## Styling

- **Tailwind CSS v4** with `@tailwindcss/vite` plugin (no PostCSS config needed)
- Custom `@theme` block for cyan/teal color palette
- Glassmorphism cards (`bg-white/5 backdrop-blur-sm border border-white/10`)
- Dark slate-950 background with gradient overlays
- Responsive grid layouts (1-col mobile, 2-4 col desktop)
