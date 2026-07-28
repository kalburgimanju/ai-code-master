# Chapter 5: Multi-Agent Orchestration Patterns

> "The whole is greater than the sum of its parts." — Aristotle

---

## 5.1 Why Multi-Agent Systems?

Single-agent architectures are seductively simple. You build one agent, give it a set of tools, and ship it. For a surprising range of problems—answering questions, summarizing documents, generating code—this is sufficient. But the real world does not always cooperate with simplicity.

### Limitations of Single-Agent Architectures

A single agent attempting to solve a complex, multi-domain problem faces several structural limitations:

- **Context window saturation.** A single agent handling research, analysis, code generation, and review must load all relevant context simultaneously. For complex tasks, this exhausts the context window before meaningful work begins.
- **Skill dilution.** One agent prompted to "do everything" is a generalist that does nothing particularly well. The prompt must balance competing instructions, and the model must switch reasoning modes constantly.
- **Error propagation.** A single-agent pipeline compounds errors linearly. A mistake in step 3 carries forward through steps 4, 5, and 6 with no independent checkpoint.
- **Serial bottleneck.** Research, generation, verification, and formatting must execute sequentially, even when subtasks are independent.

```
Single-Agent Workflow:
                                                          
  ┌──────────────────────────────────────────────┐       
  │                  AGENT                        │       
  │                                               │       
  │  ┌─────────┐  ┌─────────┐  ┌─────────┐      │       
  │  │ Research │→ │  Write  │→ │ Review  │      │       
  │  └─────────┘  └─────────┘  └─────────┘      │       
  │       ↑                          │            │       
  │       └──────────────────────────┘            │       
  │              (error loop)                     │       
  └──────────────────────────────────────────────┘       
```

### When Decomposition Helps

Multi-agent systems shine when the problem exhibits certain characteristics:

| Characteristic | Why It Benefits from Decomposition |
|---|---|
| **Complexity** | Large problems decompose into smaller, tractable subproblems |
| **Modularity** | Independent components can be developed, tested, and replaced independently |
| **Parallelism** | Independent subtasks execute concurrently, reducing wall-clock time |
| **Specialization** | Domain-specific agents outperform generalists on their domains |
| **Redundancy** | Multiple agents can cross-check each other, reducing hallucination |

### The Cost of Multi-Agent Systems

Decomposition is not free. Introducing multiple agents adds:

- **Coordination overhead.** Someone must decide who does what, when, and how results combine.
- **Latency.** Communication between agents adds round-trips. Async patterns help but introduce complexity.
- **Debugging difficulty.** When three agents produce a wrong answer, tracing the fault across agent boundaries is substantially harder than debugging a single prompt.
- **Token cost.** Each agent maintains its own context, system prompt, and history. The aggregate token usage often exceeds a single-agent approach by 3-10x.

### Decision Framework: Single vs Multi-Agent

```
                    ┌─────────────────────┐
                    │  Is the task         │
                    │  complex enough to   │
                    │  warrant splitting?  │
                    └────────┬────────────┘
                             │
                     ┌───────┴───────┐
                     │               │
                    Yes              No
                     │               │
              ┌──────▼──────┐   ┌───▼────────┐
              │ Can subtasks │   │ Use single  │
              │ run in       │   │ agent       │
              │ parallel?    │   └────────────┘
              └──────┬──────┘
                     │
              ┌──────┴──────┐
              │             │
             Yes            No
              │             │
     ┌────────▼──────┐  ┌──▼──────────────┐
     │ Fan-out /     │  │ Sequential      │
     │ Fan-in        │  │ pipeline or     │
     │ pattern       │  │ supervisor      │
     └───────────────┘  └─────────────────┘
```

**Rule of thumb:** If you can solve the problem reliably with a single agent in a single prompt, do so. Multi-agent systems are a scaling strategy, not an architecture default.

---

## 5.2 The Supervisor Pattern

The supervisor pattern is the most intuitive multi-agent architecture. A coordinator agent receives the user's request, decomposes it into subtasks, delegates each subtask to a specialist agent, and synthesizes the results.

### Architecture

```
                        ┌──────────────┐
                        │    USER      │
                        └──────┬───────┘
                               │
                        ┌──────▼───────┐
                        │  SUPERVISOR  │
                        │   AGENT      │
                        └──┬───┬───┬───┘
                           │   │   │
              ┌────────────┘   │   └────────────┐
              │                │                │
       ┌──────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
       │  RESEARCH   │ │    CODE     │ │   REVIEW    │
       │   AGENT     │ │   AGENT     │ │   AGENT     │
       └─────────────┘ └─────────────┘ └─────────────┘
```

### Hierarchical vs Flat Supervision

**Flat supervision** places all workers at the same level, directly under the supervisor. This works well when subtasks are independent and the supervisor can clearly delineate responsibilities.

**Hierarchical supervision** nests supervisors within supervisors. A top-level supervisor delegates to mid-level supervisors, each of which manages a team of workers. This scales better for large task decompositions but adds coordination layers.

| Approach | Pros | Cons | Best For |
|---|---|---|---|
| Flat | Low latency, simple debugging, fewer agents | Supervisor context overload with many workers | 2-5 specialist agents |
| Hierarchical | Scalable, natural domain grouping | Deep delegation chains, harder to trace | 5+ agents, multi-domain tasks |

