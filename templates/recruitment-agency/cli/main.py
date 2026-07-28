"""CLI entry point for the recruitment agency platform."""

import asyncio
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Optional

import click
from rich.console import Console
from rich.table import Table
from rich.progress import Progress, SpinnerColumn, TextColumn

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from backend.config import load_config, Settings, get_settings
from backend.storage import get_db_manager, DatabaseManager
from backend.agents import (
    create_agent,
    get_agent_class,
    CompanyDiscoveryAgent,
    CompanyResearchAgent,
    OutreachAgent,
    FollowupAgent,
    SchedulerAgent,
    PipelineAgent,
)
from backend.storage.models import AgentConfig, AgentStatus


console = Console()


@click.group()
@click.option("--config", default="config.yaml", help="Config file path")
@click.pass_context
def cli(ctx: click.Context, config: str):
    """Recruitment Agency Autonomous Agents Platform."""
    ctx.ensure_object(dict)
    ctx.obj["config_path"] = config
    ctx.obj["settings"] = load_config(config)


@cli.command()
@click.option("--name", prompt="Agent name", help="Name for the agent")
@click.option("--type", "agent_type", default="discovery", type=click.Choice(["discovery", "research", "outreach", "followup", "scheduler", "pipeline"]), help="Agent type")
@click.option("--persona", default="saas_hunter", type=click.Choice(["saas_hunter", "fintech_recruiter", "ai_ml_specialist"]), help="Agent persona template")
@click.pass_context
def agent_create(ctx: click.Context, name: str, type: str, persona: str):
    """Create a new agent configuration."""
    settings: Settings = ctx.obj["settings"]

    # Load persona template
    personas = settings.agent_personas
    persona_config = getattr(personas, persona, None)

    if not persona_config:
        console.print(f"[red]Unknown persona: {persona}[/red]")
        return

    # Create agent config
    agent_config = AgentConfig(
        name=name,
        description=persona_config.description,
        persona=persona_config.persona,
        specialization=persona_config.specialization,
        value_prop=persona_config.value_prop,
        case_study=persona_config.case_study,
        status=AgentStatus.INACTIVE,
    )

    # Apply persona-specific configs
    if persona_config.discovery:
        agent_config.discovery_industries = persona_config.discovery.industries
        agent_config.discovery_company_size = persona_config.discovery.company_size
        agent_config.discovery_hiring_signals = persona_config.discovery.hiring_signals
        agent_config.max_companies_per_run = 50

    if persona_config.research:
        agent_config.research_depth = persona_config.research.depth
        agent_config.research_focus_areas = persona_config.research.focus_areas

    if persona_config.outreach:
        agent_config.outreach_tone = persona_config.outreach.tone
        agent_config.outreach_templates_dir = persona_config.outreach.templates_dir
        agent_config.outreach_daily_limit = 50
        agent_config.outreach_delay_seconds = 30

    if persona_config.followup:
        agent_config.followup_sequence = persona_config.followup.sequence

    if persona_config.scheduler:
        agent_config.scheduler_meeting_type = persona_config.scheduler.meeting_type
        agent_config.scheduler_duration_minutes = persona_config.scheduler.duration

    console.print(f"[green]Created agent: {name}[/green]")
    console.print(f"  Type: {type}")
    console.print(f"  Persona: {persona}")
    console.print(f"  Status: {agent_config.status.value}")


@cli.command()
@click.option("--name", required=True, help="Agent name")
@click.option("--mode", default="full", type=click.Choice(["discovery", "research", "outreach", "followup", "scheduler", "pipeline", "full"]), help="Run mode")
@click.option("--dry-run", is_flag=True, help="Run without sending emails/booking calls")
@click.pass_context
def agent_run(ctx: click.Context, name: str, mode: str, dry_run: bool):
    """Run an agent."""
    settings: Settings = ctx.obj["settings"]

    # Get agent config from database
    async def _run():
        db = get_db_manager()
        async with db.session() as session:
            from sqlalchemy import select
            stmt = select(AgentConfig).where(AgentConfig.name == name)
            result = await session.execute(stmt)
            agent_config = result.scalar_one_or_none()

            if not agent_config:
                console.print(f"[red]Agent not found: {name}[/red]")
                return

            agent = create_agent(type, agent_config)
            if not agent:
                console.print(f"[red]Unknown agent type: {type}[/red]")
                return

            from backend.agents.base import AgentContext
            context = AgentContext(
                agent_id=agent_config.id,
                agent_config=agent_config,
                run_id=datetime.utcnow().strftime("%Y%m%d_%H%M%S"),
                mode=mode,
                input_data={"dry_run": dry_run},
            )

            with Progress(
                SpinnerColumn(),
                TextColumn("[progress.description]{task.description}"),
                console=console,
            ) as progress:
                task = progress.add_task(f"Running {name} ({mode})...", total=None)
                result = await agent.execute(context)
                progress.update(task, completed=True)

            if result.success:
                console.print(f"[green]✓ Agent run completed successfully[/green]")
                console.print(f"  Processed: {result.items_processed}")
                console.print(f"  Succeeded: {result.items_succeeded}")
                console.print(f"  Failed: {result.items_failed}")
                console.print(f"  Duration: {result.duration_seconds:.1f}s")
            else:
                console.print(f"[red]✗ Agent run failed: {result.error_message}[/red]")

    asyncio.run(_run())


