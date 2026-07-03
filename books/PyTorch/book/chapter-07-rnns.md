# Chapter 7: Recurrent Neural Networks & Transformers

**By Manjunath Kalburgi**

---

## Introduction

Sequential data is everywhere: text, speech, time series, video, music, DNA sequences, and stock prices. Unlike images or tabular data where samples are independent, sequential data has an inherent temporal or ordinal structure — the order matters, and each element carries context from what came before it.

Standard feedforward neural networks treat every input independently and cannot naturally capture dependencies across time steps. Recurrent Neural Networks (RNNs) were designed specifically to address this limitation by maintaining a hidden state that evolves as the network processes each element in a sequence. More recently, the Transformer architecture has revolutionized sequence modeling by replacing recurrence entirely with attention mechanisms, enabling massive parallelism and state-of-the-art performance across virtually every domain involving sequential data.

In this chapter, we will:

1. Understand why sequential data requires specialized architectures
2. Learn the vanilla RNN and its fundamental limitations
3. Master LSTM and GRU architectures that solve gradient problems
4. Explore bidirectional and stacked RNN variants
5. Study sequence-to-sequence models and the attention mechanism
6. Build and understand the complete Transformer architecture
7. Implement practical models: text classification with LSTM, machine translation with Transformer, and autoregressive language generation

---

## 1. Sequential Data Concepts

### 1.1 What Makes Sequential Data Special?

Sequential data is characterized by elements that depend on their position and neighbors within the sequence. Consider the sentence:

```
"The cat sat on the mat because it was tired."
```

The word "it" refers to "cat" — understanding this requires tracking context across multiple positions. A feedforward network that processes each word independently would miss this dependency entirely.

| Property | Sequential Data | Independent Data |
|----------|----------------|-----------------|
| Sample independence | No — order matters | Yes — i.i.d. assumption |
| Variable length | Yes — sequences differ in length | No — fixed-size inputs |
| Temporal dependencies | Long-range and short-range | None |
| Memory of past inputs | Required | Not needed |
| Examples | Text, audio, video, time series | Images, tabular data |

### 1.2 Types of Sequence Tasks

Different sequence tasks require different architectural choices:

- **Many-to-One**: Classification of sequences (sentiment analysis)
- **One-to-Many**: Generation from a single input (image captioning)
- **Many-to-Many (equal)**: Per-step prediction (named entity recognition)
- **Many-to-Many (unequal)**: Input and output sequences of different lengths (machine translation)

```
Many-to-One:              One-to-Many:
[x₁][x₂][x₃] → [y]      [x] → [y₁][y₂][y₃]

Many-to-Many (equal):     Many-to-Many (unequal):
[x₁][x₂][x₃] → [y₁][y₂][y₃]   [x₁][x₂][x₃] → [y₁][y₂]
```

### 1.3 Representing Sequences in PyTorch

In PyTorch, sequences are typically represented as 3D tensors:

```
Tensor shape: (batch_size, sequence_length, features)
```

```python
import torch

# Batch of 4 sentences, max length 10 words, 300-dim embeddings
batch = torch.randn(4, 10, 300)

# Variable-length sequences are common in NLP
lengths = [3, 7, 10, 5]  # actual lengths of each sequence
```

---

## 2. Vanilla Recurrent Neural Networks

### 2.1 Architecture

A vanilla RNN processes a sequence one element at a time, maintaining a hidden state that serves as a "memory":

```
    ┌──────────────────────────────────────────────┐
    │                  RNN Cell                      │
    │                                                │
    │   hₜ = tanh(W_xh · xₜ + W_hh · hₜ₋₁ + b_h) │
    │   yₜ = W_hy · hₜ + b_y                       │
    │                                                │
    └──────────────────────────────────────────────┘

Unrolled over time:

    h₀       h₁         h₂         h₃         h₄
     │        │          │          │          │
     │   ┌────┴────┐┌────┴────┐┌────┴────┐┌────┴────┐
     ├──→│  RNN    │→│  RNN   │→│  RNN   │→│  RNN   │→ ...
     │   │  Cell   ││  Cell  ││  Cell  ││  Cell  │
     │   └────┬────┘└────┬────┘└────┬────┘└────┬────┘
    h₀       x₁        x₂         x₃         x₄
           (input)   (input)    (input)    (input)

     ┌──────┐┌──────┐┌──────┐┌──────┐
     │  y₁  ││  y₂  ││  y₃  ││  y₄  │
     └──────┘└──────┘└──────┘└──────┘
    (output) (output) (output) (output)
```

The key insight is that the same weights (`W_xh`, `W_hh`, `W_hy`) are shared across all time steps — this parameter sharing is what allows RNNs to handle sequences of arbitrary length.

### 2.2 Implementing a Vanilla RNN from Scratch

```python
import torch
import torch.nn as nn


class VanillaRNN(nn.Module):
    def __init__(self, input_size: int, hidden_size: int, output_size: int):
        super().__init__()
        self.hidden_size = hidden_size
        # Input-to-hidden weights
        self.W_xh = nn.Linear(input_size, hidden_size)
        # Hidden-to-hidden weights (recurrent connection)
        self.W_hh = nn.Linear(hidden_size, hidden_size, bias=False)
        # Hidden-to-output weights
        self.W_hy = nn.Linear(hidden_size, output_size)
        self.tanh = nn.Tanh()

    def forward(
        self, x: torch.Tensor, h_prev: torch.Tensor | None = None
    ) -> tuple[torch.Tensor, torch.Tensor]:
        """
        Args:
            x: Input tensor (batch_size, seq_len, input_size)
            h_prev: Initial hidden state (batch_size, hidden_size)
        Returns:
            outputs: All hidden states (batch_size, seq_len, hidden_size)
            h_n: Final hidden state (batch_size, hidden_size)
        """
        batch_size, seq_len, _ = x.shape

        # Initialize hidden state if not provided
        if h_prev is None:
            h_prev = torch.zeros(batch_size, self.hidden_size, device=x.device)

        # Store all hidden states
        hidden_states = []

        for t in range(seq_len):
            # Extract input at current time step
            x_t = x[:, t, :]  # (batch_size, input_size)

            # Compute new hidden state
            h_t = self.tanh(self.W_xh(x_t) + self.W_hh(h_prev))
            hidden_states.append(h_t)

            # Update previous hidden state
            h_prev = h_t

        # Stack hidden states along time dimension
        outputs = torch.stack(hidden_states, dim=1)  # (batch, seq_len, hidden)
        return outputs, h_prev


# Usage example
rnn = VanillaRNN(input_size=128, hidden_size=256, output_size=10)
x = torch.randn(32, 20, 128)  # batch=32, seq_len=20, features=128
outputs, h_final = rnn(x)
print(f"Output shape: {outputs.shape}")  # (32, 20, 256)
print(f"Final hidden: {h_final.shape}")  # (32, 256)
```

### 2.3 PyTorch's Built-in RNN

PyTorch provides an optimized RNN module that handles batching, dropout, and multiple layers efficiently:

```python
import torch
import torch.nn as nn


# Basic RNN
rnn = nn.RNN(
    input_size=128,
    hidden_size=256,
    num_layers=2,
    batch_first=True,  # input shape: (batch, seq, feature)
    dropout=0.3,
    bidirectional=False,
)

x = torch.randn(32, 20, 128)  # (batch, seq_len, input_size)
output, h_n = rnn(x)

print(f"Output shape:  {output.shape}")   # (32, 20, 256)
print(f"Hidden shape:  {h_n.shape}")       # (num_layers, batch, hidden_size) = (2, 32, 256)
print(f"Output == last layer hidden states: {torch.allclose(output[:, -1, :], h_n[-1])}")
```

| `nn.RNN` Argument | Description | Default |
|-------------------|-------------|---------|
| `input_size` | Size of input features | Required |
| `hidden_size` | Size of hidden state | Required |
| `num_layers` | Number of stacked RNN layers | 1 |
| `nonlinearity` | Activation function ('tanh' or 'relu') | 'tanh' |
| `bias` | Whether to use bias terms | True |
| `batch_first` | Whether batch is the first dimension | False |
| `dropout` | Dropout between layers (0 = no dropout) | 0 |
| `bidirectional` | Whether to use bidirectional RNN | False |

### 2.4 The Vanishing and Exploding Gradient Problem

The fundamental limitation of vanilla RNNs is the gradient problem during backpropagation through time (BPTT). During training, gradients must flow backward through every time step:

```
∂L/∂W = ∂L/∂hₜ · ∂hₜ/∂hₜ₋₁ · ∂hₜ₋₁/∂hₜ₋₂ · ... · ∂h₁/∂W

Each ∂hₜ/∂hₜ₋₁ involves the Jacobian of tanh and weight matrices:
∂hₜ/∂hₜ₋₁ = diag(1 - tanh²(·)) · W_hh
```

When `||W_hh|| < 1`, gradients shrink exponentially → **vanishing gradients** (cannot learn long-range dependencies). When `||W_hh|| > 1`, gradients grow exponentially → **exploding gradients** (unstable training).

```python
# Demonstration of vanishing gradients
import torch
import torch.nn as nn

rnn = nn.RNN(input_size=10, hidden_size=64, batch_first=True)
x = torch.randn(1, 50, 10, requires_grad=True)
output, h_n = rnn(x)

# Compute gradient of final hidden state w.r.t. initial time step input
loss = h_n.sum()
loss.backward()

# Check gradient magnitude at different time steps
# Gradients tend to vanish or explode through time steps
print(f"Gradient norm: {x.grad.norm():.4f}")

# With very long sequences, gradients vanish to near zero
long_x = torch.randn(1, 200, 10, requires_grad=True)
output_long, h_long = rnn(long_x)
h_long.sum().backward()
print(f"Long sequence gradient norm: {long_x.grad.norm():.4f}")
```

