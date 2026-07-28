# Chapter 8: Memory Taxonomy for Agents

> "The real art of conversation is not only to say the right thing at the right time, but also to leave unsaid the wrong thing at the tempting moment." — Dorothy Nevill

---

## 8.1 Why Agents Need Memory

### LLMs are Stateless — Memory is the Bridge Between Calls

At their core, large language models are stateless functions. Each API call receives a prompt and returns a completion — the model retains nothing from previous interactions. Without memory, an agent is like Goldfish: each conversation starts from zero, learning nothing from the last.

```
Stateless LLM (No Memory):
═══════════════════════════

  Request 1: "My name is Alice"  ──▶  "Nice to meet you, Alice!"
  Request 2: "What's my name?"   ──▶  "I don't have that information."

  The model has forgotten "Alice" between calls.


Memory-Augmented Agent:
═══════════════════════

  Request 1: "My name is Alice"
       │
       ▼
  ┌────────────┐     ┌────────────────┐
  │   LLM      │────▶│  Memory Store   │
  │  (stateless)│     │  {name: Alice}  │
  └────────────┘     └────────────────┘
       │
       ▼
  Response: "Nice to meet you, Alice!"

  Request 2: "What's my name?"
       │
       ▼
  ┌────────────┐     ┌────────────────┐
  │   LLM      │◀────│  Memory Store   │
  │            │     │  {name: Alice}  │
  └────────────┘     └────────────────┘
       │
       ▼
  Response: "Your name is Alice."
```

Memory transforms an LLM from a stateless text generator into a persistent, context-aware agent.

### Types of Knowledge Agents Must Retain

Agents must retain multiple types of knowledge:

- **Conversational context**: What was said earlier in the current interaction
- **User preferences**: How this user likes to work, their history, their preferences
- **Task state**: Where the agent is in a multi-step process
- **Domain knowledge**: Facts and relationships relevant to the agent's domain
- **Learned procedures**: How to accomplish tasks, refined through experience
- **Past outcomes**: What worked and what failed in previous attempts

### Memory vs Context vs Knowledge: Precise Definitions

| Term | Definition | Scope | Persistence | Example |
|---|---|---|---|---|
| **Context** | Information currently visible to the LLM | Single request | Ephemeral | System prompt + conversation messages |
| **Memory** | Stored information the agent can recall | Across requests | Durable | User preferences, past interactions |
| **Knowledge** | Structured facts about the world | Domain-wide | Semi-permanent | Product catalog, company policies |
| **Working State** | Current task's intermediate results | Single task | Task-scoped | Progress of a multi-step workflow |

### The Memory-Augmented Agent Architecture

```
┌──────────────────────────────────────────────────────────┐
│                  Memory-Augmented Agent                   │
│                                                          │
│  ┌──────────┐   ┌──────────┐   ┌──────────────────────┐│
│  │          │   │          │   │  Memory Manager       ││
│  │   LLM    │◀─▶│  Context  │◀─▶│                      ││
│  │ (stateless)│  │  Builder  │   │  ┌────────────────┐ ││
│  │          │   │          │   │  │ Short-Term      │ ││
│  └──────────┘   └──────────┘   │  │ (conversation)  │ ││
│                                │  ├────────────────┤ ││
│                                │  │ Long-Term       │ ││
│                                │  │ (vector store)  │ ││
│                                │  ├────────────────┤ ││
│                                │  │ Episodic        │ ││
│                                │  │ (past events)   │ ││
│                                │  ├────────────────┤ ││
│                                │  │ Semantic        │ ││
│                                │  │ (knowledge)     │ ││
│                                │  ├────────────────┤ ││
│                                │  │ Procedural      │ ││
│                                │  │ (skills)        │ ││
│                                │  └────────────────┘ ││
│                                └──────────────────────┘│
└──────────────────────────────────────────────────────────┘
```

---

## 8.2 Memory Taxonomy

The taxonomy below organizes agent memory by purpose, retention, capacity, and access pattern.

### Complete Taxonomy Table

| Memory Type | Purpose | Retention | Capacity | Access Pattern | Analog |
|---|---|---|---|---|---|
| **Short-Term** | Conversation context | Session (minutes-hours) | ~100K tokens | Sequential (FIFO) | Working memory |
| **Long-Term** | Persistent facts about users/world | Permanent | Unlimited | Retrieval (similarity) | Long-term memory |
| **Episodic** | Past experiences and outcomes | Long-term | Unlimited | Similarity + temporal | Autobiographical memory |
| **Semantic** | Structured knowledge and facts | Semi-permanent | Unlimited | Query (graph/lookup) | Encyclopedia |
| **Procedural** | Learned skills and how-tos | Long-term | Unlimited | Pattern matching | Muscle memory |

### Memory Type Characteristics

```
                    Memory Taxonomy — Access Speed vs Capacity

  Fast Access ─┐
               │
   Short-Term  │  ●  (Fast, small capacity)
               │
   Procedural  │     ●  (Fast pattern match, medium capacity)
               │
   Semantic    │        ●  (Indexed queries, large capacity)
               │
   Episodic    │           ●  (Similarity search, large capacity)
               │
   Long-Term   │              ●  (Vector search, unlimited capacity)
               │
  Slow Access ─┘
               ──────────────────────────────────────────▶
               Small                                 Large
                          Capacity
```

---

## 8.3 Short-Term Memory

Short-term memory is the most immediate and most constrained. It holds the current conversation's context within the LLM's context window.

### Conversation Buffer Management

