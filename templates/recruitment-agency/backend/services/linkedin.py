"""LinkedIn/Apify integration service for company and people search."""

import httpx
import asyncio
from datetime import datetime
from typing import Any, Optional
from uuid import uuid4

from backend.config import get_settings


class ApifyLinkedInClient:
    """Client for Apify LinkedIn actors."""

    def __init__(self):
        self.settings = get_settings()
        self.token = self.settings.apis.apify.token
        self.base_url = "https://api.apify.com/v2"
        self.headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json",
        } if self.token else {}

    async def run_actor(
        self,
        actor_id: str,
        input_data: dict,
        wait_for_finish: bool = True,
        timeout_seconds: int = 120,
    ) -> dict:
        """Run an Apify actor and wait for results."""
        if not self.token or self.settings.features.dry_run_mode:
            return self._mock_run(actor_id, input_data)

        # Start the actor run
        url = f"{self.base_url}/acts/{actor_id}/runs"
        data = {
            "input": input_data,
            "timeoutSecs": timeout_seconds,
            "memoryMbytes": self.settings.apis.apify.memory_mbytes,
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=self.headers, json=data)
            response.raise_for_status()
            run = response.json().get("data", {})

            if not wait_for_finish:
                return run

            # Poll for completion
            run_id = run.get("id")
            start_time = datetime.utcnow()

            while True:
                if (datetime.utcnow() - start_time).seconds > timeout_seconds:
                    raise TimeoutError(f"Actor run {run_id} timed out")

                await asyncio.sleep(5)

                status_url = f"{self.base_url}/actor-runs/{run_id}"
                response = await client.get(status_url, headers=self.headers)
                response.raise_for_status()
                run_data = response.json().get("data", {})

                status = run_data.get("status")
                if status == "SUCCEEDED":
                    # Get results
                    dataset_id = run_data.get("defaultDatasetId")
                    if dataset_id:
                        items_url = f"{self.base_url}/datasets/{dataset_id}/items"
                        response = await client.get(items_url, headers=self.headers)
                        response.raise_for_status()
                        return {"items": response.json(), "run": run_data}
                    return run_data

                elif status in ["FAILED", "ABORTED", "TIMED-OUT"]:
                    raise Exception(f"Actor run failed with status: {status}")

    def _mock_run(self, actor_id: str, input_data: dict) -> dict:
        """Mock actor run for testing."""
        print(f"[MOCK APIFY] Running actor: {actor_id}")
        print(f"[MOCK APIFY] Input: {input_data}")

        if "linkedin-jobs-scraper" in actor_id:
            return {"items": self._mock_jobs(), "run": {"status": "SUCCEEDED"}}
        elif "linkedin-company-scraper" in actor_id:
            return {"items": self._mock_companies(), "run": {"status": "SUCCEEDED"}}
        elif "linkedin-people-search" in actor_id:
            return {"items": self._mock_people(), "run": {"status": "SUCCEEDED"}}
        return {"items": [], "run": {"status": "SUCCEEDED"}}

    def _mock_jobs(self) -> list[dict]:
        """Mock job data."""
        return [
            {
                "id": "job_1",
                "title": "Senior Backend Engineer",
                "companyName": "TechCorp Inc",
                "companyUrl": "https://linkedin.com/company/techcorp",
                "location": "San Francisco, CA",
                "isRemote": True,
                "description": "We are looking for a Senior Backend Engineer...",
                "postedAt": "2024-01-15T10:00:00Z",
                "salaryMin": 150000,
                "salaryMax": 220000,
                "applicantCount": 15,
                "skills": ["Python", "Go", "AWS", "Kubernetes", "PostgreSQL"],
                "jobUrl": "https://linkedin.com/jobs/view/123",
            },
        ]

    def _mock_companies(self) -> list[dict]:
        """Mock company data."""
        return [
            {
                "id": "company_1",
                "name": "TechCorp Inc",
                "domain": "techcorp.com",
                "linkedinUrl": "https://linkedin.com/company/techcorp",
                "description": "Leading SaaS platform for developer tools",
                "industry": "Computer Software",
                "specialties": ["SaaS", "Developer Tools", "API", "Cloud"],
                "employeeCount": 150,
                "employeeCountRange": "51-200",
                "headquarters": "San Francisco, CA, US",
                "locations": ["San Francisco, CA", "New York, NY", "Remote"],
                "foundedYear": 2019,
                "fundingStage": "Series B",
                "totalFunding": 45000000,
                "lastFundingDate": "2023-11-15",
                "lastFundingAmount": 25000000,
                "investors": ["Sequoia", "Andreessen Horowitz"],
                "website": "https://techcorp.com",
                "techStack": ["React", "Node.js", "Python", "PostgreSQL", "AWS", "Kubernetes"],
                "openPositions": 12,
                "hiringSignals": ["engineering", "backend", "platform", "infrastructure"],
            },
        ]

    def _mock_people(self) -> list[dict]:
        """Mock people data."""
        return [
            {
                "id": "person_1",
                "firstName": "Sarah",
                "lastName": "Chen",
                "fullName": "Sarah Chen",
                "title": "VP of Engineering",
                "companyName": "TechCorp Inc",
                "companyUrl": "https://linkedin.com/company/techcorp",
                "linkedinUrl": "https://linkedin.com/in/sarahchen",
                "location": "San Francisco Bay Area",
                "skills": ["Engineering Leadership", "Platform Engineering", "Distributed Systems", "Team Building"],
                "experience": [
                    {"title": "VP of Engineering", "company": "TechCorp Inc", "duration": "2022-present"},
                    {"title": "Engineering Director", "company": "StartupXYZ", "duration": "2019-2022"},
                ],
            },
        ]

    async def search_companies(
        self,
        query: str,
        max_results: int = 50,
    ) -> list[dict]:
        """Search for companies using Apify LinkedIn Company Scraper."""
        actor_id = self.settings.apis.apify.linkedin_company_actor
        input_data = {
            "searchQuery": query,
            "maxResults": max_results,
            "proxyConfig": {"useApifyProxy": True},
        }

        result = await self.run_actor(actor_id, input_data)
        return result.get("items", [])

    async def scrape_company_page(self, company_url: str) -> dict:
        """Scrape a specific LinkedIn company page."""
        actor_id = self.settings.apis.apify.linkedin_company_actor
        input_data = {
            "startUrls": [{"url": company_url}],
            "maxResults": 1,
            "proxyConfig": {"useApifyProxy": True},
        }

        result = await self.run_actor(actor_id, input_data)
        items = result.get("items", [])
        return items[0] if items else {}

    async def search_people_at_company(
        self,
        company_url: str,
        titles: list[str],
        max_results: int = 20,
    ) -> list[dict]:
        """Search for people at a specific company."""
        actor_id = self.settings.apis.apify.linkedin_people_actor
        input_data = {
            "companyUrl": company_url,
            "keywords": titles,
            "maxResults": max_results,
            "proxyConfig": {"useApifyProxy": True},
        }

        result = await self.run_actor(actor_id, input_data)
        return result.get("items", [])

    async def search_jobs(
        self,
        query: str,
        location: str = "United States",
        max_results: int = 50,
        remote_only: bool = True,
    ) -> list[dict]:
        """Search for jobs using Apify LinkedIn Jobs Scraper."""
        actor_id = self.settings.apis.apify.linkedin_jobs_actor
        input_data = {
            "searchQuery": query,
            "location": location,
            "remoteOnly": remote_only,
            "maxResults": max_results,
            "proxyConfig": {"useApifyProxy": True},
        }

        result = await self.run_actor(actor_id, input_data)
        return result.get("items", [])


