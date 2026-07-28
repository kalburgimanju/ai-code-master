"""SQLAlchemy ORM models."""

import uuid
from datetime import UTC, datetime

from sqlalchemy import JSON, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.database import Base


def utcnow() -> datetime:
    return datetime.now(UTC)


def gen_uuid() -> str:
    return str(uuid.uuid4())


class LessonPlan(Base):
    __tablename__ = "lesson_plans"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    prompt: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="draft")
    ai_model: Mapped[str] = mapped_column(String(100), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, onupdate=utcnow)

    lessons: Mapped[list[Lesson]] = relationship(
        back_populates="plan", cascade="all, delete-orphan"
    )
    prompts: Mapped[list[PromptHistory]] = relationship(
        back_populates="plan", cascade="all, delete-orphan"
    )


class Lesson(Base):
    __tablename__ = "lessons"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    plan_id: Mapped[str] = mapped_column(String(36), ForeignKey("lesson_plans.id"), nullable=False)
    lesson_number: Mapped[int] = mapped_column(Integer, nullable=False)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="")
    key_points: Mapped[list | None] = mapped_column(JSON, default=list)
    talking_points: Mapped[list | None] = mapped_column(JSON, default=list)
    script_outline: Mapped[str] = mapped_column(Text, default="")
    full_script: Mapped[str] = mapped_column(Text, default="")
    script_author: Mapped[str] = mapped_column(String(200), default="")
    script_image: Mapped[str] = mapped_column(Text, default="")
    image_prompt: Mapped[str] = mapped_column(Text, default="")
    ppt_path: Mapped[str] = mapped_column(Text, default="")
    drive_script_link: Mapped[str] = mapped_column(String(512), default="")
    drive_ppt_link: Mapped[str] = mapped_column(String(512), default="")
    resources: Mapped[list | None] = mapped_column(JSON, default=list)
    duration_minutes: Mapped[int] = mapped_column(Integer, default=10)
    status: Mapped[str] = mapped_column(String(20), default="planned")

    plan: Mapped[LessonPlan] = relationship(back_populates="lessons")
    video: Mapped[YouTubeVideo | None] = relationship(back_populates="lesson", uselist=False)


class YouTubeVideo(Base):
    __tablename__ = "youtube_videos"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    lesson_id: Mapped[str] = mapped_column(String(36), ForeignKey("lessons.id"), nullable=False)
    youtube_video_id: Mapped[str] = mapped_column(String(100), default="")
    title: Mapped[str] = mapped_column(String(500), default="")
    description: Mapped[str] = mapped_column(Text, default="")
    tags: Mapped[list | None] = mapped_column(JSON, default=list)
    upload_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    view_count: Mapped[int] = mapped_column(Integer, default=0)
    like_count: Mapped[int] = mapped_column(Integer, default=0)
    comment_count: Mapped[int] = mapped_column(Integer, default=0)
    last_fetched_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    lesson: Mapped[Lesson] = relationship(back_populates="video")


class PromptHistory(Base):
    __tablename__ = "prompt_history"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    plan_id: Mapped[str] = mapped_column(String(36), ForeignKey("lesson_plans.id"), nullable=False)
    raw_prompt: Mapped[str] = mapped_column(Text, nullable=False)
    ai_response: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    model_used: Mapped[str] = mapped_column(String(100), default="")
    tokens_used: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)

    plan: Mapped[LessonPlan] = relationship(back_populates="prompts")
