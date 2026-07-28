"""SQLAlchemy models for the recruitment agency platform."""

from datetime import datetime
from enum import Enum as PyEnum
from typing import Optional
from uuid import uuid4

from sqlalchemy import (
    DateTime,
    Enum,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    Boolean,
    JSON,
    Float,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    """Base class for all models."""
    pass


class AgentStatus(PyEnum):
    """Status of an agent."""
    ACTIVE = "active"
    INACTIVE = "inactive"
    RUNNING = "running"
    ERROR = "error"
    PAUSED = "paused"


class CompanyStage(PyEnum):
    """Stage of a company in the pipeline."""
    DISCOVERED = "discovered"
    RESEARCHED = "researched"
    CONTACTED = "contacted"
    REPLIED = "replied"
    CALL_BOOKED = "call_booked"
    QUALIFIED = "qualified"
    PROPOSAL_SENT = "proposal_sent"
    CLOSED_WON = "closed_won"
    CLOSED_LOST = "closed_lost"


class EmailStatus(PyEnum):
    """Status of an email."""
    PENDING = "pending"
    SENT = "sent"
    DELIVERED = "delivered"
    OPENED = "opened"
    CLICKED = "clicked"
    REPLIED = "replied"
    BOUNCED = "bounced"
    SPAM = "spam"
    UNSUBSCRIBED = "unsubscribed"
    FAILED = "failed"


class AgentRunStatus(PyEnum):
    """Status of an agent run."""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    PARTIAL = "partial"


class CampaignStatus(PyEnum):
    """Status of an outreach campaign."""
    DRAFT = "draft"
    SCHEDULED = "scheduled"
    RUNNING = "running"
    PAUSED = "paused"
    COMPLETED = "completed"
    FAILED = "failed"


class JobOpeningStatus(PyEnum):
    """Status of a job opening."""
    OPEN = "open"
    INTERVIEWING = "interviewing"
    FILLED = "filled"
    CANCELLED = "cancelled"
    ON_HOLD = "on_hold"


class CandidateStatus(PyEnum):
    """Status of a candidate in the recruiting pipeline."""
    NEW = "new"
    SCREENING = "screening"
    SHORTLISTED = "shortlisted"
    INTERVIEW_SCHEDULED = "interview_scheduled"
    INTERVIEWED = "interviewed"
    OFFERED = "offered"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"
    PLACED = "placed"


class ProposalStatus(PyEnum):
    """Status of a service proposal."""
    DRAFT = "draft"
    SENT = "sent"
    VIEWED = "viewed"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    EXPIRED = "expired"


class OnboardingStatus(PyEnum):
    """Status of company onboarding."""
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETE = "complete"


class ScreeningRecommendation(PyEnum):
    """Screening recommendation outcome."""
    STRONG_MATCH = "strong_match"
    POTENTIAL_MATCH = "potential_match"
    NOT_RECOMMENDED = "not_recommended"


class InterviewStatus(PyEnum):
    """Status of a scheduled interview."""
    SCHEDULED = "scheduled"
    CONFIRMED = "confirmed"
    COMPLETED = "completed"
    NO_SHOW = "no_show"
    CANCELLED = "cancelled"


class AgentConfig(Base):
    """Configuration for an agent."""
    __tablename__ = "agent_configs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    name: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    persona: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    specialization: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    value_prop: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    case_study: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Discovery config
    discovery_industries: Mapped[list[str]] = mapped_column(JSON, default=list)
    discovery_company_size: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    discovery_hiring_signals: Mapped[list[str]] = mapped_column(JSON, default=list)
    discovery_locations: Mapped[list[str]] = mapped_column(JSON, default=list)
    discovery_funding_stages: Mapped[list[str]] = mapped_column(JSON, default=list)
    max_companies_per_run: Mapped[int] = mapped_column(Integer, default=50)

    # Research config
    research_depth: Mapped[str] = mapped_column(String(20), default="standard")
    research_focus_areas: Mapped[list[str]] = mapped_column(JSON, default=list)
    research_sources: Mapped[list[str]] = mapped_column(JSON, default=list)

    # Outreach config
    outreach_tone: Mapped[str] = mapped_column(String(50), default="professional_peer")
    outreach_templates_dir: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    outreach_daily_limit: Mapped[int] = mapped_column(Integer, default=50)
    outreach_delay_seconds: Mapped[int] = mapped_column(Integer, default=30)

    # Followup config
    followup_sequence: Mapped[str] = mapped_column(String(50), default="standard_3_touch")

    # Scheduler config
    scheduler_meeting_type: Mapped[str] = mapped_column(String(50), default="discovery_call")
    scheduler_duration_minutes: Mapped[int] = mapped_column(Integer, default=30)
    scheduler_calendar_provider: Mapped[str] = mapped_column(String(50), default="calcom")

    # Status
    status: Mapped[AgentStatus] = mapped_column(Enum(AgentStatus), default=AgentStatus.INACTIVE, index=True)
    schedule_cron: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_run_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    next_run_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # Relationships
    runs: Mapped[list["AgentRun"]] = relationship("AgentRun", back_populates="agent", cascade="all, delete-orphan")
    companies: Mapped[list["Company"]] = relationship("Company", back_populates="agent")
    campaigns: Mapped[list["OutreachCampaign"]] = relationship("OutreachCampaign", back_populates="agent")
    job_openings: Mapped[list["JobOpening"]] = relationship("JobOpening", back_populates="agent", cascade="all, delete-orphan")
    candidates: Mapped[list["Candidate"]] = relationship("Candidate", back_populates="agent", cascade="all, delete-orphan")
    proposals: Mapped[list["Proposal"]] = relationship("Proposal", back_populates="agent", cascade="all, delete-orphan")
    onboarding_records: Mapped[list["OnboardingRecord"]] = relationship("OnboardingRecord", back_populates="agent", cascade="all, delete-orphan")
    screenings: Mapped[list["ScreeningSession"]] = relationship("ScreeningSession", back_populates="agent", cascade="all, delete-orphan")


class AgentRun(Base):
    """Execution log for an agent run."""
    __tablename__ = "agent_runs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    agent_id: Mapped[str] = mapped_column(String(36), ForeignKey("agent_configs.id"), index=True)
    mode: Mapped[str] = mapped_column(String(50))  # discovery, research, outreach, followup, scheduler, pipeline, full
    status: Mapped[AgentRunStatus] = mapped_column(Enum(AgentRunStatus), default=AgentRunStatus.PENDING, index=True)

    # Input/Output
    input_data: Mapped[dict] = mapped_column(JSON, default=dict)
    output_data: Mapped[dict] = mapped_column(JSON, default=dict)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Metrics
    items_processed: Mapped[int] = mapped_column(Integer, default=0)
    items_succeeded: Mapped[int] = mapped_column(Integer, default=0)
    items_failed: Mapped[int] = mapped_column(Integer, default=0)
    duration_seconds: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    # Timestamps
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    agent: Mapped["AgentConfig"] = relationship("AgentConfig", back_populates="runs")
    companies: Mapped[list["Company"]] = relationship("Company", back_populates="discovered_by_run")


class Company(Base):
    """Discovered company."""
    __tablename__ = "companies"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    agent_id: Mapped[str] = mapped_column(String(36), ForeignKey("agent_configs.id"), index=True)
    discovered_by_run_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("agent_runs.id"), nullable=True)

    # Basic info
    name: Mapped[str] = mapped_column(String(255), index=True)
    domain: Mapped[Optional[str]] = mapped_column(String(255), nullable=True, index=True)
    linkedin_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    crunchbase_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    # Details
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    industry: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)
    sub_industry: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    employee_count: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    employee_count_range: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    # Location
    headquarters: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    locations: Mapped[list[str]] = mapped_column(JSON, default=list)
    remote_friendly: Mapped[bool] = mapped_column(Boolean, default=False)

    # Funding
    funding_stage: Mapped[Optional[str]] = mapped_column(String(50), nullable=True, index=True)
    total_funding_usd: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    last_funding_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    last_funding_amount_usd: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    investors: Mapped[list[str]] = mapped_column(JSON, default=list)

    # Tech & Hiring
    tech_stack: Mapped[list[str]] = mapped_column(JSON, default=list)
    hiring_needs: Mapped[list[str]] = mapped_column(JSON, default=list)
    open_positions_count: Mapped[int] = mapped_column(Integer, default=0)
    hiring_signals: Mapped[list[str]] = mapped_column(JSON, default=list)

    # Research data
    pain_points: Mapped[list[str]] = mapped_column(JSON, default=list)
    growth_signals: Mapped[list[str]] = mapped_column(JSON, default=list)
    competitors: Mapped[list[str]] = mapped_column(JSON, default=list)
    recent_news: Mapped[list[dict]] = mapped_column(JSON, default=list)
    glassdoor_rating: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    github_org: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Pipeline
    stage: Mapped[CompanyStage] = mapped_column(Enum(CompanyStage), default=CompanyStage.DISCOVERED, index=True)
    stage_updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    pipeline_probability: Mapped[int] = mapped_column(Integer, default=5)
    estimated_value_usd: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    # CRM Sync
    crm_company_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)
    crm_synced_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # Metadata
    source: Mapped[str] = mapped_column(String(50), default="apify_linkedin")
    confidence_score: Mapped[float] = mapped_column(Float, default=0.0)
    tags: Mapped[list[str]] = mapped_column(JSON, default=list)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_enriched_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # Relationships
    agent: Mapped["AgentConfig"] = relationship("AgentConfig", back_populates="companies")
    discovered_by_run: Mapped[Optional["AgentRun"]] = relationship("AgentRun", back_populates="companies")
    contacts: Mapped[list["Contact"]] = relationship("Contact", back_populates="company", cascade="all, delete-orphan")
    deals: Mapped[list["PipelineDeal"]] = relationship("PipelineDeal", back_populates="company", cascade="all, delete-orphan")
    emails: Mapped[list["EmailLog"]] = relationship("EmailLog", back_populates="company")
    job_openings: Mapped[list["JobOpening"]] = relationship("JobOpening", back_populates="company", cascade="all, delete-orphan")
    candidates: Mapped[list["Candidate"]] = relationship("Candidate", back_populates="company", cascade="all, delete-orphan")
    proposals: Mapped[list["Proposal"]] = relationship("Proposal", back_populates="company", cascade="all, delete-orphan")
    onboarding: Mapped[Optional["OnboardingRecord"]] = relationship("OnboardingRecord", back_populates="company", uselist=False, cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_companies_name_domain", "name", "domain"),
        Index("ix_companies_stage_updated", "stage", "stage_updated_at"),
    )


