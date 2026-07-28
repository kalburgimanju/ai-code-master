# Chapter 3: Building Your First Graph

## Complete Working Example: Research Assistant

Let's build a complete research assistant that:
1. Takes a research topic
2. Plans the research approach
3. Searches for information (simulated)
4. Synthesizes findings
5. Provides a final report

### Project Setup

```bash
mkdir langgraph-research-assistant
cd langgraph-research-assistant
pip install langgraph langchain-openai langchain-anthropic langchain-core langgraph-checkpoint-sqlite
```

### Complete Code

```python
# research_assistant.py
from typing import TypedDict, Annotated, Literal, Optional
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from langgraph.checkpoint.sqlite import SqliteSaver
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
import operator
import json
import sqlite3
from datetime import datetime

# ============================================================
# 1. STATE DEFINITION
# ============================================================

class ResearchState(TypedDict):
    # Conversation history
    messages: Annotated[list[BaseMessage], add_messages]
    
    # Research context
    topic: str
    plan: list[str]
    completed_steps: Annotated[list[str], operator.add]
    findings: Annotated[list[dict], operator.add]
    
    # Control flow
    current_step: int
    max_steps: int
    status: Literal["planning", "researching", "synthesizing", "complete", "error"]
    
    # Metadata
    session_id: str
    created_at: str
    updated_at: str

# ============================================================
# 2. LLM SETUP
# ============================================================

# Use OpenAI (or swap for Anthropic)
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.7)

# For Anthropic: llm = ChatAnthropic(model="claude-3-5-sonnet-20241022", temperature=0.7)

# ============================================================
# 3. NODES
# ============================================================

def create_plan(state: ResearchState) -> dict:
    """Generate a research plan based on the topic."""
    topic = state["topic"]
    
    prompt = f"""Create a detailed research plan for: "{topic}"
    
    Break it into 3-5 specific, actionable steps. Each step should be a clear research task.
    Return ONLY a JSON array of strings, e.g.:
    ["Step 1: Search for X", "Step 2: Analyze Y", "Step 3: Compare Z"]"""
    
    response = llm.invoke([
        SystemMessage(content="You are a research planner. Output only valid JSON."),
        HumanMessage(content=prompt)
    ])
    
    try:
        plan = json.loads(response.content)
        if not isinstance(plan, list):
            plan = [str(plan)]
    except json.JSONDecodeError:
        # Fallback plan
        plan = [
            f"Search for background information on {topic}",
            f"Find recent developments in {topic}",
            f"Identify key experts and publications on {topic}",
            f"Synthesize findings on {topic}"
        ]
    
    return {
        "plan": plan,
        "current_step": 0,
        "max_steps": len(plan),
        "status": "researching",
        "updated_at": datetime.now().isoformat()
    }

def research_step(state: ResearchState) -> dict:
    """Execute the current research step."""
    step_index = state["current_step"]
    plan = state["plan"]
    
    if step_index >= len(plan):
        return {"status": "synthesizing"}
    
    current_task = plan[step_index]
    
    prompt = f"""Research task: {current_task}
    
    Topic: {state['topic']}
    Previous findings: {json.dumps(state.get('findings', [])[-3:], indent=2)}
    
    Provide a concise research finding for this specific task. Be specific and factual."""
    
    response = llm.invoke([
        SystemMessage(content="You are a research assistant. Provide concise, factual findings."),
        HumanMessage(content=prompt)
    ])
    
    finding = {
        "step": step_index + 1,
        "task": current_task,
        "finding": response.content,
        "timestamp": datetime.now().isoformat()
    }
    
    return {
        "findings": [finding],
        "completed_steps": [current_task],
        "current_step": step_index + 1,
        "updated_at": datetime.now().isoformat()
    }

def synthesize_findings(state: ResearchState) -> dict:
    """Synthesize all findings into a final report."""
    findings = state["findings"]
    topic = state["topic"]
    
    findings_text = "\n\n".join([
        f"**Step {f['step']}: {f['task']}**\n{f['finding']}"
        for f in findings
    ])
    
    prompt = f"""Synthesize these research findings into a comprehensive report on: {topic}

{findings_text}

Structure the report with:
1. Executive Summary
2. Key Findings (organized by theme)
3. Implications
4. Areas for Further Research
5. Sources/References (note: these are simulated findings)"""
    
    response = llm.invoke([
        SystemMessage(content="You are a senior research analyst. Write a professional research report."),
        HumanMessage(content=prompt)
    ])
    
    final_report = response.content
    
    return {
        "messages": [AIMessage(content=final_report)],
        "status": "complete",
        "updated_at": datetime.now().isoformat()
    }

def handle_error(state: ResearchState) -> dict:
    """Handle errors gracefully."""
    error_msg = state.get("error", "Unknown error occurred")
    return {
        "messages": [AIMessage(content=f"Research encountered an error: {error_msg}")],
        "status": "error",
        "updated_at": datetime.now().isoformat()
    }

# ============================================================
# 4. ROUTING / CONDITIONAL EDGES
# ============================================================

def route_research(state: ResearchState) -> Literal["research_step", "synthesize", "error"]:
    """Determine next step based on state."""
    if state["status"] == "error":
        return "error"
    elif state["status"] == "synthesizing":
        return "synthesize"
    elif state["current_step"] < state["max_steps"]:
        return "research_step"
    else:
        return "synthesize"

# ============================================================
# 5. GRAPH CONSTRUCTION
# ============================================================

def build_research_graph() -> StateGraph:
    """Build and return the research assistant graph."""
    graph = StateGraph(ResearchState)
    
    # Add nodes
    graph.add_node("plan", create_plan)
    graph.add_node("research_step", research_step)
    graph.add_node("synthesize", synthesize_findings)
    graph.add_node("error", handle_error)
    
    # Set entry point
    graph.set_entry_point("plan")
    
    # Add edges
    graph.add_edge("plan", "research_step")
    graph.add_conditional_edges(
        "research_step",
        route_research,
        {
            "research_step": "research_step",
            "synthesize": "synthesize",
            "error": "error"
        }
    )
    graph.add_edge("synthesize", END)
    graph.add_edge("error", END)
    
    return graph

# ============================================================
# 6. CHECKPOINTING SETUP
# ============================================================

def create_checkpointer(db_path: str = "research_checkpoints.db"):
    """Create a SQLite checkpointer for persistence."""
    conn = sqlite3.connect(db_path, check_same_thread=False)
    return SqliteSaver(conn)

# ============================================================
# 7. RUNNING THE GRAPH
# ============================================================

def run_research(topic: str, session_id: str = None, resume: bool = False):
    """Run the research assistant."""
    if session_id is None:
        session_id = f"research-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
    
    # Build graph with checkpointer
    graph = build_research_graph()
    checkpointer = create_checkpointer()
    app = graph.compile(checkpointer=checkpointer)
    
    config = {
        "configurable": {
            "thread_id": session_id,
        }
    }
    
    # Initial state
    initial_state = {
        "messages": [HumanMessage(content=f"Research topic: {topic}")],
        "topic": topic,
        "plan": [],
        "completed_steps": [],
        "findings": [],
        "current_step": 0,
        "max_steps": 0,
        "status": "planning",
        "session_id": session_id,
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }
    
    if resume:
        # Resume from last checkpoint
        result = app.invoke(None, config)
    else:
        # Fresh run
        result = app.invoke(initial_state, config)
    
    return result, session_id

def stream_research(topic: str, session_id: str = None):
    """Stream the research process step by step."""
    if session_id is None:
        session_id = f"research-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
    
    graph = build_research_graph()
    checkpointer = create_checkpointer()
    app = graph.compile(checkpointer=checkpointer)
    
    config = {"configurable": {"thread_id": session_id}}
    
    initial_state = {
        "messages": [HumanMessage(content=f"Research topic: {topic}")],
        "topic": topic,
        "plan": [],
        "completed_steps": [],
        "findings": [],
        "current_step": 0,
        "max_steps": 0,
        "status": "planning",
        "session_id": session_id,
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }
    
    print(f"🔬 Starting research on: {topic}")
    print(f"📋 Session: {session_id}")
    print("-" * 50)
    
    for chunk in app.stream(initial_state, config, stream_mode="values"):
        status = chunk.get("status", "unknown")
        step = chunk.get("current_step", 0)
        max_steps = chunk.get("max_steps", 0)
        
        if status == "planning":
            print(f"📝 Planning research...")
        elif status == "researching":
            plan = chunk.get("plan", [])
            if step < len(plan):
                print(f"🔍 Step {step + 1}/{max_steps}: {plan[step]}")
        elif status == "synthesizing":
            print(f"📝 Synthesizing findings...")
        elif status == "complete":
            print(f"✅ Research complete!")
            messages = chunk.get("messages", [])
            if messages:
                last_msg = messages[-1]
                if isinstance(last_msg, AIMessage):
                    print(f"\n📄 Final Report:\n{last_msg.content}")
        elif status == "error":
            print(f"❌ Error: {chunk.get('error', 'Unknown error')}")

# ============================================================
# 8. VISUALIZATION
# ============================================================

def visualize_graph():
    """Generate and display graph visualization."""
    graph = build_research_graph()
    app = graph.compile()
    
    # Mermaid diagram
    mermaid = app.get_graph().draw_mermaid()
    print("Mermaid Diagram:")
    print(mermaid)
    
    # Save as PNG (requires graphviz)
    try:
        app.get_graph().draw_mermaid_png(output_file_path="research_graph.png")
        print("\nGraph saved as research_graph.png")
    except Exception as e:
        print(f"Could not save PNG: {e}")

# ============================================================
# 9. MAIN ENTRY POINT
# ============================================================

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python research_assistant.py <topic> [session_id]")
        print("       python research_assistant.py --visualize")
        print("       python research_assistant.py --resume <session_id>")
        sys.exit(1)
    
    if sys.argv[1] == "--visualize":
        visualize_graph()
        sys.exit(0)
    
    if sys.argv[1] == "--resume":
        session_id = sys.argv[2] if len(sys.argv) > 2 else None
        # Resume would need topic from checkpoint
        print("Resume functionality requires topic from checkpoint")
        sys.exit(0)
    
    topic = sys.argv[1]
    session_id = sys.argv[2] if len(sys.argv) > 2 else None
    
    # Run with streaming
    stream_research(topic, session_id)

```

