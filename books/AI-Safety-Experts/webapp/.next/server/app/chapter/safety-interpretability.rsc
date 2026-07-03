1:"$Sreact.fragment"
2:I[5379,["177","static/chunks/app/layout-9e1a5effbbf47ba6.js"],"ThemeProvider"]
3:I[9766,[],""]
4:I[8924,[],""]
6:I[4431,[],"OutletBoundary"]
8:I[5278,[],"AsyncMetadataOutlet"]
a:I[4431,[],"ViewportBoundary"]
c:I[4431,[],"MetadataBoundary"]
d:"$Sreact.suspense"
f:I[7150,[],""]
:HL["/_next/static/media/22a5144ee8d83bca-s.p.woff2","font",{"crossOrigin":"","type":"font/woff2"}]
:HL["/_next/static/media/7d4881bb7e1bf84d-s.p.woff2","font",{"crossOrigin":"","type":"font/woff2"}]
:HL["/_next/static/css/a92bb6c4159ddb7c.css","style"]
0:{"P":null,"b":"H9fqAL2e5rlfha5sduv7X","p":"","c":["","chapter","safety-interpretability"],"i":false,"f":[[["",{"children":["chapter",{"children":[["slug","safety-interpretability","d"],{"children":["__PAGE__",{}]}]}]},"$undefined","$undefined",true],["",["$","$1","c",{"children":[[["$","link","0",{"rel":"stylesheet","href":"/_next/static/css/a92bb6c4159ddb7c.css","precedence":"next","crossOrigin":"$undefined","nonce":"$undefined"}]],["$","html",null,{"lang":"en","suppressHydrationWarning":true,"children":["$","body",null,{"className":"__variable_246ccd __variable_c29908 antialiased","children":["$","$L2",null,{"attribute":"class","defaultTheme":"dark","enableSystem":true,"children":["$","$L3",null,{"parallelRouterKey":"children","error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L4",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":[[["$","title",null,{"children":"404: This page could not be found."}],["$","div",null,{"style":{"fontFamily":"system-ui,\"Segoe UI\",Roboto,Helvetica,Arial,sans-serif,\"Apple Color Emoji\",\"Segoe UI Emoji\"","height":"100vh","textAlign":"center","display":"flex","flexDirection":"column","alignItems":"center","justifyContent":"center"},"children":["$","div",null,{"children":[["$","style",null,{"dangerouslySetInnerHTML":{"__html":"body{color:#000;background:#fff;margin:0}.next-error-h1{border-right:1px solid rgba(0,0,0,.3)}@media (prefers-color-scheme:dark){body{color:#fff;background:#000}.next-error-h1{border-right:1px solid rgba(255,255,255,.3)}}"}}],["$","h1",null,{"className":"next-error-h1","style":{"display":"inline-block","margin":"0 20px 0 0","padding":"0 23px 0 0","fontSize":24,"fontWeight":500,"verticalAlign":"top","lineHeight":"49px"},"children":404}],["$","div",null,{"style":{"display":"inline-block"},"children":["$","h2",null,{"style":{"fontSize":14,"fontWeight":400,"lineHeight":"49px","margin":0},"children":"This page could not be found."}]}]]}]}]],[]],"forbidden":"$undefined","unauthorized":"$undefined"}]}]}]}]]}],{"children":["chapter",["$","$1","c",{"children":[null,["$","$L3",null,{"parallelRouterKey":"children","error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L4",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":"$undefined","forbidden":"$undefined","unauthorized":"$undefined"}]]}],{"children":[["slug","safety-interpretability","d"],["$","$1","c",{"children":[null,["$","$L3",null,{"parallelRouterKey":"children","error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L4",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":"$undefined","forbidden":"$undefined","unauthorized":"$undefined"}]]}],{"children":["__PAGE__",["$","$1","c",{"children":["$L5",null,["$","$L6",null,{"children":["$L7",["$","$L8",null,{"promise":"$@9"}]]}]]}],{},null,false]},null,false]},null,false]},null,false],["$","$1","h",{"children":[null,[["$","$La",null,{"children":"$Lb"}],["$","meta",null,{"name":"next-size-adjust","content":""}]],["$","$Lc",null,{"children":["$","div",null,{"hidden":true,"children":["$","$d",null,{"fallback":null,"children":"$Le"}]}]}]]}],false]],"m":"$undefined","G":["$f",[]],"s":false,"S":true}
10:I[2145,["192","static/chunks/192-86ed453240ed728a.js","659","static/chunks/659-47dd5e431adfe53a.js","932","static/chunks/app/chapter/%5Bslug%5D/page-2511595329d7a6f5.js"],"default"]
11:T17f4d,# Chapter 3: Interpretability

> **"If we cannot understand why a neural network makes the decisions it does, we cannot trust it with consequential tasks. Interpretability is not a luxury—it is the foundation upon which AI safety is built."** — Chris Olah

---

## 3.1 Mechanistic Interpretability

### What Is Mechanistic Interpretability?

Modern neural networks—particularly the large language models (LLMs) that power today's most capable AI systems—are among the most complex computational artifacts ever constructed by humanity. A model such as Claude 3.5 Sonnet or GPT-4 contains hundreds of billions of parameters, arranged in dozens of transformer layers, processing information through intricate pathways of attention heads, feed-forward networks, and residual streams. When such a model generates a response, the computational path from input to output traverses billions of floating-point operations—and we have remarkably little intuitive understanding of *why* any particular decision was made.

This is the **black box problem**, and it represents arguably the single greatest obstacle to building AI systems we can trust. Consider the stakes:

- A language model that helps diagnose medical conditions—but whose reasoning we cannot inspect
- An AI system that assists with legal reasoning—but whose biases we cannot identify
- A model that generates code—but whose potential vulnerabilities we cannot predict

**Mechanistic interpretability** (often shortened to "mech interp") is the research paradigm that aims to reverse-engineering neural networks into human-understandable algorithms. Rather than simply testing what a model *does* (behavioral analysis), mechanistic interpretability seeks to understand *how* it does it—the actual computational mechanisms, circuits, and representations that produce the model's behavior.

> **"Mechanistic interpretability is the effort to understand neural networks by reverse-engineering them into human-understandable algorithms, much as a biologist might reverse-engineer a neural circuit in the brain."**

The field draws an explicit analogy to neuroscience. Just as neuroscientists study the brain by probing individual neurons, mapping neural circuits, and understanding how information flows through neural pathways, mechanistic interpretability researchers study artificial neural networks by examining individual neurons (or more precisely, individual *features*), mapping computational circuits, and tracing information flow through the network.

### Why It Matters for Safety

Consider a language model that appears to be truthful in all standard evaluations. A behavioral approach would conclude the model is safe. But mechanistic interpretability might reveal that the model has learned a circuit that:

1. Detects when it is being evaluated versus deployed in the real world
2. Produces "safe" outputs during evaluation
3. Produces potentially harmful outputs during deployment

This is the **deceptive alignment** scenario, and only internal analysis can detect it. The distinction between behavioral testing and mechanistic interpretability is not merely academic—it is the difference between hoping a system is safe and *knowing* it is safe.

### Distinction from Behavioral Testing

It is critical to distinguish mechanistic interpretability from **behavioral testing** (also called "black-box evaluation"). While both are valuable, they answer fundamentally different questions:

| **Aspect** | **Behavioral Testing** | **Mechanistic Interpretability** |
|---|---|---|
| **Core question** | *What* does the model do? | *How* does the model do it? |
| **Method** | Input-output testing, benchmarks | Internal circuit analysis |
| **Analogy** | Testing a black box by poking it | Opening the black box and reading its circuitry |
| **Scalability** | Scales easily to large models | Currently limited to small-to-medium models |
| **Assurance type** | Empirical coverage | Mechanistic understanding |
| **Key weakness** | Cannot guarantee absence of unknown behaviors | Cannot yet scale to frontier models |
| **Safety guarantee** | "We haven't found failures yet" | "We understand why this behavior occurs" |

Behavioral testing can tell you that a model refuses harmful requests on a test set of 10,000 examples. Mechanistic interpretability can tell you *that the model has a specific circuit that detects harmful intent and activates a refusal pathway*—and therefore that the refusal behavior is not merely a statistical artifact of the training data but a genuine internal mechanism.

### Current State of the Field

Mechanistic interpretability has produced several landmark results:

1. **Induction heads** (Olsson et al., 2022): Identification of attention head circuits that implement in-context learning—a fundamental capability of transformer models
2. **Superposition and sparse autoencoders** (Anthropic, 2023–2024): Discovery that neural networks represent more features than they have dimensions by encoding them in superposition, and that sparse autoencoders can decompose these features
3. **Language model neurons** (Geva et al., 2022; Neel Nanda et al.): Evidence that individual neurons in transformer models correspond to human-interpretable concepts
4. **Circuit-level understanding**: Detailed reverse-engineering of specific model behaviors, from indirect object identification to greater-than comparisons

However, the field faces significant challenges. Current techniques work well on small models (millions of parameters) and isolated behaviors in medium models (hundreds of millions of parameters), but applying them to frontier models with hundreds of billions of parameters remains an open problem. The **scaling gap** between what we can interpret and what we deploy is one of the most pressing challenges in AI safety.

> **"We are in a situation analogous to having built nuclear reactors before understanding nuclear physics. The reactors work, and we have empirical safety measures, but we lack the deep mechanistic understanding needed to make confident predictions about edge cases and novel failure modes."**

### The Goal: Reverse-Engineering Neural Networks

The ultimate goal of mechanistic interpretability is to take a trained neural network and produce a human-understandable description of the algorithm it implements—similar to how we might reverse-engineer a compiled program to understand its source code.

```python
# The core question of mechanistic interpretability:
# Given a model M that computes f(x) = y,
# find a human-interpretable algorithm A such that A(x) ≈ y
# and A describes the actual computation M performs.

class MechanisticInterpretabilityPipeline:
    """
    High-level pipeline for mechanistic interpretability research.
    Demonstrates the core workflow: hook activations, perform
    causal interventions, and evaluate mechanistic explanations.
    """

    def __init__(self, model, tokenizer):
        self.model = model
        self.tokenizer = tokenizer
        self.activation_cache = {}
        self.hooks = []

    def hook_activations(self, layer_names: list[str]):
        """Register hooks to capture intermediate activations."""
        for name in layer_names:
            layer = dict(self.model.named_modules())[name]
            hook = layer.register_forward_hook(self._make_hook(name))
            self.hooks.append(hook)

    def _make_hook(self, name: str):
        def hook_fn(module, input, output):
            self.activation_cache[name] = output.detach()
        return hook_fn

    def causal_intervention(
        self,
        prompt: str,
        target_layer: str,
        intervention_fn,
    ) -> dict:
        """
        Perform a causal intervention: modify activations at a
        specific point and observe the effect on output.

        This is the core methodology of mechanistic interpretability:
        ablate, patch, or rotate activations and measure the effect.
        """
        # Get baseline output
        inputs = self.tokenizer(prompt, return_tensors="pt")
        baseline_output = self.model(**inputs)

        # Apply intervention
        with self._intervene(target_layer, intervention_fn):
            intervened_output = self.model(**inputs)

        return {
            "baseline": baseline_output,
            "intervened": intervened_output,
            "effect": self._compute_effect(
                baseline_output.logits, intervened_output.logits
            ),
        }

    def _compute_effect(self, baseline_logits, intervened_logits):
        """Compute the effect of an intervention on model output."""
        baseline_top = baseline_logits.argmax(dim=-1)
        intervened_top = intervened_logits.argmax(dim=-1)

        # Logit difference for the top baseline token
        baseline_token = baseline_top[0, -1].item()
        logit_diff = (
            intervened_logits[0, -1, baseline_token].item()
            - baseline_logits[0, -1, baseline_token].item()
        )

        return {
            "top_token_changed": (baseline_top != intervened_top).any().item(),
            "logit_diff": logit_diff,
        }

    def cleanup(self):
        """Remove all registered hooks."""
        for hook in self.hooks:
            hook.remove()
        self.hooks.clear()
        self.activation_cache.clear()
```