```python
from dataclasses import dataclass, field
from typing import Any
import tiktoken
import hashlib


@dataclass
class Message:
    role: str  # "system", "user", "assistant", "tool"
    content: str
    metadata: dict[str, Any] = field(default_factory=dict)
    token_count: int = 0

    def __post_init__(self):
        if self.token_count == 0:
            self.token_count = self._estimate_tokens()

    def _estimate_tokens(self) -> int:
        """Estimate token count (rough approximation)."""
        return len(self.content.split()) * 4 // 3


class ConversationBuffer:
    """Intelligent conversation buffer with multiple truncation strategies."""

    def __init__(
        self,
        max_tokens: int = 8_000,
        strategy: str = "sliding_window",
        preserve_system: bool = True,
        preserve_last_n: int = 4,
    ):
        self.max_tokens = max_tokens
        self.strategy = strategy
        self.preserve_system = preserve_system
        self.preserve_last_n = preserve_last_n
        self.messages: list[Message] = []
        self._total_tokens = 0
        self._summary: str | None = None

    def add(self, message: Message) -> None:
        """Add a message to the buffer, applying truncation as needed."""
        self.messages.append(message)
        self._total_tokens += message.token_count
        self._enforce_limit()

    def _enforce_limit(self) -> None:
        """Enforce the token limit using the configured strategy."""
        if self._total_tokens <= self.max_tokens:
            return

        if self.strategy == "sliding_window":
            self._truncate_sliding_window()
        elif self.strategy == "summarization":
            self._truncate_by_summarization()
        elif self.strategy == "importance":
            self._truncate_by_importance()
        else:
            self._truncate_sliding_window()

    def _truncate_sliding_window(self) -> None:
        """Remove oldest messages, preserving system prompt and recent messages."""
        # Identify which messages must be preserved
        preserved_indices: set[int] = set()

        # Preserve system messages
        if self.preserve_system:
            for i, msg in enumerate(self.messages):
                if msg.role == "system":
                    preserved_indices.add(i)

        # Preserve the last N messages
        start_preserve = max(0, len(self.messages) - self.preserve_last_n)
        for i in range(start_preserve, len(self.messages)):
            preserved_indices.add(i)

        # Remove oldest non-preserved messages until within limit
        while self._total_tokens > self.max_tokens and self.messages:
            removed = False
            for i, msg in enumerate(self.messages):
                if i not in preserved_indices:
                    self.messages.pop(i)
                    self._total_tokens -= msg.token_count
                    removed = True
                    break
            if not removed:
                break  # All remaining messages are preserved

    def _truncate_by_summarization(self) -> None:
        """Summarize older messages to fit within the token limit."""
        # Keep system messages and last N messages intact
        system_msgs = [m for m in self.messages if m.role == "system"]
        preserved = self.messages[-self.preserve_last_n:] if self.preserve_last_n else []
        to_summarize = [
            m for m in self.messages
            if m.role != "system" and m not in preserved
        ]

        if not to_summarize:
            return

        # Create a summary of old messages
        conversation_text = "\n".join(
            f"{m.role}: {m.content[:200]}" for m in to_summarize
        )
        summary = (
            f"[Previous conversation summary: {len(to_summarize)} messages. "
            f"Key points: {conversation_text[:500]}...]"
        )

        self._summary = summary
        summary_msg = Message(
            role="system",
            content=f"Summary of earlier conversation:\n{summary}",
        )

        self.messages = system_msgs + [summary_msg] + preserved
        self._total_tokens = sum(m.token_count for m in self.messages)

    def _truncate_by_importance(self) -> None:
        """Remove messages with lowest importance scores."""
        # Score messages by importance (heuristic)
        scored: list[tuple[int, float]] = []
        for i, msg in enumerate(self.messages):
            if msg.role == "system":
                score = float("inf")  # Never remove system messages
            elif msg.role == "tool":
                score = 0.5  # Tool results are somewhat important
            elif msg.content and len(msg.content) > 100:
                score = 0.8  # Longer messages are likely more substantive
            elif "?" in msg.content:
                score = 0.9  # Questions are important context
            else:
                score = 0.3
            scored.append((i, score))

        # Sort by importance (ascending), remove least important first
        scored.sort(key=lambda x: x[1])

        for idx, _ in scored:
            if self._total_tokens <= self.max_tokens:
                break
            if idx < len(self.messages) and self.messages[idx].role != "system":
                removed = self.messages.pop(idx)
                self._total_tokens -= removed.token_count

    def get_messages(self) -> list[Message]:
        """Return the current buffer contents."""
        return list(self.messages)

    def get_token_usage(self) -> dict[str, Any]:
        """Report current token usage."""
        return {
            "total_tokens": self._total_tokens,
            "max_tokens": self.max_tokens,
            "utilization": self._total_tokens / self.max_tokens,
            "message_count": len(self.messages),
            "has_summary": self._summary is not None,
        }
```

### Working Memory for Multi-Step Reasoning

```python
from dataclasses import dataclass, field
from typing import Any
from enum import Enum


class StepStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    SKIPPED = "skipped"


@dataclass
class ReasoningStep:
    step_id: str
    description: str
    status: StepStatus = StepStatus.PENDING
    inputs: dict[str, Any] = field(default_factory=dict)
    outputs: dict[str, Any] = field(default_factory=dict)
    reasoning: str = ""
    error: str | None = None


class WorkingMemory:
    """
    Manages intermediate state during multi-step reasoning.
    Think of it as the agent's scratchpad — holding variables,
    intermediate results, and the current plan.
    """

    def __init__(self):
        self.plan: list[ReasoningStep] = []
        self.current_step_index: int = 0
        self.variables: dict[str, Any] = {}  # Named intermediate results
        self.hypotheses: list[str] = []  # Agent's current hypotheses
        self.constraints: list[str] = []  # Known constraints
        self.goal: str = ""

    def set_goal(self, goal: str) -> None:
        self.goal = goal
        self.variables["goal"] = goal

    def add_step(self, description: str) -> ReasoningStep:
        """Add a new step to the plan."""
        step = ReasoningStep(
            step_id=f"step_{len(self.plan) + 1}",
            description=description,
        )
        self.plan.append(step)
        return step

    def current_step(self) -> ReasoningStep | None:
        if self.current_step_index < len(self.plan):
            return self.plan[self.current_step_index]
        return None

    def advance(self) -> bool:
        """Move to the next step. Returns False if plan is complete."""
        if self.current_step_index < len(self.plan):
            self.current_step_index += 1
            return True
        return False

    def set_variable(self, name: str, value: Any) -> None:
        self.variables[name] = value

    def get_variable(self, name: str, default: Any = None) -> Any:
        return self.variables.get(name, default)

    def to_prompt_context(self) -> str:
        """Serialize working memory into a prompt-friendly format."""
        lines = [
            f"## Goal\n{self.goal}\n",
            "## Plan",
        ]

        for i, step in enumerate(self.plan):
            marker = "▶" if i == self.current_step_index else " "
            status_icon = {
                StepStatus.PENDING: "○",
                StepStatus.IN_PROGRESS: "◐",
                StepStatus.COMPLETED: "●",
                StepStatus.FAILED: "✗",
                StepStatus.SKIP: "○",
            }.get(step.status, "?")
            lines.append(f"{marker} [{status_icon}] Step {step.step_id}: {step.description}")
            if step.outputs:
                for key, val in step.outputs.items():
                    lines.append(f"       {key} = {val}")

        if self.variables:
            lines.append("\n## Variables")
            for key, val in self.variables.items():
                if key != "goal":
                    lines.append(f"  {key} = {val}")

        if self.constraints:
            lines.append("\n## Constraints")
            for c in self.constraints:
                lines.append(f"  - {c}")

        if self.hypotheses:
            lines.append("\n## Hypotheses")
            for h in self.hypotheses:
                lines.append(f"  - {h}")

        return "\n".join(lines)
```

---

## 8.4 Long-Term Memory

Long-term memory persists information across sessions. It typically uses vector embeddings for similarity-based retrieval, but can also employ key-value stores, relational databases, and graph databases for structured queries.

