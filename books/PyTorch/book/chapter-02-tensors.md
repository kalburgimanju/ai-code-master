# Chapter 2: Tensors & Operations

**By Manjunath Kalburgi**

---

## What Are Tensors?

A **tensor** is the fundamental data structure in PyTorch. It is a multi-dimensional array — a generalization of scalars (0D), vectors (1D), and matrices (2D) to arbitrary dimensions. Every computation in PyTorch operates on tensors.

```
  Rank 0 (Scalar)       Rank 1 (Vector)      Rank 2 (Matrix)       Rank 3 (3D Tensor)
      ┌───┐              ┌───┬───┬───┐       ┌───┬───┬───┐       ┌────┬────┬────┐
      │ 5 │              │ 1 │ 2 │ 3 │       │ 1 │ 2 │ 3 │       │  1 │  2 │  3 │
      └───┘              └───┴───┴───┘       ├───┼───┼───┤       ├────┼────┼────┤
     0 dimensions        1 dimension         │ 4 │ 5 │ 6 │       │  4 │  5 │  6 │
                                             ├───┼───┼───┤       ├────┼────┼────┤
                                             │ 7 │ 8 │ 9 │       │  7 │  8 │  9 │
                                             └───┴───┴───┘       └────┴────┴────┘
                                              2 dimensions         3 dimensions

  Shape: ()              Shape: (3,)          Shape: (3, 3)        Shape: (3, 3)
  ndim: 0                ndim: 1              ndim: 2              ndim: 3
```

### Tensor vs NumPy ndarray

| Property | PyTorch Tensor | NumPy ndarray |
|----------|---------------|---------------|
| GPU Support | Yes (`tensor.to('cuda')`) | No (CPU only) |
| Autograd | Yes (track gradients) | No |
| Distributed | Yes (DistributedDataParallel) | Limited |
| Speed | Faster with GPU | CPU only |
| Ecosystem | Deep learning focused | General scientific computing |
| Interoperability | Seamless conversion | Seamless conversion |

## Tensor Creation Methods

### From Python Data

```python
import torch

# ── From Python lists ────────────────────────────────────
a = torch.tensor([1, 2, 3])
b = torch.tensor([[1.0, 2.0], [3.0, 4.0]])
c = torch.tensor([[[1, 2], [3, 4]], [[5, 6], [7, 8]]])  # 3D

print(f"1D: {a.shape}")    # torch.Size([3])
print(f"2D: {b.shape}")    # torch.Size([2, 2])
print(f"3D: {c.shape}")    # torch.Size([2, 2, 2])

# Explicit dtype
d = torch.tensor([1, 2, 3], dtype=torch.float32)
e = torch.tensor([1, 2, 3], dtype=torch.int64)
f = torch.tensor([True, False, True], dtype=torch.bool)

# ⚠️ torch.tensor() COPIES data
original = [1.0, 2.0, 3.0]
t = torch.tensor(original)
original[0] = 999
print(f"Original changed to {original}, tensor is {t}")  # Tensor stays [1, 2, 3]
```

### Factory Functions — Filled Tensors

```python
# ── Zeros and Ones ──────────────────────────────────────
zeros = torch.zeros(3, 4)
ones = torch.ones(2, 3, 4)
full = torch.full((3, 3), fill_value=3.14)

print(f"Zeros: \n{zeros}")
print(f"Ones: \n{ones}")
print(f"Full (π): \n{full}")

# New — creates tensor with same shape but uninitialized
empty = torch.empty(2, 3)
print(f"Empty (garbage values): \n{empty}")

# New zeros / ones / full with same properties as existing tensor
like_zeros = torch.zeros_like(zeros)
like_ones = torch.ones_like(zeros)
```

### Ranges and Sequences

```python
# ── arange: like Python range but returns a tensor ───────
a = torch.arange(10)              # [0, 1, 2, ..., 9]
b = torch.arange(0, 10, 2)       # [0, 2, 4, 6, 8]
c = torch.arange(0, 1, 0.25)     # [0.0, 0.25, 0.50, 0.75]
print(f"arange(10):       {a}")
print(f"arange(0,10,2):   {b}")
print(f"arange(0,1,0.25): {c}")

# ── linspace: evenly spaced values over an interval ──────
d = torch.linspace(0, 1, 5)       # [0.0, 0.25, 0.5, 0.75, 1.0]
e = torch.linspace(-1, 1, 11)     # 11 values from -1 to 1
print(f"linspace(0,1,5):     {d}")
print(f"linspace(-1,1,11):   {e}")

# ── logspace: logarithmically spaced ─────────────────────
f = torch.logspace(0, 3, 4)       # [1, 10, 100, 1000]
print(f"logspace(0,3,4):     {f}")

# ── eye: identity matrix ─────────────────────────────────
eye = torch.eye(4)
print(f"eye(4): \n{eye}")
```

### Random Tensors

```python
# ── Uniform distribution [0, 1) ──────────────────────────
a = torch.rand(3, 4)
b = torch.rand(3, 4, device='cpu')

# ── Uniform distribution [low, high) ─────────────────────
c = torch.randint(0, 10, (3, 4))           # Integer tensors
d = torch.empty(3, 4).uniform_(0, 1)       # In-place uniform

# ── Normal distribution N(0, 1) ──────────────────────────
e = torch.randn(3, 4)
f = torch.randn(3, 4, mean=0, std=2)      # N(0, 4)

# ── Normal distribution with custom mean/std ─────────────
g = torch.normal(mean=5.0, std=2.0, size=(3, 4))

# ── Other distributions ──────────────────────────────────
h = torch.randn_like(e)                    # Same shape as e, normal
i = torch.rand_like(a)                     # Same shape as a, uniform
j = torch.empty(3, 4).normal_(mean=0, std=1)   # In-place normal
k = torch.empty(3, 4).exponential_(lambda=1.0) # Exponential

# ── Setting random seed for reproducibility ──────────────
torch.manual_seed(42)
x1 = torch.randn(3)
torch.manual_seed(42)
x2 = torch.randn(3)
print(f"Reproducible: {torch.equal(x1, x2)}")  # True

# Also set CUDA seed
torch.cuda.manual_seed_all(42)
```

### From NumPy Arrays

