# Chapter 2: Core Concepts in Artificial Intelligence

> *"Intelligence is the ability to accomplish complex goals."* — Shane Legg

---

## 2.1 Machine Learning Fundamentals

Machine learning is the foundational paradigm underlying all modern AI. Rather than explicitly programming behavior, we provide algorithms with data and let them discover patterns and make decisions.

### The Three Paradigms

```
                         Machine Learning
                               │
              ┌────────────────┼────────────────┐
              │                │                │
        Supervised        Unsupervised      Reinforcement
         Learning           Learning           Learning
              │                │                │
     ┌────────┴────┐   ┌──────┴──────┐   ┌────┴─────┐
     │             │   │             │   │          │
  Classification Regression  Clustering  Dim.     Policy  Value
              │             │  Reduction  Learning Estimation
     Image    Housing  Customer   PCA,    Robot   Game
     Recog.   Prices   Segment.   t-SNE   Control  Playing
```

### Supervised Learning

In supervised learning, the algorithm learns from labeled examples — input-output pairs where the correct output is known.

**Classification** assigns inputs to discrete categories:

```python
# Conceptual example: Email spam classification
# Training data: (email_features, label) pairs
training_data = [
    (extract_features("Buy cheap watches now!!!"), "spam"),
    (extract_features("Meeting at 3pm tomorrow"), "ham"),
    (extract_features("Click here for free money"), "spam"),
    (extract_features("Your quarterly report is ready"), "ham"),
    # ... millions more examples
]

# The model learns a decision boundary:
#
#   "spammy" features ──────┐
#                            │  DECISION
#   ┌────────────────────────┤  BOUNDARY
#   │  SPAM    │            │
#   │  ● ● ●  │            │
#   │ ● ●●● ● │            │
#   │──────────┼────────────┤
#   │   ○ ○    │  ○ ○ ○    │
#   │  ○  ○ ○  │ ○ ○  ○ ○  │
#   │  HAM     │            │
#   └────────────────────────┘
#          "hammy" features
```

**Regression** predicts continuous values:

```python
# Predicting house prices based on features
# Model: y = w₁·size + w₂·bedrooms + w₃·location + b
# Training objective: minimize mean squared error
#
# Loss = (1/N) Σᵢ (ŷᵢ - yᵢ)²
#
# where ŷᵢ is the predicted price and yᵢ is the actual price

import numpy as np

class SimpleLinearRegressor:
    def __init__(self, learning_rate=0.01):
        self.lr = learning_rate
        self.weights = None
        self.bias = 0

    def fit(self, X, y, epochs=1000):
        n_samples, n_features = X.shape
        self.weights = np.zeros(n_features)

        for epoch in range(epochs):
            # Forward pass
            predictions = X @ self.weights + self.bias

            # Compute loss (MSE)
            loss = np.mean((predictions - y) ** 2)

            # Compute gradients
            dw = (2 / n_samples) * (X.T @ (predictions - y))
            db = (2 / n_samples) * np.sum(predictions - y)

            # Update parameters
            self.weights -= self.lr * dw
            self.bias -= self.lr * db

            if epoch % 100 == 0:
                print(f"Epoch {epoch}: Loss = {loss:.4f}")

    def predict(self, X):
        return X @ self.weights + self.bias
```

### Unsupervised Learning

Unsupervised learning discovers structure in unlabeled data.

**Clustering** groups similar data points:

```
K-Means Clustering Visualization:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Step 1: Initialize 3 centroids (★)
    · · ·
  ·  ·  ·     · · ·
 · · · · ·   ·  ·  ·
  · · ·       · · ·

Step 2: Assign points to nearest centroid
    · · ·          ● ● ●
  ·  ·  ·     · · ●  ● ●  (red cluster)
 · · · · ·   ●  ●  ●
  · · ·       ● ● ●       (blue cluster)

Step 3: Update centroids to mean of assigned points
    ▲ ▲ ▲          ◆ ◆ ◆
    ▲ ▲ ▲     ◆ ◆ ◆ ◆ ◆  (new centroid positions)
 · · · · ·   ◆  ◆  ◆
  ▲ ▲ ▲       ◆ ◆ ◆

Step 4: Repeat until convergence
    Cluster A   Cluster B   Cluster C
```

**Dimensionality Reduction** compresses data while preserving essential structure:

```
t-SNE Visualization of MNIST:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Original: 784 dimensions (28×28 pixel images)
  │
  │  t-SNE transformation
  │
  ▼
2D Embedding:

        0
      0 0 0
        0
    1       6  8
    1 1   6 6  8 8
    1   1  6   8 8
            4    2 2
       5    4 4  2
      5 5   4    2  3
       5       9 9  3
                  7 7
                    7

    (digits naturally cluster by their identity)
```

### Reinforcement Learning

Reinforcement learning trains agents to make sequences of decisions by maximizing cumulative reward.

