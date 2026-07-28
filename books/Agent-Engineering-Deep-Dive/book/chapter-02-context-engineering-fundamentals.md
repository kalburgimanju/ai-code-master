# Chapter 2: Context Engineering Fundamentals

> "Context is everything. Without context, there is only noise." — Unknown

---

## 2.1 What is Context Engineering?

Context Engineering is the systematic design and management of all information an LLM receives during inference. It is the practice of determining **what** information the model needs, **when** it needs it, **in what form** it should be delivered, and **how much** of the total context budget each piece should consume.

This is not prompt engineering. Prompt engineering asks: "How do I phrase this request?" Context engineering asks: "What information does the model need to succeed, and how do I assemble it?"

The distinction matters because most agent failures are not caused by poorly worded prompts. They are caused by the model not having the information it needs to make good decisions. A perfectly phrased prompt with missing or irrelevant context will produce worse results than a mediocre prompt with comprehensive, well-organized context.

### Why Context Engineering Matters More Than Prompt Engineering

Consider a customer support agent that needs to help a user with a billing dispute. The context must include:

- The user's account history and current subscription
- The relevant billing records
- The company's refund policy
- Previous support interactions on this topic
- The current conversation history
- Available tools (refund processing, account adjustments)
- Constraints (refund limits, approval requirements)

No amount of prompt engineering can compensate for missing information. The model cannot reason about data it doesn't have. Context engineering ensures it has everything it needs.

### The Shift in Mental Model

The shift from prompt engineering to context engineering represents a fundamental change in how we think about LLM interactions:

```
Prompt Engineering Mental Model:
  "What should I say to the model?"
  ┌──────────────┐         ┌──────────────┐
  │   Prompt     │────────▶│    Model     │──▶ Response
  │  (fixed)     │         │              │
  └──────────────┘         └──────────────┘

Context Engineering Mental Model:
  "What information does the model need?"
  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
  │    User      │  │  Retrieved   │  │   Memory     │
  │   Input      │  │   Context    │  │              │
  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
         │                 │                  │
         └────────┬────────┴─────────┬───────┘
                  │                  │
           ┌──────▼──────┐  ┌───────▼──────┐
           │  Context    │  │   Token      │
           │  Assembly   │  │   Budget     │
           └──────┬──────┘  └───────┬──────┘
                  │                  │
                  └────────┬─────────┘
                           │
                    ┌──────▼──────┐         ┌──────────┐
                    │  Optimized  │────────▶│  Model   │
                    │  Context    │         │          │
                    └─────────────┘         └──────────┘
```

Context as a first-class engineering concern means treating it with the same rigor we apply to database schemas, API contracts, or infrastructure design. It is not an afterthought — it is a core architectural decision.

---

## 2.2 The Anatomy of Context

Every piece of information an LLM receives during inference is part of its context. Understanding the anatomy of context is the first step to managing it effectively.

### The Six Components of Context

