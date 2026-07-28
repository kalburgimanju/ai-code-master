# Chapter 4: State Management and Reducers

## Understanding State Reducers

State reducers determine how values are merged when multiple nodes update the same state field. This is the core of LangGraph's concurrent state management.

### Reducer Types

```python
from typing import TypedDict, Annotated
import operator

class State(TypedDict):
    # Replace (default) - new value completely replaces old
    replace_field: str
    
    # Add - concatenate lists
    add_list: Annotated[list[str], operator.add]
    
    # Add - sum numbers
    add_number: Annotated[int, operator.add]
    
    # Add - merge dicts (later keys win)
    add_dict: Annotated[dict, operator.add]
    
    # Custom reducer - any callable
    custom_merge: Annotated[list[str], custom_reducer]
    
    # Special: add_messages for conversation history
    messages: Annotated[list[BaseMessage], add_messages]
```

### Built-in Reducers

```python
from langgraph.graph.message import add_messages
from langgraph.graph import add_messages  # alias
import operator

# For lists - concatenates
Annotated[list[int], operator.add]

# For dicts - merges (right wins on conflict)
Annotated[dict, operator.add]

# For numbers - adds
Annotated[int, operator.add]

# For strings - concatenates
Annotated[str, operator.add]

# For messages - handles AI/Human/Tool messages intelligently
Annotated[list[BaseMessage], add_messages]
```

### Custom Reducers

```python
from typing import Callable, Any

def custom_reducer(left: Any, right: Any) -> Any:
    """Custom merge logic."""
    if left is None:
        return right
    if right is None:
        return left
    # Your merge logic
    return merged_result

def unique_list_reducer(left: list, right: list) -> list:
    """Merge lists keeping unique values."""
    seen = set()
    result = []
    for item in left + right:
        if item not in seen:
            seen.add(item)
            result.append(item)
    return result

def max_reducer(left: int, right: int) -> int:
    """Keep maximum value."""
    return max(left, right)

def append_if_new_reducer(left: list[dict], right: list[dict]) -> list[dict]:
    """Append dicts only if not already present (by id)."""
    existing_ids = {item.get("id") for item in left}
    for item in right:
        if item.get("id") not in existing_ids:
            left.append(item)
            existing_ids.add(item.get("id"))
    return left
```

### State Schema with All Reducers

```python
class ResearchState(TypedDict):
    # Conversation - uses add_messages
    messages: Annotated[list[BaseMessage], add_messages]
    
    # Research plan - replaced entirely
    plan: list[str]
    
    # Findings - accumulate
    findings: Annotated[list[dict], operator.add]
    
    # Sources - unique URLs
    sources: Annotated[list[str], unique_list_reducer]
    
    # Confidence score - keep highest
    confidence: Annotated[float, max_reducer]
    
    # Step counter - increment
    step_count: Annotated[int, operator.add]
    
    # Current task - replace
    current_task: str
    
    # Metadata - merge
    metadata: Annotated[dict, operator.add]
```

## State Initialization and Defaults

### Factory Functions

```python
def create_initial_state(topic: str, session_id: str) -> ResearchState:
    """Factory for initial state."""
    return {
        "messages": [HumanMessage(content=f"Research: {topic}")],
        "topic": topic,
        "plan": [],
        "findings": [],
        "sources": [],
        "confidence": 0.0,
        "step_count": 0,
        "current_task": "",
        "metadata": {
            "session_id": session_id,
            "created_at": datetime.now().isoformat(),
            "version": "1.0"
        }
    }

# Use with graph
graph = StateGraph(ResearchState)
app = graph.compile()
result = app.invoke(create_initial_state("AI Safety", "session-123"))
```

### Default Values with Pydantic

```python
from pydantic import BaseModel, Field
from typing import Optional

class ResearchConfig(BaseModel):
    topic: str
    max_steps: int = 5
    model: str = "gpt-4o-mini"
    temperature: float = 0.7
    session_id: Optional[str] = None

class ResearchState(TypedDict):
    config: ResearchConfig
    messages: Annotated[list[BaseMessage], add_messages]
    # ... other fields
```

## State Updates Patterns

### Pattern 1: Partial Updates (Recommended)

```python
def research_node(state: ResearchState) -> dict:
    """Return only changed fields."""
    finding = do_research(state["current_task"])
    return {
        "findings": [finding],  # operator.add merges
        "current_task": next_task,  # replaces
        "step_count": 1,  # operator.add increments
    }
```

