# AI Agronomist — Satellite-Based Precision Farming for Indian Crops

AI Agronomist is a smart farming assistant that provides AI-powered crop advice, soil analysis, and weather-based recommendations — designed specifically for Indian farmers and available in regional languages.

## Features

- **Satellite Monitoring** — NDVI and crop stress analysis from ISRO/Sentinel data
- **Crop Health AI** — Early detection of nutrient deficiencies, disease, and growth anomalies
- **Weather Integration** — Hyper-local forecasts with IMD alerts and crop calendar sync
- **Regional Languages** — Advice in Hindi, Tamil, Telugu, Bengali, Marathi, Kannada and more

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

## API Key (Optional)

To enable live AI advice instead of demo responses, create a `.env` file:

```
VITE_OPENROUTER_API_KEY=your_openrouter_key_here
```

Get a free key at [openrouter.ai](https://openrouter.ai).

Without an API key, the app runs in **demo mode** with pre-built advice for each crop/soil combination.

## How to Use

1. Open the landing page and click **"Try Demo"**
2. Select your **State**, **Crop**, and **Soil Type** from the dropdowns
3. Click **"Get Farming Advice"**
4. Review the personalized advice cards covering:
   - Irrigation scheduling
   - Fertilizer and nutrient management
   - Pest and disease control
   - Seasonal timing tips
   - Soil health management
   - Yield estimates

## Tech Stack

- React 18 + TypeScript
- Vite 6
- Tailwind CSS v4
- Lucide React icons
- OpenRouter API (NVIDIA Nemotron 3 Ultra 550B)

## Pricing Plans

| Plan | Price | Highlights |
|------|-------|------------|
| Kisan | Free | 5 queries/month, basic analysis, Hindi & English |
| Krishi Pro | ₹499/mo | Unlimited queries, satellite NDVI, all languages |
| Enterprise | Custom | API access, bulk analysis, custom dashboards |

## Project Structure

```
src/
├── main.tsx            # Entry point
├── index.css           # Tailwind v4 theme
├── App.tsx             # Page router
├── lib/
│   └── api.ts          # API client with demo fallback
└── pages/
    ├── LandingPage.tsx  # Marketing page
    └── DemoPage.tsx     # Interactive demo
```

## License

MIT
