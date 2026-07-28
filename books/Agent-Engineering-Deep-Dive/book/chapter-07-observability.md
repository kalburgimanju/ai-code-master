# Chapter 7: Observability and Debugging Agent Systems

> "You can't fix what you can't see." — Unknown

---

## 7.1 Why Observability is Critical for Agents

### Agents are Non-Deterministic and Multi-Step

Traditional software systems are deterministic: given the same input, they produce the same output, every time. Agent systems break this fundamental contract. A single user request can trigger a cascade of LLM calls, tool invocations, reasoning branches, and autonomous decisions — each introducing non-determinism.

Consider a customer support agent resolving a billing dispute:

```
User Request: "I was charged twice for my subscription"
        │
        ▼
┌──────────────────┐
│   Router Agent    │──▶ Classifies intent (LLM non-deterministic)
└────────┬─────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌──────────┐
│ Billing │ │ Account  │
│ Agent   │ │ Agent    │    ◀── May spawn sub-agents (non-deterministic)
└────┬────┘ └────┬─────┘
     │           │
     ▼           ▼
┌─────────┐ ┌──────────┐
│ Tool:    │ │ Tool:    │
│ charge_db│ │ user_db  │    ◀── External system latency varies
└─────────┘ └──────────┘
```

Each node in this flow is a potential failure point, a source of latency, and a cost center. Without observability, you are flying blind.

### Traditional Logging is Insufficient

Standard application logs capture events in a linear sequence. They answer "what happened?" but fail to answer the more critical agent questions:

| Question | Traditional Logs | Agent Observability |
|---|---|---|
| What happened? | ✅ Yes | ✅ Yes |
| In what order? | ⚠️ Partially | ✅ Full trace |
| Why did the agent choose tool X? | ❌ No | ✅ Reasoning capture |
| What was the prompt that caused the error? | ❌ No | ✅ Prompt logging |
| How much did this request cost? | ❌ No | ✅ Token attribution |
| What alternatives did the agent consider? | ❌ No | ✅ Branch tracking |
| How long did each LLM call take? | ⚠️ Approximate | ✅ Precise timing |

### The Three Pillars: Logs, Metrics, Traces

The observability community has converged on three pillars, each serving a distinct purpose for agent systems:

**Logs** — Discrete events with structured metadata:

```python
{
    "timestamp": "2026-07-15T14:23:01.234Z",
    "level": "INFO",
    "event": "tool_call",
    "tool": "charge_db.refund",
    "input": {"charge_id": "ch_abc123", "amount": 29.99},
    "output": {"status": "refunded", "refund_id": "rf_xyz789"},
    "duration_ms": 342,
    "cost_usd": 0.003,
    "trace_id": "tr_4f8a2b1c",
    "span_id": "sp_9e3d7f2a"
}
```

**Metrics** — Aggregated numerical measurements over time:

```
agent_requests_total{status="success"} 1,847
agent_requests_total{status="failure"} 23
agent_llm_latency_p99{model="claude-sonnet-4-20250514"} 4,523ms
agent_cost_per_request_avg 0.047
agent_tool_success_rate{tool="charge_db"} 0.987
```

**Traces** — End-to-end request flow across components:

```
Trace: tr_4f8a2b1c (total: 12.4s, cost: $0.142)
├── Span: router.classify (LLM, 1.2s, $0.008)
│   └── Span: llm.inference (claude-sonnet-4-20250514, 1.1s, 847 tokens)
├── Span: billing_agent.execute (8.3s, $0.089)
│   ├── Span: llm.plan (claude-sonnet-4-20250514, 2.1s, $0.015)
│   ├── Span: tool.charge_db.lookup (0.3s, $0.000)
│   ├── Span: llm.decide (claude-sonnet-4-20250514, 3.2s, $0.028)
│   ├── Span: tool.charge_db.refund (0.3s, $0.000)
│   └── Span: llm.summarize (claude-sonnet-4-20250514, 2.4s, $0.046)
└── Span: account_agent.execute (2.1s, $0.031)
    ├── Span: tool.user_db.get_history (0.5s, $0.000)
    └── Span: llm.verify (claude-haiku-3.5-20250127, 1.4s, $0.031)
```

### Agent-Specific Observability Challenges

Agent systems introduce unique observability challenges that traditional distributed tracing does not address:

1. **LLM non-determinism**: The same prompt can produce different outputs, making reproduction difficult
2. **Dynamic topology**: Agents spawn sub-agents at runtime; the system graph is not static
3. **Reasoning opacity**: Understanding *why* an agent made a decision requires capturing internal reasoning
4. **Cost unpredictability**: Token usage varies per request, making budgeting harder
5. **Long-lived interactions**: A single conversation may span hours or days with intermittent activity
6. **Multi-modal content**: Images, files, and structured data mixed with text

---

## 7.2 Tracing Agent Execution

### Spans and Traces for Agent Workflows

A **trace** represents the complete lifecycle of a single user request as it flows through the agent system. Each **span** is a discrete unit of work within that trace — an LLM call, a tool invocation, a reasoning step, or a sub-agent execution.

```
Trace Structure for a Multi-Agent Request:

trace_id: tr_abc123
│
├─ span: orchestrator.receive_request          [0ms - 15ms]
│  └─ span: llm.classify_intent               [15ms - 1,250ms]
│     attributes:
│       model: claude-sonnet-4-20250514
│       tokens.input: 342
│       tokens.output: 18
│       cost: $0.003
│
├─ span: orchestrator.delegate_to_billing      [1,250ms - 1,260ms]
│  └─ span: billing_agent.run                 [1,260ms - 8,500ms]
│     ├─ span: llm.plan_action                [1,260ms - 3,400ms]
│     │  attributes:
│     │    reasoning: "User reports double charge. Need to look up charges..."
│     │    tokens.input: 1,205
│     │    tokens.output: 287
│     │
│     ├─ span: tool.query_charges             [3,400ms - 3,750ms]
│     │  attributes:
│     │    tool.name: billing_api.query_charges
│     │    tool.input: {"user_id": "u_123", "period": "2026-07"}
│     │    tool.output: {"charges": [...], "count": 3}
│     │    tool.status: success
│     │
│     ├─ span: llm.analyze_charges            [3,750ms - 5,100ms]
│     └─ span: tool.process_refund            [5,100ms - 5,450ms]
│        attributes:
│          tool.name: billing_api.refund
│          tool.input: {"charge_id": "ch_abc"}
│          tool.status: success
│
└─ span: orchestrator.format_response         [8,500ms - 8,520ms]
```

### Capturing Agent-Specific Events

Beyond standard span attributes, agent tracing must capture:

- **LLM calls**: Prompt, completion, model, parameters, token counts
- **Tool invocations**: Name, input, output, duration, success/failure
- **Reasoning steps**: Chain-of-thought output, decision rationale
- **Branching decisions**: Which path was chosen and what alternatives existed
- **State mutations**: Changes to conversation history, working memory

### OpenTelemetry for Agents

OpenTelemetry (OTel) provides the foundational standard for distributed tracing. We can extend it for agent-specific observability:

```python
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.resources import Resource
from functools import wraps
import time
import json
from typing import Any, Callable

# Resource describing this agent service
resource = Resource.create({
    "service.name": "customer-support-agent",
    "service.version": "2.3.1",
    "deployment.environment": "production",
    "agent.type": "multi-agent-orchestrator",
})

# Configure tracer
provider = TracerProvider(resource=resource)
provider.add_span_processor(
    BatchSpanProcessor(OTLPSpanExporter(endpoint="http://otel-collector:4317"))
)
trace.set_tracer_provider(provider)
tracer = trace.get_tracer("agent.core")


def trace_agent_call(
    name: str | None = None,
    attributes: dict[str, Any] | None = None,
):
    """Decorator that creates an OpenTelemetry span for any agent function."""
    def decorator(func: Callable) -> Callable:
        span_name = name or f"agent.{func.__qualname__}"

        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            with tracer.start_as_current_span(span_name) as span:
                # Record function arguments as span attributes
                if attributes:
                    for key, value in attributes.items():
                        span.set_attribute(key, str(value))

                span.set_attribute("function.name", func.__qualname__)
                span.set_attribute("function.args_count", len(args))

                start = time.monotonic()
                try:
                    result = await func(*args, **kwargs)
                    span.set_attribute("function.status", "success")

                    # Capture result summary (not full output for privacy)
                    if isinstance(result, dict):
                        span.set_attribute(
                            "function.result_keys",
                            json.dumps(list(result.keys()))
                        )
                    return result

                except Exception as e:
                    span.set_attribute("function.status", "error")
                    span.set_attribute("function.error.type", type(e).__name__)
                    span.set_attribute("function.error.message", str(e))
                    span.record_exception(e)
                    raise

                finally:
                    elapsed_ms = (time.monotonic() - start) * 1000
                    span.set_attribute("function.duration_ms", round(elapsed_ms, 2))

        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            with tracer.start_as_current_span(span_name) as span:
                if attributes:
                    for key, value in attributes.items():
                        span.set_attribute(key, str(value))

                span.set_attribute("function.name", func.__qualname__)
                start = time.monotonic()
                try:
                    result = func(*args, **kwargs)
                    span.set_attribute("function.status", "success")
                    return result
                except Exception as e:
                    span.set_attribute("function.status", "error")
                    span.set_attribute("function.error.type", type(e).__name__)
                    span.record_exception(e)
                    raise
                finally:
                    elapsed_ms = (time.monotonic() - start) * 1000
                    span.set_attribute("function.duration_ms", round(elapsed_ms, 2))

        import asyncio
        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        return sync_wrapper

    return decorator


# Usage in agent code
@trace_agent_call(name="billing.refund_flow", attributes={"department": "billing"})
async def process_refund(user_id: str, charge_id: str) -> dict:
    """Process a refund with full trace visibility."""
    with tracer.start_as_current_span("billing.lookup_charge") as span:
        span.set_attribute("charge.id", charge_id)
        charge = await billing_api.get_charge(charge_id)
        span.set_attribute("charge.amount", charge["amount"])

    with tracer.start_as_current_span("billing.execute_refund") as span:
        refund = await billing_api.refund(charge_id)
        span.set_attribute("refund.id", refund["id"])
        span.set_attribute("refund.status", refund["status"])

    return {"refund_id": refund["id"], "amount": charge["amount"]}
```

---

## 7.3 LLM Call Observability

### Prompt and Completion Logging

Every LLM call is the most expensive and most opaque operation in an agent system. Capturing the full prompt and completion is essential for debugging, though it requires careful handling for privacy and cost reasons.

```python
import time
import hashlib
import json
from dataclasses import dataclass, field
from typing import Any
from enum import Enum


class LLMProvider(str, Enum):
    ANTHROPIC = "anthropic"
    OPENAI = "openai"
    AZURE = "azure"


@dataclass
class LLMMetrics:
    """Comprehensive metrics for a single LLM call."""
    # Identity
    trace_id: str
    span_id: str
    call_sequence: int  # Position in the agent's call chain

    # Model information
    provider: LLMProvider
    model: str
    model_version: str | None = None
    temperature: float = 0.0
    max_tokens: int = 4096
    top_p: float = 1.0

    # Token usage (the core cost driver)
    input_tokens: int = 0
    output_tokens: int = 0
    cached_tokens: int = 0
    total_tokens: int = 0

    # Prompt details (hashed for privacy, full text for debug)
    prompt_hash: str = ""
    prompt_text: str = ""
    system_prompt_hash: str = ""
    num_messages: int = 0
    num_tools_available: int = 0

    # Completion details
    completion_text: str = ""
    finish_reason: str = ""
    tool_calls: list[dict] = field(default_factory=list)

    # Timing
    start_time: float = 0.0
    end_time: float = 0.0
    time_to_first_token_ms: float = 0.0
    total_generation_time_ms: float = 0.0

    # Cost
    cost_input_usd: float = 0.0
    cost_output_usd: float = 0.0
    cost_cached_usd: float = 0.0
    cost_total_usd: float = 0.0

    # Error tracking
    error: str | None = None
    retries: int = 0
    rate_limited: bool = False

    def finalize(self) -> None:
        """Compute derived fields after all raw data is set."""
        self.end_time = time.time()
        self.total_generation_time_ms = (self.end_time - self.start_time) * 1000
        self.total_tokens = self.input_tokens + self.output_tokens
        self._compute_cost()

    def _compute_cost(self) -> None:
        """Compute cost based on token counts and model pricing."""
        pricing = MODEL_PRICING.get(self.model, DEFAULT_PRICING)
        self.cost_input_usd = self.input_tokens * pricing["input"] / 1_000_000
        self.cost_output_usd = self.output_tokens * pricing["output"] / 1_000_000
        self.cost_cached_usd = self.cached_tokens * pricing["cached"] / 1_000_000
        self.cost_total_usd = (
            self.cost_input_usd + self.cost_output_usd - self.cost_cached_usd
        )

    def to_log_dict(self) -> dict[str, Any]:
        """Serialize for structured logging."""
        return {
            "trace_id": self.trace_id,
            "span_id": self.span_id,
            "call_sequence": self.call_sequence,
            "provider": self.provider.value,
            "model": self.model,
            "model_version": self.model_version,
            "temperature": self.temperature,
            "input_tokens": self.input_tokens,
            "output_tokens": self.output_tokens,
            "cached_tokens": self.cached_tokens,
            "total_tokens": self.total_tokens,
            "prompt_hash": self.prompt_hash,
            "system_prompt_hash": self.system_prompt_hash,
            "num_messages": self.num_messages,
            "finish_reason": self.finish_reason,
            "tool_calls_count": len(self.tool_calls),
            "time_to_first_token_ms": round(self.time_to_first_token_ms, 2),
            "total_generation_time_ms": round(self.total_generation_time_ms, 2),
            "cost_total_usd": round(self.cost_total_usd, 6),
            "error": self.error,
            "retries": self.retries,
            "rate_limited": self.rate_limited,
        }


# Model pricing (per million tokens) — update as providers adjust
MODEL_PRICING = {
    "claude-sonnet-4-20250514": {"input": 3.00, "output": 15.00, "cached": 0.30},
    "claude-haiku-3.5-20250127": {"input": 0.80, "output": 4.00, "cached": 0.08},
    "gpt-4o": {"input": 2.50, "output": 10.00, "cached": 1.25},
    "gpt-4o-mini": {"input": 0.15, "output": 0.60, "cached": 0.075},
}
DEFAULT_PRICING = {"input": 3.00, "output": 15.00, "cached": 0.30}
```

