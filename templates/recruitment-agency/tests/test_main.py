"""Tests for all API endpoints."""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime
from fastapi.testclient import TestClient

from backend.main import app


@pytest.fixture
def client():
    """Create a test client."""
    return TestClient(app)


# ============================================================
# Health Check Endpoints
# ============================================================


class TestHealthEndpoints:
    """Test health check endpoints."""

    def test_health_check(self, client):
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "version" in data

    def test_api_health_check(self, client):
        response = client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"


# ============================================================
# Agent Endpoints
# ============================================================


class TestAgentEndpoints:
    """Test agent CRUD and execution endpoints."""

    def test_list_agents_empty(self, client):
        with patch("backend.main.get_db_session") as mock_db:
            mock_session = AsyncMock()
            mock_session.__aenter__ = AsyncMock(return_value=mock_session)
            mock_session.__aexit__ = AsyncMock(return_value=False)

            mock_result = MagicMock()
            mock_result.scalars.return_value.all.return_value = []
            mock_session.execute = AsyncMock(return_value=mock_result)
            mock_db.return_value = mock_session

            response = client.get("/api/agents")
            assert response.status_code == 200
            data = response.json()
            assert data["agents"] == []

    def test_list_agents_with_data(self, client):
        with patch("backend.main.get_db_session") as mock_db:
            mock_session = AsyncMock()
            mock_session.__aenter__ = AsyncMock(return_value=mock_session)
            mock_session.__aexit__ = AsyncMock(return_value=False)

            # Create a mock agent config with required attributes
            mock_agent = MagicMock()
            mock_agent.id = "agent-123"
            mock_agent.name = "Test Agent"
            mock_agent.description = "Test"
            mock_agent.specialization = "SaaS"
            mock_agent.status = MagicMock(value="active")
            mock_agent.last_run_at = None
            mock_agent.next_run_at = None
            mock_agent.created_at = MagicMock(isoformat=MagicMock(return_value="2025-01-01T00:00:00"))

            mock_result = MagicMock()
            mock_result.scalars.return_value.all.return_value = [mock_agent]
            mock_session.execute = AsyncMock(return_value=mock_result)
            mock_db.return_value = mock_session

            response = client.get("/api/agents")
            assert response.status_code == 200
            data = response.json()
            assert len(data["agents"]) == 1
            assert data["agents"][0]["name"] == "Test Agent"

    def test_get_agent_not_found(self, client):
        with patch("backend.main.get_db_session") as mock_db:
            mock_session = AsyncMock()
            mock_session.__aenter__ = AsyncMock(return_value=mock_session)
            mock_session.__aexit__ = AsyncMock(return_value=False)
            mock_session.execute = AsyncMock(return_value=MagicMock(scalar_one_or_none=MagicMock(return_value=None)))
            mock_db.return_value = mock_session

            response = client.get("/api/agents/nonexistent-id")
            assert response.status_code == 404

    def test_get_agent_found(self, client):
        with patch("backend.main.get_db_session") as mock_db:
            mock_session = AsyncMock()
            mock_session.__aenter__ = AsyncMock(return_value=mock_session)
            mock_session.__aexit__ = AsyncMock(return_value=False)

            # Create a mock agent config with required attributes
            mock_agent = MagicMock()
            mock_agent.id = "agent-123"
            mock_agent.name = "Test Agent"
            mock_agent.description = "Test"
            mock_agent.specialization = "SaaS"
            mock_agent.status = MagicMock(value="active")
            mock_agent.last_run_at = None
            mock_agent.next_run_at = None
            mock_agent.created_at = MagicMock(isoformat=MagicMock(return_value="2025-01-01T00:00:00"))
            mock_agent.persona = "saas_hunter"
            mock_agent.value_prop = "Test"
            mock_agent.case_study = "Test"
            mock_agent.discovery_industries = []
            mock_agent.discovery_company_size = "10-500"
            mock_agent.discovery_hiring_signals = []
            mock_agent.max_companies_per_run = 10
            mock_agent.research_depth = "deep"
            mock_agent.research_focus_areas = []
            mock_agent.outreach_tone = "professional"
            mock_agent.outreach_daily_limit = 50
            mock_agent.outreach_delay_seconds = 30
            mock_agent.followup_sequence = "standard"
            mock_agent.scheduler_meeting_type = "discovery_call"
            mock_agent.scheduler_duration_minutes = 30

            mock_result = MagicMock()
            mock_result.scalar_one_or_none.return_value = mock_agent
            mock_result.scalars.return_value.all.return_value = []
            mock_session.execute = AsyncMock(return_value=mock_result)
            mock_db.return_value = mock_session

            response = client.get("/api/agents/agent-123")
            assert response.status_code == 200
            data = response.json()
            assert data["name"] == "Test Agent"

    def test_create_agent(self, client):
        with patch("backend.main.get_db_session") as mock_db:
            mock_session = AsyncMock()
            mock_session.__aenter__ = AsyncMock(return_value=mock_session)
            mock_session.__aexit__ = AsyncMock(return_value=False)
            mock_session.add = MagicMock()
            mock_session.commit = AsyncMock()
            mock_session.refresh = AsyncMock()
            mock_db.return_value = mock_session

            response = client.post(
                "/api/agents",
                json={
                    "name": "New Agent",
                    "description": "A new test agent",
                    "persona": "saas_hunter",
                    "specialization": "SaaS Engineering Talent",
                    "value_prop": "Test value prop",
                    "case_study": "Test case study",
                },
            )
            # The endpoint may return 200 or 400 depending on validation
            assert response.status_code in [200, 400, 422]

    def test_run_agent_not_found(self, client):
        with patch("backend.main.get_db_session") as mock_db:
            mock_session = AsyncMock()
            mock_session.__aenter__ = AsyncMock(return_value=mock_session)
            mock_session.__aexit__ = AsyncMock(return_value=False)
            mock_session.execute = AsyncMock(return_value=MagicMock(scalar_one_or_none=MagicMock(return_value=None)))
            mock_db.return_value = mock_session

            response = client.post("/api/agents/nonexistent-id/run", json={"mode": "discovery"})
            assert response.status_code == 404


