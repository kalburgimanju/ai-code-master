# Chapter 1: Introduction to Agent Engineering — From Prompt Engineering to Agent Engineering

> "The best way to predict the future is to invent it." — Alan Kay

---

## 1.1 What is Agent Engineering?

Agent Engineering is the discipline of building reliable, observable, and controllable autonomous systems powered by large language models (LLMs). It encompasses the full lifecycle of designing, implementing, evaluating, deploying, and maintaining software systems that leverage LLMs as reasoning engines — augmented with tools, memory, and orchestration logic — to accomplish complex tasks with minimal human intervention.

This is not prompt engineering. It is not fine-tuning. It is not merely "using an API." Agent Engineering is a rigorous engineering practice that treats LLM-powered systems with the same discipline we apply to distributed systems, databases, or any other production software: with structured design, systematic evaluation, and operational rigor.

### Defining the Discipline

At its core, Agent Engineering addresses a fundamental question: **How do we build systems where LLMs are not just text generators, but reliable components in larger software architectures?**

Consider the difference:

```python
# Prompt engineering: crafting a single prompt
prompt = "Summarize this document in bullet points: {document}"
response = llm.generate(prompt)
return response

# Agent engineering: building a reliable system
class DocumentSummarizerAgent:
    def __init__(self, llm, tool_registry, memory_store):
        self.llm = llm
        self.tools = tool_registry
        self.memory = memory_store
        self.evaluator = SummarizationEvaluator()

    async def process(self, document: Document) -> Summary:
        # 1. Context assembly
        context = await self.assemble_context(document)

        # 2. Planning
        plan = await self.create_plan(context)

        # 3. Execution with tools
        result = await self.execute_plan(plan)

        # 4. Evaluation
        quality = self.evaluator.assess(result, document)

        # 5. Memory update
        await self.memory.store(document.id, result, quality)

        # 6. Return with confidence score
        return Summary(
            content=result,
            confidence=quality.score,
            metadata=self.build_metadata()
        )
```

The first is a function. The second is a system. Agent Engineering is the practice of building the system.

### The Agent Engineering Stack

The agent engineering stack consists of six layers, each presenting distinct engineering challenges:

```
┌─────────────────────────────────────────────────────────┐
│                    EVALUATION & MONITORING                │
│         Metrics · Traces · Benchmarks · Alerts           │
├─────────────────────────────────────────────────────────┤
│                    ORCHESTRATION                          │
│    Routing · State Machines · DAGs · Error Recovery      │
├─────────────────────────────────────────────────────────┤
│                       MEMORY                             │
│         Short-term · Long-term · Episodic · Semantic     │
├─────────────────────────────────────────────────────────┤
│                       TOOLS                              │
│     APIs · Databases · Code Execution · File Systems     │
├─────────────────────────────────────────────────────────┤
│                     CONTEXT                              │
│   RAG · Prompt Assembly · Token Management · Caching     │
├─────────────────────────────────────────────────────────┤
│                       MODEL                              │
│      LLM Selection · Routing · Fallbacks · Cost Control  │
└─────────────────────────────────────────────────────────┘
```

Each layer depends on the ones below it and serves the ones above. A failure in context management (too much irrelevant information) cascades into poor orchestration decisions, which produce bad tool calls, which yield incorrect results — regardless of how capable the underlying model is.

### What Agent Engineering is NOT

Before going further, let's be precise about what this discipline is not:

| Discipline | Focus | Relation to Agent Engineering |
|---|---|---|
| Prompt Engineering | Crafting effective text inputs for LLMs | A subset — context engineering subsumes it |
| Fine-tuning | Modifying model weights for specific tasks | Sometimes used, but not the core practice |
| MLOps | Model training, deployment, infrastructure | Supports agent deployment but doesn't cover design |
| Software Engineering | General application development | The foundation, but insufficient alone |
| Data Engineering | Data pipelines and storage | Critical for RAG and context, but narrower in scope |

Agent Engineering draws from all of these but is distinct in its focus: **building reliable autonomous systems, not just better prompts or models.**

---

## 1.2 The Evolution: From Prompts to Agents

The evolution from prompt engineering to agent engineering was not a single leap but a series of incremental advances, each building on the capabilities and limitations of the previous stage.

### The Timeline

