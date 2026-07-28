# Chapter 4: Single-Agent Architectures

> "Simplicity is the ultimate sophistication." — Leonardo da Vinci

---

## 4.1 The Foundation of Agent Systems

Before we explore the complexity of multi-agent orchestration, we must deeply understand the building block underneath every agent system: the single-agent architecture. This chapter examines the patterns, loops, and strategies that make a lone LLM-powered agent capable of performing complex tasks autonomously.

A single-agent architecture consists of one LLM reasoning loop that can observe its environment, decide on actions, execute them, and adapt its approach based on feedback. The agent maintains a single context, a single set of tools, and a single decision-making process. Despite this apparent simplicity, single-agent architectures are surprisingly powerful — and understanding their mechanics is essential before scaling to multi-agent systems.

### Why Single-Agent First?

Before reaching for multi-agent orchestration, every engineering team should ask: "Can a single agent solve this reliably?" The answer is "yes" more often than most teams expect.

| Capability | Single-Agent Sufficiency |
|---|---|
| Question answering | ✅ Fully sufficient |
| Document summarization | ✅ Fully sufficient |
| Code generation | ✅ Mostly sufficient |
| Data extraction from structured sources | ✅ Fully sufficient |
| Simple workflow automation | ✅ Fully sufficient |
| Multi-step research | ⚠️ Sufficient with planning |
| Complex codebases with multiple modules | ⚠️ Sufficient with tool design |
| Tasks requiring parallel independent work | ❌ Multi-agent preferred |
| Cross-domain expertise synthesis | ❌ Multi-agent preferred |

**Rule of thumb:** Start with a single agent. Escalate to multi-agent only when the single agent hits a structural limitation — context window saturation, skill dilution, or serial bottlenecks — not merely when the task is "complex."

---

## 4.2 The ReAct Pattern

The **ReAct (Reason + Act)** pattern, introduced by Yao et al. (2023), is the foundational loop behind most modern agents. It interleaves reasoning traces with action execution, creating a cycle of thinking, doing, and observing.

### The Core Loop

```
    ┌──────────────────────────────────────────────────────┐
    │                    REACT LOOP                         │
    │                                                       │
    │   ┌─────────┐    ┌─────────┐    ┌──────────┐        │
    │   │  THINK  │───→│  ACT    │───→│ OBSERVE  │        │
    │   │         │    │         │    │          │        │
    │   │ Analyze │    │ Execute │    │ Evaluate │        │
    │   │ plan    │    │ tool    │    │ result   │        │
    │   └─────────┘    └─────────┘    └────┬─────┘        │
    │        ↑                              │              │
    │        │         ┌─────────┐          │              │
    │        │         │  DONE?  │          │              │
    │        │         └────┬────┘          │              │
    │        │              │               │              │
    │        └──────────────┴───────────────┘              │
    └──────────────────────────────────────────────────────┘
```

Each iteration of the loop follows this sequence:

1. **Think**: The LLM analyzes the current state, reviews what it knows, and formulates a plan for the next step.
2. **Act**: The LLM selects one or more tools to call and emits structured tool-use blocks.
3. **Observe**: The harness executes the tools and feeds results back into the context.
4. **Evaluate**: The LLM checks if the task is complete. If not, it loops back to Think.

### ReAct in Practice

Here is what a ReAct trace looks like for a research task:

```
User: "What is the market cap of Apple and Microsoft, and which is larger?"

Think: I need to find the current market cap of both Apple and Microsoft.
       I'll look up each one separately.

Act:   search("Apple market cap 2026")

Observe: Apple Inc. (AAPL) market capitalization: $3.2 trillion as of July 2026.

Think: I have Apple's market cap. Now I need Microsoft's.

Act:   search("Microsoft market cap 2026")

Observe: Microsoft Corporation (MSFT) market capitalization: $2.9 trillion as of July 2026.

Think: Apple ($3.2T) is larger than Microsoft ($2.9T). I have both data points
       and can answer the question.

Act:   respond("Apple's market cap is $3.2 trillion and Microsoft's is $2.9
       trillion. Apple is currently the larger company by market capitalization,
       exceeding Microsoft by approximately $300 billion.")
```

### ReAct Implementation Patterns

There are several ways to implement the ReAct loop in production:

**Pattern 1: Native Tool Use (Recommended)**

Modern LLMs (Claude, GPT-4, Gemini) support tool calling natively. The ReAct loop maps directly onto the model's tool-use capability:

```python
def react_agent(user_message: str, tools: list[Tool], max_iterations: int = 10):
    messages = [{"role": "user", "content": user_message}]
    
    for i in range(max_iterations):
        response = llm.chat(messages=messages, tools=tools)
        
        if response.stop_reason == "end_turn":
            return response.content  # Task complete
        
        if response.stop_reason == "tool_use":
            # Execute all tool calls from this turn
            tool_results = []
            for tool_call in response.tool_calls:
                result = execute_tool(tool_call.name, tool_call.arguments)
                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": tool_call.id,
                    "content": result
                })
            
            messages.append({"role": "assistant", "content": response.content})
            messages.append({"role": "user", "content": tool_results})
    
    return "Maximum iterations reached without completion."
```

