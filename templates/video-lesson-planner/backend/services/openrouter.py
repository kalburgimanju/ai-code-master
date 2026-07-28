"""OpenRouter API client for AI lesson plan generation."""
# fmt: off — long lines below are AI prompt prose where wrapping hurts readability
# ruff: noqa: E501

import json
import re

import httpx

from backend.config import settings


def _unescape(s: str) -> str:
    """Best-effort unescape of a JSON string value that may not be valid JSON.

    Handles the common `\\n` -> newline and `\\"` -> `"` sequences free models emit.
    """
    return s.replace("\\n", "\n").replace('\\"', '"').replace("\\t", "\t").strip()


def _extract_json(text: str) -> dict:
    """Extract JSON from model response, handling code fences and plain text."""
    # Strip markdown code fences
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.split("\n", 1)[1]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()

    # Try direct parse
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # Try to find JSON object in the text
    match = re.search(r"\{.*\}", cleaned, re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass

    # Tolerant unwrap: free models sometimes emit a `{"full_script": "..."}`
    # envelope whose inner string is not strictly JSON-escaped (literal newlines,
    # trailing junk). Pull the inner value out instead of storing the raw envelope.
    env = re.search(r'\{[^{}]*"full_script"\s*:\s*"(.*?)"\s*\}', cleaned, re.DOTALL)
    if env:
        try:
            return json.loads(f'{{"full_script": "{env.group(1)}"}}')
        except json.JSONDecodeError:
            return {"full_script": _unescape(env.group(1)), "author": "manjunath kalburgi"}

    # If all fails, wrap the text as the script content
    return {"full_script": text.strip(), "author": "manjunath kalburgi"}


SYSTEM_PROMPT = """You are an expert YouTube content creator and lesson planner.
Given a video series title and a user prompt, generate a structured lesson plan.

Return ONLY valid JSON with this exact structure:
{
  "title": "Series title",
  "overview": "Brief series overview",
  "lessons": [
    {
      "lesson_number": 1,
      "title": "Lesson title",
      "description": "What this lesson covers",
      "key_points": ["Key point 1", "Key point 2", "Key point 3"],
      "talking_points": ["Talking point 1", "Talking point 2", "Talking point 3"],
      "script_outline": "Detailed script outline with intro, main content, and outro sections",
      "resources": [{"title": "Resource name", "url": "https://example.com"}],
      "duration_minutes": 10
    }
  ]
}

Rules:
- Generate the number of lessons specified by the user (default 5)
- Each lesson should build on the previous one
- Script outlines should be detailed enough to record from
- Resources should be real, relevant URLs when possible
- Keep lessons focused and actionable for YouTube viewers
- Duration should be realistic for YouTube (5-20 minutes per lesson)"""

SCRIPT_SYSTEM_PROMPT = """You are a professional educational content scriptwriter for YouTube videos.
Write a complete, detailed, professional, and educational video script for the given lesson.

The script must:
- Be written in a professional, educational tone suitable for a YouTube learning audience
- Include clear sections: INTRODUCTION, MAIN CONTENT (with numbered sub-sections), SUMMARY, and OUTRO
- Use conversational but authoritative language — like a knowledgeable teacher speaking directly to the viewer
- Include specific examples, analogies, and real-world applications where appropriate
- Reference the lesson's key points and talking points naturally within the script
- Include visual cues in brackets like [SCREEN: ...], [DEMO: ...], [GRAPHIC: ...] to guide video editing
- Include transition phrases between sections
- Be detailed enough for the presenter to record the video directly from this script
- End with a call-to-action (subscribe, like, comment, next video teaser)

The script should be attributed to: AUTHOR NAME

Return ONLY valid JSON with this exact structure:
{
  "full_script": "The complete script text here...",
  "author": "Author Name"
}

Do NOT include markdown code fences. Return raw JSON only."""


METADATA_SYSTEM_PROMPT = """You are a YouTube SEO and metadata specialist.
Given a video script, generate a compelling, click-worthy YouTube title and a
detailed, search-friendly video description.

The description should:
- Be written in a professional, educational tone
- Include a short hook in the first 2 lines (shown in search previews)
- Use line breaks and light structure (bullet points / sections) for readability
- Mention what viewers will learn
- Include a closing line with a call-to-action (subscribe, like, comment)
- Be suitable for the video's author

Return ONLY valid JSON with this exact structure:
{
  "title": "Compelling YouTube title (max ~70 chars)",
  "description": "Full video description with line breaks"
}

Do NOT include markdown code fences. Return raw JSON only."""


async def generate_lesson_plan(
    title: str,
    prompt: str,
    num_lessons: int = 5,
    model: str | None = None,
) -> dict:
    """Call OpenRouter API to generate a lesson plan.

    Returns the parsed JSON response with the lesson plan.
    """
    if not settings.openrouter_api_key or settings.openrouter_api_key.startswith("sk-or-v1-your"):
        raise ValueError(
            "OpenRouter API key is not configured. "
            "Set OPENROUTER_API_KEY in your .env file. "
            "Get your key at https://openrouter.ai/keys"
        )
    model = model or settings.openrouter_model
    user_message = f"Video Series Title: {title}\n\nAdditional context/requirements: {prompt}\n\nGenerate {num_lessons} lessons."

    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(
            f"{settings.openrouter_api_url}/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.openrouter_api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:8000",
                "X-Title": "Video Lesson Planner",
            },
            json={
                "model": model,
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_message},
                ],
                "temperature": 0.7,
                "max_tokens": 8000,
            },
        )
        response.raise_for_status()
        data = response.json()

    content = data["choices"][0]["message"]["content"]
    tokens_used = data.get("usage", {}).get("total_tokens", 0)

    parsed = _extract_json(content)
    parsed["_model"] = model
    parsed["_tokens"] = tokens_used
    return parsed


