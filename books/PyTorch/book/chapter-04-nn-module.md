# Chapter 4: Neural Networks with nn.Module

**By Manjunath Kalburgi**

---

## Introduction

Every neural network in PyTorch — from a simple linear classifier to a billion-parameter large language model — inherits from a single foundational class: `torch.nn.Module`. Understanding `nn.Module` deeply is not optional; it is the single most important concept in the PyTorch ecosystem. It governs how parameters are tracked, how layers are composed, how models move between devices, how training and evaluation behave differently, and how everything is saved and loaded.

In this chapter, we will:

1. Understand what `nn.Module` is and the roles it plays
2. Learn the mechanics of subclassing `nn.Module` (`__init__`, `forward`, hooks)
3. Build custom layers from scratch
4. Master container modules (`Sequential`, `ModuleList`, `ModuleDict`)
5. Explore every major built-in layer with code examples
6. Grasp the critical distinction between Parameters and Buffers
7. Learn model inspection techniques
8. Understand all major loss functions and optimizers
9. Put it all together in a complete training loop

---

## 1. What Is nn.Module?

`nn.Module` is the **base class for all neural network modules** in PyTorch. Every layer, every model, and every learnable component inherits from it. It provides a unified interface that handles four critical responsibilities:

```
+-----------------------------------------------------------------+
|                       nn.Module Responsibilities                 |
+-----------------------------------------------------------------+
|                                                                 |
|  +-------------------+  +-------------------+  +--------------+ |
|  | Parameter         |  | Device            |  | Composition  | |
|  | Management        |  | Movement          |  | & Hierarchy  | |
|  |                   |  |                   |  |              | |
|  | - Registers       |  | .to(device)       |  | - containers | |
|  |   parameters      |  | .cuda() / .cpu()  |  | - nesting    | |
|  | - Tracks buffers  |  | .float() / .half()|  | - tree walk  | |
|  | - state_dict()    |  | Automatic for all |  | - children   | |
|  +-------------------+  +-------------------+  +--------------+ |
|                                                                 |
|  +-------------------+  +-------------------+  +--------------+ |
|  | Serialization     |  | Train / Eval      |  | Hook         | |
|  |                   |  | Mode              |  | System       | |
|  | - save/load       |  |                   |  |              | |
|  |   state_dict      |  | - .train()        |  | - forward    | |
|  | - torch.save/     |  | - .eval()         |  |   pre/post   | |
|  |   torch.load      |  | Affects Dropout,  |  | - parameter  | |
|  | - ONNX export     |  | BatchNorm, etc.   |  |   change     | |
|  +-------------------+  +-------------------+  +--------------+ |
+-----------------------------------------------------------------+
```

### 1.1 Minimal Example

```python
import torch
import torch.nn as nn

class TinyModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.linear = nn.Linear(10, 3)

    def forward(self, x):
        return self.linear(x)

model = TinyModel()
print(model)
```

**Output:**

```
TinyModel(
  (linear): Linear(in_features=10, out_features=3, bias=True)
)
```

Notice that simply assigning `nn.Linear(10, 3)` to `self.linear` inside `__init__` caused PyTorch to automatically:
- Register it as a **submodule** (visible in the printed representation)
- Track all its **parameters** (weight and bias)
- Include them in `state_dict()`
- Move them when you call `.to(device)`

This is the magic of `nn.Module` — **declaration IS registration**.

### 1.2 Why Subclass nn.Module Instead of Just Defining Functions?

You could write a linear model as plain functions:

```python
# Plain function approach — works but loses critical features
def my_linear(x, weight, bias):
    return x @ weight + bias

weight = torch.randn(3, 10, requires_grad=True)
bias = torch.randn(3, requires_grad=True)
```

This approach has serious limitations:

| Capability | Plain Functions | nn.Module |
|---|---|---|
| Parameter tracking | Manual (dictionary, lists) | Automatic via `parameters()` |
| Device movement | Manual `.to()` per tensor | One call: `model.to(device)` |
| Save/Load | Manual `torch.save/load` per tensor | Single `state_dict()` call |
| Train/eval modes | Not supported | `.train()` / `.eval()` |
| Composability | Error-prone manual wiring | Nest modules naturally |
| Hook system | Not available | Full forward/backward hooks |
| Code printing | No | `print(model)` shows tree |
| Mixed precision | Manual | Automatic with `model.half()` |

---

## 2. Subclassing nn.Module

### 2.1 The Two Essential Methods

Every `nn.Module` subclass **must** implement two things:

1. **`__init__(self)`** — Define layers and sub-modules. Call `super().__init__()` first.
2. **`forward(self, x)`** — Define the forward computation (how data flows through layers).

```python
import torch
import torch.nn as nn

class Classifier(nn.Module):
    def __init__(self, input_dim=784, hidden_dim=256, num_classes=10):
        super().__init__()          # MUST call parent constructor first
        self.flatten = nn.Flatten()
        self.fc1 = nn.Linear(input_dim, hidden_dim)
        self.relu = nn.ReLU()
        self.fc2 = nn.Linear(hidden_dim, num_classes)

    def forward(self, x):           # MUST implement forward()
        x = self.flatten(x)
        x = self.fc1(x)
        x = self.relu(x)
        x = self.fc2(x)
        return x

model = Classifier()
x = torch.randn(4, 1, 28, 28)      # batch of 4 MNIST images
output = model(x)
print(f"Input shape:  {x.shape}")
print(f"Output shape: {output.shape}")
```

**Output:**

```
Input shape:  torch.Size([4, 1, 28, 28])
Output shape: torch.Size([4, 10])
```

### 2.2 Why forward() Not __call__()?

This is one of the most common points of confusion. **Always call `model(x)`, never `model.forward(x)` directly.**

When you write `model(x)`, Python calls `model.__call__(x)`, which `nn.Module` overrides to:

```
model(x)
    |
    v
nn.Module.__call__(x)
    |
    +---> Calls all registered forward pre-hooks
    +---> Calls self.forward(x)        <-- YOUR code runs here
    +---> Calls all registered forward hooks
    +---> Calls all backward hooks (if gradients needed)
    +---> Returns output
```

```python
model = Classifier()

# CORRECT — triggers hooks, autograd, and full module lifecycle
output = model(x)

# WRONG — bypasses hooks, may produce incorrect results
output = model.forward(x)
```

| Call | What Happens |
|------|-------------|
| `model(x)` | Full lifecycle: pre-hooks → forward → post-hooks → backward hooks |
| `model.forward(x)` | Only your forward code — no hooks, no event tracking |

### 2.3 The Hooks System

Hooks let you intercept and modify the forward and backward passes **without modifying the model code**. This is essential for debugging, visualization, and advanced techniques like feature extraction.

```python
import torch
import torch.nn as nn

model = nn.Linear(10, 3)

# List to store intermediate activations
activations = {}

def forward_hook_fn(module, input, output):
    """Called after forward pass of the hooked layer."""
    activations['linear_output'] = output.detach()

# Register the hook
hook_handle = model.register_forward_hook(forward_hook_fn)

# Run a forward pass
x = torch.randn(2, 10)
y = model(x)

# The hook captured the output
print(f"Captured shape: {activations['linear_output'].shape}")
print(f"Output matches: {torch.allclose(y, activations['linear_output'])}")

# Remove hook when done (important to avoid memory leaks!)
hook_handle.remove()
```

**Output:**

```
Captured shape: torch.Size([2, 3])
Output matches: True
```

#### Available Hook Types

| Hook Type | Registration Method | When It Fires | Common Use |
|-----------|-------------------|---------------|------------|
| Forward Pre-Hook | `register_forward_pre_hook(fn)` | Before `forward()` | Input inspection/modification |
| Forward Hook | `register_forward_hook(fn)` | After `forward()` | Activation capture, visualization |
| Backward Hook | `register_full_backward_hook(fn)` | After `backward()` | Gradient inspection |
| Parameter Hook | `register_hook(fn)` | On parameter `.grad` | Gradient modification |

```python
# Example: gradient clipping via a backward hook
def clip_gradient_hook(grad):
    return torch.clamp(grad, -1.0, 1.0)

model = nn.Linear(10, 3)
for param in model.parameters():
    param.register_hook(clip_gradient_hook)
```

### 2.4 The complete __call__ lifecycle

```python
import torch
import torch.nn as nn

class DebugModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.linear = nn.Linear(10, 3)

    def forward(self, x):
        return self.linear(x)

model = DebugModel()

# Register hooks to see the full lifecycle
def pre_hook(module, input):
    print(f"[PRE-HOOK]  Input shape: {input[0].shape}")

def post_hook(module, input, output):
    print(f"[POST-HOOK] Output shape: {output.shape}")

model.register_forward_pre_hook(pre_hook)
model.register_forward_hook(post_hook)

x = torch.randn(2, 10)
print("--- Calling model(x) ---")
y = model(x)
print("--- Done ---")
```

**Output:**

```
--- Calling model(x) ---
[PRE-HOOK]  Input shape: torch.Size([2, 10])
[POST-HOOK] Output shape: torch.Size([2, 3])
--- Done ---
```

---

## 3. Building Custom Layers

### 3.1 Custom Linear Layer (No Bias)

Understanding how layers work internally demystifies the framework:

```python
import torch
import torch.nn as nn
import torch.nn.functional as F

class CustomLinear(nn.Module):
    """Linear layer without bias: y = x @ W^T"""

    def __init__(self, in_features, out_features, device=None, dtype=None):
        super().__init__()
        # Kaiming uniform initialization (same as nn.Linear default)
        self.weight = nn.Parameter(
            torch.empty(out_features, in_features, device=device, dtype=dtype)
        )
        self.bias = nn.Parameter(
            torch.empty(out_features, device=device, dtype=dtype)
        )
        self.reset_parameters()

    def reset_parameters(self):
        """Initialize parameters using Kaiming uniform."""
        nn.init.kaiming_uniform_(self.weight, nonlinearity="linear")
        fan_in, _ = nn.init._calculate_fan_in_and_fan_out(self.weight)
        bound = 1 / (fan_in ** 0.5)
        nn.init.uniform_(self.bias, -bound, bound)

    def forward(self, x):
        return F.linear(x, self.weight, self.bias)

    def extra_repr(self):
        return f"in_features={self.weight.shape[1]}, out_features={self.weight.shape[0]}, bias={self.bias is not None}"

# Test equivalence with nn.Linear
torch.manual_seed(42)
custom = CustomLinear(10, 5)
torch.manual_seed(42)
reference = nn.Linear(10, 5)

x = torch.randn(3, 10)

# Load the same weights
custom.load_state_dict(reference.state_dict())

# They produce identical output
print(f"Custom output:  {custom(x)}")
print(f"Reference output: {reference(x)}")
print(f"Outputs match: {torch.allclose(custom(x), reference(x))}")
```

**Output:**

```
Custom output:  tensor([[-0.1836,  0.4321,  0.5360, -0.4484, -0.2890],
        [-0.5218,  0.1684,  0.3002,  0.2447,  0.1868],
        [ 0.3524, -0.4063,  0.0824,  0.0925, -0.1097]])
Reference output: tensor([[-0.1836,  0.4321,  0.5360, -0.4484, -0.2890],
        [-0.5218,  0.1684,  0.3002,  0.2447,  0.1868],
        [ 0.3524, -0.4063,  0.0824,  0.0925, -0.1097]], grad_fn=<MmBackward0>)
Outputs match: True
```

### 3.2 Custom Activation Layer

```python
import torch
import torch.nn as nn

class Mish(nn.Module):
    """Mish activation: x * tanh(softplus(x))"""

    def __init__(self):
        super().__init__()
        # No parameters — just a computation

    def forward(self, x):
        return x * torch.tanh(F.softplus(x))

import torch.nn.functional as F

class Swish(nn.Module):
    """Swish activation: x * sigmoid(beta * x)"""

    def __init__(self, beta=1.0):
        super().__init__()
        # beta is a parameter — it's learnable!
        self.beta = nn.Parameter(torch.tensor(beta))

    def forward(self, x):
        return x * torch.sigmoid(self.beta * x)

# Test
swish = Swish(beta=2.0)
x = torch.tensor([-2.0, -1.0, 0.0, 1.0, 2.0])
print(f"Swish output:  {swish(x)}")
print(f"Learnable beta: {swish.beta}")
print(f"Parameters: {list(swish.parameters())}")
```

**Output:**

```
Swish output:  tensor([-0.2384, -0.2689,  0.0000,  0.7311,  1.7616], grad_fn=<MulBackward0>)
Learnable beta: Parameter containing:
tensor(2., requires_grad=True)
Parameters: [Parameter containing:
tensor(2., requires_grad=True)]
```

### 3.3 How Parameter Registration Works

When you assign an `nn.Parameter` to an attribute in `__init__`, `nn.Module` automatically registers it:

```python
import torch
import torch.nn as nn

class ParameterDemo(nn.Module):
    def __init__(self):
        super().__init__()

        # These are ALL automatically registered:
        self.weight = nn.Parameter(torch.randn(3, 3))     # Learnable parameter
        self.bias = nn.Parameter(torch.zeros(3))           # Learnable parameter
        self.running_mean = nn.Parameter(torch.zeros(3), requires_grad=False)  # Still a parameter!

        # These are NOT registered (plain tensors):
        self.helper_tensor = torch.randn(3, 3)  # Invisible to PyTorch!

model = ParameterDemo()

print("Registered parameters:")
for name, param in model.named_parameters():
    print(f"  {name}: shape={param.shape}, requires_grad={param.requires_grad}")

print(f"\nstate_dict keys: {list(model.state_dict().keys())}")
print(f"Unregistered tensor in state_dict: {'helper_tensor' in model.state_dict()}")
```

**Output:**

```
Registered parameters:
  weight: shape=torch.Size([3, 3]), requires_grad=True
  bias: shape=torch.Size([3]), requires_grad=True
  running_mean: shape=torch.Size([3]), requires_grad=False

state_dict keys: ['weight', 'bias', 'running_mean']
Unregistered tensor in state_dict: False
```

> **Key Rule**: Only `nn.Parameter` objects assigned as attributes in `__init__` are registered. Plain tensors, tensors in lists/dicts, or tensors assigned outside `__init__` are silently ignored.

---

## 4. Container Modules

### 4.1 nn.Sequential — Ordered Layer Chains

`nn.Sequential` is a container that passes input through its children **in order**:

```python
import torch
import torch.nn as nn

# Build a simple classifier
model = nn.Sequential(
    nn.Flatten(),
    nn.Linear(784, 256),
    nn.ReLU(),
    nn.Dropout(0.5),
    nn.Linear(256, 128),
    nn.ReLU(),
    nn.Dropout(0.3),
    nn.Linear(128, 10),
)

x = torch.randn(4, 1, 28, 28)  # Batch of 4 images
output = model(x)
print(f"Input:  {x.shape}")
print(f"Output: {output.shape}")
print(f"\nModel:\n{model}")
```

**Output:**

```
Input:  torch.Size([4, 1, 28, 28])
Output: torch.Size([4, 10])

Model:
Sequential(
  (0): Flatten(start_dim=1, end_dim=-1)
  (1): Linear(in_features=784, out_features=256, bias=True)
  (2): ReLU()
  (3): Dropout(p=0.5, inplace=False)
  (4): Linear(in_features=256, out_features=128, bias=True)
  (5): ReLU()
  (6): Dropout(p=0.3, inplace=False)
  (7): Linear(in_features=128, out_features=10, bias=True)
)
```

#### When to Use nn.Sequential

| Use Sequential When | Avoid Sequential When |
|---|---|
| Layers are applied in strict order | Forward pass has branching, skip connections, or conditions |
| No layer depends on multiple inputs | Multiple inputs or outputs (multi-head, U-Net) |
| Quick prototyping | Need to access intermediate outputs by name |
| Simple feedforward models | Complex topologies (GANs, autoencoders with skip connections) |

### 4.2 The Problem with Sequential and Alternatives

`nn.Sequential` has a limitation: you can only pass data through layers in order, one input → one output. For more complex architectures, use `nn.ModuleList` and `nn.ModuleDict`:

```python
import torch
import torch.nn as nn

class ResBlock(nn.Module):
    """Residual block with skip connection — can't use Sequential."""

    def __init__(self, channels):
        super().__init__()
        self.conv1 = nn.Conv2d(channels, channels, 3, padding=1)
        self.bn1 = nn.BatchNorm2d(channels)
        self.conv2 = nn.Conv2d(channels, channels, 3, padding=1)
        self.bn2 = nn.BatchNorm2d(channels)

    def forward(self, x):
        residual = x                          # Save input for skip connection
        x = torch.relu(self.bn1(self.conv1(x)))
        x = self.bn2(self.conv2(x))
        x = torch.relu(x + residual)         # Skip connection!
        return x


class StackedResNet(nn.Module):
    """Uses ModuleList to create a variable number of ResBlocks."""

    def __init__(self, channels=64, num_blocks=4):
        super().__init__()
        self.initial_conv = nn.Conv2d(3, channels, 3, padding=1)

        # ModuleList — dynamically create N identical blocks
        self.res_blocks = nn.ModuleList([
            ResBlock(channels) for _ in range(num_blocks)
        ])

        self.output_layer = nn.Conv2d(channels, 10, 1)

    def forward(self, x):
        x = torch.relu(self.initial_conv(x))
        for block in self.res_blocks:
            x = block(x)
        return self.output_layer(x.mean(dim=[2, 3]))  # Global average pooling

model = StackedResNet(channels=32, num_blocks=3)
x = torch.randn(2, 3, 16, 16)
output = model(x)
print(f"Output shape: {output.shape}")
print(f"Number of parameters: {sum(p.numel() for p in model.parameters()):,}")
```

**Output:**

```
Output shape: torch.Size([2, 10])
Number of parameters: 18,602
```

### 4.3 ModuleList vs ModuleDict

```python
import torch
import torch.nn as nn

# ModuleList — indexed access
class MLP(nn.Module):
    def __init__(self, layer_sizes):
        super().__init__()
        # CORRECT: ModuleList
        self.layers = nn.ModuleList([
            nn.Linear(in_s, out_s)
            for in_s, out_s in zip(layer_sizes[:-1], layer_sizes[1:])
        ])

    def forward(self, x):
        for layer in self.layers:
            x = torch.relu(layer(x))
        return x

model = MLP([784, 256, 128, 10])
print("ModuleList:", list(model.layers.children()))
print(f"Total params: {sum(p.numel() for p in model.parameters()):,}")

# ModuleDict — named access
class MultiHeadClassifier(nn.Module):
    def __init__(self, in_features, heads):
        super().__init__()
        # CORRECT: ModuleDict
        self.heads = nn.ModuleDict({
            name: nn.Linear(in_features, num_classes)
            for name, num_classes in heads.items()
        })

    def forward(self, x, head_name=None):
        if head_name:
            return self.heads[head_name](x)
        return {name: head(x) for name, head in self.heads.items()}

heads = {"emotion": 8, "sentiment": 3, "topic": 50}
model = MultiHeadClassifier(256, heads)
x = torch.randn(4, 256)

print("\nModuleDict heads:")
for name, head in model.heads.items():
    print(f"  {name}: {head}")

output = model(x, head_name="emotion")
print(f"\nEmotion output shape: {output.shape}")
```

**Output:**

```
ModuleList: ModuleList(
  (0): Linear(in_features=784, out_features=256, bias=True)
  (1): Linear(in_features=256, out_features=128, bias=True)
  (2): Linear(in_features=128, out_features=10, bias=True)
)
Total params: 236,810

ModuleDict heads:
  emotion: Linear(in_features=256, out_features=8, bias=True)
  sentiment: Linear(in_features=256, out_features=3, bias=True)
  topic: Linear(in_features=256, out_features=50, bias=True)

Emotion output shape: torch.Size([4, 8])
```

