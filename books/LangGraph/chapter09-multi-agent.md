# Chapter 9: Building Multi-Agent Systems

## Why Multi-Agent?

Single agents have limitations:
- **Context overflow** - Too many tools/tasks for one prompt
- **Specialization** - Different tasks need different expertise
- **Parallelization** - Multiple tasks can run simultaneously
- **Verification** - Agents can check each other's work
- **Scalability** - Add agents without rewriting prompts

---

## Multi-Agent Architectures

```
Architecture Patterns
├── Supervisor/Worker
├── Peer-to-Peer (Collaboration)
├── Hierarchical (Tree)
├── Swarm (Emergent)
├── Debate/Consensus
└── Pipeline (Assembly Line)
```

---

## Pattern 1: Supervisor/Worker

```python
from typing import TypedDict, Annotated, Literal
from langgraph.graph import StateGraph, END
from langgraph.constants import Send
from langchain_openai import ChatOpenAI
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
import operator

llm = ChatOpenAI(model="gpt-4o-mini")

class SupervisorState(TypedDict):
    messages: Annotated[list[BaseMessage], operator.add]
    task: str
    plan: list[str]
    current_step: int
    results: Annotated[list[dict], operator.add]
    next_agent: str

# Worker agents as nodes
def researcher(state: SupervisorState) -> dict:
    task = state["plan"][state["current_step"]]
    prompt = f"Research: {task}\nContext: {state['task']}"
    result = llm.invoke([HumanMessage(content=prompt)])
    return {
        "results": [{"agent": "researcher", "task": task, "output": result.content}],
        "current_step": state["current_step"] + 1
    }

def writer(state: SupervisorState) -> dict:
    task = state["plan"][state["current_step"]]
    context = "\n".join(r["output"] for r in state["results"])
    prompt = f"Write: {task}\nResearch: {context}"
    result = llm.invoke([HumanMessage(content=prompt)])
    return {
        "results": [{"agent": "writer", "task": task, "output": result.content}],
        "current_step": state["current_step"] + 1
    }

def reviewer(state: SupervisorState) -> dict:
    task = state["plan"][state["current_step"]]
    content = state["results"][-1]["output"]
    prompt = f"Review: {task}\nContent: {content}\nProvide feedback."
    result = llm.invoke([HumanMessage(content=prompt)])
    return {
        "results": [{"agent": "reviewer", "task": task, "output": result.content}],
        "current_step": state["current_step"] + 1
    }

# Supervisor decides next agent
def supervisor(state: SupervisorState) -> Literal["researcher", "writer", "reviewer", "complete"]:
    if state["current_step"] >= len(state["plan"]):
        return "complete"
    
    step = state["plan"][state["current_step"]]
    if "research" in step.lower():
        return "researcher"
    elif "write" in step.lower() or "draft" in step.lower():
        return "writer"
    elif "review" in step.lower() or "edit" in step.lower():
        return "reviewer"
    return "writer"

# Planner creates initial plan
def planner(state: SupervisorState) -> dict:
    prompt = f"Create a step-by-step plan for: {state['task']}\nReturn as numbered list."
    response = llm.invoke([HumanMessage(content=prompt)])
    plan = [line.strip() for line in response.content.split("\n") if line.strip()]
    return {"plan": plan, "current_step": 0, "results": []}

# Build graph
graph = StateGraph(SupervisorState)
graph.add_node("planner", planner)
graph.add_node("supervisor", supervisor)
graph.add_node("researcher", researcher)
graph.add_node("writer", writer)
graph.add_node("reviewer", reviewer)

graph.set_entry_point("planner")
graph.add_edge("planner", "supervisor")

graph.add_conditional_edges("supervisor", supervisor, {
    "researcher": "researcher",
    "writer": "writer",
    "reviewer": "reviewer",
    "complete": END
})

for agent in ["researcher", "writer", "reviewer"]:
    graph.add_edge(agent, "supervisor")

app = graph.compile(checkpointer=MemorySaver())
```

---

## Pattern 2: Peer-to-Peer Collaboration

