# Chapter 1: Introduction to LangGraph

## What is LangGraph?

LangGraph is a library for building stateful, multi-actor applications with Large Language Models (LLMs). Built on top of LangChain, it extends the capabilities of LangChain by enabling cyclic graphs, state management, and multi-agent coordination—capabilities that go beyond the linear chains of traditional LLM orchestration.

### Why LangGraph?

Traditional LLM chains (like LangChain's `LLMChain` or `SequentialChain`) are inherently **linear** and **stateless**. Each step receives input, processes it, and passes output to the next step. This works well for simple pipelines but breaks down when you need:

1. **Cycles and Loops** - Iterative refinement, self-correction, or multi-step reasoning
2. **State Persistence** - Maintaining conversation history, intermediate results, or user context across interactions
3. **Multi-Agent Coordination** - Multiple agents collaborating, debating, or delegating tasks
4. **Human-in-the-Loop** - Pausing for human input, approval, or correction mid-workflow
5. **Branching and Merging** - Conditional logic, parallel execution, and result aggregation

LangGraph solves these by modeling your application as a **stateful graph** where:
- **Nodes** are computation units (LLM calls, tools, human inputs, custom functions)
- **Edges** define the flow between nodes (including conditional/branching edges)
- **State** is a shared, mutable object that persists across the entire graph execution

## Core Concepts

### 1. StateGraph

The core abstraction in LangGraph is the `StateGraph`. It consists of:

```python
from langgraph.graph import StateGraph, State

class AgentState(State):
    messages: list[BaseMessage]
    user_input: str
    iteration: int

graph = StateGraph(AgentState)
```

**State** is a TypedDict (or Pydantic model) that defines the schema of data flowing through your graph. Every node receives the current state and returns updates to it.

### 2. Nodes

Nodes are the computational units of your graph. They can be:

- **LLM Nodes**: Call an LLM with a prompt template
- **Tool Nodes**: Execute tools (API calls, database queries, code execution)
- **Human Nodes**: Pause for human input/approval
- **Custom Functions**: Any Python function that takes state and returns updates

```python
def call_model(state: AgentState):
    response = model.invoke(state["messages"])
    return {"messages": [response], "iteration": state["iteration"] + 1}

graph.add_node("agent", call_model)
```

### 3. Edges

Edges define the control flow between nodes:

- **Direct Edges**: `graph.add_edge("node_a", "node_b")` - always goes from A to B
- **Conditional Edges**: `graph.add_conditional_edges("node_a", routing_function)` - routes based on state
- **Entry Point**: `graph.set_entry_point("node_a")` - where execution starts
- **End Point**: `graph.add_edge("node_b", END)` - where execution ends

```python
def should_continue(state: AgentState) -> Literal["continue", "end"]:
    if state["iteration"] > 5:
        return "end"
    return "continue"

graph.add_conditional_edges("agent", should_continue, {
    "continue": "tool",
    "end": END
})
```

### 4. State Management

State in LangGraph is **mutable and persistent**. When a node returns a dictionary, LangGraph merges it with the existing state using a reducer function (default: shallow merge for dicts, concatenation for lists).

```python
# State schema with custom reducers
from typing import Annotated
from langgraph.graph import add_messages

class AgentState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]  # Concatenates lists
    user_input: str
    iteration: int
    tools_used: Annotated[list[str], operator.add]  # Concatenates lists
```

## LangGraph vs. LangChain Chains

| Feature | LangChain Chains | LangGraph |
|---------|-----------------|-----------|
| **Flow Control** | Linear (sequential) | Graph-based (cycles, branches) |
| **State** | Implicit (passed between chains) | Explicit, typed, persistent |
| **Cycles/Loops** | Not supported | Native support |
| **Human-in-the-loop** | Limited | First-class support |
| **Multi-agent** | Difficult | Native (multiple agents as nodes) |
| **Checkpointing** | Manual | Built-in checkpointing |
| **Debugging** | Limited | Visual graph, time-travel debugging |

## When to Use LangGraph

✅ **Use LangGraph when:**
- Building agents that need to reason iteratively (ReAct, Reflexion, etc.)
- Implementing multi-agent systems (debate, collaboration, hierarchy)
- Building chatbots with memory and tool use
- Creating workflows with human approval gates
- Implementing RAG with iterative retrieval/refinement
- Building code agents that write, test, and debug iteratively

❌ **Stick with LangChain Chains when:**
- Simple linear pipelines (summarization, translation, extraction)
- One-off LLM calls with simple prompt templates
- Prototyping simple chains quickly

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      StateGraph                             │
├─────────────────────────────────────────────────────────────┤
│  State: TypedDict with reducers                            │
├─────────────────────────────────────────────────────────────┤
│  Nodes:                                                    │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │  LLM    │──│  Tool   │──│ Human   │──│ Custom  │        │
│  │  Node   │  │  Node   │  │  Node   │  │  Fn     │        │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘        │
│       │           │            │           │                │
│       └───────────┼────────────┴───────────┘                │
│                   ▼                                         │
│         ┌─────────────────┐                                 │
│         │  Conditional    │                                 │
│         │  Router         │                                 │
│         └─────────────────┘                                 │
│                   │                                         │
│         ┌─────────┴─────────┐                               │
│         ▼                   ▼                               │
│    ┌─────────┐         ┌─────────┐                          │
│    │ Continue│         │  END    │                          │
│    └─────────┘         └─────────┘                          │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
              ┌─────────────────────────┐
              │    Checkpointer         │
              │  (MemorySaver,          │
              │   SqliteSaver, etc.)    │
              └─────────────────────────┘
```

## Installation

```bash
pip install langgraph langchain-openai langchain-anthropic langchain-core
```

For checkpointing (persistence):
```bash
pip install langgraph-checkpoint-sqlite  # SQLite
pip install langgraph-checkpoint-postgres  # PostgreSQL
```

## Your First Graph: Hello World

Let's build a simple graph that greets the user and remembers their name:

```python
from typing import TypedDict, Annotated
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from langchain_openai import ChatOpenAI

# 1. Define State
class GreetingState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]
    user_name: str