class Contact(Base):
    """Decision maker at a company."""
    __tablename__ = "contacts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    company_id: Mapped[str] = mapped_column(String(36), ForeignKey("companies.id"), index=True)

    # Basic info
    first_name: Mapped[str] = mapped_column(String(100))
    last_name: Mapped[str] = mapped_column(String(100))
    full_name: Mapped[str] = mapped_column(String(255), index=True)
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True, index=True)
    email_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    linkedin_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    # Role
    title: Mapped[str] = mapped_column(String(255))
    seniority: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)  # vp, director, manager, cxo
    department: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    is_decision_maker: Mapped[bool] = mapped_column(Boolean, default=False)
    is_hiring_manager: Mapped[bool] = mapped_column(Boolean, default=False)

    # Profile
    bio: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    skills: Mapped[list[str]] = mapped_column(JSON, default=list)
    experience_years: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    previous_companies: Mapped[list[str]] = mapped_column(JSON, default=list)
    education: Mapped[list[dict]] = mapped_column(JSON, default=list)

    # Engagement
    engagement_score: Mapped[float] = mapped_column(Float, default=0.0)
    last_engagement_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    emails_sent: Mapped[int] = mapped_column(Integer, default=0)
    emails_opened: Mapped[int] = mapped_column(Integer, default=0)
    emails_clicked: Mapped[int] = mapped_column(Integer, default=0)
    emails_replied: Mapped[int] = mapped_column(Integer, default=0)

    # Source
    source: Mapped[str] = mapped_column(String(50), default="research")
    confidence_score: Mapped[float] = mapped_column(Float, default=0.0)

    # CRM Sync
    crm_contact_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)
    crm_synced_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    company: Mapped["Company"] = relationship("Company", back_populates="contacts")
    emails: Mapped[list["EmailLog"]] = relationship("EmailLog", back_populates="contact")

    __table_args__ = (
        Index("ix_contacts_company_email", "company_id", "email"),
        Index("ix_contacts_decision_maker", "is_decision_maker", "is_hiring_manager"),
    )


