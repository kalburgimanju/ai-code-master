"""Course manager service for the AI course platform."""

import logging
from datetime import datetime
from typing import Any

from agents.content_generator import ContentGenerator
from agents.lesson_generator import LessonGenerator
from agents.models import (
    Course as CourseModel,
)
from agents.models import (
    CourseTopic,
    Enrollment,
    Lesson,
    LessonPlan,
    Presentation,
    ProgressUpdate,
)
from agents.presentation_creator import PresentationCreator
from agents.social_media_agent import SocialMediaAgent

logger = logging.getLogger(__name__)


class CourseConfig:
    """Configuration for course platform."""

    def __init__(self) -> None:
        self.default_template: str = "ai-course-template"
        self.max_lessons_per_course: int = 50
        self.max_presentations_per_lesson: int = 1
        self.default_media_quality: str = "1080p"
        self.certificate_enabled: bool = True
        self.progress_tracking: bool = True
        self.auto_generate_presentations: bool = True
        self.social_media_auto_post: bool = False
        self.default_publish_time: str = "09:00"
        self.timezone: str = "UTC"


class CourseManager:
    """Manages courses, lessons, presentations, and platform operations."""

    def __init__(self, config: CourseConfig | None = None):
        self.config = config or CourseConfig()
        self.lesson_generator = LessonGenerator()
        self.content_generator = ContentGenerator()
        self.presentation_creator = PresentationCreator()
        self.social_media_agent = SocialMediaAgent()
        self.course_registry: dict[str, CourseModel] = {}
        self.enrollment_registry: dict[str, Enrollment] = {}
        self.presentation_registry: dict[str, Presentation] = {}

    async def create_course(
        self, course_data: dict[str, Any], teacher_id: str
    ) -> CourseModel:
        """Create a new course.

        Args:
            course_data: Course data including title, description, topic, etc.
            teacher_id: ID of the teacher creating the course.

        Returns:
            Created course.
        """
        try:
            course = CourseModel(
                id=f"course_{datetime.utcnow().timestamp()}",
                title=course_data["title"],
                description=course_data.get("description", ""),
                topic=course_data["topic"],
                level=course_data.get("level", "beginner"),
                duration_weeks=course_data.get("duration_weeks", 4),
                objectives=course_data.get("objectives", []),
                lessons=[],
                created_at=datetime.utcnow().isoformat(),
                updated_at=datetime.utcnow().isoformat(),
                status="active",
                enrollment_count=0,
                completion_rate=0.0,
                average_rating=0.0,
                reviews=[],
            )

            self.course_registry[course.id] = course
            self._create_course_topics(course)

            # Generate course-wide lesson plan using AI
            if course_data.get("generate_lesson_plan", True):
                lesson_plan = await self.lesson_generator.generate_lesson_plan(
                    topic=course_data["topic"],
                    course_info={
                        "level": course_data.get("level", "beginner"),
                        "duration": course_data.get("duration_weeks", 4),
                        "objectives": course_data.get("objectives", []),
                        "target_audience": course_data.get(
                            "target_audience", "students"
                        ),
                        "course_id": course.id,
                    },
                )
                course.lesson_plan = lesson_plan
                course.lessons = self._lesson_plan_to_lessons(lesson_plan, course.id)

            return course

        except Exception as e:
            logger.error("Failed to create course: %s", e)
            raise RuntimeError(f"Failed to create course: {e}") from e

    def _create_course_topics(self, course: CourseModel) -> None:
        """Create default course topics from the course data.

        Args:
            course: Course model.
        """
        _topics = [
            CourseTopic(
                id=f"topic_{course.id}_1",
                course_id=course.id,
                title=f"Module 1: Introduction to {course.topic}",
                description=f"Getting started with {course.topic}",
                order=1,
                objectives=[f"Understand {course.topic} fundamentals"],
                estimated_duration=60,
                difficulty_level=course.level,
                status="active",
            ),
            CourseTopic(
                id=f"topic_{course.id}_2",
                course_id=course.id,
                title=f"Module 2: Advanced {course.topic} Techniques",
                description="Deep dive into advanced concepts",
                order=2,
                objectives=[f"Master advanced {course.topic} skills"],
                estimated_duration=90,
                difficulty_level=course.level,
                status="active",
            ),
            CourseTopic(
                id=f"topic_{course.id}_3",
                course_id=course.id,
                title="Module 3: Practical Applications",
                description="Real-world applications and projects",
                order=3,
                objectives=[f"Apply {course.topic} in practical scenarios"],
                estimated_duration=120,
                difficulty_level=course.level,
                status="active",
            ),
        ]

    async def update_course(
        self, course_id: str, course_data: dict[str, Any]
    ) -> CourseModel:
        """Update an existing course.

        Args:
            course_id: ID of the course to update.
            course_data: Updated course data.

        Returns:
            Updated course.

        Raises:
            RuntimeError: If course not found or update fails.
        """
        course = self.course_registry.get(course_id)
        if not course:
            raise RuntimeError(f"Course not found: {course_id}")

        try:
            if "title" in course_data:
                course.title = course_data["title"]
            if "description" in course_data:
                course.description = course_data["description"]
            if "topic" in course_data:
                course.topic = course_data["topic"]
            if "level" in course_data:
                course.level = course_data["level"]
            if "duration_weeks" in course_data:
                course.duration_weeks = course_data["duration_weeks"]
            if "objectives" in course_data:
                course.objectives = course_data["objectives"]
            course.updated_at = datetime.utcnow().isoformat()
            return course

        except Exception as e:
            logger.error("Failed to update course %s: %s", course_id, e)
            raise RuntimeError(f"Failed to update course: {e}") from e

    async def delete_course(self, course_id: str) -> None:
        """Delete a course.

        Args:
            course_id: ID of the course to delete.

        Raises:
            RuntimeError: If course not found or delete fails.
        """
        if course_id not in self.course_registry:
            raise RuntimeError(f"Course not found: {course_id}")

        try:
            del self.course_registry[course_id]
        except Exception as e:
            logger.error("Failed to delete course %s: %s", course_id, e)
            raise RuntimeError(f"Failed to delete course: {e}") from e

    async def generate_lessons(self, course_id: str, topics: list[str]) -> list[Lesson]:
        """Generate lessons for a course.

        Args:
            course_id: ID of the course.
            topics: List of topics to generate lessons for.

        Returns:
            Generated lessons.
        """
        try:
            course = self.course_registry.get(course_id)
            if not course:
                raise RuntimeError(f"Course not found: {course_id}")

            lesson_plans = []
            for topic in topics:
                lesson_plan = await self.lesson_generator.generate_lesson_plan(
                    topic=topic,
                    course_info={
                        "level": course.level,
                        "duration": course.duration_weeks,
                        "objectives": course.objectives,
                        "target_audience": "students",
                        "course_id": course.id,
                    },
                )
                lesson_plans.append(lesson_plan)

            lessons = []
            for plan in lesson_plans:
                for lesson_data in plan.lessons:
                    lesson = Lesson(
                        id=f"{course_id}_{len(lessons) + 1}",
                        title=lesson_data.title,
                        content=lesson_data.content,
                        code_examples=lesson_data.code_examples,
                        diagrams=lesson_data.diagrams,
                        duration=lesson_data.duration,
                        objectives=course.objectives,
                        prerequisites=lesson_data.prerequisites,
                        activities=lesson_data.activities,
                        resources=lesson_data.resources,
                        status="pending",
                        progress=0.0,
                        created_at=datetime.utcnow().isoformat(),
                        updated_at=datetime.utcnow().isoformat(),
                        course_id=course_id,
                        presentation_generated=False,
                    )
                    lessons.append(lesson)

            # Store lessons in the course
            course.lessons.extend(lessons)
            course.updated_at = datetime.utcnow().isoformat()

            return lessons

        except RuntimeError:
            raise
        except Exception as e:
            logger.error("Failed to generate lessons: %s", e)
            raise RuntimeError(f"Failed to generate lessons: {e}") from e

    def _lesson_plan_to_lessons(
        self, lesson_plan: LessonPlan, course_id: str
    ) -> list[Lesson]:
        """Convert a lesson plan to individual lessons.

        Args:
            lesson_plan: Lesson plan.
            course_id: ID of the course.

        Returns:
            List of lessons.
        """
        lessons = []
        for idx, lesson_data in enumerate(lesson_plan.lessons):
            lesson = Lesson(
                id=f"{course_id}_{idx + 1}",
                title=lesson_data.title,
                content=lesson_data.content,
                code_examples=lesson_data.code_examples,
                diagrams=lesson_data.diagrams,
                duration=lesson_data.duration,
                objectives=lesson_plan.objectives,
                prerequisites=lesson_data.prerequisites,
                activities=lesson_data.activities,
                resources=lesson_data.resources,
                status="pending",
                progress=0.0,
                created_at=datetime.utcnow().isoformat(),
                updated_at=datetime.utcnow().isoformat(),
                course_id=course_id,
                presentation_generated=False,
            )
            lessons.append(lesson)

        return lessons

    async def create_lesson_content(
        self, lesson_id: str, course_id: str
    ) -> dict[str, Any]:
        """Create lesson content.

        Args:
            lesson_id: ID of the lesson.
            course_id: ID of the course.

        Returns:
            Generated lesson content dictionary.
        """
        try:
            lesson = self._get_lesson(lesson_id, course_id)
            course = self.course_registry.get(course_id)

            content_data: dict[str, Any] = {
                "id": f"content_{lesson_id}",
                "title": lesson.title,
                "objectives": lesson.objectives,
                "duration": lesson.duration,
                "prerequisites": lesson.prerequisites,
                "difficulty": course.level if course else "intermediate",
            }

            content = await self.content_generator.generate_lesson_content(content_data)

            lesson.content = content.get("detailed_content", lesson.content)
            lesson.status = "content_generated"
            lesson.updated_at = datetime.utcnow().isoformat()

            return content

        except RuntimeError:
            raise
        except Exception as e:
            logger.error("Failed to create lesson content: %s", e)
            raise RuntimeError(f"Failed to create lesson content: {e}") from e

    async def create_presentation(
        self, lesson_id: str, course_id: str, logo_path: str = ""
    ) -> dict[str, Any]:
        """Create presentation for a lesson.

        Args:
            lesson_id: ID of the lesson.
            course_id: ID of the course.
            logo_path: Path to course logo.

        Returns:
            Created presentation dictionary.
        """
        try:
            course = self.course_registry.get(course_id)
            if not course:
                raise RuntimeError(f"Course not found: {course_id}")

            lesson = self._get_lesson(lesson_id, course_id)

            presentation_data: dict[str, Any] = {
                "id": f"pres_{lesson_id}",
                "title": lesson.title,
                "lesson_id": lesson_id,
                "logo_path": logo_path,
                "brand_colors": ["#2563eb", "#1e40af"],
                "objectives": lesson.objectives,
            }

            presentation = await self.presentation_creator.create_presentation(
                lesson.__dict__, presentation_data
            )

            lesson.presentation_generated = True
            lesson.updated_at = datetime.utcnow().isoformat()

            # Record presentation
            recording = await self.presentation_creator.record_presentation(
                f"pres_{lesson_id}",
                {"format": "mp4", "quality": "1080p", "logo": logo_path},
            )

            presentation["video_file_path"] = recording.get("file_path", "")
            presentation["thumbnail"] = recording.get("thumbnail", "")

            # Store presentation
            pres_model = Presentation(
                id=presentation["id"],
                lesson_id=lesson_id,
                title=presentation.get("title", lesson.title),
                slides=presentation.get("slides", []),
                theme=presentation.get("theme", "professional"),
                template=presentation.get("template", "default"),
                total_slides=presentation.get("total_slides", 0),
                duration_minutes=presentation.get("duration_minutes", 60),
                created_at=presentation.get(
                    "created_at", datetime.utcnow().isoformat()
                ),
                status=presentation.get("status", "created"),
                visibility=presentation.get("visibility", "private"),
                thumbnail=presentation.get("thumbnail", ""),
                assets=presentation.get("assets", []),
                notes=presentation.get("notes", []),
                logo=logo_path,
                brand_colors=presentation.get("brand_colors", []),
                ppt_file_path="",
                video_file_path=presentation.get("video_file_path", ""),
                audio_file_path="",
                youtube_url="",
                social_media_posts=[],
            )
            self.presentation_registry[pres_model.id] = pres_model

            return presentation

        except RuntimeError:
            raise
        except Exception as e:
            logger.error("Failed to create presentation: %s", e)
            raise RuntimeError(f"Failed to create presentation: {e}") from e

    async def enroll_student(self, student_id: str, course_id: str) -> Enrollment:
        """Enroll a student in a course.

        Args:
            student_id: ID of the student.
            course_id: ID of the course.

        Returns:
            Enrollment record.
        """
        try:
            enrollment = Enrollment(
                id=f"enroll_{student_id}_{course_id}_{datetime.utcnow().timestamp()}",
                student_id=student_id,
                course_id=course_id,
                enrollment_date=datetime.utcnow().isoformat(),
                status="active",
                progress=0.0,
                completed_lessons=[],
                last_accessed=datetime.utcnow().isoformat(),
                certificate_issued=False,
            )

            self.enrollment_registry[enrollment.id] = enrollment

            course = self.course_registry.get(course_id)
            if course:
                course.enrollment_count += 1

            return enrollment

        except Exception as e:
            logger.error("Failed to enroll student: %s", e)
            raise RuntimeError(f"Failed to enroll student: {e}") from e

    async def track_reading_progress(
        self,
        student_id: str,
        course_id: str,
        lesson_id: str,
        progress_data: dict[str, Any],
    ) -> ProgressUpdate:
        """Track student's reading progress.

        Args:
            student_id: ID of the student.
            course_id: ID of the course.
            lesson_id: ID of the lesson.
            progress_data: Progress data.

        Returns:
            Progress update.
        """
        try:
            lesson = self._get_lesson(lesson_id, course_id)

            completed = progress_data.get("reading_percentage", 0) >= 100

            lesson.progress = progress_data.get("reading_percentage", 0)
            lesson.status = "completed" if completed else "in_progress"
            lesson.updated_at = datetime.utcnow().isoformat()

            progress_update = ProgressUpdate(
                id=f"progress_{student_id}_{lesson_id}_{datetime.utcnow().timestamp()}",
                student_id=student_id,
                lesson_id=lesson_id,
                course_id=course_id,
                reading_position=progress_data.get("current_position", 0),
                reading_percentage=progress_data.get("reading_percentage", 0),
                time_spent=progress_data.get("time_spent", 0),
                completed=completed,
                last_read=datetime.utcnow().isoformat(),
                notes=progress_data.get("notes"),
                quiz_score=progress_data.get("quiz_score"),
            )

            # Update enrollment
            enrollment = self._get_enrollment(student_id, course_id)
            if enrollment:
                completed_count = len(enrollment.completed_lessons)
                if completed:
                    enrollment.completed_lessons = list(
                        {*enrollment.completed_lessons, lesson_id}
                    )
                    new_completed_count = len(enrollment.completed_lessons)
                    # Recalculate average progress across completed lessons
                    total_progress = (
                        enrollment.progress * completed_count
                        + progress_data.get("reading_percentage", 0)
                    )
                    enrollment.progress = total_progress / new_completed_count
                enrollment.last_accessed = datetime.utcnow().isoformat()

            return progress_update

        except RuntimeError:
            raise
        except Exception as e:
            logger.error("Failed to track reading progress: %s", e)
            raise RuntimeError(f"Failed to track reading progress: {e}") from e

    async def generate_certificate(
        self,
        lesson_id: str,
        student_id: str,
        course_id: str,
        completion_score: float = 100.0,
    ) -> dict[str, Any]:
        """Generate certificate for completed lesson.

        Args:
            lesson_id: ID of the lesson.
            student_id: ID of the student.
            course_id: ID of the course.
            completion_score: Completion score.

        Returns:
            Generated certificate dictionary.
        """
        try:
            self._get_lesson(lesson_id, course_id)

            certificate = await self.presentation_creator.generate_certificate(
                lesson_id,
                student_id,
                {
                    "score": completion_score,
                    "time_completed": datetime.utcnow().isoformat(),
                },
            )

            # Update enrollment
            enrollment = self._get_enrollment(student_id, course_id)
            if enrollment:
                enrollment.certificate_issued = True
                enrollment.certificate_id = certificate.get("id", "")

            # Update course completion rate
            course = self.course_registry.get(course_id)
            if course and course.enrollment_count > 0:
                enrollments = self._get_enrollments_for_course(course_id)
                completed_students = sum(1 for e in enrollments if e.certificate_issued)
                course.completion_rate = (
                    completed_students / course.enrollment_count
                ) * 100

            return certificate

        except RuntimeError:
            raise
        except Exception as e:
            logger.error("Failed to generate certificate: %s", e)
            raise RuntimeError(f"Failed to generate certificate: {e}") from e

    async def post_to_social_media(
        self,
        lesson_id: str,
        course_id: str,
        platforms: list[str],
        instructor_id: str,
    ) -> list[dict[str, Any]]:
        """Post lesson content to social media platforms.

        Args:
            lesson_id: ID of the lesson.
            course_id: ID of the course.
            platforms: List of platforms to post to.
            instructor_id: ID of the instructor.

        Returns:
            Post results.
        """
        try:
            lesson = self._get_lesson(lesson_id, course_id)

            lesson_data: dict[str, Any] = {
                "id": lesson_id,
                "title": lesson.title,
                "objectives": lesson.objectives,
            }

            posts = await self.social_media_agent.batch_post_to_platforms(
                lesson_data, platforms
            )

            return posts

        except RuntimeError:
            raise
        except Exception as e:
            logger.error("Failed to post to social media: %s", e)
            raise RuntimeError(f"Failed to post to social media: {e}") from e

    async def get_course_analytics(self, course_id: str) -> dict[str, Any]:
        """Get course analytics.

        Args:
            course_id: ID of the course.

        Returns:
            Course analytics dictionary.
        """
        try:
            course = self.course_registry.get(course_id)
            if not course:
                raise RuntimeError(f"Course not found: {course_id}")

            enrollments = self._get_enrollments_for_course(course_id)
            lessons = self._get_lessons_for_course(course_id)

            avg_progress = 0.0
            if enrollments:
                avg_progress = sum(e.progress for e in enrollments) / len(enrollments)

            avg_duration = 0.0
            if lessons:
                avg_duration = sum(lesson.duration for lesson in lessons) / len(lessons)

            return {
                "course_id": course_id,
                "enrollment_stats": {
                    "total_enrollments": course.enrollment_count,
                    "active_enrollments": len(
                        [e for e in enrollments if e.status == "active"]
                    ),
                    "completion_rate": course.completion_rate,
                    "average_progress": avg_progress,
                },
                "lesson_stats": {
                    "total_lessons": len(lessons),
                    "completed_lessons": len(
                        [lesson for lesson in lessons if lesson.status == "completed"]
                    ),
                    "average_completion_time": avg_duration,
                },
                "engagement": {
                    "total_time_spent": sum(
                        lesson.progress * lesson.duration for lesson in lessons
                    ),
                    "average_session_time": 0,
                    "return_rate": 0,
                },
                "quality_metrics": {
                    "average_rating": course.average_rating,
                    "total_reviews": len(course.reviews),
                    "student_satisfaction": course.average_rating / 5 * 100,
                },
                "content_performance": {
                    "most_popular_lessons": [],
                    "completion_by_lesson": [],
                    "student_feedback": [],
                },
                "platform_usage": {
                    "social_media_mentions": 0,
                    "external_traffic": 0,
                    "search_rankings": [],
                },
            }

        except RuntimeError:
            raise
        except Exception as e:
            logger.error("Failed to get course analytics: %s", e)
            raise RuntimeError(f"Failed to get course analytics: {e}") from e

    def _get_lesson(self, lesson_id: str, course_id: str) -> Lesson:
        """Get lesson by ID.

        Args:
            lesson_id: ID of the lesson.
            course_id: ID of the course.

        Returns:
            Lesson.

        Raises:
            RuntimeError: If course or lesson not found.
        """
        course = self.course_registry.get(course_id)
        if not course:
            raise RuntimeError(f"Course not found: {course_id}")

        for lesson in course.lessons:
            if lesson.id == lesson_id:
                return lesson

        raise RuntimeError(f"Lesson not found: {lesson_id}")

    def _get_enrollment(self, student_id: str, course_id: str) -> Enrollment | None:
        """Get enrollment by student and course IDs.

        Args:
            student_id: ID of the student.
            course_id: ID of the course.

        Returns:
            Enrollment if found, None otherwise.
        """
        for enrollment in self.enrollment_registry.values():
            if (
                enrollment.student_id == student_id
                and enrollment.course_id == course_id
            ):
                return enrollment
        return None

    def _get_enrollments_for_course(self, course_id: str) -> list[Enrollment]:
        """Get all enrollments for a course.

        Args:
            course_id: ID of the course.

        Returns:
            List of enrollments.
        """
        return [
            e for e in self.enrollment_registry.values() if e.course_id == course_id
        ]

    def _get_lessons_for_course(self, course_id: str) -> list[Lesson]:
        """Get all lessons for a course.

        Args:
            course_id: ID of the course.

        Returns:
            List of lessons.
        """
        course = self.course_registry.get(course_id)
        if course:
            return course.lessons
        return []

    async def cleanup(self) -> None:
        """Clean up resources."""
        self.course_registry.clear()
        self.enrollment_registry.clear()
        self.presentation_registry.clear()
        logger.info("Course manager cleaned up")