```
2022                2023                2024                2025-2026
 │                   │                   │                   │
 ▼                   ▼                   ▼                   ▼
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────────┐
│ PROMPT   │    │ TOOL USE │    │  AGENTS  │    │    AGENT     │
│ENGINERRNG│───▶│   ERA    │───▶│   ERA    │───▶│  ENGINEERING │
│          │    │          │    │          │    │              │
│ Single   │    │ Function │    │ Autono-  │    │  Reliable,   │
│ turn,    │    │ calling, │    │ mous     │    │  observable, │
│ text in  │    │ RAG,     │    │ loops,   │    │  eval-driven │
│ text out │    │ chains   │    │ planning │    │  systems     │
└──────────┘    └──────────┘    └──────────┘    └──────────────┘
```

### Prompt Engineering Era (2022)

In the prompt engineering era, the primary workflow was:

1. Write a prompt
2. Send it to the model
3. Get a response
4. Manually evaluate the response
5. Tweak the prompt
6. Repeat

This was powerful but fundamentally limited. The model could only do what the prompt described, and every interaction was stateless. Complex tasks required increasingly elaborate prompt templates, but there was no mechanism for the model to take action, recover from errors, or work through multi-step problems.

### Tool Use Era (2023)

The introduction of tool use (function calling) transformed LLMs from text generators into text-and-action generators. Models could now:

- Call external APIs and functions
- Retrieve information from databases
- Execute code
- Interact with the outside world

This opened the door to retrieval-augmented generation (RAG), where the model could fetch relevant documents before generating a response. Chains of LLM calls could be composed, where each step's output fed into the next.

But the orchestration was still largely manual. Developers had to explicitly define every step in the chain.

### Agent Era (2024)

Agents emerged when models gained the ability to decide their own next steps. Rather than following a predetermined chain, an agent could:

- Assess the current state
- Decide which tool to use
- Execute the tool
- Evaluate the result
- Decide what to do next

This was a paradigm shift: from deterministic workflows to dynamic, model-driven execution. But early agents were fragile, hard to debug, and lacked systematic evaluation.

### Agent Engineering Era (2025-2026)

Agent Engineering formalizes the practices needed to make agents production-ready:

- **Structured context management**: Not just "what prompt do I write" but "what information does the model need at each decision point"
- **Systematic evaluation**: Benchmarks, metrics, regression testing for agent behavior
- **Operational observability**: Tracing, logging, cost tracking, latency monitoring
- **Safety and alignment**: Guardrails, human-in-the-loop, failure modes
- **Production operations**: Deployment, scaling, monitoring, incident response

### Prompt Engineering vs. Agent Engineering

| Dimension | Prompt Engineering | Agent Engineering |
|---|---|---|
| Scope | Single input → single output | Multi-step workflows with tool use |
| State | Stateless | Stateful with memory |
| Error handling | User retries the prompt | Automatic retry, fallback, recovery |
| Evaluation | Manual "does this look right" | Systematic benchmarks and metrics |
| Observability | Logs of inputs/outputs | Full traces of reasoning and actions |
| Cost management | Pay per call | Budget-aware routing and caching |
| Testing | Ad-hoc | Automated regression suites |
| Deployment | Ship the prompt | Ship the system |
| Team | Individual craft | Cross-functional engineering |

The key insight is that **prompt engineering is a skill within agent engineering, not a replacement for it.** You still need to craft effective prompts (now called context engineering — see Chapter 2), but that skill alone is insufficient for building production systems.

---

## 1.3 The Agent Engineering Lifecycle

Building reliable agent systems requires a structured lifecycle that accounts for the unique challenges of LLM-powered systems: non-determinism, cost variability, and emergent behaviors.

### The Lifecycle Phases

```
    ┌──────────┐
    │  DESIGN  │◄──────────────────────────────────────┐
    └────┬─────┘                                       │
         │                                             │
         ▼                                             │
    ┌──────────┐         ┌──────────┐                  │
    │PROTOTYPE │────────▶│ EVALUATE │                  │
    └────┬─────┘         └────┬─────┘                  │
         │                    │                         │
         │                    ▼                         │
         │              ┌──────────┐                    │
         │              │ ITERATE  │────────────────────┘
         │              └────┬─────┘
         │                   │
         │                   ▼ (when quality threshold met)
         │              ┌──────────┐
         │              │ DEPLOY   │
         │              └────┬─────┘
         │                   │
         │                   ▼
         │              ┌──────────┐         ┌──────────┐
         │              │ MONITOR  │────────▶│ IMPROVE  │
         │              └──────────┘         └────┬─────┘
         │                                       │
         └───────────────────────────────────────┘
```