### Token Usage Tracking

Token usage is the primary cost driver and must be tracked at granular levels:

```
Token Usage Dashboard — Agent Request tr_4f8a2b1c
═══════════════════════════════════════════════════

Call #1: Router (claude-haiku-3.5)
  Input:  342 tokens  (system: 128, messages: 214)
  Output: 18 tokens
  Cached: 128 tokens (system prompt cache hit)
  Cost:   $0.000134

Call #2: Billing Agent — Planning (claude-sonnet-4-20250514)
  Input:  1,205 tokens  (system: 450, messages: 655, tools: 100)
  Output: 287 tokens
  Cached: 450 tokens (system prompt cache hit)
  Cost:   $0.005293

Call #3: Billing Agent — Decision (claude-sonnet-4-20250514)
  Input:  2,847 tokens  (messages: 2,847)
  Output: 156 tokens
  Cached: 1,432 tokens (prefix cache hit)
  Cost:   $0.006801

Call #4: Account Agent — Verification (claude-haiku-3.5)
  Input:  891 tokens
  Output: 64 tokens
  Cached: 450 tokens
  Cost:   $0.000265

───────────────────────────────────────────────────
Total: 5,285 input + 525 output = 5,810 tokens
Total Cost: $0.012493
Cache Savings: $0.001123 (8.3% reduction)
```

### Latency Breakdown

Understanding where time is spent is critical for performance optimization:

```
Latency Breakdown — Total: 8,520ms
════════════════════════════════════

█████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  LLM Calls (5,200ms / 61%)
  ├── TTFT (time to first token): 2,300ms
  └── Generation:                 2,900ms

██░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  Tool Calls (1,200ms / 14%)
  ├── billing_api.query_charges:    350ms
  ├── billing_api.refund:           280ms
  └── user_db.get_history:          570ms

██░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  Orchestration (1,800ms / 21%)
  ├── Agent routing:                200ms
  ├── Context assembly:             600ms
  └── Response formatting:          120ms

█░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  Network/Other (320ms / 4%)
```

---

## 7.4 Tool Call Observability

### Tracking Tool Invocations

Tool calls are the agent's interface with the outside world. Each call must be tracked for success, failure, latency, and cost:

```python
import time
import json
import hashlib
from dataclasses import dataclass, field
from typing import Any, Callable
from enum import Enum


class ToolStatus(str, Enum):
    SUCCESS = "success"
    FAILURE = "failure"
    TIMEOUT = "timeout"
    RATE_LIMITED = "rate_limited"
    PERMISSION_DENIED = "permission_denied"


@dataclass
class ToolCallRecord:
    """Complete record of a single tool invocation."""
    trace_id: str
    span_id: str
    tool_name: str
    tool_version: str | None = None

    # Input/Output
    input_hash: str = ""
    input_summary: dict[str, Any] = field(default_factory=dict)
    output_hash: str = ""
    output_summary: dict[str, Any] = field(default_factory=dict)

    # Timing
    start_time: float = 0.0
    end_time: float = 0.0
    duration_ms: float = 0.0

    # Status
    status: ToolStatus = ToolStatus.SUCCESS
    error_message: str | None = None
    error_type: str | None = None
    retries: int = 0

    # Dependencies
    depends_on_tools: list[str] = field(default_factory=list)
    called_by_agent: str = ""

    # Cost attribution (if tool has API costs)
    api_cost_usd: float = 0.0

    def finalize(self) -> None:
        self.end_time = time.time()
        self.duration_ms = (self.end_time - self.start_time) * 1000


class ToolCallTracker:
    """Tracks all tool invocations for observability and cost attribution."""

    def __init__(self, trace_id: str):
        self.trace_id = trace_id
        self.records: list[ToolCallRecord] = []
        self._dependency_graph: dict[str, list[str]] = {}

    def record_call(
        self,
        tool_name: str,
        inputs: dict[str, Any],
        outputs: dict[str, Any] | None,
        status: ToolStatus,
        duration_ms: float,
        error: str | None = None,
        agent: str = "",
    ) -> ToolCallRecord:
        """Record a completed tool call."""
        record = ToolCallRecord(
            trace_id=self.trace_id,
            span_id=f"sp_{hashlib.md5(f'{tool_name}{time.time()}'.encode()).hexdigest()[:12]}",
            tool_name=tool_name,
            input_hash=hashlib.sha256(
                json.dumps(inputs, sort_keys=True, default=str).encode()
            ).hexdigest()[:16],
            output_hash=hashlib.sha256(
                json.dumps(outputs, sort_keys=True, default=str).encode()
            ).hexdigest()[:16] if outputs else "",
            duration_ms=duration_ms,
            status=status,
            error_message=error,
            called_by_agent=agent,
            start_time=time.time() - duration_ms / 1000,
            end_time=time.time(),
        )

        # Capture input/output summaries (first 200 chars of string values)
        record.input_summary = {
            k: str(v)[:200] for k, v in inputs.items()
        }
        if outputs:
            record.output_summary = {
                k: str(v)[:200] for k, v in outputs.items()
            }

        self.records.append(record)
        return record

    def get_tool_stats(self) -> dict[str, dict[str, Any]]:
        """Aggregate statistics per tool."""
        stats: dict[str, dict[str, Any]] = {}
        for record in self.records:
            tool = record.tool_name
            if tool not in stats:
                stats[tool] = {
                    "total_calls": 0,
                    "successes": 0,
                    "failures": 0,
                    "total_duration_ms": 0.0,
                    "total_cost_usd": 0.0,
                    "p50_duration_ms": 0.0,
                    "p99_duration_ms": 0.0,
                }
            s = stats[tool]
            s["total_calls"] += 1
            if record.status == ToolStatus.SUCCESS:
                s["successes"] += 1
            else:
                s["failures"] += 1
            s["total_duration_ms"] += record.duration_ms
            s["total_cost_usd"] += record.api_cost_usd

        # Compute averages and percentiles
        for tool, s in stats.items():
            tool_records = [r for r in self.records if r.tool_name == tool]
            durations = sorted(r.duration_ms for r in tool_records)
            s["avg_duration_ms"] = s["total_duration_ms"] / s["total_calls"]
            s["success_rate"] = s["successes"] / s["total_calls"]
            if durations:
                s["p50_duration_ms"] = durations[len(durations) // 2]
                s["p99_duration_ms"] = durations[int(len(durations) * 0.99)]

        return stats

    def build_dependency_graph(self) -> dict[str, list[str]]:
        """Build a directed graph of tool → tool dependencies within a trace."""
        return self._dependency_graph
```

