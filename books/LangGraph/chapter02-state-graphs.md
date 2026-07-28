# Chapter 2: Understanding State Graphs

## The StateGraph Architecture

The `StateGraph` is the heart of LangGraph. Understanding its architecture is crucial for building effective applications.

### Core Components

```
StateGraph
├── State Schema (TypedDict/Pydantic)
├── Nodes (computation units)
├── Edges (control flow)
├── Entry Point
├── Compiled Graph (Runnable)
└── Checkpointer (optional)
```

### State Schema Design

The state schema defines what data flows through your graph. It should be:
1. **Complete** - All data needed by any node
2. **Typed** - Use TypedDict or Pydantic for validation
3. **Minimal** - Don't include derived/computed fields
4. **Serializable** - For checkpointing to work

```python
from typing import TypedDict, Annotated, Literal, Optional
from langgraph.graph import add_messages
from langchain_core.messages import BaseMessage
from pydantic import BaseModel, Field

# Option 1: TypedDict (recommended for simplicity)
class AgentState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]
    user_id: str
    session_id: str
    current_task: Optional[str]
    tools_used: Annotated[list[str], operator.add]
    iteration_count: int
    metadata: dict

# Option 2: Pydantic (for validation)
class AgentState(BaseModel):
    messages: Annotated[list[BaseMessage], add_messages] = Field(default_factory=list)
    user_id: str
    session_id: str
    current_task: Optional[str] = None
    tools_used: Annotated[list[str], operator.add] = Field(default_factory=list)
    iteration_count: int = 0
    metadata: dict = Field(default_factory=dict)
    
    class Config:
        arbitrary_types_allowed = True
```

### Reducers: How State Merges

Reducers determine how node outputs merge into the global state. LangGraph provides built-in reducers:

```python
from typing import Annotated
from langgraph.graph import add_messages
import operator

class State(TypedDict):
    # List concatenation (default for lists without annotation)
    simple_list: list[str]
    
    # Explicit list concatenation
    messages: Annotated[list[BaseMessage], add_messages]
    tools_used: Annotated[list[str], operator.add]
    
    # Dictionary merge (default for dicts)
    metadata: dict
    
    # Custom reducer
    counter: Annotated[int, operator.add]  # Adds integers
    
    # Replace (last write wins) - default for non-annotated
    current_node: str
```

**Built-in Reducers:**
- `add_messages` - Smart message list merging (handles IDs, tool calls)
- `operator.add` - Concatenates lists, adds numbers, merges dicts
- `operator.or_` - Boolean OR
- Custom callable - `(left, right) -> merged`

### State Immutability vs Mutability

**Important**: State appears immutable to nodes (they receive a copy), but LangGraph mutates it internally. Never modify state in-place in your nodes:

```python
# ❌ WRONG - Mutating state directly
def bad_node(state: AgentState):
    state["messages"].append(new_message)  # Modifies original!
    return {}

# ✅ CORRECT - Return updates
def good_node(state: AgentState):
    return {"messages": [new_message]}  # LangGraph merges via reducer
```

### The Graph Lifecycle

```
1. DEFINE          →  StateGraph(StateSchema)
2. ADD NODES       →  graph.add_node(name, function)
3. ADD EDGES       →  graph.add_edge(from, to)
4. SET ENTRY       →  graph.set_entry_point(node)
5. COMPILE         →  app = graph.compile()
6. EXECUTE         →  app.invoke(input, config)
7. CHECKPOINT      →  Auto-saved at each step
```

### Compiled Graph = Runnable

The compiled graph implements LangChain's `Runnable` interface:

```python
app = graph.compile()

# Standard Runnable methods
result = app.invoke(input, config)
async_result = await app.ainvoke(input, config)

# Streaming
for chunk in app.stream(input, config):
    print(chunk)

# With callbacks
result = app.invoke(input, config, callbacks=[handler])
```

### Graph Configuration

The `config` parameter controls execution:

```python
config = {
    "configurable": {
        "thread_id": "unique-thread-id",  # Required for checkpointing
        "checkpoint_ns": "namespace",      # Optional namespace
        "checkpoint_id": "specific-id",    # Resume from specific checkpoint
    },
    "callbacks": [callback_handler],
    "tags": ["production", "v2"],
    "metadata": {"user_id": "123", "session": "abc"},
    "run_name": "my_graph_execution",
    "max_concurrency": 10,  # For parallel node execution
}
```

