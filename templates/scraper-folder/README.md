# AI Automation Job Scraper

Finds high-paying remote AI automation jobs with few applicants. Scrapes LinkedIn Jobs via Apify API, filters for roles requiring n8n, Claude, Make, Zapier, and other automation tools.

## Quick Start

```bash
# 1. Copy environment config
cp .env.example .env
# Edit .env and set APIFY_API_TOKEN

# 2. Install dependencies
uv sync

# 3. Run scraper
uv run ai-scraper scrape

# 4. Export top 15 jobs
uv run ai-scraper export --top 15 --format csv

# 5. Start dashboard
cd dashboard && npm install && npm run dev
```

## Google Drive Auto-Upload Setup

Automatically upload scraped job exports to your Google Drive folder.

### 1. Create Google Cloud Project & OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable **Google Drive API** (APIs & Services → Library → Google Drive API → Enable)
4. Create OAuth 2.0 credentials:
   - Go to **APIs & Services → Credentials**
   - Click **Create Credentials → OAuth client ID**
   - Application type: **Desktop app**
   - Name: "AI Job Scraper"
   - Download the JSON file
5. Save as `credentials.json` in the project root

### 2. Configure config.yaml

```yaml
google_drive:
  enabled: true
  credentials_file: "./credentials.json"
  token_file: "./token.json"  # Auto-generated after first auth
  folder_id: "1-1iuCz6yGYg_DYUxJFozIGIaZtMpE6R2"  # Your folder ID
  upload_formats:
    - "csv"
    - "json"
```

**To get your folder ID:** Navigate to your Google Drive folder in browser, the URL will be like:
`https://drive.google.com/drive/u/0/folders/1-1iuCz6yGYg_DYUxJFozIGIaZtMpE6R2`
The folder ID is the long string after `/folders/`.

### 3. First Run - Authorize

```bash
uv run ai-scraper upload-drive
```

This will open a browser for Google OAuth consent. After authorizing, a `token.json` will be created for future runs.

### 4. Automatic Upload After Scrape

Once configured, exports are **automatically uploaded** after every `ai-scraper scrape` run!

You can also manually upload:
```bash
# Upload both CSV and JSON
uv run ai-scraper upload-drive

# Upload only CSV
uv run ai-scraper upload-drive --format csv

# Upload only JSON
uv run ai-scraper upload-drive --format json
```

## Features

- **Smart filtering**: Finds jobs with <50 applicants, $65k-$160k salary, remote, contractor-friendly
- **AI automation detection**: Identifies roles requiring n8n, Claude, Make, Zapier, LLM integration
- **Weekly scheduling**: Runs automatically via cron or APScheduler
- **Web dashboard**: React + Vite + Tailwind dashboard to browse and filter results
- **CSV/JSON export**: Export top listings with direct apply links
- **Google Drive sync**: Auto-upload exports to your Drive folder
- **Cost tracking**: Estimates Apify API costs per run (~$0.50-$1.00)

## Configuration

Edit `config.yaml` to customize:
- Search queries and keywords
- Salary range and applicant limits
- Tracked skills
- Export settings
- Google Drive upload

## Deployment

```bash
# Deploy to Linux VPS
bash scripts/deploy.sh your-vps-host

# Setup weekly cron
bash scripts/setup_cron.sh
```

## Cost

- Apify API: ~$0.05 per query run × 15 queries = ~$0.75 per weekly run
- VPS: ~$5/month for a basic Linux VPS
- Total: <$6/month for automated weekly job discovery
