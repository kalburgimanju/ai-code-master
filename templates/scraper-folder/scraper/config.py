"""Configuration management for the job scraper."""

from __future__ import annotations

from pathlib import Path

import yaml
from dotenv import load_dotenv
from pydantic import BaseModel
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Environment-based settings."""

    apify_api_token: str = ""
    apify_actor_id: str = "apify/linkedin-jobs-scraper"
    scrape_results_limit: int = 100
    data_dir: str = "./data"
    test_mode: bool = False
    test_data_path: str = ""
    email_enabled: bool = False
    email_default: str = "manjunathkhubli85@gmail.com"
    email_smtp_host: str = ""
    email_smtp_port: int = 587
    email_smtp_user: str = ""
    email_smtp_pass: str = ""
    email_subject_template: str = "AI Job Scraper - {count} Opportunities Found"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}

    @property
    def email(self) -> EmailConfig:
        """Return email configuration object."""
        return EmailConfig(
            enabled=self.email_enabled,
            default_email=self.email_default,
            smtp_host=self.email_smtp_host,
            smtp_port=self.email_smtp_port,
            smtp_user=self.email_smtp_user,
            smtp_pass=self.email_smtp_pass,
            subject_template=self.email_subject_template,
        )


class SearchConfig(BaseSettings):
    """Search query configuration."""

    queries: list[str] = []
    location: str = "United States"
    remote_only: bool = True
    job_type: str = "full_time"


class FilterConfig(BaseSettings):
    """Job filtering configuration."""

    salary_min: int = 65000
    salary_max: int = 160000
    max_applicants: int = 50
    exclude_keywords: list[str] = []
    required_keywords: list[str] = []


class ApifyConfig(BaseSettings):
    """Apify actor configuration."""

    actor_id: str = "apify/linkedin-jobs-scraper"
    timeout_secs: int = 300
    memory_mbytes: int = 1024
    max_items: int = 100


class ExportConfig(BaseSettings):
    """Export configuration."""

    top_n: int = 15
    formats: list[str] = ["csv", "json"]


class GoogleDriveConfig(BaseSettings):
    """Google Drive upload configuration."""

    enabled: bool = False
    credentials_file: str = "./credentials.json"
    token_file: str = "./token.json"
    folder_id: str = ""
    upload_formats: list[str] = ["csv", "json"]


class EmailConfig(BaseSettings):
    """Email notification configuration."""

    enabled: bool = False
    default_email: str = "manjunathkhubli85@gmail.com"
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_pass: str = ""
    subject_template: str = "AI Job Scraper - {count} Opportunities Found"


class EmailHistory(BaseModel):
    """Email sent history entry."""

    id: str
    email_address: str
    timestamp: str
    recipient_count: int
    job_count: int
    filename: str
    status: str


class AppConfig(BaseSettings):
    """Main application configuration loaded from config.yaml + .env."""

    search: SearchConfig = SearchConfig()
    filters: FilterConfig = FilterConfig()
    tracked_skills: list[str] = []
    apify: ApifyConfig = ApifyConfig()
    export: ExportConfig = ExportConfig()
    google_drive: GoogleDriveConfig = GoogleDriveConfig()
    email: EmailConfig = EmailConfig()
    settings: Settings = Settings()

    @classmethod
    def load(cls, config_path: str | Path = "config.yaml") -> AppConfig:
        """Load configuration from config.yaml and .env."""
        load_dotenv()
        path = Path(config_path)
        if path.exists():
            with open(path) as f:
                raw = yaml.safe_load(f) or {}

            # Merge settings from .env file
            settings_data = Settings()
            for key, value in settings_data.model_dump().items():
                if key.startswith("email_") and hasattr(Settings, key):
                    raw[key.replace("email_", "")] = value
                elif value:
                    if key not in raw:
                        raw[key] = value

            return cls(
                search=SearchConfig(**raw.get("search", {})),
                filters=FilterConfig(**raw.get("filters", {})),
                tracked_skills=raw.get("tracked_skills", []),
                apify=ApifyConfig(**raw.get("apify", {})),
                export=ExportConfig(**raw.get("export", {})),
                google_drive=GoogleDriveConfig(**raw.get("google_drive", {})),
                email=EmailConfig(**raw.get("email", {})),
                settings=Settings(),
            )
        return cls()
