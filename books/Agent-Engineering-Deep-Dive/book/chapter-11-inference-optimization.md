# Chapter 11: Inference Optimization

> "Premature optimization is the root of all evil. Yet we should not pass up our opportunities in that critical 3%." — Donald Knuth (adapted)

---

## 11.1 The Cost of Intelligence

Every LLM inference call costs money, time, and energy. For a single chatbot interaction, these costs are negligible. For an agent system that makes dozens of LLM calls per user request, handles millions of requests per day, and maintains complex multi-turn conversations, inference costs become a dominant engineering concern.

This chapter is about making agents **fast**, **cheap**, and **efficient** without sacrificing quality. We'll explore the full spectrum of optimization techniques — from prompt-level strategies that any developer can use, to infrastructure-level techniques that require deep knowledge of transformer architecture.

### The Cost Landscape

Before optimizing, you need to understand where costs come from:

| Cost Component | Typical Share | Optimization Levers |
|---|---|---|
| Input tokens (prompt) | 60-80% | Prompt compression, caching, shorter system prompts |
| Output tokens (completion) | 15-30% | Constrained generation, shorter responses |
| Compute (GPU time) | 5-15% | Batching, quantization, model selection |
| Network latency | 2-5% | Edge deployment, connection pooling |

### Agent-Specific Cost Amplifiers

Agents amplify inference costs compared to simple chatbots:

| Factor | Chatbot | Agent | Multiplier |
|---|---|---|---|
| LLM calls per request | 1-2 | 5-20 | 5-10x |
| Context size per call | ~2K tokens | ~10K tokens | 5x |
| Total tokens per request | ~5K | ~50K | 10x |
| Concurrent users | High | Medium | 0.5x |
| Latency tolerance | Low | High | 2x |

An agent that makes 10 LLM calls with 10K tokens each costs roughly **100x** more than a single chatbot call. Optimization is not optional at scale — it's survival.

---

## 11.2 Prompt Caching

Prompt caching is the single highest-impact optimization for agent systems. The idea is simple: if the same prefix of a prompt is sent repeatedly, cache the computed KV states and reuse them for subsequent requests.

### How Prompt Caching Works

Without caching, every request recomputes the entire prompt:

```
Request 1: [System Prompt | Tool Descriptions | History | User Message]
           ←──────────── Full computation ────────────→

Request 2: [System Prompt | Tool Descriptions | History | User Message]
           ←──────────── Full computation (again) ────→

Request 3: [System Prompt | Tool Descriptions | History | User Message]
           ←──────────── Full computation (again) ────→
```

With caching, the stable prefix is computed once:

```
Request 1: [System Prompt | Tool Descriptions | History | User Message]
           ←─── Full computation ───────────────────────→
           [─── Cache ──────────────]

Request 2: [System Prompt | Tool Descriptions | History | User Message]
           ←─ Cache hit (fast) ──→←── Computation ──→

Request 3: [System Prompt | Tool Descriptions | History | User Message]
           ←─ Cache hit (fast) ──→←── Computation ──→
```

### Anthropic's Prompt Caching

Anthropic offers built-in prompt caching for Claude models. The cache has these characteristics:

| Property | Value |
|---|---|
| Minimum cached prefix | 1024 tokens (Sonnet), 2048 tokens (Opus) |
| Cache TTL | 5 minutes (resets on each hit) |
| Cache write cost | 1.25x base input price |
| Cache read cost | 0.1x base input price |
| Net savings | ~90% on cached tokens after first hit |

**Cost calculation:**

```
Without caching (10K input tokens, 5 requests in 5 minutes):
  5 × 10,000 × $3/1M = $0.15

With caching (8K cached prefix, 2K unique per request):
  First request:  8,000 × $3.75/1M + 2,000 × $3/1M = $0.036
  Next 4 requests: 4 × (8,000 × $0.30/1M + 2,000 × $3/1M) = $0.0336
  Total: $0.0696 (54% savings)
```

### Implementing Prompt Caching

```python
import anthropic

client = anthropic.Anthropic()

# System prompt + tool descriptions (stable prefix)
SYSTEM_PROMPT = """You are a helpful assistant with access to the following tools:
...
[2000 tokens of instructions and tool definitions]
"""

def agent_call(user_message: str, conversation_history: list):
    messages = conversation_history + [{"role": "user", "content": user_message}]
    
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=4096,
        system=[
            {
                "type": "text",
                "text": SYSTEM_PROMPT,
                "cache_control": {"type": "ephemeral"}  # Enable caching
            }
        ],
        messages=messages
    )
    
    return response

# First call: cache miss (writes to cache)
# Subsequent calls within 5 minutes: cache hit (90% cheaper on cached prefix)
```

