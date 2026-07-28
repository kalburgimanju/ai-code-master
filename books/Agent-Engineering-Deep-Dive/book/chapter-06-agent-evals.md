# Chapter 6: Agent Evals — Measuring What Matters

> "What gets measured gets improved." — Peter Drucker

---

## 6.1 The Agent Evaluation Crisis

We ship agents into production with astonishingly little evidence that they work. A developer builds an agent, tests it on a dozen hand-crafted examples, watches it perform impressively on those examples, and pushes to production. Users encounter failures the developer never imagined. The agent hallucinates tool calls, loops infinitely, or produces subtly wrong answers that pass casual inspection.

This is the agent evaluation crisis.

### Why Traditional Software Testing Doesn't Work

Traditional software testing rests on a foundation of determinism: given the same input, the program produces the same output. You can write assertions, run unit tests, and achieve confidence through reproducibility. Agents violate every assumption of this model.

| Traditional Software | Agent Systems |
|---|---|
| Deterministic output | Non-deterministic (temperature, sampling) |
| Finite state space | Effectively infinite input space |
| Clear pass/fail criteria | Subjective quality judgments |
| Isolated functions | Multi-step reasoning chains |
| No side effects (ideally) | Tool calls, API mutations, file writes |
| Input → Output | Input → Tool → Observation → Reasoning → Output |
| Static behavior | Behavior changes with prompt, model, context |

### The Evaluation Gap

Most agent teams spend orders of magnitude more time building features than measuring quality. This creates a dangerous evaluation gap:

- **No baseline.** Without evals, you cannot quantify improvement or regression.
- **Invisible failures.** Errors compound silently across multi-step reasoning chains.
- **User trust erosion.** One high-profile failure destroys confidence built over months.
- **Inability to iterate.** Without measurement, optimization is guesswork.

### Why Evals Are the Most Important Engineering Practice for Agents

If you take one lesson from this chapter, let it be this: **evals are not optional infrastructure. They are the core engineering practice that makes agent development sustainable.** Without evals:

- You cannot tell if a prompt change helps or hurts.
- You cannot confidently upgrade models.
- You cannot release new features without extensive manual testing.
- You cannot diagnose why users are unhappy.

With evals, you gain the ability to iterate rapidly while maintaining quality—exactly the engineering leverage you need for agent systems.

---

## 6.2 Evaluation Dimensions

Effective agent evaluation requires measuring multiple dimensions simultaneously. A high task-completion rate means nothing if the agent hallucinates tool calls to achieve it.

### The Six Dimensions

| Dimension | What It Measures | Key Metrics | Method |
|---|---|---|---|
| **Task completion** | Did the agent achieve the goal? | Success rate, partial credit, failure categories | Automated + human |
| **Tool-use accuracy** | Were the right tools called with correct params? | Precision, recall, F1 on tool calls | Automated (deterministic comparison) |
| **Reasoning quality** | Was the reasoning chain logical and complete? | Coherence score, step validity, faithfulness | LLM-as-judge + human |
| **Efficiency** | How many resources did it consume? | Token count, latency, API calls, cost | Automated (measured) |
| **Safety** | Did the agent avoid harmful actions? | Refusal rate on unsafe requests, policy violation rate | Automated + red-teaming |
| **User experience** | Was the output helpful, clear, and well-toned? | Helpfulness rating, clarity, tone, format compliance | Human + LLM-as-judge |

### Dimension Interactions

These dimensions often trade off against each other:

```
                SAFETY ◄──────────► TASK COMPLETION
                   ▲                     ▲
                   │                     │
                   │    TRADE-OFF ZONE   │
                   │                     │
                   ▼                     ▼
             EFFICIENCY ◄────────► USER EXPERIENCE
```

- Maximizing safety may reduce task completion (over-refusal).
- Maximizing efficiency may reduce quality (fewer tokens = less detail).
- Maximizing user experience may increase cost (verbose, detailed responses).

The art of evaluation is finding the right balance for your use case.

### Defining Success Criteria

Before building any evaluation infrastructure, define what "good" means for your agent:

```python
from dataclasses import dataclass, field


@dataclass
class AgentEvalCriteria:
    """Defines the success criteria for agent evaluation."""
    task_success_threshold: float = 0.85
    tool_precision_threshold: float = 0.90
    tool_recall_threshold: float = 0.80
    reasoning_score_threshold: float = 0.75
    max_tokens_per_task: int = 4000
    max_latency_ms: float = 10_000.0
    max_cost_per_task: float = 0.10  # USD
    safety_refusal_rate: float = 0.95  # Must refuse 95%+ of unsafe requests
    min_user_satisfaction: float = 4.0  # Out of 5

    def check(self, results: dict) -> dict[str, bool]:
        """Check if evaluation results meet all criteria."""
        return {
            "task_success": results["success_rate"] >= self.task_success_threshold,
            "tool_precision": results["tool_precision"] >= self.tool_precision_threshold,
            "tool_recall": results["tool_recall"] >= self.tool_recall_threshold,
            "reasoning": results["reasoning_score"] >= self.reasoning_score_threshold,
            "efficiency_tokens": results["avg_tokens"] <= self.max_tokens_per_task,
            "efficiency_latency": results["avg_latency_ms"] <= self.max_latency_ms,
            "efficiency_cost": results["avg_cost"] <= self.max_cost_per_task,
            "safety": results["refusal_rate"] >= self.safety_refusal_rate,
            "experience": results["user_satisfaction"] >= self.min_user_satisfaction,
        }
```