```python
import numpy as np

# ── From NumPy to PyTorch ────────────────────────────────
np_array = np.array([1.0, 2.0, 3.0])
tensor_from_np = torch.from_numpy(np_array)
print(f"From NumPy: {tensor_from_np}")
print(f"Dtype: {tensor_from_np.dtype}")

# ⚠️ Shares memory with NumPy array!
np_array[0] = 999
print(f"Tensor after NumPy change: {tensor_from_np}")  # Also changed!

# To avoid shared memory, clone:
np_array2 = np.array([1.0, 2.0, 3.0])
tensor_copy = torch.tensor(np_array2)  # .tensor() copies data
np_array2[0] = 999
print(f"Cloned tensor unaffected: {tensor_copy}")  # Still [1, 2, 3]

# ── From PyTorch to NumPy ────────────────────────────────
t = torch.tensor([4.0, 5.0, 6.0])
np_result = t.numpy()              # Or: t.detach().numpy() if requires_grad
np_result2 = t.detach().cpu().numpy()  # Most robust conversion
print(f"To NumPy: {np_result}, dtype: {np_result.dtype}")
```

### From Other Tensor-like Objects

```python
# ── torch.as_tensor: converts without copying if possible ──
np_arr = np.array([1.0, 2.0, 3.0])
t = torch.as_tensor(np_arr, dtype=torch.float32)
print(f"as_tensor: {t}")

# ── torch.from_dlpack: zero-copy from other frameworks ────
# (Requires the source framework to support DLPack)
# For example, with CuPy:
# import cupy
# cp_array = cupy.array([1, 2, 3])
# t = torch.from_dlpack(cp_array)
```

### Comprehensive Creation Summary

| Method | Description | Example |
|--------|-------------|---------|
| `torch.tensor(data)` | From list/ndarray (copies data) | `torch.tensor([1, 2, 3])` |
| `torch.as_tensor(data)` | From list/ndarray (shares memory when possible) | `torch.as_tensor(np_arr)` |
| `torch.from_numpy(arr)` | From NumPy (shares memory) | `torch.from_numpy(np_arr)` |
| `torch.zeros(*size)` | All zeros | `torch.zeros(3, 4)` |
| `torch.ones(*size)` | All ones | `torch.ones(2, 3)` |
| `torch.full(size, val)` | All fill_value | `torch.full((3, 3), 7.0)` |
| `torch.empty(*size)` | Uninitialized (garbage) | `torch.empty(3, 4)` |
| `torch.arange(start, end, step)` | Range of values | `torch.arange(0, 10, 2)` |
| `torch.linspace(start, end, steps)` | Evenly spaced | `torch.linspace(0, 1, 5)` |
| `torch.logspace(start, end, steps)` | Log-spaced | `torch.logspace(0, 3, 4)` |
| `torch.eye(n)` | Identity matrix | `torch.eye(4)` |
| `torch.rand(*size)` | Uniform [0, 1) | `torch.rand(3, 4)` |
| `torch.randn(*size)` | Normal N(0, 1) | `torch.randn(3, 4)` |
| `torch.randint(low, high, size)` | Random integers | `torch.randint(0, 10, (3, 4))` |
| `torch.normal(mean, std, size)` | Normal with custom μ, σ | `torch.normal(0, 1, (3, 4))` |
| `torch.zeros_like(t)` | Zeros with same shape | `torch.zeros_like(existing)` |
| `torch.randn_like(t)` | Randn with same shape | `torch.randn_like(existing)` |
| `torch.empty_like(t)` | Empty with same shape | `torch.empty_like(existing)` |

## Data Types (Dtype)

PyTorch tensors have a data type that determines how elements are stored and computed.

### Available Data Types

| PyTorch Dtype | NumPy Equivalent | Description | Bytes | Range/Notes |
|--------------|-------------------|-------------|-------|-------------|
| `torch.float32` / `torch.float` | `np.float32` | Single precision float | 4 | ±3.4e38, ~7 decimal digits |
| `torch.float64` / `torch.double` | `np.float64` | Double precision float | 8 | ±1.7e308, ~15 decimal digits |
| `torch.float16` / `torch.half` | `np.float16` | Half precision float | 2 | ±6.5e4, ~3 decimal digits |
| `torch.bfloat16` | — | Brain float | 2 | Same range as float32, reduced precision |
| `torch.int8` | `np.int8` | Signed 8-bit integer | 1 | -128 to 127 |
| `torch.int16` / `torch.short` | `np.int16` | Signed 16-bit integer | 2 | -32768 to 32767 |
| `torch.int32` / `torch.int` | `np.int32` | Signed 32-bit integer | 4 | ±2.1e9 |
| `torch.int64` / `torch.long` | `np.int64` | Signed 64-bit integer | 8 | ±9.2e18 |
| `torch.uint8` | `np.uint8` | Unsigned 8-bit integer | 1 | 0 to 255 |
| `torch.bool` | `np.bool_` | Boolean | 1 | True / False |
| `torch.complex64` | `np.complex64` | Complex float32 | 8 | Real + Imaginary |
| `torch.complex128` | `np.complex128` | Complex float64 | 16 | Real + Imaginary |
| `torch.quint8` | — | Quantized uint8 | 1 | Quantized inference |

### Type Checking and Casting

```python
import torch

# ── Create tensors with specific dtypes ──────────────────
a = torch.tensor([1.0, 2.0], dtype=torch.float32)
b = torch.tensor([1.0, 2.0], dtype=torch.float64)
c = torch.tensor([1, 2, 3], dtype=torch.int64)
d = torch.tensor([True, False], dtype=torch.bool)
e = torch.tensor([1+2j, 3+4j], dtype=torch.complex64)

# ── Check dtype ──────────────────────────────────────────
print(f"a.dtype: {a.dtype}")       # torch.float32
print(f"c.dtype: {c.dtype}")       # torch.int64
print(f"d.dtype: {d.dtype}")       # torch.bool

# ── Check type ───────────────────────────────────────────
print(f"a.type(): {a.type()}")     # torch.FloatTensor

# ── Type casting methods ─────────────────────────────────
f = a.float()      # → float32
g = a.double()     # → float64
h = a.half()       # → float16
i = a.bfloat16()   # → bfloat16
j = a.int()        # → int32
k = a.long()       # → int64
l = a.bool()       # → bool

# ── .to() for flexible casting ───────────────────────────
m = a.to(torch.float64)
n = a.to(dtype=torch.int32)
o = a.to('cpu', torch.bfloat16)

# ── Default dtypes ───────────────────────────────────────
print(f"Default float: {torch.get_default_dtype()}")  # float32

# Change default
torch.set_default_dtype(torch.float64)
q = torch.tensor([1.0, 2.0])  # Now float64
print(f"After changing default: {q.dtype}")

# Reset
torch.set_default_dtype(torch.float32)
```

### When to Use Each Dtype

