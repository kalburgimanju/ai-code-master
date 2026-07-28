# Chapter 12: Testing and Debugging Graphs

## Testing Strategy

```
Testing Pyramid for LangGraph
├── Unit Tests (Nodes)
├── Integration Tests (Graph flows)
├── Contract Tests (State schemas)
├── Property Tests (Invariants)
└── End-to-End Tests (Full scenarios)
```

---

## Unit Testing Nodes

### Pure Function Nodes

```python
# nodes.py
def research_node(state: ResearchState) -> dict:
    findings = do_research(state["topic"])
    return {"findings": [findings], "step": state["step"] + 1}

# test_nodes.py
import pytest
from nodes import research_node

def test_research_node():
    state = {"topic": "AI Safety", "step": 0, "findings": []}
    result = research_node(state)
    
    assert "findings" in result
    assert len(result["findings"]) == 1
    assert result["step"] == 1
    assert "AI Safety" in result["findings"][0]
```

### Nodes with Dependencies

```python
# Mock external dependencies
def test_llm_node_with_mock(monkeypatch):
    mock_response = AIMessage(content="Test response")
    
    def mock_invoke(*args, **kwargs):
        return mock_response
    
    monkeypatch.setattr(ChatOpenAI, "invoke", mock_invoke)
    
    state = {"messages": [HumanMessage(content="Hello")]}
    result = llm_node(state)
    
    assert result["messages"][0].content == "Test response"
```

### Async Nodes

```python
@pytest.mark.asyncio
async def test_async_node():
    state = {"urls": ["http://example.com"]}
    result = await async_fetch_node(state)
    
    assert "content" in result
    assert len(result["content"]) == 1
```

---

## Integration Testing Graphs

### Test Graph Compilation

```python
def test_graph_compiles():
    graph = build_research_graph()
    app = graph.compile()
    
    # Verify structure
    assert "research" in app.get_graph().nodes
    assert "synthesize" in app.get_graph().nodes
    assert app.get_graph().edges  # Has edges
```

### Test Full Execution

```python
def test_full_research_flow():
    graph = build_research_graph()
    checkpointer = MemorySaver()
    app = graph.compile(checkpointer=checkpointer)
    
    config = {"configurable": {"thread_id": "test-123"}}
    
    result = app.invoke({
        "topic": "Test Topic",
        "messages": [HumanMessage(content="Research Test Topic")]
    }, config)
    
    assert result["status"] == "complete"
    assert len(result["findings"]) > 0
    assert "final_report" in result
```

### Test with Checkpointing

```python
def test_checkpoint_resume():
    graph = build_graph()
    checkpointer = MemorySaver()
    app = graph.compile(checkpointer=checkpointer)
    
    config = {"configurable": {"thread_id": "resume-test"}}
    
    # First invocation
    result1 = app.invoke({"input": "step1"}, config)
    assert result1["step"] == 1
    
    # Second invocation (continues)
    result2 = app.invoke({"input": "step2"}, config)
    assert result2["step"] == 2
    assert len(result2["history"]) == 2
```

---

## Property-Based Testing

```python
from hypothesis import given, strategies as st
import pytest

# State schema validation
@given(st.data())
def test_state_schema_valid(data):
    # Generate valid state
    state = generate_valid_state(data)
    
    # Should not raise
    validated = ResearchState(**state)
    assert validated.topic == state["topic"]

# Invariant: findings only increase
@given(st.lists(st.text()), st.text())
def test_findings_monotonic(existing_findings, new_finding):
    state = {"findings": existing_findings}
    result = research_node({**state, "topic": "test"})
    
    # Findings should only grow
    assert len(result["findings"]) >= len(existing_findings)

# Invariant: step counter increases
@given(st.integers(min_value=0, max_value=10))
def test_step_increments(step):
    state = {"step": step, "topic": "test"}
    result = research_node(state)
    assert result["step"] == step + 1
```

---

## Contract Testing

### State Schema Contracts

```python
# contracts.py
from pydantic import BaseModel, ValidationError

class ResearchStateContract(BaseModel):
    topic: str
    plan: list[str]
    findings: list[dict]
    current_step: int
    max_steps: int
    status: Literal["planning", "researching", "synthesizing", "complete"]

def validate_state(state: dict) -> ResearchStateContract:
    try:
        return ResearchStateContract(**state)
    except ValidationError as e:
        raise ContractViolation(f"Invalid state: {e}")

# In nodes
def research_node(state: dict) -> dict:
    validated = validate_state(state)
    # ... process
    return {"findings": [finding], "current_step": validated.current_step + 1}
```

---

## Debugging Techniques

### 1. Visual Graph Inspection

```python
def debug_graph_structure(app):
    graph = app.get_graph()
    
    print("=== NODES ===")
    for node_id, node in graph.nodes.items():
        print(f"  {node_id}: {node.data.get('name', 'unnamed')}")
    
    print("\n=== EDGES ===")
    for edge in graph.edges:
        cond = " (conditional)" if edge.conditional else ""
        print(f"  {edge.source} -> {edge.target}{cond}")
    
    print("\n=== MERMAID ===")
    print(graph.draw_mermaid())

# Usage
app = graph.compile()
debug_graph_structure(app)
```