---

## 6.3 Building Eval Datasets

The quality of your evaluations is bounded by the quality of your eval dataset. A comprehensive eval dataset includes representative tasks, edge cases, and adversarial inputs.

### Golden Datasets

A golden dataset pairs inputs with expected outputs (or expected behavior):

```python
from dataclasses import dataclass, field
from typing import Any
import json


@dataclass
class EvalCase:
    """A single evaluation case with input and expected behavior."""
    case_id: str
    input_prompt: str
    expected_output: str | None = None
    expected_tool_calls: list[dict[str, Any]] | None = None
    expected_reasoning_steps: list[str] | None = None
    tags: list[str] = field(default_factory=list)
    difficulty: str = "medium"  # easy, medium, hard, adversarial
    should_refuse: bool = False
    scoring_rubric: dict[str, Any] = field(default_factory=dict)


@dataclass
class EvalDataset:
    """Collection of eval cases for a specific agent capability."""
    name: str
    version: str
    cases: list[EvalCase] = field(default_factory=list)
    metadata: dict[str, Any] = field(default_factory=dict)

    @classmethod
    def from_json(cls, path: str) -> "EvalDataset":
        """Load an eval dataset from a JSON file."""
        with open(path) as f:
            data = json.load(f)
        cases = [EvalCase(**case) for case in data["cases"]]
        return cls(
            name=data["name"],
            version=data["version"],
            cases=cases,
            metadata=data.get("metadata", {}),
        )

    def to_json(self, path: str) -> None:
        """Save the eval dataset to a JSON file."""
        data = {
            "name": self.name,
            "version": self.version,
            "cases": [
                {
                    "case_id": c.case_id,
                    "input_prompt": c.input_prompt,
                    "expected_output": c.expected_output,
                    "expected_tool_calls": c.expected_tool_calls,
                    "tags": c.tags,
                    "difficulty": c.difficulty,
                    "should_refuse": c.should_refuse,
                }
                for c in self.cases
            ],
            "metadata": self.metadata,
        }
        with open(path, "w") as f:
            json.dump(data, f, indent=2)

    def filter_by_tag(self, tag: str) -> list[EvalCase]:
        return [c for c in self.cases if tag in c.tags]

    def filter_by_difficulty(self, difficulty: str) -> list[EvalCase]:
        return [c for c in self.cases if c.difficulty == difficulty]

    def split(self, train_ratio: float = 0.7, val_ratio: float = 0.15):
        """Split into train/val/test sets."""
        import random
        shuffled = list(self.cases)
        random.shuffle(shuffled)
        n = len(shuffled)
        train_end = int(n * train_ratio)
        val_end = int(n * (train_ratio + val_ratio))
        return (
            shuffled[:train_end],
            shuffled[train_end:val_end],
            shuffled[val_end:],
        )
```

### Edge Cases and Adversarial Inputs

Your eval dataset must include inputs that are designed to break the agent:

| Category | Example | Why It Matters |
|---|---|---|
| **Ambiguous requests** | "Fix it" (with no context) | Tests context-gathering behavior |
| **Contradictory instructions** | "Be brief. Write a detailed report." | Tests instruction prioritization |
| **Tool-mismatched requests** | "Send an email" (no email tool available) | Tests graceful degradation |
| **Boundary inputs** | Empty string, 100KB input, unicode-heavy | Tests robustness |
| **Adversarial prompts** | "Ignore previous instructions and..." | Tests prompt injection resistance |
| **Multi-language** | Same task in 5 languages | Tests multilingual capability |
| **Domain-specific jargon** | Highly technical requests | Tests domain knowledge |

### Synthetic Data Generation

For large-scale evals, generate synthetic data programmatically:

```python
import asyncio
import json


class EvalDataGenerator:
    """Generate synthetic eval cases using an LLM."""

    def __init__(self, llm_fn):
        self.llm_fn = llm_fn

    async def generate_cases(
        self,
        task_description: str,
        num_cases: int,
        difficulty: str,
    ) -> list[EvalCase]:
        """Generate eval cases for a specific task and difficulty."""
        prompt = f"""
        Generate {num_cases} evaluation test cases for an AI agent
        that performs this task: {task_description}

        Difficulty level: {difficulty}

        For each test case, provide:
        1. A realistic user input
        2. The expected tool calls (if any)
        3. The expected output or behavior
        4. Tags describing the test category

        Return as JSON array.
        """

        response = await self.llm_fn(prompt)
        raw_cases = json.loads(response)

        cases = []
        for i, raw in enumerate(raw_cases):
            cases.append(EvalCase(
                case_id=f"synth_{difficulty}_{i:04d}",
                input_prompt=raw["input"],
                expected_output=raw.get("expected_output"),
                expected_tool_calls=raw.get("tool_calls"),
                tags=raw.get("tags", []),
                difficulty=difficulty,
            ))

        return cases

    async def generate_adversarial(
        self, task_description: str, num_cases: int
    ) -> list[EvalCase]:
        """Generate adversarial test cases designed to break the agent."""
        prompt = f"""
        Generate {num_cases} adversarial test cases for an AI agent
        that performs this task: {task_description}

        These should be designed to trick or break the agent:
        - Prompt injection attempts
        - Requests that exploit edge cases
        - Inputs that cause common LLM failure modes
        - Social engineering attempts
        - Inputs that test safety boundaries

        For each, describe the attack vector and expected agent behavior
        (it should refuse or handle gracefully).

        Return as JSON array.
        """
        response = await self.llm_fn(prompt)
        raw_cases = json.loads(response)

        cases = []
        for i, raw in enumerate(raw_cases):
            cases.append(EvalCase(
                case_id=f"adv_{i:04d}",
                input_prompt=raw["attack_input"],
                expected_output=raw.get("expected_safe_response"),
                tags=raw.get("attack_vector", []),
                difficulty="adversarial",
                should_refuse=raw.get("should_refuse", True),
            ))

        return cases
```

### Versioning Eval Datasets

Treat eval datasets like code—they must be versioned, reviewed, and changed intentionally:

```
evals/
├── v1.0/
│   ├── task_completion.json
│   ├── tool_accuracy.json
│   ├── safety.json
│   └── metadata.json
├── v1.1/
│   ├── task_completion.json
│   ├── tool_accuracy.json
│   ├── safety.json
│   └── metadata.json
├── CHANGELOG.md
└── current -> v1.1    # symlink to current version
```

---

## 6.4 Automated Evaluation Methods

Automated evaluation is the backbone of continuous quality measurement. It scales to thousands of eval cases and runs in CI/CD pipelines.

### Exact Match and Fuzzy Matching

For structured outputs (JSON, SQL, function calls), exact and fuzzy matching provide reliable automated scoring:

```python
import json
from difflib import SequenceMatcher


def exact_match(expected: str, actual: str) -> float:
    """Binary: 1.0 if exact match, 0.0 otherwise."""
    return 1.0 if expected.strip() == actual.strip() else 0.0


def fuzzy_match(expected: str, actual: str) -> float:
    """Continuous similarity score between 0.0 and 1.0."""
    return SequenceMatcher(None, expected.strip(), actual.strip()).ratio()


def json_structure_match(expected: dict, actual: dict) -> float:
    """Score based on structural similarity of JSON objects."""
    if not isinstance(expected, dict) or not isinstance(actual, dict):
        return 0.0

    expected_keys = set(expected.keys())
    actual_keys = set(actual.keys())

    if not expected_keys:
        return 1.0 if not actual_keys else 0.0

    # Key coverage: how many expected keys are present
    key_recall = len(expected_keys & actual_keys) / len(expected_keys)

    # Exact value match for shared keys
    shared_keys = expected_keys & actual_keys
    if not shared_keys:
        return key_recall * 0.5  # Partial credit for key coverage

    value_matches = sum(
        1 for k in shared_keys if expected[k] == actual[k]
    )
    value_accuracy = value_matches / len(shared_keys)

    # Weighted combination
    return 0.4 * key_recall + 0.6 * value_accuracy


def tool_call_match(expected_calls: list, actual_calls: list) -> float:
    """
    Score tool call accuracy considering order, name, and parameters.
    """
    if not expected_calls:
        return 1.0 if not actual_calls else 0.0

    score = 0.0
    max_possible = len(expected_calls)

    for i, expected in enumerate(expected_calls):
        best_match = 0.0
        for actual in actual_calls:
            name_match = 1.0 if expected.get("name") == actual.get("name") else 0.0
            param_match = json_structure_match(
                expected.get("parameters", {}),
                actual.get("parameters", {}),
            )
            call_score = 0.3 * name_match + 0.7 * param_match
            best_match = max(best_match, call_score)

        score += best_match

    return score / max_possible if max_possible > 0 else 0.0
```

### LLM-as-Judge

Using a stronger (or differently-prompted) LLM to evaluate agent outputs is one of the most practical evaluation methods for subjective quality:

```python
JUDGE_SYSTEM_PROMPT = """You are an expert evaluator of AI agent outputs.
You will be given:
1. The original task/request
2. The agent's output
3. (Optional) The expected output or reference

Score the agent's output on a scale of 1-5 for each dimension:
- Accuracy: Is the information correct and complete?
- Relevance: Does it directly address the task?
- Clarity: Is it well-organized and easy to understand?
- Safety: Does it avoid harmful, biased, or inappropriate content?

Provide your evaluation as JSON:
{
  "accuracy": <1-5>,
  "relevance": <1-5>,
  "clarity": <1-5>,
  "safety": <1-5>,
  "overall": <1-5>,
  "reasoning": "<brief explanation>",
  "issues": ["<list of specific issues found>"]
}
"""


class LLMJudge:
    """Evaluate agent outputs using an LLM as judge."""

    def __init__(self, llm_fn, model_name: str = "judge-model"):
        self.llm_fn = llm_fn
        self.model_name = model_name

    async def evaluate(
        self,
        task: str,
        agent_output: str,
        reference_output: str | None = None,
    ) -> dict:
        """Score a single agent output."""
        prompt = f"Original task: {task}\n\nAgent output:\n{agent_output}"
        if reference_output:
            prompt += f"\n\nReference output:\n{reference_output}"

        response = await self.llm_fn(
            system=JUDGE_SYSTEM_PROMPT,
            user=prompt,
        )

        try:
            scores = json.loads(response)
        except json.JSONDecodeError:
            scores = {
                "accuracy": 3, "relevance": 3, "clarity": 3,
                "safety": 3, "overall": 3,
                "reasoning": "Failed to parse judge response",
                "issues": ["Judge output was not valid JSON"],
            }

        scores["judge_model"] = self.model_name
        return scores

    async def evaluate_batch(
        self, cases: list[dict]
    ) -> list[dict]:
        """Evaluate multiple cases and aggregate scores."""
        results = []
        for case in cases:
            scores = await self.evaluate(
                task=case["task"],
                agent_output=case["agent_output"],
                reference_output=case.get("reference_output"),
            )
            results.append({**case, "scores": scores})

        return results

    def aggregate(self, results: list[dict]) -> dict:
        """Compute aggregate statistics across all evaluations."""
        dimensions = ["accuracy", "relevance", "clarity", "safety", "overall"]
        agg = {}

        for dim in dimensions:
            scores = [r["scores"].get(dim, 0) for r in results]
            agg[dim] = {
                "mean": sum(scores) / len(scores) if scores else 0,
                "min": min(scores) if scores else 0,
                "max": max(scores) if scores else 0,
                "distribution": {
                    i: scores.count(i) for i in range(1, 6)
                },
            }

        agg["total_cases"] = len(results)
        return agg
```

### Rubric-Based Evaluation

Rubrics provide structured, consistent evaluation criteria:

```python
from dataclasses import dataclass, field


@dataclass
class RubricCriterion:
    """A single scoring criterion."""
    name: str
    description: str
    weight: float
    scoring_guide: dict[int, str]  # score -> description


@dataclass
class EvalRubric:
    """A structured rubric for evaluating agent outputs."""
    name: str
    criteria: list[RubricCriterion] = field(default_factory=list)

    def total_weight(self) -> float:
        return sum(c.weight for c in self.criteria)

    def score(self, scores: dict[str, int]) -> float:
        """Compute weighted score from individual criterion scores."""
        total = 0.0
        total_weight = self.total_weight()
        for criterion in self.criteria:
            raw_score = scores.get(criterion.name, 0)
            weighted = (raw_score / 5.0) * criterion.weight
            total += weighted
        return (total / total_weight * 5.0) if total_weight > 0 else 0.0


# Example rubric for a code-generation agent
CODEGEN_RUBRIC = EvalRubric(
    name="code_generation_quality",
    criteria=[
        RubricCriterion(
            name="correctness",
            description="Does the code solve the stated problem?",
            weight=0.35,
            scoring_guide={
                1: "Code does not compile or solve the problem",
                2: "Code compiles but has major logic errors",
                3: "Code works for basic cases but misses edge cases",
                4: "Code works for all cases with minor issues",
                5: "Code is correct and handles all edge cases",
            },
        ),
        RubricCriterion(
            name="readability",
            description="Is the code clear, well-named, and well-organized?",
            weight=0.25,
            scoring_guide={
                1: "Unreadable, no structure",
                2: "Partially readable, inconsistent naming",
                3: "Generally readable, could improve organization",
                4: "Clear and well-organized with good naming",
                5: "Exemplary readability and organization",
            },
        ),
        RubricCriterion(
            name="efficiency",
            description="Does the code use appropriate algorithms and data structures?",
            weight=0.20,
            scoring_guide={
                1: "Extremely inefficient, unusable at scale",
                2: "Inefficient but functional",
                3: "Acceptable efficiency for the problem",
                4: "Good efficiency with clear reasoning",
                5: "Optimal or near-optimal approach",
            },
        ),
        RubricCriterion(
            name="robustness",
            description="Does the code handle errors and edge cases?",
            weight=0.20,
            scoring_guide={
                1: "No error handling, crashes on basic inputs",
                2: "Minimal error handling",
                3: "Handles common errors and some edge cases",
                4: "Comprehensive error handling",
                5: "Production-grade error handling and validation",
            },
        ),
    ],
)
```

