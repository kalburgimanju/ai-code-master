"""Pipeline Agent - manages deal pipeline and CRM synchronization."""

import asyncio
from datetime import datetime, timedelta
from typing import Any, Optional
from uuid import uuid4

from backend.agents.base import BaseAgent, AgentContext, AgentResult
from backend.config import get_settings
from backend.storage import get_db_session
from backend.storage.models import (
    Company,
    CompanyStage,
    Contact,
    PipelineDeal,
    DealActivity,
    CallBooking,
    EmailLog,
    EmailStatus,
)


class PipelineAgent(BaseAgent):
    """Agent that manages the recruitment pipeline and syncs with CRM."""

    def __init__(self, agent_config):
        super().__init__(agent_config)
        self.settings = get_settings()
        self._crm_client = None

    @property
    def crm_client(self):
        if self._crm_client is None:
            from backend.services.crm import CRMClient
            self._crm_client = CRMClient()
        return self._crm_client

    async def run(self, context: AgentContext) -> AgentResult:
        """Run pipeline management tasks."""
        mode = context.input_data.get("mode", "sync")  # sync, advance, analyze, report

        step = self.log_step(f"Starting pipeline {mode}", f"Mode: {mode}")
        await self._save_run_progress()

        if mode == "sync":
            result = await self._sync_pipeline()
        elif mode == "advance":
            result = await self._auto_advance_stages()
        elif mode == "analyze":
            result = await self._analyze_pipeline()
        elif mode == "report":
            result = await self._generate_report()
        else:
            self.complete_step_log(step, False, f"Unknown mode: {mode}")
            await self._save_run_progress()
            return AgentResult(
                success=False,
                error_message=f"Unknown mode: {mode}",
            )

        self.complete_step_log(step, result.success, f"Pipeline {mode} complete")
        await self._save_run_progress()
        return result

    async def _sync_pipeline(self) -> AgentResult:
        """Sync pipeline with CRM."""
        step = self.log_step("Syncing pipeline with CRM", "Finding deals to sync")
        await self._save_run_progress()

        async with get_db_session() as session:
            from sqlalchemy import select
            from backend.storage.models import PipelineDeal, Company, Contact

            # Get deals that need syncing
            stmt = select(PipelineDeal).where(
                PipelineDeal.crm_synced_at.is_(None) |
                (PipelineDeal.updated_at > PipelineDeal.crm_synced_at)
            )
            result = await session.execute(stmt)
            deals = result.scalars().all()

            self.complete_step_log(step, True, f"Found {len(deals)} deals to sync")
            await self._save_run_progress()

            results = {"synced": 0, "created": 0, "updated": 0, "errors": []}

            for i, deal in enumerate(deals):
                sync_step = self.log_step(f"Syncing deal {i+1}/{len(deals)}", f"Deal: {deal.name}")
                await self._save_run_progress()

                try:
                    if deal.crm_deal_id:
                        success = await self.crm_client.update_deal(deal)
                        if success:
                            results["updated"] += 1
                            self.complete_step_log(sync_step, True, f"Updated: {deal.name}")
                        else:
                            self.complete_step_log(sync_step, False, f"Update failed: {deal.name}")
                    else:
                        crm_deal_id = await self.crm_client.create_deal(deal)
                        if crm_deal_id:
                            deal.crm_deal_id = crm_deal_id
                            deal.crm_synced_at = datetime.utcnow()
                            results["created"] += 1
                            self.complete_step_log(sync_step, True, f"Created: {deal.name}")
                        else:
                            self.complete_step_log(sync_step, False, f"Create failed: {deal.name}")

                    results["synced"] += 1

                except Exception as e:
                    results["errors"].append(f"Deal {deal.id}: {str(e)}")
                    self.log(f"Sync failed for deal {deal.id}: {e}", "ERROR")
                    self.complete_step_log(sync_step, False, f"Error: {e}")
                await self._save_run_progress()

            await session.commit()

        step = self.log_step("CRM sync complete", f"Synced: {results['synced']}, Errors: {len(results['errors'])}")
        self.complete_step_log(step, True)
        await self._save_run_progress()

        return AgentResult(
            success=len(results["errors"]) == 0,
            items_processed=len(deals),
            items_succeeded=results["synced"],
            items_failed=len(results["errors"]),
            output_data=results,
        )

    async def _auto_advance_stages(self) -> AgentResult:
        """Automatically advance deal stages based on activity."""
        step = self.log_step("Auto-advancing deal stages", "Checking active deals")
        await self._save_run_progress()

        async with get_db_session() as session:
            from sqlalchemy import select, and_, or_
            from backend.storage.models import PipelineDeal, CallBooking, EmailLog

            # Get active deals
            stmt = select(PipelineDeal).where(
                PipelineDeal.stage.in_([
                    CompanyStage.DISCOVERED,
                    CompanyStage.RESEARCHED,
                    CompanyStage.CONTACTED,
                    CompanyStage.REPLIED,
                    CompanyStage.CALL_BOOKED,
                    CompanyStage.QUALIFIED,
                ])
            )
            result = await session.execute(stmt)
            deals = result.scalars().all()

            self.complete_step_log(step, True, f"Found {len(deals)} active deals")
            await self._save_run_progress()

            results = {"advanced": 0, "checked": len(deals), "errors": []}

            for i, deal in enumerate(deals):
                adv_step = self.log_step(f"Checking deal {i+1}/{len(deals)}", f"Deal: {deal.name}")
                await self._save_run_progress()

                try:
                    new_stage = await self._determine_next_stage(deal, session)
                    if new_stage and new_stage != deal.stage:
                        old_stage = deal.stage
                        deal.stage = new_stage
                        deal.stage_changed_at = datetime.utcnow()
                        deal.probability = self._get_stage_probability(new_stage)
                        results["advanced"] += 1
                        self.complete_step_log(adv_step, True, f"Advanced: {old_stage.value} → {new_stage.value}")

                        # Log activity
                        activity = DealActivity(
                            deal_id=deal.id,
                            type="stage_change",
                            title=f"Stage Advanced: {old_stage.value} → {new_stage.value}",
                            description=f"Auto-advanced based on activity signals",
                            metadata={"old_stage": old_stage.value, "new_stage": new_stage.value, "auto": True},
                            performed_by="pipeline_agent",
                        )
                        session.add(activity)
                    else:
                        self.complete_step_log(adv_step, True, f"No change needed: {deal.name}")

                except Exception as e:
                    results["errors"].append(f"Deal {deal.id}: {str(e)}")
                    self.complete_step_log(adv_step, False, f"Error: {e}")
                await self._save_run_progress()

            await session.commit()

        step = self.log_step("Stage advancement complete", f"Advanced: {results['advanced']}, Checked: {results['checked']}")
        self.complete_step_log(step, True)
        await self._save_run_progress()

        return AgentResult(
            success=True,
            items_processed=results["checked"],
            items_succeeded=results["advanced"],
            output_data=results,
        )

    async def _determine_next_stage(self, deal: PipelineDeal, session) -> Optional[CompanyStage]:
        """Determine the next stage for a deal based on activity."""
        current = deal.stage

        # Get latest activities
        from sqlalchemy import select, desc
        from backend.storage.models import CallBooking, EmailLog

        # Check for booked calls
        call_stmt = select(CallBooking).where(
            CallBooking.deal_id == deal.id,
            CallBooking.status.in_(["scheduled", "confirmed"]),
        ).order_by(desc(CallBooking.created_at))
        call_result = await session.execute(call_stmt)
        upcoming_call = call_result.scalar_one_or_none()

        # Check for email replies
        email_stmt = select(EmailLog).where(
            EmailLog.campaign_id == deal.source_campaign_id,
            EmailLog.company_id == deal.company_id,
            EmailLog.replied_at.isnot(None),
        ).order_by(desc(EmailLog.replied_at))
        email_result = await session.execute(email_stmt)
        latest_reply = email_result.scalar_one_or_none()

        # Check for completed calls
        completed_call_stmt = select(CallBooking).where(
            CallBooking.deal_id == deal.id,
            CallBooking.status == "completed",
        ).order_by(desc(CallBooking.completed_at))
        completed_call_result = await session.execute(completed_call_stmt)
        completed_call = completed_call_result.scalar_one_or_none()

        # Stage progression logic
        if current == CompanyStage.DISCOVERED:
            # Move to researched if company has been enriched
            if deal.company and deal.company.last_enriched_at:
                return CompanyStage.RESEARCHED

        elif current == CompanyStage.RESEARCHED:
            # Move to contacted if email sent
            if deal.source_campaign_id:
                email_stmt = select(EmailLog).where(
                    EmailLog.campaign_id == deal.source_campaign_id,
                    EmailLog.company_id == deal.company_id,
                    EmailLog.status.in_([EmailStatus.SENT, EmailStatus.DELIVERED]),
                )
                email_result = await session.execute(email_stmt)
                if email_result.scalar_one_or_none():
                    return CompanyStage.CONTACTED

        elif current == CompanyStage.CONTACTED:
            # Move to replied if we got a reply
            if latest_reply:
                return CompanyStage.REPLIED

        elif current == CompanyStage.REPLIED:
            # Move to call_booked if call scheduled
            if upcoming_call:
                return CompanyStage.CALL_BOOKED

        elif current == CompanyStage.CALL_BOOKED:
            # Move to qualified if call completed
            if completed_call:
                return CompanyStage.QUALIFIED

        elif current == CompanyStage.QUALIFIED:
            # Could advance to proposal_sent based on call outcome
            if completed_call and completed_call.outcome:
                outcome_lower = completed_call.outcome.lower()
                if any(kw in outcome_lower for kw in ["proposal", "quote", "pricing", "contract"]):
                    return CompanyStage.PROPOSAL_SENT

        return None

    def _get_stage_probability(self, stage: CompanyStage) -> int:
        """Get probability percentage for a stage."""
        probabilities = {
            CompanyStage.DISCOVERED: 5,
            CompanyStage.RESEARCHED: 15,
            CompanyStage.CONTACTED: 25,
            CompanyStage.REPLIED: 40,
            CompanyStage.CALL_BOOKED: 60,
            CompanyStage.QUALIFIED: 75,
            CompanyStage.PROPOSAL_SENT: 90,
            CompanyStage.CLOSED_WON: 100,
            CompanyStage.CLOSED_LOST: 0,
        }
        return probabilities.get(stage, 5)

    async def _analyze_pipeline(self) -> AgentResult:
        """Analyze pipeline health and generate insights."""
        step = self.log_step("Analyzing pipeline health", "Computing metrics")
        await self._save_run_progress()

        async with get_db_session() as session:
            from sqlalchemy import select, func, and_
            from backend.storage.models import PipelineDeal, Company, CompanyStage

            # Total pipeline value
            stmt = select(
                func.count(PipelineDeal.id),
                func.sum(PipelineDeal.value_usd),
                func.avg(PipelineDeal.probability),
            ).where(
                PipelineDeal.stage.in_([
                    CompanyStage.DISCOVERED,
                    CompanyStage.RESEARCHED,
                    CompanyStage.CONTACTED,
                    CompanyStage.REPLIED,
                    CompanyStage.CALL_BOOKED,
                    CompanyStage.QUALIFIED,
                    CompanyStage.PROPOSAL_SENT,
                ])
            )
            result = await session.execute(stmt)
            total_count, total_value, avg_prob = result.one()

            # By stage
            stmt = select(
                PipelineDeal.stage,
                func.count(PipelineDeal.id),
                func.sum(PipelineDeal.value_usd),
            ).where(
                PipelineDeal.stage.in_([
                    CompanyStage.DISCOVERED,
                    CompanyStage.RESEARCHED,
                    CompanyStage.CONTACTED,
                    CompanyStage.REPLIED,
                    CompanyStage.CALL_BOOKED,
                    CompanyStage.QUALIFIED,
                    CompanyStage.PROPOSAL_SENT,
                ])
            ).group_by(PipelineDeal.stage)
            result = await session.execute(stmt)
            by_stage = {row[0].value: {"count": row[1], "value": row[2] or 0} for row in result.fetchall()}

            # Weighted pipeline
            weighted_value = 0
            for stage, data in by_stage.items():
                prob = self._get_stage_probability(CompanyStage(stage))
                weighted_value += data["value"] * (prob / 100)

            # Conversion rates
            stmt = select(
                func.count(PipelineDeal.id),
            ).where(PipelineDeal.stage == CompanyStage.CLOSED_WON)
            result = await session.execute(stmt)
            won_count = result.scalar() or 0

            stmt = select(
                func.count(PipelineDeal.id),
            ).where(PipelineDeal.stage == CompanyStage.CLOSED_LOST)
            result = await session.execute(stmt)
            lost_count = result.scalar() or 0

            win_rate = won_count / (won_count + lost_count) if (won_count + lost_count) > 0 else 0

            # Average deal cycle
            stmt = select(
                func.avg(func.extract('epoch', PipelineDeal.closed_at - PipelineDeal.created_at) / 86400),
            ).where(
                PipelineDeal.stage == CompanyStage.CLOSED_WON,
                PipelineDeal.closed_at.isnot(None),
            )
            result = await session.execute(stmt)
            avg_cycle_days = result.scalar() or 0

            analysis = {
                "total_deals": total_count or 0,
                "total_pipeline_value": total_value or 0,
                "weighted_pipeline_value": weighted_value,
                "average_probability": avg_prob or 0,
                "by_stage": by_stage,
                "won_deals": won_count,
                "lost_deals": lost_count,
                "win_rate": win_rate,
                "average_cycle_days": avg_cycle_days,
                "generated_at": datetime.utcnow().isoformat(),
            }

        self.complete_step_log(step, True, f"Analyzed {analysis['total_deals']} deals, ${analysis['total_pipeline_value']:,.0f} pipeline")
        await self._save_run_progress()

        return AgentResult(
            success=True,
            items_processed=1,
            items_succeeded=1,
            output_data=analysis,
        )

    async def _generate_report(self) -> AgentResult:
        """Generate pipeline report."""
        step = self.log_step("Generating pipeline report", "Analyzing pipeline data")
        await self._save_run_progress()

        analysis_result = await self._analyze_pipeline()
        analysis = analysis_result.output_data

        self.complete_step_log(step, True, f"Analysis complete: {analysis['total_deals']} deals")
        await self._save_run_progress()

        report_step = self.log_step("Building report", "Formatting metrics and insights")
        await self._save_run_progress()

        # Create formatted report
        report = f"""
Pipeline Report - {datetime.utcnow().strftime('%Y-%m-%d %H:%M')}

SUMMARY
-------
Total Active Deals: {analysis['total_deals']}
Total Pipeline Value: ${analysis['total_pipeline_value']:,.0f}
Weighted Pipeline Value: ${analysis['weighted_pipeline_value']:,.0f}
Average Probability: {analysis['average_probability']:.1f}%
Win Rate: {analysis['win_rate']:.1%}
Average Cycle: {analysis['average_cycle_days']:.0f} days

BY STAGE
--------
"""

        stage_order = [
            CompanyStage.DISCOVERED.value,
            CompanyStage.RESEARCHED.value,
            CompanyStage.CONTACTED.value,
            CompanyStage.REPLIED.value,
            CompanyStage.CALL_BOOKED.value,
            CompanyStage.QUALIFIED.value,
            CompanyStage.PROPOSAL_SENT.value,
        ]

        for stage in stage_order:
            if stage in analysis['by_stage']:
                data = analysis['by_stage'][stage]
                prob = self._get_stage_probability(CompanyStage(stage))
                weighted = data['value'] * (prob / 100)
                report += f"  {stage:20s}: {data['count']:3d} deals | ${data['value']:>12,.0f} | {prob:3d}% | ${weighted:,.0f} weighted\n"

        report += f"""
WON/LOST
--------
Won: {analysis['won_deals']}
Lost: {analysis['lost_deals']}

TOP INSIGHTS
------------
"""

        # Generate insights
        if analysis['total_deals'] > 0:
            # Stage distribution
            early_stage = sum(analysis['by_stage'].get(s, {}).get('count', 0) for s in ['discovered', 'researched', 'contacted'])
            late_stage = sum(analysis['by_stage'].get(s, {}).get('count', 0) for s in ['qualified', 'proposal_sent'])

            if early_stage > late_stage * 2:
                report += "• Pipeline is top-heavy - focus on advancing deals\n"
            elif late_stage > early_stage:
                report += "• Good pipeline progression - deals moving forward\n"

            if analysis['win_rate'] < 0.2:
                report += "• Low win rate - review qualification criteria\n"
            elif analysis['win_rate'] > 0.5:
                report += "• Strong win rate - consider increasing outreach volume\n"

            if analysis['average_cycle_days'] > 60:
                report += "• Long sales cycle - identify bottlenecks\n"

        self.complete_step_log(report_step, True, f"Report generated: {len(report)} chars")
        await self._save_run_progress()

        return AgentResult(
            success=True,
            items_processed=1,
            items_succeeded=1,
            output_data={"report": report, "analysis": analysis},
        )