# Chapter 1: Introduction to PyTorch

**By Manjunath Kalburgi**

---

## What Is PyTorch?

PyTorch is an open-source machine learning library built on top of the Torch library, designed primarily for deep learning research and production applications. Developed by Meta AI (formerly Facebook AI Research, or FAIR), PyTorch provides a flexible, Pythonic interface for building and training neural networks with a focus on dynamic computation graphs and intuitive debugging.

At its core, PyTorch is a tensor computation library with GPU acceleration, combined with an automatic differentiation engine that powers neural network training. Think of it as NumPy with GPU support and automatic gradient computation.

```
+----------------------------------------------------------+
|                    PyTorch Architecture                   |
+----------------------------------------------------------+
|                                                          |
|   +-------------------+    +------------------------+    |
|   |   Python Frontend  |    |  C++/CUDA Backend      |    |
|   |                   |    |                        |    |
|   |  - nn.Module      |    |  - Tensor operations   |    |
|   |  - Optimizers     |    |  - GPU kernels         |    |
|   |  - DataLoading    |    |  - Autograd engine     |    |
|   |  - Transforms     |    |  - Memory management   |    |
|   +--------+----------+    +-----------+------------+    |
|            |                           |                 |
|            +------------+--------------+                 |
|                         |                                |
|             +-----------v------------+                   |
|             |   Computation Graph     |                   |
|             |   (Dynamic / Define-    |                   |
|             |    by-Run)              |                   |
|             +------------------------+                   |
+----------------------------------------------------------+
```

## A Brief History

### From Torch to PyTorch

The story of PyTorch begins with **Torch**, a scientific computing framework with wide support for machine learning algorithms that debuted in 2002. Torch was written in C with a Lua interface, which made it powerful but not particularly accessible to the broader Python-centric data science community.

| Year | Milestone |
|------|-----------|
| 2002 | Torch released at NYU, written in C with Lua bindings |
| 2015 | Torch7 becomes popular in research labs (used by Google, Facebook, etc.) |
| 2016 | Facebook AI Research releases PyTorch as a Python-native successor to Torch |
| 2017 | PyTorch 0.4.0 merges `torch` and `torch.autograd`, unifying tensor and variable |
| 2018 | PyTorch 1.0 released with TorchScript for production deployment |
| 2019 | PyTorch Hub released for easy model loading; PyTorch Lightning emerges |
| 2020 | PyTorch 1.6 adds AMP (automatic mixed precision), RPC framework |
| 2021 | PyTorch 1.9 adds `torch.linalg`, `torch.fft` modules |
| 2022 | PyTorch 2.0 introduces `torch.compile()` for graph-based optimization |
| 2023 | PyTorch becomes a Linux Foundation project; `torch.compile` matures |
| 2024 | PyTorch 2.x series continues with full `torch.compile` support, FP8 training |
| 2025 | PyTorch 2.5+ with improved `torch.compile`, `torch.export`, distributed improvements |

### Meta AI Research (FAIR)

Facebook AI Research (now Meta AI) created PyTorch to address the limitations they faced with existing frameworks. The key insight was that **researchers need flexibility** — they need to debug models interactively, change architectures on the fly, and reason about what their code is doing. PyTorch's dynamic computation graph ("define-by-run") philosophy was a direct answer to this need.

## PyTorch vs Other Frameworks

The deep learning ecosystem has several major players. Understanding how PyTorch compares helps you make informed choices.

### Feature Comparison