async def generate_lesson_script(
    lesson_title: str,
    lesson_description: str,
    key_points: list[str],
    talking_points: list[str],
    script_outline: str,
    duration_minutes: int,
    author: str = "manjunath kalburgi",
    model: str | None = None,
) -> dict:
    """Generate a full professional script for a single lesson.

    Returns dict with 'full_script' and 'author' keys.
    """
    if not settings.openrouter_api_key or settings.openrouter_api_key.startswith("sk-or-v1-your"):
        raise ValueError(
            "OpenRouter API key is not configured. "
            "Set OPENROUTER_API_KEY in your .env file. "
            "Get your key at https://openrouter.ai/keys"
        )
    model = model or settings.openrouter_model

    user_message = (
        f"Lesson Title: {lesson_title}\n"
        f"Description: {lesson_description}\n"
        f"Duration: {duration_minutes} minutes\n"
        f"Key Points:\n" + "\n".join(f"- {p}" for p in key_points) + "\n"
        "Talking Points:\n" + "\n".join(f"- {p}" for p in talking_points) + "\n"
        f"Script Outline:\n{script_outline}\n\n"
        f"Author: {author}\n\n"
        f"Write a complete, detailed, professional, and educational script for this lesson. "
        f"The script should be approximately {duration_minutes} minutes when read aloud at a natural pace. "
        f"Author the script as '{author}'."
    )

    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(
            f"{settings.openrouter_api_url}/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.openrouter_api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:8000",
                "X-Title": "Video Lesson Planner",
            },
            json={
                "model": model,
                "messages": [
                    {"role": "system", "content": SCRIPT_SYSTEM_PROMPT},
                    {"role": "user", "content": user_message},
                ],
                "temperature": 0.7,
                "max_tokens": 8000,
            },
        )
        response.raise_for_status()
        data = response.json()

    content = data["choices"][0]["message"]["content"]
    tokens_used = data.get("usage", {}).get("total_tokens", 0)

    parsed = _extract_json(content)
    parsed["_model"] = model
    parsed["_tokens"] = tokens_used
    return parsed


IMAGE_MODEL = "google/gemini-2.5-flash-image"

IMAGE_SYSTEM_PROMPT = (
    "You are a YouTube thumbnail / educational illustration designer. "
    "Based on the provided lesson title and script, create a clean, professional, "
    "and visually appealing image suitable as a video thumbnail or lesson illustration. "
    "The image should be clear, on-topic, and avoid any text overlay unless essential. "
    "Return the generated image."
)