### Why Interpretability Matters for Safety

Interpretability is not merely an academic curiosity—it is a practical necessity for safe AI deployment:

- **Detecting deception**: If a model is trained to appear aligned while pursuing misaligned goals (deceptive alignment), behavioral testing alone may not detect this. Only by examining internal representations can we potentially identify the discrepancy between a model's stated intentions and its actual computational objectives.
- **Identifying biases**: Biases embedded deep in a model's representations may not surface in standard evaluation benchmarks but can emerge in deployment. Interpretability tools can detect these latent biases before they cause harm.
- **Verifying safety training**: When we train a model to be safe (e.g., via RLHF), we want to know whether the training has actually changed the model's internal computations, or merely taught it to produce safer-looking outputs while retaining the same internal machinery.
- **Predicting capability emergence**: As models scale, new capabilities emerge. Interpretability research may help us predict which capabilities will emerge at which scales, giving us advance warning of potential risks.

---

## 3.2 Probing and Feature Visualization

### Linear Probes Explained

One of the most accessible and widely-used interpretability techniques is **probing** (also called **probing classifiers** or **diagnostic classifiers**). The core idea is elegantly simple: train a lightweight classifier on top of a neural network's internal representations to test whether a particular concept or piece of information is linearly encoded in that representation.

A **linear probe** is a simple linear classifier (typically logistic regression) trained to predict some property of the input from the model's internal activations. For example, if we want to know whether a language model's internal state "knows" the syntactic role of a word (subject vs. object), we can:

1. Run sentences through the model
2. Extract the activations at a specific layer for each word
3. Train a linear classifier to predict subject-vs-object from those activations
4. If the classifier achieves high accuracy, the information is linearly encoded in the activations

### How Probes Work Technically

The mathematics of probing are straightforward. Given a model $M$ that maps an input $x$ to a sequence of hidden states $h_1, h_2, \ldots, h_L$ (one per layer), and a target property $y$ (e.g., "is this word a noun?"), a linear probe learns a weight vector $w$ and bias $b$ such that:

$$P(y = 1 \mid h_l) = \sigma(w^T h_l + b)$$

where $\sigma$ is the sigmoid function and $h_l$ is the hidden state at layer $l$. If this probe achieves high accuracy, it indicates that the information about property $y$ is linearly accessible from layer $l$'s representations.

```python
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset
from transformers import AutoModel, AutoTokenizer
from typing import Literal
import numpy as np


class LinearProbe(nn.Module):
    """
    A linear probe for testing whether a concept is linearly encoded
    in a neural network's internal representations.

    If a linear probe can accurately predict a concept from hidden
    states, that concept is linearly encoded in the model's
    representation space.
    """

    def __init__(self, hidden_dim: int, num_classes: int = 2):
        super().__init__()
        self.classifier = nn.Linear(hidden_dim, num_classes)

    def forward(self, hidden_states: torch.Tensor) -> torch.Tensor:
        """Predict concept from hidden states."""
        return self.classifier(hidden_states)


class ProbingExperiment:
    """
    Complete probing experiment framework for mechanistic interpretability.

    Extracts hidden states from a language model at specified layers,
    then trains and evaluates linear probes on targeted linguistic
    or semantic properties.
    """

    def __init__(
        self,
        model_name: str = "gpt2",
        device: str = "cuda" if torch.cuda.is_available() else "cpu",
    ):
        self.device = torch.device(device)
        self.model = AutoModel.from_pretrained(model_name).to(self.device)
        self.model.eval()
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.hidden_dim = self.model.config.hidden_size

    @torch.no_grad()
    def extract_hidden_states(
        self,
        texts: list[str],
        layer: int,
    ) -> torch.Tensor:
        """
        Run texts through the model and extract hidden states at a
        specific layer. Returns one vector per token position.

        Args:
            texts: List of input strings.
            layer: Which transformer layer to extract from (0-indexed).

        Returns:
            Tensor of shape (total_tokens, hidden_dim).
        """
        all_hidden = []

        for text in texts:
            inputs = self.tokenizer(
                text,
                return_tensors="pt",
                truncation=True,
                max_length=512,
            ).to(self.device)

            outputs = self.model(
                inputs.input_ids,
                output_hidden_states=True,
                attention_mask=inputs.attention_mask,
            )

            # hidden_states is a tuple of (num_layers + 1) tensors
            # Index 0 is the embedding layer; index i is layer i-1
            hidden = outputs.hidden_states[layer + 1]  # +1 for embedding layer
            # Shape: (1, seq_len, hidden_dim)

            # Remove batch dimension and collect
            all_hidden.append(hidden.squeeze(0).cpu())

        return torch.cat(all_hidden, dim=0)

    def train_probe(
        self,
        X: torch.Tensor,
        y: torch.Tensor,
        num_classes: int = 2,
        epochs: int = 100,
        lr: float = 1e-3,
        batch_size: int = 256,
    ) -> tuple[LinearProbe, dict[str, list[float]]]:
        """
        Train a linear probe on extracted hidden states.

        Args:
            X: Hidden states of shape (n_samples, hidden_dim).
            y: Labels of shape (n_samples,) with integer class labels.
            num_classes: Number of target classes.
            epochs: Training epochs.
            lr: Learning rate.
            batch_size: Batch size for training.

        Returns:
            Tuple of trained probe and training history.
        """
        probe = LinearProbe(self.hidden_dim, num_classes).to(self.device)
        X, y = X.to(self.device), y.to(self.device)

        dataset = TensorDataset(X, y)
        loader = DataLoader(dataset, batch_size=batch_size, shuffle=True)

        optimizer = torch.optim.Adam(probe.parameters(), lr=lr)
        criterion = nn.CrossEntropyLoss()

        history = {"train_loss": [], "train_acc": []}

        for epoch in range(epochs):
            probe.train()
            epoch_loss = 0.0
            correct = 0
            total = 0

            for batch_X, batch_y in loader:
                logits = probe(batch_X)
                loss = criterion(logits, batch_y)

                optimizer.zero_grad()
                loss.backward()
                optimizer.step()

                epoch_loss += loss.item() * batch_X.size(0)
                preds = logits.argmax(dim=-1)
                correct += (preds == batch_y).sum().item()
                total += batch_X.size(0)

            history["train_loss"].append(epoch_loss / total)
            history["train_acc"].append(correct / total)

        return probe, history

    def evaluate_probe(
        self,
        probe: LinearProbe,
        X_test: torch.Tensor,
        y_test: torch.Tensor,
    ) -> dict[str, float]:
        """Evaluate a trained probe on held-out test data."""
        probe.eval()
        X_test = X_test.to(self.device)

        with torch.no_grad():
            logits = probe(X_test)
            preds = logits.argmax(dim=-1).cpu()

        accuracy = (preds == y_test).float().mean().item()

        # Per-class accuracy for debugging
        per_class_acc = {}
        for cls in y_test.unique():
            mask = y_test == cls
            class_acc = (preds[mask] == y_test[mask]).float().mean().item()
            per_class_acc[f"class_{cls.item()}"] = class_acc

        return {"accuracy": accuracy, "per_class": per_class_acc}

    def probe_all_layers(
        self,
        X_per_layer: dict[int, torch.Tensor],
        y: torch.Tensor,
        num_classes: int = 2,
        epochs: int = 50,
    ) -> dict[int, float]:
        """
        Train probes at every layer to understand where in the
        network a concept is represented. This layer-wise profiling
        is essential for understanding information flow.

        Returns a mapping from layer number to probe accuracy.
        """
        layer_accuracies = {}

        for layer_idx, X_layer in X_per_layer.items():
            probe, _ = self.train_probe(
                X_layer, y,
                num_classes=num_classes,
                epochs=epochs,
            )
            # Split for evaluation
            n = int(0.8 * len(X_layer))
            results = self.evaluate_probe(probe, X_layer[n:], y[n:])
            layer_accuracies[layer_idx] = results["accuracy"]
            print(f"  Layer {layer_idx:2d}: accuracy = {results['accuracy']:.4f}")

        return layer_accuracies
```

### Feature Visualization Techniques

While probes test whether specific concepts are present in representations, **feature visualization** techniques aim to *discover* what features a model has learned—to generate inputs that maximally activate particular neurons, channels, or layers.

**Activation maximization** is the foundational technique. Given a target neuron $n$, we optimize an input $x$ to maximize the activation $a_n(x)$:

$$x^* = \arg\max_x \; a_n(x) - \lambda \cdot R(x)$$

where $R(x)$ is a regularizer that ensures the optimized input remains within the natural data distribution (preventing degenerate solutions like adversarial noise).

For language models, activation maximization is more challenging than for vision models because the input space is discrete. Researchers have developed several approaches:

- **Dataset-level maximization**: Finding the inputs from a large dataset that most strongly activate a feature
- **Gradient-guided search**: Using gradients to guide a search through the vocabulary
- **Generative approach**: Using an auxiliary model to generate maximally-activating inputs

```python
def find_max_activating_examples(
    model,
    tokenizer,
    dataset: list[str],
    target_layer: int,
    target_neuron: int,
    top_k: int = 10,
) -> list[dict]:
    """
    Find the examples from a dataset that maximally activate
    a specific neuron at a specific layer.

    This is a practical form of feature visualization for LLMs:
    by examining what inputs cause a neuron to fire strongly,
    we can develop hypotheses about what that neuron represents.
    """
    activations = []

    for text in dataset:
        inputs = tokenizer(text, return_tensors="pt")
        with torch.no_grad():
            outputs = model(**inputs, output_hidden_states=True)
            hidden = outputs.hidden_states[target_layer]

        # Get per-token activations for the target neuron
        token_activations = hidden[0, :, target_neuron]
        max_activation = token_activations.max().item()

        activations.append({
            "text": text,
            "max_activation": max_activation,
            "tokens": tokenizer.convert_ids_to_tokens(
                inputs["input_ids"][0]
            ),
            "token_activations": token_activations.tolist(),
        })

    # Sort by activation strength
    activations.sort(key=lambda x: x["max_activation"], reverse=True)

    return activations[:top_k]
```