| Problem | Cause | Effect | Solution |
|---------|-------|--------|----------|
| Vanishing gradient | Repeated multiplication by small values | Cannot learn long-range dependencies | LSTM, GRU, attention |
| Exploding gradient | Repeated multiplication by large values | Unstable training, NaN losses | Gradient clipping |
| Short-term bias | Gradients from recent steps dominate | RNNs "forget" distant past | LSTMs with cell state |
| Sequential computation | Cannot parallelize across time steps | Slow training on long sequences | Transformers |

**Gradient Clipping** (to handle exploding gradients):

```python
model = nn.RNN(input_size=100, hidden_size=256, batch_first=True)
optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)

# In training loop:
# output, _ = model(x)
# loss = criterion(output, targets)
# loss.backward()
# Gradient clipping — clip by norm with max_norm=1.0
torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
optimizer.step()
```

---

## 3. Long Short-Term Memory (LSTM)

### 3.1 Architecture and Gates

LSTMs solve the vanishing gradient problem by introducing a **cell state** — a separate information highway that allows gradients to flow unchanged across many time steps. The LSTM has three gates that regulate information flow:

```
LSTM Cell Architecture:

                    Cell State
    cₜ₋₁ ──────────────────────────────────→ cₜ
              │    (multiply)    │    (add)
              │     ┌───┐        │     ┌───┐
              │     │ fₜ│        │     │ iₜ│
              │     └─┬─┘        │     └─┬─┘
              │       ↓          │       ↓
              │   ┌───────┐     │   ┌───────┐
              │   │Forget │     │   │Input  │
              │   │ Gate  │     │   │ Gate  │
              │   └───┬───┘     │   └───┬───┘
              │       │         │       │
              │       │    ┌────┘  ┌────┘
              │       │    │       │
              │       ↓    ↓       ↓
              │   ┌──────────────┐
              ├──→│  Cell State  │
              │   │  Candidate   │
              │   └──────┬───────┘
              │          │
              │          ↓
              │   ┌──────────────┐     ┌───────┐
              └──→│   Output     │────→│Output │──→ hₜ
                  │   Gate (oₜ) │     │  hₜ   │
                  └──────────────┘     └───────┘

Gate equations:
  fₜ = σ(W_f · [hₜ₋₁, xₜ] + b_f)          # Forget gate
  iₜ = σ(W_i · [hₜ₋₁, xₜ] + b_i)          # Input gate
  c̃ₜ = tanh(W_c · [hₜ₋₁, xₜ] + b_c)      # Candidate cell state
  cₜ = fₜ ⊙ cₜ₋₁ + iₜ ⊙ c̃ₜ              # Cell state update
  oₜ = σ(W_o · [hₜ₋₁, xₜ] + b_o)          # Output gate
  hₜ = oₜ ⊙ tanh(cₜ)                       # Hidden state
```

### 3.2 Implementing LSTM from Scratch

```python
import torch
import torch.nn as nn


class LSTMCell(nn.Module):
    def __init__(self, input_size: int, hidden_size: int):
        super().__init__()
        self.hidden_size = hidden_size
        # Combined linear for all four gates (more efficient)
        self.gates = nn.Linear(input_size + hidden_size, 4 * hidden_size)

    def forward(
        self, x_t: torch.Tensor, state: tuple[torch.Tensor, torch.Tensor]
    ) -> tuple[torch.Tensor, torch.Tensor]:
        """
        Args:
            x_t: Input at current time step (batch_size, input_size)
            state: Tuple of (h_prev, c_prev), each (batch_size, hidden_size)
        Returns:
            h_t: New hidden state
            c_t: New cell state
        """
        h_prev, c_prev = state

        # Concatenate input and previous hidden state
        combined = torch.cat([x_t, h_prev], dim=1)

        # Compute all gate values at once
        gate_values = self.gates(combined)
        f_gate, i_gate, c_candidate, o_gate = gate_values.chunk(4, dim=1)

        # Apply activations
        f_t = torch.sigmoid(f_gate)      # Forget gate: what to discard
        i_t = torch.sigmoid(i_gate)      # Input gate: what to write
        c_tilde = torch.tanh(c_candidate)  # Candidate values
        o_t = torch.sigmoid(o_gate)      # Output gate: what to output

        # Update cell state
        c_t = f_t * c_prev + i_t * c_tilde  # The "constant error carousel"

        # Compute hidden state
        h_t = o_t * torch.tanh(c_t)

        return h_t, c_t


class SimpleLSTM(nn.Module):
    def __init__(self, input_size: int, hidden_size: int, output_size: int):
        super().__init__()
        self.hidden_size = hidden_size
        self.lstm_cell = LSTMCell(input_size, hidden_size)
        self.output_layer = nn.Linear(hidden_size, output_size)

    def forward(self, x: torch.Tensor) -> tuple[torch.Tensor, torch.Tensor]:
        """
        Args:
            x: (batch_size, seq_len, input_size)
        Returns:
            outputs: (batch_size, seq_len, output_size)
            (h_n, c_n): Final hidden and cell states
        """
        batch_size, seq_len, _ = x.shape

        # Initialize states
        h_t = torch.zeros(batch_size, self.hidden_size, device=x.device)
        c_t = torch.zeros(batch_size, self.hidden_size, device=x.device)

        hidden_states = []
        for t in range(seq_len):
            h_t, c_t = self.lstm_cell(x[:, t, :], (h_t, c_t))
            hidden_states.append(h_t)

        # Process through output layer
        hidden_seq = torch.stack(hidden_states, dim=1)  # (batch, seq, hidden)
        outputs = self.output_layer(hidden_seq)  # (batch, seq, output)

        return outputs, (h_t, c_t)


# Demonstration
lstm = SimpleLSTM(input_size=128, hidden_size=256, output_size=10)
x = torch.randn(32, 20, 128)
outputs, (h_n, c_n) = lstm(x)
print(f"Output shape: {outputs.shape}")   # (32, 20, 10)
print(f"Hidden shape: {h_n.shape}")       # (32, 256)
print(f"Cell shape:   {c_n.shape}")       # (32, 256)
```

### 3.3 Why LSTMs Solve Vanishing Gradients

The cell state update `cₜ = fₜ ⊙ cₜ₋₁ + iₜ ⊙ c̃ₜ` is a linear combination. The gradient flows through the cell state with only element-wise multiplications (by the forget gate), not repeated matrix multiplications. If the forget gate is near 1, gradients flow unattenuated:

```
∂cₜ/∂cₜ₋₁ = diag(fₜ)  ← bounded between 0 and 1, but can be close to 1
```

This is the "constant error carousel" — information can persist in the cell state for hundreds of time steps.

---

## 4. Gated Recurrent Unit (GRU)

### 4.1 Simplified Architecture

The GRU combines the forget and input gates into a single **update gate** and merges the cell state and hidden state. It has fewer parameters than LSTM while achieving comparable performance on many tasks:

```
GRU Cell:

    hₜ₋₁ ──────────────────────────────→ hₜ
              │                    │
              │   ┌────────────┐   │
              │   │ Update Gate│   │
              │   │    (zₜ)    │   │
              │   └──────┬─────┘   │
              │          │         │
              │   ┌──────┴─────┐   │
              │   │Reset Gate  │   │
              │   │    (rₜ)    │   │
              │   └──────┬─────┘   │
              │          │         │
              │          ↓         │
              │   ┌──────────┐    │
              │   │Candidate │    │
              │   │ h̃ₜ      │    │
              │   └────┬─────┘    │
              │        │          │
              │   (1-zₜ)⊙h̃ₜ  zₜ⊙hₜ₋₁
              │        │          │
              └────→ ⊕ ←─────────┘
                     │
                    hₜ

Equations:
  zₜ = σ(W_z · [hₜ₋₁, xₜ] + b_z)              # Update gate
  rₜ = σ(W_r · [hₜ₋₁, xₜ] + b_r)              # Reset gate
  h̃ₜ = tanh(W_h · [rₜ ⊙ hₜ₋₁, xₜ] + b_h)    # Candidate
  hₜ = (1 - zₜ) ⊙ h̃ₜ + zₜ ⊙ hₜ₋₁            # New hidden state
```

### 4.2 GRU Implementation and Comparison

```python
import torch
import torch.nn as nn


class GRUCell(nn.Module):
    def __init__(self, input_size: int, hidden_size: int):
        super().__init__()
        self.hidden_size = hidden_size
        self.W_z = nn.Linear(input_size + hidden_size, hidden_size)
        self.W_r = nn.Linear(input_size + hidden_size, hidden_size)
        self.W_h = nn.Linear(input_size + hidden_size, hidden_size)

    def forward(self, x_t: torch.Tensor, h_prev: torch.Tensor) -> torch.Tensor:
        combined = torch.cat([x_t, h_prev], dim=1)

        z_t = torch.sigmoid(self.W_z(combined))  # Update gate
        r_t = torch.sigmoid(self.W_r(combined))  # Reset gate

        # Candidate uses reset gate to filter previous hidden state
        h_combined = torch.cat([x_t, r_t * h_prev], dim=1)
        h_tilde = torch.tanh(self.W_h(h_combined))

        # Interpolate between old and new
        h_t = (1 - z_t) * h_tilde + z_t * h_prev
        return h_t


# Using PyTorch's built-in GRU
gru = nn.GRU(input_size=128, hidden_size=256, num_layers=2, batch_first=True)
x = torch.randn(32, 20, 128)
output, h_n = gru(x)
print(f"GRU output: {output.shape}")  # (32, 20, 256)
print(f"GRU hidden: {h_n.shape}")     # (2, 32, 256)
```