class OutreachCampaign(Base):
    """Email outreach campaign."""
    __tablename__ = "outreach_campaigns"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    agent_id: Mapped[str] = mapped_column(String(36), ForeignKey("agent_configs.id"), index=True)

    name: Mapped[str] = mapped_column(String(255))
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Sequence config
    sequence_name: Mapped[str] = mapped_column(String(100))
    sequence_config: Mapped[dict] = mapped_column(JSON, default=dict)

    # Targeting
    target_stage: Mapped[Optional[CompanyStage]] = mapped_column(Enum(CompanyStage), nullable=True)
    target_companies: Mapped[list[str]] = mapped_column(JSON, default=list)  # company IDs
    target_contacts: Mapped[list[str]] = mapped_column(JSON, default=list)  # contact IDs
    filters: Mapped[dict] = mapped_column(JSON, default=dict)

    # Limits
    daily_limit: Mapped[int] = mapped_column(Integer, default=50)
    total_limit: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    # Status
    status: Mapped[CampaignStatus] = mapped_column(Enum(CampaignStatus), default=CampaignStatus.DRAFT, index=True)

    # Scheduling
    scheduled_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # Metrics
    total_recipients: Mapped[int] = mapped_column(Integer, default=0)
    emails_sent: Mapped[int] = mapped_column(Integer, default=0)
    emails_delivered: Mapped[int] = mapped_column(Integer, default=0)
    emails_opened: Mapped[int] = mapped_column(Integer, default=0)
    emails_clicked: Mapped[int] = mapped_column(Integer, default=0)
    emails_replied: Mapped[int] = mapped_column(Integer, default=0)
    emails_bounced: Mapped[int] = mapped_column(Integer, default=0)
    emails_unsubscribed: Mapped[int] = mapped_column(Integer, default=0)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    agent: Mapped["AgentConfig"] = relationship("AgentConfig", back_populates="campaigns")
    emails: Mapped[list["EmailLog"]] = relationship("EmailLog", back_populates="campaign")


