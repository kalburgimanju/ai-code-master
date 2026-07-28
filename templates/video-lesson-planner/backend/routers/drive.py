"""Google Drive upload endpoints for lessons."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.config import settings
from backend.database import get_db
from backend.models import Lesson
from backend.schemas import GenerateDriveResponse
from backend.services import drive as drive_service

router = APIRouter(prefix="/api/drive", tags=["drive"])


@router.post("/upload/{plan_id}/lessons/{lesson_id}", response_model=GenerateDriveResponse)
def upload_lesson(plan_id: str, lesson_id: str, db: Session = Depends(get_db)):
    """Upload a lesson's script (as a Google Doc) and PPT (.pptx) to Google Drive."""
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id, Lesson.plan_id == plan_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    if not lesson.full_script:
        raise HTTPException(
            status_code=400, detail="No script found for this lesson. Generate the script first."
        )
    if not lesson.ppt_path:
        raise HTTPException(
            status_code=400, detail="No PPT found for this lesson. Generate the PPT first."
        )
    if not settings.google_drive_script_folder_id:
        raise HTTPException(
            status_code=400,
            detail="GOOGLE_DRIVE_SCRIPT_FOLDER_ID is not set. Add the script folder ID to .env.",
        )
    if not settings.google_drive_ppt_folder_id:
        raise HTTPException(
            status_code=400,
            detail="GOOGLE_DRIVE_PPT_FOLDER_ID is not set. Add the presentations folder ID.",
        )

    try:
        result = drive_service.upload_lesson_to_drive(
            lesson, settings.google_drive_script_folder_id, settings.google_drive_ppt_folder_id
        )
    except Exception as e:
        msg = str(e)
        # The token was likely authorized with only YouTube scopes. The Drive API
        # returns 403 "insufficient authentication scopes" in that case.
        insufficient = (
            "lacks Drive access" in msg
            or "drive.file" in msg
            or "403" in msg
            or "invalid_scope" in msg
            or "insufficient authentication scopes" in msg
            or "Request had insufficient" in msg
        )
        if insufficient:
            raise HTTPException(
                status_code=401,
                detail=(
                    "Google token lacks Drive access (it only has YouTube scopes). "
                    "Reconnect via /api/youtube/auth-url to grant Drive permissions, then retry."
                ),
            )
        if "not authenticated" in msg:
            raise HTTPException(
                status_code=401,
                detail="Google not authenticated. Connect via /api/youtube/auth-url first.",
            )
        raise HTTPException(status_code=502, detail=f"Drive upload failed: {e}")

    lesson.drive_script_link = result["script_doc_link"]
    lesson.drive_ppt_link = result["ppt_file_link"]
    db.commit()

    return GenerateDriveResponse(**result)