**Pattern 2: Prompt-Driven ReAct (Legacy)**

Before native tool calling, ReAct was implemented via prompt engineering:

```python
REACT_PROMPT = """You are a helpful assistant. You have access to the following tools:

{tool_descriptions}

To use a tool, respond in this exact format:

Thought: [your reasoning about what to do next]
Action: [tool_name]
Action Input: [JSON input for the tool]

When you have the final answer:
Thought: [your final reasoning]
Final Answer: [your answer to the user]

Begin!

Question: {question}
Thought:"""
```

This pattern is largely obsolete for production systems but remains useful for educational purposes and for models that lack native tool support.

**Pattern 3: Structured ReAct with Output Parsing**

A more robust version adds structured output validation:

```python
class ReActStep(BaseModel):
    thought: str
    action: str | None = None
    action_input: dict | None = None
    final_answer: str | None = None

def structured_react(user_message: str, tools: list[Tool]):
    messages = [{"role": "user", "content": user_message}]
    
    for _ in range(MAX_ITERATIONS):
        raw = llm.chat(messages=messages, response_format=ReActStep)
        step = parse_react_step(raw)
        
        if step.final_answer:
            return step.final_answer
        
        result = execute_tool(step.action, step.action_input)
        messages.append({"role": "user", "content": f"Observation: {result}"})
```

### When ReAct Breaks Down

ReAct has several well-documented failure modes:

| Failure Mode | Description | Mitigation |
|---|---|---|
| **Looping** | Agent repeats the same action expecting different results | Track action history; break loops after N repeats |
| **Premature termination** | Agent declares "done" before actually completing the task | Validate completion criteria before accepting final answer |
| **Hallucinated tools** | Agent tries to call tools that don't exist | Strict tool registry validation |
| **Context drift** | Agent loses track of the original goal after many iterations | Periodically restate the goal in context |
| **Over-reasoning** | Agent spends excessive tokens thinking without acting | Set token budgets per turn; encourage action |
| **Under-reasoning** | Agent acts without sufficient planning | Require explicit thinking before action |

---

## 4.3 Tool-Augmented LLMs

Tools transform an LLM from a text generator into an agent. Understanding tool design, tool selection, and tool composition is essential for building effective single-agent systems.

### Tool Design Principles

Well-designed tools share several characteristics:

**Principle 1: Single Responsibility**

Each tool should do one thing well. A `search_web` tool searches the web. A `read_file` tool reads a file. A tool named `search_and_summarize` violates this principle by combining two responsibilities.

```
Good:
  search(query) → search results
  summarize(text) → summary
  
Bad:
  search_and_summarize(query) → summary
  (combines two concerns; can't reuse search independently)
```

**Principle 2: Descriptive Naming**

The tool name is the primary signal the LLM uses to decide when to call it. Names should be verbs that clearly describe what the tool does.

```
Good:
  get_weather(city, date)
  send_email(to, subject, body)
  query_database(sql)
  
Bad:
  weather_helper(params)
  email_func(data)
  db(q)
```

**Principle 3: Rich Descriptions**

The tool description is the second signal the LLM uses. Include what the tool does, when to use it, and what it returns.

```python
@tool(
    name="search_knowledge_base",
    description=(
        "Search the company's internal knowledge base for documents, "
        "policies, and procedures. Use this when the user asks about "
        "company policies, internal processes, or documented procedures. "
        "Returns a list of relevant document snippets with titles and URLs."
    ),
    parameters={
        "query": {
            "type": "string",
            "description": "The search query. Be specific for best results."
        },
        "max_results": {
            "type": "integer",
            "description": "Maximum number of results to return. Default: 5.",
            "default": 5
        }
    }
)
```

**Principle 4: Predictable Error Handling**

Tools should return structured errors that the LLM can reason about, not raw stack traces.

```python
# Bad: raw exception
def search(query):
    try:
        return api.search(query)
    except Exception as e:
        raise  # LLM sees a stack trace, can't recover

# Good: structured error
def search(query):
    try:
        results = api.search(query)
        if not results:
            return {"status": "no_results", "message": f"No results found for '{query}'. Try different keywords."}
        return {"status": "success", "results": results}
    except RateLimitError:
        return {"status": "rate_limited", "message": "Search API rate limited. Please wait and try again."}
    except TimeoutError:
        return {"status": "timeout", "message": "Search timed out. The query may be too broad."}
```

**Principle 5: Composability**

Tools should work together. The output of one tool should be usable as the input of another, enabling the agent to chain tools naturally.

### Tool Selection Strategies

How does an LLM decide which tool to use? Several strategies exist:

**Strategy 1: Zero-Shot Tool Selection**