class EmailLog(Base):
    """Log of sent emails."""
    __tablename__ = "email_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    campaign_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("outreach_campaigns.id"), nullable=True, index=True)
    company_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("companies.id"), nullable=True, index=True)
    contact_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("contacts.id"), nullable=True, index=True)

    # Email details
    to_email: Mapped[str] = mapped_column(String(255), index=True)
    to_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    from_email: Mapped[str] = mapped_column(String(255))
    from_name: Mapped[str] = mapped_column(String(255))
    subject: Mapped[str] = mapped_column(String(500))
    body_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    body_html: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Template
    template_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    template_variables: Mapped[dict] = mapped_column(JSON, default=dict)

    # Sequence
    sequence_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    sequence_step: Mapped[int] = mapped_column(Integer, default=1)
    is_followup: Mapped[bool] = mapped_column(Boolean, default=False)
    parent_email_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("email_logs.id"), nullable=True)

    # Status
    status: Mapped[EmailStatus] = mapped_column(Enum(EmailStatus), default=EmailStatus.PENDING, index=True)
    sendgrid_message_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True, index=True)

    # Tracking
    sent_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    delivered_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    opened_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    clicked_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    replied_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    bounced_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    unsubscribed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # Error
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    error_code: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    # Metadata
    ip_address: Mapped[Optional[str]] = mapped_column(String(45), nullable=True)
    user_agent: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    extra_data: Mapped[dict] = mapped_column(JSON, default=dict)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    campaign: Mapped[Optional["OutreachCampaign"]] = relationship("OutreachCampaign", back_populates="emails")
    company: Mapped[Optional["Company"]] = relationship("Company", back_populates="emails")
    contact: Mapped[Optional["Contact"]] = relationship("Contact", back_populates="emails")
    parent_email: Mapped[Optional["EmailLog"]] = relationship(
        "EmailLog", remote_side="EmailLog.id", back_populates="replies"
    )
    replies: Mapped[list["EmailLog"]] = relationship("EmailLog", back_populates="parent_email")


