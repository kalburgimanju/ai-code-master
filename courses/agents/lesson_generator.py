"""AI agent for generating lesson plans and content from topics."""

import asyncio
import json
import logging
from datetime import datetime
from typing import Any

from agents.models import Lesson, LessonPlan

logger = logging.getLogger(__name__)


class AIClient:
    """Stub AI client for generating text responses.

    In production, replace with actual Anthropic/OpenAI SDK calls.
    """

    async def generate_text(
        self,
        prompt: str,
        model: str = "gpt-4",
        max_tokens: int = 4000,
        temperature: float = 0.7,
    ) -> str:
        """Generate text response from prompt.

        Args:
            prompt: The prompt to send to the AI.
            model: The model to use.
            max_tokens: Maximum tokens in response.
            temperature: Sampling temperature.

        Returns:
            JSON string with generated content.
        """
        _ = (
            prompt,
            model,
            max_tokens,
            temperature,
        )  # reserved for production API calls
        # Stub: return a structured response based on the prompt
        return json.dumps(
            {
                "title": "AI-Generated Lesson",
                "overview": "A comprehensive lesson covering the requested topic.",
                "objectives": [
                    "Understand core concepts",
                    "Apply knowledge practically",
                ],
                "duration": 60,
                "prerequisites": [],
                "content": {
                    "introduction": "Welcome to this lesson.",
                    "sections": [
                        {
                            "title": "Section 1: Fundamentals",
                            "content": "Core concepts and fundamentals.",
                            "code_examples": ["print('Hello World')"],
                            "diagrams": ["Architecture overview diagram"],
                        }
                    ],
                    "key_takeaways": ["Key point 1", "Key point 2"],
                    "summary": "Lesson summary.",
                },
                "activities": {
                    "interactive_elements": ["Code playground"],
                    "exercises": ["Practice exercise 1"],
                    "projects": ["Build a simple app"],
                    "assessments": ["Quiz"],
                },
                "resources": {
                    "required_materials": ["Computer"],
                    "references": ["Documentation"],
                    "additional_reading": ["Blog post"],
                },
                "schedule": [
                    {"week": 1, "topic": "Introduction", "milestone": "Complete setup"},
                ],
            }
        )


