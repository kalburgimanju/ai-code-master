# Chapter 8: Human-in-the-Loop Workflows

## Why Human-in-the-Loop?

Human-in-the-loop (HITL) workflows integrate human judgment at critical decision points:

- **Approval Gates** - Human reviews AI output before proceeding
- **Correction** - Human fixes AI errors mid-process
- **Guidance** - Human provides direction when AI is uncertain
- **Quality Control** - Human validates high-stakes outputs
- **Learning** - Human feedback improves future AI performance

---

## The Interrupt Pattern

LangGraph's `interrupt()` function is the core HITL primitive:

```python
from langgraph.types import interrupt, Command
from langgraph.graph import StateGraph

class ReviewState(TypedDict):
    draft: str
    human_feedback: str
    status: Literal["draft", "review", "approved", "rejected"]

def human_review(state: ReviewState) -> Command:
    # PAUSE execution here - returns control to caller
    review = interrupt({
        "draft": state["draft"],
        "question": "Please review and approve/reject/edit",
        "options": ["approve", "reject", "edit"]
    })
    
    # Resumed here with human input in `review`
    if review["action"] == "approve":
        return Command(goto="publish", update={"status": "approved"})
    elif review["action"] == "reject":
        return Command(goto="rewrite", update={"status": "rejected"})
    else:  # edit
        return Command(goto="rewrite", update={
            "status": "rejected",
            "human_feedback": review["feedback"]
        })

graph = StateGraph(ReviewState)
graph.add_node("write", write_node)
graph.add_node("human_review", human_review)
graph.add_node("rewrite", rewrite_node)
graph.add_node("publish", publish_node)

graph.set_entry_point("write")
graph.add_edge("write", "human_review")
graph.add_conditional_edges("human_review", lambda x: x["status"], {
    "approved": "publish",
    "rejected": "rewrite"
})
graph.add_edge("rewrite", "human_review")
graph.add_edge("publish", END)

app = graph.compile(checkpointer=MemorySaver())
```

---

## Execution Flow with Interrupt

```
┌─────────────────────────────────────────────────────────────┐
│ 1. app.invoke(initial_state, config)                        │
│    │                                                         │
│    ▼                                                         │
│ 2. Executes nodes until interrupt()                         │
│    │                                                         │
│    ▼                                                         │
│ 3. RETURNS interrupt payload (pauses graph)                 │
│    │                                                         │
│    ▼                                                         │
│ 4. YOUR CODE: Show UI, wait for human, get response         │
│    │                                                         │
│    ▼                                                         │
│ 5. app.invoke(Command(resume=human_response), config)       │
│    │                                                         │
│    ▼                                                         │
│ 6. RESUMES from interrupt with human data                   │
│    │                                                         │
│    ▼                                                         │
│ 7. Continues to next node...                                │
└─────────────────────────────────────────────────────────────┘
```

---

## Complete HITL Example: Article Review

```python
from typing import TypedDict, Annotated, Literal
from langgraph.graph import StateGraph, END
from langgraph.types import interrupt, Command
from langgraph.checkpoint.memory import MemorySaver
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage
import operator

llm = ChatOpenAI(model="gpt-4o-mini")

class ArticleState(TypedDict):
    topic: str
    outline: list[str]
    draft: str
    review_notes: str
    version: int
    status: Literal["draft", "review", "approved", "published"]
    messages: Annotated[list, operator.add]

def create_outline(state: ArticleState) -> dict:
    prompt = f"Create an outline for an article about: {state['topic']}"
    response = llm.invoke([HumanMessage(content=prompt)])
    outline = response.content.split("\n")
    return {"outline": outline, "version": 1}

def write_draft(state: ArticleState) -> dict:
    outline = "\n".join(state["outline"])
    prompt = f"Write an article based on this outline:\n{outline}"
    if state.get("review_notes"):
        prompt += f"\n\nRevision notes: {state['review_notes']}"
    
    response = llm.invoke([HumanMessage(content=prompt)])
    return {"draft": response.content, "version": state["version"] + 1}

def human_review(state: ArticleState) -> Command:
    # INTERRUPT: Pause for human review
    review = interrupt({
        "article": state["draft"],
        "topic": state["topic"],
        "version": state["version"],
        "instructions": "Review the article. Respond with: approve / reject / edit",
        "current_version": state["version"]
    })
    
    action = review.get("action", "").lower()
    feedback = review.get("feedback", "")
    
    if action == "approve":
        return Command(goto="publish", update={"status": "approved"})
    elif action == "reject":
        return Command(goto="write_draft", update={
            "status": "rejected",
            "review_notes": feedback
        })
    else:  # edit
        return Command(goto="write_draft", update={
            "status": "rejected",
            "review_notes": f"Please incorporate: {feedback}"
        })

def publish(state: ArticleState) -> dict:
    return {"status": "published", "messages": [AIMessage(content="Article published!")]}

# Build graph
graph = StateGraph(ArticleState)
graph.add_node("create_outline", create_outline)
graph.add_node("write_draft", write_draft)
graph.add_node("human_review", human_review)
graph.add_node("publish", publish)

graph.set_entry_point("create_outline")
graph.add_edge("create_outline", "write_draft")
graph.add_edge("write_draft", "human_review")
graph.add_conditional_edges("human_review", lambda s: s["status"], {
    "approved": "publish",
    "rejected": "write_draft"
})
graph.add_edge("publish", END)

app = graph.compile(checkpointer=MemorySaver())
```