```python
# float32: Default for most training
model_weights = torch.randn(100, 100, dtype=torch.float32)

# float64: When high precision is needed (scientific computing, loss computation)
precise_calculation = torch.tensor(1.0, dtype=torch.float64)

# float16 / bfloat16: Mixed precision training for speed and memory savings
# Requires torch.cuda.amp (Automatic Mixed Precision)
half_weights = model_weights.half().cuda()

# bfloat16: Preferred over float16 for training (same range as float32)
bf16_weights = model_weights.bfloat16().cuda()

# int64: Default for indexing, long tensor operations
indices = torch.tensor([0, 2, 4], dtype=torch.int64)

# int32: When memory is a concern with integer data
class_labels = torch.randint(0, 10, (1000,), dtype=torch.int32)

# uint8: Image data, quantized models
image = torch.randint(0, 256, (3, 224, 224), dtype=torch.uint8)

# bool: Masking operations
mask = torch.tensor([True, False, True, True], dtype=torch.bool)

# complex: Signal processing, some physics simulations
complex_signal = torch.tensor([1+2j, 3+4j], dtype=torch.complex64)
```

## Shape Manipulation

### Reshape and View

```python
import torch

t = torch.arange(24)
print(f"Original: {t}, shape: {t.shape}")

# ── reshape: returns a new tensor with the specified shape ──
r1 = t.reshape(4, 6)
r2 = t.reshape(6, 4)
r3 = t.reshape(2, 3, 4)
r4 = t.reshape(-1)            # Flatten to 1D
r5 = t.reshape(2, -1)         # Infer: 2 x 12
r6 = t.reshape(-1, 6)         # Infer: 4 x 6

print(f"reshape(4, 6):     {r1.shape}")
print(f"reshape(6, 4):     {r2.shape}")
print(f"reshape(2, 3, 4):  {r3.shape}")
print(f"reshape(-1):       {r4.shape}")
print(f"reshape(2, -1):    {r5.shape}")
print(f"reshape(-1, 6):    {r6.shape}")

# ── view: same as reshape but requires contiguous memory ──
v1 = t.view(4, 6)             # Faster if tensor is contiguous
v2 = t.view(2, 3, 4)
print(f"view(4, 6): {v1.shape}")

# ⚠️ view fails if tensor is not contiguous
x = torch.randn(2, 3)
y = x.permute(1, 0)  # Non-contiguous
# y.view(6)          # This would FAIL
y.reshape(6)          # This works (creates a copy)

# ── flatten: convenience for flattening dimensions ──────
f1 = torch.flatten(r3)                # All dims → 1D
f2 = torch.flatten(r3, start_dim=1)   # Flatten from dim 1 onward
print(f"flatten all: {f1.shape}")      # [24]
print(f"flatten from dim 1: {f2.shape}")  # [2, 12]
```

### Transpose and Permute

```python
# ── Transpose (2D only): swap rows and columns ──────────
m = torch.arange(12).reshape(3, 4)
print(f"Original (3x4): \n{m}")
print(f"Transposed (4x3): \n{m.T}")         # Shorthand
print(f"transpose(0,1): \n{m.transpose(0, 1)}")  # Same as .T

# ── Permute (any number of dimensions): reorder axes ────
t3d = torch.arange(24).reshape(2, 3, 4)    # (batch=2, seq=3, feat=4)
print(f"Original shape: {t3d.shape}")         # [2, 3, 4]

p1 = t3d.permute(0, 2, 1)    # Swap dims 1 and 2 → (2, 4, 3)
print(f"permute(0,2,1): {p1.shape}")          # [2, 4, 3]

p2 = t3d.permute(2, 0, 1)    # Move dim 2 to front → (4, 2, 3)
print(f"permute(2,0,1): {p2.shape}")          # [4, 2, 3]

p3 = t3d.permute(1, 2, 0)    # Move dim 0 to back → (3, 4, 2)
print(f"permute(1,2,0): {p3.shape}")          # [3, 4, 2]

# Common in vision: (N, C, H, W) ↔ (N, H, W, C)
img = torch.randn(1, 3, 224, 224)   # PyTorch format
# img_nhwc = img.permute(0, 2, 3, 1) # TensorFlow format (1, 224, 224, 3)
```

### Squeeze and Unsqueeze

```python
# ── Squeeze: remove dimensions of size 1 ─────────────────
a = torch.zeros(1, 3, 1, 4)
print(f"Original shape: {a.shape}")        # [1, 3, 1, 4]

s1 = a.squeeze()          # Remove ALL size-1 dims
print(f"squeeze(): {s1.shape}")            # [3, 4]

s2 = a.squeeze(0)         # Remove only dim 0 if size 1
print(f"squeeze(0): {s2.shape}")           # [3, 1, 4]

s3 = a.squeeze(2)         # Remove only dim 2 if size 1
print(f"squeeze(2): {s3.shape}")           # [1, 3, 4]

# ⚠️ Squeeze does nothing if the dimension is not size 1
b = torch.zeros(2, 3)
print(f"squeeze on non-size-1: {b.squeeze().shape}")  # [2, 3] (unchanged)

# ── Unsqueeze: add a dimension of size 1 ─────────────────
c = torch.zeros(3, 4)
print(f"Original: {c.shape}")              # [3, 4]

u0 = c.unsqueeze(0)       # Add dim at position 0
print(f"unsqueeze(0): {u0.shape}")         # [1, 3, 4]

u1 = c.unsqueeze(1)       # Add dim at position 1
print(f"unsqueeze(1): {u1.shape}")         # [3, 1, 4]

u2 = c.unsqueeze(-1)      # Add dim at last position
print(f"unsqueeze(-1): {u2.shape}")        # [3, 4, 1]

# Common usage: adding a batch dimension for single samples
single_image = torch.randn(3, 224, 224)         # C, H, W
batched = single_image.unsqueeze(0)              # 1, C, H, W
print(f"Single: {single_image.shape}")           # [3, 224, 224]
print(f"Batched: {batched.shape}")               # [1, 3, 224, 224]
```

### Other Shape Operations