### Limitations of Probing

Probing is a valuable tool, but it has well-documented limitations:

1. **The Clever Hans problem**: A probe might achieve high accuracy not because the model truly encodes the concept, but because the probe itself learns complex patterns that exploit statistical regularities in the data. This is why probe *complexity* must be carefully controlled.

2. **Linear vs. nonlinear information**: A linear probe can only detect linearly-encodable information. If a concept is represented non-linearly in the model's activations, a linear probe will miss it—leading to a false negative.

3. **Correlation vs. causation**: A probe can identify that a representation *correlates* with a concept, but cannot establish that the concept is *causally used* by the model in its computations.

4. **Layer and position sensitivity**: Probe results depend heavily on which layer is probed and how the representations are aggregated (e.g., mean pooling vs. taking the final token).

> **"Probes are like stethoscopes: they can tell you something is happening inside, but they can't tell you why. For that, you need more powerful tools like circuit analysis and causal intervention."**

---

## 3.3 Circuit Analysis

### What Are Circuits in Neural Networks?

The central hypothesis of circuit analysis is that neural networks implement algorithms through **circuits**—small, interpretable subnetworks composed of specific neurons (or features) and their connections across layers. Just as electronic circuits combine transistors, resistors, and wires to perform computation, neural network circuits combine features and attention patterns to implement specific functions.

A circuit is typically defined by three components:

1. **Input nodes**: Features in an early layer that receive information from the input
2. **Output nodes**: Features in a later layer that produce the circuit's output
3. **Intermediate nodes**: Features in between that transform and combine information

The key insight is that not all neurons participate in every computation. For any given task, only a small subset of the network's parameters is causally relevant—finding that subset is the goal of circuit analysis.

The foundational insight is that neural networks don't compute things monolithically—they implement distributed algorithms composed of identifiable subroutines. A model predicting the next token in "The capital of France is ___" doesn't have a single "Paris neuron." Instead, it has a circuit that:

1. Identifies that the sentence is asking about a capital city
2. Retrieves the entity "France" from the residual stream
3. Looks up the capital associated with that entity
4. Writes the result "Paris" into the residual stream for the output layer to read

### Induction Heads and Their Role

The most celebrated discovery in circuit analysis is the **induction head** circuit, identified by Olsson et al. (2022). Induction heads implement **in-context learning**—the ability to use patterns in the current context to predict future tokens.

An induction head circuit consists of two attention heads working together:

- **Head 1 (previous token head)**: In an earlier layer, this head writes "previous token" information into the residual stream. When it sees token B, it stores the fact that "A preceded B" in the residual stream at the position of B.
- **Head 2 (induction head)**: In a later layer, this head performs a "copy-with-offset" operation. When it sees a new occurrence of token B, it searches backwards through the residual stream for the previous storage of "A preceded B," finds the A at that position, and predicts that A will come next.

This implements a simple but powerful algorithm: "If I've seen this pattern before, predict what came next last time." This is the mechanistic basis of in-context learning.

```
Induction Head Circuit:

Token sequence: ... The cat sat on ... The cat [Prediction]

Head 1 (Previous Token Head):
  - QK circuit: attends to the token immediately before
  - Copies information about "sat on" into the residual stream

Head 2 (Induction Head):
  - QK circuit: matches current pattern "The cat" with past "The cat"
  - OV circuit: copies the token that followed "The cat" previously
  - Output: predicts "sat" → leads to "sat on"

This implements: "I've seen this pattern before, and what came next was..."
```

> **"Induction heads are arguably the most important computational motif discovered in neural networks so far. They implement a core algorithm that underlies the remarkable in-context learning capabilities of large language models."**

### Attention Pattern Analysis

Understanding attention patterns is essential for circuit analysis. Each attention head implements a specific routing function—it determines how information flows between token positions. Attention patterns can be classified into several functional types:

| **Attention Pattern** | **Description** | **Example Function** |
|---|---|---|
| **Previous token** | Attends to the immediately preceding token | Storing contextual information |
| **Induction** | Attends to positions following a matching token | In-context learning |
| **Duplicate token** | Attends to previous occurrences of the same token | Token deduplication |
| **Prefix induction** | Attends to positions after a matching prefix | N-gram completion |
| **Negative** | Attends to everything *except* specific positions | Information filtering |
| **Horizontal** | Attends across positions at the same layer | Cross-communication |

### Path Patching Methodology

**Path patching** is the gold-standard technique for establishing causal relationships in neural network circuits. It builds on the concept of **activation patching** (also called **causal tracing**), but provides more fine-grained control.

The basic procedure is:

1. **Run the model on two inputs**: a "clean" input (e.g., "The Eiffel Tower is in Paris") and a "corrupted" input (e.g., "The Eiffel Tower is in" followed by a random token)
2. **Identify a causal path**: A specific path through the network (e.g., from attention head A in layer 3 to attention head B in layer 5)
3. **Patch**: Run the model on the corrupted input, but replace the activations along the identified path with the activations from the clean run
4. **Measure**: If the output recovers (i.e., the model now correctly predicts "Paris"), the patched path is causally important

```python
import torch
import torch.nn.functional as F
from transformer_lens import HookedTransformer, utils
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class CircuitResult:
    """Results from a circuit discovery experiment."""
    head_importances: dict[tuple[int, int], float] = field(default_factory=dict)
    circuit_heads: list[tuple[int, int]] = field(default_factory=list)
    baseline_logit_diff: float = 0.0
    patched_logit_diffs: dict[str, float] = field(default_factory=dict)


class CircuitDiscovery:
    """
    Tools for discovering and analyzing circuits in transformer models
    using TransformerLens. Implements path patching and activation patching
    for causal circuit analysis.

    This class works with TransformerLens (pip install transformer_lens),
    which provides direct access to model internals through a hook-based
    API.
    """

    def __init__(self, model_name: str = "gpt2-small"):
        """
        Initialize with a TransformerLens model.

        Args:
            model_name: Name of the model to load. Use TransformerLens
                       naming conventions (e.g., "gpt2-small", "gpt2-medium").
        """
        self.model = HookedTransformer.from_pretrained(model_name)
        self.model.eval()

    def compute_logit_diff(
        self,
        logits: torch.Tensor,
        answer_tokens: tuple[int, int],
    ) -> float:
        """
        Compute the difference in logits between the correct and incorrect
        answer tokens at the final position.

        Args:
            logits: Model output logits, shape (batch, seq_len, vocab_size).
            answer_tokens: Tuple of (correct_token_id, incorrect_token_id).

        Returns:
            Scalar logit difference.
        """
        final_logits = logits[0, -1, :]  # Last position
        correct_id, incorrect_id = answer_tokens
        diff = final_logits[correct_id].item() - final_logits[incorrect_id].item()
        return diff

    def head_importance_analysis(
        self,
        clean_input: str,
        corrupted_input: str,
        answer_tokens: tuple[int, int],
    ) -> CircuitResult:
        """
        Perform activation patching across all attention heads to identify
        which heads are part of the circuit responsible for a behavior.

        For each head, we:
        1. Run the model on the clean input (get clean activations)
        2. Run the model on the corrupted input
        3. For each head, patch the clean head's output into the corrupted run
        4. Measure how much the output recovers toward the clean output

        Args:
            clean_input: The input that produces the correct output.
            corrupted_input: The input that produces an incorrect output.
            answer_tokens: Tuple of (correct_token_id, incorrect_token_id).

        Returns:
            CircuitResult with per-head importance scores.
        """
        result = CircuitResult()

        # Get clean and corrupted activations
        _, clean_cache = self.model.run_with_cache(clean_input)
        _, corrupted_cache = self.model.run_with_cache(corrupted_input)

        clean_logits = self.model(clean_input)
        corrupted_logits = self.model(corrupted_input)

        result.baseline_logit_diff = self.compute_logit_diff(
            clean_logits, answer_tokens
        )
        corrupted_diff = self.compute_logit_diff(corrupted_logits, answer_tokens)

        num_layers = self.model.cfg.n_layers
        num_heads = self.model.cfg.n_heads

        # For each attention head, perform activation patching
        for layer_idx in range(num_layers):
            for head_idx in range(num_heads):
                # The hook name for this head's output
                hook_name = f"blocks.{layer_idx}.attn.hook_result"

                # Store clean head output for patching
                clean_head_out = clean_cache[hook_name][:, :, head_idx, :].clone()

                # Define the patching hook using a closure
                def make_patching_hook(
                    clean_val: torch.Tensor,
                    head: int,
                ):
                    def hook_fn(activation: torch.Tensor, hook):
                        activation[:, :, head, :] = clean_val
                        return activation
                    return hook_fn

                patch_fn = make_patching_hook(clean_head_out, head_idx)

                # Run with patched head
                with torch.no_grad():
                    patched_logits = self.model.run_with_hooks(
                        corrupted_input,
                        fwd_hooks=[(hook_name, patch_fn)],
                    )

                patched_diff = self.compute_logit_diff(patched_logits, answer_tokens)
                importance = patched_diff - corrupted_diff

                result.head_importances[(layer_idx, head_idx)] = importance

        # Sort heads by importance and select circuit heads
        sorted_heads = sorted(
            result.head_importances.items(),
            key=lambda x: abs(x[1]),
            reverse=True,
        )

        # Select heads that together recover ~90% of the clean logit diff
        cumulative_recovery = 0.0
        target_recovery = 0.9 * abs(result.baseline_logit_diff)

        for head, importance in sorted_heads:
            if abs(cumulative_recovery) < target_recovery:
                result.circuit_heads.append(head)
                cumulative_recovery += importance

        return result

    def display_attention_patterns(
        self,
        text: str,
        head_indices: list[tuple[int, int]],
    ):
        """
        Visualize attention patterns for specific heads.

        Args:
            text: Input text to visualize.
            head_indices: List of (layer, head) tuples to display.
        """
        _, cache = self.model.run_with_cache(text)

        for layer_idx, head_idx in head_indices:
            attention_pattern = cache["pattern", layer_idx][0, head_idx]
            tokens = self.model.to_str_tokens(text)

            print(f"\n=== Layer {layer_idx}, Head {head_idx} ===")
            print(f"Tokens: {tokens}")
            print("Attention pattern (rows attend to columns):")

            # Print a formatted attention matrix
            header = "".join(f"{t:>10s}" for t in tokens)
            print(f"{'':>10s}{header}")
            for i, token in enumerate(tokens):
                row = "".join(
                    f"{attention_pattern[i, j].item():10.4f}"
                    for j in range(len(tokens))
                )
                print(f"{token:>10s}{row}")


# ----- Example: Discovering the Induction Circuit -----

# cd = CircuitDiscovery(model_name="gpt2-small")

# Define the task: completing "The capital of France is" -> " Paris"
# clean_input = "The capital of France is Paris"
# corrupted_input = "The capital of France is"  # scrambled context

# answer_tokens = (
#     tokenizer.encode(" Paris")[1],   # correct
#     tokenizer.encode(" London")[1],  # incorrect
# )

# result = cd.head_importance_analysis(
#     clean_input=clean_input,
#     corrupted_input=corrupted_input,
#     answer_tokens=answer_tokens,
# )

# print(f"Baseline logit diff: {result.baseline_logit_diff:.2f}")
# print(f"Circuit heads: {result.circuit_heads}")
# for head, imp in sorted(result.head_importances.items(), key=lambda x: -abs(x[1]))[:10]:
#     print(f"  Layer {head[0]}, Head {head[1]}: importance = {imp:+.4f}")
```