### Running the Example

```bash
# Run research
python research_assistant.py "Impact of AI on Healthcare"

# With specific session ID (for resuming)
python research_assistant.py "Impact of AI on Healthcare" "my-research-123"

# Visualize graph
python research_assistant.py --visualize
```

### Sample Output

```
🔬 Starting research on: Impact of AI on Healthcare
📋 Session: research-20240115-143022
--------------------------------------------------
📝 Planning research...
🔍 Step 1/4: Search for background information on Impact of AI on Healthcare
🔍 Step 2/4: Find recent developments in Impact of AI on Healthcare
🔍 Step 3/4: Identify key experts and publications on Impact of AI on Healthcare
🔍 Step 4/4: Synthesize findings on Impact of AI on Healthcare
📝 Synthesizing findings...
✅ Research complete!

📄 Final Report:
# Impact of AI on Healthcare: Research Report

## Executive Summary
...

## Key Findings
...

## Implications
...

## Areas for Further Research
...
```

## Understanding the Code

### State Design Decisions

```python
class ResearchState(TypedDict):
    # Messages use add_messages reducer for conversation history
    messages: Annotated[list[BaseMessage], add_messages]
    
    # Plan is replaced entirely (no reducer = replace)
    plan: list[str]
    
    # Completed steps accumulate
    completed_steps: Annotated[list[str], operator.add]
    
    # Findings accumulate with full objects
    findings: Annotated[list[dict], operator.add]
    
    # Simple integers for counters
    current_step: int
    max_steps: int
    
    # Status controls flow
    status: Literal["planning", "researching", "synthesizing", "complete", "error"]
```