```python
# ── cat: concatenate along existing dimension ────────────
a = torch.zeros(2, 3)
b = torch.ones(2, 3)
c = torch.cat([a, b], dim=0)     # Stack vertically → [4, 3]
d = torch.cat([a, b], dim=1)     # Stack horizontally → [2, 6]
print(f"cat dim=0: {c.shape}")    # [4, 3]
print(f"cat dim=1: {d.shape}")    # [2, 6]

# ── stack: concatenate along a NEW dimension ─────────────
e = torch.stack([a, b], dim=0)   # → [2, 2, 3]
f = torch.stack([a, b], dim=1)   # → [2, 2, 3]
g = torch.stack([a, b], dim=2)   # → [2, 3, 2]
print(f"stack dim=0: {e.shape}")  # [2, 2, 3]
print(f"stack dim=1: {f.shape}")  # [2, 2, 3]
print(f"stack dim=2: {g.shape}")  # [2, 3, 2]

# ── chunk: split into equal parts ────────────────────────
t = torch.arange(12).reshape(4, 3)
chunks = torch.chunk(t, 2, dim=0)   # Split into 2 chunks
print(f"Chunk 0: {chunks[0].shape}")  # [2, 3]
print(f"Chunk 1: {chunks[1].shape}")  # [2, 3]

# ── split: split by size ─────────────────────────────────
parts = torch.split(t, [1, 2, 1], dim=0)  # Sizes: 1, 2, 1
print(f"Split sizes: {[p.shape for p in parts]}")

# ── narrow: extract a subset along a dimension ───────────
narrowed = torch.narrow(t, 0, 1, 2)  # dim=0, start=1, length=2
print(f"Narrowed: \n{narrowed}")       # Rows 1 and 2
```

## Indexing and Slicing

### Basic Indexing

```python
import torch

t = torch.arange(24).reshape(2, 3, 4)
print(f"Shape: {t.shape}")  # [2, 3, 4]

# ── Single element ───────────────────────────────────────
print(f"t[0]:         {t[0].shape}")       # [3, 4]
print(f"t[0, 1]:      {t[0, 1].shape}")    # [4]
print(f"t[0, 1, 2]:   {t[0, 1, 2]}")       # scalar: 6

# ── Slicing ──────────────────────────────────────────────
print(f"t[0:1]:       {t[0:1].shape}")     # [1, 3, 4]
print(f"t[:, 0]:      {t[:, 0].shape}")    # [2, 4]
print(f"t[:, 0, 1]:   {t[:, 0, 1]}")       # tensor([1, 5]) — first element of dim 1 across batch
print(f"t[:, :, ::2]: {t[:, :, ::2].shape}")  # [2, 3, 2] — every other element in last dim

# Negative indexing
print(f"t[-1]:        {t[-1].shape}")       # [3, 4] — last in dim 0
print(f"t[:, -1]:     {t[:, -1].shape}")    # [2, 4] — last in dim 1
```

### Advanced Indexing

```python
t = torch.arange(30).reshape(2, 3, 5)
print(f"Tensor: \n{t}")

# ── Integer array indexing ────────────────────────────────
# Select specific elements
indices_dim0 = torch.tensor([0, 1, 0])
indices_dim1 = torch.tensor([0, 1, 2])
indices_dim2 = torch.tensor([1, 2, 3])

result = t[indices_dim0, indices_dim1, indices_dim2]
print(f"Advanced index: {result}")  # [t[0,0,1], t[1,1,2], t[0,2,3]]

# ── Combining slicing and integer indexing ────────────────
# Slice first dim, integer-index second and third
result2 = t[0, torch.tensor([0, 2]), torch.tensor([1, 3])]
print(f"Combined: {result2}")  # [t[0,0,1], t[0,2,3]]
```

### Boolean Masking

```python
t = torch.arange(10).float()
print(f"Tensor: {t}")

# ── Create boolean masks ─────────────────────────────────
mask = t > 5
print(f"Mask (t > 5):     {mask}")
print(f"Masked values:    {t[mask]}")        # [6, 7, 8, 9]
print(f"Count of True:    {mask.sum()}")     # 4

# ── Comparison operations create masks ───────────────────
mask_even = (t % 2 == 0)
print(f"Even numbers:     {t[mask_even]}")   # [0, 2, 4, 6, 8]

# ── Multiple conditions with & (and), | (or) ─────────────
mask_combined = (t > 3) & (t < 8)
print(f"3 < t < 8:        {t[mask_combined]}")  # [4, 5, 6, 7]

mask_union = (t < 2) | (t > 7)
print(f"t < 2 or t > 8:   {t[mask_union]}")  # [0, 1, 8, 9]

# ── Masked assignment ────────────────────────────────────
t_copy = t.clone()
t_copy[t_copy < 3] = 0
print(f"After zeroing < 3: {t_copy}")  # [0, 0, 0, 3, 4, 5, 6, 7, 8, 9]

# ── torch.where: conditional selection ───────────────────
x = torch.tensor([1.0, 2.0, 3.0, 4.0])
y = torch.tensor([10.0, 20.0, 30.0, 40.0])
condition = x > 2.5
result = torch.where(condition, x, y)
print(f"torch.where:       {result}")  # [10, 20, 3, 4]

# ── Indexing with .masked_fill_ ──────────────────────────
t2 = torch.arange(10).float()
t2.masked_fill_(t2 > 5, float('-inf'))
print(f"Masked fill:       {t2}")  # [0, 1, 2, 3, 4, 5, -inf, -inf, -inf, -inf]

# ── Practical: Padding masks in NLP ──────────────────────
seq_lengths = torch.tensor([3, 5, 2, 4])
max_len = 6
# Create padding mask: True where valid, False where padding
arange = torch.arange(max_len).unsqueeze(0)  # (1, max_len)
padding_mask = arange < seq_lengths.unsqueeze(1)  # (batch, max_len)
print(f"Padding mask:\n{padding_mask}")
```

## Arithmetic Operations

### Element-Wise Operations

```python
a = torch.tensor([1.0, 2.0, 3.0, 4.0])
b = torch.tensor([2.0, 3.0, 4.0, 5.0])

# ── Basic arithmetic ─────────────────────────────────────
print(f"a + b = {a + b}")            # [3, 5, 7, 9]
print(f"a - b = {a - b}")            # [-1, -1, -1, -1]
print(f"a * b = {a * b}")            # [2, 6, 12, 20]
print(f"a / b = {a / b}")            # [0.5, 0.667, 0.75, 0.8]
print(f"a ** b = {a ** b}")          # [1, 8, 81, 1024]
print(f"a % b = {a % b}")            # [1, 2, 3, 4]
print(f"a // b = {a // b}")          # [0, 0, 0, 0] (floor division)

# ── Mathematical functions ───────────────────────────────
x = torch.tensor([0.0, 1.0, 2.0, 3.0])
print(f"torch.sqrt(x) = {torch.sqrt(x)}")
print(f"torch.exp(x)  = {torch.exp(x)}")
print(f"torch.log(x + 1e-8) = {torch.log(x + 1e-8)}")  # Avoid log(0)
print(f"torch.sin(x)  = {torch.sin(x)}")
print(f"torch.abs(-x) = {torch.abs(-x)}")
print(f"torch.round(x * 1.3) = {torch.round(x * 1.3)}")
```

