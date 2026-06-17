from __future__ import annotations

import shutil
import time
from pathlib import Path

import click
from rich.console import Console
from rich.table import Table

from .config import load_config
from .documents import generate_documents, save_documents
from .indeed_browser import IndeedBrowser, count_applications_today, log_application
from .matcher import filter_and_rank

console = Console()


def _ensure_config() -> Path:
    if Path("config.yaml").exists():
        return Path("config.yaml")
    example = Path("config.example.yaml")
    if example.exists():
        shutil.copy(example, "config.yaml")
        console.print("[yellow]Created config.yaml from example — edit it before applying.[/yellow]")
        return Path("config.yaml")
    raise click.ClickException("Missing config.yaml. Copy config.example.yaml first.")


@click.group()
@click.option("--config", "config_path", default="config.yaml", help="Path to config file")
@click.pass_context
def main(ctx: click.Context, config_path: str) -> None:
    """Indeed Job Assistant — tailored docs + assisted applications."""
    ctx.ensure_object(dict)
    ctx.obj["config_path"] = config_path


@main.command("init")
def init_cmd() -> None:
    """Create config.yaml and data folders from the example template."""
    _ensure_config()
    Path("data").mkdir(exist_ok=True)
    Path("data/generated").mkdir(parents=True, exist_ok=True)
    example_resume = Path("data/base_resume.md")
    if not example_resume.exists():
        example_resume.write_text(
            "# Your Name\n\nPaste your master resume here. The assistant tailors it per job.\n",
            encoding="utf-8",
        )
    console.print("[green]Ready. Edit config.yaml and data/base_resume.md, then run: indeed-assistant login[/green]")


@main.command("login")
@click.option("--headless", is_flag=True, help="Run browser headless (not recommended for login)")
@click.pass_context
def login_cmd(ctx: click.Context, headless: bool) -> None:
    """Sign in to Indeed once; session is saved for later runs."""
    config = load_config(ctx.obj["config_path"])
    with IndeedBrowser(config, headless=headless) as browser:
        browser.login_interactive()
    console.print("[green]Session saved. You can run search / apply commands next.[/green]")


@main.command("search")
@click.option("--headless", is_flag=True)
@click.pass_context
def search_cmd(ctx: click.Context, headless: bool) -> None:
    """Search Indeed and list jobs ranked by fit to your profile."""
    config = load_config(ctx.obj["config_path"])
    session = config.resolve(config.paths.session_file)
    if not session.exists():
        raise click.ClickException("No saved session. Run: indeed-assistant login")

    with IndeedBrowser(config, headless=headless) as browser:
        jobs = browser.search_jobs()

    matched = filter_and_rank(
        config.profile,
        jobs,
        config.search.min_match_score,
        config.search.max_jobs_per_run,
    )

    table = Table(title="Matching jobs")
    table.add_column("Score", justify="right")
    table.add_column("Title")
    table.add_column("Company")
    table.add_column("ID")
    for job in matched:
        table.add_row(
            f"{job.match_score:.2f}",
            job.title[:50],
            job.company[:30],
            job.job_id,
        )
    console.print(table)
    if not matched:
        console.print("[yellow]No jobs met the match threshold. Lower min_match_score in config.[/yellow]")


@main.command("generate")
@click.argument("job_id")
@click.option("--no-ai", is_flag=True, help="Use templates instead of OpenAI")
@click.pass_context
def generate_cmd(ctx: click.Context, job_id: str, no_ai: bool) -> None:
    """Generate tailored resume + cover letter for a job ID from the last search."""
    config = load_config(ctx.obj["config_path"])
    # Minimal job stub — user should run full apply flow for live metadata
    from .matcher import JobListing

    job = JobListing(
        job_id=job_id,
        title="Target role",
        company="Target company",
        location=config.profile.location,
        url=f"https://www.indeed.com/viewjob?jk={job_id}",
        snippet=config.search.query,
    )
    docs = generate_documents(config, job, use_ai=not no_ai)
    folder = save_documents(config, docs)
    console.print(f"[green]Saved to {folder}[/green]")


@main.command("apply")
@click.option("--dry-run", is_flag=True, help="Generate documents only; do not submit applications")
@click.option("--headless", is_flag=True)
@click.option("--no-ai", is_flag=True, help="Template-based documents")
@click.pass_context
def apply_cmd(ctx: click.Context, dry_run: bool, headless: bool, no_ai: bool) -> None:
    """
    Search, match, generate tailored materials, and apply on Indeed (with confirmation).
    """
    config = load_config(ctx.obj["config_path"])
    session = config.resolve(config.paths.session_file)
    if not session.exists() and not dry_run:
        raise click.ClickException("No saved session. Run: indeed-assistant login")

    applied_today = count_applications_today(config)
    remaining = config.application.max_applications_per_day - applied_today
    if remaining <= 0 and not dry_run:
        raise click.ClickException(
            f"Daily limit reached ({config.application.max_applications_per_day}). Try again tomorrow."
        )

    with IndeedBrowser(config, headless=headless) as browser:
        jobs = browser.search_jobs()

    matched = filter_and_rank(
        config.profile,
        jobs,
        config.search.min_match_score,
        min(config.search.max_jobs_per_run, remaining if not dry_run else config.search.max_jobs_per_run),
    )

    if not matched:
        console.print("[yellow]No matching jobs found.[/yellow]")
        return

    console.print(f"[bold]Found {len(matched)} matching job(s).[/bold]")

    with IndeedBrowser(config, headless=headless) as browser:
        for job in matched:
            console.print(f"\n[bold]{job.title}[/bold] @ {job.company} (score {job.match_score:.2f})")
            docs = generate_documents(config, job, use_ai=not no_ai)
            folder = save_documents(config, docs)
            console.print(f"  Documents: {folder}")

            if dry_run:
                continue

            if config.application.confirm_each:
                if not click.confirm("Apply to this job?", default=False):
                    log_application(config, job, "skipped")
                    continue

            status = browser.apply_to_job(job, docs)
            log_application(config, job, status)
            console.print(f"  Status: [cyan]{status}[/cyan]")

            if status != "applied":
                console.print(
                    "  [yellow]Complete any remaining steps manually in the browser if needed.[/yellow]"
                )

            time.sleep(config.application.delay_seconds_between_applies)


if __name__ == "__main__":
    main()