### Communication Protocols

The supervisor communicates with workers through structured messages:

```python
from dataclasses import dataclass, field
from enum import Enum
from typing import Any


class TaskStatus(Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"


@dataclass
class AgentMessage:
    """Standard message envelope for agent-to-agent communication."""
    sender: str
    receiver: str
    task_id: str
    payload: dict[str, Any]
    status: TaskStatus = TaskStatus.PENDING
    metadata: dict[str, Any] = field(default_factory=dict)

    def to_prompt(self) -> str:
        """Serialize message into a prompt-friendly format."""
        return (
            f"FROM: {self.sender}\n"
            f"TASK_ID: {self.task_id}\n"
            f"STATUS: {self.status.value}\n"
            f"REQUEST:\n{self.payload.get('request', '')}\n"
            f"CONTEXT:\n{self.payload.get('context', '')}"
        )


@dataclass
class TaskResult:
    """Structured result from a worker agent."""
    task_id: str
    agent_name: str
    output: str
    confidence: float
    metadata: dict[str, Any] = field(default_factory=dict)
```

### Code Example: Supervisor Agent

```python
import asyncio
from dataclasses import dataclass, field
from typing import Any, Callable, Awaitable


@dataclass
class SpecialistAgent:
    """A worker agent with a specific domain expertise."""
    name: str
    system_prompt: str
    execute_fn: Callable[[str], Awaitable[str]]
    specialties: list[str] = field(default_factory=list)


class SupervisorAgent:
    """
    Coordinator that decomposes tasks, delegates to specialists,
    and synthesizes results.
    """

    def __init__(self, specialists: list[SpecialistAgent]):
        self.specialists = {s.name: s for s in specialists}
        self.delegation_log: list[dict[str, Any]] = []

    async def handle_request(self, user_request: str) -> str:
        """Main entry point: decompose, delegate, synthesize."""
        # Step 1: Decompose the request into subtasks
        subtasks = await self._decompose(user_request)

        # Step 2: Assign each subtask to the best specialist
        assignments = self._assign(subtasks)

        # Step 3: Execute assignments (parallel where possible)
        results = await self._execute(assignments)

        # Step 4: Synthesize results into a coherent response
        return await self._synthesize(user_request, results)

    async def _decompose(self, request: str) -> list[dict[str, str]]:
        """Break the user request into discrete subtasks."""
        # In production, this calls an LLM to analyze the request
        # and produce a structured task list.
        decomposition_prompt = f"""
        Analyze this request and break it into subtasks:
        "{request}"

        Available specialists: {list(self.specialists.keys())}

        Return a JSON list of subtasks, each with:
        - description: what needs to be done
        - assigned_to: which specialist should handle it
        - dependencies: list of subtask indices that must complete first
        """
        # Simulated decomposition for illustration
        return [
            {"description": "Research the topic", "assigned_to": "researcher",
             "dependencies": []},
            {"description": "Write the code", "assigned_to": "coder",
             "dependencies": [0]},
            {"description": "Review the code", "assigned_to": "reviewer",
             "dependencies": [1]},
        ]

    def _assign(
        self, subtasks: list[dict[str, str]]
    ) -> list[dict[str, Any]]:
        """Map subtasks to specialist agents."""
        assignments = []
        for i, task in enumerate(subtasks):
            agent_name = task["assigned_to"]
            agent = self.specialists.get(agent_name)
            if agent is None:
                raise ValueError(
                    f"No specialist named '{agent_name}'. "
                    f"Available: {list(self.specialists.keys())}"
                )
            assignments.append({
                "index": i,
                "task": task,
                "agent": agent,
            })
        return assignments

    async def _execute(
        self, assignments: list[dict[str, Any]]
    ) -> list[dict[str, Any]]:
        """Execute assignments, respecting dependencies."""
        completed: dict[int, str] = {}
        results = [None] * len(assignments)

        remaining = list(assignments)
        while remaining:
            # Find tasks whose dependencies are satisfied
            ready = []
            for a in remaining:
                deps = a["task"].get("dependencies", [])
                if all(d in completed for d in deps):
                    ready.append(a)

            if not ready:
                raise RuntimeError("Circular dependency detected")

            # Execute ready tasks in parallel
            async def _run(assignment):
                idx = assignment["index"]
                context_parts = []
                for dep_idx in assignment["task"].get("dependencies", []):
                    context_parts.append(
                        f"Result from subtask {dep_idx}:\n"
                        f"{completed[dep_idx]}"
                    )
                context = "\n\n".join(context_parts)
                prompt = assignment["task"]["description"]
                if context:
                    prompt = f"{prompt}\n\nContext from prior steps:\n{context}"

                result = await assignment["agent"].execute_fn(prompt)
                return idx, result

            batch_results = await asyncio.gather(
                *[_run(a) for a in ready]
            )
            for idx, result in batch_results:
                completed[idx] = result
                results[idx] = result

            remaining = [a for a in remaining if a["index"] not in completed]

        return results

    async def _synthesize(
        self, original_request: str, results: list[str]
    ) -> str:
        """Combine specialist outputs into a coherent final response."""
        synthesis = f"Response to: {original_request}\n\n"
        for i, result in enumerate(results):
            synthesis += f"--- Step {i + 1} ---\n{result}\n\n"
        return synthesis
```

