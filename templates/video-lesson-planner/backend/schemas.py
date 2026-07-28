"""Pydantic request/response schemas."""

from datetime import datetime

from pydantic import BaseModel

# --- Lesson Plan ---


class LessonPlanCreate(BaseModel):
    title: str
    prompt: str


class LessonPlanUpdate(BaseModel):
    title: str | None = None
    status: str | None = None


class LessonPlanResponse(BaseModel):
    id: str
    title: str
    prompt: str
    status: str
    ai_model: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class LessonPlanDetail(LessonPlanResponse):
    lessons: list[LessonResponse] = []


# --- Lesson ---


class LessonUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    key_points: list[str] | None = None
    talking_points: list[str] | None = None
    script_outline: str | None = None
    resources: list[dict] | None = None
    duration_minutes: int | None = None
    status: str | None = None


class LessonResponse(BaseModel):
    id: str
    lesson_number: int
    title: str
    description: str
    key_points: list
    talking_points: list
    script_outline: str
    full_script: str = ""
    script_author: str = ""
    script_image: str = ""
    image_prompt: str = ""
    resources: list
    duration_minutes: int
    status: str
    drive_script_link: str = ""
    drive_ppt_link: str = ""

    model_config = {"from_attributes": True}


class LessonDetail(LessonResponse):
    video: YouTubeVideoResponse | None = None


# --- YouTube Video ---


class YouTubeVideoResponse(BaseModel):
    id: str
    youtube_video_id: str
    title: str
    description: str
    tags: list
    upload_date: datetime | None
    view_count: int
    like_count: int
    comment_count: int
    last_fetched_at: datetime | None

    model_config = {"from_attributes": True}


# --- Prompt History ---


class PromptHistoryResponse(BaseModel):
    id: str
    plan_id: str
    raw_prompt: str
    ai_response: dict | None
    model_used: str
    tokens_used: int
    created_at: datetime

    model_config = {"from_attributes": True}


# --- Agent ---


class GeneratePlanRequest(BaseModel):
    title: str
    prompt: str
    model: str | None = None
    num_lessons: int | None = 5


class GeneratePlanResponse(BaseModel):
    plan: LessonPlanDetail
    prompt_history: PromptHistoryResponse


class GenerateScriptRequest(BaseModel):
    model: str | None = None


class GenerateScriptResponse(BaseModel):
    lesson: LessonResponse
    model_used: str
    tokens_used: int


class GenerateMetadataResponse(BaseModel):
    title: str
    description: str
    model_used: str
    tokens_used: int


class GeneratePptResponse(BaseModel):
    ppt_path: str
    download_url: str
    slides_count: int
    model_used: str
    tokens_used: int


class GenerateDriveResponse(BaseModel):
    script_doc_id: str
    script_doc_link: str
    ppt_file_id: str
    ppt_file_link: str


# --- YouTube Auth ---


class YouTubeAuthUrlResponse(BaseModel):
    auth_url: str


class YouTubeUploadRequest(BaseModel):
    lesson_id: str
    title: str
    description: str
    tags: list[str] = []
    privacy_status: str = "private"


class YouTubeUploadResponse(BaseModel):
    video_id: str
    title: str
    status: str


# Rebuild forward refs
LessonPlanDetail.model_rebuild()
LessonDetail.model_rebuild()
