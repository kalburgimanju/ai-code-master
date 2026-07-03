# Chapter 12: Advanced Topics

**By Manjunath Kalburgi**

---

## Introduction

This chapter dives into the advanced internals and power-user features of PyTorch. We move beyond building and training standard models into territory that separates practitioners from engineers: custom autograd functions, C++ extensions, compilation, memory management, model surgery, and performance profiling. These tools are essential when you need custom behavior, maximum performance, or the ability to debug and optimize complex training pipelines.

```
+------------------------------------------------------------------+
|                     Chapter 12 Roadmap                            |
+------------------------------------------------------------------+
|                                                                  |
|  Autograd Internals        Compilation & Optimization             |
|  ┌──────────────────┐      ┌──────────────────────┐              |
|  │ Custom Functions  │      │ torch.compile         │              |
|  │ Straight-Through │      │ TorchDynamo           │              |
|  │ Estimator         │      │ C++ Extensions        │              |
|  └────────┬─────────┘      └──────────┬───────────┘              |
|           │                           │                          |
|  ┌────────▼─────────┐      ┌──────────▼───────────┐              |
|  │ Memory Management │      │ Profiling & Debug     │              |
|  │ AMP & Checkpoint  │      │ torch.profiler        │              |
|  │ CUDA Kernels      │      │ TensorBoard           │              |
|  └────────┬─────────┘      └──────────┬───────────┘              |
|           │                           │                          |
|  ┌────────▼───────────────────────────▼──────────┐              |
|  │  Model Surgery │ torch.fx │ Datasets │ Attention │              |
|  └───────────────────────────────────────────────┘              |
+------------------------------------------------------------------+
```

---

## Custom Autograd Functions

PyTorch's `autograd` engine automatically computes gradients via reverse-mode differentiation. However, there are situations where the built-in gradient formulas are insufficient or incorrect for your use case. `torch.autograd.Function` lets you define both the forward and backward passes from scratch.

### Anatomy of a Custom Function

```python
import torch
from torch.autograd import Function


class MyReLU(Function):
    """Custom ReLU that clips gradients to a maximum value."""

    @staticmethod
    def forward(ctx, input, clip_value=1.0):
        # ctx is a context object to save info for backward
        ctx.clip_value = clip_value
        ctx.save_for_backward(input)
        return input.clamp(min=0)

    @staticmethod
    def backward(ctx, grad_output):
        input, = ctx.saved_tensors
        # Gradient is 1 where input > 0, 0 otherwise
        grad_input = grad_output.clone()
        grad_input[input <= 0] = 0
        # Clip gradient magnitude
        grad_input = grad_input.clamp(
            min=-ctx.clip_value, max=ctx.clip_value
        )
        return grad_input, None  # None for clip_value (not differentiable)
```

### Using the Custom Function

```python
# Forward pass via apply()
x = torch.randn(4, requires_grad=True)
y = MyReLU.apply(x, clip_value=0.5)
loss = y.sum()
loss.backward()

print(f"Input:  {x}")
print(f"Output: {y}")
print(f"Grad:   {x.grad}")
```

```
Input:  tensor([ 0.5083, -1.2060,  0.8142, -0.3125], requires_grad=True)
Output: tensor([0.5083, 0.0000, 0.8142, 0.0000])
Grad:   tensor([ 0.5000,  0.0000,  0.5000,  0.0000])
```

### Complete Example: Custom Softplus with Stable Backward

The standard `torch.nn.functional.softplus` can overflow for large inputs. Here is a numerically stable version:

```python
import torch
from torch.autograd import Function


class StableSoftplus(Function):
    """Numerically stable softplus: log(1 + exp(x))."""

    @staticmethod
    def forward(ctx, x, beta=1.0, threshold=20.0):
        ctx.beta = beta
        ctx.threshold = threshold

        # For large values, use linear approximation to avoid overflow
        large_mask = (x * beta) > threshold
        result = torch.zeros_like(x)
        result[large_mask] = x[large_mask]  # Linear regime
        exp_x = torch.exp(x[~large_mask] * beta)
        result[~large_mask] = torch.log(1 + exp_x) / beta
        ctx.save_for_backward(result)
        return result

    @staticmethod
    def backward(ctx, grad_output):
        beta = ctx.beta
        result, = ctx.saved_tensors
        # sigmoid(beta * x) = 1 - exp(-beta * softplus(beta * x))
        # = 1 - exp(-beta * result)
        grad_input = 1 - torch.exp(-beta * result)
        return grad_input * grad_output, None, None


# Verify against torch built-in
x = torch.linspace(-10, 10, 100, requires_grad=True)
custom_out = StableSoftplus.apply(x, beta=1.0, threshold=20.0)
torch_out = torch.nn.functional.softplus(x, beta=1.0, threshold=20.0)
print(f"Max difference: {(custom_out - torch_out).abs().max().item():.6e}")
```

### Rules for Custom Functions

| Rule | Description |
|------|-------------|
| `forward` signature | First arg is `ctx`, followed by tensors and non-tensor args |
| `backward` signature | First arg is `ctx`, followed by `grad_output` for each output |
| `backward` return | Must return one gradient per `forward` input (use `None` for non-tensor args) |
| `save_for_backward` | Use only for tensors needed in backward; store non-tensor info on `ctx` directly |
| Determinism | `forward` must be deterministic given the same inputs |
| No side effects | Do not modify inputs in place inside `forward` |
| `@staticmethod` | Both `forward` and `backward` must be static methods |

---

## Custom Autograd for Non-Differentiable Operations

Many operations in deep learning are inherently discrete (argmax, rounding, sampling). The **straight-through estimator (STE)** is a technique that lets gradients flow through these non-differentiable operations by defining a surrogate gradient.

### Straight-Through Estimator for Quantization

```python
import torch
from torch.autograd import Function


class StraightThroughRound(Function):
    """Forward: round to nearest integer.
    Backward: pass gradient through unchanged (identity)."""

    @staticmethod
    def forward(ctx, x):
        return torch.round(x)

    @staticmethod
    def backward(ctx, grad_output):
        return grad_output  # Identity: gradient passes through


class FakeQuantize(Function):
    """Simulate quantization with straight-through gradient."""

    @staticmethod
    def forward(ctx, x, num_bits=8, min_val=None, max_val=None):
        if min_val is None:
            min_val = x.min()
        if max_val is None:
            max_val = x.max()

        # Compute scale and zero point
        qmin = 0
        qmax = 2**num_bits - 1
        scale = (max_val - min_val) / (qmax - qmin)
        zero_point = qmin - min_val / scale

        # Quantize and dequantize
        x_clamped = torch.clamp(x, min_val, max_val)
        x_rounded = torch.round(x_clamped / scale + zero_point)
        x_dequant = (x_rounded - zero_point) * scale

        ctx.save_for_backward(x, x_dequant)
        ctx.scale = scale
        return x_dequant

    @staticmethod
    def backward(ctx, grad_output):
        x, x_dequant = ctx.saved_tensors
        # STE: pass gradient through, but mask out-of-range
        mask = (x >= x_dequant - ctx.scale * 0.5) & (
            x <= x_dequant + ctx.scale * 0.5
        )
        return grad_output * mask.float(), None, None, None


# Usage
x = torch.randn(5, requires_grad=True)
quantized = FakeQuantize.apply(x, num_bits=8)
loss = quantized.sum()
loss.backward()
print(f"Original:    {x.data}")
print(f"Quantized:   {quantized.data}")
print(f"Gradients:   {x.grad}")
```

### Gumbel-Softmax for Discrete Sampling

```python
import torch
import torch.nn.functional as F


def gumbel_softmax_sample(logits, tau=1.0, hard=False):
    """Sample from Gumbel-Softmax distribution.

    Args:
        logits: unnormalized log-probabilities [batch, n_classes]
        tau: temperature (lower = more discrete)
        hard: if True, returns one-hot but gradient flows through
    Returns:
        Sampled tensor [batch, n_classes]
    """
    u = torch.rand_like(logits)
    # Add Gumbel noise
    gumbels = -torch.log(-torch.log(u + 1e-20) + 1e-20)
    y_soft = F.softmax((logits + gumbels) / tau, dim=-1)

    if hard:
        # Straight-through: one-hot forward, soft backward
        index = y_soft.max(dim=-1, keepdim=True)[1]
        y_hard = torch.zeros_like(logits).scatter_(-1, index, 1.0)
        return y_hard - y_soft.detach() + y_soft
    return y_soft


# Demonstration
logits = torch.randn(3, 5, requires_grad=True)
# At high temperature, output is soft; at low temperature, nearly one-hot
y_soft = gumbel_softmax_sample(logits, tau=2.0, hard=False)
y_hard = gumbel_softmax_sample(logits, tau=0.1, hard=True)
loss = y_hard.sum()
loss.backward()
print(f"Soft (tau=2.0):\n{y_soft.detach()}")
print(f"Hard (tau=0.1):\n{y_hard.detach()}")
print(f"Gradients:\n{logits.grad}")
```

### Custom Gradient Table

| Operation | Forward | Backward (STE) |
|-----------|---------|----------------|
| Round | `round(x)` | `grad_output` (identity) |
| Sign | `sign(x)` | `grad_output` if `|x| < 1`, else `0` |
| Floor | `floor(x)` | `grad_output` if `x - floor(x) < 0.5`, else `0` |
| Argmax | `argmax(x)` | One-hot at max index (limited) |
| Quantize | `clamp(round(x/s)*s, ...)` | `grad_output` in valid range |

---

## C++ Extensions

When Python-level performance is insufficient, PyTorch provides seamless C++ integration through `torch.utils.cpp_extension`. This is critical for custom operators, custom CUDA kernels, or wrapping existing C/C++ libraries.

### JIT Extensions (load_inline)

JIT compilation compiles C++/CUDA code at runtime. This is the fastest way to get started:

```python
import torch
from torch.utils.cpp_extension import load_inline

# Define C++ source inline
cpp_source = """
#include <torch/extension.h>

torch::tensor sigmoid_custom(torch::tensor input) {
    return 1.0 / (1.0 + torch::exp(-input));
}
"""

# Compile and load at runtime
sigmoid_module = load_inline(
    name="sigmoid_custom",
    cpp_sources=cpp_source,
    functions=["sigmoid_custom"],
    verbose=True,
)

# Use the compiled function
x = torch.randn(4, 4, device="cpu")
result = sigmoid_module.sigmoid_custom(x)
print(f"Result shape: {result.shape}")
print(f"Matches PyTorch: {torch.allclose(result, torch.sigmoid(x))}")
```

### C++ Extension with Build File

