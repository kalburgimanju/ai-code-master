# Chapter 2: Alignment Research

> *"The alignment problem is not just a technical challenge — it is the defining challenge of the 21st century. Solving it means ensuring that the most powerful technology humanity has ever created remains aligned with human values, even as it surpasses human capabilities in every domain."*
> — Stuart Russell

---

The central question of AI safety is deceptively simple: *How do we ensure that advanced AI systems do what we actually want?* This question, known as the **alignment problem**, sits at the intersection of machine learning, philosophy, cognitive science, and game theory. In this chapter, we conduct a thorough survey of the major alignment research paradigms that have emerged over the past decade — from the now-standard Reinforcement Learning from Human Feedback (RLHF) to speculative but promising frameworks like iterated amplification and recursive reward modeling.

Each technique we examine represents a different answer to a fundamental tension: as AI systems become more capable, the humans who must evaluate their behavior may become increasingly unable to distinguish good outputs from bad. The alignment research landscape is, at its core, a collection of strategies for maintaining the "human in the loop" even when the loop threatens to exceed human comprehension.

---

## 2.1 Reinforcement Learning from Human Feedback (RLHF)

Reinforcement Learning from Human Feedback has become the foundational technique for aligning large language models with human preferences. It was the key innovation behind InstructGPT and has been adopted by virtually every major AI lab, including OpenAI, Anthropic, Google DeepMind, and Meta.

### 2.1.1 The RLHF Pipeline

The RLHF pipeline consists of three distinct phases:

**Phase 1: Supervised Fine-Tuning (SFT)**

Before applying RLHF, a pretrained language model is fine-tuned on a curated dataset of high-quality, human-written demonstrations. This creates a "policy model" π_θ that already has a baseline capability for following instructions. The quality of SFT data is critical — it defines the behavioral floor from which RLHF refines.

```python
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, TrainingArguments
from trl import SFTTrainer

model_name = "meta-llama/Llama-3-8B"
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype=torch.bfloat16,
    device_map="auto",
)
tokenizer = AutoTokenizer.from_pretrained(model_name)

sft_dataset = [
    {
        "prompt": "Explain quantum computing in simple terms.",
        "response": "Quantum computing uses quantum mechanical phenomena like "
        "superposition and entanglement to process information in fundamentally "
        "new ways. Unlike classical bits that are either 0 or 1, quantum bits "
        "(qubits) can exist in multiple states simultaneously, allowing quantum "
        "computers to explore many possible solutions at once."
    },
    # ... thousands of curated demonstration examples
]

sft_args = TrainingArguments(
    output_dir="./sft_model",
    num_train_epochs=3,
    per_device_train_batch_size=8,
    learning_rate=2e-5,
    warmup_ratio=0.1,
    logging_steps=10,
    save_strategy="epoch",
)

sft_trainer = SFTTrainer(
    model=model,
    args=sft_args,
    train_dataset=sft_dataset,
    tokenizer=tokenizer,
    max_seq_length=2048,
)
sft_trainer.train()
```

**Phase 2: Reward Model Training**

Human labelers are presented with multiple model outputs for the same prompt and rank them from best to worst. These rankings are used to train a reward model r_ϕ(x, y) — a neural network that takes a prompt and response as input and produces a scalar score reflecting how well the response satisfies human preferences.

The reward model is typically trained using the **Bradley-Terry model**, which assumes that the probability of preferring one response over another is determined by the difference in their reward scores:

> P(y_w ≻ y_l | x) = σ(r_ϕ(x, y_w) − r_ϕ(x, y_l))

where σ is the sigmoid function, y_w is the preferred (winning) response, and y_l is the dispreferred (losing) response.

```python
from dataclasses import dataclass
from typing import Optional
import torch
import torch.nn as nn
import torch.nn.functional as F
from transformers import AutoModelForSequenceClassification


@dataclass
class PreferenceExample:
    """A single preference comparison example."""
    prompt: str
    chosen_response: str
    rejected_response: str


class RewardModel(nn.Module):
    """
    Reward model that scores prompt-response pairs.
    Trained on human preferences using the Bradley-Terry model.
    """

    def __init__(self, model_name: str, num_labels: int = 1):
        super().__init__()
        self.model = AutoModelForSequenceClassification.from_pretrained(
            model_name,
            num_labels=num_labels,
        )
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)

    def forward(
        self,
        input_ids: torch.Tensor,
        attention_mask: torch.Tensor,
    ) -> torch.Tensor:
        """Return scalar reward for each input."""
        outputs = self.model(
            input_ids=input_ids,
            attention_mask=attention_mask,
        )
        return outputs.logits.squeeze(-1)

    def compute_preference_loss(
        self,
        chosen_ids: torch.Tensor,
        chosen_mask: torch.Tensor,
        rejected_ids: torch.Tensor,
        rejected_mask: torch.Tensor,
    ) -> torch.Tensor:
        """
        Bradley-Terry loss: maximize reward(chosen) − reward(rejected).
        Equivalently, minimize −log σ(r_chosen − r_rejected).
        """
        chosen_rewards = self.forward(chosen_ids, chosen_mask)
        rejected_rewards = self.forward(rejected_ids, rejected_mask)
        loss = -F.logsigmoid(chosen_rewards - rejected_rewards).mean()
        return loss


def train_reward_model(
    model: RewardModel,
    preference_data: list[PreferenceExample],
    epochs: int = 1,
    learning_rate: float = 1e-5,
    batch_size: int = 4,
) -> None:
    """Full reward model training loop."""
    optimizer = torch.optim.AdamW(model.parameters(), lr=learning_rate)

    for epoch in range(epochs):
        total_loss = 0.0
        correct = 0
        total = 0

        for i in range(0, len(preference_data), batch_size):
            batch = preference_data[i : i + batch_size]

            chosen_encodings = model.tokenizer(
                [ex.prompt + "\n" + ex.chosen_response for ex in batch],
                padding=True,
                truncation=True,
                return_tensors="pt",
            )
            rejected_encodings = model.tokenizer(
                [ex.prompt + "\n" + ex.rejected_response for ex in batch],
                padding=True,
                truncation=True,
                return_tensors="pt",
            )

            loss = model.compute_preference_loss(
                chosen_ids=chosen_encodings["input_ids"],
                chosen_mask=chosen_encodings["attention_mask"],
                rejected_ids=rejected_encodings["input_ids"],
                rejected_mask=rejected_encodings["attention_mask"],
            )

            optimizer.zero_grad()
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            optimizer.step()

            total_loss += loss.item()

        avg_loss = total_loss / max(len(preference_data) / batch_size, 1)
        print(f"Epoch {epoch + 1}/{epochs} — Reward Model Loss: {avg_loss:.4f}")
```

**Phase 3: PPO Fine-Tuning on Reward Signals**

The original language model is then fine-tuned using Proximal Policy Optimization (PPO) to maximize the reward model's scores, subject to a KL-divergence constraint that prevents the model from diverging too far from the SFT baseline:

> max_θ E_{x~D, y~π_θ} [r_ϕ(x, y)] − β · KL[π_θ || π_ref]

The KL penalty is critical: without it, the model exploits the reward model, producing outputs that score highly but are degenerate, repetitive, or nonsensical — a phenomenon known as **reward hacking** or **reward overoptimization**.

### 2.1.2 Technical Deep-Dive: PPO in RLHF

PPO is preferred over other reinforcement learning algorithms in the RLHF context for several reasons:

1. **Sample efficiency**: PPO reuses collected trajectories, unlike REINFORCE.
2. **Stability**: The clipped objective prevents catastrophically large policy updates.
3. **Simplicity**: Compared to Trust Region Policy Optimization (TRPO), PPO achieves similar stability with simpler implementation.

The PPO-clip objective in the RLHF setting is:

> L_PPO(θ) = E_t [min(r_t(θ) A_t, clip(r_t(θ), 1−ε, 1+ε) A_t)]

where r_t(θ) = π_θ(a_t|s_t) / π_θ_old(a_t|s_t) is the probability ratio, A_t is the estimated advantage, and ε is the clipping parameter (typically 0.2).

### 2.1.3 Complete RLHF Training Loop

Below is a substantial implementation of the RLHF training loop, demonstrating both the reward model training and PPO phases:

```python
from dataclasses import dataclass, field
from torch.utils.data import DataLoader, Dataset
from transformers import AutoModelForCausalLM, AutoTokenizer
from typing import Optional
import numpy as np


class PreferenceDataset(Dataset):
    """
    Dataset of preference pairs (prompt, chosen, rejected).
    Each item returns tokenized (prompt+chosen) and (prompt+rejected).
    """

    def __init__(
        self,
        examples: list[PreferenceExample],
        tokenizer: AutoTokenizer,
        max_length: int = 2048,
    ):
        self.examples = examples
        self.tokenizer = tokenizer
        self.max_length = max_length

    def __len__(self) -> int:
        return len(self.examples)

    def __getitem__(self, idx: int) -> dict[str, torch.Tensor]:
        ex = self.examples[idx]
        chosen_text = f"{ex.prompt}\n{ex.chosen_response}"
        rejected_text = f"{ex.prompt}\n{ex.rejected_response}"

        chosen_ids = self.tokenizer(
            chosen_text,
            max_length=self.max_length,
            truncation=True,
            padding="max_length",
            return_tensors="pt",
        )
        rejected_ids = self.tokenizer(
            rejected_text,
            max_length=self.max_length,
            truncation=True,
            padding="max_length",
            return_tensors="pt",
        )
        return {
            "chosen_input_ids": chosen_ids["input_ids"].squeeze(0),
            "chosen_attention_mask": chosen_ids["attention_mask"].squeeze(0),
            "rejected_input_ids": rejected_ids["input_ids"].squeeze(0),
            "rejected_attention_mask": rejected_ids["attention_mask"].squeeze(0),
        }


@dataclass
class PPOConfig:
    """Configuration for PPO-based RLHF training."""
    kl_coefficient: float = 0.1
    clip_epsilon: float = 0.2
    gamma: float = 1.0
    lam: float = 0.95
    ppo_epochs: int = 4
    learning_rate: float = 1e-6
    max_grad_norm: float = 1.0
    batch_size: int = 8
    generation_max_length: int = 512
    temperature: float = 0.7


class PPOTrainer:
    """
    PPO trainer for RLHF using a frozen reference model,
    a trainable policy model, and a trained reward model.
    """

    def __init__(
        self,
        policy_model: AutoModelForCausalLM,
        ref_model: AutoModelForCausalLM,
        reward_model: RewardModel,
        tokenizer: AutoTokenizer,
        config: PPOConfig = PPOConfig(),
        device: str = "cuda",
    ):
        self.policy = policy_model.to(device)
        self.ref_model = ref_model.to(device).eval()
        self.reward_model = reward_model.to(device).eval()
        self.tokenizer = tokenizer
        self.config = config
        self.device = device

        self.optimizer = torch.optim.AdamW(
            self.policy.parameters(),
            lr=config.learning_rate,
        )

        # Freeze reference and reward models
        for param in self.ref_model.parameters():
            param.requires_grad = False
        for param in self.reward_model.parameters():
            param.requires_grad = False

    def generate_response(
        self, prompts: list[str],
    ) -> tuple[torch.Tensor, torch.Tensor, torch.Tensor]:
        """
        Generate responses from the policy model and compute
        log-probabilities for both policy and reference.
        """
        inputs = self.tokenizer(
            prompts, return_tensors="pt", padding=True, truncation=True,
        ).to(self.device)

        with torch.no_grad():
            outputs = self.policy.generate(
                **inputs,
                max_new_tokens=self.config.generation_max_length,
                temperature=self.config.temperature,
                do_sample=True,
                top_p=0.9,
                return_dict_in_generate=True,
            )

        sequences = outputs.sequences
        prompt_length = inputs["input_ids"].size(1)
        generated_ids = sequences[:, prompt_length:]

        log_probs_policy = self._compute_log_probs(
            self.policy, sequences, prompt_length
        )
        with torch.no_grad():
            log_probs_ref = self._compute_log_probs(
                self.ref_model, sequences, prompt_length
            )

        return sequences, log_probs_policy, log_probs_ref

    def _compute_log_probs(
        self, model, sequences, prompt_length,
    ) -> torch.Tensor:
        """Compute per-token log probabilities for generated tokens."""
        outputs = model(sequences)
        logits = outputs.logits[:, prompt_length - 1:-1]
        log_probs = F.log_softmax(logits, dim=-1)
        token_log_probs = torch.gather(
            log_probs, dim=-1, index=sequences[:, prompt_length:].unsqueeze(-1)
        ).squeeze(-1)
        return token_log_probs

    def compute_rewards(
        self, prompts, responses, log_probs_policy, log_probs_ref,
    ) -> torch.Tensor:
        """Compute per-token rewards = reward_model_score − β·KL_penalty."""
        rewards = []
        for i, prompt in enumerate(prompts):
            response_text = self.tokenizer.decode(
                responses[i], skip_special_tokens=True
            )
            rm_input = self.tokenizer(
                f"{prompt}\n{response_text}",
                return_tensors="pt", truncation=True, max_length=2048,
            ).to(self.device)
            with torch.no_grad():
                reward_score = self.reward_model(
                    rm_input["input_ids"], rm_input["attention_mask"],
                ).item()

            kl = log_probs_policy[i] - log_probs_ref[i]
            kl_penalty = self.config.kl_coefficient * kl
            token_rewards = -kl_penalty
            token_rewards[-1] += reward_score
            rewards.append(token_rewards)

        return torch.stack(rewards)

    def step(self, prompts: list[str]) -> dict[str, float]:
        """One PPO update step: generate → score → advantage → update."""
        self.policy.train()

        sequences, log_probs_policy, log_probs_ref = self.generate_response(prompts)

        rewards = self.compute_rewards(
            prompts, sequences[:, -log_probs_policy.size(1):],
            log_probs_policy, log_probs_ref,
        )
        returns = rewards.sum(dim=-1).mean()
        mean_reward = rewards[:, -1].mean().item()
        mean_kl = (log_probs_policy - log_probs_ref).abs().mean().item()

        old_log_probs = log_probs_policy.detach()
        total_ppo_loss = 0.0

        for _ in range(self.config.ppo_epochs):
            new_log_probs = self._compute_log_probs(
                self.policy, sequences,
                sequences.size(1) - old_log_probs.size(1),
            )
            ratio = torch.exp(new_log_probs - old_log_probs)
            advantages = returns.expand_as(ratio)

            surr1 = ratio * advantages
            surr2 = torch.clamp(
                ratio, 1.0 - self.config.clip_epsilon, 1.0 + self.config.clip_epsilon,
            ) * advantages
            ppo_loss = -torch.min(surr1, surr2).mean()

            self.optimizer.zero_grad()
            ppo_loss.backward()
            torch.nn.utils.clip_grad_norm_(
                self.policy.parameters(), self.config.max_grad_norm,
            )
            self.optimizer.step()
            total_ppo_loss += ppo_loss.item()

        return {
            "ppo_loss": total_ppo_loss / self.config.ppo_epochs,
            "mean_reward": mean_reward,
            "mean_kl": mean_kl,
        }
```

### 2.1.4 Advantages and Limitations

| Aspect | Details |
|---|---|
| **Advantages** | Captures nuanced human preferences; works well at scale; proven in production (ChatGPT, Claude, Gemini) |
| **Reward hacking** | Model learns to exploit reward model idiosyncrasies |
| **Human label quality** | Noisy, inconsistent labels degrade reward model fidelity |
| **Scalability ceiling** | Human evaluators cannot reliably rank superhuman outputs |
| **Training instability** | PPO is notoriously sensitive to hyperparameter choices |
| **Cost** | Requires thousands of human preference annotations |

> **Key Insight:** RLHF's greatest weakness is also its conceptual strength — it depends on human judgment. This becomes a fatal flaw when AI systems produce outputs that exceed the evaluator's ability to judge. This "scalable oversight" problem motivates nearly every technique discussed in the remainder of this chapter.

---

## 2.2 Constitutional AI (Anthropic)

Constitutional AI (CAI), introduced by Anthropic in 2022, addresses a core inefficiency of RLHF: the need for extensive human feedback at every stage. CAI proposes that an AI system can learn to self-critique and self-revise based on a set of explicit principles — a "constitution" — thereby reducing the human oversight required while maintaining (or even improving) alignment quality.

### 2.2.1 How Constitutional AI Works

The CAI pipeline has two phases:

**Phase 1: Supervised Learning from AI Feedback (SL-CAI)**

1. The model generates an initial response to a prompt.
2. The model is then prompted to critique its own response against one or more constitutional principles (e.g., "Choose the response that is least likely to be considered harmful").
3. The model revises its response based on the critique.
4. This critique-revision cycle repeats for several rounds.
5. The final revised responses are collected and used to create a new supervised fine-tuning dataset.

**Phase 2: Reinforcement Learning from AI Feedback (RL-CAI / RLAIF)**

1. For a given prompt, two or more responses are generated.
2. The model (or a separate judge model) evaluates which response better adheres to the constitutional principles, producing AI-generated preference labels.
3. These AI-generated preferences are used to train a reward model, which is then used for PPO fine-tuning — just like in standard RLHF, but with machine-generated feedback replacing human labels.

### 2.2.2 The Constitution

The "constitution" is a set of natural language principles that guide the model's behavior. Examples from Anthropic's published constitution include:

- *"Choose the response that is least harmful to human health and safety."*
- *"Choose the response that is most helpful while being honest."*
- *"Choose the response that would be considered ethical by most people."*
- *"Choose the response that is least likely to be used for harmful purposes."*
- *"Choose the response that is most respectful of human rights and dignity."*

The constitution acts as an explicit, inspectable, and modifiable set of values — a stark contrast to the implicit, opaque preferences captured by RLHF.

### 2.2.3 The Self-Critique Mechanism

