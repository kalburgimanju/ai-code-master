"""Configuration management for the recruitment agency platform."""

import os
from pathlib import Path
from typing import Any, Optional

import yaml
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class AgentDiscoveryConfig(BaseSettings):
    model_config = SettingsConfigDict(extra="ignore")

    enabled: bool = True
    schedule: str = "0 8 * * 1"
    sources: list[str] = Field(default_factory=lambda: ["apify_linkedin", "crunchbase"])
    filters: dict[str, Any] = Field(default_factory=dict)
    max_companies_per_run: int = 50


class AgentResearchConfig(BaseSettings):
    model_config = SettingsConfigDict(extra="ignore")

    enabled: bool = True
    depth: str = "deep"
    sources: list[str] = Field(default_factory=lambda: ["website", "linkedin", "crunchbase", "news", "glassdoor"])
    extract: list[str] = Field(default_factory=lambda: ["hiring_needs", "team_structure", "tech_stack", "pain_points", "decision_makers"])


class AgentOutreachConfig(BaseSettings):
    model_config = SettingsConfigDict(extra="ignore")

    enabled: bool = True
    email_provider: str = "sendgrid"
    from_email: str = "recruiting@yourdomain.com"
    from_name: str = "Your Name"
    reply_to: str = "recruiting@yourdomain.com"
    daily_limit: int = 50
    delay_between_emails: int = 30


class FollowupStepConfig(BaseSettings):
    model_config = SettingsConfigDict(extra="ignore")

    delay_days: int
    template: str


class FollowupSequenceConfig(BaseSettings):
    model_config = SettingsConfigDict(extra="ignore")

    name: str
    steps: list[FollowupStepConfig]


class AgentFollowupConfig(BaseSettings):
    model_config = SettingsConfigDict(extra="ignore")

    enabled: bool = True
    sequences: list[FollowupSequenceConfig] = Field(default_factory=list)


class AgentSchedulerConfig(BaseSettings):
    model_config = SettingsConfigDict(extra="ignore")

    enabled: bool = True
    calendar_provider: str = "calcom"
    booking_link: str = "https://cal.com/your-link/30min"
    timezone: str = "UTC"


class AgentBDConfig(BaseSettings):
    model_config = SettingsConfigDict(extra="ignore")

    enabled: bool = True
    proposal_fee_model: str = "contingency"  # contingency, retained, hybrid
    contingency_fee_pct: float = 20.0
    retainer_monthly_usd: int = 5000
    onboarding_checklist: list[str] = Field(default_factory=lambda: [
        "contract_signed",
        "payment_terms_agreed",
        "portal_access_granted",
        "hiring_manager_intro",
        "job_requirements_collected",
        "sourcing_started",
    ])
    proposal_validity_days: int = 30
    followup_sequence: str = "bd_5_touch"
    daily_proposal_limit: int = 10
    account_review_interval_days: int = 30


class AgentRecruitingConfig(BaseSettings):
    model_config = SettingsConfigDict(extra="ignore")

    enabled: bool = True
    max_candidates_per_opening: int = 20
    screening_model: str = "llm_assessed"
    auto_shortlist: bool = True
    shortlist_top_n: int = 5
    interview_duration_minutes: int = 30
    followup_interval_days: int = 3
    auto_screen: bool = True
    scheduling_provider: str = "calcom"
    max_screenings_per_run: int = 50
    closing_followup_days: int = 7


class AgentsConfig(BaseSettings):
    model_config = SettingsConfigDict(extra="ignore")

    discovery: AgentDiscoveryConfig = Field(default_factory=AgentDiscoveryConfig)
    research: AgentResearchConfig = Field(default_factory=AgentResearchConfig)
    outreach: AgentOutreachConfig = Field(default_factory=AgentOutreachConfig)
    followup: AgentFollowupConfig = Field(default_factory=AgentFollowupConfig)
    scheduler: AgentSchedulerConfig = Field(default_factory=AgentSchedulerConfig)
    business_development: AgentBDConfig = Field(default_factory=AgentBDConfig)
    recruiting: AgentRecruitingConfig = Field(default_factory=AgentRecruitingConfig)