| Feature | PyTorch | TensorFlow | JAX | PaddlePaddle | MXNet |
|---------|---------|------------|-----|--------------|-------|
| **Developer** | Meta AI | Google | Google | Baidu | Apache |
| **Primary Language** | Python | Python | Python | Python | Python/C++ |
| **Computation Graph** | Dynamic (eager) | Static + Eager | Functional (jit) | Static + Eager | Symbolic + Imperative |
| **Define Style** | Define-by-run | Define-then-run (v1), Eager (v2) | Functional transforms | Static graph | Mixed |
| **Deployment** | TorchServe, ONNX, TorchScript | TFServing, Lite, JS | SavedModel, jax2tf | Paddle Inference | MXNet Model Server |
| **GPU Support** | CUDA, ROCm, MPS | CUDA, ROCm | CUDA, TPU | CUDA | CUDA |
| **TPU Support** | Via PyTorch/XLA | Native | Native | Yes | Yes |
| **Differentiation** | Autograd | GradientTape | JAX autodiff | Backward | Autograd |
| **Ecosystem Maturity** | Very High | Very High | Growing | Regional (China) | Declining |
| **Community Size** | Very Large | Very Large | Growing | Large (China) | Medium |
| **Industry Adoption** | Research-dominant, growing production | Production-dominant, research | Research (ML research) | China market | Declining |
| **Learning Curve** | Moderate | Moderate-High | High | Moderate | Moderate |
| **Debugging** | Excellent (Python debugger) | Good (TF Debugger v2) | Good | Moderate | Moderate |

### Why PyTorch Has Won the Research Mindshare

As of 2024-2025, PyTorch dominates machine learning research:

- **Over 80%** of top ML conference papers (NeurIPS, ICML, ICLR) use PyTorch
- **Hugging Face**, the center of the modern ML ecosystem, is PyTorch-first
- **All major LLMs** (LLaMA, Mistral, GPT implementations, etc.) have primary PyTorch implementations
- Libraries like **torchvision**, **torchaudio**, **torchtext**, and **PyTorch Lightning** form a rich ecosystem

### Key Differentiators

1. **Pythonic Design**: PyTorch feels like native Python. You can use standard Python debuggers (`pdb`, `ipdb`, IDE debuggers), print tensors freely, and use Python control flow in model definitions.

2. **Dynamic Computation Graphs**: Unlike TensorFlow 1.x's static graphs, PyTorch builds the computation graph on-the-fly. This means the graph changes with each forward pass, enabling dynamic architectures like varying-length RNNs, conditional computation, and interactive debugging.

3. **Imperative Programming**: You write code that *runs*. There's no separate compilation step. This makes PyTorch code intuitive to write, read, and debug.

4. **Research-to-Production Pipeline**: With `torch.compile()` (PyTorch 2.0+), TorchScript, and ONNX export, models can be optimized for production without rewriting.

## Installation

### Prerequisites

Before installing PyTorch, ensure you have:

- **Python 3.8+** (Python 3.10-3.12 recommended)
- **pip** (Python package installer) or **conda** (Anaconda/Miniconda)
- **NVIDIA GPU** (optional but recommended): CUDA Toolkit 11.8 or 12.x
- **At least 4 GB RAM** for CPU-only; 8+ GB recommended

### Installation via pip