### Phase 1: Design

Design is the most underrated and most important phase. Before writing a single line of code, you must understand:

- **Task decomposition**: What steps does the agent need to perform?
- **Tool requirements**: What external systems does it need to interact with?
- **Context needs**: What information does the model need at each step?
- **Failure modes**: What can go wrong, and how should the system respond?
- **Cost constraints**: What is the budget for latency, tokens, and API calls?

A design document for an agent should answer:

```
Agent Design Template
═══════════════════════════════════════════
Purpose:        What does this agent accomplish?
Users:          Who uses it and how?
Tools:          What tools does it need?
Context:        What information does it need?
Steps:          What is the execution flow?
Errors:         What can go wrong?
Metrics:        How do we know it's working?
Cost:           What is the budget per invocation?
Safety:         What guardrails are needed?
═══════════════════════════════════════════
```

### Phase 2: Prototype

Build the minimum viable agent. Start with the simplest possible implementation:

```python
from anthropic import Anthropic

client = Anthropic()

def research_agent(query: str) -> str:
    """Minimal research agent — prototype only."""
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=4096,
        messages=[{"role": "user", "content": query}]
    )
    return response.content[0].text
```

This prototype tells you whether the approach is feasible. It does not tell you whether it is reliable, cost-effective, or safe. That comes next.

### Phase 3: Evaluate

Evaluation is the practice of measuring agent behavior against defined criteria. This is where agent engineering diverges most sharply from prompt engineering:

```python
# Evaluation criteria for a research agent
eval_criteria = {
    "accuracy": {
        "description": "Does the response contain factual errors?",
        "metric": "human_judgment_binary",
        "threshold": 0.95
    },
    "completeness": {
        "description": "Does it address all aspects of the query?",
        "metric": "rubric_score_1_to_5",
        "threshold": 4.0
    },
    "latency": {
        "description": "Does it respond within acceptable time?",
        "metric": "p99_latency_ms",
        "threshold": 10000
    },
    "cost": {
        "description": "Does it stay within budget?",
        "metric": "max_tokens_per_request",
        "threshold": 8000
    }
}
```

### Phase 4: Iterate

Iteration in agent engineering is driven by evaluation results. When an evaluation fails, you diagnose the root cause:

- **Context problem**: The model lacks necessary information → improve context assembly
- **Tool problem**: The wrong tool was called or the tool returned bad data → improve tool selection or tool design
- **Reasoning problem**: The model made an incorrect inference → adjust prompts or use a more capable model
- **Orchestration problem**: The workflow was followed incorrectly → improve control flow

### Phase 5: Deploy

Deployment of agent systems requires careful consideration of:

- **Infrastructure**: Where does the agent run? Serverless, container, dedicated?
- **Dependencies**: What external services does it depend on? What happens when they fail?
- **Scaling**: How does the system handle increased load?
- **Secrets**: How are API keys and credentials managed?
- **Rollback**: How do you revert if something goes wrong?

### Phase 6: Monitor

Once deployed, agents require continuous monitoring:

```python
# Monitoring hooks for production agents
class AgentMonitor:
    def track(self, event: AgentEvent):
        metrics.emit("agent.tokens_used", event.tokens)
        metrics.emit("agent.latency_ms", event.duration)
        metrics.emit("agent.tool_calls", len(event.tool_calls))
        metrics.emit("agent.errors", event.error_count)

        if event.duration > self.latency_threshold:
            alerts.fire("agent.slow_response", {
                "agent_id": self.agent_id,
                "duration": event.duration,
                "threshold": self.latency_threshold
            })

        if event.error_rate > self.error_threshold:
            alerts.fire("agent.high_error_rate", {
                "agent_id": self.agent_id,
                "error_rate": event.error_rate
            })
```

### Phase 7: Improve

Improvement is continuous. It comes from analyzing production data:

- Which queries cause failures?
- Which tools are most/least used?
- Where are the bottlenecks?
- What are the cost drivers?
- Which edge cases weren't caught in evaluation?

This analysis feeds back into the Design phase, completing the cycle.

---

## 1.4 Core Competencies

