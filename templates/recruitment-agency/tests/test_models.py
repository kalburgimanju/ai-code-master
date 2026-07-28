"""Tests for SQLAlchemy models."""

import pytest
from datetime import datetime
from uuid import uuid4

from backend.storage.models import (
    AgentConfig,
    AgentStatus,
    AgentRun,
    AgentRunStatus,
    Company,
    CompanyStage,
    Contact,
    EmailLog,
    EmailStatus,
    PipelineDeal,
    DealActivity,
    CallBooking,
    OutreachCampaign,
    CampaignStatus,
    UnsubscribeRecord,
    AnalyticsSnapshot,
)


class TestEnums:
    """Test enum models."""

    def test_agent_status_values(self):
        """AgentStatus has all expected values."""
        assert AgentStatus.ACTIVE.value == "active"
        assert AgentStatus.INACTIVE.value == "inactive"
        assert AgentStatus.RUNNING.value == "running"
        assert AgentStatus.ERROR.value == "error"
        assert AgentStatus.PAUSED.value == "paused"

    def test_company_stage_values(self):
        """CompanyStage has all expected pipeline stages."""
        stages = [s.value for s in CompanyStage]
        assert "discovered" in stages
        assert "researched" in stages
        assert "contacted" in stages
        assert "replied" in stages
        assert "call_booked" in stages
        assert "qualified" in stages
        assert "proposal_sent" in stages
        assert "closed_won" in stages
        assert "closed_lost" in stages

    def test_email_status_values(self):
        """EmailStatus has all expected values."""
        assert EmailStatus.PENDING.value == "pending"
        assert EmailStatus.SENT.value == "sent"
        assert EmailStatus.DELIVERED.value == "delivered"
        assert EmailStatus.OPENED.value == "opened"
        assert EmailStatus.REPLIED.value == "replied"
        assert EmailStatus.BOUNCED.value == "bounced"
        assert EmailStatus.FAILED.value == "failed"

    def test_campaign_status_values(self):
        """CampaignStatus has all expected values."""
        assert CampaignStatus.DRAFT.value == "draft"
        assert CampaignStatus.RUNNING.value == "running"
        assert CampaignStatus.COMPLETED.value == "completed"
        assert CampaignStatus.FAILED.value == "failed"


class TestAgentConfig:
    """Test AgentConfig model creation."""

    def test_create_agent_config(self):
        """AgentConfig can be created with required fields."""
        config = AgentConfig(
            name="Test Agent",
            status=AgentStatus.INACTIVE,
        )
        assert config.name == "Test Agent"
        assert config.status == AgentStatus.INACTIVE
        assert config.max_companies_per_run == 50
        assert config.outreach_daily_limit == 50

    def test_agent_config_defaults(self):
        """AgentConfig has correct default values."""
        config = AgentConfig(name="Defaults Agent")
        assert config.discovery_industries == []
        assert config.discovery_hiring_signals == []
        assert config.research_depth == "standard"
        assert config.outreach_tone == "professional_peer"
        assert config.followup_sequence == "standard_3_touch"
        assert config.scheduler_meeting_type == "discovery_call"
        assert config.scheduler_duration_minutes == 30


class TestCompany:
    """Test Company model creation."""

    def test_create_company(self):
        """Company can be created with required fields."""
        company = Company(
            name="TestCorp",
            agent_id=str(uuid4()),
        )
        assert company.name == "TestCorp"
        assert company.stage == CompanyStage.DISCOVERED
        assert company.confidence_score == 0.0
        assert company.tech_stack == []
        assert company.hiring_needs == []

    def test_company_with_details(self):
        """Company can be created with full details."""
        company = Company(
            name="TechCorp",
            agent_id=str(uuid4()),
            domain="techcorp.com",
            industry="SaaS",
            employee_count=150,
            funding_stage="Series B",
            stage=CompanyStage.RESEARCHED,
            tech_stack=["Python", "React"],
            hiring_needs=["backend", "frontend"],
        )
        assert company.domain == "techcorp.com"
        assert company.employee_count == 150
        assert len(company.tech_stack) == 2


class TestContact:
    """Test Contact model creation."""

    def test_create_contact(self):
        """Contact can be created with required fields."""
        contact = Contact(
            company_id=str(uuid4()),
            first_name="John",
            last_name="Doe",
            full_name="John Doe",
            title="VP Engineering",
        )
        assert contact.first_name == "John"
        assert contact.title == "VP Engineering"
        assert contact.is_decision_maker is False
        assert contact.engagement_score == 0.0


class TestEmailLog:
    """Test EmailLog model creation."""

    def test_create_email_log(self):
        """EmailLog can be created with required fields."""
        email = EmailLog(
            to_email="test@example.com",
            from_email="sender@example.com",
            from_name="Test Sender",
            subject="Test Subject",
        )
        assert email.to_email == "test@example.com"
        assert email.status == EmailStatus.PENDING
        assert email.is_followup is False
        assert email.sequence_step == 1


class TestPipelineDeal:
    """Test PipelineDeal model creation."""

    def test_create_deal(self):
        """PipelineDeal can be created with required fields."""
        deal = PipelineDeal(
            company_id=str(uuid4()),
            name="Placement: TestCorp",
            stage=CompanyStage.DISCOVERED,
        )
        assert deal.name == "Placement: TestCorp"
        assert deal.probability == 5
        assert deal.stage == CompanyStage.DISCOVERED


class TestCallBooking:
    """Test CallBooking model creation."""

    def test_create_booking(self):
        """CallBooking can be created with required fields."""
        booking = CallBooking(
            company_id=str(uuid4()),
            contact_id=str(uuid4()),
            title="Discovery Call",
            scheduled_at=datetime.utcnow(),
        )
        assert booking.title == "Discovery Call"
        assert booking.status == "scheduled"
        assert booking.duration_minutes == 30
