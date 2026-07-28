"""Tests for the CourseManager service."""

import pytest

from agents.models import Course, Lesson
from services.course_manager import CourseConfig, CourseManager


@pytest.fixture
def manager():
    """Create a fresh CourseManager for each test."""
    return CourseManager()


@pytest.fixture
async def course_with_lessons(manager):
    """Create a course with lessons for testing."""
    course = await manager.create_course(
        {"title": "Test Course", "topic": "Python", "generate_lesson_plan": False},
        teacher_id="teacher_1",
    )
    return course


# ---------------------------------------------------------------------------
# CourseConfig tests
# ---------------------------------------------------------------------------


class TestCourseConfig:
    """Tests for CourseConfig defaults."""

    def test_default_config(self):
        """Test default configuration values."""
        config = CourseConfig()
        assert config.max_lessons_per_course == 50
        assert config.certificate_enabled is True
        assert config.progress_tracking is True
        assert config.timezone == "UTC"


# ---------------------------------------------------------------------------
# CourseManager course lifecycle tests
# ---------------------------------------------------------------------------


class TestCourseManagerCourseLifecycle:
    """Tests for course creation, update, and deletion."""

    @pytest.mark.asyncio
    async def test_create_course(self):
        """Test course creation."""
        manager = CourseManager()
        course = await manager.create_course(
            {"title": "ML Course", "topic": "Machine Learning"},
            teacher_id="t1",
        )
        assert isinstance(course, Course)
        assert course.title == "ML Course"
        assert course.topic == "Machine Learning"
        assert course.status == "active"
        assert course.id in manager.course_registry

    @pytest.mark.asyncio
    async def test_create_course_with_objectives(self):
        """Test course creation with objectives."""
        manager = CourseManager()
        course = await manager.create_course(
            {
                "title": "AI Course",
                "topic": "AI",
                "objectives": ["Learn AI", "Build models"],
                "level": "intermediate",
                "duration_weeks": 8,
            },
            teacher_id="t1",
        )
        assert course.objectives == ["Learn AI", "Build models"]
        assert course.level == "intermediate"
        assert course.duration_weeks == 8

    @pytest.mark.asyncio
    async def test_update_course(self):
        """Test course update."""
        manager = CourseManager()
        course = await manager.create_course(
            {"title": "Old Title", "topic": "Python"},
            teacher_id="t1",
        )
        updated = await manager.update_course(
            course.id, {"title": "New Title", "level": "advanced"}
        )
        assert updated.title == "New Title"
        assert updated.level == "advanced"

    @pytest.mark.asyncio
    async def test_update_course_not_found(self):
        """Test updating a non-existent course raises error."""
        manager = CourseManager()
        with pytest.raises(RuntimeError, match="Course not found"):
            await manager.update_course("nonexistent", {"title": "X"})

    @pytest.mark.asyncio
    async def test_delete_course(self):
        """Test course deletion."""
        manager = CourseManager()
        course = await manager.create_course(
            {"title": "To Delete", "topic": "X"},
            teacher_id="t1",
        )
        await manager.delete_course(course.id)
        assert course.id not in manager.course_registry

    @pytest.mark.asyncio
    async def test_delete_course_not_found(self):
        """Test deleting a non-existent course raises error."""
        manager = CourseManager()
        with pytest.raises(RuntimeError, match="Course not found"):
            await manager.delete_course("nonexistent")

    @pytest.mark.asyncio
    async def test_get_course_analytics(self):
        """Test course analytics retrieval."""
        manager = CourseManager()
        course = await manager.create_course(
            {"title": "Analytics Course", "topic": "Stats"},
            teacher_id="t1",
        )
        analytics = await manager.get_course_analytics(course.id)
        assert analytics["course_id"] == course.id
        assert analytics["enrollment_stats"]["total_enrollments"] == 0

    @pytest.mark.asyncio
    async def test_get_course_analytics_not_found(self):
        """Test analytics for non-existent course raises error."""
        manager = CourseManager()
        with pytest.raises(RuntimeError, match="Course not found"):
            await manager.get_course_analytics("nonexistent")


# ---------------------------------------------------------------------------
# Lesson generation tests
# ---------------------------------------------------------------------------


class TestLessonGeneration:
    """Tests for lesson generation."""

    @pytest.mark.asyncio
    async def test_generate_lessons(self):
        """Test lesson generation for a course."""
        manager = CourseManager()
        course = await manager.create_course(
            {"title": "Course", "topic": "Python", "generate_lesson_plan": False},
            teacher_id="t1",
        )
        lessons = await manager.generate_lessons(course.id, ["Variables", "Functions"])
        assert len(lessons) == 2
        assert all(isinstance(lesson, Lesson) for lesson in lessons)
        assert lessons[0].course_id == course.id

    @pytest.mark.asyncio
    async def test_generate_lessons_course_not_found(self):
        """Test lesson generation for non-existent course."""
        manager = CourseManager()
        with pytest.raises(RuntimeError, match="Course not found"):
            await manager.generate_lessons("nonexistent", ["Topic"])


# ---------------------------------------------------------------------------
# Enrollment tests
# ---------------------------------------------------------------------------


class TestEnrollment:
    """Tests for student enrollment."""

    @pytest.mark.asyncio
    async def test_enroll_student(self):
        """Test student enrollment."""
        manager = CourseManager()
        course = await manager.create_course(
            {"title": "Course", "topic": "X"},
            teacher_id="t1",
        )
        enrollment = await manager.enroll_student("student_1", course.id)
        assert enrollment.student_id == "student_1"
        assert enrollment.course_id == course.id
        assert enrollment.status == "active"
        assert course.enrollment_count == 1

    @pytest.mark.asyncio
    async def test_multiple_enrollments(self):
        """Test multiple student enrollments increase count."""
        manager = CourseManager()
        course = await manager.create_course(
            {"title": "Course", "topic": "X"},
            teacher_id="t1",
        )
        await manager.enroll_student("s1", course.id)
        await manager.enroll_student("s2", course.id)
        await manager.enroll_student("s3", course.id)
        assert course.enrollment_count == 3