For more complex extensions, create the source files and build explicitly:

```python
# setup.py
from setuptools import setup
from torch.utils.cpp_extension import BuildExtension, CppExtension

setup(
    name="my_extension",
    ext_modules=[
        CppExtension(
            name="my_extension",
            sources=["extension.cpp"],
            extra_compile_args=["-O3"],
        )
    ],
    cmdclass={"build_ext": BuildExtension},
)
```

```cpp
// extension.cpp
#include <torch/extension.h>
#include <vector>

// Custom L1 normalization
torch::tensor l1_normalize(torch::tensor input, int dim) {
    auto norms = input.abs().sum(dim, /*keepdim=*/true);
    return input / (norms + 1e-8);
}

// Custom huber loss (smooth L1) for verification
torch::tensor smooth_l1_forward(
    torch::tensor input,
    torch::tensor target,
    double beta
) {
    auto diff = input - target;
    auto abs_diff = diff.abs();
    auto cond = abs_diff < beta;
    auto loss = torch::where(
        cond,
        0.5 * diff.pow(2) / beta,
        abs_diff - 0.5 * beta
    );
    return loss.mean();
}

PYBIND11_MODULE(TORCH_EXTENSION_NAME, m) {
    m.def("l1_normalize", &l1_normalize, "L1 normalization");
    m.def("smooth_l1_forward", &smooth_l1_forward, "Smooth L1 loss");
}
```

```bash
# Build and install
python setup.py install

# Or build in-place for development
python setup.py develop
```

### C++ Extension Architecture

```
+-----------------------------------------------------------+
|                   C++ Extension Pipeline                   |
+-----------------------------------------------------------+
|                                                           |
|   Python Code                    C++/CUDA Code            |
|   ┌──────────────┐              ┌──────────────────┐     |
|   │ my_extension  │              │ extension.cpp     │     |
|   │ .function()   │◄──PYBIND11──│ / extension.cu    │     |
|   │               │              │                    │     |
|   └──────┬───────┘              └────────┬─────────┘     |
|          │                               │                |
|          ▼                               ▼                |
|   ┌──────────────┐              ┌──────────────────┐     |
|   │ torch.Tensor  │              │ libtorch          │     |
|   │ (Python API)  │◄─SHARED MEM─│ (C++ API)         │     |
|   │               │              │                    │     |
|   └──────────────┘              └──────────────────┘     |
|          │                               │                |
|          └───────────┬───────────────────┘                |
|                      ▼                                    |
|              ┌──────────────┐                             |
|              │  Autograd     │                             |
|              │  Integration  │                             |
|              └──────────────┘                             |
+-----------------------------------------------------------+
```

---

## torch.compile

`torch.compile` is PyTorch 2.0's flagship feature — a JIT compiler that captures the computation graph of your model and optimizes it using the TorchDynamo frontend and TorchInductor backend.

### Basic Usage

```python
import torch
import torch.nn as nn


class MyModel(nn.Module):
    def __init__(self, dim=512):
        super().__init__()
        self.layers = nn.Sequential(
            nn.Linear(dim, dim * 2),
            nn.GELU(),
            nn.Linear(dim * 2, dim),
            nn.GELU(),
            nn.Linear(dim, dim),
        )
        self.norm = nn.LayerNorm(dim)

    def forward(self, x):
        return self.norm(self.layers(x)) + x


# Compile the model
model = MyModel()
compiled_model = torch.compile(model)

x = torch.randn(32, 512)
# First call triggers compilation
output = compiled_model(x)
# Subsequent calls use the compiled graph
output = compiled_model(x)
```

### Compilation Modes

```python
import torch

model = torch.nn.TransformerEncoderLayer(
    d_model=512, nhead=8, batch_first=True
)
x = torch.randn(16, 128, 512)

# default — balanced optimization
compiled_default = torch.compile(model, mode="default")

# reduce-overhead — uses CUDA graphs to reduce kernel launch overhead
compiled_reduce = torch.compile(model, mode="reduce-overhead")

# max-autotune — longer compilation, best runtime performance
compiled_autotune = torch.compile(model, mode="max-autotune")
```

| Mode | Compilation Time | Runtime Speed | Memory Overhead | Best For |
|------|-----------------|---------------|-----------------|----------|
| `default` | Moderate | Good | Low | General use |
| `reduce-overhead` | Moderate | Very Good | Moderate (CUDA graphs) | Small models, high-frequency inference |
| `max-autotune` | Long | Best | Variable | Large models, latency-critical |

### Backend Options

```python
# Use different backends
compiled_inductor = torch.compile(model, backend="inductor")    # Default
compiled_eager = torch.compile(model, backend="eager")          # Debugging
compiled_cudagraphs = torch.compile(model, backend="cudagraphs") # CUDA graphs only

# Custom backend (your own graph-based optimizer)
def my_custom_backend(gm: torch.fx.GraphModule, example_inputs):
    print("Captured graph:")
    gm.graph.print_tabular()
    return gm  # Return unmodified for this example

compiled_custom = torch.compile(model, backend=my_custom_backend)
```

### Handling Graph Breaks

Graph breaks occur when the compiler encounters Python constructs it cannot capture. Understanding and minimizing them is key to performance:

```python
class ModelWithBreaks(nn.Module):
    def __init__(self):
        super().__init__()
        self.linear = nn.Linear(64, 64)

    def forward(self, x):
        x = self.linear(x)
        # Graph break: Python if-else
        if x.mean() > 0:
            x = torch.relu(x)
        else:
            x = torch.sigmoid(x)
        # Graph break: print statement
        print(f"Shape: {x.shape}")
        # Graph break: dynamic control flow
        for i in range(x.shape[0]):
            x[i] = x[i] * i
        return x


# Graph breaks split the model into multiple subgraphs,
# reducing the benefit of compilation
model = ModelWithBreaks()
compiled = torch.compile(model)

# To fix graph breaks, rewrite to be compiler-friendly:
class CompilerFriendlyModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.linear = nn.Linear(64, 64)

    def forward(self, x):
        x = self.linear(x)
        # Use torch.where instead of if-else
        is_positive = x.mean(dim=-1, keepdim=True) > 0
        relu_out = torch.relu(x)
        sig_out = torch.sigmoid(x)
        x = torch.where(is_positive, relu_out, sig_out)
        # Vectorize the loop
        indices = torch.arange(x.shape[0], device=x.device).float()
        x = x * indices.unsqueeze(-1)
        return x
```

### Full Compilation Example with Benchmarking

```python
import torch
import torch.nn as nn
import time


def benchmark(fn, x, n_warmup=5, n_iters=100):
    """Benchmark a function with warmup and timed iterations."""
    for _ in range(n_warmup):
        fn(x)
    torch.cuda.synchronize()

    start = time.perf_counter()
    for _ in range(n_iters):
        fn(x)
    torch.cuda.synchronize()
    elapsed = (time.perf_counter() - start) / n_iters
    return elapsed * 1000  # ms


class TransformerBlock(nn.Module):
    def __init__(self, dim=1024, nhead=16):
        super().__init__()
        self.attn = nn.MultiheadAttention(dim, nhead, batch_first=True)
        self.ffn = nn.Sequential(
            nn.Linear(dim, dim * 4),
            nn.GELU(),
            nn.Linear(dim * 4, dim),
        )
        self.norm1 = nn.LayerNorm(dim)
        self.norm2 = nn.LayerNorm(dim)

    def forward(self, x):
        h = self.norm1(x)
        h, _ = self.attn(h, h, h)
        x = x + h
        h = self.norm2(x)
        h = self.ffn(h)
        return x + h


if __name__ == "__main__":
    device = "cuda" if torch.cuda.is_available() else "cpu"
    model = TransformerBlock().to(device).eval()
    x = torch.randn(8, 256, 1024, device=device)

    # Eager
    eager_ms = benchmark(model, x)

    # Compiled
    compiled = torch.compile(model, mode="max-autotune")
    compiled_ms = benchmark(compiled, x)

    print(f"Eager:     {eager_ms:.2f} ms")
    print(f"Compiled:  {compiled_ms:.2f} ms")
    print(f"Speedup:   {eager_ms / compiled_ms:.2f}x")
```

---

## Custom C++ Operators

Registering custom operators makes them visible to PyTorch's dispatcher, `torch.compile`, and serialization:

```python
import torch
from torch.library import Library, impl

# Create a custom namespace
my_lib = Library("myns", "DEF")

# Define the operator schema
my_lib.define(
    "custom_addcmul(Tensor self, Tensor tensor1, Tensor tensor2, "
    "Scalar value=1) -> Tensor"
)


# Implement in Python (for eager mode)
@impl(my_lib, "custom_addcmul", "CompositeExplicitAutograd")
def custom_addcmul_impl(self, tensor1, tensor2, value=1):
    return self + value * tensor1 * tensor2


# Use the custom operator
a = torch.randn(4, 4)
b = torch.randn(4, 4)
c = torch.randn(4, 4)
result = torch.ops.myns.custom_addcmul(a, b, c, value=2.0)
expected = a + 2.0 * b * c
print(f"Custom op matches: {torch.allclose(result, expected)}")
```

---

## CUDA Kernel Basics

For the ultimate performance control, you can write custom CUDA kernels:

```python
import torch
from torch.utils.cpp_extension import load_inline

cuda_source = """
#include <torch/extension.h>
#include <cuda_runtime.h>

__global__ void add_bias_kernel(
    float* __restrict__ output,
    const float* __restrict__ input,
    const float* __restrict__ bias,
    int hidden_size,
    int total_elements
) {
    int idx = blockIdx.x * blockDim.x + threadIdx.x;
    if (idx < total_elements) {
        int bias_idx = idx % hidden_size;
        output[idx] = input[idx] + bias[bias_idx];
    }
}

torch::tensor add_bias_cuda(torch::tensor input, torch::tensor bias) {
    TORCH_CHECK(input.is_cuda(), "Input must be on CUDA");
    TORCH_CHECK(bias.is_cuda(), "Bias must be on CUDA");
    TORCH_CHECK(input.is_contiguous(), "Input must be contiguous");

    auto output = torch::empty_like(input);
    int hidden_size = bias.numel();
    int total_elements = input.numel();

    int threads = 256;
    int blocks = (total_elements + threads - 1) / threads;

    add_bias_kernel<<<blocks, threads>>>(
        output.data_ptr<float>(),
        input.data_ptr<float>(),
        bias.data_ptr<float>(),
        hidden_size,
        total_elements
    );

    return output;
}
"""

# Compile the CUDA kernel
custom_ops = load_inline(
    name="custom_cuda_ops",
    cpp_sources="torch::tensor add_bias_cuda(torch::tensor input, torch::tensor bias);",
    cuda_sources=cuda_source,
    functions=["add_bias_cuda"],
    verbose=True,
)

# Benchmark against torch.add
input_tensor = torch.randn(1024, 1024, device="cuda")
bias = torch.randn(1024, device="cuda")

# Custom kernel
custom_output = custom_ops.add_bias_cuda(input_tensor, bias)

# Reference (PyTorch)
ref_output = input_tensor + bias

print(f"Custom matches: {torch.allclose(custom_output, ref_output, atol=1e-5)}")
```

