"""AI agent endpoint for generating lesson plans."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from backend.database import get_db
from backend.models import Lesson, LessonPlan, PromptHistory
from backend.schemas import GeneratePlanRequest, GeneratePlanResponse
from backend.services.openrouter import generate_lesson_plan

router = APIRouter(prefix="/api/agent", tags=["agent"])


@router.post("/generate", response_model=GeneratePlanResponse)
async def generate_plan(body: GeneratePlanRequest, db: Session = Depends(get_db)):
    """Generate a lesson plan using AI and store it."""
    # Create the plan record
    plan = LessonPlan(title=body.title, prompt=body.prompt, status="draft")
    db.add(plan)
    db.commit()
    db.refresh(plan)

    try:
        result = await generate_lesson_plan(
            title=body.title,
            prompt=body.prompt,
            num_lessons=body.num_lessons or 5,
            model=body.model,
        )
    except Exception as e:
        plan.status = "error"
        db.commit()
        msg = str(e)
        if "401" in msg or "Unauthorized" in msg:
            raise HTTPException(
                status_code=502,
                detail=(
                    "OpenRouter API key is invalid or missing. "
                    "Set a valid OPENROUTER_API_KEY in your .env file. "
                    "Get your key at https://openrouter.ai/keys"
                ),
            )
        if "402" in msg or "Payment Required" in msg:
            raise HTTPException(
                status_code=502,
                detail=(
                    "OpenRouter account has no credits. "
                    "Add credits at https://openrouter.ai/credits"
                ),
            )
        raise HTTPException(status_code=502, detail=f"AI generation failed: {e}")

    # Update plan with AI result
    plan.title = result.get("title", body.title)
    plan.status = "generated"
    plan.ai_model = result.get("_model", "")
    db.commit()

    # Create lesson records
    for lesson_data in result.get("lessons", []):
        lesson = Lesson(
            plan_id=plan.id,
            lesson_number=lesson_data.get("lesson_number", 0),
            title=lesson_data.get("title", ""),
            description=lesson_data.get("description", ""),
            key_points=lesson_data.get("key_points", []),
            talking_points=lesson_data.get("talking_points", []),
            script_outline=lesson_data.get("script_outline", ""),
            resources=lesson_data.get("resources", []),
            duration_minutes=lesson_data.get("duration_minutes", 10),
        )
        db.add(lesson)

    # Save prompt history
    prompt_record = PromptHistory(
        plan_id=plan.id,
        raw_prompt=body.prompt,
        ai_response=result,
        model_used=result.get("_model", ""),
        tokens_used=result.get("_tokens", 0),
    )
    db.add(prompt_record)
    db.commit()

    # Reload with relationships
    plan = (
        db.query(LessonPlan)
        .options(joinedload(LessonPlan.lessons))
        .filter(LessonPlan.id == plan.id)
        .first()
    )
    plan.lessons.sort(key=lambda les: les.lesson_number)

    prompt_record = db.query(PromptHistory).filter(PromptHistory.plan_id == plan.id).first()

    return GeneratePlanResponse(plan=plan, prompt_history=prompt_record)