### 4.3 LSTM vs GRU Comparison

| Feature | LSTM | GRU |
|---------|------|-----|
| Gates | 3 (forget, input, output) | 2 (update, reset) |
| State variables | 2 (cell state + hidden) | 1 (hidden only) |
| Parameters | ~4 × (input + hidden) × hidden | ~3 × (input + hidden) × hidden |
| Training speed | Slower | Faster |
| Long sequences | Better for very long sequences | Competitive for moderate lengths |
| Small datasets | More prone to overfitting | Often better with limited data |
| Implementation | More complex | Simpler |

---

## 5. Bidirectional and Stacked RNNs

### 5.1 Bidirectional RNNs

A bidirectional RNN processes the sequence in both forward and backward directions, allowing the network to use both past and future context for each time step:

```
Forward RNN:
    x₁ → [fwd] → x₂ → [fwd] → x₃ → [fwd] → x₄ → [fwd]
     h₁f         h₂f         h₃f         h₄f

Backward RNN:
    x₄ → [bwd] → x₃ → [bwd] → x₂ → [bwd] → x₁ → [bwd]
     h₄b         h₃b         h₂b         h₁b

Output at each step:
    y₁ = [h₁f; h₁b]    (concatenation)
    y₂ = [h₂f; h₂b]
    y₃ = [h₃f; h₃b]
    y₄ = [h₄f; h₄b]

Hidden size of output = 2 × hidden_size
```

```python
import torch
import torch.nn as nn

# Bidirectional LSTM
bi_lstm = nn.LSTM(
    input_size=128,
    hidden_size=256,
    num_layers=2,
    batch_first=True,
    bidirectional=True,
)

x = torch.randn(32, 20, 128)
output, (h_n, c_n) = bi_lstm(x)

print(f"Output: {output.shape}")   # (32, 20, 512) — 256*2 directions
print(f"Hidden: {h_n.shape}")      # (4, 32, 256) — 2 layers * 2 directions
print(f"Cell:   {c_n.shape}")      # (4, 32, 256)

# Extract final forward and backward hidden states
h_forward = h_n[-2]  # Last forward layer
h_backward = h_n[-1]  # Last backward layer
h_combined = torch.cat([h_forward, h_backward], dim=1)  # (32, 512)
```

| Aspect | Unidirectional | Bidirectional |
|--------|---------------|---------------|
| Context available | Past only | Past and future |
| Output size | hidden_size | 2 × hidden_size |
| Use cases | Real-time generation, causal tasks | Classification, NER, translation encoder |
| Real-time compatible | Yes | No (needs full sequence) |

### 5.2 Stacked RNNs

Stacking multiple RNN layers creates a deeper network where each layer processes the sequence and passes its hidden states to the layer above:

```
Layer 2:  [h₂¹] → [RNN] → [h₃¹] → [RNN] → [h₄¹] → [RNN] → [h₅¹]
              ↑              ↑              ↑              ↑
Layer 1:  [h₁⁰] → [RNN] → [h₂⁰] → [RNN] → [h₃⁰] → [RNN] → [h₄⁰]
              ↑              ↑              ↑              ↑
Input:    x₁            x₂            x₃            x₄

Superscript = layer number, subscript = time step
```

```python
# Stacked 3-layer bidirectional LSTM
stacked_lstm = nn.LSTM(
    input_size=100,
    hidden_size=256,
    num_layers=3,       # Three stacked layers
    batch_first=True,
    dropout=0.3,        # Dropout between layers
    bidirectional=True,
)

x = torch.randn(16, 50, 100)
output, (h_n, c_n) = stacked_lstm(x)
print(f"Output: {output.shape}")  # (16, 50, 512)
print(f"Hidden: {h_n.shape}")     # (6, 16, 256) — 3 layers × 2 directions
```

---

## 6. Sequence-to-Sequence Models and Teacher Forcing

### 6.1 Encoder-Decoder Architecture

The seq2seq architecture maps an input sequence to an output sequence of different length using an encoder that compresses the input and a decoder that generates the output:

```
Encoder-Decoder for Machine Translation:

Encoder:                    Decoder:
                          ┌──────────┐
    "I"    ─→ [Enc] → h  │ [Dec] ──→ "Je"
    "love" ─→ [Enc] → h  │ [Dec] ──→ "t'aime"
    "you"  ─→ [Enc] → h  │ [Dec] ──→ ""
                          │  ↑       │
                          │ <sos>    │
                          └──────────┘

    Context vector h carries the meaning of the entire input
```

```python
import torch
import torch.nn as nn


class Encoder(nn.Module):
    def __init__(self, vocab_size: int, embed_dim: int, hidden_dim: int):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embed_dim)
        self.rnn = nn.LSTM(embed_dim, hidden_dim, batch_first=True)

    def forward(self, x: torch.Tensor) -> tuple[torch.Tensor, tuple]:
        embedded = self.embedding(x)
        outputs, (h_n, c_n) = self.rnn(embedded)
        return outputs, (h_n, c_n)


class Decoder(nn.Module):
    def __init__(self, vocab_size: int, embed_dim: int, hidden_dim: int):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embed_dim)
        self.rnn = nn.LSTM(embed_dim, hidden_dim, batch_first=True)
        self.fc_out = nn.Linear(hidden_dim, vocab_size)

    def forward(
        self, x: torch.Tensor, hidden: tuple[torch.Tensor, torch.Tensor]
    ) -> tuple[torch.Tensor, tuple]:
        embedded = self.embedding(x)
        output, hidden = self.rnn(embedded, hidden)
        prediction = self.fc_out(output)
        return prediction, hidden


class Seq2Seq(nn.Module):
    def __init__(self, encoder: Encoder, decoder: Decoder, device: torch.device):
        super().__init__()
        self.encoder = encoder
        self.decoder = decoder
        self.device = device

    def forward(
        self, src: torch.Tensor, trg: torch.Tensor
    ) -> torch.Tensor:
        """
        Args:
            src: (batch, src_len) — source sequence
            trg: (batch, trg_len) — target sequence (teacher forcing)
        Returns:
            outputs: (batch, trg_len, vocab_size)
        """
        batch_size = src.shape[0]
        trg_len = trg.shape[1]
        trg_vocab_size = self.decoder.fc_out.out_features

        # Tensor to store decoder outputs
        outputs = torch.zeros(batch_size, trg_len, trg_vocab_size).to(self.device)

        # Encode the source
        _, hidden = self.encoder(src)

        # First input to decoder is <sos> token (first element of target)
        input_token = trg[:, 0:1]

        for t in range(1, trg_len):
            output, hidden = self.decoder(input_token, hidden)
            outputs[:, t, :] = output.squeeze(1)
            # Teacher forcing: use actual target as next input
            input_token = trg[:, t:t + 1]

        return outputs


# Usage
vocab_size = 5000
model = Seq2Seq(
    Encoder(vocab_size, 256, 512),
    Decoder(vocab_size, 256, 512),
    device=torch.device("cpu"),
)

src = torch.randint(0, vocab_size, (32, 20))  # Batch of source sequences
trg = torch.randint(0, vocab_size, (32, 15))  # Batch of target sequences
output = model(src, trg)
print(f"Translation output: {output.shape}")  # (32, 15, 5000)
```

### 6.2 Teacher Forcing

**Teacher forcing** feeds the ground-truth token as the decoder's input during training, rather than the model's own prediction. This stabilizes training but creates a discrepancy between training and inference:

| Aspect | Teacher Forcing | Free Running |
|--------|----------------|--------------|
| Decoder input | Ground truth at each step | Model's own prediction |
| Training speed | Faster convergence | Slower convergence |
| Error propagation | Errors don't compound | Errors accumulate |
| Train/inference gap | Large (exposure bias) | None |
| Solution | Scheduled sampling | N/A (but harder to train) |

```python
# Scheduled sampling: gradually transition from teacher forcing to free running
import numpy as np


def get_teacher_forcing_ratio(epoch: int, total_epochs: int, schedule: str = "linear") -> float:
    """Compute teacher forcing ratio for current epoch."""
    if schedule == "linear":
        # Linearly decrease from 1.0 to 0.0
        return max(0.0, 1.0 - epoch / total_epochs)
    elif schedule == "exponential":
        # Exponential decay
        return 0.99 ** epoch
    elif schedule == "inverse sigmoid":
        # Inverse sigmoid decay (common choice)
        k = 12  # controls steepness
        return k / (k + np.exp(epoch / k))
    return 1.0


# Training loop with scheduled sampling
def train_with_scheduled_sampling(
    model: Seq2Seq, src: torch.Tensor, trg: torch.Tensor,
    optimizer: torch.optim.Optimizer, criterion: nn.Module,
    epoch: int, total_epochs: int,
) -> float:
    model.train()
    optimizer.zero_grad()

    tf_ratio = get_teacher_forcing_ratio(epoch, total_epochs)
    batch_size, trg_len = trg.shape
    device = src.device

    _, hidden = model.encoder(src)

    input_token = trg[:, 0:1]
    total_loss = 0.0

    for t in range(1, trg_len):
        output, hidden = model.decoder(input_token, hidden)
        loss = criterion(output.squeeze(1), trg[:, t])
        total_loss += loss

        # Decide whether to use teacher forcing
        use_teacher = np.random.random() < tf_ratio
        if use_teacher:
            input_token = trg[:, t:t + 1]
        else:
            input_token = output.argmax(dim=-1).unsqueeze(1)

    total_loss.backward()
    torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
    optimizer.step()

    return total_loss.item() / (trg_len - 1)
```