```
┌─────────────────────────────────────────────────────────┐
│                    LLM CONTEXT WINDOW                    │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │  1. SYSTEM INSTRUCTIONS                         │    │
│  │  Role, constraints, output format, behavior     │    │
│  ├─────────────────────────────────────────────────┤    │
│  │  2. STRUCTURED METADATA                         │    │
│  │  Timestamps, user info, session state, flags    │    │
│  ├─────────────────────────────────────────────────┤    │
│  │  3. TOOL DEFINITIONS                            │    │
│  │  Available functions, parameters, descriptions  │    │
│  ├─────────────────────────────────────────────────┤    │
│  │  4. RETRIEVED CONTEXT                           │    │
│  │  RAG results, database queries, API responses   │    │
│  ├─────────────────────────────────────────────────┤    │
│  │  5. CONVERSATION HISTORY                        │    │
│  │  Previous turns, user preferences, prior decisions│    │
│  ├─────────────────────────────────────────────────┤    │
│  │  6. USER INPUT                                  │    │
│  │  The current request, attachments, follow-ups   │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Context Component Reference

| Component | Purpose | Source | Management Strategy |
|---|---|---|---|
| System Instructions | Define agent behavior, constraints, and output format | Developer-authored | Fixed or version-controlled; rarely changes within session |
| Structured Metadata | Provide temporal, identity, and state context | Application state | Assembled from session data; token-efficient encoding |
| Tool Definitions | Tell the model what it can do | Tool registry | Dynamic; only include relevant tools per request |
| Retrieved Context | Provide domain-specific information | RAG pipeline, APIs | Ranked by relevance; subject to token budget |
| Conversation History | Maintain coherence across turns | Session store | Compressed over time; key facts extracted |
| User Input | The current request | User | Always included; highest priority |

### Token Budget Breakdown

In a typical agent interaction, the context window is allocated across these components. Understanding the budget helps you make informed tradeoffs:

```
Example: 128K token context window
═══════════════════════════════════════════════════
Component               Tokens    Percentage
─────────────────────────────────────────────────
System Instructions       2,000       1.6%
Tool Definitions          4,000       3.1%
Structured Metadata         500       0.4%
Retrieved Context        32,000      25.0%
Conversation History     48,000      37.5%
User Input                2,000       1.6%
─────────────────────────────────────────────────
Subtotal (Input)         88,500      69.1%
Reserved for Output      39,500      30.9%
─────────────────────────────────────────────────
TOTAL                   128,000     100.0%
═══════════════════════════════════════════════════
```

The key insight is that **conversation history and retrieved context dominate the budget**. If you don't manage these carefully, you'll run out of space for the information that actually matters.

---

## 2.3 Context Window Management

The context window is finite. Even the largest models (128K-200K tokens) cannot hold unlimited information. Effective context engineering requires deliberate strategies for managing this constraint.

### The Finite Context Window Problem

As conversations grow and more information is retrieved, the context window fills up. What happens when it does?

1. **Truncation**: The oldest information is dropped. This can lose critical context.
2. **Error**: The API rejects the request. The agent fails.
3. **Degradation**: The model tries to work with incomplete information. Quality suffers.

None of these are acceptable in production. The solution is proactive context management.

### Strategy 1: Priority-Based Truncation

Not all context is equally important. A priority-based approach ensures the most critical information is always present:

```python
from dataclasses import dataclass, field
from typing import List
import tiktoken

@dataclass
class ContextItem:
    content: str
    priority: int  # 1 = highest, 5 = lowest
    component: str  # "system", "retrieved", "history", "input"
    token_count: int = 0

    def __post_init__(self):
        if self.token_count == 0:
            enc = tiktoken.encoding_for_model("gpt-4")
            self.token_count = len(enc.encode(self.content))


class ContextManager:
    """Manages context window with priority-based assembly."""

    def __init__(self, max_tokens: int = 128_000, output_reserve: int = 16_000):
        self.max_tokens = max_tokens
        self.output_reserve = output_reserve
        self.available_tokens = max_tokens - output_reserve

    def assemble(self, items: List[ContextItem]) -> str:
        """Assemble context within token budget, prioritizing high-priority items."""
        # Sort by priority (lower number = higher priority)
        sorted_items = sorted(items, key=lambda x: (x.priority, x.component))

        selected = []
        remaining_budget = self.available_tokens

        for item in sorted_items:
            if item.token_count <= remaining_budget:
                selected.append(item)
                remaining_budget -= item.token_count

        # Sort selected items by component for logical ordering
        component_order = {
            "system": 0,
            "metadata": 1,
            "tools": 2,
            "retrieved": 3,
            "history": 4,
            "input": 5
        }
        selected.sort(key=lambda x: component_order.get(x.component, 99))

        return "\n\n".join(item.content for item in selected)

    def estimate_budget(self, items: List[ContextItem]) -> dict:
        """Show budget allocation without actually assembling."""
        total_needed = sum(item.token_count for item in items)
        total_available = self.available_tokens

        return {
            "total_needed": total_needed,
            "total_available": total_available,
            "surplus": total_available - total_needed,
            "utilization": total_needed / total_available if total_available > 0 else 0,
            "items": [
                {
                    "component": item.component,
                    "priority": item.priority,
                    "tokens": item.token_count,
                    "within_budget": item.token_count <= total_available
                }
                for item in sorted(items, key=lambda x: x.priority)
            ]
        }