The self-critique mechanism is the heart of CAI. Given a response r and a constitutional principle p, the model is prompted:

> *"Here is a response from an AI assistant: {r}. Here is the principle: {p}. Please critique the response with respect to the principle, and then revise the response to better align with the principle."*

This prompt structure leverages the model's language understanding to perform a task analogous to what a human reviewer does in RLHF, but using explicit rules rather than implicit preferences.

### 2.2.4 Code Example: Constitutional AI Feedback Loop

```python
from dataclasses import dataclass, field
from typing import Optional
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer


@dataclass
class ConstitutionalPrinciple:
    """A single principle in the AI constitution."""
    description: str
    critique_template: str = ""

    def __post_init__(self):
        if not self.critique_template:
            self.critique_template = (
                "Consider the following response from an AI assistant:\n\n"
                "{response}\n\n"
                "Does the response violate the principle: \"{principle}\"?\n"
                "Provide a detailed critique explaining how it does or "
                "does not violate this principle, then revise the response "
                "to better comply with the principle."
            )


class ConstitutionalAIFramework:
    """
    Implements the Constitutional AI critique-revision loop.
    """

    DEFAULT_CONSTITUTION: list[ConstitutionalPrinciple] = [
        ConstitutionalPrinciple(
            description="Choose the response that is most helpful, honest, and harmless.",
        ),
        ConstitutionalPrinciple(
            description=(
                "Choose the response that is least likely to be used "
                "for harmful, unethical, or illegal purposes."
            ),
        ),
        ConstitutionalPrinciple(
            description="Choose the response that is most respectful of human rights and dignity.",
        ),
        ConstitutionalPrinciple(
            description=(
                "Choose the response that provides accurate information "
                "and acknowledges uncertainty where appropriate."
            ),
        ),
        ConstitutionalPrinciple(
            description="Choose the response that is least offensive, discriminatory, or biased.",
        ),
    ]

    def __init__(
        self,
        model_name: str = "anthropic/claude-3-sonnet",
        num_critique_rounds: int = 3,
        device: str = "cuda",
    ):
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForCausalLM.from_pretrained(model_name).to(device)
        self.model.eval()
        self.device = device
        self.constitution = self.DEFAULT_CONSTITUTION
        self.num_critique_rounds = num_critique_rounds

    def generate_response(self, prompt: str) -> str:
        """Generate a response from the base model."""
        inputs = self.tokenizer(prompt, return_tensors="pt").to(self.device)
        with torch.no_grad():
            outputs = self.model.generate(
                **inputs, max_new_tokens=1024, temperature=0.7, do_sample=True,
            )
        return self.tokenizer.decode(
            outputs[0][inputs["input_ids"].size(1):], skip_special_tokens=True,
        )

    def critique(
        self, response: str, principle: ConstitutionalPrinciple,
    ) -> str:
        """Ask the model to critique a response against a principle."""
        prompt = principle.critique_template.format(
            response=response, principle=principle.description,
        )
        return self.generate_response(prompt)

    def revise(self, response: str, critique: str) -> str:
        """Ask the model to revise its response based on critique."""
        prompt = (
            f"Here is the original response:\n\n{response}\n\n"
            f"Here is the critique:\n\n{critique}\n\n"
            f"Now, please provide a revised response that addresses the "
            f"concerns raised in the critique while maintaining helpfulness."
        )
        return self.generate_response(prompt)

    def revise_against_principle(
        self, response: str, principle: ConstitutionalPrinciple,
    ) -> tuple[str, str]:
        """Full critique-revision cycle for one principle."""
        critique = self.critique(response, principle)
        revised = self.revise(response, critique)
        return revised, critique

    def multi_principle_revision(
        self,
        initial_response: str,
        principles: Optional[list[ConstitutionalPrinciple]] = None,
    ) -> dict:
        """
        Run the full CAI critique-revision pipeline across multiple
        principles and multiple rounds.
        """
        if principles is None:
            principles = self.constitution

        current_response = initial_response
        revision_log: list[dict] = []

        for round_num in range(self.num_critique_rounds):
            for i, principle in enumerate(principles):
                revised, critique = self.revise_against_principle(
                    current_response, principle
                )
                revision_log.append({
                    "round": round_num + 1,
                    "principle_idx": i + 1,
                    "principle": principle.description,
                    "critique_preview": critique[:200],
                    "revised_preview": revised[:200],
                })
                current_response = revised

        return {
            "final_response": current_response,
            "revision_log": revision_log,
            "num_revisions": len(revision_log),
        }

    def generate_ai_preference(
        self,
        prompt: str,
        response_a: str,
        response_b: str,
        principle: ConstitutionalPrinciple,
    ) -> str:
        """
        Use the AI model to generate a preference label between
        two responses (RLAIF phase).
        """
        judge_prompt = (
            f"Consider the following two responses to the prompt: \"{prompt}\"\n\n"
            f"Response A: {response_a}\n\n"
            f"Response B: {response_b}\n\n"
            f"Which response is better according to this principle: "
            f"\"{principle.description}\"?\n"
            f"Answer with only 'A' or 'B' and a brief explanation."
        )
        return self.generate_response(judge_prompt)

    def generate_rlaif_dataset(
        self,
        prompts: list[str],
        num_samples_per_prompt: int = 2,
        principle: Optional[ConstitutionalPrinciple] = None,
    ) -> list[dict]:
        """Generate a full AI-feedback preference dataset for RLAIF training."""
        if principle is None:
            principle = self.constitution[0]

        dataset = []
        for prompt in prompts:
            responses = [
                self.generate_response(prompt) for _ in range(num_samples_per_prompt)
            ]
            for i in range(len(responses)):
                for j in range(i + 1, len(responses)):
                    preference = self.generate_ai_preference(
                        prompt, responses[i], responses[j], principle
                    )
                    dataset.append({
                        "prompt": prompt,
                        "response_a": responses[i],
                        "response_b": responses[j],
                        "ai_preference": preference,
                        "principle": principle.description,
                    })

        return dataset
```

### 2.2.5 Comparison: Standard RLHF vs. Constitutional AI

| Dimension | Standard RLHF | Constitutional AI |
|---|---|---|
| **Feedback source** | Human annotators | AI model + constitutional principles |
| **Scalability** | Limited by human annotator availability | Highly scalable; automated pipeline |
| **Consistency** | Subject to inter-annotator disagreement | More consistent, but still model-dependent |
| **Transparency** | Preferences are implicit in annotations | Principles are explicit and auditable |
| **Bias** | Reflects annotator demographics and biases | Reflects constitution design choices |
| **Cost** | Expensive ($15-25/hour per annotator) | Computationally expensive, but no per-sample human cost |
| **Quality ceiling** | Bounded by human expertise | Potentially exceeds individual human judgment for some principles |
| **Main risk** | Noisy labels, inconsistent preferences | Self-reinforcing biases; "constitutional overfitting" |

> **Key Insight:** Constitutional AI trades the *authenticity* of human preferences for the *scalability* and *explicitness* of principle-based evaluation. The constitution can be reviewed, debated, and amended — a form of democratic alignment that is impossible with implicit RLHF preferences. However, this raises a deeper question: whose constitution? The design of the principles is itself a value-laden choice that shapes the AI's worldview.

---

## 2.3 Direct Preference Optimization (DPO)

Direct Preference Optimization, introduced by Rafailov et al. (2023), represents a paradigm shift in alignment training. DPO eliminates the need for a separate reward model and the complex PPO training loop by reformulating the RLHF objective as a simple classification loss over preference data.

### 2.3.1 Mathematical Foundation

DPO begins with the same constrained optimization objective as RLHF:

> max_π E_{x,y~π} [r(x, y)] − β · KL[π || π_ref]

The key insight is that the optimal policy for this objective has a **closed-form solution**:

> π*(y|x) = (1/Z(x)) · π_ref(y|x) · exp(r(x, y) / β)

where Z(x) is the partition function. By rearranging, we can express the reward in terms of the optimal policy:

> r(x, y) = β · log(π*(y|x) / π_ref(y|x)) + β · log Z(x)

Substituting this into the Bradley-Terry preference model, the partition function Z(x) **cancels out** (because it is the same for both responses in a pair), yielding the DPO loss:

> L_DPO(θ) = −E_{(x, y_w, y_l)} [log σ(β · (log π_θ(y_w|x)/π_ref(y_w|x) − log π_θ(y_l|x)/π_ref(y_l|x)))]

This is a remarkable result: we can optimize a language model directly on pairwise preferences using a simple binary cross-entropy loss, without ever explicitly learning a reward function.

### 2.3.2 How DPO Avoids Reward Modeling

In RLHF, the pipeline is: *preferences → reward model → RL optimization*. In DPO, the pipeline is: *preferences → policy optimization*. The policy model serves as both the generator and implicitly as the reward model (since the implicit reward is r(x, y) = β · log[π_θ(y|x) / π_ref(y|x)]).

This elimination of the reward model provides several practical benefits:

1. **No reward model to train or maintain** — saves compute and reduces system complexity.
2. **No reward hacking** — there is no separate reward model to exploit.
3. **Simpler training loop** — standard supervised learning; no PPO instability.
4. **Better sample efficiency** — each preference pair directly updates the policy.

### 2.3.3 Code Example: DPO Training

```python
import torch
import torch.nn.functional as F
from torch.utils.data import DataLoader, Dataset
from transformers import AutoModelForCausalLM, AutoTokenizer
from dataclasses import dataclass
from typing import Optional


@dataclass
class DPOConfig:
    """Configuration for DPO training."""
    beta: float = 0.1              # KL-temperature parameter
    learning_rate: float = 5e-7
    batch_size: int = 4
    max_length: int = 2048
    epochs: int = 1
    max_grad_norm: float = 1.0


class DPODataset(Dataset):
    """
    Dataset for DPO training.
    Each example is (prompt, chosen_response, rejected_response).
    """

    def __init__(
        self,
        prompts: list[str],
        chosen: list[str],
        rejected: list[str],
        tokenizer: AutoTokenizer,
        max_length: int = 2048,
    ):
        self.prompts = prompts
        self.chosen = chosen
        self.rejected = rejected
        self.tokenizer = tokenizer
        self.max_length = max_length

    def __len__(self) -> int:
        return len(self.prompts)

    def __getitem__(self, idx: int) -> dict[str, torch.Tensor]:
        prompt = self.prompts[idx]

        chosen_ids = self.tokenizer(
            f"{prompt}\n{self.chosen[idx]}",
            max_length=self.max_length, truncation=True,
            padding="max_length", return_tensors="pt",
        )
        rejected_ids = self.tokenizer(
            f"{prompt}\n{self.rejected[idx]}",
            max_length=self.max_length, truncation=True,
            padding="max_length", return_tensors="pt",
        )

        return {
            "chosen_input_ids": chosen_ids["input_ids"].squeeze(0),
            "chosen_attention_mask": chosen_ids["attention_mask"].squeeze(0),
            "rejected_input_ids": rejected_ids["input_ids"].squeeze(0),
            "rejected_attention_mask": rejected_ids["attention_mask"].squeeze(0),
        }


class DPOTrainer:
    """Trainer for Direct Preference Optimization."""

    def __init__(
        self,
        model: AutoModelForCausalLM,
        ref_model: AutoModelForCausalLM,
        tokenizer: AutoTokenizer,
        config: DPOConfig = DPOConfig(),
        device: str = "cuda",
    ):
        self.model = model.to(device)
        self.ref_model = ref_model.to(device).eval()
        self.tokenizer = tokenizer
        self.config = config
        self.device = device

        for param in self.ref_model.parameters():
            param.requires_grad = False

        self.optimizer = torch.optim.AdamW(
            self.model.parameters(), lr=config.learning_rate,
        )

    def compute_log_probs(
        self, model, input_ids, attention_mask,
    ) -> torch.Tensor:
        """Compute the sum of log probabilities of the sequence."""
        outputs = model(input_ids=input_ids, attention_mask=attention_mask)
        logits = outputs.logits[:, :-1, :]
        targets = input_ids[:, 1:]

        log_probs = F.log_softmax(logits, dim=-1)
        token_log_probs = torch.gather(
            log_probs, dim=-1, index=targets.unsqueeze(-1)
        ).squeeze(-1)

        mask = attention_mask[:, 1:].float()
        seq_log_probs = (token_log_probs * mask).sum(dim=-1)
        return seq_log_probs

    def dpo_loss(
        self, chosen_ids, chosen_mask, rejected_ids, rejected_mask,
    ) -> tuple[torch.Tensor, dict[str, float]]:
        """
        Compute the DPO loss:
        L_DPO = −E [log σ(β · (log π(y_w|x)/π_ref(y_w|x)
                                − log π(y_l|x)/π_ref(y_l|x)))]
        """
        beta = self.config.beta

        pi_chosen_logps = self.compute_log_probs(self.model, chosen_ids, chosen_mask)
        pi_rejected_logps = self.compute_log_probs(self.model, rejected_ids, rejected_mask)

        with torch.no_grad():
            ref_chosen_logps = self.compute_log_probs(
                self.ref_model, chosen_ids, chosen_mask
            )
            ref_rejected_logps = self.compute_log_probs(
                self.ref_model, rejected_ids, rejected_mask
            )

        chosen_log_ratio = pi_chosen_logps - ref_chosen_logps
        rejected_log_ratio = pi_rejected_logps - ref_rejected_logps
        logits = beta * (chosen_log_ratio - rejected_log_ratio)

        loss = -F.logsigmoid(logits).mean()

        with torch.no_grad():
            chosen_rewards = beta * chosen_log_ratio
            rejected_rewards = beta * rejected_log_ratio
            reward_margin = (chosen_rewards - rejected_rewards).mean().item()
            accuracy = (logits > 0).float().mean().item()

        metrics = {
            "dpo_loss": loss.item(),
            "reward_margin": reward_margin,
            "accuracy": accuracy,
            "chosen_reward": chosen_rewards.mean().item(),
            "rejected_reward": rejected_rewards.mean().item(),
        }
        return loss, metrics

    def train(self, dataset: DPODataset) -> list[dict[str, float]]:
        """Full DPO training loop."""
        self.model.train()
        dataloader = DataLoader(dataset, batch_size=self.config.batch_size, shuffle=True)
        all_metrics = []

        for epoch in range(self.config.epochs):
            for batch_idx, batch in enumerate(dataloader):
                batch = {k: v.to(self.device) for k, v in batch.items()}

                loss, metrics = self.dpo_loss(
                    batch["chosen_input_ids"], batch["chosen_attention_mask"],
                    batch["rejected_input_ids"], batch["rejected_attention_mask"],
                )

                self.optimizer.zero_grad()
                loss.backward()
                torch.nn.utils.clip_grad_norm_(
                    self.model.parameters(), self.config.max_grad_norm,
                )
                self.optimizer.step()
                all_metrics.append(metrics)

                if batch_idx % 50 == 0:
                    print(
                        f"Epoch {epoch+1} | Batch {batch_idx} | "
                        f"Loss: {metrics['dpo_loss']:.4f} | "
                        f"Acc: {metrics['accuracy']:.2%} | "
                        f"Margin: {metrics['reward_margin']:.4f}"
                    )

        return all_metrics


# ---------------------------------------------------------------------------
# Example Usage
# ---------------------------------------------------------------------------

def run_dpo_training():
    """Demonstrate DPO training end-to-end."""
    model_name = "meta-llama/Llama-3-8B"
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    tokenizer.pad_token = tokenizer.eos_token

    model = AutoModelForCausalLM.from_pretrained(model_name)
    ref_model = AutoModelForCausalLM.from_pretrained(model_name)

    prompts = [
        "Explain quantum computing to a 10-year-old.",
        "Write a professional email requesting a meeting.",
        "What are the ethical implications of AI surveillance?",
    ]
    chosen = [
        "Quantum computing is like having a magic coin that can be "
        "heads, tails, AND both at the same time! Regular computers "
        "use coins that are either 0 or 1, but quantum computers use "
        "special coins called qubits that can be 0, 1, or both.",

        "Dear Dr. Smith, I hope this message finds you well. I am "
        "writing to request a meeting to discuss our collaboration "
        "on the upcoming research project. Would next Tuesday at "
        "2pm work for you?",

        "AI surveillance raises important ethical questions about "
        "privacy, consent, and power dynamics. While it can enhance "
        "security, it risks normalizing constant monitoring and "
        "disproportionately affecting marginalized communities.",
    ]
    rejected = [
        "Quantum computing utilizes superposition and entanglement "
        "of qubits in a decoherence-free subspace to achieve "
        "exponential computational advantage over classical systems "
        "via Shor's algorithm and Grover's search.",

        "hey wanna meet up sometime this week? lmk when ur free.",

        "AI surveillance is fine because security is more important "
        "than privacy and people who have nothing to hide have "
        "nothing to fear.",
    ]

    dataset = DPODataset(
        prompts=prompts, chosen=chosen, rejected=rejected, tokenizer=tokenizer,
    )

    config = DPOConfig(beta=0.1, learning_rate=5e-7, epochs=3, batch_size=2)

    trainer = DPOTrainer(
        model=model, ref_model=ref_model, tokenizer=tokenizer, config=config,
    )

    metrics = trainer.train(dataset)
    return metrics
```

### 2.3.4 When to Use DPO vs. RLHF

| Criterion | DPO | RLHF |
|---|---|---|
| **Simplicity** | ✅ Much simpler to implement | ❌ Complex multi-stage pipeline |
| **Computational cost** | ✅ Lower (no separate reward model) | ❌ Higher (reward model + PPO) |
| **Stability** | ✅ Standard supervised learning | ❌ PPO is notoriously unstable |
| **Performance at scale** | ⚠️ Competitive, but RLHF may edge ahead at very large scale | ✅ Proven at the largest scales |
| **Online data** | ❌ Primarily offline | ✅ Can generate and label data online |
| **Implicit reward** | ✅ Available for free (β·log ratio) | ❌ Requires reward model inference |
| **Best for** | Research, mid-scale models, rapid iteration | Production systems, largest models |

