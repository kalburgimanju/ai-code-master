"""Base agent framework for the recruitment agency platform."""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Optional
from uuid import uuid4

from pydantic import BaseModel, Field

from backend.config import get_settings
from backend.storage import get_db_session
from backend.storage.models import AgentConfig, AgentRun, AgentRunStatus, Company, Contact


class AgentContext(BaseModel):
    """Context passed to agent runs."""
    model_config = {"arbitrary_types_allowed": True}

    agent_id: str
    agent_config: AgentConfig
    run_id: str
    mode: str
    input_data: dict = Field(default_factory=dict)
    extra_data: dict = Field(default_factory=dict)


class AgentResult(BaseModel):
    """Result of an agent run."""
    success: bool
    items_processed: int = 0
    items_succeeded: int = 0
    items_failed: int = 0
    output_data: dict = Field(default_factory=dict)
    error_message: Optional[str] = None
    duration_seconds: float = 0.0
    logs: list[str] = Field(default_factory=list)
    current_step: Optional[str] = None
    steps_log: list[dict] = Field(default_factory=list)


@dataclass
class AgentStep:
    """A single step in an agent's execution."""
    name: str
    started_at: datetime = field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    success: bool = False
    output: Any = None
    error: Optional[str] = None
    metadata: dict = field(default_factory=dict)

    def complete(self, success: bool, output: Any = None, error: Optional[str] = None):
        self.completed_at = datetime.utcnow()
        self.success = success
        self.output = output
        self.error = error