class LLMConfig(BaseSettings):
    model_config = SettingsConfigDict(extra="ignore")

    provider: str = "openrouter"
    model: str = "qwen/qwen3-coder:free"
    fallback_model: str = "meta-llama/llama-3.3-70b-instruct:free"
    models: list[str] = Field(default_factory=lambda: [
        "qwen/qwen3-coder:free",
        "nvidia/nemotron-3-ultra-550b-a55b:free",
        "nvidia/nemotron-3-super-120b-a12b:free",
        "meta-llama/llama-3.3-70b-instruct:free",
        "nousresearch/hermes-3-llama-3.1-405b:free",
        "google/gemma-4-31b-it:free",
        "google/gemma-4-26b-a4b-it:free",
        "tencent/hy3:free",
        "openai/gpt-oss-20b:free",
        "qwen/qwen3-next-80b-a3b-instruct:free",
        "cohere/north-mini-code:free",
        "nvidia/nemotron-3-nano-30b-a3b:free",
    ])
    temperature: float = 0.7
    max_tokens: int = 4000


class ApifyConfig(BaseSettings):
    model_config = SettingsConfigDict(extra="ignore")

    token: str = ""
    linkedin_actor: str = "apify/linkedin-jobs-scraper"
    company_actor: str = "apify/linkedin-company-scraper"


class SendGridConfig(BaseSettings):
    model_config = SettingsConfigDict(extra="ignore")

    api_key: str = ""
    from_email: str = "recruiting@yourdomain.com"
    from_name: str = "Your Name"
    reply_to: str = "recruiting@yourdomain.com"


class CalComConfig(BaseSettings):
    model_config = SettingsConfigDict(extra="ignore")

    api_key: str = ""
    event_type_id: str = ""


class HubSpotConfig(BaseSettings):
    model_config = SettingsConfigDict(extra="ignore")

    api_key: str = ""
    portal_id: str = ""


class APIsConfig(BaseSettings):
    model_config = SettingsConfigDict(extra="ignore")

    apify: ApifyConfig = Field(default_factory=ApifyConfig)
    sendgrid: SendGridConfig = Field(default_factory=SendGridConfig)
    calcom: CalComConfig = Field(default_factory=CalComConfig)
    hubspot: HubSpotConfig = Field(default_factory=HubSpotConfig)


class DatabaseConfig(BaseSettings):
    model_config = SettingsConfigDict(extra="ignore")

    url: str = "sqlite:///./data/agency.db"
    echo: bool = False


class DashboardConfig(BaseSettings):
    model_config = SettingsConfigDict(extra="ignore")

    host: str = "0.0.0.0"
    port: int = 5173
    api_proxy: str = "/api"
    cors_origins: list[str] = Field(
        default_factory=lambda: ["http://localhost:5173", "http://localhost:3000"]
    )


class SchedulerJobConfig(BaseSettings):
    model_config = SettingsConfigDict(extra="ignore")

    name: str
    trigger: str
    hour: Optional[int] = None
    day_of_week: Optional[str] = None
    hours: Optional[int] = None
    enabled: bool = True


class SchedulerConfig(BaseSettings):
    model_config = SettingsConfigDict(extra="ignore")

    timezone: str = "UTC"
    jobs: list[SchedulerJobConfig] = Field(default_factory=list)


class MonitoringAlertConfig(BaseSettings):
    model_config = SettingsConfigDict(extra="ignore")

    name: str
    condition: str
    severity: str


class MonitoringConfig(BaseSettings):
    model_config = SettingsConfigDict(extra="ignore")

    log_level: str = "INFO"
    log_format: str = "json"
    sentry_dsn: str = ""
    alert_channels: dict[str, str] = Field(default_factory=dict)
    alerts: list[MonitoringAlertConfig] = Field(default_factory=list)


class FeaturesConfig(BaseSettings):
    model_config = SettingsConfigDict(extra="ignore")

    enable_ai_research: bool = True
    enable_auto_outreach: bool = True
    enable_auto_followup: bool = True
    enable_auto_scheduling: bool = True
    enable_crm_sync: bool = True
    enable_analytics: bool = True
    enable_ab_testing: bool = True
    enable_multi_agent: bool = True
    enable_human_review: bool = False
    dry_run_mode: bool = False


# ============================================================
# Agent Persona Configuration Models
# ============================================================


class PersonaDiscoveryConfig(BaseSettings):
    model_config = SettingsConfigDict(extra="ignore")

    industries: list[str] = Field(default_factory=list)
    company_size: str = "10-500"
    hiring_signals: list[str] = Field(default_factory=list)


class PersonaResearchConfig(BaseSettings):
    model_config = SettingsConfigDict(extra="ignore")

    depth: str = "standard"
    focus_areas: list[str] = Field(default_factory=list)