```python
import json
import time
import hashlib
from dataclasses import dataclass, field
from typing import Any, Protocol


class EmbeddingProvider(Protocol):
    async def embed(self, text: str) -> list[float]: ...


class VectorStore(Protocol):
    async def upsert(self, id: str, vector: list[float], metadata: dict[str, Any]) -> None: ...
    async def search(self, vector: list[float], top_k: int) -> list[dict[str, Any]]: ...
    async def delete(self, id: str) -> None: ...


@dataclass
class MemoryEntry:
    """A single piece of long-term memory."""
    id: str
    content: str
    embedding: list[float] = field(default_factory=list)
    metadata: dict[str, Any] = field(default_factory=dict)
    source: str = ""  # Where this memory came from
    confidence: float = 1.0  # How confident we are in this memory
    created_at: float = field(default_factory=time.time)
    last_accessed: float = field(default_factory=time.time)
    access_count: int = 0
    ttl: float | None = None  # Time-to-live in seconds (None = permanent)

    def is_expired(self) -> bool:
        if self.ttl is None:
            return False
        return (time.time() - self.created_at) > self.ttl

    def access(self) -> None:
        """Record an access to this memory."""
        self.last_accessed = time.time()
        self.access_count += 1


class LongTermMemory:
    """
    Long-term memory with multiple storage backends.
    Provides semantic search via embeddings and structured queries.
    """

    def __init__(
        self,
        embedding_provider: EmbeddingProvider,
        vector_store: VectorStore,
        namespace: str = "default",
    ):
        self.embedding_provider = embedding_provider
        self.vector_store = vector_store
        self.namespace = namespace
        self._local_cache: dict[str, MemoryEntry] = {}

    async def store(
        self,
        content: str,
        metadata: dict[str, Any] | None = None,
        confidence: float = 1.0,
        ttl: float | None = None,
        source: str = "",
    ) -> str:
        """Store a new memory with embedding."""
        memory_id = hashlib.sha256(
            f"{self.namespace}:{content}:{time.time()}".encode()
        ).hexdigest()[:16]

        embedding = await self.embedding_provider.embed(content)

        entry = MemoryEntry(
            id=memory_id,
            content=content,
            embedding=embedding,
            metadata=metadata or {},
            source=source,
            confidence=confidence,
            ttl=ttl,
        )

        await self.vector_store.upsert(
            id=f"{self.namespace}::{memory_id}",
            vector=embedding,
            metadata={
                "content": content,
                "source": source,
                "confidence": confidence,
                "created_at": entry.created_at,
                **(metadata or {}),
            },
        )

        self._local_cache[memory_id] = entry
        return memory_id

    async def recall(
        self,
        query: str,
        top_k: int = 5,
        min_confidence: float = 0.5,
        include_expired: bool = False,
    ) -> list[MemoryEntry]:
        """Retrieve memories similar to the query."""
        query_embedding = await self.embedding_provider.embed(query)

        results = await self.vector_store.search(
            vector=query_embedding,
            top_k=top_k * 2,  # Fetch extra to filter
        )

        entries = []
        for result in results:
            content = result.get("metadata", {}).get("content", "")
            confidence = result.get("metadata", {}).get("confidence", 1.0)

            if confidence < min_confidence:
                continue

            entry = MemoryEntry(
                id=result["id"].split("::")[-1],
                content=content,
                embedding=[],
                metadata=result.get("metadata", {}),
                source=result.get("metadata", {}).get("source", ""),
                confidence=confidence,
                created_at=result.get("metadata", {}).get("created_at", 0),
            )

            if not include_expired and entry.is_expired():
                continue

            entry.access()
            entries.append(entry)

            if len(entries) >= top_k:
                break

        return entries

    async def forget(self, memory_id: str) -> bool:
        """Remove a memory by ID."""
        full_id = f"{self.namespace}::{memory_id}"
        await self.vector_store.delete(full_id)
        self._local_cache.pop(memory_id, None)
        return True

    async def update(
        self,
        memory_id: str,
        content: str | None = None,
        metadata: dict[str, Any] | None = None,
        confidence: float | None = None,
    ) -> None:
        """Update an existing memory entry."""
        entry = self._local_cache.get(memory_id)
        if not entry:
            raise ValueError(f"Memory {memory_id} not found in local cache")

        if content is not None:
            entry.content = content
            entry.embedding = await self.embedding_provider.embed(content)
        if metadata is not None:
            entry.metadata.update(metadata)
        if confidence is not None:
            entry.confidence = confidence

        # Re-index in vector store
        await self.vector_store.upsert(
            id=f"{self.namespace}::{memory_id}",
            vector=entry.embedding,
            metadata={
                "content": entry.content,
                "source": entry.source,
                "confidence": entry.confidence,
                "created_at": entry.created_at,
                **entry.metadata,
            },
        )
```

---

## 8.5 Episodic Memory

Episodic memory stores specific past experiences — what happened, when it happened, and what the outcome was. This allows agents to learn from their own history.

### Design Principles for Episodic Memory

1. **Store complete episodes, not just facts**: Include the full context — what the user asked, what the agent did, and what happened.
2. **Tag episodes with metadata**: Outcome (success/failure), domain, entities involved, and timestamps.
3. **Support temporal queries**: "What happened last week?" or "What did I try after the API failure?"
4. **Enable similarity retrieval**: Find past episodes similar to the current situation.
5. **Track outcomes**: Distinguish between successful and failed episodes for learning.