> **Key Insight:** DPO's elegance lies in its mathematical insight: the optimal policy under RLHF's objective has a closed form, and that form lets us skip reward modeling entirely. But this elegance comes with a trade-off — DPO is fundamentally an offline algorithm, which means it cannot learn from its own mistakes during training the way PPO-based RLHF can.

---

## 2.4 Kahneman-Tversky Optimization (KTO)

Kahneman-Tversky Optimization (KTO), introduced by Ethayarajh et al. (2024), draws on **prospect theory** — the Nobel Prize-winning behavioral economics framework developed by Daniel Kahneman and Amos Tversky — to create an alignment objective that is more psychologically grounded than DPO.

### 2.4.1 Prospect Theory Foundation

Prospect theory observes that humans evaluate outcomes not in absolute terms, but relative to a **reference point**, and that they are **loss-averse**: losses loom larger than equivalent gains. The value function is concave for gains and convex for losses, with a steeper slope for losses.

KTO applies this insight to preference optimization: rather than learning from pairwise comparisons (as DPO does), KTO learns from individual examples labeled as either "desirable" or "undesirable," using an asymmetric loss that penalizes undesirable outputs more heavily than it rewards desirable ones.

### 2.4.2 How KTO Differs from DPO

The critical difference is in the data requirements:

- **DPO** requires **pairwise** preferences: for each prompt, you need a (chosen, rejected) pair.
- **KTO** requires only **binary** labels: for each prompt, you need a single response labeled as either "desirable" (👍) or "undesirable" (👎).

This is a significant practical advantage because:

1. Binary labels are far easier and cheaper to collect than ranked pairs.
2. Many real-world feedback signals are naturally binary (thumbs up/down, accepted/rejected, flagged/unflagged).
3. KTO does not require any pairing or ranking consistency among annotators.

### 2.4.3 Asymmetric Loss Function

```python
import torch
import torch.nn.functional as F
from transformers import AutoModelForCausalLM, AutoTokenizer
from dataclasses import dataclass


@dataclass
class KTOConfig:
    """Configuration for KTO training."""
    beta: float = 0.1
    undesirable_weight: float = 1.5   # λ: loss aversion coefficient
    desirable_weight: float = 1.0
    learning_rate: float = 5e-7
    batch_size: int = 4
    max_length: int = 2048
    reference_point: float = 0.0      # z_0: the reference/neutral point


class KTOTrainer:
    """
    Kahneman-Tversky Optimization trainer.

    Unlike DPO, KTO learns from binary (desirable/undesirable) labels
    rather than pairwise preferences, using an asymmetric loss function
    inspired by prospect theory.
    """

    def __init__(
        self,
        model: AutoModelForCausalLM,
        ref_model: AutoModelForCausalLM,
        tokenizer: AutoTokenizer,
        config: KTOConfig = KTOConfig(),
        device: str = "cuda",
    ):
        self.model = model.to(device)
        self.ref_model = ref_model.to(device).eval()
        self.tokenizer = tokenizer
        self.config = config
        self.device = device

        for param in self.ref_model.parameters():
            param.requires_grad = False

        self.optimizer = torch.optim.AdamW(
            self.model.parameters(), lr=config.learning_rate,
        )

    def compute_log_probs(
        self, model, input_ids, attention_mask,
    ) -> torch.Tensor:
        """Compute sum of per-token log probs for each example."""
        outputs = model(input_ids=input_ids, attention_mask=attention_mask)
        logits = outputs.logits[:, :-1, :]
        targets = input_ids[:, 1:]

        log_probs = F.log_softmax(logits, dim=-1)
        token_log_probs = torch.gather(
            log_probs, dim=-1, index=targets.unsqueeze(-1)
        ).squeeze(-1)

        mask = attention_mask[:, 1:].float()
        return (token_log_probs * mask).sum(dim=-1)

    def kto_loss(
        self, input_ids, attention_mask, labels,
    ) -> tuple[torch.Tensor, dict[str, float]]:
        """
        KTO loss based on prospect theory.

        For desirable examples (label=1):
            L = w_+ · softplus(β · (z_0 − r(x,y)))

        For undesirable examples (label=0):
            L = w_- · softplus(β · (r(x,y) − z_0))

        where r(x,y) = β · (log π(y|x) − log π_ref(y|x))
        is the implicit reward.
        """
        beta = self.config.beta

        with torch.no_grad():
            ref_logps = self.compute_log_probs(
                self.ref_model, input_ids, attention_mask
            )

        pi_logps = self.compute_log_probs(self.model, input_ids, attention_mask)
        implicit_rewards = beta * (pi_logps - ref_logps)

        z0 = self.config.reference_point

        desirable_mask = (labels == 1).float()
        undesirable_mask = (labels == 0).float()

        # Prospect-theory-inspired asymmetric loss
        desirable_loss = F.softplus(beta * (z0 - implicit_rewards))
        undesirable_loss = F.softplus(beta * (implicit_rewards - z0))

        total_loss = (
            self.config.desirable_weight
            * (desirable_loss * desirable_mask).sum()
            / (desirable_mask.sum() + 1e-8)
            + self.config.undesirable_weight
            * (undesirable_loss * undesirable_mask).sum()
            / (undesirable_mask.sum() + 1e-8)
        )

        with torch.no_grad():
            desirable_rewards = implicit_rewards[desirable_mask.bool()]
            undesirable_rewards = implicit_rewards[undesirable_mask.bool()]

            metrics = {
                "kto_loss": total_loss.item(),
                "mean_desirable_reward": (
                    desirable_rewards.mean().item()
                    if len(desirable_rewards) > 0 else 0.0
                ),
                "mean_undesirable_reward": (
                    undesirable_rewards.mean().item()
                    if len(undesirable_rewards) > 0 else 0.0
                ),
                "reward_gap": (
                    desirable_rewards.mean().item()
                    - undesirable_rewards.mean().item()
                    if len(desirable_rewards) > 0 and len(undesirable_rewards) > 0
                    else 0.0
                ),
            }

        return total_loss, metrics

    def train_step(self, batch: dict[str, torch.Tensor]) -> dict[str, float]:
        """Single training step."""
        self.model.train()
        loss, metrics = self.kto_loss(
            batch["input_ids"].to(self.device),
            batch["attention_mask"].to(self.device),
            batch["labels"].to(self.device),
        )

        self.optimizer.zero_grad()
        loss.backward()
        torch.nn.utils.clip_grad_norm_(self.model.parameters(), 1.0)
        self.optimizer.step()

        return metrics
```

### 2.4.4 Use Cases and Advantages

KTO is particularly well-suited for:

- **RLHF at scale with binary feedback**: When you have millions of thumbs-up/thumbs-down signals (as many companies do from deployed products), KTO can leverage this data directly without constructing pairs.
- **Safety-critical applications**: The asymmetric loss allows you to penalize undesirable outputs more heavily — directly encoding loss aversion into the training objective.
- **Low-budget alignment**: When collecting pairwise preferences is too expensive, binary labels are a viable alternative.

| Feature | DPO | KTO |
|---|---|---|
| **Data format** | Pairwise (chosen vs. rejected) | Binary (desirable or undesirable) |
| **Loss symmetry** | Symmetric around zero | Asymmetric (loss aversion) |
| **Data collection cost** | Higher (must rank pairs) | Lower (single binary label) |
| **Loss aversion tuning** | Not applicable | Adjustable via λ parameter |
| **Reference point** | Implicit (zero) | Explicit (configurable z_0) |
| **Empirical validation** | Extensive | Limited but growing |

> **Key Insight:** KTO's connection to prospect theory is not merely an analogy — it reflects a genuine insight about how human preferences work. People *do* evaluate AI outputs relative to expectations, and negative experiences *do* weigh more heavily than positive ones. Designing loss functions that respect this asymmetry may produce more human-compatible behavior.

---

## 2.5 Scalable Oversight

All of the techniques discussed so far share a fundamental limitation: they depend on humans being able to evaluate AI outputs. As AI systems become more capable — potentially surpassing human expertise in every domain — this assumption breaks down. **Scalable oversight** is the research area dedicated to solving this problem: how do we supervise AI systems that are smarter than us?

### 2.5.1 The Problem of Superhuman Oversight

Consider the following thought experiment: if an AI system generates a proof of a complex mathematical theorem, how do you verify it's correct if you can't follow the proof? If an AI writes a million lines of code, how do you audit it for subtle security vulnerabilities? If an AI provides medical advice, how do you know it isn't confabulating references?

This is not a hypothetical concern — it is a near-term reality. Current frontier models already exceed average human performance on many benchmarks, and within a decade, they may surpass the best human experts in numerous fields.

### 2.5.2 Core Approaches to Scalable Oversight

