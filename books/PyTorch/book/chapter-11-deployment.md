# Chapter 11: Model Deployment

**By Manjunath Kalburgi**

---

Training a model is only half the battle. The true measure of a machine learning project's success is whether the model can reliably serve predictions in production—whether that means running on a cloud server, a REST API, an edge device, or a mobile phone. This chapter takes you through every major deployment strategy available in the PyTorch ecosystem, from model export and optimization to serving, containerization, and edge deployment.

By the end of this chapter you will be able to:

- Export trained PyTorch models to TorchScript, ONNX, and PyTorch Mobile formats.
- Optimize models through quantization, pruning, and knowledge distillation.
- Serve models via a Flask REST API and via TorchServe.
- Containerize model-serving applications with Docker.
- Deploy models to edge and mobile devices.

---

## 11.1 Model Export Strategies Overview

Before diving into individual formats, let us compare the major export and serving options at a glance.

| Format | Export Mechanism | Runtime | Dynamic Shapes | GPU Support | Best For |
|---|---|---|---|---|---|
| **TorchScript** | `torch.jit.trace` / `torch.jit.script` | LibTorch (C++) | Limited (trace) / Yes (script) | Yes | C++ inference, TorchServe |
| **ONNX** | `torch.onnx.export` | ONNX Runtime, TensorRT, OpenVINO | Yes (dynamic axes) | Yes | Cross-framework, hardware acceleration |
| **SavedModel (via ONNX→TF)** | ONNX → tf2onnx | TensorFlow Serving | Yes | Yes | TensorFlow ecosystems |
| **PyTorch Mobile** | `torch.utils.mobile_optimizer.optimize_for_mobile` | PyTorch Mobile runtime | No | Limited | Android, iOS, embedded |
| **TorchServe** | `.mar` archive (TorchScript or eager) | TorchServe | Yes | Yes | Production-scale REST/gRPC serving |
| **TensorRT** | ONNX → TensorRT | NVIDIA TensorRT | No (static shapes) | Yes (NVIDIA only) | Maximum GPU throughput |

```
+-------------------+     +-------------------+     +---------------------+
|   PyTorch Model   |---->|  Export Format    |---->|  Serving Runtime    |
|   (eager mode)    |     |  TorchScript/ONNX |     |  TorchServe/Flask/  |
|                   |     |  Mobile           |     |  Triton/TensorRT    |
+-------------------+     +-------------------+     +---------------------+
```

---

## 11.2 TorchScript

TorchScript is PyTorch's built-in serialization format for creating production-ready models. It compiles a subset of Python into a graph representation that can run in C++ without a Python interpreter.

### Tracing vs. Scripting

| Feature | `torch.jit.trace` | `torch.jit.script` |
|---|---|---|
| Approach | Records operations for a specific input | Parses Python source into a graph |
| Control flow | Not captured (flattened) | Fully supported |
| Data-dependent branches | Broken | Works |
| Performance | Often faster to create | Slightly slower to create |
| Flexibility | Limited to tensor operations | Supports most Python + PyTorch |
| Recommended when | Model has no data-dependent control flow | Model has if/else, loops, or complex logic |

---

## 11.3 torch.jit.trace

`torch.jit.trace` executes the model once with the provided example inputs and records every operation. The resulting traced graph is a linear sequence of ops—control flow is baked in.

### Complete Example

```python
import torch
import torch.nn as nn


class ConvBlock(nn.Module):
    """A simple convolutional block."""

    def __init__(self, in_channels: int, out_channels: int) -> None:
        super().__init__()
        self.conv = nn.Conv2d(in_channels, out_channels, kernel_size=3, padding=1)
        self.bn = nn.BatchNorm2d(out_channels)
        self.relu = nn.ReLU(inplace=True)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.relu(self.bn(self.conv(x)))


class SimpleClassifier(nn.Module):
    """A classifier with NO data-dependent control flow — ideal for tracing."""

    def __init__(self, num_classes: int = 10) -> None:
        super().__init__()
        self.features = nn.Sequential(
            ConvBlock(3, 32),
            nn.MaxPool2d(2),
            ConvBlock(32, 64),
            nn.MaxPool2d(2),
        )
        self.classifier = nn.Sequential(
            nn.AdaptiveAvgPool2d(1),
            nn.Flatten(),
            nn.Linear(64, num_classes),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = self.features(x)
        return self.classifier(x)


def trace_example() -> None:
    """Trace, save, load, and run a TorchScript model."""
    model = SimpleClassifier(num_classes=10)
    model.eval()

    # Example input (batch_size=1, channels=3, height=32, width=32)
    example_input = torch.randn(1, 3, 32, 32)

    # --- Trace the model ---
    with torch.no_grad():
        traced_model = torch.jit.trace(model, example_input)

    # Inspect the graph
    print("=== Traced Graph ===")
    print(traced_model.graph)

    # --- Save ---
    traced_model.save("simple_classifier_traced.pt")
    print("\nSaved traced model to simple_classifier_traced.pt")

    # --- Load ---
    loaded_model = torch.jit.load("simple_classifier_traced.pt")

    # --- Inference ---
    with torch.no_grad():
        output = loaded_model(example_input)
    print(f"\nInput shape:  {example_input.shape}")
    print(f"Output shape: {output.shape}")
    print(f"Predicted class: {output.argmax(dim=1).item()}")


if __name__ == "__main__":
    trace_example()
```

### Limitations of Tracing

Tracing does **not** capture data-dependent control flow. If your model has an `if` statement that depends on the tensor values, the trace will follow only the branch taken during tracing:

```python
class ConditionalModel(nn.Module):
    """This model has data-dependent control flow — tracing breaks it."""

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        if x.sum() > 0:      # <-- This branch is fixed during tracing!
            return x * 2
        else:
            return x * 3


model = ConditionalModel()
example = torch.tensor([1.0, 2.0, 3.0])  # sum > 0, so only the "* 2" path is recorded

traced = torch.jit.trace(model, example)

# This will ALWAYS multiply by 2, even though the sum is negative
test_input = torch.tensor([-5.0, -3.0, -1.0])
print(f"Traced output sum: {traced(test_input).sum().item()}")  # -18.0 (* 2) instead of -27.0 (* 3)
```

---

## 11.4 torch.jit.script

`torch.jit.script` analyzes the Python source code and converts it into TorchScript IR, preserving control flow and most Python semantics.

### Complete Example

```python
import torch
import torch.nn as nn
from typing import Tuple


class DynamicClassifier(nn.Module):
    """A model with data-dependent control flow — requires scripting."""

    def __init__(self, num_classes: int = 10) -> None:
        super().__init__()
        self.shared_conv = nn.Sequential(
            nn.Conv2d(3, 32, 3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2),
        )
        self.small_branch = nn.Linear(32 * 16 * 16, num_classes)
        self.large_branch = nn.Linear(32 * 8 * 8, num_classes)
        self.num_classes = num_classes

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        batch_size = x.shape[0]
        features = self.shared_conv(x)

        # Data-dependent control flow — scripting handles this correctly
        if batch_size > 1:
            features = torch.nn.functional.adaptive_avg_pool2d(features, 8)
            out = self.large_branch(features.view(batch_size, -1))
        else:
            features = torch.nn.functional.adaptive_avg_pool2d(features, 16)
            out = self.small_branch(features.view(batch_size, -1))

        return out


def script_example() -> None:
    """Script, save, load, and run a TorchScript model with control flow."""
    model = DynamicClassifier(num_classes=10)
    model.eval()

    # --- Script the model ---
    scripted_model = torch.jit.script(model)

    # Inspect the graph (notice the If/Else nodes)
    print("=== Scripted Graph ===")
    print(scripted_model.graph)

    # --- Save and Load ---
    scripted_model.save("dynamic_classifier_scripted.pt")
    loaded_model = torch.jit.load("dynamic_classifier_scripted.pt")

    # --- Inference with batch_size=1 ---
    single_input = torch.randn(1, 3, 32, 32)
    with torch.no_grad():
        out_single = loaded_model(single_input)
    print(f"\nSingle input shape:  {single_input.shape}")
    print(f"Single output shape: {out_single.shape}")

    # --- Inference with batch_size=4 ---
    batch_input = torch.randn(4, 3, 32, 32)
    with torch.no_grad():
        out_batch = loaded_model(batch_input)
    print(f"Batch input shape:   {batch_input.shape}")
    print(f"Batch output shape:  {out_batch.shape}")


if __name__ == "__main__":
    script_example()
```