class PipelineDeal(Base):
    """Pipeline deal/opportunity."""
    __tablename__ = "pipeline_deals"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    company_id: Mapped[str] = mapped_column(String(36), ForeignKey("companies.id"), index=True)
    contact_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("contacts.id"), nullable=True, index=True)

    # Deal info
    name: Mapped[str] = mapped_column(String(255))
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    stage: Mapped[CompanyStage] = mapped_column(Enum(CompanyStage), default=CompanyStage.DISCOVERED, index=True)
    probability: Mapped[int] = mapped_column(Integer, default=5)
    value_usd: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    expected_close_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # Source
    source: Mapped[str] = mapped_column(String(50), default="agent")
    source_agent_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("agent_configs.id"), nullable=True)
    source_campaign_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("outreach_campaigns.id"), nullable=True)

    # CRM Sync
    crm_deal_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)
    crm_synced_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    stage_changed_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    closed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # Relationships
    company: Mapped["Company"] = relationship("Company", back_populates="deals")
    contact: Mapped[Optional["Contact"]] = relationship("Contact")
    activities: Mapped[list["DealActivity"]] = relationship("DealActivity", back_populates="deal", cascade="all, delete-orphan")


class DealActivity(Base):
    """Activity on a deal."""
    __tablename__ = "deal_activities"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    deal_id: Mapped[str] = mapped_column(String(36), ForeignKey("pipeline_deals.id"), index=True)

    type: Mapped[str] = mapped_column(String(50))  # email, call, meeting, note, stage_change
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Metadata
    extra_data: Mapped[dict] = mapped_column(JSON, default=dict)
    performed_by: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)  # agent name or user

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    deal: Mapped["PipelineDeal"] = relationship("PipelineDeal", back_populates="activities")


class CallBooking(Base):
    """Scheduled call booking."""
    __tablename__ = "call_bookings"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    company_id: Mapped[str] = mapped_column(String(36), ForeignKey("companies.id"), index=True)
    contact_id: Mapped[str] = mapped_column(String(36), ForeignKey("contacts.id"), index=True)
    deal_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("pipeline_deals.id"), nullable=True, index=True)

    # Meeting details
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    meeting_type: Mapped[str] = mapped_column(String(50), default="discovery_call")
    duration_minutes: Mapped[int] = mapped_column(Integer, default=30)

    # Scheduling
    scheduled_at: Mapped[datetime] = mapped_column(DateTime, index=True)
    timezone: Mapped[str] = mapped_column(String(50), default="UTC")
    calendar_event_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    calendar_provider: Mapped[str] = mapped_column(String(50), default="calcom")
    booking_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    # Attendees
    attendee_emails: Mapped[list[str]] = mapped_column(JSON, default=list)
    attendee_names: Mapped[list[str]] = mapped_column(JSON, default=list)

    # Status
    status: Mapped[str] = mapped_column(String(50), default="scheduled")  # scheduled, confirmed, cancelled, completed, no_show
    cancellation_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Reminders
    reminders_sent: Mapped[list[str]] = mapped_column(JSON, default=list)  # ["24h", "1h", "15m"]

    # Outcome
    outcome: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    next_steps: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    recording_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # Relationships
    company: Mapped["Company"] = relationship("Company")
    contact: Mapped["Contact"] = relationship("Contact")
    deal: Mapped[Optional["PipelineDeal"]] = relationship("PipelineDeal")


