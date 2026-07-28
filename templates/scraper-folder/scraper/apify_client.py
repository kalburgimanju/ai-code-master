"""Apify API client for running LinkedIn Jobs scraper."""

from __future__ import annotations

import hashlib
import logging
import time

import httpx

from scraper.config import ApifyConfig, Settings
from scraper.filters import (
    check_expat_friendly,
    check_relocation_support,
    check_visa_sponsorship,
    extract_skills,
    is_ai_automation,
    is_contractor_friendly,
    parse_date,
    parse_salary,
)
from scraper.models import Job, JobType, Salary

logger = logging.getLogger(__name__)

APIFY_API_BASE = "https://api.apify.com/v2"
# Actor: flash_scraper/linkedin-jobs-scraper
# - $5/1000 results, free plan works for testing
# - Built-in filters: requireSalary, minSalary, maxApplicants, remote
ACTOR_ID = "flash_scraper~linkedin-jobs-scraper"


class ApifyClient:
    """Client for interacting with Apify API."""

    def __init__(self, settings: Settings, apify_config: ApifyConfig, test_mode: bool = False, test_data_path: str = "") -> None:
        self.token = settings.apify_api_token
        self.config = apify_config
        self.base_url = APIFY_API_BASE
        self.test_mode = test_mode
        self.test_data_path = test_data_path

        if not self.token and not self.test_mode:
            raise ValueError("APIFY_API_TOKEN is required. Set it in .env file.")

    def run_linkedin_search(
        self,
        query: str,
        location: str = "United States",
        max_items: int = 100,
        tracked_skills: list[str] | None = None,
    ) -> list[Job]:
        """
        Run the LinkedIn Jobs scraper actor via Apify or use test data in test mode.

        Uses the flash_scraper actor with built-in salary and applicant filters.
        In test mode, returns mock data for validation.
        """
        if self.test_mode and self.test_data_path:
            return self._load_test_data()

        url = f"{self.base_url}/acts/{ACTOR_ID}/runs"

        payload = {
            "searchQueries": [query],
            "location": location,
            "maxItems": max_items,
            "remote": ["2"],  # Remote only
            "datePosted": "r2592000",  # Last 30 days
            "proxyConfiguration": {"useApifyProxy": True},
        }

        params = {"token": self.token}

        logger.info("Starting Apify run: actor=%s query='%s' location='%s'", ACTOR_ID, query, location)

        # Start the run
        with httpx.Client(timeout=30.0) as client:
            resp = client.post(url, json=payload, params=params)
            resp.raise_for_status()
            run_data = resp.json()["data"]
            run_id = run_data["id"]
            logger.info("Run started: id=%s", run_id)

        # Poll for completion
        status_url = f"{self.base_url}/actor-runs/{run_id}"
        start = time.monotonic()
        timeout = self.config.timeout_secs

        with httpx.Client(timeout=30.0) as client:
            while time.monotonic() - start < timeout:
                resp = client.get(status_url, params=params)
                resp.raise_for_status()
                run_info = resp.json()["data"]
                status = run_info.get("status", "")
                logger.debug("Run %s status: %s", run_id, status)
                if status == "SUCCEEDED":
                    dataset_id = run_info.get("defaultDatasetId")
                    if not dataset_id:
                        logger.warning("Run succeeded but no dataset ID found")
                        return []
                    return self._fetch_dataset(dataset_id, query, tracked_skills or [])
                if status in ("FAILED", "ABORTED", "TIMED-OUT"):
                    logger.error("Run %s failed with status: %s", run_id, status)
                    return []
                time.sleep(5)

        logger.error("Run %s timed out after %ds", run_id, timeout)
        return []

    def _load_test_data(self) -> list[Job]:
        """
        Load test data from JSON file for testing purposes.
        This method is used when test_mode is enabled and helps validate
        the scraper functionality without requiring API calls.
        """
        import json
        from pathlib import Path

        try:
            data_path = Path(self.test_data_path)
            if not data_path.exists():
                logger.warning("Test data file not found: %s", self.test_data_path)
                return []

            with open(data_path) as f:
                test_items = json.load(f)

            jobs = []
            for item in test_items:
                job = self._parse_item(item, "test_query", [])
                if job:
                    jobs.append(job)

            logger.info("Loaded %d test jobs from %s", len(jobs), self.test_data_path)
            return jobs

        except Exception as e:
            logger.error("Failed to load test data: %s", e)
            return []

    def _fetch_dataset(self, dataset_id: str, query: str, tracked_skills: list[str]) -> list[Job]:
        """Fetch items from an Apify dataset and parse into Job objects."""
        url = f"{self.base_url}/datasets/{dataset_id}/items"
        params = {"format": "json", "token": self.token}

        with httpx.Client(timeout=60.0) as client:
            resp = client.get(url, params=params)
            resp.raise_for_status()
            items = resp.json()

        jobs = []
        for item in items:
            job = self._parse_item(item, query, tracked_skills)
            if job:
                jobs.append(job)
        logger.info("Parsed %d jobs from dataset %s", len(jobs), dataset_id)
        return jobs

    def _parse_item(self, item: dict, query: str, tracked_skills: list[str]) -> Job | None:
        """Parse a single Apify result item into a Job model."""
        try:
            # flash_scraper fields: jobTitle, companyName, jobUrl, descriptionText,
            # salaryMin, salaryMax, applicants, isRemote, applyUrl, postedDate
            title = item.get("jobTitle", item.get("title", ""))
            company = item.get("companyName", item.get("company", ""))
            location = item.get("location", "")
            url = item.get("jobUrl", item.get("url", item.get("applyUrl", "")))
            description = item.get("descriptionText", item.get("description", item.get("snippet", "")))

            # Salary: flash_scraper provides salaryMin/salaryMax directly
            salary_min = item.get("salaryMin")
            salary_max = item.get("salaryMax")
            if salary_min or salary_max:
                salary = Salary(min_amount=int(salary_min) if salary_min else None, max_amount=int(salary_max) if salary_max else None)
            else:
                raw_salary = item.get("salary", item.get("salaryInfo", None))
                salary = parse_salary(raw_salary)

            # Applicant count
            raw_applicants = item.get("applicants", item.get("applicantsCount", item.get("applicantCount", None)))
            applicant_count = None
            if raw_applicants is not None:
                try:
                    applicant_count = int(raw_applicants)
                except (ValueError, TypeError):
                    applicant_count = None

            # Date
            raw_date = item.get("postedDate", item.get("postedAt", None))
            posted_date = parse_date(str(raw_date) if raw_date else None)

            # Job type
            job_type_raw = item.get("employmentType", item.get("jobType", ""))
            job_type = JobType.UNKNOWN
            if job_type_raw:
                jt = str(job_type_raw).lower().replace("-", "_").replace(" ", "_")
                if jt in JobType.__members__:
                    job_type = JobType[jt.upper()]

            if not title or not company:
                return None

            job_id = hashlib.md5(f"{company}:{title}:{url}".encode()).hexdigest()[:12]

            # Remote: check boolean field first, then text matching
            is_remote_flag = item.get("isRemote")
            if isinstance(is_remote_flag, bool):
                is_remote = is_remote_flag
            else:
                is_remote = any(
                    kw in f"{title} {location} {description}".lower()
                    for kw in ["remote", "work from home", "wfh", "distributed", "anywhere"]
                )

            skills = extract_skills(description, tracked_skills)

            return Job(
                id=job_id,
                title=title,
                company=company,
                location=location,
                url=url,
                description=description[:5000],
                salary=salary,
                job_type=job_type,
                is_remote=is_remote,
                applicant_count=applicant_count,
                posted_date=posted_date,
                is_contractor_friendly=is_contractor_friendly(title, description),
                is_ai_automation=is_ai_automation(title, description),
                has_visa_sponsorship=check_visa_sponsorship(title, description),
                has_relocation_support=check_relocation_support(title, description),
                is_expat_friendly=check_expat_friendly(location, title, description),
                query_used=query,
                skills=skills,
            )
        except Exception as e:
            logger.warning("Failed to parse item: %s", e)
            return None
