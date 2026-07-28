"""YouTube OAuth2, upload, and analytics endpoints."""

from datetime import UTC, datetime

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from backend.config import settings
from backend.database import get_db
from backend.models import Lesson, YouTubeVideo
from backend.schemas import (
    YouTubeAuthUrlResponse,
    YouTubeUploadResponse,
    YouTubeVideoResponse,
)
from backend.services import youtube as yt_service

router = APIRouter(prefix="/api/youtube", tags=["youtube"])


@router.get("/auth-url", response_model=YouTubeAuthUrlResponse)
def get_auth_url():
    """Get YouTube OAuth2 authorization URL."""
    try:
        url = yt_service.get_auth_url()
        return YouTubeAuthUrlResponse(auth_url=url)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/callback")
def auth_callback(code: str, db: Session = Depends(get_db)):
    """YouTube OAuth2 callback — exchanges code for tokens."""
    try:
        yt_service.complete_auth(code)
        return {"status": "authenticated", "message": "YouTube connected successfully"}
    except Exception as e:
        msg = str(e)
        if "redirect_uri_mismatch" in msg or "redirect_uri" in msg.lower():
            raise HTTPException(
                status_code=400,
                detail=(
                    "redirect_uri_mismatch: The redirect URI in your request "
                    f"({settings.youtube_redirect_uri}) does not match what is "
                    "registered in Google Cloud Console. Go to "
                    "https://console.cloud.google.com/apis/credentials, edit your "
                    "OAuth2 client, and make sure the authorized redirect URI is exactly: "
                    f"{settings.youtube_redirect_uri}"
                ),
            )
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/status")
def auth_status():
    """Check if YouTube is authenticated."""
    return {"authenticated": yt_service.is_authenticated()}


@router.post("/upload", response_model=YouTubeUploadResponse)
async def upload_video(
    lesson_id: str = Form(...),
    title: str = Form(...),
    description: str = Form(""),
    tags: str = Form(""),
    privacy_status: str = Form("private"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """Upload a video file to YouTube and link it to a lesson."""
    if not yt_service.is_authenticated():
        raise HTTPException(status_code=401, detail="YouTube not authenticated")

    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    # Save uploaded file temporarily
    import os
    import tempfile

    suffix = os.path.splitext(file.filename or "video.mp4")[1]
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    try:
        tag_list = [t.strip() for t in tags.split(",") if t.strip()] if tags else []
        result = yt_service.upload_video(
            file_path=tmp_path,
            title=title,
            description=description,
            tags=tag_list,
            privacy_status=privacy_status,
        )

        # Store video record
        video = YouTubeVideo(
            lesson_id=lesson_id,
            youtube_video_id=result["video_id"],
            title=result["title"],
            description=description,
            tags=tag_list,
            upload_date=datetime.now(UTC),
        )
        db.add(video)
        lesson.status = "uploaded"
        db.commit()
        db.refresh(video)

        return YouTubeUploadResponse(
            video_id=result["video_id"],
            title=result["title"],
            status=result["status"],
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {e}")
    finally:
        os.unlink(tmp_path)


@router.get("/analytics/{video_id}", response_model=YouTubeVideoResponse)
def get_analytics(video_id: str, db: Session = Depends(get_db)):
    """Get analytics for a video by its YouTube video ID."""
    video = db.query(YouTubeVideo).filter(YouTubeVideo.youtube_video_id == video_id).first()
    if not video:
        raise HTTPException(status_code=404, detail="Video not found in database")

    try:
        analytics = yt_service.get_video_analytics(video_id)
        video.view_count = analytics.get("view_count", 0)
        video.like_count = analytics.get("like_count", 0)
        video.comment_count = analytics.get("comment_count", 0)
        video.last_fetched_at = datetime.now(UTC)
        db.commit()
        db.refresh(video)
    except Exception:
        pass  # Return cached data if API fails

    return video


@router.post("/refresh")
def refresh_analytics(db: Session = Depends(get_db)):
    """Refresh analytics for all uploaded videos."""
    videos = db.query(YouTubeVideo).all()
    refreshed = 0
    for video in videos:
        try:
            analytics = yt_service.get_video_analytics(video.youtube_video_id)
            video.view_count = analytics.get("view_count", 0)
            video.like_count = analytics.get("like_count", 0)
            video.comment_count = analytics.get("comment_count", 0)
            video.last_fetched_at = datetime.now(UTC)
            refreshed += 1
        except Exception:
            continue
    db.commit()
    return {"refreshed": refreshed, "total": len(videos)}