### When Scripting Fails

Scripting cannot convert arbitrary Python. Common failure modes include:

```python
# These patterns will FAIL with torch.jit.script:

# 1. Using unsupported Python features
def bad_example_1(x):
    my_dict = {"a": 1, "b": 2}  # Dict with string keys — mostly OK now,
    return x + my_dict["a"]     # but complex dict usage can fail

# 2. Calling arbitrary Python libraries
import numpy as np
def bad_example_2(x):
    arr = x.numpy()       # <-- numpy is not available in TorchScript
    return torch.from_numpy(arr)

# 3. Using *args or **kwargs in certain ways
def bad_example_3(*args, **kwargs):  # -- torch.jit.script struggles here
    return args[0] + kwargs["x"]

# 4. Class attributes that change type
class BadModule(nn.Module):
    def __init__(self):
        super().__init__()
        self.value = 0  # int initially

    def forward(self, x):
        self.value = "hello"  # <-- type changes to str! TorchScript is statically typed.
        return x + self.value
```

---

## 11.5 ONNX Export

ONNX (Open Neural Network Exchange) is a standard format that allows models to be transferred between frameworks and optimized by specialized runtimes like ONNX Runtime, TensorRT, and OpenVINO.

### Complete ONNX Export and Verification

```python
import torch
import torch.nn as nn
import numpy as np


class ResidualBlock(nn.Module):
    """A residual block for ONNX export demonstration."""

    def __init__(self, channels: int) -> None:
        super().__init__()
        self.conv1 = nn.Conv2d(channels, channels, 3, padding=1, bias=False)
        self.bn1 = nn.BatchNorm2d(channels)
        self.conv2 = nn.Conv2d(channels, channels, 3, padding=1, bias=False)
        self.bn2 = nn.BatchNorm2d(channels)
        self.relu = nn.ReLU(inplace=True)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        residual = x
        out = self.relu(self.bn1(self.conv1(x)))
        out = self.bn2(self.conv2(out))
        return self.relu(out + residual)


class ONNXExportModel(nn.Module):
    """Model for ONNX export with dynamic batch size."""

    def __init__(self, num_classes: int = 10) -> None:
        super().__init__()
        self.stem = nn.Sequential(
            nn.Conv2d(3, 64, 7, stride=2, padding=3, bias=False),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(3, stride=2, padding=1),
        )
        self.res_block = ResidualBlock(64)
        self.pool = nn.AdaptiveAvgPool2d(1)
        self.fc = nn.Linear(64, num_classes)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = self.stem(x)
        x = self.res_block(x)
        x = self.pool(x)
        x = x.view(x.size(0), -1)
        return self.fc(x)


def export_onnx() -> None:
    """Export a PyTorch model to ONNX with dynamic axes and verify."""
    model = ONNXExportModel(num_classes=10)
    model.eval()

    dummy_input = torch.randn(1, 3, 224, 224)
    onnx_path = "resnet_model.onnx"

    # --- Export with dynamic batch size ---
    torch.onnx.export(
        model,
        dummy_input,
        onnx_path,
        opset_version=17,                          # Latest stable opset
        input_names=["input"],                     # Name the input
        output_names=["output"],                   # Name the output
        dynamic_axes={                             # Allow variable batch size
            "input": {0: "batch_size"},
            "output": {0: "batch_size"},
        },
    )
    print(f"Model exported to {onnx_path}")

    # --- Verify the exported model ---
    import onnx

    onnx_model = onnx.load(onnx_path)
    onnx.checker.check_model(onnx_model)
    print("ONNX model validation: PASSED")

    # Print input/output info
    for inp in onnx_model.graph.input:
        print(f"  Input:  {inp.name} -> {[d.dim_value for d in inp.type.tensor_type.shape.dim]}")
    for out in onnx_model.graph.output:
        print(f"  Output: {out.name} -> {[d.dim_value for d in out.type.tensor_type.shape.dim]}")

    # --- Run inference with ONNX Runtime ---
    import onnxruntime as ort

    session = ort.InferenceSession(onnx_path)
    input_name = session.get_inputs()[0].name

    # Test with different batch sizes
    for batch_size in [1, 4, 8]:
        test_input = np.random.randn(batch_size, 3, 224, 224).astype(np.float32)
        outputs = session.run(None, {input_name: test_input})
        print(f"  Batch {batch_size:>2d}: input {test_input.shape} -> output {outputs[0].shape}")

    # --- Compare PyTorch vs ONNX Runtime outputs ---
    with torch.no_grad():
        torch_output = model(dummy_input).numpy()

    ort_output = session.run(None, {input_name: dummy_input.numpy()})[0]
    max_diff = np.max(np.abs(torch_output - ort_output))
    print(f"\nMax difference between PyTorch and ONNX Runtime: {max_diff:.8f}")
    assert max_diff < 1e-5, f"Outputs diverge too much: {max_diff}"
    print("Output comparison: PASSED")


if __name__ == "__main__":
    export_onnx()
```

### Opset Version Guide

| Opset Version | Key Additions | Recommended For |
|---|---|---|
| 9 | Basic ops, limited attention | Legacy systems only |
| 11 | Sequence ops, loop support | ONNX Runtime < 1.6 |
| 13 | ScatterND, Mish | Balanced compatibility |
| 17 | GroupNormalization, Attention | **Recommended default** |
| 18+ | Latest ops | Cutting-edge, check runtime support |

---

## 11.6 Model Optimization

Before serving, optimize your model to reduce latency and memory footprint.

### Operator Fusion

ONNX Runtime automatically fuses operators. You can also pre-optimize with `torch.onnx` and `onnxruntime` graph optimizers:

```python
import onnxruntime as ort


def optimize_onnx_model(input_path: str, output_path: str) -> None:
    """Apply ONNX Runtime graph optimizations."""
    sess_options = ort.SessionOptions()

    # Level 99 = all optimizations (fusion, layout, etc.)
    sess_options.graph_optimization_level = (
        ort.GraphOptimizationLevel.ORT_ENABLE_ALL
    )

    # Pre-optimization: save the optimized model
    sess_options.optimized_model_filepath = output_path

    # Build session (this writes the optimized model)
    session = ort.InferenceSession(input_path, sess_options)
    print(f"Optimized model saved to {output_path}")
    print(f"Applied optimizations: Level {sess_options.graph_optimization_level}")

    # Common fusion patterns applied automatically:
    # - Conv + BatchNorm -> fused Conv
    # - MatMul + Add -> Gemm
    # - Clip + ReLU -> fused activation
    # - Attention heads -> fused multi-head attention
```

### torch.compile (PyTorch 2.0+)

```python
import torch
import torch.nn as nn
import time


class HeavyModel(nn.Module):
    def __init__(self) -> None:
        super().__init__()
        self.layers = nn.Sequential(
            nn.Linear(512, 1024),
            nn.ReLU(),
            nn.Linear(1024, 1024),
            nn.ReLU(),
            nn.Linear(1024, 512),
            nn.ReLU(),
            nn.Linear(512, 10),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.layers(x)


def benchmark_compile() -> None:
    """Compare eager vs compiled model performance."""
    device = "cuda" if torch.cuda.is_available() else "cpu"
    model = HeavyModel().to(device).eval()
    x = torch.randn(64, 512, device=device)

    # Eager mode
    with torch.no_grad():
        for _ in range(10):
            _ = model(x)
        start = time.perf_counter()
        for _ in range(100):
            _ = model(x)
        eager_time = time.perf_counter() - start

    # Compiled mode
    compiled_model = torch.compile(model, mode="reduce-overhead")
    with torch.no_grad():
        for _ in range(10):
            _ = compiled_model(x)
        start = time.perf_counter()
        for _ in range(100):
            _ = compiled_model(x)
        compile_time = time.perf_counter() - start

    print(f"Eager:    {eager_time:.4f}s")
    print(f"Compiled: {compile_time:.4f}s")
    print(f"Speedup:  {eager_time / compile_time:.2f}x")


if __name__ == "__main__":
    benchmark_compile()
```

