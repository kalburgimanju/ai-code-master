"""Tests for AI agents and data models."""

import json

import pytest

from agents.content_generator import ContentGenerator
from agents.lesson_generator import AIClient, LessonGenerator
from agents.models import (
    Certificate,
    Course,
    Enrollment,
    Lesson,
    LessonPlan,
    Presentation,
    ProgressUpdate,
    SocialMediaContent,
    User,
)
from agents.presentation_creator import PresentationCreator
from agents.social_media_agent import SocialMediaAgent

# ---------------------------------------------------------------------------
# Model tests
# ---------------------------------------------------------------------------


class TestModels:
    """Tests for Pydantic data models."""

    def test_lesson_creation(self):
        """Test Lesson model creation with required fields."""
        lesson = Lesson(
            id="lesson_1",
            title="Test Lesson",
            content="Lesson content",
            code_examples=["print('hello')"],
            diagrams=["diagram1"],
            duration=60,
            objectives=["Obj 1"],
            prerequisites=["Pre 1"],
            activities={},
            resources={},
            course_id="course_1",
        )
        assert lesson.id == "lesson_1"
        assert lesson.status == "pending"
        assert lesson.progress == 0.0
        assert lesson.presentation_generated is False

    def test_lesson_defaults(self):
        """Test Lesson model default values."""
        lesson = Lesson(
            id="l1",
            title="T",
            content="C",
            duration=30,
            course_id="c1",
        )
        assert lesson.code_examples == []
        assert lesson.diagrams == []
        assert lesson.objectives == []
        assert lesson.prerequisites == []
        assert lesson.activities == {}
        assert lesson.resources == {}

    def test_lesson_plan_creation(self):
        """Test LessonPlan model creation."""
        plan = LessonPlan(
            id="lp_1",
            title="Plan",
            overview="Overview",
            duration=120,
            content={"sections": []},
            course_id="course_1",
        )
        assert plan.status == "draft"
        assert plan.lessons == []
        assert plan.ai_model == "gpt-4"

    def test_course_creation(self):
        """Test Course model creation."""
        course = Course(
            id="course_1",
            title="AI 101",
            topic="AI",
        )
        assert course.level == "beginner"
        assert course.duration_weeks == 4
        assert course.enrollment_count == 0
        assert course.completion_rate == 0.0

    def test_enrollment_creation(self):
        """Test Enrollment model creation."""
        enrollment = Enrollment(
            id="e1",
            student_id="s1",
            course_id="c1",
        )
        assert enrollment.status == "active"
        assert enrollment.progress == 0.0
        assert enrollment.completed_lessons == []
        assert enrollment.certificate_issued is False

    def test_progress_update_creation(self):
        """Test ProgressUpdate model creation."""
        progress = ProgressUpdate(
            id="p1",
            student_id="s1",
            lesson_id="l1",
            course_id="c1",
        )
        assert progress.reading_position == 0
        assert progress.reading_percentage == 0.0
        assert progress.completed is False

    def test_presentation_creation(self):
        """Test Presentation model creation."""
        pres = Presentation(
            id="pres_1",
            lesson_id="l1",
            title="Pres",
            slides=[],
            theme="professional",
            template="default",
            total_slides=10,
            duration_minutes=60,
            status="created",
            visibility="private",
            thumbnail="",
            assets=[],
            notes=[],
            logo="",
            brand_colors=[],
        )
        assert pres.total_slides == 10
        assert pres.theme == "professional"

    def test_certificate_creation(self):
        """Test Certificate model creation."""
        cert = Certificate(
            id="cert_1",
            lesson_id="l1",
            student_id="s1",
            course_id="c1",
            completion_score=95.0,
            completion_time="2026-01-01T00:00:00",
            certificate_url="/cert.pdf",
            qr_code="qr1",
            verification_hash="hash1",
            recipient_name="Student",
            recipient_email="s@test.com",
            course_name="AI 101",
        )
        assert cert.completion_score == 95.0
        assert cert.status == "issued"

    def test_user_creation(self):
        """Test User model creation."""
        user = User(
            id="u1",
            email="test@test.com",
            name="Test User",
        )
        assert user.role == "student"
        assert user.is_active is True

    def test_social_media_content_creation(self):
        """Test SocialMediaContent model creation."""
        content = SocialMediaContent(
            id="smc1",
            lesson_id="l1",
            platform="twitter",
            headline="Test headline",
        )
        assert content.status == "generated"
        assert content.key_points == []


# ---------------------------------------------------------------------------
# AIClient tests
# ---------------------------------------------------------------------------


class TestAIClient:
    """Tests for the stub AI client."""

    @pytest.mark.asyncio
    async def test_generate_text_returns_json(self):
        """Test that generate_text returns valid JSON."""
        client = AIClient()
        result = await client.generate_text("test prompt")
        parsed = json.loads(result)
        assert "title" in parsed
        assert "content" in parsed
        assert "objectives" in parsed


