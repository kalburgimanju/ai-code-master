# Deployment Guide

## Prerequisites

- Node.js 18+
- npm or yarn
- Vercel account
- GitHub account
- OpenRouter API key (free)

## Step 1: Clone and Install

```bash
git clone https://github.com/kalburgimanju/ai-code-master.git
cd ai-code-master/templates/ytfaceless
npm install
```

## Step 2: Environment Variables

Copy the example environment file and fill in your values:

```bash
cp .env.example .env.local
```

Required variables:

| Variable | Description | How to Get |
|----------|-------------|------------|
| `OPENROUTER_API_KEY` | OpenRouter API key | https://openrouter.ai/keys |
| `YOUTUBE_CLIENT_ID` | YouTube OAuth client ID | Google Cloud Console |
| `YOUTUBE_CLIENT_SECRET` | YouTube OAuth client secret | Google Cloud Console |
| `YOUTUBE_REDIRECT_URI` | OAuth callback URL | Set to `http://localhost:3001/api/youtube/callback` for local |
| `CRON_SECRET` | Secret for cron endpoints | Generate with `openssl rand -hex 32` |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token | Vercel Dashboard → Storage |
| `KV_REST_API_URL` | Vercel KV URL | Vercel Dashboard → Storage |
| `KV_REST_API_TOKEN` | Vercel KV token | Vercel Dashboard → Storage |

## Step 3: Local Development

```bash
npm run dev
```

Open http://localhost:3001

## Step 4: Vercel Deployment

### Option A: Deploy via CLI

```bash
npx vercel --yes --prod
```

### Option B: Deploy via GitHub

1. Push to GitHub
2. Go to https://vercel.com/new
3. Import the repository
4. Set the root directory to `templates/ytfaceless`
5. Add environment variables
6. Deploy

### Option C: Auto-deploy

Once connected, every push to `main` triggers automatic deployment.

## Step 5: Set Environment Variables on Vercel

```bash
# Add each variable
npx vercel env add OPENROUTER_API_KEY production
npx vercel env add YOUTUBE_CLIENT_ID production
npx vercel env add YOUTUBE_CLIENT_SECRET production
# ... etc
```

Or add them via the Vercel Dashboard:
1. Go to your project
2. Settings → Environment Variables
3. Add each variable for Production environment

## Step 6: YouTube OAuth Setup

1. Go to https://console.cloud.google.com
2. Create a new project or select existing
3. Enable YouTube Data API v3
4. Go to Credentials → Create OAuth 2.0 Client ID
5. Set Application type to "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:3001/api/youtube/callback` (local)
   - `https://ytfaceless.vercel.app/api/youtube/callback` (production)
7. Copy Client ID and Client Secret to environment variables

## Step 7: Connect YouTube Channel

1. Open your deployed app
2. Go to `/channels`
3. Click "Add Channel"
4. Fill in channel details
5. Click the YouTube auth link to connect
6. Grant permissions in Google consent screen
7. Channel is now connected

## Step 8: Activate Daily Pipeline

The cron job runs automatically at noon UTC daily. To trigger manually:

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://ytfaceless.vercel.app/api/daily-upload
```

Or via Vercel Dashboard:
1. Go to your project
2. Deployments → Functions
3. Find `/api/daily-upload`
4. Click "Invoke"

## Verify Deployment

Check all routes return 200:

```bash
for page in "/" "/login" "/signup" "/ideas" "/scripts" "/seo" "/analytics" "/pricing" "/channels" "/pipeline"; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "https://ytfaceless.vercel.app$page")
  echo "$page → $code"
done
```

Test script generation:

```bash
curl -X POST https://ytfaceless.vercel.app/api/scripts/generate \
  -H "Content-Type: application/json" \
  -d '{"topic":"AI tools","niche":"tech"}'
```

## Troubleshooting

### Build fails with type errors

```bash
npx next build
```

Check the error output and fix TypeScript issues.

### Script generation returns error

1. Verify `OPENROUTER_API_KEY` is set
2. Check OpenRouter dashboard for rate limits
3. Try a different free model

### YouTube upload fails

1. Verify OAuth tokens are valid
2. Check YouTube API quota in Google Cloud Console
3. Re-authenticate via `/api/youtube/auth`

### Cron job not running

1. Check `vercel.json` has correct cron syntax
2. Verify `CRON_SECRET` is set
3. Check Vercel Dashboard → Functions → Cron Jobs

## Cost

All AI capabilities use free tier:

| Service | Cost |
|---------|------|
| OpenRouter (free models) | $0 |
| Pollinations.ai (thumbnails) | $0 |
| YouTube Data API | $0 (10K units/day) |
| Vercel (hosting) | $0 (Hobby) or $20 (Pro) |
| Vercel KV | $0 (30K commands/day) |
| Vercel Blob | $0 (500MB) |
| **Total** | **$0 - $20/month** |
