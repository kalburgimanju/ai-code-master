# Chapter 3: Autograd & Differentiation

**By Manjunath Kalburgi**

---

## What Is Automatic Differentiation?

**Automatic differentiation** (autodiff) is a technique for computing derivatives of functions defined by computer programs. Unlike symbolic differentiation (which manipulates mathematical expressions) or numerical differentiation (which approximates derivatives via finite differences), autodiff exploits the fact that every computer program is a composition of elementary operations whose derivatives are known.

```
┌──────────────────────────────────────────────────────────────────┐
│                Three Approaches to Differentiation               │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Symbolic Differentiation                                     │
│     Input:  f(x) = x² + 2x + 1                                 │
│     Output: f'(x) = 2x + 2                                      │
│     Pro: Exact analytical expression                             │
│     Con: Expression blowup, not all code is symbolically tractable│
│                                                                  │
│  2. Numerical Differentiation (Finite Differences)               │
│     f'(x) ≈ (f(x + h) - f(x)) / h    where h → 0               │
│     Pro: Works on any program, trivial to implement              │
│     Con: Truncation error (h too large) or roundoff (h too small)│
│          Requires TWO function evaluations per derivative         │
│          d-dimensional input requires d evaluations               │
│                                                                  │
│  3. Automatic Differentiation (PyTorch's Autograd)               │
│     Combines the chain rule with elementary derivative rules     │
│     Pro: Exact (up to floating-point), efficient O(1) per output │
│          Works on arbitrary Python code                           │
│     Con: Requires tracing execution, memory for graph storage    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Why Autograd Matters for Deep Learning

Training a neural network requires computing the gradient of the loss function with respect to every parameter (weight and bias). For a network with millions of parameters, computing these gradients analytically would be impossible. Autograd makes this automatic:

```
Loss = f(θ)     where θ = {w₁, b₁, w₂, b₂, ..., wₙ, bₙ}

Autograd computes: ∂Loss/∂w₁, ∂Loss/∂b₁, ∂Loss/∂w₂, ∂Loss/∂b₂, ...

