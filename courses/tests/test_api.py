"""Tests for the FastAPI API endpoints."""

import pytest
from fastapi.testclient import TestClient

from api.app import app, course_manager


@pytest.fixture(autouse=True)
def reset_manager():
    """Reset the course manager before each test."""
    course_manager.course_registry.clear()
    course_manager.enrollment_registry.clear()
    course_manager.presentation_registry.clear()
    yield
    course_manager.course_registry.clear()
    course_manager.enrollment_registry.clear()
    course_manager.presentation_registry.clear()


@pytest.fixture
def client():
    """Create a test client."""
    return TestClient(app)


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------


class TestHealthCheck:
    """Tests for health check endpoint."""

    def test_health_check(self, client):
        """Test health check returns healthy status."""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "timestamp" in data


# ---------------------------------------------------------------------------
# Course endpoints
# ---------------------------------------------------------------------------


class TestCourseEndpoints:
    """Tests for course CRUD endpoints."""

    def test_create_course(self, client):
        """Test course creation endpoint."""
        response = client.post(
            "/courses",
            json={
                "title": "API Test Course",
                "topic": "Testing",
                "description": "A test course",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Course created successfully"
        assert data["course"]["title"] == "API Test Course"

    def test_get_course(self, client):
        """Test get course endpoint."""
        # Create a course first
        create_resp = client.post(
            "/courses",
            json={"title": "Get Test", "topic": "X"},
        )
        course_id = create_resp.json()["course"]["id"]

        response = client.get(f"/courses/{course_id}")
        assert response.status_code == 200
        assert response.json()["course"]["id"] == course_id

    def test_get_course_not_found(self, client):
        """Test get course with invalid ID."""
        response = client.get("/courses/nonexistent")
        assert response.status_code == 404

    def test_update_course(self, client):
        """Test course update endpoint."""
        create_resp = client.post(
            "/courses",
            json={"title": "Old", "topic": "X"},
        )
        course_id = create_resp.json()["course"]["id"]

        response = client.put(
            f"/courses/{course_id}",
            json={"title": "Updated"},
        )
        assert response.status_code == 200
        assert response.json()["course"]["title"] == "Updated"

    def test_delete_course(self, client):
        """Test course deletion endpoint."""
        create_resp = client.post(
            "/courses",
            json={"title": "Delete Me", "topic": "X"},
        )
        course_id = create_resp.json()["course"]["id"]

        response = client.delete(f"/courses/{course_id}")
        assert response.status_code == 200
        assert response.json()["message"] == "Course deleted successfully"

        # Verify deletion
        get_resp = client.get(f"/courses/{course_id}")
        assert get_resp.status_code == 404

    def test_course_analytics(self, client):
        """Test course analytics endpoint."""
        create_resp = client.post(
            "/courses",
            json={"title": "Analytics", "topic": "Stats"},
        )
        course_id = create_resp.json()["course"]["id"]

        response = client.get(f"/courses/{course_id}/analytics")
        assert response.status_code == 200
        assert "analytics" in response.json()


# ---------------------------------------------------------------------------
# Lesson endpoints
# ---------------------------------------------------------------------------


class TestLessonEndpoints:
    """Tests for lesson generation endpoints."""

    def test_generate_lessons(self, client):
        """Test lesson generation endpoint."""
        create_resp = client.post(
            "/courses",
            json={"title": "Course", "topic": "X", "generate_lesson_plan": False},
        )
        course_id = create_resp.json()["course"]["id"]

        response = client.post(
            f"/courses/{course_id}/lessons",
            json={"topics": ["Topic A", "Topic B"]},
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data["lessons"]) == 2
        assert data["message"] == "Lessons generated successfully"


# ---------------------------------------------------------------------------
# Enrollment endpoints
# ---------------------------------------------------------------------------


class TestEnrollmentEndpoints:
    """Tests for enrollment endpoints."""

    def test_enroll_student(self, client):
        """Test student enrollment endpoint."""
        create_resp = client.post(
            "/courses",
            json={"title": "Course", "topic": "X"},
        )
        course_id = create_resp.json()["course"]["id"]

        response = client.post(
            "/enrollments",
            json={"student_id": "s1", "course_id": course_id},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["enrollment"]["student_id"] == "s1"
        assert data["message"] == "Student enrolled successfully"


# ---------------------------------------------------------------------------
# Progress endpoints
# ---------------------------------------------------------------------------


class TestProgressEndpoints:
    """Tests for progress tracking endpoints."""

    def test_track_progress(self, client):
        """Test progress tracking endpoint."""
        create_resp = client.post(
            "/courses",
            json={"title": "Course", "topic": "X", "generate_lesson_plan": False},
        )
        course_id = create_resp.json()["course"]["id"]

        lessons_resp = client.post(
            f"/courses/{course_id}/lessons",
            json={"topics": ["Topic 1"]},
        )
        lesson_id = lessons_resp.json()["lessons"][0]["id"]

        response = client.post(
            "/progress",
            json={
                "student_id": "s1",
                "course_id": course_id,
                "lesson_id": lesson_id,
                "progress_data": {"reading_percentage": 75, "time_spent": 300},
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["progress"]["reading_percentage"] == 75


# ---------------------------------------------------------------------------
# Certificate endpoints
# ---------------------------------------------------------------------------


class TestCertificateEndpoints:
    """Tests for certificate endpoints."""

    def test_issue_certificate(self, client):
        """Test certificate issuance endpoint."""
        create_resp = client.post(
            "/courses",
            json={"title": "Course", "topic": "X", "generate_lesson_plan": False},
        )
        course_id = create_resp.json()["course"]["id"]

        client.post(
            "/enrollments",
            json={"student_id": "s1", "course_id": course_id},
        )

        lessons_resp = client.post(
            f"/courses/{course_id}/lessons",
            json={"topics": ["Topic 1"]},
        )
        lesson_id = lessons_resp.json()["lessons"][0]["id"]

        response = client.post(
            "/certificates",
            json={
                "lesson_id": lesson_id,
                "student_id": "s1",
                "course_id": course_id,
                "completion_score": 98.5,
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["certificate"]["completion_score"] == 98.5


# ---------------------------------------------------------------------------
# Presentation endpoints
# ---------------------------------------------------------------------------


class TestPresentationEndpoints:
    """Tests for presentation endpoints."""

    def test_create_presentation(self, client):
        """Test presentation creation endpoint."""
        create_resp = client.post(
            "/courses",
            json={"title": "Course", "topic": "X", "generate_lesson_plan": False},
        )
        course_id = create_resp.json()["course"]["id"]

        lessons_resp = client.post(
            f"/courses/{course_id}/lessons",
            json={"topics": ["Topic 1"]},
        )
        lesson_id = lessons_resp.json()["lessons"][0]["id"]

        response = client.post(
            "/presentations",
            json={
                "lesson_id": lesson_id,
                "course_id": course_id,
                "logo_path": "/uploads/logo.png",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["presentation"]["total_slides"] > 0


# ---------------------------------------------------------------------------
# Social media endpoints
# ---------------------------------------------------------------------------


class TestSocialMediaEndpoints:
    """Tests for social media endpoints."""

    def test_generate_social_media_content(self, client):
        """Test social media content generation endpoint."""
        response = client.post(
            "/social-media/content",
            json={
                "lesson_data": {"id": "l1", "title": "Test", "objectives": []},
                "platforms": ["twitter", "linkedin"],
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "twitter" in data["content"]["content_by_platform"]
        assert "linkedin" in data["content"]["content_by_platform"]


# ---------------------------------------------------------------------------
# Utility endpoints
# ---------------------------------------------------------------------------


class TestUtilityEndpoints:
    """Tests for utility endpoints."""

    def test_get_themes(self, client):
        """Test themes endpoint."""
        response = client.get("/teachers/themes")
        assert response.status_code == 200
        themes = response.json()["themes"]
        assert len(themes) == 5
        assert any(t["id"] == "professional" for t in themes)

    def test_get_templates(self, client):
        """Test templates endpoint."""
        response = client.get("/teachers/templates")
        assert response.status_code == 200
        templates = response.json()["templates"]
        assert len(templates) == 3

    def test_create_user(self, client):
        """Test user creation endpoint."""
        response = client.post(
            "/users",
            json={"email": "test@test.com", "name": "Test User"},
        )
        assert response.status_code == 200
        assert response.json()["user"]["email"] == "test@test.com"

    def test_create_teacher(self, client):
        """Test teacher creation endpoint."""
        response = client.post(
            "/teachers",
            json={"user_id": "u1", "bio": "AI Expert", "expertise": ["ML", "DL"]},
        )
        assert response.status_code == 200
        assert response.json()["teacher"]["bio"] == "AI Expert"