```python
import time
import uuid
from dataclasses import dataclass, field
from typing import Any
from enum import Enum


class EpisodeOutcome(str, Enum):
    SUCCESS = "success"
    FAILURE = "failure"
    PARTIAL = "partial"
    UNKNOWN = "unknown"


@dataclass
class Episode:
    """A complete episodic memory — a specific past experience."""
    id: str = field(default_factory=lambda: str(uuid.uuid4())[:12])
    summary: str = ""
    full_context: dict[str, Any] = field(default_factory=dict)

    # What happened
    actions_taken: list[dict[str, Any]] = field(default_factory=list)

    # Outcome
    outcome: EpisodeOutcome = EpisodeOutcome.UNKNOWN
    outcome_details: str = ""

    # Metadata
    domain: str = ""
    entities: list[str] = field(default_factory=list)
    tags: list[str] = field(default_factory=list)

    # Timestamps
    started_at: float = field(default_factory=time.time)
    completed_at: float = 0.0
    duration_seconds: float = 0.0

    # Learning signals
    what_worked: list[str] = field(default_factory=list)
    what_failed: list[str] = field(default_factory=list)
    lessons_learned: list[str] = field(default_factory=list)


class EpisodicMemoryStore:
    """
    Stores and retrieves past episodes for learning from experience.
    Uses both temporal indexing and semantic similarity.
    """

    def __init__(self, vector_store: Any, embedding_provider: Any):
        self.vector_store = vector_store
        self.embedding_provider = embedding_provider
        self._episodes: dict[str, Episode] = {}

    async def record_episode(
        self,
        summary: str,
        context: dict[str, Any],
        actions: list[dict[str, Any]],
        outcome: EpisodeOutcome,
        domain: str = "",
        entities: list[str] | None = None,
        what_worked: list[str] | None = None,
        what_failed: list[str] | None = None,
        lessons: list[str] | None = None,
    ) -> Episode:
        """Record a new episode after completing a task."""
        now = time.time()
        episode = Episode(
            summary=summary,
            full_context=context,
            actions_taken=actions,
            outcome=outcome,
            domain=domain,
            entities=entities or [],
            completed_at=now,
            duration_seconds=now - context.get("start_time", now),
            what_worked=what_worked or [],
            what_failed=what_failed or [],
            lessons_learned=lessons or [],
        )

        # Create searchable text from the episode
        searchable_text = f"""
Summary: {summary}
Domain: {domain}
Actions: {', '.join(a.get('description', '') for a in actions)}
Outcome: {outcome.value}
Lessons: {', '.join(lessons or [])}
"""

        embedding = await self.embedding_provider.embed(searchable_text)

        # Store in vector DB with metadata
        await self.vector_store.upsert(
            id=f"episode::{episode.id}",
            vector=embedding,
            metadata={
                "summary": summary,
                "domain": domain,
                "outcome": outcome.value,
                "entities": entities or [],
                "tags": episode.tags,
                "started_at": episode.started_at,
                "completed_at": episode.completed_at,
                "duration_seconds": episode.duration_seconds,
                "what_worked": what_worked or [],
                "what_failed": what_failed or [],
                "lessons_learned": lessons or [],
                "actions_count": len(actions),
            },
        )

        self._episodes[episode.id] = episode
        return episode

    async def find_similar_episodes(
        self,
        situation: str,
        top_k: int = 5,
        domain: str | None = None,
        outcome: EpisodeOutcome | None = None,
    ) -> list[Episode]:
        """Find past episodes similar to the current situation."""
        query_embedding = await self.embedding_provider.embed(situation)

        # Build filter
        filters: dict[str, Any] = {}
        if domain:
            filters["domain"] = domain
        if outcome:
            filters["outcome"] = outcome.value

        results = await self.vector_store.search(
            vector=query_embedding,
            top_k=top_k,
            filter=filters if filters else None,
        )

        episodes = []
        for result in results:
            episode_id = result["id"].split("::")[-1]
            if episode_id in self._episodes:
                episodes.append(self._episodes[episode_id])
            else:
                # Reconstruct from metadata
                meta = result.get("metadata", {})
                episode = Episode(
                    id=episode_id,
                    summary=meta.get("summary", ""),
                    outcome=EpisodeOutcome(meta.get("outcome", "unknown")),
                    domain=meta.get("domain", ""),
                    entities=meta.get("entities", []),
                    what_worked=meta.get("what_worked", []),
                    what_failed=meta.get("what_failed", []),
                    lessons_learned=meta.get("lessons_learned", []),
                    started_at=meta.get("started_at", 0),
                    completed_at=meta.get("completed_at", 0),
                )
                episodes.append(episode)

        return episodes

    async def get_failure_patterns(self, domain: str | None = None) -> dict[str, Any]:
        """Analyze failure patterns across all episodes."""
        # This would typically use aggregation queries
        failures = [
            e for e in self._episodes.values()
            if e.outcome == EpisodeOutcome.FAILURE
            and (domain is None or e.domain == domain)
        ]

        # Aggregate common failures
        failure_reasons: dict[str, int] = {}
        for ep in failures:
            for reason in ep.what_failed:
                failure_reasons[reason] = failure_reasons.get(reason, 0) + 1

        # Sort by frequency
        sorted_reasons = sorted(
            failure_reasons.items(), key=lambda x: x[1], reverse=True
        )

        return {
            "total_failures": len(failures),
            "common_failure_reasons": sorted_reasons[:10],
            "lessons_from_failures": [
                lesson
                for ep in failures
                for lesson in ep.lessons_learned
            ],
        }

    def to_prompt_context(
        self,
        episodes: list[Episode],
        max_episodes: int = 3,
    ) -> str:
        """Convert relevant episodes into a prompt-friendly format."""
        if not episodes:
            return ""

        lines = ["## Relevant Past Experiences"]
        for i, ep in enumerate(episodes[:max_episodes]):
            lines.append(f"\n### Experience {i + 1}: {ep.summary}")
            lines.append(f"- Domain: {ep.domain}")
            lines.append(f"- Outcome: {ep.outcome.value}")

            if ep.what_worked:
                lines.append(f"- What worked: {', '.join(ep.what_worked)}")
            if ep.what_failed:
                lines.append(f"- What didn't work: {', '.join(ep.what_failed)}")
            if ep.lessons_learned:
                lines.append(f"- Lessons: {'; '.join(ep.lessons_learned)}")

        return "\n".join(lines)
```

---

## 8.6 Semantic Memory

Semantic memory stores structured facts, knowledge, and world models. Unlike episodic memory (which stores specific experiences), semantic memory stores generalized knowledge.

### Knowledge Graphs for Structured Facts

```python
from dataclasses import dataclass, field
from typing import Any
import json


@dataclass
class Entity:
    id: str
    name: str
    entity_type: str  # "person", "product", "concept", "organization"
    properties: dict[str, Any] = field(default_factory=dict)
    confidence: float = 1.0
    source: str = ""
    last_verified: float = 0.0


@dataclass
class Relationship:
    source_id: str
    target_id: str
    relation_type: str  # "works_for", "part_of", "depends_on", etc.
    properties: dict[str, Any] = field(default_factory=dict)
    confidence: float = 1.0


class SemanticMemory:
    """
    Semantic memory backed by a knowledge graph.
    Stores entities, relationships, and facts with confidence scores.
    """

    def __init__(self):
        self.entities: dict[str, Entity] = {}
        self.relationships: list[Relationship] = []
        self._entity_index: dict[str, set[str]] = {}  # type -> entity_ids
        self._relation_index: dict[str, set[int]] = {}  # type -> relation indices

    def add_entity(
        self,
        entity_id: str,
        name: str,
        entity_type: str,
        properties: dict[str, Any] | None = None,
        confidence: float = 1.0,
        source: str = "",
    ) -> Entity:
        """Add or update an entity in the knowledge graph."""
        entity = Entity(
            id=entity_id,
            name=name,
            entity_type=entity_type,
            properties=properties or {},
            confidence=confidence,
            source=source,
        )

        self.entities[entity_id] = entity

        # Update type index
        if entity_type not in self._entity_index:
            self._entity_index[entity_type] = set()
        self._entity_index[entity_type].add(entity_id)

        return entity

    def add_relationship(
        self,
        source_id: str,
        target_id: str,
        relation_type: str,
        properties: dict[str, Any] | None = None,
        confidence: float = 1.0,
    ) -> Relationship:
        """Add a relationship between two entities."""
        if source_id not in self.entities:
            raise ValueError(f"Source entity {source_id} not found")
        if target_id not in self.entities:
            raise ValueError(f"Target entity {target_id} not found")

        rel = Relationship(
            source_id=source_id,
            target_id=target_id,
            relation_type=relation_type,
            properties=properties or {},
            confidence=confidence,
        )

        self.relationships.append(rel)
        idx = len(self.relationships) - 1

        if relation_type not in self._relation_index:
            self._relation_index[relation_type] = set()
        self._relation_index[relation_type].add(idx)

        return rel

    def query_entity(self, entity_id: str) -> Entity | None:
        """Look up an entity by ID."""
        return self.entities.get(entity_id)

    def find_entities_by_type(self, entity_type: str) -> list[Entity]:
        """Find all entities of a given type."""
        ids = self._entity_index.get(entity_type, set())
        return [self.entities[eid] for eid in ids if eid in self.entities]

    def find_relationships(
        self,
        source_id: str | None = None,
        target_id: str | None = None,
        relation_type: str | None = None,
    ) -> list[tuple[Relationship, Entity, Entity]]:
        """Find relationships matching the given criteria."""
        results = []
        for rel in self.relationships:
            if source_id and rel.source_id != source_id:
                continue
            if target_id and rel.target_id != target_id:
                continue
            if relation_type and rel.relation_type != relation_type:
                continue

            source = self.entities.get(rel.source_id)
            target = self.entities.get(rel.target_id)
            if source and target:
                results.append((rel, source, target))

        return results

    def resolve_conflicts(
        self,
        entity_id: str,
        conflicting_property: str,
        values: list[tuple[Any, float, str]],  # (value, confidence, source)
    ) -> Any:
        """
        Resolve conflicts when multiple sources provide different values
        for the same property. Uses confidence-weighted resolution.
        """
        # Sort by confidence (highest first)
        sorted_values = sorted(values, key=lambda x: x[1], reverse=True)

        if sorted_values:
            best_value, best_confidence, best_source = sorted_values[0]
            entity = self.entities.get(entity_id)
            if entity:
                entity.properties[conflicting_property] = best_value
                entity.confidence = best_confidence
                entity.source = best_source
            return best_value

        return None

    def to_prompt_context(
        self,
        relevant_entity_ids: list[str] | None = None,
        max_entities: int = 20,
        max_relationships: int = 30,
    ) -> str:
        """Serialize relevant parts of the knowledge graph for prompting."""
        lines = ["## Knowledge Graph"]

        # Filter entities if specific IDs provided
        if relevant_entity_ids:
            entities_to_show = [
                self.entities[eid]
                for eid in relevant_entity_ids
                if eid in self.entities
            ]
        else:
            entities_to_show = list(self.entities.values())[:max_entities]

        if entities_to_show:
            lines.append("\n### Entities")
            for entity in entities_to_show:
                lines.append(
                    f"- {entity.name} ({entity.entity_type}): "
                    f"{json.dumps(entity.properties, default=str)}"
                )

        # Show relevant relationships
        relevant_rels = self.relationships[:max_relationships]
        if relevant_rels:
            lines.append("\n### Relationships")
            for rel in relevant_rels:
                source = self.entities.get(rel.source_id)
                target = self.entities.get(rel.target_id)
                if source and target:
                    lines.append(
                        f"- {source.name} --[{rel.relation_type}]--> {target.name}"
                    )

        return "\n".join(lines)
```