For ALL parameters, with a SINGLE backward() call.
```

## Computation Graphs

At the heart of autograd is the **computation graph** — a directed acyclic graph (DAG) that records the sequence of operations performed on tensors.

### Static vs Dynamic Graphs

```
┌──────────────────────────────────────────────────────────────────┐
│             Static Graph (TensorFlow 1.x)                        │
│                                                                  │
│  1. Define the full graph BEFORE execution                       │
│  2. Graph structure is fixed for all inputs                      │
│  3. Optimized at compile time (XLA, TensorRT)                    │
│  4. Harder to debug — can't inspect intermediate values          │
│                                                                  │
│  x ──→ [matmul] ──→ [add] ──→ [relu] ──→ loss                  │
│         ↑  W          ↑  b                                        │
│                                                                  │
│  Graph is built once, then executed many times.                  │
├──────────────────────────────────────────────────────────────────┤
│             Dynamic Graph (PyTorch)                              │
│                                                                  │
│  1. Graph is built ON-THE-FLY during each forward pass           │
│  2. Graph changes with each execution (different code paths)     │
│  3. Natural Python debugging (pdb, print, breakpoints)           │
│  4. Dynamic control flow (if/else, loops) just works             │
│                                                                  │
│  Forward pass:  x ──→ [matmul] ──→ [add] ──→ [relu] ──→ loss   │
│  Backward pass: loss ──→ [relu'] ──→ [add'] ──→ [matmul'] ──→ x │
│                                                                  │
│  Graph is built and discarded with every forward pass.           │
│  Memory is freed after backward() unless retain_graph=True.     │
└──────────────────────────────────────────────────────────────────┘
```

### ASCII Diagram: A Simple Computation Graph

```python
# Let's trace: z = (x * y) + b
x = torch.tensor(2.0, requires_grad=True)
y = torch.tensor(3.0, requires_grad=True)
b = torch.tensor(1.0, requires_grad=True)

w = x * y       # w = 6.0
z = w + b       # z = 7.0
```

```
  Computation Graph for z = (x * y) + b:

       x (2.0)          y (3.0)
        \                  /
         \                /
          \              /
           v            v
          [ * ]  ← w = 6.0
            |
            |        b (1.0)
            |          |
            v          v
           [ + ]  ← z = 7.0
            |
            |
            v
         z = 7.0

  Backward pass (autograd):
  ∂z/∂b = 1                    (from + node)
  ∂z/∂w = 1                    (from + node)
  ∂z/∂x = ∂z/∂w · ∂w/∂x = 1 · y = 3.0   (chain rule through * node)
  ∂z/∂y = ∂z/∂w · ∂w/∂y = 1 · x = 2.0   (chain rule through * node)
```

### Forward and Backward Passes

```python
import torch

x = torch.tensor(2.0, requires_grad=True)
y = torch.tensor(3.0, requires_grad=True)

# Forward pass: builds the computation graph
w = x * y          # w = 6.0
z = w ** 2         # z = 36.0

# At this point, the graph is:
# x ──┐
#     ├──→ [mul] ──→ w ──→ [pow(2)] ──→ z
# y ──┘

print(f"Forward: z = {z.item()}")

# Backward pass: traverses the graph in reverse, computing gradients
z.backward()

# Now the gradients are computed:
# dz/dx = 2 * w * y = 2 * 6.0 * 3.0 = 36.0
# dz/dy = 2 * w * x = 2 * 6.0 * 2.0 = 24.0
print(f"dz/dx = {x.grad}")  # tensor(36.)
print(f"dz/dy = {y.grad}")  # tensor(24.)
```

## `requires_grad`: Tracking Operations

The `requires_grad` flag tells PyTorch to track all operations on a tensor for differentiation.

```python
import torch

# ── Creating tensors with gradient tracking ──────────────
a = torch.randn(3, requires_grad=True)     # Will track ops
b = torch.randn(3, requires_grad=True)     # Will track ops
c = torch.randn(3)                          # No tracking (default)
d = torch.randn(3, requires_grad=False)    # Explicitly no tracking

print(f"a.requires_grad: {a.requires_grad}")  # True
print(f"c.requires_grad: {c.requires_grad}")  # False

# ── Operations on tensors with requires_grad=True ────────
# The result inherits requires_grad=True
e = a + b
print(f"(a + b).requires_grad: {e.requires_grad}")  # True

f = a * c  # Mixing tracked and untracked
print(f"(a * c).requires_grad: {f.requires_grad}")  # True (inherited from a)

# ── Detaching from the graph ─────────────────────────────
g = a.detach()  # Creates a view with requires_grad=False
print(f"a.requires_grad: {a.requires_grad}")        # True
print(f"a.detach().requires_grad: {g.requires_grad}")  # False

# ── Setting requires_grad after creation ─────────────────
h = torch.randn(3)
h.requires_grad_(True)   # In-place method
print(f"After requires_grad_(True): {h.requires_grad}")

# ── nn.Module parameters have requires_grad=True by default
import torch.nn as nn
linear = nn.Linear(10, 5)
for name, param in linear.named_parameters():
    print(f"{name}: requires_grad={param.requires_grad}, shape={param.shape}")
```

### When `requires_grad` Matters

```python
import torch

# ✅ Training data should NOT have requires_grad
X_train = torch.randn(1000, 10)        # Default: False
y_train = torch.randint(0, 2, (1000,))

# ✅ Model parameters SHOULD have requires_grad
weights = torch.randn(10, 2, requires_grad=True)
bias = torch.randn(2, requires_grad=True)

# Forward pass
logits = X_train @ weights + bias
loss = torch.nn.functional.cross_entropy(logits, y_train)

# Backward pass — gradients computed only for tensors with requires_grad=True
loss.backward()

print(f"weights.grad shape: {weights.grad.shape}")  # [10, 2]
print(f"bias.grad shape: {bias.grad.shape}")         # [2]
# X_train.grad is None (wasn't tracked)
print(f"X_train.grad: {X_train.grad}")               # None
```

## The `backward()` Function

The `backward()` function computes gradients via reverse-mode automatic differentiation (backpropagation).

```python
import torch

# ── Scalar output (most common in deep learning) ─────────
x = torch.tensor(3.0, requires_grad=True)

# Build a computation: f(x) = x³ + 2x² - 5x + 3
# f'(x) = 3x² + 4x - 5
# f'(3) = 3(9) + 4(3) - 5 = 27 + 12 - 5 = 34

y = x**3 + 2*x**2 - 5*x + 3
y.backward()  # Scalar output, no arguments needed

print(f"f(3) = {y.item()}")         # 27 + 18 - 15 + 3 = 33
print(f"f'(3) = {x.grad.item()}")   # 27 + 12 - 5 = 34
```

### Vector Output and the Jacobian

```python
import torch

# When the output is a VECTOR, you need to pass a gradient argument
x = torch.tensor([1.0, 2.0, 3.0], requires_grad=True)

# y is a vector (3-element tensor)
y = x ** 2  # y = [1, 4, 9]

# For vector outputs, backward() requires a "gradient" argument
# of the same shape. This is the "vector" in "vector-Jacobian product"
gradient = torch.tensor([1.0, 1.0, 1.0])  # Sum of all components
y.backward(gradient=gradient)

# This computes: gradient @ Jacobian
# For dy/dx = 2x, and gradient = [1, 1, 1]:
# x.grad = [1*2*1, 1*2*2, 1*2*3] = [2, 4, 6]
print(f"dy/dx = {x.grad}")  # tensor([2., 4., 6.])

# Reset for next example
x.grad.zero_()

# Another example with custom gradient
y = x ** 2  # [1, 4, 9]
gradient = torch.tensor([1.0, 0.5, 0.1])
y.backward(gradient=gradient)
# x.grad = [1 * 2 * 1, 0.5 * 2 * 2, 0.1 * 2 * 3] = [2, 2, 0.6]
print(f"Weighted gradient: {x.grad}")  # tensor([2., 2., 0.6])
```

### The `.grad` Attribute

```python
import torch

# ── Accessing gradients ──────────────────────────────────
w = torch.randn(3, requires_grad=True)

# Forward
loss = (w ** 2).sum()  # loss = w₁² + w₂² + w₃²

# Backward
loss.backward()

# Gradients are stored in .grad
print(f"Gradients: {w.grad}")
print(f"Expected:  {2 * w.detach()}")  # d/dw(w²) = 2w

# ── Gradient properties ──────────────────────────────────
print(f"grad dtype: {w.grad.dtype}")
print(f"grad shape: {w.grad.shape}")
print(f"grad device: {w.grad.device}")
```

## Chain Rule in Practice

The chain rule is the foundation of backpropagation. PyTorch's autograd applies it automatically through the computation graph.

```python
import torch

# ── Manual chain rule vs autograd ────────────────────────

# Compute f(x) = sin(x² + 1)
# By chain rule: f'(x) = cos(x² + 1) · 2x

x = torch.tensor(2.0, requires_grad=True)

# Forward pass
u = x ** 2 + 1        # u = 5.0
y = torch.sin(u)       # y = sin(5.0)

# Backward pass (autograd applies chain rule automatically)
y.backward()

# Manual verification
import math
manual_grad = math.cos(5.0) * 2 * 2.0  # cos(u) · du/dx
autograd_grad = x.grad.item()

print(f"Autograd gradient:  {autograd_grad:.6f}")
print(f"Manual gradient:    {manual_grad:.6f}")
print(f"Match: {abs(autograd_grad - manual_grad) < 1e-6}")

# ── Deeper chain: nested operations ──────────────────────
x = torch.tensor(1.5, requires_grad=True)

# f(x) = exp(sin(x²))
# f'(x) = exp(sin(x²)) · cos(x²) · 2x
a = x ** 2              # a = 2.25
b = torch.sin(a)        # b = sin(2.25)
c = torch.exp(b)        # c = exp(sin(2.25))

c.backward()
manual = math.exp(math.sin(2.25)) * math.cos(2.25) * 2 * 1.5
print(f"\nNested function gradient:")
print(f"Autograd: {x.grad.item():.6f}")
print(f"Manual:   {manual:.6f}")
```

### Multi-Layer Chain Rule

```python
import torch

# Simulating a tiny neural network to show chain rule in action
x = torch.tensor(2.0, requires_grad=True)
w1 = torch.tensor(3.0, requires_grad=True)
w2 = torch.tensor(-1.0, requires_grad=True)

# Forward: simple 2-layer network
h = torch.relu(w1 * x)    # Hidden layer (with ReLU)
out = w2 * h              # Output layer
loss = (out - 5.0) ** 2   # MSE loss

# Backward: chain rule flows through the graph
loss.backward()

# Manual verification:
# h = relu(3 * 2) = relu(6) = 6
# out = -1 * 6 = -6
# loss = (-6 - 5)² = 121
# dloss/dout = 2(out - target) = 2(-6 - 5) = -22
# dloss/dw2 = dloss/dout · dw2/dout = -22 · h = -22 · 6 = -132
# dloss/dh = dloss/dout · dw2/dh = -22 · w2 = -22 · (-1) = 22
# dloss/dw1 = dloss/dh · dh/dw1 = 22 · (x if h > 0 else 0) = 22 · 2 = 44
# dloss/dx = dloss/dh · dh/dx = 22 · (w1 if h > 0 else 0) = 22 · 3 = 66

print(f"loss = {loss.item()}")           # 121
print(f"dloss/dout = {out.grad}")         # Not directly accessible
print(f"dloss/dw2 = {w2.grad.item()}")    # -132
print(f"dloss/dw1 = {w1.grad.item()}")    # 44
print(f"dloss/dx = {x.grad.item()}")      # 66
```

## Gradient Accumulation

PyTorch **accumulates gradients** by default — each `backward()` call adds to existing gradients rather than replacing them.

```python
import torch

# ── Gradient accumulation (default behavior) ─────────────
x = torch.tensor(2.0, requires_grad=True)

# First backward
y1 = x ** 2
y1.backward()
print(f"After 1st backward: x.grad = {x.grad.item()}")  # 4.0

# Second backward — GRADIENT IS ACCUMULATED!
y2 = x ** 3
y2.backward()
print(f"After 2nd backward: x.grad = {x.grad.item()}")  # 4 + 12 = 16

# ⚠️ This is almost always NOT what you want!
# You usually need to zero gradients before each backward pass.

# ── Zeroing gradients before backward ────────────────────
x.grad.zero_()  # Method 1: in-place zero

y = x ** 2
y.backward()
print(f"After zero + backward: x.grad = {x.grad.item()}")  # 4.0

# ── The standard training pattern ────────────────────────
model = torch.nn.Linear(10, 1)
optimizer = torch.optim.SGD(model.parameters(), lr=0.01)

for i in range(3):
    # Zero gradients (typically done by the optimizer)
    optimizer.zero_grad()

    # Forward
    output = model(torch.randn(1, 10))
    loss = (output - 1.0) ** 2

    # Backward
    loss.backward()

    print(f"Iteration {i+1}: grad norm = {sum(p.grad.norm().item() for p in model.parameters()):.6f}")

    # Update
    optimizer.step()

# ── Gradient accumulation for large batches ──────────────
# Simulate a batch size 4× larger by accumulating gradients
accumulation_steps = 4
optimizer.zero_grad()

for i in range(accumulation_steps):
    # Forward on a mini-batch
    mini_batch = torch.randn(8, 10)
    mini_target = torch.randn(8, 1)
    output = model(mini_batch)
    loss = ((output - mini_target) ** 2).sum() / accumulation_steps  # Scale loss
    loss.backward()  # Accumulates gradients

# Now gradients represent the average over 4 mini-batches
optimizer.step()
```

### When Gradient Accumulation Is Useful

```python
# 1. Simulating large batch sizes when GPU memory is limited
# 2. Training with effective batch size > GPU memory capacity
# 3. Implementing certain optimization algorithms (e.g., proximal methods)

# Correct pattern for gradient accumulation:
accumulation_steps = 8
optimizer.zero_grad()

for i, (data, target) in enumerate(dataloader):
    loss = model(data, target) / accumulation_steps
    loss.backward()

    if (i + 1) % accumulation_steps == 0:
        optimizer.step()
        optimizer.zero_grad()
```

## Detaching Tensors

Sometimes you need to stop gradient computation for part of the graph.

### `.detach()`

```python
import torch

x = torch.tensor([1.0, 2.0, 3.0], requires_grad=True)

# ── detach(): creates a new tensor that shares storage     │
│   but doesn't track operations                              │
y = x * 2
z = y.detach()  # z shares memory with y, but no grad tracking
print(f"y.requires_grad: {y.requires_grad}")     # True
print(f"z.requires_grad: {z.requires_grad}")     # False
print(f"y.data_ptr() == z.data_ptr(): {y.data_ptr() == z.data_ptr()}")  # True

# ── Practical: using detached values as constants ────────
# Compute loss but use a "frozen" version of part of the computation
model_a = torch.nn.Linear(10, 5)
model_b = torch.nn.Linear(5, 1)

x = torch.randn(1, 10)

# We want to train model_b but use model_a's output as a fixed input
with torch.no_grad():
    features = model_a(x).detach()  # Treat as constant

# Only model_b's parameters get gradients
output = model_b(features)
loss = (output - 1.0) ** 2
loss.backward()

# model_b has gradients
print(f"model_b grad exists: {any(p.grad is not None for p in model_b.parameters())}")
# model_a has NO gradients (it was detached)
print(f"model_a grad exists: {any(p.grad is not None for p in model_a.parameters())}")
```

### `.data` Access

```python
import torch

x = torch.tensor([1.0, 2.0, 3.0], requires_grad=True)

# .data returns the raw data tensor (no grad tracking)
y = x * 2
z = y.data  # Underlying storage, no graph

# ⚠️ CAUTION: .data is dangerous — modifications affect the original tensor
# without going through autograd!
x.data.fill_(100)  # Modifies x in-place without autograd knowing
print(f"x after .data.fill_: {x}")  # [100, 100, 100]

# Use .detach() instead of .data — it's safer
x2 = torch.tensor([1.0, 2.0, 3.0], requires_grad=True)
x2_detached = x2.detach()
x2_detached.fill_(100)  # Also affects x2 (shares storage)
print(f"x2 after detach().fill_: {x2}")  # [100, 100, 100]

# The key difference: .detach() is the recommended way; .data is legacy
```

## `torch.no_grad()` Context Manager

Disables gradient computation entirely within its scope — saves memory and computation.

```python
import torch

# ── Basic usage ──────────────────────────────────────────
x = torch.randn(3, requires_grad=True)

with torch.no_grad():
    # No gradients computed here
    y = x * 2
    print(f"y.requires_grad: {y.requires_grad}")  # False

# Outside the context, gradients are tracked again
z = x * 2
print(f"z.requires_grad: {z.requires_grad}")  # True

# ── Practical: inference / evaluation ────────────────────
model = torch.nn.Linear(10, 5)
x = torch.randn(1, 10)

# Evaluation: no need for gradients
with torch.no_grad():
    output = model(x)
    predictions = torch.argmax(output, dim=1)

print(f"Predictions: {predictions}")

# ── Practical: computing metrics ─────────────────────────
def compute_accuracy(model, dataloader, device):
    model.eval()
    correct = 0
    total = 0

    with torch.no_grad():
        for batch_x, batch_y in dataloader:
            batch_x, batch_y = batch_x.to(device), batch_y.to(device)
            output = model(batch_x)
            predicted = output.argmax(dim=1)
            correct += (predicted == batch_y).sum().item()
            total += batch_y.size(0)

    return correct / total

# ── Practical: logging without graph overhead ────────────
x = torch.randn(100, 100, requires_grad=True)
y = (x @ torch.randn(100, 50))

# Without no_grad: graph is stored (memory waste)
# with_grad_grad_norm = y.norm().item()  # Still builds graph!

with torch.no_grad():
    # These computations don't build the graph
    mean_val = y.mean().item()
    max_val = y.max().item()
    norm_val = y.norm().item()
    print(f"Stats (no graph): mean={mean_val:.4f}, max={max_val:.4f}, norm={norm_val:.4f}")
```

## `torch.set_grad_enabled()`

A more flexible way to enable/disable gradients, useful as a function-level toggle.

```python
import torch

# ── Basic usage ──────────────────────────────────────────
x = torch.randn(3, requires_grad=True)

# Disable gradients
torch.set_grad_enabled(False)
y = x * 2
print(f"y.requires_grad: {y.requires_grad}")  # False

# Re-enable gradients
torch.set_grad_enabled(True)
z = x * 2
print(f"z.requires_grad: {z.requires_grad}")  # True

# ── Check current state ──────────────────────────────────
print(f"Grad enabled: {torch.is_grad_enabled()}")  # True

# ── Practical: training vs inference function ────────────
def forward_pass(model, x, training=True):
    with torch.set_grad_enabled(training):
        output = model(x)
        if training:
            loss = compute_loss(output)
            loss.backward()
        return output

# ── Decorator pattern ───────────────────────────────────
import functools

def no_grad(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        with torch.no_grad():
            return func(*args, **kwargs)
    return wrapper

@no_grad
def evaluate(model, x):
    return model(x)
```

## Hook Functions

Hooks let you inspect or modify gradients during the forward/backward pass without changing the model code.

### Forward Hooks

```python
import torch
import torch.nn as nn

model = nn.Sequential(
    nn.Linear(10, 20),
    nn.ReLU(),
    nn.Linear(20, 5),
)

# ── Forward hook: runs after the layer's forward pass ────
activations = {}

def save_activation(name):
    def hook(module, input, output):
        activations[name] = output.detach()
    return hook

# Register hooks on each layer
for name, layer in model.named_modules():
    if isinstance(layer, nn.Linear):
        layer.register_forward_hook(save_activation(name))

# Run forward pass
x = torch.randn(1, 10)
output = model(x)

# Inspect saved activations
for name, act in activations.items():
    print(f"{name}: shape={act.shape}, mean={act.mean():.4f}, std={act.std():.4f}")
```

### Backward Hooks

```python
import torch
import torch.nn as nn

model = nn.Linear(10, 5)
grads = {}

def save_gradient(name):
    def hook(module, grad_input, grad_output):
        grads[name] = {
            'grad_input': [g.detach() if g is not None else None for g in grad_input],
            'grad_output': [g.detach() for g in grad_output],
        }
    return hook

# Register backward hook
model.register_full_backward_hook(save_gradient('linear'))

# Forward + backward
x = torch.randn(1, 10, requires_grad=True)
output = model(x)
loss = output.sum()
loss.backward()

# Inspect gradients
for name, g in grads.items():
    print(f"\n{name}:")
    print(f"  grad_output shape: {g['grad_output'][0].shape}")
    print(f"  grad_output: {g['grad_output'][0]}")
```

### Gradient Hooks (per-tensor)

```python
import torch

# ── register_hook: per-tensor gradient hook ──────────────
x = torch.randn(3, requires_grad=True)
w = torch.randn(3, requires_grad=True)

def print_grad(grad):
    print(f"  Gradient norm: {grad.norm():.4f}")
    return grad  # Must return the (possibly modified) gradient

# Register hook on x's gradient
x.register_hook(print_grad)
w.register_hook(print_grad)

# Forward
y = (x * w).sum()
print("Backward pass:")
y.backward()

# The hook fires during backward, printing gradient norms
```

## Gradient Clipping

Gradient clipping prevents **exploding gradients** — a common problem in deep networks and RNNs.

```python
import torch
import torch.nn as nn

model = nn.LSTM(100, 200, num_layers=3, batch_first=True)
optimizer = torch.optim.Adam(model.parameters(), lr=0.001)

# ── Method 1: Clip by norm (most common) ─────────────────
# Limits the L2 norm of the total gradient vector
x = torch.randn(32, 50, 100)  # (batch, seq_len, features)
output, _ = model(x)
loss = output.sum()
loss.backward()

# Clip gradient norm to max value 1.0
# This rescales ALL gradients proportionally if the norm exceeds 1.0
torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)

# Check the gradient norm after clipping
total_norm = torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
print(f"Total gradient norm (before clipping): {total_norm:.4f}")

optimizer.step()
optimizer.zero_grad()

# ── Method 2: Clip by value ──────────────────────────────
# Clips each gradient element to [-value, value]
x = torch.randn(32, 50, 100)
output, _ = model(x)
loss = output.sum()
loss.backward()

torch.nn.utils.clip_grad_value_(model.parameters(), clip_value=0.5)
# All gradient values will be in [-0.5, 0.5]

optimizer.step()
optimizer.zero_grad()

# ── Practical training loop with gradient clipping ────────
def train_with_clipping(model, dataloader, optimizer, max_norm=1.0):
    model.train()
    total_loss = 0

    for batch_x, batch_y in dataloader:
        optimizer.zero_grad()

        output = model(batch_x)
        loss = nn.functional.cross_entropy(output, batch_y)
        loss.backward()

        # Gradient clipping BEFORE optimizer step
        grad_norm = torch.nn.utils.clip_grad_norm_(
            model.parameters(), max_norm=max_norm
        )

        optimizer.step()
        total_loss += loss.item()

    return total_loss / len(dataloader)

# ── Visualizing gradient norms ────────────────────────────
import torch

model = nn.Sequential(
    nn.Linear(100, 256),
    nn.ReLU(),
    nn.Linear(256, 256),
    nn.ReLU(),
    nn.Linear(256, 10),
)

grad_norms = []
for step in range(100):
    x = torch.randn(32, 100)
    target = torch.randint(0, 10, (32,))

    output = model(x)
    loss = nn.functional.cross_entropy(output, target)
    loss.backward()

    grad_norm = torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=5.0)
    grad_norms.append(grad_norm.item())

    optimizer = torch.optim.SGD(model.parameters(), lr=0.01)
    optimizer.step()
    optimizer.zero_grad()