The most common installation method. Visit [pytorch.org](https://pytorch.org) for the latest commands:

```bash
# CPU-only (smallest download, no GPU support)
pip install torch torchvision torchaudio

# CUDA 12.4 (recommended for most GPU users as of 2025)
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu124

# CUDA 11.8 (for older GPUs)
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

# ROCm 6.0 (for AMD GPUs on Linux)
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/rocm6.0
```

### Installation via Conda

Conda manages CUDA dependencies automatically, which can simplify setup:

```bash
# CPU-only
conda install pytorch torchvision torchaudio cpuonly -c pytorch

# CUDA 12.4
conda install pytorch torchvision torchaudio pytorch-cuda=12.4 -c pytorch -c nvidia

# CUDA 11.8
conda install pytorch torchvision torchaudio pytorch-cuda=11.8 -c pytorch -c nvidia
```

### Installation from Source

For development or custom builds:

```bash
# Clone the repository
git clone --recursive https://github.com/pytorch/pytorch
cd pytorch

# If you already cloned and forgot --recursive
git submodule sync
git submodule update --init --recursive

# Install dependencies
pip install -r requirements.txt

# Set environment variables for CUDA (if applicable)
export TORCH_CUDA_ARCH_LIST="8.0"  # For A100 GPUs

# Build and install
python setup.py install
# Or for development:
pip install -e .
```

### Verifying Installation

```python
import torch

# Basic check
print(f"PyTorch version: {torch.__version__}")

# CUDA availability
print(f"CUDA available: {torch.cuda.is_available()}")
if torch.cuda.is_available():
    print(f"CUDA version: {torch.version.cuda}")
    print(f"GPU count: {torch.cuda.device_count()}")
    print(f"GPU name: {torch.cuda.get_device_name(0)}")

# MPS availability (Apple Silicon)
print(f"MPS available: {torch.backends.mps.is_available()}")

# Quick GPU test
if torch.cuda.is_available():
    x = torch.randn(1000, 1000, device='cuda')
    y = torch.randn(1000, 1000, device='cuda')
    z = x @ y  # Matrix multiply on GPU
    print(f"GPU compute test passed: result shape = {z.shape}")
```

## Setting Up Your Python Environment

### Recommended Project Structure

```
my_project/
├── pyproject.toml          # Project metadata and dependencies
├── .python-version         # Python version pinning
├── .env.example            # Environment variables template
├── data/                   # Raw and processed data
├── notebooks/              # Jupyter notebooks for exploration
├── src/
│   ├── __init__.py
│   ├── model.py            # Model definitions
│   ├── train.py            # Training loop
│   ├── evaluate.py         # Evaluation scripts
│   ├── dataset.py          # Dataset and DataLoader
│   └── utils.py            # Utility functions
├── configs/                # Configuration files (YAML/JSON)
├── checkpoints/            # Saved model weights
├── logs/                   # Training logs (TensorBoard, etc.)
└── tests/                  # Unit and integration tests
```

### Using virtual environments

```bash
# Using venv (built into Python)
python -m venv .venv
source .venv/bin/activate  # Linux/macOS
.venv\Scripts\activate     # Windows

# Using uv (fast Python package manager)
uv venv
source .venv/bin/activate

# Using conda
conda create -n pytorch_env python=3.11
conda activate pytorch_env
```

### Essential Companion Packages

```bash
pip install torch torchvision torchaudio  # Core PyTorch

# Data & Utilities
pip install numpy pandas matplotlib seaborn scikit-learn

# Experiment Tracking
pip install tensorboard wandb

# Jupyter Notebooks
pip install jupyter ipywidgets

# High-Level Training
pip install pytorch-lightning   # or
pip install lightning           # New unified package name

# Hugging Face Ecosystem
pip install transformers datasets accelerate tokenizers

# Distributed Training
pip install torchrun  # Built into PyTorch
```

## Your First PyTorch Program

Let's build a complete first program that introduces tensors, operations, and basic concepts:

```python
import torch
import math

def main():
    print("=" * 60)
    print("  Welcome to PyTorch! Your First Program")
    print("=" * 60)

    # ── 1. Creating Tensors ──────────────────────────────
    print("\n[1] Creating Tensors")
    print("-" * 40)

    # From Python lists
    a = torch.tensor([1.0, 2.0, 3.0, 4.0])
    print(f"From list:     {a}")

    # Zeros and ones
    zeros = torch.zeros(3, 4)
    ones = torch.ones(2, 3)
    print(f"Zeros (3x4):  \n{zeros}")
    print(f"Ones (2x3):   \n{ones}")

    # Random tensors
    rand_uniform = torch.rand(3, 3)
    rand_normal = torch.randn(3, 3)
    print(f"Uniform [0,1): \n{rand_uniform}")
    print(f"Normal N(0,1): \n{rand_normal}")

    # Identity matrix
    eye = torch.eye(4)
    print(f"Identity 4x4: \n{eye}")

    # Range
    arange = torch.arange(0, 10, 2)
    linspace = torch.linspace(0, 1, 5)
    print(f"arange(0,10,2): {arange}")
    print(f"linspace(0,1,5): {linspace}")

    # ── 2. Tensor Properties ──────────────────────────────
    print("\n[2] Tensor Properties")
    print("-" * 40)

    x = torch.randn(2, 3, 4)
    print(f"Shape:   {x.shape}")
    print(f"Rank:    {x.ndim}")
    print(f" Dtype:   {x.dtype}")
    print(f"Device:  {x.device}")
    print(f"Size:    {x.numel()} elements")

    # ── 3. Basic Arithmetic ────────────────────────────────
    print("\n[3] Basic Arithmetic")
    print("-" * 40)

    a = torch.tensor([1.0, 2.0, 3.0])
    b = torch.tensor([4.0, 5.0, 6.0])

    print(f"a + b = {a + b}")
    print(f"a - b = {a - b}")
    print(f"a * b = {a * b}")
    print(f"a / b = {a / b}")
    print(f"a ** 2 = {a ** 2}")
    print(f"a @ b  (dot) = {a @ b}")  # Dot product
    print(f"torch.dot(a, b) = {torch.dot(a, b)}")

    # ── 4. Matrix Operations ───────────────────────────────
    print("\n[4] Matrix Operations")
    print("-" * 40)

    M = torch.tensor([[1.0, 2.0], [3.0, 4.0]])
    N = torch.tensor([[5.0, 6.0], [7.0, 8.0]])

    print(f"M = \n{M}")
    print(f"N = \n{N}")
    print(f"M @ N (matmul) = \n{M @ N}")
    print(f"M.T (transpose) = \n{M.T}")
    print(f"det(M) = {torch.det(M):.1f}")
    print(f"trace(M) = {torch.trace(M):.1f}")

    # ── 5. Reshaping ───────────────────────────────────────
    print("\n[5] Reshaping Tensors")
    print("-" * 40)

    t = torch.arange(12)
    print(f"Original: {t}")
    print(f"Reshape to 3x4:  \n{t.reshape(3, 4)}")
    print(f"Reshape to 4x3:  \n{t.reshape(4, 3)}")
    print(f"View as 2x2x3:   \n{t.view(2, 2, 3)}")
    print(f"Flattened:        {t.flatten()}")
    print(f"Unsqueeze(0):     {t.unsqueeze(0).shape}")

    # ── 6. Aggregation ─────────────────────────────────────
    print("\n[6] Aggregation Operations")
    print("-" * 40)

    data = torch.tensor([[1.0, 5.0, 3.0],
                         [4.0, 2.0, 6.0]])
    print(f"Data: \n{data}")
    print(f"Sum:     {data.sum():.1f}")
    print(f"Mean:    {data.mean():.1f}")
    print(f"Max:     {data.max():.1f}")
    print(f"Min:     {data.min():.1f}")
    print(f"Argmax:  {data.argmax()}")
    print(f"Sum dim=0 (across rows):   {data.sum(dim=0)}")
    print(f"Sum dim=1 (across cols):   {data.sum(dim=1)}")

    # ── 7. GPU Check ───────────────────────────────────────
    print("\n[7] Device Check")
    print("-" * 40)

    if torch.cuda.is_available():
        device = torch.device("cuda")
        gpu_tensor = torch.randn(3, 3, device=device)
        print(f"GPU: {torch.cuda.get_device_name(0)}")
        print(f"GPU tensor device: {gpu_tensor.device}")
        print(f"GPU tensor:\n{gpu_tensor.cpu()}")  # Move to CPU for display
    elif torch.backends.mps.is_available():
        device = torch.device("mps")
        gpu_tensor = torch.randn(3, 3, device=device)
        print(f"Apple MPS (Metal) available")
        print(f"MPS tensor device: {gpu_tensor.device}")
    else:
        print("No GPU detected. Running on CPU.")
        cpu_tensor = torch.randn(3, 3)
        print(f"CPU tensor device: {cpu_tensor.device}")

    # ── 8. Automatic Differentiation Preview ────────────────
    print("\n[8] Autograd Preview (a taste of Chapter 3)")
    print("-" * 40)

    x = torch.tensor(2.0, requires_grad=True)
    y = x ** 3 + 2 * x ** 2 - 5 * x + 3
    y.backward()
    print(f"f(x) = x^3 + 2x^2 - 5x + 3")
    print(f"f(2) = {y.item():.1f}")
    print(f"f'(x) = 3x^2 + 4x - 5")
    print(f"f'(2) = {x.grad.item():.1f}")  # 3(4) + 4(2) - 5 = 15

    # ── 9. Saving and Loading ──────────────────────────────
    print("\n[9] Saving & Loading Tensors")
    print("-" * 40)

    tensor_to_save = torch.randn(3, 3)
    torch.save(tensor_to_save, "my_tensor.pt")
    loaded = torch.load("my_tensor.pt", weights_only=True)
    print(f"Saved and loaded tensor:\n{loaded}")
    print(f"Tensors match: {torch.equal(tensor_to_save, loaded)}")

    # Cleanup
    import os
    if os.path.exists("my_tensor.pt"):
        os.remove("my_tensor.pt")

    print("\n" + "=" * 60)
    print("  Congratulations! You've run your first PyTorch program!")
    print("=" * 60)


if __name__ == "__main__":
    main()
```

## Why PyTorch Is Popular

### 1. Pythonic Nature

PyTorch is designed to integrate seamlessly with the Python ecosystem. You can:

```python
# Use standard Python debugging
import pdb

def forward(x):
    result = x @ weight + bias
    pdb.set_trace()  # Debug interactively
    return torch.relu(result)

# Use Python control flow
def dynamic_forward(x):
    if x.sum() > 0:
        return x * 2
    else:
        return x * -1

# Use list comprehensions, generators, etc.
activations = [torch.relu(layer(x)) for layer in layers]
```

### 2. Dynamic Computation Graphs (Define-by-Run)

```python
import torch

# The graph is built on-the-fly during each forward pass
x = torch.randn(3, requires_grad=True)
w = torch.randn(3, requires_grad=True)

# This builds a NEW graph each time
y = x * w  # Graph 1
z = y.sum()
z.backward()
print(f"Grad w.r.t. w: {w.grad}")

# Reset gradients
w.grad.zero_()

# A DIFFERENT computation builds a DIFFERENT graph
y = x * w + 2  # Graph 2 (different from Graph 1)
z = y.sum()
z.backward()
print(f"Grad w.r.t. w (new graph): {w.grad}")
```

### 3. Excellent Debugging Experience

```python
# You can inspect everything at any point
x = torch.randn(5, 5)
print(f"Shape: {x.shape}")
print(f"Values: {x}")
print(f"Statistics: mean={x.mean():.4f}, std={x.std():.4f}")

# Standard Python breakpoints work
def train_step(model, data):
    output = model(data)
    loss = compute_loss(output)
    loss.backward()
    # Set a breakpoint right here and inspect gradients!
    print(f"Gradient norm: {sum(p.grad.norm().item() for p in model.parameters()):.4f}")
    return loss
```

### 4. Rich Ecosystem

```
                    +-------------------------------------------+
                    |            PyTorch Ecosystem               |
                    +-------------------------------------------+
                    |                                           |
   +------------------+  +------------------+  +------------------+
   |    Core Library   |  |   Domain Libs   |  |   Tools & Infra   |
   |                   |  |                  |  |                   |
   |  - torch          |  |  - torchvision   |  |  - PyTorch/XLA    |
   |  - torch.autograd |  |  - torchaudio    |  |  - TorchServe     |
   |  - torch.nn       |  |  - torchtext     |  |  - TorchElastic   |
   |  - torch.optim    |  |  - torchdata     |  |  - FSDP           |
   |  - torch.distrib  |  |  - functorch     |  |  - torch.compile  |
   +------------------+  +------------------+  +------------------+
                    |                                           |
   +------------------+  +------------------+  +------------------+
   |  Hugging Face    |  |   High-Level     |  |   Monitoring      |
   |                   |  |                  |  |                   |
   |  - transformers   |  |  - Lightning     |  |  - TensorBoard    |
   |  - datasets       |  |  - FastAI        |  |  - Weights&Biases |
   |  - accelerate     |  |  - PyTorch       |  |  - Aim            |
   |  - diffusers      |  |    Ignite        |  |  - ClearML        |
   +------------------+  +------------------+  +------------------+
```

### 5. Industry & Research Adoption

- **Meta**: Internal ML infrastructure, recommendation systems, computer vision
- **Tesla**: Autopilot/Full Self-Driving neural networks
- **Microsoft**: Azure ML, ONNX Runtime integration
- **NVIDIA**: cuDNN, TensorRT integration, deep learning research
- **OpenAI**: Early GPT models, many research projects
- **Hugging Face**: Transformers library (the backbone of modern NLP)
- **Academia**: 80%+ of NeurIPS, ICML, ICLR papers

## The Training Loop Concept

Every deep learning project follows the same fundamental pattern — the **training loop**. Understanding this pattern is crucial:

```
    ┌─────────────────────────────────────────────────┐
    │              The Training Loop                   │
    │                                                  │
    │  ┌──────────────┐                               │
    │  │  Load Data   │◄──────────────────────┐       │
    │  └──────┬───────┘                       │       │
    │         │                               │       │
    │         v                               │       │
    │  ┌──────────────┐                       │       │
    │  │  Forward Pass │                       │       │
    │  │  (predict)    │                       │       │
    │  └──────┬───────┘                       │       │
    │         │                               │       │
    │         v                               │       │
    │  ┌──────────────┐                       │       │
    │  │Compute Loss  │                       │       │
    │  └──────┬───────┘                       │       │
    │         │                               │       │
    │         v                               │       │
    │  ┌──────────────┐     No                │       │
    │  │  Epoch done? │──────────────────────►│       │
    │  └──────┬───────┘                       │       │
    │         │ Yes                            │       │
    │         v                               │       │
    │  ┌──────────────┐                       │       │
    │  │   Backward    │                       │       │
    │  │   Pass        │                       │       │
    │  │ (compute      │                       │       │
    │  │  gradients)   │                       │       │
    │  └──────┬───────┘                       │       │
    │         │                               │       │
    │         v                               │       │
    │  ┌──────────────┐                       │       │
    │  │Update Weights │──────────────────────┘       │
    │  │(optimizer)    │                               │
    │  └──────────────┘                               │
    │                                                  │
    └─────────────────────────────────────────────────┘
```

### Minimal Training Loop

```python
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset

# 1. Define a simple model
model = nn.Sequential(
    nn.Linear(10, 64),
    nn.ReLU(),
    nn.Linear(64, 32),
    nn.ReLU(),
    nn.Linear(32, 1),
)

# 2. Loss function and optimizer
criterion = nn.MSELoss()
optimizer = optim.Adam(model.parameters(), lr=0.001)

# 3. Generate dummy data
X = torch.randn(1000, 10)
y = torch.randn(1000, 1)
dataset = TensorDataset(X, y)
dataloader = DataLoader(dataset, batch_size=32, shuffle=True)

# 4. Training loop
num_epochs = 10
for epoch in range(num_epochs):
    epoch_loss = 0.0
    for batch_X, batch_y in dataloader:
        # Forward pass
        predictions = model(batch_X)
        loss = criterion(predictions, batch_y)

        # Backward pass
        optimizer.zero_grad()   # Clear previous gradients
        loss.backward()         # Compute gradients
        optimizer.step()        # Update weights

        epoch_loss += loss.item()

    avg_loss = epoch_loss / len(dataloader)
    if (epoch + 1) % 2 == 0:
        print(f"Epoch [{epoch+1}/{num_epochs}], Loss: {avg_loss:.4f}")
```

## The Three Pillars of PyTorch

PyTorch is built on three foundational pillars:

### 1. Tensor Computation (the "NumPy with GPU")

```python
import torch

# Tensors are the fundamental data structure
x = torch.randn(3, 4)           # Random normal tensor
y = torch.ones(3, 4)            # All ones
z = x + y                       # Element-wise addition
result = torch.matmul(x, y.T)   # Matrix multiplication
```

### 2. Automatic Differentiation (the "AutoGrad engine")

```python
import torch

# Tensors can track operations for gradient computation
x = torch.tensor([2.0, 3.0], requires_grad=True)
w = torch.tensor([1.0, 1.0], requires_grad=True)

y = (x * w).sum()       # Forward pass
y.backward()             # Backward pass — compute gradients

print(f"dy/dx = {x.grad}")  # [1.0, 1.0]
print(f"dy/dw = {w.grad}")  # [2.0, 3.0]
```

### 3. Neural Network Modules (the "nn" package)

```python
import torch
import torch.nn as nn

class SimpleNet(nn.Module):
    def __init__(self):
        super().__init__()
        self.layers = nn.Sequential(
            nn.Linear(784, 256),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.Linear(128, 10),
        )

    def forward(self, x):
        return self.layers(x)

model = SimpleNet()
print(f"Model parameters: {sum(p.numel() for p in model.parameters()):,}")
```

## PyTorch Versions and Hardware Support

| Component | Supported Options |
|-----------|------------------|
| **Python** | 3.8 - 3.12 (3.10+ recommended) |
| **Operating System** | Linux, macOS, Windows |
| **GPU: NVIDIA** | CUDA 11.8, 12.1, 12.4, 12.6 |
| **GPU: AMD** | ROCm 6.0+ (Linux only) |
| **GPU: Apple** | MPS backend (macOS 12.3+, Apple Silicon) |
| **TPU** | Via PyTorch/XLA |
| **CPU** | x86_64, ARM64 (Apple Silicon native) |

## Summary

In this chapter, we covered:

1. **What PyTorch is**: A Python-first deep learning library from Meta AI, built on dynamic computation graphs
2. **History**: From Torch (Lua, 2002) to PyTorch (Python, 2016) to the modern 2.x series with `torch.compile`
3. **Comparison**: PyTorch vs TensorFlow, JAX, and others — PyTorch wins on flexibility and research adoption
4. **Installation**: pip, conda, and source builds for CPU, CUDA, ROCm, and MPS
5. **Environment Setup**: Project structure, virtual environments, companion packages
6. **First Program**: Creating tensors, arithmetic, matrix operations, reshaping, aggregation, GPU check, autograd preview
7. **Why PyTorch is popular**: Pythonic, dynamic graphs, debugging, ecosystem, industry adoption
8. **Training Loop**: The fundamental pattern of forward pass → loss → backward pass → update
9. **Three Pillars**: Tensors, Autograd, nn.Module

## Practice Exercises

### Exercise 1: Installation Verification

Write a script `verify_install.py` that:
1. Prints the PyTorch version
2. Checks CUDA, MPS, and CPU availability
3. Creates a tensor on each available device
4. Performs a matrix multiplication on each device and times it

### Exercise 2: Tensor Playground

Create tensors of various shapes and types:
- A 3D tensor of shape (4, 5, 6) filled with random normal values
- A 5x5 identity matrix of type `float64`
- A tensor from a Python nested list: `[[1, 2], [3, 4], [5, 6]]`
- A tensor of zeros with the same shape as the identity matrix but dtype `bool`
- A tensor using `torch.arange` that goes from -1 to 1 in 0.1 steps

### Exercise 3: GPU Benchmarking

If you have a GPU, write a benchmark that:
1. Creates two large matrices (e.g., 10000x10000) on CPU
2. Times matrix multiplication on CPU
3. Moves the matrices to GPU
4. Times matrix multiplication on GPU
5. Prints the speedup ratio

### Exercise 4: Model Parameter Counting

Write a function that:
1. Creates an `nn.Sequential` model with at least 5 layers
2. Prints the total number of parameters
3. Prints each layer's name, weight shape, and bias shape
4. Prints the percentage of parameters in each layer

### Exercise 5: Mini Training Loop

Implement a training loop that:
1. Creates a synthetic dataset: `y = 3x + 2 + noise`
2. Defines a linear model `nn.Linear(1, 1)`
3. Trains for 100 epochs with SGD
4. Prints the learned weight and bias (should be close to 3 and 2)
5. Plots the loss curve using matplotlib

---

*In the next chapter, we'll dive deep into tensors — the fundamental building block of every PyTorch computation. You'll learn every way to create, manipulate, and operate on tensors.*
