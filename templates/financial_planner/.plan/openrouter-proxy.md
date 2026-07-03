# Plan: Fix OpenRouter 401 Error in financial_planner

## Problem
The financial_planner frontend makes direct browser-side calls to OpenRouter using an API key stored in localStorage. If no key is entered (or it's invalid), the request fails with 401. The root `.env` has an `OPENROUTER_API_KEY` but the client can't access server-side env vars.

## Solution
Create a Next.js API route that proxies OpenRouter calls server-side, reading the API key from `process.env`. The client calls this proxy instead of OpenRouter directly. Optionally keep the UI key input as a user override.

## Files to Create/Modify

### 1. `next.config.js` — Remove static export
- Remove `output: 'export'` (required for API routes to work)

### 2. `netlify.toml` — Enable Next.js runtime
- Add `@netlify/plugin-nextjs` plugin (Netlify's official Next.js adapter for server-side features)

### 3. **NEW** `src/app/api/openrouter/route.ts` — Server-side proxy
- `POST` handler that reads `OPENROUTER_API_KEY` from `process.env`
- Accepts `{ messages, model, apiKey? }` from the client
- Uses the user-provided key if present, otherwise falls back to env var
- Proxies to `https://openrouter.ai/api/v1/chat/completions`
- Returns the response to the client

### 4. `src/lib/openrouter.ts` — Update client to use proxy
- Change `callOpenRouter()` to POST to `/api/openrouter` instead of calling OpenRouter directly
- Pass messages and model to the API route; pass optional user apiKey override

### 5. `src/app/planner/page.tsx` — Minor update
- Pass `apiKey` to the proxy call so user-provided keys still work as override

### 6. `src/app/agents/[type]/page.tsx` — Minor update
- Same: pass `apiKey` to the proxy call

### 7. `.env.local` — Create for local dev
- Add `OPENROUTER_API_KEY=sk-or-v1-...` placeholder (user fills in their actual key)

## Approach Detail

The proxy route acts as a **fallback**: if the user enters a key in the UI, that takes priority. If they don't, the server-side env var is used. This means:
- Existing users who already entered a key → no change in behavior
- New users who never entered a key → AI features "just work" via the server-side key
- The 401 error goes away for everyone

## Verification
1. `cd templates/financial_planner && npm run build` — confirm build succeeds
2. `npm run dev` — start dev server, open planner, use AI tab without entering a key → should work
3. Verify the proxy route at `http://localhost:3000/api/openrouter` responds correctly