print(f"Gradient norm stats: min={min(grad_norms):.4f}, max={max(grad_norms):.4f}, mean={sum(grad_norms)/len(grad_norms):.4f}")
```

## Higher-Order Derivatives

PyTorch supports computing derivatives of derivatives — useful for techniques like curvature estimation and certain optimization methods.

```python
import torch

# ── Second-order derivative ──────────────────────────────
x = torch.tensor(3.0, requires_grad=True)

# f(x) = x⁴
y = x ** 4
y.backward(create_graph=True)  # create_graph=True enables higher-order
print(f"f'(x)  = {x.grad.item()}")    # 4 * 3³ = 108

# Now compute the second derivative
x.grad.backward()  # Backward on the gradient
print(f"f''(x) = {x.grad.grad.item()}")  # 12 * 3² = 108

# ── Practical: Hessian-vector product ────────────────────
def f(x):
    return (x ** 3).sum()

x = torch.randn(3, requires_grad=True)

# First derivative
y = f(x)
grad = torch.autograd.grad(y, x, create_graph=True)[0]
print(f"Gradient: {grad}")

# Hessian-vector product (H @ v)
v = torch.randn(3)
hvp = torch.autograd.grad(grad, x, grad_outputs=v, create_graph=True)[0]
print(f"Hessian-vector product: {hvp}")