### CUDA Kernel Architecture

```
+-----------------------------------------------------------+
|                  CUDA Kernel Execution                     |
+-----------------------------------------------------------+
|                                                           |
|  Host (CPU)                   Device (GPU)                |
|  ┌──────────────────┐       ┌──────────────────────┐     |
|  │  Kernel Launch     │       │  Grid of Thread       │     |
|  │  <<<blocks,threads>>>      │  Blocks               │     |
|  │                     │       │                       │     |
|  │  gridDim = 4        │       │  Block 0  Block 1    │     |
|  │  blockDim = 256     │       │  ┌─────┐ ┌─────┐    │     |
|  │                     │       │  │T0-T255│ │T0-T255│  │     |
|  │                     │       │  └─────┘ └─────┘    │     |
|  │                     │       │  Block 2  Block 3    │     |
|  │                     │       │  ┌─────┐ ┌─────┐    │     |
|  │                     │       │  │T0-T255│ │T0-T255│  │     |
|  │                     │       │  └─────┘ └─────┘    │     |
|  │                     │       │                       │     |
|  │  Shared Memory ◄────┼───────┤  Per-block fast SRAM  │     |
|  │                     │       │  (48KB per SM)        │     |
|  │  Global Memory ◄────┼───────┤  HBM (up to 80GB)    │     |
|  └──────────────────┘       └──────────────────────┘     |
+-----------------------------------------------------------+
```

---

## torch.cuda.amp In Depth

Automatic Mixed Precision (AMP) uses FP16/BF16 where safe and FP32 where needed, yielding both speed and memory savings.

### Full AMP Training Loop

```python
import torch
import torch.nn as nn
from torch.cuda.amp import autocast, GradScaler


def train_with_amp(model, dataloader, optimizer, num_epochs=10):
    """Complete AMP training loop with best practices."""
    scaler = GradScaler()
    criterion = nn.CrossEntropyLoss()

    for epoch in range(num_epochs):
        model.train()
        total_loss = 0

        for batch_idx, (data, target) in enumerate(dataloader):
            data, target = data.cuda(), target.cuda()
            optimizer.zero_grad()

            # autocast: runs eligible ops in FP16, others in FP32
            with autocast():
                output = model(data)
                loss = criterion(output, target)

            # Scale loss to prevent FP16 underflow
            scaler.scale(loss).backward()

            # Unscale gradients before clipping
            scaler.unscale_(optimizer)
            nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)

            # Step optimizer and update scaler
            scaler.step(optimizer)
            scaler.update()

            total_loss += loss.item()

        avg_loss = total_loss / len(dataloader)
        print(f"Epoch {epoch+1}/{num_epochs}, Loss: {avg_loss:.4f}")
```

### Custom Forward/Backward with AMP

```python
import torch
from torch.cuda.amp import custom_fwd, custom_bwd


class CustomLayerNorm(nn.Module):
    def __init__(self, normalized_shape, eps=1e-5):
        super().__init__()
        self.weight = nn.Parameter(torch.ones(normalized_shape))
        self.bias = nn.Parameter(torch.zeros(normalized_shape))
        self.eps = eps

    @custom_fwd
    def forward(self, x):
        # Compute in FP32 for numerical stability
        x_fp32 = x.float()
        mean = x_fp32.mean(-1, keepdim=True)
        var = x_fp32.var(-1, keepdim=True, unbiased=False)
        x_norm = (x_fp32 - mean) / torch.sqrt(var + self.eps)
        out = self.weight.float() * x_norm + self.bias.float()
        return out.to(x.dtype)

    @custom_bwd
    def backward(self, grad_output):
        # Backward pass maintains AMP compatibility
        return grad_output


# Verify mixed precision works
model = CustomLayerNorm(256).cuda()
x = torch.randn(32, 256, device="cuda", dtype=torch.float16)
output = model(x)
print(f"Input dtype: {x.dtype}, Output dtype: {output.dtype}")
loss = output.sum()
loss.backward()
print(f"Weight grad dtype: {model.weight.grad.dtype}")
```

### Loss Scaling Strategies

| Strategy | Description | When to Use |
|----------|-------------|-------------|
| `dynamic` | Starts with large scale, adjusts based on gradient overflow | Default, general purpose |
| `static` | Fixed scale factor (e.g., 128.0) | When dynamic scaling causes instability |
| `GradScaler` | PyTorch built-in with growth/decay factor | Most training scenarios |

```python
# Dynamic loss scaling (default)
scaler = GradScaler(init_scale=65536.0, growth_factor=2.0, backoff_factor=0.5)

# Static loss scaling
scaler = GradScaler(init_scale=128.0)
# Disable automatic growth — use fixed scale
for group in scaler._per_optimizer_states.values():
    pass  # Manual management not recommended; use dynamic scaling
```

### Numerical Considerations

```python
import torch


def check_fp16_range():
    """Demonstrate FP16 representable range."""
    # FP16 max value
    fp16_max = torch.finfo(torch.float16).max
    # FP16 smallest positive normal
    fp16_min = torch.finfo(torch.float16).tiny
    # FP16 smallest subnormal
    fp16_sub = torch.finfo(torch.float16).smallest_normal

    print(f"FP16 max:    {fp16_max}")          # 65504.0
    print(f"FP16 tiny:   {fp16_min}")          # 6.103515625e-05
    print(f"FP16 eps:    {torch.finfo(torch.float16).eps}")  # 0.0009765625

    # Gradient underflow example
    small_grad = torch.tensor(1e-10, dtype=torch.float16)
    print(f"1e-10 in FP16: {small_grad}")  # Will underflow to 0

    # Loss scaling prevents this
    scale = 1024.0
    scaled = small_grad.float() * scale
    print(f"Scaled gradient: {scaled}")  # 1.024e-07 (preserved in FP32)


check_fp16_range()
```

---

## Memory Management

Efficient GPU memory management is critical for training large models. Understanding PyTorch's caching allocator and memory profiling tools helps diagnose OOM errors and optimize batch sizes.

### GPU Memory Allocation Overview

```
+-----------------------------------------------------------+
|                GPU Memory Layout                           |
+-----------------------------------------------------------+
|                                                           |
|  0 GB                                                    |
|  ├──────────────────────────────────────────┐             |
|  │         CUDA Runtime Reserved             │ ◄── Fixed  |
|  ├──────────────────────────────────────────┤             |
|  │                                          │             |
|  │        PyTorch Caching Allocator         │ ◄── Dynamic |
|  │                                          │             |
|  │  ┌──────────┐ ┌────────┐ ┌──────────┐  │             |
|  │  │  Model    │ │Gradient│ │ Optimizer │  │             |
|  │  │  Weights  │ │ Tensors│ │ States    │  │             |
│  │  └──────────┘ └────────┘ └──────────┘  │             |
|  │                                          │             |
|  │  ┌──────────────────────────────────┐   │             |
|  │  │       Activation Memory          │   │             |
|  │  │  (Forward + Backward Buffers)    │   │             |
|  │  └──────────────────────────────────┘   │             |
|  │                                          │             |
|  │  ┌──────────┐                           │             |
|  │  │ Scratch   │ ◄── Temporary buffers     │             |
|  │  └──────────┘                           │             |
|  ├──────────────────────────────────────────┤             |
|  │         Free / Available                  │             |
|  ├──────────────────────────────────────────┤             |
|  │         CUDA Driver Overhead             │             |
|  └──────────────────────────────────────────┘             |
|  GPU Total (e.g., 24 GB for RTX 4090)                    |
+-----------------------------------------------------------+
```

### Memory Profiling

```python
import torch


def memory_report():
    """Comprehensive GPU memory report."""
    if not torch.cuda.is_available():
        print("CUDA not available")
        return

    # Reset peak memory stats
    torch.cuda.reset_peak_memory_stats()
    torch.cuda.empty_cache()

    print("=" * 60)
    print("GPU Memory Report")
    print("=" * 60)

    # Current allocation
    allocated = torch.cuda.memory_allocated() / 1e9
    reserved = torch.cuda.memory_reserved() / 1e9
    max_allocated = torch.cuda.max_memory_allocated() / 1e9
    max_reserved = torch.cuda.max_memory_reserved() / 1e9

    print(f"Allocated:        {allocated:.3f} GB")
    print(f"Reserved:         {reserved:.3f} GB")
    print(f"Peak Allocated:   {max_allocated:.3f} GB")
    print(f"Peak Reserved:    {max_reserved:.3f} GB")

    # Detailed stats
    stats = torch.cuda.memory_stats()
    print(f"\nTotal num allocs: {stats['num_alloc_retries']}")
    print(f"Num OOM errors:   {stats.get('oom_count', 0)}")
    print(f"Active allocs:    {stats['active_alloc_all']}")

    return stats


# Example: track memory during forward pass
model = torch.nn.TransformerEncoderLayer(
    d_model=1024, nhead=16, batch_first=True
).cuda()

memory_report()

x = torch.randn(32, 256, 1024, device="cuda")
print("\nAfter creating input tensor:")
memory_report()

output = model(x)
print("\nAfter forward pass:")
memory_report()
```

### Caching Allocator Tuning

```python
import torch


def configure_memory():
    """Configure PyTorch memory allocation."""
    # Set maximum GPU memory fraction (useful for multi-GPU)
    # Must be called before any CUDA operations
    torch.cuda.set_per_process_memory_fraction(0.8)  # Use 80% of GPU memory

    # Enable memory fraction checking
    # Useful for detecting memory leaks in tests

    # Empty cache (return unused memory to CUDA)
    torch.cuda.empty_cache()

    # Memory snapshot for profiling
    # Uncomment to generate memory snapshot (saves to file)
    # torch.cuda.memory._record_memory_history()
    # ... run your code ...
    # torch.cuda.memory._dump_snapshot("memory_snapshot.pickle")
    # torch.cuda.memory._record_memory_history(enabled=None)


class MemoryEfficientBlock(torch.nn.Module):
    """Block that manages activation memory."""

    def __init__(self, dim):
        super().__init__()
        self.linear = torch.nn.Linear(dim, dim)
        self.norm = torch.nn.LayerNorm(dim)

    def forward(self, x):
        # In-place operations reduce memory
        residual = x
        x = self.norm(x)
        x = self.linear(x)
        x = torch.nn.functional.gelu(x)
        x += residual  # In-place addition saves memory
        return x


# Measure memory savings
model = MemoryEfficientBlock(2048).cuda()
x = torch.randn(128, 512, 2048, device="cuda")

torch.cuda.reset_peak_memory_stats()
output = model(x)
peak_after_forward = torch.cuda.max_memory_allocated() / 1e9
print(f"Peak memory after forward: {peak_after_forward:.3f} GB")
```