@cli.command()
@click.pass_context
def agent_list(ctx: click.Context):
    """List all agents."""
    async def _list():
        db = get_db_manager()
        async with db.session() as session:
            from sqlalchemy import select
            stmt = select(AgentConfig).order_by(AgentConfig.created_at.desc())
            result = await session.execute(stmt)
            agents = result.scalars().all()

            if not agents:
                console.print("[yellow]No agents configured[/yellow]")
                return

            table = Table(title="Agents")
            table.add_column("Name", style="cyan")
            table.add_column("Type", style="green")
            table.add_column("Status", style="yellow")
            table.add_column("Last Run", style="dim")
            table.add_column("Next Run", style="dim")

            for agent in agents:
                table.add_row(
                    agent.name,
                    agent.specialization or "N/A",
                    agent.status.value,
                    agent.last_run_at.strftime("%Y-%m-%d %H:%M") if agent.last_run_at else "Never",
                    agent.next_run_at.strftime("%Y-%m-%d %H:%M") if agent.next_run_at else "Not scheduled",
                )

            console.print(table)

    asyncio.run(_list())


@cli.command()
@click.option("--port", default=8000, help="API server port")
@click.option("--host", default="0.0.0.0", help="API server host")
@click.option("--reload", is_flag=True, help="Enable auto-reload")
@click.pass_context
def serve(ctx: click.Context, port: int, host: str, reload: bool):
    """Start the FastAPI server."""
    import uvicorn

    console.print(f"[green]Starting API server on {host}:{port}[/green]")
    uvicorn.run(
        "backend.main:app",
        host=host,
        port=port,
        reload=reload,
    )


@cli.command()
@click.pass_context
def dashboard(ctx: click.Context):
    """Start the React dashboard."""
    import subprocess

    dashboard_dir = Path(__file__).parent.parent / "dashboard"
    if not dashboard_dir.exists():
        console.print("[red]Dashboard not found. Run 'npm install' in dashboard/ first.[/red]")
        return

    console.print("[green]Starting dashboard...[/green]")
    console.print("Open http://localhost:5173 in your browser")

    try:
        subprocess.run(["npm", "run", "dev"], cwd=dashboard_dir, check=True)
    except KeyboardInterrupt:
        console.print("\n[yellow]Dashboard stopped[/yellow]")
    except FileNotFoundError:
        console.print("[red]npm not found. Please install Node.js[/red]")


@cli.command()
@click.pass_context
def schedule_start(ctx: click.Context):
    """Start the background scheduler."""
    from backend.scheduler import run_scheduler

    console.print("[green]Starting background scheduler...[/green]")
    console.print("Press Ctrl+C to stop")

    try:
        asyncio.run(run_scheduler())
    except KeyboardInterrupt:
        console.print("\n[yellow]Scheduler stopped[/yellow]")


@cli.command()
@click.option("--name", required=True, help="Campaign name")
@click.option("--agent", required=True, help="Agent name")
@click.option("--sequence", default="standard_3_touch", help="Follow-up sequence")
@click.pass_context
def campaign_create(ctx: click.Context, name: str, agent: str, sequence: str):
    """Create a new outreach campaign."""
    async def _create():
        db = get_db_manager()
        async with db.session() as session:
            from sqlalchemy import select
            from backend.storage.models import OutreachCampaign, AgentConfig

            # Get agent
            stmt = select(AgentConfig).where(AgentConfig.name == agent)
            result = await session.execute(stmt)
            agent_config = result.scalar_one_or_none()

            if not agent_config:
                console.print(f"[red]Agent not found: {agent}[/red]")
                return

            campaign = OutreachCampaign(
                agent_id=agent_config.id,
                name=name,
                sequence_name=sequence,
                status="draft",
            )

            session.add(campaign)
            await session.commit()
            await session.refresh(campaign)

            console.print(f"[green]Created campaign: {name}[/green]")
            console.print(f"  ID: {campaign.id}")
            console.print(f"  Agent: {agent}")
            console.print(f"  Sequence: {sequence}")

    asyncio.run(_create())