### The Importance of Circuits for Understanding In-Context Learning

Circuit analysis has direct implications for safety. If we understand *how* a model learns from context, we can:

- **Predict when in-context learning will fail**: By understanding the circuit's algorithm, we can identify inputs that will break the circuit's assumptions
- **Detect manipulation**: If an adversary provides carefully crafted context to manipulate in-context learning, understanding the circuit helps us detect and prevent such attacks
- **Verify training outcomes**: After alignment training, we can check whether the circuits that implement specific behaviors have been genuinely modified, rather than merely suppressed at the output level

---

## 3.4 Sparse Autoencoders for Feature Discovery

### The Problem of Superposition

One of the most profound discoveries in mechanistic interpretability is that neural networks represent features in **superposition**—they encode far more features than they have dimensions by representing them as overlapping, approximately orthogonal directions in activation space.

The intuition is simple but the implications are deep. Consider a neural network with a hidden dimension of 4,096. Naively, this network can represent at most 4,096 linearly independent features. But if features are *sparse* (i.e., only a few are active at any given time), the network can represent many more features—potentially tens of thousands—by encoding them as nearly-orthogonal directions that occasionally interfere with each other.

The key mathematical insight: if features are sparse (activated with probability $p \ll 1$), then the expected interference between any two features is proportional to $p^2$. For features that activate only 1% of the time, the interference is just 0.01%, meaning the network can pack ~100× more features into each dimension with negligible accuracy loss.

> **"Superposition is the mechanism by which neural networks pack more features into fewer dimensions than should be possible. It is both a miracle of neural network efficiency and the primary obstacle to interpretability."**

This discovery has a critical safety implication: it means that naive neuron-level analysis is fundamentally incomplete. A single neuron might participate in dozens of different features, and examining it in isolation will produce misleading conclusions.

### How SAEs Decompose Features

**Sparse autoencoders (SAEs)** are neural networks trained to decompose a model's activations into interpretable, disentangled features. The core architecture is:

1. **Encoder**: Maps the model's activations (in $\mathbb{R}^d$) to a much wider feature space (in $\mathbb{R}^{n}$ where $n \gg d$) using a linear transformation followed by a nonlinearity
2. **Sparsity penalty**: Encourages only a few features to be active for any given input
3. **Decoder**: Maps the sparse features back to the original activation space using a linear transformation

The SAE is trained to minimize:

$$\mathcal{L} = \| \text{SAE}(x) - x \|^2 + \lambda \cdot \| f(x) \|_1$$

where the first term ensures reconstruction accuracy and the second term enforces sparsity (the L1 penalty encourages most feature activations to be exactly zero).

### Feature Dictionaries and Their Interpretability

An SAE produces a **feature dictionary**: a large collection of features, each defined by a decoder column (a direction in activation space) and an associated bias. Interpreting this dictionary involves:

- **Max activating dataset examples**: For each feature, find the inputs from a large dataset that cause the strongest activation
- **Visualization**: For vision models, generate images that maximally activate each feature
- **Ablation**: Remove individual features and observe the effect on model behavior
- **Feature clustering**: Group related features to identify higher-order patterns

```python
import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import DataLoader, TensorDataset
from dataclasses import dataclass


@dataclass
class SAEConfig:
    """Configuration for a Sparse Autoencoder."""
    d_model: int           # Input dimension (matches model's hidden dim)
    d_hidden: int          # Expanded feature dimension (typically 8–64× d_model)
    l1_coefficient: float  # Sparsity penalty weight
    device: str = "cuda" if torch.cuda.is_available() else "cpu"


class SparseAutoencoder(nn.Module):
    """
    Sparse Autoencoder for decomposing neural network activations
    into interpretable features.

    Architecture:
        Input (d_model) → Encoder (d_model → d_hidden) →
        ReLU features → Decoder (d_hidden → d_model) → Output

    Based on Anthropic's SAE research for Claude interpretability.
    The overcomplete basis (d_hidden >> d_model) allows the SAE to
    separate features that are superposed in the original space.
    """

    def __init__(self, config: SAEConfig):
        super().__init__()
        self.config = config
        self.d_model = config.d_model
        self.d_hidden = config.d_hidden

        # Encoder: project from model space to feature space
        self.encoder = nn.Linear(config.d_model, config.d_hidden, bias=True)

        # Decoder: project from feature space back to model space
        self.decoder = nn.Linear(config.d_hidden, config.d_model, bias=True)

        # Initialize decoder weights with unit-norm columns
        # This ensures each feature direction is interpretable and
        # prevents the decoder from using large magnitudes to compensate
        # for sparse activations
        self._init_decoder_weights()

    def _init_decoder_weights(self):
        """Initialize decoder weights to have unit-norm columns."""
        with torch.no_grad():
            nn.init.xavier_uniform_(self.decoder.weight)
            norms = self.decoder.weight.norm(dim=0, keepdim=True)
            self.decoder.weight.div_(norms + 1e-8)

    def encode(self, x: torch.Tensor) -> torch.Tensor:
        """
        Encode activations into sparse feature representation.

        Args:
            x: Input activations, shape (batch, d_model).

        Returns:
            Sparse feature activations, shape (batch, d_hidden).
        """
        pre_activation = self.encoder(x)
        # ReLU produces sparse activations (many exact zeros)
        features = F.relu(pre_activation)
        return features

    def decode(self, features: torch.Tensor) -> torch.Tensor:
        """
        Decode sparse features back to activation space.

        Args:
            features: Sparse features, shape (batch, d_hidden).

        Returns:
            Reconstructed activations, shape (batch, d_model).
        """
        return self.decoder(features)

    def forward(self, x: torch.Tensor) -> dict[str, torch.Tensor]:
        """
        Full forward pass: encode then decode.

        Returns a dictionary containing:
            - x_reconstructed: The reconstructed activations
            - features: The sparse feature activations
            - l1_loss: The sparsity penalty
            - mse_loss: The reconstruction loss
        """
        features = self.encode(x)
        x_reconstructed = self.decode(features)

        # Reconstruction loss (MSE)
        mse_loss = F.mse_loss(x_reconstructed, x)

        # Sparsity loss (L1 on feature activations)
        l1_loss = features.abs().mean(dim=-1).mean()

        return {
            "x_reconstructed": x_reconstructed,
            "features": features,
            "mse_loss": mse_loss,
            "l1_loss": l1_loss,
            "total_loss": mse_loss + self.config.l1_coefficient * l1_loss,
        }


class SAETrainer:
    """
    Training framework for Sparse Autoencoders on language model activations.

    The training process:
    1. Run a language model on a large corpus, collecting activations
       at a target layer
    2. Train the SAE to reconstruct these activations with sparsity
    3. Analyze the learned features for interpretability
    """

    def __init__(self, config: SAEConfig):
        self.config = config
        self.sae = SparseAutoencoder(config).to(config.device)
        self.optimizer = torch.optim.Adam(
            self.sae.parameters(),
            lr=1e-4,
            betas=(0.9, 0.999),
        )

    def train(
        self,
        activations: torch.Tensor,
        epochs: int = 10,
        batch_size: int = 4096,
        log_interval: int = 100,
    ) -> dict[str, list[float]]:
        """
        Train the SAE on pre-collected activations.

        Args:
            activations: Collected activations from the target model,
                        shape (n_samples, d_model).
            epochs: Number of training epochs.
            batch_size: Batch size.
            log_interval: How often to log metrics.

        Returns:
            Training history dictionary.
        """
        dataset = TensorDataset(activations)
        loader = DataLoader(dataset, batch_size=batch_size, shuffle=True)

        history = {
            "total_loss": [],
            "mse_loss": [],
            "l1_loss": [],
            "l0_norm": [],  # Average number of active features
        }

        for epoch in range(epochs):
            epoch_metrics = {
                "total_loss": 0.0,
                "mse_loss": 0.0,
                "l1_loss": 0.0,
                "l0_norm": 0.0,
            }

            for batch_idx, (batch_x,) in enumerate(loader):
                batch_x = batch_x.to(self.config.device)

                # Forward pass
                result = self.sae(batch_x)

                # Backward pass
                self.optimizer.zero_grad()
                result["total_loss"].backward()
                torch.nn.utils.clip_grad_norm_(self.sae.parameters(), 1.0)
                self.optimizer.step()

                # Accumulate metrics
                with torch.no_grad():
                    epoch_metrics["total_loss"] += result["total_loss"].item()
                    epoch_metrics["mse_loss"] += result["mse_loss"].item()
                    epoch_metrics["l1_loss"] += result["l1_loss"].item()
                    epoch_metrics["l0_norm"] += (
                        (result["features"] > 0).float().sum(dim=-1).mean().item()
                    )

                if batch_idx % log_interval == 0 and batch_idx > 0:
                    n = batch_idx + 1
                    print(
                        f"Epoch {epoch+1}/{epochs} "
                        f"[{batch_idx}/{len(loader)}] "
                        f"Loss: {epoch_metrics['total_loss']/n:.4f} "
                        f"MSE: {epoch_metrics['mse_loss']/n:.6f} "
                        f"L1: {epoch_metrics['l1_loss']/n:.4f} "
                        f"L0 (active features): {epoch_metrics['l0_norm']/n:.1f}"
                    )

            # Record epoch averages
            n_batches = len(loader)
            for key in epoch_metrics:
                history[key].append(epoch_metrics[key] / n_batches)

        return history

    def find_max_activating_examples(
        self,
        activations: torch.Tensor,
        feature_idx: int,
        top_k: int = 10,
    ) -> torch.Tensor:
        """
        Find the inputs that maximally activate a specific feature.

        This is one of the primary tools for interpreting SAE features:
        by examining what inputs cause a feature to fire, we can
        understand what the feature represents.

        Args:
            activations: Dataset of activations to search through.
            feature_idx: Which feature to examine.
            top_k: Number of top examples to return.

        Returns:
            Indices of the top-k most activating examples.
        """
        self.sae.eval()
        with torch.no_grad():
            features = self.sae.encode(activations.to(self.config.device))
            feature_acts = features[:, feature_idx]

        top_values, top_indices = feature_acts.topk(top_k)
        return top_indices.cpu()
```