### Conditional Routing

```python
def route_research(state: ResearchState) -> Literal["research_step", "synthesize", "error"]:
    if state["status"] == "error":
        return "error"
    elif state["status"] == "synthesizing":
        return "synthesize"
    elif state["current_step"] < state["max_steps"]:
        return "research_step"
    else:
        return "synthesize"

graph.add_conditional_edges(
    "research_step",
    route_research,
    {
        "research_step": "research_step",
        "synthesize": "synthesize",
        "error": "error"
    }
)
```

### Checkpointing for Resumability

```python
checkpointer = SqliteSaver.from_conn_string("checkpoints.db")
app = graph.compile(checkpointer=checkpointer)

# Each thread_id = independent conversation
config = {"configurable": {"thread_id": "user-123"}}

# First run
result = app.invoke(initial_state, config)

# Resume later (e.g., after human input)
result = app.invoke(new_input, config)  # Continues from checkpoint
```

### Streaming Modes

```python
# Stream values (full state at each step)
for chunk in app.stream(input, config, stream_mode="values"):
    print(chunk["status"])

# Stream updates (only what changed)
for chunk in app.stream(input, config, stream_mode="updates"):
    print(chunk)

# Stream messages (for chat interfaces)
for chunk in app.stream(input, config, stream_mode="messages"):
    print(chunk)
```

