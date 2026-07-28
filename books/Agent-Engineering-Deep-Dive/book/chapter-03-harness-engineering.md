# Chapter 3: Harness Engineering — Building Reliable Agent Systems

> "Premature optimization is the root of all evil." — Donald Knuth

---

## 3.1 What is Harness Engineering?

When people talk about building AI agents, they spend most of their energy on the "brain" — the prompts, the model selection, the reasoning strategy. But the hard part of production-grade agents isn't making them smart. It's making them *reliable*. A brilliant agent that crashes on malformed input, runs up a $500 API bill in an hour, or executes a destructive tool call without permission is worse than useless — it's dangerous.

**Harness engineering** is the discipline of building the scaffolding, guardrails, and control systems that wrap around an LLM to make it behave reliably in production. Think of it as building the operating system for your agent.

### Components of a Complete Harness

A production harness consists of several interlocking components:

| Component | Purpose | Failure Mode Without It |
|---|---|---|
| Tool Registry | Maps tool names to implementations | Ambiguous or missing tool calls |
| Execution Sandbox | Isolates tool execution | Tool errors crash the agent loop |
| Error Recovery | Handles transient failures gracefully | Single API timeout kills the session |
| Rate Limiter | Controls request throughput | Provider rate limits or runaway costs |
| Permission System | Gates sensitive actions | Agent deletes data it shouldn't |
| Budget Manager | Tracks token usage and cost | Unbounded API spend |
| Output Validator | Verifies model output structure | Malformed responses propagate |

### The Complete Harness Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      USER REQUEST                            │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│                    INPUT VALIDATION                           │
│  ┌──────────┐  ┌──────────────┐  ┌────────────────────┐     │
│  │ Sanitize │→ │ Rate Check   │→ │ Permission Verify  │     │
│  └──────────┘  └──────────────┘  └────────────────────┘     │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│                 AGENT LOOP (ReAct / Plan)                     │
│                                                               │
│  ┌──────────┐  ┌────────────┐  ┌──────────────────────┐     │
│  │  LLM API │→ │ Tool Select │→ │ Output Validation    │     │
│  │  Call     │  │ & Dispatch │  │ & Budget Check       │     │
│  └──────────┘  └─────┬──────┘  └──────────────────────┘     │
│                      │                                        │
│                      ▼                                        │
│  ┌──────────────────────────────────────────────────────┐    │
│  │              TOOL EXECUTION SANDBOX                   │    │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────────┐   │    │
│  │  │ File   │ │ Web    │ │ DB     │ │ Code Exec  │   │    │
│  │  │ Read   │ │ Search │ │ Query  │ │ (isolated) │   │    │
│  │  └────────┘ └────────┘ └────────┘ └────────────┘   │    │
│  └──────────────────────────────────────────────────────┘    │
│                      │                                        │
│              ┌───────┴────────┐                              │
│              │ Max Iterations │                              │
│              │ Budget Exhausted│                              │
│              └───────┬────────┘                              │
└──────────────────────┼───────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│                   OUTPUT FILTERING                            │
│  ┌──────────┐  ┌──────────────┐  ┌────────────────────┐     │
│  │ PII Check│→ │ Content Filter│→ │ Format Validation  │     │
│  └──────────┘  └──────────────┘  └────────────────────┘     │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│                      USER RESPONSE                            │
└──────────────────────────────────────────────────────────────┘
```

The harness is what separates a demo from a product. In the rest of this chapter, we'll dissect each component.

---

## 3.2 The Tool-Use Loop

The tool-use loop is the beating heart of any agent. Understanding its mechanics — and its failure modes — is essential to harness engineering.

### How Tool Calling Works

The canonical flow is:

1. The LLM receives a prompt and a set of tool definitions
2. The LLM decides to call one or more tools, emitting structured tool-use blocks
3. The harness executes those tools in a sandbox
4. Tool results are fed back to the LLM as new messages
5. The LLM either calls more tools or produces a final answer
6. This loop repeats until completion or budget exhaustion

```
    ┌─────────┐
    │  Human   │
    │  Input   │
    └────┬─────┘
         │
         ▼
   ┌───────────┐     Yes    ┌──────────────┐
   │   LLM     │───────────→│ Tool Calls   │
   │  Decides  │            │   Emitted    │
   └───────────┘            └──────┬───────┘
        │                          │
        │ No                       │
        │                          ▼
        │                   ┌──────────────┐
        │                   │   Execute    │
        │                   │    Tools     │
        │                   └──────┬───────┘
        │                          │
        │                          ▼
        │                   ┌──────────────┐
        │                   │  Append to   │
        │                   │  Messages    │
        │                   └──────┬───────┘
        │                          │
        │                          │
        │    ◄─────────────────────┘
        │        (loop back)
        ▼
   ┌───────────┐
   │  Final    │
   │  Response │
   └───────────┘
