"""LLM Client for the recruitment agency platform with multi-model fallback."""

import json
import logging
import os
import re
from typing import Any, Optional, Type, TypeVar

import openai
from pydantic import BaseModel

from backend.config import get_settings

T = TypeVar("T", bound=BaseModel)
logger = logging.getLogger(__name__)


class LLMClient:
    """Client for interacting with LLMs via OpenRouter with automatic model fallback.

    If one model fails (rate limit, timeout, 500, etc.), automatically rotates
    to the next model in the list without interrupting the agent.
    """

    def __init__(self):
        self.settings = get_settings()
        self.client = openai.AsyncOpenAI(
            api_key=os.getenv("OPENROUTER_API_KEY") or os.getenv("OPENAI_API_KEY") or "dummy",
            base_url="https://openrouter.ai/api/v1",
            default_headers={
                "HTTP-Referer": "https://recruitment-agency.local",
                "X-Title": "Recruitment Agency Platform",
            },
        )
        # Build model list: config models list > fallback chain
        self._models = list(self.settings.llm.models) if self.settings.llm.models else [
            "qwen/qwen3-coder:free",
            "nvidia/nemotron-3-ultra-550b-a55b:free",
            "nvidia/nemotron-3-super-120b-a12b:free",
            "meta-llama/llama-3.3-70b-instruct:free",
            "nousresearch/hermes-3-llama-3.1-405b:free",
            "google/gemma-4-31b-it:free",
            "google/gemma-4-26b-a4b-it:free",
            "tencent/hy3:free",
            "openai/gpt-oss-20b:free",
            "qwen/qwen3-next-80b-a3b-instruct:free",
            "cohere/north-mini-code:free",
            "nvidia/nemotron-3-nano-30b-a3b:free",
        ]
        self._current_idx = 0
        self.temperature = self.settings.llm.temperature
        self.max_tokens = self.settings.llm.max_tokens

    @property
    def _current_model(self) -> str:
        return self._models[self._current_idx % len(self._models)]

    def _rotate_model(self) -> str:
        """Rotate to the next model in the fallback chain."""
        self._current_idx = (self._current_idx + 1) % len(self._models)
        model = self._current_model
        logger.info(f"Rotated to model: {model}")
        return model

    def _get_model_chain(self, max_attempts: int = 4) -> list[str]:
        """Get a list of models to try, starting from current index."""
        chain = []
        for i in range(min(max_attempts, len(self._models))):
            idx = (self._current_idx + i) % len(self._models)
            chain.append(self._models[idx])
        return chain

    async def generate(
        self,
        prompt: str,
        system: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        **kwargs,
    ) -> str:
        """Generate text completion with automatic model fallback."""
        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})

        model_chain = self._get_model_chain(max_attempts=4)
        last_error = None

        for model in model_chain:
            try:
                response = await self.client.chat.completions.create(
                    model=model,
                    messages=messages,
                    temperature=temperature or self.temperature,
                    max_tokens=max_tokens or self.max_tokens,
                    **kwargs,
                )
                content = response.choices[0].message.content or ""
                if content.strip():
                    # Update current index to this working model
                    self._current_idx = self._models.index(model) if model in self._models else self._current_idx
                    return content
                # Empty response — treat as failure, try next model
                logger.warning(f"Empty response from {model}, trying next model")
                last_error = ValueError(f"Empty response from {model}")
            except openai.RateLimitError as e:
                logger.warning(f"Rate limited on {model}: {e}")
                last_error = e
            except openai.APIStatusError as e:
                logger.warning(f"API error on {model} (status={e.status_code}): {e}")
                last_error = e
            except openai.APITimeoutError as e:
                logger.warning(f"Timeout on {model}: {e}")
                last_error = e
            except Exception as e:
                logger.warning(f"Error on {model}: {e}")
                last_error = e

        raise last_error or RuntimeError("All models in fallback chain failed")

    async def generate_structured(
        self,
        prompt: str,
        schema: Type[T],
        system: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        **kwargs,
    ) -> T:
        """Generate structured output with automatic model fallback."""
        # Handle dict type (no schema enforcement, just parse JSON)
        if schema is dict:
            structured_prompt = f"""{prompt}

Return a valid JSON object.
IMPORTANT: Return ONLY the JSON object, no markdown formatting, no explanation, no additional text."""
        else:
            json_schema = schema.model_json_schema()
            structured_prompt = f"""{prompt}

Return a valid JSON object matching this schema:
{json_schema}

IMPORTANT: Return ONLY the JSON object, no markdown formatting, no explanation, no additional text."""

        response_text = await self.generate(
            prompt=structured_prompt,
            system=system,
            temperature=temperature or 0.1,
            max_tokens=max_tokens or self.max_tokens,
            **kwargs,
        )

        # Parse JSON response
        try:
            data = json.loads(response_text)
            return schema(**data) if not isinstance(schema, type) or schema is not dict else data
        except json.JSONDecodeError:
            # Try to extract JSON from response
            json_match = re.search(r"\{.*\}", response_text, re.DOTALL)
            if json_match:
                try:
                    data = json.loads(json_match.group())
                    if schema is dict:
                        return data
                    return schema(**data)
                except (json.JSONDecodeError, TypeError):
                    pass
            # Last resort: try array format
            arr_match = re.search(r"\[.*\]", response_text, re.DOTALL)
            if arr_match:
                try:
                    data = json.loads(arr_match.group())
                    if schema is list or (isinstance(schema, type) and issubclass(schema, list)):
                        return data
                except json.JSONDecodeError:
                    pass
            raise ValueError(f"Failed to parse structured output\nResponse: {response_text[:500]}")

    async def generate_with_tools(
        self,
        prompt: str,
        tools: list[dict],
        system: Optional[str] = None,
        tool_choice: str = "auto",
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        **kwargs,
    ) -> Any:
        """Generate with tool calling and automatic model fallback."""
        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})

        model_chain = self._get_model_chain(max_attempts=4)
        last_error = None

        for model in model_chain:
            try:
                response = await self.client.chat.completions.create(
                    model=model,
                    messages=messages,
                    tools=tools,
                    tool_choice=tool_choice,
                    temperature=temperature or self.temperature,
                    max_tokens=max_tokens or self.max_tokens,
                    **kwargs,
                )
                self._current_idx = self._models.index(model) if model in self._models else self._current_idx
                return response.choices[0].message
            except openai.RateLimitError as e:
                logger.warning(f"Rate limited on {model}: {e}")
                last_error = e
            except openai.APIStatusError as e:
                logger.warning(f"API error on {model} (status={e.status_code}): {e}")
                last_error = e
            except openai.APITimeoutError as e:
                logger.warning(f"Timeout on {model}: {e}")
                last_error = e
            except Exception as e:
                logger.warning(f"Error on {model}: {e}")
                last_error = e

        raise last_error or RuntimeError("All models in fallback chain failed")
