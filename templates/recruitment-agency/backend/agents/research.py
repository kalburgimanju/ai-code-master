"""Company Research Agent - deep research on companies to find decision makers and hiring insights."""

import asyncio
from datetime import datetime
from typing import Any, Optional
from uuid import uuid4

from backend.agents.base import BaseAgent, AgentContext, AgentResult, LLMMixin
from backend.config import get_settings
from backend.storage import get_db_session
from backend.storage.models import Company, CompanyStage, Contact


class CompanyResearchAgent(BaseAgent, LLMMixin):
    """Agent that performs deep research on companies."""

    def __init__(self, agent_config):
        super().__init__(agent_config)
        self.settings = get_settings()
        self._apify_client = None
        self._llm_client = None

    @property
    def apify_client(self):
        if self._apify_client is None:
            from backend.services.linkedin import ApifyLinkedInClient
            self._apify_client = ApifyLinkedInClient()
        return self._apify_client

    async def run(self, context: AgentContext) -> AgentResult:
        """Run company research."""
        company_ids = context.input_data.get("company_ids", [])
        max_companies = self.agent_config.max_companies_per_run or 20

        step = self.log_step("Finding companies to research")
        await self._save_run_progress()

        if not company_ids:
            company_ids = await self._get_companies_needing_research(max_companies)

        self.complete_step_log(step, True, f"Found {len(company_ids)} companies needing research")
        await self._save_run_progress()

        results = {
            "companies_researched": 0,
            "contacts_found": 0,
            "insights_generated": 0,
            "errors": [],
        }

        total = min(len(company_ids), max_companies)
        for i, company_id in enumerate(company_ids[:max_companies]):
            step = self.log_step(f"Researching company {i+1}/{total}", f"ID: {company_id[:8]}...")
            await self._save_run_progress()

            try:
                enriched = await self._research_company(company_id)
                if enriched:
                    results["companies_researched"] += 1
                    results["contacts_found"] += len(enriched.get("contacts", []))
                    results["insights_generated"] += len(enriched.get("insights", []))
                    self.complete_step_log(step, True, f"Found {len(enriched.get('contacts', []))} contacts, {len(enriched.get('insights', []))} insights")
                else:
                    self.complete_step_log(step, True, "No new data found")
            except Exception as e:
                self.log(f"Error researching company {company_id}: {e}", "ERROR")
                results["errors"].append(f"{company_id}: {str(e)}")
                self.complete_step_log(step, False, f"Error: {e}")
            await self._save_run_progress()

        step = self.log_step("Research complete", f"Researched {results['companies_researched']} companies, found {results['contacts_found']} contacts")
        self.complete_step_log(step, True)
        await self._save_run_progress()

        return AgentResult(
            success=len(results["errors"]) == 0,
            items_processed=len(company_ids),
            items_succeeded=results["companies_researched"],
            items_failed=len(results["errors"]),
            output_data=results,
        )

    async def _get_companies_needing_research(self, limit: int) -> list[str]:
        """Get companies that haven't been researched yet."""
        from sqlalchemy import select
        from backend.storage.models import Company, CompanyStage

        async with get_db_session() as session:
            stmt = (
                select(Company.id)
                .where(
                    Company.agent_id == self.agent_config.id,
                    Company.stage.in_([CompanyStage.DISCOVERED, CompanyStage.RESEARCHED]),
                    Company.last_enriched_at.is_(None),
                )
                .order_by(Company.created_at.desc())
                .limit(limit)
            )
            result = await session.execute(stmt)
            return [row[0] for row in result.fetchall()]

    async def _research_company(self, company_id: str) -> Optional[dict]:
        """Perform deep research on a single company."""
        self.log(f"Researching company: {company_id}")

        async with get_db_session() as session:
            from sqlalchemy import select
            stmt = select(Company).where(Company.id == company_id)
            result = await session.execute(stmt)
            company = result.scalar_one_or_none()

            if not company:
                self.log(f"Company not found: {company_id}", "ERROR")
                return None

            # Research from multiple sources
            research_data = {}

            # 1. Website scraping
            if company.domain:
                website_data = await self._scrape_website(company.domain)
                research_data["website"] = website_data

            # 2. LinkedIn company page
            if company.linkedin_url:
                linkedin_data = await self._scrape_linkedin_company(company.linkedin_url)
                research_data["linkedin"] = linkedin_data

            # 3. Find decision makers
            contacts = await self._find_decision_makers(company)
            research_data["contacts"] = contacts

            # 4. Generate insights using LLM
            insights = await self._generate_insights(company, research_data)
            research_data["insights"] = insights

            # Update company with research data
            await self._update_company_research(company, research_data, session)

            # Create contacts
            for contact_data in contacts:
                await self._create_contact(company, contact_data, session)

            await session.commit()

            return research_data

    async def _scrape_website(self, domain: str) -> dict:
        """Scrape company website for tech stack, team, hiring pages."""
        try:
            # Use Apify website scraper or similar
            # For now, return mock structure
            return {
                "url": f"https://{domain}",
                "tech_stack": [],
                "team_page": None,
                "careers_page": None,
                "blog_posts": [],
                "case_studies": [],
            }
        except Exception as e:
            self.log(f"Website scrape failed for {domain}: {e}", "WARNING")
            return {}

    async def _scrape_linkedin_company(self, linkedin_url: str) -> dict:
        """Scrape LinkedIn company page."""
        try:
            data = await self.apify_client.scrape_company_page(linkedin_url)
            return data
        except Exception as e:
            self.log(f"LinkedIn scrape failed for {linkedin_url}: {e}", "WARNING")
            return {}

    async def _find_decision_makers(self, company: Company) -> list[dict]:
        """Find decision makers at the company."""
        contacts = []

        try:
            # Use Apify to search for people at the company
            if company.linkedin_url:
                people = await self.apify_client.search_people_at_company(
                    company_url=company.linkedin_url,
                    titles=["VP Engineering", "CTO", "Head of Engineering", "Engineering Manager",
                            "Director of Engineering", "VP Technology", "Technical Lead",
                            "Head of Talent", "VP People", "Recruiting Lead"],
                    max_results=10,
                )

                for person in people:
                    contacts.append({
                        "first_name": person.get("first_name", ""),
                        "last_name": person.get("last_name", ""),
                        "title": person.get("title", ""),
                        "linkedin_url": person.get("linkedin_url", ""),
                        "seniority": self._determine_seniority(person.get("title", "")),
                        "source": "linkedin_search",
                    })

        except Exception as e:
            self.log(f"Decision maker search failed for {company.name}: {e}", "WARNING")

        return contacts

    def _determine_seniority(self, title: str) -> str:
        """Determine seniority from title."""
        title_lower = title.lower()
        if any(kw in title_lower for kw in ["cto", "chief technology", "vp engineering", "vice president engineering"]):
            return "cxo"
        elif any(kw in title_lower for kw in ["director", "head of", "vp ", "vice president"]):
            return "vp"
        elif any(kw in title_lower for kw in ["manager", "lead", "principal", "staff"]):
            return "director"
        elif any(kw in title_lower for kw in ["senior", "sr."]):
            return "senior"
        return "individual"

    async def _generate_insights(self, company: Company, research_data: dict) -> list[dict]:
        """Generate insights using LLM."""
        prompt = f"""
        Analyze this company for recruitment outreach opportunities:

        Company: {company.name}
        Industry: {company.industry}
        Size: {company.employee_count} employees
        Stage: {company.funding_stage}
        Tech Stack: {company.tech_stack}
        Current Hiring Needs: {company.hiring_needs}
        Description: {company.description}

        Research Data:
        - Website: {research_data.get('website', {})}
        - LinkedIn: {research_data.get('linkedin', {})}
        - Contacts Found: {len(research_data.get('contacts', []))}

        Generate 3-5 specific insights for a technical recruiter:
        1. What are their likely hiring priorities?
        2. What technical challenges are they facing?
        3. What's their team structure likely look like?
        4. What would be a compelling value proposition?
        5. Any recent signals (funding, growth, tech changes)?

        Return as JSON array of objects with keys: type, insight, confidence (0-1), actionable (true/false)
        """

        try:
            response = await self.generate_structured(
                prompt=prompt,
                schema=list[dict],  # type: ignore
                system="You are an expert technical recruiter analyzing companies for outreach opportunities.",
                temperature=0.5,
            )
            return response if isinstance(response, list) else []
        except Exception as e:
            self.log(f"LLM insight generation failed: {e}", "WARNING")
            return []

    async def _update_company_research(self, company: Company, research_data: dict, session):
        """Update company with research findings."""
        website = research_data.get("website", {})
        linkedin = research_data.get("linkedin", {})
        insights = research_data.get("insights", [])

        # Merge tech stack
        existing_stack = set(company.tech_stack or [])
        new_stack = set(website.get("tech_stack", []) + linkedin.get("tech_stack", []))
        company.tech_stack = list(existing_stack | new_stack)

        # Merge hiring needs
        existing_needs = set(company.hiring_needs or [])
        new_needs = set(website.get("hiring_needs", []) + linkedin.get("hiring_needs", []))
        company.hiring_needs = list(existing_needs | new_needs)

        # Update other fields
        if website.get("description") and not company.description:
            company.description = website["description"]

        if linkedin.get("employee_count") and not company.employee_count:
            company.employee_count = linkedin["employee_count"]

        if linkedin.get("locations"):
            company.locations = linkedin["locations"]

        # Add insights to pain_points and growth_signals
        for insight in insights:
            if insight.get("actionable"):
                if "hiring" in insight.get("type", "").lower() or "team" in insight.get("type", "").lower():
                    company.hiring_needs.append(insight["insight"])
                elif "challenge" in insight.get("type", "").lower() or "pain" in insight.get("type", "").lower():
                    company.pain_points.append(insight["insight"])
                elif "growth" in insight.get("type", "").lower() or "signal" in insight.get("type", "").lower():
                    company.growth_signals.append(insight["insight"])

        # Deduplicate
        company.hiring_needs = list(set(company.hiring_needs or []))
        company.pain_points = list(set(company.pain_points or []))
        company.growth_signals = list(set(company.growth_signals or []))

        # Update stage
        company.stage = CompanyStage.RESEARCHED
        company.stage_updated_at = datetime.utcnow()
        company.last_enriched_at = datetime.utcnow()

    async def _create_contact(self, company: Company, contact_data: dict, session):
        """Create a contact record."""
        from sqlalchemy import select
        from backend.storage.models import Contact

        # Check if contact exists
        linkedin_url = contact_data.get("linkedin_url")
        if linkedin_url:
            stmt = select(Contact).where(
                Contact.company_id == company.id,
                Contact.linkedin_url == linkedin_url,
            )
            result = await session.execute(stmt)
            existing = result.scalar_one_or_none()
            if existing:
                return existing

        contact = Contact(
            company_id=company.id,
            first_name=contact_data.get("first_name", ""),
            last_name=contact_data.get("last_name", ""),
            full_name=f"{contact_data.get('first_name', '')} {contact_data.get('last_name', '')}".strip(),
            title=contact_data.get("title", ""),
            linkedin_url=linkedin_url,
            seniority=contact_data.get("seniority", "individual"),
            source=contact_data.get("source", "linkedin_search"),
        )
        session.add(contact)
        return contact