---

## 5.3 The Evaluator-Optimizer Pattern

This pattern creates a quality loop: a generator produces output, an evaluator judges it, and an optimizer refines it. The loop continues until quality meets a threshold or a budget is exhausted.

```
┌──────────┐     ┌───────────┐     ┌──────────┐
│GENERATOR │────▶│ EVALUATOR │────▶│ OPTIMIZER │
│          │     │           │     │          │
└──────────┘     └─────┬─────┘     └──────────┘
     ▲                 │                │
     │           ┌─────▼─────┐         │
     │           │  Quality  │         │
     │           │  Met?     │         │
     │           └─────┬─────┘         │
     │            Yes  │  No           │
     │                 │               │
     │           ┌─────▼─────┐         │
     │           │  OUTPUT   │         │
     │           └───────────┘         │
     │                                 │
     └─────────────────────────────────┘
```

### Quality Thresholds and Convergence

The critical engineering decision is defining when to stop iterating:

- **Score threshold:** Stop when the evaluator's score exceeds a predefined threshold (e.g., 8/10).
- **Marginal improvement:** Stop when consecutive iterations improve by less than a delta (e.g., < 0.1 improvement).
- **Budget exhaustion:** Hard stop after N iterations regardless of quality.
- **Consensus:** Run multiple evaluators and stop when a majority agrees quality is sufficient.

### Code Example: Evaluator-Optimizer Loop

```python
import asyncio
from dataclasses import dataclass, field


@dataclass
class EvalResult:
    score: float  # 0.0 to 1.0
    feedback: str
    suggestions: list[str] = field(default_factory=list)


class EvaluatorOptimizer:
    """
    Iterative refinement loop: generate, evaluate, optimize, repeat.
    """

    def __init__(
        self,
        generator_fn,
        evaluator_fn,
        optimizer_fn,
        max_iterations: int = 5,
        quality_threshold: float = 0.85,
        min_improvement: float = 0.05,
    ):
        self.generator_fn = generator_fn
        self.evaluator_fn = evaluator_fn
        self.optimizer_fn = optimizer_fn
        self.max_iterations = max_iterations
        self.quality_threshold = quality_threshold
        self.min_improvement = min_improvement
        self.history: list[dict] = []

    async def run(self, task: str) -> tuple[str, list[dict]]:
        """Execute the generate-evaluate-optimize loop."""
        # Initial generation
        current_output = await self.generator_fn(task)
        best_output = current_output
        best_score = 0.0

        for iteration in range(self.max_iterations):
            # Evaluate the current output
            eval_result = await self.evaluator_fn(task, current_output)

            self.history.append({
                "iteration": iteration + 1,
                "score": eval_result.score,
                "feedback": eval_result.feedback,
                "output_preview": current_output[:200],
            })

            # Check if quality threshold is met
            if eval_result.score >= self.quality_threshold:
                return current_output, self.history

            # Check for marginal improvement
            improvement = eval_result.score - best_score
            if iteration > 0 and improvement < self.min_improvement:
                # No meaningful improvement; return best so far
                return best_output, self.history

            # Track best output
            if eval_result.score > best_score:
                best_score = eval_result.score
                best_output = current_output

            # Optimize based on feedback
            current_output = await self.optimizer_fn(
                task=task,
                current_output=current_output,
                feedback=eval_result.feedback,
                suggestions=eval_result.suggestions,
                score=eval_result.score,
            )

        # Budget exhausted; return best output found
        return best_output, self.history


# Usage example
async def generate_text(task: str) -> str:
    """LLM call to generate initial text."""
    # In production: call LLM with task prompt
    return f"Generated response for: {task}"


async def evaluate_text(task: str, output: str) -> EvalResult:
    """LLM-as-judge evaluates the output quality."""
    # In production: call LLM with evaluation rubric
    return EvalResult(
        score=0.75,
        feedback="Good structure but lacks specific examples.",
        suggestions=["Add concrete code examples", "Include a comparison table"],
    )


async def optimize_text(
    task: str,
    current_output: str,
    feedback: str,
    suggestions: list[str],
    score: float,
) -> str:
    """LLM call to refine the output based on feedback."""
    optimization_prompt = f"""
    Original task: {task}
    Current output: {current_output}
    Feedback: {feedback}
    Suggestions: {suggestions}
    Current score: {score}

    Improve the output addressing the feedback above.
    """
    # In production: call LLM with optimization prompt
    return f"Optimized: {current_output}"


async def main():
    loop = EvaluatorOptimizer(
        generator_fn=generate_text,
        evaluator_fn=evaluate_text,
        optimizer_fn=optimize_text,
        max_iterations=3,
        quality_threshold=0.9,
    )
    result, history = await loop.run("Write a guide to multi-agent systems")
    print(f"Final score: {history[-1]['score']}")
    for entry in history:
        print(f"  Iteration {entry['iteration']}: score={entry['score']}")


asyncio.run(main())
```

---

## 5.4 Parallel Fan-Out / Fan-In

Fan-out/fan-in is the workhorse pattern for independent subtasks. The supervisor fans out identical or similar tasks to multiple agents, collects results, and merges them.