```python
class CollaborationState(TypedDict):
    messages: Annotated[list[BaseMessage], operator.add]
    agents: dict  # agent_name -> agent_state
    shared_context: str
    turn: int
    max_turns: int

def create_agent_node(agent_name: str, system_prompt: str):
    def agent_node(state: CollaborationState) -> dict:
        # Get agent's private state
        agent_state = state["agents"].get(agent_name, {})
        
        # Build messages: shared context + agent's history + new input
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "system", "content": f"Shared context: {state['shared_context']}"},
        ]
        
        # Add agent's private messages
        for msg in agent_state.get("messages", []):
            messages.append(msg)
        
        # Add latest shared message if not from this agent
        if state["messages"] and state["messages"][-1].get("agent") != agent_name:
            messages.append(state["messages"][-1])
        
        response = llm.invoke(messages)
        
        # Update agent's private state
        new_agent_state = {
            "messages": agent_state.get("messages", []) + [
                {"role": "user", "content": messages[-1]["content"]},
                {"role": "assistant", "content": response.content}
            ]
        }
        
        return {
            "messages": [{"agent": agent_name, "content": response.content}],
            "agents": {agent_name: new_agent_state},
            "turn": state["turn"] + 1
        }
    
    return agent_node

# Create agents
researcher_node = create_agent_node("researcher", "You are a researcher. Find facts.")
writer_node = create_agent_node("writer", "You are a writer. Create content.")
critic_node = create_agent_node("critic", "You are a critic. Find flaws.")

# Router for round-robin or smart routing
def router(state: CollaborationState) -> str:
    if state["turn"] >= state["max_turns"]:
        return "finalize"
    
    # Round-robin or content-based routing
    agents = ["researcher", "writer", "critic"]
    return agents[state["turn"] % len(agents)]

def finalize(state: CollaborationState) -> dict:
    # Synthesize final output
    return {"final_output": "..."}

graph = StateGraph(CollaborationState)
graph.add_node("researcher", researcher_node)
graph.add_node("writer", writer_node)
graph.add_node("critic", critic_node)
graph.add_node("finalize", finalize)

graph.set_entry_point("researcher")
graph.add_conditional_edges("researcher", router)
graph.add_conditional_edges("writer", router)
graph.add_conditional_edges("critic", router)
graph.add_edge("finalize", END)
```

---

## Pattern 3: Hierarchical (Tree)

```python
class HierarchicalState(TypedDict):
    task: str
    subtasks: list[dict]
    results: dict  # task_id -> result
    current_level: int

def decompose(state: HierarchicalState) -> dict:
    """Break task into subtasks."""
    prompt = f"Decompose: {state['task']}\nReturn JSON list of subtasks."
    response = llm.invoke([HumanMessage(content=prompt)])
    subtasks = parse_subtasks(response.content)
    return {"subtasks": subtasks, "current_level": 1}

def execute_subtask(state: HierarchicalState) -> dict:
    """Execute one subtask (could spawn sub-agents)."""
    # Get next pending subtask
    for st in state["subtasks"]:
        if st["id"] not in state["results"]:
            # Execute (could be another graph!)
            result = execute_task(st)
            return {"results": {st["id"]: result}}
    return {}

def should_continue(state: HierarchicalState) -> Literal["execute", "aggregate"]:
    pending = [s for s in state["subtasks"] if s["id"] not in state["results"]]
    return "execute" if pending else "aggregate"

def aggregate(state: HierarchicalState) -> dict:
    """Combine subtask results."""
    combined = "\n\n".join(state["results"].values())
    final = llm.invoke([HumanMessage(content=f"Synthesize: {combined}")])
    return {"final_result": final.content}

graph = StateGraph(HierarchicalState)
graph.add_node("decompose", decompose)
graph.add_node("execute", execute_subtask)
graph.add_node("aggregate", aggregate)

graph.set_entry_point("decompose")
graph.add_edge("decompose", "execute")
graph.add_conditional_edges("execute", should_continue, {
    "execute": "execute",
    "aggregate": "aggregate"
})
graph.add_edge("aggregate", END)
```

---

## Pattern 4: Debate/Consensus

```python
class DebateState(TypedDict):
    topic: str
    positions: Annotated[list[dict], operator.add]  # {agent, argument}
    round: int
    max_rounds: int
    consensus: bool

def debater_agent(agent_name: str, stance: str):
    def node(state: DebateState) -> dict:
        # Build context from previous arguments
        context = "\n".join(
            f"{p['agent']} ({p['stance']}): {p['argument']}" 
            for p in state["positions"]
        )
        
        prompt = f"""Topic: {state['topic']}
Your stance: {stance}
Previous arguments:
{context}

Present your argument for round {state['round'] + 1}."""
        
        response = llm.invoke([HumanMessage(content=prompt)])
        
        return {
            "positions": [{"agent": agent_name, "stance": stance, "argument": response.content}],
            "round": state["round"] + 1
        }
    return node

def judge(state: DebateState) -> dict:
    """Evaluate if consensus reached."""
    if state["round"] >= state["max_rounds"]:
        return {"consensus": True}
    
    # Check for agreement
    last_args = [p for p in state["positions"] if p["round"] == state["round"]]
    # Simple heuristic: similar arguments = consensus
    return {"consensus": check_consensus(last_args)}

# Setup debate
pro = debater_agent("proponent", "pro")
con = debater_agent("opponent", "con")

graph = StateGraph(DebateState)
graph.add_node("pro", pro)
graph.add_node("con", con)
graph.add_node("judge", judge)

graph.set_entry_point("pro")
graph.add_edge("pro", "con")
graph.add_edge("con", "judge")
graph.add_conditional_edges("judge", lambda s: "pro" if not s["consensus"] else END, {
    "pro": "pro",
    "end": END
})
```

---

## Pattern 5: Swarm (Dynamic)