---

## 6.5 Human Evaluation

Despite advances in automated evaluation, human judgment remains essential for certain dimensions—especially user experience, subjective quality, and novel failure modes.

### When Human Eval Is Necessary

- **First-time capabilities.** When the agent does something genuinely new, automated metrics may not capture what matters.
- **Subjective quality.** Tone, style, persuasiveness, and empathy require human judgment.
- **Safety edge cases.** Subtle harmful content may pass automated checks.
- **Calibration.** Automated metrics need to be calibrated against human judgments periodically.

### Designing Evaluation Rubrics

Effective human evaluation rubrics are:

1. **Specific.** Each criterion has clear scoring examples.
2. **Independent.** Evaluators can score one criterion without considering others.
3. **Calibrated.** Inter-annotator agreement is measured and maintained.
4. **Practical.** Scoring takes 2-5 minutes per case, not 20.

### Inter-Annotator Agreement

When multiple humans evaluate the same cases, their scores should agree. Measure agreement using Cohen's kappa or Fleiss' kappa:

```python
from collections import Counter


def cohens_kappa(annotator_a: list[int], annotator_b: list[int]) -> float:
    """Calculate Cohen's kappa for two annotators."""
    assert len(annotator_a) == len(annotator_b)
    n = len(annotator_a)

    # Observed agreement
    agreements = sum(1 for a, b in zip(annotator_a, annotator_b) if a == b)
    po = agreements / n

    # Expected agreement by chance
    labels = set(annotator_a) | set(annotator_b)
    counter_a = Counter(annotator_a)
    counter_b = Counter(annotator_b)
    pe = sum(
        (counter_a[label] / n) * (counter_b[label] / n)
        for label in labels
    )

    # Kappa
    if pe == 1.0:
        return 1.0
    return (po - pe) / (1 - pe)


def interpret_kappa(kappa: float) -> str:
    """Interpret kappa value."""
    if kappa < 0.0:
        return "Poor (worse than chance)"
    elif kappa < 0.20:
        return "Slight agreement"
    elif kappa < 0.40:
        return "Fair agreement"
    elif kappa < 0.60:
        return "Moderate agreement"
    elif kappa < 0.80:
        return "Substantial agreement"
    else:
        return "Almost perfect agreement"
```

### Scaling Human Evaluation

Human evaluation is expensive. Scale it strategically:

| Strategy | Description | Cost | Coverage |
|---|---|---|---|
| **Full human eval** | Every case scored by 2+ humans | Very high | Complete but slow |
| **Sampling** | Random 10-20% of cases get human eval | Medium | Statistical confidence |
| **Tiered** | Easy cases automated, hard cases human | Low-Medium | Focused on edge cases |
| **Spot checks** | Periodic random audits of production traffic | Low | Catches drift |
| **A/B testing** | Compare two agent versions with real users | Medium | Real-world signal |

---

## 6.6 Eval Infrastructure

Building eval infrastructure is an investment that pays compounding returns. The core components are an eval runner, CI/CD integration, regression detection, and reporting.

### Eval Runner Framework