```
The Agent-Environment Loop:
━━━━━━━━━━━━━━━━━━━━━━━━━━

  ┌──────────┐  action aₜ   ┌──────────────┐
  │          │──────────────►│              │
  │   AGENT  │               │ ENVIRONMENT  │
  │  (policy │◄──────────────│  (state sₜ)  │
  │    π)    │  observation  │              │
  │          │  oₜ, reward rₜ               │
  └──────────┘               └──────────────┘

  Objective: Learn π*(s) = a that maximizes
  the expected cumulative discounted reward:
  
  Gₜ = rₜ + γrₜ₊₁ + γ²rₜ₊₂ + ... = Σₖ₌₀∞ γᵏrₜ₊ₖ
  
  where γ ∈ [0,1) is the discount factor
```

**The Bellman Equation** captures the recursive structure of optimal decision-making:

```
V*(s) = max_a [ R(s,a) + γ Σ_{s'} P(s'|s,a) V*(s') ]
         ↑           ↑         ↑
    optimal     immediate   expected future
    value       reward      value of next state
```

The **Q-learning** algorithm learns the optimal action-value function without requiring a model of the environment:

```python
# Q-Learning Algorithm (Tabular)
def q_learning(env, episodes=1000, lr=0.1, gamma=0.99, epsilon=0.1):
    Q = {}  # Q-table: state -> action -> value

    for episode in range(episodes):
        state = env.reset()
        done = False

        while not done:
            # Epsilon-greedy action selection
            if random.random() < epsilon:
                action = env.action_space.sample()  # explore
            else:
                action = argmax(Q.get(state, {}))   # exploit

            next_state, reward, done, _ = env.step(action)

            # Q-value update (Bellman equation)
            best_next = max(Q.get(next_state, [0]))
            Q.setdefault(state, {})[action] = (
                Q[state][action] + lr * (
                    reward + gamma * best_next - Q[state][action]
                )
            )

            state = next_state

    return Q
```

**Key RL concepts for AGI:**

| Concept | Definition | AGI Relevance |
|---------|-----------|---------------|
| **Reward shaping** | Designing intermediate rewards to guide learning | Alignment — shaping AI to pursue human-compatible goals |
| **Exploration vs. exploitation** | Trying new actions vs. using known good ones | Essential for learning in open-ended environments |
| **Credit assignment** | Determining which actions led to outcomes | Understanding causality and long-term consequences |
| **Sim-to-real transfer** | Learning in simulation, applying in reality | Scalable training for embodied AI |
| **Multi-objective RL** | Optimizing for multiple competing objectives | Balancing safety, helpfulness, and efficiency |

---

## 2.2 Deep Learning

Deep learning uses neural networks with multiple layers to learn hierarchical representations of data.

### Neural Network Architecture

```
A Multi-Layer Perceptron (MLP):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Input Layer     Hidden Layers     Output Layer

  x₁ ──┐
        ├──► [h₁¹, h₂¹, h₃¹] ──► [h₁², h₂²] ──► [ŷ₁]
  x₂ ──┤         Layer 1         Layer 2       [ŷ₂]
        │                                    [ŷ₃]
  x₃ ──┤
        ├──► [h₁¹, h₂¹, h₃¹] ──►
  x₄ ──┘

  Each layer computes: h = σ(Wx + b)
  
  where:
    W = weight matrix (learned parameters)
    b = bias vector (learned parameters)
    σ = activation function (ReLU, sigmoid, etc.)
```

The **Universal Approximation Theorem** states that a neural network with a single hidden layer containing a sufficient number of neurons can approximate any continuous function on a compact subset of Rⁿ. However, this says nothing about how many neurons are needed or how easily the network can be trained — hence the practical importance of deep (multi-layer) architectures.

### Convolutional Neural Networks (CNNs)

CNNs are the backbone of computer vision, designed to exploit the spatial structure of images.

```
CNN Architecture for Image Classification:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Image      Conv +     Pool    Conv +     Pool    Fully     Output
Input      ReLU       Layer   ReLU       Layer   Connected  Layer
(32×32×3)                                                  

┌──────┐  ┌──────┐  ┌─────┐ ┌──────┐  ┌─────┐ ┌────┐  ┌─────┐
│      │  │      │  │     │ │      │  │     │ │    │  │     │
│  🖼️  │─►│ 3×3  │─►│ 2×2 │►│ 3×3  │─►│ 2×2 │►│ FC │─►│Soft │
│      │  │conv  │  │max  │ │ conv │  │max  │ │128 │  │max  │
│      │  │32f.  │  │pool │ │64f.  │  │pool │ │    │  │     │
└──────┘  └──────┘  └─────┘ └──────┘  └─────┘ └────┘  └─────┘
32×32×3   30×30×32  15×15×32 13×13×64  6×6×64   2304    10

Key insight: Each convolutional filter learns to detect a specific
feature (edge, corner, texture, object part) — deeper layers detect
increasingly abstract features.
```

**How convolution works:**