```

### Strategy 2: Hierarchical Summarization

When conversation history grows beyond what can fit in the context window, summarize older turns while preserving recent ones in full:

```python
class ConversationSummarizer:
    """Manages conversation history with hierarchical summarization."""

    def __init__(self, llm_client, recent_turns: int = 10, max_tokens: int = 4000):
        self.llm = llm_client
        self.recent_turns = recent_turns
        self.max_tokens = max_tokens

    async def process_history(self, messages: list) -> list:
        """Process conversation history, summarizing old turns and keeping recent ones."""
        if len(messages) <= self.recent_turns:
            return messages  # No summarization needed

        # Split into old (to summarize) and recent (to keep)
        old_messages = messages[:-self.recent_turns]
        recent_messages = messages[-self.recent_turns:]

        # Summarize old messages
        summary = await self._summarize(old_messages)

        # Build output: summary + recent turns
        return [
            {"role": "system", "content": f"Previous conversation summary:\n{summary}"},
            *recent_messages
        ]

    async def _summarize(self, messages: list) -> str:
        """Generate a structured summary of conversation history."""
        conversation = "\n".join(
            f"{msg['role']}: {msg['content']}" for msg in messages
        )

        response = await self.llm.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=self.max_tokens,
            messages=[{
                "role": "user",
                "content": f"""Summarize this conversation, preserving:
1. Key decisions made
2. Information provided by the user
3. Action items or next steps
4. Any errors or issues encountered

Conversation:
{conversation}

Provide a concise, structured summary:"""
            }]
        )
        return response.content[0].text
```

### Strategy 3: Sliding Window with Key-Value Memory

Extract important facts from each turn into a structured key-value store, then use the store to provide context without storing full conversation history:

```python
class KeyValueMemory:
    """Extracts and maintains key facts from conversation."""

    def __init__(self, llm_client):
        self.llm = llm_client
        self.facts: dict[str, str] = {}
        self.fact_history: list[tuple[str, str]] = []

    async def extract_facts(self, user_message: str, assistant_response: str) -> dict:
        """Extract key facts from a conversation turn."""
        response = await self.llm.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=500,
            messages=[{
                "role": "user",
                "content": f"""Extract key facts from this exchange. Return as JSON.
Only include facts worth remembering (user preferences, decisions, context).

User: {user_message}
Assistant: {assistant_response}

Return JSON like:
{{"facts": {{"key": "value"}}}}"""
            }]
        )

        import json
        try:
            extracted = json.loads(response.content[0].text)
            new_facts = extracted.get("facts", {})
            self.facts.update(new_facts)
            return new_facts
        except json.JSONDecodeError:
            return {}

    def get_context_string(self) -> str:
        """Format all stored facts as context."""
        if not self.facts:
            return ""
        lines = ["Known facts about this conversation:"]
        for key, value in self.facts.items():
            lines.append(f"- {key}: {value}")
        return "\n".join(lines)
```

---

## 2.4 Retrieval-Augmented Generation (RAG) Deep Dive

RAG is one of the most important context engineering techniques. It allows agents to access information beyond what fits in the context window.

### The RAG Spectrum

```
Naive RAG                    Advanced RAG                 Modular RAG
┌─────────────┐             ┌──────────────┐            ┌───────────────┐
│ Query       │             │ Query        │            │ Query         │
│     │       │             │ Transform    │            │ Classification│
│     ▼       │             │     │        │            │      │        │
│ Embed ──▶   │             │     ▼        │            │      ▼        │
│ Search      │             │ Embed ──▶    │            │ Route to      │
│     │       │             │ Search ──▶   │            │ specialized   │
│     ▼       │             │ Rerank ──▶   │            │ pipeline      │
│ Top-K       │             │ Context      │            │      │        │
│ Results     │             │ Assemble     │            │      ▼        │
│     │       │             │     │        │            │ Pipeline 1..N │
│     ▼       │             │     ▼        │            │      │        │
│ Concatenate │             │ Generate     │            │      ▼        │
│ and send    │             │ with quality │            │ Merge &       │
│ to LLM      │             │ checks       │            │ Generate      │
└─────────────┘             └──────────────┘            └───────────────┘
```

### Chunking Strategies

How you split documents into chunks dramatically affects retrieval quality:

| Strategy | How It Works | Best For | Drawback |
|---|---|---|---|
| Fixed-size | Split every N characters | Simple documents | Breaks mid-sentence or mid-paragraph |
| Recursive | Split by separators (paragraph, sentence, word) | General use | Requires tuning separator order |
| Semantic | Split at topic boundaries using embeddings | Cohesive documents | Computationally expensive |
| Document-aware | Use document structure (headers, sections) | Structured docs | Requires document parsing |
| Agentic | Use LLM to decide chunk boundaries | High-value documents | Slow and expensive |

### Building a Sophisticated RAG Pipeline

```python
from typing import List, Optional
from dataclasses import dataclass
import numpy as np