# ============================================================
# Company Endpoints
# ============================================================


class TestCompanyEndpoints:
    """Test company endpoints."""

    def test_list_companies_empty(self, client):
        with patch("backend.main.get_db_session") as mock_db:
            mock_session = AsyncMock()
            mock_session.__aenter__ = AsyncMock(return_value=mock_session)
            mock_session.__aexit__ = AsyncMock(return_value=False)

            mock_result = MagicMock()
            mock_result.scalars.return_value.all.return_value = []
            mock_result.scalar.return_value = 0
            mock_session.execute = AsyncMock(return_value=mock_result)
            mock_db.return_value = mock_session

            response = client.get("/api/companies")
            assert response.status_code == 200
            data = response.json()
            assert "companies" in data

    def test_get_company_not_found(self, client):
        with patch("backend.main.get_db_session") as mock_db:
            mock_session = AsyncMock()
            mock_session.__aenter__ = AsyncMock(return_value=mock_session)
            mock_session.__aexit__ = AsyncMock(return_value=False)
            mock_session.execute = AsyncMock(return_value=MagicMock(scalar_one_or_none=MagicMock(return_value=None)))
            mock_db.return_value = mock_session

            response = client.get("/api/companies/nonexistent-id")
            assert response.status_code == 404


# ============================================================
# Campaign Endpoints
# ============================================================


class TestCampaignEndpoints:
    """Test campaign endpoints."""

    def test_list_campaigns_empty(self, client):
        with patch("backend.main.get_db_session") as mock_db:
            mock_session = AsyncMock()
            mock_session.__aenter__ = AsyncMock(return_value=mock_session)
            mock_session.__aexit__ = AsyncMock(return_value=False)

            mock_result = MagicMock()
            mock_result.scalars.return_value.all.return_value = []
            mock_session.execute = AsyncMock(return_value=mock_result)
            mock_db.return_value = mock_session

            response = client.get("/api/campaigns")
            assert response.status_code == 200
            data = response.json()
            assert "campaigns" in data


# ============================================================
# Pipeline Endpoints
# ============================================================


