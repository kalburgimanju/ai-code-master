# Video Lesson Planner — Features

A complete pipeline for turning a YouTube topic idea into a published,
analytics-tracked video.

---

## 1. AI Lesson Plan Generation

Enter a **title/topic** and a **prompt** (plus how many lessons you want). The
agent calls OpenRouter and returns a structured plan: each lesson gets key
points, talking points, a script outline, suggested resources, and a duration
estimate. The whole plan is stored as a `LessonPlan` with child `Lesson` rows
and a `PromptHistory` record of the exact prompt + AI response.

- Free model by default (`openrouter/free`); configurable via `OPENROUTER_MODEL`.
- Errors are surfaced clearly: missing key → instruction; `402` → "add credits".

## 2. Per-Lesson Script Generation

Each lesson card has a **Generate Script** button. The backend asks OpenRouter
for a complete, professional, **educational** video script (intro → main content
→ summary → outro, with `[SCREEN:]` / `[DEMO:]` visual cues). The script is
attributed to **manjunath kalburgi** and shown inline.

- **Regenerate** re-runs generation for fine-tuning.
- Script text and author are saved on the `Lesson` (`full_script`, `script_author`).

## 3. Script Illustration (Image)

When a script is generated, the backend also attempts to create an
illustrative image from the script content using a Gemini image model, stored
as base64 in `Lesson.script_image` and rendered above the script in the UI.

- **Best-effort:** if image models are unavailable for the key, the script
  still saves and the reason is recorded — nothing blocks.
- Image generation requires an OpenRouter key with image-model access.

## 4. YouTube Title & Description

On the upload page, **Generate Title & Description from Script** uses the
lesson's script to produce a click-worthy, SEO-friendly YouTube title and a
detailed description (hook → what you'll learn → CTA). Enabled once a script
exists.

## 5. PowerPoint Deck from Script

Each lesson's script panel has a **Generate PPT** button. OpenRouter produces a
slide outline (4–7 content slides); `python-pptx` renders a themed deck with:

- **Slide 1 — Welcome:** "Welcome to {topic} by manjunath kalburgi"
- **Middle — Content slides:** title + bullet points
- **Final — Thank You:** "Thank You by manjunath kalburgi"

The `.pptx` is saved to `data/ppt/{lesson_id}.pptx` and downloadable via the
**Download PPT** link.

## 6. Video Recording & Upload

The upload page offers two sources:

- **Upload File** — pick an `.mp4`/video file from disk.
- **Record Video** — record directly in the browser via `MediaRecorder`
  (camera + mic), preview, and re-record if needed.

After connecting YouTube (OAuth2), the chosen video uploads to your channel with
the generated title, description, tags, and privacy setting. The upload is
linked to the lesson (`status` → `uploaded`) and a `YouTubeVideo` row records
the video id and stats.

## 7. YouTube Analytics

The **Analytics** page aggregates views and likes across all uploaded videos and
lists per-video performance (views / likes / comments + a Watch link). A
**Refresh Analytics** button re-pulls live stats from the YouTube Data API.

## 8. Storage & History

Everything persists in SQLite (auto-migrating schema):

- Plans, lessons, scripts, images, PPT paths
- YouTube video metadata + stats
- Drive links for uploaded scripts/PPTs
- Prompt history for every AI generation

No data is lost between sessions; restart the app and your plans are there.

## 9. Google Drive Export

From a lesson's script panel, **Upload to Drive** sends the lesson to Google Drive:

- The **script** is uploaded as an editable **Google Doc** (titled "`<lesson> — by manjunath kalburgi`").
- The **PPT** is uploaded as a `.pptx` file.
- The **script** lands in the folder set by `GOOGLE_DRIVE_SCRIPT_FOLDER_ID`; the
  **PPT** lands in `GOOGLE_DRIVE_PPT_FOLDER_ID` (both in `.env`).
- After upload, **View on Drive** links open the files.

Drive reuses the **same Google OAuth token** as YouTube, so it needs the
`drive.file` scope — **reconnect via the YouTube Connect button once** after this
feature is enabled (the old token only had YouTube scopes).

---

## Quick Reference — Endpoints

| Method | Path                                                      | What it does                          |
|--------|-----------------------------------------------------------|---------------------------------------|
| POST   | `/api/agent/generate`                                     | Generate full plan from prompt        |
| GET    | `/api/plans`                                              | List plans                            |
| GET    | `/api/plans/{id}`                                         | Plan + lessons                        |
| GET    | `/api/plans/{id}/lessons/{lid}`                           | Single lesson                         |
| PUT    | `/api/plans/{id}/lessons/{lid}`                           | Edit lesson                           |
| DELETE | `/api/plans/{id}`                                         | Delete plan                           |
| POST   | `/api/plans/{id}/lessons/{lid}/generate-script`          | Generate / regenerate script (+image) |
| POST   | `/api/plans/{id}/lessons/{lid}/generate-metadata`        | YouTube title + description           |
| POST   | `/api/plans/{id}/lessons/{lid}/generate-ppt`             | Build PPTX                            |
| GET    | `/api/plans/{id}/lessons/{lid}/ppt`                       | Download PPTX                         |
| POST   | `/api/drive/upload/{id}/lessons/{lid}`                    | Upload script (Doc) + PPT to Drive    |
| GET    | `/api/youtube/auth-url`                                   | OAuth URL                             |
| GET    | `/api/youtube/callback`                                   | OAuth callback                        |
| GET    | `/api/youtube/status`                                     | Auth status                           |
| POST   | `/api/youtube/upload`                                     | Upload video                          |
| GET    | `/api/youtube/analytics/{vid}`                            | Per-video stats                       |
| POST   | `/api/youtube/refresh`                                    | Refresh all stats                     |