### Cache-Aware Prompt Design

To maximize cache hit rates, structure prompts with the most stable content first:

```
GOOD (stable → unstable):
┌──────────────────────────────────────────────┐
│ 1. System prompt (never changes)             │ ← Cached
│ 2. Tool definitions (changes rarely)         │ ← Cached
│ 3. Few-shot examples (changes occasionally)  │ ← Cached
│ 4. Conversation history (changes each turn)  │ ← Not cached
│ 5. Current user message                      │ ← Not cached
└──────────────────────────────────────────────┘

BAD (unstable first):
┌──────────────────────────────────────────────┐
│ 1. Current user message                      │ ← Not cached
│ 2. Conversation history                      │ ← Not cached
│ 3. System prompt                             │ ← Cached (but short prefix)
│ 4. Tool definitions                          │ ← Cached
└──────────────────────────────────────────────┘
```

### Provider-Agnostic Caching

For providers without built-in caching, implement application-level caching:

```python
import hashlib
from functools import lru_cache

class PromptCache:
    def __init__(self, ttl: int = 300):
        self.cache: dict[str, tuple[str, float]] = {}
        self.ttl = ttl
    
    def get_prefix_key(self, messages: list) -> str:
        """Generate a cache key from the stable prefix of messages."""
        # Hash the first N messages (system + tools)
        prefix = json.dumps(messages[:3])  # System prompt + tools
        return hashlib.sha256(prefix.encode()).hexdigest()
    
    def get(self, messages: list) -> list | None:
        key = self.get_prefix_key(messages)
        if key in self.cache:
            result, timestamp = self.cache[key]
            if time.time() - timestamp < self.ttl:
                return result
            del self.cache[key]
        return None
    
    def set(self, messages: list, result: list):
        key = self.get_prefix_key(messages)
        self.cache[key] = (result, time.time())
```

### KV-Cache Management

At the infrastructure level, KV-cache management is critical for serving multiple users:

```
┌─────────────────────────────────────────────────────────────────┐
│                  KV-CACHE MANAGEMENT                             │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │\\n│  │ GPU Memory                                                 │   │\\n│  │                                                           │   │\\n│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐      │   │\\n│  │  │ User A  │ │ User B  │ │ User C  │ │ User D  │      │   │\\n│  │  │ KV      │ │ KV      │ │ KV      │ │ KV      │      │   │\\n│  │  │ Cache   │ │ Cache   │ │ Cache   │ │ Cache   │      │   │\\n│  │  │ 8KB     │ │ 12KB    │ │ 4KB     │ │ 16KB    │      │   │\\n│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘      │   │\\n│  │                                                           │   │\\n│  │  Total: 40KB of 80KB GPU memory used                    │   │\\n│  │  Remaining: 40KB (room for 2 more users)                │   │\\n│  └──────────────────────────────────────────────────────────┘   │\\n│                                                                  │\\n│  Eviction strategies when memory is full:                       │\\n│  • LRU: Evict least recently used cache                         │\\n│  • LFU: Evict least frequently used cache                       │\\n│  • Priority: Evict lowest-priority user first                   │\\n│  • TTL: Evict oldest cache entries                              │\\n└─────────────────────────────────────────────────────────────────┘\n```

---

## 11.3 Prompt Compression

Reducing the number of tokens in your prompts directly reduces cost and latency.

### Compression Techniques

**Technique 1: Concise System Prompts**

Reword system prompts to use fewer tokens while preserving meaning:

```
Verbose (150 tokens):
"You are a helpful AI assistant designed to help users with their questions. 
You should always provide accurate, helpful, and harmless responses. When you 
don't know something, say so honestly. When you make a mistake, correct it. 
Always cite your sources when possible."

Concise (60 tokens):
"You are a helpful assistant. Be accurate, honest about uncertainty, and 
correct mistakes. Cite sources when possible."
```

**Technique 2: Structured Tool Descriptions**

Use JSON Schema instead of verbose descriptions:

```json
// Verbose (200 tokens)
// The search_web tool allows you to search the internet for information.
// You should use this tool when you need to find current information 
// about a topic. It takes a query parameter which is the search string.
// It returns a list of search results with titles, URLs, and snippets.

// Concise (80 tokens)
{"name":"search","desc":"Web search","params":{"query":"string"}}
```

**Technique 3: History Compression**

Summarize older conversation turns:

```python
def compress_history(messages: list, max_turns: int = 10) -> list:
    if len(messages) <= max_turns * 2 + 2:
        return messages
    
    system = messages[0]
    recent = messages[-(max_turns * 2):]
    old = messages[1:-(max_turns * 2)]
    
    summary = llm_summarize(old)
    
    return [
        system,
        {"role": "assistant", "content": f"[Previous conversation summary: {summary}]"},
        *recent
    ]
```

**Technique 4: Remove Redundancy**

In multi-turn agent conversations, earlier tool results are often no longer relevant:

```python
def trim_tool_results(messages: list, keep_last_n: int = 3) -> list:
    """Keep only the last N tool result exchanges."""
    tool_result_indices = [
        i for i, m in enumerate(messages)
        if m.get("role") == "user" and any(
            p.get("type") == "tool_result" for p in m.get("content", [])
        )
    ]
    
    if len(tool_result_indices) <= keep_last_n:
        return messages
    
    # Mark older tool results for summarization
    indices_to_trim = tool_result_indices[:-keep_last_n]
    trimmed = []
    for i, msg in enumerate(messages):
        if i in indices_to_trim:
            # Replace with summary
            trimmed.append(summarize_tool_result(msg))
        else:
            trimmed.append(msg)
    
    return trimmed
```

---

## 11.4 Model Selection and Routing

Not every LLM call needs the most powerful (and expensive) model. Smart routing sends simple tasks to cheap models and complex tasks to powerful ones.

### Tiered Model Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                  MODEL ROUTING STRATEGY                          │\\n│                                                                  │\\n│  User Request                                                   │\\n│       │                                                         │\\n│       ▼                                                         │\\n│  ┌──────────┐                                                  │\\n│  │  Router  │                                                  │\\n│  │ (fast    │                                                  │\\n│  │  model)  │                                                  │\\n│  └────┬─────┘                                                  │\\n│       │                                                        │\\n│  ┌────┼────────────────┬──────────────────┐                   │\\n│  │    │                │                  │                    │\\n│  ▼    ▼                ▼                  ▼                    │\\n│┌──────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐               │\\n││Tier 1│ │ Tier 2   │ │ Tier 3   │ │ Tier 4   │               │\\n││      │ │          │ │          │ │          │               │\\n││Haiku │ │ Sonnet   │ │ Opus     │ │ Opus     │               │\\n││$0.25/│ │ $3/1M    │ │ $15/1M   │ │ $15/1M   │               │\\n││1M    │ │          │ │          │ │ +extended│               │\\n││      │ │          │ │          │ │ thinking │               │\\n││Intent│ │ Standard │ │ Complex  │ │ Critical │               │\\n││class.│ │ tasks    │ │ reasoning│ │ decisions│               │\\n││Simple│ │ Tool use │ │ Planning │ │ Verified │               │\\n││Q&A   │ │ Analysis │ │ Debugging│ │ output   │               │\\n│└──────┘ └──────────┘ └──────────┘ └──────────┘               │\\n│                                                                │\\n│  Typical distribution:                                        │\\n│  Tier 1: 40% of calls ($0.10/1K tokens)                      │\\n│  Tier 2: 45% of calls ($3/1M tokens)                         │\\n│  Tier 3: 12% of calls ($15/1M tokens)                        │\\n│  Tier 4: 3% of calls  ($15/1M tokens + thinking)             │\\n└─────────────────────────────────────────────────────────────────┘\n```

### Router Implementation

```python
class ModelRouter:
    def __init__(self):
        self.models = {
            "fast": {"model": "claude-haiku-4-5-20251001", "cost_per_1k": 0.00025},
            "balanced": {"model": "claude-sonnet-4-20250514", "cost_per_1k": 0.003},
            "powerful": {"model": "claude-opus-4-20250514", "cost_per_1k": 0.015},
        }
    
    def route(self, task_type: str, complexity: float) -> str:
        """Route to appropriate model based on task type and complexity."""
        
        # Simple tasks always go to fast model
        if task_type in ["intent_classification", "summarize_tool_result", "format_output"]:
            return "fast"
        
        # Complex tasks go to powerful model
        if task_type in ["planning", "debugging", "code_review", "critical_reasoning"]:
            if complexity > 0.8:
                return "powerful"
            return "balanced"
        
        # Default routing by complexity
        if complexity < 0.3:
            return "fast"
        elif complexity < 0.7:
            return "balanced"
        else:
            return "powerful"
    
    def estimate_cost(self, task_type: str, complexity: float, input_tokens: int, output_tokens: int):
        model_key = self.route(task_type, complexity)
        model = self.models[model_key]
        return (input_tokens * model["cost_per_1k"] + 
                output_tokens * model["cost_per_1k"] * 5)  # Output typically 5x input cost
```

### Self-Router Pattern