class UnsubscribeRecord(Base):
    """Email unsubscribe records for compliance."""
    __tablename__ = "unsubscribe_records"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    email: Mapped[str] = mapped_column(String(255), index=True, unique=True)
    reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    source: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)  # campaign, manual, list
    campaign_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("outreach_campaigns.id"), nullable=True)
    ip_address: Mapped[Optional[str]] = mapped_column(String(45), nullable=True)
    user_agent: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class AnalyticsSnapshot(Base):
    """Daily analytics snapshots."""
    __tablename__ = "analytics_snapshots"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    date: Mapped[datetime] = mapped_column(DateTime, index=True)

    # Agent metrics
    agent_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True, index=True)

    # Discovery
    companies_discovered: Mapped[int] = mapped_column(Integer, default=0)
    companies_researched: Mapped[int] = mapped_column(Integer, default=0)

    # Outreach
    emails_sent: Mapped[int] = mapped_column(Integer, default=0)
    emails_delivered: Mapped[int] = mapped_column(Integer, default=0)
    emails_opened: Mapped[int] = mapped_column(Integer, default=0)
    emails_clicked: Mapped[int] = mapped_column(Integer, default=0)
    emails_replied: Mapped[int] = mapped_column(Integer, default=0)
    emails_bounced: Mapped[int] = mapped_column(Integer, default=0)
    emails_unsubscribed: Mapped[int] = mapped_column(Integer, default=0)

    # Pipeline
    deals_created: Mapped[int] = mapped_column(Integer, default=0)
    deals_advanced: Mapped[int] = mapped_column(Integer, default=0)
    deals_won: Mapped[int] = mapped_column(Integer, default=0)
    deals_lost: Mapped[int] = mapped_column(Integer, default=0)
    pipeline_value_usd: Mapped[int] = mapped_column(Integer, default=0)

    # Calls
    calls_booked: Mapped[int] = mapped_column(Integer, default=0)
    calls_completed: Mapped[int] = mapped_column(Integer, default=0)

    # Rates
    open_rate: Mapped[float] = mapped_column(Float, default=0.0)
    click_rate: Mapped[float] = mapped_column(Float, default=0.0)
    reply_rate: Mapped[float] = mapped_column(Float, default=0.0)
    bounce_rate: Mapped[float] = mapped_column(Float, default=0.0)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("date", "agent_name", name="uq_analytics_date_agent"),
        Index("ix_analytics_date", "date"),
    )


# ============================================================
# JOB OPENINGS & CANDIDATES
# ============================================================


class JobOpening(Base):
    """A job opening at a client company."""
    __tablename__ = "job_openings"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    company_id: Mapped[str] = mapped_column(String(36), ForeignKey("companies.id"), index=True)
    agent_id: Mapped[str] = mapped_column(String(36), ForeignKey("agent_configs.id"), index=True)

    # Job details
    title: Mapped[str] = mapped_column(String(255))
    department: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    role_type: Mapped[str] = mapped_column(String(50), default="full_time")  # full_time, contract, part_time
    experience_level: Mapped[str] = mapped_column(String(50), default="mid")  # junior, mid, senior, lead, executive

    # Compensation
    salary_min_usd: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    salary_max_usd: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    # Requirements
    required_skills: Mapped[list[str]] = mapped_column(JSON, default=list)
    preferred_skills: Mapped[list[str]] = mapped_column(JSON, default=list)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Location
    location: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    remote_policy: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)  # remote, hybrid, onsite

    # Status
    status: Mapped[JobOpeningStatus] = mapped_column(Enum(JobOpeningStatus), default=JobOpeningStatus.OPEN, index=True)
    priority: Mapped[str] = mapped_column(String(20), default="normal")  # low, normal, high, urgent
    max_candidates: Mapped[int] = mapped_column(Integer, default=20)

    # Sync
    synced_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    company: Mapped["Company"] = relationship("Company", back_populates="job_openings")
    agent: Mapped["AgentConfig"] = relationship("AgentConfig", back_populates="job_openings")
    candidates: Mapped[list["Candidate"]] = relationship("Candidate", back_populates="job_opening", cascade="all, delete-orphan")
    screenings: Mapped[list["ScreeningSession"]] = relationship("ScreeningSession", back_populates="job_opening", cascade="all, delete-orphan")
    schedules: Mapped[list["CandidateSchedule"]] = relationship("CandidateSchedule", back_populates="job_opening", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_job_openings_company_status", "company_id", "status"),
    )