```
Input image (5×5):        Filter (3×3):         Output (3×3):
┌───┬───┬───┬───┬───┐    ┌───┬───┬───┐     ┌────┬────┬────┐
│ 1 │ 0 │ 1 │ 0 │ 1 │    │ 1 │ 0 │ 1 │     │  4 │  3 │  4 │
├───┼───┼───┼───┼───┤    ├───┼───┼───┤     ├────┼────┼────┤
│ 0 │ 1 │ 0 │ 1 │ 0 │    │ 0 │ 1 │ 0 │     │  2 │  4 │  2 │
├───┼───┼───┼───┼───┤  *  ├───┼───┼───┤  =  ├────┼────┼────┤
│ 1 │ 0 │ 1 │ 0 │ 1 │    │ 1 │ 0 │ 1 │     │  4 │  3 │  4 │
├───┼───┼───┼───┼───┤    └───┴───┴───┘     └────┴────┴────┘
│ 0 │ 1 │ 0 │ 1 │ 0 │
├───┼───┼───┼───┼───┤    Each output element is the sum of
│ 1 │ 0 │ 1 │ 0 │ 1 │    element-wise products of the filter
└───┴───┴───┴───┴───┘    and the overlapping input patch.
```

### Recurrent Neural Networks (RNNs) and LSTMs

RNNs process sequential data by maintaining a hidden state that evolves over time.

```
Unrolled RNN:
━━━━━━━━━━━━━

  x₁ ──────►┌──────┐  h₁  ──────►┌──────┐  h₂  ──────►┌──────┐  h₃
             │  RNN  │───────────►│  RNN  │───────────►│  RNN  │───►...
             │ Cell  │            │ Cell  │            │ Cell  │
  x₂ ──────►│  hₜ  │───────────►│  hₜ  │───────────►│  hₜ  │
             └──────┘            └──────┘            └──────┘

  hₜ = σ(Wₕₕ · hₜ₋₁ + Wₓₕ · xₜ + b)
  yₜ = Wₕᵧ · hₜ + bᵧ

  Problem: Vanishing/exploding gradients make it hard to
  learn long-range dependencies.
```

**LSTM (Long Short-Term Memory)** addresses this with gating mechanisms:

```
LSTM Cell Architecture:
━━━━━━━━━━━━━━━━━━━━━━━

  cₜ₋₁ ──────┬──────────────────────┬──────► cₜ
              │                      │
              │    ┌──────────┐      │
              ├───►│  Forget  │──────┤
              │    │  Gate    │      │
              │    │ σ(W·[h,x])│     │
              │    └──────────┘      │
              │                      │
              │    ┌──────────┐      │
              ├───►│ Input    │──────┤  Element-wise
              │    │  Gate    │      │  multiplication
              │    │ σ(W·[h,x])│     │  and addition
              │    └──────────┘      │
              │                      │
              │    ┌──────────┐      │
              │    │ Candidate│──────┤
              │    │ tanh(W·[h,x])   │
              │    └──────────┘      │
              │                      │
              │    ┌──────────┐      │
              │    │ Output   │──────┤──────► hₜ
              │    │  Gate    │      │
              │    │ σ(W·[h,x])│     │
              │    └──────────┘      │

  Gates control what information to forget, store, and output.
  The cell state cₜ acts as an "information highway" that
  enables gradients to flow over long time spans.
```

### The Transformer Architecture

The Transformer, introduced in the landmark 2017 paper *"Attention Is All You Need"* by Vaswani et al., is the architecture behind all modern large language models.

```
Transformer Architecture:
━━━━━━━━━━━━━━━━━━━━━━━━━

                    ┌─────────────┐
                    │   Output    │
                    │   Linear    │
                    │   Softmax   │
                    └──────┬──────┘
                           │
                    ┌──────┴──────┐
                    │  Add & Norm │◄───┐
                    └──────┬──────┘    │
                           │           │
                    ┌──────┴──────┐    │
                    │ Feed-Forward│    │
                    │   Network   │    │  × N
                    └──────┬──────┘    │
                           │           │
                    ┌──────┴──────┐    │
                    │  Add & Norm │◄───┤
                    └──────┬──────┘    │
                           │           │
                    ┌──────┴──────┐    │
                    │  Multi-Head │    │
                    │  Attention  │    │
                    └──────┬──────┘    │
                           │           │
                    ┌──────┴──────┐    │
                    │  Add & Norm │◄───┘
                    └──────┬──────┘
                           │
              ┌────────────┴────────────┐
              │                         │
     ┌────────┴────────┐      ┌────────┴────────┐
     │     Encoder     │      │     Decoder      │
     │  (bidirectional)│      │ (causal/left-to  │
     │                 │      │      -right)      │
     └─────────────────┘      └─────────────────┘
```

---

## 2.3 Attention Mechanisms

Attention is the mechanism that allows models to dynamically focus on relevant parts of their input.

### Self-Attention

The core innovation is **self-attention**: each token in a sequence computes its relevance to every other token.

```
Scaled Dot-Product Attention:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

For input sequence X, compute three projections:

  Q = XWq    (Query: "what am I looking for?")
  K = XWk    (Key:   "what do I contain?")
  V = XWv    (Value: "what information do I provide?")

Then compute:

              QKᵀ
  Attention(Q,K,V) = softmax(─────) V
                       √dₖ

  Intuition: Each query "asks" all keys "how relevant are you?",
  then aggregates the values weighted by relevance.

Visual example:

  Sentence: "The cat sat on the mat"
  
  Token: "sat" computes attention scores with all other tokens:
  
  "The"   ████░░░░░░  0.15  (some relevance — subject context)
  "cat"   ██████████  0.35  (high relevance — who sat?)
  "sat"   ███████░░░  0.25  (self-reference)
  "on"    █████░░░░░  0.15  (prepositional phrase)
  "the"   ██░░░░░░░░  0.05  (low relevance)
  "mat"   ███░░░░░░░  0.10  (location)
```