---

## 7. Attention Mechanism

### 7.1 Motivation

In the basic encoder-decoder architecture, the entire source sequence is compressed into a single fixed-size context vector. This creates an information bottleneck, especially for long sequences. The attention mechanism allows the decoder to focus on relevant parts of the source sequence at each decoding step:

```
Without Attention (information bottleneck):

    Source: [I] [love] [cats] [very] [much]
                                      ↓
                              [Fixed Vector]
                                      ↓
    Target: [Je] [aime] [les] [chats] [beaucoup]


With Attention (dynamic focus):

    Source: [I] [love] [cats] [very] [much]
              ↘    ↓     ↓     ↓    ↙     ← attention weights
                     [Context at step 2]      (vary per step)
                          ↓
    Target: [Je] [aime] [les] [chats] [beaucoup]
```

### 7.2 Bahdanau Attention (Additive)

Bahdanau attention computes attention scores using a feedforward network:

```
Architecture:

    Encoder outputs: h₁, h₂, ..., hₙ    (n source hidden states)
    Decoder state:   sₜ₋₁                 (previous decoder state)

    Score: eₜⱼ = vᵀ · tanh(W₁ · hⱼ + W₂ · sₜ₋₁)
    Weights: αₜⱼ = softmax(eₜⱼ)
    Context: cₜ = Σⱼ αₜⱼ · hⱼ

    Attention weights form a "soft alignment" between source and target:

    Source:   I    love   cats   very   much
              0.1  0.7   0.1    0.05   0.05   ← α weights at step 2
                      ↑ most attention on "love"
```

```python
import torch
import torch.nn as nn
import torch.nn.functional as F


class BahdanauAttention(nn.Module):
    def __init__(self, encoder_dim: int, decoder_dim: int, attention_dim: int):
        super().__init__()
        self.W_encoder = nn.Linear(encoder_dim, attention_dim, bias=False)
        self.W_decoder = nn.Linear(decoder_dim, attention_dim, bias=False)
        self.v = nn.Linear(attention_dim, 1, bias=False)

    def forward(
        self, encoder_outputs: torch.Tensor, decoder_state: torch.Tensor
    ) -> tuple[torch.Tensor, torch.Tensor]:
        """
        Args:
            encoder_outputs: (batch, src_len, encoder_dim)
            decoder_state: (batch, decoder_dim)
        Returns:
            context: (batch, encoder_dim)
            attention_weights: (batch, src_len)
        """
        # Project encoder outputs
        src_proj = self.W_encoder(encoder_outputs)  # (batch, src_len, attn_dim)

        # Project decoder state and expand for broadcasting
        dec_proj = self.W_decoder(decoder_state).unsqueeze(1)  # (batch, 1, attn_dim)

        # Compute attention scores
        energy = torch.tanh(src_proj + dec_proj)  # (batch, src_len, attn_dim)
        scores = self.v(energy).squeeze(-1)  # (batch, src_len)

        # Softmax to get attention weights
        attn_weights = F.softmax(scores, dim=1)  # (batch, src_len)

        # Compute context vector as weighted sum
        context = torch.bmm(attn_weights.unsqueeze(1), encoder_outputs).squeeze(1)
        # context: (batch, encoder_dim)

        return context, attn_weights
```

### 7.3 Luong Attention (Multiplicative)

Luong attention offers several simpler scoring functions:

```python
class LuongAttention(nn.Module):
    def __init__(self, encoder_dim: int, decoder_dim: int, method: str = "dot"):
        super().__init__()
        self.method = method

        if method == "general":
            self.W = nn.Linear(encoder_dim, decoder_dim, bias=False)
        elif method == "concat":
            self.W = nn.Linear(encoder_dim + decoder_dim, decoder_dim, bias=False)
            self.v = nn.Linear(decoder_dim, 1, bias=False)

    def forward(
        self, encoder_outputs: torch.Tensor, decoder_state: torch.Tensor
    ) -> tuple[torch.Tensor, torch.Tensor]:
        """
        Score functions:
          dot:      score(sₜ, hⱼ) = sₜᵀ · hⱼ
          general:  score(sₜ, hⱼ) = sₜᵀ · W · hⱼ
          concat:   score(sₜ, hⱼ) = vᵀ · tanh(W · [sₜ; hⱼ])
        """
        if self.method == "dot":
            # Simple dot product (requires encoder_dim == decoder_dim)
            scores = torch.bmm(encoder_outputs, decoder_state.unsqueeze(2)).squeeze(2)

        elif self.method == "general":
            transformed = self.W(encoder_outputs)  # (batch, src_len, dec_dim)
            scores = torch.bmm(transformed, decoder_state.unsqueeze(2)).squeeze(2)

        elif self.method == "concat":
            src_len = encoder_outputs.shape[1]
            dec_expanded = decoder_state.unsqueeze(1).expand(-1, src_len, -1)
            combined = torch.cat([encoder_outputs, dec_expanded], dim=2)
            scores = self.v(torch.tanh(self.W(combined))).squeeze(2)

        attention_weights = F.softmax(scores, dim=1)
        context = torch.bmm(attention_weights.unsqueeze(1), encoder_outputs).squeeze(1)

        return context, attention_weights
```

### 7.4 Bahdanau vs Luong Attention

| Aspect | Bahdanau (Additive) | Luong (Multiplicative) |
|--------|-------------------|----------------------|
| Score function | Feedforward (tanh) | Dot product, bilinear, or concat |
| Computational cost | Higher (FFN per pair) | Lower (matrix operations) |
| Decoder state | Previous state sₜ₋₁ | Current state sₜ |
| Performance | Comparable | Comparable |
| Popular for | Machine translation | General sequence tasks |

---

## 8. Self-Attention and Multi-Head Attention

### 8.1 Self-Attention

Self-attention allows each position in a sequence to attend to all other positions, computing relevance scores between every pair of elements. This is the foundation of the Transformer:

```
Self-Attention (Query, Key, Value):

    Input: [x₁, x₂, x₃, ..., xₙ]

    For each position i:
      Query:  qᵢ = xᵢ · W_Q     "What am I looking for?"
      Key:    kⱼ = xⱼ · W_K     "What do I contain?"
      Value:  vⱼ = xⱼ · W_V     "What information do I provide?"

    Attention(qᵢ, K, V) = softmax(qᵢ · Kᵀ / √dₖ) · V

    Scaled dot-product attention matrix:

         k₁   k₂   k₃   k₄
    q₁ [ 0.1  0.7  0.1  0.1]    ← q₁ attends most to k₂
    q₂ [ 0.3  0.3  0.2  0.2]    ← q₂ has more uniform attention
    q₃ [ 0.1  0.2  0.5  0.2]    ← q₃ attends most to k₃
    q₄ [ 0.2  0.1  0.3  0.4]    ← q₄ attends most to k₄
```

### 8.2 Multi-Head Attention Implementation

Multi-head attention runs multiple attention operations in parallel, each learning different types of relationships:

```python
import torch
import torch.nn as nn
import math


class MultiHeadAttention(nn.Module):
    def __init__(self, embed_dim: int, num_heads: int, dropout: float = 0.1):
        super().__init__()
        assert embed_dim % num_heads == 0, "embed_dim must be divisible by num_heads"

        self.embed_dim = embed_dim
        self.num_heads = num_heads
        self.head_dim = embed_dim // num_heads
        self.scale = math.sqrt(self.head_dim)

        # Linear projections for Q, K, V
        self.W_q = nn.Linear(embed_dim, embed_dim)
        self.W_k = nn.Linear(embed_dim, embed_dim)
        self.W_v = nn.Linear(embed_dim, embed_dim)

        # Output projection
        self.W_o = nn.Linear(embed_dim, embed_dim)

        self.dropout = nn.Dropout(dropout)

    def forward(
        self,
        query: torch.Tensor,
        key: torch.Tensor,
        value: torch.Tensor,
        mask: torch.Tensor | None = None,
    ) -> tuple[torch.Tensor, torch.Tensor]:
        """
        Args:
            query: (batch, seq_len_q, embed_dim)
            key:   (batch, seq_len_k, embed_dim)
            value: (batch, seq_len_v, embed_dim)  [seq_len_v == seq_len_k]
            mask:  (batch, 1, seq_len_q, seq_len_k) or (batch, seq_len_q, seq_len_k)
        Returns:
            output: (batch, seq_len_q, embed_dim)
            attn_weights: (batch, num_heads, seq_len_q, seq_len_k)
        """
        batch_size = query.shape[0]
        src_len = key.shape[1]

        # Linear projections and reshape to (batch, heads, seq_len, head_dim)
        Q = self.W_q(query).view(batch_size, -1, self.num_heads, self.head_dim).transpose(1, 2)
        K = self.W_k(key).view(batch_size, -1, self.num_heads, self.head_dim).transpose(1, 2)
        V = self.W_v(value).view(batch_size, -1, self.num_heads, self.head_dim).transpose(1, 2)

        # Scaled dot-product attention
        # Q: (batch, heads, seq_q, head_dim)
        # K.transpose: (batch, heads, head_dim, seq_k)
        scores = torch.matmul(Q, K.transpose(-2, -1)) / self.scale

        # Apply mask (for padding or causal attention)
        if mask is not None:
            scores = scores.masked_fill(mask == 0, float("-inf"))

        # Attention weights
        attn_weights = torch.softmax(scores, dim=-1)
        attn_weights = self.dropout(attn_weights)

        # Weighted sum of values
        attn_output = torch.matmul(attn_weights, V)
        # attn_output: (batch, heads, seq_q, head_dim)

        # Reshape back to (batch, seq_q, embed_dim)
        attn_output = (
            attn_output.transpose(1, 2)
            .contiguous()
            .view(batch_size, -1, self.embed_dim)
        )

        # Final linear projection
        output = self.W_o(attn_output)

        return output, attn_weights


# Usage
mha = MultiHeadAttention(embed_dim=512, num_heads=8)
x = torch.randn(32, 20, 512)  # (batch, seq_len, embed_dim)

# Self-attention (Q, K, V all same)
output, weights = mha(x, x, x)
print(f"Output: {output.shape}")     # (32, 20, 512)
print(f"Weights: {weights.shape}")   # (32, 8, 20, 20) — 8 heads

# Cross-attention (e.g., decoder attending to encoder)
encoder_output = torch.randn(32, 15, 512)
decoder_output = torch.randn(32, 10, 512)
cross_out, cross_weights = mha(
    query=decoder_output, key=encoder_output, value=encoder_output
)
print(f"Cross-attn output: {cross_out.shape}")     # (32, 10, 512)
print(f"Cross-attn weights: {cross_weights.shape}") # (32, 8, 10, 15)
```