class Candidate(Base):
    """A candidate in the recruiting pipeline."""
    __tablename__ = "candidates"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    job_opening_id: Mapped[str] = mapped_column(String(36), ForeignKey("job_openings.id"), index=True)
    company_id: Mapped[str] = mapped_column(String(36), ForeignKey("companies.id"), index=True)
    agent_id: Mapped[str] = mapped_column(String(36), ForeignKey("agent_configs.id"), index=True)

    # Basic info
    first_name: Mapped[str] = mapped_column(String(100))
    last_name: Mapped[str] = mapped_column(String(100))
    full_name: Mapped[str] = mapped_column(String(255), index=True)
    email: Mapped[str] = mapped_column(String(255), index=True)
    phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    linkedin_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    portfolio_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    # Resume
    resume_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    resume_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    resume_parsed_data: Mapped[dict] = mapped_column(JSON, default=dict)

    # Professional
    current_title: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    current_company: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    experience_years: Mapped[int] = mapped_column(Integer, default=0)
    skills: Mapped[list[str]] = mapped_column(JSON, default=list)
    expected_salary_usd: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    location: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Status & Assessment
    status: Mapped[CandidateStatus] = mapped_column(Enum(CandidateStatus), default=CandidateStatus.NEW, index=True)
    screening_score: Mapped[float] = mapped_column(Float, default=0.0)
    screening_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Source
    source: Mapped[str] = mapped_column(String(50), default="linkedin")  # linkedin, referral, job_board, company_pipeline

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    job_opening: Mapped["JobOpening"] = relationship("JobOpening", back_populates="candidates")
    company: Mapped["Company"] = relationship("Company", back_populates="candidates")
    agent: Mapped["AgentConfig"] = relationship("AgentConfig", back_populates="candidates")
    screenings: Mapped[list["ScreeningSession"]] = relationship("ScreeningSession", back_populates="candidate", cascade="all, delete-orphan")
    schedules: Mapped[list["CandidateSchedule"]] = relationship("CandidateSchedule", back_populates="candidate", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_candidates_opening_status", "job_opening_id", "status"),
    )


# ============================================================
# PROPOSALS & ONBOARDING
# ============================================================


class Proposal(Base):
    """Service proposal sent to a client company."""
    __tablename__ = "proposals"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    company_id: Mapped[str] = mapped_column(String(36), ForeignKey("companies.id"), index=True)
    agent_id: Mapped[str] = mapped_column(String(36), ForeignKey("agent_configs.id"), index=True)

    # Proposal content
    title: Mapped[str] = mapped_column(String(255))
    proposal_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    services_offered: Mapped[list[str]] = mapped_column(JSON, default=list)
    fee_structure: Mapped[dict] = mapped_column(JSON, default=dict)
    sla_commitments: Mapped[dict] = mapped_column(JSON, default=dict)

    # Status
    status: Mapped[ProposalStatus] = mapped_column(Enum(ProposalStatus), default=ProposalStatus.DRAFT, index=True)
    valid_until: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # Tracking
    sent_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    viewed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    accepted_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    rejected_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    rejection_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    company: Mapped["Company"] = relationship("Company", back_populates="proposals")
    agent: Mapped["AgentConfig"] = relationship("AgentConfig", back_populates="proposals")
    onboarding: Mapped[Optional["OnboardingRecord"]] = relationship("OnboardingRecord", back_populates="proposal", uselist=False)


