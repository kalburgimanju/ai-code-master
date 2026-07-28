"""FastAPI application for the AI Course Platform."""

import logging
from datetime import datetime
from typing import Any

from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from services.course_manager import CourseManager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize course manager
course_manager = CourseManager()

# Create FastAPI app
app = FastAPI(
    title="AI Course Platform API",
    version="1.0.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Request / Response models
# ---------------------------------------------------------------------------


class CreateCourseRequest(BaseModel):
    """Request body for creating a course."""

    title: str
    description: str = ""
    topic: str
    level: str = "beginner"
    duration_weeks: int = 4
    objectives: list[str] = Field(default_factory=list)
    generate_lesson_plan: bool = True
    target_audience: str = "students"


class UpdateCourseRequest(BaseModel):
    """Request body for updating a course."""

    title: str | None = None
    description: str | None = None
    topic: str | None = None
    level: str | None = None
    duration_weeks: int | None = None
    objectives: list[str] | None = None


class GenerateLessonsRequest(BaseModel):
    """Request body for generating lessons."""

    topics: list[str]


class EnrollStudentRequest(BaseModel):
    """Request body for enrolling a student."""

    student_id: str
    course_id: str


class TrackProgressRequest(BaseModel):
    """Request body for tracking progress."""

    student_id: str
    course_id: str
    lesson_id: str
    progress_data: dict[str, Any] = Field(default_factory=dict)


class IssueCertificateRequest(BaseModel):
    """Request body for issuing a certificate."""

    lesson_id: str
    student_id: str
    course_id: str
    completion_score: float = 100.0


class CreatePresentationRequest(BaseModel):
    """Request body for creating a presentation."""

    lesson_id: str
    course_id: str
    logo_path: str = ""


class SocialMediaContentRequest(BaseModel):
    """Request body for generating social media content."""

    lesson_data: dict[str, Any]
    platforms: list[str]


class CreateUserRequest(BaseModel):
    """Request body for creating a user."""

    email: str
    name: str
    role: str = "student"


class CreateTeacherRequest(BaseModel):
    """Request body for creating a teacher profile."""

    user_id: str
    bio: str = ""
    expertise: list[str] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------


@app.get("/health")
async def health_check() -> dict[str, str]:
    """Health check endpoint."""
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}


# ---------------------------------------------------------------------------
# Course endpoints
# ---------------------------------------------------------------------------


@app.post("/courses")
async def create_course(
    request: CreateCourseRequest, teacher_id: str = ""
) -> dict[str, Any]:
    """Create a new course."""
    try:
        course = await course_manager.create_course(request.model_dump(), teacher_id)
        return {"course": course.model_dump(), "message": "Course created successfully"}
    except Exception as e:
        logger.error("Error creating course: %s", e)
        raise HTTPException(status_code=400, detail=str(e)) from e


@app.get("/courses/{course_id}")
async def get_course(course_id: str) -> dict[str, Any]:
    """Get a course by ID."""
    try:
        course = course_manager.course_registry.get(course_id)
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        return {"course": course.model_dump()}
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error getting course: %s", e)
        raise HTTPException(status_code=500, detail=str(e)) from e


@app.put("/courses/{course_id}")
async def update_course(course_id: str, request: UpdateCourseRequest) -> dict[str, Any]:
    """Update an existing course."""
    try:
        update_data = {k: v for k, v in request.model_dump().items() if v is not None}
        course = await course_manager.update_course(course_id, update_data)
        return {"course": course.model_dump(), "message": "Course updated successfully"}
    except RuntimeError as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=str(e)) from e
        raise HTTPException(status_code=500, detail=str(e)) from e
    except Exception as e:
        logger.error("Error updating course: %s", e)
        raise HTTPException(status_code=500, detail=str(e)) from e


@app.delete("/courses/{course_id}")
async def delete_course(course_id: str) -> dict[str, str]:
    """Delete a course."""
    try:
        await course_manager.delete_course(course_id)
        return {"message": "Course deleted successfully"}
    except RuntimeError as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=str(e)) from e
        raise HTTPException(status_code=500, detail=str(e)) from e
    except Exception as e:
        logger.error("Error deleting course: %s", e)
        raise HTTPException(status_code=500, detail=str(e)) from e


