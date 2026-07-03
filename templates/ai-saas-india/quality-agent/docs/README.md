# MSME Factory Quality Agent

Vision-based AI quality inspection for Indian MSME manufacturing units.

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173 to view the app.

## Features

- **Landing Page**: Marketing page with features, pricing, and how-it-works sections
- **Demo Page**: Interactive quality inspection demo with product/defect selection
- **AI Analysis**: Real-time defect analysis via OpenRouter API (with demo fallback)

## Demo Usage

1. Click "Try Demo" in the navigation
2. Select a product type (e.g., Auto Components, Textiles)
3. Select observed defect types (e.g., Crack, Scratch, Misalignment)
4. Click "Analyze Quality" to get an AI-powered inspection report
5. Review the report with severity, recommendations, and cost impact

## Environment Variables

Create a `.env` file:

```
VITE_OPENROUTER_API_KEY=your-api-key-here
```

Get a free API key at https://openrouter.ai/

Without an API key, the app uses a realistic demo fallback.

## Build

```bash
npm run build
```

Output is in the `dist/` directory.

## Tech Stack

- React 19 + TypeScript
- Vite 6
- Tailwind CSS v4
- Lucide React icons
- OpenRouter API (nvidia/nemotron-3-ultra-550b-a55b:free)
