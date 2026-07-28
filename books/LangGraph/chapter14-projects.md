# Chapter 14: Building Production Applications

This chapter builds three complete, production-ready applications demonstrating LangGraph patterns.

---

## Application 1: Deep Research Assistant

A multi-agent research system that plans, searches, analyzes, and synthesizes comprehensive reports.

### Architecture

```
Research Assistant
├── Planner Agent → Creates research plan
├── Search Agent → Web search + retrieval
├── Analyst Agent → Synthesizes findings
├── Critic Agent → Reviews for gaps/bias
├── Writer Agent → Produces final report
└── Human Review → Approval gate
```

### Complete Implementation

```python
# apps/research_assistant/main.py
from typing import TypedDict, Annotated, Literal
from langgraph.graph import StateGraph, END
from langgraph.types import interrupt, Command
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from langchain_openai import ChatOpenAI
from langchain_core.tools import tool
from langgraph.prebuilt import ToolNode
import operator
import asyncio
from datetime import datetime

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.7)

# ============================================================
# TOOLS
# ============================================================

@tool
async def web_search(query: str, max_results: int = 5) -> list[dict]:
    """Search the web for information."""
    # Implement with your search provider (SerpAPI, Tavily, etc.)
    return [{"title": f"Result for {query}", "url": "http://example.com", "snippet": "..."}]

@tool
async def fetch_page(url: str) -> str:
    """Fetch and extract content from a URL."""
    # Implement with httpx + readability
    return f"Content from {url}"

@tool
async def save_finding(finding: dict) -> str:
    """Save a research finding to database."""
    # Implement persistence
    return "saved"

tools = [web_search, fetch_page, save_finding]

# ============================================================
# STATE
# ============================================================

class ResearchState(TypedDict):
    # Input
    topic: str
    depth: Literal["quick", "standard", "deep"]
    user_id: str
    
    # Planning
    plan: list[dict]  # {step, description, agent, status}
    current_step: int
    
    # Execution
    findings: Annotated[list[dict], operator.add]
    sources: Annotated[list[str], operator.add]
    
    # Review
    critic_feedback: str
    revision_needed: bool
    
    # Output
    final_report: str
    status: Literal["planning", "researching", "analyzing", "writing", "review", "approved", "published"]
    
    # Metadata
    created_at: str
    updated_at: str
    cost_estimate: float

# ============================================================
# AGENTS
# ============================================================

planner_prompt = """You are a research planner. Create a detailed research plan for the given topic.
Return a JSON array of steps, each with: step (number), description, agent (search/analyze/write), estimated_time."""

async def planner_agent(state: ResearchState) -> dict:
    prompt = f"""Topic: {state['topic']}
Depth: {state['depth']}

Create a research plan with 5-10 steps. Assign each step to an agent:
- search: Find information
- analyze: Synthesize findings
- write: Draft sections

Output as JSON array."""
    
    response = await llm.ainvoke(prompt)
    plan = parse_json(response.content)
    
    return {
        "plan": plan,
        "current_step": 0,
        "status": "researching",
        "updated_at": datetime.now().isoformat()
    }

async def search_agent(state: ResearchState) -> dict:
    step = state["plan"][state["current_step"]]
    query = step["description"]
    
    # Search
    results = await web_search.ainvoke({"query": query, "max_results": 10})
    
    # Fetch top pages
    pages = []
    for r in results[:3]:
        content = await fetch_page.ainvoke({"url": r["url"]})
        pages.append({"url": r["url"], "title": r["title"], "content": content[:5000]})
    
    finding = {
        "step": state["current_step"],
        "query": query,
        "results": results,
        "pages": pages,
        "timestamp": datetime.now().isoformat()
    }
    
    return {
        "findings": [finding],
        "sources": [r["url"] for r in results],
        "current_step": state["current_step"] + 1,
        "updated_at": datetime.now().isoformat()
    }

async def analyst_agent(state: ResearchState) -> dict:
    step = state["plan"][state["current_step"]]
    
    # Analyze all findings so far
    all_findings = "\n\n".join(
        f"Step {f['step']}: {f['query']}\n{f.get('summary', 'Pending')}"
        for f in state["findings"]
    )
    
    prompt = f"""Analyze these research findings for: {state['topic']}
    
{all_findings}

Provide synthesis, identify patterns, gaps, and key insights."""
    
    response = await llm.ainvoke(prompt)
    
    finding = {
        "step": state["current_step"],
        "analysis": response.content,
        "timestamp": datetime.now().isoformat()
    }
    
    return {
        "findings": [finding],
        "current_step": state["current_step"] + 1,
        "updated_at": datetime.now().isoformat()
    }

async def writer_agent(state: ResearchState) -> dict:
    step = state["plan"][state["current_step"]]
    
    # Compile all research
    research_compilation = compile_research(state["findings"])
    
    prompt = f"""Write a comprehensive report section: {step['description']}
    
Topic: {state['topic']}
Research: {research_compilation}

Write in professional tone with citations."""
    
    response = await llm.ainvoke(prompt)
    
    finding = {
        "step": state["current_step"],
        "section": step["description"],
        "content": response.content,
        "timestamp": datetime.now().isoformat()
    }
    
    return {
        "findings": [finding],
        "current_step": state["current_step"] + 1,
        "updated_at": datetime.now().isoformat()
    }

async def critic_agent(state: ResearchState) -> dict:
    """Review the complete report for quality."""
    report = compile_report(state["findings"])
    
    prompt = f"""Review this research report for: {state['topic']}
    
{report}

Check for:
1. Accuracy and citations
2. Completeness (all plan steps covered)
3. Balance and bias
4. Clarity and structure
5. Actionable insights

If issues found, respond with "REVISE: [specific feedback]".
If satisfactory, respond with "APPROVED"."""
    
    response = await llm.ainvoke(prompt)
    
    if "REVISE:" in response.content:
        return {
            "critic_feedback": response.content.replace("REVISE:", "").strip(),
            "revision_needed": True,
            "status": "researching",  # Go back
            "updated_at": datetime.now().isoformat()
        }
    else:
        return {
            "critic_feedback": "Approved",
            "revision_needed": False,
            "status": "review",
            "updated_at": datetime.now().isoformat()
        }

async def human_review(state: ResearchState) -> Command:
    """Human approval gate."""
    report = compile_report(state["findings"])
    
    review = interrupt({
        "report": report,
        "topic": state["topic"],
        "critic_feedback": state["critic_feedback"],
        "options": ["approve", "request_changes", "reject"]
    })
    
    action = review.get("action")
    feedback = review.get("feedback", "")
    
    if action == "approve":
        return Command(goto="publish", update={"status": "approved"})
    elif action == "request_changes":
        return Command(goto="planner", update={
            "status": "researching",
            "critic_feedback": feedback
        })
    else:
        return Command(goto="end", update={"status": "rejected"})

async def publish_agent(state: ResearchState) -> dict:
    report = compile_report(state["findings"])
    
    # Save to database, generate PDF, etc.
    return {
        "final_report": report,
        "status": "published",
        "updated_at": datetime.now().isoformat()
    }

# ============================================================
# ROUTING
# ============================================================

def route_step(state: ResearchState) -> str:
    if state["current_step"] >= len(state["plan"]):
        if state["status"] == "researching":
            return "critic"
        return "human_review"
    
    step = state["plan"][state["current_step"]]
    agent = step.get("agent", "search")
    return agent

def route_after_critic(state: ResearchState) -> str:
    if state["revision_needed"]:
        return "planner"
    return "human_review"

# ============================================================
# GRAPH
# ============================================================

graph = StateGraph(ResearchState)

graph.add_node("planner", planner_agent)
graph.add_node("search", search_agent)
graph.add_node("analyze", analyst_agent)
graph.add_node("write", writer_agent)
graph.add_node("critic", critic_agent)
graph.add_node("human_review", human_review)
graph.add_node("publish", publish_agent)

graph.set_entry_point("planner")
graph.add_conditional_edges("planner", route_step)
graph.add_conditional_edges("search", route_step)
graph.add_conditional_edges("analyze", route_step)
graph.add_conditional_edges("write", route_step)
graph.add_conditional_edges("critic", route_after_critic)
graph.add_edge("publish", END)

# ============================================================
# API
# ============================================================

async def run_research(topic: str, depth: str = "standard", user_id: str = "anonymous"):
    checkpointer = AsyncPostgresSaver.from_conn_string(DATABASE_URL)
    app = graph.compile(checkpointer=checkpointer)
    
    thread_id = f"research-{user_id}-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
    config = {"configurable": {"thread_id": thread_id}}
    
    initial_state = {
        "topic": topic,
        "depth": depth,
        "user_id": user_id,
        "plan": [],
        "current_step": 0,
        "findings": [],
        "sources": [],
        "critic_feedback": "",
        "revision_needed": False,
        "final_report": "",
        "status": "planning",
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
        "cost_estimate": 0.0
    }
    
    # Run with streaming
    async for chunk in app.astream(initial_state, config, stream_mode="values"):
        yield chunk
    
    # Get final state
    final_state = await app.aget_state(config)
    return final_state.values
```