### 8.3 Why Scaling by √dₖ?

Without scaling, for large `dₖ`, the dot products grow in magnitude, pushing the softmax into regions where gradients are extremely small. Dividing by `√dₖ` keeps the variance of dot products at approximately 1, ensuring stable gradients.

---

## 9. Positional Encoding

### 9.1 Why Positional Encoding?

Self-attention is **permutation-invariant** — it treats the input as a set, not a sequence. Without positional information, "the cat sat on the mat" and "mat the on sat cat the" would produce the same output. Positional encodings inject sequence order information.

### 9.2 Sinusoidal Positional Encoding

The original Transformer uses fixed sinusoidal encodings that can generalize to sequences longer than those seen during training:

```python
import torch
import torch.nn as nn
import math


class SinusoidalPositionalEncoding(nn.Module):
    def __init__(self, embed_dim: int, max_len: int = 5000, dropout: float = 0.1):
        super().__init__()
        self.dropout = nn.Dropout(dropout)

        pe = torch.zeros(max_len, embed_dim)
        position = torch.arange(0, max_len, dtype=torch.float).unsqueeze(1)
        div_term = torch.exp(
            torch.arange(0, embed_dim, 2).float() * (-math.log(10000.0) / embed_dim)
        )

        pe[:, 0::2] = torch.sin(position * div_term)  # Even dimensions
        pe[:, 1::2] = torch.cos(position * div_term)  # Odd dimensions

        pe = pe.unsqueeze(0)  # (1, max_len, embed_dim)
        self.register_buffer("pe", pe)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        Args:
            x: (batch, seq_len, embed_dim)
        Returns:
            (batch, seq_len, embed_dim) with positional encoding added
        """
        x = x + self.pe[:, : x.shape[1], :]
        return self.dropout(x)


# Visualize positional encodings
pe = SinusoidalPositionalEncoding(embed_dim=128, max_len=100)
pe_values = pe.pe.squeeze(0).numpy()  # (100, 128)

# Different frequencies capture different scales of position
# Low dimensions → high-frequency (local position)
# High dimensions → low-frequency (global position)
```

**Mathematical formula:**

```
PE(pos, 2i)   = sin(pos / 10000^(2i/d_model))
PE(pos, 2i+1) = cos(pos / 10000^(2i/d_model))

where:
  pos = position in the sequence
  i   = dimension index
  d_model = embedding dimension
```

### 9.3 Learned Positional Embeddings

An alternative is to learn position embeddings as parameters (like in BERT):

```python
class LearnedPositionalEncoding(nn.Module):
    def __init__(self, embed_dim: int, max_len: int = 512, dropout: float = 0.1):
        super().__init__()
        self.position_embeddings = nn.Embedding(max_len, embed_dim)
        self.dropout = nn.Dropout(dropout)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        seq_len = x.shape[1]
        positions = torch.arange(seq_len, device=x.device).unsqueeze(0)
        return self.dropout(x + self.position_embeddings(positions))
```

| Feature | Sinusoidal (Fixed) | Learned |
|---------|-------------------|---------|
| Parameters | 0 (deterministic) | max_len × d_model |
| Generalization | Can handle longer sequences | Limited to max_len seen |
| Flexibility | Fixed pattern | Can learn task-specific patterns |
| Performance | Comparable | Comparable |
| Used in | Original Transformer, GPT-1 | BERT, most modern models |

---

## 10. Transformer Architecture

### 10.1 Complete Architecture

The Transformer replaces recurrence entirely with attention, enabling massive parallelism:

```
Transformer Architecture (Encoder-Decoder):

ENCODER:                                           DECODER:
┌─────────────────────────────┐                    ┌─────────────────────────────┐
│  Input Embedding            │                    │  Output Embedding           │
│  + Positional Encoding      │                    │  + Positional Encoding      │
├─────────────────────────────┤                    ├─────────────────────────────┤
│                             │                    │                             │
│  ┌───────────────────────┐  │                    │  ┌───────────────────────┐  │
│  │ Multi-Head Attention  │  │                    │  │ Masked Multi-Head     │  │
│  │ (Self-Attention)      │  │                    │  │ Attention (Causal)    │  │
│  └───────────┬───────────┘  │                    │  └───────────┬───────────┘  │
│              ↓              │                    │              ↓              │
│  ┌───────────────────────┐  │                    │  ┌───────────────────────┐  │
│  │ Add & LayerNorm       │  │                    │  │ Add & LayerNorm       │  │
│  └───────────┬───────────┘  │                    │  └───────────┬───────────┘  │
│              ↓              │                    │              ↓              │
│  ┌───────────────────────┐  │   Cross-Attention  │  ┌───────────────────────┐  │
│  │ Feed-Forward Network  │  │◄──────────────────►│  │ Multi-Head Attention  │  │
│  └───────────┬───────────┘  │                    │  │ (Cross-Attention)     │  │
│              ↓              │                    │  └───────────┬───────────┘  │
│  ┌───────────────────────┐  │                    │              ↓              │
│  │ Add & LayerNorm       │  │                    │  ┌───────────────────────┐  │
│  └───────────┬───────────┘  │                    │  │ Add & LayerNorm       │  │
│              ↓              │                    │  └───────────┬───────────┘  │
│                             │                    │              ↓              │
│  × N layers                 │                    │  ┌───────────────────────┐  │
│                             │                    │  │ Feed-Forward Network  │  │
│                             │                    │  └───────────┬───────────┘  │
│                             │                    │              ↓              │
│                             │                    │  ┌───────────────────────┐  │
│                             │                    │  │ Add & LayerNorm       │  │
│                             │                    │  └───────────┬───────────┘  │
│                             │                    │                             │
│                             │                    │  × N layers                 │
└─────────────────────────────┘                    └─────────────────────────────┘
              ↓                                              ↓
        Encoder Output ──────────────────────►         Linear + Softmax
                                                    (Vocabulary prediction)
```

### 10.2 Implementing a Complete Transformer