# ---------------------------------------------------------------------------
# LessonGenerator tests
# ---------------------------------------------------------------------------


class TestLessonGenerator:
    """Tests for the LessonGenerator agent."""

    @pytest.mark.asyncio
    async def test_generate_lesson_plan(self):
        """Test lesson plan generation."""
        gen = LessonGenerator()
        plan = await gen.generate_lesson_plan(
            topic="Machine Learning",
            course_info={"level": "beginner", "duration": 4, "course_id": "c1"},
        )
        assert isinstance(plan, LessonPlan)
        assert plan.title is not None
        assert plan.duration > 0

    @pytest.mark.asyncio
    async def test_generate_lesson_plan_returns_lessons(self):
        """Test that generated lesson plan contains individual lessons."""
        gen = LessonGenerator()
        plan = await gen.generate_lesson_plan(
            topic="Python Basics",
            course_info={"level": "beginner", "duration": 2, "course_id": "c1"},
        )
        assert isinstance(plan.lessons, list)

    @pytest.mark.asyncio
    async def test_batch_generate_lesson_plans(self):
        """Test batch generation of multiple lesson plans."""
        gen = LessonGenerator()
        plans = await gen.batch_generate_lesson_plans(
            topics=["Topic A", "Topic B"],
            course_info={"level": "beginner", "course_id": "c1"},
        )
        assert len(plans) == 2
        assert all(isinstance(p, LessonPlan) for p in plans)

    @pytest.mark.asyncio
    async def test_generate_ai_response(self):
        """Test AI response generation with context."""
        gen = LessonGenerator()
        response = await gen.generate_ai_response(
            prompt="Explain neural networks",
            context={"level": "beginner"},
        )
        assert isinstance(response, str)
        assert len(response) > 0


# ---------------------------------------------------------------------------
# ContentGenerator tests
# ---------------------------------------------------------------------------


class TestContentGenerator:
    """Tests for the ContentGenerator agent."""

    @pytest.mark.asyncio
    async def test_generate_lesson_content(self):
        """Test content generation for a lesson."""
        gen = ContentGenerator()
        content = await gen.generate_lesson_content(
            {
                "id": "lesson_1",
                "title": "Python Basics",
                "objectives": ["Learn variables", "Learn loops"],
                "duration": 60,
            }
        )
        assert content["title"] == "Python Basics"
        assert content["status"] == "generated"
        assert "detailed_content" in content
        assert "code_examples" in content

    @pytest.mark.asyncio
    async def test_batch_generate_content(self):
        """Test batch content generation."""
        gen = ContentGenerator()
        lessons = [
            {"id": "l1", "title": "Lesson 1"},
            {"id": "l2", "title": "Lesson 2"},
        ]
        results = await gen.batch_generate_content(lessons)
        assert len(results) == 2
        assert all(r["status"] == "generated" for r in results)

    @pytest.mark.asyncio
    async def test_update_content(self):
        """Test content update."""
        gen = ContentGenerator()
        result = await gen.update_content("content_1", {"title": "Updated"})
        assert result["id"] == "content_1"
        assert result["status"] == "updated"
        assert result["updates"]["title"] == "Updated"


# ---------------------------------------------------------------------------
# PresentationCreator tests
# ---------------------------------------------------------------------------


class TestPresentationCreator:
    """Tests for the PresentationCreator agent."""

    @pytest.mark.asyncio
    async def test_create_presentation(self):
        """Test presentation creation."""
        creator = PresentationCreator()
        pres = await creator.create_presentation(
            lesson_data={"id": "l1", "title": "Test Lesson", "objectives": ["Obj 1"]},
            content={"code_examples": [], "exercises": [], "diagrams": []},
        )
        assert pres["id"] == "pres_l1"
        assert pres["title"] == "Test Lesson"
        assert pres["total_slides"] > 0
        assert pres["status"] == "created"

    @pytest.mark.asyncio
    async def test_create_presentation_with_logo(self):
        """Test presentation creation with custom logo."""
        creator = PresentationCreator()
        pres = await creator.create_presentation(
            lesson_data={
                "id": "l1",
                "title": "Branded Lesson",
                "logo_path": "/uploads/logo.png",
                "brand_colors": ["#ff0000"],
                "objectives": [],
            },
            content={"code_examples": [], "exercises": []},
        )
        assert pres["logo"] == "/uploads/logo.png"
        assert pres["brand_colors"] == ["#ff0000"]

    @pytest.mark.asyncio
    async def test_record_presentation(self):
        """Test presentation recording."""
        creator = PresentationCreator()
        recording = await creator.record_presentation(
            "pres_1", {"format": "mp4", "quality": "1080p"}
        )
        assert recording["recording_status"] == "completed"
        assert recording["format"] == "mp4"

    @pytest.mark.asyncio
    async def test_generate_certificate(self):
        """Test certificate generation."""
        creator = PresentationCreator()
        cert = await creator.generate_certificate(
            "lesson_1", "student_1", {"score": 95.0, "time_completed": "2026-01-01"}
        )
        assert cert["id"] == "cert_lesson_1_student_1"
        assert cert["completion_score"] == 95.0
        assert cert["status"] == "issued"

    @pytest.mark.asyncio
    async def test_customize_presentation(self):
        """Test presentation customization."""
        creator = PresentationCreator()
        result = await creator.customize_presentation(
            "pres_1",
            {"logo_path": "/logo.png", "theme": "modern", "brand_colors": ["#000"]},
        )
        assert result["customization_applied"] is True
        assert result["logo"] == "/logo.png"

    @pytest.mark.asyncio
    async def test_get_progress_report(self):
        """Test progress report retrieval."""
        creator = PresentationCreator()
        report = await creator.get_progress_report("lesson_1")
        assert report["lesson_id"] == "lesson_1"
        assert report["total_students"] == 0


