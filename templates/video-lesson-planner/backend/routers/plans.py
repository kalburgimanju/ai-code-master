"""CRUD endpoints for lesson plans."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from backend.database import get_db
from backend.models import Lesson, LessonPlan
from backend.schemas import (
    GenerateMetadataResponse,
    GeneratePptResponse,
    GenerateScriptRequest,
    GenerateScriptResponse,
    LessonPlanCreate,
    LessonPlanDetail,
    LessonPlanResponse,
    LessonPlanUpdate,
    LessonResponse,
    LessonUpdate,
)
from backend.services import ppt as ppt_service
from backend.services.openrouter import (
    generate_lesson_script,
    generate_ppt_outline,
    generate_script_image,
    generate_video_metadata,
)

router = APIRouter(prefix="/api/plans", tags=["plans"])


@router.get("", response_model=list[LessonPlanResponse])
def list_plans(db: Session = Depends(get_db)):
    plans = db.query(LessonPlan).order_by(LessonPlan.created_at.desc()).all()
    return plans


@router.post("", response_model=LessonPlanDetail, status_code=201)
def create_plan(body: LessonPlanCreate, db: Session = Depends(get_db)):
    plan = LessonPlan(title=body.title, prompt=body.prompt, status="draft")
    db.add(plan)
    db.commit()
    db.refresh(plan)
    plan.lessons = []
    return plan


@router.get("/{plan_id}", response_model=LessonPlanDetail)
def get_plan(plan_id: str, db: Session = Depends(get_db)):
    plan = (
        db.query(LessonPlan)
        .options(joinedload(LessonPlan.lessons))
        .filter(LessonPlan.id == plan_id)
        .first()
    )
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    plan.lessons.sort(key=lambda les: les.lesson_number)
    return plan


@router.put("/{plan_id}", response_model=LessonPlanResponse)
def update_plan(plan_id: str, body: LessonPlanUpdate, db: Session = Depends(get_db)):
    plan = db.query(LessonPlan).filter(LessonPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    if body.title is not None:
        plan.title = body.title
    if body.status is not None:
        plan.status = body.status
    db.commit()
    db.refresh(plan)
    return plan


@router.delete("/{plan_id}", status_code=204)
def delete_plan(plan_id: str, db: Session = Depends(get_db)):
    plan = db.query(LessonPlan).filter(LessonPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    db.delete(plan)
    db.commit()


@router.put("/{plan_id}/lessons/{lesson_id}", response_model=LessonResponse)
def update_lesson(
    plan_id: str,
    lesson_id: str,
    body: LessonUpdate,
    db: Session = Depends(get_db),
):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id, Lesson.plan_id == plan_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(lesson, field, value)
    db.commit()
    db.refresh(lesson)
    return lesson


@router.post(
    "/{plan_id}/lessons/{lesson_id}/generate-script", response_model=GenerateScriptResponse
)
async def generate_script(
    plan_id: str,
    lesson_id: str,
    body: GenerateScriptRequest | None = None,
    db: Session = Depends(get_db),
):
    """Generate or regenerate a full professional script for a lesson."""
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id, Lesson.plan_id == plan_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    model = body.model if body else None

    try:
        result = await generate_lesson_script(
            lesson_title=lesson.title,
            lesson_description=lesson.description,
            key_points=lesson.key_points or [],
            talking_points=lesson.talking_points or [],
            script_outline=lesson.script_outline,
            duration_minutes=lesson.duration_minutes,
            author="manjunath kalburgi",
            model=model,
        )
    except Exception as e:
        msg = str(e)
        if "401" in msg or "Unauthorized" in msg:
            raise HTTPException(
                status_code=502,
                detail="OpenRouter API key is invalid.",
            )
        if "402" in msg or "Payment Required" in msg:
            raise HTTPException(
                status_code=502,
                detail="OpenRouter account has no credits. Add credits at https://openrouter.ai/credits",
            )
        raise HTTPException(status_code=502, detail=f"Script generation failed: {e}")

    lesson.full_script = result.get("full_script", "")
    lesson.script_author = result.get("author", "manjunath kalburgi")

    # Generate an illustrative image from the script (best-effort).
    try:
        image_result = await generate_script_image(
            lesson_title=lesson.title,
            full_script=lesson.full_script,
            author=lesson.script_author or "manjunath kalburgi",
        )
        lesson.script_image = image_result.get("image_base64", "")
        lesson.image_prompt = image_result.get("image_prompt", "")
    except Exception as img_err:
        # Non-fatal: store empty image, keep the script.
        msg = str(img_err)
        auth_fail = "401" in msg or "User not found" in msg or "Unauthorized" in msg
        if auth_fail:
            lesson.image_prompt = "(image unavailable: OpenRouter key lacks image-model access)"
        else:
            lesson.image_prompt = f"(image generation skipped: {img_err})"

    db.commit()
    db.refresh(lesson)

    return GenerateScriptResponse(
        lesson=lesson,
        model_used=result.get("_model", ""),
        tokens_used=result.get("_tokens", 0),
    )


@router.get("/{plan_id}/lessons/{lesson_id}", response_model=LessonResponse)
def get_lesson(plan_id: str, lesson_id: str, db: Session = Depends(get_db)):
    """Get a single lesson by ID."""
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id, Lesson.plan_id == plan_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return lesson


@router.post(
    "/{plan_id}/lessons/{lesson_id}/generate-metadata", response_model=GenerateMetadataResponse
)
async def generate_metadata(
    plan_id: str,
    lesson_id: str,
    db: Session = Depends(get_db),
):
    """Generate a YouTube title and description from the lesson's script."""
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id, Lesson.plan_id == plan_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    if not lesson.full_script:
        raise HTTPException(
            status_code=400,
            detail="No script found for this lesson. Generate the script first.",
        )

    try:
        result = await generate_video_metadata(
            lesson_title=lesson.title,
            full_script=lesson.full_script,
            author=lesson.script_author or "manjunath kalburgi",
        )
    except Exception as e:
        msg = str(e)
        if "401" in msg or "Unauthorized" in msg:
            raise HTTPException(status_code=502, detail="OpenRouter API key is invalid.")
        if "402" in msg or "Payment Required" in msg:
            raise HTTPException(
                status_code=502,
                detail="OpenRouter account has no credits. Add credits at https://openrouter.ai/credits",
            )
        raise HTTPException(status_code=502, detail=f"Metadata generation failed: {e}")

    return GenerateMetadataResponse(
        title=result.get("title", lesson.title),
        description=result.get("description", ""),
        model_used=result.get("_model", ""),
        tokens_used=result.get("_tokens", 0),
    )