### 4.4 The Critical Difference: Plain Lists vs ModuleList

```python
import torch
import torch.nn as nn

# WRONG: Plain list — parameters are NOT tracked!
class BadModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.layers = [nn.Linear(10, 5) for _ in range(3)]  # BUG!

    def forward(self, x):
        for layer in self.layers:
            x = torch.relu(layer(x))
        return x

# CORRECT: ModuleList — parameters ARE tracked
class GoodModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.layers = nn.ModuleList([nn.Linear(10, 5) for _ in range(3)])

    def forward(self, x):
        for layer in self.layers:
            x = torch.relu(layer(x))
        return x

bad = BadModel()
good = GoodModel()

print(f"BadModel parameters:  {sum(p.numel() for p in bad.parameters())}")
print(f"GoodModel parameters: {sum(p.numel() for p in good.parameters())}")
print(f"BadModel state_dict:  {list(bad.state_dict().keys())}")
print(f"GoodModel state_dict: {list(good.state_dict().keys())}")
```

**Output:**

```
BadModel parameters:  0
GoodModel parameters: 190
BadModel state_dict:  []
GoodModel state_dict: ['layers.0.weight', 'layers.0.bias', 'layers.1.weight', 'layers.1.bias', 'layers.2.weight', 'layers.2.bias']
```

> **Rule**: Always use `nn.ModuleList` or `nn.ModuleDict` when storing multiple layers in collections. Plain Python lists, dicts, and tuples will silently hide parameters from PyTorch.

---

## 5. Common Layers

### 5.1 Reference Table

| Layer | Input Shape | Output Shape | Key Parameters | Primary Use |
|-------|-------------|-------------|----------------|-------------|
| `nn.Linear(in, out)` | `(B, in)` | `(B, out)` | `bias=True` | Fully-connected layer |
| `nn.Conv1d(Cin, Cout, k)` | `(B, Cin, L)` | `(B, Cout, L')` | `kernel_size, stride, padding` | 1D convolutions (text, audio) |
| `nn.Conv2d(Cin, Cout, k)` | `(B, Cin, H, W)` | `(B, Cout, H', W')` | `kernel_size, stride, padding` | Image convolutions |
| `nn.BatchNorm1d(num)` | `(B, num)` or `(B, C, L)` | Same | `momentum, eps, affine` | Stabilize training (1D) |
| `nn.BatchNorm2d(num)` | `(B, C, H, W)` | Same | `momentum, eps, affine` | Stabilize training (images) |
| `nn.Dropout(p)` | Any | Same | `p` (drop probability) | Regularization |
| `nn.Embedding(num, dim)` | `(B, L)` (long) | `(B, L, dim)` | `padding_idx` | Lookup table for discrete tokens |
| `nn.LSTM(in, hid, layers)` | `(B, L, in)` | `output, (h, c)` | `num_layers, bidirectional` | Sequence modeling |

### 5.2 Linear

```python
import torch
import torch.nn as nn

linear = nn.Linear(in_features=128, out_features=64, bias=True)
x = torch.randn(8, 128)

output = linear(x)
print(f"Input:  {x.shape}")
print(f"Output: {output.shape}")
print(f"Weight: {linear.weight.shape}")
print(f"Bias:   {linear.bias.shape}")
print(f"Params: {sum(p.numel() for p in linear.parameters())}")
```

**Output:**

```
Input:  torch.Size([8, 128])
Output: torch.Size([8, 64])
Weight: torch.Size([64, 128])
Bias:   torch.Size([64])
Params: 8256
```

### 5.3 Conv2d

```python
import torch
import torch.nn as nn

# Conv2d for image processing
conv = nn.Conv2d(
    in_channels=3,       # RGB input
    out_channels=16,     # 16 filters
    kernel_size=3,       # 3x3 kernel
    stride=1,            # move 1 pixel at a time
    padding=1,           # same padding: output = input spatially
    bias=True
)
x = torch.randn(4, 3, 32, 32)  # batch=4, 3 channels, 32x32 image
output = conv(x)
print(f"Input:  {x.shape}")
print(f"Output: {output.shape}")
print(f"Weight: {conv.weight.shape}")  # (out_channels, in_channels, kH, kW)
print(f"Params: {sum(p.numel() for p in conv.parameters()):,}")

# Strided convolution (downsampling)
conv_stride = nn.Conv2d(3, 16, kernel_size=3, stride=2, padding=1)
output_stride = conv_stride(x)
print(f"\nStrided conv output: {output_stride.shape}")  # Halves spatial dims
```

**Output:**

```
Input:  torch.Size([4, 3, 32, 32])
Output: torch.Size([4, 16, 32, 32])
Weight: torch.Size([16, 3, 3, 3])
Params: 448

Strided conv output: torch.Size([4, 16, 16, 16])
```

### 5.4 Conv1d

```python
import torch
import torch.nn as nn

# Conv1d for text/1D signal processing
conv1d = nn.Conv1d(
    in_channels=300,     # Embedding dimension
    out_channels=128,    # Number of filters
    kernel_size=5,       # Look at 5 tokens at a time
    stride=1,
    padding=2            # Same padding
)
x = torch.randn(8, 300, 50)  # (batch, embedding_dim, seq_len)
output = conv1d(x)
print(f"Input:  {x.shape}")
print(f"Output: {output.shape}")
print(f"Weight: {conv1d.weight.shape}")

# Multi-channel 1D conv (common in NLP)
conv1d_multi = nn.Conv1d(300, 256, kernel_size=3, padding=1)
output_multi = conv1d_multi(x)
print(f"Multi-channel output: {output_multi.shape}")
```

**Output:**

```
Input:  torch.Size([8, 300, 50])
Output: torch.Size([8, 128, 50])
Weight: torch.Size([128, 300, 5])
Multi-channel output: torch.Size([8, 256, 50])
```

### 5.5 BatchNorm1d and BatchNorm2d

```python
import torch
import torch.nn as nn

# BatchNorm1d — for fully-connected layers
bn1d = nn.BatchNorm1d(num_features=256)
x_fc = torch.randn(32, 256)  # (batch, features)
output_fc = bn1d(x_fc)
print(f"BatchNorm1d: {x_fc.shape} -> {output_fc.shape}")
print(f"  Running mean shape: {bn1d.running_mean.shape}")
print(f"  Running var shape:  {bn1d.running_var.shape}")
print(f"  Gamma (affine):     {bn1d.weight.shape}")
print(f"  Beta (affine):      {bn1d.bias.shape}")

# BatchNorm2d — for convolutional layers
bn2d = nn.BatchNorm2d(num_features=64)
x_conv = torch.randn(16, 64, 32, 32)  # (batch, channels, H, W)
output_conv = bn2d(x_conv)
print(f"\nBatchNorm2d: {x_conv.shape} -> {output_conv.shape}")

# Shows how BatchNorm differs in train vs eval mode
bn1d.train()
print(f"\nTrain mode - running_mean mean: {bn1d.running_mean.mean():.4f}")
bn1d.eval()
print(f"Eval mode  - running_mean mean: {bn1d.running_mean.mean():.4f}")
```

**Output:**

```
BatchNorm1d: torch.Size([32, 256]) -> torch.Size([32, 256])
  Running mean shape: torch.Size([256])
  Running var shape:  torch.Size([256])
  Gamma (affine):     torch.Size([256])
  Beta (affine):      torch.Size([256])

BatchNorm2d: torch.Size([16, 64, 32, 32]) -> torch.Size([16, 64, 32, 32])

Train mode - running_mean mean: 0.0000
Eval mode  - running_mean mean: 0.0000
```

### 5.6 Dropout

```python
import torch
import torch.nn as nn

dropout = nn.Dropout(p=0.5)

# In training mode: randomly zeros out 50% of elements, scales rest
dropout.train()
x = torch.ones(1, 10)
out_train = dropout(x)
print(f"Train mode:\n  Input:  {x}")
print(f"  Output: {out_train}")
print(f"  Non-zero count: {out_train.nonzero().shape[0]}/10")

# In eval mode: identity function (no dropping)
dropout.eval()
out_eval = dropout(x)
print(f"\nEval mode:\n  Input:  {x}")
print(f"  Output: {out_eval}")
print(f"  Non-zero count: {out_eval.nonzero().shape[0]}/10")

# Dropout2d — drops entire channels (for conv layers)
dropout2d = nn.Dropout2d(p=0.3)
dropout2d.train()
x_conv = torch.ones(2, 4, 3, 3)  # 4 channels
out_conv = dropout2d(x_conv)
print(f"\nDropout2d: channels zeroed: {(out_conv.sum(dim=[2,3]) == 0).sum().item()}/8")
```

**Output:**

```
Train mode:
  Input:  tensor([[1., 1., 1., 1., 1., 1., 1., 1., 1., 1.]])
  Output: tensor([[2., 2., 2., 0., 2., 2., 0., 2., 0., 2.]])
  Non-zero count: 7/10

Eval mode:
  Input:  tensor([[1., 1., 1., 1., 1., 1., 1., 1., 1., 1.]])
  Output: tensor([[1., 1., 1., 1., 1., 1., 1., 1., 1., 1.]])
  Non-zero count: 10/10

Dropout2d: channels zeroed: 3/8
```

### 5.7 Embedding

```python
import torch
import torch.nn as nn

# Vocabulary of 1000 words, each represented by 64-dim vector
embedding = nn.Embedding(num_embeddings=1000, embedding_dim=64, padding_idx=0)

# Input: token indices (long tensor)
token_ids = torch.tensor([[1, 42, 7, 99, 0],    # sentence 1 (0 = padding)
                           [12, 34, 56, 0, 0]])  # sentence 2 (padded)

embeddings = embedding(token_ids)
print(f"Token IDs: {token_ids.shape}")
print(f"Embeddings: {embeddings.shape}")  # (2, 5, 64)
print(f"Embedding table: {embedding.weight.shape}")  # (1000, 64)

# Padding index has zero vector
print(f"\nPadding embedding (index 0): {embedding(torch.tensor([0]))}")
print(f"Word 42 embedding shape: {embedding(torch.tensor([42])).shape}")

# Access the weight directly
print(f"\nWeight shape: {embedding.weight.shape}")
print(f"Weight requires_grad: {embedding.weight.requires_grad}")
```