```
                        ┌──────────────┐
                        │  SUPERVISOR  │
                        └──┬───┬───┬───┘
                           │   │   │
              ┌────────────┘   │   └────────────┐
              │                │                │
       ┌──────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
       │  AGENT A    │ │  AGENT B    │ │  AGENT C    │
       │ (parallel)  │ │ (parallel)  │ │ (parallel)  │
       └──────┬──────┘ └──────┬──────┘ └──────┬──────┘
              │                │                │
              └────────────┬───┘────────────────┘
                           │
                    ┌──────▼──────┐
                    │  AGGREGATOR │
                    └─────────────┘
```

### Handling Partial Failures

In parallel execution, some agents may fail while others succeed. A robust fan-in strategy handles this gracefully:

```python
import asyncio
from dataclasses import dataclass
from enum import Enum


class AgentStatus(Enum):
    SUCCESS = "success"
    FAILED = "failed"
    TIMEOUT = "timeout"


@dataclass
class AgentResult:
    agent_name: str
    status: AgentStatus
    output: str | None = None
    error: str | None = None
    duration_ms: float = 0.0


class ParallelFanOut:
    """
    Execute independent subtasks in parallel with partial failure handling.
    """

    def __init__(
        self,
        timeout_seconds: float = 30.0,
        min_success_rate: float = 0.5,
    ):
        self.timeout_seconds = timeout_seconds
        self.min_success_rate = min_success_rate

    async def execute(
        self,
        agents: dict[str, callable],
        task: str,
        aggregator_fn: callable | None = None,
    ) -> str:
        """Fan out to agents, fan in with aggregation."""
        tasks = []
        for name, agent_fn in agents.items.items():
            tasks.append(self._run_agent(name, agent_fn, task))

        results: list[AgentResult] = await asyncio.gather(
            *tasks, return_exceptions=False
        )

        # Analyze results
        successful = [r for r in results if r.status == AgentStatus.SUCCESS]
        failed = [r for r in results if r.status != AgentStatus.SUCCESS]

        success_rate = len(successful) / len(results) if results else 0.0
        if success_rate < self.min_success_rate:
            raise RuntimeError(
                f"Too many failures: {len(failed)}/{len(results)} agents failed"
            )

        # Aggregate successful results
        outputs = [r.output for r in successful if r.output]

        if aggregator_fn:
            return await aggregator_fn(outputs)

        # Default aggregation: concatenate with headers
        parts = []
        for r in successful:
            parts.append(f"### {r.agent_name}\n\n{r.output}")
        return "\n\n---\n\n".join(parts)

    async def _run_agent(
        self, name: str, fn: callable, task: str
    ) -> AgentResult:
        """Run a single agent with timeout and error handling."""
        import time
        start = time.monotonic()
        try:
            output = await asyncio.wait_for(
                fn(task), timeout=self.timeout_seconds
            )
            elapsed = (time.monotonic() - start) * 1000
            return AgentResult(
                agent_name=name,
                status=AgentStatus.SUCCESS,
                output=output,
                duration_ms=elapsed,
            )
        except asyncio.TimeoutError:
            elapsed = (time.monotonic() - start) * 1000
            return AgentResult(
                agent_name=name,
                status=AgentStatus.TIMEOUT,
                error=f"Timed out after {self.timeout_seconds}s",
                duration_ms=elapsed,
            )
        except Exception as e:
            elapsed = (time.monotonic() - start) * 1000
            return AgentResult(
                agent_name=name,
                status=AgentStatus.FAILED,
                error=str(e),
                duration_ms=elapsed,
            )


async def research_topic(topic: str) -> str:
    """Simulated research agent."""
    await asyncio.sleep(0.1)  # Simulate API call
    return f"Research findings on {topic}"


async def find_statistics(topic: str) -> str:
    """Simulated statistics agent."""
    await asyncio.sleep(0.1)
    return f"Statistics about {topic}"


async def find_expert_opinions(topic: str) -> str:
    """Simulated expert opinions agent."""
    await asyncio.sleep(0.1)
    return f"Expert opinions on {topic}"


async def main():
    fan_out = ParallelFanOut(timeout_seconds=10.0, min_success_rate=0.5)
    result = await fan_out.execute(
        agents={
            "researcher": research_topic,
            "statistician": find_statistics,
            "expert_network": find_expert_opinions,
        },
        task="Impact of AI on software engineering",
    )
    print(result)
```

---

## 5.5 The Debate / Adversarial Pattern

The debate pattern pits two or more agents against each other, each arguing a different position. A judge agent evaluates the arguments and synthesizes the best answer. This reduces bias and surfaces considerations that a single agent might miss.

```
  ┌──────────┐                    ┌──────────┐
  │ AGENT A  │─── argument ───┐   │ AGENT B  │
  │ (Pro)    │                │   │ (Con)    │
  └──────────┘                │   └──────────┘
                              │        │
                        ┌─────▼────────▼─────┐
                        │   JUDGE AGENT      │
                        │   (synthesizes)    │
                        └─────────┬──────────┘
                                  │
                        ┌─────────▼──────────┐
                        │   FINAL ANSWER     │
                        └────────────────────┘
```

### Why Adversarial Patterns Work