@dataclass
class Chunk:
    content: str
    metadata: dict
    embedding: Optional[List[float]] = None
    relevance_score: float = 0.0


class RAGPipeline:
    """Advanced RAG with query transformation, reranking, and context assembly."""

    def __init__(self, llm_client, embedding_model, vector_store, reranker):
        self.llm = llm_client
        self.embedder = embedding_model
        self.vector_store = vector_store
        self.reranker = reranker

    async def retrieve(
        self,
        query: str,
        top_k: int = 10,
        rerank_top_n: int = 5,
        max_tokens: int = 8000
    ) -> str:
        """Full RAG pipeline: transform → retrieve → rerank → assemble."""

        # Step 1: Query transformation
        transformed_queries = await self._transform_query(query)

        # Step 2: Multi-query retrieval
        all_chunks = []
        for q in transformed_queries:
            chunks = await self.vector_store.search(
                query_embedding=self.embedder.embed(q),
                top_k=top_k
            )
            all_chunks.extend(chunks)

        # Step 3: Deduplicate
        unique_chunks = self._deduplicate(all_chunks)

        # Step 4: Rerank
        reranked = await self.reranker.rerank(
            query=query,
            chunks=unique_chunks,
            top_n=rerank_top_n
        )

        # Step 5: Context assembly within token budget
        context = self._assemble_context(reranked, max_tokens)

        return context

    async def _transform_query(self, query: str) -> List[str]:
        """Generate multiple query variations for better retrieval."""
        response = await self.llm.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=500,
            messages=[{
                "role": "user",
                "content": f"""Generate 3 alternative search queries for:
"{query}"

Each should capture a different aspect. Return as JSON list:
["query1", "query2", "query3"]"""
            }]
        )

        import json
        try:
            return [query] + json.loads(response.content[0].text)
        except (json.JSONDecodeError, IndexError):
            return [query]

    def _deduplicate(self, chunks: List[Chunk]) -> List[Chunk]:
        """Remove duplicate chunks based on content similarity."""
        seen = set()
        unique = []
        for chunk in chunks:
            content_hash = hash(chunk.content[:200])
            if content_hash not in seen:
                seen.add(content_hash)
                unique.append(chunk)
        return unique

    def _assemble_context(
        self,
        chunks: List[Chunk],
        max_tokens: int
    ) -> str:
        """Assemble chunks into context within token budget."""
        context_parts = []
        current_tokens = 0

        for chunk in chunks:
            chunk_tokens = self._estimate_tokens(chunk.content)
            if current_tokens + chunk_tokens <= max_tokens:
                context_parts.append(
                    f"[Source: {chunk.metadata.get('source', 'unknown')}]\n"
                    f"{chunk.content}"
                )
                current_tokens += chunk_tokens
            else:
                break

        return "\n\n---\n\n".join(context_parts)

    def _estimate_tokens(self, text: str) -> int:
        """Rough token count estimate (4 chars per token)."""
        return len(text) // 4
```

### Query Transformation Techniques

Advanced RAG systems transform queries to improve retrieval quality:

| Technique | How It Works | When to Use |
|---|---|---|
| HyDE | Generate a hypothetical answer, then search for it | When queries are vague or abstract |
| Multi-query | Generate multiple query variations | When the answer could be described many ways |
| Step-back prompting | Ask a more general question first | When the specific question is too narrow |
| Query decomposition | Break complex queries into sub-queries | When the question has multiple parts |

---

## 2.5 Context Optimization Techniques

Once you can assemble context, the next challenge is optimizing it — getting the same (or better) results with less context, reducing cost and latency.

### Prompt Compression

Large language models can compress prompts themselves. Techniques like LLMLingua use a small model to identify and remove low-information tokens:

```python
class ContextCompressor:
    """Compress context while preserving essential information."""

    def __init__(self, llm_client):
        self.llm = llm_client

    async def compress(
        self,
        context: str,
        target_ratio: float = 0.5,
        preserve_instructions: bool = True
    ) -> str:
        """Compress context to target_ratio of original size."""
        response = await self.llm.messages.create(
            model="claude-haiku-4-20250414",  # Use a fast, cheap model
            max_tokens=4096,
            messages=[{
                "role": "user",
                "content": f"""Compress this context to approximately {target_ratio * 100}% of its original size.
Preserve all factual information, data points, and key details.
Remove redundancies, filler, and low-information text.
{"Keep all instructions and constraints intact." if preserve_instructions else ""}

Original context:
{context}

Compressed context:"""
            }]
        )
        return response.content[0].text