### Memory-Efficient Techniques Summary

| Technique | Memory Saving | Speed Trade-off | Implementation |
|-----------|--------------|-----------------|----------------|
| Gradient checkpointing | ~60-70% activation memory | 20-30% slower | `torch.utils.checkpoint` |
| Mixed precision (AMP) | ~50% | Faster | `torch.cuda.amp` |
| In-place operations | ~10-30% | Minimal | `.add_()`, `.mul_()`, etc. |
| `del` + `gc.collect()` | Variable | Minimal | Manual |
| `torch.cuda.empty_cache()` | Variable | Minimal | Return unused memory |
| Model parallelism | Linear with GPUs | Communication overhead | `DistributedDataParallel` |

---

## torch.utils.checkpoint

Gradient checkpointing trades compute for memory by not storing intermediate activations during the forward pass, instead recomputing them during backward.

### Basic Checkpointing

```python
import torch
import torch.nn as nn
from torch.utils.checkpoint import checkpoint, checkpoint_sequential


class HeavyBlock(nn.Module):
    def __init__(self, dim):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(dim, dim * 4),
            nn.GELU(),
            nn.Linear(dim * 4, dim),
        )
        self.norm = nn.LayerNorm(dim)

    def forward(self, x):
        return self.norm(self.net(x)) + x


class CheckpointedModel(nn.Module):
    def __init__(self, dim=1024, n_layers=24, use_checkpointing=True):
        super().__init__()
        self.blocks = nn.ModuleList(
            [HeavyBlock(dim) for _ in range(n_layers)]
        )
        self.use_checkpointing = use_checkpointing

    def forward(self, x):
        for block in self.blocks:
            if self.use_checkpointing and self.training:
                # Recompute forward during backward, saving memory
                x = checkpoint(
                    block, x,
                    use_reentrant=False  # Required in PyTorch 2.x
                )
            else:
                x = block(x)
        return x


# Compare memory usage
dim = 1024
n_layers = 24
batch_size = 32

# Without checkpointing
model_no_ckpt = CheckpointedModel(dim, n_layers, use_checkpointing=False).cuda()
x = torch.randn(batch_size, 512, dim, device="cuda")
torch.cuda.reset_peak_memory_stats()
output = model_no_ckpt(x)
loss = output.sum()
loss.backward()
peak_no_ckpt = torch.cuda.max_memory_allocated() / 1e9
del model_no_ckpt, output, loss
torch.cuda.empty_cache()

# With checkpointing
model_ckpt = CheckpointedModel(dim, n_layers, use_checkpointing=True).cuda()
torch.cuda.reset_peak_memory_stats()
output = model_ckpt(x)
loss = output.sum()
loss.backward()
peak_ckpt = torch.cuda.max_memory_allocated() / 1e9

print(f"Without checkpointing: {peak_no_ckpt:.3f} GB")
print(f"With checkpointing:    {peak_ckpt:.3f} GB")
print(f"Memory saved:          {peak_no_ckpt - peak_ckpt:.3f} GB "
      f"({(1 - peak_ckpt/peak_no_ckpt)*100:.1f}%)")
```

### Selective Checkpointing with Segment Sizes

```python
from torch.utils.checkpoint import checkpoint_sequential


class DeepSequential(nn.Module):
    def __init__(self, dim=512, n_layers=12):
        super().__init__()
        layers = []
        for _ in range(n_layers):
            layers.extend([
                nn.Linear(dim, dim),
                nn.ReLU(),
                nn.Linear(dim, dim),
                nn.ReLU(),
            ])
        self.net = nn.Sequential(*layers)

    def forward(self, x):
        return self.net(x)


model = DeepSequential(dim=512, n_layers=12)
x = torch.randn(16, 256, 512)

# Checkpoint sequential with segment_size
# segments=4 means the model is divided into 4 checkpointed segments
output = checkpoint_sequential(
    model.net, segments=4, input=x, use_reentrant=False
)
loss = output.sum()
loss.backward()
print(f"Checkpoint sequential output shape: {output.shape}")
```

### Checkpointing Strategy Guide

```
+-----------------------------------------------------------+
|         Checkpointing Decision Tree                        |
+-----------------------------------------------------------+
|                                                           |
|  Is GPU memory the bottleneck?                            |
│  ├── YES ─► How much memory to save?                      │
│  │          ├── <30% ─► Use AMP (mixed precision)         │
│  │          ├── 30-70% ─► Use gradient checkpointing      │
│  │          └── >70% ─► Checkpoint + AMP + model parallel │
│  └── NO ──► Skip checkpointing (save compute)            │
|                                                           |
|  How many segments for checkpoint_sequential?             |
│  ├── Rule of thumb: n_layers / 4 to n_layers / 8         │
│  ├── More segments = less memory, more recomputation      │
│  └── Benchmark to find the sweet spot                     |
+-----------------------------------------------------------+
```

---

## torch.fx

`torch.fx` is PyTorch's toolkit for transforming computation graphs. It enables symbolic tracing, graph manipulation, and automatic transformation of `nn.Module` objects.

### Symbolic Tracing

```python
import torch
import torch.nn as nn
import torch.fx


class SimpleNet(nn.Module):
    def __init__(self):
        super().__init__()
        self.conv1 = nn.Conv2d(3, 16, 3, padding=1)
        self.conv2 = nn.Conv2d(16, 32, 3, padding=1)
        self.pool = nn.AdaptiveAvgPool2d(1)
        self.fc = nn.Linear(32, 10)

    def forward(self, x):
        x = torch.relu(self.conv1(x))
        x = torch.relu(self.conv2(x))
        x = self.pool(x).flatten(1)
        return self.fc(x)


# Trace the model
model = SimpleNet()
tracer = torch.fx.Tracer()
graph = tracer.trace(model)

# Print the symbolic graph
print("Graph:")
graph.print_tabular()

# Get the GraphModule (an nn.Module that executes the traced graph)
graph_module = torch.fx.GraphModule(model, graph)
print(graph_module.code)
```

### Graph Manipulation

```python
import torch
import torch.nn as nn
import torch.fx


class TransformerLike(nn.Module):
    def __init__(self, dim=64):
        super().__init__()
        self.qkv = nn.Linear(dim, dim * 3)
        self.out = nn.Linear(dim, dim)
        self.norm = nn.LayerNorm(dim)

    def forward(self, x):
        qkv = self.qkv(self.norm(x))
        q, k, v = qkv.chunk(3, dim=-1)
        attn = torch.softmax(q @ k.transpose(-2, -1) / (q.shape[-1] ** 0.5), dim=-1)
        out = attn @ v
        return self.out(out) + x


# Trace
model = TransformerLike()
gm = torch.fx.GraphModule(model, torch.fx.Tracer().trace(model))

# Print graph nodes
print("=== Graph Nodes ===")
for node in gm.graph.nodes:
    print(f"  {node.op:12s} | target={node.target} | name={node.name}")

# Visualize the graph as text
print("\n=== Generated Code ===")
print(gm.code)
```

### Node Replacement and Transformation

```python
import torch
import torch.nn as nn
import torch.fx
from torch.fx import symbolic_trace


def replace_relu_with_relu6(gm: torch.fx.GraphModule) -> torch.fx.GraphModule:
    """Replace all ReLU activations with ReLU6."""
    for node in gm.graph.nodes:
        if node.op == "call_module" and isinstance(
            gm.get_submodule(node.target), nn.ReLU
        ):
            # Get the parent module
            *parts, name = node.target.split(".")
            parent = gm
            for part in parts:
                parent = getattr(parent, part)

            # Replace the module
            parent relu6 = nn.ReLU6(inplace=True) if hasattr(
                parent, name
            ) else nn.ReLU6()

    # Cleaner approach: replace via graph manipulation
    for node in gm.graph.nodes:
        if node.op == "call_function" and node.target is torch.relu:
            node.target = torch.nn.functional.relu6

    gm.recompile()
    return gm


class TestModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.linear1 = nn.Linear(64, 64)
        self.linear2 = nn.Linear(64, 10)

    def forward(self, x):
        x = torch.relu(self.linear1(x))
        return self.linear2(x)


# Trace and modify
model = TestModel()
gm = torch.fx.GraphModule(model, torch.fx.Tracer().trace(model))

# Replace relu with relu6 in the graph
for node in gm.graph.nodes:
    if node.op == "call_function" and node.target is torch.relu:
        node.target = torch.relu6
    elif node.op == "call_module" and isinstance(
        gm.get_submodule(node.target), nn.ReLU
    ):
        parent_name, attr_name = _get_parent_attr(gm, node.target)
        setattr(getattr(gm, parent_name), attr_name, nn.ReLU6())

gm.recompile()

# Verify
x = torch.randn(4, 64)
print(f"Original output range: {model(x).min().item():.4f} to {model(x).max().item():.4f}")
print(f"Modified output range: {gm(x).min().item():.4f} to {gm(x).max().item():.4f}")
```

### torch.fx Transformation Summary

| Operation | API | Description |
|-----------|-----|-------------|
| Trace model | `torch.fx.Tracer().trace(model)` | Produce symbolic graph |
| Create module | `GraphModule(model, graph)` | Wrap graph as runnable module |
| Print graph | `graph.print_tabular()` | Tabular view of all nodes |
| Insert node | `graph.inserting_after(node)` | Context manager for insertion |
| Erase node | `graph.erase_node(node)` | Remove a node |
| Replace target | `node.target = new_target` | Redirect a call |
| Recompile | `gm.recompile()` | Regenerate code after changes |

---

## TorchDynamo

TorchDynamo is the frontend component of `torch.compile`. It hooks into Python's bytecode evaluation loop to capture the computation graph without requiring any model changes.

### How TorchDynamo Works

