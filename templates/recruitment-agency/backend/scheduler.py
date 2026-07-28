"""Background scheduler for running agent jobs."""

import asyncio
from datetime import datetime, time
from typing import Optional

import aiohttp
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger

from backend.config import get_settings
from backend.storage import get_db_session
from backend.storage.models import AgentConfig, AgentStatus
from backend.agents import (
    CompanyDiscoveryAgent, CompanyResearchAgent, OutreachAgent,
    FollowupAgent, SchedulerAgent, PipelineAgent,
)
from backend.agents.base import AgentContext


class AgentScheduler:
    """Manages scheduled agent runs."""

    def __init__(self):
        self.settings = get_settings()
        self.scheduler = AsyncIOScheduler(timezone=self.settings.scheduler.timezone)
        self._running = False

    async def start(self):
        """Start the scheduler."""
        if self._running:
            return

        self._setup_jobs()
        self.scheduler.start()
        self._running = True
        print(f"Scheduler started with {len(self.scheduler.get_jobs())} jobs")

    async def stop(self):
        """Stop the scheduler."""
        if not self._running:
            return

        self.scheduler.shutdown(wait=True)
        self._running = False
        print("Scheduler stopped")

    def _setup_jobs(self):
        """Configure scheduled jobs from settings."""
        jobs_config = self.settings.scheduler.jobs

        for job_config in jobs_config:
            if not job_config.enabled:
                continue

            trigger = None
            if job_config.trigger == "cron":
                trigger = CronTrigger(
                    hour=job_config.hour,
                    day_of_week=job_config.day_of_week,
                    timezone=self.settings.scheduler.timezone,
                )
            elif job_config.trigger == "interval":
                trigger = IntervalTrigger(
                    hours=job_config.hours,
                    timezone=self.settings.scheduler.timezone,
                )

            if trigger:
                self.scheduler.add_job(
                    self._run_job,
                    trigger,
                    args=[job_config.name],
                    id=job_config.name,
                    replace_existing=True,
                )

    async def _run_job(self, job_name: str):
        """Execute a scheduled job."""
        print(f"Running scheduled job: {job_name}")

        try:
            if job_name == "discovery_run":
                await self._run_discovery()
            elif job_name == "research_batch":
                await self._run_research()
            elif job_name == "followup_check":
                await self._run_followup()
            elif job_name == "pipeline_sync":
                await self._run_pipeline_sync()
            elif job_name == "email_bounce_check":
                await self._run_bounce_check()
            elif job_name == "analytics_rollup":
                await self._run_analytics()
        except Exception as e:
            print(f"Job {job_name} failed: {e}")

    async def _run_discovery(self):
        """Run discovery agent for all active agents."""
        async with get_db_session() as session:
            from sqlalchemy import select
            stmt = select(AgentConfig).where(AgentConfig.status == AgentStatus.ACTIVE)
            result = await session.execute(stmt)
            agents = result.scalars().all()

        for agent_config in agents:
            try:
                agent = CompanyDiscoveryAgent(agent_config)
                context = AgentContext(
                    agent_id=agent_config.id,
                    agent_config=agent_config,
                    run_id=f"scheduled_discovery_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
                    mode="discovery",
                )
                await agent.execute(context)
                print(f"Discovery completed for agent: {agent_config.name}")
            except Exception as e:
                print(f"Discovery failed for agent {agent_config.name}: {e}")

    async def _run_research(self):
        """Run research agent for companies needing enrichment."""
        async with get_db_session() as session:
            from sqlalchemy import select
            stmt = select(AgentConfig).where(AgentConfig.status == AgentStatus.ACTIVE)
            result = await session.execute(stmt)
            agents = result.scalars().all()

        for agent_config in agents:
            try:
                agent = CompanyResearchAgent(agent_config)
                context = AgentContext(
                    agent_id=agent_config.id,
                    agent_config=agent_config,
                    run_id=f"scheduled_research_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
                    mode="research",
                )
                await agent.execute(context)
                print(f"Research completed for agent: {agent_config.name}")
            except Exception as e:
                print(f"Research failed for agent {agent_config.name}: {e}")

    async def _run_followup(self):
        """Run follow-up agent for pending sequences."""
        async with get_db_session() as session:
            from sqlalchemy import select
            stmt = select(AgentConfig).where(AgentConfig.status == AgentStatus.ACTIVE)
            result = await session.execute(stmt)
            agents = result.scalars().all()

        for agent_config in agents:
            try:
                agent = FollowupAgent(agent_config)
                context = AgentContext(
                    agent_id=agent_config.id,
                    agent_config=agent_config,
                    run_id=f"scheduled_followup_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
                    mode="followup",
                )
                await agent.execute(context)
                print(f"Follow-up completed for agent: {agent_config.name}")
            except Exception as e:
                print(f"Follow-up failed for agent {agent_config.name}: {e}")

    async def _run_pipeline_sync(self):
        """Sync pipeline with CRM."""
        try:
            async with get_db_session() as session:
                from sqlalchemy import select
                stmt = select(AgentConfig).where(AgentConfig.status == AgentStatus.ACTIVE)
                result = await session.execute(stmt)
                agents = result.scalars().all()

            for agent_config in agents:
                try:
                    agent = PipelineAgent(agent_config)
                    context = AgentContext(
                        agent_id=agent_config.id,
                        agent_config=agent_config,
                        run_id=f"scheduled_pipeline_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
                        mode="sync",
                    )
                    await agent.execute(context)
                    print(f"Pipeline sync completed for agent: {agent_config.name}")
                except Exception as e:
                    print(f"Pipeline sync failed for agent {agent_config.name}: {e}")
        except Exception as e:
            print(f"Pipeline sync error: {e}")

    async def _run_bounce_check(self):
        """Check for bounced emails and update statuses."""
        try:
            from backend.storage.models import EmailLog, EmailStatus, Contact
            from sqlalchemy import select

            async with get_db_session() as session:
                # Find emails that are still in SENT/DELIVERED state but were sent
                # more than 24 hours ago - these may have bounced without webhook
                from datetime import datetime, timedelta
                cutoff = datetime.utcnow() - timedelta(hours=24)
                stmt = select(EmailLog).where(
                    EmailLog.status.in_([EmailStatus.SENT, EmailStatus.DELIVERED]),
                    EmailLog.sent_at < cutoff,
                ).limit(100)
                result = await session.execute(stmt)
                emails = result.scalars().all()

                bounced_count = 0
                for email in emails:
                    # Check if the email is in a suppression list
                    # (indicates bounce or unsubscribe)
                    from backend.services.email import EmailService
                    email_service = EmailService()

                    if not email_service.api_key:
                        break

                    # Check suppression list
                    if await email_service.remove_from_suppression_list(email.to_email):
                        # If the email is on suppression list, mark as bounced
                        email.status = EmailStatus.BOUNCED
                        email.bounced_at = datetime.utcnow()
                        email.error_message = "Detected during bounce check - email suppressed"
                        bounced_count += 1

                await session.commit()
                print(f"Bounce check completed: {bounced_count} emails marked as bounced out of {len(emails)} checked")
        except Exception as e:
            print(f"Bounce check error: {e}")

    async def _run_analytics(self):
        """Generate daily analytics snapshots."""
        try:
            async with get_db_session() as session:
                from sqlalchemy import select
                from backend.storage.models import AnalyticsSnapshot, AgentConfig, AgentStatus

                stmt = select(AgentConfig).where(AgentConfig.status == AgentStatus.ACTIVE)
                result = await session.execute(stmt)
                agents = result.scalars().all()

            for agent_config in agents:
                try:
                    agent = PipelineAgent(agent_config)
                    context = AgentContext(
                        agent_id=agent_config.id,
                        agent_config=agent_config,
                        run_id=f"scheduled_analytics_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
                        mode="analyze",
                    )
                    result = await agent.execute(context)

                    if result.success and result.output_data:
                        # Save analytics snapshot
                        from backend.storage.models import AnalyticsSnapshot
                        async with get_db_session() as session:
                            snapshot = AnalyticsSnapshot(
                                date=datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0),
                                agent_name=agent_config.name,
                                **result.output_data,
                            )
                            session.add(snapshot)
                            await session.commit()

                    print(f"Analytics generated for agent: {agent_config.name}")
                except Exception as e:
                    print(f"Analytics failed for agent {agent_config.name}: {e}")
        except Exception as e:
            print(f"Analytics error: {e}")


# Global scheduler instance
_scheduler: Optional[AgentScheduler] = None


async def get_scheduler() -> AgentScheduler:
    """Get or create the global scheduler."""
    global _scheduler
    if _scheduler is None:
        _scheduler = AgentScheduler()
        await _scheduler.start()
    return _scheduler


async def run_scheduler():
    """Run the scheduler (for CLI command)."""
    scheduler = await get_scheduler()
    try:
        # Keep running
        while True:
            await asyncio.sleep(60)
    except KeyboardInterrupt:
        await scheduler.stop()


async def shutdown_scheduler():
    """Shutdown the global scheduler."""
    global _scheduler
    if _scheduler:
        await _scheduler.stop()
        _scheduler = None