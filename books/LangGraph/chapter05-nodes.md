# Chapter 5: Nodes - Functions, Tools, and Subgraphs

## Node Types Overview

Nodes are the computational units of your graph. LangGraph supports several node types:

```
Node Types
├── Function Nodes (custom Python functions)
├── LLM Nodes (LLM calls with prompts)
├── Tool Nodes (prebuilt tool execution)
├── Human-in-the-Loop Nodes (pause for human input)
├── Subgraph Nodes (nested graphs)
└── Conditional/Router Nodes (routing logic)
```

---

## 1. Function Nodes

### Basic Function Node

```python
from langgraph.graph import StateGraph
from typing import TypedDict

class State(TypedDict):
    value: int
    history: list[int]

def add_node(state: State) -> dict:
    """Simple function node."""
    new_value = state["value"] + 1
    return {
        "value": new_value,
        "history": [new_value]  # Accumulated via operator.add
    }

graph = StateGraph(State)
graph.add_node("add_one", add_node)
```

### Async Function Nodes

```python
import asyncio
from typing import TypedDict

class State(TypedDict):
    results: list[str]

async def async_node(state: State) -> dict:
    """Async node for I/O operations."""
    async with aiohttp.ClientSession() as session:
        tasks = [fetch_url(session, url) for url in urls]
        results = await asyncio.gather(*tasks)
    return {"results": results}

graph.add_node("fetch_all", async_node)
```

### Node with Configuration Access

```python
from langchain_core.runnables import RunnableConfig

def configurable_node(state: State, config: RunnableConfig) -> dict:
    """Access runtime configuration."""
    model_name = config.get("configurable", {}).get("model", "gpt-4o-mini")
    temperature = config.get("configurable", {}).get("temperature", 0.7)
    
    llm = ChatOpenAI(model=model_name, temperature=temperature)
    response = llm.invoke(state["messages"])
    return {"messages": [response]}

graph.add_node("llm", configurable_node)
```

### Node with Error Handling

```python
from langgraph.graph import Command

def safe_node(state: State) -> dict | Command:
    """Node that can handle errors gracefully."""
    try:
        result = risky_operation(state["input"])
        return {"output": result}
    except ValidationError as e:
        # Return to validation fix node
        return Command(
            update={"errors": [str(e)], "needs_fix": True},
            goto="fix_validation"
        )
    except Exception as e:
        # Go to error handler
        return Command(
            update={"error": str(e), "status": "failed"},
            goto="error_handler"
        )
```

---

## 2. LLM Nodes

### Basic LLM Node

```python
from langchain_openai import ChatOpenAI
from langchain_core.messages import BaseMessage
from langchain_core.prompts import ChatPromptTemplate

llm = ChatOpenAI(model="gpt-4o-mini")

prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful research assistant."),
    ("human", "{input}"),
])

def llm_node(state: State) -> dict:
    chain = prompt | llm
    response = chain.invoke({"input": state["user_input"]})
    return {"messages": [response]}
```

### LLM with Structured Output

```python
from pydantic import BaseModel, Field
from typing import Literal

class ResearchDecision(BaseModel):
    """Structured output for research routing."""
    action: Literal["search", "synthesize", "ask_human", "complete"]
    query: str = Field(description="Search query if action is search")
    reason: str = Field(description="Reasoning for this decision")
    confidence: float = Field(ge=0, le=1)

structured_llm = llm.with_structured_output(ResearchDecision)

def decision_node(state: State) -> dict:
    prompt = f"""Based on findings: {state['findings']}
    Decide next action."""
    
    decision = structured_llm.invoke(prompt)
    return {
        "next_action": decision.action,
        "search_query": decision.query,
        "reasoning": decision.reason,
        "confidence": decision.confidence,
    }
```

### LLM with Tool Binding

```python
from langchain_core.tools import tool
from langgraph.prebuilt import ToolNode

@tool
def search_web(query: str) -> str:
    """Search the web for information."""
    # Implementation
    return results

@tool
def read_page(url: str) -> str:
    """Read a web page."""
    # Implementation
    return content

tools = [search_web, read_page]
llm_with_tools = llm.bind_tools(tools)

def agent_node(state: State) -> dict:
    """Agent that can use tools."""
    response = llm_with_tools.invoke(state["messages"])
    return {"messages": [response]}

# Tool node executes tool calls automatically
tool_node = ToolNode(tools)

graph.add_node("agent", agent_node)
graph.add_node("tools", tool_node)

# Conditional edge routes to tools if LLM called tools
def should_use_tools(state: State) -> Literal["tools", "continue"]:
    last_msg = state["messages"][-1]
    return "tools" if last_msg.tool_calls else "continue"

graph.add_conditional_edges("agent", should_use_tools, {
    "tools": "tools",
    "continue": "continue"
})
graph.add_edge("tools", "agent")  # Loop back
```