```

### Single-Turn vs Multi-Turn Tool Use

A **single-turn** tool call is when the model requests one tool, gets the result, and produces an answer. A **multi-turn** tool call is when the model chains multiple tool calls across several iterations, building context with each result.

Multi-turn loops are where complexity lives. Each iteration consumes tokens (the growing message history), and the model must reason over an expanding context window. This creates a natural tension: more tool calls yield better results but increase cost and latency.

### Parallel vs Sequential Tool Calls

Most modern LLM APIs support parallel tool calls — the model can request multiple tools in a single response, and the harness executes them simultaneously. This dramatically reduces latency for independent operations.

```python
# Sequential: 3 sequential tools = 3 round trips = ~4.5s
read_file("src/main.py")       # 1.5s
run_linter("src/main.py")      # 1.5s
search_code("TODO")             # 1.5s

# Parallel: 3 parallel tools = 1 round trip = ~1.5s
# All three execute simultaneously
```

But parallelism requires careful design. Tools that share mutable state (like a file system) can produce race conditions. Tools with different timeout requirements need independent timeout budgets.

### Token Budget Management

Every iteration of the tool loop grows the message history. A naive implementation can quickly blow through the context window:

| Iteration | Messages | Estimated Tokens | Cumulative Cost (GPT-4o) |
|---|---|---|---|
| 1 | system + user + assistant + tool_result | ~4,000 | $0.02 |
| 3 | ...expanded history... | ~12,000 | $0.08 |
| 5 | ...more history... | ~25,000 | $0.18 |
| 10 | ...full context... | ~60,000 | $0.45 |

The harness must monitor token usage and either truncate history, switch to a cheaper model for intermediate steps, or enforce a maximum iteration count.

### Robust Tool-Use Loop Implementation

```python
from __future__ import annotations

import time
import logging
from dataclasses import dataclass, field
from typing import Any, Callable

logger = logging.getLogger(__name__)


@dataclass
class ToolCall:
    """Represents a single tool invocation."""
    id: str
    name: str
    arguments: dict[str, Any]


@dataclass
class ToolResult:
    """Result of executing a tool call."""
    tool_call_id: str
    tool_name: str
    output: str
    error: str | None = None
    elapsed_ms: float = 0.0


@dataclass
class LoopConfig:
    """Configuration for the tool-use loop."""
    max_iterations: int = 20
    max_tokens_per_call: int = 100_000
    tool_timeout_seconds: float = 30.0
    max_retries_per_tool: int = 2
    retry_base_delay: float = 1.0


@dataclass
class ToolRegistry:
    """Registry of available tools."""
    _tools: dict[str, Callable] = field(default_factory=dict)
    _schemas: dict[str, dict] = field(default_factory=dict)

    def register(
        self,
        name: str,
        handler: Callable[[dict], str],
        schema: dict,
    ) -> None:
        self._tools[name] = handler
        self._schemas[name] = schema

    def execute(self, name: str, arguments: dict) -> str:
        if name not in self._tools:
            raise ValueError(f"Unknown tool: {name}")
        return self._tools[name](arguments)

    def get_schemas(self) -> list[dict]:
        return list(self._schemas.values())


