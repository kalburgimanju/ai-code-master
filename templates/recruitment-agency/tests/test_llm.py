"""Tests for the LLM client."""

import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from backend.services.llm import LLMClient


class TestLLMClient:
    """Test LLMClient."""

    def test_model_list(self):
        """LLMClient initializes with model list."""
        with patch("backend.services.llm.get_settings") as mock_settings:
            mock_settings.return_value = MagicMock(
                llm=MagicMock(
                    models=["model-a", "model-b", "model-c"],
                    temperature=0.7,
                    max_tokens=4000,
                )
            )
            client = LLMClient()
            assert client._models == ["model-a", "model-b", "model-c"]
            assert client._current_idx == 0

    def test_rotate_model(self):
        """Model rotation cycles through models."""
        with patch("backend.services.llm.get_settings") as mock_settings:
            mock_settings.return_value = MagicMock(
                llm=MagicMock(
                    models=["model-a", "model-b", "model-c"],
                    temperature=0.7,
                    max_tokens=4000,
                )
            )
            client = LLMClient()
            assert client._current_model == "model-a"
            client._rotate_model()
            assert client._current_model == "model-b"
            client._rotate_model()
            assert client._current_model == "model-c"
            client._rotate_model()
            assert client._current_model == "model-a"  # Wraps around

    def test_get_model_chain(self):
        """Model chain returns correct sequence."""
        with patch("backend.services.llm.get_settings") as mock_settings:
            mock_settings.return_value = MagicMock(
                llm=MagicMock(
                    models=["model-a", "model-b", "model-c"],
                    temperature=0.7,
                    max_tokens=4000,
                )
            )
            client = LLMClient()
            chain = client._get_model_chain(max_attempts=2)
            assert chain == ["model-a", "model-b"]

            client._current_idx = 1
            chain = client._get_model_chain(max_attempts=2)
            assert chain == ["model-b", "model-c"]

    @pytest.mark.asyncio
    async def test_generate_structured_dict(self):
        """generate_structured with dict schema parses JSON."""
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

            # Mock the API response
            mock_response = MagicMock()
            mock_response.choices = [MagicMock()]
            mock_response.choices[0].message.content = json.dumps(
                {"subject": "Test", "body": "Hello"}
            )
            client.client.chat.completions.create = AsyncMock(return_value=mock_response)

            result = await client.generate_structured(
                prompt="Generate something",
                schema=dict,
                system="Test system",
            )
            assert result == {"subject": "Test", "body": "Hello"}

    @pytest.mark.asyncio
    async def test_generate_empty_response_triggers_fallback(self):
        """Empty response from one model triggers fallback to next."""
        with patch("backend.services.llm.get_settings") as mock_settings:
            mock_settings.return_value = MagicMock(
                llm=MagicMock(
                    models=["model-a", "model-b"],
                    temperature=0.7,
                    max_tokens=4000,
                )
            )
            client = LLMClient()
            client.client = AsyncMock()

            # First call returns empty, second returns content
            empty_response = MagicMock()
            empty_response.choices = [MagicMock()]
            empty_response.choices[0].message.content = ""

            success_response = MagicMock()
            success_response.choices = [MagicMock()]
            success_response.choices[0].message.content = "Success!"

            client.client.chat.completions.create = AsyncMock(
                side_effect=[empty_response, success_response]
            )

            result = await client.generate(prompt="Test", system="Test")
            assert result == "Success!"
            assert client.client.chat.completions.create.call_count == 2