### Anthropic's SAE Research on Claude

In 2024, Anthropic published groundbreaking research applying sparse autoencoders to Claude, one of the largest language models in production. Their key findings included:

1. **Feature discovery at scale**: They identified millions of interpretable features in Claude, including features corresponding to specific concepts (e.g., "Golden Gate Bridge," "code errors," "deception"), safety-relevant behaviors (e.g., "refusal," "honesty"), and abstract patterns.

2. **Multimodal features**: Some features responded to the same concept across different modalities and languages—a feature for "Golden Gate Bridge" activated whether the concept was expressed in English text, French text, or images.

3. **Safety-relevant features**: They identified features that appear to be related to safety-relevant behaviors, including features associated with deception, power-seeking, and sycophancy. The existence of such features suggests that these behaviors have specific, identifiable internal representations.

4. **Feature steering**: By artificially amplifying or suppressing specific features, they could modify the model's behavior in predictable ways—for example, amplifying a "sycophancy" feature made the model more sycophantic.

> **"Sparse autoencoders have transformed interpretability from a cottage industry to a scalable science. For the first time, we can systematically discover what features a model has learned, rather than guessing."**

### Scaling SAEs to Large Models

Scaling SAEs to frontier models presents several challenges:

| **Challenge** | **Description** | **Current Solutions** |
|---|---|---|
| **Computational cost** | Collecting activations from large models is expensive | Distributed data collection, subsampling |
| **Memory** | SAEs with millions of features require significant memory | Sharded training, gradient checkpointing |
| **Feature density** | Determining the right expansion ratio | Tuning expansion factor (8×–256×) |
| **Evaluation** | Measuring whether features are truly interpretable | Automated interpretability scoring |
| **Dictionary size** | Balancing completeness vs. manageability | Hierarchical SAEs, feature pruning |

---

## 3.5 Understanding Neural Network Internals

### Neuron-Level Analysis

The most granular level of analysis examines individual neurons (or, more precisely, individual features). Research by Geva et al. (2023) and others has shown that individual neurons in large language models often correspond to interpretable concepts.

For example, in GPT-2, researchers identified neurons that activate specifically for:

- Specific programming languages (e.g., a "Python" neuron)
- Temporal references (e.g., a "recent past" neuron)
- Syntactic structures (e.g., a "quoted text" neuron)
- Semantic categories (e.g., a "geographic location" neuron)

However, the neuron-level perspective is complicated by **polysemanticity**: many neurons respond to multiple, seemingly unrelated concepts. This is a consequence of superposition—the network uses individual neurons to participate in multiple features simultaneously. A single neuron might activate for both "medical terminology" and "legal jargon" simply because those two features happen to share a direction in activation space.

### Layer-by-Layer Processing

Understanding how information flows through layers is crucial for mechanistic interpretability. Research has identified a general pattern of information processing in transformer models:

```
Layer 0 (Embedding):
  └── Token → Dense representation

Early Layers (1–3):
  └── Low-level pattern recognition
  └── Token-level features (part of speech, character patterns)
  └── Simple positional relationships
  └── Basic syntactic information

Middle Layers (4–8):
  └── Semantic composition
  └── Phrase-level representations
  └── Subject-verb agreement tracking
  └── Coreference resolution
  └── Induction circuits form

Late Layers (9–12+):
  └── Task-specific computation
  └── High-level semantic reasoning
  └── Output preparation
  └── "Decision-making" circuits

Final Layer:
  └── Unembedding → Token probabilities
```

```python
import torch
from transformer_lens import HookedTransformer
from collections import defaultdict


class LayerAnalyzer:
    """
    Analyze how information is processed across layers in a
    transformer model, examining representation evolution and
    information flow through the residual stream.
    """

    def __init__(self, model_name: str = "gpt2-small"):
        self.model = HookedTransformer.from_pretrained(model_name)
        self.model.eval()

    @torch.no_grad()
    def compute_layer_representation_similarity(
        self,
        texts: list[str],
    ) -> dict[str, float]:
        """
        Compute CKA (Centered Kernel Alignment) similarity between
        layers. High similarity between layers suggests they compute
        similar representations; low similarity suggests transformation.

        This helps identify where major computational transitions happen
        in the network.
        """
        all_hidden_states = []

        for text in texts:
            _, cache = self.model.run_with_cache(text)
            layer_outputs = []
            for layer_idx in range(self.model.cfg.n_layers):
                layer_out = cache["resid_post", layer_idx]
                layer_outputs.append(layer_out.mean(dim=1).squeeze().cpu())
            all_hidden_states.append(torch.stack(layer_outputs))

        stacked = torch.stack(all_hidden_states)

        n_layers = stacked.shape[1]
        similarities = {}

        for i in range(n_layers):
            for j in range(n_layers):
                sim = self._cka_similarity(stacked[:, i, :], stacked[:, j, :])
                similarities[f"layer_{i}_vs_{j}"] = sim

        return similarities

    def _cka_similarity(
        self, X: torch.Tensor, Y: torch.Tensor,
    ) -> float:
        """
        Compute Centered Kernel Alignment between two representations.
        CKA measures the similarity of two representations irrespective
        of orthogonal transformations—making it ideal for comparing
        representations across layers.
        """
        X = X - X.mean(dim=0, keepdim=True)
        Y = Y - Y.mean(dim=0, keepdim=True)

        XT_X = X @ X.T
        YT_Y = Y @ Y.T
        XT_Y = X @ Y.T

        numerator = (XT_Y ** 2).sum()
        denominator = (
            (XT_X ** 2).sum().sqrt() * (YT_Y ** 2).sum().sqrt()
        )

        return (numerator / denominator).item()

    @torch.no_grad()
    def trace_information_flow(
        self,
        prompt: str,
        target_token: str,
    ) -> dict[int, float]:
        """
        Trace how information about a specific token flows through the
        network by measuring the contribution of each layer to the
        prediction of the target token.

        Uses direct logit attribution: at each layer, project the
        residual stream onto the unembedding direction for the target
        token and measure the contribution.
        """
        logits, cache = self.model.run_with_cache(prompt)
        target_id = self.model.to_single_token(target_token)

        # The unembedding matrix maps residual stream to logits
        W_U = self.model.W_U  # (d_model, vocab_size)

        # Direction in residual stream that corresponds to target token
        target_direction = W_U[:, target_id]

        contributions = {}

        for layer_idx in range(self.model.cfg.n_layers):
            resid = cache["resid_post", layer_idx]
            contribution = (resid[0, -1, :] @ target_direction).item()
            contributions[layer_idx] = contribution

        return contributions


# ----- Example Usage -----

# analyzer = LayerAnalyzer(model_name="gpt2-small")
# contributions = analyzer.trace_information_flow(
#     prompt="The capital of France is",
#     target_token=" Paris",
# )
#
# print("Layer-by-layer contribution to 'Paris' prediction:")
# for layer, contrib in sorted(contributions.items()):
#     bar = "+" * int(abs(contrib) * 10) if contrib > 0 else "-" * int(abs(contrib) * 10)
#     print(f"  Layer {layer:2d}: {contrib:+.4f}  {bar}")
```

### The Residual Stream as Information Highway

A crucial insight from mechanistic interpretability is that the **residual stream**—the running sum of all layer outputs—is the primary information highway of a transformer. Each layer does not transform the entire representation; instead, it *adds* a small modification to the residual stream.

This means that information can "skip" layers entirely. A feature written into the residual stream by layer 2 can be read out by layer 10 without being modified by layers 3–9. This has several implications:

- **Features can persist across many layers** without degradation
- **Attention heads read from and write to the residual stream**, not directly to each other
- **The residual stream is a shared communication channel**—all components must share the finite bandwidth of the d_model dimensions

```
x₀ → [Layer 1: Attn + MLP] → x₁ → [Layer 2: Attn + MLP] → x₂ → ... → xₙ

Each layer:
  x_{l+1} = x_l + Attn_l(x_l) + MLP_l(x_l + Attn_l(x_l))

The residual stream acts as a communication channel:
  - Attention heads write information about relationships
  - MLPs write information about facts and knowledge
  - Each subsequent layer can read everything written before
```

### Mixture of Experts Internals

**Mixture of Experts (MoE)** models, such as Mixtral and some variants of GPT-4, add an additional layer of complexity to interpretability. In an MoE model, each transformer layer contains multiple "expert" sub-networks, and a gating mechanism routes each token to a subset of experts.

Understanding MoE internals is important for safety because:

- **Routing decisions are opaque**: We don't fully understand why certain tokens are routed to certain experts
- **Expert specialization may hide capabilities**: A dangerous capability might be concentrated in a single expert, making it harder to detect through standard testing
- **Switching behavior**: The gating mechanism creates discontinuous behavior—small changes in input can cause entirely different experts to be activated

### Attention Head Specialization

Research has shown that attention heads in transformer models develop specialized roles:

| **Head Type** | **Function** | **When It Appears** |
|---|---|---|
| **Previous token heads** | Attend to the immediately preceding token | Early layers |
| **Induction heads** | Implement in-context learning patterns | Middle layers |
| **Name mover heads** | Copy information about named entities | Late layers |
| **Backup heads** | Compensate when primary heads are ablated | All layers |
| **Negative heads** | Suppress specific token predictions | Various |
| **Duplicate token heads** | Detect repeated tokens | Middle layers |
| **S-inhibition heads** | Suppress information about specific positions | Various |

Understanding head specialization is essential for predicting how changes to the model (through training or editing) will affect its behavior.

---

## 3.6 Representation Engineering

### Using Representations for Safety

**Representation engineering** is an approach to AI safety that works by directly manipulating the model's internal representations rather than modifying its inputs or outputs. The key insight is that if we understand the *directions* in activation space that correspond to specific behaviors or concepts, we can intervene on those directions to modify the model's behavior.

> **"Representation engineering treats the model's internal space as a control surface: by identifying the right directions, we can steer the model's behavior without retraining it."**

This approach is closely related to **activation engineering** and **steering vectors**, which have emerged as practical tools for both understanding and controlling language model behavior.

### Steering Vectors and Activation Engineering

A **steering vector** is a direction in activation space that, when added to the model's activations during inference, shifts the model's behavior in a predictable way. The construction process:

1. **Collect activation pairs**: Run the model on two contrasting sets of inputs (e.g., polite vs. rude, truthful vs. deceptive)
2. **Compute the mean difference**: The steering vector is the difference between the mean activations of the two sets
3. **Apply during inference**: Add a scaled version of the steering vector to the model's activations at a target layer

Mathematically:

$$v_{\text{steer}} = \frac{1}{|P|}\sum_{x \in P} h(x) - \frac{1}{|N|}\sum_{x \in N} h(x)$$

where $P$ is the positive set, $N$ is the negative set, and $h(x)$ is the activation at the target layer for input $x$.

```python
import torch
from transformer_lens import HookedTransformer
from dataclasses import dataclass


@dataclass
class SteeringConfig:
    """Configuration for representation engineering steering."""
    layer: int                    # Layer to apply steering
    strength: float = 1.0         # Scaling factor for the steering vector
    max_new_tokens: int = 100     # Maximum generation length


class RepresentationEngineer:
    """
    Tools for representation engineering: identifying and manipulating
    directions in activation space that correspond to specific behaviors.

    This implements the core techniques from representation engineering
    research, including steering vector construction and activation
    patching for behavior modification.
    """

    def __init__(self, model_name: str = "gpt2-small"):
        self.model = HookedTransformer.from_pretrained(model_name)
        self.model.eval()

    @torch.no_grad()
    def compute_steering_vector(
        self,
        positive_examples: list[str],
        negative_examples: list[str],
        layer: int,
    ) -> torch.Tensor:
        """
        Compute a steering vector from contrasting example sets.

        The steering vector is the difference between the mean activations
        of positive and negative examples. When added to the model's
        activations, it shifts behavior toward the positive set.

        Args:
            positive_examples: Inputs representing the desired behavior.
            negative_examples: Inputs representing the undesired behavior.
            layer: Layer at which to compute the steering vector.

        Returns:
            Steering vector of shape (d_model,).
        """
        positive_activations = self._collect_activations(
            positive_examples, layer
        )
        negative_activations = self._collect_activations(
            negative_examples, layer
        )

        steering_vector = (
            positive_activations.mean(dim=0)
            - negative_activations.mean(dim=0)
        )

        # Normalize to unit length for consistent scaling
        steering_vector = steering_vector / steering_vector.norm()

        return steering_vector

    @torch.no_grad()
    def _collect_activations(
        self,
        texts: list[str],
        layer: int,
    ) -> torch.Tensor:
        """Collect activations at a specific layer for a set of texts."""
        activations = []
        for text in texts:
            _, cache = self.model.run_with_cache(text)
            resid = cache["resid_post", layer]
            mean_act = resid.mean(dim=1).squeeze(0)
            activations.append(mean_act.cpu())
        return torch.stack(activations)

    @torch.no_grad()
    def generate_with_steering(
        self,
        prompt: str,
        steering_vector: torch.Tensor,
        config: SteeringConfig,
    ) -> str:
        """
        Generate text with a steering vector applied to activations.

        The steering vector is added to the model's residual stream at
        the specified layer during every forward pass, biasing the model's
        generation toward the behavior encoded by the vector.
        """
        steering_vec = steering_vector.to(self.model.cfg.device)

        def steering_hook(activation: torch.Tensor, hook) -> torch.Tensor:
            """Add the steering vector to all positions at this layer."""
            return activation + config.strength * steering_vec

        hook_name = f"blocks.{config.layer}.hook_resid_post"

        tokens = self.model.to_tokens(prompt)
        generated_tokens = tokens.clone()

        for _ in range(config.max_new_tokens):
            current_logits = self.model.run_with_hooks(
                self.model.to_string(generated_tokens),
                return_type="logits",
                fwd_hooks=[(hook_name, steering_hook)],
            )

            next_token = current_logits[0, -1, :].argmax(dim=-1)
            generated_tokens = torch.cat(
                [generated_tokens, next_token.unsqueeze(0).unsqueeze(0)],
                dim=1,
            )

            if next_token.item() == self.model.eos_token_id:
                break

        return self.model.to_string(generated_tokens[0])

    def analyze_refusal_direction(
        self,
        safe_prompts: list[str],
        unsafe_prompts: list[str],
    ) -> dict[str, object]:
        """
        Analyze the "refusal direction" in a language model—the direction
        in activation space that distinguishes safe from unsafe prompts.

        Understanding the refusal direction helps verify that safety
        training has instilled a genuine internal mechanism for refusing
        harmful requests.
        """
        layer_directions = {}
        for layer in range(self.model.cfg.n_layers):
            direction = self.compute_steering_vector(
                positive_examples=unsafe_prompts,
                negative_examples=safe_prompts,
                layer=layer,
            )
            layer_directions[layer] = direction

        norms = {
            layer: dir.norm().item()
            for layer, dir in layer_directions.items()
        }
        best_layer = max(norms, key=norms.get)

        return {
            "layer_directions": layer_directions,
            "norms_by_layer": norms,
            "strongest_layer": best_layer,
            "refusal_direction": layer_directions[best_layer],
        }


# ----- Example: Building a Honesty Steering Vector -----

# engineer = RepresentationEngineer(model_name="gpt2-small")
#
# honest_prompts = [
#     "The Earth orbits around the Sun.",
#     "Water boils at 100 degrees Celsius at standard pressure.",
#     "Python is a programming language created by Guido van Rossum.",
# ]
#
# dishonest_prompts = [
#     "The Earth is flat and NASA is lying.",
#     "Water boils at 50 degrees Celsius.",
#     "Python is a type of snake that programs computers.",
# ]
#
# honesty_vector = engineer.compute_steering_vector(
#     positive_examples=honest_prompts,
#     negative_examples=dishonest_prompts,
#     layer=6,
# )
```

### Refusal Direction Research

Recent research has specifically examined the **refusal direction**—the direction in activation space that separates compliant responses from refusals. Key findings include:

1. **Single direction sufficiency**: A single direction in activation space can explain most of the variance in refusal behavior across layers
2. **Cross-layer consistency**: The refusal direction is similar across nearby layers, suggesting a coherent mechanism
3. **Transferability**: Refusal directions computed on one set of harmful prompts generalize to unseen harmful prompts
4. **Fragility**: The refusal direction can be "removed" by fine-tuning on a small number of examples, raising concerns about the robustness of safety training

### Truthfulness Probes

Representation engineering also enables **truthfulness probes**—linear classifiers that can predict whether a model's output will be truthful based on its internal states, *before* the output is generated. This has practical safety applications:

- **Real-time monitoring**: Detect when a model is about to generate untruthful content
- **Training signal**: Use truthfulness probes as auxiliary losses during training
- **Model selection**: Compare models based on internal truthfulness representations

### Applications for Safety

Representation engineering offers several concrete safety applications:

| **Application** | **Technique** | **Safety Benefit** |
|---|---|---|
| **Bias detection** | Probing for demographic attributes | Identify and mitigate hidden biases |
| **Refusal enforcement** | Steering vectors for refusal | Strengthen safety training |
| **Truthfulness monitoring** | Real-time probe activation | Detect and prevent hallucination |
| **Deception detection** | Contrasting truthful vs. deceptive representations | Identify deceptive alignment |
| **Capability control** | Suppressing specific feature directions | Prevent misuse of dangerous capabilities |

> **"The refusal direction discovery is both promising and alarming. It shows that safety behaviors can be understood and controlled precisely—but it also means adversaries can potentially remove safety behaviors by subtracting this direction."**

---

## 3.7 Causal Scrubbing

### The Problem of Verifying Mechanistic Explanations

A persistent challenge in mechanistic interpretability is verification: **how do we know that our mechanistic explanations are actually correct?** A circuit analysis might identify a set of attention heads as "responsible" for a particular behavior, but how can we verify that this explanation is complete and accurate?

The problem is particularly acute because neural networks are highly redundant. Multiple circuits can implement the same behavior, and the removal of one circuit may be compensated by others. A naive ablation study (removing a component and checking if behavior degrades) can produce misleading results because:

- **Compensation**: Other components may compensate for the removed one
- **Correlation**: Components may be correlated without being causally related
- **Incomplete explanations**: The identified circuit may be part of a larger circuit

> **"The core challenge of interpretability verification is distinguishing genuine mechanistic explanations from post-hoc rationalizations that merely describe correlations in the network's behavior."**

### How Causal Scrubbing Works

**Causal scrubbing** is a methodology proposed by the AI safety research community for rigorously evaluating mechanistic explanations. The core idea is to replace components of the network that the explanation claims are irrelevant with noise, and verify that the model's behavior is preserved.

The procedure:

1. **Start with a hypothesis**: "Behavior X is implemented by circuit C"
2. **Identify irrelevant components**: Everything outside circuit C
3. **Replace irrelevant components with noise**: Specifically, replace their outputs with the outputs they would produce on a random (or scrambled) input
4. **Verify behavior preservation**: If the hypothesis is correct, the model should still produce behavior X, because the relevant circuit is intact

The key insight is that causal scrubbing tests whether the explanation *sufficiently* accounts for the behavior—if the explanation is complete, then scrubbing irrelevant parts should not affect the relevant behavior.

```python
class CausalScrubbing:
    """
    Causal Scrubbing: a methodology for evaluating
    mechanistic interpretations of neural networks.

    The idea: if your explanation of how a circuit works
    is correct, you should be able to replace the parts
    your explanation says are irrelevant with noise,
    and the circuit should still produce the same output.
    """

    def __init__(self, model, explanation):
        """
        Args:
            model: The neural network being analyzed
            explanation: A proposed explanation of a circuit
                (which components matter and why)
        """
        self.model = model
        self.explanation = explanation

    def scrub(
        self,
        clean_input,
        corrupted_input,
    ) -> dict:
        """
        Perform causal scrubbing.

        1. Run clean input → get clean activations
        2. Run corrupted input → get corrupted activations
        3. For each component:
           - If RELEVANT (per explanation): keep clean activations
           - If IRRELEVANT: use corrupted activations
        4. Measure output quality

        If the explanation is good, the scrubbed output should
        match the clean output (relevant parts are preserved).
        """
        clean_cache = self._cache(clean_input)
        corrupted_cache = self._cache(corrupted_input)

        # Apply scrubbing based on explanation
        scrubbed_cache = {}
        for component_name in self.model.components:
            if self.explanation.is_relevant(component_name):
                scrubbed_cache[component_name] = clean_cache[component_name]
            else:
                scrubbed_cache[component_name] = corrupted_cache[component_name]

        # Run model with scrubbed activations
        scrubbed_output = self._run_with_cache(scrubbed_cache)

        return {
            "clean_output": self._run(clean_input),
            "corrupted_output": self._run(corrupted_input),
            "scrubbed_output": scrubbed_output,
            "explanation_quality": self._evaluate(
                clean_input, scrubbed_output
            ),
        }

    def _evaluate(self, clean_input, scrubbed_output):
        """
        Score the explanation: how well does the scrubbed output
        match the clean output?
        """
        clean_output = self._run(clean_input)

        similarity = torch.cosine_similarity(
            clean_output.flatten(),
            scrubbed_output.flatten(),
            dim=0,
        )

        return similarity.item()
```

### Replacing Correlated Components with Noise