```python
class SwarmState(TypedDict):
    objective: str
    agents: dict  # agent_id -> {role, status, result}
    active_agents: list[str]
    completed: list[str]
    max_agents: int

def spawn_agent(state: SwarmState) -> dict:
    """Dynamically create new agent based on need."""
    # Analyze what's missing
    prompt = f"Objective: {state['objective']}\nCompleted: {state['completed']}\nWhat role is needed next?"
    response = llm.invoke([HumanMessage(content=prompt)])
    
    new_agent_id = f"agent_{len(state['agents'])}"
    return {
        "agents": {new_agent_id: {
            "role": extract_role(response.content),
            "status": "working",
            "result": None
        }},
        "active_agents": [new_agent_id]
    }

def execute_swarm_agent(state: SwarmState) -> dict:
    """Run one step of an active agent."""
    agent_id = state["active_agents"][0]
    agent = state["agents"][agent_id]
    
    # Execute agent's role
    result = run_agent(agent["role"], state["objective"])
    
    return {
        "agents": {agent_id: {"status": "done", "result": result}},
        "completed": [agent_id],
        "active_agents": []  # Clear, will be repopulated
    }

def coordinator(state: SwarmState) -> Literal["spawn", "execute", "done"]:
    if len(state["agents"]) >= state["max_agents"]:
        if state["active_agents"]:
            return "execute"
        return "done"
    
    if state["active_agents"]:
        return "execute"
    return "spawn"

graph = StateGraph(SwarmState)
graph.add_node("coordinator", lambda s: s)
graph.add_node("spawn", spawn_agent)
graph.add_node("execute", execute_swarm_agent)

graph.set_entry_point("coordinator")
graph.add_conditional_edges("coordinator", coordinator, {
    "spawn": "spawn",
    "execute": "execute",
    "done": END
})
graph.add_edge("spawn", "coordinator")
graph.add_edge("execute", "coordinator")
```

---

## Agent Communication Patterns

### 1. Shared State (Blackboard)

```python
# All agents read/write to shared state
class BlackboardState(TypedDict):
    blackboard: Annotated[dict, operator.add]  # Key-value store
    messages: Annotated[list[BaseMessage], operator.add]
```

### 2. Message Passing

```python
# Agents send messages to each other
class MessageState(TypedDict):
    inbox: Annotated[dict[str, list], operator.add]  # agent -> messages
    outbox: Annotated[list, operator.add]

def send_message(state: MessageState, to: str, content: str) -> dict:
    return {"outbox": [{"to": to, "content": content}]}
```

### 3. Tool-Based Communication

```python
@tool
def ask_agent(agent_name: str, question: str) -> str:
    """Ask another agent a question."""
    # Invoke subgraph for that agent
    return subgraphs[agent_name].invoke({"question": question})["answer"]
```

---

## Advanced: Agent Handoff with Context

```python
class HandoffState(TypedDict):
    messages: Annotated[list[BaseMessage], operator.add]
    active_agent: str
    agent_contexts: dict[str, dict]  # Persistent context per agent

def handoff_node(state: HandoffState) -> Command:
    """Transfer control to another agent with context."""
    # Current agent summarizes context
    summary_prompt = "Summarize key context for handoff:"
    summary = llm.invoke([
        *state["messages"],
        HumanMessage(content=summary_prompt)
    ])
    
    target_agent = determine_target(state["messages"][-1].content)
    
    return Command(
        goto=target_agent,
        update={
            "active_agent": target_agent,
            "agent_contexts": {
                target_agent: {
                    "handoff_from": state["active_agent"],
                    "summary": summary.content,
                    "timestamp": datetime.now().isoformat()
                }
            }
        }
    )
```

---

## Testing Multi-Agent Systems

```python
def test_supervisor_worker():
    app = build_supervisor_graph().compile()
    
    result = app.invoke({
        "task": "Write a blog post about AI safety",
        "messages": []
    })
    
    assert "results" in result
    assert len(result["results"]) > 0
    assert result["current_step"] == len(result["plan"])

def test_debate_consensus():
    app = build_debate_graph().compile()
    
    result = app.invoke({
        "topic": "Should AI be regulated?",
        "positions": [],
        "round": 0,
        "max_rounds": 3,
        "consensus": False
    })
    
    assert result["consensus"] or result["round"] == 3
```

---

## Summary

| Pattern | Best For | Complexity |
|---------|----------|------------|
| **Supervisor/Worker** | Structured workflows, clear roles | Medium |
| **Peer Collaboration** | Creative tasks, discussion | Medium |
| **Hierarchical** | Complex decomposition | High |
| **Debate** | Decision making, verification | Medium |
| **Swarm** | Exploration, unknown scope | High |

**Key Principles:**
1. **Explicit roles** - Each agent has clear responsibility
2. **Shared context** - Use state for communication
3. **Clear handoffs** - Define when/why agents switch
4. **Termination conditions** - Prevent infinite loops
5. **Observability** - Log agent interactions

---

## Next Chapter: Advanced Patterns - Reflection, Planning, and ReAct

In Chapter 10, we'll explore advanced reasoning patterns: self-reflection, planning, ReAct, and recursive improvement.