- **Reduces hallucination:** Agents must defend claims against pushback.
- **Exposes blind spots:** Each agent considers angles the other misses.
- **Improves calibration:** The judge learns to weigh evidence, not just assertions.
- **Encourages nuance:** Rather than a single confident (possibly wrong) answer, debate produces a balanced assessment.

### Code Example: Debate Agent

```python
import asyncio
from dataclasses import dataclass


@dataclass
class DebateRound:
    position: str
    argument: str
    rebuttal: str | None = None


class DebateAgent:
    """
    Orchestrates a structured debate between two agents,
    then has a judge synthesize the final answer.
    """

    def __init__(
        self,
        agent_a_fn,
        agent_b_fn,
        judge_fn,
        max_rounds: int = 2,
    ):
        self.agent_a_fn = agent_a_fn
        self.agent_b_fn = agent_b_fn
        self.judge_fn = judge_fn
        self.max_rounds = max_rounds

    async def debate(self, question: str) -> dict:
        """Run a multi-round debate and produce a verdict."""
        round_history: list[DebateRound] = []
        argument_a = None
        argument_b = None

        for round_num in range(self.max_rounds):
            # Agent A argues
            if argument_b and round_num > 0:
                prompt_a = (
                    f"Question: {question}\n"
                    f"Opponent's last argument:\n{argument_b}\n\n"
                    f"Rebut their argument and strengthen your position."
                )
            else:
                prompt_a = (
                    f"Question: {question}\n"
                    f"You are arguing FOR this position. "
                    f"Present your strongest argument with evidence."
                )
            argument_a = await self.agent_a_fn(prompt_a)

            # Agent B argues
            prompt_b = (
                f"Question: {question}\n"
                f"Opponent's argument:\n{argument_a}\n\n"
                f"Rebut their argument and present the opposing position."
            )
            argument_b = await self.agent_b_fn(prompt_b)

            round_history.append(DebateRound(
                position=f"Round {round_num + 1}",
                argument=f"A: {argument_a}",
                rebuttal=f"B: {argument_b}",
            ))

        # Judge synthesizes
        judge_prompt = (
            f"Question: {question}\n\n"
            f"DEBATE TRANSCRIPT:\n"
        )
        for i, r in enumerate(round_history):
            judge_prompt += f"\n--- Round {i + 1} ---\n"
            judge_prompt += f"Argument A: {r.argument}\n"
            judge_prompt += f"Rebuttal B: {r.rebuttal}\n"

        judge_prompt += (
            "\n\nBased on the debate, provide:\n"
            "1. A balanced summary of both positions\n"
            "2. Which argument was stronger and why\n"
            "3. Your final, nuanced verdict\n"
        )

        verdict = await self.judge_fn(judge_prompt)

        return {
            "question": question,
            "rounds": len(round_history),
            "argument_a_final": argument_a,
            "argument_b_final": argument_b,
            "verdict": verdict,
        }


# Simulated agent functions
async def argue_for(prompt: str) -> str:
    return f"For argument responding to: {prompt[:100]}"

async def argue_against(prompt: str) -> str:
    return f"Against argument responding to: {prompt[:100]}"

async def judge_debate(prompt: str) -> str:
    return f"Judgment based on: {prompt[:100]}"


async def main():
    debate = DebateAgent(
        agent_a_fn=argue_for,
        agent_b_fn=argue_against,
        judge_fn=judge_debate,
        max_rounds=2,
    )
    result = await debate.debate(
        "Should AI agents have access to production databases?"
    )
    print(f"Debate concluded after {result['rounds']} rounds")
    print(f"Verdict: {result['verdict']}")
```

---

## 5.6 The Pipeline / Chain Pattern

The pipeline pattern arranges agents in a sequential chain where each agent transforms the input and passes it to the next. This is the simplest multi-agent pattern and maps naturally to workflows with clear stages.

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ RESEARCH │───▶│ OUTLINE  │───▶│  DRAFT   │───▶│  EDIT    │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
                                                         │
                                                    ┌────▼────┐
                                                    │ PUBLISH │
                                                    └─────────┘
```

### Dataflow vs Control-Flow Pipelines

**Dataflow pipelines** pass data forward; each stage transforms data and the next stage consumes it. Control is implicit in the data flow.

**Control-flow pipelines** include explicit routing logic. A pipeline stage can decide which downstream agent to invoke, or whether to loop back to an earlier stage.

### Code Example: Content Creation Pipeline

```python
from dataclasses import dataclass, field
from typing import Callable, Awaitable
import asyncio


@dataclass
class PipelineStage:
    name: str
    agent_fn: Callable[[str], Awaitable[str]]
    transform: Callable[[str], str] | None = None


class ContentPipeline:
    """
    Sequential pipeline for content creation.
    Each stage receives the cumulative output of prior stages.
    """

    def __init__(self, stages: list[PipelineStage]):
        self.stages = stages
        self.stage_outputs: dict[str, str] = {}

    async def execute(self, initial_prompt: str) -> dict[str, str]:
        """Run all stages sequentially, collecting outputs."""
        cumulative_context = initial_prompt

        for stage in self.stages:
            # Prepare input for this stage
            if stage.transform:
                stage_input = stage.transform(cumulative_context)
            else:
                stage_input = cumulative_context

            # Execute the stage
            output = await stage.agent_fn(stage_input)
            self.stage_outputs[stage.name] = output

            # Pass output forward as context
            cumulative_context = (
                f"{cumulative_context}\n\n"
                f"--- Output from {stage.name} ---\n"
                f"{output}"
            )

        return self.stage_outputs