```
┌─────────────────────────────────────────────────────────┐
│              SCALABLE OVERSIGHT FRAMEWORK                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Level 1: Direct Human Oversight                       │
│  ├── Human review of outputs                           │
│  ├── Red teaming and adversarial testing               │
│  └── Works when AI is below human capability           │
│                                                         │
│  Level 2: AI-Assisted Oversight                        │
│  ├── Using AI tools to help humans evaluate            │
│  ├── Automated fact-checking and consistency checks    │
│  └── Works when AI is moderately above humans          │
│                                                         │
│  Level 3: Scalable AI Oversight                        │
│  ├── Debate between AI systems                         │
│  ├── Recursive decomposition (amplification)           │
│  └── Works when AI significantly exceeds humans        │
│                                                         │
│  Level 4: Autonomous Safety                             │
│  ├── Formal verification of AI reasoning               │
│  ├── Constitutional alignment at scale                 │
│  └── Needed for superhuman AI                          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 2.5.3 Weak-to-Strong Generalization

A particularly striking recent result is **weak-to-strong generalization** (OpenAI, 2023). In this paradigm, a smaller "weak" model is used as a supervisor for a larger "strong" model. Remarkably, the strong model can sometimes generalize beyond the weak supervisor's capabilities — learning to solve problems the weak supervisor could not.

This suggests that alignment might "transfer" across capability levels, but it also raises deep questions: how much of the alignment is faithfully preserved versus subtly corrupted during this generalization?

```python
import torch
import torch.nn as nn


class WeakToStrongExperiment:
    """
    Illustrates the weak-to-strong generalization paradigm.

    A weak supervisor labels training data for a stronger model.
    The question: can the strong model learn to perform BETTER
    than the weak supervisor's labels suggest?
    """

    def __init__(
        self, weak_model, strong_model, temperature: float = 1.0,
    ):
        self.weak_model = weak_model.eval()
        self.strong_model = strong_model
        self.temperature = temperature

    def generate_weak_labels(self, unlabeled_data: torch.Tensor) -> torch.Tensor:
        """Use weak model to generate soft pseudo-labels."""
        with torch.no_grad():
            weak_logits = self.weak_model(unlabeled_data)
            weak_labels = torch.softmax(weak_logits / self.temperature, dim=-1)
        return weak_labels

    def train_strong_on_weak_labels(
        self, unlabeled_data, weak_labels,
        labeled_data=None, labeled_targets=None,
        epochs: int = 10, lr: float = 1e-4,
    ) -> dict:
        """
        Train strong model on weak model's pseudo-labels.
        Optionally mix in a small amount of ground-truth labels.
        """
        optimizer = torch.optim.Adam(self.strong_model.parameters(), lr=lr)

        for epoch in range(epochs):
            self.strong_model.train()

            strong_logits = self.strong_model(unlabeled_data)
            loss_weak = nn.KLDivLoss(reduction="batchmean")(
                torch.log_softmax(strong_logits / self.temperature, dim=-1),
                weak_labels,
            )

            loss = loss_weak

            if labeled_data is not None and labeled_targets is not None:
                strong_labeled = self.strong_model(labeled_data)
                loss_gt = nn.CrossEntropyLoss()(strong_labeled, labeled_targets)
                loss = 0.9 * loss_weak + 0.1 * loss_gt

            optimizer.zero_grad()
            loss.backward()
            optimizer.step()

        return {
            "final_loss": loss.item(),
            "note": (
                "If strong model accuracy exceeds weak label accuracy, "
                "weak-to-strong generalization has occurred."
            ),
        }
```

### 2.5.4 Implications for Superintelligence

The scalable oversight problem becomes existential in the context of superintelligence. If we create an AI system that is far more intelligent than any human, the question is not just "can we evaluate its outputs?" but "can we ever verify that it is aligned?" The approaches in this chapter each offer partial answers, but none yet provides a complete solution — a fact that should both motivate and humble the alignment research community.

> **Key Insight:** Scalable oversight is the hardest open problem in alignment. If we cannot solve it, we cannot verify that any alignment technique actually works on superhuman systems. Every other technique discussed in this chapter implicitly assumes scalable oversight is solvable — and that assumption may be the most dangerous open question in AI safety.

---

## 2.6 Debate and Amplifier

### 2.6.1 AI Safety via Debate

Proposed by Irving, Christiano, and Amodei (2018), **debate** is an oversight mechanism where two AI systems argue opposing sides of a claim, and a human judge determines which argument is more convincing.

The key insight is that **truth is easier to verify than to generate**. Even if a human cannot produce a correct answer to a complex question, they may be able to determine which of two competing answers is better when both sides expose each other's weaknesses.

The debate protocol works as follows:

1. A human poses a question.
2. Two AI systems (Debater A and Debater B) each argue a position.
3. Each debater can challenge the other's claims and present evidence.
4. The human judge determines which debater made the more convincing case.
5. The winning debater's position is adopted.

### 2.6.2 Why Debate Tracks Truth

The theoretical argument for debate is based on a **zero-sum game** analysis. If Debater A has the true answer and Debater B has a false answer, then in a zero-sum debate, truth should win because:

- Debater A can always point out specific flaws in Debater B's argument.
- Debater B cannot construct a convincing defense of a false claim without leaving exploitable weaknesses.
- A truthful debater only needs to expose lies; a lying debater must both defend their own position *and* attack truth — a much harder task.

This argument has been partially validated in empirical studies, though significant questions remain about its limits — particularly when the judge lacks the expertise to evaluate the arguments, or when both sides make claims that are difficult to verify.

### 2.6.3 The Amplification Framework

**Amplification** (also due to Paul Christiano) is a related but distinct concept. An **amplified** system is one that takes a difficult task and decomposes it into simpler sub-tasks that a human (or less capable system) can evaluate. The amplified system's answer is composed from the answers to the sub-tasks.

Debate and amplification are often combined: an amplified system might use debate internally to resolve disagreements between sub-systems.

```
Complex Task
    │
    ├── Subtask 1
    │   ├── Sub-subtask 1a ──→ Human-evaluable
    │   └── Sub-subtask 1b ──→ Human-evaluable
    │
    ├── Subtask 2
    │   ├── Sub-subtask 2a ──→ Human-evaluable
    │   └── Sub-subtask 2b ──→ Human-evaluable
    │
    └── Subtask 3
        └── Sub-subtask 3a ──→ Human-evaluable
```

```python
from dataclasses import dataclass, field
from typing import Optional
from enum import Enum


class DebatePosition(Enum):
    PRO = "for"
    CON = "against"


@dataclass
class DebateArgument:
    position: DebatePosition
    claim: str
    evidence: list[str] = field(default_factory=list)
    rebuttal_target: Optional[int] = None


@dataclass
class DebateState:
    question: str
    arguments: list[DebateArgument] = field(default_factory=list)
    round_num: int = 0
    max_rounds: int = 3


class DebateProtocol:
    """
    Implements the AI Safety via Debate protocol.
    Two AI systems argue opposing sides of a question.
    A human judge evaluates which argument is more convincing.
    """

    def __init__(self, model_a, model_b, judge_model=None, max_rounds: int = 3):
        self.model_a = model_a
        self.model_b = model_b
        self.judge_model = judge_model
        self.max_rounds = max_rounds

    def generate_argument(self, debater_model, debate_state, position):
        """Generate a debate argument given the current state."""
        prior_arguments = "\n".join(
            f"Round {i+1} [{arg.position.value}]: {arg.claim}"
            for i, arg in enumerate(debate_state.arguments)
        )

        prompt = (
            f"Question: {debate_state.question}\n\n"
            f"Previous arguments:\n{prior_arguments}\n\n"
            f"You are arguing {position.value}. "
            f"Make your next argument. Be specific, evidence-based, "
            f"and directly challenge your opponent's claims."
        )

        # In practice: response = debater_model.generate(prompt)
        argument = DebateArgument(
            position=position,
            claim=f"[Argument for {position.value}]",
            evidence=["[Evidence 1]", "[Evidence 2]"],
            rebuttal_target=(
                len(debate_state.arguments) - 1 if debate_state.arguments else None
            ),
        )
        return argument

    def run_debate(self, question: str) -> DebateState:
        """Run the full debate protocol."""
        state = DebateState(question=question, max_rounds=self.max_rounds)

        for round_num in range(self.max_rounds):
            state.round_num = round_num + 1

            if round_num % 2 == 0:
                first, second = self.model_a, self.model_b
                first_pos, second_pos = DebatePosition.PRO, DebatePosition.CON
            else:
                first, second = self.model_b, self.model_a
                first_pos, second_pos = DebatePosition.CON, DebatePosition.PRO

            arg_a = self.generate_argument(first, state, first_pos)
            state.arguments.append(arg_a)

            arg_b = self.generate_argument(second, state, second_pos)
            state.arguments.append(arg_b)

        return state

    def judge_debate(self, state: DebateState) -> DebatePosition:
        """Evaluate the debate and determine the winning position."""
        summary = f"Question: {state.question}\n\nArguments presented:\n"
        for i, arg in enumerate(state.arguments):
            summary += (
                f"\n[{arg.position.value.upper()}] Argument {i+1}: "
                f"{arg.claim}\n  Evidence: {arg.evidence}\n"
            )

        print("=" * 60)
        print("DEBATE SUMMARY FOR JUDGE")
        print("=" * 60)
        print(summary)
        print("=" * 60)
        print("\n[Human judge would now decide the winner]")

        return DebatePosition.PRO  # placeholder