```python
import torch
import torch.nn as nn
import math


class TransformerBlock(nn.Module):
    """Single Transformer encoder block."""

    def __init__(
        self,
        embed_dim: int,
        num_heads: int,
        ff_dim: int,
        dropout: float = 0.1,
    ):
        super().__init__()
        self.attention = MultiHeadAttention(embed_dim, num_heads, dropout)
        self.norm1 = nn.LayerNorm(embed_dim)
        self.norm2 = nn.LayerNorm(embed_dim)
        self.feed_forward = nn.Sequential(
            nn.Linear(embed_dim, ff_dim),
            nn.GELU(),
            nn.Dropout(dropout),
            nn.Linear(ff_dim, embed_dim),
            nn.Dropout(dropout),
        )
        self.dropout = nn.Dropout(dropout)

    def forward(
        self, x: torch.Tensor, mask: torch.Tensor | None = None
    ) -> torch.Tensor:
        # Self-attention with residual connection and layer norm
        attn_output, _ = self.attention(x, x, x, mask=mask)
        x = self.norm1(x + self.dropout(attn_output))

        # Feed-forward with residual connection and layer norm
        ff_output = self.feed_forward(x)
        x = self.norm2(x + ff_output)

        return x


class TransformerEncoder(nn.Module):
    """Complete Transformer encoder."""

    def __init__(
        self,
        vocab_size: int,
        embed_dim: int,
        num_heads: int,
        ff_dim: int,
        num_layers: int,
        max_len: int = 512,
        dropout: float = 0.1,
    ):
        super().__init__()
        self.embed_dim = embed_dim
        self.token_embedding = nn.Embedding(vocab_size, embed_dim)
        self.position_encoding = SinusoidalPositionalEncoding(embed_dim, max_len, dropout)
        self.layers = nn.ModuleList(
            [TransformerBlock(embed_dim, num_heads, ff_dim, dropout) for _ in range(num_layers)]
        )
        self.norm = nn.LayerNorm(embed_dim)

    def forward(
        self, x: torch.Tensor, mask: torch.Tensor | None = None
    ) -> torch.Tensor:
        x = self.token_embedding(x) * math.sqrt(self.embed_dim)
        x = self.position_encoding(x)

        for layer in self.layers:
            x = layer(x, mask)

        return self.norm(x)


class TransformerDecoderBlock(nn.Module):
    """Transformer decoder block with cross-attention."""

    def __init__(
        self,
        embed_dim: int,
        num_heads: int,
        ff_dim: int,
        dropout: float = 0.1,
    ):
        super().__init__()
        # Masked self-attention
        self.self_attention = MultiHeadAttention(embed_dim, num_heads, dropout)
        self.norm1 = nn.LayerNorm(embed_dim)

        # Cross-attention (attending to encoder output)
        self.cross_attention = MultiHeadAttention(embed_dim, num_heads, dropout)
        self.norm2 = nn.LayerNorm(embed_dim)

        # Feed-forward
        self.feed_forward = nn.Sequential(
            nn.Linear(embed_dim, ff_dim),
            nn.GELU(),
            nn.Dropout(dropout),
            nn.Linear(ff_dim, embed_dim),
            nn.Dropout(dropout),
        )
        self.norm3 = nn.LayerNorm(embed_dim)
        self.dropout = nn.Dropout(dropout)

    def forward(
        self,
        x: torch.Tensor,
        encoder_output: torch.Tensor,
        src_mask: torch.Tensor | None = None,
        tgt_mask: torch.Tensor | None = None,
    ) -> torch.Tensor:
        # Masked self-attention
        attn_output, _ = self.self_attention(x, x, x, mask=tgt_mask)
        x = self.norm1(x + self.dropout(attn_output))

        # Cross-attention to encoder output
        cross_output, _ = self.cross_attention(
            query=x, key=encoder_output, value=encoder_output, mask=src_mask
        )
        x = self.norm2(x + self.dropout(cross_output))

        # Feed-forward
        ff_output = self.feed_forward(x)
        x = self.norm3(x + ff_output)

        return x


class FullTransformer(nn.Module):
    """Complete Encoder-Decoder Transformer."""

    def __init__(
        self,
        src_vocab_size: int,
        tgt_vocab_size: int,
        embed_dim: int = 512,
        num_heads: int = 8,
        ff_dim: int = 2048,
        num_encoder_layers: int = 6,
        num_decoder_layers: int = 6,
        max_len: int = 512,
        dropout: float = 0.1,
    ):
        super().__init__()
        self.embed_dim = embed_dim

        # Encoder
        self.encoder = TransformerEncoder(
            src_vocab_size, embed_dim, num_heads, ff_dim,
            num_encoder_layers, max_len, dropout,
        )

        # Decoder
        self.tgt_embedding = nn.Embedding(tgt_vocab_size, embed_dim)
        self.position_encoding = SinusoidalPositionalEncoding(embed_dim, max_len, dropout)
        self.decoder_layers = nn.ModuleList(
            [TransformerDecoderBlock(embed_dim, num_heads, ff_dim, dropout)
             for _ in range(num_decoder_layers)]
        )
        self.decoder_norm = nn.LayerNorm(embed_dim)

        # Output projection
        self.output_projection = nn.Linear(embed_dim, tgt_vocab_size)

    def generate_causal_mask(self, seq_len: int, device: torch.device) -> torch.Tensor:
        """Create causal (look-ahead) mask for decoder self-attention."""
        mask = torch.triu(torch.ones(seq_len, seq_len, device=device), diagonal=1)
        mask = mask.masked_fill(mask == 1, float("-inf"))
        return mask  # (seq_len, seq_len)

    def forward(
        self,
        src: torch.Tensor,
        tgt: torch.Tensor,
        src_mask: torch.Tensor | None = None,
    ) -> torch.Tensor:
        """
        Args:
            src: (batch, src_len) — source token IDs
            tgt: (batch, tgt_len) — target token IDs
        Returns:
            logits: (batch, tgt_len, tgt_vocab_size)
        """
        tgt_len = tgt.shape[1]

        # Encode
        encoder_output = self.encoder(src, src_mask)

        # Create causal mask
        tgt_mask = self.generate_causal_mask(tgt_len, tgt.device)

        # Decode
        x = self.tgt_embedding(tgt) * math.sqrt(self.embed_dim)
        x = self.position_encoding(x)

        for layer in self.decoder_layers:
            x = layer(x, encoder_output, src_mask, tgt_mask)

        x = self.decoder_norm(x)
        logits = self.output_projection(x)

        return logits


# Instantiate and test
model = FullTransformer(
    src_vocab_size=32000,
    tgt_vocab_size=32000,
    embed_dim=512,
    num_heads=8,
    ff_dim=2048,
    num_encoder_layers=6,
    num_decoder_layers=6,
)

src = torch.randint(0, 32000, (4, 30))   # Batch of 4 source sequences
tgt = torch.randint(0, 32000, (4, 25))   # Batch of 4 target sequences

output = model(src, tgt)
print(f"Transformer output: {output.shape}")  # (4, 25, 32000)

# Count parameters
total_params = sum(p.numel() for p in model.parameters())
print(f"Total parameters: {total_params:,}")  # ~65M parameters
```

### 10.3 PyTorch's Built-in Transformer

```python
import torch
import torch.nn as nn

# Using PyTorch's nn.Transformer
transformer = nn.Transformer(
    d_model=512,
    nhead=8,
    num_encoder_layers=6,
    num_decoder_layers=6,
    dim_feedforward=2048,
    dropout=0.1,
    batch_first=True,
)

src = torch.randn(4, 30, 512)  # Already embedded, (batch, src_len, d_model)
tgt = torch.randn(4, 25, 512)

output = transformer(src, tgt)
print(f"Output: {output.shape}")  # (4, 25, 512)

# Encoder-only (like BERT)
encoder_layer = nn.TransformerEncoderLayer(
    d_model=512, nhead=8, dim_feedforward=2048, batch_first=True
)
encoder = nn.TransformerEncoder(encoder_layer, num_layers=6)

x = torch.randn(4, 30, 512)
enc_output = encoder(x)
print(f"Encoder output: {enc_output.shape}")  # (4, 30, 512)

# Decoder-only (like GPT)
decoder_layer = nn.TransformerDecoderLayer(
    d_model=512, nhead=8, dim_feedforward=2048, batch_first=True
)
decoder = nn.TransformerDecoder(decoder_layer, num_layers=6)

memory = torch.randn(4, 30, 512)  # Encoder output
dec_output = decoder(tgt, memory)
print(f"Decoder output: {dec_output.shape}")  # (4, 25, 512)
```

---

## 11. Practical Projects

### 11.1 Text Classification with LSTM

A complete sentiment analysis model using LSTM:

```python
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, Dataset
import random


class TextClassificationDataset(Dataset):
    """Simple text classification dataset using token indices."""

    def __init__(self, texts: list[list[int]], labels: list[int], max_len: int = 200):
        self.texts = texts
        self.labels = labels
        self.max_len = max_len

    def __len__(self):
        return len(self.texts)

    def __getitem__(self, idx):
        text = self.texts[idx]
        # Pad or truncate to fixed length
        if len(text) >= self.max_len:
            text = text[: self.max_len]
        else:
            text = text + [0] * (self.max_len - len(text))
        return torch.tensor(text, dtype=torch.long), torch.tensor(self.labels[idx])


class SentimentLSTM(nn.Module):
    """Bidirectional LSTM for sentiment classification."""

    def __init__(
        self,
        vocab_size: int,
        embed_dim: int = 128,
        hidden_dim: int = 256,
        num_layers: int = 2,
        num_classes: int = 2,
        dropout: float = 0.3,
        pad_idx: int = 0,
    ):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embed_dim, padding_idx=pad_idx)
        self.lstm = nn.LSTM(
            embed_dim,
            hidden_dim,
            num_layers=num_layers,
            batch_first=True,
            bidirectional=True,
            dropout=dropout if num_layers > 1 else 0,
        )
        self.dropout = nn.Dropout(dropout)
        self.fc = nn.Linear(hidden_dim * 2, num_classes)  # *2 for bidirectional

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        Args:
            x: (batch, seq_len) — token indices
        Returns:
            logits: (batch, num_classes)
        """
        # Embed and apply dropout
        embedded = self.dropout(self.embedding(x))  # (batch, seq_len, embed_dim)

        # LSTM
        lstm_out, (h_n, c_n) = self.lstm(embedded)
        # lstm_out: (batch, seq_len, hidden*2)
        # h_n: (num_layers*2, batch, hidden)

        # Concatenate final forward and backward hidden states
        hidden = torch.cat([h_n[-2], h_n[-1]], dim=1)  # (batch, hidden*2)

        # Classify
        output = self.fc(self.dropout(hidden))
        return output


def generate_synthetic_data(
    num_samples: int = 1000, vocab_size: int = 5000, seq_len: int = 50
) -> tuple[list[list[int]], list[int]]:
    """Generate synthetic text data for demonstration."""
    texts = []
    labels = []
    for _ in range(num_samples):
        length = random.randint(10, seq_len)
        text = [random.randint(1, vocab_size - 1) for _ in range(length)]
        label = random.randint(0, 1)
        texts.append(text)
        labels.append(label)
    return texts, labels


def train_sentiment_model():
    """Complete training loop for sentiment LSTM."""
    # Hyperparameters
    VOCAB_SIZE = 5000
    EMBED_DIM = 128
    HIDDEN_DIM = 256
    NUM_LAYERS = 2
    NUM_CLASSES = 2
    BATCH_SIZE = 32
    EPOCHS = 10
    LR = 1e-3
    DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    # Create dataset and dataloader
    train_texts, train_labels = generate_synthetic_data(2000, VOCAB_SIZE)
    val_texts, val_labels = generate_synthetic_data(500, VOCAB_SIZE)

    train_dataset = TextClassificationDataset(train_texts, train_labels)
    val_dataset = TextClassificationDataset(val_texts, val_labels)

    train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE)

    # Initialize model
    model = SentimentLSTM(VOCAB_SIZE, EMBED_DIM, HIDDEN_DIM, NUM_LAYERS, NUM_CLASSES).to(DEVICE)
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=LR)
    scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(optimizer, patience=2, factor=0.5)

    # Training loop
    for epoch in range(EPOCHS):
        model.train()
        total_loss = 0.0
        correct = 0
        total = 0

        for texts, labels in train_loader:
            texts, labels = texts.to(DEVICE), labels.to(DEVICE)

            optimizer.zero_grad()
            logits = model(texts)
            loss = criterion(logits, labels)
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            optimizer.step()

            total_loss += loss.item()
            predictions = logits.argmax(dim=-1)
            correct += (predictions == labels).sum().item()
            total += labels.size(0)

        train_acc = correct / total
        avg_loss = total_loss / len(train_loader)

        # Validation
        model.eval()
        val_correct = 0
        val_total = 0
        val_loss = 0.0

        with torch.no_grad():
            for texts, labels in val_loader:
                texts, labels = texts.to(DEVICE), labels.to(DEVICE)
                logits = model(texts)
                val_loss += criterion(logits, labels).item()
                predictions = logits.argmax(dim=-1)
                val_correct += (predictions == labels).sum().item()
                val_total += labels.size(0)

        val_acc = val_correct / val_total
        val_loss /= len(val_loader)
        scheduler.step(val_loss)

        print(
            f"Epoch {epoch + 1}/{EPOCHS} | "
            f"Loss: {avg_loss:.4f} | Acc: {train_acc:.4f} | "
            f"Val Loss: {val_loss:.4f} | Val Acc: {val_acc:.4f}"
        )

    return model


# Run training
model = train_sentiment_model()
```