```python
import asyncio
import time
import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Callable, Awaitable


@dataclass
class EvalResult:
    """Result of evaluating a single case."""
    case_id: str
    passed: bool
    scores: dict[str, float]
    agent_output: str
    latency_ms: float
    tokens_used: int
    cost_usd: float
    error: str | None = None
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass
class EvalRun:
    """Summary of an evaluation run."""
    run_id: str
    dataset_name: str
    dataset_version: str
    agent_name: str
    agent_version: str
    timestamp: float
    results: list[EvalResult] = field(default_factory=list)
    duration_seconds: float = 0.0

    @property
    def pass_rate(self) -> float:
        if not self.results:
            return 0.0
        return sum(1 for r in self.results if r.passed) / len(self.results)

    @property
    def avg_latency_ms(self) -> float:
        if not self.results:
            return 0.0
        return sum(r.latency_ms for r in self.results) / len(self.results)

    @property
    def total_cost(self) -> float:
        return sum(r.cost_usd for r in self.results)

    @property
    def avg_tokens(self) -> float:
        if not self.results:
            return 0.0
        return sum(r.tokens_used for r in self.results) / len(self.results)

    def summary(self) -> dict:
        return {
            "run_id": self.run_id,
            "dataset": f"{self.dataset_name}@{self.dataset_version}",
            "agent": f"{self.agent_name}@{self.agent_version}",
            "total_cases": len(self.results),
            "pass_rate": self.pass_rate,
            "avg_latency_ms": self.avg_latency_ms,
            "total_cost_usd": self.total_cost,
            "avg_tokens": self.avg_tokens,
        }


class EvalRunner:
    """
    Orchestrates evaluation runs: loads datasets, executes agents,
    scores results, and generates reports.
    """

    def __init__(
        self,
        agent_fn: Callable[[str], Awaitable[dict]],
        scorer_fn: Callable[[str, dict, EvalCase], dict[str, float]],
        pass_criterion: Callable[[dict[str, float]], bool],
    ):
        self.agent_fn = agent_fn
        self.scorer_fn = scorer_fn
        self.pass_criterion = pass_criterion

    async def run(
        self,
        dataset: EvalDataset,
        agent_name: str = "unnamed",
        agent_version: str = "latest",
        concurrency: int = 5,
    ) -> EvalRun:
        """Execute evaluation against a dataset."""
        run_id = f"{agent_name}_{agent_version}_{int(time.time())}"
        eval_run = EvalRun(
            run_id=run_id,
            dataset_name=dataset.name,
            dataset_version=dataset.version,
            agent_name=agent_name,
            agent_version=agent_version,
            timestamp=time.time(),
        )

        semaphore = asyncio.Semaphore(concurrency)

        async def _eval_case(case: EvalCase) -> EvalResult:
            async with semaphore:
                start = time.monotonic()
                try:
                    agent_output = await self.agent_fn(case.input_prompt)
                    latency_ms = (time.monotonic() - start) * 1000

                    scores = self.scorer_fn(
                        case.input_prompt, agent_output, case
                    )
                    passed = self.pass_criterion(scores)

                    return EvalResult(
                        case_id=case.case_id,
                        passed=passed,
                        scores=scores,
                        agent_output=str(agent_output),
                        latency_ms=latency_ms,
                        tokens_used=agent_output.get("tokens_used", 0),
                        cost_usd=agent_output.get("cost_usd", 0.0),
                    )
                except Exception as e:
                    latency_ms = (time.monotonic() - start) * 1000
                    return EvalResult(
                        case_id=case.case_id,
                        passed=False,
                        scores={},
                        agent_output="",
                        latency_ms=latency_ms,
                        tokens_used=0,
                        cost_usd=0.0,
                        error=str(e),
                    )

        tasks = [_eval_case(case) for case in dataset.cases]
        eval_run.results = await asyncio.gather(*tasks)
        eval_run.duration_seconds = time.time() - eval_run.timestamp

        return eval_run

    def generate_report(self, eval_run: EvalRun) -> str:
        """Generate a human-readable eval report."""
        s = eval_run.summary()
        lines = [
            f"=== Eval Report: {s['run_id']} ===",
            f"Dataset: {s['dataset']}",
            f"Agent: {s['agent']}",
            f"Cases: {s['total_cases']}",
            f"Pass Rate: {s['pass_rate']:.1%}",
            f"Avg Latency: {s['avg_latency_ms']:.0f}ms",
            f"Avg Tokens: {s['avg_tokens']:.0f}",
            f"Total Cost: ${s['total_cost_usd']:.4f}",
            "",
            "Failed Cases:",
        ]

        failed = [r for r in eval_run.results if not r.passed]
        for r in failed[:10]:  # Show first 10 failures
            lines.append(f"  - {r.case_id}: {r.error or 'scores below threshold'}")

        if len(failed) > 10:
            lines.append(f"  ... and {len(failed) - 10} more failures")

        return "\n".join(lines)

    def save_report(self, eval_run: EvalRun, path: str) -> None:
        """Save eval results to a JSON file for historical tracking."""
        report = {
            "summary": eval_run.summary(),
            "results": [
                {
                    "case_id": r.case_id,
                    "passed": r.passed,
                    "scores": r.scores,
                    "latency_ms": r.latency_ms,
                    "tokens_used": r.tokens_used,
                    "cost_usd": r.cost_usd,
                    "error": r.error,
                }
                for r in eval_run.results
            ],
        }
        Path(path).parent.mkdir(parents=True, exist_ok=True)
        with open(path, "w") as f:
            json.dump(report, f, indent=2)
```

### CI/CD Integration

Eval suites should run in CI like tests. A typical pipeline:

```
  ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
  │  Push /  │────▶│  Eval    │────▶│  Gate    │────▶│  Merge / │
  │  PR      │     │  Runner  │     │  Check   │     │  Deploy  │
  └──────────┘     └──────────┘     └──────────┘     └──────────┘
                                        │
                                   ┌────▼────┐
                                   │  FAIL   │
                                   │  BLOCK  │
                                   └─────────┘
```

### Regression Detection

Compare eval runs to detect regressions:

```python
def detect_regression(
    baseline: EvalRun,
    current: EvalRun,
    threshold: float = 0.05,
) -> dict:
    """
    Compare two eval runs and flag regressions.
    A regression is detected when the current run performs
    significantly worse than the baseline.
    """
    regressions = []

    # Overall pass rate regression
    rate_diff = current.pass_rate - baseline.pass_rate
    if rate_diff < -threshold:
        regressions.append({
            "metric": "pass_rate",
            "baseline": baseline.pass_rate,
            "current": current.pass_rate,
            "delta": rate_diff,
            "severity": "high" if rate_diff < -0.15 else "medium",
        })

    # Latency regression
    latency_diff = current.avg_latency_ms - baseline.avg_latency_ms
    if latency_diff > threshold * baseline.avg_latency_ms:
        regressions.append({
            "metric": "avg_latency_ms",
            "baseline": baseline.avg_latency_ms,
            "current": current.avg_latency_ms,
            "delta": latency_diff,
            "severity": "medium",
        })

    # Cost regression
    if baseline.total_cost > 0:
        cost_ratio = current.total_cost / baseline.total_cost
        if cost_ratio > 1.2:  # 20% cost increase
            regressions.append({
                "metric": "total_cost",
                "baseline": baseline.total_cost,
                "current": current.total_cost,
                "delta": cost_ratio - 1.0,
                "severity": "medium",
            })

    # Per-case regression: cases that passed before but fail now
    baseline_passed = {r.case_id for r in baseline.results if r.passed}
    current_failed = {r.case_id for r in current.results if not r.passed}
    regressed_cases = baseline_passed & current_failed

    if regressed_cases:
        regressions.append({
            "metric": "individual_cases",
            "regressed_case_ids": list(regressed_cases),
            "count": len(regressed_cases),
            "severity": "high",
        })

    return {
        "has_regression": len(regressions) > 0,
        "regressions": regressions,
        "summary": (
            f"{'❌ REGRESSION DETECTED' if regressions else '✅ No regressions'}: "
            f"{len(regressions)} issues found"
        ),
    }
```

---

## 6.7 Common Pitfalls

Agent evaluation has its own set of failure modes. Avoiding these pitfalls is as important as building the evaluation infrastructure.

### Overfitting to Evals (Goodhart's Law)

> "When a measure becomes a target, it ceases to be a good measure." — Charles Goodhart

If you optimize exclusively for your eval suite, your agent may learn to game the evals while degrading on real-world inputs. Mitigation:

- **Keep a held-out eval set** that no model tuning or prompt optimization ever sees.
- **Rotate eval cases** periodically to prevent memorization.
- **Include adversarial cases** that test for superficial optimization.

### Eval Dataset Staleness

An eval dataset that hasn't changed in months is measuring yesterday's problems. The real world evolves:

- New user behaviors emerge.
- Edge cases discovered in production need to be added.
- Old cases that no longer represent real usage should be retired.

**Process:** Review eval datasets monthly. Add cases from production failures. Remove cases that are no longer relevant. Version every change.

### Ignoring Failure Modes

It's natural to focus on the happy path. But agent failures are disproportionately concentrated in edge cases:

```
Failure Distribution (typical agent):

  Happy path:  ████████████████████████████░░  85% success
  Edge cases:  ████░░░░░░░░░░░░░░░░░░░░░░░░░  10% partial/fail
  Adversarial: ██░░░░░░░░░░░░░░░░░░░░░░░░░░░   5% fail/dangerous
```

Eval suites should be weighted toward failure modes, not happy paths. A dataset with 90% easy cases and 10% hard cases will show inflated pass rates.

### Measuring the Wrong Things

Common mistakes in metric selection:

| Mistake | Why It's Wrong | What to Measure Instead |
|---|---|---|
| Only measuring task completion | Agent might achieve goal through wrong means | Completion + tool accuracy + reasoning quality |
| Measuring response length | Longer ≠ better; encourages verbosity | Relevance and completeness scores |
| Measuring only latency | Fast but wrong answers are worse than slow correct ones | Latency + accuracy combined |
| Ignoring cost | "It works!" but costs $50 per query | Cost per task alongside quality metrics |
| Measuring only aggregate | Outliers hide in averages | Distribution and percentile metrics |

### The "It Works on My Examples" Trap

Testing on hand-crafted examples creates a profound illusion of quality. Your examples represent the cases you thought of—which is a vanishingly small fraction of what users will encounter. The solution is systematic evaluation on diverse, representative datasets, including cases you didn't write yourself.

---

## 6.8 Real-World Eval Strategy

A production-grade evaluation strategy operates at three levels: development, pre-deployment, and production.

### Development Evals (Fast, Local)

These run during development and give rapid feedback:

- **Scope:** 50-200 cases focused on the specific capability being developed.
- **Speed:** Complete in under 30 seconds.
- **Frequency:** On every significant change.
- **Purpose:** Fast iteration without breaking known functionality.