### Multi-Head Attention

Multiple attention heads allow the model to attend to different types of relationships simultaneously:

```
Multi-Head Attention:
━━━━━━━━━━━━━━━━━━━━━

  Head 1: Syntax    — attends to subject-verb relationships
  Head 2: Semantics — attends to meaning-related tokens
  Head 3: Position  — attends to nearby tokens
  Head 4: Reference — attends to coreferent expressions
  ...

  Q₁,K₁,V₁ ──► Attention₁ ─┐
  Q₂,K₂,V₂ ──► Attention₂ ─┤
  Q₃,K₃,V₃ ──► Attention₃ ─┼──► Concat ──► Wₒ ──► Output
  Q₄,K₄,V₄ ──► Attention₄ ─┘
```

---

## 2.4 Natural Language Processing

Modern NLP has been transformed by large language models. Key capabilities include:

### Tokenization

Text must be converted to numerical representations:

```
BPE Tokenization Example:
━━━━━━━━━━━━━━━━━━━━━━━━━

Input: "unhappiness"

Vocabulary building:
  Step 1: Start with characters
    [u, n, h, a, p, i, n, e, s, s]
  
  Step 2: Find most frequent pair: (s, s) → ss
    [u, n, h, a, p, i, n, e, ss]
  
  Step 3: Find next most frequent pair: (ss, y) → ssy? No...
    (n, e) → ne
    [u, n, h, a, p, i, ne, ss]
  
  Step 4: Continue...
    (un) → un
    [un, h, a, p, i, ne, ss]
  
  Step 5: (un, h) → unh? or (i, ne) → ine?
    (ine) → ine
    [un, h, a, p, ine, ss]
  
  ...eventually...
  
  Final tokens: [un, happiness]

GPT-4 tokenizer: ~100K tokens in vocabulary
Each token ≈ 0.75 words in English
```

### The Language Modeling Objective

```
Autoregressive (Left-to-Right) Prediction:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Input:  "The cat sat on the"
  Target:        "cat sat on the mat"
  
  Model must predict each next token:
  
  P("cat" | "The") = 0.85
  P("sat" | "The cat") = 0.72
  P("on" | "The cat sat") = 0.91
  P("the" | "The cat sat on") = 0.95
  P("mat" | "The cat sat on the") = 0.34
                                   (could be "floor", "bed", "grass"...)
  
  Training objective: minimize cross-entropy loss
  L = -Σ log P(xₜ | x₁, ..., xₜ₋₁)
```

### Masked Language Modeling (BERT-style)

```
Bidirectional (Cloze) Prediction:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Input:  "The [MASK] sat on the [MASK]"
  Target:    cat            mat
  
  Model sees context from both left and right.
  P("cat" | "The [MASK] sat on the [MASK]") considers:
    - "The" to the left
    - "sat on the [MASK]" to the right
  
  This enables richer understanding of context.
```

---

## 2.5 Computer Vision

Computer vision encompasses all methods that enable machines to interpret visual information.

### Image Classification Pipeline

```
Classical CV Pipeline vs. Deep Learning:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Classical (2010):
  Image → Edge Detection → HOG Features → SVM Classifier → Label
           (hand-crafted)   (hand-crafted)  (learned)

Deep Learning (2012+):
  Image ──────────────────► CNN ────────────► Label
          (end-to-end learning from raw pixels)

Key advantage: No manual feature engineering required.
The network learns the optimal representations from data.
```

### Object Detection

Object detection identifies and localizes multiple objects within an image:

```
YOLO (You Only Look Once) Concept:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Input image divided into S×S grid
  Each cell predicts B bounding boxes + confidence + class probs

  ┌────┬────┬────┬────┬────┬────┐
  │    │ 🐕 │    │    │    │    │
  ├────┼────┼────┼────┼────┼────┤
  │    │    │    │ 🚗 │    │    │
  ├────┼────┼────┼────┼────┼────┤
  │ 🐕 │    │    │    │    │    │
  ├────┼────┼────┼────┼────┼────┤
  │    │    │    │    │ 🚶 │    │
  ├────┼────┼────┼────┼────┼────┤
  │    │    │    │    │    │    │
  └────┴────┴────┴────┴────┴────┘
  
  Each cell predicts: [x, y, w, h, confidence, class probabilities]
  
  Non-maximum suppression removes overlapping detections.
```

### Image Generation

Modern image generation uses diffusion models:

```
Diffusion Process:
━━━━━━━━━━━━━━━━━━

  Forward Process (adding noise):
  x₀ ──► x₁ ──► x₂ ──► ... ──► xₜ
  clean   noisy  noisier         pure noise
  
  q(xₜ | xₜ₋₁) = N(xₜ; √(1-βₜ) xₜ₋₁, βₜ I)

  Reverse Process (denoising — what the model learns):
  xₜ ──► xₜ₋₁ ──► ... ──► x₁ ──► x₀
  noise  less noisy        cleaner  clean image
  
  pθ(xₜ₋₁ | xₜ) = learned by neural network

  To generate: sample xₜ ~ N(0,I), iteratively denoise to get x₀
```