---

## Application 2: Code Generation Agent

An agent that writes, tests, and debugs code iteratively.

### Architecture

```
Code Agent
├── Planner → Understands requirements, creates plan
├── Coder → Writes code files
├── Tester → Runs tests, captures failures
├── Debugger → Fixes failing tests
├── Reviewer → Code quality review
└── Human → Approves PR
```

### Key Components

```python
# apps/code_agent/main.py
class CodeState(TypedDict):
    task: str
    language: str
    files: Annotated[dict[str, str], operator.add]  # filename -> content
    test_results: Annotated[list[dict], operator.add]
    current_file: str
    iteration: int
    max_iterations: int
    status: Literal["planning", "coding", "testing", "debugging", "review", "complete"]

@tool
def write_file(filename: str, content: str) -> str:
    """Write a file to the workspace."""
    # Save to workspace
    return f"Written {filename}"

@tool
def read_file(filename: str) -> str:
    """Read a file from workspace."""
    return workspace.get(filename, "")

@tool
def run_tests(command: str) -> dict:
    """Run tests and return results."""
    result = subprocess.run(command, shell=True, capture_output=True, text=True)
    return {
        "passed": result.returncode == 0,
        "stdout": result.stdout,
        "stderr": result.stderr,
        "returncode": result.returncode
    }

@tool
def run_linter(filename: str) -> list[str]) -> dict:
    """Run linter on file."""
    # pylint, flake8, etc.
    return {"issues": []}

# Nodes follow similar pattern to research assistant
# with coding → testing → debugging loop
```