class OnboardingRecord(Base):
    """Tracks company onboarding progress."""
    __tablename__ = "onboarding_records"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    company_id: Mapped[str] = mapped_column(String(36), ForeignKey("companies.id"), index=True)
    proposal_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("proposals.id"), nullable=True, index=True)
    agent_id: Mapped[str] = mapped_column(String(36), ForeignKey("agent_configs.id"), index=True)

    # Status
    status: Mapped[OnboardingStatus] = mapped_column(Enum(OnboardingStatus), default=OnboardingStatus.NOT_STARTED, index=True)

    # Checklist
    checklist: Mapped[dict] = mapped_column(JSON, default=dict)  # {item_name: completed_bool}

    # Job sync
    job_sync_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    sync_api_key: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    sync_endpoint_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    # Notes
    onboarding_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Timestamps
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    company: Mapped["Company"] = relationship("Company", back_populates="onboarding")
    proposal: Mapped[Optional["Proposal"]] = relationship("Proposal", back_populates="onboarding")
    agent: Mapped["AgentConfig"] = relationship("AgentConfig", back_populates="onboarding_records")


# ============================================================
# SCREENING & INTERVIEWS
# ============================================================


class ScreeningSession(Base):
    """LLM-generated pre-screening assessment of a candidate."""
    __tablename__ = "screening_sessions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    candidate_id: Mapped[str] = mapped_column(String(36), ForeignKey("candidates.id"), index=True)
    agent_id: Mapped[str] = mapped_column(String(36), ForeignKey("agent_configs.id"), index=True)
    job_opening_id: Mapped[str] = mapped_column(String(36), ForeignKey("job_openings.id"), index=True)

    # Screening results
    questions: Mapped[list[dict]] = mapped_column(JSON, default=list)
    overall_score: Mapped[float] = mapped_column(Float, default=0.0)
    skills_match: Mapped[dict] = mapped_column(JSON, default=dict)  # {skill: match_pct}
    recommendation: Mapped[ScreeningRecommendation] = mapped_column(
        Enum(ScreeningRecommendation), default=ScreeningRecommendation.NOT_RECOMMENDED
    )
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    candidate: Mapped["Candidate"] = relationship("Candidate", back_populates="screenings")
    agent: Mapped["AgentConfig"] = relationship("AgentConfig", back_populates="screenings")
    job_opening: Mapped["JobOpening"] = relationship("JobOpening", back_populates="screenings")


class CandidateSchedule(Base):
    """Scheduled interview/screening call for a candidate."""
    __tablename__ = "candidate_schedules"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    candidate_id: Mapped[str] = mapped_column(String(36), ForeignKey("candidates.id"), index=True)
    job_opening_id: Mapped[str] = mapped_column(String(36), ForeignKey("job_openings.id"), index=True)
    call_booking_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("call_bookings.id"), nullable=True, index=True)

    # Interview details
    interview_type: Mapped[str] = mapped_column(String(50))  # screening, technical, behavioral, final
    scheduled_at: Mapped[datetime] = mapped_column(DateTime, index=True)
    timezone: Mapped[str] = mapped_column(String(50), default="UTC")

    # Status
    status: Mapped[InterviewStatus] = mapped_column(Enum(InterviewStatus), default=InterviewStatus.SCHEDULED, index=True)

    # Outcome
    outcome: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    interviewer_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    next_steps: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    candidate: Mapped["Candidate"] = relationship("Candidate", back_populates="schedules")
    job_opening: Mapped["JobOpening"] = relationship("JobOpening", back_populates="schedules")