### Tool Dependency Graphs

Understanding which tools depend on others helps identify optimization opportunities and single points of failure:

```
Tool Dependency Graph — Trace tr_4f8a2b1c
═════════════════════════════════════════

  ┌──────────────────┐
  │ user_db.get_user │ ◀── Starting point (no dependencies)
  └────────┬─────────┘
           │
           ├──────────────────┐
           ▼                  ▼
  ┌────────────────┐  ┌──────────────────┐
  │ charge_db.list │  │ user_db.history  │  ◀── Parallel (no dependency)
  └────────┬───────┘  └──────────────────┘
           │
           ▼
  ┌──────────────────┐
  │ charge_db.refund │ ◀── Depends on charge_db.list
  └──────────────────┘

Parallelization opportunity: user_db.history can run concurrently with charge_db.list
Critical path: user_db.get_user → charge_db.list → charge_db.refund
```

---

## 7.5 Cost Attribution and Budgeting

### Per-Request Cost Tracking

Every agent request incurs costs across LLM calls, tool invocations, and infrastructure. Granular cost attribution is essential for sustainable operations:

```python
from dataclasses import dataclass, field
from typing import Any


@dataclass
class RequestCostBreakdown:
    """Complete cost attribution for a single agent request."""
    trace_id: str
    user_id: str | None = None
    session_id: str | None = None
    agent_name: str = ""

    # LLM costs (the dominant cost center)
    llm_calls: list[dict[str, Any]] = field(default_factory=list)
    llm_cost_total_usd: float = 0.0

    # Tool costs (API calls, database queries)
    tool_calls: list[dict[str, Any]] = field(default_factory=list)
    tool_cost_total_usd: float = 0.0

    # Infrastructure costs (proportional estimate)
    compute_cost_usd: float = 0.0
    storage_cost_usd: float = 0.0

    # Total
    total_cost_usd: float = 0.0

    def add_llm_call(
        self,
        model: str,
        input_tokens: int,
        output_tokens: int,
        cached_tokens: int = 0,
    ) -> float:
        """Add an LLM call and return its cost."""
        pricing = MODEL_PRICING.get(model, DEFAULT_PRICING)
        cost = (
            input_tokens * pricing["input"] / 1_000_000
            + output_tokens * pricing["output"] / 1_000_000
            - cached_tokens * pricing["cached"] / 1_000_000
        )
        self.llm_calls.append({
            "model": model,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
            "cached_tokens": cached_tokens,
            "cost_usd": cost,
        })
        self.llm_cost_total_usd += cost
        return cost

    def add_tool_call(self, name: str, cost_usd: float = 0.0) -> None:
        """Add a tool call cost."""
        self.tool_calls.append({"name": name, "cost_usd": cost_usd})
        self.tool_cost_total_usd += cost_usd

    def finalize(self) -> None:
        """Compute total cost."""
        self.total_cost_usd = (
            self.llm_cost_total_usd
            + self.tool_cost_total_usd
            + self.compute_cost_usd
            + self.storage_cost_usd
        )

    def to_report(self) -> str:
        """Generate a human-readable cost report."""
        return f"""
Cost Report — Trace {self.trace_id}
{'=' * 50}
LLM Costs:
{chr(10).join(f'  {c["model"]}: ${c["cost_usd"]:.6f} ({c["input_tokens"]}in + {c["output_tokens"]}out)' for c in self.llm_calls)}
  Subtotal: ${self.llm_cost_total_usd:.6f}

Tool Costs:
{chr(10).join(f'  {c["name"]}: ${c["cost_usd"]:.6f}' for c in self.tool_calls)}
  Subtotal: ${self.tool_cost_total_usd:.6f}

Infrastructure: ${self.compute_cost_usd + self.storage_cost_usd:.6f}
{'=' * 50}
TOTAL: ${self.total_cost_usd:.6f}
"""
```

### Cost Breakdown for a Typical Agent Workflow

| Phase | LLM Calls | Tokens (in/out) | Cost (USD) | % of Total |
|---|---|---|---|---|
| Intent Classification | 1 | 342 / 18 | $0.0001 | 0.8% |
| Context Gathering | 1 | 450 / 0 | $0.0014 | 10.7% |
| Planning | 1 | 1,205 / 287 | $0.0053 | 40.6% |
| Tool Execution | 3 | 0 / 0 | $0.0000 | 0.0% |
| Decision Making | 1 | 2,847 / 156 | $0.0068 | 52.0% |
| Response Formatting | 1 | 891 / 64 | $0.0003 | 2.1% |
| **Total** | **8** | **5,735 / 525** | **$0.0130** | **100%** |

### Budget Alerts and Circuit Breakers