### Streaming LLM Node

```python
def streaming_llm_node(state: State):
    """Streaming LLM node for real-time output."""
    for chunk in llm.stream(state["messages"]):
        yield {"messages": [chunk], "streaming": True}
    yield {"streaming": False}
```

---

## 3. Tool Nodes

### Prebuilt ToolNode

```python
from langgraph.prebuilt import ToolNode
from langchain_core.tools import tool

@tool
def calculator(expression: str) -> float:
    """Evaluate a math expression."""
    return eval(expression)  # Use safe eval in production

@tool
def get_weather(city: str) -> str:
    """Get weather for a city."""
    return f"Weather in {city}: Sunny, 72°F"

tools = [calculator, get_weather]
tool_node = ToolNode(tools)

# Automatically handles tool_calls from LLM messages
graph.add_node("tools", tool_node)
```

### Custom Tool Node

```python
from langgraph.graph import StateGraph
from langchain_core.messages import ToolMessage

class ToolState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]
    tool_results: Annotated[list[dict], operator.add]

def custom_tool_node(state: ToolState) -> dict:
    """Custom tool execution with logging."""
    last_message = state["messages"][-1]
    results = []
    
    for tool_call in last_message.tool_calls:
        tool = tools_by_name[tool_call["name"]]
        start_time = time.time()
        
        try:
            result = tool.invoke(tool_call["args"])
            results.append({
                "tool": tool_call["name"],
                "args": tool_call["args"],
                "result": result,
                "duration": time.time() - start_time,
                "success": True
            })
        except Exception as e:
            results.append({
                "tool": tool_call["name"],
                "error": str(e),
                "success": False
            })
        
        # Create ToolMessage for LLM
        tool_msg = ToolMessage(
            content=str(result) if "result" in results[-1] else str(e),
            tool_call_id=tool_call["id"]
        )
    
    return {
        "messages": [tool_msg for tool_call in last_message.tool_calls],
        "tool_results": results
    }
```

### Tool Node with Retry Logic

```python
from tenacity import retry, stop_after_attempt, wait_exponential

def resilient_tool_node(state: ToolState) -> dict:
    """Tool node with automatic retry."""
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=10)
    )
    def invoke_with_retry(tool, args):
        return tool.invoke(args)
    
    # ... execute tools with retry
```

---

## 4. Human-in-the-Loop Nodes

### Basic Human Node

```python
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver

class HumanState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]
    human_feedback: str
    status: Literal["pending", "approved", "rejected"]

def human_review_node(state: HumanState) -> dict:
    """Pause for human review."""
    # In production: send to UI, wait for callback
    # For CLI: use input()
    print("\n--- HUMAN REVIEW REQUIRED ---")
    print(f"Last AI message: {state['messages'][-1].content}")
    feedback = input("Approve? (y/n/feedback): ")
    
    if feedback.lower() == 'y':
        return {"status": "approved", "human_feedback": "Approved"}
    elif feedback.lower() == 'n':
        return {"status": "rejected", "human_feedback": "Rejected"}
    else:
        return {"status": "pending", "human_feedback": feedback}

graph.add_node("human_review", human_review_node)

def route_after_review(state: HumanState) -> Literal["revise", "continue", "end"]:
    if state["status"] == "approved":
        return "continue"
    elif state["status"] == "rejected":
        return "revise"
    return "end"

graph.add_conditional_edges("human_review", route_after_review, {
    "revise": "agent",
    "continue": "finalize",
    "end": END
})
```

### Async Human Node (Production)

