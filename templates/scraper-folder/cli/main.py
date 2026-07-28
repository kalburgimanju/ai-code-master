"""CLI entry point for the AI job scraper."""

from __future__ import annotations

import csv
import json
import logging
import sys
from datetime import datetime
from pathlib import Path

import click
from rich.console import Console
from rich.table import Table

from scraper.config import AppConfig
from scraper.storage import (
    export_to_csv,
    export_to_json,
    load_all_jobs,
    save_job_summary,
)
from scraper.gdrive import upload_latest_exports

console = Console()
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)


@click.group()
@click.option("--config", default="config.yaml", help="Config file path")
@click.pass_context
def cli(ctx: click.Context, config: str) -> None:
    """AI Automation Job Scraper — find high-paying remote roles with few applicants."""
    ctx.ensure_object(dict)
    ctx.obj["config_path"] = config
    ctx.obj["config"] = AppConfig.load(config)


@cli.command()
@click.pass_context
def scrape(ctx: click.Context) -> None:
    """Run a full scrape: query LinkedIn via Apify, filter, and store."""
    config: AppConfig = ctx.obj["config"]
    if not config.settings.apify_api_token:
        console.print("[red]Error: APIFY_API_TOKEN not set. Create .env file with your token.[/red]")
        sys.exit(1)

    from scraper.scraper import Scraper
    with console.status("[bold green]Scraping AI automation jobs...[/bold green]"):
        scraper = Scraper(config)
        result = scraper.run()

    # Print summary
    console.print()
    console.print(f"[bold]Scrape Run: {result.run_id}[/bold]")
    console.print(f"  Total scraped: {result.total_scraped}")
    console.print(f"  After filters: {result.total_filtered}")
    console.print(f"  Estimated cost: ${result.cost_estimate:.2f}")
    console.print(f"  Queries used: {len(result.queries_used)}")
    console.print()

    if result.jobs:
        _print_jobs_table(result.jobs[:15], "Top 15 Opportunities")
    else:
        console.print("[yellow]No jobs matched filters. Try adjusting config.yaml[/yellow]")


@cli.command()
@click.option("--top", default=15, help="Number of top jobs to show")
@click.option("--format", "fmt", type=click.Choice(["table", "json", "csv"]), default="table")
@click.option("--output", "-o", help="Output file path (for csv/json)")
@click.pass_context
def export(ctx: click.Context, top: int, fmt: str, output: str | None) -> None:
    """Export top job listings as CSV, JSON, or table."""
    config: AppConfig = ctx.obj["config"]
    jobs = sorted(
        load_all_jobs(config.settings.data_dir),
        key=lambda j: (j.applicant_count or 999, -(j.salary.min_amount or 0)),
    )[:top]

    if not jobs:
        console.print("[yellow]No jobs found. Run 'ai-scraper scrape' first.[/yellow]")
        return

    if fmt == "table":
        _print_jobs_table(jobs, f"Top {len(jobs)} AI Automation Jobs")
    elif fmt == "csv":
        path = output or f"data/export_{datetime.now():%Y%m%d_%H%M%S}.csv"
        export_to_csv(jobs, path)
        console.print(f"[green]Exported {len(jobs)} jobs to {path}[/green]")
    elif fmt == "json":
        path = output or f"data/export_{datetime.now():%Y%m%d_%H%M%S}.json"
        export_to_json(jobs, path)
        console.print(f"[green]Exported {len(jobs)} jobs to {path}[/green]")


@cli.command()
@click.pass_context
def dashboard(ctx: click.Context) -> None:
    """Start the web dashboard."""
    console.print("[bold]Starting dashboard...[/bold]")
    console.print("Open http://localhost:5173 in your browser")
    import subprocess
    subprocess.run(["npm", "run", "dev"], cwd="dashboard", check=True)


@cli.command()
@click.option("--port", default=8080, help="API server port")
@click.pass_context
def serve(ctx: click.Context, port: int) -> None:
    """Start the API server + dashboard together."""
    config: AppConfig = ctx.obj["config"]

    from scraper.api import start_api_server
    start_api_server(config, port=port, config_path=ctx.obj["config_path"])

    console.print(f"[bold green]API server running on http://127.0.0.1:{port}[/bold green]")
    console.print("[bold]Starting dashboard...[/bold]")
    console.print("Open http://localhost:5174 in your browser")
    import subprocess
    dashboard_dir = Path(__file__).resolve().parent.parent / "dashboard"
    subprocess.run(["npm", "run", "dev"], cwd=str(dashboard_dir), check=True)