class ToolUseLoop:
    """
    A robust tool-use loop with retry logic, timeout handling,
    and maximum iteration guard.
    """

    def __init__(
        self,
        llm_client: Any,
        registry: ToolRegistry,
        config: LoopConfig | None = None,
    ) -> None:
        self.llm = llm_client
        self.registry = registry
        self.config = config or LoopConfig()

    def run(
        self,
        system_prompt: str,
        user_message: str,
        token_counter: Callable[[int], bool] | None = None,
    ) -> str:
        """Run the tool-use loop until completion or budget exhaustion."""
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message},
        ]
        total_tokens_used = 0

        for iteration in range(self.config.max_iterations):
            logger.info(f"Iteration {iteration + 1}/{self.config.max_iterations}")

            # Call the LLM
            response = self.llm.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=8192,
                tools=self.registry.get_schemas(),
                messages=messages,
            )

            # Track tokens
            usage = response.usage.input_tokens + response.usage.output_tokens
            total_tokens_used += usage

            # Check budget
            if token_counter and not token_counter(total_tokens_used):
                logger.warning("Token budget exhausted — stopping loop")
                return self._compose_final_answer(
                    messages, "Budget exhausted. Here is the best answer so far."
                )

            # Check if model produced a final answer (no tool calls)
            if response.stop_reason == "end_turn":
                return self._extract_text(response)

            # Process tool calls
            tool_calls = self._extract_tool_calls(response)
            if not tool_calls:
                return self._extract_text(response)

            # Execute tools (with retry and timeout)
            results = self._execute_tools(tool_calls)

            # Append assistant message and tool results to history
            messages.append(self._assistant_message_with_tools(response))
            for result in results:
                messages.append({
                    "role": "user",
                    "content": [{
                        "type": "tool_result",
                        "tool_use_id": result.tool_call_id,
                        "content": result.error or result.output,
                        "is_error": result.error is not None,
                    }],
                })

        # Exhausted all iterations
        logger.warning("Max iterations reached")
        return self._compose_final_answer(
            messages,
            "Maximum iterations reached. Providing best answer so far.",
        )

    def _execute_tools(self, tool_calls: list[ToolCall]) -> list[ToolResult]:
        """Execute tool calls with retry logic and timeout."""
        import concurrent.futures

        results: list[ToolResult] = []

        with concurrent.futures.ThreadPoolExecutor(
            max_workers=min(len(tool_calls), 5)
        ) as executor:
            future_map = {}
            for tc in tool_calls:
                future = executor.submit(
                    self._execute_single_tool_with_retry, tc
                )
                future_map[future] = tc

            for future in concurrent.futures.as_completed(future_map):
                tc = future_map[future]
                try:
                    result = future.result(
                        timeout=self.config.tool_timeout_seconds
                    )
                    results.append(result)
                except concurrent.futures.TimeoutError:
                    results.append(ToolResult(
                        tool_call_id=tc.id,
                        tool_name=tc.name,
                        output="",
                        error=f"Tool '{tc.name}' timed out after "
                              f"{self.config.tool_timeout_seconds}s",
                    ))

        return results

    def _execute_single_tool_with_retry(self, tc: ToolCall) -> ToolResult:
        """Execute a single tool with exponential backoff retry."""
        import random

        last_error: str | None = None

        for attempt in range(self.config.max_retries_per_tool + 1):
            start = time.monotonic()
            try:
                output = self.registry.execute(tc.name, tc.arguments)
                elapsed = (time.monotonic() - start) * 1000
                return ToolResult(
                    tool_call_id=tc.id,
                    tool_name=tc.name,
                    output=output,
                    elapsed_ms=elapsed,
                )
            except Exception as exc:
                elapsed = (time.monotonic() - start) * 1000
                last_error = str(exc)
                logger.warning(
                    f"Tool '{tc.name}' attempt {attempt + 1} failed: "
                    f"{last_error} ({elapsed:.0f}ms)"
                )

                if attempt < self.config.max_retries_per_tool:
                    delay = self.config.retry_base_delay * (2 ** attempt)
                    jitter = random.uniform(0, delay * 0.1)
                    time.sleep(delay + jitter)

        return ToolResult(
            tool_call_id=tc.id,
            tool_name=tc.name,
            output="",
            error=f"Tool '{tc.name}' failed after "
                  f"{self.config.max_retries_per_tool + 1} attempts: "
                  f"{last_error}",
        )

    def _extract_tool_calls(self, response: Any) -> list[ToolCall]:
        tool_calls = []
        for block in response.content:
            if block.type == "tool_use":
                tool_calls.append(ToolCall(
                    id=block.id,
                    name=block.name,
                    arguments=block.input,
                ))
        return tool_calls

    def _extract_text(self, response: Any) -> str:
        parts = []
        for block in response.content:
            if block.type == "text":
                parts.append(block.text)
        return "\n".join(parts)

    def _assistant_message_with_tools(self, response: Any) -> dict:
        content = []
        for block in response.content:
            if block.type == "tool_use":
                content.append({
                    "type": "tool_use",
                    "id": block.id,
                    "name": block.name,
                    "input": block.input,
                })
        return {"role": "assistant", "content": content}

    def _compose_final_answer(
        self, messages: list[dict], note: str
    ) -> str:
        messages.append({
            "role": "user",
            "content": (
                f"Please provide your final answer now. "
                f"Note: {note}"
            ),
        })
        response = self.llm.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=8192,
            messages=messages,
        )
        return self._extract_text(response)
```

This implementation includes every safety mechanism a production harness needs: iteration limits, token budget tracking, tool timeouts, retry with exponential backoff, and graceful degradation when budgets are exhausted.

---

## 3.3 Tool Design Principles

The quality of your tool definitions directly determines the quality of your agent. A poorly described tool will be called at the wrong time, with the wrong arguments, producing wrong results.

### Tool Naming Conventions

Tool names should be clear, descriptive, and follow consistent patterns:

```
# GOOD: action_verb + target_noun
search_codebase
read_file
create_pull_request
run_linter
query_database