---

## 11.7 Quantization

Quantization reduces model size and speeds up inference by using lower-precision arithmetic (int8, float16) instead of float32.

### Comparison of Quantization Approaches

| Approach | Accuracy Loss | Setup Effort | Runtime Support | Size Reduction |
|---|---|---|---|---|
| **Post-Training Dynamic** | Minimal | Trivial | CPU, some GPU | ~2x |
| **Post-Training Static** | Low–Medium | Moderate (calibration data) | CPU, GPU, mobile | ~4x (int8) |
| **Quantization-Aware Training** | Minimal | High (retrain) | CPU, GPU, mobile | ~4x (int8) |
| **Float16 Conversion** | None | Trivial | GPU only | ~2x |

### 11.7.1 Post-Training Dynamic Quantization

The simplest form: weights are quantized at load time, activations are quantized dynamically at runtime.

```python
import torch
import torch.nn as nn
import torch.quantization as quant


class TextClassifier(nn.Module):
    """A simple text classifier for quantization demos."""

    def __init__(self, vocab_size: int = 10000, embed_dim: int = 128,
                 num_classes: int = 5) -> None:
        super().__init__()
        self.embedding = nn.EmbeddingBag(vocab_size, embed_dim, sparse=False)
        self.fc1 = nn.Linear(embed_dim, 64)
        self.fc2 = nn.Linear(64, num_classes)
        self.relu = nn.ReLU()

    def forward(self, text: torch.Tensor, offsets: torch.Tensor) -> torch.Tensor:
        embedded = self.embedding(text, offsets)
        return self.fc2(self.relu(self.fc1(embedded)))


def dynamic_quantization_example() -> None:
    """Apply post-training dynamic quantization."""
    model = TextClassifier()
    model.eval()

    # --- Quantize (weights only, activations computed dynamically) ---
    quantized_model = quant.quantize_dynamic(
        model,
        qconfig_spec={nn.Linear},  # Quantize all Linear layers
        dtype=torch.qint8,
    )

    # --- Compare model sizes ---
    import os
    import tempfile

    with tempfile.TemporaryDirectory() as tmpdir:
        torch.save(model.state_dict(), os.path.join(tmpdir, "float32.pt"))
        torch.save(quantized_model.state_dict(), os.path.join(tmpdir, "int8.pt"))
        f32_size = os.path.getsize(os.path.join(tmpdir, "float32.pt"))
        i8_size = os.path.getsize(os.path.join(tmpdir, "int8.pt"))

    print(f"Float32 size: {f32_size / 1024:.1f} KB")
    print(f"Int8 size:    {i8_size / 1024:.1f} KB")
    print(f"Compression:  {f32_size / i8_size:.2f}x")

    # --- Run inference ---
    test_text = torch.randint(0, 10000, (20,))
    test_offsets = torch.tensor([0, 10])

    with torch.no_grad():
        float_output = model(test_text, test_offsets)
        quant_output = quantized_model(test_text, test_offsets)

    print(f"\nFloat32 output: {float_output}")
    print(f"Int8 output:    {quant_output}")
    diff = (float_output - quant_output).abs().max().item()
    print(f"Max difference:  {diff:.6f}")


if __name__ == "__main__":
    dynamic_quantization_example()
```

### 11.7.2 Post-Training Static Quantization

Requires a calibration pass with representative data to determine activation ranges.

```python
import torch
import torch.nn as nn
import torch.quantization as quant


class ConvClassifier(nn.Module):
    """A CNN suitable for static quantization."""

    def __init__(self, num_classes: int = 10) -> None:
        super().__init__()
        self.conv1 = nn.Conv2d(3, 16, 3, padding=1)
        self.conv2 = nn.Conv2d(16, 32, 3, padding=1)
        self.pool = nn.AdaptiveAvgPool2d(1)
        self.fc = nn.Linear(32, num_classes)
        self.relu = nn.ReLU()

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = self.relu(self.conv1(x))
        x = torch.max_pool2d(x, 2)
        x = self.relu(self.conv2(x))
        x = torch.max_pool2d(x, 2)
        x = self.pool(x)
        return self.fc(x.view(x.size(0), -1))


def static_quantization_example() -> None:
    """Apply post-training static quantization with calibration."""
    model = ConvClassifier()
    model.eval()

    # --- Set quantization configuration ---
    model.qconfig = quant.get_default_qconfig("fbgemu")  # CPU backend

    # --- Prepare: inserts observers to record activation ranges ---
    model_prepared = quant.prepare(model)

    # --- Calibration: run representative data through the model ---
    print("Running calibration with 100 samples...")
    for _ in range(100):
        calibration_input = torch.randn(8, 3, 32, 32)
        model_prepared(calibration_input)

    # --- Convert: replaces observers with quantize/dequantize ops ---
    model_quantized = quant.convert(model_prepared)
    print("Quantization complete.")
    print(model_quantized)

    # --- Verify ---
    test_input = torch.randn(1, 3, 32, 32)
    with torch.no_grad():
        output = model_quantized(test_input)
    print(f"\nInput shape:  {test_input.shape}")
    print(f"Output shape: {output.shape}")
    print(f"Predicted:    {output.argmax(dim=1).item()}")

    # --- Check which modules are quantized ---
    print("\nQuantized modules:")
    for name, module in model_quantized.named_modules():
        if isinstance(module, (torch.nn.intrinsic.qat.ConvBn2d,)):
            print(f"  {name}: Quantized intrinsic")
        elif hasattr(module, "weight"):
            print(f"  {name}: {type(module).__name__}")


if __name__ == "__main__":
    static_quantization_example()
```

### 11.7.3 Quantization-Aware Training (QAT)

QAT simulates quantization during training so the model learns to be robust to low-precision arithmetic.

```python
import torch
import torch.nn as nn
import torch.quantization as quant
import torch.optim as optim


class SimpleQATModel(nn.Module):
    """Model for quantization-aware training demo."""

    def __init__(self, num_classes: int = 10) -> None:
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(3, 32, 3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(),
            nn.Conv2d(32, 64, 3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(),
        )
        self.pool = nn.AdaptiveAvgPool2d(1)
        self.fc = nn.Linear(64, num_classes)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = self.features(x)
        x = self.pool(x)
        return self.fc(x.view(x.size(0), -1))


def quantization_aware_training() -> None:
    """Full QAT pipeline: prepare → train → convert."""
    model = SimpleQATModel()
    model.train()

    # --- Step 1: Set QAT config ---
    model.qconfig = quant.get_default_qat_qconfig("fbgemu")

    # --- Step 2: Prepare for QAT (inserts fake-quantize modules) ---
    model_prepared = quant.prepare_qat(model)
    print("Prepared for QAT. Fake-quantize modules inserted.")

    # --- Step 3: Fine-tune the model ---
    optimizer = optim.SGD(model_prepared.parameters(), lr=0.001, momentum=0.9)
    criterion = nn.CrossEntropyLoss()
    num_epochs = 3
    num_batches = 50

    for epoch in range(num_epochs):
        epoch_loss = 0.0
        for batch_idx in range(num_batches):
            inputs = torch.randn(16, 3, 32, 32)
            labels = torch.randint(0, 10, (16,))

            optimizer.zero_grad()
            outputs = model_prepared(inputs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            epoch_loss += loss.item()

        avg_loss = epoch_loss / num_batches
        print(f"Epoch {epoch + 1}/{num_epochs} - Loss: {avg_loss:.4f}")

    # --- Step 4: Convert to quantized model ---
    model_prepared.eval()
    model_quantized = quant.convert(model_prepared)

    # --- Step 5: Verify ---
    with torch.no_grad():
        test_input = torch.randn(1, 3, 32, 32)
        output = model_quantized(test_input)
    print(f"\nQAT quantized output shape: {output.shape}")
    print(f"Predicted class: {output.argmax(dim=1).item()}")


if __name__ == "__main__":
    quantization_aware_training()
```

### 11.7.4 Float16 Quantization (Half Precision)