# ── Gradient of a gradient (double backward) ─────────────
x = torch.tensor(2.0, requires_grad=True)

# f(x) = x²
y = x ** 2
g, = torch.autograd.grad(y, x, create_graph=True)  # g = 2x
print(f"First grad (2x): {g}")

# Second derivative
g2, = torch.autograd.grad(g, x)
print(f"Second grad (2): {g2}")  # Constant 2.0

# ── Practical: Fisher Information approximation ──────────
model = nn.Linear(10, 2)
x = torch.randn(1, 10)

# Forward
output = model(x)
loss = nn.functional.cross_entropy(output, torch.tensor([1]))

# Get gradients
grads = torch.autograd.grad(loss, model.parameters(), create_graph=True)

# Compute gradient norm squared (Fisher trace approximation)
grad_norm_sq = sum((g ** 2).sum() for g in grads)
print(f"Gradient norm squared: {grad_norm_sq.item()}")
```

## Practical Example: Fitting a Line

Let's use autograd to find the best-fit line through noisy data.

```python
import torch
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend
import matplotlib.pyplot as plt

# ── Generate synthetic data: y = 3x + 2 + noise ─────────
torch.manual_seed(42)
n_samples = 100
x_data = torch.randn(n_samples, 1)
noise = torch.randn(n_samples, 1) * 0.5
y_data = 3.0 * x_data + 2.0 + noise

