"""Main FastAPI application for the Recruitment Agency Platform."""

import os
import sys
from contextlib import asynccontextmanager
from datetime import datetime
from pathlib import Path
from typing import Dict, Any

from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from backend.config import load_config, get_settings
from backend.storage import get_db_manager, get_db_session
from backend.storage.models import (
    AgentConfig, AgentRun, AgentStatus, AgentRunStatus,
    Company, CompanyStage, Contact, OutreachCampaign, CampaignStatus,
    EmailLog, EmailStatus, PipelineDeal, CallBooking, UnsubscribeRecord,
    AnalyticsSnapshot,
)
from backend.agents import (
    CompanyDiscoveryAgent, CompanyResearchAgent, OutreachAgent,
    FollowupAgent, SchedulerAgent, PipelineAgent,
)
from backend.agents.base import AgentContext


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    # Startup
    db = get_db_manager()
    await db.create_tables()
    print("Database initialized")
    yield
    # Shutdown
    await db.close()
    print("Database connections closed")


app = FastAPI(
    title="Recruitment Agency Platform API",
    description="Autonomous recruitment agency platform with AI agents for full-cycle recruiting",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS middleware
settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.dashboard.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health check
@app.get("/health")
async def health_check() -> Dict[str, str]:
    return {"status": "healthy", "version": "0.1.0"}


@app.get("/api/health")
async def api_health() -> Dict[str, Any]:
    settings = get_settings()
    return {
        "status": "healthy",
        "version": "0.1.0",
        "environment": settings.environment,
        "features": {
            "ai_research": settings.features.enable_ai_research,
            "auto_outreach": settings.features.enable_auto_outreach,
            "auto_followup": settings.features.enable_auto_followup,
            "auto_scheduling": settings.features.enable_auto_scheduling,
            "crm_sync": settings.features.enable_crm_sync,
        }
    }


# ============================================================
# AGENT ENDPOINTS
# ============================================================

class AgentCreateRequest(BaseModel):
    name: str
    type: str = "discovery"
    persona: str = "saas_hunter"
    description: str | None = None


class AgentRunRequest(BaseModel):
    mode: str = "full"
    input_data: dict = {}
    dry_run: bool = False


@app.post("/api/agents")
async def create_agent(request: AgentCreateRequest) -> Dict[str, Any]:
    """Create a new agent."""
    async with get_db_session() as session:
        # Check if name exists
        from sqlalchemy import select
        stmt = select(AgentConfig).where(AgentConfig.name == request.name)
        result = await session.execute(stmt)
        if result.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Agent name already exists")

        # Load persona template
        settings = get_settings()
        personas = settings.agent_personas
        persona_config = getattr(personas, request.persona, None)

        agent_config = AgentConfig(
            name=request.name,
            description=request.description or (persona_config.description if persona_config else ""),
            persona=persona_config.persona if persona_config else "",
            specialization=persona_config.specialization if persona_config else "",
            value_prop=persona_config.value_prop if persona_config else "",
            case_study=persona_config.case_study if persona_config else "",
            status=AgentStatus.INACTIVE,
        )

        if persona_config and persona_config.discovery:
            agent_config.discovery_industries = persona_config.discovery.industries
            agent_config.discovery_company_size = persona_config.discovery.company_size
            agent_config.discovery_hiring_signals = persona_config.discovery.hiring_signals
            agent_config.max_companies_per_run = 50

        if persona_config and persona_config.research:
            agent_config.research_depth = persona_config.research.depth
            agent_config.research_focus_areas = persona_config.research.focus_areas

        if persona_config and persona_config.outreach:
            agent_config.outreach_tone = persona_config.outreach.tone
            agent_config.outreach_templates_dir = persona_config.outreach.templates_dir

        if persona_config and persona_config.followup:
            agent_config.followup_sequence = persona_config.followup.sequence

        if persona_config and persona_config.scheduler:
            agent_config.scheduler_meeting_type = persona_config.scheduler.meeting_type
            agent_config.scheduler_duration_minutes = persona_config.scheduler.duration

        session.add(agent_config)
        await session.commit()
        await session.refresh(agent_config)

        return {
            "id": agent_config.id,
            "name": agent_config.name,
            "status": agent_config.status.value,
            "created_at": agent_config.created_at.isoformat(),
        }


@app.get("/api/agents")
async def list_agents() -> Dict[str, Any]:
    """List all agents."""
    async with get_db_session() as session:
        from sqlalchemy import select
        stmt = select(AgentConfig).order_by(AgentConfig.created_at.desc())
        result = await session.execute(stmt)
        agents = result.scalars().all()

        return {
            "agents": [
                {
                    "id": a.id,
                    "name": a.name,
                    "description": a.description,
                    "specialization": a.specialization,
                    "status": a.status.value,
                    "last_run_at": a.last_run_at.isoformat() if a.last_run_at else None,
                    "next_run_at": a.next_run_at.isoformat() if a.next_run_at else None,
                    "created_at": a.created_at.isoformat(),
                }
                for a in agents
            ]
        }


@app.get("/api/agents/{agent_id}")
async def get_agent(agent_id: str) -> Dict[str, Any]:
    """Get agent details."""
    async with get_db_session() as session:
        from sqlalchemy import select
        stmt = select(AgentConfig).where(AgentConfig.id == agent_id)
        result = await session.execute(stmt)
        agent = result.scalar_one_or_none()

        if not agent:
            raise HTTPException(status_code=404, detail="Agent not found")

        # Get recent runs
        stmt = select(AgentRun).where(AgentRun.agent_id == agent_id).order_by(AgentRun.created_at.desc()).limit(10)
        result = await session.execute(stmt)
        runs = result.scalars().all()

        return {
            "id": agent.id,
            "name": agent.name,
            "description": agent.description,
            "persona": agent.persona,
            "specialization": agent.specialization,
            "value_prop": agent.value_prop,
            "case_study": agent.case_study,
            "status": agent.status.value,
            "config": {
                "discovery_industries": agent.discovery_industries,
                "discovery_company_size": agent.discovery_company_size,
                "discovery_hiring_signals": agent.discovery_hiring_signals,
                "max_companies_per_run": agent.max_companies_per_run,
                "research_depth": agent.research_depth,
                "research_focus_areas": agent.research_focus_areas,
                "outreach_tone": agent.outreach_tone,
                "outreach_daily_limit": agent.outreach_daily_limit,
                "outreach_delay_seconds": agent.outreach_delay_seconds,
                "followup_sequence": agent.followup_sequence,
                "scheduler_meeting_type": agent.scheduler_meeting_type,
                "scheduler_duration_minutes": agent.scheduler_duration_minutes,
            },
            "recent_runs": [
                {
                    "id": r.id,
                    "mode": r.mode,
                    "status": r.status.value,
                    "items_processed": r.items_processed,
                    "items_succeeded": r.items_succeeded,
                    "items_failed": r.items_failed,
                    "duration_seconds": r.duration_seconds,
                    "created_at": r.created_at.isoformat(),
                    "completed_at": r.completed_at.isoformat() if r.completed_at else None,
                }
                for r in runs
            ],
        }


@app.post("/api/agents/{agent_id}/run")
async def run_agent(
    agent_id: str,
    request: AgentRunRequest,
    background_tasks: BackgroundTasks,
) -> Dict[str, Any]:
    """Run an agent."""
    async with get_db_session() as session:
        from sqlalchemy import select
        stmt = select(AgentConfig).where(AgentConfig.id == agent_id)
        result = await session.execute(stmt)
        agent_config = result.scalar_one_or_none()

        if not agent_config:
            raise HTTPException(status_code=404, detail="Agent not found")

    # Map agent type to class
    agent_type_map = {
        "discovery": CompanyDiscoveryAgent,
        "research": CompanyResearchAgent,
        "outreach": OutreachAgent,
        "followup": FollowupAgent,
        "scheduler": SchedulerAgent,
        "pipeline": PipelineAgent,
    }

    # Determine agent type from config or request
    agent_type = request.mode if request.mode != "full" else "discovery"
    agent_class = agent_type_map.get(agent_type, CompanyDiscoveryAgent)

    agent = agent_class(agent_config)
    context = AgentContext(
        agent_id=agent_config.id,
        agent_config=agent_config,
        run_id=f"{agent_config.id}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
        mode=request.mode,
        input_data=request.input_data,
    )

    result = await agent.execute(context)

    return {
        "success": result.success,
        "run_id": context.run_id,
        "mode": request.mode,
        "items_processed": result.items_processed,
        "items_succeeded": result.items_succeeded,
        "items_failed": result.items_failed,
        "duration_seconds": result.duration_seconds,
        "output_data": result.output_data,
        "error_message": result.error_message,
    }


@app.get("/api/agents/{agent_id}/runs")
async def get_agent_runs(agent_id: str, limit: int = 20) -> Dict[str, Any]:
    """Get agent run history."""
    async with get_db_session() as session:
        from sqlalchemy import select, desc
        stmt = select(AgentRun).where(AgentRun.agent_id == agent_id).order_by(desc(AgentRun.created_at)).limit(limit)
        result = await session.execute(stmt)
        runs = result.scalars().all()

        return {
            "runs": [
                {
                    "id": r.id,
                    "mode": r.mode,
                    "status": r.status.value,
                    "items_processed": r.items_processed,
                    "items_succeeded": r.items_succeeded,
                    "items_failed": r.items_failed,
                    "duration_seconds": r.duration_seconds,
                    "error_message": r.error_message,
                    "created_at": r.created_at.isoformat(),
                    "completed_at": r.completed_at.isoformat() if r.completed_at else None,
                }
                for r in runs
            ]
        }


@app.get("/api/agents/{agent_id}/runs/{run_id}")
async def get_agent_run_detail(agent_id: str, run_id: str) -> Dict[str, Any]:
    """Get full run detail including step log for live progress tracking."""
    async with get_db_session() as session:
        from sqlalchemy import select, desc
        stmt = select(AgentRun).where(
            AgentRun.id == run_id,
            AgentRun.agent_id == agent_id,
        )
        result = await session.execute(stmt)
        run = result.scalar_one_or_none()

        if not run:
            raise HTTPException(status_code=404, detail="Run not found")

        output = run.output_data or {}

        # Fetch email logs created during this run's timeframe
        emails = []
        if run.started_at:
            email_stmt = select(EmailLog).where(
                EmailLog.company_id.isnot(None),
                EmailLog.created_at >= run.started_at,
            )
            if run.completed_at:
                email_stmt = email_stmt.where(EmailLog.created_at <= run.completed_at)
            email_stmt = email_stmt.order_by(desc(EmailLog.created_at))
            email_result = await session.execute(email_stmt)
            email_logs = email_result.scalars().all()
            emails = [
                {
                    "id": e.id,
                    "to_email": e.to_email,
                    "to_name": e.to_name,
                    "subject": e.subject,
                    "status": e.status.value,
                    "sent_at": e.sent_at.isoformat() if e.sent_at else None,
                    "company_id": e.company_id,
                    "contact_id": e.contact_id,
                    "is_followup": e.is_followup,
                    "sequence_step": e.sequence_step,
                    "body_text": e.body_text[:200] + "..." if e.body_text and len(e.body_text) > 200 else e.body_text,
                }
                for e in email_logs
            ]

        # Fetch companies involved
        company_ids = set()
        for e in emails:
            if e.get("company_id"):
                company_ids.add(e["company_id"])
        # Also check input_data for company_ids
        input_data = run.input_data or {}
        if "company_ids" in input_data:
            for cid in input_data["company_ids"]:
                company_ids.add(cid)

        companies = []
        if company_ids:
            comp_stmt = select(Company).where(Company.id.in_(company_ids))
            comp_result = await session.execute(comp_stmt)
            companies = [
                {
                    "id": c.id,
                    "name": c.name,
                    "industry": c.industry,
                    "employee_count": c.employee_count,
                    "stage": c.stage.value,
                }
                for c in comp_result.scalars().all()
            ]

        return {
            "id": run.id,
            "agent_id": run.agent_id,
            "mode": run.mode,
            "status": run.status.value,
            "items_processed": run.items_processed,
            "items_succeeded": run.items_succeeded,
            "items_failed": run.items_failed,
            "duration_seconds": run.duration_seconds,
            "error_message": run.error_message,
            "created_at": run.created_at.isoformat(),
            "started_at": run.started_at.isoformat() if run.started_at else None,
            "completed_at": run.completed_at.isoformat() if run.completed_at else None,
            "steps_log": output.get("steps_log", []),
            "current_step": output.get("current_step"),
            "output_data": output,
            "companies": companies,
            "emails": emails,
        }


# ============================================================
# COMPANY ENDPOINTS
# ============================================================

@app.get("/api/companies")
async def list_companies(
    stage: str | None = None,
    agent_id: str | None = None,
    limit: int = 50,
    offset: int = 0,
) -> Dict[str, Any]:
    """List companies with filters."""
    async with get_db_session() as session:
        from sqlalchemy import select, desc, func

        stmt = select(Company)
        if stage:
            stmt = stmt.where(Company.stage == CompanyStage(stage))
        if agent_id:
            stmt = stmt.where(Company.agent_id == agent_id)

        # Count total
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = await session.execute(count_stmt)
        total = total.scalar()

        stmt = stmt.order_by(desc(Company.created_at)).offset(offset).limit(limit)
        result = await session.execute(stmt)
        companies = result.scalars().all()

        return {
            "companies": [
                {
                    "id": c.id,
                    "name": c.name,
                    "domain": c.domain,
                    "industry": c.industry,
                    "employee_count": c.employee_count,
                    "funding_stage": c.funding_stage,
                    "stage": c.stage.value,
                    "tech_stack": c.tech_stack,
                    "hiring_needs": c.hiring_needs,
                    "headquarters": c.headquarters,
                    "remote_friendly": c.remote_friendly,
                    "source": c.source,
                    "confidence_score": c.confidence_score,
                    "created_at": c.created_at.isoformat(),
                    "last_enriched_at": c.last_enriched_at.isoformat() if c.last_enriched_at else None,
                }
                for c in companies
            ],
            "total": total,
            "limit": limit,
            "offset": offset,
        }


@app.get("/api/companies/{company_id}")
async def get_company(company_id: str) -> Dict[str, Any]:
    """Get company details with contacts."""
    async with get_db_session() as session:
        from sqlalchemy import select
        stmt = select(Company).where(Company.id == company_id)
        result = await session.execute(stmt)
        company = result.scalar_one_or_none()

        if not company:
            raise HTTPException(status_code=404, detail="Company not found")

        # Get contacts
        stmt = select(Contact).where(Contact.company_id == company_id)
        result = await session.execute(stmt)
        contacts = result.scalars().all()

        # Get emails
        stmt = select(EmailLog).where(EmailLog.company_id == company_id).order_by(EmailLog.created_at.desc())
        result = await session.execute(stmt)
        emails = result.scalars().all()

        # Get deals
        stmt = select(PipelineDeal).where(PipelineDeal.company_id == company_id)
        result = await session.execute(stmt)
        deals = result.scalars().all()

        return {
            "id": company.id,
            "name": company.name,
            "domain": company.domain,
            "linkedin_url": company.linkedin_url,
            "description": company.description,
            "industry": company.industry,
            "employee_count": company.employee_count,
            "funding_stage": company.funding_stage,
            "total_funding_usd": company.total_funding_usd,
            "stage": company.stage.value,
            "pipeline_probability": company.pipeline_probability,
            "tech_stack": company.tech_stack,
            "hiring_needs": company.hiring_needs,
            "pain_points": company.pain_points,
            "growth_signals": company.growth_signals,
            "locations": company.locations,
            "headquarters": company.headquarters,
            "remote_friendly": company.remote_friendly,
            "investors": company.investors,
            "competitors": company.competitors,
            "recent_news": company.recent_news,
            "confidence_score": company.confidence_score,
            "source": company.source,
            "crm_company_id": company.crm_company_id,
            "contacts": [
                {
                    "id": c.id,
                    "first_name": c.first_name,
                    "last_name": c.last_name,
                    "email": c.email,
                    "title": c.title,
                    "seniority": c.seniority,
                    "is_decision_maker": c.is_decision_maker,
                    "linkedin_url": c.linkedin_url,
                    "engagement_score": c.engagement_score,
                }
                for c in contacts
            ],
            "emails": [
                {
                    "id": e.id,
                    "subject": e.subject,
                    "status": e.status.value,
                    "sent_at": e.sent_at.isoformat() if e.sent_at else None,
                    "opened_at": e.opened_at.isoformat() if e.opened_at else None,
                    "replied_at": e.replied_at.isoformat() if e.replied_at else None,
                    "sequence_step": e.sequence_step,
                    "is_followup": e.is_followup,
                }
                for e in emails
            ],
            "deals": [
                {
                    "id": d.id,
                    "name": d.name,
                    "stage": d.stage.value,
                    "probability": d.probability,
                    "value_usd": d.value_usd,
                    "expected_close_date": d.expected_close_date.isoformat() if d.expected_close_date else None,
                }
                for d in deals
            ],
            "created_at": company.created_at.isoformat(),
            "updated_at": company.updated_at.isoformat(),
            "last_enriched_at": company.last_enriched_at.isoformat() if company.last_enriched_at else None,
        }


# ============================================================
# CONTACT ENDPOINTS
# ============================================================

@app.get("/api/contacts")
async def list_contacts(
    company_id: str | None = None,
    is_decision_maker: bool | None = None,
    limit: int = 50,
    offset: int = 0,
) -> Dict[str, Any]:
    """List contacts."""
    async with get_db_session() as session:
        from sqlalchemy import select, desc, func

        stmt = select(Contact)
        if company_id:
            stmt = stmt.where(Contact.company_id == company_id)
        if is_decision_maker is not None:
            stmt = stmt.where(Contact.is_decision_maker == is_decision_maker)

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = await session.execute(count_stmt)
        total = total.scalar()

        stmt = stmt.order_by(desc(Contact.created_at)).offset(offset).limit(limit)
        result = await session.execute(stmt)
        contacts = result.scalars().all()

        return {
            "contacts": [
                {
                    "id": c.id,
                    "company_id": c.company_id,
                    "first_name": c.first_name,
                    "last_name": c.last_name,
                    "full_name": c.full_name,
                    "email": c.email,
                    "title": c.title,
                    "seniority": c.seniority,
                    "is_decision_maker": c.is_decision_maker,
                    "is_hiring_manager": c.is_hiring_manager,
                    "linkedin_url": c.linkedin_url,
                    "engagement_score": c.engagement_score,
                    "emails_sent": c.emails_sent,
                    "emails_opened": c.emails_opened,
                    "emails_replied": c.emails_replied,
                }
                for c in contacts
            ],
            "total": total,
            "limit": limit,
            "offset": offset,
        }


# ============================================================
# CAMPAIGN ENDPOINTS
# ============================================================

class CampaignCreateRequest(BaseModel):
    name: str
    agent_id: str
    sequence_name: str = "standard_3_touch"
    target_stage: str | None = None
    daily_limit: int = 50


@app.post("/api/campaigns")
async def create_campaign(request: CampaignCreateRequest) -> Dict[str, Any]:
    """Create a new outreach campaign."""
    async with get_db_session() as session:
        from sqlalchemy import select
        stmt = select(AgentConfig).where(AgentConfig.id == request.agent_id)
        result = await session.execute(stmt)
        agent = result.scalar_one_or_none()

        if not agent:
            raise HTTPException(status_code=404, detail="Agent not found")

        campaign = OutreachCampaign(
            agent_id=agent.id,
            name=request.name,
            sequence_name=request.sequence_name,
            target_stage=CompanyStage(request.target_stage) if request.target_stage else None,
            daily_limit=request.daily_limit,
            status=CampaignStatus.DRAFT,
        )

        session.add(campaign)
        await session.commit()
        await session.refresh(campaign)

        return {
            "id": campaign.id,
            "name": campaign.name,
            "status": campaign.status.value,
            "created_at": campaign.created_at.isoformat(),
        }


@app.get("/api/campaigns")
async def list_campaigns(agent_id: str | None = None) -> Dict[str, Any]:
    """List campaigns."""
    async with get_db_session() as session:
        from sqlalchemy import select, desc
        stmt = select(OutreachCampaign).order_by(desc(OutreachCampaign.created_at))
        if agent_id:
            stmt = stmt.where(OutreachCampaign.agent_id == agent_id)
        result = await session.execute(stmt)
        campaigns = result.scalars().all()

        return {
            "campaigns": [
                {
                    "id": c.id,
                    "agent_id": c.agent_id,
                    "name": c.name,
                    "sequence_name": c.sequence_name,
                    "status": c.status.value,
                    "emails_sent": c.emails_sent,
                    "emails_opened": c.emails_opened,
                    "emails_replied": c.emails_replied,
                    "emails_bounced": c.emails_bounced,
                    "open_rate": c.emails_opened / c.emails_sent if c.emails_sent > 0 else 0,
                    "reply_rate": c.emails_replied / c.emails_sent if c.emails_sent > 0 else 0,
                    "created_at": c.created_at.isoformat(),
                    "started_at": c.started_at.isoformat() if c.started_at else None,
                }
                for c in campaigns
            ]
        }


@app.post("/api/campaigns/{campaign_id}/launch")
async def launch_campaign(campaign_id: str, dry_run: bool = False) -> Dict[str, Any]:
    """Launch a campaign."""
    async with get_db_session() as session:
        from sqlalchemy import select
        stmt = select(OutreachCampaign).where(OutreachCampaign.id == campaign_id)
        result = await session.execute(stmt)
        campaign = result.scalar_one_or_none()

        if not campaign:
            raise HTTPException(status_code=404, detail="Campaign not found")

        agent = OutreachAgent(campaign.agent_config)
        context = AgentContext(
            agent_id=campaign.agent_id,
            agent_config=campaign.agent_config,
            run_id=f"campaign_{campaign_id}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
            mode="outreach",
            input_data={"campaign_id": campaign.id, "dry_run": dry_run},
        )

        result = await agent.execute(context)

        return {
            "success": result.success,
            "emails_sent": result.items_succeeded,
            "emails_failed": result.items_failed,
            "output": result.output_data,
        }


# ============================================================
# PIPELINE ENDPOINTS
# ============================================================

@app.get("/api/pipeline")
async def get_pipeline(agent_id: str | None = None) -> Dict[str, Any]:
    """Get pipeline overview."""
    async with get_db_session() as session:
        from sqlalchemy import select, func

        # Get deals by stage
        stmt = select(
            PipelineDeal.stage,
            func.count(PipelineDeal.id),
            func.sum(PipelineDeal.value_usd),
        )
        if agent_id:
            stmt = stmt.where(PipelineDeal.source_agent_id == agent_id)
        stmt = stmt.group_by(PipelineDeal.stage)
        result = await session.execute(stmt)

        by_stage = {}
        for row in result.fetchall():
            stage = row[0].value
            count = row[1]
            value = row[2] or 0
            by_stage[stage] = {"count": count, "value": value}

        # Total pipeline
        stmt = select(
            func.count(PipelineDeal.id),
            func.sum(PipelineDeal.value_usd),
        )
        if agent_id:
            stmt = stmt.where(PipelineDeal.source_agent_id == agent_id)
        result = await session.execute(stmt)
        total_count, total_value = result.one()

        return {
            "by_stage": by_stage,
            "total_deals": total_count or 0,
            "total_value": total_value or 0,
        }


@app.get("/api/pipeline/deals")
async def list_deals(
    stage: str | None = None,
    agent_id: str | None = None,
    limit: int = 50,
    offset: int = 0,
) -> Dict[str, Any]:
    """List pipeline deals."""
    async with get_db_session() as session:
        from sqlalchemy import select, desc, func

        stmt = select(PipelineDeal)
        if stage:
            stmt = stmt.where(PipelineDeal.stage == CompanyStage(stage))
        if agent_id:
            stmt = stmt.where(PipelineDeal.source_agent_id == agent_id)

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = await session.execute(count_stmt)
        total = total.scalar()

        stmt = stmt.order_by(desc(PipelineDeal.created_at)).offset(offset).limit(limit)
        result = await session.execute(stmt)
        deals = result.scalars().all()

        return {
            "deals": [
                {
                    "id": d.id,
                    "company_id": d.company_id,
                    "contact_id": d.contact_id,
                    "name": d.name,
                    "stage": d.stage.value,
                    "probability": d.probability,
                    "value_usd": d.value_usd,
                    "expected_close_date": d.expected_close_date.isoformat() if d.expected_close_date else None,
                    "source": d.source,
                    "created_at": d.created_at.isoformat(),
                    "stage_changed_at": d.stage_changed_at.isoformat(),
                }
                for d in deals
            ],
            "total": total,
            "limit": limit,
            "offset": offset,
        }


# ============================================================
# ANALYTICS ENDPOINTS
# ============================================================

@app.get("/api/analytics/overview")
async def get_analytics_overview(days: int = 30) -> Dict[str, Any]:
    """Get analytics overview."""
    from datetime import datetime, timedelta

    start_date = datetime.utcnow() - timedelta(days=days)

    async with get_db_session() as session:
        from sqlalchemy import select, func

        # Email stats
        from sqlalchemy import case
        stmt = select(
            func.count(EmailLog.id),
            func.sum(case((EmailLog.status == EmailStatus.SENT, 1), else_=0)),
            func.sum(case((EmailLog.status == EmailStatus.OPENED, 1), else_=0)),
            func.sum(case((EmailLog.status == EmailStatus.CLICKED, 1), else_=0)),
            func.sum(case((EmailLog.status == EmailStatus.REPLIED, 1), else_=0)),
            func.sum(case((EmailLog.status == EmailStatus.BOUNCED, 1), else_=0)),
        ).where(EmailLog.created_at >= start_date)
        result = await session.execute(stmt)
        total, sent, opened, clicked, replied, bounced = result.one()

        # Pipeline stats
        stmt = select(
            func.count(PipelineDeal.id),
            func.sum(PipelineDeal.value_usd),
        ).where(PipelineDeal.created_at >= start_date)
        result = await session.execute(stmt)
        deals_created, pipeline_value = result.one()

        # Calls booked
        stmt = select(func.count(CallBooking.id)).where(CallBooking.created_at >= start_date)
        result = await session.execute(stmt)
        calls_booked = result.scalar() or 0

        return {
            "period_days": days,
            "email": {
                "total": total or 0,
                "sent": sent or 0,
                "opened": opened or 0,
                "clicked": clicked or 0,
                "replied": replied or 0,
                "bounced": bounced or 0,
                "open_rate": (opened or 0) / (sent or 1),
                "click_rate": (clicked or 0) / (sent or 1),
                "reply_rate": (replied or 0) / (sent or 1),
                "bounce_rate": (bounced or 0) / (sent or 1),
            },
            "pipeline": {
                "deals_created": deals_created or 0,
                "pipeline_value": pipeline_value or 0,
            },
            "calls": {
                "booked": calls_booked,
            },
        }


# ============================================================
# WEBHOOK ENDPOINTS
# ============================================================

@app.post("/api/webhooks/sendgrid")
async def sendgrid_webhook(request: Request, background_tasks: BackgroundTasks):
    """Handle SendGrid webhook events.

    SendGrid sends an array of event objects. Each event contains:
    - email: recipient email
    - event: event type (delivered, bounce, open, click, unsubscribe, etc.)
    - timestamp: Unix timestamp
    - sg_message_id: SendGrid message ID
    - tracking_id: custom tracking ID from custom_args
    """
    try:
        payload = await request.json()
    except Exception:
        return {"status": "error", "message": "Invalid JSON"}

    if not isinstance(payload, list):
        payload = [payload]

    from backend.services.email import EmailService
    email_service = EmailService()
    processed_events = await email_service.handle_webhook(payload)

    # Process events in background to avoid webhook timeout
    background_tasks.add_task(_process_sendgrid_events, processed_events)

    return {"status": "ok", "events_received": len(processed_events)}


async def _process_sendgrid_events(events: list[dict]):
    """Process SendGrid webhook events and update database."""
    from sqlalchemy import select

    event_status_map = {
        "delivered": EmailStatus.DELIVERED,
        "open": EmailStatus.OPENED,
        "click": EmailStatus.CLICKED,
        "bounce": EmailStatus.BOUNCED,
        "dropped": EmailStatus.FAILED,
        "spamreport": EmailStatus.SPAM,
        "unsubscribe": EmailStatus.UNSUBSCRIBED,
        "group_unsubscribe": EmailStatus.UNSUBSCRIBED,
        "group_resubscribe": EmailStatus.REPLIED,  # Re-engaged
        "deferred": EmailStatus.SENT,  # Still trying
        "processed": EmailStatus.SENT,
        "sent": EmailStatus.SENT,
    }

    try:
        async with get_db_session() as session:
            for event in events:
                event_type = event.get("event_type", "")
                email = event.get("email", "")
                tracking_id = event.get("tracking_id")
                sg_message_id = event.get("sg_message_id")
                timestamp = event.get("timestamp")

                # Find the email log by tracking_id or sendgrid message ID
                stmt = select(EmailLog).where(
                    (EmailLog.sendgrid_message_id == sg_message_id)
                    | (EmailLog.template_name == tracking_id)
                )
                result = await session.execute(stmt)
                email_log = result.scalar_one_or_none()

                if not email_log:
                    # Try to find by to_email as fallback
                    stmt = select(EmailLog).where(
                        EmailLog.to_email == email,
                        EmailLog.status == EmailStatus.SENT,
                    ).order_by(EmailLog.created_at.desc()).limit(1)
                    result = await session.execute(stmt)
                    email_log = result.scalar_one_or_none()

                if email_log:
                    new_status = event_status_map.get(event_type)
                    if new_status:
                        email_log.status = new_status

                        # Update timestamp fields
                        if event_type == "delivered" and not email_log.delivered_at:
                            email_log.delivered_at = datetime.utcnow()
                        elif event_type == "open" and not email_log.opened_at:
                            email_log.opened_at = datetime.utcnow()
                        elif event_type == "click" and not email_log.clicked_at:
                            email_log.clicked_at = datetime.utcnow()
                        elif event_type == "bounce":
                            email_log.bounced_at = datetime.utcnow()
                            email_log.error_message = event.get("reason", "Bounced")
                            email_log.error_code = event.get("status")
                        elif event_type == "spamreport":
                            email_log.error_message = "Marked as spam"
                        elif event_type in ("unsubscribe", "group_unsubscribe"):
                            email_log.unsubscribed_at = datetime.utcnow()

                        # Store raw event data
                        email_log.extra_data = {
                            **(email_log.extra_data or {}),
                            f"webhook_{event_type}": event.get("raw_event", event),
                        }

                # Handle bounces and unsubscribes - add to suppression list
                if event_type in ("bounce", "spamreport", "unsubscribe", "group_unsubscribe"):
                    # Check if unsubscribe record already exists
                    stmt = select(UnsubscribeRecord).where(
                        UnsubscribeRecord.email == email
                    )
                    result = await session.execute(stmt)
                    existing = result.scalar_one_or_none()

                    if not existing:
                        unsub_record = UnsubscribeRecord(
                            email=email,
                            reason=f"Webhook event: {event_type}",
                            source="webhook",
                            ip_address=event.get("ip"),
                            user_agent=event.get("useragent"),
                        )
                        session.add(unsub_record)

            await session.commit()
    except Exception as e:
        print(f"Error processing SendGrid webhook events: {e}")


@app.post("/api/webhooks/calcom")
async def calcom_webhook(request: Request, background_tasks: BackgroundTasks):
    """Handle Cal.com webhook events.

    Cal.com sends events for booking lifecycle:
    - BOOKING_CREATED: New booking confirmed
    - BOOKING_CANCELLED: Booking cancelled
    - BOOKING_RESCHEDULED: Booking rescheduled
    - BOOKING_PAYMENT_INITIATED: Payment started
    - etc.
    """
    try:
        payload = await request.json()
    except Exception:
        return {"status": "error", "message": "Invalid JSON"}

    from backend.services.calendar import CalendarClient
    calendar_client = CalendarClient()
    processed_event = await calendar_client.handle_webhook(payload)

    # Process event in background to avoid webhook timeout
    background_tasks.add_task(_process_calcom_event, processed_event, payload)

    return {"status": "ok", "event_type": processed_event.get("event_type")}


async def _process_calcom_event(event: dict, raw_payload: dict):
    """Process Cal.com webhook event and update database."""
    from sqlalchemy import select

    trigger_event = event.get("event_type", "")
    booking_id = event.get("booking_id")
    attendee_email = event.get("attendee_email")

    try:
        async with get_db_session() as session:
            if trigger_event == "BOOKING_CREATED":
                # Find existing call booking by attendee email and future date
                stmt = select(CallBooking).where(
                    CallBooking.attendee_emails.op("@>")(f'["{attendee_email}"]'),
                    CallBooking.status == "scheduled",
                ).order_by(CallBooking.scheduled_at.asc()).limit(1)
                result = await session.execute(stmt)
                call_booking = result.scalar_one_or_none()

                if call_booking:
                    call_booking.status = "confirmed"
                    call_booking.calendar_event_id = booking_id
                    call_booking.booking_url = raw_payload.get("payload", {}).get("meetingUrl", "")
                    call_booking.extra_data = {
                        **(call_booking.extra_data or {}),
                        "calcom_event": event,
                    }

            elif trigger_event == "BOOKING_CANCELLED":
                # Find and cancel the booking
                stmt = select(CallBooking).where(
                    CallBooking.calendar_event_id == booking_id,
                ).limit(1)
                result = await session.execute(stmt)
                call_booking = result.scalar_one_or_none()

                if not call_booking and attendee_email:
                    # Fallback: find by email
                    stmt = select(CallBooking).where(
                        CallBooking.attendee_emails.op("@>")(f'["{attendee_email}"]'),
                        CallBooking.status.in_(["scheduled", "confirmed"]),
                    ).order_by(CallBooking.scheduled_at.asc()).limit(1)
                    result = await session.execute(stmt)
                    call_booking = result.scalar_one_or_none()

                if call_booking:
                    call_booking.status = "cancelled"
                    call_booking.cancellation_reason = event.get("cancellation_reason", "Cancelled via Cal.com")
                    call_booking.extra_data = {
                        **(call_booking.extra_data or {}),
                        "calcom_event": event,
                    }

            elif trigger_event == "BOOKING_RESCHEDULED":
                # Update the booking with new time
                stmt = select(CallBooking).where(
                    CallBooking.calendar_event_id == booking_id,
                ).limit(1)
                result = await session.execute(stmt)
                call_booking = result.scalar_one_or_none()

                if not call_booking and attendee_email:
                    stmt = select(CallBooking).where(
                        CallBooking.attendee_emails.op("@>")(f'["{attendee_email}"]'),
                        CallBooking.status.in_(["scheduled", "confirmed"]),
                    ).order_by(CallBooking.scheduled_at.asc()).limit(1)
                    result = await session.execute(stmt)
                    call_booking = result.scalar_one_or_none()

                if call_booking:
                    new_start = event.get("start_time")
                    new_end = event.get("end_time")
                    if new_start:
                        from datetime import datetime as dt
                        call_booking.scheduled_at = dt.fromisoformat(new_start.replace("Z", "+00:00"))
                    call_booking.extra_data = {
                        **(call_booking.extra_data or {}),
                        "calcom_event": event,
                        "rescheduled_from": call_booking.extra_data.get("calcom_event") if call_booking.extra_data else None,
                    }

            await session.commit()
    except Exception as e:
        print(f"Error processing Cal.com webhook event: {e}")


# Mount static files for dashboard (in production)
dashboard_dist = Path(__file__).parent.parent / "dashboard" / "dist"
if dashboard_dist.exists():
    app.mount("/", StaticFiles(directory=dashboard_dist, html=True), name="dashboard")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)