# ---------------------------------------------------------------------------
# Progress tracking tests
# ---------------------------------------------------------------------------


class TestProgressTracking:
    """Tests for progress tracking."""

    @pytest.mark.asyncio
    async def test_track_progress(self):
        """Test basic progress tracking."""
        manager = CourseManager()
        course = await manager.create_course(
            {"title": "Course", "topic": "X", "generate_lesson_plan": False},
            teacher_id="t1",
        )
        lessons = await manager.generate_lessons(course.id, ["Topic 1"])
        lesson = lessons[0]

        progress = await manager.track_reading_progress(
            "student_1",
            course.id,
            lesson.id,
            {"reading_percentage": 50, "time_spent": 300},
        )
        assert progress.reading_percentage == 50
        assert progress.completed is False
        assert lesson.progress == 50

    @pytest.mark.asyncio
    async def test_track_progress_completion(self):
        """Test progress tracking at 100% marks lesson as completed."""
        manager = CourseManager()
        course = await manager.create_course(
            {"title": "Course", "topic": "X", "generate_lesson_plan": False},
            teacher_id="t1",
        )
        lessons = await manager.generate_lessons(course.id, ["Topic 1"])
        lesson = lessons[0]

        await manager.track_reading_progress(
            "student_1",
            course.id,
            lesson.id,
            {"reading_percentage": 100, "time_spent": 600},
        )
        assert lesson.status == "completed"

    @pytest.mark.asyncio
    async def test_track_progress_updates_enrollment(self):
        """Test that progress tracking updates enrollment."""
        manager = CourseManager()
        course = await manager.create_course(
            {"title": "Course", "topic": "X", "generate_lesson_plan": False},
            teacher_id="t1",
        )
        await manager.enroll_student("student_1", course.id)
        lessons = await manager.generate_lessons(course.id, ["Topic 1"])

        await manager.track_reading_progress(
            "student_1",
            course.id,
            lessons[0].id,
            {"reading_percentage": 100, "time_spent": 600},
        )

        enrollment = manager._get_enrollment("student_1", course.id)
        assert enrollment is not None
        assert lessons[0].id in enrollment.completed_lessons

    @pytest.mark.asyncio
    async def test_track_progress_lesson_not_found(self):
        """Test progress tracking for non-existent lesson."""
        manager = CourseManager()
        course = await manager.create_course(
            {"title": "Course", "topic": "X", "generate_lesson_plan": False},
            teacher_id="t1",
        )
        with pytest.raises(RuntimeError, match="Lesson not found"):
            await manager.track_reading_progress(
                "s1", course.id, "nonexistent", {"reading_percentage": 50}
            )


# ---------------------------------------------------------------------------
# Certificate tests
# ---------------------------------------------------------------------------


class TestCertificate:
    """Tests for certificate generation."""

    @pytest.mark.asyncio
    async def test_generate_certificate(self):
        """Test certificate generation."""
        manager = CourseManager()
        course = await manager.create_course(
            {"title": "Course", "topic": "X", "generate_lesson_plan": False},
            teacher_id="t1",
        )
        await manager.enroll_student("student_1", course.id)
        lessons = await manager.generate_lessons(course.id, ["Topic 1"])

        cert = await manager.generate_certificate(
            lessons[0].id, "student_1", course.id, 95.0
        )
        assert cert["completion_score"] == 95.0
        assert cert["status"] == "issued"

    @pytest.mark.asyncio
    async def test_certificate_updates_enrollment(self):
        """Test that certificate issuance updates enrollment."""
        manager = CourseManager()
        course = await manager.create_course(
            {"title": "Course", "topic": "X", "generate_lesson_plan": False},
            teacher_id="t1",
        )
        await manager.enroll_student("student_1", course.id)
        lessons = await manager.generate_lessons(course.id, ["Topic 1"])

        await manager.generate_certificate(lessons[0].id, "student_1", course.id)

        enrollment = manager._get_enrollment("student_1", course.id)
        assert enrollment is not None
        assert enrollment.certificate_issued is True


# ---------------------------------------------------------------------------
# Social media tests
# ---------------------------------------------------------------------------


class TestSocialMedia:
    """Tests for social media posting."""

    @pytest.mark.asyncio
    async def test_post_to_social_media(self):
        """Test social media posting."""
        manager = CourseManager()
        course = await manager.create_course(
            {"title": "Course", "topic": "X", "generate_lesson_plan": False},
            teacher_id="t1",
        )
        lessons = await manager.generate_lessons(course.id, ["Topic 1"])

        posts = await manager.post_to_social_media(
            lessons[0].id, course.id, ["twitter", "facebook"], "teacher_1"
        )
        assert len(posts) == 2
        assert all(p["status"] == "posted" for p in posts)


# ---------------------------------------------------------------------------
# Cleanup tests
# ---------------------------------------------------------------------------


class TestCleanup:
    """Tests for resource cleanup."""

    @pytest.mark.asyncio
    async def test_cleanup(self):
        """Test that cleanup clears all registries."""
        manager = CourseManager()
        await manager.create_course(
            {"title": "Course", "topic": "X"},
            teacher_id="t1",
        )
        await manager.enroll_student("s1", "some_id")
        assert len(manager.course_registry) > 0

        await manager.cleanup()
        assert len(manager.course_registry) == 0
        assert len(manager.enrollment_registry) == 0
        assert len(manager.presentation_registry) == 0