```python
class BudgetController:
    """Enforces cost limits at multiple levels with circuit-breaker logic."""

    def __init__(
        self,
        per_request_limit: float = 0.50,      # Max $0.50 per request
        per_user_daily_limit: float = 5.00,     # Max $5.00 per user per day
        per_user_monthly_limit: float = 50.00,  # Max $50 per user per month
        global_daily_limit: float = 500.00,     # Max $500 global per day
    ):
        self.per_request_limit = per_request_limit
        self.per_user_daily_limit = per_user_daily_limit
        self.per_user_monthly_limit = per_user_monthly_limit
        self.global_daily_limit = global_daily_limit
        self._alerts: list[dict] = []

    def check_request(
        self,
        user_id: str,
        current_cost: float,
        user_daily_spend: float,
        user_monthly_spend: float,
        global_daily_spend: float,
    ) -> dict[str, Any]:
        """Check if a request should be allowed based on budget constraints."""
        result = {"allowed": True, "alerts": [], "circuit_breaker": False}

        # Per-request limit
        if current_cost > self.per_request_limit:
            result["allowed"] = False
            result["alerts"].append({
                "level": "critical",
                "message": f"Request cost ${current_cost:.4f} exceeds per-request limit "
                           f"${self.per_request_limit:.2f}",
            })

        # Per-user daily limit
        if user_daily_spend > self.per_user_daily_limit * 0.8:
            result["alerts"].append({
                "level": "warning",
                "message": f"User {user_id} daily spend ${user_daily_spend:.2f} "
                           f"approaching limit ${self.per_user_daily_limit:.2f}",
            })
        if user_daily_spend >= self.per_user_daily_limit:
            result["allowed"] = False
            result["circuit_breaker"] = True
            result["alerts"].append({
                "level": "critical",
                "message": f"User {user_id} daily budget exhausted",
            })

        # Global daily limit
        if global_daily_spend > self.global_daily_limit * 0.9:
            result["alerts"].append({
                "level": "warning",
                "message": f"Global daily spend ${global_daily_spend:.2f} "
                           f"approaching limit ${self.global_daily_limit:.2f}",
            })
        if global_daily_spend >= self.global_daily_limit:
            result["allowed"] = False
            result["circuit_breaker"] = True
            result["alerts"].append({
                "level": "critical",
                "message": "Global daily budget exhausted — all requests blocked",
            })

        self._alerts.extend(result["alerts"])
        return result
```

---

## 7.6 Debugging Multi-Agent Systems

### Visualizing Agent Communication Flows

When multiple agents collaborate, debugging requires understanding the communication topology:

```
Agent Communication Flow — Billing Dispute Resolution
══════════════════════════════════════════════════════

Time ──────────────────────────────────────────────────────▶

User ──────▶ Orchestrator ──────▶ Billing Agent
   │              │                     │
   │              │     ◀───────────────┤
   │              │                     │
   │              ├─────▶ Account Agent │
   │              │            │        │
   │              │     ◀──────┤        │
   │              │                     │
   │              │     ──────────────────────▶ charge_db
   │              │     ◀─────────────────────── │
   │              │                     │
   │              │     ──────────────────────▶ refund_api
   │              │     ◀─────────────────────── │
   │              │                     │
   │              │     ◀───────────────┤
   │              │
   │     ◀────────┤
   │
   │  Response
   ◀──────────────

Messages:
1. User → Orchestrator: "I was charged twice" (87 tokens)
2. Orchestrator → Billing Agent: "Investigate double charge" (234 tokens)
3. Billing Agent → Orchestrator: "Found duplicate, requesting refund" (156 tokens)
4. Orchestrator → Account Agent: "Verify account status" (89 tokens)
5. Account Agent → Orchestrator: "Account active, no flags" (67 tokens)
6. Billing Agent → charge_db: query_charges(user_123)
7. charge_db → Billing Agent: [3 charges found]
8. Billing Agent → refund_api: refund(ch_abc)
9. refund_api → Billing Agent: {status: "refunded"}
10. Billing Agent → Orchestrator: "Refund processed: $29.99" (45 tokens)
11. Orchestrator → User: "Your refund has been processed" (78 tokens)
```

### Common Failure Modes and Their Symptoms

| Failure Mode | Symptom | Root Cause | Debugging Approach |
|---|---|---|---|
| Infinite loop | Request never completes, escalating costs | Agent keeps re-trying same action | Check max iteration limits; trace loop detection |
| Agent confusion | Gibberish or off-topic responses | Context window overflow or conflicting instructions | Inspect prompt sent to LLM; check context size |
| Tool misuse | Wrong tool called with wrong parameters | Poor tool descriptions or LLM hallucination | Review tool registry; check parameter validation |
| Cascade failure | Multiple agents fail in sequence | Shared dependency failure (DB, API) | Check health of downstream services |
| Rate limiting | Intermittent 429 errors | Too many concurrent LLM calls | Add backoff; implement request queuing |
| Token overflow | "Context length exceeded" errors | Conversation history too long | Implement conversation trimming; check summarization |
| Orphaned sub-agents | Sub-agents spawned but never collected | Error in orchestration logic | Check parent-child span relationships |
| State corruption | Inconsistent behavior across restarts | Shared mutable state without locking | Add state validation; use immutable snapshots |
| Cost runaway | Unexpectedly high bill | Loops, large prompts, wrong model | Set budget limits; monitor cost per request |
| Silent failure | Agent appears to succeed but didn't | Tool returns success but data is wrong | Validate tool outputs; add assertion checks |

### Replay and Step-Through Debugging