# BAD: cryptic abbreviations or overly generic names
sc           # what does "sc" do?
do_stuff     # too vague
api_call     # every tool is an API call
run          # run what?
```

### Parameter Schema Design

Every parameter should be typed, documented, and have sensible defaults:

```json
{
  "name": "search_codebase",
  "description": "Search the codebase for files matching a pattern or containing specific content.",
  "input_schema": {
    "type": "object",
    "properties": {
      "pattern": {
        "type": "string",
        "description": "Glob pattern to match files (e.g., '**/*.py', 'src/**/*.ts')"
      },
      "query": {
        "type": "string",
        "description": "Text to search for within matching files. Supports regex."
      },
      "max_results": {
        "type": "integer",
        "description": "Maximum number of results to return. Default: 20.",
        "default": 20
      },
      "case_sensitive": {
        "type": "boolean",
        "description": "Whether the text search is case-sensitive. Default: false.",
        "default": false
      }
    },
    "required": ["pattern"]
  }
}
```

### Tool Description Writing

The description is the most important part of your tool definition. The LLM reads it to decide *when* and *how* to use the tool. Write for a model, not a human.

### Good vs Bad Tool Descriptions

| Aspect | Good | Bad |
|---|---|---|
| Name | `search_codebase` | `search` |
| Description | "Search code files by glob pattern and optional text query. Use for finding files, locating functions, or finding references. Returns file paths with line numbers." | "Searches things" |
| When to use | Explicitly stated | Not stated |
| Limitations | "Limited to files under 1MB. Regex may time out on very large files." | Not mentioned |
| Parameter docs | Each param has a clear description with example values | Params have names only |

### Idempotency and Side Effects

Tool design must account for idempotency:

```python
# IDEMPOTENT: safe to retry
def read_file(args: dict) -> str:
    """Read a file's contents. Safe to call multiple times."""
    with open(args["path"]) as f:
        return f.read()

# NON-IDEMPOTENT: dangerous to retry
def append_to_log(args: dict) -> str:
    """Append a line to a log file. Each call adds another line."""
    with open(args["path"], "a") as f:
        f.write(args["line"] + "\n")

# IDEMPOTENT VERSION: safe to retry
def set_log_line(args: dict) -> str:
    """Set a specific line in a log file by key. Overwrites if exists."""
    key = args["key"]
    lines = read_all_lines(args["path"])
    lines[key] = args["line"]
    write_all_lines(args["path"], lines)
    return f"Line '{key}' set."
```

---

## 3.4 Guardrails and Safety

Guardrails are the safety mechanisms that prevent the agent from causing harm. They exist at every layer of the harness.

### Input Validation

Before any user input reaches the LLM, it should be sanitized:

```python
import re
from dataclasses import dataclass


@dataclass
class ValidationResult:
    """Result of input validation."""
    is_valid: bool
    sanitized_input: str
    blocked_reasons: list[str]


class InputGuardrail:
    """Validate and sanitize user input before it reaches the LLM."""

    MAX_INPUT_LENGTH = 100_000
    BLOCKED_PATTERNS = [
        (re.compile(r"ignore\s+(all\s+)?previous\s+instructions", re.I),
         "prompt_injection"),
        (re.compile(r"you\s+are\s+now\s+(DAN|jailbreak)", re.I),
         "jailbreak_attempt"),
        (re.compile(r"<script[^>]*>", re.I),
         "html_injection"),
    ]
    PII_PATTERNS = [
        (re.compile(r"\b\d{3}-\d{2}-\d{4}\b"), "SSN"),
        (re.compile(r"\b\d{16}\b"), "credit_card_number"),
        (re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b"),
         "email_address"),
    ]

    def validate(self, raw_input: str) -> ValidationResult:
        reasons: list[str] = []

        # Length check
        if len(raw_input) > self.MAX_INPUT_LENGTH:
            reasons.append(
                f"Input exceeds maximum length "
                f"({len(raw_input)} > {self.MAX_INPUT_LENGTH})"
            )

        # Injection / jailbreak detection
        for pattern, label in self.BLOCKED_PATTERNS:
            if pattern.search(raw_input):
                reasons.append(f"Blocked pattern detected: {label}")

        # PII detection and redaction
        sanitized = raw_input
        for pattern, pii_type in self.PII_PATTERNS:
            sanitized = pattern.sub(f"[REDACTED_{pii_type}]", sanitized)

        return ValidationResult(
            is_valid=len(reasons) == 0,
            sanitized_input=sanitized,
            blocked_reasons=reasons,
        )
```

### Permission System

Not all tools should be equally accessible. A well-designed permission system gates tools by risk level:

```python
from enum import Enum


class Permission(Enum):
    """Permission levels for tool access."""
    READ_ONLY = "read_only"
    WRITE = "write"
    ADMIN = "admin"


class PermissionGate:
    """Gate tool access based on permission levels."""

    def __init__(self, max_permission: Permission) -> None:
        self.max_permission = max_permission
        self._hierarchy = {
            Permission.READ_ONLY: 0,
            Permission.WRITE: 1,
            Permission.ADMIN: 2,
        }

    def check(self, tool_name: str, required: Permission) -> bool:
        current = self._hierarchy[self.max_permission]
        needed = self._hierarchy[required]
        allowed = current >= needed
        if not allowed:
            logger.warning(
                f"Permission denied: tool '{tool_name}' requires "
                f"{required.value}, but only {self.max_permission.value} "
                f"is granted."
            )
        return allowed

    def filter_tools(
        self,
        tools: list[dict],
        tool_permissions: dict[str, Permission],
    ) -> list[dict]:
        """Return only tools the current permission level allows."""
        allowed = []
        for tool in tools:
            name = tool.get("name", "")
            required = tool_permissions.get(name, Permission.READ_ONLY)
            if self.check(name, required):
                allowed.append(tool)
        return allowed