# ── Initialize parameters ────────────────────────────────
w = torch.randn(1, requires_grad=True)
b = torch.randn(1, requires_grad=True)

# ── Training loop ────────────────────────────────────────
learning_rate = 0.1
n_epochs = 50

losses = []
for epoch in range(n_epochs):
    # Forward pass
    y_pred = x_data * w + b

    # Compute MSE loss
    loss = ((y_pred - y_data) ** 2).mean()

    # Backward pass (compute gradients)
    loss.backward()

    # Update parameters (in-place, no grad tracking needed)
    with torch.no_grad():
        w -= learning_rate * w.grad
        b -= learning_rate * b.grad

    # Zero gradients
    w.grad.zero_()
    b.grad.zero_()

    losses.append(loss.item())

    if (epoch + 1) % 10 == 0:
        print(f"Epoch [{epoch+1:2d}/{n_epochs}], Loss: {loss.item():.4f}, "
              f"w: {w.item():.4f}, b: {b.item():.4f}")

# ── Results ──────────────────────────────────────────────
print(f"\nFinal: y = {w.item():.4f}x + {b.item():.4f}")
print(f"True:  y = 3.0000x + 2.0000")

# ── Plot results ─────────────────────────────────────────
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5))

# Data and fit
ax1.scatter(x_data.numpy(), y_data.numpy(), alpha=0.3, label='Data')
x_line = torch.linspace(-3, 3, 100).unsqueeze(1)
y_line = w.detach() * x_line + b.detach()
ax1.plot(x_line.numpy(), y_line.numpy(), 'r-', linewidth=2, label=f'Fit: y={w.item():.2f}x+{b.item():.2f}')
ax1.legend()
ax1.set_title('Line Fitting with Autograd')
ax1.set_xlabel('x')
ax1.set_ylabel('y')