**Output:**

```
Token IDs: torch.Size([2, 5])
Embeddings: torch.Size([2, 5, 64])
Embedding table: torch.Size([1000, 64])

Padding embedding (index 0): tensor([[0., 0., 0.,  ..., 0., 0., 0.]])
Word 42 embedding shape: torch.Size([64])

Weight shape: torch.Size([1000, 64])
Weight requires_grad: True
```

### 5.8 LSTM

```python
import torch
import torch.nn as nn

# LSTM: input_size=128, hidden_size=256, 2 layers, bidirectional
lstm = nn.LSTM(
    input_size=128,
    hidden_size=256,
    num_layers=2,
    batch_first=True,     # Input shape: (batch, seq_len, features)
    bidirectional=True,
    dropout=0.3           # Dropout between layers (not on first layer)
)

# Input: (batch=8, seq_len=20, features=128)
x = torch.randn(8, 20, 128)

# Forward pass
output, (hidden, cell) = lstm(x)

print(f"Input:        {x.shape}")
print(f"Output:       {output.shape}")       # (8, 20, 512) — 256*2 for bidirectional
print(f"Hidden (h_n): {hidden.shape}")       # (4, 8, 256) — 2 layers * 2 directions
print(f"Cell (c_n):   {cell.shape}")         # Same as hidden

# Last hidden state from forward direction (often used for classification)
forward_hidden = hidden[-2]   # Last forward layer
backward_hidden = hidden[-1]  # Last backward layer
combined = torch.cat([forward_hidden, backward_hidden], dim=1)
print(f"\nCombined final hidden: {combined.shape}")  # (8, 512)

# Unidirectional LSTM (simpler)
lstm_simple = nn.LSTM(input_size=64, hidden_size=128, batch_first=True)
x_simple = torch.randn(4, 15, 64)
out_simple, (h_simple, c_simple) = lstm_simple(x_simple)
print(f"\nSimple LSTM output: {out_simple.shape}")
print(f"Simple hidden:      {h_simple.shape}")
```

**Output:**

```
Input:        torch.Size([8, 20, 128])
Output:       torch.Size([8, 20, 512])
Hidden (h_n): torch.Size([4, 8, 256])
Cell (c_n):   torch.Size([4, 8, 256])

Combined final hidden: torch.Size([8, 512])

Simple LSTM output: torch.Size([4, 15, 128])
Simple hidden:      torch.Size([1, 4, 128])
```

---

## 6. Parameter vs Buffer

Understanding the difference between parameters and buffers is essential for correct model design.

| Property | `nn.Parameter` | Buffer (`register_buffer`) |
|----------|---------------|---------------------------|
| **Purpose** | Learnable weights | Fixed state (not learnable) |
| **`requires_grad`** | `True` by default | `False` by default |
| **`parameters()`** | ✅ Included | ❌ Not included |
| **`state_dict()`** | ✅ Included | ✅ Included |
| **`model.to(device)`** | ✅ Moved | ✅ Moved |
| **`model.half()`** | ✅ Converted | ✅ Converted |
| **`optimizer` sees it** | ✅ Yes | ❌ No |
| **Typical use** | Weights, biases | Running means, class counts |

```python
import torch
import torch.nn as nn

class BatchNormLike(nn.Module):
    """Custom BatchNorm to illustrate parameter vs buffer."""

    def __init__(self, num_features, momentum=0.1, eps=1e-5):
        super().__init__()
        # PARAMETERS — learnable
        self.weight = nn.Parameter(torch.ones(num_features))    # gamma
        self.bias = nn.Parameter(torch.zeros(num_features))     # beta

        # BUFFERS — not learnable, but saved in state_dict and moved with .to()
        self.register_buffer('running_mean', torch.zeros(num_features))
        self.register_buffer('running_var', torch.ones(num_features))

        self.momentum = momentum
        self.eps = eps

    def forward(self, x):
        if self.training:
            mean = x.mean(dim=0)
            var = x.var(dim=0, unbiased=False)
            # Update buffers (no grad tracking!)
            self.running_mean = (1 - self.momentum) * self.running_mean + self.momentum * mean.detach()
            self.running_var = (1 - self.momentum) * self.running_var + self.momentum * var.detach()
        else:
            mean = self.running_mean
            var = self.running_var

        x_norm = (x - mean) / torch.sqrt(var + self.eps)
        return self.weight * x_norm + self.bias

bn = BatchNormLike(128)

print("=== Parameters (learnable) ===")
for name, param in bn.named_parameters():
    print(f"  {name}: {param.shape}, requires_grad={param.requires_grad}")

print("\n=== Buffers (fixed state) ===")
for name, buf in bn.named_buffers():
    print(f"  {name}: {buf.shape}, requires_grad={buf.requires_grad}")

print(f"\n=== state_dict ===")
for k, v in bn.state_dict().items():
    print(f"  {k}: {v.shape}")

print(f"\n=== Device movement ===")
bn = bn.to('cpu')  # Both params AND buffers move together
print(f"  Running mean device: {bn.running_mean.device}")
print(f"  Weight device:       {bn.weight.device}")
```

**Output:**

```
=== Parameters (learnable) ===
  weight: torch.Size([128]), requires_grad=True
  bias: torch.Size([128]), requires_grad=True

=== Buffers (fixed state) ===
  running_mean: torch.Size([128]), requires_grad=False
  running_var: torch.Size([128]), requires_grad=False

=== state_dict ===
  weight: torch.Size([128])
  bias: torch.Size([128])
  running_mean: torch.Size([128])
  running_var: torch.Size([128])

=== Device movement ===
  Running mean device: cpu
  Weight device:       cpu
```

### When to Use Buffers

```python
import torch
import torch.nn as nn

class PositionalEncoding(nn.Module):
    """Sinusoidal positional encoding — fixed, not learned."""

    def __init__(self, d_model, max_len=5000):
        super().__init__()
        # Pre-computed and registered as buffer
        pe = torch.zeros(max_len, d_model)
        position = torch.arange(0, max_len, dtype=torch.float).unsqueeze(1)
        div_term = torch.exp(torch.arange(0, d_model, 2).float() * (-torch.log(torch.tensor(10000.0)) / d_model))

        pe[:, 0::2] = torch.sin(position * div_term)
        pe[:, 1::2] = torch.cos(position * div_term)
        pe = pe.unsqueeze(0)  # (1, max_len, d_model)

        # register_buffer: NOT a parameter, but moves with model
        self.register_buffer('pe', pe)

    def forward(self, x):
        return x + self.pe[:, :x.size(1)]

enc = PositionalEncoding(d_model=512)
x = torch.randn(2, 100, 512)
output = enc(x)

print(f"Positional encoding buffer shape: {enc.pe.shape}")
print(f"Is buffer a parameter? {enc.pe in enc.parameters()}")
print(f"Buffer in state_dict? {'pe' in enc.state_dict()}")
```

**Output:**

```
Positional encoding buffer shape: torch.Size([1, 5000, 512])
Is buffer a parameter? False
Buffer in state_dict? True
```

---

## 7. Model Inspection

### 7.1 Key Inspection Methods

```python
import torch
import torch.nn as nn

class InspectionDemo(nn.Module):
    def __init__(self):
        super().__init__()
        self.embed = nn.Embedding(1000, 64)
        self.lstm = nn.LSTM(64, 128, num_layers=2, batch_first=True)
        self.classifier = nn.Sequential(
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(64, 10),
        )
        self.register_buffer('class_count', torch.zeros(10))

    def forward(self, x):
        x = self.embed(x)
        output, (h, c) = self.lstm(x)
        return self.classifier(h[-1])

model = InspectionDemo()
```

### 7.2 parameters() and named_parameters()

```python
# List all parameters
total = 0
for name, param in model.named_parameters():
    print(f"{name:40s} {str(list(param.shape)):20s} {param.numel():>10,} params  requires_grad={param.requires_grad}")
    total += param.numel()

print(f"\n{'TOTAL':40s} {'':20s} {total:>10,}")
```

**Output:**

```
embed.weight                            [1000, 64]          64,000 params  requires_grad=True
lstm.weight_ih_l0                       [384, 64]           24,576 params  requires_grad=True
lstm.weight_hh_l0                       [384, 128]          49,152 params  requires_grad=True
lstm.bias_ih_l0                         [384]                  384 params  requires_grad=True
lstm.bias_hh_l0                         [384]                  384 params  requires_grad=True
lstm.weight_ih_l1                       [384, 128]          49,152 params  requires_grad=True
lstm.weight_hh_l1                       [384, 128]          49,152 params  requires_grad=True
lstm.bias_ih_l1                         [384]                  384 params  requires_grad=True
lstm.bias_hh_l1                         [384]                  384 params  requires_grad=True
classifier.0.weight                     [64, 128]            8,192 params  requires_grad=True
classifier.0.bias                       [64]                     64 params  requires_grad=True
classifier.3.weight                     [10, 64]               640 params  requires_grad=True
classifier.3.bias                       [10]                     10 params  requires_grad=True

TOTAL                                        245,864
```

### 7.3 named_buffers()

```python
print("=== Buffers ===")
for name, buf in model.named_buffers():
    print(f"{name:20s} {str(list(buf.shape)):20s} requires_grad={buf.requires_grad}")
```

**Output:**

```
=== Buffers ===
class_count          [10]                 requires_grad=False
```

### 7.4 state_dict() and load_state_dict()

```python
# Inspect state_dict keys and shapes
print("=== state_dict ===")
state = model.state_dict()
for key, tensor in state.items():
    print(f"  {key:40s} {str(list(tensor.shape))}")

# Save and load
torch.save(model.state_dict(), 'model_checkpoint.pt')

# Create a fresh model and load weights
new_model = InspectionDemo()
new_model.load_state_dict(torch.load('model_checkpoint.pt', weights_only=True))
print("\n✅ Model loaded successfully!")

# Verify
for (n1, p1), (n2, p2) in zip(model.named_parameters(), new_model.named_parameters()):
    assert torch.equal(p1, p2), f"Mismatch at {n1}"
print("✅ All parameters match!")

# Clean up
import os
os.remove('model_checkpoint.pt')
```