Use the LLM itself to decide which model to use:

```python
def self_route(user_message: str) -> str:
    """Ask a fast model to classify the task complexity."""
    classification = llm_haiku.chat(
        messages=[{
            "role": "user",
            "content": f"""Classify this request's complexity. Reply with ONLY one word:
- simple: factual questions, formatting, classification
- medium: analysis, tool use, multi-step reasoning
- complex: planning, debugging, creative work, critical decisions

Request: {user_message}"""
        }]
    )
    
    return {"simple": "fast", "medium": "balanced", "complex": "powerful"}[classification]
```

---

## 11.5 Batching and Request Coalescing

When many users make similar requests, batching them together reduces per-request overhead.

### Continuous Batching

Modern inference servers support continuous batching, where requests are dynamically grouped:

```
Without batching:
Request 1: ──► GPU ──►
Request 2:    ──► GPU ──►
Request 3:       ──► GPU ──►
Total time: sum of all individual times

With continuous batching:
Request 1: ──► ┌──────────┐
Request 2: ──► │   GPU    │ ──►
Request 3: ──► │ (batch)  │
               └──────────┘
Total time: ~max of individual times (parallel execution)
```

### Request Coalescing

For identical or near-identical requests, coalesce them into a single LLM call:

```python
class RequestCoalescer:
    def __init__(self, window_ms: int = 100):
        self.pending: dict[str, list[Future]] = {}
        self.window_ms = window_ms
    
    async def coalesce(self, request_key: str, request_data: dict) -> dict:
        """Coalesce identical requests within a time window."""
        future = asyncio.get_event_loop().create_future()
        
        if request_key not in self.pending:
            self.pending[request_key] = []
            
            # Schedule execution after window
            asyncio.get_event_loop().call_later(
                self.window_ms / 1000,
                lambda: asyncio.create_task(self._execute_batch(request_key))
            )
        
        self.pending[request_key].append(future)
        return await future
    
    async def _execute_batch(self, request_key: str):
        """Execute a batch of coalesced requests."""
        futures = self.pending.pop(request_key, [])
        if not futures:
            return
        
        # Execute single LLM call for all identical requests
        result = await llm.chat(request_key)
        
        # Fan out result to all waiting requests
        for future in futures:
            future.set_result(result)
```

### Speculative Batching

For agent loops where the next step is predictable, speculatively execute the likely next call:

```python
class SpeculativeExecutor:
    def __init__(self):
        self.speculation_cache = {}
    
    async def execute_with_speculation(self, agent_state: AgentState):
        # Predict likely next tool calls
        predictions = self.predict_next_tools(agent_state)
        
        # Start speculative execution in parallel
        spec_futures = {}
        for tool预测 in predictions:
            spec_futures[tool预测] = asyncio.create_task(
                self.speculative_execute(tool预测)
            )
        
        # Actually decide what to do
        actual_tool = await self.decide_next_tool(agent_state)
        
        if actual_tool in spec_futures:
            # Speculation was correct! Use cached result
            result = await spec_futures[actual_tool]
            return result
        else:
            # Speculation was wrong. Execute normally.
            return await self.execute(actual_tool)
```

---

## 11.6 Streaming Optimization

Streaming reduces **perceived latency** by delivering tokens as they're generated. But streaming also enables several optimization patterns.

### Token-by-Token Streaming

```
Without streaming:
[====== Waiting 2.5s ======] "Here is the analysis of your data..."

With streaming:
[0.1s] "Here"
[0.1s] " is"
[0.1s] " the"
[0.2s] " analysis"
[0.1s] " of"
[0.1s] " your"
[0.2s] " data..."
Total: 0.9s perceived first token, progressive delivery
```

### Streaming with Early Termination

For tool-calling agents, streaming enables early termination when the agent has decided on a tool call:

```python
async def stream_agent_call(messages, tools):
    tool_call_buffer = ""
    
    async for event in client.messages.stream(
        model="claude-sonnet-4-20250514",
        messages=messages,
        tools=tools
    ):
        if event.type == "content_block_start":
            if event.content_block.type == "tool_use":
                # Tool call detected — we know the agent's decision
                # Start preparing tool execution immediately
                tool_name = event.content_block.name
                yield {"type": "tool_selected", "tool": tool_name}
        
        elif event.type == "content_block_delta":
            if event.delta.type == "input_json_delta":
                tool_call_buffer += event.delta.partial_json
                # Parse partial JSON to start tool prep
                partial_args = try_parse_partial_json(tool_call_buffer)
                if partial_args:
                    yield {"type": "tool_args_preview", "args": partial_args}
        
        elif event.type == "message_stop":
            # Finished — execute the tool
            final_args = json.loads(tool_call_buffer)
            yield {"type": "execute_tool", "tool": tool_name, "args": final_args}
```