```

### Content Filtering on Output

Before returning results to the user, filter the output:

```python
class OutputFilter:
    """Filter agent output for safety before returning to user."""

    def __init__(self) -> None:
        self.pii_redactor = InputGuardrail()

    def filter(self, output: str) -> str:
        """Redact PII and sensitive content from output."""
        result = self.pii_redactor.validate(output)
        return result.sanitized_input

    def filter_tool_output(
        self, tool_name: str, output: str
    ) -> str:
        """Filter tool-specific output."""
        sensitive_tools = {"read_file", "query_database", "search_codebase"}
        if tool_name in sensitive_tools:
            return self.filter(output)
        return output
```

---

## 3.5 Error Recovery Patterns

Production agents encounter errors constantly: API timeouts, rate limits, malformed responses, tool failures, network partitions. A robust harness classifies errors and handles each type appropriately.

### Error Classification

```python
from enum import Enum


class ErrorClass(Enum):
    """Classification of errors for recovery strategy."""
    TRANSIENT = "transient"       # Retry with backoff
    PERMANENT = "permanent"       # Don't retry, report to user
    CRITICAL = "critical"         # Halt the entire operation
    RATE_LIMITED = "rate_limited" # Wait and retry


ERROR_CLASSIFICATIONS = {
    "ConnectionError": ErrorClass.TRANSIENT,
    "TimeoutError": ErrorClass.TRANSIENT,
    "HTTPError 429": ErrorClass.RATE_LIMITED,
    "HTTPError 500": ErrorClass.TRANSIENT,
    "HTTPError 400": ErrorClass.PERMANENT,
    "HTTPError 401": ErrorClass.CRITICAL,
    "ValidationError": ErrorClass.PERMANENT,
    "KeyError": ErrorClass.PERMANENT,
}


def classify_error(exc: Exception) -> ErrorClass:
    """Classify an exception into a recovery category."""
    exc_name = type(exc).__name__
    if exc_name == "HTTPError":
        status = getattr(exc, "response", None)
        if status is not None:
            code = getattr(status, "status_code", 0)
            return ERROR_CLASSIFICATIONS.get(
                f"HTTPError {code}", ErrorClass.PERMANENT
            )
    return ERROR_CLASSIFICATIONS.get(exc_name, ErrorClass.PERMANENT)
```

### The Circuit Breaker Pattern

When a tool or service is consistently failing, the circuit breaker stops sending requests to prevent cascading failures:

```python
import time
from enum import Enum


class CircuitState(Enum):
    CLOSED = "closed"       # Normal operation
    OPEN = "open"           # Failing — reject requests
    HALF_OPEN = "half_open" # Testing recovery


class CircuitBreaker:
    """Circuit breaker for preventing cascading failures."""

    def __init__(
        self,
        failure_threshold: int = 5,
        recovery_timeout: float = 60.0,
        half_open_max_calls: int = 1,
    ) -> None:
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.half_open_max_calls = half_open_max_calls

        self._state = CircuitState.CLOSED
        self._failure_count = 0
        self._last_failure_time: float = 0.0
        self._half_open_calls = 0

    @property
    def state(self) -> CircuitState:
        if self._state == CircuitState.OPEN:
            elapsed = time.monotonic() - self._last_failure_time
            if elapsed >= self.recovery_timeout:
                self._state = CircuitState.HALF_OPEN
                self._half_open_calls = 0
        return self._state

    def record_success(self) -> None:
        self._failure_count = 0
        self._state = CircuitState.CLOSED

    def record_failure(self) -> None:
        self._failure_count += 1
        self._last_failure_time = time.monotonic()
        if self._failure_count >= self.failure_threshold:
            self._state = CircuitState.OPEN
            logger.warning(
                f"Circuit opened after {self._failure_count} failures"
            )

    def allow_request(self) -> bool:
        state = self.state
        if state == CircuitState.CLOSED:
            return True
        if state == CircuitState.HALF_OPEN:
            return self._half_open_calls < self.half_open_max_calls
        return False
```

### Graceful Degradation

When a tool fails permanently, the agent should degrade gracefully rather than crash:

```python
class DegradedModeHandler:
    """Handle tool failures with graceful degradation."""

    FALLBACKS = {
        "search_codebase": "I couldn't search the codebase, but I can "
                          "reason about the code from the conversation "
                          "context.",
        "run_linter": "The linter is unavailable. I'll review the code "
                     "manually based on common patterns.",
        "query_database": "Database is unreachable. I'll work with the "
                         "data already in our conversation.",
    }

    def get_fallback(
        self, tool_name: str, error: str
    ) -> str | None:
        """Get a fallback response for a failed tool."""
        fallback = self.FALLBACKS.get(tool_name)
        if fallback:
            logger.info(
                f"Degrading gracefully for tool '{tool_name}': "
                f"{fallback[:80]}..."
            )
            return fallback
        return None