### Pattern 2: Functional Updates

```python
def update_findings(state: ResearchState, new_finding: dict) -> ResearchState:
    """Immutably update state."""
    return {
        **state,
        "findings": state["findings"] + [new_finding],
        "step_count": state["step_count"] + 1,
    }

# In node:
def node(state: ResearchState) -> dict:
    finding = do_research()
    return update_findings(state, finding)
```

### Pattern 3: Command Pattern (LangGraph 0.2+)

```python
from langgraph.graph import Command

def node_with_command(state: ResearchState) -> Command:
    """Return Command for complex updates."""
    finding = do_research()
    
    return Command(
        update={
            "findings": [finding],
            "step_count": 1,
        },
        goto="next_node"  # or ["node1", "node2"] for parallel
    )
```

## State Migration and Versioning

### Schema Versioning

```python
class ResearchState(TypedDict):
    schema_version: int  # Always include
    # ... other fields

CURRENT_SCHEMA_VERSION = 2

def migrate_state(state: dict) -> ResearchState:
    """Migrate old state to current schema."""
    version = state.get("schema_version", 1)
    
    if version == 1:
        # v1 didn't have confidence field
        state["confidence"] = 0.5
        state["schema_version"] = 2
    
    return state  # type: ignore

# Apply migration on load
def load_state(checkpoint: Checkpoint) -> ResearchState:
    state = checkpoint["channel_values"]
    return migrate_state(state)
```

### Backward Compatibility

```python
# Always use .get() with defaults
def safe_node(state: ResearchState) -> dict:
    confidence = state.get("confidence", 0.0)  # Default for old checkpoints
    metadata = state.get("metadata", {})
    # ...
```

## Advanced State Patterns

### 1. Hierarchical State

```python
class AgentState(TypedDict):
    # Global state
    user_id: str
    session_id: str
    global_context: dict
    
    # Per-agent state (nested)
    researcher: "ResearcherState"
    writer: "WriterState"
    reviewer: "ReviewerState"

class ResearcherState(TypedDict):
    topic: str
    findings: Annotated[list, operator.add]
    current_depth: int
```

### 2. Ephemeral vs Persistent State

```python
class State(TypedDict):
    # Persisted to checkpoints
    messages: Annotated[list[BaseMessage], add_messages]
    findings: Annotated[list[dict], operator.add]
    
    # Ephemeral - not checkpointed (use RunnableConfig)
    _temp_cache: dict  # Prefix with _ to indicate ephemeral
    _api_clients: dict
```

### 3. Streaming State Updates

```python
def streaming_node(state: ResearchState):
    """Yield intermediate state for streaming."""
    for i, finding in enumerate(research_stream(state["topic"])):
        # Each yield updates state for stream_mode="values"
        yield {"findings": [finding], "current_finding": finding}
    
    # Final yield
    yield {"status": "complete"}
```

## State Inspection and Debugging

### State Schema Introspection

```python
from langgraph.graph import StateGraph

graph = StateGraph(ResearchState)
# ... add nodes ...

# Get state schema
schema = graph.get_state_schema()
print("Fields:", schema.__annotations__)
print("Reducers:", schema.__reducers__)  # If available
```

### Checkpoint Inspection

```python
from langgraph.checkpoint.sqlite import SqliteSaver

checkpointer = SqliteSaver.from_conn_string("checkpoints.db")

# List all checkpoints
for checkpoint in checkpointer.list(None):
    print(f"Thread: {checkpoint.config['configurable']['thread_id']}")
    print(f"  Step: {checkpoint.metadata.get('step', '?')}")
    print(f"  State keys: {list(checkpoint.channel_values.keys())}")

# Get specific checkpoint
config = {"configurable": {"thread_id": "session-123"}}
checkpoint = checkpointer.get(config)
state = checkpoint.channel_values
print(f"Messages: {len(state.get('messages', []))}")
print(f"Findings: {len(state.get('findings', []))}")
```

### State Diffing

```python
def diff_state(old: dict, new: dict) -> dict:
    """Compare two states."""
    changes = {}
    all_keys = set(old.keys()) | set(new.keys())
    
    for key in all_keys:
        old_val = old.get(key)
        new_val = new.get(key)
        if old_val != new_val:
            changes[key] = {"old": old_val, "new": new_val}
    
    return changes

# Usage in node
def debug_node(state: ResearchState) -> dict:
    # Would need previous state from checkpoint
    return {}
```

