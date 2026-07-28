"""Outreach Agent - sends personalized emails to decision makers."""

import asyncio
from datetime import datetime, timedelta
from typing import Any, Optional
from uuid import uuid4

from backend.agents.base import BaseAgent, AgentContext, AgentResult, LLMMixin
from backend.config import get_settings
from backend.storage import get_db_session
from backend.storage.models import (
    Company,
    CompanyStage,
    Contact,
    EmailLog,
    EmailStatus,
    OutreachCampaign,
    CampaignStatus,
)


class OutreachAgent(BaseAgent, LLMMixin):
    """Agent that sends personalized outreach emails."""

    def __init__(self, agent_config):
        super().__init__(agent_config)
        self.settings = get_settings()
        self._llm_client = None
        self._email_service = None
        self._daily_sent = 0
        self._last_reset = datetime.utcnow().date()

    @property
    def email_service(self):
        if self._email_service is None:
            from backend.services.email import EmailService
            self._email_service = EmailService()
        return self._email_service

    async def run(self, context: AgentContext) -> AgentResult:
        """Run outreach campaign."""
        campaign_id = context.input_data.get("campaign_id")
        company_ids = context.input_data.get("company_ids", [])
        contact_ids = context.input_data.get("contact_ids", [])
        dry_run = context.input_data.get("dry_run", self.settings.features.dry_run_mode)

        step = self.log_step("Initializing outreach", f"Mode: {'dry_run' if dry_run else 'live'}")
        await self._save_run_progress()
        self.complete_step_log(step, True)
        await self._save_run_progress()

        if campaign_id:
            return await self._run_campaign(campaign_id, dry_run)
        elif company_ids or contact_ids:
            return await self._run_adhoc(company_ids, contact_ids, dry_run)
        else:
            return await self._run_pending_campaigns(dry_run)

    async def _run_campaign(self, campaign_id: str, dry_run: bool) -> AgentResult:
        """Execute a specific campaign."""
        async with get_db_session() as session:
            from sqlalchemy import select
            stmt = select(OutreachCampaign).where(OutreachCampaign.id == campaign_id)
            result = await session.execute(stmt)
            campaign = result.scalar_one_or_none()

            if not campaign:
                return AgentResult(success=False, error_message=f"Campaign not found: {campaign_id}")

            if campaign.status not in [CampaignStatus.DRAFT, CampaignStatus.SCHEDULED, CampaignStatus.RUNNING]:
                return AgentResult(success=False, error_message=f"Campaign not runnable: {campaign.status}")

            # Update campaign status
            campaign.status = CampaignStatus.RUNNING
            campaign.started_at = campaign.started_at or datetime.utcnow()
            await session.commit()

        # Get targets
        targets = await self._get_campaign_targets(campaign)
        results = {"emails_sent": 0, "emails_failed": 0, "skipped": 0, "errors": []}

        step = self.log_step("Processing targets", f"Found {len(targets)} targets for campaign")
        await self._save_run_progress()
        self.complete_step_log(step, True, f"{len(targets)} targets identified")
        await self._save_run_progress()

        for i, target in enumerate(targets):
            if self._daily_sent >= self.agent_config.outreach_daily_limit:
                self.log(f"Daily limit reached: {self._daily_sent}", "WARNING")
                break

            contact_name = target["contact"].full_name
            company_name = target["company"].name
            step = self.log_step(f"Sending email {i+1}/{len(targets)}", f"To: {contact_name} at {company_name}")
            await self._save_run_progress()

            try:
                success = await self._send_outreach_email(
                    campaign=campaign,
                    company=target["company"],
                    contact=target["contact"],
                    dry_run=dry_run,
                )
                if success:
                    results["emails_sent"] += 1
                    self.complete_step_log(step, True, f"Email sent to {contact_name}")
                else:
                    results["emails_failed"] += 1
                    self.complete_step_log(step, False, f"Failed to send to {contact_name}")
            except Exception as e:
                results["errors"].append(f"{target['contact'].id}: {str(e)}")
                results["emails_failed"] += 1
                self.complete_step_log(step, False, f"Error: {e}")
            await self._save_run_progress()

            # Delay between emails
            await asyncio.sleep(self.agent_config.outreach_delay_seconds / 1000)

        # Update campaign metrics
        await self._update_campaign_metrics(campaign_id, results)

        return AgentResult(
            success=results["emails_failed"] == 0,
            items_processed=len(targets),
            items_succeeded=results["emails_sent"],
            items_failed=results["emails_failed"],
            output_data=results,
        )

    async def _run_adhoc(self, company_ids: list, contact_ids: list, dry_run: bool) -> AgentResult:
        """Run ad-hoc outreach to specific companies/contacts."""
        targets = []

        async with get_db_session() as session:
            from sqlalchemy import select

            if company_ids:
                stmt = select(Company).where(Company.id.in_(company_ids))
                result = await session.execute(stmt)
                companies = result.scalars().all()

                for company in companies:
                    # Get best contact for company
                    stmt = select(Contact).where(
                        Contact.company_id == company.id,
                        Contact.email.isnot(None),
                    ).order_by(Contact.is_decision_maker.desc(), Contact.engagement_score.desc())
                    result = await session.execute(stmt)
                    contact = result.scalars().first()
                    if contact:
                        targets.append({"company": company, "contact": contact})

            if contact_ids:
                stmt = select(Contact).where(Contact.id.in_(contact_ids))
                result = await session.execute(stmt)
                contacts = result.scalars().all()
                for contact in contacts:
                    if contact.email:
                        stmt = select(Company).where(Company.id == contact.company_id)
                        result = await session.execute(stmt)
                        company = result.scalar_one_or_none()
                        if company:
                            targets.append({"company": company, "contact": contact})

        results = {"emails_sent": 0, "emails_failed": 0, "skipped": 0, "errors": []}

        for target in targets:
            if self._daily_sent >= self.agent_config.outreach_daily_limit:
                break

            try:
                # Create ad-hoc email log
                success = await self._send_outreach_email(
                    campaign=None,
                    company=target["company"],
                    contact=target["contact"],
                    dry_run=dry_run,
                    template="initial_outreach",
                )
                if success:
                    results["emails_sent"] += 1
                else:
                    results["emails_failed"] += 1
            except Exception as e:
                results["errors"].append(str(e))
                results["emails_failed"] += 1

            await asyncio.sleep(self.agent_config.outreach_delay_seconds / 1000)

        return AgentResult(
            success=results["emails_failed"] == 0,
            items_processed=len(targets),
            items_succeeded=results["emails_sent"],
            items_failed=results["emails_failed"],
            output_data=results,
        )

    async def _run_pending_campaigns(self, dry_run: bool) -> AgentResult:
        """Run all campaigns that are ready to send."""
        async with get_db_session() as session:
            from sqlalchemy import select
            stmt = select(OutreachCampaign).where(
                OutreachCampaign.agent_id == self.agent_config.id,
                OutreachCampaign.status.in_([CampaignStatus.SCHEDULED, CampaignStatus.RUNNING]),
            )
            result = await session.execute(stmt)
            campaigns = result.scalars().all()

        total_results = {"emails_sent": 0, "emails_failed": 0, "campaigns_run": 0}

        for campaign in campaigns:
            result = await self._run_campaign(campaign.id, dry_run)
            total_results["emails_sent"] += result.items_succeeded
            total_results["emails_failed"] += result.items_failed
            total_results["campaigns_run"] += 1

        return AgentResult(
            success=total_results["emails_failed"] == 0,
            items_processed=total_results["campaigns_run"],
            items_succeeded=total_results["emails_sent"],
            items_failed=total_results["emails_failed"],
            output_data=total_results,
        )

    async def _get_campaign_targets(self, campaign: OutreachCampaign) -> list[dict]:
        """Get target companies/contacts for a campaign."""
        targets = []

        async with get_db_session() as session:
            from sqlalchemy import select

            if campaign.target_companies:
                stmt = select(Company).where(Company.id.in_(campaign.target_companies))
                result = await session.execute(stmt)
                companies = result.scalars().all()
            else:
                # Filter by stage
                stmt = select(Company).where(
                    Company.agent_id == self.agent_config.id,
                    Company.stage == (campaign.target_stage or CompanyStage.RESEARCHED),
                )
                if campaign.filters:
                    if "industry" in campaign.filters:
                        stmt = stmt.where(Company.industry == campaign.filters["industry"])
                    if "min_employee_count" in campaign.filters:
                        stmt = stmt.where(Company.employee_count >= campaign.filters["min_employee_count"])
                    if "max_employee_count" in campaign.filters:
                        stmt = stmt.where(Company.employee_count <= campaign.filters["max_employee_count"])
                    if "funding_stage" in campaign.filters:
                        stmt = stmt.where(Company.funding_stage == campaign.filters["funding_stage"])
                    if "locations" in campaign.filters:
                        from sqlalchemy import or_
                        location_filters = [
                            Company.headquarters.ilike(f"%{loc}%")
                            for loc in campaign.filters["locations"]
                        ]
                        if location_filters:
                            stmt = stmt.where(or_(*location_filters))
                    if "min_confidence" in campaign.filters:
                        stmt = stmt.where(Company.confidence_score >= campaign.filters["min_confidence"])
                result = await session.execute(stmt)
                companies = result.scalars().all()

            for company in companies:
                if campaign.target_contacts:
                    stmt = select(Contact).where(
                        Contact.company_id == company.id,
                        Contact.id.in_(campaign.target_contacts),
                        Contact.email.isnot(None),
                    )
                else:
                    stmt = select(Contact).where(
                        Contact.company_id == company.id,
                        Contact.email.isnot(None),
                        Contact.is_decision_maker.is_(True),
                    ).order_by(Contact.engagement_score.desc())

                result = await session.execute(stmt)
                contacts = result.scalars().all()

                for contact in contacts:
                    targets.append({"company": company, "contact": contact})

        return targets

    async def _send_outreach_email(
        self,
        campaign: Optional[OutreachCampaign],
        company: Company,
        contact: Contact,
        dry_run: bool = False,
        template: str = "initial_outreach",
    ) -> bool:
        """Send a personalized outreach email."""
        self.log(f"Preparing email to {contact.full_name} at {company.name}")

        # Check unsubscribe
        if await self._is_unsubscribed(contact.email):
            self.log(f"Contact {contact.email} is unsubscribed, skipping")
            return False

        # Check if already emailed recently
        if await self._recently_emailed(contact.email, days=14):
            self.log(f"Recently emailed {contact.email}, skipping")
            return False

        # Generate personalized email
        email_content = await self._generate_email(company, contact, template)

        # Create email log
        email_log = EmailLog(
            campaign_id=campaign.id if campaign else None,
            company_id=company.id,
            contact_id=contact.id,
            to_email=contact.email,
            to_name=contact.full_name,
            from_email=self.settings.apis.sendgrid.from_email,
            from_name=self.settings.apis.sendgrid.from_name,
            subject=email_content["subject"],
            body_text=email_content["body_text"],
            body_html=email_content["body_html"],
            template_name=template,
            template_variables=email_content["variables"],
            sequence_name=campaign.sequence_name if campaign else "adhoc",
            sequence_step=1,
            status=EmailStatus.PENDING,
        )

        async with get_db_session() as session:
            session.add(email_log)
            await session.commit()

        if dry_run:
            self.log(f"[DRY RUN] Would send to {contact.email}: {email_content['subject']}")
            email_log.status = EmailStatus.SENT
            email_log.sent_at = datetime.utcnow()
            async with get_db_session() as session:
                await session.merge(email_log)
                await session.commit()
            return True

        # Send email
        try:
            result = await self.email_service.send_email(
                to_email=contact.email,
                to_name=contact.full_name,
                subject=email_content["subject"],
                body_text=email_content["body_text"],
                body_html=email_content["body_html"],
                tracking_id=email_log.id,
            )

            email_log.status = EmailStatus.SENT
            email_log.sent_at = datetime.utcnow()
            email_log.sendgrid_message_id = result.get("message_id")
            self._daily_sent += 1

        except Exception as e:
            self.log(f"Failed to send email to {contact.email}: {e}", "ERROR")
            email_log.status = EmailStatus.FAILED
            email_log.error_message = str(e)

        async with get_db_session() as session:
            await session.merge(email_log)
            await session.commit()

        return email_log.status == EmailStatus.SENT

    async def _generate_email(self, company: Company, contact: Contact, template: str) -> dict:
        """Generate personalized email using LLM."""
        # Load template
        template_content = await self._load_template(template)

        # Prepare variables
        variables = {
            "company.name": company.name,
            "company.industry": company.industry,
            "company.size": str(company.employee_count) if company.employee_count else "growing",
            "company.tech_stack": ", ".join(company.tech_stack[:5]) if company.tech_stack else "modern stack",
            "company.hiring_needs": ", ".join(company.hiring_needs[:3]) if company.hiring_needs else "engineering talent",
            "company.pain_points": company.pain_points[0] if company.pain_points else "scaling challenges",
            "company.recent_funding": company.last_funding_amount_usd and f"${company.last_funding_amount_usd/1e6:.1f}M" or "recent growth",
            "contact.first_name": contact.first_name,
            "contact.title": contact.title,
            "contact.linkedin": contact.linkedin_url or "",
            "agent.value_prop": self.agent_config.value_prop or "specialized technical talent",
            "agent.case_study": self.agent_config.case_study or "recent successful placements",
            "agent.specialization": self.agent_config.specialization or "technical recruiting",
            "unsubscribe_link": f"https://yourdomain.com/unsubscribe?email={contact.email}",
        }

        # Generate using LLM for personalization
        prompt = f"""
        Write a personalized cold outreach email from a technical recruiter to a decision maker.

        Template: {template_content}

        Variables:
        {chr(10).join(f"- {k}: {v}" for k, v in variables.items())}

        Guidelines:
        - Tone: {self.agent_config.outreach_tone or "professional_peer"}
        - Length: 3-5 sentences max
        - Focus on value, not features
        - Include specific, relevant detail from research
        - Clear, low-friction CTA (reply, 15-min call, etc.)
        - No marketing fluff

        Return JSON with: subject, body_text, body_html
        """

        try:
            response = await self.generate_structured(
                prompt=prompt,
                schema=dict,  # type: ignore
                system="You are an expert technical recruiter writing personalized outreach emails.",
                temperature=0.7,
            )
            subject = response.get("subject", template_content.get("subject", "Quick question"))
            body_text = response.get("body_text", "")
            body_html = response.get("body_html", body_text.replace("\n", "<br>"))
        except Exception as e:
            self.log(f"LLM generation failed, using template: {e}", "WARNING")
            subject = self._render_template(template_content.get("subject", "Quick question"), variables)
            body_text = self._render_template(template_content.get("body_text", ""), variables)
            body_html = self._render_template(template_content.get("body_html", body_text), variables)

        return {
            "subject": subject,
            "body_text": body_text,
            "body_html": body_html,
            "variables": variables,
        }

    async def _load_template(self, template_name: str) -> dict:
        """Load email template."""
        # For now, return default template
        templates = {
            "initial_outreach": {
                "subject": "Quick question about {{company.name}}'s engineering team",
                "body_text": """Hi {{contact.first_name}},

I noticed {{company.name}} is {{company.hiring_needs}} and thought you might be open to a conversation.

I specialize in placing {{agent.specialization}} - recently {{agent.case_study}}.

Would a brief call be worthwhile? I can share how we've helped similar {{company.industry}} companies scale their teams.

Best,
[Your Name]""",
            },
            "followup_1_value_add": {
                "subject": "Re: {{company.name}} engineering hiring",
                "body_text": """Hi {{contact.first_name}},

Following up - I came across this article on {{company.pain_points}} that might be relevant to your team's current challenges: [link]

Happy to share more context on how we've helped companies like {{company.name}} navigate this.

No pressure either way - just thought it might be useful.

Best,
[Your Name]""",
            },
        }
        return templates.get(template_name, templates["initial_outreach"])

    def _render_template(self, template: str, variables: dict) -> str:
        """Simple template rendering."""
        result = template
        for key, value in variables.items():
            result = result.replace(f"{{{{{key}}}}}", str(value))
        return result

    async def _is_unsubscribed(self, email: str) -> bool:
        """Check if email is unsubscribed."""
        async with get_db_session() as session:
            from sqlalchemy import select
            from backend.storage.models import UnsubscribeRecord
            stmt = select(UnsubscribeRecord).where(UnsubscribeRecord.email == email)
            result = await session.execute(stmt)
            return result.scalar_one_or_none() is not None

    async def _recently_emailed(self, email: str, days: int = 14) -> bool:
        """Check if we've emailed this address recently."""
        async with get_db_session() as session:
            from sqlalchemy import select
            cutoff = datetime.utcnow() - timedelta(days=days)
            stmt = select(EmailLog).where(
                EmailLog.to_email == email,
                EmailLog.sent_at >= cutoff,
                EmailLog.status.in_([EmailStatus.SENT, EmailStatus.DELIVERED, EmailStatus.OPENED]),
            )
            result = await session.execute(stmt)
            return result.scalar_one_or_none() is not None

    async def _update_campaign_metrics(self, campaign_id: str, results: dict):
        """Update campaign with send results."""
        async with get_db_session() as session:
            from sqlalchemy import select
            stmt = select(OutreachCampaign).where(OutreachCampaign.id == campaign_id)
            result = await session.execute(stmt)
            campaign = result.scalar_one_or_none()
            if campaign:
                campaign.emails_sent += results["emails_sent"]
                campaign.emails_delivered += results["emails_sent"]  # Will be updated by webhook
                if campaign.emails_sent >= (campaign.total_limit or float("inf")):
                    campaign.status = CampaignStatus.COMPLETED
                    campaign.completed_at = datetime.utcnow()
                await session.commit()