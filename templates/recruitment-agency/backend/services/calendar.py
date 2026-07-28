"""Calendar Service for Cal.com integration."""

import httpx
from datetime import datetime, timedelta
from typing import Any, Optional

from backend.config import get_settings


class CalendarClient:
    """Client for Cal.com API v2."""

    def __init__(self):
        self.settings = get_settings()
        self.api_key = self.settings.apis.calcom.api_key
        self.base_url = self.settings.apis.calcom.base_url
        self.event_type_id = self.settings.apis.calcom.event_type_id
        self.username = self.settings.apis.calcom.username
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        } if self.api_key else {}

    async def get_available_slots(
        self,
        duration_minutes: int = 30,
        days_ahead: int = 14,
        timezone: str = "UTC",
        event_type_id: Optional[str] = None,
    ) -> list[dict]:
        """Get available time slots from Cal.com."""
        if not self.api_key or self.settings.features.dry_run_mode:
            return self._mock_slots(duration_minutes, days_ahead, timezone)

        event_type = event_type_id or self.event_type_id
        if not event_type:
            return []

        start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        end = start + timedelta(days=days_ahead)

        url = f"{self.base_url}/slots"
        params = {
            "eventTypeId": event_type,
            "start": start.isoformat() + "Z",
            "end": end.isoformat() + "Z",
            "duration": duration_minutes,
            "timeZone": timezone,
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, headers=self.headers, params=params)
                response.raise_for_status()
                data = response.json()
                return data.get("slots", [])
        except Exception as e:
            print(f"Error getting slots: {e}")
            return []

    def _mock_slots(
        self,
        duration_minutes: int,
        days_ahead: int,
        timezone: str,
    ) -> list[dict]:
        """Mock available slots for testing."""
        slots = []
        start = datetime.utcnow().replace(hour=9, minute=0, second=0, microsecond=0)

        for day in range(days_ahead):
            current = start + timedelta(days=day)
            # Skip weekends
            if current.weekday() >= 5:
                continue

            # Generate slots for business hours (9 AM - 5 PM)
            for hour in range(9, 17):
                for minute in [0, 30]:
                    slot_start = current.replace(hour=hour, minute=minute)
                    slot_end = slot_start + timedelta(minutes=duration_minutes)
                    if slot_end.hour < 17 or (slot_end.hour == 17 and slot_end.minute == 0):
                        slots.append({
                            "start": slot_start.isoformat() + "Z",
                            "end": slot_end.isoformat() + "Z",
                            "timeZone": timezone,
                        })

        return slots

    async def create_event(
        self,
        title: str,
        start_time: datetime,
        end_time: datetime,
        attendee_emails: list[str],
        attendee_names: list[str],
        description: str = "",
        location: str = "Video Call",
        event_type_id: Optional[str] = None,
        metadata: Optional[dict] = None,
    ) -> dict:
        """Create a booking/event in Cal.com."""
        if not self.api_key or self.settings.features.dry_run_mode:
            return self._mock_create_event(title, start_time, end_time, attendee_emails[0])

        event_type = event_type_id or self.event_type_id
        if not event_type:
            raise ValueError("Event type ID required")

        # Cal.com v2 uses /bookings endpoint
        url = f"{self.base_url}/bookings"
        data = {
            "eventTypeId": int(event_type),
            "start": start_time.isoformat() + "Z",
            "end": end_time.isoformat() + "Z",
            "timeZone": "UTC",
            "language": "en",
            "title": title,
            "description": description,
            "location": location,
            "metadata": metadata or {},
            "responses": {
                "name": attendee_names[0] if attendee_names else "",
                "email": attendee_emails[0] if attendee_emails else "",
            },
            "guests": attendee_emails[1:] if len(attendee_emails) > 1 else [],
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(url, headers=self.headers, json=data)
                response.raise_for_status()
                return response.json()
        except Exception as e:
            print(f"Error creating event: {e}")
            raise

    def _mock_create_event(
        self,
        title: str,
        start_time: datetime,
        end_time: datetime,
        attendee_email: str,
    ) -> dict:
        """Mock event creation."""
        print(f"[MOCK CALENDAR] Creating event: {title}")
        print(f"[MOCK CALENDAR] Time: {start_time} - {end_time}")
        print(f"[MOCK CALENDAR] Attendee: {attendee_email}")
        return {
            "id": f"mock_{start_time.timestamp()}",
            "uid": f"mock_{start_time.timestamp()}",
            "title": title,
            "startTime": start_time.isoformat() + "Z",
            "endTime": end_time.isoformat() + "Z",
            "attendees": [{"email": attendee_email}],
            "meetingUrl": f"https://cal.com/mock/{start_time.timestamp()}",
            "status": "ACCEPTED",
        }

    async def cancel_event(self, event_id: str, reason: str = "") -> bool:
        """Cancel a booking in Cal.com."""
        if not self.api_key or self.settings.features.dry_run_mode:
            print(f"[MOCK CALENDAR] Cancelling event: {event_id}")
            return True

        url = f"{self.base_url}/bookings/{event_id}/cancel"
        data = {"cancellationReason": reason}

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(url, headers=self.headers, json=data)
                return response.status_code == 200
        except Exception as e:
            print(f"Error cancelling event: {e}")
            return False

    async def reschedule_event(
        self,
        event_id: str,
        new_start: datetime,
        new_end: datetime,
    ) -> dict:
        """Reschedule a booking in Cal.com."""
        if not self.api_key or self.settings.features.dry_run_mode:
            return self._mock_create_event("Rescheduled", new_start, new_end, "test@example.com")

        url = f"{self.base_url}/bookings/{event_id}/reschedule"
        data = {
            "start": new_start.isoformat() + "Z",
            "end": new_end.isoformat() + "Z",
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(url, headers=self.headers, json=data)
                response.raise_for_status()
                return response.json()
        except Exception as e:
            print(f"Error rescheduling event: {e}")
            raise

    async def get_event(self, event_id: str) -> Optional[dict]:
        """Get event details from Cal.com."""
        if not self.api_key:
            return None

        url = f"{self.base_url}/bookings/{event_id}"

        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, headers=self.headers)
                response.raise_for_status()
                return response.json()
        except Exception as e:
            print(f"Error getting event: {e}")
            return None

    async def get_bookings(
        self,
        start: datetime,
        end: datetime,
        status: Optional[str] = None,
    ) -> list[dict]:
        """Get bookings in a date range."""
        if not self.api_key:
            return []

        url = f"{self.base_url}/bookings"
        params = {
            "start": start.isoformat() + "Z",
            "end": end.isoformat() + "Z",
        }
        if status:
            params["status"] = status

        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, headers=self.headers, params=params)
                response.raise_for_status()
                return response.json().get("bookings", [])
        except Exception as e:
            print(f"Error getting bookings: {e}")
            return []

    async def get_event_types(self) -> list[dict]:
        """Get available event types from Cal.com."""
        if not self.api_key:
            return []

        url = f"{self.base_url}/event-types"

        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, headers=self.headers)
                response.raise_for_status()
                return response.json().get("event_types", [])
        except Exception as e:
            print(f"Error getting event types: {e}")
            return []

    async def verify_webhook_signature(
        self,
        payload: bytes,
        signature: str,
        secret: str,
    ) -> bool:
        """Verify Cal.com webhook signature."""
        import hmac
        import hashlib

        expected = hmac.new(
            secret.encode(),
            payload,
            hashlib.sha256,
        ).hexdigest()

        return hmac.compare_digest(expected, signature)

    async def handle_webhook(self, event: dict) -> dict:
        """Process Cal.com webhook event."""
        trigger_event = event.get("triggerEvent")
        booking = event.get("payload", {})

        return {
            "event_type": trigger_event,
            "booking_id": booking.get("id"),
            "booking_uid": booking.get("uid"),
            "title": booking.get("title"),
            "start_time": booking.get("startTime"),
            "end_time": booking.get("endTime"),
            "attendee_email": booking.get("attendees", [{}])[0].get("email") if booking.get("attendees") else None,
            "status": booking.get("status"),
            "cancelled_by": booking.get("cancelledBy"),
            "cancellation_reason": booking.get("cancellationReason"),
            "metadata": booking.get("metadata", {}),
            "raw_event": event,
        }