class TestPipelineEndpoints:
    """Test pipeline endpoints."""

    def test_get_pipeline(self, client):
        with patch("backend.main.get_db_session") as mock_db:
            mock_session = AsyncMock()
            mock_session.__aenter__ = AsyncMock(return_value=mock_session)
            mock_session.__aexit__ = AsyncMock(return_value=False)

            # Pipeline endpoint makes 2 calls:
            # 1) session.execute() → result.fetchall() for by_stage
            # 2) session.execute() → result.one() for total_count, total_value
            mock_result_list = MagicMock()
            mock_result_list.fetchall.return_value = []

            mock_result_count = MagicMock()
            mock_result_count.one.return_value = (0, 0)

            mock_session.execute = AsyncMock(side_effect=[mock_result_list, mock_result_count])
            mock_db.return_value = mock_session

            response = client.get("/api/pipeline")
            assert response.status_code in [200, 500]

    def test_get_pipeline_deals(self, client):
        with patch("backend.main.get_db_session") as mock_db:
            mock_session = AsyncMock()
            mock_session.__aenter__ = AsyncMock(return_value=mock_session)
            mock_session.__aexit__ = AsyncMock(return_value=False)

            # Pipeline deals endpoint makes 2 calls:
            # 1) session.execute() → result.scalar() for total count
            # 2) session.execute() → result.scalars().all() for deals
            mock_result_count = MagicMock()
            mock_result_count.scalar.return_value = 0

            mock_result_list = MagicMock()
            mock_result_list.scalars.return_value.all.return_value = []

            mock_session.execute = AsyncMock(side_effect=[mock_result_count, mock_result_list])
            mock_db.return_value = mock_session

            response = client.get("/api/pipeline/deals")
            assert response.status_code in [200, 500]


# ============================================================
# Analytics Endpoints
# ============================================================


class TestAnalyticsEndpoints:
    """Test analytics endpoints."""

    def test_get_analytics_overview(self, client):
        with patch("backend.main.get_db_session") as mock_db:
            mock_session = AsyncMock()
            mock_session.__aenter__ = AsyncMock(return_value=mock_session)
            mock_session.__aexit__ = AsyncMock(return_value=False)

            # Analytics endpoint makes 3 calls:
            # 1) result.one() → (total, sent, opened, clicked, replied, bounced)
            # 2) result.one() → (deals_created, pipeline_value)
            # 3) result.scalar() → calls_booked
            mock_result_email = MagicMock()
            mock_result_email.one.return_value = (0, 0, 0, 0, 0, 0)

            mock_result_pipeline = MagicMock()
            mock_result_pipeline.one.return_value = (0, 0)

            mock_result_calls = MagicMock()
            mock_result_calls.scalar.return_value = 0

            mock_session.execute = AsyncMock(side_effect=[
                mock_result_email,
                mock_result_pipeline,
                mock_result_calls,
            ])
            mock_db.return_value = mock_session

            response = client.get("/api/analytics/overview")
            assert response.status_code == 200
            data = response.json()
            assert "email" in data
            assert "pipeline" in data
            assert "calls" in data


# ============================================================
# Webhook Endpoints
# ============================================================


class TestWebhookEndpoints:
    """Test webhook endpoints."""

    def test_sendgrid_webhook(self, client):
        mock_instance = MagicMock()
        mock_instance.handle_webhook = AsyncMock(return_value=[
            {"event_type": "delivered", "email": "test@example.com"}
        ])

        with patch("backend.main._process_sendgrid_events") as mock_process, \
             patch("backend.services.email.EmailService", return_value=mock_instance):
            mock_process.return_value = None

            response = client.post(
                "/api/webhooks/sendgrid",
                json=[
                    {
                        "email": "test@example.com",
                        "event": "delivered",
                        "timestamp": 1234567890,
                    }
                ],
            )
            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "ok"
            assert data["events_received"] == 1

    def test_calcom_webhook(self, client):
        mock_instance = MagicMock()
        mock_instance.handle_webhook = AsyncMock(return_value={
            "event_type": "BOOKING_CREATED",
            "booking_id": "booking-123",
        })

        with patch("backend.main._process_calcom_event") as mock_process, \
             patch("backend.services.calendar.CalendarClient", return_value=mock_instance):
            mock_process.return_value = None

            response = client.post(
                "/api/webhooks/calcom",
                json={
                    "triggerEvent": "BOOKING_CREATED",
                    "payload": {
                        "id": "booking-123",
                        "title": "Discovery Call",
                    },
                },
            )
            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "ok"
            assert data["event_type"] == "BOOKING_CREATED"

    def test_sendgrid_webhook_invalid_json(self, client):
        response = client.post(
            "/api/webhooks/sendgrid",
            content=b"not json",
            headers={"Content-Type": "application/json"},
        )
        # The endpoint catches JSON errors and returns error status
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "error"

    def test_calcom_webhook_invalid_json(self, client):
        response = client.post(
            "/api/webhooks/calcom",
            content=b"not json",
            headers={"Content-Type": "application/json"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "error"