```python
import json
from dataclasses import dataclass, field
from typing import Any


@dataclass
class ReplayEvent:
    """A single event in the execution trace for replay."""
    timestamp: float
    event_type: str  # "llm_call", "tool_call", "agent_spawn", "decision"
    agent: str
    data: dict[str, Any]
    span_id: str
    parent_span_id: str | None = None


class ExecutionReplay:
    """Record and replay agent execution for debugging."""

    def __init__(self, trace_id: str):
        self.trace_id = trace_id
        self.events: list[ReplayEvent] = []
        self._current_step = 0

    def record(self, event: ReplayEvent) -> None:
        self.events.append(event)

    def get_step(self, step: int) -> ReplayEvent | None:
        """Get a specific step in the execution."""
        if 0 <= step < len(self.events):
            return self.events[step]
        return None

    def step_forward(self) -> ReplayEvent | None:
        """Advance one step and return the event."""
        if self._current_step < len(self.events):
            event = self.events[self._current_step]
            self._current_step += 1
            return event
        return None

    def step_back(self) -> ReplayEvent | None:
        """Go back one step and return the event."""
        if self._current_step > 0:
            self._current_step -= 1
            return self.events[self._current_step]
        return None

    def jump_to(self, step: int) -> ReplayEvent | None:
        """Jump to a specific step."""
        if 0 <= step < len(self.events):
            self._current_step = step
            return self.events[step]
        return None

    def find_divergence(
        self,
        other: "ExecutionReplay",
    ) -> list[tuple[int, ReplayEvent, ReplayEvent | None]]:
        """Compare two replays to find where they diverge."""
        divergences = []
        max_len = max(len(self.events), len(other.events))
        for i in range(max_len):
            a = self.events[i] if i < len(self.events) else None
            b = other.events[i] if i < len(other.events) else None
            if a and b:
                if a.data != b.data or a.agent != b.agent:
                    divergences.append((i, a, b))
            elif a is not None or b is not None:
                divergences.append((i, a, b))
        return divergences

    def export_for_inspector(self) -> str:
        """Export the replay as a JSON timeline for visualization tools."""
        timeline = []
        for i, event in enumerate(self.events):
            timeline.append({
                "step": i,
                "timestamp": event.timestamp,
                "type": event.event_type,
                "agent": event.agent,
                "span_id": event.span_id,
                "parent_span_id": event.parent_span_id,
                "summary": self._summarize_event(event),
                "data": event.data,
            })
        return json.dumps(timeline, indent=2, default=str)

    def _summarize_event(self, event: ReplayEvent) -> str:
        """Create a one-line summary for quick scanning."""
        if event.event_type == "llm_call":
            model = event.data.get("model", "unknown")
            tokens = event.data.get("tokens", 0)
            return f"LLM call to {model} ({tokens} tokens)"
        elif event.event_type == "tool_call":
            tool = event.data.get("tool", "unknown")
            return f"Tool call: {tool}"
        elif event.event_type == "decision":
            choice = event.data.get("choice", "unknown")
            return f"Decision: chose {choice}"
        elif event.event_type == "agent_spawn":
            child = event.data.get("child_agent", "unknown")
            return f"Spawned sub-agent: {child}"
        return f"{event.event_type}: {json.dumps(event.data)[:80]}"
```

---

## 7.7 Production Monitoring

### Key Metrics

Production agent systems require continuous monitoring across several dimensions:

```
Agent System Health Dashboard
══════════════════════════════════════════════════════════════

REQUEST METRICS (Last 24h)
  Total Requests:     12,847       ▲ 23% vs yesterday
  Success Rate:       97.3%        ● (target: >99%)
  Failure Rate:       2.7%         ▲ 0.3% (investigating)
  Avg Response Time:  4,230ms      ▼ 150ms improvement

LATENCY DISTRIBUTION
  P50:  2,100ms        ████████████████████░░░░░░░░░░
  P95:  8,400ms        ████████████████████████████░░
  P99:  15,200ms       ██████████████████████████████
  Max:  42,100ms       ← Outlier (timeout)

COST METRICS (Last 24h)
  Total Cost:          $584.23
  Cost per Request:    $0.0455     ▼ $0.003 improvement
  Cache Hit Rate:      34.2%       ▲ 2.1%
  Token Usage:         28.4M total (18.2M input, 10.2M output)

ERROR BREAKDOWN
  Rate Limit (429):    47 (36.4%)  ← Need to add backoff
  Context Overflow:    31 (24.0%)  ← Need better trimming
  Tool Timeout:        28 (21.7%)  ← External API slow
  Auth Failures:       14 (10.9%)
  Other:                9 ( 7.0%)

ACTIVE CIRCUIT BREAKERS: 0
  All services operational
```

### Alerting Strategies

Effective alerting requires balancing signal-to-noise ratio. Too many alerts cause fatigue; too few miss critical issues.

```python
from dataclasses import dataclass
from enum import Enum
from typing import Callable, Any


class AlertSeverity(str, Enum):
    CRITICAL = "critical"    # Page immediately, wake someone up
    WARNING = "warning"      # Notify on-call, investigate within 1h
    INFO = "info"            # Log and review during business hours


@dataclass
class AlertRule:
    name: str
    severity: AlertSeverity
    metric: str
    condition: str  # e.g., "> 0.05" for error rate > 5%
    threshold: float
    window_minutes: int = 5
    cooldown_minutes: int = 15
    description: str = ""


# Standard alert rules for agent systems
AGENT_ALERT_RULES = [
    AlertRule(
        name="high_error_rate",
        severity=AlertSeverity.CRITICAL,
        metric="error_rate_5m",
        condition="> 0.05",
        threshold=0.05,
        window_minutes=5,
        description="Error rate exceeds 5% over 5-minute window",
    ),
    AlertRule(
        name="high_latency_p99",
        severity=AlertSeverity.WARNING,
        metric="latency_p99_5m",
        condition="> 30000",
        threshold=30000,
        window_minutes=5,
        description="P99 latency exceeds 30 seconds",
    ),
    AlertRule(
        name="cost_spike",
        severity=AlertSeverity.WARNING,
        metric="cost_per_request_avg_1h",
        condition="> 0.20",
        threshold=0.20,
        window_minutes=60,
        description="Average cost per request exceeds $0.20",
    ),
    AlertRule(
        name="token_limit_approaching",
        severity=AlertSeverity.WARNING,
        metric="context_overflow_rate_1h",
        condition="> 0.02",
        threshold=0.02,
        window_minutes=60,
        description="More than 2% of requests hitting context limits",
    ),
    AlertRule(
        name="budget_daily_critical",
        severity=AlertSeverity.CRITICAL,
        metric="global_daily_spend",
        condition="> 450",
        threshold=450,
        window_minutes=1440,
        description="Daily spend approaching $500 limit",
    ),
    AlertRule(
        name="agent_loop_detected",
        severity=AlertSeverity.CRITICAL,
        metric="max_iterations_per_request",
        condition="> 15",
        threshold=15,
        window_minutes=1,
        cooldown_minutes=5,
        description="Agent exceeded 15 iterations — possible infinite loop",
    ),
]
```

### Dashboard Design for Agent Systems