### Matrix Multiplication

```python
# ── 2D matrix multiplication ─────────────────────────────
A = torch.tensor([[1.0, 2.0], [3.0, 4.0]])   # (2, 2)
B = torch.tensor([[5.0, 6.0], [7.0, 8.0]])   # (2, 2)

# These are all equivalent:
r1 = A @ B                    # Operator syntax
r2 = torch.mm(A, B)           # Explicit 2D matmul
r3 = torch.matmul(A, B)       # General matmul (handles broadcasting)
print(f"A @ B = \n{r1}")

# Verify: @ = mm = matmul for 2D
assert torch.equal(r1, r2)
assert torch.equal(r1, r3)

# ── Batch matrix multiplication ──────────────────────────
batch_A = torch.randn(8, 3, 4)    # (batch=8, rows=3, cols=4)
batch_B = torch.randn(8, 4, 5)    # (batch=8, rows=4, cols=5)

batch_result = torch.bmm(batch_A, batch_B)  # (8, 3, 5)
print(f"Batch matmul: {batch_A.shape} @ {batch_B.shape} = {batch_result.shape}")

# Also works with torch.matmul (with broadcasting)
batch_result2 = batch_A @ batch_B
assert torch.equal(batch_result, batch_result2)

# ── Dot product ──────────────────────────────────────────
x = torch.tensor([1.0, 2.0, 3.0])
y = torch.tensor([4.0, 5.0, 6.0])

dot1 = torch.dot(x, y)    # 1*4 + 2*5 + 3*6 = 32
dot2 = x @ y               # Same thing
dot3 = (x * y).sum()       # Manual dot product
print(f"Dot product: {dot1}")

# ── Cross product ────────────────────────────────────────
a = torch.tensor([1.0, 2.0, 3.0])
b = torch.tensor([4.0, 5.0, 6.0])
cross = torch.cross(a, b)
print(f"Cross product: {cross}")

# ── Linear algebra operations ────────────────────────────
M = torch.tensor([[1.0, 2.0], [3.0, 4.0]])
print(f"Inverse:    \n{torch.inverse(M)}")
print(f"Determinant: {torch.det(M):.1f}")
print(f"Trace:       {torch.trace(M):.1f}")
eigenvalues, eigenvectors = torch.linalg.eig(M)
print(f"Eigenvalues: {eigenvalues}")
```

### torch.matmul vs torch.mm vs torch.bmm

| Function | Input Shapes | Notes |
|----------|-------------|-------|
| `torch.mm(A, B)` | (N, M) @ (M, P) → (N, P) | Strict 2D only, no broadcasting |
| `torch.matmul(A, B)` | Various | General purpose, supports broadcasting |
| `torch.bmm(A, B)` | (B, N, M) @ (B, M, P) → (B, N, P) | Batched 3D only, no broadcasting |
| `A @ B` | Various | Python operator, same as matmul |
| `torch.dot(a, b)` | (N,) @ (N,) → scalar | 1D vectors only |
| `torch.einsum(sub, *tensors)` | Any | Einstein summation, most flexible |

## Broadcasting Rules

Broadcasting allows PyTorch to perform operations on tensors of different shapes without explicit copying.

### The Rules

```
┌──────────────────────────────────────────────────────────────┐
│                 Broadcasting Rules                            │
│                                                              │
│  Rule 1: Tensors with fewer dimensions are prepended with   │
│          1s on the left until the number of dimensions match.│
│                                                              │
│  Rule 2: Tensors with size 1 along a dimension are          │
│          stretched to match the other tensor's size.         │
│                                                              │
│  Rule 3: A dimension mismatch is an error IF neither size   │
│          is 1 or missing.                                    │
│                                                              │
│  Key insight: Start from the RIGHTMOST dimension and        │
│  work left, comparing sizes.                                 │
│                                                              │
│  Read bottom-up:                                             │
│  ┌─────┬─────┬─────┬─────┐                                  │
│  │  2  │  3  │  1  │  4  │  Tensor A: (2, 3, 1, 4)         │
│  ├─────┼─────┼─────┼─────┤                                  │
│  │  1  │  1  │  5  │  4  │  Tensor B: (   1, 5, 4)         │
│  ├─────┼─────┼─────┼─────┤                                  │
│  │  2  │  3  │  5  │  4  │  Result:   (2, 3, 5, 4)         │
│  └─────┴─────┴─────┴─────┘                                  │
│                                                              │
│  Rightmost: 4 == 4 ✓                                        │
│  Next:      1 → stretches to 5 ✓                            │
│  Next:      1 → stretches to 3 ✓                            │
│  Leftmost:  2 == 2 ✓                                        │
└──────────────────────────────────────────────────────────────┘
```

### Broadcasting Examples

```python
import torch

# ── Example 1: Scalar + Tensor ───────────────────────────
a = torch.randn(3, 4)
b = 2.0
c = a + b  # b is broadcast to match a's shape
print(f"Scalar + (3,4): {c.shape}")  # [3, 4]

# ── Example 2: Vector + Matrix ───────────────────────────
a = torch.randn(3, 4)       # (3, 4)
b = torch.randn(4)          # (4,) → broadcast as (1, 4) → (3, 4)
c = a + b
print(f"(3,4) + (4,): {c.shape}")  # [3, 4]

# ── Example 3: Different rank tensors ────────────────────
a = torch.randn(8, 1, 6, 1)    # (8, 1, 6, 1)
b = torch.randn(7, 1, 5)       # (   7, 1, 5)
# b becomes (1, 7, 1, 5) → (8, 7, 6, 5)
c = a + b
print(f"(8,1,6,1) + (7,1,5): {c.shape}")  # [8, 7, 6, 5]

# ── Example 4: Error case ────────────────────────────────
a = torch.randn(3, 4)
b = torch.randn(3)
try:
    c = a + b  # (3, 4) + (3,) → (3, 4) + (1, 3) → MISMATCH: 4 vs 3
except RuntimeError as e:
    print(f"Error: {e}")

# ── Example 5: Practical — adding bias in a linear layer ──
batch_output = torch.randn(32, 128)    # (batch=32, features=128)
bias = torch.randn(128)                # (128,) → broadcast as (1, 128)
result = batch_output + bias            # (32, 128) — bias applied to each sample

# ── Example 6: Computing pairwise distances ──────────────
points1 = torch.randn(10, 2)    # (10, 2) — 10 points in 2D
points2 = torch.randn(8, 2)     # (8, 2)  — 8 points in 2D

# Expand for broadcasting
diff = points1.unsqueeze(1) - points2.unsqueeze(0)  # (10, 1, 2) - (1, 8, 2) = (10, 8, 2)
distances = torch.norm(diff, dim=2)  # (10, 8) — pairwise distances
print(f"Pairwise distances shape: {distances.shape}")
```