@cli.command()
@click.pass_context
def schedule(ctx: click.Context) -> None:
    """Start the weekly scrape scheduler."""
    config: AppConfig = ctx.obj["config"]
    console.print("[bold green]Starting weekly scheduler (Monday 9 AM UTC)...[/bold green]")
    console.print("Press Ctrl+C to stop")
    from scraper.scheduler import start_scheduler
    start_scheduler(config)


@cli.command()
@click.pass_context
def summary(ctx: click.Context) -> None:
    """Show summary statistics from all scraped data."""
    config: AppConfig = ctx.obj["config"]
    jobs = load_all_jobs(config.settings.data_dir)
    if not jobs:
        console.print("[yellow]No data. Run 'ai-scraper scrape' first.[/yellow]")
        return

    total = len(jobs)
    remote = sum(1 for j in jobs if j.is_remote)
    contractor = sum(1 for j in jobs if j.is_contractor_friendly)
    avg_applicants = (
        sum(j.applicant_count or 0 for j in jobs if j.applicant_count)
        / max(1, sum(1 for j in jobs if j.applicant_count))
    )

    # Skill counts
    skill_counts = {}
    for job in jobs:
        for skill in job.skills:
            skill_counts[skill] = skill_counts.get(skill, 0) + 1
    top_skills = sorted(skill_counts.items(), key=lambda x: x[1], reverse=True)[:10]

    console.print()
    console.print("[bold]📊 Job Market Summary[/bold]")
    console.print(f"  Total jobs: {total}")
    console.print(f"  Remote: {remote} ({remote*100//max(1,total)}%)")
    console.print(f"  Contractor-friendly: {contractor} ({contractor*100//max(1,total)}%)")
    console.print(f"  Avg applicants: {avg_applicants:.1f}")
    console.print()
    console.print("[bold]Top Skills:[/bold]")
    for skill, count in top_skills:
        console.print(f"  {skill}: {count} jobs")


@cli.command()
@click.option("--format", "fmt", type=click.Choice(["csv", "json", "both"]), default="both", help="Format to upload")
@click.pass_context
def upload_drive(ctx: click.Context, fmt: str) -> None:
    """Upload latest export files to Google Drive."""
    config: AppConfig = ctx.obj["config"]

    if not config.google_drive.enabled:
        console.print("[red]Google Drive upload not enabled. Set google_drive.enabled: true in config.yaml[/red]")
        sys.exit(1)

    if not config.google_drive.folder_id:
        console.print("[red]Google Drive folder_id not configured. Add folder_id to config.yaml[/red]")
        sys.exit(1)

    if not Path(config.google_drive.credentials_file).exists():
        console.print(f"[red]Credentials file not found: {config.google_drive.credentials_file}[/red]")
        console.print("Download from Google Cloud Console and save as credentials.json")
        sys.exit(1)

    with console.status("[bold green]Uploading to Google Drive...[/bold green]"):
        try:
            if fmt == "csv":
                config.google_drive.upload_formats = ["csv"]
            elif fmt == "json":
                config.google_drive.upload_formats = ["json"]

            results = upload_latest_exports(config)

            if results:
                console.print("[green]Successfully uploaded:[/green]")
                for fmt_name, file_id in results.items():
                    console.print(f"  {fmt_name}: https://drive.google.com/file/d/{file_id}/view")
            else:
                console.print("[yellow]No files uploaded. Run 'ai-scraper export' first.[/yellow]")
        except Exception as e:
            console.print(f"[red]Upload failed: {e}[/red]")
            sys.exit(1)


def _print_jobs_table(jobs: list, title: str) -> None:
    """Print jobs in a rich table."""
    table = Table(title=title, show_lines=True)
    table.add_column("#", style="dim", width=3)
    table.add_column("Title", style="bold", max_width=35)
    table.add_column("Company", max_width=20)
    table.add_column("Salary", style="green", max_width=15)
    table.add_column("Applicants", style="yellow", width=10)
    table.add_column("Remote", style="cyan", width=6)
    table.add_column("Link", max_width=40)

    for i, job in enumerate(jobs, 1):
        applicants = str(job.applicant_count) if job.applicant_count is not None else "?"
        remote = "Yes" if job.is_remote else "No"
        url = job.url[:37] + "..." if len(job.url) > 40 else job.url
        table.add_row(
            str(i),
            job.title[:35],
            job.company[:20],
            job.salary.display,
            applicants,
            remote,
            url,
        )

    console.print(table)


if __name__ == "__main__":
    cli()