# Define pipeline stages
async def research_agent(prompt: str) -> str:
    """Research the topic and gather information."""
    return f"Research findings: comprehensive data on the topic from {prompt}"

async def outline_agent(prompt: str) -> str:
    """Create an outline based on research."""
    return "1. Introduction\n2. Background\n3. Analysis\n4. Conclusion"

async def draft_agent(prompt: str) -> str:
    """Write a full draft based on the outline."""
    return "Full draft document with all sections fleshed out..."

async def edit_agent(prompt: str) -> str:
    """Edit for clarity, grammar, and style."""
    return "Polished, publication-ready version of the document"

async def main():
    pipeline = ContentPipeline([
        PipelineStage(name="research", agent_fn=research_agent),
        PipelineStage(name="outline", agent_fn=outline_agent),
        PipelineStage(name="draft", agent_fn=draft_agent),
        PipelineStage(name="edit", agent_fn=edit_agent),
    ])

    outputs = await pipeline.execute("Write about multi-agent orchestration")
    for stage, output in outputs.items():
        print(f"[{stage}] {output[:80]}...")
```

---

## 5.7 The Blackboard Pattern

The blackboard pattern is inspired by the classic AI architecture of the same name. All agents share a common data structure (the blackboard) that they can read and write. Agents independently monitor the blackboard and act when they detect relevant changes.

```
  ┌─────────┐  ┌─────────┐  ┌─────────┐
  │ AGENT 1 │  │ AGENT 2 │  │ AGENT 3 │
  └────┬────┘  └────┬────┘  └────┬────┘
       │             │             │
       ▼             ▼             ▼
  ┌─────────────────────────────────────┐
  │           BLACKBOARD               │
  │  ┌─────────────────────────────┐   │
  │  │ shared_state: {            │   │
  │  │   "topic": "...",          │   │
  │  │   "research": "...",       │   │
  │  │   "analysis": "...",       │   │
  │  │   "draft": "...",          │   │
  │  │   "status": "in_progress"  │   │
  │  │ }                          │   │
  │  └─────────────────────────────┘   │
  └─────────────────────────────────────┘
```

### Emergent Behavior

When agents operate independently on shared state, the system exhibits emergent behavior. Each agent follows simple rules—read the blackboard, check if its preconditions are met, write results—but the collective behavior produces complex, adaptive workflows.

### Code Example: Collaborative Problem-Solving with Blackboard

```python
import asyncio
from dataclasses import dataclass, field
from typing import Callable, Awaitable


class Blackboard:
    """Shared state accessible by all agents."""

    def __init__(self):
        self._state: dict[str, any] = {}
        self._observers: list[Callable] = []
        self._lock = asyncio.Lock()

    async def write(self, key: str, value: any) -> None:
        """Write a value and notify observers."""
        async with self._lock:
            self._state[key] = value
        await self._notify_observers(key, value)

    async def read(self, key: str) -> any:
        """Read a value from the blackboard."""
        return self._state.get(key)

    def read_sync(self, key: str) -> any:
        """Synchronous read for agent preconditions."""
        return self._state.get(key)

    def snapshot(self) -> dict:
        """Get a full snapshot of the blackboard state."""
        return dict(self._state)

    async def _notify_observers(self, key: str, value: any) -> None:
        """Notify all registered observers of a state change."""
        for observer in self._observers:
            if asyncio.iscoroutinefunction(observer):
                await observer(key, value)
            else:
                observer(key, value)

    def register_observer(self, fn: Callable) -> None:
        """Register a function to be called on state changes."""
        self._observers.append(fn)


@dataclass
class BlackboardAgent:
    """Agent that operates on shared blackboard state."""
    name: str
    preconditions: dict[str, any]  # Keys and values that must exist
    action_fn: Callable[[dict], Awaitable[dict]]  # Produces new state entries
    blackboard: Blackboard

    def can_act(self) -> bool:
        """Check if all preconditions are satisfied."""
        for key, expected in self.preconditions.items():
            if self.blackboard.read_sync(key) is None:
                return False
            if expected is not None and self.blackboard.read_sync(key) != expected:
                return False
        return True

    async def execute(self) -> bool:
        """Execute the agent's action if preconditions are met."""
        if not self.can_act():
            return False

        snapshot = self.blackboard.snapshot()
        updates = await self.action_fn(snapshot)

        for key, value in updates.items():
            await self.blackboard.write(key, value)

        return True


class BlackboardOrchestrator:
    """
    Runs agents in a loop until no agent can act
    or a terminal state is reached.
    """

    def __init__(
        self,
        agents: list[BlackboardAgent],
        max_rounds: int = 20,
        terminal_key: str = "status",
        terminal_value: str = "complete",
    ):
        self.agents = agents
        self.max_rounds = max_rounds
        self.terminal_key = terminal_key
        self.terminal_value = terminal_value

    async def run(self) -> dict:
        """Run the blackboard system until completion."""
        for round_num in range(self.max_rounds):
            # Check terminal condition
            if self.agents and self.agents[0].blackboard.read_sync(
                self.terminal_key
            ) == self.terminal_value:
                break

            acted = False
            for agent in self.agents:
                if agent.can_act():
                    result = await agent.execute()
                    if result:
                        acted = True

            if not acted:
                break  # No agent can act; deadlock or completion

        return self.agents[0].blackboard.snapshot()


