# Alternate Credit Scorer for Bharat

AI-powered credit assessment tool for unbanked MSMEs in India. Uses SMS transactions, electricity bills, and ONDC sales history to generate a fair credit score.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the app.

## Tech Stack

- React 19 + TypeScript
- Vite 7
- Tailwind CSS v4
- Lucide React icons
- OpenRouter API (nvidia/nemotron-3-ultra-550b-a55b:free model)

## Pages

- **Landing page** — Hero, features, how it works, pricing, footer
- **Demo page** — Business type selector, income input, AI credit scoring
- **Results page** — Score ring, breakdown bars, loan eligibility, recommendations

## Environment

Copy `.env.example` to `.env` and set your OpenRouter API key:

```
VITE_OPENROUTER_API_KEY=sk-or-v1-...
```

If no API key is configured, the app uses a deterministic fallback scorer.

## Build

```bash
npm run build    # production build in dist/
npm run preview  # preview the production build
```
