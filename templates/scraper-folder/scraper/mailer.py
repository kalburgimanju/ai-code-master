"""Email sending utilities."""

from __future__ import annotations

import logging
import smtplib
import uuid
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)


def format_jobs_for_email(jobs: list, job_type: str = "latest") -> str:
    """Format jobs as HTML for email."""
    if not jobs:
        return "<p>No jobs found.</p>"

    html = f"<h2>{job_type.title()} AI Automation Jobs</h2>"
    html += f"<p>Total jobs: {len(jobs)}</p>"
    html += """
    <table border="1" cellpadding="10" cellspacing="0" style="border-collapse: collapse; width: 100%;">
        <thead>
            <tr style="background-color: #f2f2f2;">
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Title</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Company</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Salary</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Applicants</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Remote</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">URL</th>
            </tr>
        </thead>
        <tbody>
    """

    for job in jobs:
        salary = job.salary.display if job.salary else "Not specified"
        applicants = str(job.applicant_count) if job.applicant_count is not None else "?"
        remote = "Yes" if job.is_remote else "No"
        html += f"""
            <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">{job.title}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">{job.company}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">{salary}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">{applicants}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">{remote}</td>
                <td style="border: 1px solid #ddd; padding: 8px;"><a href="{job.url}">{job.url}</a></td>
            </tr>
        """

    html += """
        </tbody>
    </table>
    <p><em>Generated at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</em></p>
    """

    return html


def send_email(
    recipient: str,
    subject: str,
    html_content: str,
    config: Any,
    job_count: int = 0,
    filename: str = "",
) -> str:
    """
    Send email with job listings.

    Returns the email history ID.
    """
    if not config.smtp_host or not config.smtp_user or not config.smtp_pass:
        logger.error("SMTP configuration not complete. Email not sent to %s", recipient)
        return ""

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = config.smtp_user
        msg["To"] = recipient

        html_part = MIMEText(html_content, "html")
        msg.attach(html_part)

        with smtplib.SMTP(config.smtp_host, config.smtp_port) as server:
            server.starttls()
            server.login(config.smtp_user, config.smtp_pass)
            server.send_message(msg)

        email_id = str(uuid.uuid4())
        logger.info("Email sent to %s (ID: %s)", recipient, email_id)
        return email_id

    except Exception as e:
        logger.error("Failed to send email to %s: %s", recipient, e)
        return ""


def send_scrape_notification(
    config: Any,
    jobs: list,
    scrape_result: Any,
    job_type: str = "latest",
) -> str:
    """
    Send email notification with scrape results.

    Returns email history ID or empty string on failure.
    """
    if not config.email.enabled:
        logger.info("Email notifications disabled")
        return ""

    if not scrape_result.jobs:
        subject = config.email.subject_template.format(count=0)
        html_content = f"<h2>No {job_type} jobs found.</h2><p>Scrape completed successfully but no jobs matched the filters.</p>"
        return send_email(
            config.email.default_email,
            subject,
            html_content,
            config,
            job_count=0,
        )

    subject = config.email.subject_template.format(count=len(scrape_result.jobs))
    html_content = format_jobs_for_email(scrape_result.jobs, job_type)

    filename = f"exported_jobs_{job_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"

    return send_email(
        config.email.default_email,
        subject,
        html_content,
        config,
        job_count=len(scrape_result.jobs),
        filename=filename,
    )