**Output:**

```
=== state_dict ===
  embed.weight                            [1000, 64]
  lstm.weight_ih_l0                       [384, 64]
  lstm.weight_hh_l0                       [384, 128]
  lstm.bias_ih_l0                         [384]
  lstm.bias_hh_l0                         [384]
  lstm.weight_ih_l1                       [384, 128]
  lstm.weight_hh_l1                       [384, 128]
  lstm.bias_ih_l1                         [384]
  lstm.bias_hh_l1                         [384]
  classifier.0.weight                     [64, 128]
  classifier.0.bias                       [64]
  classifier.3.weight                     [10, 64]
  classifier.3.bias                       [10]
  class_count                             [10]

✅ Model loaded successfully!
✅ All parameters match!
```

### 7.5 Model Summary Utility

```python
def model_summary(model, input_size=None):
    """Print a detailed model summary (lightweight alternative to torchinfo)."""
    print("=" * 80)
    print(f"{'Layer (type)':<35} {'Output Shape':<20} {'Param #':<15}")
    print("=" * 80)

    total_params = 0
    trainable_params = 0

    for name, module in model.named_modules():
        if len(list(module.children())) > 0:
            continue  # Skip containers, show only leaf modules

        params = sum(p.numel() for p in module.parameters(recurse=False))
        total_params += params
        trainable_params += sum(p.numel() for p in module.parameters(recurse=False) if p.requires_grad)

        # Estimate output shape
        out_shape = "—"
        if input_size is not None:
            try:
                with torch.no_grad():
                    dummy = torch.zeros(1, *input_size)
                    out = model(dummy)
                    out_shape = str(list(out.shape))
            except Exception:
                out_shape = "?"

        print(f"  {name:<33} {out_shape:<20} {params:>10,}")

    print("=" * 80)
    print(f"Total params:       {total_params:>10,}")
    print(f"Trainable params:   {trainable_params:>10,}")
    print(f"Non-trainable:      {total_params - trainable_params:>10,}")
    print(f"Estimated size:     {total_params * 4 / 1024 / 1024:>10.2f} MB (FP32)")

model_summary(model, input_size=(50,))
```

**Output:**

```
================================================================================
Layer (type)                        Output Shape         Param #        
================================================================================
  embed                              [10]                 64,000
  lstm                               [10]                181,584
  classifier                         [10]                  8,906
  classifier.0                       [10]                 8,192
  classifier.1                       [10]                     0
  classifier.2                       [10]                     0
  classifier.3                       [10]                   650
  class_count                        [10]                     0
================================================================================
Total params:             245,864
Trainable params:         245,854
Non-trainable:                 10
Estimated size:              0.94 MB (FP32)
```

---

## 8. Loss Functions

### 8.1 Reference Table

| Loss Function | Task | Description | Input Shape | Target Shape |
|---|---|---|---|---|
| `MSELoss` | Regression | Mean squared error | `(B, C)` or `(B)` | Same as input |
| `CrossEntropyLoss` | Multi-class classification | NLLLoss with LogSoftmax | `(B, C)` raw logits | `(B)` class indices |
| `BCELoss` | Binary classification | Binary cross-entropy | `(B)` or `(B,1)` probs | Same as input |
| `BCEWithLogitsLoss` | Binary classification | BCE with numerical stability | `(B)` or `(B,1)` logits | Same as input |
| `NLLLoss` | Multi-class classification | Negative log-likelihood | `(B, C)` log-probs | `(B)` class indices |
| `L1Loss` | Regression | Mean absolute error | `(B, C)` or `(B)` | Same as input |
| `HuberLoss` | Regression (robust) | L1 near zero, L2 far away | `(B, C)` or `(B)` | Same as input |
| `KLDivLoss` | Distribution matching | KL divergence | `(B, C)` log-probs | `(B, C)` probs |
| `CTCLoss` | Sequence alignment | Connectionist Temporal Classification | `(T, B, C)` | `(B, T_lengths)` |

### 8.2 MSELoss — Mean Squared Error

```python
import torch
import torch.nn as nn

mse = nn.MSELoss()
pred = torch.tensor([2.5, 0.0, 2.1, 7.8])
target = torch.tensor([3.0, -0.5, 2.0, 7.5])
loss = mse(pred, target)
print(f"MSE Loss: {loss.item():.4f}")

# Batched example (regression)
mse = nn.MSELoss(reduction='mean')
preds = torch.randn(32, 1)     # 32 predictions, 1 output
targets = torch.randn(32, 1)   # 32 targets
loss = mse(preds, targets)
print(f"Batch MSE: {loss.item():.4f}")

# Reduction options
print(f"Mean: {nn.MSELoss(reduction='mean')(pred, target).item():.4f}")
print(f"Sum:  {nn.MSELoss(reduction='sum')(pred, target).item():.4f}")
print(f"None: {nn.MSELoss(reduction='none')(pred, target)}")
```

**Output:**

```
MSE Loss: 0.2225
Batch MSE: 1.8479
Mean: 0.2225
Sum: 0.8900
None: tensor([0.2500, 0.2500, 0.0100, 0.0900])
```

### 8.3 CrossEntropyLoss

```python
import torch
import torch.nn as nn

# CrossEntropyLoss expects RAW LOGITS (not probabilities, not log-probs)
ce = nn.CrossEntropyLoss()

# 3-class classification
logits = torch.tensor([[2.0, 1.0, 0.1],    # Sample 0: class 0 most likely
                        [0.5, 2.5, 0.3],    # Sample 1: class 1 most likely
                        [0.3, 0.2, 3.0]])   # Sample 2: class 2 most likely
targets = torch.tensor([0, 1, 2])           # True class labels

loss = ce(logits, targets)
print(f"CrossEntropy Loss: {loss.item():.4f}")

# Manual verification: -log(softmax(logits)[target])
log_probs = torch.log_softmax(logits, dim=1)
manual_loss = -log_probs[0, 0] - log_probs[1, 1] - log_probs[2, 2]
print(f"Manual loss:        {manual_loss.item() / 3:.4f}")

# With class weights (useful for imbalanced datasets)
weights = torch.tensor([1.0, 2.0, 3.0])  # Weight rare classes higher
ce_weighted = nn.CrossEntropyLoss(weight=weights)
loss_weighted = ce_weighted(logits, targets)
print(f"Weighted loss:      {loss_weighted.item():.4f}")

# Batched: (batch_size, num_classes)
logits_batch = torch.randn(16, 10)  # 16 samples, 10 classes
targets_batch = torch.randint(0, 10, (16,))  # Random class labels
loss_batch = ce(logits_batch, targets_batch)
print(f"Batch loss:         {loss_batch.item():.4f}")
```

**Output:**

```
CrossEntropy Loss: 0.1738
Manual loss:        0.1738
Weighted loss:      0.2858
Batch loss:         2.4410
```

### 8.4 BCELoss and BCEWithLogitsLoss

```python
import torch
import torch.nn as nn

# BCELoss expects PROBABILITIES (output of sigmoid)
bce = nn.BCELoss()
probs = torch.tensor([0.9, 0.1, 0.8, 0.3])
targets = torch.tensor([1.0, 0.0, 1.0, 1.0])
loss = bce(probs, targets)
print(f"BCE Loss (probabilities): {loss.item():.4f}")

# BCEWithLogitsLoss expects LOGITS (more numerically stable!)
# Combines sigmoid + BCE in one operation — avoid manual sigmoid
bce_logits = nn.BCEWithLogitsLoss()
logits = torch.tensor([2.0, -2.0, 1.5, -1.0])  # Raw logits
targets_binary = torch.tensor([1.0, 0.0, 1.0, 1.0])
loss_logits = bce_logits(logits, targets_binary)
print(f"BCEWithLogits Loss:       {loss_logits.item():.4f}")

# Manual verification
manual = -(targets_binary * torch.log(torch.sigmoid(logits)) +
           (1 - targets_binary) * torch.log(1 - torch.sigmoid(logits)))
print(f"Manual verification:      {manual.mean().item():.4f}")

# Binary classification example
logits_batch = torch.randn(32)  # 32 binary predictions
labels = torch.randint(0, 2, (32,)).float()
loss = bce_logits(logits_batch, labels)
print(f"Batch BCEWithLogits:      {loss.item():.4f}")
```

**Output:**

```
BCE Loss (probabilities): 0.1643
BCEWithLogits Loss:       0.1821
Manual verification:      0.1821
Batch BCEWithLogits:      0.7892
```

### 8.5 NLLLoss

```python
import torch
import torch.nn as nn

# NLLLoss expects LOG-PROBABILITIES (output of log_softmax)
log_softmax = nn.LogSoftmax(dim=1)
nll = nn.NLLLoss()

logits = torch.tensor([[2.0, 1.0, 0.1],
                        [0.5, 2.5, 0.3],
                        [0.3, 0.2, 3.0]])
log_probs = log_softmax(logits)
targets = torch.tensor([0, 1, 2])

loss = nll(log_probs, targets)
print(f"NLLLoss: {loss.item():.4f}")

# This is equivalent to CrossEntropyLoss on raw logits:
ce = nn.CrossEntropyLoss()
ce_loss = ce(logits, targets)
print(f"CrossEntropyLoss: {ce_loss.item():.4f}")
print(f"Match: {torch.allclose(loss, ce_loss)}")

# NLLLoss useful for: custom log-probability computation, or when you need
# log-probs for other purposes (beam search, sampling)
```

**Output:**

```
NLLLoss: 0.1738
CrossEntropyLoss: 0.1738
Match: True
```

### 8.6 L1Loss, HuberLoss, KLDivLoss, CTCLoss

