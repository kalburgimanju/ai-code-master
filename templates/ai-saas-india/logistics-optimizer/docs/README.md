# HyperRoute — Hyper-local Logistics Optimizer

AI-powered route optimization for Indian cities, factoring in traffic, monsoon weather, and festival road closures.

## Features

- **5 Indian Cities**: Bangalore, Mumbai, Delhi, Chennai, Hyderabad
- **AI Route Optimization**: Multi-stop delivery route optimization via OpenRouter API
- **Real-time Conditions**: Traffic, rain, and festival impact analysis
- **SVG Route Map**: Visual route representation with traffic-level indicators
- **Turn-by-Turn Directions**: City-specific landmarks and road names
- **Demo Mode**: Works without an API key using intelligent fallback routing
- **Cost Calculator**: Fuel cost estimation based on diesel pricing

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

Create a `.env` file:

```bash
# Optional — without this, the app runs in demo mode
VITE_OPENROUTER_API_KEY=your_openrouter_key_here
```

Get a free API key at [openrouter.ai](https://openrouter.ai).

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with features, pricing, and how-it-works |
| `/demo` | Interactive route optimization demo |

## How the Demo Works

1. **Select a city** from the dropdown (Bangalore, Mumbai, Delhi, Chennai, Hyderabad)
2. **Add delivery addresses** — type manually or use quick-add sample addresses
3. **Pick time of day** — morning rush, midday, afternoon, evening rush, or night
4. **Toggle conditions** — monsoon/rain and festival season
5. **Click "Optimize Route"** — AI generates an optimized multi-stop route

The demo provides:
- Optimized stop ordering
- SVG map with traffic-colored route lines
- Distance and time estimates per stop
- Turn-by-turn directions with Indian road landmarks
- Weather and festival impact assessment
- Fuel cost calculation

## Tech Stack

- React 19 + TypeScript
- Vite 6
- Tailwind CSS v4
- React Router v7
- Lucide React icons
- OpenRouter API (nvidia/nemotron-ultra-253b:free)

## License

MIT