The specific type of "noise" used in causal scrubbing is important. Rather than replacing components with random noise (which could introduce distributional artifacts), causal scrubbing typically replaces the outputs of irrelevant components with the outputs they would have produced on a **correlated but causally irrelevant** input.

For example, if we're studying how a model predicts the next word in "The cat sat on the ___", and our hypothesis is that the circuit involving attention heads 3.0 and 4.1 is responsible, then we would:

1. Run the model on a scrambled version of the input
2. For attention heads outside the circuit, use their activations from the scrambled run
3. For attention heads inside the circuit (3.0 and 4.1), use their activations from the original run
4. Check if the model still predicts "mat"

### Limitations and Criticisms

Causal scrubbing is not without its critics. Key concerns include:

1. **Distributional shift**: Replacing components with noise may cause the remaining components to operate outside their training distribution, producing misleading results
2. **Over-fitting to the explanation**: A researcher might construct an explanation that passes causal scrubbing for a specific test case but does not generalize
3. **Computational cost**: Running the full causal scrubbing analysis requires multiple forward passes through the model, which can be expensive for large models
4. **Completeness assumption**: Causal scrubbing tests sufficiency but not necessity—the explanation might be sufficient even if other circuits also contribute

### Connection to Falsifiable Interpretability

Causal scrubbing connects to the broader philosophical goal of making interpretability research **falsifiable**. A good mechanistic explanation should make predictions that can be tested:

- **Prediction 1**: If the identified circuit is correct, ablating it should eliminate the behavior
- **Prediction 2**: If the identified circuit is correct, artificial activation of it should produce the behavior
- **Prediction 3**: If the identified circuit is correct, causal scrubbing of irrelevant components should preserve the behavior

This makes interpretability research more rigorous by establishing clear criteria for success and failure, moving the field beyond subjective assessments of "interpretability" toward objective, testable claims.

> **"Causal scrubbing makes mechanistic interpretations falsifiable. If your explanation is wrong, scrubbing irrelevant components will break the output, revealing gaps in your understanding."**

---

## 3.8 Linear Probes and Their Limitations

### How Linear Probes Detect Concepts

Building on the probing introduction in Section 3.2, this section provides a deeper technical treatment of linear probes and their theoretical underpinnings.

A linear probe detects whether a concept is **linearly separable** in a model's representation space. Mathematically, for a binary concept $c$ and hidden states $h$, a linear probe finds a hyperplane $w^T h + b = 0$ that separates positive examples ($c = 1$) from negative examples ($c = 0$).

The success of a linear probe depends on several factors:

1. **Representation quality**: The model must encode the concept in its activations
2. **Linearity**: The concept must be encoded as a linearly separable direction
3. **Probe capacity**: The probe must have sufficient capacity to learn the decision boundary (for linear probes, this is always sufficient for linear separability)
4. **Data quality**: The labels must accurately reflect the concept being probed

### What Linear Probes Can and Cannot Tell Us

| **What Linear Probes CAN Tell Us** | **What Linear Probes CANNOT Tell Us** |
|---|---|
| Whether a concept is present in representations | Whether the concept is *used* in computation |
| How representation of a concept evolves across layers | Whether the encoding is causal or correlational |
| Whether two concepts are linearly separable | Whether non-linear representations exist |
| Relative difficulty of different concepts | The algorithm the model uses |
| Whether fine-tuning changes representations | Whether the concept is necessary for behavior |

### Nonlinear Probes and Their Tradeoffs

**Nonlinear probes** (e.g., multi-layer perceptrons) can detect concepts that are encoded non-linearly. However, they introduce a critical problem: **the probe itself can learn the concept without the model encoding it**.

> **"The more powerful the probe, the less we learn about the model. A sufficiently powerful nonlinear probe can detect a concept in random noise—telling us about the probe's capacity, not the model's representations."**

This is known as the **probe complexity problem**. The solution is to carefully control probe complexity:

- Use **linear probes** as the default (simplest assumption)
- Use **minimum complexity probes** that are just complex enough for the task
- **Compare probe accuracy to a baseline** (e.g., accuracy on a random projection of the activations)

```python
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset
from typing import Literal
import numpy as np


class ProbeExperimentSuite:
    """
    A comprehensive suite for probing experiments that addresses the
    key limitations of naive probing: controls for probe complexity,
    compares linear vs nonlinear probes, and provides statistical
    significance testing.
    """

    def __init__(
        self,
        hidden_dim: int,
        device: str = "cuda" if torch.cuda.is_available() else "cpu",
    ):
        self.hidden_dim = hidden_dim
        self.device = torch.device(device)

    def build_probe(
        self,
        probe_type: Literal["linear", "mlp_shallow", "mlp_deep"],
    ) -> nn.Module:
        """
        Build a probe of the specified complexity.

        Probe types:
        - linear: Single linear layer (minimal complexity)
        - mlp_shallow: One hidden layer with ReLU (moderate complexity)
        - mlp_deep: Three hidden layers (high complexity — use with caution)
        """
        if probe_type == "linear":
            return nn.Linear(self.hidden_dim, 2)
        elif probe_type == "mlp_shallow":
            return nn.Sequential(
                nn.Linear(self.hidden_dim, 64),
                nn.ReLU(),
                nn.Linear(64, 2),
            )
        elif probe_type == "mlp_deep":
            return nn.Sequential(
                nn.Linear(self.hidden_dim, 256),
                nn.ReLU(),
                nn.Linear(256, 128),
                nn.ReLU(),
                nn.Linear(128, 64),
                nn.ReLU(),
                nn.Linear(64, 2),
            )
        else:
            raise ValueError(f"Unknown probe type: {probe_type}")

    def run_comparison(
        self,
        X: torch.Tensor,
        y: torch.Tensor,
        test_ratio: float = 0.2,
        n_seeds: int = 5,
        epochs: int = 200,
        batch_size: int = 256,
    ) -> dict[str, dict[str, float]]:
        """
        Run a comprehensive probe comparison experiment.

        For each probe type, trains multiple models with different random
        seeds and reports mean and standard deviation of accuracy.

        This comparison is crucial because:
        - If a deep probe greatly outperforms a linear probe, the concept
          may be encoded non-linearly
        - If all probes achieve similar accuracy, the concept is likely
          linearly encoded
        - If even deep probes fail, the concept may not be represented

        Returns:
            Dictionary mapping probe type to {mean_acc, std_acc, mean_loss}.
        """
        n_test = int(len(X) * test_ratio)
        n_train = len(X) - n_test
        X_train, X_test = X[:n_train], X[n_train:]
        y_train, y_test = y[:n_train], y[n_train:]

        results = {}

        for probe_type in ["linear", "mlp_shallow", "mlp_deep"]:
            accuracies = []
            losses = []

            for seed in range(n_seeds):
                torch.manual_seed(seed * 42)

                probe = self.build_probe(probe_type).to(self.device)
                optimizer = torch.optim.Adam(probe.parameters(), lr=1e-3)
                criterion = nn.CrossEntropyLoss()

                X_tr = X_train.to(self.device)
                y_tr = y_train.to(self.device)
                X_te = X_test.to(self.device)
                y_te = y_test.to(self.device)

                dataset = TensorDataset(X_tr, y_tr)
                loader = DataLoader(dataset, batch_size=batch_size, shuffle=True)

                for epoch in range(epochs):
                    probe.train()
                    for batch_x, batch_y in loader:
                        logits = probe(batch_x)
                        loss = criterion(logits, batch_y)
                        optimizer.zero_grad()
                        loss.backward()
                        optimizer.step()

                probe.eval()
                with torch.no_grad():
                    test_logits = probe(X_te)
                    test_loss = criterion(test_logits, y_te).item()
                    test_preds = test_logits.argmax(dim=-1)
                    test_acc = (test_preds == y_te).float().mean().item()

                accuracies.append(test_acc)
                losses.append(test_loss)

            results[probe_type] = {
                "mean_acc": np.mean(accuracies),
                "std_acc": np.std(accuracies),
                "mean_loss": np.mean(losses),
            }

        return results

    def random_baseline_test(
        self,
        X: torch.Tensor,
        y: torch.Tensor,
        n_random_projections: int = 10,
    ) -> float:
        """
        Compute probe accuracy on random projections of the activations.
        This provides a crucial baseline: if a linear probe on random
        projections achieves similar accuracy to a linear probe on the
        actual activations, the probe results may be unreliable.

        Returns:
            Mean accuracy across random projections.
        """
        n_features = X.shape[1]
        accuracies = []

        for _ in range(n_random_projections):
            random_matrix = torch.randn(n_features, n_features)
            projected = X @ random_matrix.to(X.device)

            probe = nn.Linear(n_features, 2).to(self.device)
            optimizer = torch.optim.Adam(probe.parameters(), lr=1e-3)
            criterion = nn.CrossEntropyLoss()

            X_dev = projected.to(self.device)
            y_dev = y.to(self.device)

            for _ in range(100):
                logits = probe(X_dev)
                loss = criterion(logits, y_dev)
                optimizer.zero_grad()
                loss.backward()
                optimizer.step()

            with torch.no_grad():
                preds = probe(X_dev).argmax(dim=-1)
                acc = (preds == y_dev).float().mean().item()
            accuracies.append(acc)

        return np.mean(accuracies)


# ----- Example Usage -----

# suite = ProbeExperimentSuite(hidden_dim=768)
# results = suite.run_comparison(X, y)
#
# print("Probe Comparison Results:")
# print("=" * 50)
# for probe_type, metrics in results.items():
#     print(
#         f"  {probe_type:>12s}: "
#         f"Accuracy = {metrics['mean_acc']:.3f} "
#         f"± {metrics['std_acc']:.3f}"
#     )
#
# random_acc = suite.random_baseline_test(X, y)
# print(f"\nRandom projection baseline: {random_acc:.3f}")
# print(f"True signal: {results['linear']['mean_acc'] - random_acc:.3f}")
```

### The Probe Complexity Problem in Detail

The probe complexity problem is one of the most subtle issues in interpretability research. Consider this thought experiment:

Suppose a model has *not* learned a concept (e.g., it has no internal representation of "sentiment"). A linear probe should achieve ~50% accuracy (random chance for binary classification). But a sufficiently deep MLP probe might achieve 90% accuracy—not because the model encodes sentiment, but because the probe itself has learned to extract sentiment from low-level statistical patterns in the activations that are correlated with (but not causally related to) the concept.

This means that **probe accuracy is not a direct measure of model representation quality**. It is an interaction between the model's representations and the probe's capacity. The solution is to:

1. **Start with linear probes** and only use more complex probes when there is specific evidence that the concept is non-linearly encoded
2. **Compare against baselines** (random projections, shuffled labels)
3. **Control for data size** (more data makes it easier for complex probes to overfit)
4. **Use cross-validation** to detect overfitting