Agent Engineering requires a blend of competencies drawn from multiple disciplines. Understanding these helps you identify gaps in your knowledge and focus your learning.

### LLM Fundamentals

You don't need to train models, but you must understand how they work at a functional level:

- **Tokenization**: How text becomes numbers, and why this matters for context limits and cost
- **Temperature and sampling**: How randomness affects output quality and consistency
- **Instruction following**: How models interpret and execute instructions
- **Reasoning capabilities**: What models can and cannot reason about
- **Failure modes**: Hallucination, sycophancy, inconsistency, and how to detect them

### System Design and Architecture

Agent systems are software systems. They require:

- **State management**: Tracking where the agent is in a multi-step process
- **Error handling**: Graceful degradation when tools fail or models produce unexpected output
- **Concurrency**: Running multiple agents or tool calls in parallel
- **Caching**: Avoiding redundant model calls and tool invocations
- **Modularity**: Separating concerns so components can be tested and replaced independently

### Evaluation and Testing Methodology

This is arguably the most important competency. Without systematic evaluation, you are flying blind:

```python
class EvaluationSuite:
    """Example evaluation framework for agents."""

    def __init__(self, agent, test_cases):
        self.agent = agent
        self.test_cases = test_cases

    def run(self) -> EvaluationReport:
        results = []
        for case in self.test_cases:
            result = self.agent.process(case.input)
            score = case.evaluate(result)
            results.append(EvalResult(
                test_id=case.id,
                input=case.input,
                output=result,
                score=score,
                passed=score >= case.threshold
            ))

        return EvaluationReport(
            results=results,
            pass_rate=sum(r.passed for r in results) / len(results),
            avg_score=sum(r.score for r in results) / len(results),
            failures=[r for r in results if not r.passed]
        )
```

### Production Operations

Running agent systems in production requires skills from DevOps and SRE:

- **Observability**: Tracing, logging, metrics (the three pillars)
- **Incident response**: What to do when the agent behaves badly in production
- **Capacity planning**: Forecasting token usage and API costs
- **Security**: Protecting against prompt injection, data leakage, and unauthorized tool use
- **Compliance**: Meeting regulatory requirements for AI systems

### Safety and Alignment

As agents become more autonomous, safety becomes paramount:

- **Guardrails**: Preventing the agent from taking harmful actions
- **Human-in-the-loop**: Requiring human approval for high-stakes decisions
- **Containment**: Limiting the agent's access to only what it needs
- **Transparency**: Making the agent's reasoning and actions auditable
- **Alignment**: Ensuring the agent's behavior matches its intended purpose

---

## 1.5 Who Should Read This Book

### Target Audience

This book is written for:

1. **Backend engineers** who are building systems that incorporate LLMs and need to do so reliably
2. **ML engineers** who understand models but want to learn the engineering practices around production agent systems
3. **Product engineers** who are building AI-powered features and need to understand the full stack
4. **Technical leaders** who are evaluating whether and how to adopt agent technology in their organizations

### Prerequisites

You should be comfortable with:

- Python (intermediate to advanced)
- REST APIs and HTTP
- Basic ML concepts (what a model does, not how to train one)
- Software testing practices
- Basic command line usage

You do NOT need to be an expert in:

- Deep learning or transformer architecture
- MLOps or model training
- Specific LLM provider APIs (we cover patterns, not provider-specific details)

### How to Get the Most from This Book

- **Read Part I (Chapters 1-3) first** to understand the foundational concepts
- **For practitioners**: Focus on Parts II and III (Context and Orchestration) and skip to Chapter 9 for evaluation
- **For architects**: Focus on Parts IV and V (Evaluation and Operations) for production concerns
- **Try the code examples**: Each chapter includes runnable code — building muscle memory matters
- **Apply to your own systems**: The concepts are illustrated with examples, but the real learning comes from applying them to your specific use cases

---

## 1.6 How This Book is Organized

The book is organized into six parts, each addressing a major dimension of agent engineering.

### Part I: Foundations (Chapters 1-3)

The foundational chapters establish the vocabulary, concepts, and mental models you'll need throughout the book:

- **Chapter 1** (this chapter): What agent engineering is and why it matters
- **Chapter 2**: Context engineering — designing what the model sees
- **Chapter 3**: Harness engineering — building reliable execution environments

### Part II: Orchestration (Chapters 4-6)