### 11.2 Machine Translation with Transformer

```python
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
import math


class TranslationDataset(Dataset):
    """Synthetic translation dataset for demonstration."""

    def __init__(
        self,
        src_texts: list[list[int]],
        tgt_texts: list[list[int]],
        src_vocab_size: int,
        tgt_vocab_size: int,
        max_len: int = 50,
    ):
        self.src_texts = src_texts
        self.tgt_texts = tgt_texts
        self.src_vocab_size = src_vocab_size
        self.tgt_vocab_size = tgt_vocab_size
        self.max_len = max_len

    def __len__(self):
        return len(self.src_texts)

    def __getitem__(self, idx):
        src = self.src_texts[idx][: self.max_len]
        tgt = self.tgt_texts[idx][: self.max_len]

        # Pad
        src = src + [0] * (self.max_len - len(src))
        tgt = tgt + [0] * (self.max_len - len(tgt))

        return torch.tensor(src, dtype=torch.long), torch.tensor(tgt, dtype=torch.long)


def train_translation_transformer():
    """Train a Transformer model for machine translation."""
    # Hyperparameters
    SRC_VOCAB = 5000
    TGT_VOCAB = 5000
    EMBED_DIM = 256
    NUM_HEADS = 8
    FF_DIM = 1024
    NUM_LAYERS = 4
    BATCH_SIZE = 64
    EPOCHS = 20
    LR = 3e-4
    DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    # Synthetic data
    import random

    train_src = [[random.randint(1, SRC_VOCAB - 1) for _ in range(random.randint(5, 30))] for _ in range(5000)]
    train_tgt = [[random.randint(1, TGT_VOCAB - 1) for _ in range(random.randint(5, 30))] for _ in range(5000)]
    val_src = [[random.randint(1, SRC_VOCAB - 1) for _ in range(random.randint(5, 30))] for _ in range(1000)]
    val_tgt = [[random.randint(1, TGT_VOCAB - 1) for _ in range(random.randint(5, 30))] for _ in range(1000)]

    train_dataset = TranslationDataset(train_src, train_tgt, SRC_VOCAB, TGT_VOCAB)
    val_dataset = TranslationDataset(val_src, val_tgt, SRC_VOCAB, TGT_VOCAB)
    train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE)

    # Model
    model = FullTransformer(
        src_vocab_size=SRC_VOCAB,
        tgt_vocab_size=TGT_VOCAB,
        embed_dim=EMBED_DIM,
        num_heads=NUM_HEADS,
        ff_dim=FF_DIM,
        num_encoder_layers=NUM_LAYERS,
        num_decoder_layers=NUM_LAYERS,
    ).to(DEVICE)

    # Ignore padding (index 0) in loss
    criterion = nn.CrossEntropyLoss(ignore_index=0)
    optimizer = torch.optim.Adam(model.parameters(), lr=LR, betas=(0.9, 0.98), eps=1e-9)
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=EPOCHS)

    # Training
    best_val_loss = float("inf")

    for epoch in range(EPOCHS):
        model.train()
        total_loss = 0.0

        for src, tgt in train_loader:
            src, tgt = src.to(DEVICE), tgt.to(DEVICE)

            # Teacher forcing: input is tgt[:, :-1], target is tgt[:, 1:]
            tgt_input = tgt[:, :-1]
            tgt_output = tgt[:, 1:]

            optimizer.zero_grad()
            logits = model(src, tgt_input)
            loss = criterion(logits.reshape(-1, TGT_VOCAB), tgt_output.reshape(-1))
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            optimizer.step()

            total_loss += loss.item()

        scheduler.step()
        avg_train_loss = total_loss / len(train_loader)

        # Validation
        model.eval()
        val_loss = 0.0
        with torch.no_grad():
            for src, tgt in val_loader:
                src, tgt = src.to(DEVICE), tgt.to(DEVICE)
                tgt_input = tgt[:, :-1]
                tgt_output = tgt[:, 1:]
                logits = model(src, tgt_input)
                loss = criterion(logits.reshape(-1, TGT_VOCAB), tgt_output.reshape(-1))
                val_loss += loss.item()

        avg_val_loss = val_loss / len(val_loader)
        print(
            f"Epoch {epoch + 1}/{EPOCHS} | "
            f"Train Loss: {avg_train_loss:.4f} | Val Loss: {avg_val_loss:.4f}"
        )

        if avg_val_loss < best_val_loss:
            best_val_loss = avg_val_loss
            torch.save(model.state_dict(), "best_translation.pt")

    return model


# model = train_translation_transformer()
```

### 11.3 Autoregressive Language Model Generation

```python
import torch
import torch.nn as nn
import torch.nn.functional as F


class AutoregressiveLM(nn.Module):
    """GPT-style decoder-only language model."""

    def __init__(
        self,
        vocab_size: int,
        embed_dim: int = 256,
        num_heads: int = 8,
        ff_dim: int = 1024,
        num_layers: int = 6,
        max_len: int = 512,
        dropout: float = 0.1,
    ):
        super().__init__()
        self.embed_dim = embed_dim
        self.token_embedding = nn.Embedding(vocab_size, embed_dim)
        self.position_encoding = SinusoidalPositionalEncoding(embed_dim, max_len, dropout)

        decoder_layer = nn.TransformerDecoderLayer(
            d_model=embed_dim,
            nhead=num_heads,
            dim_feedforward=ff_dim,
            dropout=dropout,
            batch_first=True,
            norm_first=True,  # Pre-norm (more stable training)
        )
        self.decoder = nn.TransformerDecoder(decoder_layer, num_layers=num_layers)
        self.ln_f = nn.LayerNorm(embed_dim)
        self.head = nn.Linear(embed_dim, vocab_size, bias=False)

        # Weight tying (input embeddings and output projection share weights)
        self.head.weight = self.token_embedding.weight

        self.max_len = max_len

    def _generate_causal_mask(self, size: int, device: torch.device) -> torch.Tensor:
        """Generate causal attention mask."""
        mask = torch.triu(torch.ones(size, size, device=device), diagonal=1)
        mask = mask.masked_fill(mask == 1, float("-inf"))
        return mask

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        Args:
            x: (batch, seq_len) — token indices
        Returns:
            logits: (batch, seq_len, vocab_size)
        """
        seq_len = x.shape[1]

        x = self.token_embedding(x) * math.sqrt(self.embed_dim)
        x = self.position_encoding(x)

        causal_mask = self._generate_causal_mask(seq_len, x.device)

        # Use self-attention via decoder with empty memory
        memory = torch.zeros(x.shape[0], 1, self.embed_dim, device=x.device)
        x = self.decoder(x, memory, tgt_mask=causal_mask)
        x = self.ln_f(x)
        logits = self.head(x)

        return logits

    @torch.no_grad()
    def generate(
        self,
        prompt: torch.Tensor,
        max_new_tokens: int = 100,
        temperature: float = 1.0,
        top_k: int = 50,
    ) -> torch.Tensor:
        """Autoregressive text generation with temperature and top-k sampling."""
        self.eval()
        generated = prompt.clone()

        for _ in range(max_new_tokens):
            # Truncate to max_len if necessary
            input_ids = generated[:, -self.max_len:]

            # Forward pass
            logits = self.forward(input_ids)
            next_token_logits = logits[:, -1, :] / temperature  # Last position

            # Top-k filtering
            if top_k > 0:
                topk_values, _ = torch.topk(next_token_logits, top_k)
                min_topk = topk_values[:, -1].unsqueeze(1)
                next_token_logits[next_token_logits < min_topk] = float("-inf")

            # Sample from distribution
            probs = F.softmax(next_token_logits, dim=-1)
            next_token = torch.multinomial(probs, num_samples=1)

            # Append to sequence
            generated = torch.cat([generated, next_token], dim=1)

        return generated


def train_language_model():
    """Train the autoregressive language model."""
    VOCAB_SIZE = 5000
    EMBED_DIM = 256
    BATCH_SIZE = 32
    SEQ_LEN = 128
    EPOCHS = 20
    DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    import random

    # Synthetic data
    texts = [
        [random.randint(1, VOCAB_SIZE - 1) for _ in range(random.randint(100, 500))]
        for _ in range(1000)
    ]

    model = AutoregressiveLM(VOCAB_SIZE, EMBED_DIM, num_heads=8, num_layers=4).to(DEVICE)
    optimizer = torch.optim.AdamW(model.parameters(), lr=3e-4, weight_decay=0.1)

    model.train()
    for epoch in range(EPOCHS):
        total_loss = 0.0
        random.shuffle(texts)

        for i in range(0, len(texts), BATCH_SIZE):
            batch_texts = texts[i : i + BATCH_SIZE]

            # Create input-target pairs (shifted by 1)
            input_ids = []
            target_ids = []
            for text in batch_texts:
                # Random chunk
                start = random.randint(0, max(0, len(text) - SEQ_LEN - 1))
                chunk = text[start : start + SEQ_LEN + 1]
                input_ids.append(chunk[:-1])
                target_ids.append(chunk[1:])

            # Pad to same length
            max_len = max(len(ids) for ids in input_ids)
            for j in range(len(input_ids)):
                pad_len = max_len - len(input_ids[j])
                input_ids[j] = input_ids[j] + [0] * pad_len
                target_ids[j] = target_ids[j] + [0] * pad_len

            input_ids = torch.tensor(input_ids, dtype=torch.long, device=DEVICE)
            target_ids = torch.tensor(target_ids, dtype=torch.long, device=DEVICE)

            logits = model(input_ids)
            loss = nn.functional.cross_entropy(
                logits.reshape(-1, VOCAB_SIZE),
                target_ids.reshape(-1),
                ignore_index=0,
            )

            optimizer.zero_grad()
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            optimizer.step()

            total_loss += loss.item()

        avg_loss = total_loss / max(1, len(texts) // BATCH_SIZE)
        print(f"Epoch {epoch + 1}/{EPOCHS} | Loss: {avg_loss:.4f}")

    # Generate text
    prompt = torch.randint(1, VOCAB_SIZE, (1, 10), device=DEVICE)
    generated = model.generate(prompt, max_new_tokens=50, temperature=0.8, top_k=40)
    print(f"Generated token IDs: {generated[0].tolist()}")

    return model


# model = train_language_model()
```