class StructuredContextEncoder:
    """Encode information in token-efficient formats."""

    @staticmethod
    def encode_user_profile(profile: dict) -> str:
        """Encode user profile in a compact format."""
        lines = []
        for key, value in profile.items():
            if isinstance(value, list):
                lines.append(f"{key}: {', '.join(str(v) for v in value)}")
            elif isinstance(value, dict):
                for k, v in value.items():
                    lines.append(f"{key}.{k}: {v}")
            else:
                lines.append(f"{key}: {value}")
        return "User Profile:\n" + "\n".join(lines)

    @staticmethod
    def encode_tool_results(results: list) -> str:
        """Encode tool results in a compact format."""
        parts = []
        for i, result in enumerate(results, 1):
            parts.append(f"[Tool {i}: {result['tool_name']}]\n{result['output']}")
        return "\n\n".join(parts)
```

### Context Caching and Reuse

Many parts of the context don't change between requests. Caching these avoids redundant processing:

```python
class ContextCache:
    """Cache frequently reused context components."""

    def __init__(self):
        self.system_prompt_cache = None
        self.tool_definitions_cache = None
        self.user_profiles_cache = {}

    def get_system_context(self, agent_type: str) -> str:
        """Get cached system prompt for an agent type."""
        if self.system_prompt_cache is None:
            self.system_prompt_cache = self._load_system_prompts()
        return self.system_prompt_cache.get(agent_type, "")

    def get_tool_definitions(self, tool_set: str) -> str:
        """Get cached tool definitions."""
        if self.tool_definitions_cache is None:
            self.tool_definitions_cache = self._load_tool_definitions()
        return self.tool_definitions_cache.get(tool_set, "")

    def get_user_context(self, user_id: str) -> str:
        """Get or compute cached user context."""
        if user_id not in self.user_profiles_cache:
            self.user_profiles_cache[user_id] = self._load_user_profile(user_id)
        return self.user_profiles_cache[user_id]

    def invalidate_user(self, user_id: str):
        """Invalidate cache for a specific user."""
        self.user_profiles_cache.pop(user_id, None)
```

### Structured vs. Natural Language Context

The format of context matters. Different formats have different tradeoffs:

| Format | Token Efficiency | Readability | Parsing Ease | Use When |
|---|---|---|---|---|
| JSON | Medium | Low | High | Structured data, tool outputs |
| XML | Low | Medium | High | Hierarchical data, mixed content |
| Natural Language | Low | High | Low | Descriptions, instructions |
| Markdown | Medium | High | Medium | Documentation, mixed content |
| YAML | High | Medium | High | Configuration, key-value data |
| Tables | High | Medium | Medium | Comparative data, summaries |

### The "Lost in the Middle" Problem

Research has shown that LLMs pay more attention to information at the beginning and end of their context, and less to information in the middle. This "lost in the middle" effect has practical implications:

```
Attention Distribution Across Context Position:

High   │ ████                                              ████
       │ █████                                          █████
       │ ██████                                        ██████
       │ ███████                                      ███████
       │ ████████                                    ████████
       │ █████████                                  █████████
       │ ██████████                              ██████████
Low    │ ███████████ █████████████████████████████████████████
       └─────────────────────────────────────────────────────
        Start                                    End
        (Position 0)                        (Position N)