### Streaming for Multi-Agent Coordination

In multi-agent systems, streaming enables coordination:

```
┌─────────────────────────────────────────────────────────────────┐
│            STREAMING MULTI-AGENT COORDINATION                    │\\n│                                                                  │\\n│  Supervisor                                                     │\\n│      │                                                          │\\n│      │ "Research topic A" (streams to Research Agent)           │\\n│      │ "Analyze data B" (streams to Analysis Agent)             │\\n│      │                                                          │\\n│      ▼                                                          │\\n│  ┌──────────────────────────────────────────────────────────┐  │\\n│  │                    AGENT FAN-OUT                          │  │\\n│  │                                                           │  │\\n│  │  Research Agent          Analysis Agent                   │  │\\n│  │  [streaming...]          [streaming...]                   │  │\\n│  │  "Found 3 sources"       "Analyzing patterns..."          │  │\\n│  │  "Primary source..."     "Found correlation..."           │  │\\n│  │  [completed]             [completed]                      │  │\\n│  └──────────────────────────────────────────────────────────┘  │\\n│      │                    │                                     │\\n│      └────────┬───────────┘                                     │\\n│               │                                                  │\\n│               ▼                                                  │\\n│  Supervisor receives streaming results and can:                │\\n│  • Start synthesizing while agents are still working           │\\n│  • Redirect agents based on intermediate results               │\\n│  • Cancel unnecessary work early                                │\\n└─────────────────────────────────────────────────────────────────┘\n```

---

## 11.7 Quantization and Model Compression

For self-hosted deployments, model compression reduces memory requirements and increases throughput.

### Quantization Levels

| Precision | Bits | Memory (70B model) | Quality Impact | Throughput |
|---|---|---|---|---|
| FP32 | 32 | 280 GB | Baseline | 1x |
| FP16 | 16 | 140 GB | Negligible | 2x |
| INT8 | 8 | 70 GB | Minimal | 4x |
| INT4 | 4 | 35 GB | Moderate | 8x |
| GPTQ | 4 | 35 GB | Low-Moderate | 6x |
| AWQ | 4 | 35 GB | Low | 7x |
| GGUF Q4_K_M | 4 | 38 GB | Low-Moderate | 7x |

### When to Quantize

```
┌─────────────────────────────────────────────────────────────────┐
│              QUANTIZATION DECISION TREE                          │\\n│                                                                  │\\n│  Are you self-hosting?                                          │\\n│  │                                                               │\\n│  ├─ No → Use API (provider handles optimization)               │\\n│  │                                                               │\\n│  └─ Yes → Do you need maximum quality?                         │\\n│           │                                                     │\\n│           ├─ Yes → Use FP16 or INT8                            │\\n│           │                                                     │\\n│           └─ No → Is GPU memory constrained?                   │\\n│                    │                                            │\\n│                    ├─ No → Use FP16                            │\\n│                    │                                            │\\n│                    └─ Yes → Use AWQ INT4                       │\\n│                         (best quality/memory tradeoff)          │\\n└─────────────────────────────────────────────────────────────────┘\n```

### Speculative Decoding

Speculative decoding uses a smaller "draft" model to generate candidate tokens, then verifies them with the larger model in a single forward pass:

```
┌─────────────────────────────────────────────────────────────────┐
│              SPECULATIVE DECODING                                │\\n│                                                                  │\\n│  Draft Model (small, fast)                                      │\\n│  Generates: "The quick brown fox" (4 tokens, 10ms)             │\\n│                                                                  │\\n│  Target Model (large, slow)                                     │\\n│  Verifies: "The quick brown fox" (4 tokens, 50ms)              │\\n│  All 4 accepted ✓                                               │\\n│                                                                  │\\n│  Total: 60ms for 4 tokens (vs 200ms for 4 tokens normally)    │\\n│  Speedup: 3.3x                                                  │\\n│                                                                  │\\n│  If draft generates "The quick brown fix":                      │\\n│  Target accepts: "The quick brown" (3 tokens)                   │\\n│  Target generates: "fox" (corrects, 1 token)                    │\\n│  Total: still faster than target-only                          │\\n└─────────────────────────────────────────────────────────────────┘\n```

---

## 11.8 Cost Engineering

Cost engineering goes beyond technical optimization to include business-level decisions about how to manage inference costs.

### Cost Attribution

Track costs per feature, per user, per request type:

```python
class CostTracker:
    def __init__(self):
        self.costs: dict[str, float] = defaultdict(float)
    
    def track(self, request_id: str, model: str, input_tokens: int, output_tokens: int):
        cost = self.calculate_cost(model, input_tokens, output_tokens)
        
        # Attribute cost to request
        self.costs[f"request:{request_id}"] += cost
        
        # Attribute cost to model
        self.costs[f"model:{model}"] += cost
        
        # Attribute cost to time bucket
        hour = datetime.now().strftime("%Y-%m-%d-%H")
        self.costs[f"hour:{hour}"] += cost
        
        return cost
    
    def get_cost_report(self) -> dict:
        return {
            "total_cost": sum(self.costs.values()),
            "by_model": {k: v for k, v in self.costs.items() if k.startswith("model:")},
            "by_hour": {k: v for k, v in sorted(self.costs.items()) if k.startswith("hour:")},
        }
```

### Cost Budgets and Alerts

```python
class CostBudget:
    def __init__(self, daily_limit: float = 100.0, alert_threshold: float = 0.8):
        self.daily_limit = daily_limit
        self.alert_threshold = alert_threshold
        self.daily_costs: dict[str, float] = defaultdict(float)
    
    def check_budget(self, estimated_cost: float) -> bool:
        today = datetime.now().strftime("%Y-%m-%d")
        current = self.daily_costs[today]
        
        if current + estimated_cost > self.daily_limit:
            raise BudgetExceededError(
                f"Daily budget exceeded: ${current:.2f} + ${estimated_cost:.2f} > ${self.daily_limit:.2f}"
            )
        
        if current + estimated_cost > self.daily_limit * self.alert_threshold:
            self.send_alert(f"Approaching daily limit: ${current:.2f} / ${self.daily_limit:.2f}")
        
        return True
    
    def record_cost(self, cost: float):
        today = datetime.now().strftime("%Y-%m-%d")
        self.daily_costs[today] += cost
```

### Cost-Performance Tradeoff Matrix

| Optimization | Cost Reduction | Latency Impact | Quality Impact | Implementation Effort |
|---|---|---|---|---|
| Prompt caching | 50-90% on input tokens | None (cache hit is faster) | None | Low |
| Prompt compression | 20-50% on input tokens | None | Low risk | Low |
| Model routing | 40-70% overall | Depends on routing | Low risk | Medium |
| Batch processing | 20-40% throughput | None | None | Medium |
| Quantization | 50-75% memory | None to slight increase | Low to moderate | High |
| Speculative decoding | None (latency only) | 2-3x faster | None | High |
| Streaming | None (latency only) | Better perceived | None | Low |

### ROI Prioritization

```
Priority 1 (Do first, high ROI):
  ✅ Prompt caching
  ✅ System prompt optimization
  ✅ Model routing

Priority 2 (Good ROI, moderate effort):
  ✅ History compression
  ✅ Request coalescing
  ✅ Cost budgets and alerts

Priority 3 (Specialized, high effort):
  ✅ Quantization (self-hosting only)
  ✅ Speculative decoding (self-hosting only)
  ✅ Custom inference servers
```

---

## 11.9 Latency Optimization

Beyond cost, latency directly impacts user experience. An agent that takes 10 seconds per step and makes 5 steps produces a 50-second response — unacceptable for interactive use.

### Latency Breakdown

```
┌─────────────────────────────────────────────────────────────────┐
│                  LATENCY BREAKDOWN                               │\\n│                                                                  │\\n│  User sends request                                             │\\n│       │                                                         │\\n│       ├─── Network round-trip ─────────── 50-200ms             │\\n│       │                                                         │\\n│       ├─── Prompt processing (input) ──── 200-500ms            │\\n│       │    (depends on prompt length)                          │\\n│       │                                                         │\\n│       ├─── Token generation ───────────── 1000-5000ms          │\\n│       │    (depends on output length)                          │\\n│       │                                                         │\\n│       ├─── Tool execution ─────────────── 100-5000ms           │\\n│       │    (depends on tool)                                   │\\n│       │                                                         │\\n│       ├─── Network round-trip ─────────── 50-200ms             │\\n│       │                                                         │\\n│       └─── Total per step ─────────────── 1400-11000ms        │\\n│                                                                  │\\n│  For 5-step agent: 7-55 seconds total                          │\\n└─────────────────────────────────────────────────────────────────┘\n```

### Latency Reduction Strategies

**Strategy 1: Parallel Tool Execution**

Execute independent tools simultaneously:

```python
import asyncio

async def parallel_tool_execution(tools: list[ToolCall]):
    """Execute independent tool calls in parallel."""
    tasks = [execute_tool(tool) for tool in tools]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    return results

# Instead of:
# result1 = await search("query1")      # 500ms
# result2 = await search("query2")      # 500ms
# result3 = await search("query3")      # 500ms
# Total: 1500ms

# Do:
# results = await parallel_tool_execution([
#     search("query1"),
#     search("query2"),
#     search("query3"),
# ])
# Total: ~500ms
```

**Strategy 2: Predictive Prefetching**

Start executing likely next steps before the LLM decides:

```python
class PredictivePrefetcher:
    def __init__(self):
        self.prediction_model = load_prediction_model()
    
    async def prefetch(self, current_state: AgentState):
        """Predict and prefetch likely next tool results."""
        predictions = self.prediction_model.predict(current_state)
        
        prefetched = {}
        for prediction in predictions:
            if prediction.confidence > 0.7:
                # Start prefetching in background
                prefetched[prediction.tool] = asyncio.create_task(
                    execute_tool(prediction.tool, prediction.args)
                )
        
        return prefetched
```

**Strategy 3: Connection Pooling**

Reuse HTTP connections to LLM providers:

```python
import httpx

# Bad: new connection per request
async def call_llm_bad(messages):
    async with httpx.AsyncClient() as client:
        return await client.post("https://api.anthropic.com/v1/messages", ...)

# Good: connection pool
class LLMPool:
    def __init__(self):
        self.client = httpx.AsyncClient(
            limits=httpx.Limits(
                max_connections=100,
                max_keepalive_connections=20,
                keepalive_expiry=30
            )
        )
    
    async def call(self, messages, **kwargs):
        return await self.client.post("https://api.anthropic.com/v1/messages", ...)
```

**Strategy 4: Edge Deployment**

Deploy inference closer to users:

```
┌─────────────────────────────────────────────────────────────────┐
│                  EDGE DEPLOYMENT                                 │\\n│                                                                  │\\n│  User (Tokyo)  User (London)  User (New York)                  │\\n│      │              │              │                           │\\n│      ▼              ▼              ▼                           │\\n│  ┌────────┐   ┌────────┐   ┌────────┐                        │\\n│  │ Edge   │   │ Edge   │   │ Edge   │                        │\\n│  │ (Tokyo)│   │(London)│   │  (NYC) │                        │\\n│  └───┬────┘   └───┬────┘   └───┬────┘                        │\\n│      │             │             │                            │\\n│      └──────┬──────┴──────┬──────┘                           │\\n│              │             │                                   │\\n│              ▼             ▼                                   │\\n│         ┌────────┐   ┌────────┐                              │\\n│         │ Origin │   │ Origin │                              │\\n│         │(US)    │   │(EU)    │                              │\\n│         └────────┘   └────────┘                              │\\n│                                                                  │\\n│  Edge: Fast inference for simple tasks (routing, caching)      │\\n│  Origin: Full inference for complex tasks (planning, reasoning)│\\n└─────────────────────────────────────────────────────────────────┘\n```

---

## 11.10 Inference at Scale

Scaling inference requires careful infrastructure planning.

### Horizontal Scaling

```
┌─────────────────────────────────────────────────────────────────┐
│                  HORIZONTAL SCALING                              │\\n│                                                                  │\\n│  ┌──────────────────────────────────────────────────────────┐  │\\n│  │                    LOAD BALANCER                          │  │\\n│  └──────────┬───────────┬───────────┬───────────┬───────────┘  │\\n│             │           │           │           │              │\\n│       ┌─────▼───┐ ┌─────▼───┐ ┌─────▼───┐ ┌─────▼───┐       │\\n│       │ Worker 1│ │ Worker 2│ │ Worker 3│ │ Worker 4│       │\\n│       │         │ │         │ │         │ │         │       │\\n│       │ GPU: A100│ │ GPU: A100│ │ GPU: A100│ │ GPU: A100│       │\\n│       │ Model:  │ │ Model:  │ │ Model:  │ │ Model:  │       │\\n│       │ Llama 70B│ │ Llama 70B│ │ Llama 70B│ │ Llama 70B│       │\\n│       └─────────┘ └─────────┘ └─────────┘ └─────────┘       │\\n│                                                                  │\\n│  Autoscaling rules:                                            │\\n│  • Scale up when queue depth > 10                              │\\n│  • Scale down when utilization < 30%                           │\\n│  • Max 16 workers                                              │\\n│  • Min 2 workers                                               │\\n└─────────────────────────────────────────────────────────────────┘\n```

### Mixed-Precision Serving

Serve multiple model sizes from the same infrastructure:

```python
class MixedPrecisionServer:
    def __init__(self):
        self.models = {
            "fast": load_model("llama-7b-awq", device="cuda:0"),
            "balanced": load_model("llama-70b-awq", device="cuda:0,1"),
            "powerful": load_model("llama-70b-fp16", device="cuda:0,1,2,3"),
        }
    
    async def serve(self, request: InferenceRequest):
        model_key = self.route(request)
        model = self.models[model_key]
        
        # Model-specific batching
        return await model.generate(
            prompt=request.prompt,
            max_tokens=request.max_tokens,
            temperature=request.temperature
        )
```

### Cost Monitoring Dashboard

```python
class InferenceMetrics:
    def __init__(self):
        self.request_count = Counter("llm_requests_total", "Total LLM requests", ["model", "status"])
        self.latency = Histogram("llm_latency_seconds", "LLM latency", ["model"])
        self.tokens_used = Counter("llm_tokens_total", "Total tokens", ["model", "direction"])
        self.cost = Counter("llm_cost_dollars", "Total cost", ["model"])
    
    def record_request(self, model: str, input_tokens: int, output_tokens: int, 
                       latency: float, cost: float):
        self.request_count.labels(model=model, status="success").inc()
        self.latency.labels(model=model).observe(latency)
        self.tokens_used.labels(model=model, direction="input").inc(input_tokens)
        self.tokens_used.labels(model=model, direction="output").inc(output_tokens)
        self.cost.labels(model=model).inc(cost)
```

---

## 11.11 Practical Optimization Playbook

### Step 1: Measure Before Optimizing

```python
# Add instrumentation to every LLM call
@dataclass
class InferenceMetrics:
    model: str
    input_tokens: int
    output_tokens: int
    latency_ms: float
    cost_usd: float
    cache_hit: bool
    task_type: str

def instrumented_llm_call(model: str, messages: list, **kwargs) -> tuple[Response, InferenceMetrics]:
    start = time.time()
    
    response = client.messages.create(model=model, messages=messages, **kwargs)
    
    latency = (time.time() - start) * 1000
    usage = response.usage
    
    metrics = InferenceMetrics(
        model=model,
        input_tokens=usage.input_tokens,
        output_tokens=usage.output_tokens,
        latency_ms=latency,
        cost_usd=calculate_cost(model, usage.input_tokens, usage.output_tokens),
        cache_hit=usage.cache_read_input_tokens > 0 if hasattr(usage, 'cache_read_input_tokens') else False,
        task_type=classify_task(messages)
    )
    
    return response, metrics
```

### Step 2: Optimize Prompts

1. Audit system prompt token count — aim for < 500 tokens
2. Minimize tool descriptions — use structured schemas
3. Compress conversation history — summarize older turns
4. Cache stable prefixes — use `cache_control` markers

### Step 3: Optimize Model Selection

1. Implement a router that classifies task complexity
2. Route simple tasks to cheap models
3. Route complex tasks to powerful models
4. Monitor quality degradation and adjust thresholds

### Step 4: Optimize Infrastructure

1. Enable connection pooling
2. Implement request batching for similar requests
3. Use streaming for all responses
4. Deploy edge inference for latency-sensitive paths

### Step 5: Optimize Costs

1. Set daily/monthly cost budgets
2. Implement cost attribution per feature
3. Alert on anomalies
4. Regularly review cost reports

---

## 11.12 Summary

| Technique | Cost Impact | Latency Impact | Quality Impact | Effort |
|---|---|---|---|---|
| Prompt caching | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ (faster) | None | Low |
| Prompt compression | ⭐⭐⭐ | None | Low risk | Low |
| Model routing | ⭐⭐⭐⭐ | Varies | Low risk | Medium |
| Streaming | None | ⭐⭐⭐⭐ (perceived) | None | Low |
| Batch processing | ⭐⭐⭐ | None | None | Medium |
| Speculative decoding | None | ⭐⭐⭐⭐ (real) | None | High |
| Quantization | ⭐⭐⭐ (memory) | None to slight | Low-moderate | High |
| Edge deployment | ⭐⭐ (network) | ⭐⭐⭐ | None | High |

**The optimization hierarchy for agent systems:**

1. **Prompt engineering** (free, immediate) — Cache, compress, optimize
2. **Model selection** (moderate effort) — Route tasks to appropriate models
3. **Infrastructure** (significant effort) — Batching, streaming, pooling
4. **Hardware** (major effort) — Quantization, custom inference, edge deployment

Start at the top. Most agent systems can achieve 50-80% cost reduction through prompt caching and model routing alone, without any infrastructure changes.

---

*Next: Chapter 12 — Production Deployment and Future Directions, where we bring everything together for real-world deployment.*