## Common Patterns Demonstrated

| Pattern | Implementation |
|---------|----------------|
| **Planning → Execution** | `plan` node → conditional loop → `synthesize` |
| **State Accumulation** | `Annotated[list, operator.add]` for findings |
| **Conditional Looping** | `route_research` checks `current_step < max_steps` |
| **Error Handling** | Dedicated `error` node with status routing |
| **Persistence** | `SqliteSaver` checkpointer with `thread_id` |
| **Streaming** | `stream_mode="values"` for progress updates |

## Extending the Graph

### Add Human-in-the-Loop

```python
def human_review(state: ResearchState) -> dict:
    """Pause for human approval before synthesis."""
    # In real app: send to UI, wait for callback
    approval = input(f"Approve synthesis? (y/n): ")
    if approval.lower() != 'y':
        return {"status": "error", "error": "Human rejected synthesis"}
    return {"status": "synthesizing"}

graph.add_node("human_review", human_review)
graph.add_conditional_edges("research_step", route_research, {
    "research_step": "research_step",
    "synthesize": "human_review",  # Insert human review
    "error": "error"
})
graph.add_edge("human_review", "synthesize")
```

### Add Parallel Research

```python
from langgraph.graph import StateGraph, END
from langgraph.constants import Send

def parallel_research(state: ResearchState):
    """Spawn parallel research tasks."""
    tasks = state["plan"][state["current_step"]:state["current_step"]+2]
    return [Send("research_step", {"task": t, **state}) for t in tasks]

graph.add_conditional_edges("plan", parallel_research)
```

### Add Tool Use

```python
from langchain_core.tools import tool
from langgraph.prebuilt import ToolNode

@tool
def search_web(query: str) -> str:
    """Search the web for information."""
    # Implement actual search
    return f"Results for: {query}"

tools = [search_web]
tool_node = ToolNode(tools)

graph.add_node("tools", tool_node)
graph.add_conditional_edges("research_step", should_use_tool, {
    "tools": "tools",
    "continue": "research_step"
})
graph.add_edge("tools", "research_step")
```

## Debugging Tips

### 1. Print State at Each Step

```python
def debug_node(state: ResearchState):
    print(f"DEBUG: {state['status']} - Step {state['current_step']}/{state['max_steps']}")
    return {}
```

### 2. Visualize Graph Structure

```python
app = graph.compile()
print(app.get_graph().draw_mermaid())
```

### 3. Inspect Checkpoints

```python
checkpointer = SqliteSaver.from_conn_string("checkpoints.db")
for checkpoint in checkpointer.list(None):
    print(checkpoint)
```

## Summary

In this chapter, you built a complete research assistant demonstrating:

1. **State Design** - TypedDict with reducers for different merge behaviors
2. **Multi-Node Graph** - Planning, execution, synthesis, error handling
3. **Conditional Edges** - Routing based on state values
4. **Checkpointing** - SQLite persistence for resumability
5. **Streaming** - Real-time progress updates
6. **Visualization** - Mermaid diagrams for documentation

---

## Next Chapter: Advanced Node Patterns

In Chapter 4, we'll explore advanced node patterns including LLM nodes with structured output, tool nodes, human-in-the-loop nodes, and custom function nodes.