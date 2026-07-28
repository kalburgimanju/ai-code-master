"""Main scraper orchestrator — runs queries, filters, and stores results."""

from __future__ import annotations

import logging
import uuid
from datetime import datetime

from scraper.apify_client import ApifyClient
from scraper.config import AppConfig
from scraper.filters import extract_skills, filter_job, score_job
from scraper.models import Job, ScrapeResult
from scraper.storage import (
    cleanup_old_files,
    load_all_jobs,
    save_dashboard_json,
    save_job_summary,
    save_scrape_result,
)

logger = logging.getLogger(__name__)


class Scraper:
    """Orchestrates the job scraping pipeline."""

    def __init__(self, config: AppConfig) -> None:
        self.config = config
        self.client = ApifyClient(
            config.settings,
            config.apify,
            test_mode=config.settings.test_mode,
            test_data_path=config.settings.test_data_path,
        )

    def run(self) -> ScrapeResult:
        """Execute a full scrape run: query → parse → filter → score → store."""
        run_id = uuid.uuid4().hex[:8]
        started_at = datetime.now()
        logger.info("Starting scrape run %s", run_id)

        all_jobs: list[Job] = []
        queries_used: list[str] = []

        # Run each query
        for query in self.config.search.queries:
            logger.info("Running query: %s", query)
            try:
                jobs = self.client.run_linkedin_search(
                    query=query,
                    location=self.config.search.location,
                    max_items=self.config.apify.max_items,
                    tracked_skills=self.config.tracked_skills,
                )
                all_jobs.extend(jobs)
                queries_used.append(query)
                logger.info("Query '%s' returned %d jobs", query, len(jobs))
            except Exception as e:
                logger.error("Query '%s' failed: %s", query, e)

        # Deduplicate
        seen = set()
        unique_jobs = []
        for job in all_jobs:
            if job.id not in seen:
                seen.add(job.id)
                unique_jobs.append(job)
        logger.info("Total unique jobs: %d (from %d total)", len(unique_jobs), len(all_jobs))

        # Filter
        passed_jobs = []
        filter_counts = {}
        for job in unique_jobs:
            passed, reason = filter_job(
                job, self.config.filters, self.config.tracked_skills
            )
            filter_counts[reason] = filter_counts.get(reason, 0) + 1
            if passed:
                # Score the job
                job._score = score_job(job, self.config.tracked_skills)
                passed_jobs.append(job)

        logger.info("Filter results: %s", filter_counts)

        # Sort by score descending
        passed_jobs.sort(key=lambda j: getattr(j, "_score", 0), reverse=True)

        finished_at = datetime.now()

        result = ScrapeResult(
            run_id=run_id,
            started_at=started_at,
            finished_at=finished_at,
            total_scraped=len(unique_jobs),
            total_filtered=len(passed_jobs),
            jobs=passed_jobs,
            queries_used=queries_used,
            cost_estimate=self._estimate_cost(len(queries_used)),
        )

        # Store results
        save_scrape_result(result, self.config.settings.data_dir)
        save_job_summary(passed_jobs, self.config.settings.data_dir)
        # Write dashboard.json with ALL jobs (across all scrape runs) for the React frontend
        all_stored_jobs = load_all_jobs(self.config.settings.data_dir)
        save_dashboard_json(all_stored_jobs, self.config.settings.data_dir)
        cleanup_old_files(self.config.settings.data_dir)

        # Upload to Google Drive if enabled
        self._upload_to_drive()

        logger.info(
            "Scrape run %s complete: %d scraped → %d filtered (est. $%.2f)",
            run_id,
            result.total_scraped,
            result.total_filtered,
            result.cost_estimate,
        )
        return result

    def _upload_to_drive(self) -> None:
        """Upload latest export files to Google Drive and send email if enabled."""
        if not getattr(self.config, "google_drive", None):
            return
        if not self.config.google_drive.enabled:
            return

        try:
            from scraper.gdrive import upload_latest_exports
            upload_latest_exports(self.config)
            logger.info("Successfully uploaded exports to Google Drive")
        except Exception as e:
            logger.error("Failed to upload to Google Drive: %s", e)
            return

    def _send_email_if_enabled(self, scrape_result: Any) -> None:
        """Send email notification if email is enabled in config."""
        if not getattr(self.config, "email", None):
            return
        if not self.config.email.enabled:
            return

        try:
            from scraper.mailer import send_scrape_notification
            from scraper.storage import load_email_config, save_email_config, load_email_history, save_email_history

            # Load email config
            email_config = load_email_config(self.config.settings.data_dir)

            # Create a config object for the mailer
            class MailerConfig:
                pass
            mailer_config = MailerConfig()

            for key, value in email_config.items():
                if key == "smtp_port":
                    value = int(value)
                setattr(mailer_config, key, value)

            email_id = send_scrape_notification(
                mailer_config,
                scrape_result.jobs,
                scrape_result,
                "latest"
            )

            # Save email history
            if email_id and hasattr(self.config, "email"):
                from scraper.config import EmailHistory
                email_history_entry = EmailHistory(
                    id=email_id,
                    email_address=mailer_config.default_email,
                    timestamp=datetime.now().isoformat(),
                    recipient_count=1,
                    job_count=len(scrape_result.jobs),
                    filename=f"export_jobs_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv",
                    status="sent"
                )

                # Load existing history and add new entry
                existing_history = load_email_history(self.config.settings.data_dir)
                existing_history.append(email_history_entry.model_dump())

                save_email_history(existing_history, self.config.settings.data_dir)

        except Exception as e:
            logger.error("Failed to send email notification: %s", e)

    def get_latest_jobs(self) -> list[Job]:
        """Load all previously scraped jobs."""
        return load_all_jobs(self.config.settings.data_dir)

    def get_top_jobs(self, n: int = 15) -> list[Job]:
        """Get top N jobs sorted by fewest applicants and highest salary."""
        jobs = self.get_latest_jobs()
        return sorted(
            jobs,
            key=lambda j: (
                j.applicant_count or 999,
                -(j.salary.min_amount or 0),
            ),
        )[:n]

    @staticmethod
    def _estimate_cost(num_queries: int) -> float:
        """Estimate Apify API cost in USD. Approx $0.005 per query + compute."""
        return num_queries * 0.05 + 0.10  # rough estimate: ~$0.05 per query run