# Loss curve
ax2.plot(losses)
ax2.set_title('Training Loss')
ax2.set_xlabel('Epoch')
ax2.set_ylabel('MSE Loss')
ax2.set_yscale('log')

plt.tight_layout()
plt.savefig('line_fitting.png', dpi=150)
print("Plot saved to line_fitting.png")
```

## Computing Custom Gradients with `torch.autograd.Function`

For operations that aren't part of PyTorch's built-in ops, you can define custom forward and backward passes.

```python
import torch
from torch.autograd import Function

# ── Custom autograd function: Swish activation ───────────
class Swish(Function):
    @staticmethod
    def forward(ctx, x):
        # Save anything needed for backward
        ctx.save_for_backward(x)
        return x * torch.sigmoid(x)

    @staticmethod
    def backward(ctx, grad_output):
        x, = ctx.saved_tensors
        sigmoid = torch.sigmoid(x)
        # d/dx [x * sigmoid(x)] = sigmoid(x) + x * sigmoid(x) * (1 - sigmoid(x))
        grad_input = grad_output * (sigmoid + x * sigmoid * (1 - sigmoid))
        return grad_input

# Usage
x = torch.randn(3, requires_grad=True)
y = Swish.apply(x)  # Forward
y.sum().backward()   # Backward
print(f"Swish output: {y}")
print(f"Swish gradient: {x.grad}")