@app.get("/courses/{course_id}/analytics")
async def get_course_analytics(course_id: str) -> dict[str, Any]:
    """Get analytics for a course."""
    try:
        analytics = await course_manager.get_course_analytics(course_id)
        return {"analytics": analytics}
    except RuntimeError as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=str(e)) from e
        raise HTTPException(status_code=500, detail=str(e)) from e
    except Exception as e:
        logger.error("Error getting course analytics: %s", e)
        raise HTTPException(status_code=500, detail=str(e)) from e


# ---------------------------------------------------------------------------
# Lesson endpoints
# ---------------------------------------------------------------------------


@app.post("/courses/{course_id}/lessons")
async def generate_lessons(
    course_id: str, request: GenerateLessonsRequest
) -> dict[str, Any]:
    """Generate lessons for a course."""
    try:
        lessons = await course_manager.generate_lessons(course_id, request.topics)
        return {
            "lessons": [lesson.model_dump() for lesson in lessons],
            "message": "Lessons generated successfully",
        }
    except Exception as e:
        logger.error("Error generating lessons: %s", e)
        raise HTTPException(status_code=500, detail=str(e)) from e


@app.post("/courses/{course_id}/lessons/{lesson_id}/content")
async def create_lesson_content(course_id: str, lesson_id: str) -> dict[str, Any]:
    """Create content for a specific lesson."""
    try:
        content = await course_manager.create_lesson_content(lesson_id, course_id)
        return {"content": content, "message": "Lesson content created successfully"}
    except Exception as e:
        logger.error("Error creating lesson content: %s", e)
        raise HTTPException(status_code=500, detail=str(e)) from e


# ---------------------------------------------------------------------------
# Enrollment endpoints
# ---------------------------------------------------------------------------


@app.post("/enrollments")
async def enroll_student(request: EnrollStudentRequest) -> dict[str, Any]:
    """Enroll a student in a course."""
    try:
        enrollment = await course_manager.enroll_student(
            request.student_id, request.course_id
        )
        return {
            "enrollment": enrollment.model_dump(),
            "message": "Student enrolled successfully",
        }
    except Exception as e:
        logger.error("Error enrolling student: %s", e)
        raise HTTPException(status_code=500, detail=str(e)) from e


# ---------------------------------------------------------------------------
# Progress tracking endpoints
# ---------------------------------------------------------------------------


@app.post("/progress")
async def track_progress(request: TrackProgressRequest) -> dict[str, Any]:
    """Track student reading progress."""
    try:
        progress = await course_manager.track_reading_progress(
            request.student_id,
            request.course_id,
            request.lesson_id,
            request.progress_data,
        )
        return {
            "progress": progress.model_dump(),
            "message": "Progress tracked successfully",
        }
    except Exception as e:
        logger.error("Error tracking progress: %s", e)
        raise HTTPException(status_code=500, detail=str(e)) from e


# ---------------------------------------------------------------------------
# Certificate endpoints
# ---------------------------------------------------------------------------


@app.post("/certificates")
async def issue_certificate(request: IssueCertificateRequest) -> dict[str, Any]:
    """Issue a certificate for a completed lesson."""
    try:
        certificate = await course_manager.generate_certificate(
            request.lesson_id,
            request.student_id,
            request.course_id,
            request.completion_score,
        )
        return {
            "certificate": certificate,
            "message": "Certificate issued successfully",
        }
    except Exception as e:
        logger.error("Error issuing certificate: %s", e)
        raise HTTPException(status_code=500, detail=str(e)) from e


# ---------------------------------------------------------------------------
# Presentation endpoints
# ---------------------------------------------------------------------------


@app.post("/presentations")
async def create_presentation(request: CreatePresentationRequest) -> dict[str, Any]:
    """Create a presentation for a lesson."""
    try:
        presentation = await course_manager.create_presentation(
            request.lesson_id,
            request.course_id,
            request.logo_path,
        )
        return {
            "presentation": presentation,
            "message": "Presentation created successfully",
        }
    except Exception as e:
        logger.error("Error creating presentation: %s", e)
        raise HTTPException(status_code=500, detail=str(e)) from e


