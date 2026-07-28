# Gmail Reader — AI Email Assistant

A React app that connects to your Gmail account(s), lets you browse and search emails, and uses AI (via OpenRouter) to summarize, analyze, and answer questions about your emails.

## Features

- **Multiple Gmail Accounts** — Connect and switch between multiple Google accounts
- **Smart Search** — Search emails with Gmail query syntax (from:, subject:, before:, etc.)
- **AI Chat** — Ask questions about your emails and get instant answers
- **Email Summaries** — Get AI-powered summaries of selected emails
- **Quick Filters** — One-click filters for unread, starred, recent, and attachment emails
- **Streaming Responses** — Real-time AI responses as they're generated

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS 4, TypeScript
- **Backend**: Express, Google APIs, OpenAI SDK (OpenRouter)
- **AI**: OpenRouter (supports Claude, GPT-4, Gemini, Llama, Mixtral)

## Prerequisites

1. **Node.js** 18+ installed
2. **Google Cloud Console** project with OAuth2 credentials
3. **OpenRouter** API key (get one at [openrouter.ai](https://openrouter.ai))

## Setup

### 1. Install Dependencies

```bash
cd templates/gmail-reader
npm install
```

### 2. Set Up Google OAuth2

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or select an existing one)
3. Enable the **Gmail API**:
   - Go to APIs & Services > Library
   - Search for "Gmail API" and enable it
4. Create OAuth2 credentials:
   - Go to APIs & Services > Credentials
   - Click "Create Credentials" > "OAuth client ID"
   - Application type: **Web application**
   - Authorized redirect URIs: `http://localhost:5173/auth/callback`
5. Copy the **Client ID** and **Client Secret**

### 3. Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```
OPENROUTER_API_KEY=sk-or-v1-your-key-here
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5173/auth/callback
```

### 4. Run the App

```bash
npm run dev
```

This starts both the backend (port 3001) and frontend (port 5173).

### 5. Open in Browser

Visit [http://localhost:5173](http://localhost:5173)

1. Click "Sign in with Google"
2. Authorize Gmail access
3. Start browsing and searching your emails!

## Usage

### Browsing Emails

- Emails load in your inbox by default
- Click any email to view its full content
- Use "Load more" to paginate through results

### Searching Emails

Use Gmail search syntax in the search bar:

| Query | Description |
|-------|-------------|
| `from:john` | Emails from John |
| `subject:meeting` | Emails with "meeting" in subject |
| `is:unread` | Unread emails |
| `has:attachment` | Emails with attachments |
| `newer_than:7d` | Emails from last 7 days |
| `before:2024/01/01` | Emails before a date |
| `label:work` | Emails with a specific label |

### AI Assistant

1. Click the chat icon (💬) in the sidebar header
2. Select your preferred AI model from the dropdown
3. Ask questions like:
   - "Summarize my emails from today"
   - "What action items do I have?"
   - "Find all emails about the project deadline"
   - "Who emailed me most this week?"

### Multiple Accounts

- Use the account selector in the sidebar to switch between connected Gmail accounts
- Click "Add another account" to connect additional Google accounts

## Project Structure

```
gmail-reader/
├── server.ts              # Express backend (OAuth, Gmail API, AI proxy)
├── src/
│   ├── App.tsx            # Root component with auth routing
│   ├── main.tsx           # Entry point
│   ├── types.ts           # TypeScript interfaces
│   ├── hooks/
│   │   ├── useAuth.ts     # OAuth state management
│   │   └── useGmail.ts    # Gmail API calls
│   └── components/
│       ├── LoginPage.tsx      # Google OAuth login page
│       ├── Layout.tsx         # Main app layout
│       ├── EmailList.tsx      # Email list with pagination
│       ├── EmailDetail.tsx    # Full email view
│       ├── SearchBar.tsx      # Gmail search with quick filters
│       ├── ChatPanel.tsx      # AI chat interface
│       └── AccountSelector.tsx # Multi-account switcher
├── vite.config.ts         # Vite config with API proxy
├── package.json
└── .env.example
```

## Available AI Models

The app supports multiple AI models through OpenRouter:

| Model | Provider | Best For |
|-------|----------|----------|
| Gemini 2.0 Flash | Google | Fast, free-tier friendly |
| Claude 3.5 Sonnet | Anthropic | High-quality analysis |
| GPT-4o Mini | OpenAI | Balanced speed/quality |
| GPT-4o | OpenAI | Most capable |
| Llama 3.1 70B | Meta | Open-source, fast |
| Mixtral 8x7B | Mistral | Open-source, efficient |

## Security Notes

- API keys are stored server-side only (never sent to the browser)
- Gmail OAuth uses the authorization code flow with refresh tokens
- No data is stored persistently — everything is fetched live from Gmail
- The app only requests read access to your emails

## Troubleshooting

### "No authenticated account found"

Make sure you've completed the Google OAuth flow. Try logging out and back in.

### AI not responding

Check that your `OPENROUTER_API_KEY` is valid and has credits. You can test it:

```bash
curl https://openrouter.ai/api/v1/chat/completions \
  -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"google/gemini-2.0-flash-001","messages":[{"role":"user","content":"Hello"}]}'
```

### CORS errors

Make sure both the Vite dev server (port 5173) and Express backend (port 3001) are running. The `npm run dev` command starts both.

## License

MIT