The LLM reads the tool descriptions and decides based on the task. This is the default behavior and works well when tool descriptions are clear and the number of tools is small (< 15).

```
Available tools:
  - search(query): Search the web for information
  - calculator(expression): Evaluate a math expression
  - read_file(path): Read the contents of a file

User: "What is 15% of $4,500?"

LLM selects: calculator("4500 * 0.15")
```

**Strategy 2: Few-Shot Tool Selection**

When tool selection is ambiguous, providing examples in the system prompt improves accuracy:

```
Tool usage examples:
- When asked about current events: use search()
- When asked to compute something: use calculator()
- When asked about file contents: use read_file()
- When asked to create something: use write_file()

User: "What's the population of Tokyo?"
LLM selects: search("population of Tokyo 2026")
```

**Strategy 3: Tool Routing via Metadata**

For large tool sets (> 20 tools), use a routing layer that selects the right tool subset before sending to the LLM:

```python
def route_tools(user_message: str, all_tools: list[Tool]) -> list[Tool]:
    """Use a fast classifier to select relevant tool subset."""
    categories = classify_intent(user_message)  # ["search", "computation"]
    relevant_tools = [t for t in all_tools if t.category in categories]
    return relevant_tools[:10]  # Cap at 10 to avoid context bloat
```

**Strategy 4: Hierarchical Tool Selection**

Group tools into categories and let the LLM first select a category, then select the specific tool:

```
Available categories:
  - data_retrieval: tools for fetching information
  - computation: tools for calculations
  - communication: tools for sending messages
  - file_operations: tools for reading/writing files

User: "Send an email to john@example.com with the quarterly report"

Step 1: LLM selects "communication" category
Step 2: From communication tools, LLM selects "send_email(to, subject, body)"
Step 3: For the report content, LLM may need "read_file(path)" from file_operations
```

### Tool Composition Patterns

Agents rarely use just one tool. Common composition patterns include:

**Sequential Composition**: Output of Tool A feeds into Tool B.

```
search("Q3 revenue data") → data
format_table(data) → formatted_table
write_file("report.md", formatted_table) → success
```

**Parallel Composition**: Multiple independent tools called simultaneously.

```
parallel:
  search("Apple market cap")
  search("Microsoft market cap")  
  search("Google market cap")
→ aggregate results → compare
```

**Conditional Composition**: Tool selection depends on previous tool results.

```
search("latest React version") → version
if version < current_version:
    run_command("npm update react")
else:
    respond("Already up to date")
```

**Iterative Composition**: Repeat tool calls until a condition is met.

```
while not found:
    search(query) → results
    if results.sufficient:
        found = True
    else:
        query = refine_query(query, results)
```

---

## 4.4 Planning Agents

Planning agents extend ReAct by explicitly generating a multi-step plan before taking action. Rather than deciding what to do one step at a time, a planning agent creates a roadmap and then executes it.

### Plan-then-Execute

The simplest planning pattern generates a plan upfront and then executes it step by step:

```
┌─────────────────────────────────────────────────┐
│              PLAN-THEN-EXECUTE                   │
│                                                  │
│  ┌─────────┐                                     │
│  │  USER   │                                     │
│  └────┬────┘                                     │
│       │                                          │
│       ▼                                          │
│  ┌─────────┐     ┌──────────────────────┐       │
│  │ PLAN    │────→│ 1. Research topic A   │       │
│  │         │     │ 2. Analyze data B     │       │
│  │         │     │ 3. Write report C     │       │
│  │         │     │ 4. Review and revise  │       │
│  └─────────┘     └──────────┬───────────┘       │
│                             │                    │
│                     ┌───────┴────────┐           │
│                     │   EXECUTE      │           │
│                     │                │           │
│                     │ Step 1 → Done  │           │
│                     │ Step 2 → Done  │           │
│                     │ Step 3 → Done  │           │
│                     │ Step 4 → Done  │           │
│                     └───────┬────────┘           │
│                             │                    │
│                             ▼                    │
│                      ┌──────────┐                │
│                      │  RESULT  │                │
│                      └──────────┘                │
└─────────────────────────────────────────────────┘
```

Implementation:

```python
def plan_and_execute(user_request: str, tools: list[Tool]):
    # Phase 1: Generate plan
    plan = llm.chat(
        messages=[{
            "role": "user",
            "content": f"""Create a step-by-step plan to accomplish this task:
            
Task: {user_request}

Available tools: {format_tools(tools)}

Return a numbered list of steps. Each step should specify:
1. What to do
2. Which tool(s) to use
3. What input is needed
4. What output is expected"""
        }]
    )
    
    steps = parse_plan(plan)
    
    # Phase 2: Execute plan
    results = {}
    for i, step in enumerate(steps):
        result = execute_step(step, tools, results)
        results[f"step_{i+1}"] = result
        
        # Check if plan needs revision
        if result.get("status") == "failure":
            # Re-plan from this point
            revised_steps = replan_from(i, steps, results)
            steps = steps[:i] + revised_steps
    
    return synthesize_results(results)
```