@router.post("/{plan_id}/lessons/{lesson_id}/generate-ppt", response_model=GeneratePptResponse)
async def generate_ppt(plan_id: str, lesson_id: str, db: Session = Depends(get_db)):
    """Generate a PowerPoint deck from the lesson's script."""
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id, Lesson.plan_id == plan_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    if not lesson.full_script:
        raise HTTPException(
            status_code=400,
            detail="No script found for this lesson. Generate the script first.",
        )

    try:
        outline = await generate_ppt_outline(
            lesson_title=lesson.title,
            full_script=lesson.full_script,
        )
        slides = outline.get("slides", [])
        if not slides:
            raise ValueError("Model returned no slides.")
        out_path = f"data/ppt/{lesson_id}.pptx"
        ppt_service.build_pptx(lesson.title, slides, out_path)
    except Exception as e:
        msg = str(e)
        if "401" in msg or "Unauthorized" in msg:
            raise HTTPException(status_code=502, detail="OpenRouter API key is invalid.")
        if "402" in msg or "Payment Required" in msg:
            raise HTTPException(
                status_code=502,
                detail="OpenRouter account has no credits. Add credits at https://openrouter.ai/credits",
            )
        raise HTTPException(status_code=502, detail=f"PPT generation failed: {e}")

    lesson.ppt_path = out_path
    db.commit()

    return GeneratePptResponse(
        ppt_path=out_path,
        download_url=f"/api/plans/{plan_id}/lessons/{lesson_id}/ppt",
        slides_count=len(slides),
        model_used=outline.get("_model", ""),
        tokens_used=outline.get("_tokens", 0),
    )


@router.get("/{plan_id}/lessons/{lesson_id}/ppt")
def download_ppt(plan_id: str, lesson_id: str, db: Session = Depends(get_db)):
    """Download the generated PowerPoint file for a lesson."""
    from fastapi.responses import FileResponse

    lesson = db.query(Lesson).filter(Lesson.id == lesson_id, Lesson.plan_id == plan_id).first()
    if not lesson or not lesson.ppt_path:
        raise HTTPException(status_code=404, detail="No PPT generated for this lesson")
    from pathlib import Path

    if not Path(lesson.ppt_path).exists():
        raise HTTPException(status_code=404, detail="PPT file not found on disk")
    return FileResponse(
        lesson.ppt_path,
        media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
        filename=f"{lesson.title or 'lesson'}.pptx",
    )