---

## Application 3: Customer Support Bot

A multi-agent support system with escalation.

### Architecture

```
Support Bot
├── Classifier → Categorizes issue (billing, technical, account)
├── FAQ Agent → Answers common questions
├── Technical Agent → Troubleshooting with tools
├── Billing Agent → Handles billing with API access
├── Escalation Agent → Creates tickets for human agents
└── Human Handoff → Live agent transfer
```

### Implementation Highlights

```python
# apps/support_bot/main.py
class SupportState(TypedDict):
    customer_id: str
    message: str
    category: Literal["billing", "technical", "account", "general"]
    conversation: Annotated[list[BaseMessage], add_messages]
    agent_notes: str
    escalated: bool
    ticket_id: str

# Classifier uses structured output
class Classification(BaseModel):
    category: Literal["billing", "technical", "account", "general"]
    confidence: float
    urgency: Literal["low", "medium", "high"]
    suggested_agent: str

classifier_llm = llm.with_structured_output(Classification)

async def classify(state: SupportState) -> dict:
    classification = await classifier_llm.ainvoke([
        SystemMessage(content="Classify support request"),
        HumanMessage(content=state["message"])
    ])
    return {
        "category": classification.category,
        "agent_notes": f"Urgency: {classification.urgency}",
        "suggested_agent": classification.suggested_agent
    }

# Routing based on category
def route_agent(state: SupportState) -> str:
    routes = {
        "billing": "billing_agent",
        "technical": "technical_agent",
        "account": "account_agent",
        "general": "faq_agent"
    }
    return routes.get(state["category"], "faq_agent")

# FAQ Agent with RAG
faq_tool = ToolNode([search_knowledge_base])

# Technical Agent with diagnostics
tech_tools = [run_diagnostics, check_logs, restart_service]
tech_agent = create_react_agent(llm, tech_tools)

# Escalation with human handoff
async def escalate(state: SupportState) -> Command:
    ticket = create_ticket(state)
    return Command(
        goto="human_handoff",
        update={"escalated": True, "ticket_id": ticket.id}
    )

async def human_handoff(state: SupportState) -> Command:
    # Interrupt for human agent
    handoff = interrupt({
        "ticket_id": state["ticket_id"],
        "customer_id": state["customer_id"],
        "summary": summarize_conversation(state["conversation"]),
        "message": "Human agent needed"
    })
    
    if handoff.get("action") == "resolved":
        return Command(goto="close", update={"status": "resolved"})
    return Command(goto="human_handoff")  # Stay in handoff
```