```

---

## 3.6 Structured Output

LLMs naturally produce free-form text, but agents need structured data to interface with downstream systems. Structured output is how we bridge that gap.

### JSON Mode and Function Calling

Modern LLM APIs support JSON mode and function calling to enforce output structure:

```python
from pydantic import BaseModel, Field


class AnalysisResult(BaseModel):
    """Structured output from a code analysis agent."""
    summary: str = Field(description="One-line summary of the analysis")
    issues_found: int = Field(description="Number of issues found")
    severity: str = Field(description="Overall severity: low/medium/high/critical")
    files_analyzed: list[str] = Field(description="List of files analyzed")
    recommendations: list[str] = Field(description="Ordered list of fixes")


class FileIssue(BaseModel):
    """A single issue found in a file."""
    file_path: str
    line_number: int
    issue_type: str
    description: str
    suggested_fix: str
    confidence: float = Field(ge=0.0, le=1.0)


# Using Pydantic with the Anthropic API
response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=4096,
    messages=[{
        "role": "user",
        "content": "Analyze this code for issues:\n```python\n...\n```",
    }],
    # Force structured output
    tool_choice={"type": "tool", "name": "report_analysis"},
    tools=[{
        "name": "report_analysis",
        "description": "Report the analysis results",
        "input_schema": AnalysisResult.model_json_schema(),
    }],
)

# Parse with full validation
result = AnalysisResult.model_validate(
    response.content[0].input
)
```

### Streaming Structured Output

When output is large, stream it incrementally:

```python
async def stream_structured_output(
    client: Any,
    schema: type[BaseModel],
    messages: list[dict],
) -> BaseModel:
    """Stream a structured output, parsing incrementally."""
    accumulated = ""

    async with client.messages.stream(
        model="claude-sonnet-4-20250514",
        max_tokens=8192,
        messages=messages,
    ) as stream:
        async for event in stream:
            if event.type == "content_block_delta":
                accumulated += event.delta.text

    # Parse the accumulated JSON
    import json
    data = json.loads(accumulated)
    return schema.model_validate(data)
```

### Schema Evolution

When you change tool or output schemas, handle backward compatibility:

```python
from pydantic import BaseModel, Field, model_validator


class AnalysisResultV2(BaseModel):
    """Versioned analysis result with backward compatibility."""
    version: int = 2
    summary: str
    issues_found: int
    severity: str
    files_analyzed: list[str] = Field(default_factory=list)
    recommendations: list[str] = Field(default_factory=list)
    # New in v2
    metrics: dict[str, float] = Field(default_factory=dict)

    @model_validator(mode="before")
    @classmethod
    def handle_v1_format(cls, data: dict) -> dict:
        """Auto-upgrade v1 results to v2."""
        if isinstance(data, dict) and data.get("version", 2) == 1:
            data["metrics"] = {}
        return data
```

---

## 3.7 Rate Limiting and Cost Control

Uncontrolled LLM API usage can result in catastrophic bills. Every harness needs hard limits.

### The BudgetManager

```python
import time
import threading
from dataclasses import dataclass, field


@dataclass
class TokenBucket:
    """Token bucket for rate limiting."""
    capacity: int
    refill_rate: float  # tokens per second
    tokens: float = field(init=False)
    last_refill: float = field(init=False)
    _lock: threading.Lock = field(default_factory=threading.Lock, init=False)

    def __post_init__(self) -> None:
        self.tokens = float(self.capacity)
        self.last_refill = time.monotonic()

    def consume(self, tokens: int) -> bool:
        """Try to consume tokens. Returns True if successful."""
        with self._lock:
            self._refill()
            if self.tokens >= tokens:
                self.tokens -= tokens
                return True
            return False

    def _refill(self) -> None:
        now = time.monotonic()
        elapsed = now - self.last_refill
        self.tokens = min(
            self.capacity,
            self.tokens + elapsed * self.refill_rate,
        )
        self.last_refill = now


@dataclass
class SessionBudget:
    """Per-session cost tracking and enforcement."""
    max_input_tokens: int = 500_000
    max_output_tokens: int = 100_000
    max_cost_usd: float = 5.00
    input_price_per_token: float = 0.000003   # $3/1M tokens
    output_price_per_token: float = 0.000015  # $15/1M tokens

    _input_used: int = field(default=0, init=False)
    _output_used: int = field(default=0, init=False)
    _lock: threading.Lock = field(default_factory=threading.Lock, init=False)

    @property
    def total_cost(self) -> float:
        return (
            self._input_used * self.input_price_per_token
            + self._output_used * self.output_price_per_token
        )

    def record_usage(self, input_tokens: int, output_tokens: int) -> None:
        with self._lock:
            self._input_used += input_tokens
            self._output_used += output_tokens

    def can_afford(self, estimated_input: int, estimated_output: int) -> bool:
        """Check if we can afford an estimated call."""
        with self._lock:
            future_input = self._input_used + estimated_input
            future_output = self._output_used + estimated_output
            future_cost = (
                future_input * self.input_price_per_token
                + future_output * self.output_price_per_token
            )
            return (
                future_input <= self.max_input_tokens
                and future_output <= self.max_output_tokens
                and future_cost <= self.max_cost_usd
            )

    def remaining_budget(self) -> dict[str, float]:
        """Return remaining budget in each category."""
        with self._lock:
            return {
                "input_tokens_remaining": max(
                    0, self.max_input_tokens - self._input_used
                ),
                "output_tokens_remaining": max(
                    0, self.max_output_tokens - self._output_used
                ),
                "cost_remaining_usd": max(
                    0.0, self.max_cost_usd - self.total_cost
                ),
            }


