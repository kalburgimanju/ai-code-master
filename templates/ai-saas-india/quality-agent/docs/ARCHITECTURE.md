# Architecture

## Overview

MSME Factory Quality Agent is a vision-based AI inspection system designed for small-scale Indian manufacturing units. It detects defects in manual manufacturing processes using mobile phones, CCTV cameras, and edge devices.

## Tech Stack

- **Frontend**: React 19 + TypeScript + Tailwind CSS v4
- **Build**: Vite 6
- **Icons**: Lucide React
- **AI Backend**: OpenRouter API (free model: nvidia/nemotron-3-ultra-550b-a55b)
- **Notifications**: WhatsApp Business API (planned)

## Directory Structure

```
quality-agent/
├── src/
│   ├── main.tsx              # Entry point
│   ├── App.tsx               # Root component with page routing
│   ├── index.css             # Tailwind CSS v4 setup
│   ├── pages/
│   │   ├── LandingPage.tsx   # Marketing landing page
│   │   └── DemoPage.tsx      # Interactive quality inspection demo
│   ├── components/
│   │   ├── Navbar.tsx        # Top navigation bar
│   │   ├── Hero.tsx          # Hero section with gradient
│   │   ├── Features.tsx      # Feature cards
│   │   ├── HowItWorks.tsx    # Step-by-step explanation
│   │   ├── Pricing.tsx       # Pricing tiers
│   │   └── Footer.tsx        # Site footer
│   └── lib/
│       └── api.ts            # OpenRouter API client + demo fallback
├── docs/
│   ├── ARCHITECTURE.md       # This file
│   └── README.md             # Project documentation
├── index.html
├── vite.config.ts
├── tsconfig.json
├── postcss.config.mjs
├── package.json
└── .env                      # Environment variables
```

## Data Flow

```
User selects product + defects
        ↓
DemoPage component
        ↓
analyzeQuality() in lib/api.ts
        ↓
  ┌─────┴──────┐
  │  Has API key? │
  └─────┬──────┘
  Yes   │   No
  ↓     ↓
OpenRouter   Demo Fallback
API call     (pre-built report)
  ↓           ↓
JSON parse + validate
        ↓
InspectionReport rendered in UI
```

## Component Architecture

- **App.tsx**: Simple page router using React state (`landing` | `demo`)
- **Pages**: Full page components that compose sections
- **Components**: Reusable UI sections (Hero, Features, etc.)
- **lib/api.ts**: API client with graceful fallback to demo data

## AI Integration

The app calls OpenRouter's API client-side with:
- System prompt describing Indian MSME quality inspection context
- User message with product type and defect list
- Temperature 0.3 for deterministic outputs
- JSON response parsing with validation
- Automatic fallback to demo report on any failure

## Future Enhancements

1. Camera integration via WebRTC for live inspection
2. WhatsApp Business API for instant alerts
3. Edge deployment with TensorFlow Lite / ONNX Runtime
4. Batch analytics dashboard with trend visualization
5. BIS compliance report generation
6. Multi-language support (Hindi, Tamil, etc.)