These chapters cover how to structure and coordinate multi-step agent workflows:

- **Chapter 4**: Routing and decision logic — directing work to the right components
- **Chapter 5**: State management — tracking progress through complex workflows
- **Chapter 6**: Multi-agent systems — coordinating multiple agents

### Part III: Memory (Chapters 7-8)

Memory is what separates agents from simple LLM calls:

- **Chapter 7**: Short-term and working memory — managing context within a session
- **Chapter 8**: Long-term memory — building persistent knowledge across sessions

### Part IV: Evaluation (Chapters 9-11)

Evaluation is the backbone of agent engineering:

- **Chapter 9**: Evaluation methodology — frameworks and practices
- **Chapter 10**: Benchmarking and testing — systematic quality measurement
- **Chapter 11**: Safety evaluation — measuring and ensuring alignment

### Part V: Operations (Chapters 12-14)

Production operations for agent systems:

- **Chapter 12**: Cost management and optimization
- **Chapter 13**: Monitoring and observability
- **Chapter 14**: Incident response and debugging

### Part VI: Advanced Topics (Chapters 15-17)

Looking at the frontier:

- **Chapter 15**: Multi-modal agents — working with images, audio, and more
- **Chapter 16**: Agent-to-agent communication and protocols
- **Chapter 17**: The future of agent engineering

### Suggested Reading Paths

```
┌─────────────────────────────────────────────────────────┐
│                    READING PATHS                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  FULL READING PATH (recommended for first-time readers) │
│  Ch 1 ─▶ Ch 2 ─▶ Ch 3 ─▶ Ch 4 ─▶ Ch 5 ─▶ Ch 6     │
│  ─▶ Ch 7 ─▶ Ch 8 ─▶ Ch 9 ─▶ Ch 10 ─▶ Ch 11         │
│  ─▶ Ch 12 ─▶ Ch 13 ─▶ Ch 14 ─▶ Ch 15 ─▶ Ch 16      │
│  ─▶ Ch 17                                              │
│                                                         │
│  PRACTITIONER PATH (for engineers building agents now)  │
│  Ch 1 ─▶ Ch 2 ─▶ Ch 3 ─▶ Ch 4 ─▶ Ch 9 ─▶ Ch 12    │
│  ─▶ Ch 13                                              │
│                                                         │
│  ARCHITECT PATH (for technical leaders and designers)   │
│  Ch 1 ─▶ Ch 2 ─▶ Ch 4 ─▶ Ch 5 ─▶ Ch 6 ─▶ Ch 9     │
│  ─▶ Ch 11 ─▶ Ch 14                                    │
│                                                         │
│  SPEED PATH (essential concepts only)                   │
│  Ch 1 ─▶ Ch 2 ─▶ Ch 3 ─▶ Ch 9 ─▶ Ch 12             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

Each path is designed to be self-contained. The full reading path provides the deepest understanding, but the practitioner and architect paths focus on the concepts most immediately relevant to your role.

---

## Summary

In this chapter, we established the foundation for everything that follows:

- **Agent Engineering** is the discipline of building reliable, observable, and controllable autonomous systems powered by LLMs — it goes far beyond prompt engineering
- **The evolution** from prompts to tools to agents to agent engineering reflects increasing system complexity and the need for engineering rigor
- **The lifecycle** — Design, Prototype, Evaluate, Iterate, Deploy, Monitor, Improve — provides a structured approach to building agent systems
- **Core competencies** span LLM fundamentals, system design, evaluation methodology, production operations, and safety
- **This book** is organized into six parts covering the full agent engineering stack, with multiple reading paths for different roles and needs

The key takeaway is this: **building reliable agent systems requires more than clever prompts. It requires systematic engineering practice.** The rest of this book will teach you that practice, one layer at a time.

We'll begin with the most fundamental layer: context engineering — the systematic design and management of everything an LLM sees during inference. Get this right, and everything else becomes easier. Get it wrong, and no amount of orchestration or evaluation will save you.

> **Looking ahead:** Chapter 2 will introduce context engineering — the discipline of designing and managing all information an LLM receives. You'll learn why context matters more than prompts, how to manage finite context windows, and how to build sophisticated retrieval systems that give models exactly the information they need.

*Next: [Chapter 2 — Context Engineering Fundamentals](chapter-02-context-engineering-fundamentals.md)*