---

## Deployment Checklist for Each App

| Component | Research Assistant | Code Agent | Support Bot |
|-----------|-------------------|------------|-------------|
| **Database** | PostgreSQL (checkpoints + findings) | PostgreSQL (code + tests) | PostgreSQL (tickets + conversations) |
| **Queue** | Redis (long research jobs) | Redis (test runs) | Redis (message queue) |
| **Storage** | S3 (reports, PDFs) | S3 (code artifacts) | S3 (attachments) |
| **Search** | Tavily/SerpAPI | N/A | Elasticsearch (KB) |
| **Auth** | JWT per user | GitHub OAuth | Customer portal SSO |
| **Rate Limit** | 10 req/min | 5 req/min | 30 req/min |
| **Monitoring** | Cost tracking, quality | Test pass rate, time | Resolution time, CSAT |

---

## Running the Examples

```bash
# Research Assistant
cd apps/research_assistant
pip install -e .
python -m research_assistant "Impact of AI on Healthcare" --depth standard

# Code Agent
cd apps/code_agent
pip install -e .
python -m code_agent "Create a REST API for todo app with tests" --language python

# Support Bot
cd apps/support_bot
pip install -e .
uvicorn support_bot.main:app --reload
```

---

## Summary

Three production patterns demonstrated:

1. **Research Assistant** - Multi-agent pipeline with human review
2. **Code Agent** - Iterative write/test/debug loop
3. **Support Bot** - Classification + specialized agents + escalation

All share:
- ✅ Checkpointing for resilience
- ✅ Streaming for UX
- ✅ Human-in-the-loop for quality
- ✅ Structured outputs for reliability
- ✅ Observability built-in

---

## Congratulations! 🎉

You've completed the LangGraph book! You now have comprehensive knowledge of:

- **Fundamentals**: StateGraph, nodes, edges, state management
- **Patterns**: ReAct, Reflection, Planning, Multi-agent
- **Advanced**: Streaming, HITL, Checkpointing, Testing
- **Production**: Deployment, Monitoring, Security, Scaling
- **Applications**: Real-world examples

### Next Steps

1. **Build something** - Start with a simple graph, iterate
2. **Join community** - LangChain Discord, GitHub discussions
3. **Contribute** - LangGraph is open source!
4. **Stay updated** - Follow @LangChainAI for releases

Happy graph building! 🚀