### Temporal Validity

Knowledge changes over time. A fact that was true last month might be false today:

```python
@dataclass
class TemporalFact:
    """A fact with temporal validity — it may expire or become outdated."""
    entity_id: str
    property_name: str
    value: Any
    confidence: float = 1.0
    valid_from: float = field(default_factory=time.time)
    valid_until: float | None = None  # None = indefinitely valid
    source: str = ""
    last_verified: float = field(default_factory=time.time)
    verification_interval: float = 86400 * 7  # Re-verify weekly by default

    def is_valid(self) -> bool:
        """Check if this fact is currently valid."""
        now = time.time()
        if now < self.valid_from:
            return False
        if self.valid_until and now > self.valid_until:
            return False
        return True

    def needs_verification(self) -> bool:
        """Check if this fact needs re-verification."""
        return (time.time() - self.last_verified) > self.verification_interval

    def confidence_decay(self) -> float:
        """Compute decaying confidence based on age and verification status."""
        age = time.time() - self.valid_from
        days_since_verification = (time.time() - self.last_verified) / 86400

        # Confidence decays with age and time since verification
        decay_factor = max(0.1, 1.0 - (days_since_verification * 0.05))
        return self.confidence * decay_factor
```

---

## 8.7 Procedural Memory

Procedural memory stores how to perform tasks — learned procedures, skills, and workflows that the agent can recall and execute.

```python
from dataclasses import dataclass, field
from typing import Any, Callable, Awaitable
import json
import time


@dataclass
class Skill:
    """A learned procedure or skill that the agent can execute."""
    id: str
    name: str
    description: str
    category: str  # "data_analysis", "communication", "coding", etc.

    # Procedure definition
    steps: list[dict[str, Any]] = field(default_factory=list)
    parameters: dict[str, dict[str, Any]] = field(default_factory=dict)

    # Performance tracking
    success_count: int = 0
    failure_count: int = 0
    avg_duration_ms: float = 0.0
    last_used: float = 0.0

    # Adaptation
    feedback_history: list[dict[str, Any]] = field(default_factory=list)
    adapted_versions: list[str] = field(default_factory=list)

    # Metadata
    source: str = ""  # Where this skill was learned
    confidence: float = 1.0
    created_at: float = field(default_factory=time.time)

    @property
    def success_rate(self) -> float:
        total = self.success_count + self.failure_count
        return self.success_count / total if total > 0 else 0.0


class ProceduralMemory:
    """
    Stores and manages skills and procedures the agent has learned.
    Supports skill composition and adaptation based on feedback.
    """

    def __init__(self):
        self.skills: dict[str, Skill] = {}
        self._category_index: dict[str, set[str]] = {}
        self._name_index: dict[str, str] = {}  # name -> skill_id

    def register_skill(self, skill: Skill) -> None:
        """Register a new skill."""
        self.skills[skill.id] = skill

        if skill.category not in self._category_index:
            self._category_index[skill.category] = set()
        self._category_index[skill.category].add(skill.id)

        self._name_index[skill.name.lower()] = skill.id

    def find_skill(self, name: str) -> Skill | None:
        """Find a skill by name."""
        skill_id = self._name_index.get(name.lower())
        if skill_id:
            return self.skills.get(skill_id)
        return None

    def find_skills_by_category(self, category: str) -> list[Skill]:
        """Find all skills in a category."""
        ids = self._category_index.get(category, set())
        return [self.skills[sid] for sid in ids if sid in self.skills]

    def find_similar_skills(self, description: str, top_k: int = 5) -> list[Skill]:
        """
        Find skills relevant to a task description.
        Uses simple keyword matching (in production, use embeddings).
        """
        desc_words = set(description.lower().split())
        scored: list[tuple[float, Skill]] = []

        for skill in self.skills.values():
            skill_words = set(skill.description.lower().split())
            overlap = len(desc_words & skill_words)
            score = overlap / max(len(desc_words), 1)
            if score > 0:
                scored.append((score, skill))

        scored.sort(key=lambda x: x[0], reverse=True)
        return [skill for _, skill in scored[:top_k]]

    def record_outcome(
        self,
        skill_id: str,
        success: bool,
        duration_ms: float,
        feedback: str = "",
        context: dict[str, Any] | None = None,
    ) -> None:
        """Record the outcome of using a skill."""
        skill = self.skills.get(skill_id)
        if not skill:
            return

        if success:
            skill.success_count += 1
        else:
            skill.failure_count += 1

        # Update average duration (exponential moving average)
        total = skill.success_count + skill.failure_count
        skill.avg_duration_ms = (
            skill.avg_duration_ms * (total - 1) + duration_ms
        ) / total

        skill.last_used = time.time()

        # Record feedback for future adaptation
        skill.feedback_history.append({
            "success": success,
            "duration_ms": duration_ms,
            "feedback": feedback,
            "context": context or {},
            "timestamp": time.time(),
        })

        # Keep only last 100 feedback entries
        if len(skill.feedback_history) > 100:
            skill.feedback_history = skill.feedback_history[-100:]

    def adapt_skill(
        self,
        skill_id: str,
        new_steps: list[dict[str, Any]],
        reason: str = "",
    ) -> Skill:
        """
        Create an adapted version of a skill based on feedback.
        The original skill is preserved; the adapted version is a new skill.
        """
        original = self.skills.get(skill_id)
        if not original:
            raise ValueError(f"Skill {skill_id} not found")

        # Create adapted version
        adapted = Skill(
            id=f"{skill_id}_v{len(original.adapted_versions) + 1}",
            name=f"{original.name} (adapted)",
            description=original.description,
            category=original.category,
            steps=new_steps,
            parameters=original.parameters.copy(),
            source=f"adapted from {skill_id}: {reason}",
            confidence=original.confidence * 0.9,  # Start slightly less confident
        )

        self.register_skill(adapted)
        original.adapted_versions.append(adapted.id)

        return adapted

    def compose_skills(self, skill_ids: list[str], name: str = "") -> Skill:
        """Compose multiple skills into a new composite skill."""
        composed_steps = []
        composed_params = {}

        for sid in skill_ids:
            skill = self.skills.get(sid)
            if not skill:
                continue
            composed_steps.extend([
                {**step, "source_skill": sid}
                for step in skill.steps
            ])
            composed_params.update(skill.parameters)

        composite = Skill(
            id=f"composite_{hash(json.dumps(skill_ids)) % 100000}",
            name=name or f"Composite of {len(skill_ids)} skills",
            description=f"Composed from: {', '.join(skill_ids)}",
            category="composite",
            steps=composed_steps,
            parameters=composed_params,
            source="composition",
        )

        self.register_skill(composite)
        return composite

    def to_prompt_context(self, skill_ids: list[str] | None = None) -> str:
        """Serialize relevant skills for prompting."""
        lines = ["## Available Skills"]

        if skill_ids:
            skills_to_show = [
                self.skills[sid] for sid in skill_ids
                if sid in self.skills
            ]
        else:
            skills_to_show = sorted(
                self.skills.values(),
                key=lambda s: s.success_rate,
                reverse=True,
            )[:10]

        for skill in skills_to_show:
            lines.append(f"\n### {skill.name}")
            lines.append(f"Description: {skill.description}")
            lines.append(
                f"Success Rate: {skill.success_rate:.0%} "
                f"({skill.success_count + skill.failure_count} uses)"
            )
            if skill.steps:
                lines.append("Steps:")
                for i, step in enumerate(skill.steps, 1):
                    lines.append(f"  {i}. {step.get('description', step.get('action', '...'))}")

        return "\n".join(lines)
```