```

**Mitigation strategies:**

1. **Place critical information at the beginning and end** of the context
2. **Repeat key instructions** in both system prompt and at the end of retrieved context
3. **Use explicit markers** (`IMPORTANT:`, `NOTE:`, `MUST FOLLOW:`) to draw attention
4. **Structure context hierarchically** so the most important information is always in prominent positions
5. **Summarize middle sections** rather than leaving them as raw data

---

## 2.6 Context in Multi-Turn Conversations

Managing context across multiple conversation turns is one of the most challenging aspects of context engineering. The context grows with each turn, and the strategies for managing it become increasingly important.

### The Growing Context Problem

```
Turn 1:   [System | Input]                    → ~2K tokens
Turn 2:   [System | Input | Response | Input] → ~4K tokens
Turn 3:   [System | Input | Response | Input | Response | Input] → ~6K tokens
Turn 10:  [System | ...40 messages...]         → ~20K tokens
Turn 50:  [System | ...200 messages...]        → ~100K tokens
Turn 100: [System | ...400 messages...]        → ~200K tokens  ← EXCEEDS LIMIT
```

### Conversation Management Strategies

```python
class ConversationManager:
    """Manages multi-turn conversations with various context strategies."""

    def __init__(self, llm_client, strategy: str = "sliding_window"):
        self.llm = llm_client
        self.strategy = strategy
        self.messages: list = []
        self.summaries: list = []
        self.kv_memory = KeyValueMemory(llm_client)

    async def add_turn(self, user_input: str, assistant_response: str):
        """Add a turn to the conversation."""
        self.messages.append({"role": "user", "content": user_input})
        self.messages.append({"role": "assistant", "content": assistant_response})

        # Extract facts for long-term memory
        await self.kv_memory.extract_facts(user_input, assistant_response)

        # Apply context management strategy
        await self._manage_context()

    async def _manage_context(self):
        """Apply the configured context management strategy."""
        if self.strategy == "sliding_window":
            await self._sliding_window()
        elif self.strategy == "summarization":
            await self._summarize_old()
        elif self.strategy == "hybrid":
            await self._hybrid_management()

    async def _sliding_window(self, max_messages: int = 20):
        """Keep only the most recent messages."""
        if len(self.messages) > max_messages:
            self.messages = self.messages[-max_messages:]

    async def _summarize_old(self, keep_recent: int = 10):
        """Summarize old messages, keeping recent ones in full."""
        if len(self.messages) <= keep_recent * 2:
            return

        old = self.messages[:-keep_recent * 2]
        recent = self.messages[-keep_recent * 2:]

        summary = await self._generate_summary(old)
        self.summaries.append(summary)

        self.messages = [
            {"role": "system", "content": f"Conversation history:\n{summary}"},
            *recent
        ]

    async def _hybrid_management(self):
        """Combine sliding window with key-value memory."""
        # Keep recent messages in full
        if len(self.messages) > 20:
            self.messages = self.messages[-20:]

        # Add key-value memory as context
        kv_context = self.kv_memory.get_context_string()
        if kv_context:
            # Prepend as system context
            self.messages.insert(0, {
                "role": "system",
                "content": kv_context
            })

    async def _generate_summary(self, messages: list) -> str:
        """Generate a summary of old messages."""
        conversation = "\n".join(
            f"{m['role']}: {m['content']}" for m in messages
        )

        response = await self.llm.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1000,
            messages=[{
                "role": "user",
                "content": f"Summarize this conversation concisely:\n\n{conversation}"
            }]
        )
        return response.content[0].text

    def get_context(self) -> list:
        """Get the current context for the next LLM call."""
        return self.messages.copy()
```

### When to Start a New Conversation

Sometimes the best context management strategy is to start fresh. Consider starting a new conversation when:

- The topic has fundamentally changed
- The accumulated context is confusing the model
- The user explicitly starts a new topic
- The conversation has exceeded a token threshold with degraded quality
- Error rates increase, suggesting context-related confusion

---

## 2.7 Measuring Context Quality

Context quality directly determines agent performance. Without measurement, you cannot improve.

### The Context Quality Framework

```
                    Context Quality Dimensions
                    
    ┌─────────────────────────────────────────┐
    │                                         │
    │  RELEVANCE          SUFFICIENCY        │
    │  "Is the info       "Is there enough   │
    │   relevant?"         information?"      │
    │                                         │
    │  ───────────── QUALITY ──────────────── │
    │                                         │
    │  CONCISENESS        ACCURACY           │
    │  "Is it free of     "Is the info       │
    │   unnecessary info?"  correct?"         │
    │                                         │
    └─────────────────────────────────────────┘
