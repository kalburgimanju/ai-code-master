"""Google Drive upload for lesson scripts (as Docs) and PPT decks."""

import json
import re
from pathlib import Path

from googleapiclient.http import MediaFileUpload, MediaInMemoryUpload

from backend.services import youtube as yt_service

DOC_MIME = "application/vnd.google-apps.document"
PPT_MIME = "application/vnd.openxmlformats-officedocument.presentationml.presentation"


def _clean_script(text: str) -> str:
    """Unwrap a JSON envelope if a stored script was accidentally saved as raw JSON.

    Free models sometimes return `{"full_script": "..."}` whose inner string isn't
    strictly escaped; this recovers the readable script text so the Drive Doc never
    contains JSON.
    """
    if not text or not text.lstrip().startswith("{"):
        return text or ""
    env = re.search(r'\{[^{}]*"full_script"\s*:\s*"(.*?)"\s*\}', text, re.DOTALL)
    if env:
        inner = env.group(1)
        try:
            return json.loads(f'{{"full_script": "{inner}"}}')["full_script"]
        except json.JSONDecodeError:
            return inner.replace("\\n", "\n").replace('\\"', '"').replace("\\t", "\t").strip()
    return text.strip()


def upload_lesson_to_drive(lesson, script_folder_id: str, ppt_folder_id: str) -> dict:
    """Upload a lesson's script as a Google Doc and its PPT as a .pptx file.

    The script Doc goes to `script_folder_id`; the PPT goes to `ppt_folder_id`.
    Returns IDs and web links.
    """
    drive = yt_service.get_drive_service()

    script_text = _clean_script(lesson.full_script or "")

    # --- Script -> Google Doc ---
    script_title = f"{lesson.title} — by manjunath kalburgi"
    doc_meta = {
        "name": script_title,
        "mimeType": DOC_MIME,
        "parents": [script_folder_id],
    }
    doc = drive.files().create(body=doc_meta, fields="id, webViewLink").execute()
    script_body = MediaInMemoryUpload(
        script_text.encode("utf-8"),
        mimetype="text/plain",
        resumable=True,
    )
    drive.files().update(fileId=doc["id"], media_body=script_body).execute()

    # --- PPT -> .pptx file ---
    ppt_path = Path(lesson.ppt_path) if lesson.ppt_path else None
    if not ppt_path or not ppt_path.exists():
        raise FileNotFoundError("No PPT file found for this lesson. Generate the PPT first.")
    ppt_meta = {
        "name": f"{lesson.title}.pptx",
        "parents": [ppt_folder_id],
    }
    ppt = (
        drive.files()
        .create(
            body=ppt_meta,
            media_body=MediaFileUpload(str(ppt_path), mimetype=PPT_MIME, resumable=True),
            fields="id, webViewLink",
        )
        .execute()
    )

    return {
        "script_doc_id": doc["id"],
        "script_doc_link": doc.get("webViewLink", ""),
        "ppt_file_id": ppt["id"],
        "ppt_file_link": ppt.get("webViewLink", ""),
    }