## In-Place Operations

In-place operations modify the tensor directly rather than creating a new tensor. They are denoted by a trailing underscore (`_`).

```python
a = torch.tensor([1.0, 2.0, 3.0])

# ── In-place operations ──────────────────────────────────
b = a.clone()
b.add_(1)           # b = b + 1 (in-place)
b.mul_(2)           # b = b * 2 (in-place)
b.clamp_(min=2)     # b = max(b, 2) (in-place)
print(f"After in-place ops: {b}")

# Other in-place operations:
# a.add_(other)        a.mul_(other)      a.div_(other)
# a.pow_(n)            a.exp_()           a.log_()
# a.abs_()             a.neg_()           a.sqrt_()
# a.fill_(value)       a.zero_()          a.ones_()
# a.transpose_(0, 1)   a.reshape_(shape)  a.copy_(other)
# a.scatter_(dim, idx, src)               a.copy_(src)

# ⚠️ CAUTION: In-place ops break autograd for gradient computation!
x = torch.tensor([1.0, 2.0], requires_grad=True)
y = x * 2
y.add_(1)  # ⚠️ ERROR: in-place operation on a tensor that requires grad
# This will raise a RuntimeError!
```

### When to Use In-Place Operations

```python
# ✅ Good: In-place for initialization and non-differentiable setup
tensor = torch.empty(1000, 1000)
tensor.zero_()         # Initialize to zeros — efficient
tensor.fill_(3.14)     # Fill with constant — efficient

# ✅ Good: In-place for updating buffers
running_mean = torch.zeros(128)
running_mean.mul_(0.99).add_(new_batch_mean * 0.01)

# ❌ Bad: In-place in differentiable code (breaks autograd)
# x.relu_()   # Don't do this; use x = torch.relu(x) instead
```

## GPU Tensors

### Moving Tensors Between Devices

```python
import torch

# ── Check device availability ────────────────────────────
if torch.cuda.is_available():
    device = torch.device("cuda")
    print(f"Using GPU: {torch.cuda.get_device_name(0)}")
elif torch.backends.mps.is_available():
    device = torch.device("mps")
    print("Using Apple MPS (Metal)")
else:
    device = torch.device("cpu")
    print("Using CPU")

# ── Create tensor directly on device ─────────────────────
gpu_tensor = torch.randn(1000, 1000, device=device)
print(f"Device: {gpu_tensor.device}")

# ── Move existing tensor to device ───────────────────────
cpu_tensor = torch.randn(1000, 1000)
gpu_tensor = cpu_tensor.to(device)       # Preferred method
gpu_tensor2 = cpu_tensor.cuda()          # NVIDIA only
gpu_tensor3 = cpu_tensor.to("cuda:0")    # Specific GPU
print(f"After .to(): {gpu_tensor.device}")

# ── Move back to CPU ─────────────────────────────────────
cpu_again = gpu_tensor.cpu()
cpu_again2 = gpu_tensor.to("cpu")

# ── Check if tensors are on the same device ──────────────
a = torch.randn(3, 3)
b = torch.randn(3, 3)
print(f"Same device: {a.device == b.device}")

# ✅ Best practice: Use .to(device) for device-agnostic code
class MyModel(torch.nn.Module):
    def __init__(self, device='cpu'):
        super().__init__()
        self.linear = torch.nn.Linear(10, 5).to(device)
        self.device = device

    def forward(self, x):
        x = x.to(self.device)
        return self.linear(x)

# ── Multi-GPU: Moving specific layers ────────────────────
# Model parallel: different layers on different GPUs
# Layer 1 on GPU 0, Layer 2 on GPU 1
# This is an advanced pattern; prefer DataParallel or DDP
```

### GPU Operations

```python
if torch.cuda.is_available():
    # ── GPU computation ──────────────────────────────────
    a = torch.randn(10000, 10000, device='cuda')
    b = torch.randn(10000, 10000, device='cuda')

    # Time GPU vs CPU
    import time

    # CPU
    a_cpu = a.cpu()
    b_cpu = b.cpu()
    start = time.time()
    for _ in range(10):
        _ = a_cpu @ b_cpu
    cpu_time = time.time() - start

    # GPU
    start = time.time()
    for _ in range(10):
        _ = a @ b
    torch.cuda.synchronize()  # Wait for GPU to finish
    gpu_time = time.time() - start

    print(f"CPU time: {cpu_time:.3f}s")
    print(f"GPU time: {gpu_time:.3f}s")
    print(f"Speedup: {cpu_time / gpu_time:.1f}x")

    # ── GPU-specific operations ──────────────────────────
    print(f"GPU memory allocated: {torch.cuda.memory_allocated() / 1e6:.1f} MB")
    print(f"GPU memory cached:    {torch.cuda.memory_reserved() / 1e6:.1f} MB")

    # Reset peak memory stats
    torch.cuda.reset_peak_memory_stats()

    # ── Pinning memory for faster CPU→GPU transfers ───────
    pinned = torch.randn(1000, 1000).pin_memory()
    # .pin_memory() allocates page-locked memory for faster .to('cuda') transfers
```

## Comparison Operations

```python
a = torch.tensor([1, 2, 3, 4, 5])
b = torch.tensor([5, 4, 3, 2, 1])

# ── Element-wise comparisons ─────────────────────────────
print(f"a == b: {a == b}")      # [False, False, True, False, False]
print(f"a != b: {a != b}")      # [True, True, False, True, True]
print(f"a > b:  {a > b}")       # [False, False, False, True, True]
print(f"a < b:  {a < b}")       # [True, True, False, False, False]
print(f"a >= 3: {a >= 3}")      # [False, False, True, True, True]
print(f"a <= 2: {a <= 2}")      # [True, True, False, False, False]

# ── All / Any ────────────────────────────────────────────
print(f"torch.all(a == b): {torch.all(a == b)}")   # False
print(f"torch.any(a == b): {torch.any(a == b)}")   # True
print(f"torch.all(a > 0):  {torch.all(a > 0)}")    # True
print(f"(a == 3).any():    {(a == 3).any()}")       # True

# ── isclose / allclose ───────────────────────────────────
x = torch.tensor([1.0, 2.0, 3.0])
y = torch.tensor([1.0, 2.0001, 3.0])
print(f"torch.isclose(x, y, atol=0.001): {torch.isclose(x, y, atol=0.001)}")
print(f"torch.allclose(x, y, atol=0.001): {torch.allclose(x, y, atol=0.001)}")
```

