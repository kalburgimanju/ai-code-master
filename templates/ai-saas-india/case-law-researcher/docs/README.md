# Indian Case Law Researcher

AI-powered legal research tool for Indian lawyers, paralegals, and legal professionals. Search Supreme Court and High Court judgments, get AI-generated summaries, citations, and key legal principles.

## Quick Start

### Prerequisites

- Node.js 18+ (or 20+ recommended)
- npm 9+

### Install & Run

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

### Build

```bash
npm run build
```

Output is in `dist/`. Serve with any static file server.

## Environment Variables

Create a `.env` file in the project root:

```env
# Optional: OpenRouter API key for live AI responses
# Get a free key at https://openrouter.ai/keys
VITE_OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxx
```

Without the key, the app runs in **demo mode** with pre-loaded sample results.

## Features

### Judgment Search
Natural language search across Indian case law. Query by statute, article, section, or topic.

### Citation Generation
Auto-formatted citations in standard Indian legal formats (AIR, SCC, SCR, neutral citation).

### Case Summaries
AI-generated summaries with facts, issues, holdings, and ratio decidendi.

### Legal Draft Assistance
Generate drafts, petitions, and submissions with proper case references.

## Tech Stack

- **React 18** with TypeScript
- **Vite 6** build tool
- **Tailwind CSS v4** with custom navy/gold theme
- **Lucide React** icons
- **OpenRouter API** for AI inference

## Project Structure

```
src/
├── main.tsx          # Entry point
├── index.css         # Tailwind v4 + custom theme
├── App.tsx           # Root component
├── Navbar.tsx        # Navigation
├── LandingPage.tsx   # Marketing pages
└── DemoPage.tsx      # Research interface
```

## Customisation

### Theme
Edit `src/index.css` to modify the color palette, fonts, or animations.

### AI Model
Change the model in `DemoPage.tsx` (line with `model:` parameter) to use a different OpenRouter model.

### Sample Data
Modify `DEMO_RESULTS` array in `DemoPage.tsx` to change demo results.

## Disclaimer

This tool is for research and educational purposes only. It does not constitute legal advice. Always verify AI-generated legal research with primary sources before relying on it in any legal proceeding.

## License

MIT