---

## 8.8 Memory Management Strategies

### Memory Consolidation

Over time, short-term memories that prove valuable should be consolidated into long-term memory. This mirrors how human memory works — important short-term experiences are encoded into long-term storage.

```python
import time
import asyncio
from dataclasses import dataclass, field
from typing import Any


class MemoryType(str, Enum):
    SHORT_TERM = "short_term"
    LONG_TERM = "long_term"
    EPISODIC = "episodic"
    SEMANTIC = "semantic"
    PROCEDURAL = "procedural"


@dataclass
class ConsolidationRule:
    """Defines when and how to consolidate memories."""
    source_type: MemoryType
    target_type: MemoryType
    trigger: str  # "age", "access_count", "importance", "explicit"
    threshold: Any  # The threshold value for the trigger
    max_candidates: int = 10


class MemoryManager:
    """
    Central memory manager that coordinates all memory types
    and handles consolidation, pruning, and indexing.
    """

    def __init__(
        self,
        short_term: Any,   # ConversationBuffer
        long_term: Any,    # LongTermMemory
        episodic: Any,     # EpisodicMemoryStore
        semantic: Any,     # SemanticMemory
        procedural: Any,   # ProceduralMemory
    ):
        self.short_term = short_term
        self.long_term = long_term
        self.episodic = episodic
        self.semantic = semantic
        self.procedural = procedural

        self.consolidation_rules: list[ConsolidationRule] = [
            ConsolidationRule(
                source_type=MemoryType.SHORT_TERM,
                target_type=MemoryType.EPISODIC,
                trigger="session_end",
                threshold=None,
                max_candidates=50,
            ),
            ConsolidationRule(
                source_type=MemoryType.SHORT_TERM,
                target_type=MemoryType.LONG_TERM,
                trigger="importance",
                threshold=0.8,
                max_candidates=20,
            ),
        ]

        self._stats = {
            "consolidations": 0,
            "prunings": 0,
            "retrievals": 0,
            "total_memories": 0,
        }

    async def consolidate_session(self, session_messages: list[dict[str, Any]]) -> None:
        """
        Consolidate memories at the end of a session.
        Identifies important information and moves it to long-term storage.
        """
        # Extract key facts from the session
        key_facts = await self._extract_key_facts(session_messages)

        for fact in key_facts:
            # Store in long-term memory
            memory_id = await self.long_term.store(
                content=fact["content"],
                metadata={
                    "source": "session_consolidation",
                    "importance": fact.get("importance", 0.5),
                    "entities": fact.get("entities", []),
                },
                confidence=fact.get("importance", 0.5),
            )
            self._stats["consolidations"] += 1

        # Record as episodic memory
        if session_messages:
            first_msg = session_messages[0].get("content", "")
            summary = first_msg[:200] if first_msg else "Session"
            await self.episodic.record_episode(
                summary=f"Session: {summary}",
                context={"message_count": len(session_messages)},
                actions=[],  # Would be populated with agent actions
                outcome="success",  # Would be determined from the session
                domain="general",
            )

        self._stats["total_memories"] += len(key_facts)

    async def _extract_key_facts(
        self,
        messages: list[dict[str, Any]],
    ) -> list[dict[str, Any]]:
        """
        Extract key facts from conversation messages.
        In production, use an LLM call to identify important information.
        """
        facts: list[dict[str, Any]] = []

        for msg in messages:
            content = msg.get("content", "")
            role = msg.get("role", "")

            if role == "user":
                # Simple heuristic: user messages with specific data are often important
                if any(keyword in content.lower() for keyword in [
                    "my name", "i prefer", "i need", "my account",
                    "remember", "important", "don't forget",
                ]):
                    facts.append({
                        "content": content,
                        "importance": 0.7,
                        "entities": [],
                    })

        return facts

    async def prune_memories(self, max_age_days: int = 90, min_confidence: float = 0.3) -> int:
        """
        Remove old or low-confidence memories to manage storage.
        Returns the number of pruned memories.
        """
        pruned = 0
        cutoff_time = time.time() - (max_age_days * 86400)

        # This would interact with the actual vector store
        # For now, track the intent
        self._stats["prunings"] += pruned
        return pruned

    async def search(
        self,
        query: str,
        memory_types: list[MemoryType] | None = None,
        top_k: int = 10,
    ) -> dict[MemoryType, list[Any]]:
        """Search across all memory types for relevant information."""
        if memory_types is None:
            memory_types = list(MemoryType)

        results: dict[MemoryType, list[Any]] = {}

        for mem_type in memory_types:
            if mem_type == MemoryType.LONG_TERM:
                entries = await self.long_term.recall(query, top_k=top_k)
                results[mem_type] = entries
            elif mem_type == MemoryType.EPISODIC:
                episodes = await self.episodic.find_similar_episodes(query, top_k=top_k)
                results[mem_type] = episodes
            # Other memory types would be searched similarly

        self._stats["retrievals"] += 1
        return results

    def get_stats(self) -> dict[str, Any]:
        """Get memory system statistics."""
        return {
            **self._stats,
            "short_term_messages": len(self.short_term.get_messages()),
            "long_term_memories": len(getattr(self.long_term, '_local_cache', {})),
            "episodes": len(getattr(self.episodic, '_episodes', {})),
            "skills": len(getattr(self.procedural, 'skills', {})),
        }

    def to_prompt_context(self, query: str, max_items: int = 5) -> str:
        """Build a complete memory context for prompting."""
        sections = []

        # Short-term: recent conversation
        messages = self.short_term.get_messages()
        if messages:
            recent = messages[-6:]  # Last 3 exchanges
            sections.append("## Recent Conversation")
            for msg in recent:
                sections.append(f"**{msg.role}**: {msg.content[:200]}")

        # Note: long-term, episodic, semantic, and procedural memories
        # would be retrieved asynchronously and added here
        sections.append(
            "\n[Long-term memories, episodic memories, and skills "
            "would be injected here based on query relevance]"
        )

        return "\n".join(sections)
```

