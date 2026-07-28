"""Models for course platform - defines data structures for courses, lessons, presentations, certificates, and user management."""

from datetime import datetime
from typing import Any, ClassVar

from pydantic import BaseModel, Field


class Lesson(BaseModel):
    """Lesson model for individual lessons within a course."""

    id: str = Field(..., description="Unique identifier for the lesson")
    title: str = Field(..., description="Title of the lesson")
    content: str = Field(..., description="Detailed lesson content")
    code_examples: list[str] = Field(
        default_factory=list, description="Code examples in the lesson"
    )
    diagrams: list[str] = Field(
        default_factory=list, description="Diagrams or visual elements"
    )
    duration: int = Field(..., description="Duration of the lesson in minutes")
    objectives: list[str] = Field(
        default_factory=list, description="Learning objectives"
    )
    prerequisites: list[str] = Field(
        default_factory=list, description="Prerequisites for the lesson"
    )
    activities: dict[str, Any] = Field(
        default_factory=dict, description="Interactive activities"
    )
    resources: dict[str, Any] = Field(
        default_factory=dict, description="Learning resources"
    )
    status: str = Field(default="pending", description="Status of the lesson")
    progress: float = Field(default=0.0, description="Reading progress percentage")
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    course_id: str = Field(..., description="ID of the parent course")
    presentation_generated: bool = Field(
        default=False, description="Whether presentation has been generated"
    )
    completion_certificate: dict | None = Field(
        default=None, description="Completion certificate details"
    )

    class Config:
        json_encoders: ClassVar[dict] = {datetime: lambda v: v.isoformat()}


class LessonPlan(BaseModel):
    """Lesson plan model for AI-generated lesson plans."""

    id: str = Field(..., description="Unique identifier for the lesson plan")
    title: str = Field(..., description="Title of the lesson")
    overview: str = Field(..., description="Overview of the lesson")
    objectives: list[str] = Field(
        default_factory=list, description="Learning objectives"
    )
    duration: int = Field(..., description="Duration of the lesson in minutes")
    prerequisites: list[str] = Field(default_factory=list, description="Prerequisites")
    content: dict[str, Any] = Field(
        default_factory=dict, description="Full lesson content structure"
    )
    activities: dict[str, Any] = Field(
        default_factory=dict, description="Learning activities"
    )
    resources: dict[str, Any] = Field(
        default_factory=dict, description="Learning resources"
    )
    schedule: list[dict[str, Any]] = Field(
        default_factory=list, description="Weekly schedule"
    )
    lessons: list[Lesson] = Field(
        default_factory=list, description="Individual lessons"
    )
    status: str = Field(default="draft", description="Status of the lesson plan")
    course_id: str = Field(..., description="ID of the parent course")
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    ai_model: str = Field(default="gpt-4", description="AI model used for generation")
    generation_metadata: dict[str, Any] = Field(
        default_factory=dict, description="Metadata about AI generation"
    )

    class Config:
        json_encoders: ClassVar[dict] = {datetime: lambda v: v.isoformat()}


class LessonContent(BaseModel):
    """Generated lesson content model."""

    id: str = Field(..., description="Unique identifier for the content")
    title: str = Field(..., description="Title of the lesson")
    detailed_content: str = Field(..., description="Full detailed content")
    code_examples: list[dict[str, Any]] = Field(
        default_factory=list, description="Code examples with explanations"
    )
    diagrams: list[dict[str, Any]] = Field(
        default_factory=list, description="Visual diagrams and illustrations"
    )
    exercises: list[dict[str, Any]] = Field(
        default_factory=list, description="Practice exercises"
    )
    projects: list[dict[str, Any]] = Field(
        default_factory=list, description="Project assignments"
    )
    assessments: list[dict[str, Any]] = Field(
        default_factory=list, description="Assessment questions"
    )
    resources: dict[str, Any] = Field(
        default_factory=dict, description="Learning resources"
    )
    interactive_elements: list[str] = Field(
        default_factory=list, description="Interactive features"
    )
    difficulty_level: str = Field(
        default="intermediate", description="Difficulty level"
    )
    time_required: str = Field(
        default="60 minutes", description="Estimated time required"
    )
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    status: str = Field(default="pending", description="Status of the content")
    metadata: dict[str, Any] = Field(
        default_factory=dict, description="Additional metadata"
    )

    class Config:
        json_encoders: ClassVar[dict] = {datetime: lambda v: v.isoformat()}


class Course(BaseModel):
    """Course model."""

    id: str = Field(..., description="Unique identifier for the course")
    title: str = Field(..., description="Title of the course")
    description: str = Field(default="", description="Detailed description")
    topic: str = Field(..., description="Primary topic")
    level: str = Field(default="beginner", description="Difficulty level")
    duration_weeks: int = Field(default=4, description="Duration in weeks")
    objectives: list[str] = Field(default_factory=list, description="Course objectives")
    lessons: list[Lesson] = Field(
        default_factory=list, description="Lessons in the course"
    )
    lesson_plan: LessonPlan | None = Field(
        default=None, description="AI-generated lesson plan"
    )
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    status: str = Field(default="active", description="Course status")
    enrollment_count: int = Field(default=0, description="Number of enrolled students")
    completion_rate: float = Field(
        default=0.0, description="Completion rate percentage"
    )
    average_rating: float = Field(default=0.0, description="Average course rating")
    reviews: list[dict[str, Any]] = Field(
        default_factory=list, description="Course reviews"
    )

    class Config:
        json_encoders: ClassVar[dict] = {datetime: lambda v: v.isoformat()}


