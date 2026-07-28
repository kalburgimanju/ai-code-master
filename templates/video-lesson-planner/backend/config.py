"""Application configuration from environment variables."""

from pathlib import Path

from pydantic_settings import BaseSettings


def _find_env_file() -> str:
    """Find .env file starting from current directory and walking up."""
    d = Path.cwd()
    for _ in range(10):
        candidate = d / ".env"
        if candidate.exists():
            return str(candidate)
        parent = d.parent
        if parent == d:
            break
        d = parent
    return ".env"


class Settings(BaseSettings):
    # OpenRouter
    openrouter_api_key: str = ""
    openrouter_model: str = "openrouter/free"
    openrouter_api_url: str = "https://openrouter.ai/api/v1"

    # YouTube OAuth2
    youtube_client_id: str = ""
    youtube_client_secret: str = ""
    youtube_redirect_uri: str = "http://localhost:8000/api/youtube/callback"

    # Google Drive
    google_drive_script_folder_id: str = ""
    google_drive_ppt_folder_id: str = ""

    # Database
    database_url: str = "sqlite:///./data/lesson_planner.db"

    # App
    app_name: str = "Video Lesson Planner"
    app_version: str = "0.1.0"
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    frontend_url: str = "http://localhost:5173"

    model_config = {
        "env_file": _find_env_file(),
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }


settings = Settings()

# Ensure data directory exists for SQLite
Path("data").mkdir(exist_ok=True)