# Example agents
async def researcher_action(state: dict) -> dict:
    topic = state.get("topic", "unknown")
    return {"research": f"Detailed research on {topic}"}

async def analyst_action(state: dict) -> dict:
    research = state.get("research", "")
    return {"analysis": f"Analysis based on: {research[:50]}"}

async def writer_action(state: dict) -> dict:
    analysis = state.get("analysis", "")
    return {"draft": f"Written draft based on: {analysis[:50]}"}

async def reviewer_action(state: dict) -> dict:
    draft = state.get("draft", "")
    return {"review": f"Review complete for: {draft[:50]}", "status": "complete"}


async def main():
    bb = Blackboard()

    agents = [
        BlackboardAgent(
            name="researcher",
            preconditions={"topic": None, "research": None},
            action_fn=researcher_action,
            blackboard=bb,
        ),
        BlackboardAgent(
            name="analyst",
            preconditions={"research": None, "analysis": None},
            action_fn=analyst_action,
            blackboard=bb,
        ),
        BlackboardAgent(
            name="writer",
            preconditions={"analysis": None, "draft": None},
            action_fn=writer_action,
            blackboard=bb,
        ),
        BlackboardAgent(
            name="reviewer",
            preconditions={"draft": None, "review": None},
            action_fn=reviewer_action,
            blackboard=bb,
        ),
    ]

    await bb.write("topic", "multi-agent orchestration")
    orchestrator = BlackboardOrchestrator(agents)
    final_state = await orchestrator.run()

    print("Final blackboard state:")
    for key, value in final_state.items():
        print(f"  {key}: {str(value)[:60]}")
```

---

## 5.8 Hybrid Orchestration

Real-world systems rarely fit a single pattern. A production agent system might use a supervisor to coordinate a pipeline that fans out to parallel workers, with an evaluator-optimizer loop at the end.

### ASCII Diagram: Hybrid Topology

```
                         ┌─────────────┐
                         │    USER     │
                         └──────┬──────┘
                                │
                         ┌──────▼──────┐
                         │  SUPERVISOR │
                         └──┬──────┬───┘
                            │      │
              ┌─────────────┘      └─────────────┐
              │                                  │
       ┌──────▼──────┐                   ┌───────▼───────┐
       │  PIPELINE 1 │                   │  FAN-OUT     │
       │  (Research) │                   │  (Parallel)  │
       └──────┬──────┘                   └──┬───┬───┬───┘
              │                             │   │   │
              │                        ┌────┘   │   └────┐
              │                        │        │        │
              │                   ┌────▼───┐ ┌──▼──┐ ┌───▼────┐
              │                   │Coder A │ │Code │ │Coder C │
              │                   └────┬───┘ │ B   │ └───┬────┘
              │                        │     └──┬──┘     │
              │                        └────────┼────────┘
              │                                 │
              │                          ┌──────▼──────┐
              │                          │  AGGREGATOR │
              │                          └──────┬──────┘
              │                                 │
              └──────────────┬──────────────────┘
                             │
                      ┌──────▼──────┐
                      │  EVALUATOR  │
                      └──────┬──────┘
                             │
                      ┌──────▼──────┐
                      │  OPTIMIZER  │
                      └──────┬──────┘
                             │
                      ┌──────▼──────┐
                      │   OUTPUT    │
                      └─────────────┘
```

### Dynamic Topology

Advanced orchestration systems adjust their topology at runtime based on task requirements:

- **Simple tasks** route to a single agent, bypassing the multi-agent overhead.
- **Complex tasks** activate the full hybrid pipeline.
- **Time-critical tasks** skip optional refinement stages.
- **High-stakes tasks** add additional verification agents.

```python
class DynamicOrchestrator:
    """Selects orchestration topology based on task analysis."""

    def __init__(self):
        self.topologies = {
            "simple": self._single_agent,
            "moderate": self._pipeline,
            "complex": self._hybrid,
        }

    async def route(self, task: str) -> str:
        complexity = await self._assess_complexity(task)
        topology_fn = self.topologies.get(complexity, self._hybrid)
        return await topology_fn(task)

    async def _assess_complexity(self, task: str) -> str:
        # LLM-based complexity assessment
        return "complex"  # placeholder

    async def _single_agent(self, task: str) -> str:
        return f"Single agent result for: {task}"

    async def _pipeline(self, task: str) -> str:
        return f"Pipeline result for: {task}"

    async def _hybrid(self, task: str) -> str:
        return f"Hybrid result for: {task}"
```

---

## 5.9 Communication Patterns

How agents communicate is as important as what they compute. The choice of communication pattern affects latency, coupling, error handling, and debuggability.

### Direct Messaging vs Pub/Sub vs Shared State

| Pattern | Description | Latency | Coupling | Best For |
|---|---|---|---|---|
| **Direct messaging** | Agent A sends a message directly to Agent B | Low | High (A knows B) | Simple pipelines, supervisor-worker |
| **Pub/sub** | Agents publish events; subscribers receive relevant messages | Medium | Low (decoupled) | Event-driven systems, loose coordination |
| **Shared state** | All agents read/write a common data store | Variable | Low | Blackboard pattern, collaborative tasks |
| **Request/reply** | Agent A requests info from B; B responds synchronously | High (blocking) | Medium | When A needs B's output to continue |

### Synchronous vs Asynchronous Communication

```python
import asyncio