class Presentation(BaseModel):
    """Presentation model."""

    id: str = Field(..., description="Unique identifier for the presentation")
    lesson_id: str = Field(..., description="ID of the associated lesson")
    title: str = Field(..., description="Title of the presentation")
    slides: list[dict[str, Any]] = Field(
        default_factory=list, description="Individual slides"
    )
    theme: str = Field(default="professional", description="Presentation theme")
    template: str = Field(default="default", description="Presentation template")
    total_slides: int = Field(default=0, description="Total number of slides")
    duration_minutes: int = Field(default=60, description="Duration in minutes")
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    status: str = Field(default="created", description="Presentation status")
    visibility: str = Field(default="private", description="Visibility level")
    thumbnail: str | None = Field(default=None, description="Thumbnail image URL")
    assets: list[dict[str, Any]] = Field(
        default_factory=list, description="Presentation assets"
    )
    notes: list[dict[str, Any]] = Field(
        default_factory=list, description="Speaker notes"
    )
    logo: str | None = Field(default=None, description="Logo image URL")
    brand_colors: list[str] = Field(
        default_factory=list, description="Brand color scheme"
    )
    ppt_file_path: str | None = Field(default=None, description="Path to PPT file")
    video_file_path: str | None = Field(default=None, description="Path to video file")
    audio_file_path: str | None = Field(default=None, description="Path to audio file")
    youtube_url: str | None = Field(default=None, description="YouTube URL")
    social_media_posts: list[dict[str, Any]] = Field(
        default_factory=list, description="Social media posts"
    )

    class Config:
        json_encoders: ClassVar[dict] = {datetime: lambda v: v.isoformat()}


class Recording(BaseModel):
    """Recording model."""

    id: str = Field(..., description="Unique identifier for the recording")
    presentation_id: str = Field(..., description="ID of the associated presentation")
    format: str = Field(..., description="Recording format")
    quality: str = Field(default="1080p", description="Video quality")
    duration: int = Field(..., description="Duration in seconds")
    file_path: str = Field(..., description="File path on server")
    thumbnail: str | None = Field(default=None, description="Thumbnail image URL")
    size: int = Field(default=0, description="File size in bytes")
    recording_status: str = Field(default="completed", description="Recording status")
    upload_status: str = Field(default="pending", description="Upload status")
    youtube_url: str | None = Field(default=None, description="YouTube URL")
    youtube_video_id: str | None = Field(default=None, description="YouTube video ID")
    processing_status: str = Field(default="pending", description="Processing status")
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    recorded_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    metadata: dict[str, Any] = Field(
        default_factory=dict, description="Additional metadata"
    )

    class Config:
        json_encoders: ClassVar[dict] = {datetime: lambda v: v.isoformat()}


class Certificate(BaseModel):
    """Certificate model."""

    id: str = Field(..., description="Unique identifier for the certificate")
    lesson_id: str = Field(..., description="ID of the completed lesson")
    student_id: str = Field(..., description="ID of the student")
    course_id: str = Field(..., description="ID of the course")
    completion_score: float = Field(
        default=100.0, description="Completion score/percentage"
    )
    completion_time: str = Field(..., description="Completion timestamp")
    certificate_url: str = Field(..., description="URL to download certificate")
    issuer: str = Field(default="AI Course Platform", description="Certificate issuer")
    issued_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    valid_until: str = Field(
        default_factory=lambda: (
            datetime.utcnow().replace(year=datetime.utcnow().year + 1).isoformat()
        )
    )
    qr_code: str = Field(..., description="QR code for verification")
    verification_hash: str = Field(..., description="Verification hash")
    recipient_name: str = Field(..., description="Name of the recipient")
    recipient_email: str = Field(..., description="Email of the recipient")
    course_name: str = Field(..., description="Name of the course")
    achievements: list[str] = Field(
        default_factory=list, description="Achievements listed on certificate"
    )
    metadata: dict[str, Any] = Field(
        default_factory=dict, description="Additional metadata"
    )
    status: str = Field(default="issued", description="Certificate status")

    class Config:
        json_encoders: ClassVar[dict] = {datetime: lambda v: v.isoformat()}