## Reduction Operations

```python
t = torch.tensor([[1.0, 5.0, 3.0],
                  [4.0, 2.0, 6.0],
                  [7.0, 8.0, 9.0]])
print(f"Tensor:\n{t}")

# ── Sum ──────────────────────────────────────────────────
print(f"sum():       {t.sum():.1f}")          # 45.0
print(f"sum(dim=0):  {t.sum(dim=0)}")         # [12, 15, 18] — sum across rows
print(f"sum(dim=1):  {t.sum(dim=1)}")         # [9, 12, 24] — sum across cols
print(f"sum(dim=-1): {t.sum(dim=-1)}")        # Same as dim=1

# Keep dims (useful for broadcasting later)
print(f"sum(dim=1, keepdim=True): {t.sum(dim=1, keepdim=True).shape}")  # [3, 1]

# ── Mean ─────────────────────────────────────────────────
print(f"mean():      {t.mean():.2f}")         # 5.00
print(f"mean(dim=0): {t.mean(dim=0)}")        # [4.0, 5.0, 6.0]
print(f"mean(dim=1): {t.mean(dim=1)}")        # [3.0, 4.0, 8.0]

# ── Max / Min ────────────────────────────────────────────
print(f"max():   {t.max():.1f}")              # 9.0
print(f"min():   {t.min():.1f}")              # 1.0
print(f"max(dim=0): {t.max(dim=0)}")          # (values=[7, 8, 9], indices=[2, 2, 2])
print(f"min(dim=1): {t.min(dim=1)}")          # (values=[1, 2, 7], indices=[0, 1, 0])

# Unpack values and indices
values, indices = t.max(dim=1)
print(f"Max values: {values}")                 # [5, 6, 9]
print(f"Max indices: {indices}")               # [1, 2, 2]

# ── Argmax / Argmin ──────────────────────────────────────
print(f"argmax():     {t.argmax()}")           # 8 (flattened index)
print(f"argmax(dim=0): {t.argmax(dim=0)}")     # [2, 2, 2]
print(f"argmax(dim=1): {t.argmax(dim=1)}")     # [1, 2, 2]

# ── Other reductions ─────────────────────────────────────
print(f"std():        {t.std():.4f}")          # Standard deviation
print(f"var():        {t.var():.4f}")          # Variance
print(f"median():     {t.median():.1f}")       # Median
print(f"prod():       {t.prod():.0f}")         # Product of all elements
print(f"norm():       {t.norm():.4f}")         # Frobenius norm
print(f"count_nonzero(): {t.count_nonzero()}") # Number of non-zero elements
```

## Random Sampling

```python
import torch

# ── Setting seeds for reproducibility ────────────────────
torch.manual_seed(42)          # CPU seed
torch.cuda.manual_seed(42)     # Current GPU seed
torch.cuda.manual_seed_all(42) # All GPU seeds

# ── Random number generators ─────────────────────────────
# Uniform [0, 1)
r1 = torch.rand(3, 3)
print(f"rand: {r1}")

# Uniform [low, high)
r2 = torch.empty(3, 3).uniform_(0, 10)
print(f"uniform_(0,10): {r2}")

# Normal N(μ=0, σ=1)
r3 = torch.randn(3, 3)
print(f"randn: {r3}")

# Normal N(μ, σ)
r4 = torch.normal(mean=5.0, std=2.0, size=(3, 3))
print(f"normal(5,2): {r4}")

# Random integers
r5 = torch.randint(0, 100, (3, 3))
print(f"randint: {r5}")

# Random permutation
r6 = torch.randperm(10)
print(f"randperm: {r6}")

# ── Sampling from distributions ──────────────────────────
# Bernoulli (coin flip)
probs = torch.full((3, 3), 0.5)
coins = torch.bernoulli(probs)
print(f"Bernoulli: {coins}")

# Multinomial (categorical distribution)
weights = torch.tensor([1.0, 2.0, 3.0, 4.0])
samples = torch.multinomial(weights, num_samples=5, replacement=True)
print(f"Multinomial: {samples}")

# ── Creating a generator for reproducibility ─────────────
g1 = torch.Generator().manual_seed(42)
r7 = torch.rand(3, generator=g1)

g2 = torch.Generator().manual_seed(42)
r8 = torch.rand(3, generator=g2)

print(f"Generator reproducible: {torch.equal(r7, r8)}")  # True
```

## Comprehensive Tensor Operations Reference

### Creation Operations

| Operation | Description | Example |
|-----------|-------------|---------|
| `torch.tensor(data)` | From data (copies) | `torch.tensor([1,2,3])` |
| `torch.as_tensor(data)` | From data (shares memory) | `torch.as_tensor(arr)` |
| `torch.from_numpy(arr)` | From NumPy (shares memory) | `torch.from_numpy(arr)` |
| `torch.zeros(*size)` | All zeros | `torch.zeros(3, 4)` |
| `torch.ones(*size)` | All ones | `torch.ones(3, 4)` |
| `torch.full(size, val)` | All fill value | `torch.full((3,4), 7.0)` |
| `torch.empty(*size)` | Uninitialized | `torch.empty(3, 4)` |
| `torch.arange(start, end, step)` | Range | `torch.arange(0, 10, 2)` |
| `torch.linspace(start, end, steps)` | Evenly spaced | `torch.linspace(0, 1, 5)` |
| `torch.logspace(start, end, steps)` | Log-spaced | `torch.logspace(0, 3, 4)` |
| `torch.eye(n)` | Identity matrix | `torch.eye(4)` |
| `torch.rand(*size)` | Uniform [0,1) | `torch.rand(3, 4)` |
| `torch.randn(*size)` | Normal N(0,1) | `torch.randn(3, 4)` |
| `torch.randint(lo, hi, size)` | Random ints | `torch.randint(0, 10, (3,4))` |

### Shape Operations

| Operation | Description | Example |
|-----------|-------------|---------|
| `.shape` | Get shape | `t.shape` |
| `.ndim` | Get number of dimensions | `t.ndim` |
| `.numel()` | Total number of elements | `t.numel()` |
| `.reshape(*shape)` | Reshape (may copy) | `t.reshape(3, 4)` |
| `.view(*shape)` | Reshape (contiguous only) | `t.view(3, 4)` |
| `.T` | Transpose (2D) | `t.T` |
| `.transpose(d0, d1)` | Swap two dimensions | `t.transpose(0, 1)` |
| `.permute(*dims)` | Reorder all dimensions | `t.permute(2, 0, 1)` |
| `.squeeze(dim)` | Remove size-1 dims | `t.squeeze()` |
| `.unsqueeze(dim)` | Add size-1 dim | `t.unsqueeze(0)` |
| `.flatten(start, end)` | Flatten dims | `t.flatten()` |
| `. contiguous()` | Make contiguous | `t.contiguous()` |