### 2. Execution Tracing

```python
class TracingCallback:
    def __init__(self):
        self.trace = []
    
    def on_node_start(self, node_name, state):
        self.trace.append({
            "event": "node_start",
            "node": node_name,
            "state_keys": list(state.keys()),
            "timestamp": time.time()
        })
    
    def on_node_end(self, node_name, state, output):
        self.trace.append({
            "event": "node_end",
            "node": node_name,
            "output_keys": list(output.keys()) if output else [],
            "timestamp": time.time()
        })
    
    def on_edge_traverse(self, source, target):
        self.trace.append({
            "event": "edge",
            "from": source,
            "to": target,
            "timestamp": time.time()
        })

# Usage
tracer = TracingCallback()
result = app.invoke(input, config, callbacks=[tracer])

# Print trace
for event in tracer.trace:
    print(f"[{event['timestamp']:.3f}] {event['event']}: {event}")
```

### 3. State Diffing

```python
def diff_states(before: dict, after: dict) -> dict:
    """Show what changed between states."""
    changes = {}
    all_keys = set(before.keys()) | set(after.keys())
    
    for key in all_keys:
        b = before.get(key, "<MISSING>")
        a = after.get(key, "<MISSING>")
        if b != a:
            changes[key] = {"before": b, "after": a}
    
    return changes

# In callback
def on_node_end(self, node_name, state, output):
    if hasattr(self, 'prev_state'):
        diff = diff_states(self.prev_state, state)
        if diff:
            print(f"\n[{node_name}] State changes:")
            for k, v in diff.items():
                print(f"  {k}: {v['before']} -> {v['after']}")
    self.prev_state = state
```

### 4. Time-Travel Debugging

```python
def debug_checkpoint_history(thread_id: str):
    """Inspect full execution history."""
    checkpoints = list(checkpointer.list({"configurable": {"thread_id": thread_id}}))
    
    print(f"History for {thread_id} ({len(checkpoints)} checkpoints):\n")
    
    for i, cp in enumerate(reversed(checkpoints)):  # Oldest first
        state = cp.channel_values
        step = cp.metadata.get("step", i)
        
        print(f"--- Step {step} ---")
        print(f"  Checkpoint: {cp.config['configurable']['checkpoint_id']}")
        print(f"  Status: {state.get('status', 'N/A')}")
        print(f"  Messages: {len(state.get('messages', []))}")
        print(f"  Findings: {len(state.get('findings', []))}")
        
        # Show last message
        msgs = state.get('messages', [])
        if msgs:
            last = msgs[-1]
            print(f"  Last: {last.__class__.__name__}: {str(last.content)[:100]}")
        print()
```

---

## Mocking External Services

### LLM Mocking

```python
class MockLLM:
    def __init__(self, responses: dict[str, str]):
        self.responses = responses
        self.call_count = 0
    
    def invoke(self, messages, **kwargs):
        self.call_count += 1
        # Match by last message content
        last_msg = messages[-1].content if messages else ""
        for key, response in self.responses.items():
            if key in last_msg:
                return AIMessage(content=response)
        return AIMessage(content="Default response")

# Usage
mock_llm = MockLLM({
    "plan": "1. Research\n2. Write\n3. Review",
    "research": "Found key information about topic",
    "write": "Here is the article...",
})

# Patch
with patch('nodes.llm', mock_llm):
    result = app.invoke(input, config)
```

### Tool Mocking

```python
@tool
def mock_search(query: str) -> str:
    return f"Mock results for: {query}"

# Replace tools
original_tools = agent.tools
agent.tools = [mock_search]

# Or use ToolNode with mocks
mock_tool_node = ToolNode([mock_search])
graph.add_node("tools", mock_tool_node)
```

---

## CI/CD Integration

### GitHub Actions Test

```yaml
# .github/workflows/test.yml
name: Test LangGraph

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: |
          pip install -e ".[test]"
      
      - name: Run unit tests
        run: pytest tests/unit -v
      
      - name: Run integration tests
        run: pytest tests/integration -v
      
      - name: Run property tests
        run: pytest tests/property -v
      
      - name: Type check
        run: ty check .
      
      - name: Lint
        run: ruff check .
```

### Coverage Requirements

```ini
# pyproject.toml
[tool.pytest.ini_options]
addopts = "--cov=src --cov-fail-under=80"
```

---

## Common Test Patterns

| Pattern | When to Use |
|---------|-------------|
| **Fixture graph** | Reuse compiled graph across tests |
| **Parametrized inputs** | Test multiple scenarios |
| **Snapshot testing** | Verify output structure stable |
| **Chaos testing** | Random failures, timeouts |
| **Load testing** | Concurrent executions |

---

## Summary

| Test Type | Coverage | Speed | Confidence |
|-----------|----------|-------|------------|
| Unit (nodes) | High | Fast | Medium |
| Integration | Medium | Medium | High |
| Property | High | Medium | High |
| E2E | Low | Slow | Highest |

---

## Next Chapter: Production Deployment

In Chapter 13, we'll cover deploying LangGraph applications to production: scaling, monitoring, and operational best practices.