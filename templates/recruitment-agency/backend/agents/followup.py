"""Follow-up Agent - manages multi-step email sequences for non-responders."""

from datetime import datetime, timedelta
from typing import Optional

from backend.agents.base import BaseAgent, AgentContext, AgentResult, LLMMixin
from backend.config import get_settings, FollowupSequenceConfig
from backend.storage import get_db_session
from backend.storage.models import (
    EmailLog,
    EmailStatus,
    OutreachCampaign,
    Contact,
)


class FollowupAgent(BaseAgent, LLMMixin):
    """Agent that manages follow-up email sequences."""

    def __init__(self, agent_config):
        super().__init__(agent_config)
        self.settings = get_settings()
        self._llm_client = None
        self._email_service = None

    @property
    def email_service(self):
        if self._email_service is None:
            from backend.services.email import EmailService
            self._email_service = EmailService()
        return self._email_service

    async def run(self, context: AgentContext) -> AgentResult:
        """Check for emails needing follow-up and send them."""
        campaign_id = context.input_data.get("campaign_id")
        dry_run = context.input_data.get("dry_run", self.settings.features.dry_run_mode)

        step = self.log_step("Scanning for follow-ups", "Checking emails needing follow-up")
        await self._save_run_progress()

        emails_to_followup = await self._get_emails_needing_followup(campaign_id)

        self.complete_step_log(step, True, f"Found {len(emails_to_followup)} emails needing follow-up")
        await self._save_run_progress()

        results = {"followups_sent": 0, "followups_failed": 0, "skipped": 0, "errors": []}

        for i, email_log in enumerate(emails_to_followup):
            step = self.log_step(f"Processing follow-up {i+1}/{len(emails_to_followup)}", f"To: {email_log.to_email}")
            await self._save_run_progress()

            try:
                should_send, next_step_num = await self._should_send_followup(email_log)
                if not should_send:
                    results["skipped"] += 1
                    self.complete_step_log(step, True, "Skipped - not ready for follow-up")
                    await self._save_run_progress()
                    continue

                campaign = await self._get_campaign(email_log.campaign_id)
                if not campaign:
                    results["skipped"] += 1
                    self.complete_step_log(step, True, "Skipped - campaign not found")
                    await self._save_run_progress()
                    continue

                sequence = self._get_sequence_config(campaign.sequence_name)
                if not sequence or next_step_num >= len(sequence.steps):
                    results["skipped"] += 1
                    self.complete_step_log(step, True, "Skipped - sequence exhausted")
                    await self._save_run_progress()
                    continue

                seq_step = sequence.steps[next_step_num]

                if not await self._check_condition(email_log, seq_step.condition):
                    results["skipped"] += 1
                    self.complete_step_log(step, True, f"Skipped - condition not met: {seq_step.condition}")
                    await self._save_run_progress()
                    continue

                success = await self._send_followup(
                    email_log=email_log,
                    campaign=campaign,
                    step=seq_step,
                    step_number=next_step_num + 1,
                    dry_run=dry_run,
                )

                if success:
                    results["followups_sent"] += 1
                    self.complete_step_log(step, True, f"Follow-up step {next_step_num + 1} sent")
                else:
                    results["followups_failed"] += 1
                    self.complete_step_log(step, False, "Failed to send follow-up")

            except Exception as e:
                results["errors"].append(f"{email_log.id}: {str(e)}")
                results["followups_failed"] += 1
                self.complete_step_log(step, False, f"Error: {e}")
            await self._save_run_progress()

        step = self.log_step("Follow-up complete", f"Sent: {results['followups_sent']}, Skipped: {results['skipped']}")
        self.complete_step_log(step, True)
        await self._save_run_progress()

        return AgentResult(
            success=results["followups_failed"] == 0,
            items_processed=len(emails_to_followup),
            items_succeeded=results["followups_sent"],
            items_failed=results["followups_failed"],
            output_data=results,
        )

    async def _get_emails_needing_followup(self, campaign_id: Optional[str]) -> list[EmailLog]:
        """Get emails that need follow-up."""
        async with get_db_session() as session:
            from sqlalchemy import select, and_, or_

            # Get emails that:
            # 1. Were sent (not pending/failed)
            # 2. Haven't been replied to
            # 3. Don't have a follow-up already sent for the next step
            # 4. Are old enough for the next follow-up step

            stmt = (
                select(EmailLog)
                .where(
                    EmailLog.status.in_([EmailStatus.SENT, EmailStatus.DELIVERED, EmailStatus.OPENED, EmailStatus.CLICKED]),
                    EmailLog.replied_at.is_(None),
                    EmailLog.is_followup.is_(False),  # Only follow up on initial emails
                )
            )

            if campaign_id:
                stmt = stmt.where(EmailLog.campaign_id == campaign_id)

            # Only emails from this agent's campaigns
            stmt = stmt.where(EmailLog.campaign_id.isnot(None))

            result = await session.execute(stmt)
            return list(result.scalars().all())

    async def _should_send_followup(self, email_log: EmailLog) -> tuple[bool, int]:
        """Determine if a follow-up should be sent and which step."""
        # Get the sequence
        campaign = await self._get_campaign(email_log.campaign_id)
        if not campaign:
            return False, 0

        sequence = self._get_sequence_config(campaign.sequence_name)
        if not sequence:
            return False, 0

        # Count existing follow-ups for this email
        async with get_db_session() as session:
            from sqlalchemy import select, func
            stmt = (
                select(func.count(EmailLog.id))
                .where(
                    EmailLog.parent_email_id == email_log.id,
                    EmailLog.is_followup.is_(True),
                )
            )
            result = await session.execute(stmt)
            followup_count = result.scalar() or 0

        # Check if we've exhausted the sequence
        if followup_count >= len(sequence.steps):
            return False, 0

        # Check if enough time has passed for the next step
        next_step = sequence.steps[followup_count]
        required_date = email_log.sent_at + timedelta(days=next_step.delay_days)

        if datetime.utcnow() < required_date:
            return False, 0

        return True, followup_count

    def _get_sequence_config(self, sequence_name: str) -> Optional[FollowupSequenceConfig]:
        """Get sequence configuration."""
        for seq in self.agent_config.followup.sequences:
            if seq.name == sequence_name:
                return seq
        # Return default sequence
        for seq in self.agent_config.followup.sequences:
            if seq.name == "standard_3_touch":
                return seq
        return None

    async def _check_condition(self, email_log: EmailLog, condition: str) -> bool:
        """Check if follow-up condition is met."""
        if condition == "no_reply":
            return email_log.replied_at is None
        elif condition == "opened_or_clicked":
            return email_log.opened_at is not None or email_log.clicked_at is not None
        elif condition == "no_open":
            return email_log.opened_at is None
        return True

    async def _send_followup(
        self,
        email_log: EmailLog,
        campaign: OutreachCampaign,
        step,
        step_number: int,
        dry_run: bool,
    ) -> bool:
        """Send a follow-up email."""
        self.log(f"Sending follow-up step {step_number} to {email_log.to_email}")

        # Get company and contact
        async with get_db_session() as session:
            from sqlalchemy import select
            from backend.storage.models import Company, Contact

            company = None
            contact = None
            if email_log.company_id:
                stmt = select(Company).where(Company.id == email_log.company_id)
                result = await session.execute(stmt)
                company = result.scalar_one_or_none()

            if email_log.contact_id:
                stmt = select(Contact).where(Contact.id == email_log.contact_id)
                result = await session.execute(stmt)
                contact = result.scalar_one_or_none()

        if not contact or not contact.email:
            self.log("No contact or email for follow-up", "WARNING")
            return False

        # Generate follow-up email content
        email_content = await self._generate_followup_content(
            original_email=email_log,
            company=company,
            contact=contact,
            step_template=step.template,
            step_number=step_number,
        )

        # Create follow-up email log
        followup_log = EmailLog(
            campaign_id=campaign.id,
            company_id=email_log.company_id,
            contact_id=email_log.contact_id,
            to_email=contact.email,
            to_name=contact.full_name,
            from_email=email_log.from_email,
            from_name=email_log.from_name,
            subject=email_content["subject"],
            body_text=email_content["body_text"],
            body_html=email_content["body_html"],
            template_name=step.template,
            template_variables=email_content["variables"],
            sequence_name=campaign.sequence_name,
            sequence_step=step_number,
            is_followup=True,
            parent_email_id=email_log.id,
            status=EmailStatus.PENDING,
        )

        async with get_db_session() as session:
            session.add(followup_log)
            await session.commit()

        if dry_run:
            self.log(f"[DRY RUN] Follow-up to {contact.email}: {email_content['subject']}")
            followup_log.status = EmailStatus.SENT
            followup_log.sent_at = datetime.utcnow()
            async with get_db_session() as session:
                await session.merge(followup_log)
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
                tracking_id=followup_log.id,
                in_reply_to=email_log.sendgrid_message_id,
                references=email_log.sendgrid_message_id,
            )

            followup_log.status = EmailStatus.SENT
            followup_log.sent_at = datetime.utcnow()
            followup_log.sendgrid_message_id = result.get("message_id")

        except Exception as e:
            self.log(f"Failed to send follow-up: {e}", "ERROR")
            followup_log.status = EmailStatus.FAILED
            followup_log.error_message = str(e)

        async with get_db_session() as session:
            await session.merge(followup_log)
            await session.commit()

        return followup_log.status == EmailStatus.SENT

    async def _generate_followup_content(
        self,
        original_email: EmailLog,
        company,
        contact,
        step_template: str,
        step_number: int,
    ) -> dict:
        """Generate follow-up email content."""
        # Load follow-up template
        template = await self._load_followup_template(step_template)

        variables = {
            "contact.first_name": contact.first_name if contact else "there",
            "company.name": company.name if company else "your company",
            "original.subject": original_email.subject,
            "original.date": original_email.sent_at.strftime("%B %d") if original_email.sent_at else "recently",
            "unsubscribe_link": f"https://yourdomain.com/unsubscribe?email={contact.email}" if contact else "#",
        }

        # Generate with LLM
        prompt = f"""
        Write a follow-up email (step {step_number}) for a technical recruiter.

        Original email subject: {original_email.subject}
        Original email date: {original_email.sent_at.strftime('%B %d') if original_email.sent_at else 'recently'}
        Template: {template}

        Variables:
        {chr(10).join(f'- {k}: {v}' for k, v in variables.items())}

        Guidelines:
        - Reference the previous email naturally
        - Add new value (insight, resource, case study, question)
        - Keep it brief (2-4 sentences)
        - Low-friction CTA
        - Tone: {self.agent_config.outreach_tone or "professional_peer"}

        Return JSON: subject, body_text, body_html
        """

        try:
            response = await self.generate_structured(
                prompt=prompt,
                schema=dict,  # type: ignore
                system="You are an expert technical recruiter writing follow-up emails.",
                temperature=0.7,
            )
            subject = response.get("subject", template.get("subject", "Following up"))
            body_text = response.get("body_text", "")
            body_html = response.get("body_html", body_text.replace("\n", "<br>"))
        except Exception as e:
            self.log(f"LLM follow-up generation failed: {e}", "WARNING")
            subject = self._render_template(template.get("subject", "Following up"), variables)
            body_text = self._render_template(template.get("body_text", ""), variables)
            body_html = self._render_template(template.get("body_html", body_text), variables)

        return {
            "subject": subject,
            "body_text": body_text,
            "body_html": body_html,
            "variables": variables,
        }

    async def _load_followup_template(self, template_name: str) -> dict:
        """Load follow-up template."""
        templates = {
            "followup_1_value_add": {
                "subject": "Re: {{original.subject}}",
                "body_text": """Hi {{contact.first_name}},

Following up - I came across this resource on {{company.pain_points}} that might be relevant to your team: [link]

Thought it could be useful given what {{company.name}} is working on.

Happy to chat if helpful.

Best,
[Your Name]""",
            },
            "followup_2_case_study": {
                "subject": "Re: {{original.subject}} - relevant case study",
                "body_text": """Hi {{contact.first_name}},

Wanted to share a quick example: we recently helped a {{company.industry}} company ({{agent.case_study}}).

If {{company.name}} is facing similar challenges, I'd love to show you how we approached it.

15 minutes this week?

Best,
[Your Name]""",
            },
            "followup_3_breakup": {
                "subject": "Re: {{original.subject}} - closing the loop",
                "body_text": """Hi {{contact.first_name}},

I'll keep this brief - I don't want to clutter your inbox.

If hiring {{company.hiring_needs}} becomes a priority, I'm here to help. Otherwise, I'll assume the timing isn't right and won't follow up again.

All the best with {{company.name}}'s growth.

Best,
[Your Name]""",
            },
            "engaged_followup_1": {
                "subject": "Re: {{original.subject}}",
                "body_text": """Hi {{contact.first_name}},

I noticed you opened my last email - just checking if the timing is better now for a quick chat about {{company.hiring_needs}}?

No pressure either way.

Best,
[Your Name]""",
            },
        }
        return templates.get(template_name, templates["followup_1_value_add"])

    def _render_template(self, template: str, variables: dict) -> str:
        """Simple template rendering."""
        result = template
        for key, value in variables.items():
            result = result.replace(f"{{{{{key}}}}}", str(value))
        return result

    async def _get_campaign(self, campaign_id: str):
        """Get campaign by ID."""
        async with get_db_session() as session:
            from sqlalchemy import select
            stmt = select(OutreachCampaign).where(OutreachCampaign.id == campaign_id)
            result = await session.execute(stmt)
            return result.scalar_one_or_none()