# Chapter 6: Edges - Conditional Logic and Routing

## Edge Types in LangGraph

Edges define the control flow between nodes. LangGraph supports several edge types:

```
Edge Types
├── Direct Edges (unconditional)
├── Conditional Edges (branching)
├── Entry Point (start node)
├── End Point (terminal)
└── Dynamic Edges (runtime routing)
```

---

## 1. Direct Edges

### Simple Linear Flow

```python
graph.add_edge("node_a", "node_b")
graph.add_edge("node_b", "node_c")
graph.add_edge("node_c", END)

# Or chain:
graph.add_edge("node_a", "node_b", "node_c", END)
```

### Multiple Outgoing Edges (Fan-out)

```python
# One node to multiple nodes (parallel execution)
graph.add_edge("start", "process_a")
graph.add_edge("start", "process_b")
graph.add_edge("start", "process_c")

# All three run in parallel
# Then fan-in:
graph.add_edge("process_a", "aggregate")
graph.add_edge("process_b", "aggregate")
graph.add_edge("process_c", "aggregate")
```

---

## 2. Conditional Edges

### Basic Conditional Edge

```python
def route_decision(state: State) -> Literal["path_a", "path_b", "path_c"]:
    """Routing function returns next node name."""
    if state["score"] > 0.8:
        return "path_a"
    elif state["score"] > 0.5:
        return "path_b"
    return "path_c"

graph.add_conditional_edges(
    "decision_node",
    route_decision,
    {
        "path_a": "node_a",
        "path_b": "node_b",
        "path_c": "node_c"
    }
)
```

### Conditional Edge with Multiple Targets

```python
def route_parallel(state: State) -> list[str]:
    """Return multiple nodes for parallel execution."""
    targets = []
    if state["need_research"]:
        targets.append("research")
    if state["need_analysis"]:
        targets.append("analysis")
    if state["need_writing"]:
        targets.append("writing")
    return targets or ["default"]

graph.add_conditional_edges(
    "router",
    route_parallel,
    {
        "research": "research",
        "analysis": "analysis",
        "writing": "writing",
        "default": "default_node"
    }
)
```

### Conditional Edge with Send (Dynamic Parallelism)

```python
from langgraph.constants import Send

def dynamic_fanout(state: State) -> list[Send]:
    """Dynamically create parallel tasks."""
    tasks = state.get("tasks", [])
    return [
        Send("worker", {"task": task, "shared_data": state["shared"]})
        for task in tasks
    ]

graph.add_conditional_edges("planner", dynamic_fanout)
graph.add_edge("worker", "aggregator")
```

---

## 3. Routing Functions Deep Dive

### Router with State Inspection

```python
def intelligent_router(state: AgentState) -> str:
    """Route based on multiple state factors."""
    last_message = state["messages"][-1]
    
    # Check for tool calls
    if hasattr(last_message, "tool_calls") and last_message.tool_calls:
        return "tools"
    
    # Check for structured output indicating action
    if hasattr(last_message, "additional_kwargs"):
        action = last_message.additional_kwargs.get("function_call", {}).get("name")
        if action:
            return f"handle_{action}"
    
    # Check conversation state
    if state.get("requires_human"):
        return "human_review"
    
    if state.get("iteration", 0) >= state.get("max_iterations", 10):
        return "finalize"
    
    # Default: continue conversation
    return "agent"
```

### Router with Confidence Scoring

```python
from typing import Literal

def confidence_router(state: State) -> Literal["high_confidence", "low_confidence", "uncertain"]:
    """Route based on confidence thresholds."""
    confidence = state.get("confidence", 0.0)
    
    if confidence >= 0.9:
        return "high_confidence"
    elif confidence >= 0.5:
        return "low_confidence"
    return "uncertain"

graph.add_conditional_edges("evaluator", confidence_router, {
    "high_confidence": "proceed",
    "low_confidence": "verify",
    "uncertain": "gather_more_info"
})
```

### Router with Fallback

```python
def safe_router(state: State) -> str:
    """Router with fallback handling."""
    try:
        # Primary routing logic
        result = complex_routing_logic(state)
        if result in VALID_TARGETS:
            return result
    except Exception as e:
        logger.error(f"Routing failed: {e}")
    
    # Fallback
    return "error_handler"
```

---

## 4. Entry and End Points

### Entry Point

```python
# Single entry point
graph.set_entry_point("start_node")

# Or conditional entry (rare)
graph.set_conditional_entry_point(
    lambda state: "auth" if state.get("needs_auth") else "main"
)
```

### End Points

```python
# Explicit end
graph.add_edge("final_node", END)

# Multiple paths to END
graph.add_edge("success_path", END)
graph.add_edge("error_path", END)

# Conditional end
def should_end(state: State) -> bool:
    return state.get("status") == "complete"

graph.add_conditional_edges("process", should_end, {
    True: END,
    False: "continue_processing"
})
```