```python
import torch
import torch.nn as nn


class HalfPrecisionDemo(nn.Module):
    def __init__(self) -> None:
        super().__init__()
        self.fc = nn.Linear(512, 512)
        self.out = nn.Linear(512, 10)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.out(torch.relu(self.fc(x)))


def float16_conversion() -> None:
    """Convert a model to float16 for GPU inference acceleration."""
    model = HalfPrecisionDemo()
    model.eval()

    # --- Option 1: Direct .half() ---
    model_fp16 = model.half()
    print(f"Original dtype:  {next(model.parameters()).dtype}")
    print(f"Half dtype:      {next(model_fp16.parameters()).dtype}")

    # --- Option 2: torch.cuda.amp for mixed precision ---
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model_gpu = model.to(device)

    # Inference with automatic mixed precision
    x = torch.randn(8, 512, device=device)
    with torch.no_grad(), torch.cuda.amp.autocast(dtype=torch.float16):
        output = model_gpu(x)
    print(f"AMP output dtype: {output.dtype}")
    print(f"AMP output shape: {output.shape}")


if __name__ == "__main__":
    float16_conversion()
```

---

## 11.8 Model Pruning

Pruning removes less-important weights (or entire structures) from a model, reducing size and computation.

### Structured vs. Unstructured Pruning

| Type | What Is Removed | Hardware Speedup | Accuracy Impact | Compression |
|---|---|---|---|---|
| **Unstructured** | Individual weights | Limited (sparse kernels needed) | Low at high sparsity | Up to 90%+ |
| **Structured** | Entire filters/channels/rows | **Yes** (smaller dense tensors) | Moderate | Typically 25–50% |
| **Global** | Top-k weights across all layers | Varies | Better than local at same sparsity | Varies |
| **Local** | Top-k weights per layer | Predictable per layer | Can be worse than global | Varies |

### Complete Pruning Example

```python
import torch
import torch.nn as nn
import torch.nn.utils.prune as prune
import copy


class SmallCNN(nn.Module):
    """A small CNN for pruning demonstration."""

    def __init__(self, num_classes: int = 10) -> None:
        super().__init__()
        self.conv1 = nn.Conv2d(3, 32, 3, padding=1, bias=False)
        self.conv2 = nn.Conv2d(32, 64, 3, padding=1, bias=False)
        self.fc1 = nn.Linear(64 * 8 * 8, 256)
        self.fc2 = nn.Linear(256, num_classes)
        self.relu = nn.ReLU()

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = self.relu(self.conv1(x))
        x = torch.max_pool2d(x, 2)
        x = self.relu(self.conv2(x))
        x = torch.max_pool2d(x, 2)
        x = x.view(x.size(0), -1)
        x = self.relu(self.fc1(x))
        return self.fc2(x)


def count_parameters(model: nn.Module) -> dict[str, int]:
    """Count total and non-zero parameters."""
    total = 0
    nonzero = 0
    for name, param in model.named_parameters():
        numel = param.numel()
        total += numel
        nonzero += (param != 0).sum().item()
    return {"total": total, "nonzero": nonzero, "zero": total - nonzero}


def pruning_demo() -> None:
    """Demonstrate unstructured and structured pruning."""
    model = SmallCNN()
    model_original = copy.deepcopy(model)

    # ============================
    # 1. Unstructured L1 Pruning
    # ============================
    print("=" * 50)
    print("1. UNSTRUCTURED L1 PRUNING (30% per layer)")
    print("=" * 50)

    for name, module in model.named_modules():
        if isinstance(module, (nn.Conv2d, nn.Linear)):
            prune.l1_unstructured(module, name="weight", amount=0.3)
            print(f"  Pruned {name}: {module.weight.shape}")

    stats = count_parameters(model)
    print(f"\n  Total params:     {stats['total']:,}")
    print(f"  Non-zero params:  {stats['nonzero']:,}")
    print(f"  Zero params:      {stats['zero']:,}")
    print(f"  Sparsity:         {stats['zero'] / stats['total']:.1%}")

    # ============================
    # 2. Make pruning permanent
    # ============================
    print("\n" + "=" * 50)
    print("2. MAKING PRUNING PERMANENT")
    print("=" * 50)

    for name, module in model.named_modules():
        if isinstance(module, (nn.Conv2d, nn.Linear)):
            prune.remove(module, "weight")  # Replaces weight with pruned weight
    print("  Pruning masks removed; weights are now permanently pruned.")

    # ============================
    # 3. Structured Pruning (Global)
    # ============================
    print("\n" + "=" * 50)
    print("3. STRUCTURED GLOBAL PRUNING (remove 40% of filters)")
    print("=" * 50)

    model_struct = SmallCNN()
    parameters_to_prune = [
        (model_struct.conv1, "weight"),
        (model_struct.conv2, "weight"),
    ]

    # Global pruning across both conv layers
    prune.global_unstructured(
        parameters_to_prune,
        pruning_method=prune.L1Unstructured,
        amount=0.4,  # Remove 40% of filters globally
    )

    # Check per-layer sparsity after global pruning
    for name, module in model_struct.named_modules():
        if isinstance(module, nn.Conv2d):
            weight_mask = module.weight_mask if hasattr(module, "weight_mask") else None
            if weight_mask is not None:
                total = weight_mask.numel()
                zero = (weight_mask == 0).sum().item()
                print(f"  {name}: {zero}/{total} zeros ({zero / total:.1%} sparsity)")

    # ============================
    # 4. Random Unstructured Pruning
    # ============================
    print("\n" + "=" * 50)
    print("4. RANDOM UNSTRUCTURED PRUNING (50% of fc1)")
    print("=" * 50)

    model_rand = SmallCNN()
    prune.random_unstructured(model_rand.fc1, name="weight", amount=0.5)

    weight = model_rand.fc1.weight.data
    zero_count = (weight == 0).sum().item()
    total_count = weight.numel()
    print(f"  fc1: {zero_count}/{total_count} zeros ({zero_count / total_count:.1%})")


if __name__ == "__main__":
    pruning_demo()
```

---

## 11.9 Knowledge Distillation

Knowledge distillation trains a smaller "student" model to mimic a larger "teacher" model's behavior, transferring learned representations.

### Architecture Diagram

```
+------------------+         Soft Labels         +------------------+
|                  |  -------------------------> |                  |
|   Teacher Model  |   Temperature-scaled        |  Student Model   |
|   (large, frozen)|   softmax probabilities     |  (small, trained)|
|                  |  -------------------------> |                  |
+------------------+         +                    +------------------+
                                     |
                                     v
                           +------------------+
                           | Combined Loss:   |
                           | α * KD_Loss +    |
                           | (1-α) * CE_Loss  |
                           +------------------+
```

### Complete Training Loop