### Dynamic Replanning

Static plans fail when the world changes or when intermediate results reveal incorrect assumptions. Dynamic replanning adds a revision step:

```
┌──────────────────────────────────────────────────────┐
│                DYNAMIC REPLANNING                     │
│                                                       │
│   ┌──────┐    ┌────────┐    ┌─────────┐             │
│   │ PLAN │───→│EXECUTE │───→│EVALUATE │             │
│   └──────┘    └────────┘    └────┬────┘             │
│       ↑                          │                   │
│       │               ┌──────────┴──────────┐       │
│       │               │                     │       │
│       │            Success               Failure     │
│       │               │                     │       │
│       │          Continue              ┌────▼────┐  │
│       │          executing             │REPLAN   │  │
│       │               │                │Generate │  │
│       │               │                │new plan │  │
│       │               │                └────┬────┘  │
│       │               │                     │       │
│       └───────────────┴─────────────────────┘       │
└──────────────────────────────────────────────────────┘
```

### Decomposition Strategies

How should a planning agent break down a complex task? Several strategies exist:

**Strategy 1: Sequential Decomposition**

Break the task into ordered steps where each step depends on the previous:

```
"Write a research paper on quantum computing"

1. Search for recent quantum computing papers (2024-2026)
2. Identify top 10 most-cited papers
3. Read abstracts and conclusions of each paper
4. Synthesize findings into themes
5. Write introduction
6. Write body paragraphs
7. Write conclusion
8. Review and edit
```

**Strategy 2: Decomposition by Concern**

Separate the task into independent workstreams:

```
"Analyze our company's Q3 performance"

1. Retrieve financial data (revenue, costs, margins)
2. Retrieve customer data (acquisition, churn, satisfaction)
3. Retrieve operational data (uptime, incident reports, velocity)
4. Analyze financial trends
5. Analyze customer trends
6. Analyze operational trends
7. Cross-reference findings
8. Write executive summary
```

Steps 1-3 are independent and can run in parallel. Steps 4-6 depend on their respective data sources. Step 7-8 depend on all analyses.

**Strategy 3: Recursive Decomposition**

For very complex tasks, recursively decompose until steps are atomic:

```
"Build a REST API for user management"

├── Design database schema
│   ├── Define user table
│   ├── Define role table
│   └── Define permission table
├── Implement authentication
│   ├── JWT token generation
│   ├── Password hashing
│   └── Session management
├── Implement CRUD endpoints
│   ├── Create user
│   ├── Read user
│   ├── Update user
│   └── Delete user
├── Add validation
│   ├── Input validation
│   └── Authorization checks
└── Write tests
    ├── Unit tests
    ├── Integration tests
    └── Edge case tests
```

### Task Dependencies and DAGs

When steps have dependencies, represent them as a Directed Acyclic Graph (DAG):

```
        ┌──────────┐
        │  START   │
        └────┬─────┘
             │
     ┌───────┼───────┐
     │       │       │
     ▼       ▼       ▼
  ┌──────┐┌──────┐┌──────┐
  │Step A││Step B││Step C│   ← Parallel (no dependencies)
  └──┬───┘└──┬───┘└──┬───┘
     │       │       │
     └───────┼───────┘
             │
             ▼
        ┌──────────┐
        │  Step D  │         ← Depends on A, B, and C
        └────┬─────┘
             │
             ▼
        ┌──────────┐
        │  Step E  │         ← Depends on D
        └────┬─────┘
             │
             ▼
        ┌──────────┐
        │   END    │
        └──────────┘
```

The agent builds the DAG, identifies independent paths, and executes them in the optimal order.

---

## 4.5 Autonomous Task Execution

Autonomous agents go beyond single-turn tool use. They set their own sub-goals, manage their own execution, and recover from failures without human intervention.

### The Autonomous Loop

