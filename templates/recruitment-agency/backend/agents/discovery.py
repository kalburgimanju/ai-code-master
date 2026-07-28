"""Company Discovery Agent - finds qualified companies for recruitment outreach."""

import asyncio
from datetime import datetime
from typing import Any, Optional
from uuid import uuid4

from backend.agents.base import BaseAgent, AgentContext, AgentResult
from backend.config import get_settings
from backend.storage import get_db_session
from backend.storage.models import Company, CompanyStage, AgentConfig


class CompanyDiscoveryAgent(BaseAgent):
    """Agent that discovers qualified companies for recruitment outreach."""

    def __init__(self, agent_config: AgentConfig):
        super().__init__(agent_config)
        self.settings = get_settings()
        self._apify_client = None

    @property
    def apify_client(self):
        if self._apify_client is None:
            from backend.services.linkedin import ApifyLinkedInClient
            self._apify_client = ApifyLinkedInClient()
        return self._apify_client

    async def run(self, context: AgentContext) -> AgentResult:
        """Run company discovery."""
        results = {
            "companies_found": 0,
            "companies_new": 0,
            "companies_existing": 0,
            "sources_used": [],
            "errors": [],
        }

        max_companies = self.agent_config.max_companies_per_run
        industries = self.agent_config.discovery_industries or self.settings.agents.discovery.filters.get("industries", [])
        company_size = self.agent_config.discovery_company_size or self.settings.agents.discovery.filters.get("company_size", "10-500")
        locations = self.agent_config.discovery_locations or self.settings.agents.discovery.filters.get("locations", ["US", "Remote"])
        funding_stages = self.agent_config.discovery_funding_stages or self.settings.agents.discovery.filters.get("funding_stage", ["Series A", "Series B", "Series C"])
        hiring_signals = self.agent_config.discovery_hiring_signals or self.settings.agents.discovery.filters.get("hiring_signals", [])

        step = self.log_step("Initializing discovery", f"Industries: {', '.join(industries[:3])}... | Size: {company_size}")
        await self._save_run_progress()

        self.log(f"Discovering companies: industries={industries}, size={company_size}, locations={locations}")
        self.complete_step_log(step, True, f"Filters set: {len(industries)} industries, {len(locations)} locations")
        await self._save_run_progress()

        # Run discovery from each source
        sources = self.settings.agents.discovery.sources
        for i, source in enumerate(sources):
            step = self.log_step(f"Searching {source}", f"Source {i+1}/{len(sources)}: {source}")
            await self._save_run_progress()

            try:
                if source == "apify_linkedin":
                    companies = await self._discover_from_linkedin(
                        industries, company_size, locations, funding_stages, hiring_signals, max_companies
                    )
                elif source == "crunchbase":
                    companies = await self._discover_from_crunchbase(
                        industries, company_size, locations, funding_stages, max_companies
                    )
                else:
                    self.log(f"Unknown source: {source}", "WARNING")
                    self.complete_step_log(step, False, f"Unknown source: {source}")
                    await self._save_run_progress()
                    continue

                results["sources_used"].append(source)
                results["companies_found"] += len(companies)

                # Save companies
                new_count = 0
                existing_count = 0
                for company_data in companies:
                    saved = await self._save_company(company_data, source)
                    if saved:
                        new_count += 1
                        results["companies_new"] += 1
                    else:
                        existing_count += 1
                        results["companies_existing"] += 1

                self.complete_step_log(step, True, f"Found {len(companies)} companies ({new_count} new, {existing_count} existing)")
                await self._save_run_progress()

            except Exception as e:
                self.log(f"Error discovering from {source}: {e}", "ERROR")
                results["errors"].append(f"{source}: {str(e)}")
                self.complete_step_log(step, False, f"Error: {e}")
                await self._save_run_progress()

        step = self.log_step("Discovery complete", f"Total: {results['companies_found']} found, {results['companies_new']} new")
        self.complete_step_log(step, True)
        await self._save_run_progress()

        return AgentResult(
            success=len(results["errors"]) == 0,
            items_processed=results["companies_found"],
            items_succeeded=results["companies_new"],
            items_failed=len(results["errors"]),
            output_data=results,
        )

    async def _discover_from_linkedin(
        self,
        industries: list[str],
        company_size: str,
        locations: list[str],
        funding_stages: list[str],
        hiring_signals: list[str],
        max_companies: int,
    ) -> list[dict]:
        """Discover companies using Apify LinkedIn Company Scraper."""
        # Build search queries
        queries = self._build_linkedin_queries(industries, hiring_signals, locations)

        all_companies = []
        for query in queries:
            if len(all_companies) >= max_companies:
                break

            try:
                companies = await self.apify_client.search_companies(
                    query=query,
                    max_results=min(50, max_companies - len(all_companies)),
                )
                all_companies.extend(companies)
            except Exception as e:
                self.log(f"LinkedIn search failed for query '{query}': {e}", "ERROR")

        # Deduplicate by domain
        seen_domains = set()
        unique_companies = []
        for company in all_companies:
            domain = company.get("domain", "").lower()
            if domain and domain not in seen_domains:
                seen_domains.add(domain)
                unique_companies.append(company)

        return unique_companies[:max_companies]

    def _build_linkedin_queries(
        self,
        industries: list[str],
        hiring_signals: list[str],
        locations: list[str],
    ) -> list[str]:
        """Build LinkedIn search queries."""
        queries = []

        # Industry + hiring signal combinations
        for industry in industries[:5]:  # Limit to top 5 industries
            for signal in hiring_signals[:3]:  # Top 3 signals
                query = f"{industry} {signal} hiring"
                queries.append(query)

        # Industry + location combinations
        for industry in industries[:3]:
            for location in locations[:2]:
                query = f"{industry} companies {location}"
                queries.append(query)

        # Fallback generic queries
        if not queries:
            queries = [
                "SaaS hiring engineers",
                "Fintech hiring backend",
                "AI ML hiring",
                "Series A hiring",
                "Series B hiring",
            ]

        return queries[:10]  # Limit total queries

    async def _discover_from_crunchbase(
        self,
        industries: list[str],
        company_size: str,
        locations: list[str],
        funding_stages: list[str],
        max_companies: int,
    ) -> list[dict]:
        """Discover companies using Crunchbase."""
        try:
            from backend.services.linkedin import CrunchbaseClient
            client = CrunchbaseClient()

            companies = await client.search_companies(
                industries=industries,
                locations=locations,
                funding_stages=funding_stages,
                max_results=max_companies,
            )
            return companies
        except Exception as e:
            self.log(f"Crunchbase discovery failed: {e}", "ERROR")
            return []

    async def _save_company(self, company_data: dict, source: str) -> bool:
        """Save or update a company in the database."""
        domain = company_data.get("domain", "").lower()
        name = company_data.get("name", "").strip()

        if not name:
            return False

        async with get_db_session() as session:
            # Check if company exists
            existing = None
            if domain:
                from sqlalchemy import select
                stmt = select(Company).where(Company.domain == domain)
                result = await session.execute(stmt)
                existing = result.scalar_one_or_none()

            if not existing and name:
                # Try by name
                stmt = select(Company).where(Company.name == name)
                result = await session.execute(stmt)
                existing = result.scalar_one_or_none()

            if existing:
                # Update existing company with new data
                self._update_company(existing, company_data, source)
                existing.updated_at = datetime.utcnow()
                return False
            else:
                # Create new company
                company = self._create_company(company_data, source)
                session.add(company)
                await session.flush()
                return True

    def _create_company(self, data: dict, source: str) -> Company:
        """Create a new Company from scraped data."""
        return Company(
            name=data.get("name", ""),
            domain=data.get("domain"),
            linkedin_url=data.get("linkedin_url"),
            crunchbase_url=data.get("crunchbase_url"),
            description=data.get("description"),
            industry=data.get("industry"),
            sub_industry=data.get("sub_industry"),
            employee_count=data.get("employee_count"),
            employee_count_range=data.get("employee_count_range"),
            headquarters=data.get("headquarters"),
            locations=data.get("locations", []),
            remote_friendly=data.get("remote_friendly", False),
            funding_stage=data.get("funding_stage"),
            total_funding_usd=data.get("total_funding_usd"),
            last_funding_date=data.get("last_funding_date"),
            last_funding_amount_usd=data.get("last_funding_amount_usd"),
            investors=data.get("investors", []),
            tech_stack=data.get("tech_stack", []),
            hiring_needs=data.get("hiring_needs", []),
            open_positions_count=data.get("open_positions_count", 0),
            hiring_signals=data.get("hiring_signals", []),
            pain_points=data.get("pain_points", []),
            growth_signals=data.get("growth_signals", []),
            competitors=data.get("competitors", []),
            recent_news=data.get("recent_news", []),
            glassdoor_rating=data.get("glassdoor_rating"),
            github_org=data.get("github_org"),
            stage=CompanyStage.DISCOVERED,
            source=source,
            confidence_score=data.get("confidence_score", 0.5),
            tags=data.get("tags", []),
            agent_id=self.agent_config.id,
        )

    def _update_company(self, company: Company, data: dict, source: str):
        """Update existing company with new data."""
        # Only update fields that have new data
        updates = {
            "linkedin_url": data.get("linkedin_url"),
            "crunchbase_url": data.get("crunchbase_url"),
            "description": data.get("description"),
            "industry": data.get("industry"),
            "sub_industry": data.get("sub_industry"),
            "employee_count": data.get("employee_count"),
            "employee_count_range": data.get("employee_count_range"),
            "headquarters": data.get("headquarters"),
            "locations": data.get("locations"),
            "remote_friendly": data.get("remote_friendly"),
            "funding_stage": data.get("funding_stage"),
            "total_funding_usd": data.get("total_funding_usd"),
            "last_funding_date": data.get("last_funding_date"),
            "last_funding_amount_usd": data.get("last_funding_amount_usd"),
            "investors": data.get("investors"),
            "tech_stack": data.get("tech_stack"),
            "hiring_needs": data.get("hiring_needs"),
            "open_positions_count": data.get("open_positions_count", 0),
            "hiring_signals": data.get("hiring_signals"),
            "pain_points": data.get("pain_points"),
            "growth_signals": data.get("growth_signals"),
            "competitors": data.get("competitors"),
            "recent_news": data.get("recent_news"),
            "glassdoor_rating": data.get("glassdoor_rating"),
            "github_org": data.get("github_org"),
            "confidence_score": max(company.confidence_score, data.get("confidence_score", 0.5)),
        }

        for field, value in updates.items():
            if value is not None:
                setattr(company, field, value)

        # Update source if new source has higher confidence
        if data.get("confidence_score", 0) > company.confidence_score:
            company.source = source