```
┌─────────────────────────────────────────────────────────────────┐
│                    AGENT SYSTEM DASHBOARD                       │
├──────────────────────┬──────────────────────┬───────────────────┤
│  Requests/hr: 535    │  Success: 97.3%      │  Cost/hr: $24.34  │
│  ▲ 12%               │  ▲ 0.2%              │  ▼ 8%             │
├──────────────────────┴──────────────────────┴───────────────────┤
│                                                                 │
│  Request Volume (24h)              │  Error Rate (24h)          │
│  ┃                                │  ▁▁▁▁▁▁▂▁▁▁▁▁▁▁▁▁▁▁▁▁  │
│  ┃    ╭──╮                       │  ▁▁▁▁▁▃▁▁▁▁▁▁▁▁▁▁▁▁▁▁  │
│  ┃───╯  ╰──╮   ╭──╮             │  ▁▁▁▁▅▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁  │
│  ┃         ╰──╯  ╰──            │  ▁▁▁▁▇▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁  │
│  ╰──────────────────────         │  ╰──────────────────────    │
│  00:00              23:59        │  00:00           23:59      │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Latency Distribution          │  Cost by Model                │
│                                │                                │
│  P50: 2.1s  ████████████████  │  claude-sonnet: $412 (70.5%) │
│  P95: 8.4s  ████████████████  │  claude-haiku:  $154 (26.4%) │
│  P99: 15.2s ████████████████  │  gpt-4o-mini:    $18 ( 3.1%) │
│                                │                                │
├─────────────────────────────────────────────────────────────────┤
│  Active Alerts: 1 warning                                      │
│  ⚠  cost_spike: avg cost per request $0.18 (threshold $0.20)  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7.8 Observability Tools and Platforms

### Tool Comparison

| Feature | LangSmith | Arize Phoenix | Braintrust | Langfuse | Helicone |
|---|---|---|---|---|---|
| **Open Source** | No | Yes | No | Yes | No |
| **Self-Hosted** | No | Yes | No | Yes | No |
| **LLM Tracing** | ✅ Excellent | ✅ Excellent | ✅ Good | ✅ Good | ✅ Good |
| **Cost Tracking** | ✅ Built-in | ⚠️ Manual | ✅ Built-in | ✅ Built-in | ✅ Built-in |
| **Prompt Hub** | ✅ Yes | ❌ No | ✅ Yes | ✅ Yes | ❌ No |
| **Eval Framework** | ✅ Yes | ✅ Yes | ✅ Yes | ⚠️ Basic | ❌ No |
| **Feedback Collection** | ✅ Yes | ⚠️ Basic | ✅ Yes | ✅ Yes | ❌ No |
| **Multi-Agent** | ✅ Yes | ✅ Yes | ⚠️ Basic | ⚠️ Basic | ⚠️ Basic |
| **Pricing** | $0.001/trace | Free (OSS) | $50+/mo | Free (OSS) | $20+/mo |
| **Best For** | Full platform | Self-hosted | Eval-heavy | Cost-sensitive | Simple tracking |

### Self-Hosted vs SaaS Trade-offs

```
Decision Matrix: Self-Hosted vs SaaS Observability

                          Self-Hosted              SaaS
                    ┌───────────────────┬───────────────────┐
  Cost              │ Upfront high,     │ Monthly, scales   │
                    │ low at scale      │ with usage        │
                    ├───────────────────┼───────────────────┤
  Data Privacy      │ Full control      │ Depends on        │
                    │ (PII stays local) │ provider          │
                    ├───────────────────┼───────────────────┤
  Maintenance       │ You maintain      │ Provider manages  │
                    │ infrastructure    │ everything        │
                    ├───────────────────┼───────────────────┤
  Scalability       │ Limited by your   │ Provider scales   │
                    │ infra             │ automatically     │
                    ├───────────────────┼───────────────────┤
  Customization     │ Full control      │ Limited to        │
                    │                   │ provider features │
                    ├───────────────────┼───────────────────┤
  Time to Value     │ Days to weeks     │ Minutes to hours  │
                    ├───────────────────┼───────────────────┤
  Best For          │ Regulated         │ Startups, teams   │
                    │ industries,       │ wanting fast      │
                    │ privacy-critical  │ iteration         │
                    └───────────────────┴───────────────────┘
```

---

## 7.9 Building an Observability Pipeline

### Data Collection → Storage → Analysis → Alerting → Feedback

A complete observability pipeline for agent systems follows a five-stage flow:

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ COLLECT  │───▶│  STORE   │───▶│ ANALYZE  │───▶│  ALERT   │───▶│ FEEDBACK │
│          │    │          │    │          │    │          │    │          │
│ Traces   │    │ Time-    │    │ Dash-    │    │ Rules    │    │ Prompt   │
│ Metrics  │    │ series   │    │ boards   │    │ Engine   │    │ Updates  │
│ Logs     │    │ DB       │    │ Query    │    │ Notifi-  │    │ Model    │
│ Events   │    │ Object   │    │ Engine   │    │ cations  │    │ Retrain  │
│          │    │ Store    │    │ Anomaly  │    │ Escala-  │    │ Cost     │
│          │    │ Search   │    │ Detect   │    │ tion     │    │ Optimiz. │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘

Collector formats:
  OTLP gRPC ──────┐
  OTLP HTTP ──────┤
  Log agents ─────┼──▶ Collector ──▶ Exporters ──▶ Storage backends
  Custom SDK ─────┤
  Webhooks ───────┘
```

### Privacy Considerations (PII in Logs)

Agent logs frequently contain sensitive information — user messages, personal data, financial details. A robust observability pipeline must handle PII:

```python
import re
import hashlib
from typing import Any


class PIISanitizer:
    """Sanitize personally identifiable information from observability data."""

    # Patterns for common PII types
    PII_PATTERNS = {
        "email": re.compile(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'),
        "phone": re.compile(r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b'),
        "ssn": re.compile(r'\b\d{3}-\d{2}-\d{4}\b'),
        "credit_card": re.compile(r'\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b'),
        "ip_address": re.compile(r'\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b'),
    }

    def __init__(self, mode: str = "mask"):
        """
        Args:
            mode: "mask" replaces with type label, "hash" replaces with
                  consistent hash, "redact" removes entirely
        """
        self.mode = mode

    def sanitize(self, text: str) -> str:
        """Apply PII sanitization to a string."""
        if self.mode == "redact":
            return self._redact(text)
        elif self.mode == "hash":
            return self._hash(text)
        else:
            return self._mask(text)

    def _mask(self, text: str) -> str:
        result = text
        for pii_type, pattern in self.PII_PATTERNS.items():
            result = pattern.sub(f"[{pii_type.upper()}]", result)
        return result

    def _hash(self, text: str) -> str:
        result = text
        for pii_type, pattern in self.PII_PATTERNS.items():
            def replacer(match: re.Match) -> str:
                hashed = hashlib.sha256(match.group().encode()).hexdigest()[:12]
                return f"[{pii_type.upper()}_{hashed}]"
            result = pattern.sub(replacer, result)
        return result

    def _redact(self, text: str) -> str:
        result = text
        for pattern in self.PII_PATTERNS.values():
            result = pattern.sub("[REDACTED]", result)
        return result

    def sanitize_dict(self, data: dict[str, Any]) -> dict[str, Any]:
        """Recursively sanitize all string values in a dictionary."""
        sanitized = {}
        for key, value in data.items():
            if isinstance(value, str):
                sanitized[key] = self.sanitize(value)
            elif isinstance(value, dict):
                sanitized[key] = self.sanitize_dict(value)
            elif isinstance(value, list):
                sanitized[key] = [
                    self.sanitize_dict(item) if isinstance(item, dict)
                    else self.sanitize(item) if isinstance(item, str)
                    else item
                    for item in value
                ]
            else:
                sanitized[key] = value
        return sanitized
```