```python
import torch
import torch.nn as nn
import torch.nn.functional as F
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset


# =========================================
# Model Definitions
# =========================================

class TeacherModel(nn.Module):
    """Large teacher model — pre-trained."""

    def __init__(self, num_classes: int = 10) -> None:
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(3, 64, 3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(),
            nn.MaxPool2d(2),
            nn.Conv2d(64, 128, 3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(),
            nn.MaxPool2d(2),
            nn.Conv2d(128, 256, 3, padding=1),
            nn.BatchNorm2d(256),
            nn.ReLU(),
            nn.AdaptiveAvgPool2d(1),
        )
        self.classifier = nn.Linear(256, num_classes)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = self.features(x)
        return self.classifier(x.view(x.size(0), -1))


class StudentModel(nn.Module):
    """Small student model to be trained via distillation."""

    def __init__(self, num_classes: int = 10) -> None:
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(3, 16, 3, padding=1),
            nn.BatchNorm2d(16),
            nn.ReLU(),
            nn.MaxPool2d(2),
            nn.Conv2d(16, 32, 3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(),
            nn.AdaptiveAvgPool2d(1),
        )
        self.classifier = nn.Linear(32, num_classes)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = self.features(x)
        return self.classifier(x.view(x.size(0), -1))


# =========================================
# Distillation Loss
# =========================================

class DistillationLoss(nn.Module):
    """Combines hard label loss and soft label (KD) loss.

    L = α * T² * KL(softmax(z_s/T) || softmax(z_t/T)) + (1 - α) * CE(z_s, y)
    """

    def __init__(self, temperature: float = 4.0, alpha: float = 0.7) -> None:
        super().__init__()
        self.temperature = temperature
        self.alpha = alpha
        self.ce_loss = nn.CrossEntropyLoss()

    def forward(
        self,
        student_logits: torch.Tensor,
        teacher_logits: torch.Tensor,
        labels: torch.Tensor,
    ) -> torch.Tensor:
        # Soft target loss (KL divergence with temperature scaling)
        T = self.temperature
        soft_student = F.log_softmax(student_logits / T, dim=1)
        soft_teacher = F.softmax(teacher_logits / T, dim=1)
        kd_loss = F.kl_div(soft_student, soft_teacher, reduction="batchmean") * (T * T)

        # Hard target loss (standard cross-entropy)
        ce_loss = self.ce_loss(student_logits, labels)

        # Combined loss
        return self.alpha * kd_loss + (1 - self.alpha) * ce_loss


# =========================================
# Training Loop
# =========================================

def train_with_distillation() -> None:
    """Complete knowledge distillation training loop."""
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    num_classes = 10
    num_epochs = 5
    batch_size = 32

    # --- Initialize models ---
    teacher = TeacherModel(num_classes).to(device)
    student = StudentModel(num_classes).to(device)

    # Freeze teacher
    teacher.eval()
    for param in teacher.parameters():
        param.requires_grad = False

    # --- Count parameters ---
    teacher_params = sum(p.numel() for p in teacher.parameters())
    student_params = sum(p.numel() for p in student.parameters())
    print(f"Teacher parameters: {teacher_params:,}")
    print(f"Student parameters: {student_params:,}")
    print(f"Compression ratio:  {teacher_params / student_params:.1f}x")

    # --- Synthetic dataset for demonstration ---
    num_samples = 2000
    images = torch.randn(num_samples, 3, 32, 32)
    labels = torch.randint(0, num_classes, (num_samples,))
    dataset = TensorDataset(images, labels)
    dataloader = DataLoader(dataset, batch_size=batch_size, shuffle=True)

    # --- Setup training ---
    optimizer = optim.Adam(student.parameters(), lr=1e-3)
    criterion = DistillationLoss(temperature=4.0, alpha=0.7)

    # --- Training loop ---
    student.train()
    for epoch in range(num_epochs):
        total_loss = 0.0
        correct = 0
        total = 0

        for batch_images, batch_labels in dataloader:
            batch_images = batch_images.to(device)
            batch_labels = batch_labels.to(device)

            # Get teacher predictions (no gradients needed)
            with torch.no_grad():
                teacher_logits = teacher(batch_images)

            # Forward pass through student
            student_logits = student(batch_images)

            # Compute distillation loss
            loss = criterion(student_logits, teacher_logits, batch_labels)

            # Backward pass
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()

            # Track metrics
            total_loss += loss.item() * batch_labels.size(0)
            predicted = student_logits.argmax(dim=1)
            correct += (predicted == batch_labels).sum().item()
            total += batch_labels.size(0)

        avg_loss = total_loss / total
        accuracy = correct / total
        print(f"Epoch {epoch + 1}/{num_epochs} - Loss: {avg_loss:.4f} - Acc: {accuracy:.2%}")

    # --- Evaluate student vs teacher on test data ---
    test_images = torch.randn(500, 3, 32, 32).to(device)
    test_labels = torch.randint(0, num_classes, (500,)).to(device)

    student.eval()
    with torch.no_grad():
        # Student accuracy
        student_pred = student(test_images).argmax(dim=1)
        student_acc = (student_pred == test_labels).float().mean().item()

        # Teacher accuracy
        teacher_pred = teacher(test_images).argmax(dim=1)
        teacher_acc = (teacher_pred == test_labels).float().mean().item()

    print(f"\nFinal Test Accuracy:")
    print(f"  Teacher: {teacher_acc:.2%}")
    print(f"  Student: {student_acc:.2%}")
    print(f"  Gap:     {teacher_acc - student_acc:.2%}")


if __name__ == "__main__":
    train_with_distillation()
```

---

## 11.10 Model Serving with Flask

A complete REST API for model serving with proper error handling, input validation, and health checks.

```python
"""Complete Flask model serving application.

Endpoints:
    POST /predict      - Run inference
    POST /predict/batch - Run batch inference
    GET  /health       - Health check
    GET  /model/info   - Model metadata
"""

import io
import time
import logging
from typing import Any

import torch
import torch.nn as nn
from flask import Flask, request, jsonify
from PIL import Image
import torchvision.transforms as transforms

# =========================================
# Configuration
# =========================================

MODEL_PATH = "model.pt"
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
MAX_BATCH_SIZE = 32
INPUT_SIZE = (3, 224, 224)
CLASSES = [
    "airplane", "automobile", "bird", "cat", "deer",
    "dog", "frog", "horse", "ship", "truck",
]

# =========================================
# Model Definition
# =========================================

class ServingModel(nn.Module):
    """Production model for the serving demo."""

    def __init__(self, num_classes: int = 10) -> None:
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(3, 32, 3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(),
            nn.MaxPool2d(2),
            nn.Conv2d(32, 64, 3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(),
            nn.AdaptiveAvgPool2d(1),
        )
        self.classifier = nn.Linear(64, num_classes)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = self.features(x)
        return self.classifier(x.view(x.size(0), -1))


# =========================================
# Model Manager
# =========================================

class ModelManager:
    """Handles model loading, preprocessing, and inference."""

    def __init__(self) -> None:
        self.model: nn.Module | None = None
        self.device = DEVICE
        self.preprocess = transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406],
                                 std=[0.229, 0.224, 0.225]),
        ])
        self.logger = logging.getLogger("ModelManager")

    def load_model(self, model_path: str) -> None:
        """Load model from file."""
        try:
            self.model = ServingModel(num_classes=len(CLASSES))
            checkpoint = torch.load(model_path, map_location=self.device)
            if isinstance(checkpoint, dict) and "model_state_dict" in checkpoint:
                self.model.load_state_dict(checkpoint["model_state_dict"])
            else:
                self.model.load_state_dict(checkpoint)
            self.model.to(self.device)
            self.model.eval()
            self.logger.info(f"Model loaded from {model_path} to {self.device}")
        except FileNotFoundError:
            # For demo: create untrained model if file doesn't exist
            self.logger.warning(f"Model file {model_path} not found. Using uninitialized model.")
            self.model = ServingModel(num_classes=len(CLASSES)).to(self.device)
            self.model.eval()

    def preprocess_image(self, image_bytes: bytes) -> torch.Tensor:
        """Preprocess raw image bytes into a model-ready tensor."""
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        tensor = self.preprocess(image)
        return tensor.unsqueeze(0)  # Add batch dimension

    def predict(self, input_tensor: torch.Tensor) -> dict[str, Any]:
        """Run inference and return results."""
        start_time = time.perf_counter()

        input_tensor = input_tensor.to(self.device)
        with torch.no_grad():
            logits = self.model(input_tensor)
            probabilities = torch.softmax(logits, dim=1)

        inference_time = (time.perf_counter() - start_time) * 1000

        top_probs, top_indices = probabilities.topk(5, dim=1)
        predictions = []
        for prob, idx in zip(top_probs[0], top_indices[0]):
            predictions.append({
                "class": CLASSES[idx.item()],
                "confidence": round(prob.item(), 4),
            })

        return {
            "predictions": predictions,
            "inference_time_ms": round(inference_time, 2),
            "device": str(self.device),
        }


# =========================================
# Flask Application
# =========================================

app = Flask(__name__)
manager = ModelManager()


@app.before_first_request
def initialize() -> None:
    """Load model on first request."""
    manager.load_model(MODEL_PATH)


@app.route("/health", methods=["GET"])
def health_check() -> tuple[Any, int]:
    """Health check endpoint."""
    status = {
        "status": "healthy",
        "model_loaded": manager.model is not None,
        "device": str(DEVICE),
        "cuda_available": torch.cuda.is_available(),
    }
    return jsonify(status), 200


@app.route("/model/info", methods=["GET"])
def model_info() -> tuple[Any, int]:
    """Return model metadata."""
    if manager.model is None:
        return jsonify({"error": "Model not loaded"}), 503

    param_count = sum(p.numel() for p in manager.model.parameters())
    return jsonify({
        "model_type": type(manager.model).__name__,
        "total_parameters": param_count,
        "device": str(DEVICE),
        "num_classes": len(CLASSES),
        "classes": CLASSES,
        "input_size": list(INPUT_SIZE),
    }), 200


@app.route("/predict", methods=["POST"])
def predict() -> tuple[Any, int]:
    """Single image prediction endpoint."""
    if manager.model is None:
        return jsonify({"error": "Model not loaded"}), 503

    # --- Validate input ---
    if "image" not in request.files:
        return jsonify({"error": "No image file provided. Send as 'image' multipart field."}), 400

    try:
        image_bytes = request.files["image"].read()
        input_tensor = manager.preprocess_image(image_bytes)
        result = manager.predict(input_tensor)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 500


@app.route("/predict/json", methods=["POST"])
def predict_json() -> tuple[Any, int]:
    """JSON-based prediction endpoint (for tensor inputs)."""
    if manager.model is None:
        return jsonify({"error": "Model not loaded"}), 503

    try:
        data = request.get_json(force=True)
        tensor_data = data.get("tensor")
        if tensor_data is None:
            return jsonify({"error": "Provide 'tensor' field as nested list"}), 400

        input_tensor = torch.tensor(tensor_data, dtype=torch.float32)
        if input_tensor.dim() == 3:
            input_tensor = input_tensor.unsqueeze(0)

        result = manager.predict(input_tensor)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 500


@app.route("/predict/batch", methods=["POST"])
def predict_batch() -> tuple[Any, int]:
    """Batch image prediction endpoint."""
    if manager.model is None:
        return jsonify({"error": "Model not loaded"}), 503

    files = request.files.getlist("images")
    if not files:
        return jsonify({"error": "No images provided"}), 400
    if len(files) > MAX_BATCH_SIZE:
        return jsonify({"error": f"Batch size {len(files)} exceeds max {MAX_BATCH_SIZE}"}), 400

    try:
        tensors = []
        for f in files:
            img_bytes = f.read()
            tensors.append(manager.preprocess_image(img_bytes))

        batch_tensor = torch.cat(tensors, dim=0)
        result = manager.predict(batch_tensor)
        result["batch_size"] = len(files)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": f"Batch prediction failed: {str(e)}"}), 500


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    app.run(host="0.0.0.0", port=5000, debug=False)
```