# 2. Create the graph
graph = StateGraph(GreetingState)

# 3. Define nodes
llm = ChatOpenAI(model="gpt-4o-mini")

def greet_node(state: GreetingState):
    if not state.get("user_name"):
        return {"messages": [AIMessage(content="Hello! What's your name?")]}
    
    response = llm.invoke([
        {"role": "system", "content": f"Greet {state['user_name']} warmly."},
        *state["messages"]
    ])
    return {"messages": [response]}

def extract_name(state: GreetingState):
    last_message = state["messages"][-1]
    if isinstance(last_message, HumanMessage) and not state.get("user_name"):
        return {"user_name": last_message.content}
    return {}

graph.add_node("greet", greet_node)
graph.add_node("extract_name", extract_name)

# 4. Define edges
graph.set_entry_point("extract_name")
graph.add_edge("extract_name", "greet")
graph.add_edge("greet", END)

# 5. Compile and run
app = graph.compile()

# Run with checkpointing
config = {"configurable": {"thread_id": "user-123"}}
result = app.invoke({"messages": [HumanMessage(content="Alice")]}, config)
```

## Checkpointing: Persistence Made Easy

One of LangGraph's most powerful features is **checkpointing**—automatic state persistence at every step:

```python
from langgraph.checkpoint.sqlite import SqliteSaver

# Persistent storage
checkpointer = SqliteSaver.from_conn_string("checkpoints.db")
app = graph.compile(checkpointer=checkpointer)

# Resume from any point
config = {"configurable": {"thread_id": "user-123"}}
result = app.invoke(input_data, config)
# Later... resume from exactly where you left off
result = app.invoke(new_input, config)
```

Checkpointers support:
- **MemorySaver** - In-memory (development)
- **SqliteSaver** - SQLite (local persistence)
- **PostgresSaver** - PostgreSQL (production)

## Visualizing Your Graph

LangGraph provides built-in visualization:

```python
# Generate Mermaid diagram
print(app.get_graph().draw_mermaid())

# Or save as PNG (requires graphviz)
app.get_graph().draw_mermaid_png(output_file_path="graph.png")
```

## Summary

In this chapter, you learned:
- **LangGraph** extends LangChain with stateful, cyclic graph execution
- **StateGraph** is the core abstraction: typed state + nodes + edges
- **Nodes** are computation units; **Edges** define flow (including conditional)
- **State** is persistent, typed, and merged via reducers
- **Checkpointing** provides automatic persistence and time-travel debugging
- **Use LangGraph** for agents, multi-agent systems, human-in-the-loop, and iterative workflows

---

## Next Chapter: Understanding State Graphs

In Chapter 2, we'll dive deep into the `StateGraph` architecture, exploring state schemas, reducers, and advanced state management patterns.