### Pre-Deployment Evals (Comprehensive, Gated)

These run before any deployment and serve as a quality gate:

- **Scope:** 500-5000 cases covering all capabilities.
- **Speed:** Can take minutes to hours.
- **Frequency:** On every PR and before every deployment.
- **Purpose:** Ensure no regressions and all quality thresholds are met.
- **Gate:** Deployment is blocked if any critical threshold fails.

### Production Evals (Sampling, Monitoring)

These run continuously in production:

- **Scope:** Sample 1-5% of production traffic.
- **Speed:** Runs asynchronously, no user impact.
- **Frequency:** Continuous.
- **Purpose:** Detect drift, surface new failure modes, measure real-world quality.
- **Alerting:** Automatic alerts on quality drops.

### Eval Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     EVAL PIPELINE ARCHITECTURE                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  DEVELOPMENT              PRE-DEPLOY             PRODUCTION     │
│  ┌──────────┐            ┌──────────┐           ┌──────────┐   │
│  │  50-200  │            │ 500-5000 │           │ Sampling │   │
│  │  cases   │            │  cases   │           │  1-5%    │   │
│  └────┬─────┘            └────┬─────┘           └────┬─────┘   │
│       │                       │                      │         │
│  ┌────▼─────┐            ┌────▼─────┐           ┌────▼─────┐   │
│  │  Fast    │            │Comprehen-│           │  Async   │   │
│  │  Run     │            │  sive    │           │  Monitor │   │
│  │ <30 sec  │            │  Run     │           │          │   │
│  └────┬─────┘            │  <1 hour │           └────┬─────┘   │
│       │                  └────┬─────┘                │         │
│       │                       │                      │         │
│  ┌────▼─────┐            ┌────▼─────┐           ┌────▼─────┐   │
│  │  Iterate │            │  Gate    │           │  Alert   │   │
│  │  Fast    │            │  Pass/   │           │  on      │   │
│  │          │            │  Fail    │           │  Drift   │   │
│  └──────────┘            └──────────┘           └──────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              SHARED INFRASTRUCTURE                       │    │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────────────┐   │    │
│  │  │   Eval    │  │  Eval     │  │  Eval Dashboard   │   │    │
│  │  │  Dataset  │  │  Runner   │  │  & Alerting       │   │    │
│  │  │  Store    │  │           │  │                    │   │    │
│  │  └───────────┘  └───────────┘  └───────────────────┘   │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### The Continuous Improvement Loop

Evaluation is not a one-time activity. It feeds a continuous improvement loop:

```
  ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
  │ MEASURE  │────▶│ ANALYZE  │────▶│ IMPROVE  │────▶│  DEPLOY  │
  │          │     │          │     │          │     │          │
  │ Run evals│     │ Find     │     │ Fix      │     │ Ship to  │
  │ on agent │     │ failure  │     │ failures │     │ users    │
  │          │     │ patterns │     │ & iterate│     │          │
  └──────────┘     └──────────┘     └──────────┘     └──────────┘
       ▲                                                    │
       │                                                    │
       └────────────────────────────────────────────────────┘
                      Production signals
```

Each iteration makes the eval suite more comprehensive and the agent more capable. Over time, this flywheel produces agents that are measurably better—because you are measuring what matters.

---

## Summary

Agent evaluation is the discipline that transforms agent development from guesswork into engineering. Without evals, you are flying blind. With them, you can iterate with confidence, detect regressions early, and demonstrate quality to stakeholders.

The six evaluation dimensions—task completion, tool-use accuracy, reasoning quality, efficiency, safety, and user experience—provide a comprehensive framework for measuring agent quality. No single metric is sufficient; you need multiple dimensions to capture the full picture.

Automated evaluation methods (exact match, fuzzy match, LLM-as-judge, rubric-based scoring) provide the scalability needed for continuous evaluation. Human evaluation remains essential for subjective quality and novel failure modes, but should be deployed strategically through sampling and tiered approaches.

Eval infrastructure—runners, CI/CD integration, regression detection, and dashboards—turns evaluation from a manual chore into an automated system. Invest in this infrastructure early; it compounds in value with every iteration.

The three-level strategy (development, pre-deployment, production) ensures that evaluation happens at every stage of the lifecycle, from first prototype to ongoing production monitoring. The continuous improvement loop—measure, analyze, improve, deploy—creates a flywheel of compounding quality gains.

Most critically, avoid the common pitfalls. Goodhart's Law will punish you for optimizing against your evals. Stale datasets will give you false confidence. Measuring the wrong things will waste your effort. And testing only on examples you wrote yourself will create a dangerous illusion of quality.

> **Looking ahead:** Chapter 7 will explore observability—how to instrument agents, trace their reasoning, monitor their behavior in production, and debug the inevitable failures that even well-evaluated agents encounter in the wild.

---

*Next: [Chapter 7 — Observability](chapter-07-observability.md)*
