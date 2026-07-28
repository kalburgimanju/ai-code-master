#!/usr/bin/env python3
"""Demonstration of the AI Course Platform API usage."""

import asyncio
from typing import Any


class MockCourseManager:
    """Mock course manager for demonstration."""

    async def create_course(
        self, course_data: dict[str, Any], teacher_id: str
    ) -> dict[str, Any]:
        """Create a new course."""
        return {
            "id": "course_demo_001",
            "title": course_data["title"],
            "description": course_data.get("description", ""),
            "topic": course_data["topic"],
            "status": "created",
            "teacher_id": teacher_id,
        }

    async def generate_lessons(
        self, course_id: str, topics: list[str]
    ) -> list[dict[str, Any]]:
        """Generate lessons for a course."""
        return [
            {
                "id": f"lesson_{course_id}_{i + 1}",
                "title": topic,
                "content": f"Generated content for {topic}",
                "status": "generated",
            }
            for i, topic in enumerate(topics)
        ]

    async def create_presentation(
        self, lesson_id: str, course_id: str, logo_path: str = ""
    ) -> dict[str, Any]:
        """Create presentation for a lesson."""
        return {
            "id": f"presentation_{lesson_id}",
            "lesson_id": lesson_id,
            "course_id": course_id,
            "title": f"Presentation: {lesson_id}",
            "logo": logo_path,
            "theme": "professional",
            "status": "created",
        }

    async def enroll_student(self, student_id: str, course_id: str) -> dict[str, Any]:
        """Enroll a student in a course."""
        return {
            "id": f"enroll_{student_id}_{course_id}",
            "student_id": student_id,
            "course_id": course_id,
            "status": "active",
            "enrollment_date": "2026-07-21T00:00:00Z",
        }

    async def track_reading_progress(
        self,
        student_id: str,
        course_id: str,
        lesson_id: str,
        progress_data: dict[str, Any],
    ) -> dict[str, Any]:
        """Track reading progress."""
        return {
            "id": f"progress_{student_id}_{lesson_id}",
            "student_id": student_id,
            "course_id": course_id,
            "lesson_id": lesson_id,
            "reading_percentage": progress_data.get("reading_percentage", 0),
            "time_spent": progress_data.get("time_spent", 0),
            "current_position": progress_data.get("current_position", 0),
            "completed": progress_data.get("completed", False),
        }

    async def generate_certificate(
        self,
        lesson_id: str,
        student_id: str,
        course_id: str,
        completion_score: float = 100.0,
    ) -> dict[str, Any]:
        """Generate certificate."""
        return {
            "id": f"cert_{lesson_id}_{student_id}",
            "lesson_id": lesson_id,
            "student_id": student_id,
            "course_id": course_id,
            "completion_score": completion_score,
            "certificate_url": f"/certificates/cert_{lesson_id}_{student_id}.pdf",
            "issued_at": "2026-07-21T00:00:00Z",
            "status": "issued",
        }

    async def post_to_social_media(
        self, lesson_id: str, course_id: str, platforms: list[str], instructor_id: str
    ) -> list[dict[str, Any]]:
        """Post to social media platforms."""
        return [
            {
                "id": f"post_{lesson_id}_{platform}",
                "platform": platform,
                "lesson_id": lesson_id,
                "status": "posted",
                "url": f"https://{platform}.com/{lesson_id}",
            }
            for platform in platforms
        ]

    async def create_lesson_content(
        self, lesson_id: str, course_id: str
    ) -> dict[str, Any]:
        """Create lesson content."""
        return {
            "id": f"content_{lesson_id}",
            "lesson_id": lesson_id,
            "course_id": course_id,
            "detailed_content": f"Generated content for lesson {lesson_id}",
            "status": "generated",
        }