# Synchronous communication example
async def sync_communication():
    """Blocking: caller waits for response."""
    result = await agent_a.query(agent_b, "What is X?")
    # agent_a is blocked until agent_b responds
    return result


# Asynchronous communication example
async def async_communication():
    """Non-blocking: caller continues after sending."""
    future = agent_a.send_async(agent_b, "What is X?")
    # agent_a continues doing other work
    other_result = await agent_a.do_other_work()
    # Now collect the response when needed
    response = await future
    return other_result, response


# Event-driven communication example
class EventBus:
    def __init__(self):
        self.subscribers: dict[str, list] = {}

    def subscribe(self, event_type: str, handler):
        self.subscribers.setdefault(event_type, []).append(handler)

    async def publish(self, event_type: str, data: dict):
        handlers = self.subscribers.get(event_type, [])
        await asyncio.gather(
            *[handler(data) for handler in handlers]
        )
```

### Message Schemas and Protocols

Standardizing message formats across agents is critical for maintainability:

```python
from pydantic import BaseModel
from typing import Any


class AgentRequest(BaseModel):
    request_id: str
    sender: str
    receiver: str
    action: str  # e.g., "analyze", "generate", "review"
    payload: dict[str, Any]
    requires_response: bool = True
    timeout_seconds: float = 30.0


class AgentResponse(BaseModel):
    request_id: str
    sender: str
    status: str  # "success", "error", "partial"
    result: dict[str, Any]
    error: str | None = None
    metadata: dict[str, Any] = {}


class AgentEvent(BaseModel):
    event_id: str
    event_type: str  # "task_started", "task_completed", "error"
    source: str
    data: dict[str, Any]
    timestamp: float
```

---

## 5.10 Framework Comparison

Several frameworks have emerged for building multi-agent systems. Each makes different trade-offs between simplicity, flexibility, and opinionation.

### Feature Comparison

| Feature | LangGraph | CrewAI | AutoGen | Swarm | Custom |
|---|---|---|---|---|---|
| **Paradigm** | Graph-based state machines | Role-based teams | Conversation-driven | Lightweight handoffs | Whatever you build |
| **Topology** | Arbitrary (cycles, branches) | Sequential or parallel | Group chat | Flat routing | Arbitrary |
| **State management** | Built-in checkpointing | Implicit | Conversation history | Minimal | Manual |
| **Tool integration** | First-class | First-class | First-class | Basic | Manual |
| **Learning curve** | Medium-High | Low | Medium | Low | Varies |
| **Production readiness** | High | Medium | Medium | Low | Depends on you |
| **Customization** | High | Medium | High | Medium | Unlimited |
| **Streaming** | Yes | Limited | Yes | No | Manual |
| **Error handling** | Built-in retries | Basic | Basic | Minimal | Manual |
| **Best for** | Complex workflows | Quick prototypes | Research/multi-agent chat | Simple routing | Full control |

### When to Build Custom vs Use a Framework

**Use a framework when:**
- You need rapid prototyping
- Your topology is well-supported by the framework
- Community support and documentation save development time
- You want battle-tested error handling and state management

**Build custom when:**
- Your orchestration logic is unique or highly domain-specific
- Framework overhead exceeds your needs
- You need maximum control over performance and resource usage
- You've outgrown a framework's abstractions

**Rule of thumb:** Start with a framework. If you find yourself fighting the abstractions more than using them, that's the signal to build custom. The code examples in this chapter give you the building blocks for a custom approach.

---

## Summary

Multi-agent orchestration transforms agents from isolated workers into collaborative systems. The key patterns—supervisor, evaluator-optimizer, fan-out/fan-in, debate, pipeline, and blackboard—each address different coordination challenges. The critical insight is that there is no universal best pattern; production systems typically combine multiple patterns into hybrid topologies.

The engineering challenges of multi-agent systems are real: coordination overhead, debugging difficulty, and increased token costs. But for sufficiently complex tasks, the decomposition benefits—parallelism, specialization, modularity, and redundancy—outweigh these costs. Start with the simplest pattern that works. Escalate to more complex orchestration only when the problem demands it.

Communication patterns shape the system's coupling and resilience. Direct messaging is simple but tightly coupled; pub/sub is flexible but harder to debug; shared state is powerful but requires careful synchronization. Standardize your message schemas early—retrofitting protocol changes across agents is expensive.

The framework landscape is evolving rapidly. LangGraph offers the most production-ready graph-based orchestration, CrewAI provides the fastest path to multi-agent prototypes, and AutoGen excels in conversational multi-agent scenarios. For systems that don't fit these models, the custom building blocks in this chapter provide a foundation.

> **Looking ahead:** Chapter 6 will explore agent evaluations—how to measure whether your agents (individually and as orchestrated systems) are actually performing well, and how to build the infrastructure for continuous quality improvement.

---

*Next: [Chapter 6 — Agent Evals](chapter-06-agent-evals.md)*
