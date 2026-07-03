# Architecture — Indian Case Law Researcher

## Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 18 |
| Build Tool | Vite 6 |
| Language | TypeScript 5.8 |
| Styling | Tailwind CSS v4 (with `@tailwindcss/vite` plugin) |
| Icons | Lucide React |
| AI Backend | OpenRouter API (`nvidia/nemotron-3-ultra-550b-a55b:free`) |

## Project Structure

```
case-law-researcher/
├── index.html              # Entry HTML with Google Fonts
├── package.json            # Dependencies & scripts
├── postcss.config.mjs      # PostCSS (empty, handled by @tailwindcss/vite)
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite + Tailwind plugin config
├── vite-env.d.ts           # Vite type declarations
├── docs/
│   ├── ARCHITECTURE.md     # This file
│   └── README.md           # Setup & usage guide
└── src/
    ├── main.tsx            # React entry point
    ├── index.css           # Tailwind v4 import + custom theme
    ├── App.tsx             # Root component, page routing, footer
    ├── Navbar.tsx          # Sticky navigation with mobile menu
    ├── LandingPage.tsx     # Marketing site (hero, features, pricing)
    └── DemoPage.tsx        # Research interface with API integration
```

## Component Architecture

### `App.tsx`
- Root component managing page state (`landing` | `demo`)
- Contains the `Footer` component
- Passes `setPage` to child components for navigation

### `Navbar.tsx`
- Sticky top navigation with blur backdrop
- Desktop and mobile responsive layouts
- Brand logo with Scale icon
- Links: Home, Research, Pricing, Contact, CTA button

### `LandingPage.tsx`
- Hero section with gradient background (navy-950 → navy-800)
- Stats bar (judgments indexed, courts covered, etc.)
- Features grid (4 cards)
- How It Works (3-step process)
- Pricing section (3 tiers: Free, Professional, Enterprise)
- CTA section

### `DemoPage.tsx`
- Search panel with text input, court filter, year filter
- Sample query quick-access buttons
- AI research via OpenRouter API
- Results display with expandable case cards
- Each card shows: case name, court, date, citation, summary, key principles, ratio decidendi, related sections

## API Integration

### OpenRouter API
- Endpoint: `https://openrouter.ai/api/v1/chat/completions`
- Model: `nvidia/nemotron-3-ultra-550b-a55b:free`
- Client-side `fetch` call with CORS headers
- JSON response format requested from the model
- Graceful fallback to demo results on API failure

### Authentication
- Uses `VITE_OPENROUTER_API_KEY` environment variable
- Falls back to demo mode with pre-loaded sample results when no key is present

### Response Parsing
- Attempts direct JSON parse
- Falls back to extracting JSON from markdown code blocks
- Falls back to extracting JSON object from free text

## Design System

### Color Palette
- **Primary**: Navy/Slate (`#0a1929` → `#f0f4f8`) — 11 shades
- **Accent**: Gold (`#c9a227`) — professional legal feel
- **Surface**: Dark navy (`#1a2e44`)
- **Text**: Light gray on dark backgrounds

### Typography
- **Headings**: Playfair Display (serif) — authoritative, legal
- **Body**: Inter (sans-serif) — clean, readable

### Animations
- `fadeInUp` — entry animation for hero content
- `pulseGold` — subtle gold glow effect
- Smooth scroll behavior

## Data Flow

1. User enters query in search bar
2. Selects court and year filters
3. Clicks "Research" button
4. `DemoPage` builds prompt with query + filters
5. POST to OpenRouter API with system + user messages
6. Response parsed as JSON array of case results
7. Results rendered as expandable `CaseCard` components
8. On API failure, falls back to demo data with error message