```
+-----------------------------------------------------------+
|              TorchDynamo Architecture                       |
+-----------------------------------------------------------+
|                                                           |
|  Python Bytecode                                          |
│  ┌──────────────────────────────────┐                     │
│  │  model.forward(x)                 │                     │
│  │  bytecode instructions            │                     │
│  └──────────────┬───────────────────┘                     │
│                 │                                          │
│                 ▼                                          │
│  ┌──────────────────────────────────┐                     │
│  │  TorchDynamo Frame Evaluator      │                     │
│  │  - Evaluates Python bytecode      │                     │
│  │  - Records torch.* operations     │                     │
│  │  - Detects graph breaks           │                     │
│  └──────────────┬───────────────────┘                     │
│                 │                                          │
│                 ▼                                          │
│  ┌──────────────────────────────────┐                     │
│  │  Guards (runtime checks)          │                     │
│  │  - Type guards                    │                     │
│  │  - Shape guards                   │                     │
│  │  - Value guards                   │                     │
│  └──────────────┬───────────────────┘                     │
│                 │                                          │
│                 ▼                                          │
│  ┌──────────────────────────────────┐                     │
│  │  Captured FX Graph               │                     │
│  │  (one per graph break segment)   │                     │
│  └──────────────┬───────────────────┘                     │
│                 │                                          │
│                 ▼                                          │
│  ┌──────────────────────────────────┐                     │
│  │  Backend (TorchInductor)          │                     │
│  │  - Generates Triton kernels       │                     │
│  │  - Optimizes graph               │                     │
│  │  - Produces optimized code        │                     │
│  └──────────────────────────────────┘                     │
+-----------------------------------------------------------+
```

### Guards and Guards Debugging

```python
import torch
import torch.nn as nn
import torch._dynamo as dynamo


class DynamicModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.linear = nn.Linear(64, 64)

    def forward(self, x):
        return self.linear(x)


model = DynamicModel()

# Enable dynamo logging to see guards
dynamo.config.verbose = True


@torch.compile(backend="inductor", fullgraph=True)
def fn(x):
    return model(x)


# Run to trigger compilation
x = torch.randn(8, 64)
out = fn(x)

# Access compilation metrics
from torch._dynamo import reset
print("Dynamo compilation complete.")

# Different shape triggers recompilation
x2 = torch.randn(16, 64)
out2 = fn(x2)

# Print available counters
from torch._inductor import metrics
print(f"Graph break count: {metrics.graph_break_count}")
```

### TorchDynamo with torch.export

```python
import torch
import torch.nn as nn


class ExportableModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.layers = nn.Sequential(
            nn.Linear(128, 256),
            nn.ReLU(),
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.Linear(128, 10),
        )

    def forward(self, x):
        return self.layers(x)


model = ExportableModel()

# Export to a stable intermediate representation
exported = torch.export.export(
    model, (torch.randn(1, 128),)
)

# Print the exported graph
print("Exported program:")
print(exported)

# Run the exported program
result = exported.module()(torch.randn(4, 128))
print(f"Output shape: {result.shape}")
```

---

## Composable Transforms

The `torchvision.transforms.v2` API (and `torchvision.transforms.v2` in recent versions) provides a composable, type-aware transform system that works correctly with bounding boxes, segmentation masks, and keypoints.

### v2 Transforms API

```python
import torch
from torchvision import transforms


# Standard v1 transforms (still works but less flexible)
v1_transform = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std=[0.229, 0.224, 0.225]),
])

# v2 transforms (recommended for new code)
try:
    from torchvision.transforms import v2

    v2_transform = v2.Compose([
        v2.Resize(256),
        v2.CenterCrop(224),
        v2.ToDtype(torch.float32, scale=True),  # Replaces ToTensor
        v2.Normalize(mean=[0.485, 0.456, 0.406],
                     std=[0.229, 0.224, 0.225]),
    ])
except ImportError:
    print("torchvision.transforms.v2 not available, using v1 transforms")
    v2_transform = v1_transform

# Apply transform
from PIL import Image
import numpy as np

dummy_image = Image.fromarray(
    np.random.randint(0, 255, (256, 256, 3), dtype=np.uint8)
)
result = v2_transform(dummy_image)
print(f"Transformed: {result.shape}, dtype={result.dtype}")
```

### Custom Transform with Type Dispatch

```python
import torch


class RandomErasing2D(torch.nn.Module):
    """Custom random erasing transform that works on both
    images and segmentation masks."""

    def __init__(self, probability=0.5, scale=(0.02, 0.2)):
        super().__init__()
        self.probability = probability
        self.scale = scale

    def forward(self, image, mask=None):
        if torch.rand(1).item() > self.probability:
            return image, mask

        # Random rectangle
        h, w = image.shape[-2:]
        area = h * w
        erase_area = torch.empty(1).uniform_(
            self.scale[0] * area, self.scale[1] * area
        ).item()
        aspect = torch.empty(1).uniform_(0.3, 3.3).item()
        eh = int(round(np.sqrt(erase_area * aspect)))
        ew = int(round(np.sqrt(erase_area / aspect)))

        if eh < h and ew < w:
            top = torch.randint(0, h - eh, (1,)).item()
            left = torch.randint(0, w - ew, (1,)).item()
            image = image.clone()
            image[:, top:top + eh, left:left + ew] = 0.0

            if mask is not None:
                mask = mask.clone()
                mask[top:top + eh, left:left + ew] = 0

        return image, mask


class ComposeWithMask(torch.nn.Module):
    """Apply the same random spatial transforms to image and mask."""

    def __init__(self, transforms_list):
        super().__init__()
        self.transforms = torch.nn.ModuleList(transforms_list)

    def forward(self, image, mask):
        for t in self.transforms:
            if hasattr(t, 'get_params'):
                params = t.get_params(image)
                image = t(image, **params)
                mask = t(mask, **params) if mask is not None else None
            else:
                image, mask = t(image, mask)
        return image, mask


# Usage
import numpy as np
image = torch.randn(3, 256, 256)
mask = torch.randint(0, 10, (256, 256))

transform = ComposeWithMask([
    RandomErasing2D(probability=1.0),
])
out_img, out_mask = transform(image, mask)
print(f"Image: {out_img.shape}, Mask: {out_mask.shape}")
```

### Transform Chaining Patterns

| Pattern | Implementation | Use Case |
|---------|---------------|----------|
| Sequential | `transforms.Compose([...])` | Standard pipeline |
| Conditional | `if condition: t(x)` | Data-dependent augmentation |
| Random choice | `transforms.RandomChoice([...])` | Pick one from set |
| Random apply | `transforms.RandomApply([...], p=0.5)` | Probabilistic chain |
| Random order | `transforms.RandomOrder([...])` | Shuffle transform order |

---

## Model Surgery

Model surgery involves modifying pre-trained models at the architecture level — inserting layers, replacing modules, freezing parameters, and using hooks for custom behavior.

### Inserting and Removing Layers

```python
import torch
import torch.nn as nn


# Start with a pre-trained backbone
class Backbone(nn.Module):
    def __init__(self):
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(3, 64, 3, padding=1),
            nn.ReLU(),
            nn.Conv2d(64, 128, 3, padding=1),
            nn.ReLU(),
            nn.AdaptiveAvgPool2d(1),
        )
        self.classifier = nn.Linear(128, 10)

    def forward(self, x):
        x = self.features(x)
        x = x.flatten(1)
        return self.classifier(x)


model = Backbone()

# ---- Insert BatchNorm after each Conv ----
def insert_batchnorm(model):
    """Insert BatchNorm after each Conv layer in sequential blocks."""
    for name, module in model.named_children():
        if isinstance(module, nn.Sequential):
            new_layers = []
            for i, layer in enumerate(module):
                new_layers.append(layer)
                if isinstance(layer, nn.Conv2d):
                    bn = nn.BatchNorm2d(layer.out_channels)
                    nn.init.constant_(bn.weight, 1)
                    nn.init.constant_(bn.bias, 0)
                    new_layers.append(bn)
            setattr(model, name, nn.Sequential(*new_layers))
        else:
            insert_batchnorm(module)
    return model


model = insert_batchnorm(model)
print("After inserting BatchNorm:")
for name, param in model.named_parameters():
    print(f"  {name}: {param.shape}")

# ---- Freeze all layers except classifier ----
def freeze_except(model, except_name="classifier"):
    """Freeze all parameters except those matching a name prefix."""
    for name, param in model.named_parameters():
        if except_name not in name:
            param.requires_grad = False
    trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
    total = sum(p.numel() for p in model.parameters())
    print(f"Trainable: {trainable:,} / {total:,} "
          f"({100*trainable/total:.1f}%)")


freeze_except(model, except_name="classifier")
```

### Hook-Based Modifications

```python
import torch
import torch.nn as nn


class FeatureExtractor(nn.Module):
    """Use hooks to extract intermediate features."""

    def __init__(self, model):
        super().__init__()
        self.model = model
        self.features = {}

        # Register forward hooks on each layer
        self.hooks = []
        for name, module in model.named_modules():
            if isinstance(module, (nn.Conv2d, nn.Linear)):
                hook = module.register_forward_hook(
                    self._make_hook(name)
                )
                self.hooks.append(hook)

    def _make_hook(self, name):
        def hook_fn(module, input, output):
            self.features[name] = output.detach()
        return hook_fn

    def forward(self, x):
        self.features.clear()
        return self.model(x)

    def remove_hooks(self):
        for hook in self.hooks:
            hook.remove()
        self.hooks.clear()


# Usage
model = nn.Sequential(
    nn.Conv2d(3, 16, 3, padding=1),
    nn.ReLU(),
    nn.Conv2d(16, 32, 3, padding=1),
    nn.ReLU(),
)

extractor = FeatureExtractor(model)
x = torch.randn(1, 3, 32, 32)
output = extractor(x)

print("Extracted features:")
for name, feat in extractor.features.items():
    print(f"  {name}: {feat.shape}")

extractor.remove_hooks()
```

### Module Replacement Patterns