```
┌────────────────────────────────────────────────────────────────┐
│                 AUTONOMOUS AGENT LOOP                            │
│                                                                  │
│  ┌──────────┐                                                   │
│  │  GOAL    │  "Write a Python web scraper for product prices"  │
│  └────┬─────┘                                                   │
│       │                                                         │
│       ▼                                                         │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐                  │
│  │  THINK   │───→│  PLAN    │───→│  ACT     │                  │
│  │          │    │          │    │          │                  │
│  │ What do  │    │ What     │    │ Execute  │                  │
│  │ I know?  │    │ should   │    │ the next │                  │
│  │ What do  │    │ I do     │    │ action   │                  │
│  │ I need?  │    │ next?    │    │          │                  │
│  └──────────┘    └──────────┘    └────┬─────┘                  │
│                                       │                         │
│                                       ▼                         │
│                                ┌──────────┐                    │
│                                │ OBSERVE  │                    │
│                                │          │                    │
│                                │ What     │                    │
│                                │ happened?│                    │
│                                │ Did it   │                    │
│                                │ work?    │                    │
│                                └────┬─────┘                    │
│                                     │                          │
│                          ┌──────────┴──────────┐               │
│                          │                     │               │
│                       Success              Failure              │
│                          │                     │               │
│                    ┌─────▼─────┐        ┌──────▼──────┐       │
│                    │ UPDATE    │        │ DIAGNOSE    │       │
│                    │ GOAL      │        │ & RECOVER   │       │
│                    │ STATE     │        │             │       │
│                    └─────┬─────┘        └──────┬──────┘       │
│                          │                     │               │
│                          └──────────┬──────────┘               │
│                                     │                          │
│                            ┌────────▼────────┐                 │
│                            │ GOAL COMPLETE?  │                 │
│                            └────────┬────────┘                 │
│                                     │                          │
│                              ┌──────┴──────┐                   │
│                              │             │                   │
│                             Yes            No                   │
│                              │             │                   │
│                        ┌─────▼─────┐  Loop back to THINK      │
│                        │  RETURN   │                           │
│                        │  RESULT   │                           │
│                        └───────────┘                           │
└────────────────────────────────────────────────────────────────┘
```

### Goal Management

Autonomous agents need to manage goals at multiple levels:

**Level 1: Top-level goal** — The user's original request.

**Level 2: Sub-goals** — Intermediate milestones the agent sets for itself.

**Level 3: Immediate actions** — The specific tool calls the agent makes.

```python
class GoalManager:
    def __init__(self, top_level_goal: str):
        self.top_level = top_level_goal
        self.sub_goals: list[SubGoal] = []
        self.completed: list[SubGoal] = []
        self.current: SubGoal | None = None
    
    def decompose(self):
        """Break top-level goal into sub-goals."""
        self.sub_goals = llm.chat(
            messages=[{
                "role": "user",
                "content": f"Break this goal into sub-goals: {self.top_level}"
            }]
        )
    
    def get_next_action(self, context: str) -> Action:
        """Determine the next immediate action."""
        return llm.chat(
            messages=[{
                "role": "user",
                "content": f"""
Top-level goal: {self.top_level}
Current sub-goal: {self.current}
Completed: {self.completed}
Context so far: {context}

What is the single next action to take?"""
            }]
        )
    
    def evaluate_progress(self, action_result: str) -> bool:
        """Check if the current sub-goal is achieved."""
        return llm.chat(
            messages=[{
                "role": "user",
                "content": f"""
Sub-goal: {self.current}
Action result: {action_result}

Is this sub-goal complete? Yes or No, with explanation."""
            }]
        )
```

### Error Recovery Strategies

Autonomous agents must handle failures gracefully. Common recovery strategies:

**Strategy 1: Retry with Backoff**

For transient failures (network timeouts, rate limits):

```python
def retry_with_backoff(tool_call, max_retries=3):
    for attempt in range(max_retries):
        result = tool_call()
        if result["status"] == "success":
            return result
        if result["status"] == "rate_limited":
            time.sleep(2 ** attempt * 5)  # 5s, 10s, 20s
            continue
        if result["status"] == "permanent_error":
            break  # Don't retry permanent errors
    return None
```

**Strategy 2: Alternative Tool Selection**

If one tool fails, try an alternative:

```python
def execute_with_fallback(preferred_tool, fallback_tools, args):
    result = preferred_tool(args)
    if result["status"] == "success":
        return result
    
    for fallback in fallback_tools:
        result = fallback(args)
        if result["status"] == "success":
            return result
    
    return {"status": "all_tools_failed"}
```

**Strategy 3: Self-Diagnosis and Replanning**

When an action fails, the agent diagnoses the failure and generates a new plan:

```
Think: The search returned no results for "quantum computing applications 
       in agriculture." This is a very niche topic. I should broaden my 
       search or try a different approach.

New plan:
1. Search for "quantum computing applications" (broader)
2. From results, identify any agriculture-related applications
3. If none found, search for "agriculture technology innovation" 
   to find the agriculture side of this intersection
```

**Strategy 4: Graceful Degradation**

When perfect results aren't achievable, provide the best available answer with caveats:

```
Think: I couldn't find the exact 2026 revenue figures for this private 
       company. However, I found their 2025 figures and a growth rate 
       estimate. I'll provide this with appropriate caveats.
```

### Memory and State Management

Autonomous agents running long tasks need to manage state across iterations:

**Working Memory**: What the agent knows right now, relevant to the current sub-goal.

```python
working_memory = {
    "current_sub_goal": "Write test cases for user authentication",
    "relevant_context": "The auth module uses JWT tokens with 24h expiry",
    "known_constraints": "Must test edge cases: expired tokens, invalid signatures",
    "attempted_actions": ["read auth.py", "read existing tests"],
    "current_blockers": None
}
```

**Episodic Memory**: What has happened so far in the session.