class BudgetManager:
    """
    Central budget management: combines rate limiting and cost control.
    """

    def __init__(
        self,
        rate_limit_rpm: int = 60,
        rate_limit_tpm: int = 400_000,
        session_budget: SessionBudget | None = None,
    ) -> None:
        self.requests_per_minute = TokenBucket(
            capacity=rate_limit_rpm,
            refill_rate=rate_limit_rpm / 60.0,
        )
        self.tokens_per_minute = TokenBucket(
            capacity=rate_limit_tpm,
            refill_rate=rate_limit_tpm / 60.0,
        )
        self.session_budget = session_budget or SessionBudget()

    def check_before_request(
        self, estimated_tokens: int = 1000
    ) -> tuple[bool, str]:
        """Check all budget constraints before making an API call."""
        if not self.requests_per_minute.consume(1):
            return False, "Rate limit: too many requests per minute"
        if not self.tokens_per_minute.consume(estimated_tokens):
            return False, "Rate limit: token budget exceeded"
        if not self.session_budget.can_afford(estimated_tokens, estimated_tokens // 4):
            budget = self.session_budget.remaining_budget()
            return False, (
                f"Session budget exhausted: "
                f"${budget['cost_remaining_usd']:.2f} remaining"
            )
        return True, "OK"

    def record_usage(self, input_tokens: int, output_tokens: int) -> None:
        """Record actual usage after a successful API call."""
        self.session_budget.record_usage(input_tokens, output_tokens)

    def get_status(self) -> dict[str, Any]:
        """Get current budget status."""
        return {
            "requests_remaining": int(self.requests_per_minute.tokens),
            "tokens_remaining": int(self.tokens_per_minute.tokens),
            "session_budget": self.session_budget.remaining_budget(),
            "total_cost_usd": round(self.session_budget.total_cost, 4),
        }
```

### Cost Attribution

Track costs per tool, per user, or per session:

```python
from collections import defaultdict


class CostAttributor:
    """Attribute LLM costs to specific dimensions."""

    def __init__(self) -> None:
        self._costs: dict[str, float] = defaultdict(float)

    def record(
        self,
        dimension: str,
        input_tokens: int,
        output_tokens: int,
    ) -> None:
        cost = (
            input_tokens * 0.000003
            + output_tokens * 0.000015
        )
        self._costs[dimension] += cost

    def get_costs(self) -> dict[str, float]:
        return dict(self._costs)

    def get_total(self) -> float:
        return sum(self._costs.values())
```

---

## 3.8 Testing the Harness

A harness that isn't tested is a liability. Testing agent harnesses requires mocking the LLM while exercising real tool logic.

### Unit Testing Tool Implementations

```python
import pytest


class TestSearchCodebase:
    """Unit tests for the search_codebase tool."""

    def test_finds_matching_files(self, tmp_path):
        # Arrange
        (tmp_path / "main.py").write_text("def hello(): pass")
        (tmp_path / "utils.py").write_text("def helper(): pass")

        handler = create_search_handler(root=tmp_path)

        # Act
        result = handler({"pattern": "*.py"})

        # Assert
        assert "main.py" in result
        assert "utils.py" in result

    def test_respects_max_results(self, tmp_path):
        for i in range(10):
            (tmp_path / f"file_{i}.py").write_text(f"# file {i}")

        handler = create_search_handler(root=tmp_path)
        result = handler({"pattern": "*.py", "max_results": 3})

        lines = [l for l in result.strip().split("\n") if l.strip()]
        assert len(lines) <= 3

    def test_returns_error_for_invalid_pattern(self, tmp_path):
        handler = create_search_handler(root=tmp_path)
        result = handler({"pattern": "[invalid"})

        assert "error" in result.lower() or "invalid" in result.lower()
```

### Integration Testing with Mock LLM Responses

```python
from unittest.mock import MagicMock


def create_mock_llm(responses: list[dict]) -> MagicMock:
    """Create a mock LLM that returns predetermined responses."""
    mock = MagicMock()

    call_count = 0

    def side_effect(**kwargs):
        nonlocal call_count
        if call_count >= len(responses):
            raise ValueError("Mock LLM ran out of predetermined responses")
        response = responses[call_count]
        call_count += 1

        mock_response = MagicMock()
        mock_response.content = response.get("content", [])
        mock_response.stop_reason = response.get("stop_reason", "end_turn")
        mock_response.usage = MagicMock()
        mock_response.usage.input_tokens = response.get("input_tokens", 100)
        mock_response.usage.output_tokens = response.get("output_tokens", 50)
        return mock_response

    mock.messages.create.side_effect = side_effect
    return mock


class TestToolUseLoopIntegration:
    """Integration tests for the tool-use loop with mock LLM."""

    def test_single_tool_call(self):
        # Arrange: LLM calls a tool, then produces a final answer
        mock_llm = create_mock_llm([
            {
                "content": [
                    MagicMock(
                        type="tool_use",
                        id="call_1",
                        name="read_file",
                        input={"path": "README.md"},
                    )
                ],
                "stop_reason": "tool_use",
            },
            {
                "content": [MagicMock(type="text", text="The README says...")],
                "stop_reason": "end_turn",
            },
        ])

        registry = ToolRegistry()
        registry.register(
            "read_file",
            lambda args: "# Project\nThis is the README.",
            {"name": "read_file", "input_schema": {}},
        )

        loop = ToolUseLoop(llm_client=mock_llm, registry=registry)

        # Act
        result = loop.run(
            system_prompt="You are a helpful assistant.",
            user_message="What does the README say?",
        )

        # Assert
        assert "README" in result
        assert mock_llm.messages.create.call_count == 2

    def test_max_iterations_stops_loop(self):
        # Arrange: LLM always wants to call tools (never stops)
        infinite_tool_call = {
            "content": [
                MagicMock(
                    type="tool_use",
                    id="call_inf",
                    name="search",
                    input={"q": "everything"},
                )
            ],
            "stop_reason": "tool_use",
        }

        mock_llm = create_mock_llm([infinite_tool_call] * 50)

        registry = ToolRegistry()
        registry.register(
            "search",
            lambda args: "found stuff",
            {"name": "search", "input_schema": {}},
        )

        config = LoopConfig(max_iterations=3)
        loop = ToolUseLoop(
            llm_client=mock_llm, registry=registry, config=config
        )

        # Act
        loop.run("test", "search everything")

        # Assert: stopped after 3 iterations, not 50
        assert mock_llm.messages.create.call_count <= 4  # 3 loops + 1 final
```

### Load Testing for Production Readiness

```python
import asyncio
import statistics


async def load_test_harness(
    harness: ToolUseLoop,
    num_requests: int = 100,
    concurrency: int = 10,
) -> dict:
    """Load test the harness to measure throughput and error rates."""
    latencies: list[float] = []
    errors = 0
    semaphore = asyncio.Semaphore(concurrency)

    async def single_request(i: int) -> None:
        nonlocal errors
        async with semaphore:
            start = time.monotonic()
            try:
                harness.run("test", f"Request {i}: what is 2+{i}?")
                elapsed = time.monotonic() - start
                latencies.append(elapsed)
            except Exception:
                errors += 1

    tasks = [single_request(i) for i in range(num_requests)]
    await asyncio.gather(*tasks)

    return {
        "total_requests": num_requests,
        "errors": errors,
        "error_rate": errors / num_requests,
        "latency_p50": statistics.median(latencies),
        "latency_p95": sorted(latencies)[int(len(latencies) * 0.95)],
        "latency_p99": sorted(latencies)[int(len(latencies) * 0.99)],
        "throughput_rps": num_requests / sum(latencies) if latencies else 0,
    }
```

---

## Summary

Harness engineering is what separates a demo from a production system. The key takeaways from this chapter:

1. **The harness is the operating system for your agent.** It provides tool execution, error recovery, safety, and cost control — all the infrastructure the LLM itself cannot provide.

2. **The tool-use loop is your core primitive.** Design it with iteration limits, token budgets, timeouts, and retry logic from day one. Don't wait for production incidents to add these guards.

3. **Tool quality determines agent quality.** Invest in clear naming, precise schemas, honest descriptions, and idempotent implementations. The LLM can only be as good as the tools it has access to.

4. **Guardrails are not optional.** Input validation, output filtering, permission systems, and sandboxing are the difference between a useful agent and a dangerous one.

5. **Error recovery is a first-class concern.** Classify errors, implement circuit breakers, and design graceful degradation. Every tool will fail eventually — the question is how your harness responds.

6. **Structured output bridges the gap** between free-form LLM generation and deterministic downstream systems. Use Pydantic models and JSON mode to enforce contracts.

7. **Cost control protects your budget.** Token buckets, session budgets, and cost attribution prevent runaway API spend.

8. **Test everything.** Unit test tools, integration test with mock LLMs, and load test for production readiness.

> **Looking ahead:** Chapter 4 explores single-agent architectures — the ReAct pattern, planning agents, reflexion loops, and the practical code review agent that ties all of these harness concepts together.

---

*Next: [Chapter 4 — Single-Agent Architectures](chapter-04-single-agent-architectures.md)*