```

### Measuring Context Impact

```python
class ContextEvaluator:
    """Evaluates context quality and its impact on agent performance."""

    def __init__(self, llm_client):
        self.llm = llm_client

    async def evaluate_relevance(
        self,
        context: str,
        query: str
    ) -> float:
        """Score how relevant the context is to the query (0-1)."""
        response = await self.llm.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=100,
            messages=[{
                "role": "user",
                "content": f"""Rate the relevance of this context to the query.
Score from 0 (completely irrelevant) to 1 (perfectly relevant).

Query: {query}
Context: {context[:2000]}

Score (0-1):"""
            }]
        )

        try:
            return float(response.content[0].text.strip())
        except ValueError:
            return 0.0

    async def evaluate_sufficiency(
        self,
        context: str,
        query: str
    ) -> dict:
        """Evaluate if context contains enough information to answer the query."""
        response = await self.llm.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=300,
            messages=[{
                "role": "user",
                "content": f"""Analyze if this context provides enough information to answer the query.

Query: {query}
Context: {context[:2000]}

Return JSON:
{{
  "sufficient": true/false,
  "missing_information": ["list of missing pieces"],
  "confidence": 0.0-1.0
}}"""
            }]
        )

        import json
        try:
            return json.loads(response.content[0].text)
        except json.JSONDecodeError:
            return {"sufficient": False, "missing_information": [], "confidence": 0.0}

    def measure_ab_impact(
        self,
        results_a: list,
        results_b: list,
        metric: str = "quality_score"
    ) -> dict:
        """Compare two context strategies using A/B testing."""
        scores_a = [r[metric] for r in results_a]
        scores_b = [r[metric] for r in results_b]

        import statistics

        mean_a = statistics.mean(scores_a)
        mean_b = statistics.mean(scores_b)

        return {
            "strategy_a": {
                "mean": mean_a,
                "std": statistics.stdev(scores_a) if len(scores_a) > 1 else 0,
                "n": len(scores_a)
            },
            "strategy_b": {
                "mean": mean_b,
                "std": statistics.stdev(scores_b) if len(scores_b) > 1 else 0,
                "n": len(scores_b)
            },
            "difference": mean_b - mean_a,
            "improvement_pct": ((mean_b - mean_a) / mean_a * 100) if mean_a > 0 else 0
        }
```

### The Cost-Quality-Latency Tradeoff

Every context engineering decision involves a three-way tradeoff:

```
                        QUALITY
                          ▲
                         /│\
                        / │ \
                       /  │  \
                      /   │   \
                     /    │    \
                    /     │     \
                   /  BEST│ZONE  \
                  /       │       \
                 /        │        \
                └─────────┼─────────┘
           COST ◄─────────┴────────► LATENCY
```

| Strategy | Quality | Cost | Latency |
|---|---|---|---|
| Full context (no optimization) | High | High | High |
| Aggressive compression | Medium | Low | Low |
| RAG with reranking | High | Medium | Medium |
| Cached context | High | Low | Low |
| Summarized history | Medium-High | Medium | Medium |
| Key-value memory | Medium | Low | Low |

The optimal strategy depends on your specific requirements. A customer-facing chatbot might prioritize quality and latency over cost. An internal analysis tool might prioritize cost over latency.

---

## Summary

Context Engineering is the foundation upon which all other agent engineering practices are built. In this chapter, we covered:

- **Context Engineering** is the systematic design and management of all information an LLM receives — it supersedes prompt engineering as the core skill
- **The anatomy of context** includes six components: system instructions, structured metadata, tool definitions, retrieved context, conversation history, and user input — each requiring distinct management strategies
- **Context window management** requires proactive strategies: priority-based truncation, hierarchical summarization, and sliding windows with key-value memory
- **RAG** is the primary technique for providing models with information beyond the context window, with naive, advanced, and modular approaches depending on requirements
- **Context optimization** through compression, caching, and structured encoding can dramatically reduce cost and latency without sacrificing quality
- **Multi-turn conversation management** requires strategies that balance coherence with efficiency
- **Measuring context quality** through relevance, sufficiency, and A/B testing ensures continuous improvement

The key insight of this chapter is that **context is not a passive container — it is an engineered artifact.** Every piece of information in the context window is there because you chose to include it, and that choice directly determines the quality of the model's output.

With context engineering mastered, we can turn to the next layer of the agent engineering stack: building reliable harnesses — the execution environments that wrap LLM calls with tool use, error handling, and control flow.

> **Looking ahead:** Chapter 3 will cover harness engineering — building reliable execution environments for LLM calls. You'll learn how to structure tool use, handle errors gracefully, implement retries with backoff, and build production-grade wrappers that make LLM calls as reliable as any other API call in your stack.

*Next: [Chapter 3 — Harness Engineering](chapter-03-harness-engineering.md)*
