# Chapter 10: Advanced Patterns - Reflection, Planning, and ReAct

## Advanced Reasoning Patterns

Beyond basic graph structures, LangGraph enables sophisticated reasoning patterns that mimic human cognition.

---

## 1. ReAct (Reasoning + Acting)

ReAct interleaves reasoning and action:

```python
from typing import TypedDict, Annotated, Literal
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from langchain_core.tools import tool
from langgraph.prebuilt import ToolNode
import operator

llm = ChatOpenAI(model="gpt-4o-mini")

# Tools
@tool
def search(query: str) -> str:
    """Search for information."""
    # Implementation
    return f"Search results for: {query}"

@tool
def calculate(expression: str) -> float:
    """Calculate math expression."""
    return eval(expression)

tools = [search, calculate]
tool_node = ToolNode(tools)
llm_with_tools = llm.bind_tools(tools)

class ReActState(TypedDict):
    messages: Annotated[list, operator.add]
    task: str

def react_agent(state: ReActState) -> dict:
    """ReAct agent: thinks, then acts."""
    system = """You are a ReAct agent. Follow this format:
    
    Thought: [Your reasoning]
    Action: [tool_name]
    Action Input: [input]
    Observation: [result]
    ... (repeat until done)
    Thought: [Final reasoning]
    Final Answer: [answer]"""
    
    messages = [{"role": "system", "content": system}, *state["messages"]]
    response = llm_with_tools.invoke(messages)
    return {"messages": [response]}

def should_use_tools(state: ReActState) -> Literal["tools", "final"]:
    last = state["messages"][-1]
    return "tools" if last.tool_calls else "final"

graph = StateGraph(ReActState)
graph.add_node("agent", react_agent)
graph.add_node("tools", tool_node)

graph.set_entry_point("agent")
graph.add_conditional_edges("agent", should_use_tools, {
    "tools": "tools",
    "final": END
})
graph.add_edge("tools", "agent")

app = graph.compile(checkpointer=MemorySaver())
```

---

## 2. Self-Reflection (Reflexion)

Agent critiques its own output and improves:

```python
class ReflexionState(TypedDict):
    task: str
    draft: str
    reflection: str
    iteration: int
    max_iterations: int
    score: float

def generate(state: ReflexionState) -> dict:
    """Generate initial draft or revision."""
    if state["iteration"] == 0:
        prompt = f"Task: {state['task']}\nGenerate your best attempt."
    else:
        prompt = f"""Task: {state['task']}
Previous attempt: {state['draft']}
Self-critique: {state['reflection']}
Generate improved version."""
    
    response = llm.invoke([HumanMessage(content=prompt)])
    return {"draft": response.content, "iteration": state["iteration"] + 1}

def reflect(state: ReflexionState) -> dict:
    """Self-critique the draft."""
    prompt = f"""Task: {state['task']}
Your output: {state['draft']}

Critique your work. Consider:
- Accuracy
- Completeness
- Clarity
- Missing elements
Rate 1-10 and explain."""
    
    response = llm.invoke([HumanMessage(content=prompt)])
    # Extract score (simplified)
    score = extract_score(response.content)
    return {"reflection": response.content, "score": score}

def should_continue(state: ReflexionState) -> Literal["reflect", "done"]:
    if state["iteration"] >= state["max_iterations"]:
        return "done"
    if state["score"] >= 9.0:
        return "done"
    return "reflect"

graph = StateGraph(ReflexionState)
graph.add_node("generate", generate)
graph.add_node("reflect", reflect)

graph.set_entry_point("generate")
graph.add_edge("generate", "reflect")
graph.add_conditional_edges("reflect", should_continue, {
    "reflect": "generate",
    "done": END
})
```

---

## 3. Chain-of-Thought with Verification