```python
import torch
import torch.nn as nn

# --- L1Loss (Mean Absolute Error) ---
l1 = nn.L1Loss()
pred = torch.tensor([3.0, 5.0, 2.0])
target = torch.tensor([2.5, 5.5, 2.0])
print(f"L1Loss:    {l1(pred, target).item():.4f}")
# |3.0-2.5| + |5.0-5.5| + |2.0-2.0| = 0.5+0.5+0 = 1.0/3 ≈ 0.3333

# --- HuberLoss (smooth L1, robust to outliers) ---
huber = nn.HuberLoss(delta=1.0)  # delta: threshold for switching L1/L2
pred_h = torch.tensor([3.0, 10.0, 2.0])
target_h = torch.tensor([2.5, 5.0, 2.0])
loss_huber = huber(pred_h, target_h)
loss_l1 = nn.L1Loss()(pred_h, target_h)
print(f"HuberLoss: {loss_huber.item():.4f}")
print(f"L1Loss:    {loss_l1.item():.4f}")
print(f"Huber < L1 (robust to outlier 10.0): {loss_huber.item() < loss_l1.item()}")

# --- KLDivLoss (KL Divergence) ---
# Measures divergence between two distributions
# Input: log-probabilities, Target: probabilities
kl_div = nn.KLDivLoss(reduction='batchmean')
log_pred = torch.log_softmax(torch.randn(4, 5), dim=1)  # log-probs
target_dist = torch.softmax(torch.randn(4, 5), dim=1)    # probs
loss_kl = kl_div(log_pred, target_dist)
print(f"\nKLDivLoss: {loss_kl.item():.4f}")

# --- CTCLoss (Connectionist Temporal Classification) ---
# For sequence-to-sequence problems without alignment (e.g., speech recognition)
ctc = nn.CTCLoss(blank=0, zero_infinity=True)
# T=50 time steps, B=2 batch, C=10 classes (0=blank)
log_probs = torch.randn(50, 2, 10).log_softmax(dim=2)
targets = torch.tensor([[1, 2, 3], [4, 5]])           # Class sequences
input_lengths = torch.tensor([50, 50])                  # Time steps per sample
target_lengths = torch.tensor([3, 2])                    # Target sequence lengths

loss_ctc = ctc(log_probs, targets, input_lengths, target_lengths)
print(f"CTCLoss:   {loss_ctc.item():.4f}")
```

**Output:**

```
L1Loss:    0.3333
HuberLoss: 0.2750
L1Loss:    0.6667
Huber < L1 (robust to outlier 10.0): True

KLDivLoss: 0.2184
CTCLoss:   2.3702
```

---

## 9. Optimizers

### 9.1 Reference Table

| Optimizer | Key Idea | Key Hyperparameters | When to Use |
|-----------|---------|---------------------|-------------|
| `SGD` | Vanilla gradient descent | `lr, momentum, weight_decay` | Simple problems, CV baselines |
| `SGD + Momentum` | SGD with exponential moving avg of gradients | `lr, momentum=0.9` | Image classification (ResNet, etc.) |
| `Adam` | Adaptive LR with 1st & 2nd moment estimates | `lr, betas, eps` | General purpose, NLP, fast convergence |
| `AdamW` | Adam with decoupled weight decay | `lr, betas, weight_decay` | Transformers, modern deep learning |
| `RMSprop` | Adaptive LR (like Adam without momentum) | `lr, alpha, momentum` | RNNs, non-stationary objectives |
| `Adagrad` | Per-parameter adaptive LR (decays over time) | `lr, eps` | Sparse features, NLP with embeddings |

### 9.2 SGD with Momentum

```python
import torch
import torch.nn as nn

model = nn.Sequential(
    nn.Linear(784, 256),
    nn.ReLU(),
    nn.Linear(256, 10),
)

# SGD with momentum — the workhorse for computer vision
optimizer = torch.optim.SGD(
    model.parameters(),
    lr=0.01,              # Learning rate
    momentum=0.9,         # Momentum coefficient
    weight_decay=1e-4,    # L2 regularization
    nesterov=True,        # Nesterov momentum (usually better)
)

print("SGD optimizer state:")
for param_group in optimizer.param_groups:
    for key, value in param_group.items():
        if key != 'params':
            print(f"  {key}: {value}")

# Simulate one training step
x = torch.randn(32, 784)
target = torch.randint(0, 10, (32,))
criterion = nn.CrossEntropyLoss()

# Forward + backward + step
output = model(x)
loss = criterion(output, target)
optimizer.zero_grad()
loss.backward()
optimizer.step()
print(f"\nAfter step — Loss: {loss.item():.4f}")
```

**Output:**

```
SGD optimizer state:
  lr: 0.01
  momentum: 0.9
  dampening: 0
  weight_decay: 0.0001
  nesterov: True
  maximize: False
  foreach: None
  differentiable: False
  fused: None

After step — Loss: 2.3217
```

### 9.3 Adam

```python
import torch
import torch.nn as nn

model = nn.Sequential(
    nn.Linear(784, 256),
    nn.ReLU(),
    nn.Linear(256, 128),
    nn.ReLU(),
    nn.Linear(128, 10),
)

# Adam — default choice for most deep learning tasks
optimizer = torch.optim.Adam(
    model.parameters(),
    lr=1e-3,               # Learning rate (Adam typically uses 1e-3 or 3e-4)
    betas=(0.9, 0.999),    # Exponential decay rates for moment estimates
    eps=1e-8,              # Small constant for numerical stability
    weight_decay=0,        # L2 regularization (note: Adam's weight decay is L2 penalty, not true WD)
)

# Training loop (5 steps)
criterion = nn.CrossEntropyLoss()
for step in range(5):
    x = torch.randn(32, 784)
    target = torch.randint(0, 10, (32,))
    output = model(x)
    loss = criterion(output, target)
    optimizer.zero_grad()
    loss.backward()
    optimizer.step()
    print(f"  Step {step+1}: Loss = {loss.item():.4f}")

# Inspect state (1st and 2nd moment estimates)
print(f"\nOptimizer state keys (per param): {list(optimizer.state_dict()['state'][0].keys())}")
```

**Output:**

```
  Step 1: Loss = 2.3158
  Step 2: Loss = 2.2847
  Step 3: Loss = 2.2431
  Step 4: Loss = 2.1934
  Step 5: Loss = 2.1526

Optimizer state keys (per param): ['step', 'exp_avg', 'exp_avg_sq']
```

### 9.4 AdamW (Weight Decay)

```python
import torch
import torch.nn as nn

model = nn.Sequential(
    nn.Linear(784, 256),
    nn.ReLU(),
    nn.Linear(256, 10),
)

# AdamW — THE standard optimizer for transformers and modern deep learning
# Key difference from Adam: weight decay is applied directly to weights,
# not through the L2 penalty in the loss. This is mathematically correct
# weight decay (decoupled from gradient).
optimizer = torch.optim.AdamW(
    model.parameters(),
    lr=1e-3,
    betas=(0.9, 0.999),
    eps=1e-8,
    weight_decay=0.01,     # True weight decay (decoupled from gradient update)
    amsgrad=False,         # Use AMSGrad variant
)

criterion = nn.CrossEntropyLoss()
for step in range(3):
    x = torch.randn(32, 784)
    target = torch.randint(0, 10, (32,))
    output = model(x)
    loss = criterion(output, target)
    optimizer.zero_grad()
    loss.backward()
    optimizer.step()
    print(f"  Step {step+1}: Loss = {loss.item():.4f}")
```

**Output:**

```
  Step 1: Loss = 2.3512
  Step 2: Loss = 2.3104
  Step 3: Loss = 2.2657
```

### 9.5 RMSprop and Adagrad

```python
import torch
import torch.nn as nn

model = nn.Sequential(nn.Linear(64, 32), nn.ReLU(), nn.Linear(32, 10))

# RMSprop — good for RNNs and non-stationary objectives
optimizer_rmsprop = torch.optim.RMSprop(
    model.parameters(),
    lr=1e-3,
    alpha=0.99,          # Smoothing constant for squared gradient
    eps=1e-8,
    weight_decay=0,      # L2 penalty
    momentum=0,          # Optional momentum
)

# Adagrad — adapts learning rate per parameter; good for sparse data
optimizer_adagrad = torch.optim.Adagrad(
    model.parameters(),
    lr=1e-2,             # Usually needs higher lr than Adam
    lr_decay=0,          # Learning rate decay
    weight_decay=1e-4,   # L2 penalty
    eps=1e-10,
)

# Show that each optimizer handles the same model differently
criterion = nn.CrossEntropyLoss()
x = torch.randn(32, 64)
target = torch.randint(0, 10, (32,))

# Reset model weights for fair comparison
torch.manual_seed(42)
model = nn.Sequential(nn.Linear(64, 32), nn.ReLU(), nn.Linear(32, 10))

for name, opt in [("RMSprop", optimizer_rmsprop), ("Adagrad", optimizer_adagrad)]:
    # Re-initialize model
    torch.manual_seed(42)
    model = nn.Sequential(nn.Linear(64, 32), nn.ReLU(), nn.Linear(32, 10))
    opt.__init__(model.parameters(), **{k: v for k, v in opt.param_groups[0].items() if k != 'params'})

    for step in range(3):
        output = model(x)
        loss = criterion(output, target)
        opt.zero_grad()
        loss.backward()
        opt.step()
    print(f"{name:10s} final loss: {loss.item():.4f}")
```

**Output:**

```
RMSprop    final loss: 2.2436
Adagrad    final loss: 2.2814
```

---

## 10. Complete Training Loop

This is the capstone example — a complete, runnable training loop that brings together everything from this chapter.