---

## 2.6 Multi-Modal Learning

AGI must integrate information across modalities — text, images, audio, video, and sensor data.

### Vision-Language Models

```
CLIP Architecture (Contrastive Learning):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Image ──► Vision Encoder ──► Image Embedding ──┐
                                                  ├──► Contrastive Loss
  Text  ──► Text Encoder  ──► Text Embedding  ──┘    (align matched pairs)

  Training: Learn to match images with their descriptions.
  
  At inference: Can classify any visual concept described in text
  without task-specific training (zero-shot transfer).
```

### Audio-Visual Learning

```
Multi-Modal Transformer:
━━━━━━━━━━━━━━━━━━━━━━━━

  Audio    ──► Audio Encoder ──► Token Sequence ──┐
                                                   │
  Video    ──► Video Encoder ──► Token Sequence ──┼──► Cross-Modal
                                                   │    Transformer
  Text     ──► Text Encoder  ──► Token Sequence ──┘
                                                   │
                                                   ▼
                                            Unified Embedding
                                            (shared representation)
```

---

## 2.7 Transfer Learning and Foundation Models

Transfer learning — training on one task and applying knowledge to another — is arguably the most important paradigm shift in modern AI.

### The Foundation Model Paradigm

```
Traditional ML:
━━━━━━━━━━━━━━━━

  Task A ──► Model A ──► Deploy A
  Task B ──► Model B ──► Deploy B
  Task C ──► Model C ──► Deploy C
  ...
  (Each task requires its own data, model, and training pipeline)

Foundation Model Paradigm:
━━━━━━━━━━━━━━━━━━━━━━━━━

                    ┌──► Fine-tune for Task A
                    │──► Fine-tune for Task B
  Massive Pre-     │──► Fine-tune for Task C
  Training ────────┤──► Few-shot for Task D
  (web data)       │──► Zero-shot for Task E
                    │──► In-context learning for Task F
                    └──► Prompt engineering for Task G
                    ...
                    (One model, many capabilities)
```

### Pre-Training → Fine-Tuning → Inference

```
The Three Stages:
━━━━━━━━━━━━━━━━━

Stage 1: Pre-Training (months, millions of dollars)
  Data: Trillions of tokens from the internet
  Objective: Next-token prediction
  Result: General-purpose language understanding
  
  "The quick brown fox ___"
  "jumps" (model learns language structure)

Stage 2: Fine-Tuning (hours to days, thousands of dollars)
  Data: Thousands to millions of task-specific examples
  Objective: Task-specific loss
  Result: Specialized capability
  
  "Classify the sentiment: 'This movie was great!' → positive"

Stage 3: Inference (milliseconds, pennies per request)
  Input: User prompt
  Output: Model response
  No learning occurs — only computation
```

---

## 2.8 Meta-Learning: Learning to Learn

Meta-learning aims to create systems that improve their ability to learn from new tasks, not just their performance on specific tasks.

### The MAML Algorithm

**Model-Agnostic Meta-Learning (MAML)** finds initial parameters that enable rapid fine-tuning:

```
MAML Conceptual Flow:
━━━━━━━━━━━━━━━━━━━━━

  Goal: Find θ such that a few gradient steps from θ
        produce good performance on any new task.

  ┌──────────────────────────────────────────────────┐
  │                                                  │
  │     Initialize θ (shared starting point)         │
  │              │                                   │
  │    ┌─────────┼─────────┬──────────┐             │
  │    ▼         ▼         ▼          ▼             │
  │  Task 1   Task 2   Task 3    Task N             │
  │    │         │         │          │             │
  │  few grad  few grad  few grad  few grad          │
  │  steps     steps     steps     steps            │
  │    │         │         │          │             │
  │    ▼         ▼         ▼          ▼             │
  │  θ₁'       θ₂'       θ₃'       θₙ'             │
  │    │         │         │          │             │
  │    └─────────┴─────────┴──────────┘             │
  │              │                                   │
  │    Update θ based on performance of all θᵢ'      │
  │                                                  │
  └──────────────────────────────────────────────────┘

  θ* = argmin_θ Σ_{τᵢ~p(τ)} L(τᵢ, θ - α∇_θ L(τᵢ, θ))
       ↑                                    ↑
  outer loop                          inner loop
  (task distribution)            (few gradient steps)
```

### In-Context Learning

Modern LLMs exhibit an emergent form of meta-learning — **in-context learning** — where the model adapts to new tasks purely through the prompt, without any parameter updates:

```
In-Context Learning Example:
━━━━━━━━━━━━━━━━━━━━━━━━━━━

Prompt to GPT-4 / Claude:

  "Here are some examples of sentiment classification:
  
   'I love this product!' → Positive
   'This was a waste of time.' → Negative
   'The weather is okay today.' → Neutral
   
   Now classify: 'Absolutely fantastic experience!' →"

Model output: "Positive"

Remarkable: The model learned the task from examples in the prompt
WITHOUT any gradient updates or parameter changes.
```

---

## 2.9 Neural Architecture Search (NAS)

NAS automates the design of neural network architectures:

```
NAS Process:
━━━━━━━━━━━━━

  ┌─────────────┐
  │ Search Space │  (defined architecture building blocks)
  └──────┬──────┘
         │
         ▼
  ┌─────────────┐
  │   Controller │  (generates architecture candidates)
  │   Network    │
  └──────┬──────┘
         │
    ┌────┴────┐
    ▼         ▼
  ┌─────┐  ┌─────┐
  │Arch │  │Arch │  ... many candidates
  │  A  │  │  B  │
  └──┬──┘  └──┬──┘
     │        │
     ▼        ▼
  ┌─────┐  ┌─────┐
  │Train │  │Train │  (evaluate each)
  │& Eval│  │& Eval│
  └──┬──┘  └──┬──┘
     │        │
     ▼        ▼
  ┌─────┐  ┌─────┐
  │Acc  │  │Acc  │
  │89.2%│  │91.7%│  ← Select best
  └─────┘  └─────┘

Modern approach: Predictor-based NAS
  Train a performance predictor to avoid evaluating
  every candidate from scratch.
```

---

## 2.10 Self-Supervised Learning

Self-supervised learning generates supervisory signals from the data itself, eliminating the need for manual labels.

### Contrastive Learning

```
SimCLR (Simple Framework for Contrastive Learning):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Original     Augmentation    Augmentation
  Image            1               2
    │                │               │
    ▼                ▼               ▼
  ┌─────┐        ┌─────┐        ┌─────┐
  │ f(·) │        │ f(·) │        │ f(·) │  (shared encoder)
  └──┬──┘        └──┬──┘        └──┬──┘
     │               │               │
     ▼               ▼               ▼
    z₁              z₂              z₃
    embedding       embedding       embedding

  Objective: Similar images should produce similar embeddings.
  Dissimilar images should produce distant embeddings.
  
  Loss = -log [ exp(sim(z₁,z₂)/τ) / Σ_k exp(sim(z₁,z_k)/τ) ]
                                ↑
                           temperature parameter
```

### Masked Autoencoders

```
Masked Autoencoding (MAE):
━━━━━━━━━━━━━━━━━━━━━━━━━

  Original image:
  ┌──┬──┬──┬──┬──┬──┬──┬──┐
  │  │  │  │  │  │  │  │  │
  ├──┼──┼──┼──┼──┼──┼──┼──┤
  │  │  │  │  │  │  │  │  │
  ├──┼──┼──┼──┼──┼──┼──┼──┤
  │  │  │  │  │  │  │  │  │
  ├──┼──┼──┼──┼──┼──┼──┼──┤
  │  │  │  │  │  │  │  │  │
  └──┴──┴──┴──┴──┴──┴──┴──┘

  After masking (75%):
  ┌──┬──┬──┬──┬──┬──┬──┬──┐
  │  │██│  │██│  │██│  │██│
  ├──┼──┼──┼──┼──┼──┼──┼──┤
  │██│  │██│  │██│  │██│  │
  ├──┼──┼──┼──┼──┼──┼──┼──┤
  │  │██│  │██│  │██│  │██│
  ├──┼──┼──┼──┼──┼──┼──┼──┤
  │██│  │██│  │██│  │██│  │
  └──┴──┴──┴──┴──┴──┴──┴──┘
  (██ = masked)

  Encoder processes only visible patches (efficient)
  Decoder reconstructs full image
  
  Forces model to learn rich visual representations.
```

---

## 2.11 Foundation Models

Foundation models are large, pre-trained models that serve as a base for many downstream applications.

### The Foundation Model Ecosystem

```
Foundation Model Taxonomy:
━━━━━━━━━━━━━━━━━━━━━━━━━

  Language Models          Vision Models         Multi-Modal
  ┌──────────────┐       ┌──────────────┐      ┌──────────────┐
  │ GPT-4        │       │ ViT          │      │ GPT-4V       │
  │ Claude       │       │ DINOv2       │      │ Gemini       │
  │ Gemini       │       │ SAM          │      │ Claude 3/4   │
  │ LLaMA 3      │       │ CLIP         │      │              │
  │ DeepSeek     │       │ DALL-E       │      │              │
  │ Qwen 2.5     │       │ Stable Diff. │      │              │
  └──────────────┘       └──────────────┘      └──────────────┘

  Audio Models            Code Models           Scientific
  ┌──────────────┐       ┌──────────────┐      ┌──────────────┐
  │ Whisper      │       │ Codex        │      │ AlphaFold 2  │
  │ MusicGen     │       │ StarCoder    │      │ GNoME        │
  │ AudioPaLM    │       │ CodeLlama    │      │weather       │
  │ Bark         │       │ DeepSeek-Coder│     │  models      │
  └──────────────┘       └──────────────┘      └──────────────┘
```

### Training Scale

| Model | Parameters | Training Tokens | Compute (FLOPs) | Approx. Cost |
|-------|-----------|-----------------|------------------|--------------|
| GPT-3 | 175B | 300B | 3.14 × 10²³ | ~$4.6M |
| LLaMA 2 70B | 70B | 2T | 1.7 × 10²⁴ | ~$2M |
| GPT-4 | ~1.8T (est.) | ~13T (est.) | ~2.1 × 10²⁵ | ~$100M+ |
| Gemini Ultra | ~1.5T (est.) | ~13T (est.) | ~10²⁵ | ~$100M+ |