```python
episodic_memory = [
    {"step": 1, "action": "read_file('auth.py')", "result": "Found JWT implementation"},
    {"step": 2, "action": "read_file('test_auth.py')", "result": "Found 3 existing tests"},
    {"step": 3, "action": "search('JWT edge cases')", "result": "Found common vulnerabilities"},
]
```

**Goal Stack**: For nested goals (goal A requires goal B which requires goal C):

```python
goal_stack = [
    {"goal": "Complete user's request", "status": "in_progress"},
    {"goal": "Write authentication tests", "status": "in_progress"},
    {"goal": "Read existing auth implementation", "status": "completed"},
    {"goal": "Identify untested edge cases", "status": "in_progress"},
]
```

---

## 4.6 Reflection and Self-Critique

Advanced single-agent architectures include a reflection step where the agent evaluates its own output before presenting it to the user.

### The Generate-then-Critique Pattern

```
┌────────────────────────────────────────────────────┐
│          GENERATE → CRITIQUE → REVISE              │
│                                                     │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐     │
│  │ GENERATE │───→│ CRITIQUE │───→│ REVISE   │     │
│  │          │    │          │    │          │     │
│  │ Produce  │    │ Evaluate │    │ Fix      │     │
│  │ initial  │    │ against  │    │ issues   │     │
│  │ output   │    │ criteria │    │ found    │     │
│  └──────────┘    └────┬─────┘    └────┬─────┘     │
│                       │               │            │
│                  ┌────▼─────┐         │            │
│                  │ACCEPTABLE?│         │            │
│                  └────┬─────┘         │            │
│                       │               │            │
│                ┌──────┴──────┐        │            │
│                │             │        │            │
│               Yes            No ──────┘            │
│                │                                   │
│           ┌────▼─────┐                             │
│           │  RETURN  │                             │
│           └──────────┘                             │
└────────────────────────────────────────────────────┘
```

Implementation:

```python
def generate_and_critique(task: str, tools: list[Tool]):
    # Phase 1: Generate
    draft = agent_react(task, tools)
    
    # Phase 2: Critique
    critique = llm.chat(
        messages=[{
            "role": "user",
            "content": f"""You are a critical reviewer. Evaluate this output 
against the original task:

Task: {task}
Output: {draft}

Check for:
1. Correctness - Are facts and logic accurate?
2. Completeness - Does it address all parts of the task?
3. Clarity - Is it well-organized and easy to understand?
4. Edge cases - Are edge cases handled?

Provide specific, actionable feedback."""
        }]
    )
    
    if critique.indicates_acceptable:
        return draft
    
    # Phase 3: Revise
    revised = llm.chat(
        messages=[{
            "role": "user",
            "content": f"""Revise this output based on the critique:

Original task: {task}
Draft: {draft}
Critique: {critique}

Produce a revised version that addresses all critique points."""
        }]
    )
    
    return revised
```

### Verification Loops

For tasks where correctness is critical, add verification loops:

```python
def verify_answer(task: str, answer: str, tools: list[Tool]) -> bool:
    """Verify an answer by checking its claims independently."""
    
    claims = extract_claims(answer)
    for claim in claims:
        # Verify each claim using tools
        evidence = search_for_evidence(claim, tools)
        if not supports_claim(evidence, claim):
            return False
    
    return True
```

---

## 4.7 Context Window Management in Single Agents

Even a single agent must carefully manage its context window. As tasks grow longer, the context fills with tool calls, results, and reasoning traces.

### The Context Budget Problem

```
┌────────────────────────────────────────────────────┐
│              CONTEXT WINDOW BUDGET                  │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │ System Prompt                            2K   │  │
│  ├──────────────────────────────────────────────┤  │
│  │ Tool Descriptions                        3K   │  │
│  ├──────────────────────────────────────────────┤  │
│  │ Conversation History (growing)          15K   │  │
│  ├──────────────────────────────────────────────┤  │
│  │ Current Tool Results (large)            20K   │  │
│  ├──────────────────────────────────────────────┤  │
│  │ Available for Next Response              6K   │  │
│  ├──────────────────────────────────────────────┤  │
│  │ MAX CONTEXT                            100K   │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ⚠️ At this rate, the agent has ~3 iterations      │
│     before hitting the context limit.              │
└────────────────────────────────────────────────────┘
```

### Management Strategies

**Strategy 1: Sliding Window**

Keep only the most recent N interactions in context:

```python
def sliding_window_context(messages: list, max_tokens: int = 50000):
    """Keep system prompt + most recent messages within budget."""
    system = messages[0]  # Always keep system prompt
    recent = messages[1:]
    
    while token_count(system + recent) > max_tokens and len(recent) > 2:
        # Remove oldest non-system message
        recent.pop(0)
    
    return [system] + recent
```

**Strategy 2: Summarization**

Periodically summarize older parts of the conversation:

```python
def summarize_and_compress(messages: list, threshold: float = 0.7):
    """Summarize messages when context usage exceeds threshold."""
    usage = token_count(messages) / MAX_CONTEXT
    
    if usage > threshold:
        # Summarize older messages
        old_messages = messages[1:-4]  # Keep system + last 2 exchanges
        recent_messages = messages[-4:]
        
        summary = llm.chat(
            messages=[{
                "role": "user",
                "content": f"Summarize this conversation concisely:\n{format_messages(old_messages)}"
            }]
        )
        
        return [messages[0], {"role": "assistant", "content": f"[Summary of previous conversation: {summary}]"}] + recent_messages
    
    return messages
```

**Strategy 3: Result Truncation**

Truncate large tool results before adding them to context:

```python
def truncate_tool_result(result: str, max_chars: int = 2000) -> str:
    if len(result) <= max_chars:
        return result
    return result[:max_chars] + f"\n\n[Truncated: {len(result) - max_chars} characters omitted. Use more specific queries to get smaller results.]"
```

**Strategy 4: Selective Context**

Only include context relevant to the current sub-goal:

```python
def selective_context(full_context: list, current_goal: str) -> list:
    """Filter context to only include items relevant to current goal."""
    relevant = [full_context[0]]  # Always include system prompt
    for item in full_context[1:]:
        relevance = llm.chat(
            messages=[{
                "role": "user",
                "content": f"Is this relevant to the goal '{current_goal}'?\n\n{item}\n\nAnswer: Yes or No"
            }]
        )
        if "yes" in relevance.lower():
            relevant.append(item)
    return relevant
```

---

## 4.8 Structured Output in Single Agents

Single agents often need to produce structured output — JSON, code, tables — rather than free-form text. Structured output techniques ensure the agent's responses are machine-parseable.

### Output Schema Definition

Define the expected output format in the system prompt or via tool parameters:

```python
class ResearchReport(BaseModel):
    topic: str
    summary: str
    key_findings: list[str]
    sources: list[Source]
    confidence: float  # 0.0 to 1.0
    limitations: list[str]

# The agent produces output matching this schema
report = llm.chat(
    messages=[...],
    response_format=ResearchReport
)
```

### Code Generation Patterns

For agents that generate code, structured output is critical:

```python
class CodeGeneration(BaseModel):
    language: str
    code: str
    explanation: str
    dependencies: list[str]
    test_cases: list[str]

def generate_code_agent(task: str):
    result = llm.chat(
        messages=[{
            "role": "user",
            "content": f"""Generate code for this task:

Task: {task}

Return a CodeGeneration with:
- language: the programming language
- code: the complete, runnable code
- explanation: how it works
- dependencies: required packages
- test_cases: example usage"""
        }],
        response_format=CodeGeneration
    )
    
    # Verify the code runs
    test_result = execute_code(result.code)
    if test_result.failed:
        # Fix and retry
        return fix_code(task, result, test_result.error)
    
    return result
```

---

## 4.9 The Complete Single-Agent System

Combining all patterns, a production single-agent system looks like this:

```
┌──────────────────────────────────────────────────────────────────────┐
│                  PRODUCTION SINGLE-AGENT ARCHITECTURE                  │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │                    USER REQUEST                                 │  │
│  └────────────────────────┬───────────────────────────────────────┘  │
│                           │                                          │
│                           ▼                                          │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │                    INPUT PROCESSING                             │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │  │
│  │  │Validate  │→ │Sanitize  │→ │Classify  │→ │Route     │     │  │
│  │  │Input     │  │Content   │  │Intent    │  │to Agent  │     │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │  │
│  └────────────────────────┬───────────────────────────────────────┘  │
│                           │                                          │
│                           ▼                                          │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │                    PLANNING PHASE                               │  │
│  │  ┌──────────────────────────────────────────────────────┐     │  │
│  │  │ Decompose task → Generate DAG → Identify dependencies│     │  │
│  │  └──────────────────────────────────────────────────────┘     │  │
│  └────────────────────────┬───────────────────────────────────────┘  │
│                           │                                          │
│                           ▼                                          │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │                    EXECUTION LOOP (ReAct)                       │  │
│  │                                                                 │  │
│  │  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐             │  │
│  │  │  Think │→ │  Plan  │→ │  Act   │→ │Observe │             │  │
│  │  └────────┘  └────────┘  └────────┘  └───┬────┘             │  │
│  │       ↑                                   │                    │  │
│  │       │    ┌──────────┐  ┌──────────┐    │                    │  │
│  │       │    │ Reflection│  │ Memory   │    │                    │  │
│  │       │    │ Module    │  │ Manager  │    │                    │  │
│  │       │    └──────────┘  └──────────┘    │                    │  │
│  │       │                                   │                    │  │
│  │       └───────────────────────────────────┘                    │  │
│  │                                                                 │  │
│  │  ┌──────────────────────────────────────────────────────┐     │  │
│  │  │              TOOL EXECUTION LAYER                     │     │  │
│  │  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────────┐   │     │  │
│  │  │  │Search  │ │Code    │ │Database│ │File System │   │     │  │
│  │  │  │Engine  │ │Exec    │ │Queries │ │Operations  │   │     │  │
│  │  │  └────────┘ └────────┘ └────────┘ └────────────┘   │     │  │
│  │  └──────────────────────────────────────────────────────┘     │  │
│  └────────────────────────┬───────────────────────────────────────┘  │
│                           │                                          │
│                           ▼                                          │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │                    OUTPUT PROCESSING                            │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │  │
│  │  │ Critique │→ │ Validate │→ │ Format   │→ │ Deliver  │     │  │
│  │  │ Output   │  │ Correct  │  │ Response │  │ to User  │     │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │  │
│  └────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

### When to Graduate to Multi-Agent

Single-agent architectures have natural limits. Graduate to multi-agent when you observe:

| Signal | Threshold | Action |
|---|---|---|
| Context window usage | > 80% on average tasks | Split across specialist agents |
| Task completion time | > 3x longer than expected | Parallelize independent subtasks |
| Error rate | > 15% on complex tasks | Add independent verification agent |
| Prompt length | > 5000 tokens just for instructions | Specialize into focused agent prompts |
| Tool count | > 20 tools registered | Split into domain-specific tool sets |

---

## 4.10 Case Study: A Production Single-Agent System

Let's build a concrete example: a **code review agent** that examines pull requests, identifies issues, and produces structured review comments.

### Requirements

- Accept a diff (file changes) as input
- Identify bugs, security issues, style problems, and performance concerns
- Produce structured comments with severity levels
- Handle diffs of any size (up to context window limits)
- Provide accurate line references

### Architecture

```python
class ReviewComment(BaseModel):
    file: str
    line: int
    category: str  # bug, security, style, performance
    severity: str  # critical, warning, info
    description: str
    suggestion: str | None = None