---

## 5. Advanced Routing Patterns

### Pattern 1: State Machine Routing

```python
class WorkflowState(TypedDict):
    stage: Literal["init", "validate", "process", "review", "approve", "complete"]
    data: dict

def stage_router(state: WorkflowState) -> str:
    """Route based on workflow stage."""
    stage = state["stage"]
    transitions = {
        "init": "validate",
        "validate": "process" if state["data"].get("valid") else "init",
        "process": "review",
        "review": "approve" if state["data"].get("approved") else "process",
        "approve": "complete",
        "complete": END
    }
    return transitions.get(stage, "init")

graph = StateGraph(WorkflowState)
graph.add_node("init", init_node)
graph.add_node("validate", validate_node)
graph.add_node("process", process_node)
graph.add_node("review", review_node)
graph.add_node("approve", approve_node)
graph.add_node("complete", complete_node)

graph.set_entry_point("init")
graph.add_conditional_edges("init", stage_router)
graph.add_conditional_edges("validate", stage_router)
graph.add_conditional_edges("process", stage_router)
graph.add_conditional_edges("review", stage_router)
graph.add_conditional_edges("approve", stage_router)
graph.add_edge("complete", END)
```

### Pattern 2: Multi-Agent Handoff

```python
class MultiAgentState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]
    current_agent: Literal["researcher", "writer", "reviewer", "editor"]
    handoff_reason: str

def agent_router(state: MultiAgentState) -> str:
    """Route between agents based on handoff signals."""
    last_message = state["messages"][-1]
    
    # Check for explicit handoff in message
    if "HANDOFF TO" in last_message.content:
        target = last_message.content.split("HANDOFF TO")[1].strip().split()[0].lower()
        if target in ["researcher", "writer", "reviewer", "editor"]:
            return target
    
    # Default: continue with current agent
    return state["current_agent"]

graph.add_node("researcher", researcher_node)
graph.add_node("writer", writer_node)
graph.add_node("reviewer", reviewer_node)
graph.add_node("editor", editor_node)

graph.add_conditional_edges("researcher", agent_router, {
    "researcher": "researcher",
    "writer": "writer",
    "reviewer": "reviewer",
    "editor": "editor"
})
# Repeat for other agents...
```

### Pattern 3: Retry with Backoff Routing

```python
class RetryState(TypedDict):
    attempt: int
    max_attempts: int
    last_error: str
    backoff_seconds: int

def retry_router(state: RetryState) -> Literal["retry", "fail", "escalate"]:
    if state["attempt"] >= state["max_attempts"]:
        if state["attempt"] >= state["max_attempts"] + 2:
            return "escalate"
        return "fail"
    return "retry"

graph.add_node("attempt", attempt_node)
graph.add_node("wait", wait_node)  # Implements backoff
graph.add_node("fail", fail_node)
graph.add_node("escalate", escalate_node)

graph.add_conditional_edges("attempt", retry_router, {
    "retry": "wait",
    "fail": "fail",
    "escalate": "escalate"
})
graph.add_edge("wait", "attempt")
```

### Pattern 4: Parallel with Synchronization Barrier

```python
from langgraph.constants import Send

class ParallelState(TypedDict):
    tasks: list[dict]
    results: Annotated[list[dict], operator.add]
    completed_count: Annotated[int, operator.add]
    total_tasks: int

def parallel_router(state: ParallelState) -> list[Send]:
    """Fan out to parallel workers."""
    pending = state["tasks"][state["completed_count"]:]
    return [
        Send("worker", {"task": task, "task_index": i})
        for i, task in enumerate(pending)
    ]

def barrier_router(state: ParallelState) -> Literal["continue", "done"]:
    """Synchronize parallel results."""
    if state["completed_count"] >= state["total_tasks"]:
        return "done"
    return "continue"  # Wait for more (handled by conditional edge)

graph.add_node("dispatcher", lambda s: s)  # Pass-through
graph.add_node("worker", worker_node)
graph.add_node("aggregator", aggregator_node)

graph.set_entry_point("dispatcher")
graph.add_conditional_edges("dispatcher", parallel_router)
graph.add_edge("worker", "aggregator")
graph.add_conditional_edges("aggregator", barrier_router, {
    "continue": "aggregator",  # Wait (in practice, worker→aggregator auto-triggers)
    "done": "finalize"
})
```

---

## 6. Dynamic Graph Modification

### Runtime Edge Addition