---

## Running the HITL Workflow

### CLI Version

```python
def run_cli():
    config = {"configurable": {"thread_id": "article-1"}}
    
    # Start
    result = app.invoke({
        "topic": "The Future of AI in Healthcare",
        "status": "draft"
    }, config)
    
    while True:
        # Check if interrupted
        if "__interrupt__" in result:
            interrupt_data = result["__interrupt__"][0].value
            print(f"\n{'='*50}")
            print(f"REVIEW NEEDED (v{interrupt_data['version']})")
            print(f"Topic: {interrupt_data['topic']}")
            print(f"\nArticle:\n{interrupt_data['article']}")
            print(f"\n{'='*50}")
            
            action = input("Action (approve/reject/edit): ").strip().lower()
            
            if action == "approve":
                resume_data = {"action": "approve"}
            elif action == "reject":
                feedback = input("Rejection reason: ")
                resume_data = {"action": "reject", "feedback": feedback}
            else:
                feedback = input("Edit instructions: ")
                resume_data = {"action": "edit", "feedback": feedback}
            
            # RESUME with human input
            result = app.invoke(Command(resume=resume_data), config)
        else:
            print(f"\nFinal status: {result.get('status')}")
            if result.get("messages"):
                print(result["messages"][-1].content)
            break

run_cli()
```

### Web API Version (FastAPI)

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn

app_api = FastAPI()

class ReviewRequest(BaseModel):
    thread_id: str
    action: str  # approve, reject, edit
    feedback: str = ""

class InvokeRequest(BaseModel):
    thread_id: str
    input: dict

# Store checkpointer globally (use Redis in production)
checkpointer = MemorySaver()
compiled_app = graph.compile(checkpointer=checkpointer)

@app_api.post("/invoke")
async def invoke_graph(request: InvokeRequest):
    config = {"configurable": {"thread_id": request.thread_id}}
    result = compiled_app.invoke(request.input, config)
    return format_result(result)

@app_api.post("/resume")
async def resume_graph(request: ReviewRequest):
    config = {"configurable": {"thread_id": request.thread_id}}
    result = compiled_app.invoke(
        Command(resume={"action": request.action, "feedback": request.feedback}),
        config
    )
    return format_result(result)

def format_result(result):
    if "__interrupt__" in result:
        return {
            "status": "awaiting_review",
            "interrupt": result["__interrupt__"][0].value
        }
    return {"status": "complete", "result": result}

if __name__ == "__main__":
    uvicorn.run(app_api, port=8000)
```

### WebSocket Version (Real-time)

```python
from fastapi import WebSocket, WebSocketDisconnect
import asyncio
import json

@app_api.websocket("/ws/{thread_id}")
async def websocket_endpoint(websocket: WebSocket, thread_id: str):
    await websocket.accept()
    config = {"configurable": {"thread_id": thread_id}}
    
    try:
        while True:
            # Wait for client message
            data = await websocket.receive_json()
            
            if data["type"] == "start":
                result = compiled_app.invoke(data["input"], config)
            elif data["type"] == "resume":
                result = compiled_app.invoke(
                    Command(resume=data["payload"]), config
                )
            
            await websocket.send_json(format_result(result))
            
    except WebSocketDisconnect:
        pass
```

---

## Advanced HITL Patterns

### 1. Multi-Stage Review

```python
def multi_stage_review(state: State) -> Command:
    stage = state.get("review_stage", 0)
    
    if stage == 0:
        # Technical review
        review = interrupt({"stage": "technical", "content": state["draft"]})
        if review["action"] != "approve":
            return Command(goto="revise", update={"review_stage": 0})
        return Command(update={"review_stage": 1})
    
    elif stage == 1:
        # Legal review
        review = interrupt({"stage": "legal", "content": state["draft"]})
        if review["action"] != "approve":
            return Command(goto="revise", update={"review_stage": 1})
        return Command(update={"review_stage": 2})
    
    elif stage == 2:
        # Final approval
        review = interrupt({"stage": "final", "content": state["draft"]})
        if review["action"] == "approve":
            return Command(goto="publish")
        return Command(goto="revise", update={"review_stage": 0})
```

### 2. Parallel Human Review

```python
from langgraph.constants import Send

def parallel_review(state: State) -> list[Send]:
    """Send to multiple reviewers simultaneously."""
    reviewers = ["technical", "legal", "editorial"]
    return [
        Send("human_review", {"reviewer": r, "content": state["draft"]})
        for r in reviewers
    ]

