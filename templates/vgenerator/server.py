#!/usr/bin/env python3
"""VGenerator backend server — wraps MoneyPrinterTurbo video generation."""

from __future__ import annotations

import json
import os
import shutil
import subprocess
import sys
import tempfile
import threading
import time
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel

app = FastAPI(title="VGenerator API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── In-memory task store ──────────────────────────────────────────────
TASKS: dict[str, dict] = {}
MPT_ROOT = Path.home() / "MoneyPrinterTurbo"
AGENT_SCRIPT = Path(tempfile.gettempdir()) / "mpt_agent.py"


class GenerateRequest(BaseModel):
    topic: str
    script: Optional[str] = None
    settings: dict = {}
    projectId: str = ""


class GenerateResponse(BaseModel):
    id: str
    status: str = "queued"


# ── Task background worker ────────────────────────────────────────────
def _run_generation(task_id: str, req: GenerateRequest) -> None:
    """Run MPT agent in a background thread and collect results."""
    task = TASKS.get(task_id)
    if not task:
        return

    try:
        task["status"] = "running"
        task["stage"] = "script"
        task["progress"] = 10

        # Build environment
        env = os.environ.copy()
        if "OPENROUTER_API_KEY" not in env:
            env["OPENROUTER_API_KEY"] = env.get("MPT_LLM_API_KEY", "")

        # Build CLI args
        settings = req.settings
        cli_args = [
            "--voice-name",
            settings.get("voiceName", "en-IN-NeerjaNeural-Female"),
            "--video-source",
            settings.get("videoSource", "pexels"),
            "--video-aspect",
            settings.get("aspectRatio", "9:16"),
            "--stop-at",
            "video",
        ]

        if settings.get("bgmType") == "none":
            cli_args.append("--bgm-type")
            cli_args.append("none")

        if not settings.get("subtitleEnabled", True):
            cli_args.append("--no-subtitle-enabled")

        # Use custom script if provided
        if req.script:
            cli_args.append("--video-script")
            cli_args.append(req.script)

        # Determine subject
        subject = req.topic

        task["progress"] = 20

        # Run MPT agent
        task["stage"] = "audio"
        task["progress"] = 30

        if not AGENT_SCRIPT.exists():
            # Download the agent script
            import urllib.request
            url = "https://raw.githubusercontent.com/harry0703/MoneyPrinterTurbo/main/docs/skill/mpt_agent.py"
            urllib.request.urlretrieve(url, AGENT_SCRIPT)
            os.chmod(AGENT_SCRIPT, 0o755)

        task["stage"] = "materials"
        task["progress"] = 50

        cmd = [
            "uv", "run", "--no-project", "--python", "3.11",
            "python", str(AGENT_SCRIPT),
            "--subject", subject,
            "--",
            *cli_args,
        ]

        task["stage"] = "video"
        task["progress"] = 70

        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=600,
            env=env,
        )

        if result.returncode == 0:
            # Parse the output for VIDEO_FILE
            video_files = []
            task_dir = ""
            log_file = ""
            for line in result.stdout.splitlines():
                if line.startswith("VIDEO_FILE="):
                    video_files.append(line[len("VIDEO_FILE="):])
                elif line.startswith("TASK_DIR="):
                    task_dir = line[len("TASK_DIR="):]
                elif line.startswith("LOG_FILE="):
                    log_file = line[len("LOG_FILE="):]

            if video_files:
                # Read the result manifest for more details
                audio_duration = 0
                try:
                    result_manifest = MPT_ROOT / ".agent-logs" / "moneyprinterturbo-video" / "latest-result.json"
                    if result_manifest.exists():
                        with open(result_manifest) as f:
                            manifest = json.load(f)
                            audio_duration = manifest.get("audio_duration", 0)
                except Exception:
                    pass

                task.update({
                    "status": "completed",
                    "progress": 100,
                    "stage": "done",
                    "video_file": video_files[0],
                    "task_dir": task_dir,
                    "log_file": log_file,
                    "audio_duration": audio_duration or _get_video_duration(video_files[0]),
                })
            else:
                task.update({
                    "status": "failed",
                    "error": "No video file was generated. Check the log file.",
                    "log_file": log_file or "",
                })
        else:
            error_msg = result.stderr.strip() or result.stdout.strip()
            # Truncate long errors
            if len(error_msg) > 500:
                error_msg = error_msg[:500] + "..."
            task.update({
                "status": "failed",
                "error": error_msg or f"Exit code {result.returncode}",
            })

    except subprocess.TimeoutExpired:
        task.update({"status": "failed", "error": "Generation timed out (600s)"})
    except Exception as e:
        task.update({"status": "failed", "error": str(e)[:500]})


def _get_video_duration(video_path: str) -> float:
    """Get video duration using ffprobe."""
    try:
        result = subprocess.run(
            ["ffprobe", "-v", "error", "-show_entries", "format=duration",
             "-of", "default=noprint_wrappers=1:nokey=1", video_path],
            capture_output=True, text=True, timeout=10,
        )
        if result.returncode == 0 and result.stdout.strip():
            return round(float(result.stdout.strip()), 2)
    except Exception:
        pass
    return 0


# ── API Routes ────────────────────────────────────────────────────────

@app.post("/api/generate")
async def generate_video(req: GenerateRequest):
    task_id = req.projectId or f"task_{uuid.uuid4().hex[:12]}"

    task = {
        "task_id": task_id,
        "status": "queued",
        "stage": "queued",
        "progress": 0,
        "video_file": None,
        "task_dir": None,
        "log_file": None,
        "audio_duration": None,
        "error": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    TASKS[task_id] = task

    # Start background thread
    thread = threading.Thread(target=_run_generation, args=(task_id, req), daemon=True)
    thread.start()

    return GenerateResponse(id=task_id, status="queued")


@app.get("/api/task/{task_id}")
async def get_task_status(task_id: str):
    task = TASKS.get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@app.get("/api/video/{task_dir:path}/{filename}")
async def serve_video(task_dir: str, filename: str):
    """Serve a video file for preview."""
    video_path = Path(task_dir) / filename
    if not video_path.exists():
        # Try the MPT storage path
        alt_path = MPT_ROOT / "storage" / "tasks" / task_dir / filename
        if alt_path.exists():
            video_path = alt_path
        else:
            raise HTTPException(status_code=404, detail="Video not found")

    return FileResponse(str(video_path), media_type="video/mp4")


@app.get("/api/download/{task_dir:path}/{filename}")
async def download_video(task_dir: str, filename: str):
    """Download a video file."""
    video_path = Path(task_dir) / filename
    if not video_path.exists():
        alt_path = MPT_ROOT / "storage" / "tasks" / task_dir / filename
        if alt_path.exists():
            video_path = alt_path
        else:
            raise HTTPException(status_code=404, detail="Video not found")

    return FileResponse(
        str(video_path),
        media_type="video/mp4",
        filename=filename,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@app.get("/api/health")
async def health_check():
    return {
        "status": "ok",
        "mpt_installed": (MPT_ROOT / "cli.py").exists(),
        "agent_script": AGENT_SCRIPT.exists(),
    }


if __name__ == "__main__":
    import uvicorn
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8090
    print(f"Starting VGenerator API on port {port}...")
    uvicorn.run(app, host="0.0.0.0", port=port)
