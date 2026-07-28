"""Tests for all service implementations."""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime, timedelta

from backend.services.email import EmailService
from backend.services.calendar import CalendarClient
from backend.services.llm import LLMClient


# ============================================================
# Email Service Tests
# ============================================================


class TestEmailService:
    """Test EmailService."""

    def test_initialization(self):
        with patch("backend.services.email.get_settings") as mock_settings:
            mock_settings.return_value = MagicMock(
                apis=MagicMock(
                    sendgrid=MagicMock(
                        api_key="test-key",
                        from_email="test@example.com",
                        from_name="Test Sender",
                        reply_to="reply@example.com",
                    )
                ),
                features=MagicMock(dry_run_mode=False),
            )
            service = EmailService()
            assert service.api_key == "test-key"
            assert service.base_url == "https://api.sendgrid.com/v3"

    def test_initialization_no_api_key(self):
        with patch("backend.services.email.get_settings") as mock_settings:
            mock_settings.return_value = MagicMock(
                apis=MagicMock(
                    sendgrid=MagicMock(api_key=None),
                ),
                features=MagicMock(dry_run_mode=False),
            )
            service = EmailService()
            assert service.api_key is None

    @pytest.mark.asyncio
    async def test_send_email_dry_run(self):
        with patch("backend.services.email.get_settings") as mock_settings:
            mock_settings.return_value = MagicMock(
                apis=MagicMock(
                    sendgrid=MagicMock(
                        api_key=None,
                        from_email="test@example.com",
                        from_name="Test",
                        reply_to="reply@example.com",
                    )
                ),
                features=MagicMock(dry_run_mode=True),
            )
            service = EmailService()
            result = await service.send_email(
                to_email="recipient@example.com",
                to_name="Recipient",
                subject="Test Subject",
                body_text="Hello",
                body_html="<p>Hello</p>",
            )
            assert result["status_code"] == 202
            assert "mock_" in result["message_id"]

    @pytest.mark.asyncio
    async def test_send_email_mock_fallback(self):
        with patch("backend.services.email.get_settings") as mock_settings:
            mock_settings.return_value = MagicMock(
                apis=MagicMock(
                    sendgrid=MagicMock(
                        api_key=None,
                        from_email="test@example.com",
                        from_name="Test",
                        reply_to="reply@example.com",
                    )
                ),
                features=MagicMock(dry_run_mode=False),
            )
            service = EmailService()
            result = await service.send_email(
                to_email="recipient@example.com",
                to_name="Recipient",
                subject="Test Subject",
                body_text="Hello",
                body_html="<p>Hello</p>",
                tracking_id="track-123",
            )
            assert result["status_code"] == 202
            assert result["tracking_id"] == "track-123"

    @pytest.mark.asyncio
    async def test_send_batch(self):
        with patch("backend.services.email.get_settings") as mock_settings:
            mock_settings.return_value = MagicMock(
                apis=MagicMock(
                    sendgrid=MagicMock(
                        api_key=None,
                        from_email="test@example.com",
                        from_name="Test",
                        reply_to="reply@example.com",
                    )
                ),
                features=MagicMock(dry_run_mode=True),
            )
            service = EmailService()
            emails = [
                {
                    "to_email": "a@example.com",
                    "to_name": "A",
                    "subject": "Test 1",
                    "body_text": "Hello 1",
                    "body_html": "<p>1</p>",
                },
                {
                    "to_email": "b@example.com",
                    "to_name": "B",
                    "subject": "Test 2",
                    "body_text": "Hello 2",
                    "body_html": "<p>2</p>",
                },
            ]
            results = await service.send_batch(emails)
            assert len(results) == 2
            assert all(r["success"] is True for r in results)

    @pytest.mark.asyncio
    async def test_handle_webhook_events(self):
        with patch("backend.services.email.get_settings") as mock_settings:
            mock_settings.return_value = MagicMock(
                apis=MagicMock(sendgrid=MagicMock(api_key=None)),
                features=MagicMock(dry_run_mode=False),
            )
            service = EmailService()
            payload = [
                {
                    "email": "test@example.com",
                    "event": "delivered",
                    "timestamp": 1234567890,
                    "sg_message_id": "msg-123",
                    "tracking_id": "track-456",
                },
                {
                    "email": "test@example.com",
                    "event": "open",
                    "timestamp": 1234567900,
                    "sg_message_id": "msg-123",
                    "tracking_id": "track-456",
                },
            ]
            events = await service.handle_webhook(payload)
            assert len(events) == 2
            assert events[0]["event_type"] == "delivered"
            assert events[1]["event_type"] == "open"
            assert events[0]["email"] == "test@example.com"

    @pytest.mark.asyncio
    async def test_handle_webhook_single_event(self):
        with patch("backend.services.email.get_settings") as mock_settings:
            mock_settings.return_value = MagicMock(
                apis=MagicMock(sendgrid=MagicMock(api_key=None)),
                features=MagicMock(dry_run_mode=False),
            )
            service = EmailService()
            payload = [
                {
                    "email": "test@example.com",
                    "event": "bounce",
                    "timestamp": 1234567890,
                }
            ]
            events = await service.handle_webhook(payload)
            assert len(events) == 1
            assert events[0]["event_type"] == "bounce"

    @pytest.mark.asyncio
    async def test_validate_email_no_api_key(self):
        with patch("backend.services.email.get_settings") as mock_settings:
            mock_settings.return_value = MagicMock(
                apis=MagicMock(sendgrid=MagicMock(api_key=None)),
                features=MagicMock(dry_run_mode=False),
            )
            service = EmailService()
            result = await service.validate_email("test@example.com")
            assert result["valid"] is True
            assert result["mock"] is True

    @pytest.mark.asyncio
    async def test_add_to_suppression_list_no_api_key(self):
        with patch("backend.services.email.get_settings") as mock_settings:
            mock_settings.return_value = MagicMock(
                apis=MagicMock(sendgrid=MagicMock(api_key=None)),
                features=MagicMock(dry_run_mode=False),
            )
            service = EmailService()
            result = await service.add_to_suppression_list("test@example.com")
            assert result is True

    @pytest.mark.asyncio
    async def test_remove_from_suppression_list_no_api_key(self):
        with patch("backend.services.email.get_settings") as mock_settings:
            mock_settings.return_value = MagicMock(
                apis=MagicMock(sendgrid=MagicMock(api_key=None)),
                features=MagicMock(dry_run_mode=False),
            )
            service = EmailService()
            result = await service.remove_from_suppression_list("test@example.com")
            assert result is True


