"""Shared test fixtures."""

import asyncio
import os
from typing import AsyncGenerator

import pytest
import pytest_asyncio

# Ensure we use test database before any backend imports
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///./data/test_agency.db"


@pytest.fixture(scope="session")
def event_loop():
    """Create event loop for async tests."""
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture
async def db_session():
    """Get a test database session."""
    from backend.storage import get_db_manager, get_db_session

    manager = get_db_manager()
    await manager.create_tables()

    async with get_db_session() as session:
        yield session

    await manager.drop_tables()
    await manager.close()


@pytest.fixture
def sample_agent_config():
    """Create a sample AgentConfig for testing."""
    from backend.storage.models import AgentConfig, AgentStatus

    return AgentConfig(
        name="Test Agent",
        description="A test agent",
        persona="saas_hunter",
        specialization="SaaS Engineering Talent",
        value_prop="Test value proposition",
        case_study="Test case study",
        status=AgentStatus.ACTIVE,
        discovery_industries=["SaaS", "Fintech"],
        discovery_company_size="50-500",
        discovery_hiring_signals=["backend", "platform"],
        max_companies_per_run=10,
        research_depth="deep",
        research_focus_areas=["tech_stack", "team_structure"],
        outreach_tone="professional_peer",
        outreach_daily_limit=50,
        outreach_delay_seconds=30,
        followup_sequence="standard_3_touch",
        scheduler_meeting_type="discovery_call",
        scheduler_duration_minutes=30,
    )


@pytest.fixture
def sample_company_data():
    """Sample company data for testing."""
    return {
        "name": "TestCorp Inc",
        "domain": "testcorp.com",
        "linkedin_url": "https://linkedin.com/company/testcorp",
        "industry": "SaaS",
        "employee_count": 150,
        "funding_stage": "Series B",
        "total_funding_usd": 25000000,
        "headquarters": "San Francisco, CA",
        "tech_stack": ["Python", "React", "PostgreSQL"],
        "hiring_needs": ["backend", "frontend"],
    }
