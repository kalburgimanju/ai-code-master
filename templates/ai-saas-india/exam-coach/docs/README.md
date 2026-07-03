# Vernacular Exam Coach (UPSC/SSC)

AI-powered exam preparation platform for competitive exams in 12+ Indian languages.

## Overview

Vernacular Exam Coach is a React-based web application that provides personalized study plans, multilingual MCQ practice, progress tracking, and AI-powered doubt solving for UPSC and SSC aspirants.

## Features

- **Daily Study Plans**: AI-generated personalized daily schedules tailored to exam preparation
- **Multilingual MCQs**: Practice questions in 12+ Indian languages (Hindi, Marathi, Tamil, Kannada, Bengali, Telugu, Gujarati, Malayalam, Punjabi, Urdu, Odia, Assamese)
- **Progress Tracking**: Track preparation with detailed analytics and weak area identification
- **Live Doubt Solving**: AI-powered instant doubt resolution in the student's preferred language
- **Subject Coverage**: Polity, History, Geography, Economy, Science

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **AI Backend**: OpenRouter API (nvidia/nemotron-3-ultra-550b-a55b:free)
- **Icons**: Lucide React

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Environment Variables

Create a `.env` file:

```
VITE_OPENROUTER_API_KEY=your_openrouter_api_key
```

If no API key is provided, the app falls back to demo responses.

## Project Structure

```
exam-coach/
├── src/
│   ├── api/
│   │   └── openrouter.ts      # OpenRouter API integration
│   ├── components/
│   │   ├── LandingPage.tsx     # Landing page with hero, features, pricing
│   │   └── DemoPage.tsx        # Interactive study plan generator
│   ├── data/
│   │   ├── languages.ts        # 12+ Indian language definitions
│   │   └── subjects.ts         # Exam subjects and topics
│   ├── App.tsx                 # Main app with page routing
│   ├── main.tsx                # React entry point
│   ├── index.css               # Tailwind CSS v4 styles
│   └── vite-env.d.ts           # TypeScript environment types
├── docs/
│   ├── ARCHITECTURE.md         # Architecture documentation
│   └── README.md               # This file
├── index.html                  # HTML entry point
├── package.json                # Dependencies and scripts
├── postcss.config.mjs          # PostCSS config
├── tsconfig.json               # TypeScript config
└── vite.config.ts              # Vite config
```

## Supported Languages

| Language | Native Name | Code |
|----------|-------------|------|
| Hindi | हिन्दी | hi |
| Marathi | मराठी | mr |
| Tamil | தமிழ் | ta |
| Kannada | ಕನ್ನಡ | kn |
| Bengali | বাংলা | bn |
| Telugu | తెలుగు | te |
| Gujarati | ગુજરાતી | gu |
| Malayalam | മലയാളം | ml |
| Punjabi | ਪੰਜਾਬੀ | pa |
| Urdu | اردو | ur |
| Odia | ଓଡ଼ିଆ | or |
| Assamese | অসমীয়া | as |

## Pricing

- **Free**: Daily study plan, 5 MCQs/day, basic tracking, 2 languages
- **Pro (₹499/mo)**: Unlimited plans, 50 MCQs/day, analytics, all languages, mock tests
- **Premium (₹999/mo)**: Everything in Pro + unlimited MCQs, personal AI mentor, interview prep

## License

MIT