@cli.command()
@click.option("--name", required=True, help="Campaign name")
@click.option("--dry-run", is_flag=True, help="Run without sending emails")
@click.pass_context
def campaign_launch(ctx: click.Context, name: str, dry_run: bool):
    """Launch a campaign."""
    async def _launch():
        db = get_db_manager()
        async with db.session() as session:
            from sqlalchemy import select
            from backend.storage.models import OutreachCampaign

            stmt = select(OutreachCampaign).where(OutreachCampaign.name == name)
            result = await session.execute(stmt)
            campaign = result.scalar_one_or_none()

            if not campaign:
                console.print(f"[red]Campaign not found: {name}[/red]")
                return

            campaign.status = "running"
            campaign.started_at = datetime.utcnow()
            await session.commit()

        # Run outreach agent
        settings: Settings = ctx.obj["settings"]
        agent = OutreachAgent(campaign.agent_config)

        from backend.agents.base import AgentContext
        context = AgentContext(
            agent_id=campaign.agent_id,
            agent_config=campaign.agent_config,
            run_id=datetime.utcnow().strftime("%Y%m%d_%H%M%S"),
            mode="outreach",
            input_data={"campaign_id": campaign.id, "dry_run": dry_run},
        )

        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=console,
        ) as progress:
            task = progress.add_task(f"Launching campaign {name}...", total=None)
            result = await agent.execute(context)
            progress.update(task, completed=True)

        if result.success:
            console.print(f"[green]✓ Campaign launched[/green]")
            console.print(f"  Emails sent: {result.items_succeeded}")
        else:
            console.print(f"[red]✗ Campaign failed: {result.error_message}[/red]")

    asyncio.run(_launch())


@cli.command()
@click.pass_context
def db_init(ctx: click.Context):
    """Initialize the database."""
    async def _init():
        db = get_db_manager()
        await db.create_tables()
        console.print("[green]Database initialized successfully[/green]")

    asyncio.run(_init())


@cli.command()
@click.pass_context
def db_migrate(ctx: click.Context):
    """Run database migrations."""
    async def _migrate():
        import subprocess
        result = subprocess.run(["alembic", "upgrade", "head"], capture_output=True, text=True)
        if result.returncode == 0:
            console.print("[green]Migrations applied successfully[/green]")
        else:
            console.print(f"[red]Migration failed: {result.stderr}[/red]")

    asyncio.run(_migrate())


@cli.command()
@click.option("--email", required=True, help="Test email address")
@click.option("--template", default="initial_outreach", help="Template to use")
@click.pass_context
def test_email(ctx: click.Context, email: str, template: str):
    """Send a test email."""
    from backend.services.email import EmailService

    console.print(f"[green]Sending test email to {email}...[/green]")

    service = EmailService()
    result = asyncio.run(service.send_email(
        to_email=email,
        to_name="Test Recipient",
        subject=f"Test: {template}",
        body_text=f"This is a test email using template: {template}",
        body_html=f"<p>This is a test email using template: <strong>{template}</strong></p>",
    ))

    if result.get("success", True):
        console.print(f"[green]✓ Test email sent[/green]")
        console.print(f"  Message ID: {result.get('message_id')}")
    else:
        console.print(f"[red]✗ Failed: {result.get('error')}[/red]")


@cli.command()
@click.pass_context
def config_show(ctx: click.Context):
    """Show current configuration."""
    settings: Settings = ctx.obj["settings"]
    console.print("[bold]Current Configuration:[/bold]")
    console.print(f"  Environment: {settings.environment}")
    console.print(f"  Database: {settings.database.url}")
    console.print(f"  LLM Model: {settings.llm.model}")
    console.print(f"  Features:")
    console.print(f"    AI Research: {settings.features.enable_ai_research}")
    console.print(f"    Auto Outreach: {settings.features.enable_auto_outreach}")
    console.print(f"    Auto Followup: {settings.features.enable_auto_followup}")
    console.print(f"    Auto Scheduling: {settings.features.enable_auto_scheduling}")
    console.print(f"    CRM Sync: {settings.features.enable_crm_sync}")
    console.print(f"    Dry Run Mode: {settings.features.dry_run_mode}")


@cli.command()
@click.option("--confirm", is_flag=True, help="Skip confirmation prompt")
@click.pass_context
def seed(ctx: click.Context, confirm: bool):
    """Seed the database with sample data for development."""
    if not confirm:
        console.print("[yellow]This will seed the database with sample agents, companies, contacts, campaigns, and deals.[/yellow]")
        if not click.confirm("Continue?"):
            return

    from backend.seed import seed as seed_data
    asyncio.run(seed_data())
    console.print("[green]Database seeded successfully![/green]")


if __name__ == "__main__":
    cli()