```python
import torch.nn as nn


# Replace all Conv2d with DepthwiseSeparableConv
class DepthwiseSeparableConv(nn.Module):
    def __init__(self, in_ch, out_ch, kernel_size=3, padding=1):
        super().__init__()
        self.depthwise = nn.Conv2d(
            in_ch, in_ch, kernel_size, padding=padding, groups=in_ch
        )
        self.pointwise = nn.Conv2d(in_ch, out_ch, 1)

    def forward(self, x):
        return self.pointwise(self.depthwise(x))


def replace_conv_depthwise(model):
    """Replace all Conv2d with DepthwiseSeparableConv."""
    for name, module in model.named_children():
        if isinstance(module, nn.Conv2d):
            new_conv = DepthwiseSeparableConv(
                module.in_channels,
                module.out_channels,
                module.kernel_size,
                module.padding,
            )
            # Copy weights where possible
            with torch.no_grad():
                new_conv.pointwise.weight.copy_(
                    module.weight.sum(dim=1, keepdim=True)
                )
            parent, attr = _get_parent_attr(model, name)
            setattr(parent, attr, new_conv)
        else:
            replace_conv_depthwise(module)
    return model


def _get_parent_attr(model, target_name):
    """Get the parent module and attribute name for a target."""
    parts = target_name.split(".")
    parent = model
    for part in parts[:-1]:
        parent = getattr(parent, part)
    return parent, parts[-1]


# Example
model = nn.Sequential(
    nn.Conv2d(3, 64, 3, padding=1),
    nn.ReLU(),
    nn.Conv2d(64, 128, 3, padding=1),
    nn.ReLU(),
)
model = replace_conv_depthwise(model)
print("Model after replacement:")
for name, module in model.named_modules():
    if module:
        print(f"  {name or 'root'}: {module.__class__.__name__}")
```

---

## Custom Datasets for Complex Data

Real-world data rarely fits the simple image-folder pattern. This section covers advanced dataset patterns for nested data, streaming, and multi-modal inputs.

### Nested Data Dataset

```python
import torch
from torch.utils.data import Dataset, DataLoader
import json
from pathlib import Path
from typing import Any


class NestedJSONDataset(Dataset):
    """Dataset for nested JSON data with variable-length fields.

    Example JSON:
    {
        "id": "sample_001",
        "text": "Hello world",
        "metadata": {"source": "web", "score": 0.95},
        "tokens": [101, 2023, 2003, 102],
        "labels": [0, 1, 0]
    }
    """

    def __init__(self, data_dir, tokenizer=None, max_length=512):
        self.data_dir = Path(data_dir)
        self.tokenizer = tokenizer
        self.max_length = max_length

        self.file_paths = sorted(self.data_dir.glob("*.json"))
        if not self.file_paths:
            raise FileNotFoundError(
                f"No JSON files found in {data_dir}"
            )

    def __len__(self):
        return len(self.file_paths)

    def __getitem__(self, idx) -> dict[str, Any]:
        with open(self.file_paths[idx]) as f:
            raw = json.load(f)

        # Tokenize if tokenizer available
        if self.tokenizer is not None:
            encoding = self.tokenizer(
                raw["text"],
                max_length=self.max_length,
                padding="max_length",
                truncation=True,
                return_tensors="pt",
            )
            input_ids = encoding["input_ids"].squeeze(0)
            attention_mask = encoding["attention_mask"].squeeze(0)
        else:
            # Simple character-level encoding
            chars = list(raw["text"][:self.max_length])
            input_ids = torch.tensor(
                [ord(c) % 256 for c in chars], dtype=torch.long
            )
            attention_mask = torch.ones_like(input_ids)

        return {
            "input_ids": input_ids,
            "attention_mask": attention_mask,
            "labels": torch.tensor(raw["labels"], dtype=torch.long),
            "score": torch.tensor(
                raw["metadata"]["score"], dtype=torch.float
            ),
            "id": raw["id"],
        }


# Collate function for variable-length sequences
def nested_collate(batch):
    """Custom collate for batches with mixed-length tensors."""
    # Stack variable-length tensors with padding
    max_len = max(item["input_ids"].shape[0] for item in batch)

    padded = {
        "input_ids": torch.zeros(len(batch), max_len, dtype=torch.long),
        "attention_mask": torch.zeros(len(batch), max_len, dtype=torch.long),
        "labels": torch.zeros(len(batch), dtype=torch.long),
        "score": torch.stack([item["score"] for item in batch]),
        "id": [item["id"] for item in batch],
    }

    for i, item in enumerate(batch):
        length = item["input_ids"].shape[0]
        padded["input_ids"][i, :length] = item["input_ids"]
        padded["attention_mask"][i, :length] = item["attention_mask"]
        padded["labels"][i] = item["labels"][0]

    return padded


# Usage
dataset = NestedJSONDataset(
    data_dir="/tmp/sample_data",
    tokenizer=None,
    max_length=128,
)
dataloader = DataLoader(
    dataset,
    batch_size=8,
    shuffle=True,
    collate_fn=nested_collate,
    num_workers=2,
    pin_memory=True,
)
```

### Streaming Dataset

```python
import torch
from torch.utils.data import IterableDataset, DataLoader
from typing import Generator
import itertools


class StreamingCSVDataset(IterableDataset):
    """Stream large CSV files without loading into memory."""

    def __init__(self, file_path, delimiter=",", skip_header=True,
                 transform=None):
        self.file_path = file_path
        self.delimiter = delimiter
        self.skip_header = skip_header
        self.transform = transform

    def _parse_line(self, line: str) -> dict:
        """Parse a single CSV line into a dict."""
        fields = line.strip().split(self.delimiter)
        return {
            "features": torch.tensor(
                [float(f) for f in fields[:-1]], dtype=torch.float
            ),
            "label": int(fields[-1]),
        }

    def _line_generator(self) -> Generator[dict, None, None]:
        """Generate parsed lines from the CSV file."""
        with open(self.file_path, "r") as f:
            if self.skip_header:
                next(f)  # Skip header line

            for line_num, line in enumerate(f):
                if line.strip():
                    sample = self._parse_line(line)
                    if self.transform:
                        sample = self.transform(sample)
                    yield sample

    def __iter__(self):
        return self._line_generator()


class TimeSeriesStreamingDataset(IterableDataset):
    """Stream time series data with a sliding window."""

    def __init__(self, data_source, window_size=100, horizon=10):
        self.data_source = data_source  # Generator or list
        self.window_size = window_size
        self.horizon = horizon
        self._buffer = []

    def __iter__(self):
        buffer = []
        for point in self.data_source:
            buffer.append(point)
            if len(buffer) >= self.window_size + self.horizon:
                features = torch.tensor(
                    buffer[-(self.window_size + self.horizon):-self.horizon],
                    dtype=torch.float
                )
                target = torch.tensor(
                    buffer[-self.horizon:],
                    dtype=torch.float
                )
                yield {"input": features, "target": target}
                buffer.pop(0)  # Slide window


# Usage example
def data_generator():
    """Simulate a streaming data source."""
    for i in range(10000):
        yield {
            "value": float(i),
            "timestamp": float(i * 0.1),
        }


stream_dataset = TimeSeriesStreamingDataset(
    data_source=data_generator(),
    window_size=50,
    horizon=5,
)

stream_loader = DataLoader(
    stream_dataset,
    batch_size=32,
    num_workers=0,  # IterableDataset with num_workers needs careful handling
)

for batch in stream_loader:
    print(f"Input: {batch['input'].shape}, Target: {batch['target'].shape}")
    break
```

### Multi-Modal Dataset

```python
import torch
from torch.utils.data import Dataset
from pathlib import Path


class MultiModalDataset(Dataset):
    """Dataset combining images, text, and tabular data.

    Each sample has:
    - An image tensor (pre-loaded or lazy-loaded)
    - A tokenized text sequence
    - A tabular feature vector
    - A classification label
    """

    def __init__(
        self,
        image_dir: Path,
        text_features: torch.Tensor,
        tabular_features: torch.Tensor,
        labels: torch.Tensor,
        tokenizer=None,
        max_text_length: int = 128,
    ):
        self.image_dir = Path(image_dir)
        self.text_features = text_features
        self.tabular_features = tabular_features
        self.labels = labels
        self.tokenizer = tokenizer
        self.max_text_length = max_text_length
        self.image_paths = sorted(self.image_dir.glob("*.pt"))

    def __len__(self):
        return len(self.labels)

    def __getitem__(self, idx):
        # Lazy-load image (pre-saved as .pt for speed)
        image_path = self.image_dir / f"img_{idx:06d}.pt"
        if image_path.exists():
            image = torch.load(image_path, weights_only=True)
        else:
            # Placeholder for missing images
            image = torch.randn(3, 224, 224)

        return {
            "image": image,                              # [C, H, W]
            "text": self.text_features[idx],              # [max_text_length]
            "tabular": self.tabular_features[idx],        # [n_features]
            "label": self.labels[idx],                    # scalar
        }


def multi_modal_collate(batch):
    """Collate multi-modal samples into batches."""
    images = torch.stack([s["image"] for s in batch])
    texts = torch.stack([s["text"] for s in batch])
    tabular = torch.stack([s["tabular"] for s in batch])
    labels = torch.stack([s["label"] for s in batch])

    return {
        "image": images,
        "text": texts,
        "tabular": tabular,
        "label": labels,
    }


# Usage
dataset = MultiModalDataset(
    image_dir=Path("/tmp/multimodal/images"),
    text_features=torch.randint(0, 1000, (100, 128)),
    tabular_features=torch.randn(100, 20),
    labels=torch.randint(0, 5, (100,)),
)

loader = DataLoader(
    dataset,
    batch_size=16,
    shuffle=True,
    collate_fn=multi_modal_collate,
    num_workers=2,
    pin_memory=True,
    drop_last=True,
)

for batch in loader:
    print(f"Image:  {batch['image'].shape}")
    print(f"Text:   {batch['text'].shape}")
    print(f"Tabular:{batch['tabular'].shape}")
    print(f"Labels: {batch['label'].shape}")
    break
```

---

## Performance Profiling

PyTorch provides `torch.profiler` for detailed performance analysis, with built-in integration for TensorBoard, Chrome Trace, and memory profiling.

### Basic Profiling

```python
import torch
import torch.nn as nn
from torch.profiler import (
    profile,
    record_function,
    ProfilerActivity,
)


class SimpleModel(nn.Module):
    def __init__(self, dim=512):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(dim, dim * 2),
            nn.GELU(),
            nn.Linear(dim * 2, dim),
            nn.GELU(),
            nn.Linear(dim, dim),
        )

    def forward(self, x):
        return self.net(x)


model = SimpleModel().cuda()
x = torch.randn(32, 512, device="cuda")

# Profile with all activities
with profile(
    activities=[ProfilerActivity.CPU, ProfilerActivity.CUDA],
    record_shapes=True,
    profile_memory=True,
    with_stack=True,
) as prof:
    for _ in range(10):
        with record_function("model_forward"):
            output = model(x)
            loss = output.sum()
        with record_function("backward"):
            loss.backward()
            model.zero_grad()

# Print top operations by CUDA time
print(prof.key_averages().table(
    sort_by="cuda_time_total", row_limit=15
))
```

### TensorBoard Integration