```python
from langgraph.types import interrupt, Command

class AsyncHumanState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]
    review_data: dict

def human_review_async(state: AsyncHumanState) -> Command:
    """Production-ready human-in-the-loop using interrupt."""
    # This PAUSES execution and returns control to caller
    review = interrupt({
        "question": "Please review the output",
        "content": state["messages"][-1].content,
        "options": ["approve", "reject", "edit"]
    })
    
    # When resumed, review contains human response
    if review["action"] == "approve":
        return Command(goto="finalize", update={"status": "approved"})
    elif review["action"] == "reject":
        return Command(goto="revise", update={"status": "rejected", "feedback": review.get("feedback")})
    else:  # edit
        return Command(goto="agent", update={"human_edits": review.get("edits")})

# Usage with checkpointer
checkpointer = MemorySaver()
app = graph.compile(checkpointer=checkpointer)

# First invocation - pauses at interrupt
config = {"configurable": {"thread_id": "review-123"}}
result = app.invoke(initial_state, config)
# result contains interrupt info

# Resume with human input
human_response = {"action": "approve"}
result = app.invoke(Command(resume=human_response), config)
```

### Human Node with UI Integration

```python
# WebSocket/SSE callback pattern for web apps
class HumanReviewNode:
    def __init__(self, callback_url: str):
        self.callback_url = callback_url
        self.pending_reviews = {}
    
    def __call__(self, state: HumanState) -> Command:
        review_id = str(uuid.uuid4())
        
        # Store state for later resume
        self.pending_reviews[review_id] = {
            "state": state,
            "config": get_current_config()
        }
        
        # Send to UI via WebSocket/push
        asyncio.create_task(self._send_to_ui(review_id, state))
        
        # Interrupt - will resume when UI calls back
        return interrupt({"review_id": review_id, "type": "human_review"})
    
    async def _send_to_ui(self, review_id: str, state: HumanState):
        await websocket.send(json.dumps({
            "review_id": review_id,
            "content": state["messages"][-1].content
        }))
    
    def resume(self, review_id: str, human_input: dict) -> Command:
        """Called by UI callback endpoint."""
        pending = self.pending_reviews.pop(review_id)
        # Resume graph execution
        return Command(resume=human_input)
```

---

## 5. Subgraph Nodes

### Basic Subgraph

```python
from langgraph.graph import StateGraph

# Subgraph with its own state
class ResearchSubgraphState(TypedDict):
    topic: str
    findings: Annotated[list[dict], operator.add]
    sources: Annotated[list[str], operator.add]

research_graph = StateGraph(ResearchSubgraphState)
research_graph.add_node("search", search_node)
research_graph.add_node("analyze", analyze_node)
research_graph.set_entry_point("search")
research_graph.add_edge("search", "analyze")
research_graph.add_edge("analyze", END)

# Compile subgraph
research_subgraph = research_graph.compile()

# Main graph
class MainState(TypedDict):
    topic: str
    research_results: dict
    final_report: str

main_graph = StateGraph(MainState)
main_graph.add_node("research", research_subgraph)  # Use as node!
main_graph.add_node("write_report", write_node)
main_graph.set_entry_point("research")
main_graph.add_edge("research", "write_report")
main_graph.add_edge("write_report", END)
```

### Subgraph with State Mapping

```python
# When subgraph state differs from parent state
def map_to_research_state(main_state: MainState) -> ResearchSubgraphState:
    """Extract subgraph input from parent state."""
    return {
        "topic": main_state["topic"],
        "findings": [],
        "sources": []
    }

def map_from_research_state(main_state: MainState, subgraph_output: ResearchSubgraphState) -> dict:
    """Map subgraph output back to parent state."""
    return {
        "research_results": {
            "findings": subgraph_output["findings"],
            "sources": subgraph_output["sources"]
        }
    }

main_graph.add_node(
    "research", 
    research_subgraph,
    # Optional: input/output mappers
    # input=map_to_research_state,
    # output=map_from_research_state
)
```

### Subgraph with Own Checkpointer

```python
# Subgraph with independent persistence
subgraph_checkpointer = SqliteSaver.from_conn_string("subgraph.db")
research_subgraph = research_graph.compile(checkpointer=subgraph_checkpointer)

# Parent with different checkpointer
main_checkpointer = SqliteSaver.from_conn_string("main.db")
main_app = main_graph.compile(checkpointer=main_checkpointer)
```

### Dynamic Subgraph Selection

```python
def select_subgraph(state: MainState) -> str:
    """Choose which subgraph to run based on state."""
    if state["task_type"] == "research":
        return "research_subgraph"
    elif state["task_type"] == "analysis":
        return "analysis_subgraph"
    return "default_subgraph"

main_graph.add_conditional_edges("router", select_subgraph, {
    "research_subgraph": "research",
    "analysis_subgraph": "analysis",
    "default_subgraph": "default"
})
```