---

## 8.9 RAG as Memory

Retrieval-Augmented Generation (RAG) can be viewed as a form of external semantic memory. Understanding when to use RAG versus dedicated memory stores is a critical architectural decision.

### The Memory Spectrum

```
No Memory              RAG Only              Full Memory System
    │                      │                         │
    ▼                      ▼                         ▼
┌────────┐          ┌────────────┐          ┌──────────────────┐
│ Stateless│         │ Vector DB  │          │ Short-Term       │
│ LLM    │          │ + Docs     │          │ Long-Term        │
│        │          │            │          │ Episodic         │
│ No     │          │ Retrieval  │          │ Semantic         │
│ context│          │ from fixed │          │ Procedural       │
│ between│          │ corpus     │          │                  │
│ calls  │          │            │          │ Full memory      │
└────────┘          └────────────┘          │ management       │
                                            └──────────────────┘

Complexity:    Low          Medium              High
Use Case:      Simple       Q&A over            Personal agents,
               chatbots     documents           autonomous systems
Cost:          Lowest       Medium              Highest
Capability:    Limited      Good for            Best for long-lived,
                            knowledge tasks     learning agents
```

### When to Use RAG vs Dedicated Memory

| Use Case | RAG | Dedicated Memory | Why |
|---|---|---|---|
| Answering questions about documents | ✅ Best | ❌ Overkill | Fixed corpus, no learning needed |
| Personal assistant remembering preferences | ❌ Poor | ✅ Best | Needs user-specific, evolving memory |
| Customer support with knowledge base | ✅ Good | ⚠️ Supplement | Knowledge base + user history |
| Multi-session autonomous agent | ❌ Poor | ✅ Best | Must learn from past episodes |
| Legal document analysis | ✅ Good | ⚠️ Supplement | Static documents + case history |
| Coding agent learning codebase patterns | ⚠️ Partial | ✅ Best | Needs procedural + episodic memory |

### Hybrid Approach

The most powerful systems combine RAG with a full memory stack:

```python
class HybridMemorySystem:
    """
    Combines RAG (for external knowledge) with a full memory stack
    (for personal and learned information).
    """

    def __init__(self, rag_store: Any, memory_manager: Any):
        self.rag = rag_store           # External knowledge retrieval
        self.memory = memory_manager   # Personal memory system

    async def retrieve_context(
        self,
        query: str,
        user_id: str | None = None,
        include_rag: bool = True,
        include_memories: bool = True,
    ) -> str:
        """Build a complete context combining RAG and personal memories."""
        sections = []

        # 1. Personal memories (most relevant to this user)
        if include_memories and user_id:
            personal = await self.memory.search(
                query=query,
                memory_types=[
                    MemoryType.EPISODIC,
                    MemoryType.SEMANTIC,
                    MemoryType.PROCEDURAL,
                ],
                top_k=5,
            )
            for mem_type, results in personal.items():
                if results:
                    sections.append(
                        self._format_memory_section(mem_type, results)
                    )

        # 2. RAG retrieval (external knowledge)
        if include_rag:
            rag_results = await self.rag.search(query, top_k=5)
            if rag_results:
                sections.append("## Relevant Knowledge")
                for doc in rag_results:
                    sections.append(
                        f"- [{doc.get('source', 'unknown')}]: "
                        f"{doc.get('content', '')[:300]}"
                    )

        # 3. Conversation context (short-term)
        conversation = self.memory.short_term.to_prompt_context()
        if conversation:
            sections.append(conversation)

        return "\n\n".join(sections)

    def _format_memory_section(self, mem_type: MemoryType, results: list) -> str:
        """Format memory results for inclusion in the prompt."""
        type_labels = {
            MemoryType.EPISODIC: "Relevant Past Experiences",
            MemoryType.SEMANTIC: "Known Facts",
            MemoryType.PROCEDURAL: "Relevant Skills",
        }
        label = type_labels.get(mem_type, "Memory")
        lines = [f"## {label}"]
        for item in results:
            if hasattr(item, 'summary'):
                lines.append(f"- {item.summary}")
            elif hasattr(item, 'content'):
                lines.append(f"- {item.content[:200]}")
        return "\n".join(lines)
```

---

## 8.10 Memory in Multi-Agent Systems

### Shared vs Private Memory

In multi-agent systems, memory architecture decisions about what is shared and what is private are critical:

```
Multi-Agent Memory Architecture
═══════════════════════════════════════════════════════════════

              ┌─────────────────────────────────┐
              │        Shared Memory             │
              │                                  │
              │  • Organization knowledge        │
              │  • Shared task state             │
              │  • Common entity registry        │
              │  • Team-level procedures         │
              └──────────┬──────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
    ┌────▼────┐    ┌─────▼─────┐   ┌─────▼─────┐
    │ Agent A │    │  Agent B   │   │  Agent C   │
    │ Private │    │  Private   │   │  Private   │
    │ Memory  │    │  Memory    │   │  Memory    │
    │         │    │            │   │            │
    │• Personal│    │• Personal  │   │• Personal  │
    │  prefs  │    │  prefs     │   │  prefs     │
    │• Work-  │    │• Work-     │   │• Work-     │
    │  ing    │    │  ing       │   │  ing       │
    │  memory │    │  memory    │   │  memory    │
    │• Epi-   │    │• Epi-      │   │• Epi-      │
    │  sodic  │    │  sodic     │   │  sodic     │
    │  (own)  │    │  (own)     │   │  (own)     │
    └─────────┘    └───────────┘   └───────────┘
```