class LessonGenerator:
    """AI agent for generating lesson plans and content from topics."""

    def __init__(
        self, model: str = "gpt-4", max_tokens: int = 4000, temperature: float = 0.7
    ):
        self.model = model
        self.max_tokens = max_tokens
        self.temperature = temperature
        self.ai_client = AIClient()

    async def generate_lesson_plan(
        self, topic: str, course_info: dict[str, Any]
    ) -> LessonPlan:
        """Generate a comprehensive lesson plan for a given topic.

        Args:
            topic: The topic for the lesson.
            course_info: Course information including level, objectives, duration.

        Returns:
            Generated lesson plan.

        Raises:
            RuntimeError: If lesson plan generation fails.
        """
        try:
            prompt = self._build_lesson_plan_prompt(topic, course_info)

            response = await self.ai_client.generate_text(
                prompt=prompt,
                model=self.model,
                max_tokens=self.max_tokens,
                temperature=self.temperature,
            )

            lesson_data = json.loads(response)
            lesson_plan = LessonPlan(
                id=f"lp_{topic.replace(' ', '_').lower()}",
                title=lesson_data.get("title", topic),
                overview=lesson_data.get("overview", ""),
                objectives=lesson_data.get("objectives", []),
                duration=lesson_data.get("duration", 60),
                prerequisites=lesson_data.get("prerequisites", []),
                content=lesson_data.get("content", {}),
                activities=lesson_data.get("activities", {}),
                resources=lesson_data.get("resources", {}),
                schedule=lesson_data.get("schedule", []),
                lessons=[],
                status="draft",
                course_id=course_info.get("course_id", ""),
                created_at=datetime.utcnow().isoformat(),
                updated_at=datetime.utcnow().isoformat(),
                ai_model=self.model,
            )

            # Generate individual lessons
            lessons = await self._generate_individual_lessons(lesson_plan, course_info)
            lesson_plan.lessons = lessons
            return lesson_plan

        except json.JSONDecodeError as e:
            logger.error("Failed to parse AI response as JSON: %s", e)
            raise RuntimeError(f"Invalid AI response format: {e}") from e
        except Exception as e:
            logger.error("Failed to generate lesson plan for topic '%s': %s", topic, e)
            raise RuntimeError(f"Failed to generate lesson plan: {e}") from e

    def _build_lesson_plan_prompt(self, topic: str, course_info: dict[str, Any]) -> str:
        """Build the prompt for lesson plan generation."""
        return f"""
Create a comprehensive lesson plan for the topic: {topic}

Course Information:
- Course Level: {course_info.get("level", "intermediate")}
- Course Duration: {course_info.get("duration", 4)} weeks
- Course Objectives: {course_info.get("objectives", [])}
- Target Audience: {course_info.get("target_audience", "students")}

Provide a structured lesson plan with the following sections:
1. Lesson Overview
   - Title
   - Objectives
   - Estimated Duration
   - Prerequisites

2. Lesson Content
   - Introduction
   - Main Content Sections (4-5 sections)
   - Key Takeaways
   - Summary

3. Learning Activities
   - Interactive Elements
   - Exercises
   - Projects
   - Assessments

4. Resources
   - Required Materials
   - References
   - Additional Reading

5. Schedule
   - Week-by-week breakdown
   - Key milestones

Format the response as JSON with the following structure:
{{
    "title": "Lesson Title",
    "overview": "Brief overview of the lesson",
    "objectives": ["Objective 1", "Objective 2", "Objective 3"],
    "duration": 60,
    "prerequisites": ["Prerequisite 1", "Prerequisite 2"],
    "content": {{
        "introduction": "Lesson introduction",
        "sections": [
            {{
                "title": "Section Title",
                "content": "Section content",
                "code_examples": ["Example code 1", "Example code 2"],
                "diagrams": ["Description of diagram"]
            }}
        ],
        "key_takeaways": ["Takeaway 1", "Takeaway 2", "Takeaway 3"],
        "summary": "Lesson summary"
    }},
    "activities": {{
        "interactive_elements": ["Interactive element 1", "Interactive element 2"],
        "exercises": ["Exercise 1", "Exercise 2"],
        "projects": ["Project 1", "Project 2"],
        "assessments": ["Quiz", "Assignment"]
    }},
    "resources": {{
        "required_materials": ["Material 1", "Material 2"],
        "references": ["Reference 1", "Reference 2"],
        "additional_reading": ["Reading 1", "Reading 2"]
    }},
    "schedule": [
        {{
            "week": 1,
            "topic": "Week topic",
            "milestone": "Week milestone"
        }}
    ]
}}
"""

    async def _generate_individual_lessons(
        self, lesson_plan: LessonPlan, _course_info: dict[str, Any]
    ) -> list[Lesson]:
        """Generate individual lessons from the lesson plan.

        Args:
            lesson_plan: The parent lesson plan.
            _course_info: Course information (reserved for future enrichment).

        Returns:
            List of generated lessons.
        """
        lessons = []
        sections = (
            lesson_plan.content.get("sections", [])
            if isinstance(lesson_plan.content, dict)
            else []
        )
        section_count = len(sections) or 1

        for idx, section in enumerate(sections):
            lesson = Lesson(
                id=f"{lesson_plan.id}_{idx + 1}",
                title=section.get("title", f"Section {idx + 1}"),
                content=section.get("content", ""),
                code_examples=section.get("code_examples", []),
                diagrams=section.get("diagrams", []),
                duration=lesson_plan.duration // section_count,
                objectives=lesson_plan.objectives,
                prerequisites=lesson_plan.prerequisites,
                activities=lesson_plan.activities,
                resources=lesson_plan.resources,
                status="pending",
                progress=0.0,
                created_at=datetime.utcnow().isoformat(),
                updated_at=datetime.utcnow().isoformat(),
                course_id=lesson_plan.course_id,
                presentation_generated=False,
            )
            lessons.append(lesson)

        return lessons

    async def generate_lesson_content(
        self, lesson_id: str, lesson_plan: LessonPlan
    ) -> dict[str, Any]:
        """Generate comprehensive content for a specific lesson.

        Args:
            lesson_id: ID of the lesson.
            lesson_plan: The parent lesson plan.

        Returns:
            Generated content dictionary.
        """
        try:
            prompt = self._build_content_generation_prompt(lesson_plan)

            response = await self.ai_client.generate_text(
                prompt=prompt,
                model=self.model,
                max_tokens=self.max_tokens * 2,
                temperature=self.temperature * 0.8,
            )

            return json.loads(response)

        except json.JSONDecodeError as e:
            logger.error("Failed to parse content response: %s", e)
            return {"error": f"Invalid response format: {e}"}
        except Exception as e:
            logger.error("Failed to generate content for lesson '%s': %s", lesson_id, e)
            raise RuntimeError(f"Failed to generate lesson content: {e}") from e

    def _build_content_generation_prompt(self, lesson_plan: LessonPlan) -> str:
        """Build the prompt for content generation."""
        return f"""
Generate comprehensive lesson content for the following lesson plan:

Title: {lesson_plan.title}
Objectives: {lesson_plan.objectives}
Duration: {lesson_plan.duration} minutes

Please provide:
1. Detailed lesson content with examples
2. Code examples with explanations
3. Visual descriptions/diagrams
4. Interactive exercises
5. Project ideas
6. Assessment questions
7. Reference materials
8. Additional resources

Format as JSON:
{{
    "detailed_content": "Full lesson content",
    "code_examples": [
        {{
            "title": "Example Title",
            "code": "example code",
            "explanation": "Explanation of the code"
        }}
    ],
    "diagrams": [
        {{
            "title": "Diagram Title",
            "description": "Diagram description",
            "type": "flowchart/diagram_type"
        }}
    ],
    "exercises": [
        {{
            "title": "Exercise Title",
            "problem": "Problem description",
            "solution": "Solution description",
            "difficulty": "easy/medium/hard"
        }}
    ],
    "projects": [
        {{
            "title": "Project Title",
            "description": "Project description",
            "requirements": ["Requirement 1", "Requirement 2"],
            "evaluation_criteria": ["Criteria 1", "Criteria 2"]
        }}
    ],
    "assessments": [
        {{
            "type": "quiz/assignment/project",
            "title": "Assessment Title",
            "questions": ["Question 1", "Question 2"],
            "total_points": 100
        }}
    ],
    "resources": {{
        "primary_resources": ["Resource 1", "Resource 2"],
        "additional_resources": ["Resource 3", "Resource 4"]
    }},
    "interactive_elements": ["Interactive element 1", "Interactive element 2"],
    "difficulty_level": "beginner/intermediate/advanced",
    "time_required": "estimated time"
}}
"""

    async def generate_ai_response(
        self, prompt: str, context: dict[str, Any] | None = None
    ) -> str:
        """Generate AI response for specific prompts.

        Args:
            prompt: The prompt for AI.
            context: Additional context.

        Returns:
            AI response string.
        """
        try:
            full_prompt = prompt
            if context:
                context_str = "\n".join(f"{k}: {v}" for k, v in context.items())
                full_prompt = f"Context:\n{context_str}\n\nPrompt:\n{prompt}"

            response = await self.ai_client.generate_text(
                prompt=full_prompt,
                model=self.model,
                max_tokens=self.max_tokens // 2,
                temperature=self.temperature,
            )

            return response

        except Exception as e:
            logger.error("Failed to generate AI response: %s", e)
            raise RuntimeError(f"Failed to generate AI response: {e}") from e

    async def batch_generate_lesson_plans(
        self, topics: list[str], course_info: dict[str, Any]
    ) -> list[LessonPlan]:
        """Generate lesson plans for multiple topics in batch.

        Args:
            topics: List of topics to generate lesson plans for.
            course_info: Course information.

        Returns:
            List of generated lesson plans.
        """
        tasks = [self.generate_lesson_plan(topic, course_info) for topic in topics]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        lesson_plans = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                logger.error(
                    "Failed to generate lesson plan for topic '%s': %s",
                    topics[i],
                    result,
                )
                continue
            lesson_plans.append(result)

        return lesson_plans
