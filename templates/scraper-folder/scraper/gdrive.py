"""Google Drive uploader for exporting job data."""

from __future__ import annotations

import logging
import os
from pathlib import Path
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from scraper.config import AppConfig, GoogleDriveConfig

logger = logging.getLogger(__name__)


def _get_drive_service(config: GoogleDriveConfig):
    """Get authenticated Google Drive service."""
    from google.auth.transport.requests import Request
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow
    from googleapiclient.discovery import build

    SCOPES = ["https://www.googleapis.com/auth/drive.file"]

    creds = None
    token_path = Path(config.token_file)

    if token_path.exists():
        creds = Credentials.from_authorized_user_file(str(token_path), SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            credentials_path = Path(config.credentials_file)
            if not credentials_path.exists():
                raise FileNotFoundError(
                    f"Google credentials file not found: {credentials_path}. "
                    "Download from Google Cloud Console and save as credentials.json"
                )
            flow = InstalledAppFlow.from_client_secrets_file(str(credentials_path), SCOPES)
            creds = flow.run_local_server(port=54321)

        with open(token_path, "w") as token:
            token.write(creds.to_json())

    return build("drive", "v3", credentials=creds)


def upload_file_to_drive(
    file_path: str | Path,
    config: GoogleDriveConfig,
    custom_name: str | None = None,
) -> str | None:
    """
    Upload a file to Google Drive folder.

    Returns the file ID if successful, None otherwise.
    """
    if not config.enabled:
        logger.info("Google Drive upload disabled in config")
        return None

    if not config.folder_id:
        logger.warning("Google Drive folder_id not configured")
        return None

    file_path = Path(file_path)
    if not file_path.exists():
        logger.error(f"File not found: {file_path}")
        return None

    try:
        service = _get_drive_service(config)
        file_name = custom_name or file_path.name

        file_metadata = {
            "name": file_name,
            "parents": [config.folder_id],
        }

        from googleapiclient.http import MediaFileUpload
        media = MediaFileUpload(str(file_path), resumable=True)

        file = service.files().create(
            body=file_metadata,
            media_body=media,
            fields="id,webViewLink",
        ).execute()

        logger.info(f"Uploaded {file_name} to Google Drive: {file.get('webViewLink')}")
        return file.get("id")

    except Exception as e:
        logger.error(f"Failed to upload {file_path} to Google Drive: {e}")
        return None


def upload_exports(config: AppConfig, base_name: str = "export") -> dict[str, str]:
    """
    Upload all exported files to Google Drive.

    Returns dict mapping format to file ID.
    """
    if not config.google_drive.enabled:
        logger.info("Google Drive upload not enabled")
        return {}

    if not config.google_drive.folder_id:
        logger.warning("Google Drive folder_id not configured, skipping upload")
        return {}

    data_dir = Path(config.settings.data_dir)
    results = {}

    for fmt in config.google_drive.upload_formats:
        file_path = data_dir / f"{base_name}_{config.export.top_n}_{fmt}.{fmt}"
        if file_path.exists():
            file_id = upload_file_to_drive(file_path, config.google_drive)
            if file_id:
                results[fmt] = file_id
        else:
            logger.warning(f"Export file not found: {file_path}")

    return results


def upload_latest_exports(config: AppConfig) -> dict[str, str]:
    """
    Find and upload the most recent export files.

    Looks for files matching export_*_N.csv/json in data_dir.
    """
    if not config.google_drive.enabled:
        return {}

    data_dir = Path(config.settings.data_dir)
    results = {}

    for fmt in config.google_drive.upload_formats:
        pattern = f"export_*_{config.export.top_n}_{fmt}.{fmt}"
        files = list(data_dir.glob(pattern))
        if not files:
            pattern = f"export_*.{fmt}"
            files = list(data_dir.glob(pattern))

        if files:
            latest = max(files, key=lambda f: f.stat().st_mtime)
            file_id = upload_file_to_drive(latest, config.google_drive)
            if file_id:
                results[fmt] = file_id
        else:
            logger.warning(f"No {fmt} export files found to upload")

    return results


if __name__ == "__main__":
    # Test upload
    import sys
    from scraper.config import AppConfig

    logging.basicConfig(level=logging.INFO)
    config = AppConfig.load("config.yaml")
    config.google_drive.enabled = True

    if len(sys.argv) > 1:
        result = upload_file_to_drive(sys.argv[1], config.google_drive)
        print(f"Upload result: {result}")
    else:
        results = upload_latest_exports(config)
        print(f"Uploaded: {results}")