# ── Verify against numerical gradient ────────────────────
def swish(x):
    return x * torch.sigmoid(x)

x_test = torch.tensor([1.0, 2.0, -1.0], requires_grad=True)
y_custom = Swish.apply(x_test)
y_custom.sum().backward()
custom_grads = x_test.grad.clone()

x_test2 = torch.tensor([1.0, 2.0, -1.0], requires_grad=True)
y_builtin = swish(x_test2)
y_builtin.sum().backward()
builtin_grads = x_test2.grad.clone()

print(f"\nCustom grad:   {custom_grads}")
print(f"Reference grad: {builtin_grads}")
print(f"Match: {torch.allclose(custom_grads, builtin_grads)}")
```

### Complex Custom Operation

```python
import torch
from torch.autograd import Function

class MyLinear(Function):
    """Custom linear layer with manual forward/backward."""

    @staticmethod
    def forward(ctx, input, weight, bias):
        ctx.save_for_backward(input, weight, bias)
        output = input @ weight.t()
        if bias is not None:
            output += bias
        return output

    @staticmethod
    def backward(ctx, grad_output):
        input, weight, bias = ctx.saved_tensors
        grad_input = grad_output @ weight
        grad_weight = grad_output.t() @ input
        grad_bias = grad_output.sum(0) if bias is not None else None
        return grad_input, grad_weight, grad_bias

# Test
input = torch.randn(4, 10, requires_grad=True)
weight = torch.randn(5, 10, requires_grad=True)
bias = torch.randn(5, requires_grad=True)

output = MyLinear.apply(input, weight, bias)
output.sum().backward()

print(f"Custom linear output shape: {output.shape}")     # [4, 5]
print(f"grad_input shape: {input.grad.shape}")             # [4, 10]
print(f"grad_weight shape: {weight.grad.shape}")           # [5, 10]
print(f"grad_bias shape: {bias.grad.shape}")               # [5]

# Verify against nn.Linear
linear = torch.nn.Linear(10, 5, bias=True)
with torch.no_grad():
    linear.weight.copy_(weight)
    linear.bias.copy_(bias)

output_ref = linear(input.detach().requires_grad_(True))
output_ref.sum().backward()
print(f"\nReference grad input matches: {torch.allclose(input.grad, input.detach().requires_grad_(True).grad)}")
```

## Common Pitfalls and Debugging Gradients

### Pitfall 1: Forgetting to Zero Gradients

```python
# ❌ WRONG: Gradients accumulate across iterations
x = torch.tensor(2.0, requires_grad=True)
for i in range(5):
    y = x ** 2
    y.backward()
    print(f"Iteration {i}: grad = {x.grad}")  # 4, 8, 12, 16, 20 — WRONG!

# ✅ CORRECT: Zero gradients before backward
x = torch.tensor(2.0, requires_grad=True)
for i in range(5):
    if x.grad is not None:
        x.grad.zero_()
    y = x ** 2
    y.backward()
    print(f"Iteration {i}: grad = {x.grad}")  # 4, 4, 4, 4, 4
```

### Pitfall 2: In-Place Operations on Leaf Tensors

```python
# ❌ WRONG: In-place ops on leaf tensors requiring grad
x = torch.tensor([1.0, 2.0, 3.0], requires_grad=True)
x.add_(1)  # RuntimeError!

# ✅ CORRECT: Use out-of-place operations
x = torch.tensor([1.0, 2.0, 3.0], requires_grad=True)
x = x + 1  # Creates a new tensor
```

### Pitfall 3: Detaching Before Operations

```python
# ❌ WRONG: Detaching before the operation you want to differentiate
x = torch.tensor(2.0, requires_grad=True)
w = torch.randn(1, requires_grad=True)
y = (x.detach() * w)  # x.detach() has requires_grad=False
y.backward()           # w.grad is computed, but x.grad is NOT

# ✅ CORRECT: Only detach when you truly want to stop gradients
x = torch.tensor(2.0, requires_grad=True)
w = torch.randn(1, requires_grad=True)
y = x * w  # Both x and w get gradients
y.backward()
```

### Pitfall 4: Mixed Devices

```python
# ❌ WRONG: Moving tensors to different devices
x = torch.randn(3, requires_grad=True)
try:
    x_gpu = x.cuda()  # If GPU is available, this creates a new tensor
    y = x_gpu ** 2
    y.backward()
    # x.grad is None! The gradient was computed for x_gpu, not x
except RuntimeError:
    pass  # No GPU available

# ✅ CORRECT: Keep everything on the same device
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
x = torch.randn(3, requires_grad=True, device=device)
y = x ** 2
y.backward()
print(f"grad on {x.grad.device}: {x.grad}")
```

### Debugging Utilities

```python
import torch

# ── Check if gradients exist ─────────────────────────────
model = torch.nn.Linear(10, 5)
x = torch.randn(1, 10)
output = model(x)
loss = output.sum()
loss.backward()

for name, param in model.named_parameters():
    if param.grad is not None:
        print(f"{name}: grad norm = {param.grad.norm():.6f}")
    else:
        print(f"{name}: NO GRADIENT!")