### Complete Observability Pipeline

```python
import time
import json
import asyncio
from dataclasses import dataclass, field
from typing import Any, Protocol


class SpanExporter(Protocol):
    async def export(self, span_data: dict[str, Any]) -> None: ...


class MetricExporter(Protocol):
    async def export(self, metric_name: str, value: float, tags: dict[str, str]) -> None: ...


class AlertSink(Protocol):
    async def send(self, severity: str, message: str, context: dict[str, Any]) -> None: ...


@dataclass
class ObservabilityConfig:
    """Configuration for the complete observability pipeline."""
    # Collection
    service_name: str = "agent-service"
    service_version: str = "1.0.0"
    environment: str = "production"
    sample_rate: float = 1.0  # 1.0 = trace everything

    # Storage
    trace_retention_days: int = 30
    metric_retention_days: int = 90
    log_retention_days: int = 14

    # Privacy
    sanitize_pii: bool = True
    pii_mode: str = "mask"  # mask | hash | redact
    mask_large_values: bool = True
    max_logged_string_length: int = 1000

    # Cost control
    max_spans_per_trace: int = 500
    max_events_per_span: int = 50


class AgentObservabilityPipeline:
    """Complete observability pipeline for agent systems."""

    def __init__(self, config: ObservabilityConfig):
        self.config = config
        self.pii_sanitizer = PIISanitizer(mode=config.pii_mode) if config.sanitize_pii else None
        self._span_exporters: list[SpanExporter] = []
        self._metric_exporters: list[MetricExporter] = []
        self._alert_sinks: list[AlertSink] = []
        self._buffer: list[dict[str, Any]] = []
        self._buffer_size = 100
        self._span_counts: dict[str, int] = {}

    def add_span_exporter(self, exporter: SpanExporter) -> None:
        self._span_exporters.append(exporter)

    def add_metric_exporter(self, exporter: MetricExporter) -> None:
        self._metric_exporters.append(exporter)

    def add_alert_sink(self, sink: AlertSink) -> None:
        self._alert_sinks.append(sink)

    async def record_span(self, span_data: dict[str, Any]) -> None:
        """Record a span, applying sanitization and rate limiting."""
        trace_id = span_data.get("trace_id", "unknown")

        # Rate limiting per trace
        count = self._span_counts.get(trace_id, 0)
        if count >= self.config.max_spans_per_trace:
            return  # Drop span to prevent runaway traces
        self._span_counts[trace_id] = count + 1

        # Apply sampling
        if self.config.sample_rate < 1.0:
            import random
            if random.random() > self.config.sample_rate:
                return

        # Sanitize PII
        if self.pii_sanitizer:
            span_data = self.pii_sanitizer.sanitize_dict(span_data)

        # Mask large string values
        if self.config.mask_large_values:
            span_data = self._mask_large_values(span_data)

        # Export to all configured backends
        for exporter in self._span_exporters:
            try:
                await exporter.export(span_data)
            except Exception as e:
                # Never let observability failure break the agent
                print(f"Span export failed: {e}")

    async def record_metric(
        self,
        name: str,
        value: float,
        tags: dict[str, str] | None = None,
    ) -> None:
        """Record a metric point."""
        tags = tags or {}
        tags["service"] = self.config.service_name
        tags["environment"] = self.config.environment

        for exporter in self._metric_exporters:
            try:
                await exporter.export(name, value, tags)
            except Exception as e:
                print(f"Metric export failed: {e}")

    async def check_and_alert(
        self,
        metric_name: str,
        value: float,
        rules: list[dict[str, Any]],
    ) -> None:
        """Check a metric against alert rules and fire alerts."""
        for rule in rules:
            if rule["metric"] != metric_name:
                continue

            triggered = False
            if rule["condition"].startswith(">"):
                triggered = value > float(rule["condition"][1:])
            elif rule["condition"].startswith("<"):
                triggered = value < float(rule["condition"][1:])

            if triggered:
                for sink in self._alert_sinks:
                    try:
                        await sink.send(
                            severity=rule["severity"],
                            message=f"Alert: {rule['name']} — {rule.get('description', '')}",
                            context={
                                "metric": metric_name,
                                "value": value,
                                "threshold": rule["threshold"],
                                "rule": rule,
                            },
                        )
                    except Exception as e:
                        print(f"Alert delivery failed: {e}")

    def _mask_large_values(self, data: dict[str, Any]) -> dict[str, Any]:
        """Truncate large string values to prevent log bloat."""
        masked = {}
        for key, value in data.items():
            if isinstance(value, str) and len(value) > self.config.max_logged_string_length:
                masked[key] = value[:self.config.max_logged_string_length] + "... [TRUNCATED]"
            elif isinstance(value, dict):
                masked[key] = self._mask_large_values(value)
            else:
                masked[key] = value
        return masked

    def get_trace_summary(self, trace_id: str) -> dict[str, Any]:
        """Generate a summary of a trace for debugging."""
        return {
            "trace_id": trace_id,
            "span_count": self._span_counts.get(trace_id, 0),
            "service": self.config.service_name,
            "environment": self.config.environment,
        }
```

---

## Summary

Observability is not optional for agent systems — it is a prerequisite for reliable, cost-effective, and debuggable operations. The key principles are:

1. **Instrument everything**: Every LLM call, tool invocation, and agent decision must be traced with structured metadata.
2. **Track costs granularly**: Token usage, model pricing, and tool costs must be attributed per-request and per-user.
3. **Implement budget controls**: Circuit breakers and budget alerts prevent runaway costs before they become emergencies.
4. **Build replay capability**: The ability to replay and step through agent execution is essential for debugging non-deterministic behavior.
5. **Sanitize PII**: Observability data frequently contains sensitive information and must be handled according to privacy regulations.
6. **Design for resilience**: The observability pipeline itself must never break the agent system — failures in logging or metrics collection should be silently absorbed.

The observability pipeline — from collection through storage, analysis, alerting, and feedback — creates a continuous improvement loop. Insights from production traces inform prompt engineering, model selection, and architecture decisions, driving iterative improvement of agent quality and cost efficiency.

> **Looking ahead:** Chapter 8 will explore Memory Taxonomy for Agents — how to design, implement, and manage the different types of memory that transform stateless LLMs into context-aware, learning agents.

*Next: [Chapter 8 — Memory Taxonomy](chapter-08-memory-taxonomy.md)*
