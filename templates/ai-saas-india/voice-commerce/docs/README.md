# Vernacular Voice-Commerce (ONDC)

A multilingual voice-first shopping assistant for non-English users to buy products on ONDC (Open Network for Digital Commerce).

## Features

- **12 Indian Languages** — Hindi, Kannada, Tamil, Telugu, Bengali, Marathi, Gujarati, Malayalam, Punjabi, Odia, Assamese, English
- **Voice Commerce** — Speak (or type) product queries in your language
- **Regional NLP** — Understands dialects, slang, and mixed-language queries via AI
- **ONDC Integration** — Compare prices across multiple sellers
- **UPI Voice-Pay** — Voice-confirmed UPI payments (conceptual)

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

Copy `.env.example` to `.env` and set:

```bash
# Optional — without this, the app runs in demo mode
VITE_OPENROUTER_API_KEY=your_key_here
```

Get a free API key at [OpenRouter](https://openrouter.ai/keys).

## Demo Mode

Without an API key, the app uses curated mock ONDC products with keyword-based filtering. This is great for trying the UI without any setup.

## AI-Powered Mode

With `VITE_OPENROUTER_API_KEY` set, queries are sent to the OpenRouter API using the free `nvidia/nemotron-3-ultra-550b-a55b:free` model. The AI:
1. Parses the vernacular text to understand product intent
2. Returns structured JSON with product names, prices, sellers, and ratings
3. Falls back to demo mode if the API call fails

## Tech Stack

- React 19 + TypeScript
- Vite 6
- Tailwind CSS v4
- Lucide React icons
- OpenRouter API (optional)

## Project Structure

```
src/
├── main.tsx          # Entry point
├── App.tsx           # Root with page routing
├── index.css         # Tailwind v4 theme + custom styles
├── types.ts          # TypeScript interfaces
├── data.ts           # Languages, products, pricing data
├── api.ts            # API client + demo fallback
└── components/
    ├── LandingPage.tsx   # Marketing page
    └── DemoPage.tsx      # Interactive demo
```

## License

MIT