---

## 12. Handling Variable-Length Sequences: `pack_padded_sequence`

When working with real data, sequences often have different lengths. Padding all sequences to the maximum length wastes computation and introduces noise. `pack_padded_sequence` solves this by telling PyTorch which elements are padding:

```python
import torch
import torch.nn as nn
from torch.nn.utils.rnn import pack_padded_sequence, pad_packed_sequence


class PaddedLSTMClassifier(nn.Module):
    """LSTM classifier that handles variable-length sequences efficiently."""

    def __init__(self, vocab_size: int, embed_dim: int, hidden_dim: int, num_classes: int):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embed_dim)
        self.lstm = nn.LSTM(embed_dim, hidden_dim, batch_first=True, bidirectional=True)
        self.fc = nn.Linear(hidden_dim * 2, num_classes)

    def forward(
        self, x: torch.Tensor, lengths: torch.Tensor
    ) -> torch.Tensor:
        """
        Args:
            x: (batch, max_seq_len) — padded token indices
            lengths: (batch,) — actual lengths of each sequence
        Returns:
            logits: (batch, num_classes)
        """
        embedded = self.embedding(x)

        # Pack: removes padding from computation
        packed = pack_padded_sequence(
            embedded,
            lengths.cpu(),         # lengths must be on CPU
            batch_first=True,
            enforce_sorted=False,   # Allow unsorted batches
        )

        # LSTM processes only actual tokens
        packed_output, (h_n, c_n) = self.lstm(packed)

        # Unpack (optional — only needed if you want per-token outputs)
        output, _ = pad_packed_sequence(packed_output, batch_first=True)

        # Use final hidden states for classification
        hidden = torch.cat([h_n[-2], h_n[-1]], dim=1)
        return self.fc(hidden)


# Example usage
model = PaddedLSTMClassifier(vocab_size=5000, embed_dim=128, hidden_dim=256, num_classes=3)

# Batch with different lengths
max_len = 20
x = torch.randint(0, 5000, (8, max_len))
lengths = torch.tensor([5, 12, 8, 15, 3, 18, 10, 7])

logits = model(x, lengths)
print(f"Output: {logits.shape}")  # (8, 3)
```

| `pack_padded_sequence` Parameter | Description |
|----------------------------------|-------------|
| `input` | Padded tensor (batch, seq_len, features) |
| `lengths` | Actual sequence lengths (must be on CPU) |
| `batch_first` | Whether batch is the first dimension |
| `enforce_sorted` | If True, sequences must be sorted by length |
| `padding_value` | Value used for padding (default: 0) |

---

## 13. Comprehensive Comparison

| Architecture | Parameters | Parallelism | Long-Range Dependencies | Training Speed | Best For |
|-------------|-----------|-------------|----------------------|----------------|----------|
| Vanilla RNN | Few | Sequential only | Poor (vanishing) | Slow | Simple sequences |
| LSTM | Moderate | Sequential only | Good (cell state) | Moderate | Medium sequences, NLP |
| GRU | Fewer | Sequential only | Good | Fast | Small-medium sequences |
| Transformer | Many | Fully parallel | Excellent (attention) | Fast (GPU) | Long sequences, NLP, vision |
| GPT (Decoder) | Very many | Parallel (causal mask) | Excellent | Fast | Language generation |
| BERT (Encoder) | Many | Fully parallel | Excellent | Fast | Understanding, classification |

---

## 14. Summary

- **Sequential data** requires architectures that capture temporal dependencies across variable-length inputs
- **Vanilla RNNs** process sequences step-by-step but suffer from vanishing/exploding gradients, limiting their ability to learn long-range dependencies
- **LSTMs** solve this with a cell state and three gates (forget, input, output) that regulate information flow — the "constant error carousel" allows gradients to persist
- **GRUs** simplify LSTM with two gates (update, reset) and comparable performance with fewer parameters
- **Bidirectional RNNs** capture both past and future context; **stacked RNNs** increase model capacity
- **Sequence-to-sequence models** with encoder-decoder architecture enable tasks with different input/output lengths; **teacher forcing** accelerates training
- **Attention mechanisms** (Bahdanau, Luong) solve the information bottleneck by allowing the decoder to focus on relevant encoder states
- **Self-attention** enables each position to attend to all others; **multi-head attention** learns different relationship types in parallel
- **Positional encoding** (sinusoidal or learned) is essential because self-attention is permutation-invariant
- **Transformers** combine self-attention, multi-head attention, positional encoding, and feed-forward networks into a fully parallelizable architecture
- **`pack_padded_sequence`** efficiently handles variable-length sequences by excluding padding from computation

---

## 15. Practice Exercises

### Exercise 1: Implement a GRU from Scratch
Implement a GRU cell from scratch (without `nn.GRU`) and verify it produces similar results to `nn.GRU` when initialized with the same weights.

### Exercise 2: Bidirectional LSTM NER
Build a bidirectional LSTM model for Named Entity Recognition (NER) where each token must be classified. Use `pack_padded_sequence` for variable-length inputs and compute per-token accuracy excluding padding positions.

### Exercise 3: Attention Visualization
Implement a seq2seq model with Bahdanau attention for a simple task (e.g., copying sequences). Visualize the attention weight matrix as a heatmap to see what the model learns to attend to.

### Exercise 4: Transformer from Scratch
Implement the complete Transformer architecture (encoder and decoder) from scratch without using `nn.Transformer`. Train it on a small translation task and compare with the built-in implementation.

### Exercise 5: Positional Encoding Comparison
Compare sinusoidal positional encoding vs. learned positional embeddings. Train two identical Transformer models with each and measure performance differences across different sequence lengths.

### Exercise 6: Temperature and Top-k Effects
Implement text generation with both temperature and top-k sampling. Generate the same prompt at different temperatures (0.5, 0.8, 1.0, 1.2, 1.5) and analyze how the diversity vs. coherence tradeoff changes.

### Exercise 7: Gradient Flow Analysis
Compare gradient norms across time steps for vanilla RNN, LSTM, and GRU on sequences of length 100, 200, and 500. Plot the gradient magnitude at each time step to visualize the vanishing gradient problem.

### Exercise 8: Transformer Hyperparameter Sweep
Train a small Transformer (1-4 layers, 128-512 embed_dim, 2-8 heads) on a text task and create a comparison table of parameter count, training time, and validation performance.

### Exercise 9: Scheduled Sampling
Implement scheduled sampling in a seq2seq model and compare training curves with pure teacher forcing vs. free running. Experiment with different decay schedules (linear, exponential, inverse sigmoid).

### Exercise 10: Build a Mini-GPT
Using the decoder-only Transformer, train a character-level language model on a small text corpus (e.g., Shakespeare). Generate text after each training epoch to observe improvement.

---

*In the next chapter, we explore Generative Adversarial Networks — architectures that learn to generate realistic data by competing two neural networks against each other in a minimax game.*