---

## 2.12 Emergent Properties in Large Models

One of the most striking phenomena in modern AI is the emergence of capabilities that were not explicitly trained for.

### What Are Emergent Properties?

```
Capability
    │
    │                                    ╱ Emergent
    │                                   ╱   capability
    │                                  ╱    (appears suddenly)
    │                                 ╱
    │                    ────────────╱
    │                   │
    │                   │ ← "Phase transition"
    │                   │
    │   ────────────────┘
    │  (below threshold: no capability)
    │
    └──────────────────────────────────────── Model Scale
              Small          Medium         Large
```

### Documented Emergent Abilities

| Ability | Approximate Emergence | Description |
|---------|----------------------|-------------|
| **Chain-of-thought reasoning** | ~100B parameters | Solving multi-step problems by showing reasoning steps |
| **In-context learning** | ~10B parameters | Learning new tasks from examples in the prompt |
| **Instruction following** | ~60B parameters | Responding appropriately to natural language instructions |
| **Code execution** | ~100B parameters | Writing and debugging code |
| **Multi-step arithmetic** | ~100B+ parameters | Solving problems requiring multiple calculations |
| **Analogical reasoning** | ~200B+ parameters | Drawing parallels between different domains |
| **Theory of mind** | ~200B+ parameters | Predicting what others believe or know |

### The Debate

Not all researchers agree that emergence is real versus an artifact of evaluation metrics:

- **Real emergence** (Wei et al.): Capabilities genuinely appear at specific scales that were not present at smaller scales
- **Metric artifact** (Schaeffer et al.): Using non-linear metrics (like exact match) creates the illusion of sudden emergence; with smooth metrics, capabilities improve gradually

The truth likely involves both: some abilities may genuinely phase-transition, while others appear gradual when measured differently.

---

## 2.13 Scaling Laws

Scaling laws describe predictable relationships between model performance and various resources.

### Chinchilla Scaling Laws

```
Optimal Training:
━━━━━━━━━━━━━━━━━

  Key insight: For a fixed compute budget C, the optimal
  configuration balances model size (N) and data size (D).

  Loss ≈ (A/Nᵅ) + (B/Dᵝ) + ε

  where:
    N = number of parameters
    D = number of training tokens
    A, B, α, β = constants from experiments
    ε = irreducible loss (Bayes error)

  Scaling relationships:
    N_optimal ∝ C^0.5
    D_optimal ∝ C^0.5

  Implication: Double the compute → ~1.4× more parameters
  AND ~1.4× more data (not all parameters, not all data).

Visual representation:

  Loss (log scale)
    │
  3 ┤ ○
    │   ○
  2 ┤     ○
    │       ○  ○
  1 ┤           ○  ○  ○
    │                   ○  ○  ○  ○
    │                                  ○  ○  ○  ○  ○  ○
  0 ┼───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───
    10⁷  10⁸  10⁹ 10¹⁰ 10¹¹ 10¹² 10¹³ 10¹⁴ 10¹⁵
                        Compute (FLOPs)

  Loss follows a power law: L ∝ C^(-k)
  This holds over many orders of magnitude!
```

### Kaplan et al. (OpenAI) Findings

```
Three key scaling laws:
━━━━━━━━━━━━━━━━━━━━━━━

1. Performance improves as a power law with:
   - Model size (N)
   - Dataset size (D)
   - Compute (C)

2. These relationships are remarkably smooth over
   7+ orders of magnitude

3. Key ratios for optimal training:
   - ~20 tokens per parameter is a good rule of thumb
   - Doubling model size should be paired with
     doubling dataset size for optimal efficiency
```

---

## 2.14 Chain-of-Thought Reasoning

Chain-of-Thought (CoT) prompting enables LLMs to solve complex problems by reasoning step by step.

### Standard vs. Chain-of-Thought Prompting

```
Standard Prompting:
━━━━━━━━━━━━━━━━━━

  Q: Roger has 5 tennis balls. He buys 2 more cans of 
     tennis balls. Each can has 3 tennis balls. How many 
     tennis balls does he have now?
  
  A: 11  ← (may or may not be correct; no reasoning shown)

Chain-of-Thought Prompting:
━━━━━━━━━━━━━━━━━━━━━━━━━━

  Q: Roger has 5 tennis balls. He buys 2 more cans of 
     tennis balls. Each can has 3 tennis balls. How many 
     tennis balls does he have now?
  
  A: Roger started with 5 tennis balls.
     He bought 2 cans, each containing 3 tennis balls.
     So he bought 2 × 3 = 6 additional tennis balls.
     Total = 5 + 6 = 11 tennis balls.  ← (correct with reasoning)
```

### Types of Chain-of-Thought