class BaseAgent(ABC):
    """Base class for all recruitment agents."""

    def __init__(self, agent_config: AgentConfig):
        self.agent_config = agent_config
        self.settings = get_settings()
        self.steps: list[AgentStep] = []
        self._run_id: Optional[str] = None
        self._context: Optional[AgentContext] = None
        self._steps_log: list[dict] = []

    @property
    def run_id(self) -> str:
        if self._run_id is None:
            self._run_id = str(uuid4())[:8]
        return self._run_id

    @property
    def name(self) -> str:
        return self.agent_config.name

    def log(self, message: str, level: str = "INFO"):
        """Log a message with timestamp."""
        timestamp = datetime.utcnow().isoformat()
        log_entry = f"[{timestamp}] [{level}] [{self.name}] {message}"
        self.steps[-1].metadata.setdefault("logs", []).append(log_entry) if self.steps else None
        print(log_entry)

    def log_step(self, name: str, details: str = "", status: str = "running") -> dict:
        """Log a step for frontend progress tracking. Returns the step dict."""
        step_entry = {
            "name": name,
            "details": details,
            "status": status,  # running, completed, failed
            "started_at": datetime.utcnow().isoformat(),
            "completed_at": None,
        }
        self._steps_log.append(step_entry)
        self.log(f"Step: {name}" + (f" - {details}" if details else ""))
        return step_entry

    def complete_step_log(self, step_entry: dict, success: bool = True, details: str = ""):
        """Mark a step entry as completed."""
        step_entry["status"] = "completed" if success else "failed"
        step_entry["completed_at"] = datetime.utcnow().isoformat()
        if details:
            step_entry["details"] = details

    async def _save_run_progress(self):
        """Persist current step progress to the database so the frontend can poll it."""
        if not self._run_id:
            return
        try:
            async with get_db_session() as session:
                run = await session.get(AgentRun, self._run_id)
                if run:
                    run.output_data = {
                        **(run.output_data or {}),
                        "steps_log": self._steps_log,
                        "current_step": self._steps_log[-1]["name"] if self._steps_log else None,
                    }
                    await session.commit()
        except Exception:
            pass  # Don't let progress saving break the agent

    def start_step(self, name: str) -> AgentStep:
        """Start a new step."""
        step = AgentStep(name=name)
        self.steps.append(step)
        self.log(f"Starting step: {name}")
        return step

    def complete_step(self, step: AgentStep, success: bool, output: Any = None, error: Optional[str] = None):
        """Complete a step."""
        step.complete(success, output, error)
        status = "SUCCESS" if success else "FAILED"
        self.log(f"Step {step.name}: {status}" + (f" - {error}" if error else ""))

    async def save_run(self, result: AgentResult, session=None) -> AgentRun:
        """Save the agent run to database."""
        run = AgentRun(
            id=self.run_id,
            agent_id=self.agent_config.id,
            mode=self._context.mode if self._context else "unknown",
            status=AgentRunStatus.COMPLETED if result.success else AgentRunStatus.FAILED,
            input_data=self._context.input_data if self._context else {},
            output_data=result.output_data,
            error_message=result.error_message,
            items_processed=result.items_processed,
            items_succeeded=result.items_succeeded,
            items_failed=result.items_failed,
            duration_seconds=result.duration_seconds,
            started_at=datetime.utcnow(),
            completed_at=datetime.utcnow(),
        )

        if session:
            session.add(run)
            await session.flush()
        else:
            async with get_db_session() as session:
                session.add(run)
                await session.commit()
                await session.refresh(run)

        return run

    @abstractmethod
    async def run(self, context: AgentContext) -> AgentResult:
        """Execute the agent's main logic."""
        pass

    async def execute(self, context: AgentContext) -> AgentResult:
        """Execute the agent with full lifecycle management."""
        self._context = context
        self._run_id = context.run_id
        self.steps = []
        self._steps_log = []

        start_time = datetime.utcnow()
        self.log(f"Starting agent run: {context.mode}")

        # Create run record
        async with get_db_session() as session:
            run = AgentRun(
                id=self.run_id,
                agent_id=self.agent_config.id,
                mode=context.mode,
                status=AgentRunStatus.RUNNING,
                input_data=context.input_data,
                started_at=start_time,
            )
            session.add(run)
            await session.commit()

        try:
            result = await self.run(context)
            result.duration_seconds = (datetime.utcnow() - start_time).total_seconds()
            result.steps_log = self._steps_log
            result.current_step = None

            # Re-fetch run in a new session (previous session is closed)
            async with get_db_session() as session:
                run = await session.get(AgentRun, self.run_id)
                if run:
                    run.status = AgentRunStatus.COMPLETED if result.success else AgentRunStatus.FAILED
                    run.output_data = {
                        **(result.output_data or {}),
                        "steps_log": self._steps_log,
                        "current_step": None,
                    }
                    run.error_message = result.error_message
                    run.items_processed = result.items_processed
                    run.items_succeeded = result.items_succeeded
                    run.items_failed = result.items_failed
                    run.duration_seconds = result.duration_seconds
                    run.completed_at = datetime.utcnow()
                    await session.commit()

                # Update agent status
                from backend.storage.models import AgentConfig, AgentStatus
                agent = await session.get(AgentConfig, self.agent_config.id)
                if agent:
                    agent.status = AgentStatus.ACTIVE
                    agent.last_run_at = datetime.utcnow()
                    await session.commit()

            self.log(f"Agent run completed: {result.success}, processed={result.items_processed}")
            return result

        except Exception as e:
            self.log(f"Agent run failed: {e}", "ERROR")
            error_result = AgentResult(
                success=False,
                error_message=str(e),
                duration_seconds=(datetime.utcnow() - start_time).total_seconds(),
                steps_log=self._steps_log,
                current_step=None,
            )

            # Re-fetch run in a new session
            async with get_db_session() as session:
                run = await session.get(AgentRun, self.run_id)
                if run:
                    run.status = AgentRunStatus.FAILED
                    run.error_message = str(e)
                    run.output_data = {
                        **(run.output_data or {}),
                        "steps_log": self._steps_log,
                        "current_step": None,
                    }
                    run.duration_seconds = error_result.duration_seconds
                    run.completed_at = datetime.utcnow()
                    await session.commit()

            return error_result


class LLMMixin:
    """Mixin for LLM-powered agents."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._llm_client = None

    @property
    def llm_client(self):
        if self._llm_client is None:
            from backend.services.llm import LLMClient
            self._llm_client = LLMClient()
        return self._llm_client

    async def generate(self, prompt: str, system: Optional[str] = None, **kwargs) -> str:
        """Generate text using LLM."""
        return await self.llm_client.generate(prompt, system, **kwargs)

    async def generate_structured(self, prompt: str, schema: type[BaseModel], system: Optional[str] = None, **kwargs) -> BaseModel:
        """Generate structured output using LLM."""
        return await self.llm_client.generate_structured(prompt, schema, system, **kwargs)