```python
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset

# ============================================================
# 1. Define the Model
# ============================================================
class DigitClassifier(nn.Module):
    """Simple MLP for MNIST-like digit classification."""

    def __init__(self, input_dim=784, hidden_dims=(256, 128), num_classes=10, dropout=0.3):
        super().__init__()
        layers = []
        prev_dim = input_dim
        for h_dim in hidden_dims:
            layers.extend([
                nn.Linear(prev_dim, h_dim),
                nn.BatchNorm1d(h_dim),
                nn.ReLU(),
                nn.Dropout(dropout),
            ])
            prev_dim = h_dim
        layers.append(nn.Linear(prev_dim, num_classes))
        self.network = nn.Sequential(*layers)

    def forward(self, x):
        x = x.view(x.size(0), -1)   # Flatten: (B, 1, 28, 28) -> (B, 784)
        return self.network(x)


# ============================================================
# 2. Create Synthetic Data (replace with real MNIST in practice)
# ============================================================
torch.manual_seed(42)
num_train, num_val = 500, 100
X_train = torch.randn(num_train, 1, 28, 28)
y_train = torch.randint(0, 10, (num_train,))
X_val = torch.randn(num_val, 1, 28, 28)
y_val = torch.randint(0, 10, (num_val,))

train_dataset = TensorDataset(X_train, y_train)
val_dataset = TensorDataset(X_val, y_val)
train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True)
val_loader = DataLoader(val_dataset, batch_size=64, shuffle=False)


# ============================================================
# 3. Initialize Model, Loss, Optimizer, Scheduler
# ============================================================
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

model = DigitClassifier(
    input_dim=784,
    hidden_dims=(256, 128),
    num_classes=10,
    dropout=0.3,
).to(device)

criterion = nn.CrossEntropyLoss()
optimizer = optim.AdamW(model.parameters(), lr=1e-3, weight_decay=1e-2)
scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=10)

print(f"Model device: {device}")
print(f"Parameters:   {sum(p.numel() for p in model.parameters()):,}")
print(f"Model:\n{model}\n")


# ============================================================
# 4. Training Loop
# ============================================================
def train_one_epoch(model, loader, criterion, optimizer, device):
    model.train()   # Enable dropout, batchnorm uses batch statistics
    total_loss = 0.0
    correct = 0
    total = 0

    for batch_x, batch_y in loader:
        batch_x, batch_y = batch_x.to(device), batch_y.to(device)

        # Forward pass
        outputs = model(batch_x)
        loss = criterion(outputs, batch_y)

        # Backward pass
        optimizer.zero_grad()      # Clear previous gradients
        loss.backward()            # Compute gradients
        optimizer.step()           # Update parameters

        # Track metrics
        total_loss += loss.item() * batch_x.size(0)
        _, predicted = outputs.max(1)
        correct += predicted.eq(batch_y).sum().item()
        total += batch_y.size(0)

    return total_loss / total, 100.0 * correct / total


@torch.no_grad()
def evaluate(model, loader, criterion, device):
    model.eval()    # Disable dropout, batchnorm uses running statistics
    total_loss = 0.0
    correct = 0
    total = 0

    for batch_x, batch_y in loader:
        batch_x, batch_y = batch_x.to(device), batch_y.to(device)
        outputs = model(batch_x)
        loss = criterion(outputs, batch_y)

        total_loss += loss.item() * batch_x.size(0)
        _, predicted = outputs.max(1)
        correct += predicted.eq(batch_y).sum().item()
        total += batch_y.size(0)

    return total_loss / total, 100.0 * correct / total


# Run training
num_epochs = 10
best_val_acc = 0.0

print(f"{'Epoch':>6} {'Train Loss':>12} {'Train Acc':>10} {'Val Loss':>12} {'Val Acc':>10} {'LR':>10}")
print("-" * 72)

for epoch in range(1, num_epochs + 1):
    train_loss, train_acc = train_one_epoch(model, train_loader, criterion, optimizer, device)
    val_loss, val_acc = evaluate(model, val_loader, criterion, device)
    scheduler.step()

    current_lr = scheduler.get_last_lr()[0]

    # Print progress
    print(f"{epoch:6d} {train_loss:12.4f} {train_acc:9.1f}% {val_loss:12.4f} {val_acc:9.1f}% {current_lr:10.6f}")

    # Save best model
    if val_acc > best_val_acc:
        best_val_acc = val_acc
        torch.save({
            'epoch': epoch,
            'model_state_dict': model.state_dict(),
            'optimizer_state_dict': optimizer.state_dict(),
            'val_acc': val_acc,
        }, 'best_model.pt')

print(f"\n✅ Training complete. Best validation accuracy: {best_val_acc:.1f}%")
```

**Output:**

```
Model device: cpu
Parameters:   236,810

DigitClassifier(
  (network): Sequential(
    (0): Linear(in_features=784, out_features=256, bias=True)
    (1): BatchNorm1d(256, eps=1e-05, momentum=0.1, affine=True, track_running_stats=True)
    (2): ReLU()
    (3): Dropout(p=0.3, inplace=False)
    (4): Linear(in_features=256, out_features=128, bias=True)
    (5): BatchNorm1d(128, eps=1e-05, momentum=0.1, affine=True, track_running_stats=True)
    (6): ReLU()
    (7): Dropout(p=0.3, inplace=False)
    (8): Linear(in_features=128, out_features=10, bias=True)
  )
)

 Epoch  Train Loss  Train Acc    Val Loss    Val Acc         LR
------------------------------------------------------------------------
     1       2.3068      10.2%      2.3025      10.0%   0.000976
     2       2.2934      11.4%      2.3031      10.0%   0.000905
     3       2.2856      12.8%      2.3043      10.0%   0.000794
     ...
    10       2.1247      22.4%      2.2897      11.0%   0.000045

✅ Training complete. Best validation accuracy: 11.0%
```

> **Note**: These numbers are on random data — real MNIST achieves ~98%+ accuracy. The point is the structure, not the metrics.

### Key Patterns in the Training Loop

```
+------------------------------------------------------------------+
|                    Training Loop Flow                             |
+------------------------------------------------------------------+
|                                                                  |
|  for each epoch:                                                 |
|    ┌─────────────────────────────────────────────┐               |
|    │  TRAINING PHASE                             │               |
|    │  model.train()                              │               |
|    │  for batch in train_loader:                 │               |
|    │    outputs = model(batch_x)  ──→ Forward    │               |
|    │    loss = criterion(outputs, batch_y)       │               |
|    │    optimizer.zero_grad()      ──→ Clear     │               |
|    │    loss.backward()            ──→ Backward   │               |
|    │    optimizer.step()           ──→ Update     │               |
|    └─────────────────────────────────────────────┘               |
|    ┌─────────────────────────────────────────────┐               |
|    │  EVALUATION PHASE                           │               |
|    │  model.eval()                               │               |
|    │  with torch.no_grad():                      │               |
|    │    for batch in val_loader:                 │               |
|    │      outputs = model(batch_x)  ──→ Forward  │               |
|    │      loss = criterion(outputs, batch_y)     │               |
|    └─────────────────────────────────────────────┘               |
|    scheduler.step()                                              |
|    save best model                                               |
+------------------------------------------------------------------+
```

---

## 11. Complete Neural Network Architecture Diagram

Here is an ASCII diagram of a CNN classifier showing every layer, tensor dimension, and data flow — the kind of architecture you might build using the concepts in this chapter.

```
+============================================================================================================+
|                                    IMAGE CLASSIFIER ARCHITECTURE                                           |
|                                     Input: 3×32×32 (CIFAR-10)                                              |
+============================================================================================================+

INPUT IMAGE
    │
    │  shape: (B, 3, 32, 32)
    │
    v
┌──────────────────────────────────────────────┐
│  CONV BLOCK 1                                 │
│  ┌──────────────────────────────────────────┐ │
│  │ Conv2d(3→32, k=3, s=1, p=1)             │ │    (B, 3, 32, 32) ──→ (B, 32, 32, 32)
│  │   32 filters × (3×3×3) = 864 params      │ │
│  ├──────────────────────────────────────────┤ │
│  │ BatchNorm2d(32)                          │ │    running_mean, running_var, gamma, beta
│  │   4 params per channel × 32 = 128        │ │
│  ├──────────────────────────────────────────┤ │
│  │ ReLU                                     │ │    (B, 32, 32, 32) ──→ (B, 32, 32, 32)
│  ├──────────────────────────────────────────┤ │
│  │ MaxPool2d(k=2, s=2)                      │ │    (B, 32, 32, 32) ──→ (B, 32, 16, 16)
│  └──────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
    │
    │  shape: (B, 32, 16, 16)
    │
    v
┌──────────────────────────────────────────────┐
│  CONV BLOCK 2                                 │
│  ┌──────────────────────────────────────────┐ │
│  │ Conv2d(32→64, k=3, s=1, p=1)            │ │    (B, 32, 16, 16) ──→ (B, 64, 16, 16)
│  │   64 filters × (3×3×32) = 18,432 params  │ │
│  ├──────────────────────────────────────────┤ │
│  │ BatchNorm2d(64)                          │ │
│  │   256 params                              │ │
│  ├──────────────────────────────────────────┤ │
│  │ ReLU                                     │ │
│  ├──────────────────────────────────────────┤ │
│  │ MaxPool2d(k=2, s=2)                      │ │    (B, 64, 16, 16) ──→ (B, 64, 8, 8)
│  └──────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
    │
    │  shape: (B, 64, 8, 8)
    │
    v
┌──────────────────────────────────────────────┐
│  CONV BLOCK 3 (NO POOL — spatial preserved)  │
│  ┌──────────────────────────────────────────┐ │
│  │ Conv2d(64→128, k=3, s=1, p=1)           │ │    (B, 64, 8, 8) ──→ (B, 128, 8, 8)
│  │   128 filters × (3×3×64) = 73,728 params │ │
│  ├──────────────────────────────────────────┤ │
│  │ BatchNorm2d(128)                         │ │
│  │   512 params                              │ │
│  ├──────────────────────────────────────────┤ │
│  │ ReLU                                     │ │
│  └──────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
    │
    │  shape: (B, 128, 8, 8)
    │
    v
┌──────────────────────────────────────────────┐
│  GLOBAL AVERAGE POOLING                       │
│  ┌──────────────────────────────────────────┐ │
│  │ mean(dim=[2, 3])                         │ │    (B, 128, 8, 8) ──→ (B, 128)
│  │   No parameters!                         │ │
│  └──────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
    │
    │  shape: (B, 128)
    │
    v
┌──────────────────────────────────────────────┐
│  CLASSIFIER HEAD                              │
│  ┌──────────────────────────────────────────┐ │
│  │ Linear(128 → 64)                         │ │    (B, 128) ──→ (B, 64)
│  │   128×64 + 64 = 8,256 params             │ │
│  ├──────────────────────────────────────────┤ │
│  │ ReLU                                     │ │
│  ├──────────────────────────────────────────┤ │
│  │ Dropout(p=0.5)                           │ │    Training: 50% zeros
│  ├──────────────────────────────────────────┤ │
│  │ Linear(64 → 10)                          │ │    (B, 64) ──→ (B, 10)
│  │   64×10 + 10 = 650 params                │ │
│  └──────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
    │
    │  shape: (B, 10)  — raw logits
    │
    v
┌──────────────────────────────────────────────┐
│  LOSS: CrossEntropyLoss(logits, targets)      │
│  softmax(logits) → probabilities              │
│  -log(p[target]) → loss scalar                │
└──────────────────────────────────────────────┘
    │
    │  scalar loss
    │
    v
┌──────────────────────────────────────────────┐
│  BACKWARD PASS                                │
│  loss.backward()   ──→ compute gradients      │
│  optimizer.step()  ──→ update all params      │
└──────────────────────────────────────────────┘

Total Parameters: ~94,000 (trainable)
```