**Running the server:**

```bash
# Install dependencies
pip install flask torch torchvision pillow

# Start the server
python flask_serving.py

# Test health endpoint
curl http://localhost:5000/health

# Test prediction (with image file)
curl -X POST -F "image=@test_image.jpg" http://localhost:5000/predict

# Test JSON prediction
curl -X POST -H "Content-Type: application/json" \
  -d '{"tensor": [[[[0.1, 0.2], [0.3, 0.4]]]]}' \
  http://localhost:5000/predict/json

# Get model info
curl http://localhost:5000/model/info
```

---

## 11.11 TorchServe

TorchServe is PyTorch's official model serving framework, designed for production-scale deployment.

### Model Archiver

```bash
# Install TorchServe
pip install torchserve torch-model-archiver

# Create a model archive from a TorchScript model
torch-model-archiver \
    --model-name image_classifier \
    --version 1.0 \
    --model-file model.py \
    --serialized-file model_traced.pt \
    --handler image_classifier_handler \
    --export-path model_store \
    --force

# Or with a custom handler
torch-model-archiver \
    --model-name image_classifier \
    --version 1.0 \
    --serialized-file model_traced.pt \
    --handler custom_handler.py:MyHandler \
    --extra-files index_to_name.json \
    --export-path model_store \
    --force
```

### Custom Handler

```python
"""TorchServe custom handler for image classification."""

import io
import json
import logging
import torch
import torch.nn as nn
from PIL import Image
import torchvision.transforms as transforms
from ts.torch_handler.base_handler import BaseHandler

logger = logging.getLogger(__name__)


class ImageClassifierHandler(BaseHandler):
    """Custom TorchServe handler for image classification."""

    def __init__(self) -> None:
        super().__init__()
        self.model = None
        self.device = None
        self.preprocess = None
        self.classes = None

    def initialize(self, context) -> None:
        """Load the model and any artifacts."""
        properties = context.system_properties
        self.device = torch.device(
            "cuda:" + str(properties.get("gpu_id", 0))
            if torch.cuda.is_available() and properties.get("gpu_id") is not None
            else "cpu"
        )

        # Load model
        model_dir = properties.get("model_dir")
        model_path = f"{model_dir}/model_traced.pt"
        self.model = torch.jit.load(model_path, map_location=self.device)
        self.model.to(self.device)
        self.model.eval()

        # Load class mappings
        with open(f"{model_dir}/index_to_name.json") as f:
            self.classes = json.load(f)

        # Preprocessing pipeline
        self.preprocess = transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406],
                                 [0.229, 0.224, 0.225]),
        ])

        logger.info(f"Model initialized on {self.device}")

    def preprocess(self, data: list) -> torch.Tensor:
        """Preprocess input images."""
        images = []
        for row in data:
            image = row.get("data") or row.get("body")
            if isinstance(image, (str, bytes)):
                image = Image.open(io.BytesIO(image)).convert("RGB")
            images.append(self.preprocess(image))
        return torch.stack(images).to(self.device)

    def inference(self, inputs: torch.Tensor) -> torch.Tensor:
        """Run model inference."""
        with torch.no_grad():
            return self.model(inputs)

    def postprocess(self, output: torch.Tensor) -> list:
        """Format predictions as JSON-serializable dicts."""
        predictions = []
        probs = torch.softmax(output, dim=1)
        top_probs, top_indices = probs.topk(5, dim=1)

        for i in range(output.size(0)):
            preds = []
            for j in range(5):
                idx = top_indices[i][j].item()
                preds.append({
                    "class": self.classes.get(str(idx), f"class_{idx}"),
                    "probability": round(top_probs[i][j].item(), 4),
                })
            predictions.append(preds)
        return predictions
```

### Configuration and Launch

```bash
# Start TorchServe
torchserve --start \
    --model-store model_store \
    --models image_classifier=image_classifier.mar \
    --ts-config config.properties

# config.properties
cat > config.properties << 'EOF'
inference_address=http://0.0.0.0:8080
management_address=http://0.0.0.0:8081
metrics_address=http://0.0.0.0:8082
load_models=all
number_of_netty_threads=32
job_queue_size=1000
EOF

# --- Inference API Examples ---

# Predict with image file
curl http://localhost:8080/predictions/image_classifier \
    -H "Content-Type: application/octet-stream" \
    --data-binary @test_image.jpg

# Predict with JSON tensor
curl http://localhost:8080/predictions/image_classifier \
    -H "Content-Type: application/json" \
    -d '{"instances": [{"tensor": [1.0, 2.0, 3.0]}]}'

# --- Management API ---

# List models
curl http://localhost:8081/models

# Describe model
curl http://localhost:8081/models/image_classifier

# Unload model
curl -X DELETE http://localhost:8081/models/image_classifier

# Reload model
curl -X PUT http://localhost:8081/models/image_classifier?autScale=true&maxWorkers=4

# --- Metrics ---
curl http://localhost:8082/metrics
```

---

## 11.12 Model Format Comparison Table