# ── Detect NaN gradients ─────────────────────────────────
model = torch.nn.Linear(10, 5)
x = torch.randn(1, 10)
output = model(x)
loss = output.sum()
loss.backward()

for name, param in model.named_parameters():
    if param.grad is not None:
        has_nan = torch.isnan(param.grad).any().item()
        has_inf = torch.isinf(param.grad).any().item()
        print(f"{name}: nan={has_nan}, inf={has_inf}, norm={param.grad.norm():.6f}")

# ── Gradient hook for debugging ──────────────────────────
def detect_nan_grad(grad):
    if torch.isnan(grad).any():
        print(f"⚠️ NaN gradient detected! Norm: {grad.norm()}")
    return grad

x = torch.randn(5, requires_grad=True)
x.register_hook(detect_nan_grad)
y = (x ** 2).sum()
y.backward()  # No NaN, but hook would fire if there were

# ── Check gradient computation graph ─────────────────────
x = torch.randn(3, requires_grad=True)
y = x * 2
z = y.sum()
print(f"z.grad_fn: {z.grad_fn}")         # SumBackward0
print(f"y.grad_fn: {y.grad_fn}")         # MulBackward0
print(f"x.grad_fn: {x.grad_fn}")         # None (leaf tensor)
print(f"z.is_leaf: {z.is_leaf}")         # False
print(f"x.is_leaf: {x.is_leaf}")         # True
```

## Summary

In this chapter, we covered:

1. **Automatic Differentiation**: The technique behind efficient gradient computation — superior to symbolic and numerical differentiation
2. **Computation Graphs**: Dynamic DAGs built on-the-fly during forward passes, traced backward during `backward()`
3. **`requires_grad`**: The flag that tells PyTorch to track operations for gradient computation
4. **`backward()`**: The function that triggers reverse-mode autodiff, computing gradients via the chain rule
5. **Scalar vs Vector outputs**: Scalar outputs use plain `backward()`; vector outputs require a gradient argument for the vector-Jacobian product
6. **Gradient Accumulation**: PyTorch accumulates gradients by default — always zero before backward in training
7. **Detaching Tensors**: `.detach()` and `torch.no_grad()` to stop gradient tracking
8. **`torch.set_grad_enabled()`**: Flexible context manager for toggling gradient computation
9. **Hook Functions**: `register_hook`, `register_forward_hook`, `register_full_backward_hook` for inspecting and modifying gradients
10. **Gradient Clipping**: `clip_grad_norm_` and `clip_grad_value_` to prevent exploding gradients
11. **Higher-Order Derivatives**: Using `create_graph=True` for second-order and beyond
12. **Custom Autograd Functions**: `torch.autograd.Function` with `forward` and `backward` for custom operations
13. **Common Pitfalls**: Forgetting to zero gradients, in-place ops, detached tensors, mixed devices
14. **Debugging**: Gradient hooks, NaN detection, inspecting `.grad_fn`

## Practice Exercises

### Exercise 1: Gradient Verification

Compute the gradient of `f(x, y) = x²y + sin(xy)` at the point `(2, π)` using:
1. PyTorch autograd
2. Manual computation using calculus
3. Numerical approximation using finite differences: `(f(x+h) - f(x-h)) / (2h)` with `h = 1e-5`

Verify all three methods agree to at least 4 decimal places.

### Exercise 2: Custom Activation Function

Implement a **GELU** (Gaussian Error Linear Unit) as a custom `torch.autograd.Function`:
- Forward: `GELU(x) = x · Φ(x)` where `Φ(x)` is the CDF of the standard normal distribution
- Approximate formula: `0.5x(1 + tanh(√(2/π)(x + 0.044715x³)))`
- Verify your implementation matches `torch.nn.functional.gelu`

### Exercise 3: Gradient Accumulation Experiment

Write a script that demonstrates gradient accumulation:
1. Create a simple linear model
2. Train using effective batch size 32, but accumulate gradients over 4 mini-batches of size 8
3. Compare the resulting weight updates with a single forward-backward pass with batch size 32
4. The final weights should be identical (or nearly so)

### Exercise 4: Vanishing Gradients Demonstration

Create a deep network (10+ layers) with sigmoid activations:
1. Initialize all weights to the same value
2. Forward pass a batch of data
3. Backward pass and inspect gradient norms at each layer
4. Plot the gradient norm per layer
5. Repeat with ReLU activations and compare

### Exercise 5: Second-Order Optimization

Implement **Newton's method** for a simple quadratic function:
- `f(x) = 0.5 * x^T A x - b^T x` where A is positive definite
- Use autograd to compute both gradient and Hessian
- Update rule: `x_new = x - H^{-1} @ grad`
- Show convergence in fewer steps than gradient descent

### Exercise 6: Gradient Checkpointing

Research and implement gradient checkpointing:
1. Create a deep model that doesn't fit in "memory" (simulate by tracking peak memory)
2. Use `torch.utils.checkpoint.checkpoint` to trade compute for memory
3. Measure and compare peak memory usage with and without checkpointing
4. Show that gradients are identical in both cases

---

*You now have a deep understanding of PyTorch's autograd system — the engine that powers all neural network training. In the next chapters, we'll build on this foundation to explore neural network modules, loss functions, optimizers, and complete training pipelines.*