### Memory Synchronization Between Agents

```python
import asyncio
import time
from dataclasses import dataclass, field
from typing import Any


class AccessLevel(str, Enum):
    READ_ONLY = "read_only"
    READ_WRITE = "read_write"
    ADMIN = "admin"


@dataclass
class MemoryPermission:
    agent_id: str
    memory_id: str
    access_level: AccessLevel
    granted_at: float = field(default_factory=time.time)
    expires_at: float | None = None


class SharedMemory:
    """
    Shared memory for agent teams with access control,
    conflict resolution, and change propagation.
    """

    def __init__(self, team_id: str):
        self.team_id = team_id
        self._store: dict[str, dict[str, Any]] = {}
        self._permissions: dict[str, list[MemoryPermission]] = {}
        self._changelog: list[dict[str, Any]] = []
        self._subscribers: dict[str, list[str]] = {}  # agent_id -> memory_ids

    def put(
        self,
        agent_id: str,
        key: str,
        value: Any,
        metadata: dict[str, Any] | None = None,
    ) -> bool:
        """Store a value in shared memory with permission check."""
        if not self._check_permission(agent_id, key, AccessLevel.READ_WRITE):
            return False

        old_value = self._store.get(key, {}).get("value")
        self._store[key] = {
            "value": value,
            "metadata": metadata or {},
            "updated_by": agent_id,
            "updated_at": time.time(),
            "version": self._store.get(key, {}).get("version", 0) + 1,
        }

        # Record change
        self._changelog.append({
            "key": key,
            "agent_id": agent_id,
            "old_value": old_value,
            "new_value": value,
            "timestamp": time.time(),
        })

        # Notify subscribers
        self._notify_subscribers(key, agent_id)

        return True

    def get(
        self,
        agent_id: str,
        key: str,
        default: Any = None,
    ) -> Any:
        """Read a value from shared memory."""
        if not self._check_permission(agent_id, key, AccessLevel.READ_ONLY):
            return default

        entry = self._store.get(key)
        return entry["value"] if entry else default

    def grant_access(
        self,
        admin_id: str,
        target_agent_id: str,
        memory_id: str,
        access_level: AccessLevel,
    ) -> bool:
        """Grant access to shared memory (admin only)."""
        if not self._check_permission(admin_id, memory_id, AccessLevel.ADMIN):
            return False

        permission = MemoryPermission(
            agent_id=target_agent_id,
            memory_id=memory_id,
            access_level=access_level,
        )

        if memory_id not in self._permissions:
            self._permissions[memory_id] = []
        self._permissions[memory_id].append(permission)

        return True

    def subscribe(self, agent_id: str, key: str) -> None:
        """Subscribe to changes on a shared memory key."""
        if key not in self._subscribers:
            self._subscribers[key] = []
        if agent_id not in self._subscribers[key]:
            self._subscribers[key].append(agent_id)

    def get_changes_since(
        self,
        agent_id: str,
        since_timestamp: float,
        keys: list[str] | None = None,
    ) -> list[dict[str, Any]]:
        """Get memory changes since a given timestamp."""
        changes = [
            c for c in self._changelog
            if c["timestamp"] > since_timestamp
        ]

        if keys:
            changes = [c for c in changes if c["key"] in keys]

        return changes

    def _check_permission(
        self,
        agent_id: str,
        memory_id: str,
        required_level: AccessLevel,
    ) -> bool:
        """Check if an agent has the required access level."""
        level_hierarchy = {
            AccessLevel.READ_ONLY: 0,
            AccessLevel.READ_WRITE: 1,
            AccessLevel.ADMIN: 2,
        }

        required = level_hierarchy[required_level]

        # Team-level admin has full access
        for perm in self._permissions.get("__team_admin__", []):
            if perm.agent_id == agent_id:
                return True

        # Check specific permissions
        for perm in self._permissions.get(memory_id, []):
            if perm.agent_id == agent_id:
                if perm.expires_at and time.time() > perm.expires_at:
                    continue
                if level_hierarchy.get(perm.access_level, 0) >= required:
                    return True

        # Default: allow if no permissions are set (open shared memory)
        if memory_id not in self._permissions:
            return True

        return False

    def _notify_subscribers(self, key: str, changed_by: str) -> None:
        """Notify agents subscribed to a key that it has changed."""
        for agent_id in self._subscribers.get(key, []):
            if agent_id != changed_by:
                # In production, this would send a message to the agent
                pass

    def to_prompt_context(
        self,
        agent_id: str,
        relevant_keys: list[str] | None = None,
    ) -> str:
        """Serialize shared memory for an agent's prompt."""
        lines = [f"## Shared Memory ({self.team_id})"]

        keys_to_show = relevant_keys or list(self._store.keys())

        for key in keys_to_show:
            entry = self._store.get(key)
            if entry and self._check_permission(agent_id, key, AccessLevel.READ_ONLY):
                lines.append(f"\n### {key}")
                lines.append(f"Value: {entry['value']}")
                lines.append(f"Updated by: {entry['updated_by']}")
                lines.append(f"Version: {entry['version']}")

        return "\n".join(lines)
```

---

## Summary

Memory is what transforms a stateless LLM into a persistent, learning agent. The memory taxonomy presented in this chapter provides a structured framework for designing agent memory systems:

1. **Short-term memory** manages the conversation buffer within the context window, using strategies like sliding windows, summarization, and importance-based truncation.

2. **Long-term memory** persists information across sessions, typically using vector embeddings for similarity-based retrieval, with support for multiple storage backends.

3. **Episodic memory** stores complete past experiences with their outcomes, enabling agents to learn from their own history — recognizing success patterns and avoiding repeated failures.

4. **Semantic memory** organizes structured facts and knowledge in a graph-based structure, with support for temporal validity and confidence-weighted conflict resolution.

5. **Procedural memory** captures learned skills and procedures, tracking their performance over time and enabling adaptation based on feedback.

6. **Memory management** is the connective tissue — consolidation moves valuable short-term memories to long-term storage, pruning removes outdated information, and the memory manager coordinates access across all types.

7. **RAG and memory** are complementary, not competing — RAG provides external knowledge retrieval while dedicated memory stores handle personal and learned information.

8. **Multi-agent memory** introduces shared vs. private memory, access control, synchronization, and change propagation as critical design concerns.

The key architectural insight is that different types of information demand different memory types. A well-designed agent uses all of them together, with a memory manager orchestrating consolidation, retrieval, and pruning across the entire taxonomy.

> **Looking ahead:** Chapter 9 will explore the Model Context Protocol (MCP) — the emerging standard for connecting agents to tools, data sources, and other services through a unified interface.

*Next: [Chapter 9 — Model Context Protocol](chapter-09-mcp.md)*
