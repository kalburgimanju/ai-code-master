"""Scheduler Agent - books calls with prospects using Cal.com or Calendly."""

import asyncio
from datetime import datetime, timedelta
from typing import Any, Optional
from uuid import uuid4

from backend.agents.base import BaseAgent, AgentContext, AgentResult
from backend.config import get_settings
from backend.storage import get_db_session
from backend.storage.models import (
    EmailLog,
    EmailStatus,
    Company,
    Contact,
    PipelineDeal,
    CompanyStage,
    CallBooking,
)


class SchedulerAgent(BaseAgent):
    """Agent that books discovery calls with prospects."""

    def __init__(self, agent_config):
        super().__init__(agent_config)
        self.settings = get_settings()
        self._calendar_client = None

    @property
    def calendar_client(self):
        if self._calendar_client is None:
            from backend.services.calendar import CalendarClient
            self._calendar_client = CalendarClient()
        return self._calendar_client

    async def run(self, context: AgentContext) -> AgentResult:
        """Book calls for replied prospects."""
        campaign_id = context.input_data.get("campaign_id")
        dry_run = context.input_data.get("dry_run", self.settings.features.dry_run_mode)

        step = self.log_step("Finding prospects needing calls", "Scanning replied emails")
        await self._save_run_progress()

        prospects = await self._get_prospects_needing_calls(campaign_id)

        self.complete_step_log(step, True, f"Found {len(prospects)} prospects needing calls")
        await self._save_run_progress()

        results = {"calls_booked": 0, "calls_failed": 0, "skipped": 0, "errors": []}

        for i, prospect in enumerate(prospects):
            contact_name = prospect["contact"].full_name
            step = self.log_step(f"Booking call {i+1}/{len(prospects)}", f"With: {contact_name}")
            await self._save_run_progress()

            try:
                success = await self._book_call(prospect, dry_run)
                if success:
                    results["calls_booked"] += 1
                    self.complete_step_log(step, True, f"Call booked with {contact_name}")
                else:
                    results["calls_failed"] += 1
                    self.complete_step_log(step, False, f"Failed to book call with {contact_name}")
            except Exception as e:
                results["errors"].append(f"{prospect['contact'].id}: {str(e)}")
                results["calls_failed"] += 1
                self.complete_step_log(step, False, f"Error: {e}")
            await self._save_run_progress()

        step = self.log_step("Scheduling complete", f"Booked: {results['calls_booked']}, Failed: {results['calls_failed']}")
        self.complete_step_log(step, True)
        await self._save_run_progress()

        return AgentResult(
            success=results["calls_failed"] == 0,
            items_processed=len(prospects),
            items_succeeded=results["calls_booked"],
            items_failed=results["calls_failed"],
            output_data=results,
        )

    async def _get_prospects_needing_calls(self, campaign_id: Optional[str]) -> list[dict]:
        """Get prospects who replied but don't have calls booked."""
        async with get_db_session() as session:
            from sqlalchemy import select, and_, exists
            from backend.storage.models import EmailLog, Contact, Company, CallBooking

            # Subquery for emails with replies
            replied_emails = (
                select(EmailLog)
                .where(
                    EmailLog.replied_at.isnot(None),
                    EmailLog.status == EmailStatus.REPLIED,
                )
            )

            if campaign_id:
                replied_emails = replied_emails.where(EmailLog.campaign_id == campaign_id)

            # Filter out those with existing calls
            replied_emails = replied_emails.where(
                ~exists(
                    select(CallBooking.id).where(
                        CallBooking.contact_id == EmailLog.contact_id,
                        CallBooking.status.in_(["scheduled", "confirmed", "completed"]),
                    )
                )
            )

            result = await session.execute(replied_emails)
            emails = result.scalars().all()

            prospects = []
            for email in emails:
                # Get contact and company
                contact_stmt = select(Contact).where(Contact.id == email.contact_id)
                contact_result = await session.execute(contact_stmt)
                contact = contact_result.scalar_one_or_none()

                company = None
                if contact and contact.company_id:
                    company_stmt = select(Company).where(Company.id == contact.company_id)
                    company_result = await session.execute(company_stmt)
                    company = company_result.scalar_one_or_none()

                if contact and company:
                    prospects.append({"email": email, "contact": contact, "company": company})

            return prospects

    async def _book_call(self, prospect: dict, dry_run: bool) -> bool:
        """Book a call with a prospect."""
        contact = prospect["contact"]
        company = prospect["company"]
        email = prospect["email"]

        self.log(f"Booking call with {contact.full_name} at {company.name}")

        # Get available slots
        try:
            slots = await self.calendar_client.get_available_slots(
                duration_minutes=self.agent_config.scheduler_duration_minutes,
                days_ahead=14,
            )
        except Exception as e:
            self.log(f"Failed to get calendar slots: {e}", "ERROR")
            return False

        if not slots:
            self.log("No available calendar slots", "WARNING")
            return False

        # For now, just pick the first slot
        # In production, you'd propose multiple options to the prospect
        selected_slot = slots[0]

        if dry_run:
            self.log(f"[DRY RUN] Would book call for {selected_slot['start']} with {contact.email}")
            return True

        # Create calendar event
        try:
            event = await self.calendar_client.create_event(
                title=f"Discovery Call: {company.name} - {contact.full_name}",
                start_time=selected_slot["start"],
                end_time=selected_slot["end"],
                attendee_emails=[contact.email],
                attendee_names=[contact.full_name],
                description=self._generate_call_description(company, contact, email),
                location="Video Call",
            )

            # Create booking record
            booking = CallBooking(
                company_id=company.id,
                contact_id=contact.id,
                title=f"Discovery Call: {company.name}",
                description=self._generate_call_description(company, contact, email),
                meeting_type=self.agent_config.scheduler_meeting_type,
                duration_minutes=self.agent_config.scheduler_duration_minutes,
                scheduled_at=selected_slot["start"],
                timezone=selected_slot.get("timezone", "UTC"),
                calendar_event_id=event.get("id"),
                calendar_provider=self.settings.agents.scheduler.calendar_provider,
                booking_url=event.get("url"),
                attendee_emails=[contact.email],
                attendee_names=[contact.full_name],
                status="scheduled",
            )

            async with get_db_session() as session:
                session.add(booking)
                await session.commit()

                # Update company stage
                company.stage = CompanyStage.CALL_BOOKED
                company.stage_updated_at = datetime.utcnow()
                await session.commit()

                # Create or update pipeline deal
                await self._update_pipeline_deal(session, company, contact, booking)

            self.log(f"Call booked for {selected_slot['start']} with {contact.full_name}")
            return True

        except Exception as e:
            self.log(f"Failed to book call: {e}", "ERROR")
            return False

    def _generate_call_description(self, company: Company, contact: Contact, email: EmailLog) -> str:
        """Generate description for calendar event."""
        return f"""
Discovery Call with {contact.full_name} ({contact.title}) at {company.name}

Company: {company.name}
Industry: {company.industry or 'N/A'}
Size: {company.employee_count or 'N/A'} employees
Stage: {company.funding_stage or 'N/A'}

Hiring Needs: {', '.join(company.hiring_needs) if company.hiring_needs else 'Not specified'}
Tech Stack: {', '.join(company.tech_stack[:5]) if company.tech_stack else 'Not specified'}

Recent Context:
- Replied to outreach email: {email.subject}
- Email sent: {email.sent_at.strftime('%Y-%m-%d') if email.sent_at else 'N/A'}

Value Prop: {self.agent_config.value_prop or 'Specialized technical talent'}
Case Study: {self.agent_config.case_study or 'Recent successful placements'}

Meeting Link: {{meeting_url}}
        """.strip()

    async def _update_pipeline_deal(
        self,
        session,
        company: Company,
        contact: Contact,
        booking: CallBooking,
    ):
        """Create or update pipeline deal for the call."""
        from sqlalchemy import select

        # Check for existing deal
        stmt = select(PipelineDeal).where(
            PipelineDeal.company_id == company.id,
            PipelineDeal.stage.in_([CompanyStage.DISCOVERED, CompanyStage.RESEARCHED, CompanyStage.CONTACTED, CompanyStage.REPLIED]),
        )
        result = await session.execute(stmt)
        deal = result.scalar_one_or_none()

        if not deal:
            deal = PipelineDeal(
                company_id=company.id,
                contact_id=contact.id,
                name=f"Placement: {company.name}",
                description=f"Recruitment partnership with {company.name}",
                stage=CompanyStage.CALL_BOOKED,
                probability=60,
                value_usd=self._estimate_deal_value(company),
                source="agent",
                source_agent_id=self.agent_config.id,
            )
            session.add(deal)
        else:
            deal.stage = CompanyStage.CALL_BOOKED
            deal.probability = 60
            deal.stage_changed_at = datetime.utcnow()

        await session.flush()

        # Add activity
        from backend.storage.models import DealActivity
        activity = DealActivity(
            deal_id=deal.id,
            type="meeting",
            title="Discovery Call Booked",
            description=f"Call booked with {contact.full_name} for {booking.scheduled_at.strftime('%Y-%m-%d %H:%M')}",
            metadata={"booking_id": booking.id, "calendar_event_id": booking.calendar_event_id},
            performed_by=self.agent_config.name,
        )
        session.add(activity)

    def _estimate_deal_value(self, company: Company) -> int:
        """Estimate deal value based on company size and hiring needs."""
        base_fee = 15000  # Base placement fee
        if company.employee_count:
            if company.employee_count > 500:
                base_fee = 25000
            elif company.employee_count > 200:
                base_fee = 20000
            elif company.employee_count > 50:
                base_fee = 18000

        # Multiple hires multiplier
        hire_count = max(1, company.open_positions_count or 1)
        if hire_count > 3:
            return base_fee * min(hire_count, 5) * 0.8  # Volume discount
        return base_fee * hire_count