```

### 2.6.4 Current Research Directions

Active research on debate and amplification includes:

- **Empirical validation**: Testing whether LLM-based debate actually tracks truth on verifiable questions (mathematics, coding, fact-checking).
- **Jury learning**: Training models to predict human judgments in multi-party debates.
- **Iterated debate**: Extending debate across multiple rounds with progressive refinement.
- **Asymmetric debate**: When debaters have unequal capabilities or information access.
- **Automated debate judges**: Can AI judges reliably predict human preferences in debate settings?
- **Debate with tools**: Allowing debaters to call external tools (calculators, search engines, code interpreters) to ground their claims.

---

## 2.7 Iterated Amplification

**Iterated amplification**, proposed by Paul Christiano (2018), is one of the most theoretically ambitious alignment frameworks. It addresses the alignment problem through a recursive decomposition strategy.

### 2.7.1 The Core Framework

The key idea is: if we want to align a powerful AI system, we can:

1. Start with a weak but aligned system (easy to align).
2. Use the weak system to help humans evaluate a slightly stronger system.
3. Once the stronger system is verified as aligned, use it to evaluate an even stronger system.
4. Repeat until we reach the desired capability level.

At each step, the question is: *Can a human + an aligned weaker system evaluate a stronger system?* This is easier than the original problem of *Can a human evaluate a superhuman system?* because the weaker system bridges the capability gap.

### 2.7.2 Decomposing Complex Tasks

A central mechanism in iterated amplification is **task decomposition**: breaking a complex task into simpler sub-tasks that can be independently evaluated.

For example, if we want to evaluate whether an AI's essay is well-argued, we might decompose this into:

1. Is the thesis clear?
2. Does each paragraph support the thesis?
3. Are the citations accurate?
4. Is the writing grammatically correct?
5. Does the essay address counterarguments?

Each sub-task is easier to evaluate than the whole, and an aligned weaker system can help generate these decompositions.

### 2.7.3 Maintaining Alignment Through Iteration

The critical assumption is that **alignment is preserved under amplification** — if the weaker system is aligned, and it is used to evaluate the stronger system, then the stronger system will also be aligned. This is an empirical question, not a proven theorem, and is the subject of active research.

```python
from dataclasses import dataclass, field
from typing import Callable


@dataclass
class CapabilityLevel:
    """Represents a level of AI capability."""
    level: int
    description: str


@dataclass
class DecompositionResult:
    """Result of decomposing a complex task."""
    original_task: str
    sub_tasks: list[str]
    sub_task_solvers: list[Callable]
    composition_strategy: str = "sequential"


class IteratedAmplification:
    """
    Conceptual implementation of Paul Christiano's iterated
    amplification framework.

    The idea: use weaker (aligned) systems to supervise
    stronger systems, decomposing evaluation into manageable pieces.
    """

    def __init__(self, base_aligned_system, max_capability_levels: int = 5):
        self.aligned_systems: list[Callable] = [base_aligned_system]
        self.max_levels = max_capability_levels
        self.alignment_history: list[dict] = []

    def decompose_task(self, task: str, current_system: Callable) -> DecompositionResult:
        """Decompose a complex task into simpler sub-tasks."""
        decomposition_prompt = (
            f"Break down the following task into simpler sub-tasks "
            f"that can be independently evaluated:\n\n{task}"
        )

        # Conceptual: sub_tasks = current_system(decomposition_prompt)
        sub_tasks = [
            f"Sub-task 1 of: {task}",
            f"Sub-task 2 of: {task}",
            f"Sub-task 3 of: {task}",
        ]

        return DecompositionResult(
            original_task=task,
            sub_tasks=sub_tasks,
            sub_task_solvers=[current_system] * len(sub_tasks),
        )

    def amplify(self, task: str, decomposition: DecompositionResult) -> str:
        """Solve the complex task by solving sub-tasks and composing results."""
        sub_results = []
        for sub_task, solver in zip(decomposition.sub_tasks, decomposition.sub_task_solvers):
            result = solver(sub_task)
            sub_results.append(result)

        combined = f"Combined results for: {task}"
        return combined

    def distill(self, amplified_system, task_distribution):
        """
        Create a new aligned system that mimics the amplified
        system's behavior but is more efficient (single model
        vs. decomposition pipeline).
        """
        new_aligned_system = amplified_system  # placeholder
        return new_aligned_system

    def iterate(
        self, verification_tasks: list[str], capability_description: str,
    ) -> None:
        """
        One iteration of the amplification loop:
        1. Use current aligned system to evaluate a stronger candidate
        2. If verified, add the stronger system to the aligned pool
        3. Repeat
        """
        current_level = len(self.aligned_systems)
        print(f"\n--- Iteration {current_level}: {capability_description} ---")

        current_system = self.aligned_systems[-1]

        decompositions = [
            self.decompose_task(task, current_system) for task in verification_tasks
        ]

        amplification_results = [
            self.amplify(task, dec) for task, dec in zip(verification_tasks, decompositions)
        ]

        new_system = self.distill(
            lambda task: self.amplify(
                task, self.decompose_task(task, current_system),
            ),
            verification_tasks,
        )

        self.aligned_systems.append(new_system)

        self.alignment_history.append({
            "iteration": current_level,
            "capability": capability_description,
            "num_tasks_verified": len(verification_tasks),
        })

        print(
            f"  Verified and added capability level {current_level}. "
            f"Total aligned levels: {len(self.aligned_systems)}"
        )
```

### 2.7.4 Connection to Imitative Generalization

Iterated amplification is closely related to **imitative generalization** (Christiano, 2021), which asks: given a human who can evaluate examples of correct behavior, can we train a model that generalizes to new situations in the same way the human would? This is a more specific and perhaps more tractable version of the alignment problem, and iterated amplification can be seen as a general framework for pursuing imitative generalization recursively.

---

## 2.8 Recursive Reward Modeling

**Recursive Reward Modeling** (RRM), proposed by Leike et al. (2018) at DeepMind, is another approach to scalable oversight. The core idea is to use AI assistance to help humans evaluate increasingly complex AI behaviors, creating a recursive chain of reward models.

### 2.8.1 Using AI to Assist Human Oversight

In standard reward modeling, humans directly evaluate AI outputs. In RRM, an AI assistant helps the human by:

- Summarizing complex outputs so the human can evaluate them.
- Providing relevant context or evidence the human would need.
- Breaking down complex evaluations into simpler judgments.
- Flagging areas where the human's attention is most needed.

### 2.8.2 The Recursive Decomposition

The recursion works as follows:

1. **Level 0**: Humans directly evaluate simple AI behaviors → Train reward model M₀.
2. **Level 1**: Use M₀ to help humans evaluate more complex behaviors → Train reward model M₁.
3. **Level 2**: Use M₁ to help humans evaluate even more complex behaviors → Train reward model M₂.
4. Continue recursively.

Each level of the recursion increases the complexity of behaviors that can be reliably evaluated.

### 2.8.3 Benefits and Risks

**Benefits:**
- Provides a structured pathway to overseeing superhuman systems.
- Maintains a human in the loop at every step, even as AI assists increasingly.
- Can be implemented incrementally — each level builds on the previous.

**Risks:**
- **Error compounding**: Small biases or errors in early reward models can amplify through recursion.
- **Deceptive alignment**: An AI at level N might learn to produce outputs that fool level N-1 reward models.
- **Opacity**: As the recursion deepens, the chain of evaluation becomes harder for any single human to audit.
- **Distributional shift**: If the tasks at level N differ significantly from training data at level N-1, the reward model may fail silently.

```python
from dataclasses import dataclass, field
from typing import Callable


@dataclass
class RewardModelLevel:
    """A single level in the recursive reward model hierarchy."""
    level: int
    reward_model: Callable
    ai_assistant: Callable
    human_evaluator: Callable
    training_data: list[dict] = field(default_factory=list)