```python
import torch
import torch.nn as nn
from torch.profiler import profile, ProfilerActivity, tensorboard_trace_handler


model = nn.Sequential(
    nn.Linear(256, 512),
    nn.ReLU(),
    nn.Linear(512, 256),
).cuda()
x = torch.randn(64, 256, device="cuda")

# Profile and write to TensorBoard
with profile(
    activities=[ProfilerActivity.CPU, ProfilerActivity.CUDA],
    schedule=torch.profiler.schedule(
        wait=1,      # Skip first step
        warmup=1,    # Warmup for 1 step
        active=3,    # Profile for 3 steps
        repeat=1,    # Repeat once
    ),
    on_trace_ready=tensorboard_trace_handler("./log/profiler"),
    record_shapes=True,
    profile_memory=True,
    with_stack=True,
) as prof:
    for step in range(6):
        output = model(x)
        loss = output.sum()
        loss.backward()
        model.zero_grad()
        prof.step()  # Must call to advance the schedule

print("TensorBoard logs written to ./log/profiler")
print("Run: tensorboard --logdir=./log/profiler")
```

### Chrome Trace Export

```python
import torch
import torch.nn as nn
from torch.profiler import profile, ProfilerActivity


model = nn.Linear(512, 512).cuda()
x = torch.randn(32, 512, device="cuda")

with profile(
    activities=[ProfilerActivity.CPU, ProfilerActivity.CUDA],
    record_shapes=True,
) as prof:
    for _ in range(5):
        output = model(x)
        output.sum().backward()

# Export chrome trace
prof.export_chrome_trace("trace.json")

# Export memory timeline
prof.export_memory_timeline("memory_timeline.html", device="cuda:0")

print("Trace exported to trace.json")
print("Open chrome://tracing and load trace.json")
print("Memory timeline exported to memory_timeline.html")
```

### Profiler Summary Table

| Metric | Description | How to Interpret |
|--------|-------------|-----------------|
| `cpu_time_total` | Total CPU time spent in operation | High CPU time = CPU bottleneck |
| `cuda_time_total` | Total CUDA time (kernel execution) | High CUDA time = GPU bottleneck |
| `cpu_memory_usage` | CPU memory allocated | Useful for memory leaks |
| `cuda_memory_usage` | GPU memory allocated | Helps optimize memory |
| `self_cpu_time_total` | CPU time excluding sub-calls | Identifies leaf bottlenecks |
| `input_shape` | Tensor shapes per op | Debug unexpected shapes |
| `stack` | Python call stack | Trace back to source code |

### Performance Comparison

```python
import torch
import torch.nn as nn
import time
from torch.profiler import profile, ProfilerActivity


def benchmark_model(model, x, n_iters=100):
    """Benchmark and profile a model."""
    # Warmup
    for _ in range(10):
        model(x).sum().backward()
        model.zero_grad()

    torch.cuda.synchronize()

    # Time measurement
    start = time.perf_counter()
    for _ in range(n_iters):
        model(x).sum().backward()
        model.zero_grad()
    torch.cuda.synchronize()
    elapsed_ms = (time.perf_counter() - start) / n_iters * 1000

    # Memory measurement
    torch.cuda.reset_peak_memory_stats()
    model(x).sum().backward()
    torch.cuda.synchronize()
    peak_memory_mb = torch.cuda.max_memory_allocated() / 1e6

    return elapsed_ms, peak_memory_mb


# Compare model variants
configs = [
    ("Small (256)", nn.Sequential(nn.Linear(256, 256), nn.ReLU())),
    ("Medium (512)", nn.Sequential(nn.Linear(512, 512), nn.ReLU())),
    ("Large (1024)", nn.Sequential(nn.Linear(1024, 1024), nn.ReLU())),
]

print(f"{'Config':<20} {'Time (ms)':<12} {'Memory (MB)':<12}")
print("-" * 44)

for name, model in configs:
    model = model.cuda()
    x = torch.randn(32, model[0].in_features, device="cuda")
    ms, mem = benchmark_model(model, x)
    print(f"{name:<20} {ms:<12.3f} {mem:<12.1f}")
```

---

## Memory-Efficient Attention Patterns

Attention is the computational bottleneck of transformer models. This section covers efficient attention implementations.

### Scaled Dot-Product Attention

```python
import torch
import torch.nn.functional as F


def manual_scaled_dot_product_attention(q, k, v, attn_mask=None, dropout_p=0.0):
    """Manual implementation of scaled dot-product attention.

    Args:
        q: Query tensor [batch, n_heads, seq_len, head_dim]
        k: Key tensor [batch, n_heads, seq_len, head_dim]
        v: Value tensor [batch, n_heads, seq_len, head_dim]
        attn_mask: Optional attention mask
        dropout_p: Dropout probability
    Returns:
        Attention output [batch, n_heads, seq_len, head_dim]
        Attention weights [batch, n_heads, seq_len, seq_len]
    """
    d_k = q.size(-1)
    scores = torch.matmul(q, k.transpose(-2, -1)) / (d_k ** 0.5)

    if attn_mask is not None:
        scores = scores.masked_fill(attn_mask == 0, float("-inf"))

    attn_weights = F.softmax(scores, dim=-1)
    attn_weights = F.dropout(attn_weights, p=dropout_p, training=True)
    output = torch.matmul(attn_weights, v)
    return output, attn_weights


# PyTorch's fused implementation (uses FlashAttention when available)
def efficient_attention(q, k, v, is_causal=False):
    """Use PyTorch's optimized attention backend."""
    return F.scaled_dot_product_attention(
        q, k, v,
        is_causal=is_causal,
        # PyTorch automatically selects the best backend:
        # - FlashAttention (if available)
        # - Memory-efficient attention
        # - Math fallback
    )


# Example
batch, n_heads, seq_len, head_dim = 4, 8, 1024, 64
q = torch.randn(batch, n_heads, seq_len, head_dim, device="cuda")
k = torch.randn(batch, n_heads, seq_len, head_dim, device="cuda")
v = torch.randn(batch, n_heads, seq_len, head_dim, device="cuda")

# Manual
out_manual, weights_manual = manual_scaled_dot_product_attention(q, k, v)

# Efficient (FlashAttention)
out_efficient = efficient_attention(q, k, v)

print(f"Manual output:    {out_manual.shape}")
print(f"Efficient output: {out_efficient.shape}")
print(f"Max diff:         {(out_manual - out_efficient).abs().max().item():.6e}")
```

### Flash Attention Concept

```
+-----------------------------------------------------------+
|         Flash Attention vs Standard Attention              |
+-----------------------------------------------------------+
|                                                           |
|  Standard Attention:         Flash Attention:             |
│  ┌─────────────────┐        ┌─────────────────┐          │
│  │ Q × K^T         │        │ Process tiles    │          │
│  │ (N×N matrix)    │        │ of Q, K, V       │          │
│  │                 │        │                  │          │
│  │ Store N×N attn  │        │ O(N²) compute    │          │
│  │ weights in HBM  │        │ O(N) memory      │          │
│  │                 │        │ (no N×N matrix)  │          │
│  │ O(N²) memory    │        │                  │          │
│  │ O(N²) HBM reads │        │ SRAM-resident    │          │
│  └─────────────────┘        └─────────────────┘          │
│                                                           │
│  Memory: O(N²)              Memory: O(N)                  │
│  Speed:  Slow (HBM bound)   Speed:  Fast (compute bound) │
+-----------------------------------------------------------+
```

### Custom Memory-Efficient Attention

```python
import torch
import torch.nn as nn
import torch.nn.functional as F
import math


class GroupedQueryAttention(nn.Module):
    """Grouped Query Attention (GQA) — used in LLaMA, Mistral, etc.

    Reduces KV cache size by sharing KV heads across query groups.
    """

    def __init__(self, dim, n_heads, n_kv_heads, dropout=0.0):
        super().__init__()
        self.n_heads = n_heads
        self.n_kv_heads = n_kv_heads
        self.head_dim = dim // n_heads
        self.n_groups = n_heads // n_kv_heads

        self.q_proj = nn.Linear(dim, n_heads * self.head_dim, bias=False)
        self.k_proj = nn.Linear(dim, n_kv_heads * self.head_dim, bias=False)
        self.v_proj = nn.Linear(dim, n_kv_heads * self.head_dim, bias=False)
        self.out_proj = nn.Linear(n_heads * self.head_dim, dim, bias=False)
        self.dropout = dropout

    def forward(self, x, mask=None, is_causal=False):
        B, T, _ = x.shape

        # Project Q, K, V
        q = self.q_proj(x).view(B, T, self.n_heads, self.head_dim).transpose(1, 2)
        k = self.k_proj(x).view(B, T, self.n_kv_heads, self.head_dim).transpose(1, 2)
        v = self.v_proj(x).view(B, T, self.n_kv_heads, self.head_dim).transpose(1, 2)

        # Expand KV heads to match Q heads
        k = k.repeat_interleave(self.n_groups, dim=1)
        v = v.repeat_interleave(self.n_groups, dim=1)

        # Use fused scaled dot-product attention (Flash Attention)
        out = F.scaled_dot_product_attention(
            q, k, v,
            attn_mask=mask,
            dropout_p=self.dropout if self.training else 0.0,
            is_causal=is_causal,
        )

        # Reshape and project
        out = out.transpose(1, 2).contiguous().view(B, T, -1)
        return self.out_proj(out)


# Usage
gqa = GroupedQueryAttention(dim=512, n_heads=8, n_kv_heads=2).cuda()
x = torch.randn(2, 128, 512, device="cuda")
output = gqa(x, is_causal=True)
print(f"GQA output: {output.shape}")
print(f"KV heads: {gqa.n_kv_heads}, Q heads: {gqa.n_heads} "
      f"(groups: {gqa.n_groups})")
```

### Memory Comparison

| Method | Memory Complexity | HBM Accesses | Causal Masking | Hardware |
|--------|------------------|--------------|----------------|----------|
| Standard attention | O(N²) | O(N²) | Yes | All |
| FlashAttention | O(N) | O(N² / M) | Yes | GPU (SRAM) |
| FlashAttention-2 | O(N) | O(N² / M) | Yes | GPU (optimized) |
| Grouped Query Attention | O(N × KV_heads) | Reduced | Yes | All |
| Multi-Query Attention | O(N × 1) | Minimal | Yes | All |

Where N = sequence length, M = SRAM size (hardware dependent).

---

## Summary

This chapter covered the advanced tools and techniques that power high-performance PyTorch development. Here are the key takeaways:

| Topic | Key Takeaway |
|-------|-------------|
| **Custom Autograd** | Use `torch.autograd.Function` when standard operations don't provide the gradient you need. Always return `None` for non-differentiable arguments. |
| **Straight-Through Estimator** | Pass gradients unchanged through discrete operations. Essential for quantization and Gumbel-Softmax. |
| **C++ Extensions** | Use `torch.utils.cpp_extension.load_inline` for quick JIT compilation. Use `setuptools` for production extensions. |
| **torch.compile** | Use `mode="reduce-overhead"` for small models and `mode="max-autotune"` for large ones. Minimize graph breaks. |
| **Custom Operators** | Register custom ops with `torch.library` for dispatcher integration and `torch.compile` compatibility. |
| **CUDA Kernels** | Write custom CUDA kernels for maximum performance. Use `load_inline` for rapid iteration. |
| **AMP** | Use `autocast` + `GradScaler`. Always use `custom_fwd`/`custom_bwd` for custom layers in AMP mode. |
| **Memory Management** | Monitor with `torch.cuda.memory_stats()`. Use `empty_cache()` cautiously. Profile before optimizing. |
| **Gradient Checkpointing** | Use `torch.utils.checkpoint` to trade ~20-30% compute for 60-70% activation memory savings. |
| **torch.fx** | Trace, inspect, and transform computation graphs programmatically. Powerful for model optimization passes. |
| **TorchDynamo** | The Python-bytecode-level capture engine behind `torch.compile`. Guards ensure correct recompilation. |
| **Composable Transforms** | Use `torchvision.transforms.v2` for type-aware, composable data augmentation pipelines. |
| **Model Surgery** | Insert/remove/replace layers using hooks and `named_modules()`. Use `requires_grad` freezing for fine-tuning. |
| **Complex Datasets** | Use custom collate functions, `IterableDataset` for streaming, and multi-modal composition patterns. |
| **Profiling** | Use `torch.profiler` with TensorBoard or Chrome Trace. Profile shapes, memory, and GPU time together. |
| **Efficient Attention** | Use `F.scaled_dot_product_attention` for automatic Flash Attention. GQA reduces KV cache size. |

```
+-----------------------------------------------------------+
|            Advanced PyTorch Decision Matrix                 |
+-----------------------------------------------------------+
|                                                           |
│  Problem              │  Solution                          |
│  ─────────────────────┼─────────────────────────────────  │
│  Need custom gradient │  torch.autograd.Function           │
│  Slow model           │  torch.compile + profiling         │
│  OOM errors           │  AMP + checkpointing + memory opt  │
│  Custom CUDA ops      │  cpp_extension.load_inline         │
│  Model transformation │  torch.fx symbolic tracing         │
│  Large datasets       │  IterableDataset + streaming       │
│  Slow attention       │  FlashAttention + GQA              │
│  Debug compilation    │  dynamo.config.verbose + guards    │
│  Quantize model       │  FakeQuantize + STE gradients      │
│  Fine-tune large model│  Freeze layers + selective unfreeze│
+-----------------------------------------------------------+
```

---

## Practice Exercises

### Exercise 1: Custom Autograd (Easy)

Implement a `ClampFunction` that clamps tensor values between `min_val` and `max_val`, with the gradient being `0` for clamped values and the input gradient otherwise.

```python
# Skeleton — complete this
import torch
from torch.autograd import Function

class ClampFunction(Function):
    @staticmethod
    def forward(ctx, x, min_val, max_val):
        # TODO: Save mask for backward
        # TODO: Clamp and return
        pass

    @staticmethod
    def backward(ctx, grad_output):
        # TODO: Return gradient (0 where clamped, grad_output otherwise)
        # TODO: Return None for min_val and max_val
        pass
```

**Test**: Verify that gradients are zero outside the clamp range and pass through inside the range.

---

### Exercise 2: Memory-Efficient Training (Medium)

Take a model that causes OOM errors with batch size 64 and modify it to support that batch size using a combination of:
1. Mixed precision (AMP)
2. Gradient checkpointing
3. In-place operations

```python
# Skeleton
import torch
import torch.nn as nn
from torch.utils.checkpoint import checkpoint

class LargeTransformer(nn.Module):
    def __init__(self, dim=1024, n_layers=8, n_heads=16):
        super().__init__()
        self.layers = nn.ModuleList([
            nn.TransformerEncoderLayer(
                d_model=dim, nhead=nheads, dim_feedforward=dim * 4,
                batch_first=True
            ) for _ in range(n_layers)
        ])
        self.norm = nn.LayerNorm(dim)
        self.head = nn.Linear(dim, 50000)  # Large vocab

    def forward(self, x):
        # TODO: Apply gradient checkpointing to each layer during training
        # TODO: Use in-place operations where safe
        for layer in self.layers:
            x = layer(x)
        return self.head(self.norm(x))
```

**Target**: Achieve at least 3x memory reduction compared to naive training.

---

### Exercise 3: torch.fx Model Transformation (Medium)

Trace a ResNet-18 model using `torch.fx` and write a transformation pass that:
1. Finds all `nn.Conv2d` layers
2. Inserts `nn.BatchNorm2d` after each one (if not already present)
3. Verifies the transformation produces valid output

```python
# Skeleton
import torch
import torch.fx
import torchvision.models as models

model = models.resnet18()
tracer = torch.fx.Tracer()
graph = tracer.trace(model)
gm = torch.fx.GraphModule(model, graph)

# TODO: Write your transformation pass
def insert_batchnorm_after_conv(gm: torch.fx.GraphModule):
    """Insert BatchNorm2d after each Conv2d that isn't followed by one."""
    pass
```

---

### Exercise 4: Custom CUDA Kernel (Hard)

Write a CUDA kernel that computes fused LayerNorm + Dropout:
1. Forward pass: compute mean, variance, normalize, apply dropout
2. Save statistics for backward
3. Backward pass: compute gradients for input, weight, and bias

```python
# Skeleton
from torch.utils.cpp_extension import load_inline

cuda_source = r"""
#include <torch/extension.h>
#include <cuda_runtime.h>

// TODO: Write the fused LayerNorm + Dropout forward kernel
__global__ void fused_layernorm_dropout_forward_kernel(
    // TODO: Define kernel parameters
) {
    // TODO: Implement
}

// TODO: Write the fused backward kernel
__global__ void fused_layernorm_dropout_backward_kernel(
    // TODO: Define kernel parameters
) {
    // TODO: Implement
}

torch::Tensor fused_layernorm_dropout_forward(
    torch::Tensor input,
    torch::Tensor weight,
    torch::Tensor bias,
    float dropout_p,
    float eps
) {
    // TODO: Launch kernels and return output
}

torch::Tensor fused_layernorm_dropout_backward(
    torch::Tensor grad_output,
    torch::Tensor normalized,
    torch::Tensor mean,
    torch::Tensor rstd,
    torch::Tensor weight
) {
    // TODO: Launch backward kernel
}
"""

fused_ops = load_inline(
    name="fused_layernorm_dropout",
    cpp_sources="torch::Tensor fused_layernorm_dropout_forward(...);",
    cuda_sources=cuda_source,
    functions=[
        "fused_layernorm_dropout_forward",
        "fused_layernorm_dropout_backward",
    ],
    verbose=True,
)
```

---

### Exercise 5: Streaming Multi-Modal Dataset (Hard)

Implement a streaming dataset that simultaneously reads images from a directory and text from a large JSONL file (too large to fit in memory), with proper synchronization between the two data sources.

```python
# Skeleton
import json
from torch.utils.data import IterableDataset
from pathlib import Path

class StreamingMultiModalDataset(IterableDataset):
    def __init__(self, jsonl_path, image_dir, max_length=128):
        self.jsonl_path = jsonl_path
        self.image_dir = image_dir
        self.max_length = max_length

    def _read_jsonl(self):
        """Generator that yields parsed JSONL lines."""
        # TODO: Read line by line (memory efficient)
        pass

    def _load_image(self, image_id):
        """Load and preprocess an image."""
        # TODO: Load from image_dir using image_id
        pass

    def __iter__(self):
        # TODO: Synchronize text and image streams
        # TODO: Apply transforms
        # TODO: Yield (image, text, label) tuples
        pass
```

---

### Exercise 6: Performance Profiling Challenge (Expert)

Profile a 3-layer transformer model and optimize it to achieve at least **2x speedup** using techniques from this chapter. Document your optimization journey:

1. Baseline profile (identify bottleneck)
2. Apply `torch.compile` — measure improvement
3. Apply AMP — measure improvement
4. Apply gradient checkpointing — measure memory savings
5. Combine all optimizations — final benchmark

```python
# Skeleton
import torch
import torch.nn as nn
from torch.profiler import profile, ProfilerActivity

class TransformerBench(nn.Module):
    def __init__(self, dim=1024, nhead=16, n_layers=3, vocab=30000):
        super().__init__()
        self.embed = nn.Embedding(vocab, dim)
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=dim, nhead=nhead, dim_feedforward=dim * 4,
            batch_first=True
        )
        self.encoder = nn.TransformerEncoder(encoder_layer, num_layers=n_layers)
        self.head = nn.Linear(dim, vocab)

    def forward(self, x):
        x = self.embed(x)
        x = self.encoder(x)
        return self.head(x)

# TODO: Profile baseline, then optimize step by step
```

---

### Exercise 7: Custom torch.compile Backend (Expert)

Write a custom `torch.compile` backend that:
1. Receives the FX graph
2. Prints all operation types and tensor shapes
3. Counts graph breaks
4. Replaces all `torch.relu` with `torch.nn.functional.gelu`
5. Returns the modified graph

```python
# Skeleton
import torch

def custom_optimization_backend(gm: torch.fx.GraphModule, example_inputs):
    """
    Custom backend that analyzes and transforms the graph.

    Args:
        gm: The FX GraphModule to transform
        example_inputs: Example inputs for shape inference

    Returns:
        The transformed graph module
    """
    # TODO: Analyze the graph
    for node in gm.graph.nodes:
        # TODO: Count operations by type
        # TODO: Log tensor shapes
        # TODO: Replace relu with gelu
        pass

    gm.recompile()
    return gm

# Register and test
model = torch.nn.Sequential(
    torch.nn.Linear(64, 64),
    torch.nn.ReLU(),
    torch.nn.Linear(64, 64),
    torch.nn.ReLU(),
)
compiled = torch.compile(model, backend=custom_optimization_backend)
x = torch.randn(32, 64)
output = compiled(x)
```

---

*This chapter covered the advanced internals that power production PyTorch systems. Master these tools and you can optimize any model, debug any performance issue, and extend PyTorch to fit your exact needs.*