| Feature | TorchScript | ONNX | TorchServe | TensorRT | PyTorch Mobile | Core ML |
|---|---|---|---|---|---|---|
| **Export method** | `jit.trace` / `jit.script` | `torch.onnx.export` | `.mar` archive | ONNX → TRT | `optimize_for_mobile` | ONNX/trace → coremltools |
| **Primary runtime** | LibTorch (C++) | ONNX Runtime | TorchServe (JVM) | NVIDIA TensorRT | PyTorch Mobile | Core ML (Apple) |
| **GPU support** | ✅ | ✅ | ✅ | ✅ (NVIDIA only) | ⚠️ (limited) | ✅ (Metal/ANE) |
| **CPU support** | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| **Mobile support** | ❌ | ⚠️ (via ONNX Mobile) | ❌ | ❌ | ✅ (Android/iOS) | ✅ (iOS/macOS) |
| **Dynamic shapes** | ✅ (script) / ❌ (trace) | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Python dependency** | ❌ (C++ only) | ❌ | ✅ (handler) | ❌ | ❌ | ❌ |
| **INT8 quantization** | Manual | ✅ (ORT) | ✅ | ✅ (native) | ✅ | ✅ (ANE) |
| **FP16 support** | ✅ | ✅ | ✅ | ✅ (native) | ✅ | ✅ |
| **Graph optimization** | Basic | ✅ (ORT level 99) | Via ONNX RT | ✅ (fusion) | ✅ | ✅ (Apple) |
| **Model size** | 1x | ~1x | 1x + overhead | ~0.75x | ~0.75x | ~0.75x |
| **Latency (relative)** | 1x (baseline) | 0.8–1x | 1.1x (overhead) | **0.3–0.5x** | 0.8–1.2x | 0.5–0.8x (ANE) |
| **Ecosystem maturity** | High | High | Medium | High | Medium | High (Apple) |
| **Ease of use** | Medium | Medium | Medium | Hard | Easy | Medium |
| **Best for** | C++ inference, TorchServe backend | Cross-platform, hardware acceleration | Production serving, scaling | Max GPU throughput | Android/iOS apps | Apple ecosystem apps |

---

## 11.13 Deployment Checklist

Use this checklist before every production deployment:

```
+=====================================================================+
|                    PRODUCTION DEPLOYMENT CHECKLIST                   |
+=====================================================================+

□ 1. MODEL VALIDATION
    □ Unit tests pass for model forward pass
    □ Accuracy on held-out test set meets threshold
    □ No NaN/Inf values in outputs for edge-case inputs
    □ Tested with batch sizes: 1, 8, 32, and max expected
    □ Tested with different input sequences/durations

□ 2. EXPORT & OPTIMIZATION
    □ Model exported to target format (TorchScript / ONNX / Mobile)
    □ Quantization applied if applicable (int8 / fp16)
    □ Graph optimization applied (operator fusion)
    □ Model size is within deployment constraints
    □ Exported model output matches eager-mode output (tolerance < 1e-4)

□ 3. PERFORMANCE BENCHMARKING
    □ Latency measured at P50, P95, P99
    □ Throughput (requests/second) measured
    □ Memory usage profiled (peak RAM, GPU VRAM)
    □ Cold start time acceptable
    □ Load tested at 2x expected traffic

□ 4. ROBUSTNESS & ERROR HANDLING
    □ Input validation (type, shape, value ranges)
    □ Graceful error responses (400 for bad input, 503 for model down)
    □ Timeout handling for long-running requests
    □ Retry logic for transient failures
    □ Fallback strategy (default prediction / cached response)

□ 5. MONITORING & OBSERVABILITY
    □ Request/response logging (no PII in logs)
    □ Latency metrics exported (Prometheus / CloudWatch)
    □ Error rate alerts configured
    □ Model prediction distribution monitoring (drift detection)
    □ Health check endpoint implemented

□ 6. SECURITY
    □ API authentication configured (API key / OAuth / JWT)
    □ Rate limiting in place
    □ Input sanitization (prevent injection via tensor data)
    □ HTTPS/TLS enabled for all endpoints
    □ Model file access restricted (S3 bucket policies, etc.)

□ 7. DEPLOYMENT INFRASTRUCTURE
    □ Docker image built and tested locally
    □ Resource limits set (CPU, memory, GPU)
    □ Auto-scaling configured (min/max instances)
    □ Load balancer health checks configured
    □ Rolling update / blue-green deployment tested

□ 8. DOCUMENTATION & ROLLBACK
    □ API documentation generated (OpenAPI / Swagger)
    □ Model card completed (training data, metrics, limitations)
    □ Rollback procedure documented and tested
    □ Previous model version retained for A/B testing
    □ On-call runbook updated with new endpoints
```

---

## 11.14 Containerization with Docker

### Dockerfile for PyTorch Model Serving

```dockerfile
# =========================================
# Multi-stage build for PyTorch model serving
# =========================================

# Stage 1: Builder
FROM python:3.11-slim as builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# Stage 2: Production image
FROM python:3.11-slim as production

WORKDIR /app

# Copy installed packages from builder
COPY --from=builder /install /usr/local

# Copy application code
COPY model/ ./model/
COPY serving/ ./serving/
COPY config/ ./config/

# Create non-root user for security
RUN groupadd -r modeluser && useradd -r -g modeluser modeluser
RUN chown -R modeluser:modeluser /app
USER modeluser

# Environment variables
ENV PYTHONUNBUFFERED=1
ENV MODEL_DIR=/app/model
ENV PORT=8080

# Expose serving port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8080/health')" || exit 1

# Start the server
CMD ["python", "-m", "serving.app"]
```

### requirements.txt

```
torch>=2.0.0
flask>=3.0.0
gunicorn>=21.2.0
pillow>=10.0.0
numpy>=1.24.0
```

### docker-compose.yml

```yaml
version: "3.9"

services:
  model-server:
    build:
      context: .
      dockerfile: Dockerfile
      target: production
    ports:
      - "8080:8080"
    volumes:
      - model-data:/app/model
    environment:
      - MODEL_DIR=/app/model
      - MODEL_NAME=image_classifier
      - MAX_WORKERS=4
      - LOG_LEVEL=INFO
    deploy:
      resources:
        limits:
          cpus: "2.0"
          memory: 4G
        reservations:
          cpus: "1.0"
          memory: 2G
    restart: unless-stopped
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"

  # Optional: Nginx reverse proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - model-server

volumes:
  model-data:
    driver: local
```

### Build and Run

```bash
# Build the Docker image
docker compose build

# Start services
docker compose up -d

# Check logs
docker compose logs -f model-server

# Test the API
curl http://localhost:8080/health

# Stop services
docker compose down

# Scale to 3 instances
docker compose up -d --scale model-server=3
```

---

## 11.15 Edge Deployment

### PyTorch Mobile Export

```python
import torch
import torch.nn as nn


class MobileNet(nn.Module):
    """Lightweight model designed for mobile deployment."""

    def __init__(self, num_classes: int = 10) -> None:
        super().__init__()
        # Depthwise separable convolutions (key building block for mobile)
        self.depthwise = nn.Conv2d(32, 32, 3, padding=1, groups=32, bias=False)
        self.pointwise = nn.Conv2d(32, 64, 1, bias=False)
        self.pool = nn.AdaptiveAvgPool2d(1)
        self.fc = nn.Linear(64, num_classes)
        self.relu = nn.ReLU()

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = self.relu(self.depthwise(x))
        x = self.relu(self.pointwise(x))
        x = self.pool(x)
        return self.fc(x.view(x.size(0), -1))


def export_for_mobile() -> None:
    """Export and optimize a model for PyTorch Mobile."""
    model = MobileNet(num_classes=10)
    model.eval()

    example_input = torch.randn(1, 32, 64, 64)

    # --- Trace the model ---
    traced = torch.jit.trace(model, example_input)

    # --- Optimize for mobile ---
    from torch.utils.mobile_optimizer import optimize_for_mobile
    optimized = optimize_for_mobile(traced)

    # --- Save as TorchScript mobile ---
    optimized._save_for_lite_interpreter("mobilenet.ptl")

    # --- Verify the mobile model ---
    loaded = torch.jit.load("mobilenet.ptl")
    output = loaded(example_input)
    print(f"Mobile model output shape: {output.shape}")
    print(f"Predicted class: {output.argmax(dim=1).item()}")

    # --- Get model size ---
    import os
    size_mb = os.path.getsize("mobilenet.ptl") / (1024 * 1024)
    print(f"Model size: {size_mb:.2f} MB")


if __name__ == "__main__":
    export_for_mobile()
```

### Core ML Conversion