```
1. Zero-shot CoT: "Let's think step by step"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Q: If a car travels at 60 mph for 2.5 hours, 
      how far does it travel?
   A: Let's think step by step:
      1. Speed = 60 mph
      2. Time = 2.5 hours
      3. Distance = Speed × Time
      4. Distance = 60 × 2.5 = 150 miles

2. Few-shot CoT: Demonstrated with examples
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Q: [problem]
   A: [reasoning → answer]
   
   Q: [new problem]
   A: [model generates reasoning → answer]

3. Self-consistency: Multiple CoT paths → majority vote
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Path 1: ... → Answer A
   Path 2: ... → Answer B
   Path 3: ... → Answer A
   Path 4: ... → Answer A
   Path 5: ... → Answer B
   
   Majority vote → Answer A (correct)
```

### Tree of Thoughts (ToT)

```
Tree of Thoughts:
━━━━━━━━━━━━━━━━━

                    Problem
                   /   |   \
              Thought1 Thought2 Thought3
              /  |  \    |     /  \
            T1a T1b T1c  T2a  T3a  T3b
            |   |   |    |     |    |
            ✓   ✗   ✓    ✗     ✓    ✓
            |       |           |
         evaluate  evaluate   evaluate
            |       |           |
            ▼       ▼           ▼
         continue  explore   continue
                  alternatives

  The model explores multiple reasoning paths,
  evaluates intermediate states, and backtracks
  when paths look unpromising — like human problem solving.
```

---

## 2.15 Tool Use in LLMs

Modern LLMs can use external tools to extend their capabilities beyond pure text generation.

### The Tool-Use Paradigm

```
Tool-Augmented LLM:
━━━━━━━━━━━━━━━━━━━

  User: "What's the weather in Tokyo right now?"
         │
         ▼
  ┌─────────────────────────┐
  │        LLM              │
  │                         │
  │  Thinks: I need to call  │
  │  the weather API         │
  │                         │
  │  Generates tool call:    │
  │  get_weather(           │
  │    city="Tokyo",        │
  │    units="celsius"      │
  │  )                      │
  └────────┬────────────────┘
           │
           ▼
  ┌─────────────────────────┐
  │    Tool Execution        │
  │    (API call, code exec, │
  │     database query, etc.)│
  └────────┬────────────────┘
           │
           ▼
  Tool result: {"temp": 28, "condition": "sunny", "humidity": 65}
           │
           ▼
  ┌─────────────────────────┐
  │        LLM              │
  │                         │
  │  Generates response:    │
  │  "It's currently 28°C   │
  │   and sunny in Tokyo,   │
  │   with 65% humidity."   │
  └─────────────────────────┘
```

### Code Execution

```
Python Interpreter as Tool:
━━━━━━━━━━━━━━━━━━━━━━━━━━

  User: "What is the prime factorization of 1234567?"
         │
         ▼
  LLM generates Python code:
  
  def factorize(n):
      factors = []
      d = 2
      while d * d <= n:
          while n % d == 0:
              factors.append(d)
              n //= d
          d += 1
      if n > 1:
          factors.append(n)
      return factors
  
  result = factorize(1234567)
  print(result)
  
  Execution: [127, 9721]
  
  LLM: "The prime factorization of 1,234,567 is 127 × 9,721."
```

### Multi-Tool Reasoning

```
Complex Task Requiring Multiple Tools:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  User: "Compare Tesla's and Apple's stock performance 
         this quarter and create a chart."
  
  Step 1: Use financial_data_api(TSLA, Q2_2026)
  Step 2: Use financial_data_api(AAPL, Q2_2026)
  Step 3: Use python_execute(analysis_code)
  Step 4: Use chart_library(create_comparison_chart)
  Step 5: Present results with interpretation

  This demonstrates:
  - Tool selection and sequencing
  - Multi-step planning
  - Integration of external data
  - Code generation and execution
  - Result synthesis and presentation
```

---

## Summary

This chapter has covered the core technical foundations underlying modern AI and pointing toward AGI:

1. **Machine learning** — supervised, unsupervised, and reinforcement learning — provides the three fundamental paradigms for learning from data.

2. **Deep learning** architectures (CNNs, RNNs, LSTMs, Transformers) enable hierarchical representation learning at scale.

3. **Attention mechanisms** — particularly self-attention and multi-head attention — are the core innovation behind modern LLMs, enabling dynamic focus on relevant information.

4. **Natural language processing** has been transformed by transformer-based models trained on massive text corpora, enabling few-shot and zero-shot task solving.

5. **Computer vision** has evolved from hand-crafted features to end-to-end deep learning systems that classify, detect, segment, and generate images.

6. **Multi-modal learning** combines information across text, vision, audio, and other modalities — a prerequisite for AGI's flexibility.

7. **Transfer learning and foundation models** represent a paradigm shift from task-specific to general-purpose AI systems.

8. **Meta-learning** enables systems to improve their ability to learn, not just their performance on specific tasks.

9. **Scaling laws** reveal predictable relationships between compute, data, model size, and performance — suggesting that continued scaling may yield further capabilities.

10. **Emergent properties** in large models — chain-of-thought reasoning, in-context learning, tool use — demonstrate capabilities that appear only at sufficient scale, offering tantalizing hints about the path to AGI.

> **Looking ahead:** Chapter 3 will explore how to architect systems that combine these building blocks into AGI-capable systems, examining cognitive architectures, memory systems, and the engineering challenges of building truly general intelligence.

---

*Next: [Chapter 3 — AGI Architecture](chapter-03-agi-architecture.md)*