## Performance Optimization

### 1. Minimize State Size

```python
# ❌ Bad: Store full LLM responses
state["llm_raw_responses"] = [full_response_object]

# ✅ Good: Store only what you need
state["findings"] = [{"summary": response.content[:500], "tokens": response.usage.total_tokens}]
```

### 2. Use Efficient Reducers

```python
# ❌ Bad: Custom reducer that copies entire list
def bad_reducer(left, right):
    return left + right  # Creates new list every time

# ✅ Good: operator.add is optimized
from operator import add
Annotated[list, add]
```

### 3. Lazy State Loading

```python
# For large state, load incrementally
class LargeState(TypedDict):
    summary: str
    _full_data_ref: str  # Reference to external storage (S3, DB)
    
def load_full_data(ref: str) -> dict:
    # Load from external storage when needed
    return s3.get_object(ref)

def node_needing_full_data(state: LargeState):
    if state.get("_full_data_ref"):
        full_data = load_full_data(state["_full_data_ref"])
        # Process...
```

## Testing State Transitions

### Unit Test Node State Updates

```python
import pytest
from research_graph import research_node, create_initial_state

def test_research_node_updates_findings():
    state = create_initial_state("AI Safety", "test-123")
    state["current_task"] = "Search for AI safety papers"
    
    result = research_node(state)
    
    assert "findings" in result
    assert len(result["findings"]) == 1
    assert result["findings"][0]["task"] == "Search for AI safety papers"
    assert "step_count" in result
    assert result["step_count"] == 1

def test_state_reducer_accumulates():
    state = create_initial_state("Topic", "test")
    
    # Simulate multiple node calls
    result1 = research_node({**state, "current_task": "Task 1"})
    result2 = research_node({**state, **result1, "current_task": "Task 2"})
    
    # Check accumulation
    combined_findings = state.get("findings", []) + result1["findings"] + result2["findings"]
    assert len(combined_findings) == 2
```

### Integration Test Full Graph

```python
def test_full_research_flow():
    graph = build_research_graph()
    app = graph.compile()
    
    initial = create_initial_state("Test Topic", "test-flow")
    result = app.invoke(initial)
    
    assert result["status"] == "complete"
    assert len(result["findings"]) > 0
    assert len(result["messages"]) > 1  # Human + AI messages
```

## Common State Pitfalls

### 1. Forgetting Reducers

```python
# ❌ Problem: findings gets replaced, not accumulated
class State(TypedDict):
    findings: list[dict]  # No Annotated!

# ✅ Fix: Use Annotated with operator.add
from typing import Annotated
import operator

class State(TypedDict):
    findings: Annotated[list[dict], operator.add]
```

### 2. Mutable Default Arguments

```python
# ❌ Problem: Shared mutable default
def node(state: State, findings: list = []) -> dict:
    findings.append(new_finding)
    return {"findings": findings}

# ✅ Fix: Use None default
def node(state: State, findings: list = None) -> dict:
    findings = findings or []
    findings.append(new_finding)
    return {"findings": findings}
```

### 3. Type Annotation Issues

```python
# ❌ Problem: Runtime type not checked
class State(TypedDict):
    count: int

# ✅ Fix: Use Annotated for reducers, runtime validation if needed
from pydantic import BaseModel, field_validator

class ValidatedState(BaseModel):
    count: Annotated[int, operator.add] = 0
    
    @field_validator("count")
    @classmethod
    def non_negative(cls, v):
        assert v >= 0
        return v
```

## Summary

| Concept | Key Point |
|---------|-----------|
| **Reducers** | Determine how parallel updates merge (`operator.add`, `add_messages`, custom) |
| **State Schema** | TypedDict with Annotated for reducers |
| **Updates** | Return partial dict with only changed fields |
| **Versioning** | Always include `schema_version`, migrate on load |
| **Checkpointing** | Automatic with checkpointer, inspect with `.list()` and `.get()` |
| **Testing** | Test nodes in isolation with mocked state |

---

## Next Chapter: Nodes - Functions, Tools, and Subgraphs

In Chapter 5, we'll dive deep into node types: LLM nodes with structured output, tool nodes, human-in-the-loop nodes, and subgraph composition.