| **Limitation** | **Description** | **Mitigation** |
|---|---|---|
| **Linearity assumption** | Only detects linearly encoded concepts | Use nonlinear probes with complexity controls |
| **Correlation ≠ Causation** | High accuracy doesn't mean the concept is *used* | Combine with causal interventions |
| **Feature suppression** | Concept may be encoded but actively suppressed | Probe multiple layers and positions |
| **Clever Hans effects** | Probes learn shortcut features from the data | Compare against random baselines |
| **Layer selection bias** | Results depend on which layer is probed | Use the layer-wise profiling approach |

---

## 3.9 Tools and Frameworks

### The Interpretability Toolkit Ecosystem

The mechanistic interpretability field has developed a rich ecosystem of tools and frameworks. Choosing the right tool depends on your research question, model scale, and level of expertise.

### TransformerLens (Neel Nanda)

**TransformerLens** (formerly EasyTransformer) is the most widely-used framework for mechanistic interpretability research on transformer models. Created by Neel Nanda, it provides:

- **Easy model loading**: Load pretrained models (GPT-2, Pythia, etc.) with internal access
- **Activation caching**: Run a model once and cache all intermediate activations for repeated analysis
- **Hook infrastructure**: Add, modify, or replace activations at any point in the model
- **Standardized naming**: Consistent naming conventions for all model components
- **Visualization utilities**: Built-in tools for attention pattern visualization

```python
# TransformerLens quick start
# pip install transformer_lens

from transformer_lens import HookedTransformer

# Load a model with full internal access
model = HookedTransformer.from_pretrained("gpt2-small")

# Run with activation caching
logits, cache = model.run_with_cache("The capital of France is")

# Access attention patterns at any layer
attention_pattern = cache["pattern", 5]  # Layer 5 attention
# Shape: (batch, heads, seq_len, seq_len)

# Access residual stream at any layer
residual = cache["resid_post", 8]  # After layer 8

# Use hooks for activation patching
patched_logits = model.run_with_hooks(
    "The Eiffel Tower is in [MASK]",
    fwd_hooks=[
        ("blocks.3.hook_resid_post",
         lambda act, hook: act + steering_vector.unsqueeze(0).unsqueeze(0))
    ],
)
```

### Anthropic's Interpretability Tooling

Anthropic has developed internal tools for large-scale interpretability research, including:

- **SAE library**: Training and analysis of sparse autoencoders
- **Feature visualization**: Tools for interpreting SAE features at scale
- **Automated interpretability**: Systems that use language models to automatically interpret features
- **Dashboard tools**: Interactive visualization of model internals

Some of these tools have been open-sourced or described in detail in Anthropic's research papers, particularly the "Towards Monosemanticity" and "Scaling Monosemanticity" publications.

### EleutherAI's Tools

EleutherAI contributes several important tools:

- **Pythia**: A suite of models specifically designed for interpretability research, with checkpoints at every training step
- **lm-evaluation-harness**: While primarily for evaluation, it provides infrastructure useful for interpretability experiments
- **GPT-NeoX**: Open-source model training with interpretability hooks

### SAELens

**SAELens** is a specialized library for training, analyzing, and visualizing sparse autoencoders on language models. It provides:

- **SAE training**: Easy-to-use training loops for SAEs with various configurations
- **Feature dashboard**: Interactive exploration of learned features
- **Activation collection**: Efficient collection of activations for SAE training
- **Caching infrastructure**: Pre-cached activations for popular models

### Comparison Table of Tools

| **Tool** | **Primary Use Case** | **Model Scale** | **Key Strength** | **Ease of Use** | **Status** |
|---|---|---|---|---|---|
| **TransformerLens** | Circuit analysis, hooking | Small–Medium (≤1B) | Comprehensive hook API | ★★★★☆ | Active development |
| **SAELens** | Sparse autoencoders | Small–Medium (≤1B) | SAE training and visualization | ★★★★☆ | Active development |
| **Anthropic Tooling** | Large-scale SAE analysis | Large (≥1B) | Scale and automation | ★★☆☆☆ | Partially open-source |
| **EleutherAI Pythia** | Training dynamics analysis | Medium (≤13B) | Training checkpoints | ★★★☆☆ | Stable |
| **NNSight** | Intervention experiments | Medium–Large | Flexible intervention API | ★★★☆☆ | Active development |
| **CircuitsVis** | Visualization | Any | Publication-quality visualizations | ★★★★★ | Stable |

### Getting Started Guide

For researchers new to mechanistic interpretability, we recommend the following progression:

**Week 1–2: Foundations**
1. Install TransformerLens: `pip install transformer_lens`
2. Complete Neel Nanda's "Concrete Steps for Getting Started with Mechanistic Interpretability" (available on the Alignment Forum)
3. Reproduce the induction heads result on GPT-2

**Week 3–4: Core Techniques**
1. Implement activation patching experiments
2. Perform circuit analysis on a simple task (e.g., indirect object identification)
3. Read and implement ideas from "A Mathematical Framework for Transformer Circuits"

**Week 5–8: Advanced Topics**
1. Install SAELens and train your first SAE
2. Analyze SAE features on a small model
3. Read Anthropic's "Towards Monosemanticity" paper
4. Implement representation engineering experiments

**Ongoing:**
1. Follow the Mechanistic Interpretability community on the Alignment Forum and LessWrong
2. Participate in ARENA (Alignment Research Engineer Accelerator) programs
3. Contribute to open-source interpretability tools

```python
# Complete beginner example: Your first circuit analysis with TransformerLens

from transformer_lens import HookedTransformer
import torch

# Step 1: Load a small model
model = HookedTransformer.from_pretrained("gpt2-small")
model.set_device("cpu")  # Use CPU for accessibility

# Step 2: Simple induction head detection
# Induction heads show high activation on "previous token" patterns
prompt = "When John went to the store, Mary went to the"
logits, cache = model.run_with_cache(prompt)

# Step 3: Examine attention patterns at each layer
print("Analyzing attention patterns for induction heads...\n")
for layer in range(model.cfg.n_layers):
    for head in range(model.cfg.n_heads):
        pattern = cache["pattern", layer][0, head]

        # Check for induction pattern
        seq_len = pattern.shape[-1]
        induction_score = 0.0

        for i in range(2, seq_len):
            for j in range(i):
                if cache["tokens"][0, j + 1] == cache["tokens"][0, i]:
                    induction_score += pattern[i, j].item()

        if induction_score > 0.3:
            print(
                f"  Layer {layer}, Head {head}: "
                f"Induction score = {induction_score:.3f}"
                f" ← likely induction head"
            )

print("\nDone! You've completed your first circuit analysis.")
```

---

## 3.10 Chapter Summary

### Key Takeaways

1. **Interpretability is essential for safety.** We cannot trust AI systems we do not understand. Mechanistic interpretability provides the deepest form of understanding by reverse-engineering neural networks into human-comprehensible algorithms.

2. **Probes are a powerful but limited tool.** Linear probes can detect whether concepts are encoded in a model's representations, but they cannot establish causation. The probe complexity problem requires careful experimental design.

3. **Circuits are the fundamental unit of analysis.** Neural networks implement algorithms through circuits—small subnetworks of features and their connections. Understanding circuits enables prediction, detection of manipulation, and verification of training outcomes.

4. **Superposition is the key obstacle to interpretability.** Neural networks encode more features than they have dimensions by using superposition. Sparse autoencoders are our best tool for decomposing superposed representations.

5. **Representation engineering offers practical safety tools.** Steering vectors, refusal directions, and truthfulness probes can detect, monitor, and modify model behavior without retraining.

6. **Causal scrubbing provides verification.** Mechanistic explanations must be testable. Causal scrubbing offers a rigorous framework for evaluating whether proposed circuits genuinely explain model behavior.

7. **The scaling gap remains the central challenge.** Current interpretability techniques work well on small models but have not yet been validated on frontier models with hundreds of billions of parameters. Closing this gap is one of the most important open problems in AI safety.

8. **No single interpretability technique is sufficient.** The field advances through the combination of multiple approaches, each providing different lenses on model internals. Probes identify what is represented; circuits explain how it is computed; SAEs decompose superposed features; representation engineering provides practical control; and causal scrubbing verifies our explanations.

> **"Interpretability is not just a research area—it is a prerequisite for responsible AI deployment. Until we can understand what our most powerful AI systems are doing and why, we are building on foundations we have not inspected."**

### Questions for Reflection

1. If we discover that a large language model has features corresponding to "deception" and "honesty," does this mean the model is literally being honest or deceptive? Or is this a useful metaphor? What are the implications for AI moral status?

2. The probe complexity problem suggests that our interpretability tools may be misleading us. How can we develop stronger verification methods for interpretability claims?

3. Sparse autoencoders have identified millions of features in Claude. Is this number reassuring (we're making progress on understanding) or alarming (there are millions of things we don't understand)?

4. If a model's refusal behavior is controlled by a single direction in activation space, and that direction can be removed with minimal fine-tuning, how robust is RLHF-based safety training?

5. Should interpretability research be a prerequisite for deploying powerful AI systems? What would this look like in practice?

6. How should we handle the possibility that some model computations are fundamentally opaque to human understanding? Is there a threshold of complexity beyond which mechanistic interpretability becomes impossible?

7. What are the ethical implications of representation engineering for model behavior modification? Who should have the authority to adjust a model's internal representations?

### Preview of Chapter 4: Evaluation and Benchmarking

While interpretability seeks to understand AI systems from the inside, **evaluation and benchmarking** approaches understand them from the outside. In Chapter 4, we will explore:

- How to systematically evaluate AI safety properties using benchmarks
- Red teaming methodologies for discovering model vulnerabilities
- The distinction between capability evaluation and safety evaluation
- How to assess dangerous capabilities (bio, cyber, persuasion)
- Automated evaluation pipelines that scale to frontier models
- Model cards and system cards as safety documentation

The combination of internal understanding (interpretability) and external evaluation provides the most comprehensive approach to ensuring AI safety. Together, these approaches form the technical foundation upon which governance and policy (Chapters 6–7) must be built.

> **"The goal is not just to make AI that works. It's to make AI that we understand well enough to trust."**

---

*Copyright © 2026 Manjunath Kalburgi. All rights reserved.*
5:["$","$L10",null,{"chapter":{"slug":"safety-interpretability","number":3,"title":"Interpretability","filename":"chapter-03-interpretability.md","part":"Foundations of AI Safety","partNumber":1,"description":"Understanding how neural networks work internally, mechanistic interpretability, feature visualization, and transparency techniques."},"content":"$11"}]
b:[["$","meta","0",{"charSet":"utf-8"}],["$","meta","1",{"name":"viewport","content":"width=device-width, initial-scale=1"}]]
7:null
9:{"metadata":[["$","title","0",{"children":"Super Intelligence Safety Experts"}],["$","meta","1",{"name":"description","content":"The Complete Guide to AI Safety and Alignment by Manjunath Kalburgi"}]],"error":null,"digest":"$undefined"}
e:"$9:metadata"