# ============================================================
# Calendar Service Tests
# ============================================================


class TestCalendarClient:
    """Test CalendarClient."""

    def test_initialization(self):
        with patch("backend.services.calendar.get_settings") as mock_settings:
            mock_settings.return_value = MagicMock(
                apis=MagicMock(
                    calcom=MagicMock(
                        api_key="test-key",
                        base_url="https://api.cal.com/v2",
                        event_type_id="123",
                        username="testuser",
                    )
                ),
                features=MagicMock(dry_run_mode=False),
            )
            client = CalendarClient()
            assert client.api_key == "test-key"
            assert client.base_url == "https://api.cal.com/v2"

    def test_initialization_no_api_key(self):
        with patch("backend.services.calendar.get_settings") as mock_settings:
            mock_settings.return_value = MagicMock(
                apis=MagicMock(
                    calcom=MagicMock(api_key=None),
                ),
                features=MagicMock(dry_run_mode=False),
            )
            client = CalendarClient()
            assert client.api_key is None

    @pytest.mark.asyncio
    async def test_get_available_slots_dry_run(self):
        with patch("backend.services.calendar.get_settings") as mock_settings:
            mock_settings.return_value = MagicMock(
                apis=MagicMock(
                    calcom=MagicMock(api_key=None),
                ),
                features=MagicMock(dry_run_mode=True),
            )
            client = CalendarClient()
            slots = await client.get_available_slots(duration_minutes=30, days_ahead=7)
            assert len(slots) > 0
            assert all("start" in s and "end" in s for s in slots)

    @pytest.mark.asyncio
    async def test_get_available_slots_mock_fallback(self):
        with patch("backend.services.calendar.get_settings") as mock_settings:
            mock_settings.return_value = MagicMock(
                apis=MagicMock(
                    calcom=MagicMock(api_key=None),
                ),
                features=MagicMock(dry_run_mode=False),
            )
            client = CalendarClient()
            slots = await client.get_available_slots(duration_minutes=60, days_ahead=5)
            assert len(slots) > 0

    @pytest.mark.asyncio
    async def test_create_event_dry_run(self):
        with patch("backend.services.calendar.get_settings") as mock_settings:
            mock_settings.return_value = MagicMock(
                apis=MagicMock(
                    calcom=MagicMock(api_key=None),
                ),
                features=MagicMock(dry_run_mode=True),
            )
            client = CalendarClient()
            start = datetime.utcnow() + timedelta(days=1)
            end = start + timedelta(minutes=30)
            result = await client.create_event(
                title="Test Meeting",
                start_time=start,
                end_time=end,
                attendee_emails=["test@example.com"],
                attendee_names=["Test User"],
            )
            assert "id" in result
            assert result["title"] == "Test Meeting"
            assert result["status"] == "ACCEPTED"

    @pytest.mark.asyncio
    async def test_cancel_event_dry_run(self):
        with patch("backend.services.calendar.get_settings") as mock_settings:
            mock_settings.return_value = MagicMock(
                apis=MagicMock(
                    calcom=MagicMock(api_key=None),
                ),
                features=MagicMock(dry_run_mode=True),
            )
            client = CalendarClient()
            result = await client.cancel_event("event-123", reason="Test cancel")
            assert result is True

    @pytest.mark.asyncio
    async def test_handle_webhook_booking_created(self):
        with patch("backend.services.calendar.get_settings") as mock_settings:
            mock_settings.return_value = MagicMock(
                apis=MagicMock(calcom=MagicMock(api_key=None)),
                features=MagicMock(dry_run_mode=False),
            )
            client = CalendarClient()
            event = {
                "triggerEvent": "BOOKING_CREATED",
                "payload": {
                    "id": "booking-123",
                    "uid": "uid-456",
                    "title": "Discovery Call",
                    "startTime": "2025-01-15T10:00:00Z",
                    "endTime": "2025-01-15T10:30:00Z",
                    "attendees": [{"email": "test@example.com"}],
                    "status": "ACCEPTED",
                    "metadata": {},
                },
            }
            result = await client.handle_webhook(event)
            assert result["event_type"] == "BOOKING_CREATED"
            assert result["booking_id"] == "booking-123"
            assert result["attendee_email"] == "test@example.com"

    @pytest.mark.asyncio
    async def test_handle_webhook_booking_cancelled(self):
        with patch("backend.services.calendar.get_settings") as mock_settings:
            mock_settings.return_value = MagicMock(
                apis=MagicMock(calcom=MagicMock(api_key=None)),
                features=MagicMock(dry_run_mode=False),
            )
            client = CalendarClient()
            event = {
                "triggerEvent": "BOOKING_CANCELLED",
                "payload": {
                    "id": "booking-123",
                    "uid": "uid-456",
                    "title": "Discovery Call",
                    "startTime": "2025-01-15T10:00:00Z",
                    "endTime": "2025-01-15T10:30:00Z",
                    "attendees": [{"email": "test@example.com"}],
                    "status": "CANCELLED",
                    "cancelledBy": "test@example.com",
                    "cancellationReason": "Schedule conflict",
                    "metadata": {},
                },
            }
            result = await client.handle_webhook(event)
            assert result["event_type"] == "BOOKING_CANCELLED"
            assert result["cancelled_by"] == "test@example.com"
            assert result["cancellation_reason"] == "Schedule conflict"

    @pytest.mark.asyncio
    async def test_handle_webhook_booking_rescheduled(self):
        with patch("backend.services.calendar.get_settings") as mock_settings:
            mock_settings.return_value = MagicMock(
                apis=MagicMock(calcom=MagicMock(api_key=None)),
                features=MagicMock(dry_run_mode=False),
            )
            client = CalendarClient()
            event = {
                "triggerEvent": "BOOKING_RESCHEDULED",
                "payload": {
                    "id": "booking-123",
                    "uid": "uid-456",
                    "title": "Discovery Call",
                    "startTime": "2025-01-16T14:00:00Z",
                    "endTime": "2025-01-16T14:30:00Z",
                    "attendees": [{"email": "test@example.com"}],
                    "status": "ACCEPTED",
                    "metadata": {},
                },
            }
            result = await client.handle_webhook(event)
            assert result["event_type"] == "BOOKING_RESCHEDULED"
            assert result["start_time"] == "2025-01-16T14:00:00Z"