async def demo_course_platform() -> None:
    """Demonstrate the AI Course Platform API."""
    print("=" * 60)
    print("AI Course Platform - Demo Usage")
    print("=" * 60)

    course_manager = MockCourseManager()

    # Step 1: Create a course
    print("\n1. Creating AI Course...")
    course_data = {
        "title": "Introduction to Machine Learning",
        "description": "Learn the fundamentals of ML algorithms",
        "topic": "Machine Learning",
        "level": "beginner",
        "duration_weeks": 6,
        "objectives": [
            "Understand ML concepts",
            "Implement basic algorithms",
            "Analyze results",
        ],
    }
    teacher_id = "teacher_123"

    course = await course_manager.create_course(course_data, teacher_id)
    print(f"  Course created: {course['title']}")
    print(f"  Course ID: {course['id']}")

    # Step 2: Generate lessons
    print("\n2. Generating Lessons...")
    topics = [
        "Introduction to ML",
        "Data Preprocessing",
        "Linear Regression",
        "Logistic Regression",
        "Decision Trees",
        "Random Forests",
    ]

    lessons = await course_manager.generate_lessons(course["id"], topics)
    print(f"  Generated {len(lessons)} lessons:")
    for i, lesson in enumerate(lessons, 1):
        print(f"    {i}. {lesson['title']}")

    # Step 3: Create presentation with custom branding
    print("\n3. Creating Presentation (with custom branding)...")
    logo_path = "/uploads/logos/school-logo.png"
    presentation = await course_manager.create_presentation(
        lessons[0]["id"], course["id"], logo_path
    )
    print(f"  Presentation created: {presentation['title']}")
    print(f"  Logo: {presentation['logo']}")
    print(f"  Theme: {presentation['theme']}")

    # Step 4: Student enrollment
    print("\n4. Student Enrollment...")
    student_id = "student_456"
    enrollment = await course_manager.enroll_student(student_id, course["id"])
    print(f"  Student enrolled: {enrollment['student_id']}")
    print(f"  Status: {enrollment['status']}")

    # Step 5: Track reading progress
    print("\n5. Tracking Reading Progress...")
    progress_data = {
        "reading_percentage": 75,
        "time_spent": 1800,
        "current_position": 45,
        "completed": False,
    }

    progress = await course_manager.track_reading_progress(
        student_id, course["id"], lessons[0]["id"], progress_data
    )
    print(f"  Reading Progress: {progress['reading_percentage']}%")
    print(f"  Time Spent: {progress['time_spent']} seconds")

    # Step 6: Complete lesson and issue certificate
    print("\n6. Completing Lesson and Issuing Certificate...")
    completed_data = {**progress_data, "completed": True, "reading_percentage": 100}
    await course_manager.track_reading_progress(
        student_id, course["id"], lessons[0]["id"], completed_data
    )

    certificate = await course_manager.generate_certificate(
        lessons[0]["id"], student_id, course["id"], 98.5
    )
    print(f"  Certificate ID: {certificate['id']}")
    print(f"  Score: {certificate['completion_score']}")
    print(f"  Download URL: {certificate['certificate_url']}")

    # Step 7: Social media integration
    print("\n7. Social Media Integration...")
    platforms = ["youtube", "facebook", "twitter", "linkedin"]

    posts = await course_manager.post_to_social_media(
        lessons[0]["id"], course["id"], platforms, teacher_id
    )
    print(f"  Platforms: {', '.join(p['platform'] for p in posts)}")
    print(f"  Total Posts: {len(posts)}")

    # Step 8: Batch processing
    print("\n8. Batch Processing - Multiple Lessons...")

    all_lessons_content = []
    for lesson in lessons:
        content = await course_manager.create_lesson_content(lesson["id"], course["id"])
        all_lessons_content.append(content)

    print(f"  Generated content for {len(all_lessons_content)} lessons")

    # Enroll multiple students
    students = ["student_789", "student_101", "student_202"]
    enrollments = []
    for student in students:
        enrollment = await course_manager.enroll_student(student, course["id"])
        enrollments.append(enrollment)

    print(f"  Enrolled {len(enrollments)} students")

    # Track different progress levels
    progress_values = []
    for i, student in enumerate(students):
        pct = (i + 1) * 33  # 33%, 66%, 100%
        progress_values.append(pct)
        await course_manager.track_reading_progress(
            student,
            course["id"],
            lessons[i]["id"],
            {"reading_percentage": pct, "time_spent": 2000 * (i + 1)},
        )
        print(f"    Student {student}: {pct}% complete")

    # Summary
    total_students = len(enrollments) + 1  # +1 for the initial enrollment
    avg_progress = (
        sum(progress_values) / len(progress_values) if progress_values else 0.0
    )

    print("\n" + "=" * 60)
    print("PLATFORM SUMMARY")
    print("=" * 60)
    print(f"  Course Created: {course['title']}")
    print(f"  Lessons Generated: {len(lessons)}")
    print(f"  Students Enrolled: {total_students}")
    print(f"  Average Progress: {avg_progress:.1f}%")
    print("  Certificates Issued: 1")
    print(f"  Social Platforms Used: {len(platforms)}")
    print(f"  Custom Branding Applied: Yes (logo: {logo_path})")

    print("\n  Platform Ready for Production!")
    print("\n  Key Features Demonstrated:")
    print("    - AI-powered lesson plan generation")
    print("    - Progress tracking with percentage monitoring")
    print("    - Custom presentation branding (logo + theme)")
    print("    - Multi-platform social media integration")
    print("    - Automated certificate issuance")
    print("    - Student enrollment and course access")
    print("    - Batch processing for multiple lessons")
    print("    - Real-time progress analytics")


if __name__ == "__main__":
    asyncio.run(demo_course_platform())