class CalendarClient:
    """Abstract calendar client - supports Cal.com, Calendly, etc."""

    def __init__(self):
        self.settings = get_settings()
        self.provider = self.settings.agents.scheduler.calendar_provider

    async def get_available_slots(
        self,
        duration_minutes: int = 30,
        days_ahead: int = 14,
    ) -> list[dict]:
        """Get available time slots."""
        if self.provider == "calcom":
            return await self._get_calcom_slots(duration_minutes, days_ahead)
        elif self.provider == "calendly":
            return await self._get_calendly_slots(duration_minutes, days_ahead)
        return []

    async def _get_calcom_slots(self, duration_minutes: int, days_ahead: int) -> list[dict]:
        """Get slots from Cal.com."""
        import httpx

        url = f"{self.settings.apis.calcom.base_url}/slots"
        headers = {
            "Authorization": f"Bearer {self.settings.apis.calcom.api_key}",
            "Content-Type": "application/json",
        }
        params = {
            "eventTypeId": self.settings.apis.calcom.event_type_id,
            "start": datetime.utcnow().isoformat() + "Z",
            "end": (datetime.utcnow() + timedelta(days=days_ahead)).isoformat() + "Z",
            "duration": duration_minutes,
        }

        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers, params=params)
            response.raise_for_status()
            data = response.json()
            return data.get("slots", [])

    async def _get_calendly_slots(self, duration_minutes: int, days_ahead: int) -> list[dict]:
        """Get slots from Calendly."""
        # Implementation would use Calendly API
        return []

    async def create_event(
        self,
        title: str,
        start_time: datetime,
        end_time: datetime,
        attendee_emails: list[str],
        attendee_names: list[str],
        description: str,
        location: str = "Video Call",
    ) -> dict:
        """Create a calendar event."""
        if self.provider == "calcom":
            return await self._create_calcom_event(
                title, start_time, end_time, attendee_emails, attendee_names, description, location
            )
        elif self.provider == "calendly":
            return await self._create_calendly_event(
                title, start_time, end_time, attendee_emails, attendee_names, description, location
            )
        return {}

    async def _create_calcom_event(
        self,
        title: str,
        start_time: datetime,
        end_time: datetime,
        attendee_emails: list[str],
        attendee_names: list[str],
        description: str,
        location: str,
    ) -> dict:
        """Create event in Cal.com."""
        import httpx

        url = f"{self.settings.apis.calcom.base_url}/bookings"
        headers = {
            "Authorization": f"Bearer {self.settings.apis.calcom.api_key}",
            "Content-Type": "application/json",
        }
        data = {
            "eventTypeId": self.settings.apis.calcom.event_type_id,
            "start": start_time.isoformat() + "Z",
            "end": end_time.isoformat() + "Z",
            "attendee": {
                "email": attendee_emails[0],
                "name": attendee_names[0],
                "timeZone": "UTC",
                "language": "en",
            },
            "metadata": {
                "description": description,
            },
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=headers, json=data)
            response.raise_for_status()
            return response.json()

    async def _create_calendly_event(
        self,
        title: str,
        start_time: datetime,
        end_time: datetime,
        attendee_emails: list[str],
        attendee_names: list[str],
        description: str,
        location: str,
    ) -> dict:
        """Create event in Calendly."""
        # Calendly doesn't support direct event creation via API
        # Would need to use scheduling links
        return {"id": "calendly_placeholder", "url": self.settings.agents.scheduler.booking_link}