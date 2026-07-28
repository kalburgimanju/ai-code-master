"""Data persistence — save/load job listings in JSONL, CSV, SQLite formats."""

from __future__ import annotations

import csv
import json
import logging
from datetime import datetime
from pathlib import Path

from scraper.models import Job, ScrapeResult, Salary

logger = logging.getLogger(__name__)


def get_data_dir(path: str = "./data") -> Path:
    """Get or create data directory."""
    p = Path(path)
    p.mkdir(parents=True, exist_ok=True)
    return p


def save_scrape_result(result: ScrapeResult, data_dir: str = "./data") -> Path:
    """Save a scrape result to JSONL file."""
    p = get_data_dir(data_dir)
    filename = f"scrape_{result.run_id}.jsonl"
    filepath = p / filename

    with open(filepath, "w") as f:
        for job in result.jobs:
            line = job.model_dump_json()
            f.write(line + "\n")

    logger.info("Saved %d jobs to %s", len(result.jobs), filepath)
    return filepath


def load_jobs_from_file(filepath: str | Path) -> list[Job]:
    """Load jobs from a JSONL file."""
    jobs = []
    path = Path(filepath)
    if not path.exists():
        return jobs
    with open(path) as f:
        for line in f:
            line = line.strip()
            if line:
                try:
                    job = Job.model_validate_json(line)
                    jobs.append(job)
                except Exception as e:
                    logger.warning("Failed to parse line: %s", e)
    return jobs


def load_all_jobs(data_dir: str = "./data") -> list[Job]:
    """Load all jobs from all JSONL files in data directory."""
    p = get_data_dir(data_dir)
    all_jobs = []
    for f in sorted(p.glob("*.jsonl")):
        all_jobs.extend(load_jobs_from_file(f))
    # Deduplicate by job ID
    seen = set()
    unique = []
    for job in all_jobs:
        if job.id not in seen:
            seen.add(job.id)
            unique.append(job)
    return unique


def export_to_csv(jobs: list[Job], filepath: str | Path) -> Path:
    """Export jobs to CSV."""
    path = Path(filepath)
    path.parent.mkdir(parents=True, exist_ok=True)
    if not jobs:
        return path

    fieldnames = list(jobs[0].to_dict().keys())
    with open(path, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for job in jobs:
            writer.writerow(job.to_dict())

    logger.info("Exported %d jobs to %s", len(jobs), path)
    return path


def export_to_json(jobs: list[Job], filepath: str | Path) -> Path:
    """Export jobs to JSON array."""
    path = Path(filepath)
    path.parent.mkdir(parents=True, exist_ok=True)
    data = [job.model_dump(mode="json") for job in jobs]
    with open(path, "w") as f:
        json.dump(data, f, indent=2, default=str)

    logger.info("Exported %d jobs to %s", len(jobs), path)
    return path


def save_dashboard_json(jobs: list[Job], data_dir: str = "./data") -> Path:
    """Save all jobs as a flat JSON array for the React dashboard to consume."""
    p = get_data_dir(data_dir)
    dashboard_path = p / "dashboard.json"
    data = [job.model_dump(mode="json") for job in jobs]
    with open(dashboard_path, "w") as f:
        json.dump(data, f, indent=2, default=str)
    logger.info("Saved dashboard data (%d jobs) to %s", len(jobs), dashboard_path)
    return dashboard_path


def save_job_summary(jobs: list[Job], data_dir: str = "./data") -> Path:
    """Save a summary report of the latest scrape."""
    p = get_data_dir(data_dir)
    summary_path = p / "latest_summary.json"

    total = len(jobs)
    remote = sum(1 for j in jobs if j.is_remote)
    contractor = sum(1 for j in jobs if j.is_contractor_friendly)
    avg_applicants = (
        sum(j.applicant_count or 0 for j in jobs if j.applicant_count) / max(1, sum(1 for j in jobs if j.applicant_count))
    )
    skill_counts = {}
    for job in jobs:
        for skill in job.skills:
            skill_counts[skill] = skill_counts.get(skill, 0) + 1
    top_skills = sorted(skill_counts.items(), key=lambda x: x[1], reverse=True)[:10]

    salary_ranges = {}
    for job in jobs:
        if job.salary.min_amount and job.salary.max_amount:
            bucket = f"${job.salary.min_amount // 1000}k-${job.salary.max_amount // 1000}k"
            salary_ranges[bucket] = salary_ranges.get(bucket, 0) + 1

    summary = {
        "generated_at": datetime.now().isoformat(),
        "total_jobs": total,
        "remote_jobs": remote,
        "contractor_friendly": contractor,
        "avg_applicants": round(avg_applicants, 1),
        "top_skills": [{"skill": s, "count": c} for s, c in top_skills],
        "salary_distribution": salary_ranges,
    }

    with open(summary_path, "w") as f:
        json.dump(summary, f, indent=2)

    logger.info("Saved summary to %s", summary_path)
    return summary_path


def cleanup_old_files(data_dir: str = "./data", keep_days: int = 90) -> int:
    """Remove scrape files older than keep_days."""
    import time

    p = get_data_dir(data_dir)
    cutoff = time.time() - (keep_days * 86400)
    removed = 0
    for f in p.glob("scrape_*.jsonl"):
        if f.stat().st_mtime < cutoff:
            f.unlink()
            removed += 1
    if removed:
        logger.info("Cleaned up %d old files", removed)
    return removed
def save_email_config(email_config: dict, data_dir: str = "./data") -> None:
    """Save email configuration to file."""
    p = get_data_dir(data_dir)
    config_path = p / "email_config.json"
    import json
    with open(config_path, "w") as f:
        json.dump(email_config, f, indent=2)
    logger.info("Email configuration saved to %s", config_path)
def load_email_config(data_dir: str = "./data") -> dict:
    """Load email configuration from file."""
    p = get_data_dir(data_dir)
    config_path = p / "email_config.json"
    if not config_path.exists():
        return {"enabled": False, "default_email": "manjunathkhubli85@gmail.com"}

    import json
    with open(config_path) as f:
        return json.load(f)
def save_email_history(email_history: list, data_dir: str = "./data") -> None:
    """Save email history to file."""
    p = get_data_dir(data_dir)
    history_path = p / "email_history.json"
    import json
    with open(history_path, "w") as f:
        json.dump(email_history, f, indent=2)
    logger.info("Email history saved to %s", history_path)
def load_email_history(data_dir: str = "./data") -> list:
    """Load email history from file."""
    p = get_data_dir(data_dir)
    history_path = p / "email_history.json"
    if not history_path.exists():
        return []

    import json
    with open(history_path) as f:
        return json.load(f)
