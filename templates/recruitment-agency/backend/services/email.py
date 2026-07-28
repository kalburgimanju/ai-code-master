"""Email Service for sending emails via SendGrid."""

import httpx
import base64
from typing import Any, Optional
from datetime import datetime

from backend.config import get_settings


class EmailService:
    """Service for sending emails via SendGrid."""

    def __init__(self):
        self.settings = get_settings()
        self.api_key = self.settings.apis.sendgrid.api_key
        self.base_url = "https://api.sendgrid.com/v3"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

    async def send_email(
        self,
        to_email: str,
        to_name: str,
        subject: str,
        body_text: str,
        body_html: str,
        from_email: Optional[str] = None,
        from_name: Optional[str] = None,
        reply_to: Optional[str] = None,
        tracking_id: Optional[str] = None,
        in_reply_to: Optional[str] = None,
        references: Optional[str] = None,
        custom_args: Optional[dict] = None,
    ) -> dict:
        """Send an email via SendGrid."""

        from_email = from_email or self.settings.apis.sendgrid.from_email
        from_name = from_name or self.settings.apis.sendgrid.from_name
        reply_to = reply_to or self.settings.apis.sendgrid.reply_to

        # Build personalization
        personalization = {
            "to": [{"email": to_email, "name": to_name}],
            "subject": subject,
            "substitutions": {},
        }

        if in_reply_to:
            personalization["headers"] = {"In-Reply-To": in_reply_to}
        if references:
            personalization["headers"] = personalization.get("headers", {})
            personalization["headers"]["References"] = references

        # Custom args for tracking
        if tracking_id:
            personalization["custom_args"] = {
                "tracking_id": tracking_id,
                **(custom_args or {}),
            }

        # Build mail object
        mail_data = {
            "personalizations": [personalization],
            "from": {"email": from_email, "name": from_name},
            "reply_to": {"email": reply_to, "name": from_name},
            "content": [
                {"type": "text/plain", "value": body_text},
                {"type": "text/html", "value": body_html},
            ],
            "tracking_settings": {
                "click_tracking": {"enable": True, "enable_text": True},
                "open_tracking": {"enable": True, "substitution_tag": "%opentrack%"},
                "subscription_tracking": {
                    "enable": True,
                    "text": "Unsubscribe",
                    "html": '<a href="%unsubscribe_url%">Unsubscribe</a>',
                },
            },
            "mail_settings": {
                "sandbox_mode": {"enable": self.settings.features.dry_run_mode},
            },
        }

        # Add custom args at root level too
        if tracking_id:
            mail_data["custom_args"] = {
                "tracking_id": tracking_id,
                "timestamp": datetime.utcnow().isoformat(),
            }

        # Send request
        if self.settings.features.dry_run_mode or not self.api_key:
            return await self._mock_send(mail_data, tracking_id)

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/mail/send",
                headers=self.headers,
                json=mail_data,
            )
            response.raise_for_status()

            # Extract message ID from headers
            message_id = response.headers.get("X-Message-Id", "")
            if not message_id and "X-Message-Id" in response.headers:
                message_id = response.headers["X-Message-Id"]

            return {
                "status_code": response.status_code,
                "message_id": message_id,
                "tracking_id": tracking_id,
            }

    async def _mock_send(self, mail_data: dict, tracking_id: Optional[str]) -> dict:
        """Mock email send for testing."""
        print(f"[MOCK EMAIL] To: {mail_data['personalizations'][0]['to'][0]['email']}")
        print(f"[MOCK EMAIL] Subject: {mail_data['personalizations'][0]['subject']}")
        print(f"[MOCK EMAIL] Tracking ID: {tracking_id}")
        return {
            "status_code": 202,
            "message_id": f"mock_{tracking_id or 'unknown'}",
            "tracking_id": tracking_id,
        }

    async def send_batch(
        self,
        emails: list[dict],
    ) -> list[dict]:
        """Send multiple emails in batch (SendGrid doesn't support true batch, so we send sequentially)."""
        results = []
        for email in emails:
            try:
                result = await self.send_email(**email)
                results.append({"success": True, **result})
            except Exception as e:
                results.append({"success": False, "error": str(e)})
        return results

    async def get_email_stats(
        self,
        start_date: datetime,
        end_date: datetime,
    ) -> dict:
        """Get email statistics from SendGrid."""
        if not self.api_key:
            return {}

        params = {
            "start_date": int(start_date.timestamp()),
            "end_date": int(end_date.timestamp()),
            "aggregated_by": "day",
        }

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/stats",
                headers=self.headers,
                params=params,
            )
            response.raise_for_status()
            return response.json()

    async def handle_webhook(self, payload: list[dict]) -> list[dict]:
        """Process SendGrid webhook events."""
        events = []
        for event in payload:
            event_type = event.get("event")
            email = event.get("email")
            tracking_id = event.get("tracking_id", event.get("custom_args", {}).get("tracking_id"))
            sg_message_id = event.get("sg_message_id", event.get("smtp-id"))

            events.append({
                "event_type": event_type,
                "email": email,
                "tracking_id": tracking_id,
                "sg_message_id": sg_message_id,
                "timestamp": event.get("timestamp"),
                "raw_event": event,
            })

        return events

    async def add_to_suppression_list(self, email: str) -> bool:
        """Add email to suppression list (unsubscribe)."""
        if not self.api_key:
            return True

        data = {"recipient_emails": [email]}

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/asm/suppressions/global",
                headers=self.headers,
                json=data,
            )
            return response.status_code in [200, 201]

    async def remove_from_suppression_list(self, email: str) -> bool:
        """Remove email from suppression list."""
        if not self.api_key:
            return True

        async with httpx.AsyncClient() as client:
            response = await client.delete(
                f"{self.base_url}/asm/suppressions/global/{email}",
                headers=self.headers,
            )
            return response.status_code in [200, 204]

    async def validate_email(self, email: str) -> dict:
        """Validate email address using SendGrid Email Validation API."""
        if not self.api_key:
            return {"valid": True, "mock": True}

        params = {"email": email}

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/validations/email",
                headers=self.headers,
                params=params,
            )
            if response.status_code == 200:
                return response.json()
            return {"valid": False, "error": response.text}