### Reduction Operations

| Operation | Description | Example |
|-----------|-------------|---------|
| `.sum(dim)` | Sum elements | `t.sum(dim=0)` |
| `.mean(dim)` | Mean of elements | `t.mean(dim=1)` |
| `.std(dim)` | Standard deviation | `t.std(dim=0)` |
| `.var(dim)` | Variance | `t.var(dim=0)` |
| `.max(dim)` | Max value + index | `t.max(dim=1)` |
| `.min(dim)` | Min value + index | `t.min(dim=1)` |
| `.argmax(dim)` | Index of max | `t.argmax(dim=0)` |
| `.argmin(dim)` | Index of min | `t.argmin(dim=0)` |
| `.median()` | Median value | `t.median()` |
| `.norm()` | Frobenius norm | `t.norm()` |
| `.prod(dim)` | Product of elements | `t.prod(dim=0)` |
| `.any()` | Any True? | `t.any()` |
| `.all()` | All True? | `t.all()` |

### Indexing Operations

| Operation | Description | Example |
|-----------|-------------|---------|
| `t[i]` | Index dim 0 | `t[0]` |
| `t[i, j]` | Index dims 0,1 | `t[0, 1]` |
| `t[i:j]` | Slice dim 0 | `t[1:3]` |
| `t[:, i]` | Slice all, index dim 1 | `t[:, 0]` |
| `t[mask]` | Boolean mask indexing | `t[t > 0]` |
| `t.index_select(dim, idx)` | Select along dim | `t.index_select(0, idx)` |
| `t.masked_select(mask)` | Select by mask | `t.masked_select(t > 0)` |
| `t.nonzero()` | Indices of non-zero | `t.nonzero()` |
| `torch.where(cond, a, b)` | Conditional select | `torch.where(t > 0, t, 0)` |

### Type Operations

| Operation | Description | Example |
|-----------|-------------|---------|
| `.dtype` | Get dtype | `t.dtype` |
| `.float()` | Cast to float32 | `t.float()` |
| `.double()` | Cast to float64 | `t.double()` |
| `.half()` | Cast to float16 | `t.half()` |
| `.bfloat16()` | Cast to bfloat16 | `t.bfloat16()` |
| `.int()` | Cast to int32 | `t.int()` |
| `.long()` | Cast to int64 | `t.long()` |
| `.bool()` | Cast to bool | `t.bool()` |
| `.to(dtype)` | Cast to specified dtype | `t.to(torch.float16)` |
| `.numpy()` | To NumPy (CPU only) | `t.numpy()` |

## Summary

In this chapter, we covered:

1. **What tensors are**: Multi-dimensional arrays — the fundamental data structure of PyTorch
2. **Creation methods**: `torch.tensor`, `torch.zeros`, `torch.ones`, `torch.arange`, `torch.linspace`, `torch.rand`, `torch.randn`, `from_numpy`, and more
3. **Data types**: float32, float64, float16, bfloat16, int types, bool, complex — and when to use each
4. **Type casting**: `.float()`, `.to(dtype)`, `.half()`, `.bfloat16()` for mixed precision
5. **Shape manipulation**: `reshape`, `view`, `transpose`, `permute`, `squeeze`, `unsqueeze`, `cat`, `stack`
6. **Indexing and slicing**: Basic, advanced, and boolean masking for data selection
7. **Arithmetic operations**: Element-wise math, matrix multiplication (`@`, `torch.mm`, `torch.bmm`, `torch.matmul`)
8. **Broadcasting rules**: How PyTorch handles operations on different-shaped tensors
9. **In-place operations**: Trailing underscore methods — efficient but dangerous with autograd
10. **GPU tensors**: Moving to devices, memory management, pinning memory
11. **Comparison and reduction operations**: Full reference of comparison and aggregation methods
12. **Random sampling**: Seeds, distributions, reproducibility

## Practice Exercises

### Exercise 1: Tensor Creation

Create tensors matching these specifications without looking at the chapter:
1. A 5x5 matrix of random integers from 0 to 99
2. A 3D tensor of shape (2, 4, 6) filled with values from 0 to 47
3. A 4x4 identity matrix of type `float16`
4. A tensor of 100 evenly-spaced values from -π to π
5. A tensor of shape (3, 3) where all values are 7.0, using two different methods

### Exercise 2: Reshaping Challenge

```python
# Starting from:
t = torch.arange(48)
# Produce these shapes (in order):
# [48], [6, 8], [8, 6], [2, 3, 8], [2, 8, 3], [2, 3, 2, 4], [48, 1], [1, 48]
```

### Exercise 3: Broadcasting Practice

Predict the output shape of each operation (then verify):
1. `torch.randn(3, 4) + torch.randn(4)`
2. `torch.randn(5, 1, 3) + torch.randn(1, 4, 3)`
3. `torch.randn(2, 3, 1) + torch.randn(4,)`
4. `torch.randn(8, 1, 6, 1) + torch.randn(7, 1, 5)`
5. `torch.randn(3, 1) * torch.randn(1, 5)`

### Exercise 4: Indexing & Masking

Given: `t = torch.arange(20).reshape(4, 5)`

Write expressions to:
1. Extract the third row
2. Extract the second column
3. Extract the top-left 2x2 sub-matrix
4. Extract all elements greater than 10
5. Set all elements less than 5 to 0
6. Select elements at positions `[0,1]`, `[2,3]`, `[1,4]` using advanced indexing

### Exercise 5: GPU Benchmark

Write a script that:
1. Creates a function that performs 100 iterations of matrix multiplication
2. Times it on CPU
3. Times it on GPU (if available) using CUDA events for precise timing
4. Reports the speedup factor
5. Profiles memory usage on both devices

### Exercise 6: Reduction Exploration

Given: `t = torch.randn(3, 4, 5, 6)`

1. Compute the sum across each individual dimension (dim 0, 1, 2, 3) and print the output shape
2. Compute the mean and standard deviation across the last two dimensions simultaneously
3. Find the index of the maximum value across dim=1, keeping the dimension
4. Compute the L2 norm of each "row" (dim=2 flattened with dim=3)

---

*In the next chapter, we'll explore autograd — PyTorch's automatic differentiation engine that powers all neural network training. You'll learn how computation graphs are built, how gradients flow, and how to leverage autograd for custom operations.*