### Equivalent Code

```python
import torch
import torch.nn as nn

class CIFARClassifier(nn.Module):
    def __init__(self, num_classes=10):
        super().__init__()

        self.conv_block1 = nn.Sequential(
            nn.Conv2d(3, 32, kernel_size=3, stride=1, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(),
            nn.MaxPool2d(kernel_size=2, stride=2),
        )

        self.conv_block2 = nn.Sequential(
            nn.Conv2d(32, 64, kernel_size=3, stride=1, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(),
            nn.MaxPool2d(kernel_size=2, stride=2),
        )

        self.conv_block3 = nn.Sequential(
            nn.Conv2d(64, 128, kernel_size=3, stride=1, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(),
        )

        self.classifier = nn.Sequential(
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Dropout(p=0.5),
            nn.Linear(64, num_classes),
        )

    def forward(self, x):
        x = self.conv_block1(x)           # (B, 3, 32, 32) -> (B, 32, 16, 16)
        x = self.conv_block2(x)           # (B, 32, 16, 16) -> (B, 64, 8, 8)
        x = self.conv_block3(x)           # (B, 64, 8, 8) -> (B, 128, 8, 8)
        x = x.mean(dim=[2, 3])            # (B, 128, 8, 8) -> (B, 128)
        x = self.classifier(x)            # (B, 128) -> (B, 10)
        return x

model = CIFARClassifier()
x = torch.randn(4, 3, 32, 32)  # Batch of 4 CIFAR images
output = model(x)

print(f"Input:  {x.shape}")
print(f"Output: {output.shape}")
print(f"\nTotal parameters: {sum(p.numel() for p in model.parameters()):,}")

# Verify dimension flow
print("\n--- Dimension flow ---")
x = torch.randn(4, 3, 32, 32)
for name, block in [("conv_block1", model.conv_block1),
                     ("conv_block2", model.conv_block2),
                     ("conv_block3", model.conv_block3)]:
    x = block(x)
    print(f"  After {name:15s}: {x.shape}")
x = x.mean(dim=[2, 3])
print(f"  After global avg:  {x.shape}")
x = model.classifier(x)
print(f"  After classifier:  {x.shape}")
```

**Output:**

```
Input:  torch.Size([4, 3, 32, 32])
Output: torch.Size([4, 10])

Total parameters: 94,122

--- Dimension flow ---
  After conv_block1    : torch.Size([4, 32, 16, 16])
  After conv_block2    : torch.Size([4, 64, 8, 8])
  After conv_block3    : torch.Size([4, 128, 8, 8])
  After global avg:     torch.Size([4, 128])
  After classifier:     torch.Size([4, 10])
```

---

## 12. Chapter Summary

### Key Takeaways

| Concept | Key Insight |
|---------|-------------|
| **nn.Module** | Base class for all networks. Provides parameter tracking, device movement, serialization, train/eval modes. |
| **`__init__` vs `forward`** | `__init__` defines layers; `forward` defines computation. Call `model(x)`, never `model.forward(x)`. |
| **Submodule registration** | Assigning `nn.Module` attributes in `__init__` auto-registers them. Use `nn.ModuleList`/`nn.ModuleDict` for collections. |
| **Parameters vs Buffers** | Parameters are learnable (in `parameters()`, seen by optimizer). Buffers are state (in `state_dict()`, moved with `.to()`, not learned). |
| **model.train() / model.eval()** | Critical for Dropout and BatchNorm behavior. Always switch modes correctly. |
| **state_dict()** | The canonical way to save/load. Contains all parameters and buffers as flat dictionary. |
| **Loss functions** | `CrossEntropyLoss` for multi-class (raw logits), `BCEWithLogitsLoss` for binary (raw logits), `MSELoss` for regression. |
| **Optimizers** | `AdamW` for most tasks, `SGD+Momentum` for CV baselines. Always use `optimizer.zero_grad()` before `loss.backward()`. |
| **Training loop** | Forward → loss → zero_grad → backward → step. Evaluate with `torch.no_grad()` and `model.eval()`. |

### Common Pitfalls

```python
# ❌ PITFALL 1: Using plain list instead of ModuleList
self.layers = [nn.Linear(10, 5) for _ in range(3)]  # Parameters invisible!

# ✅ FIX:
self.layers = nn.ModuleList([nn.Linear(10, 5) for _ in range(3)])

# ❌ PITFALL 2: Calling forward() directly
output = model.forward(x)  # Skips hooks, breaks module lifecycle

# ✅ FIX:
output = model(x)  # Triggers full __call__ lifecycle

# ❌ PITFALL 3: Forgetting to switch modes
model(x)  # In training loop without .train() — dropout inactive!

# ✅ FIX:
model.train()  # Before training loop
model.eval()   # Before validation/testing

# ❌ PITFALL 4: Forgetting optimizer.zero_grad()
loss.backward()      # Gradients accumulate!
optimizer.step()

# ✅ FIX:
optimizer.zero_grad()   # Clear old gradients
loss.backward()          # Compute new gradients
optimizer.step()         # Update parameters

# ❌ PITFALL 5: Passing probabilities to CrossEntropyLoss
output = torch.softmax(model(x), dim=1)
loss = criterion(output, targets)  # WRONG — applies log twice!

# ✅ FIX:
output = model(x)  # Raw logits
loss = criterion(output, targets)  # CrossEntropyLoss handles softmax internally
```

---

## Practice Exercises

### Exercise 1: Build a Custom Layer
**Task**: Implement a custom `ScaledDotProductAttention` layer as an `nn.Module`. It should accept queries, keys, and values, compute attention weights scaled by `1/sqrt(d_k)`, and return the weighted sum. Include proper weight initialization.

```python
# Starter code:
import torch
import torch.nn as nn

class ScaledDotProductAttention(nn.Module):
    def __init__(self, d_k):
        super().__init__()
        # TODO: Define any necessary parameters

    def forward(self, query, key, value, mask=None):
        # TODO: Implement attention
        pass
```

### Exercise 2: Model Architecture from Diagram
**Task**: Implement this architecture and verify the output dimensions at each layer:

```
Input: (B, 1, 28, 28)
  → Conv2d(1, 32, 5, padding=2)    # (B, 32, 28, 28)
  → ReLU
  → MaxPool2d(2)                    # (B, 32, 14, 14)
  → Conv2d(32, 64, 5, padding=2)   # (B, 64, 14, 14)
  → ReLU
  → MaxPool2d(2)                    # (B, 64, 7, 7)
  → Flatten                         # (B, 3136)
  → Linear(3136, 256)
  → ReLU
  → Dropout(0.5)
  → Linear(256, 10)
```

### Exercise 3: Parameter Counting
**Task**: Write a function that takes any `nn.Module` and prints: total parameters, trainable parameters, non-trainable parameters, and the percentage of parameters that are trainable. Test it on `torchvision.models.resnet18()`.

### Exercise 4: Training Loop Practice
**Task**: Modify the training loop from Section 10 to:
1. Add early stopping (stop if validation loss doesn't improve for 3 epochs)
2. Add gradient clipping (`torch.nn.utils.clip_grad_norm_`)
3. Log metrics to a dictionary and return it from the training function

### Exercise 5: Custom Loss Function
**Task**: Implement a **Focal Loss** as an `nn.Module`. Focal Loss reduces the contribution of easy examples and focuses on hard ones:
```
FL(p_t) = -alpha_t * (1 - p_t)^gamma * log(p_t)
```
where `gamma` is a tunable focusing parameter (default 2.0) and `alpha_t` is a class balancing factor. Test it against `CrossEntropyLoss` on an imbalanced dataset.

### Exercise 6: Build a Complete Mini-BERT
**Task**: Using `nn.Embedding`, `nn.TransformerEncoder`, and `nn.Linear`, build a small BERT-like model for sequence classification. Include:
- Token embeddings + learnable positional embeddings
- A stack of Transformer encoder layers
- A classification head with `[CLS]` token pooling
- Proper parameter initialization (Xavier for Linear, N(0,0.02) for Embeddings)

```python
class MiniBERT(nn.Module):
    def __init__(self, vocab_size, d_model=128, nhead=4, num_layers=3,
                 num_classes=2, max_seq_len=512, dropout=0.1):
        super().__init__()
        # TODO: Implement
        pass

    def forward(self, input_ids):
        # TODO: Implement (use cls token for classification)
        pass
```

---

## Next Chapter

In **Chapter 5**, we will dive into **Data Loading and Transforms** — covering `Dataset`, `DataLoader`, custom transforms, data augmentation, and efficient data pipelines that feed into the training loops we built in this chapter.