# ---------------------------------------------------------------------------
# Social media endpoints
# ---------------------------------------------------------------------------


@app.post("/social-media/content")
async def generate_social_media_content(
    request: SocialMediaContentRequest,
) -> dict[str, Any]:
    """Generate social media content for a lesson."""
    try:
        content = await course_manager.social_media_agent.generate_social_media_content(
            request.lesson_data,
            request.platforms,
        )
        return {
            "content": content,
            "message": "Social media content generated successfully",
        }
    except Exception as e:
        logger.error("Error generating social media content: %s", e)
        raise HTTPException(status_code=500, detail=str(e)) from e


# ---------------------------------------------------------------------------
# User & Admin endpoints
# ---------------------------------------------------------------------------


@app.post("/users")
async def create_user(request: CreateUserRequest) -> dict[str, Any]:
    """Create a new user."""
    return {
        "user": {
            "id": f"user_{hash(request.email)}",
            "email": request.email,
            "name": request.name,
            "role": request.role,
            "created_at": datetime.utcnow().isoformat(),
        },
        "message": "User created successfully",
    }


@app.post("/teachers")
async def create_teacher(request: CreateTeacherRequest) -> dict[str, Any]:
    """Create a teacher profile."""
    return {
        "teacher": {
            "id": f"teacher_{request.user_id}",
            "user_id": request.user_id,
            "bio": request.bio,
            "expertise": request.expertise,
            "created_at": datetime.utcnow().isoformat(),
        },
        "message": "Teacher profile created successfully",
    }


@app.get("/teachers/themes")
async def get_themes() -> dict[str, Any]:
    """Get available presentation themes."""
    themes = [
        {
            "id": "professional",
            "name": "Professional",
            "colors": ["#2563eb", "#1e40af"],
        },
        {"id": "modern", "name": "Modern", "colors": ["#3b82f6", "#1d4ed8"]},
        {"id": "minimal", "name": "Minimal", "colors": ["#64748b", "#475569"]},
        {"id": "vibrant", "name": "Vibrant", "colors": ["#ec4899", "#8b5cf6"]},
        {"id": "dark", "name": "Dark", "colors": ["#1e1e1e", "#2d2d2d"]},
    ]
    return {"themes": themes}


@app.get("/teachers/templates")
async def get_templates() -> dict[str, Any]:
    """Get available presentation templates."""
    templates = [
        {"id": "default", "name": "Default", "description": "Standard lesson template"},
        {
            "id": "workshop",
            "name": "Workshop",
            "description": "Hands-on workshop format",
        },
        {
            "id": "lecture",
            "name": "Lecture",
            "description": "Traditional lecture format",
        },
    ]
    return {"templates": templates}


# ---------------------------------------------------------------------------
# Dashboard / Static files
# ---------------------------------------------------------------------------

_DASHBOARD_DIR = Path(__file__).resolve().parent.parent / "dashboard"


@app.get("/", response_class=HTMLResponse)
async def serve_dashboard() -> HTMLResponse:
    """Serve the dashboard UI."""
    index_html = _DASHBOARD_DIR / "index.html"
    if index_html.exists():
        return HTMLResponse(content=index_html.read_text(encoding="utf-8"))
    return HTMLResponse(content="<h1>Dashboard not found</h1>", status_code=404)


# Mount static assets (CSS, JS) from the dashboard directory
if _DASHBOARD_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(_DASHBOARD_DIR)), name="static")


# ---------------------------------------------------------------------------
# Error handling
# ---------------------------------------------------------------------------


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Any, exc: HTTPException) -> JSONResponse:
    """Handle HTTP exceptions."""
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail, "status_code": exc.status_code},
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Any, exc: Exception) -> JSONResponse:
    """Handle unexpected exceptions."""
    logger.error("Unexpected error: %s", exc)
    return JSONResponse(
        status_code=500, content={"error": "Internal server error", "status_code": 500}
    )