class CrunchbaseClient:
    """Client for Crunchbase API."""

    def __init__(self):
        self.settings = get_settings()
        self.api_key = self.settings.apis.crunchbase.api_key
        self.base_url = self.settings.apis.crunchbase.base_url
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        } if self.api_key else {}

    async def search_companies(
        self,
        industries: list[str],
        locations: list[str],
        funding_stages: list[str],
        max_results: int = 50,
    ) -> list[dict]:
        """Search companies on Crunchbase."""
        if not self.api_key or self.settings.features.dry_run_mode:
            return self._mock_companies(industries, locations, funding_stages, max_results)

        # Build query
        query_parts = []
        if industries:
            query_parts.append(f"categories:({' OR '.join(industries)})")
        if locations:
            query_parts.append(f"location:({' OR '.join(locations)})")
        if funding_stages:
            query_parts.append(f"funding_stage:({' OR '.join(funding_stages)})")

        query = " AND ".join(query_parts) if query_parts else "*"

        url = f"{self.base_url}/entities/organizations"
        params = {
            "query": query,
            "limit": max_results,
            "field_ids": [
                "identifier", "name", "website_url", "linkedin_url",
                "categories", "location_identifiers", "num_employees_enum",
                "funding_stage", "funding_total_usd", "last_funding_at",
                "last_funding_amount_usd", "investors", "short_description",
            ],
        }

        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=self.headers, params=params)
            response.raise_for_status()
            data = response.json()
            return data.get("entities", [])

    def _mock_companies(
        self,
        industries: list[str],
        locations: list[str],
        funding_stages: list[str],
        max_results: int,
    ) -> list[dict]:
        """Mock Crunchbase companies."""
        print(f"[MOCK CRUNCHBASE] Searching: industries={industries}, locations={locations}, stages={funding_stages}")
        return [
            {
                "identifier": {"uuid": "cb_1", "entity_def_id": "organization"},
                "properties": {
                    "name": "FinTech Solutions Inc",
                    "website_url": "https://fintechsolutions.com",
                    "linkedin_url": "https://linkedin.com/company/fintech-solutions",
                    "categories": ["Financial Technology", "Software"],
                    "location_identifiers": [{"value": "San Francisco, California, United States"}],
                    "num_employees_enum": "101-250",
                    "funding_stage": "series_b",
                    "funding_total_usd": 35000000,
                    "last_funding_at": "2023-10-01",
                    "last_funding_amount_usd": 20000000,
                    "short_description": "Next-gen payment processing platform",
                },
            },
        ]

    async def get_company_details(self, uuid: str) -> dict:
        """Get detailed company information."""
        if not self.api_key:
            return {}

        url = f"{self.base_url}/entities/organizations/{uuid}"
        params = {
            "field_ids": [
                "identifier", "name", "website_url", "linkedin_url", "twitter_url",
                "categories", "location_identifiers", "num_employees_enum",
                "funding_stage", "funding_total_usd", "last_funding_at",
                "last_funding_amount_usd", "investors", "short_description",
                "long_description", "founded_on", "ipo_status", "operating_status",
            ],
        }

        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=self.headers, params=params)
            response.raise_for_status()
            return response.json()