```python
class CoTState(TypedDict):
    problem: str
    reasoning: str
    answer: str
    verified: bool
    verification_notes: str

def reason(state: CoTState) -> dict:
    prompt = f"""Problem: {state['problem']}

Think step by step. Show your reasoning clearly.
Then provide your final answer."""
    
    response = llm.invoke([HumanMessage(content=prompt)])
    # Parse reasoning and answer
    reasoning, answer = parse_cot(response.content)
    return {"reasoning": reasoning, "answer": answer}

def verify(state: CoTState) -> dict:
    prompt = f"""Problem: {state['problem']}
Proposed reasoning: {state['reasoning']}
Proposed answer: {state['answer']}

Verify this solution. Check:
- Logical consistency
- Mathematical correctness
- Assumptions
- Edge cases

If correct, respond "VERIFIED". If not, explain errors."""
    
    response = llm.invoke([HumanMessage(content=prompt)])
    verified = "VERIFIED" in response.content.upper()
    return {"verified": verified, "verification_notes": response.content}

def should_retry(state: CoTState) -> Literal["reason", "done"]:
    if state["verified"]:
        return "done"
    return "reason"  # Try again with verification feedback

graph = StateGraph(CoTState)
graph.add_node("reason", reason)
graph.add_node("verify", verify)

graph.set_entry_point("reason")
graph.add_edge("reason", "verify")
graph.add_conditional_edges("verify", should_retry, {
    "reason": "reason",
    "done": END
})
```

---

## 4. Planning and Execution

Separate planning from execution:

```python
class PlanExecuteState(TypedDict):
    task: str
    plan: list[str]
    current_step: int
    results: Annotated[list[dict], operator.add]
    status: Literal["planning", "executing", "replanning", "complete"]

def planner(state: PlanExecuteState) -> dict:
    """Create or revise plan."""
    if state["status"] == "replanning":
        context = f"Previous results: {state['results']}\nFailed at step {state['current_step']}"
        prompt = f"Task: {state['task']}\n{context}\nRevise plan."
    else:
        prompt = f"Task: {state['task']}\nCreate step-by-step plan."
    
    response = llm.invoke([HumanMessage(content=prompt)])
    plan = parse_plan(response.content)
    return {"plan": plan, "current_step": 0, "status": "executing"}

def executor(state: PlanExecuteState) -> dict:
    """Execute current step."""
    step = state["plan"][state["current_step"]]
    prompt = f"Execute: {step}\nContext: {state['task']}"
    response = llm.invoke([HumanMessage(content=prompt)])
    
    return {
        "results": [{"step": state["current_step"], "task": step, "output": response.content}],
        "current_step": state["current_step"] + 1
    }

def check_progress(state: PlanExecuteState) -> Literal["executor", "replan", "complete"]:
    if state["current_step"] >= len(state["plan"]):
        return "complete"
    # Check if last step failed
    if state["results"] and "error" in state["results"][-1].get("output", "").lower():
        return "replan"
    return "executor"

graph = StateGraph(PlanExecuteState)
graph.add_node("planner", planner)
graph.add_node("executor", executor)

graph.set_entry_point("planner")
graph.add_edge("planner", "executor")
graph.add_conditional_edges("executor", check_progress, {
    "executor": "executor",
    "replan": "planner",
    "complete": END
})
```

---

## 5. Tree of Thoughts

Explore multiple reasoning paths:

```python
class ToTState(TypedDict):
    problem: str
    thoughts: Annotated[list[dict], operator.add]  # {path, thought, score}
    current_path: str
    best_path: str
    depth: int
    max_depth: int

def generate_thoughts(state: ToTState) -> dict:
    """Generate next thoughts for all active paths."""
    new_thoughts = []
    
    for path in get_active_paths(state):
        prompt = f"""Problem: {state['problem']}
Current path ({path}): {get_path_thoughts(state, path)}
Generate next reasoning step."""
        
        response = llm.invoke([HumanMessage(content=prompt)])
        score = evaluate_thought(response.content)
        
        new_thoughts.append({
            "path": path,
            "thought": response.content,
            "score": score,
            "depth": state["depth"] + 1
        })
    
    return {"thoughts": new_thoughts, "depth": state["depth"] + 1}

def prune_paths(state: ToTState) -> dict:
    """Keep only top-k paths."""
    # Sort by score, keep top 3
    sorted_thoughts = sorted(state["thoughts"], key=lambda x: x["score"], reverse=True)
    kept = sorted_thoughts[:3]
    return {"thoughts": kept, "best_path": kept[0]["path"]}

def should_continue(state: ToTState) -> Literal["generate", "finalize"]:
    if state["depth"] >= state["max_depth"]:
        return "finalize"
    return "generate"

def finalize(state: ToTState) -> dict:
    best = max(state["thoughts"], key=lambda x: x["score"])
    return {"solution": best["thought"]}

graph = StateGraph(ToTState)
graph.add_node("generate", generate_thoughts)
graph.add_node("prune", prune_paths)
graph.add_node("finalize", finalize)

graph.set_entry_point("generate")
graph.add_edge("generate", "prune")
graph.add_conditional_edges("prune", should_continue, {
    "generate": "generate",
    "finalize": "finalize"
})
```