### Subgraphs: Composing Graphs

Subgraphs enable modular, reusable graph components:

```python
# Subgraph for research
research_graph = StateGraph(ResearchState)
research_graph.add_node("search", search_node)
research_graph.add_node("summarize", summarize_node)
research_graph.set_entry_point("search")
research_graph.add_edge("search", "summarize")
research_graph.add_edge("summarize", END)

# Main graph uses subgraph as a node
main_graph = StateGraph(MainState)
main_graph.add_node("research", research_graph.compile())
main_graph.add_node("write", write_node)
main_graph.set_entry_point("research")
main_graph.add_edge("research", "write")
main_graph.add_edge("write", END)
```

Subgraphs:
- Have their own state schema (can be different from parent)
- Can have their own checkpointer
- Are compiled independently
- Communicate via input/output state mapping

### State Schema Inheritance

For subgraphs, you often need to map parent state to child state:

```python
# Parent state has more fields
class ParentState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]
    user_id: str
    research_topic: str
    research_results: str

# Child state only needs what it uses
class ResearchState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]
    topic: str

# Map parent → child input
def research_input(parent_state: ParentState) -> ResearchState:
    return {
        "messages": parent_state["messages"],
        "topic": parent_state["research_topic"]
    }

# Map child output → parent update
def research_output(parent_state: ParentState, child_state: ResearchState):
    return {"research_results": child_state["messages"][-1].content}

# Add as node with mappers
main_graph.add_node(
    "research", 
    research_graph.compile(),
    input=research_input,
    output=research_output
)
```

### Visualizing State Flow

Use the built-in visualization to understand state transitions:

```python
# Get graph structure
graph = app.get_graph()

# Print nodes and edges
print("Nodes:", graph.nodes.keys())
print("Edges:", [(e.source, e.target) for e in graph.edges])

# Mermaid diagram
print(graph.draw_mermaid())

# With state schema
print(graph.draw_mermaid(with_state=True))
```

### Common State Patterns

#### 1. Conversation History
```python
class ChatState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]
    summary: str  # Periodic summary to manage context window
```

#### 2. Multi-Step Task Tracking
```python
class TaskState(TypedDict):
    task: str
    plan: list[str]
    completed_steps: Annotated[list[str], operator.add]
    current_step: int
    results: dict
```

#### 3. Tool Execution Tracking
```python
class ToolState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]
    tool_calls: Annotated[list[ToolCall], operator.add]
    tool_results: Annotated[list[ToolResult], operator.add]
    pending_tools: list[str]
```

#### 4. Human-in-the-Loop State
```python
class HITLState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]
    awaiting_human: bool
    human_response: Optional[str]
    approval_required: bool
```

### Debugging State Issues

**Problem**: State not updating
```python
# Check reducer is correct
class State(TypedDict):
    # Missing reducer = replace behavior
    items: list[str]  # ❌ Replaces entire list
    
    # Correct: use operator.add
    items: Annotated[list[str], operator.add]  # ✅ Concatenates
```

**Problem**: Type errors
```python
# Use TypedDict for static analysis
from typing import TypedDict, Annotated
# NOT: class State(dict): ...
```

**Problem**: Checkpoint serialization fails
```python
# Ensure all state values are JSON-serializable
# ❌ Bad: datetime objects, database connections, file handles
# ✅ Good: strings, numbers, lists, dicts, Pydantic models
```

### Best Practices

1. **Define state upfront** - Think about all data needed before coding nodes
2. **Use Annotated for reducers** - Be explicit about merge behavior
3. **Keep state flat** - Nested structures complicate reducers
4. **Separate mutable vs immutable** - Config/user_id shouldn't change
5. **Version your state schema** - Add `schema_version` field for migrations
6. **Test state transitions** - Unit test node input/output shapes

---

## Next Chapter: Building Your First Graph

In Chapter 3, we'll build a complete, working graph from scratch with multiple nodes, conditional edges, and checkpointing.