async def generate_script_image(
    lesson_title: str,
    full_script: str,
    author: str = "manjunath kalburgi",
    model: str | None = None,
) -> dict:
    """Generate an illustrative image for a lesson script using a Gemini image model.

    Returns dict with 'image_base64' (raw base64, no prefix) and 'image_prompt'.
    """
    if not settings.openrouter_api_key or settings.openrouter_api_key.startswith("sk-or-v1-your"):
        raise ValueError("OpenRouter API key is not configured.")
    model = model or IMAGE_MODEL

    image_prompt = (
        f"Educational illustration / YouTube thumbnail for the lesson titled "
        f"'{lesson_title}' by {author}. Themes from the script: "
        f"{full_script[:1200]}"
    )

    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(
            f"{settings.openrouter_api_url}/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.openrouter_api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:8000",
                "X-Title": "Video Lesson Planner",
            },
            json={
                "model": model,
                "messages": [
                    {"role": "system", "content": IMAGE_SYSTEM_PROMPT},
                    {"role": "user", "content": image_prompt},
                ],
            },
        )
        response.raise_for_status()
        data = response.json()

    # Gemini image models return base64 image data inside message content parts.
    content = data["choices"][0]["message"].get("content", [])
    image_b64 = ""
    if isinstance(content, list):
        for part in content:
            if isinstance(part, dict) and part.get("type") == "image_url":
                url = part.get("image_url", {}).get("url", "")
                if url.startswith("data:"):
                    image_b64 = url.split(",", 1)[1] if "," in url else url
                else:
                    image_b64 = url
                break
    return {
        "image_base64": image_b64,
        "image_prompt": image_prompt,
        "_model": model,
        "_tokens": data.get("usage", {}).get("total_tokens", 0),
    }


PPT_SYSTEM_PROMPT = """You are a presentation designer. Given a video lesson script, produce
a structured slide outline for a PowerPoint deck.

Rules:
- Create 4 to 7 content slides
- Each slide has a short title and 3 to 5 concise bullet points
- Bullets should be clear, standalone statements (no sub-bullets)
- Cover the key concepts from the script in a logical teaching order
- Keep each bullet under ~140 characters

Return ONLY valid JSON with this exact structure:
{
  "slides": [
    {"title": "Slide Title", "bullets": ["Bullet 1", "Bullet 2", "Bullet 3"]},
    {"title": "Another Slide", "bullets": ["Bullet 1", "Bullet 2"]}
  ]
}

Do NOT include markdown code fences. Return raw JSON only."""


async def generate_ppt_outline(
    lesson_title: str,
    full_script: str,
    model: str | None = None,
) -> dict:
    """Generate a slide outline (title + bullets) from a lesson script."""
    if not settings.openrouter_api_key or settings.openrouter_api_key.startswith("sk-or-v1-your"):
        raise ValueError("OpenRouter API key is not configured.")
    model = model or settings.openrouter_model

    user_message = (
        f"Lesson Title: {lesson_title}\n\n"
        f"Video Script:\n{full_script}\n\n"
        f"Create a slide outline for a teaching presentation based on this script."
    )

    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(
            f"{settings.openrouter_api_url}/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.openrouter_api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:8000",
                "X-Title": "Video Lesson Planner",
            },
            json={
                "model": model,
                "messages": [
                    {"role": "system", "content": PPT_SYSTEM_PROMPT},
                    {"role": "user", "content": user_message},
                ],
                "temperature": 0.6,
                "max_tokens": 3000,
            },
        )
        response.raise_for_status()
        data = response.json()

    content = data["choices"][0]["message"]["content"]
    tokens_used = data.get("usage", {}).get("total_tokens", 0)
    parsed = _extract_json(content)
    parsed["_model"] = model
    parsed["_tokens"] = tokens_used
    return parsed


async def generate_video_metadata(
    lesson_title: str,
    full_script: str,
    author: str = "manjunath kalburgi",
    model: str | None = None,
) -> dict:
    """Generate a YouTube title and description from a lesson script.

    Returns dict with 'title' and 'description' keys.
    """
    if not settings.openrouter_api_key or settings.openrouter_api_key.startswith("sk-or-v1-your"):
        raise ValueError(
            "OpenRouter API key is not configured. Set OPENROUTER_API_KEY in your .env file."
        )
    model = model or settings.openrouter_model

    user_message = (
        f"Lesson Title: {lesson_title}\n"
        f"Author: {author}\n\n"
        f"Video Script:\n{full_script}\n\n"
        f"Generate a YouTube title and description for this video, authored by {author}."
    )

    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(
            f"{settings.openrouter_api_url}/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.openrouter_api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:8000",
                "X-Title": "Video Lesson Planner",
            },
            json={
                "model": model,
                "messages": [
                    {"role": "system", "content": METADATA_SYSTEM_PROMPT},
                    {"role": "user", "content": user_message},
                ],
                "temperature": 0.7,
                "max_tokens": 2000,
            },
        )
        response.raise_for_status()
        data = response.json()

    content = data["choices"][0]["message"]["content"]
    tokens_used = data.get("usage", {}).get("total_tokens", 0)

    parsed = _extract_json(content)
    parsed["_model"] = model
    parsed["_tokens"] = tokens_used
    return parsed