# ---------------------------------------------------------------------------
# SocialMediaAgent tests
# ---------------------------------------------------------------------------


class TestSocialMediaAgent:
    """Tests for the SocialMediaAgent."""

    @pytest.mark.asyncio
    async def test_generate_content_for_platforms(self):
        """Test social media content generation for multiple platforms."""
        agent = SocialMediaAgent()
        result = await agent.generate_social_media_content(
            lesson_data={"id": "l1", "title": "ML Basics", "objectives": ["Learn ML"]},
            platforms=["twitter", "linkedin", "facebook"],
        )
        assert result["status"] == "generated"
        assert "twitter" in result["content_by_platform"]
        assert "linkedin" in result["content_by_platform"]
        assert "facebook" in result["content_by_platform"]

    @pytest.mark.asyncio
    async def test_content_platform_specific(self):
        """Test that content is platform-specific."""
        agent = SocialMediaAgent()
        result = await agent.generate_social_media_content(
            lesson_data={"id": "l1", "title": "Test", "objectives": []},
            platforms=["twitter"],
        )
        twitter_content = result["content_by_platform"]["twitter"]
        assert "headline" in twitter_content
        assert "hashtags" in twitter_content
        assert "call_to_action" in twitter_content

    @pytest.mark.asyncio
    async def test_batch_post(self):
        """Test batch posting to multiple platforms."""
        agent = SocialMediaAgent()
        posts = await agent.batch_post_to_platforms(
            lesson_data={"id": "l1", "title": "Test", "objectives": []},
            platforms=["twitter", "facebook"],
        )
        assert len(posts) == 2
        assert all(p["status"] == "posted" for p in posts)

    @pytest.mark.asyncio
    async def test_schedule_post(self):
        """Test post scheduling."""
        agent = SocialMediaAgent()
        result = await agent.schedule_post(
            lesson_data={"id": "l1", "title": "Test", "objectives": []},
            platforms=["twitter"],
            schedule_time="2026-08-01T10:00:00",
        )
        assert result["status"] == "scheduled"
        assert len(result["scheduled_posts"]) == 1

    @pytest.mark.asyncio
    async def test_get_platform_analytics(self):
        """Test platform analytics retrieval."""
        agent = SocialMediaAgent()
        analytics = await agent.get_platform_analytics(
            "twitter", "lesson_1", {"start": "2026-01-01", "end": "2026-12-31"}
        )
        assert analytics["platform"] == "twitter"
        assert analytics["impressions"] == 0

    def test_fallback_headlines(self):
        """Test that fallback headlines are provided for all platforms."""
        agent = SocialMediaAgent()
        platforms = [
            "twitter",
            "facebook",
            "linkedin",
            "instagram",
            "youtube",
            "telegram",
            "slack",
            "discord",
            "twitch",
            "pinterest",
            "reddit",
            "mastodon",
        ]
        for platform in platforms:
            headline = agent._get_fallback_headline(platform, "Test Lesson")
            assert isinstance(headline, str)
            assert len(headline) > 0

    def test_fallback_hashtags(self):
        """Test that fallback hashtags are provided for all platforms."""
        agent = SocialMediaAgent()
        platforms = [
            "twitter",
            "facebook",
            "linkedin",
            "instagram",
            "youtube",
            "telegram",
            "slack",
            "discord",
            "twitch",
            "pinterest",
            "reddit",
            "mastodon",
        ]
        for platform in platforms:
            hashtags = agent._get_fallback_hashtags(platform)
            assert isinstance(hashtags, list)
            assert len(hashtags) > 0