class ReviewResult(BaseModel):
    summary: str
    comments: list[ReviewComment]
    overall_quality: str  # needs_work, acceptable, good

class CodeReviewAgent:
    def __init__(self):
        self.tools = [
            read_file_tool,
            search_codebase_tool,
            check_dependencies_tool,
        ]
        self.system_prompt = """You are an expert code reviewer. Analyze the 
provided diff and identify issues. Focus on:
1. Correctness bugs
2. Security vulnerabilities
3. Performance problems
4. Code style and maintainability

Be specific. Reference exact line numbers. Explain why each issue matters.
Only flag real problems — don't nitpick style unless it affects readability."""
    
    def review(self, diff: str) -> ReviewResult:
        # Handle large diffs by chunking
        if token_count(diff) > 30000:
            return self._review_chunked(diff)
        return self._review_single(diff)
    
    def _review_single(self, diff: str) -> ReviewResult:
        return llm.chat(
            messages=[
                {"role": "system", "content": self.system_prompt},
                {"role": "user", "content": f"Review this diff:\n\n{diff}"}
            ],
            tools=self.tools,
            response_format=ReviewResult
        )
    
    def _review_chunked(self, diff: str) -> ReviewResult:
        chunks = split_diff_by_file(diff)
        all_comments = []
        
        for chunk in chunks:
            result = self._review_single(chunk)
            all_comments.extend(result.comments)
        
        # Deduplicate and summarize
        deduped = deduplicate_comments(all_comments)
        return ReviewResult(
            summary=generate_summary(deduped),
            comments=deduped,
            overall_quality=assess_quality(deduped)
        )
```

### Key Design Decisions

1. **Structured output**: Using Pydantic models ensures the agent produces machine-parseable results.
2. **Chunking**: Large diffs are split by file to stay within context limits.
3. **Tool access**: The agent can read full files for context beyond the diff.
4. **System prompt specificity**: The prompt focuses the agent on high-value issues, avoiding noise.

---

## 4.11 Summary

Single-agent architectures are the foundation of agent engineering. The key patterns are:

| Pattern | Purpose | When to Use |
|---|---|---|
| **ReAct** | Interleave reasoning with action | Default for most agent tasks |
| **Tool Augmentation** | Extend LLM capabilities | Always — agents without tools are chatbots |
| **Planning** | Decompose complex tasks | When tasks have multiple dependent steps |
| **Autonomous Execution** | Self-directed task completion | When tasks require many iterations |
| **Reflection** | Self-critique and improvement | When output quality is critical |
| **Context Management** | Handle long-running tasks | When tasks exceed context window capacity |

**The progression of agent sophistication:**

```
Chatbot → Tool-Using LLM → ReAct Agent → Planning Agent → Autonomous Agent
   │           │                │               │                │
   │           │                │               │                │
No tools    Single tool     Tool loop      Multi-step       Self-directed
            calls           with think     with replan      with recovery
```

Start simple. Add complexity only when the simpler approach fails. A well-designed single agent with good tools, clear prompts, and solid error handling can solve more problems than most teams realize.

---

*Next: Chapter 5 — Multi-Agent Orchestration Patterns, where we scale from one agent to many.*
