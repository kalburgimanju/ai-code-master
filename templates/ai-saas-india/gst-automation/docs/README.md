# GST Automation Agent

AI-powered GST compliance automation for Indian MSMEs, CAs, and accountants.

## Features

- **Invoice Extraction**: AI reads and parses invoice text to extract all line items, amounts, tax details, and GSTIN numbers
- **HSN Code Mapping**: Automatic mapping of products/services to correct Indian HSN codes
- **GSTR-1 JSON Generation**: Ready-to-upload GSTR-1 JSON files compliant with GSTN schema
- **GST Filing Automation**: End-to-end automation from invoice to filing

## Tech Stack

- React 19 + TypeScript
- Vite (build tool)
- Tailwind CSS v4
- Lucide React (icons)
- OpenRouter API (AI inference)

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your OpenRouter API key

# Start development server
npm run dev

# Build for production
npm run build
```

## Environment Variables

| Variable | Description | Required |
|---|---|---|
| `VITE_OPENROUTER_API_KEY` | OpenRouter API key for AI inference | No (demo mode if unset) |

## Project Structure

```
gst-automation/
├── src/
│   ├── main.tsx           # App entry point
│   ├── App.tsx            # Root component with navigation
│   ├── index.css          # Tailwind CSS v4 styles
│   ├── pages/
│   │   ├── LandingPage.tsx  # Marketing landing page
│   │   └── DemoPage.tsx     # Invoice processing demo
│   └── lib/
│       ├── api.ts         # OpenRouter API client
│       └── types.ts       # TypeScript type definitions
├── docs/
│   ├── ARCHITECTURE.md
│   └── README.md
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## Deployment

This app is a static SPA and can be deployed to:
- **Netlify**: Just connect your Git repo, no config needed
- **Vercel**: Framework preset: Vite
- **Cloudflare Pages**: Build command: `npm run build`, output: `dist`

## API

The app uses [OpenRouter](https://openrouter.ai) for AI inference:
- **Default model**: `nvidia/nemotron-3-ultra-550b-a55b:free` (with API key)
- **Demo mode**: `meta-llama/llama-3.1-8b-instruct:free` (no API key)