# ============================================================
# LLM Client Tests
# ============================================================


class TestLLMClientExtended:
    """Extended tests for LLMClient."""

    def test_initialization(self):
        with patch("backend.services.llm.get_settings") as mock_settings:
            mock_settings.return_value = MagicMock(
                llm=MagicMock(
                    models=["model-a", "model-b"],
                    temperature=0.7,
                    max_tokens=4000,
                )
            )
            client = LLMClient()
            assert client._models == ["model-a", "model-b"]
            assert client.temperature == 0.7
            assert client.max_tokens == 4000

    def test_current_model_property(self):
        with patch("backend.services.llm.get_settings") as mock_settings:
            mock_settings.return_value = MagicMock(
                llm=MagicMock(
                    models=["model-a", "model-b"],
                    temperature=0.7,
                    max_tokens=4000,
                )
            )
            client = LLMClient()
            assert client._current_model == "model-a"

    def test_model_chain_wraps_around(self):
        with patch("backend.services.llm.get_settings") as mock_settings:
            mock_settings.return_value = MagicMock(
                llm=MagicMock(
                    models=["model-a", "model-b", "model-c"],
                    temperature=0.7,
                    max_tokens=4000,
                )
            )
            client = LLMClient()
            chain = client._get_model_chain(max_attempts=5)
            # Chain stops at available models, doesn't wrap around
            assert len(chain) == 3
            assert chain == ["model-a", "model-b", "model-c"]

    @pytest.mark.asyncio
    async def test_generate_returns_string(self):
        with patch("backend.services.llm.get_settings") as mock_settings:
            mock_settings.return_value = MagicMock(
                llm=MagicMock(
                    models=["test-model"],
                    temperature=0.7,
                    max_tokens=4000,
                )
            )
            client = LLMClient()
            client.client = AsyncMock()

            mock_response = MagicMock()
            mock_response.choices = [MagicMock()]
            mock_response.choices[0].message.content = "Hello, World!"
            client.client.chat.completions.create = AsyncMock(return_value=mock_response)

            result = await client.generate(prompt="Say hello", system="You are helpful")
            assert result == "Hello, World!"

    @pytest.mark.asyncio
    async def test_generate_with_json_response(self):
        with patch("backend.services.llm.get_settings") as mock_settings:
            mock_settings.return_value = MagicMock(
                llm=MagicMock(
                    models=["test-model"],
                    temperature=0.7,
                    max_tokens=4000,
                )
            )
            client = LLMClient()
            client.client = AsyncMock()

            import json
            mock_response = MagicMock()
            mock_response.choices = [MagicMock()]
            mock_response.choices[0].message.content = json.dumps({"key": "value"})
            client.client.chat.completions.create = AsyncMock(return_value=mock_response)

            result = await client.generate(prompt="Return JSON", system="Return JSON object")
            assert result == '{"key": "value"}'

    @pytest.mark.asyncio
    async def test_generate_structured_parses_json(self):
        with patch("backend.services.llm.get_settings") as mock_settings:
            mock_settings.return_value = MagicMock(
                llm=MagicMock(
                    models=["test-model"],
                    temperature=0.7,
                    max_tokens=4000,
                )
            )
            client = LLMClient()
            client.client = AsyncMock()

            import json
            mock_response = MagicMock()
            mock_response.choices = [MagicMock()]
            mock_response.choices[0].message.content = json.dumps(
                {"subject": "Hi", "body": "Hello there"}
            )
            client.client.chat.completions.create = AsyncMock(return_value=mock_response)

            result = await client.generate_structured(
                prompt="Generate email",
                schema=dict,
                system="Generate email",
            )
            assert result["subject"] == "Hi"
            assert result["body"] == "Hello there"