class PersonaOutreachConfig(BaseSettings):
    model_config = SettingsConfigDict(extra="ignore")

    tone: str = "professional_peer"
    templates_dir: str = ""


class PersonaFollowupConfig(BaseSettings):
    model_config = SettingsConfigDict(extra="ignore")

    sequence: str = "standard_3_touch"


class PersonaSchedulerConfig(BaseSettings):
    model_config = SettingsConfigDict(extra="ignore")

    meeting_type: str = "discovery_call"
    duration: int = 30


class AgentPersonaConfig(BaseSettings):
    """Configuration for an agent persona template."""
    model_config = SettingsConfigDict(extra="ignore")

    name: str = ""
    description: str = ""
    persona: str = ""
    specialization: str = ""
    value_prop: str = ""
    case_study: str = ""
    discovery: Optional[PersonaDiscoveryConfig] = None
    research: Optional[PersonaResearchConfig] = None
    outreach: Optional[PersonaOutreachConfig] = None
    followup: Optional[PersonaFollowupConfig] = None
    scheduler: Optional[PersonaSchedulerConfig] = None


class AgentPersonasConfig(BaseSettings):
    """Container for all agent personas loaded from config.yaml."""
    model_config = SettingsConfigDict(extra="ignore")

    saas_hunter: Optional[AgentPersonaConfig] = None
    fintech_recruiter: Optional[AgentPersonaConfig] = None
    ai_ml_specialist: Optional[AgentPersonaConfig] = None


class Settings(BaseSettings):
    """Main application settings loaded from config.yaml and environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
        env_nested_delimiter="__",
    )

    agents: AgentsConfig = Field(default_factory=AgentsConfig)
    llm: LLMConfig = Field(default_factory=LLMConfig)
    apis: APIsConfig = Field(default_factory=APIsConfig)
    database: DatabaseConfig = Field(default_factory=DatabaseConfig)
    dashboard: DashboardConfig = Field(default_factory=DashboardConfig)
    scheduler: SchedulerConfig = Field(default_factory=SchedulerConfig)
    monitoring: MonitoringConfig = Field(default_factory=MonitoringConfig)
    features: FeaturesConfig = Field(default_factory=FeaturesConfig)
    agent_personas: AgentPersonasConfig = Field(default_factory=AgentPersonasConfig)

    # Runtime settings (not from config.yaml)
    secret_key: str = "your-secret-key-change-in-production"
    environment: str = "development"

    @field_validator("database", mode="before")
    @classmethod
    def resolve_database_url(cls, v: Any) -> Any:
        if isinstance(v, dict) and "url" in v:
            url = v["url"]
            if "${" in url and "}" in url:
                import re
                def replace_env(match: re.Match[str]) -> str:
                    env_var = match.group(1)
                    return os.getenv(env_var, match.group(0))
                v["url"] = re.sub(r"\$\{(\w+)\}", replace_env, url)
        return v

    @field_validator("apis", mode="before")
    @classmethod
    def resolve_api_keys(cls, v: Any) -> Any:
        if isinstance(v, dict):
            for key, value in v.items():
                if isinstance(value, dict):
                    for sub_key, sub_value in value.items():
                        if isinstance(sub_value, str) and sub_value.startswith("${") and sub_value.endswith("}"):
                            env_var = sub_value[2:-1]
                            value[sub_key] = os.getenv(env_var, sub_value)
        return v


def load_config(config_path: Optional[str] = None) -> Settings:
    """Load configuration from YAML file and environment variables."""
    # Load .env file first so env vars are available during config resolution
    from dotenv import load_dotenv
    load_dotenv(override=False)

    if config_path is None:
        config_path = os.getenv("CONFIG_PATH", "config.yaml")

    config_file = Path(config_path)
    if config_file.exists():
        with open(config_file, "r") as f:
            yaml_config = yaml.safe_load(f) or {}
    else:
        yaml_config = {}

    # Merge YAML config with environment variables
    settings = Settings(**yaml_config)
    return settings


# Global settings instance
_settings: Optional[Settings] = None


def get_settings() -> Settings:
    """Get the global settings instance."""
    global _settings
    if _settings is None:
        _settings = load_config()
    return _settings


def reload_settings(config_path: Optional[str] = None) -> Settings:
    """Reload settings from config file."""
    global _settings
    _settings = load_config(config_path)
    return _settings