class Enrollment(BaseModel):
    """Student enrollment model."""

    id: str = Field(..., description="Unique identifier for the enrollment")
    student_id: str = Field(..., description="ID of the student")
    course_id: str = Field(..., description="ID of the course")
    enrollment_date: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    status: str = Field(default="active", description="Enrollment status")
    progress: float = Field(default=0.0, description="Progress percentage")
    completed_lessons: list[str] = Field(
        default_factory=list, description="Completed lesson IDs"
    )
    last_accessed: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    certificate_issued: bool = Field(
        default=False, description="Whether certificate has been issued"
    )
    certificate_id: str | None = Field(
        default=None, description="ID of issued certificate"
    )

    class Config:
        json_encoders: ClassVar[dict] = {datetime: lambda v: v.isoformat()}


class ProgressUpdate(BaseModel):
    """Progress update model."""

    id: str = Field(..., description="Unique identifier for the progress update")
    student_id: str = Field(..., description="ID of the student")
    lesson_id: str = Field(..., description="ID of the lesson")
    course_id: str = Field(..., description="ID of the course")
    reading_position: int = Field(default=0, description="Current reading position")
    reading_percentage: float = Field(
        default=0.0, description="Reading progress percentage"
    )
    time_spent: int = Field(default=0, description="Time spent in seconds")
    completed: bool = Field(
        default=False, description="Whether the lesson is completed"
    )
    last_read: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    notes: str | None = Field(default=None, description="Student notes")
    quiz_score: float | None = Field(
        default=None, description="Quiz score if applicable"
    )
    feedback: dict[str, Any] | None = Field(
        default=None, description="Feedback on progress"
    )

    class Config:
        json_encoders: ClassVar[dict] = {datetime: lambda v: v.isoformat()}


class SocialMediaContent(BaseModel):
    """Social media content model."""

    id: str = Field(..., description="Unique identifier")
    lesson_id: str = Field(..., description="ID of the lesson")
    platform: str = Field(..., description="Social media platform")
    headline: str = Field(..., description="Content headline")
    key_points: list[str] = Field(
        default_factory=list, description="Key points to cover"
    )
    hashtags: list[str] = Field(default_factory=list, description="Hashtags")
    call_to_action: str = Field(default="", description="Call to action")
    image_url: str | None = Field(default=None, description="Image URL")
    video_url: str | None = Field(default=None, description="Video URL")
    link: str | None = Field(default=None, description="Link to content")
    summary: str = Field(default="", description="Content summary")
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    status: str = Field(default="generated", description="Content status")
    platform_post_id: str | None = Field(
        default=None, description="Platform-specific post ID"
    )
    posted_at: str | None = Field(default=None, description="When it was posted")

    class Config:
        json_encoders: ClassVar[dict] = {datetime: lambda v: v.isoformat()}


class User(BaseModel):
    """User model."""

    id: str = Field(..., description="Unique identifier")
    email: str = Field(..., description="Email address")
    name: str = Field(..., description="Full name")
    role: str = Field(
        default="student", description="User role (student/teacher/admin)"
    )
    avatar: str | None = Field(default=None, description="Avatar image URL")
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    last_login: str | None = Field(default=None, description="Last login timestamp")
    preferences: dict[str, Any] = Field(
        default_factory=dict, description="User preferences"
    )
    is_active: bool = Field(default=True, description="Whether user is active")
    password_hash: str | None = Field(
        default=None, description="Password hash (for security)"
    )

    class Config:
        json_encoders: ClassVar[dict] = {datetime: lambda v: v.isoformat()}


class TeacherProfile(BaseModel):
    """Teacher profile model."""

    id: str = Field(..., description="Unique identifier")
    user_id: str = Field(..., description="Associated user ID")
    bio: str = Field(default="", description="Biographical information")
    expertise: list[str] = Field(default_factory=list, description="Areas of expertise")
    courses_taught: list[str] = Field(
        default_factory=list, description="Courses taught"
    )
    profile_image: str | None = Field(default=None, description="Profile image URL")
    qualifications: list[str] = Field(
        default_factory=list, description="Professional qualifications"
    )
    years_experience: int = Field(default=0, description="Years of teaching experience")
    social_media_links: dict[str, str] = Field(
        default_factory=dict, description="Social media links"
    )
    teaching_style: str | None = Field(
        default=None, description="Teaching style description"
    )

    class Config:
        json_encoders: ClassVar[dict] = {datetime: lambda v: v.isoformat()}


class CourseTopic(BaseModel):
    """Course topic model."""

    id: str = Field(..., description="Unique identifier")
    course_id: str = Field(..., description="Associated course ID")
    title: str = Field(..., description="Topic title")
    description: str = Field(default="", description="Topic description")
    order: int = Field(..., description="Display order")
    status: str = Field(default="active", description="Topic status")
    objectives: list[str] = Field(
        default_factory=list, description="Learning objectives"
    )
    estimated_duration: int = Field(
        default=60, description="Estimated duration in minutes"
    )
    difficulty_level: str = Field(
        default="intermediate", description="Difficulty level"
    )
    prerequisites: list[str] = Field(default_factory=list, description="Prerequisites")
    lesson_plan_id: str | None = Field(
        default=None, description="Associated lesson plan ID"
    )
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

    class Config:
        json_encoders: ClassVar[dict] = {datetime: lambda v: v.isoformat()}