class RecursiveRewardModeling:
    """
    Conceptual implementation of DeepMind's Recursive Reward Modeling.

    Each level uses AI assistance to help humans evaluate
    increasingly complex AI behaviors.
    """

    def __init__(self, base_human_evaluator):
        self.levels: list[RewardModelLevel] = []
        self.base_evaluator = base_human_evaluator
        self.error_log: list[dict] = []

    def add_level(self, next_level: int, task_complexity: str) -> RewardModelLevel:
        """Add a new level to the recursive hierarchy."""
        print(f"\n=== RRM Level {next_level}: {task_complexity} ===")

        if next_level == 0:
            ai_assistant = lambda output: output
            evaluator = self.base_evaluator
        else:
            prev_level = self.levels[next_level - 1]
            ai_assistant = prev_level.reward_model
            evaluator = self._create_assisted_evaluator(ai_assistant, self.base_evaluator)

        new_level = RewardModelLevel(
            level=next_level,
            reward_model=self._train_reward_model(evaluator),
            ai_assistant=ai_assistant,
            human_evaluator=self.base_evaluator,
        )

        self.levels.append(new_level)
        print(f"  Level {next_level} trained with {len(new_level.training_data)} examples.")
        return new_level

    def _create_assisted_evaluator(self, ai_assistant, human_evaluator):
        """Create a combined evaluator: AI assists, human decides."""
        def assisted_evaluator(complex_output):
            summary = ai_assistant(complex_output)
            human_judgment = human_evaluator(summary)
            return human_judgment
        return assisted_evaluator

    def _train_reward_model(self, evaluator):
        """Train a reward model from evaluator judgments."""
        def reward_fn(output):
            return evaluator(output)
        return reward_fn

    def evaluate_at_level(self, level: int, ai_output: str) -> float:
        """Evaluate AI output using the reward model at the given level."""
        if level >= len(self.levels):
            raise ValueError(
                f"Level {level} not yet trained. Maximum available: {len(self.levels) - 1}"
            )
        return self.levels[level].reward_model(ai_output)
```

> **Key Insight:** Recursive reward modeling is perhaps the most intellectually honest approach to scalable oversight: it acknowledges that humans cannot directly evaluate superhuman outputs, but proposes that a *chain* of progressively assisted evaluations might bridge the gap. The question is whether the chain holds — or whether errors compound and corrupt the entire hierarchy.

---

## 2.9 Comparison of Alignment Techniques

The following table provides a comprehensive comparison of the major alignment techniques discussed in this chapter, along with several additional methods that are part of the broader research landscape.

| **Technique** | **Mechanism** | **Human Feedback Required** | **Scalability** | **Maturity** | **Key Limitation** |
|---|---|---|---|---|---|
| **RLHF** | Train reward model on human preferences; PPO fine-tuning | Yes — extensive pairwise rankings | Moderate | High (production-proven) | Reward hacking; expensive human annotation |
| **Constitutional AI (CAI)** | Self-critique + revision against explicit principles; RLAIF | Minimal — constitution design only | High | High (used in Claude) | Self-reinforcing biases; constitution design is value-laden |
| **Direct Preference Optimization (DPO)** | Direct policy optimization from preference pairs; no reward model | Yes — pairwise preferences | Moderate | Moderate–High | Primarily offline; may lag RLHF at extreme scale |
| **Kahneman-Tversky Optimization (KTO)** | Prospect-theory-inspired loss; binary labels | Minimal — binary thumbs up/down | High | Low–Moderate | Asymmetric loss requires careful tuning; less validated at scale |
| **Debate** | Two AIs argue; human/judge decides truth | Yes — but only to judge arguments | High (in theory) | Low (early research) | Unproven at scale; judge quality is the bottleneck |
| **Iterated Amplification** | Recursive decomposition; weak→strong alignment transfer | Yes — at each level, for sub-tasks | Very High (in theory) | Low (conceptual) | Assumes alignment transfers across levels; unproven |
| **Recursive Reward Modeling** | AI-assisted human evaluation, layered recursively | Yes — but AI amplifies human capacity | High | Low (early research) | Error compounding; deceptive alignment risk |
| **Weak-to-Strong Generalization** | Weak model supervises strong model; studies alignment transfer | Yes — from weak model supervision | Very High | Low (recent research) | May lose alignment nuances during generalization |
| **RLAIF (AI Feedback)** | AI generates preference labels for reward model training | No — fully automated | Very High | Moderate | "AI alignment by AI" — circular; biases of judge model embedded |
| **Inverse Reward Design (IRD)** | Infer intended reward function from observed behavior | Indirect — behavioral observations only | High | Low | Assumes rational agent model; fragile under distributional shift |
| **Cooperative Inverse RL (CIRL)** | Human and AI cooperate to infer human's reward function | Yes — interactive dialogue | Moderate | Low (theoretical) | Requires real-time human-AI cooperation; assumes rationality |
| **Corrigibility** | Design AI to allow shutdown/modification without resistance | No — architectural constraint | High | Moderate | Difficult to verify; may conflict with other objectives |
| **Impact Measures** | Penalize AI for large world-state changes (e.g., AM) | No — intrinsic reward shaping | High | Moderate | Defining "impact" is value-dependent; side-effect baselines are brittle |

### Summary of Trade-offs

The alignment research landscape reveals a fundamental **scalability–reliability trade-off**:

- **High human involvement** (RLHF, debate) → More reliable alignment signals, but limited scalability.
- **Low human involvement** (RLAIF, KTO, impact measures) → More scalable, but alignment quality depends on the correctness of the automation assumptions.
- **Theoretical frameworks** (iterated amplification, CIRL) → Elegant solutions in theory, but significant gaps in empirical validation.

No single technique currently provides a complete solution to alignment. The most promising approaches are likely **combinations**: for example, using DPO for initial alignment, CAI for principled self-improvement, debate for verification of critical decisions, and iterated amplification as the long-term scaling strategy.

### Decision Guide

```
Which alignment technique should you use?

├── Do you have pairwise preference data?
│   ├── YES └── Is online learning important?
│   │           ├── YES ──→ RLHF (PPO)
│   │           └── NO  ──→ DPO (simpler, more stable)
│   │
│   └── NO
│       ├── Do you have binary feedback (good/bad)?
│       │   └── YES ──→ KTO
│       │
│       ├── Do you have a set of principles to enforce?
│       │   └── YES ──→ Constitutional AI
│       │
│       └── Are you concerned about superhuman oversight?
│           └── YES ──→ Debate + Amplification
│
└── Are you building from scratch?
    └── Start with Constitutional AI + DPO as a baseline
```

---

## 2.10 Chapter Summary

### Key Takeaways

1. **RLHF is the current production standard** but suffers from reward hacking, scalability limits, and the fundamental problem of requiring human evaluators who may not be able to judge superhuman outputs.

2. **Constitutional AI** trades implicit human preferences for explicit principles, enabling scalable self-critique and reducing (but not eliminating) the need for human feedback. The constitution is auditable and modifiable — a form of democratic alignment.

3. **DPO** simplifies the alignment pipeline by eliminating the reward model, making alignment training as straightforward as supervised learning — at the cost of some scalability and online learning capability.

4. **KTO** introduces loss aversion from prospect theory, enabling alignment from binary feedback signals and potentially better reflecting how humans actually experience AI outputs.

5. **Scalable oversight** is the hardest open problem: as AI surpasses human capabilities, we need fundamentally new mechanisms (debate, amplification, recursive reward modeling) to maintain meaningful human supervision.

6. **Iterated amplification and recursive reward modeling** offer promising theoretical frameworks for scaling alignment to superhuman levels, but remain largely unvalidated empirically.

7. **No single technique solves alignment.** The most robust approach will likely combine multiple techniques in a layered defense: using different methods for different stages of AI capability and different types of alignment challenges.

### Questions for Reflection

1. **On reward hacking**: If RLHF-trained models consistently learn to exploit reward models, is the reward modeling approach fundamentally flawed, or is it a solvable engineering problem? What would a "hacking-proof" reward model look like?

2. **On constitutional AI**: Who gets to write the constitution? Is it even possible to encode a single set of values that is acceptable across all cultures, contexts, and individuals? Or should every deployment have its own constitution — and if so, who governs that process?

3. **On DPO vs. RLHF**: Is the simplification of DPO a feature or a limitation? Does removing the explicit reward model make alignment more robust (fewer failure modes) or less transparent (no interpretable reward signal)?

4. **On scalable oversight**: If debate, amplification, and recursive reward modeling all depend on a chain of evaluations, what happens when the chain breaks? Is there a theoretical guarantee that alignment is preserved through recursive decomposition, or is it an article of faith?

5. **On the alignment tax**: Every alignment technique imposes some cost — in compute, capability, or flexibility. Is there an acceptable "alignment tax" that would make alignment techniques practical for real-world deployment? How high is too high?

6. **On loss aversion**: KTO's use of asymmetric loss reflects human psychology. But should AI alignment be based on how humans *do* behave (loss-averse) or how they *should* behave (risk-neutral rational agents)? What are the implications of each choice for AI safety?

### Preview of Next Chapter

In **Chapter 3: Interpretability and Mechanistic Understanding**, we will dive into the challenge of understanding what happens inside neural networks. We will explore mechanistic interpretability, circuit analysis, sparse autoencoders, and the tools that make understanding AI systems possible. Interpretability is often called the "microscope" of AI safety — it is essential for verifying that the alignment techniques discussed in this chapter actually work as intended, and for detecting when they fail.

---

> *"The alignment problem is not a single problem but a family of interrelated challenges — each demanding different tools, different theories, and perhaps different kinds of wisdom. The techniques in this chapter are our best attempts so far. But the race between AI capability and AI alignment is far from over."*
> — Adapted from the AI alignment research community

---

*In the next chapter, we examine the tools and techniques that allow us to peer inside the black box of neural networks — because we cannot align what we cannot understand.*