---

## 6. Recursive Improvement

```python
class RecursiveState(TypedDict):
    task: str
    current_solution: str
    critiques: Annotated[list[str], operator.add]
    improvements: Annotated[list[str], operator.add]
    iteration: int
    max_iterations: int

def solve(state: RecursiveState) -> dict:
    if state["iteration"] == 0:
        prompt = f"Solve: {state['task']}"
    else:
        prompt = f"""Task: {state['task']}
Current solution: {state['current_solution']}
Critiques: {state['critiques'][-1]}
Improve the solution."""
    
    response = llm.invoke([HumanMessage(content=prompt)])
    return {"current_solution": response.content, "iteration": state["iteration"] + 1}

def critique(state: RecursiveState) -> dict:
    prompt = f"""Task: {state['task']}
Solution: {state['current_solution']}

Provide specific, actionable critique. Focus on:
- Correctness
- Completeness
- Efficiency
- Edge cases"""
    
    response = llm.invoke([HumanMessage(content=prompt)])
    return {"critiques": [response.content]}

def improve(state: RecursiveState) -> dict:
    prompt = f"""Task: {state['task']}
Solution: {state['current_solution']}
Critique: {state['critiques'][-1]}

Apply the critique to improve the solution."""
    
    response = llm.invoke([HumanMessage(content=prompt)])
    return {"improvements": [response.content], "current_solution": response.content}

def should_continue(state: RecursiveState) -> Literal["critique", "done"]:
    if state["iteration"] >= state["max_iterations"]:
        return "done"
    # Check if critique says "good enough"
    last_critique = state["critiques"][-1] if state["critiques"] else ""
    if "good enough" in last_critique.lower() or "satisfactory" in last_critique.lower():
        return "done"
    return "critique"

graph = StateGraph(RecursiveState)
graph.add_node("solve", solve)
graph.add_node("critique", critique)
graph.add_node("improve", improve)

graph.set_entry_point("solve")
graph.add_edge("solve", "critique")
graph.add_conditional_edges("critique", should_continue, {
    "critique": "improve",
    "done": END
})
graph.add_edge("improve", "solve")
```

---

## 7. Combining Patterns: ReAct + Reflection

```python
class CombinedState(TypedDict):
    task: str
    messages: Annotated[list, operator.add]
    mode: Literal["react", "reflect"]
    iterations: int
    final_answer: str

def react_or_reflect(state: CombinedState) -> dict:
    if state["mode"] == "react":
        return react_node(state)
    else:
        return reflect_node(state)

def mode_router(state: CombinedState) -> Literal["react", "reflect", "done"]:
    if state["iterations"] >= 3:
        return "done"
    if state["mode"] == "react":
        # Check if ReAct is stuck
        if is_stuck(state["messages"]):
            return "reflect"
        return "react"
    else:
        return "react"  # After reflection, try ReAct again

# This creates a hybrid that uses tools when needed,
# but reflects when stuck
```

---

## Summary

| Pattern | Use Case | Key Mechanism |
|---------|----------|---------------|
| **ReAct** | Tool-using agents | Reason → Act → Observe loop |
| **Reflexion** | Self-improvement | Generate → Critique → Revise |
| **CoT + Verify** | High-stakes reasoning | Reason → Verify → Retry |
| **Plan-Execute** | Complex multi-step | Plan → Execute → Replan |
| **Tree of Thoughts** | Exploratory problems | Branch → Evaluate → Prune |
| **Recursive** | Optimization | Solve → Critique → Improve |

---

## Next Chapter: Streaming and Real-time Execution

In Chapter 11, we'll explore streaming outputs, real-time updates, and building responsive interfaces.