```python
"""Convert a PyTorch model to Core ML for Apple devices.

Requires: pip install coremltools
"""

import torch
import torch.nn as nn


class SimpleClassifier(nn.Module):
    def __init__(self, num_classes: int = 10) -> None:
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(3, 16, 3, padding=1),
            nn.ReLU(),
            nn.AdaptiveAvgPool2d(1),
        )
        self.fc = nn.Linear(16, num_classes)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = self.features(x)
        return self.fc(x.view(x.size(0), -1))


def convert_to_coreml() -> None:
    """Convert PyTorch model to Core ML format."""
    try:
        import coremltools as ct

        model = SimpleClassifier(num_classes=10)
        model.eval()
        example_input = torch.randn(1, 3, 224, 224)

        # Trace the model
        traced_model = torch.jit.trace(model, example_input)

        # Convert to Core ML
        coreml_model = ct.convert(
            traced_model,
            inputs=[
                ct.ImageType(
                    name="input_image",
                    shape=(1, 3, 224, 224),
                    scale=1.0 / 255.0,
                    bias=[-0.485 / 0.229, -0.456 / 0.224, -0.406 / 0.225],
                    color_layout=ct.colorlayout.RGB,
                )
            ],
            outputs=[
                ct.TensorType(name="class_probabilities")
            ],
            compute_units=ct.ComputeUnit.ALL,  # CPU, GPU, Neural Engine
        )

        # Set model metadata
        coreml_model.author = "PyTorch Deployment Chapter"
        coreml_model.short_description = "Image classifier for iOS deployment"
        coreml_model.input_description["input_image"] = "Input RGB image (224x224)"
        coreml_model.output_description["class_probabilities"] = "Class probability distribution"

        # Save
        coreml_model.save("SimpleClassifier.mlpackage")
        print("Core ML model saved to SimpleClassifier.mlpackage")

        # Optional: also save in mlmodel format (legacy)
        coreml_model.save("SimpleClassifier.mlmodel")
        print("Core ML model saved to SimpleClassifier.mlmodel")

    except ImportError:
        print("coremltools is required: pip install coremltools")
        print("This conversion only works on macOS.")


if __name__ == "__main__":
    convert_to_coreml()
```

### Mobile Deployment Summary

| Target Platform | Export Format | Tool | Notes |
|---|---|---|---|
| **Android** | `.ptl` (Lite Interpreter) | PyTorch Mobile | Use `optimize_for_mobile()` |
| **iOS** | `.ptl` or `.mlpackage` | PyTorch Mobile / Core ML | Core ML preferred for ANE |
| **Embedded Linux** | `.onnx` | ONNX Runtime / TFLite | Quantize to int8 for edge |
| **Web Browser** | `.onnx` | ONNX.js / ONNX Runtime Web | Use WebAssembly backend |
| **FPGA / ASIC** | `.onnx` / `.tflite` | Vendor compilers | Quantize to int8 or binary |

---

## 11.16 Summary

This chapter covered the complete lifecycle of deploying PyTorch models to production:

1. **Export formats** — TorchScript for C++ inference, ONNX for cross-framework portability, and PyTorch Mobile for edge devices. Choose based on your target runtime and feature requirements.

2. **TorchScript** — `torch.jit.trace` for models without control flow (fast and simple), `torch.jit.script` for models with branching and loops (more flexible but more restrictive on Python features).

3. **ONNX** — The universal interchange format with excellent runtime ecosystem (ORT, TensorRT, OpenVINO). Use dynamic axes for variable input shapes and always verify output parity with the PyTorch model.

4. **Optimization** — `torch.compile` for automatic graph optimization, ONNX Runtime graph optimizers for post-export fusion, and framework-specific optimizers for deployment targets.

5. **Quantization** — Dynamic quantization for quick wins (minimal setup), static quantization for production CPU inference, and quantization-aware training for maximum accuracy at low precision.

6. **Pruning** — Structured pruning for real hardware speedups, unstructured pruning for compression without hardware-aware benefits.

7. **Knowledge distillation** — Transfer knowledge from large to small models with the temperature-scaled KL divergence loss, achieving competitive accuracy at a fraction of the cost.

8. **Serving** — Flask for rapid prototyping and small-scale deployment; TorchServe for production-scale management, monitoring, and multi-model serving.

9. **Containerization** — Docker with multi-stage builds for reproducible, portable deployments. docker-compose for orchestrating the serving application with supporting infrastructure.

10. **Edge deployment** — PyTorch Mobile (`.ptl`) for Android and iOS; Core ML for Apple ecosystem with Neural Engine acceleration; ONNX for cross-platform edge devices.

**Key takeaways:**
- Always benchmark before and after optimization to ensure accuracy–latency tradeoffs are acceptable.
- Profile your serving pipeline end-to-end; model inference is often only part of total latency (preprocessing and postprocessing matter too).
- Use the deployment checklist before every production release.
- Start simple (Flask + TorchScript), then graduate to TorchServe or TensorRT as scale demands.

---

## 11.17 Practice Exercises

### Exercise 1: TorchScript Export (Difficulty: ⭐)

Create a model with a linear layer, ReLU, and another linear layer. Trace it with `torch.jit.trace`, save it, load it, and verify the outputs match the original model.

```python
# Starter code:
class SimpleNet(nn.Module):
    def __init__(self):
        super().__init__()
        # TODO: Define two linear layers and ReLU

    def forward(self, x):
        # TODO: Implement forward pass
        pass

# TODO: Trace, save, load, and verify
```

### Exercise 2: ONNX Export with Dynamic Axes (Difficulty: ⭐⭐)

Export a model to ONNX with dynamic batch size **and** dynamic sequence length. Verify the exported model accepts inputs of shape `(1, 10)`, `(4, 25)`, and `(8, 100)`.

```python
# Your model should be an RNN-based classifier:
# Embedding -> LSTM -> Linear
# Export with dynamic_axes for both batch and sequence dimensions
```

### Exercise 3: Post-Training Quantization Comparison (Difficulty: ⭐⭐)

Take a pre-trained model, apply dynamic quantization and static quantization separately, and compare:
- Model sizes (float32 vs dynamic vs static)
- Inference latency on CPU (measure with `time.perf_counter`)
- Output differences between the three variants

### Exercise 4: Full Knowledge Distillation Pipeline (Difficulty: ⭐⭐⭐)

Using CIFAR-10:
1. Train a teacher model (large ResNet) for 10 epochs
2. Distill to a student model (small CNN) using the distillation loss
3. Compare:
   - Student trained with only cross-entropy
   - Student trained with knowledge distillation
4. Report accuracy and model size for all three

### Exercise 5: Flask REST API (Difficulty: ⭐⭐⭐)

Build a complete Flask API that:
- Loads a TorchScript model at startup
- Accepts both image uploads and JSON tensor inputs
- Returns top-5 predictions with confidence scores
- Includes `/health`, `/model/info`, `/predict`, and `/predict/batch` endpoints
- Has proper error handling and input validation
- Write 5 `curl` commands to test every endpoint

### Exercise 6: Docker + TorchServe Deployment (Difficulty: ⭐⭐⭐⭐)

Package your model for production:
1. Trace and export your model to TorchScript
2. Create a custom TorchServe handler
3. Build a Docker image with the model archive
4. Write a docker-compose.yml with health checks, resource limits, and a reverse proxy
5. Load test the service with 100 concurrent requests

### Exercise 7: Mobile Deployment (Difficulty: ⭐⭐⭐⭐)

1. Create a lightweight CNN (< 5MB) suitable for mobile
2. Export it for PyTorch Mobile (`.ptl`)
3. Convert it to Core ML format
4. Compare model sizes across all three formats (PyTorch, `.ptl`, `.mlpackage`)
5. Write a brief analysis of which format you would choose for an Android vs iOS app and why

### Exercise 8: End-to-End Deployment Pipeline (Difficulty: ⭐⭐⭐⭐⭐)

Build a complete deployment pipeline:
1. Train a model on CIFAR-10
2. Apply quantization-aware training
3. Export to both TorchScript and ONNX
4. Benchmark both formats (latency, throughput, accuracy)
5. Serve with Flask behind Docker
6. Write a deployment checklist specific to your pipeline
7. Document your benchmarking results in a comparison table

---

*In the next chapter, we will explore advanced topics including distributed training, mixed-precision training at scale, and building custom autograd functions for specialized operations.*