def collect_reviews(state: State) -> Command:
    """Wait for all reviews, then decide."""
    reviews = state.get("reviews", {})
    
    if len(reviews) < 3:
        # Still waiting - this node gets called multiple times
        return Command(goto="collect_reviews")
    
    # All reviews in
    if all(r["action"] == "approve" for r in reviews.values()):
        return Command(goto="publish")
    else:
        feedback = "\n".join(f"{k}: {v['feedback']}" for k, v in reviews.items())
        return Command(goto="revise", update={"combined_feedback": feedback})

graph.add_node("parallel_review", parallel_review)
graph.add_node("collect_reviews", collect_reviews)
graph.add_conditional_edges("parallel_review", parallel_review)
graph.add_edge("human_review", "collect_reviews")
```

### 3. Human Editing (Not Just Approve/Reject)

```python
def human_edit(state: State) -> Command:
    edit = interrupt({
        "content": state["draft"],
        "mode": "edit",  # Full editing capability
        "instructions": "Edit the content directly. Return full revised text."
    })
    
    if edit.get("action") == "save":
        return Command(goto="review", update={
            "draft": edit["revised_content"],
            "version": state["version"] + 1
        })
    elif edit.get("action") == "approve":
        return Command(goto="publish")
    return Command(goto="human_edit")  # Stay in edit mode
```

---

## Timeout Handling

```python
import asyncio
from datetime import datetime, timedelta

class TimeoutManager:
    def __init__(self, default_timeout: int = 3600):  # 1 hour
        self.timeouts = {}
        self.default_timeout = default_timeout
    
    async def wait_for_human(self, thread_id: str, interrupt_data: dict) -> dict:
        """Wait for human response with timeout."""
        timeout = interrupt_data.get("timeout", self.default_timeout)
        deadline = datetime.now() + timedelta(seconds=timeout)
        
        # Store for webhook/callback
        self.timeouts[thread_id] = {
            "deadline": deadline,
            "interrupt_data": interrupt_data,
            "future": asyncio.Future()
        }
        
        try:
            result = await asyncio.wait_for(
                self.timeouts[thread_id]["future"],
                timeout=timeout
            )
            return result
        except asyncio.TimeoutError:
            return {"action": "timeout", "auto_approved": False}
        finally:
            del self.timeouts[thread_id]
    
    def submit_response(self, thread_id: str, response: dict):
        """Called by webhook when human responds."""
        if thread_id in self.timeouts:
            self.timeouts[thread_id]["future"].set_result(response)

# Usage in async node
async def async_human_review(state: State, config: RunnableConfig) -> Command:
    interrupt_data = interrupt(state)
    response = await timeout_manager.wait_for_human(
        config["configurable"]["thread_id"], 
        interrupt_data
    )
    # Process response...
```

---

## Best Practices

### 1. Always Use Checkpointers

```python
# ✅ Required for HITL
app = graph.compile(checkpointer=MemorySaver())  # or SqliteSaver, PostgresSaver

# ❌ Won't work - no state persistence
app = graph.compile()
```

### 2. Design Clear Interrupt Payloads

```python
# ✅ Clear, actionable
interrupt({
    "task": "Review pull request #123",
    "context": {"files_changed": 5, "lines_added": 200},
    "question": "Approve this PR?",
    "options": ["approve", "request_changes", "comment"],
    "deadline": "2024-01-15T17:00:00Z"
})

# ❌ Vague
interrupt("Please review")
```

### 3. Handle All Resume Paths

```python
def review_node(state: State) -> Command:
    review = interrupt({...})
    
    action = review.get("action")
    
    # Handle EVERY possible action
    if action == "approve":
        return Command(goto="next")
    elif action == "reject":
        return Command(goto="revise")
    elif action == "edit":
        return Command(goto="edit")
    elif action == "delegate":
        return Command(goto="delegate")
    else:
        # Default/fallback
        return Command(goto="review")  # Re-ask
```

### 4. Version Your Interrupts

```python
interrupt({
    "schema_version": 2,
    "type": "article_review",
    "data": {...}
})

# On resume, check version
def handle_resume(resume_data: dict):
    version = resume_data.get("schema_version", 1)
    if version == 1:
        return migrate_v1_to_v2(resume_data)
    return resume_data
```

---

## Summary

| Pattern | Use Case | Key Feature |
|---------|----------|-------------|
| **Basic Approve/Reject** | Content review | `interrupt()` + `Command` |
| **Edit Mode** | Collaborative editing | Return revised content |
| **Multi-Stage** | Compliance workflows | Sequential interrupts |
| **Parallel Review** | Multiple stakeholders | `Send` + collector node |
| **Timeout** | SLA requirements | Async wait with deadline |
| **WebSocket** | Real-time UI | Persistent connection |

---

## Next Chapter: Building Multi-Agent Systems

In Chapter 9, we'll explore multi-agent architectures: agent communication, delegation, debate, and swarm patterns.