```python
from langgraph.graph import StateGraph

def build_dynamic_graph(config: dict) -> StateGraph:
    """Build graph with config-dependent edges."""
    graph = StateGraph(State)
    
    graph.add_node("start", start_node)
    graph.add_node("process_a", process_a_node)
    graph.add_node("process_b", process_b_node)
    graph.add_node("process_c", process_c_node)
    graph.add_node("end", end_node)
    
    graph.set_entry_point("start")
    
    # Conditional edges based on config
    if config.get("enable_a"):
        graph.add_edge("start", "process_a")
    if config.get("enable_b"):
        graph.add_edge("start", "process_b")
    if config.get("enable_c"):
        graph.add_edge("start", "process_c")
    
    # All converge
    for node in ["process_a", "process_b", "process_c"]:
        if graph.nodes.get(node):
            graph.add_edge(node, "end")
    
    return graph
```

### Self-Modifying Graphs (Advanced)

```python
def adaptive_node(state: State) -> Command:
    """Node that can modify graph structure."""
    # In LangGraph 0.2+, you can use dynamic edges
    # This is conceptual - actual API may vary
    
    if state["complexity"] > 10:
        # Would add more processing nodes dynamically
        return Command(
            update={"needs_deep_analysis": True},
            goto="deep_analysis"
        )
    return Command(goto="quick_analysis")
```

---

## 7. Edge Visualization and Debugging

### Print Graph Structure

```python
app = graph.compile()

# Get graph structure
graph_structure = app.get_graph()

print("Nodes:")
for node_id, node in graph_structure.nodes.items():
    print(f"  {node_id}: {node.data.get('name', 'unnamed')}")

print("\nEdges:")
for edge in graph_structure.edges:
    print(f"  {edge.source} -> {edge.target}")
    if edge.conditional:
        print(f"    (conditional)")

# Mermaid diagram
print("\nMermaid:")
print(graph_structure.draw_mermaid())

# With state schema
print(graph_structure.draw_mermaid(with_state=True))
```

### Trace Execution Path

```python
def trace_execution(app, initial_state, config):
    """Trace the execution path through the graph."""
    path = []
    
    def trace_callback(event):
        if event["type"] == "node":
            path.append({
                "node": event["node"],
                "timestamp": event["timestamp"],
                "state_keys": list(event["state"].keys())
            })
    
    result = app.invoke(initial_state, config, callbacks=[trace_callback])
    return result, path

result, path = trace_execution(app, initial_state, config)
for step in path:
    print(f"{step['node']} at {step['timestamp']}")
```

---

## 8. Common Edge Patterns

| Pattern | Implementation |
|---------|----------------|
| **Linear** | `add_edge(a, b, c, END)` |
| **Branch** | `add_conditional_edges(node, router, {"a": "node_a", "b": "node_b"})` |
| **Parallel** | Multiple `add_edge(start, worker_i)` then `add_edge(worker_i, aggregator)` |
| **Loop** | `add_conditional_edges(node, should_continue, {"loop": node, "exit": next})` |
| **State Machine** | Router returns next state name |
| **Handoff** | Router reads message content for target |
| **Retry** | Counter in state, router checks threshold |
| **Barrier** | Aggregator counts completions |

---

## 9. Best Practices

### 1. Keep Routing Logic Pure

```python
# ✅ Good: Pure function, easy to test
def router(state: State) -> str:
    return "a" if state["value"] > 5 else "b"

# ❌ Bad: Side effects in router
def bad_router(state: State) -> str:
    log_routing_decision(state)  # Side effect!
    database.write(...)  # Side effect!
    return "a"
```

### 2. Use Literal Types for Type Safety

```python
from typing import Literal

def router(state: State) -> Literal["node_a", "node_b", "node_c"]:
    # IDE validates return values match edge targets
    ...
```

### 3. Handle Unknown Routes

```python
def safe_router(state: State) -> str:
    route = compute_route(state)
    valid_routes = ["a", "b", "c", "error"]
    return route if route in valid_routes else "error"
```

### 4. Document Edge Contracts

```python
def router(state: State) -> str:
    """
    Routes based on state['decision']:
    
    - "research" -> research_node (needs: topic, depth)
    - "write" -> writer_node (needs: findings, outline)  
    - "review" -> reviewer_node (needs: draft)
    - "finalize" -> finalize_node (needs: approved_draft)
    - "error" -> error_node (always valid)
    """
    ...
```

---

## Summary

| Edge Type | Use Case | Syntax |
|-----------|----------|--------|
| **Direct** | Linear flow | `add_edge(a, b)` |
| **Conditional** | Branching | `add_conditional_edges(node, router, targets)` |
| **Entry** | Graph start | `set_entry_point(node)` |
| **End** | Graph termination | `add_edge(node, END)` |
| **Dynamic** | Runtime routing | `add_conditional_edges(node, router_returning_Send)` |

---

## Next Chapter: Checkpointing and Persistence

In Chapter 7, we'll explore checkpointing in depth: different checkpointer backends, serialization, migration, and production deployment patterns.