---

## 6. Node Composition Patterns

### Sequential Chain

```python
graph.add_node("step1", node1)
graph.add_node("step2", node2)
graph.add_node("step3", node3)

graph.add_edge("step1", "step2")
graph.add_edge("step2", "step3")
graph.add_edge("step3", END)
```

### Parallel Fan-out/Fan-in

```python
from langgraph.constants import Send

def fan_out(state: State) -> list[Send]:
    """Send to multiple parallel nodes."""
    tasks = state["parallel_tasks"]
    return [Send("process_task", {"task": t, **state}) for t in tasks]

def fan_in(state: State) -> dict:
    """Aggregate parallel results."""
    return {"results": state["partial_results"]}

graph.add_node("process_task", process_node)
graph.add_node("aggregate", fan_in)

graph.add_conditional_edges("plan", fan_out)
# Each "process_task" goes to "aggregate" via edge
graph.add_edge("process_task", "aggregate")
```

### Router Pattern

```python
def router(state: State) -> Literal["path_a", "path_b", "path_c"]:
    """Route based on state."""
    if state["type"] == "A":
        return "path_a"
    elif state["type"] == "B":
        return "path_b"
    return "path_c"

graph.add_conditional_edges("router", router, {
    "path_a": "node_a",
    "path_b": "node_b",
    "path_c": "node_c"
})
```

### Loop with Exit Condition

```python
def should_continue(state: State) -> Literal["loop", "exit"]:
    if state["iteration"] >= state["max_iterations"]:
        return "exit"
    if state.get("converged", False):
        return "exit"
    return "loop"

graph.add_node("process", process_node)
graph.add_conditional_edges("process", should_continue, {
    "loop": "process",
    "exit": "finalize"
})
```

---

## 7. Node Best Practices

### 1. Keep Nodes Pure

```python
# ✅ Good: Pure function, no side effects
def pure_node(state: State) -> dict:
    result = compute(state["input"])
    return {"output": result}

# ❌ Bad: Side effects, modifies external state
def impure_node(state: State) -> dict:
    global cache
    cache[state["key"]] = state["value"]  # Side effect!
    database.save(state)  # Side effect!
    return {}
```

### 2. Handle Missing State Gracefully

```python
def robust_node(state: State) -> dict:
    # Use .get() with defaults
    count = state.get("count", 0)
    items = state.get("items", [])
    config = state.get("config", DEFAULT_CONFIG)
    
    return {"count": count + 1}
```

### 3. Use Type Hints

```python
from typing import TypedDict, Annotated, Literal

class NodeState(TypedDict):
    input: str
    output: Annotated[list[str], operator.add]
    status: Literal["pending", "complete", "error"]

def typed_node(state: NodeState) -> dict:
    # IDE autocomplete works!
    return {"output": [state["input"].upper()], "status": "complete"}
```

### 4. Document Node Contracts

```python
def research_node(state: ResearchState) -> dict:
    """
    Research node contract:
    
    Input state requires:
    - topic: str (required)
    - max_sources: int (optional, default=5)
    
    Output state provides:
    - findings: list[dict] (appended via operator.add)
    - sources: list[str] (appended via operator.add)
    - status: "researching" | "complete"
    """
    # Implementation
```

### 5. Test Nodes in Isolation

```python
def test_research_node():
    state = {
        "topic": "AI Safety",
        "max_sources": 3,
        "findings": [],
        "sources": [],
    }
    
    result = research_node(state)
    
    assert "findings" in result
    assert len(result["findings"]) > 0
    assert all("source" in f for f in result["findings"])
```

---

## Summary

| Node Type | Use Case | Key Feature |
|-----------|----------|-------------|
| **Function** | Custom logic, data transformation | Full Python control |
| **LLM** | Generation, reasoning, decisions | Prompt templates, structured output |
| **Tool** | External API calls, computations | Automatic tool_call handling |
| **Human** | Approval, feedback, editing | `interrupt()` for async pause |
| **Subgraph** | Modularity, reuse, isolation | Independent state/checkpointer |

---

## Next Chapter: Edges - Conditional Logic and Routing

In Chapter 6, we'll explore edges in depth: conditional edges, dynamic routing, parallel execution patterns, and advanced flow control.