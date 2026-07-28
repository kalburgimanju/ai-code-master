"""YouTube Data API v3 service wrapper."""

import json
from pathlib import Path
from typing import Any

from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

from backend.config import settings

# Store tokens here
TOKEN_PATH = Path("data/youtube_token.json")
CREDENTIALS_PATH = Path("data/youtube_credentials.json")
VERIFIER_PATH = Path("data/youtube_verifier.json")

SCOPES = [
    "https://www.googleapis.com/auth/youtube",
    "https://www.googleapis.com/auth/youtube.upload",
    "https://www.googleapis.com/auth/drive.file",
]


def _build_credentials_dict() -> dict:
    """Build OAuth2 credentials JSON for Google client."""
    return {
        "web": {
            "client_id": settings.youtube_client_id,
            "client_secret": settings.youtube_client_secret,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "redirect_uris": [settings.youtube_redirect_uri],
        }
    }


def get_auth_url() -> str:
    """Generate the YouTube OAuth2 authorization URL."""
    CREDENTIALS_PATH.parent.mkdir(exist_ok=True)
    CREDENTIALS_PATH.write_text(json.dumps(_build_credentials_dict()))

    flow = InstalledAppFlow.from_client_secrets_file(str(CREDENTIALS_PATH), SCOPES)
    flow.redirect_uri = settings.youtube_redirect_uri
    auth_url, _ = flow.authorization_url(access_type="offline", prompt="consent")
    # Persist the PKCE code_verifier so the token exchange (a fresh flow
    # instance) can verify the authorization code returned by Google.
    VERIFIER_PATH.write_text(json.dumps({"code_verifier": flow.code_verifier}), encoding="utf-8")
    return auth_url


def complete_auth(code: str) -> Credentials:
    """Exchange authorization code for tokens."""
    flow = InstalledAppFlow.from_client_secrets_file(str(CREDENTIALS_PATH), SCOPES)
    flow.redirect_uri = settings.youtube_redirect_uri
    if VERIFIER_PATH.exists():
        saved = json.loads(VERIFIER_PATH.read_text(encoding="utf-8"))
        flow.code_verifier = saved.get("code_verifier")
    flow.fetch_token(code=code)
    credentials = flow.credentials

    # Save token and clean up the verifier file
    TOKEN_PATH.write_text(credentials.to_json())
    VERIFIER_PATH.unlink(missing_ok=True)
    return credentials


def _load_credentials() -> Credentials | None:
    """Load saved YouTube credentials."""
    if not TOKEN_PATH.exists():
        return None
    return Credentials.from_authorized_user_file(str(TOKEN_PATH), SCOPES)


def is_authenticated() -> bool:
    """Check if YouTube is authenticated."""
    creds = _load_credentials()
    return creds is not None and creds.valid


def _get_service():
    """Get authenticated YouTube API service."""
    creds = _load_credentials()
    if not creds:
        raise RuntimeError("YouTube not authenticated. Visit /api/youtube/auth-url first.")
    return build("youtube", "v3", credentials=creds)


def has_drive_scope() -> bool:
    """Return True if the stored credentials include the Drive scope."""
    creds = _load_credentials()
    if not creds:
        return False
    granted = creds.scopes or []
    return "https://www.googleapis.com/auth/drive.file" in granted


def get_drive_service():
    """Get an authenticated Google Drive API service.

    Reuses the same OAuth token as YouTube. The token must have been authorized
    with the drive.file scope — re-run the YouTube Connect flow if not.
    """
    creds = _load_credentials()
    if not creds:
        raise RuntimeError("Google not authenticated. Visit /api/youtube/auth-url first.")
    if "https://www.googleapis.com/auth/drive.file" not in (creds.scopes or []):
        raise RuntimeError(
            "Google token lacks Drive access. Reconnect via /api/youtube/auth-url "
            "to grant Google Drive permissions, then retry."
        )
    return build("drive", "v3", credentials=creds)


def upload_video(
    file_path: str,
    title: str,
    description: str,
    tags: list[str] | None = None,
    privacy_status: str = "private",
) -> dict[str, Any]:
    """Upload a video file to YouTube."""
    youtube = _get_service()

    body = {
        "snippet": {
            "title": title,
            "description": description,
            "tags": tags or [],
            "categoryId": "28",  # Science & Technology
        },
        "status": {
            "privacyStatus": privacy_status,
            "selfDeclaredMadeForKids": False,
        },
    }

    media = MediaFileUpload(file_path, mimetype="video/mp4", resumable=True)
    request = youtube.videos().insert(part="snippet,status", body=body, media_body=media)

    response = None
    while response is None:
        status, response = request.next_chunk()
        if status:
            print(f"Uploaded {int(status.progress() * 100)}%")

    return {
        "video_id": response["id"],
        "title": response["snippet"]["title"],
        "status": response["status"]["uploadStatus"],
    }


def get_video_analytics(video_id: str) -> dict[str, Any]:
    """Fetch analytics for a specific YouTube video."""
    youtube = _get_service()
    response = youtube.videos().list(part="statistics,snippet", id=video_id).execute()

    if not response.get("items"):
        return {"error": "Video not found"}

    item = response["items"][0]
    stats = item["statistics"]
    return {
        "video_id": video_id,
        "title": item["snippet"]["title"],
        "view_count": int(stats.get("viewCount", 0)),
        "like_count": int(stats.get("likeCount", 0)),
        "comment_count": int(stats.get("commentCount", 0)),
        "favorite_count": int(stats.get("favoriteCount", 0)),
    }


def refresh_all_analytics(video_ids: list[str]) -> list[dict]:
    """Refresh analytics for multiple videos."""
    results = []
    for vid in video_ids:
        try:
            analytics = get_video_analytics(vid)
            results.append(analytics)
        except Exception as e:
            results.append({"video_id": vid, "error": str(e)})
    return results
