# Chapter 6: Convolutional Neural Networks

**By Manjunath Kalburgi**

---

## Introduction

Convolutional Neural Networks (CNNs) are the backbone of computer vision. From medical imaging and autonomous driving to face recognition and augmented reality, CNNs have achieved superhuman performance on a wide range of visual tasks. Their key insight is simple but powerful: instead of treating an image as a flat vector, a CNN processes it as a 2D grid of pixels, sharing filters across spatial locations to detect local patterns — edges, textures, shapes — and then composing those patterns into increasingly abstract representations.

Before CNNs, image classifiers treated each pixel as an independent feature, ignoring the spatial structure that makes a "cat" different from random noise. CNNs exploit spatial locality and translational equivariance, making them both more accurate and far more parameter-efficient than fully connected networks applied to images.

In this chapter, we will:

1. Understand the mathematics of convolution and pooling operations
2. Learn how to build CNNs with `nn.Conv2d`, `nn.MaxPool2d`, and related layers
3. Study classic and modern CNN architectures (LeNet, VGG, ResNet)
4. Master transfer learning for practical image classification
5. Implement data augmentation techniques that improve generalization
6. Apply training tricks — learning rate schedules, weight decay, label smoothing — to maximize performance
7. Build a complete image classification project from data loading to deployment

---

## 1. The Convolution Operation

### 1.1 What Is a Convolution?

A convolution slides a small learnable filter (kernel) over the input, computing a dot product at each spatial position. Each filter detects a specific pattern — a vertical edge, a corner, a color gradient — and produces a 2D feature map (activation map) that highlights where that pattern appears.

```
Input (5×5):                   Filter (3×3):               Output (3×3):
┌─────────────────────┐       ┌──────────────┐            ┌──────────────┐
│ 1  0  1  0  1       │       │  1  0  1     │            │  4  3  4     │
│ 0  1  0  1  0       │   *   │  0  1  0     │    =       │  2  4  3     │
│ 1  0  1  0  1       │       │  1  0  1     │            │  4  3  4     │
│ 0  1  0  1  0       │       └──────────────┘            └──────────────┘
│ 1  0  1  0  1       │
└─────────────────────┘

Output[0,0] = 1·1 + 0·0 + 1·1 + 0·0 + 1·1 + 0·0 + 1·1 + 0·0 + 1·1 = 4
```

### 1.2 Key Terminology

| Term | Definition | Example |
|------|-----------|---------|
| **Kernel / Filter** | Small learnable weight matrix | 3×3, 5×5 |
| **Stride** | Step size when sliding the kernel | stride=1 (default), stride=2 (halves output) |
| **Padding** | Added border pixels around the input | padding=0 (none), padding=1 (zero-pad) |
| **Receptive Field** | Region of the input that affects one output pixel | 3×3 kernel → 3×3 receptive field |
| **Feature Map** | 2D output from a single filter applied to input | One per filter in a Conv2d layer |
| **Channels** | Depth dimension (input channels = filters in previous layer) | RGB = 3 channels |

### 1.3 Output Size Formula

The spatial dimensions of the output are determined by:

```
Output_size = floor((Input_size - Kernel_size + 2 × Padding) / Stride) + 1
```

| Input | Kernel | Stride | Padding | Output |
|-------|--------|--------|---------|--------|
| 32 | 3 | 1 | 0 | 30 |
| 32 | 3 | 1 | 1 | 32 |
| 32 | 3 | 2 | 1 | 16 |
| 32 | 5 | 1 | 0 | 28 |
| 32 | 5 | 2 | 2 | 16 |

**With padding=1 and kernel=3, the output size equals the input size** — this "same" padding is the most common configuration in modern architectures.

### 1.4 PyTorch Conv2d

`nn.Conv2d` is the core building block:

```python
import torch
import torch.nn as nn

# Create a convolutional layer
conv = nn.Conv2d(
    in_channels=3,    # RGB input (3 channels)
    out_channels=16,  # 16 learnable filters
    kernel_size=3,    # 3×3 kernel
    stride=1,         # slide one pixel at a time
    padding=1,        # zero-pad to preserve spatial size
)

# Input: batch of 4 RGB images, each 32×32
x = torch.randn(4, 3, 32, 32)   # (batch, channels, height, width)
output = conv(x)
print(output.shape)               # torch.Size([4, 16, 32, 32])

# Number of parameters: (3 × 3 × 3 × 16) + 16 = 448 + 16 = 464
total_params = sum(p.numel() for p in conv.parameters())
print(f"Parameters: {total_params}")  # 464
```

**Parameter count for Conv2d:**

```
Parameters = (in_channels × kernel_h × kernel_w × out_channels) + out_channels
                                     biases
```

| in_channels | kernel | out_channels | Parameters |
|-------------|--------|-------------|-----------|
| 3 | 3×3 | 16 | 3×9×16 + 16 = 448 |
| 16 | 3×3 | 32 | 16×9×32 + 32 = 4,640 |
| 32 | 3×3 | 64 | 32×9×64 + 64 = 18,496 |
| 64 | 1×1 | 128 | 64×1×128 + 128 = 8,320 |

### 1.5 Multi-Channel Convolution

When the input has multiple channels (e.g., RGB = 3), the filter has the same depth. A single output channel is produced by summing across all input channels:

```
Input: (3, H, W)           Filter: (3, K, K)         Output: (1, H', W')
┌───────────┐              ┌───────────┐              ┌───────────┐
│  R  (H×W) │──┐           │  f_R (K×K)│──┐           │           │
│  G  (H×W) │──┼── SUM ──▶│  f_G (K×K)│──┼── SUM ──▶│ feature   │
│  B  (H×W) │──┘           │  f_B (K×K)│──┘           │   map     │
└───────────┘              └───────────┘              └───────────┘

To get multiple output channels, use multiple filters:
Filter bank: (out_channels, in_channels, K, K)
Output: (out_channels, H', W')
```

---

## 2. Pooling and Activation

### 2.1 Pooling Layers

Pooling downsamples feature maps, reducing spatial dimensions and providing translation invariance. It introduces a form of spatial summarization that makes the network robust to small shifts in the input.

```
Max Pooling (2×2, stride=2):

Input (4×4):                         Output (2×2):
┌───────────────────────┐             ┌─────────────┐
│  1  3  2  4           │             │  3     4     │
│  5  6  1  2    ──▶    │    max      │             │
│  3  2  8  7           │             │  3     9     │
│  1  0  4  9           │             └─────────────┘
└───────────────────────┘

Average Pooling (2×2, stride=2):
Input (4×4):                         Output (2×2):
┌───────────────────────┐             ┌─────────────┐
│  1  3  2  4           │             │  3.25  2.25 │
│  5  6  1  2    ──▶    │    avg      │             │
│  3  2  8  7           │             │  1.50  7.00 │
│  1  0  4  9           │             └─────────────┘
└───────────────────────┘
```

```python
import torch
import torch.nn as nn

# Max Pooling
max_pool = nn.MaxPool2d(kernel_size=2, stride=2)  # halves spatial dims

x = torch.tensor([[[[1., 3., 2., 4.],
                     [5., 6., 1., 2.],
                     [3., 2., 8., 7.],
                     [1., 0., 4., 9.]]]])

pooled = max_pool(x)
print(pooled.shape)  # torch.Size([1, 1, 2, 2])
print(pooled)        # tensor([[[[3., 4.],
                      #           [3., 9.]]]])

# Adaptive Pooling — specify output size regardless of input size
adaptive_pool = nn.AdaptiveAvgPool2d(output_size=(1, 1))  # Global Average Pooling
output = adaptive_pool(torch.randn(8, 512, 7, 7))
print(output.shape)  # torch.Size([8, 512, 1, 1])
```

### 2.2 Pooling Comparison

| Layer | Preserves Spatial Info? | Trainable Params | Common Use |
|-------|------------------------|-----------------|------------|
| `MaxPool2d` | Partially (selects max) | 0 | Between conv blocks |
| `AvgPool2d` | Partially (averages) | 0 | Between conv blocks |
| `AdaptiveAvgPool2d` | Summary only | 0 | Before classifier head |
| `AdaptiveMaxPool2d` | Summary only | 0 | Before classifier head |
| `nn.Flatten()` | N/A (reshapes) | 0 | Between pool and linear |

### 2.3 Activation Functions

CNNs almost universally use ReLU (or its variants) as the activation function between conv layers:

```python
# Standard ReLU
relu = nn.ReLU(inplace=True)  # inplace saves memory

# Leaky ReLU — allows small negative slope
leaky_relu = nn.LeakyReLU(negative_slope=0.01)

# GELU — used in modern architectures (Transformers, EfficientNet)
gelu = nn.GELU()

# SiLU / Swish — used in EfficientNet
silu = nn.SiLU()
```

| Activation | Formula | Pros | Used In |
|-----------|---------|------|---------|
| ReLU | max(0, x) | Fast, simple, no vanishing gradient for positive | Most CNNs |
| Leaky ReLU | max(0.01x, x) | Avoids "dying ReLU" | GANs, some CNNs |
| GELU | x · Φ(x) | Smooth, better gradients | Transformers, EfficientNet |
| SiLU/Swish | x · σ(x) | Smooth, self-gated | EfficientNet, modern CNNs |

---

## 3. Building a CNN from Scratch

### 3.1 Architecture Pattern

Modern CNNs follow a consistent pattern:

```
┌──────────────────────────────────────────────────────────┐
│                    CNN ARCHITECTURE                        │
│                                                            │
│  INPUT IMAGE (C, H, W)                                     │
│       │                                                    │
│       ▼                                                    │
│  ┌─────────────────────────────┐                           │
│  │  CONV BLOCK × N             │  Feature extraction       │
│  │  ┌───────────────────────┐  │                           │
│  │  │ Conv2d → BN → ReLU   │  │  ↓ spatial dims           │
│  │  │ [Conv2d → BN → ReLU] │  │  ↑ channels               │
│  │  │ MaxPool2d / stride=2  │  │                           │
│  │  └───────────────────────┘  │                           │
│  └─────────────┬───────────────┘                           │
│                │                                            │
│                ▼                                            │
│  ┌─────────────────────────────┐                           │
│  │  GLOBAL AVERAGE POOL        │  (N, C, H, W) → (N, C)  │
│  └─────────────┬───────────────┘                           │
│                │                                            │
│                ▼                                            │
│  ┌─────────────────────────────┐                           │
│  │  CLASSIFIER HEAD            │  Classification           │
│  │  Linear → ReLU → Dropout   │                           │
│  │  Linear                     │                           │
│  └─────────────────────────────┘                           │
│                                                            │
│  OUTPUT LOGITS (N, num_classes)                            │
└──────────────────────────────────────────────────────────┘
```

### 3.2 Simple CNN for CIFAR-10

```python
import torch
import torch.nn as nn

class SimpleCNN(nn.Module):
    """A simple CNN for CIFAR-10 classification.

    Architecture:
        Conv(3→32) → BN → ReLU → Conv(32→32) → BN → ReLU → MaxPool → Dropout
        Conv(32→64) → BN → ReLU → Conv(64→64) → BN → ReLU → MaxPool → Dropout
        Conv(64→128) → BN → ReLU → Conv(128→128) → BN → ReLU → MaxPool → Dropout
        Global AvgPool → Linear(128→10)

    Input: (batch, 3, 32, 32)
    Output: (batch, 10)
    """

    def __init__(self, num_classes=10, dropout=0.3):
        super().__init__()

        self.features = nn.Sequential(
            # Block 1: 32×32 → 16×16
            nn.Conv2d(3, 32, kernel_size=3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(inplace=True),
            nn.Conv2d(32, 32, kernel_size=3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2),
            nn.Dropout2d(dropout),

            # Block 2: 16×16 → 8×8
            nn.Conv2d(32, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
            nn.Conv2d(64, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2),
            nn.Dropout2d(dropout),

            # Block 3: 8×8 → 4×4
            nn.Conv2d(64, 128, kernel_size=3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(inplace=True),
            nn.Conv2d(128, 128, kernel_size=3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2),
            nn.Dropout2d(dropout),
        )

        self.classifier = nn.Sequential(
            nn.AdaptiveAvgPool2d(1),         # (N, 128, 4, 4) → (N, 128, 1, 1)
            nn.Flatten(),                     # (N, 128, 1, 1) → (N, 128)
            nn.Linear(128, num_classes),
        )

    def forward(self, x):
        x = self.features(x)
        x = self.classifier(x)
        return x


# Verify
model = SimpleCNN(num_classes=10)
x = torch.randn(4, 3, 32, 32)
print(f"Output shape: {model(x).shape}")      # torch.Size([4, 10])
total_params = sum(p.numel() for p in model.parameters())
print(f"Total parameters: {total_params:,}")  # ~370K
```

### 3.3 Design Principles

| Principle | Rationale |
|-----------|----------|
| Double conv per block | Two 3×3 convs have same receptive field as 5×5, but with fewer params and more non-linearity |
| BN after every conv | Stabilizes training, allows higher learning rates, acts as mild regularizer |
| Pooling to downsample | Reduces spatial dims, increases receptive field, saves compute |
| Dropout2d not Dropout | Drops entire channels, not individual neurons — better for spatial features |
| Global Average Pooling | No learnable parameters, prevents overfitting, works with any spatial size |
| Channels double with pool | When spatial dims halve, channels double — keeps representational capacity constant |

---

## 4. Classic and Modern CNN Architectures

### 4.1 Architecture Evolution

```
Timeline of CNN Architectures:

1998        2012        2014        2015        2015        2017        2019
 │           │           │           │           │           │           │
 ▼           ▼           ▼           ▼           ▼           ▼           ▼
LeNet    → AlexNet  → VGGNet   → GoogLeNet→ ResNet   → EfficientNet→ ConvNeXt
 5 layers   8 layers   19 layers  22 layers   152 layers  compound     ConvNet
                                                                 scaling
```

### 4.2 Architecture Comparison

| Architecture | Year | Depth | Top-5 Error | Key Innovation | Params |
|-------------|------|-------|------------|---------------|--------|
| LeNet-5 | 1998 | 5 | N/A | First practical CNN | 60K |
| AlexNet | 2012 | 8 | 16.4% | ReLU, Dropout, GPU training | 60M |
| VGG-16 | 2014 | 16 | 7.3% | All 3×3 convolutions | 138M |
| GoogLeNet | 2014 | 22 | 6.7% | Inception modules | 6.8M |
| ResNet-50 | 2015 | 50 | 3.6% | Skip connections (residual) | 25.6M |
| ResNet-152 | 2015 | 152 | 3.6% | Deep residual network | 60.2M |
| EfficientNet-B0 | 2019 | — | 3.0% | Compound scaling | 5.3M |
| ConvNeXt-B | 2022 | 50 | 2.8% | Modernized ConvNet | 89M |

### 4.3 VGG-16 Style Architecture

The VGG family demonstrated that depth matters — stacking many 3×3 convolutions with padding=1 and 2×2 max pooling:

```python
def make_vgg_block(in_channels, out_channels, num_convs):
    """Create a VGG-style block with num_convs Conv-BN-ReLU layers + MaxPool."""
    layers = []
    for i in range(num_convs):
        layers.extend([
            nn.Conv2d(in_channels if i == 0 else out_channels,
                      out_channels, kernel_size=3, padding=1),
            nn.BatchNorm2d(out_channels),
            nn.ReLU(inplace=True),
        ])
    layers.append(nn.MaxPool2d(2, 2))
    return nn.Sequential(*layers)


class MiniVGG(nn.Module):
    """Simplified VGG-style network for CIFAR-10."""

    def __init__(self, num_classes=10):
        super().__init__()
        self.features = nn.Sequential(
            make_vgg_block(3, 64, 2),      # 32→16
            make_vgg_block(64, 128, 2),     # 16→8
            make_vgg_block(128, 256, 3),    # 8→4
        )
        self.classifier = nn.Sequential(
            nn.AdaptiveAvgPool2d(1),
            nn.Flatten(),
            nn.Linear(256, 256),
            nn.ReLU(inplace=True),
            nn.Dropout(0.5),
            nn.Linear(256, num_classes),
        )

    def forward(self, x):
        x = self.features(x)
        x = self.classifier(x)
        return x
```

### 4.4 ResNet — Skip Connections

The key innovation of ResNet is the **residual connection**: instead of learning a direct mapping `H(x)`, the network learns the residual `F(x) = H(x) - x`, making the output `F(x) + x`. This allows gradients to flow directly through the skip connection, enabling training of networks with hundreds of layers.

```
Standard Block:              Residual Block:
    x                           x
    │                           │
    ▼                           ├──────────────┐
  Conv → BN → ReLU              ▼              │
    │                      Conv → BN → ReLU    │
    ▼                           │              │
  Conv → BN                     ▼              │
    │                      Conv → BN           │
    ▼                           │              │
  ReLU                    ──▶ + ◀──────────────┘
    │                           │
    ▼                           ▼
  H(x) = F(x)             F(x) + x  (element-wise addition)

  Problem: H(x) must learn the full mapping    Solution: F(x) only needs to learn the
  including the identity. Deep nets             difference from identity. If optimal
  become harder to train as depth increases.     mapping ≈ identity, F(x) ≈ 0 is easy.
```

**Why skip connections work:**

```
Gradient flow through a residual block (L layers):

Without skip:    ∂Loss/∂x = ∂Loss/∂h_L · ∂h_L/∂h_{L-1} · ... · ∂h_1/∂x
                 (product of L Jacobians — vanishing/exploding gradients)

With skip:       ∂Loss/∂x = ∂Loss/∂h_L · (I + ∂F_L/∂x) · (I + ∂F_{L-1}/∂x) · ...
                 (gradient always has a direct path through identity)
```

```python
class ResidualBlock(nn.Module):
    """Basic residual block: Conv→BN→ReLU→Conv→BN + skip connection."""

    def __init__(self, channels, dropout=0.1):
        super().__init__()
        self.block = nn.Sequential(
            nn.Conv2d(channels, channels, 3, padding=1, bias=False),
            nn.BatchNorm2d(channels),
            nn.ReLU(inplace=True),
            nn.Dropout2d(dropout),
            nn.Conv2d(channels, channels, 3, padding=1, bias=False),
            nn.BatchNorm2d(channels),
        )
        self.relu = nn.ReLU(inplace=True)

    def forward(self, x):
        return self.relu(self.block(x) + x)  # residual addition


class ResNetBlock(nn.Module):
    """Residual block with projection for channel matching."""

    def __init__(self, in_channels, out_channels, stride=1, dropout=0.1):
        super().__init__()
        self.conv1 = nn.Conv2d(in_channels, out_channels, 3,
                               stride=stride, padding=1, bias=False)
        self.bn1 = nn.BatchNorm2d(out_channels)
        self.conv2 = nn.Conv2d(out_channels, out_channels, 3,
                               padding=1, bias=False)
        self.bn2 = nn.BatchNorm2d(out_channels)
        self.relu = nn.ReLU(inplace=True)

        # Projection shortcut when dimensions change
        self.shortcut = nn.Identity()
        if stride != 1 or in_channels != out_channels:
            self.shortcut = nn.Sequential(
                nn.Conv2d(in_channels, out_channels, 1,
                          stride=stride, bias=False),
                nn.BatchNorm2d(out_channels),
            )

    def forward(self, x):
        out = self.relu(self.bn1(self.conv1(x)))
        out = self.bn2(self.conv2(out))
        out += self.shortcut(x)  # residual addition
        return self.relu(out)
```

### 4.5 Building ResNet-18 for CIFAR-10

```python
class CIFARResNet(nn.Module):
    """ResNet-18 adapted for CIFAR-10 (32×32 images)."""

    def __init__(self, num_classes=10):
        super().__init__()

        # Smaller initial conv for 32×32 images (not 224×224)
        self.stem = nn.Sequential(
            nn.Conv2d(3, 64, 3, stride=1, padding=1, bias=False),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
        )

        # 4 stages, each with 2 residual blocks
        self.stage1 = self._make_stage(64, 64, num_blocks=2, stride=1)
        self.stage2 = self._make_stage(64, 128, num_blocks=2, stride=2)
        self.stage3 = self._make_stage(128, 256, num_blocks=2, stride=2)
        self.stage4 = self._make_stage(256, 512, num_blocks=2, stride=2)

        self.avgpool = nn.AdaptiveAvgPool2d(1)
        self.fc = nn.Linear(512, num_classes)

    def _make_stage(self, in_ch, out_ch, num_blocks, stride):
        layers = [ResNetBlock(in_ch, out_ch, stride)]
        for _ in range(1, num_blocks):
            layers.append(ResNetBlock(out_ch, out_ch, 1))
        return nn.Sequential(*layers)

    def forward(self, x):
        x = self.stem(x)            # (N, 64, 32, 32)
        x = self.stage1(x)          # (N, 64, 32, 32)
        x = self.stage2(x)          # (N, 128, 16, 16)
        x = self.stage3(x)          # (N, 256, 8, 8)
        x = self.stage4(x)          # (N, 512, 4, 4)
        x = self.avgpool(x)         # (N, 512, 1, 1)
        x = x.view(x.size(0), -1)   # (N, 512)
        x = self.fc(x)              # (N, 10)
        return x


model = CIFARResNet(num_classes=10)
x = torch.randn(2, 3, 32, 32)
print(f"Output: {model(x).shape}")              # torch.Size([2, 10])
print(f"Parameters: {sum(p.numel() for p in model.parameters()):,}")  # ~5.5M
```

### 4.6 Feature Map Visualization (Architecture Summary)

```
CIFARResNet forward pass — spatial dimensions and channel depth:

Input:    (N, 3,  32, 32)   ─── raw RGB image
Stage 1:  (N, 64, 32, 32)   ─── low-level features (edges, textures)
Stage 2:  (N, 128, 16, 16)  ─── mid-level features (corners, patterns)
Stage 3:  (N, 256, 8, 8)    ─── high-level features (parts, shapes)
Stage 4:  (N, 512, 4, 4)    ─── semantic features (object-level)
AvgPool:  (N, 512, 1, 1)    ─── global representation
Linear:   (N, 10)            ─── class logits

Spatial dims shrink:  32 → 32 → 16 → 8 → 4 → 1
Channel depth grows:   3 → 64 → 128 → 256 → 512 → 10
```

---

## 5. Transfer Learning

### 5.1 Why Transfer Learning?

Training a CNN from scratch requires massive datasets (millions of images) and expensive compute. Transfer learning reuses a model pre-trained on a large dataset (typically ImageNet — 1.2M images, 1000 classes) and adapts it to a new task. The pre-trained model already understands edges, textures, shapes, and object parts — we only need to teach it to combine these features for our specific task.

```
┌──────────────────────────────────────────────────────────────────┐
│                    TRANSFER LEARNING STRATEGIES                   │
│                                                                    │
│  Strategy 1: FEATURE EXTRACTION (small dataset)                    │
│  ┌─────────────────────────────────────────┐                      │
│  │  Pre-trained backbone (frozen)           │                      │
│  │  ┌──────────────────────────────────┐   │                      │
│  │  │  Conv layers → feature maps      │   │  ← frozen (no grad) │
│  │  └──────────────┬───────────────────┘   │                      │
│  │                 │                        │                      │
│  │  ┌──────────────▼───────────────────┐   │                      │
│  │  │  New classifier head (trainable) │   │  ← only this trains │
│  │  │  Linear → ReLU → Dropout → Linear│   │                      │
│  │  └──────────────────────────────────┘   │                      │
│  └─────────────────────────────────────────┘                      │
│                                                                    │
│  Strategy 2: FINE-TUNING (medium/large dataset)                    │
│  ┌─────────────────────────────────────────┐                      │
│  │  Pre-trained backbone (unfrozen)         │                      │
│  │  ┌──────────────────────────────────┐   │                      │
│  │  │  Conv layers → feature maps      │   │  ← all params train │
│  │  └──────────────┬───────────────────┘   │     (small LR)       │
│  │                 │                        │                      │
│  │  ┌──────────────▼───────────────────┐   │                      │
│  │  │  New classifier head (trainable) │   │  ← higher LR         │
│  │  │  Linear → ReLU → Dropout → Linear│   │                      │
│  │  └──────────────────────────────────┘   │                      │
│  └─────────────────────────────────────────┘                      │
└──────────────────────────────────────────────────────────────────┘
```

### 5.2 Loading a Pre-trained Model

```python
import torch
import torch.nn as nn
import torchvision.models as models

# Load pre-trained ResNet-18 (ImageNet weights)
model = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)

# Inspect the architecture
print(model)
# ResNet(
#   (conv1): Conv2d(3, 64, kernel_size=7, stride=2, padding=3, bias=False)
#   (bn1): BatchNorm2d(64, ...)
#   (relu): ReLU(inplace=True)
#   (maxpool): MaxPool2d(kernel_size=3, stride=2, padding=1)
#   (layer1): Sequential(...)
#   (layer2): Sequential(...)
#   (layer3): Sequential(...)
#   (layer4): Sequential(...)
#   (avgpool): AdaptiveAvgPool2d(output_size=(1, 1))
#   (fc): Linear(in_features=512, out_features=1000)
# )
```

### 5.3 Strategy 1: Feature Extraction

Freeze all layers, replace only the final classifier:

```python
import torch
import torch.nn as nn
import torchvision.models as models


def create_feature_extractor(num_classes, freeze_backbone=True):
    """Create a transfer learning model using feature extraction."""
    model = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)

    # Freeze all backbone parameters
    if freeze_backbone:
        for param in model.parameters():
            param.requires_grad = False

    # Replace the final fully connected layer
    in_features = model.fc.in_features  # 512 for ResNet-18
    model.fc = nn.Sequential(
        nn.Dropout(0.3),
        nn.Linear(in_features, num_classes),
    )

    # Count trainable vs total
    total = sum(p.numel() for p in model.parameters())
    trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
    print(f"Total params:     {total:,}")
    print(f"Trainable params: {trainable:,} ({trainable/total:.1%})")

    return model


# 10-class classification
model = create_feature_extractor(num_classes=10, freeze_backbone=True)
# Total params:     11,179,018
# Trainable params: 5,130 (0.05%)
```

### 5.4 Strategy 2: Fine-Tuning with Discriminative Learning Rates

```python
def create_finetune_model(num_classes):
    """Create a fine-tuning model with discriminative learning rates."""
    model = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)

    # Replace classifier head
    model.fc = nn.Sequential(
        nn.Dropout(0.3),
        nn.Linear(512, num_classes),
    )

    return model


def get_param_groups(model, base_lr=1e-4, head_lr=1e-3):
    """Separate parameter groups with different learning rates.

    - Backbone: trained with lower LR (pre-trained features are already good)
    - Classifier head: trained with higher LR (randomly initialized)
    """
    backbone_params = []
    head_params = []

    for name, param in model.named_parameters():
        if "fc" in name:
            head_params.append(param)
        else:
            backbone_params.append(param)

    return [
        {"params": backbone_params, "lr": base_lr},
        {"params": head_params, "lr": head_lr},
    ]


model = create_finetune_model(num_classes=10)
optimizer = torch.optim.AdamW(
    get_param_groups(model, base_lr=1e-4, head_lr=1e-3),
    weight_decay=1e-4,
)
```

### 5.5 Transfer Learning Decision Guide

| Dataset Size | Task Similarity | Recommended Strategy |
|-------------|----------------|---------------------|
| Small (< 1K) | High (same domain) | Feature extraction, freeze backbone |
| Small (< 1K) | Low (different domain) | Feature extraction + data augmentation |
| Medium (1K–100K) | High | Fine-tune with discriminative LR |
| Medium (1K–100K) | Low | Fine-tune last 2 blocks + head |
| Large (> 100K) | Any | Fine-tune all layers, low LR |

### 5.6 Loading Pre-trained Weights from PyTorch Hub

```python
import torchvision.models as models

# Available ResNet variants
resnet18 = models.resnet18(weights="DEFAULT")   # 11.7M params
resnet34 = models.resnet34(weights="DEFAULT")   # 21.8M params
resnet50 = models.resnet50(weights="DEFAULT")   # 25.6M params

# Available EfficientNet variants
efficientnet_b0 = models.efficientnet_b0(weights="DEFAULT")  # 5.3M params
efficientnet_b4 = models.efficientnet_b4(weights="DEFAULT")  # 19.3M params

# Get the transform used during pre-training
weights = models.ResNet18_Weights.DEFAULT
preprocess = weights.transforms()
print(preprocess)
# ImageClassification(
#     crop_size=224, resize_size=256,
#     mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]
# )
```

---

## 6. Data Augmentation

### 6.1 Why Augmentation?

Data augmentation artificially expands the training set by applying label-preserving transformations to images. This is one of the most effective regularization techniques for CNNs — it teaches the model to recognize objects regardless of position, orientation, lighting, and minor distortions.

```
Original Image         Augmented Variations
┌──────────┐         ┌──────────┐ ┌──────────┐ ┌──────────┐
│  🐱       │   ──▶   │  🐱 flip │ │ 🐱 crop  │ │  🐱 rot  │
│  (cat)    │         │  (cat)   │ │  (cat)   │ │  (cat)   │
└──────────┘         └──────────┘ └──────────┘ └──────────┘
                     horizontal  random crop   ±15° rotation
                     flip        + resize      color jitter
```

### 6.2 torchvision Transforms

```python
import torchvision.transforms as T

# ── Training Augmentation Pipeline ──
train_transform = T.Compose([
    T.RandomHorizontalFlip(p=0.5),              # 50% chance of horizontal flip
    T.RandomCrop(32, padding=4),                 # pad 4px, then random crop to 32×32
    T.ColorJitter(brightness=0.2,                # brightness ±20%
                  contrast=0.2,                  # contrast ±20%
                  saturation=0.2,                # saturation ±20%
                  hue=0.1),                      # hue ±10%
    T.RandomRotation(15),                        # rotation ±15 degrees
    T.ToTensor(),                                # PIL → Tensor [0, 1]
    T.Normalize(mean=[0.4914, 0.4822, 0.4465],   # CIFAR-10 statistics
                std=[0.2023, 0.1994, 0.2010]),
    T.RandomErasing(p=0.25, scale=(0.02, 0.15)),  # Cutout-like
])

# ── Validation / Test Transform (NO augmentation) ──
val_transform = T.Compose([
    T.ToTensor(),
    T.Normalize(mean=[0.4914, 0.4822, 0.4465],
                std=[0.2023, 0.1994, 0.2010]),
])
```

### 6.3 Augmentation Techniques Reference

| Technique | What It Does | Hyperparameter | Typical Value |
|-----------|-------------|----------------|---------------|
| `RandomHorizontalFlip` | Mirror image horizontally | p | 0.5 |
| `RandomVerticalFlip` | Mirror image vertically | p | 0.1–0.3 |
| `RandomCrop` | Random crop from padded image | padding | 4 (for 32×32) |
| `RandomResizedCrop` | Crop + resize to target size | scale, ratio | (0.8, 1.0) |
| `ColorJitter` | Random brightness/contrast/saturation/hue | brightness, contrast | 0.2, 0.2 |
| `RandomRotation` | Random rotation within range | degrees | ±15° |
| `RandomAffine` | Translation, rotation, scale, shear | degrees, translate | 10°, 0.1 |
| `GaussianBlur` | Apply random Gaussian blur | kernel_size, sigma | 3, (0.1, 2.0) |
| `RandomGrayscale` | Convert to grayscale randomly | p | 0.1–0.2 |
| `RandomErasing` | Random rectangular cutout | p, scale | 0.25, (0.02, 0.15) |

### 6.4 Advanced Augmentation: CutMix and Mixup

```python
import torch
import numpy as np


def cutmix(x, y, alpha=1.0):
    """CutMix: cut a patch from one image, paste it on another.

    Both images contribute to the loss proportional to the area ratio.
    """
    batch_size = x.size(0)
    indices = torch.randperm(batch_size)

    # Random bounding box
    lam = np.random.beta(alpha, alpha)
    h, w = x.size(2), x.size(3)
    cut_ratio = np.sqrt(1.0 - lam)
    cut_h = int(h * cut_ratio)
    cut_w = int(w * cut_ratio)

    cx, cy = np.random.randint(w), np.random.randint(h)
    x1 = max(cx - cut_w // 2, 0)
    y1 = max(cy - cut_h // 2, 0)
    x2 = min(cx + cut_w // 2, w)
    y2 = min(cy + cut_h // 2, h)

    # Paste patch
    x_mixed = x.clone()
    x_mixed[:, :, y1:y2, x1:x2] = x[indices, :, y1:y2, x1:x2]

    # Adjust lambda by actual area ratio
    lam = 1 - (x2 - x1) * (y2 - y1) / (h * w)

    return x_mixed, y, y[indices], lam


def mixup(x, y, alpha=0.2):
    """Mixup: interpolate between pairs of images and labels."""
    indices = torch.randperm(x.size(0))
    lam = np.random.beta(alpha, alpha)

    x_mixed = lam * x + (1 - lam) * x[indices]
    return x_mixed, y, y[indices], lam


def mixup_criterion(criterion, pred, y_a, y_b, lam):
    """Compute mixup loss as weighted average of two losses."""
    return lam * criterion(pred, y_a) + (1 - lam) * criterion(pred, y_b)
```

### 6.5 Augmentation Intensity Guide

| Dataset Size | Recommended Intensity | Key Augmentations |
|-------------|----------------------|-------------------|
| < 1,000 | Aggressive | Flip, crop, rotation, color jitter, CutMix, Mixup, erasing |
| 1K–10K | Moderate | Flip, crop, color jitter, CutMix |
| 10K–100K | Light | Flip, crop, normalization |
| > 100K | Minimal or none | Normalization only (data is sufficient) |

---

## 7. Training Tricks for CNNs

### 7.1 Learning Rate Schedule

The cosine annealing schedule with warmup is the standard for training CNNs:

```python
import torch.optim as optim
from torch.optim.lr_scheduler import CosineAnnealingLR, LinearLR, SequentialLR


def build_optimizer(model, base_lr=1e-3, weight_decay=5e-4, warmup_epochs=5,
                    total_epochs=100):
    """Build optimizer with cosine annealing + warmup."""
    optimizer = optim.SGD(
        model.parameters(),
        lr=base_lr,
        momentum=0.9,
        weight_decay=weight_decay,
        nesterov=True,
    )

    # Warmup: linearly increase LR from 0 to base_lr
    warmup_scheduler = LinearLR(
        optimizer,
        start_factor=0.01,  # start at 1% of base_lr
        total_iters=warmup_epochs,
    )

    # Cosine annealing: decay LR from base_lr to min_lr
    cosine_scheduler = CosineAnnealingLR(
        optimizer,
        T_max=total_epochs - warmup_epochs,
        eta_min=1e-6,
    )

    # Combine: warmup first, then cosine
    scheduler = SequentialLR(
        optimizer,
        schedulers=[warmup_scheduler, cosine_scheduler],
        milestones=[warmup_epochs],
    )

    return optimizer, scheduler
```

### 7.2 Learning Rate Finder

Before training, find the optimal learning rate by running the model for a few batches with exponentially increasing LR:

```python
def lr_find(model, train_loader, criterion, lr_min=1e-7, lr_max=10,
            num_batches=200):
    """Find optimal learning rate using the LR range test.

    Plot loss vs. learning rate — choose the LR where loss decreases fastest.
    """
    optimizer = optim.SGD(model.parameters(), lr=lr_min, momentum=0.9)
    lrs, losses = [], []

    lr_scale = (lr_max / lr_min) ** (1 / num_batches)
    current_lr = lr_min

    model.train()
    for i, (inputs, targets) in enumerate(train_loader):
        if i >= num_batches:
            break

        # Forward + backward
        outputs = model(inputs)
        loss = criterion(outputs, targets)

        # Record
        lrs.append(current_lr)
        losses.append(loss.item())

        # Backward
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

        # Increase LR
        current_lr *= lr_scale
        for param_group in optimizer.param_groups:
            param_group["lr"] = current_lr

    return lrs, losses
```

### 7.3 Weight Decay and Regularization

```python
# Weight decay is the most important regularization hyperparameter for CNNs
# AdamW decouples weight decay from gradient update (preferred over Adam)

optimizer = optim.AdamW(
    model.parameters(),
    lr=1e-3,
    weight_decay=5e-4,  # L2 penalty coefficient
)

# SGD + Momentum + Weight Decay (classic combination for vision)
optimizer = optim.SGD(
    model.parameters(),
    lr=0.1,
    momentum=0.9,
    weight_decay=5e-4,  # 5e-4 is the CIFAR-10 standard
    nesterov=True,       # Nesterov momentum often helps
)
```

### 7.4 Label Smoothing

Label smoothing replaces hard targets (0 and 1) with soft targets (ε/K and 1-ε), preventing the model from becoming overconfident:

```python
# Hard targets:  [0, 0, 0, 1, 0, 0, 0, 0, 0, 0]  (class 3)
# Smooth targets: [0.01, 0.01, 0.01, 0.91, 0.01, 0.01, 0.01, 0.01, 0.01, 0.01]
#                   ε/K    ε/K    ε/K   1-ε+ε/K  ...

criterion = nn.CrossEntropyLoss(label_smoothing=0.1)  # ε = 0.1
```

### 7.5 Complete Training Recipe

```python
"""
Complete CNN Training Recipe for CIFAR-10
─────────────────────────────────────────
Achieves ~93-94% accuracy with ResNet-18 in ~100 epochs.
"""

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
import torchvision
import torchvision.transforms as T
from torch.optim.lr_scheduler import CosineAnnealingLR
import time

# ═══════════════════════════════════════════════════════════
# 1. CONFIGURATION
# ═══════════════════════════════════════════════════════════
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
NUM_EPOCHS = 100
BATCH_SIZE = 128
LR = 0.1
WEIGHT_DECAY = 5e-4
MOMENTUM = 0.9

print(f"Device: {DEVICE}")

# ═══════════════════════════════════════════════════════════
# 2. DATA
# ═══════════════════════════════════════════════════════════
train_transform = T.Compose([
    T.RandomCrop(32, padding=4),
    T.RandomHorizontalFlip(),
    T.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
    T.ToTensor(),
    T.Normalize((0.4914, 0.4822, 0.4465), (0.2023, 0.1994, 0.2010)),
    T.RandomErasing(p=0.25, scale=(0.02, 0.15)),
])

test_transform = T.Compose([
    T.ToTensor(),
    T.Normalize((0.4914, 0.4822, 0.4465), (0.2023, 0.1994, 0.2010)),
])

trainset = torchvision.datasets.CIFAR10(root="./data", train=True,
                                        download=True, transform=train_transform)
testset = torchvision.datasets.CIFAR10(root="./data", train=False,
                                       download=True, transform=test_transform)

train_loader = DataLoader(trainset, batch_size=BATCH_SIZE, shuffle=True,
                          num_workers=2, pin_memory=True, drop_last=True)
test_loader = DataLoader(testset, batch_size=256, shuffle=False,
                         num_workers=2, pin_memory=True)

# ═══════════════════════════════════════════════════════════
# 3. MODEL (use torchvision's ResNet-18)
# ═══════════════════════════════════════════════════════════
model = models.resnet18(weights=None, num_classes=10).to(DEVICE)

# ═══════════════════════════════════════════════════════════
# 4. LOSS, OPTIMIZER, SCHEDULER
# ═══════════════════════════════════════════════════════════
criterion = nn.CrossEntropyLoss(label_smoothing=0.1)
optimizer = optim.SGD(model.parameters(), lr=LR, momentum=MOMENTUM,
                      weight_decay=WEIGHT_DECAY, nesterov=True)
scheduler = CosineAnnealingLR(optimizer, T_max=NUM_EPOCHS, eta_min=1e-6)

# ═══════════════════════════════════════════════════════════
# 5. TRAINING
# ═══════════════════════════════════════════════════════════
best_acc = 0.0

for epoch in range(NUM_EPOCHS):
    model.train()
    train_loss, correct, total = 0.0, 0, 0
    start = time.time()

    for images, labels in train_loader:
        images, labels = images.to(DEVICE), labels.to(DEVICE)

        outputs = model(images)
        loss = criterion(outputs, labels)

        optimizer.zero_grad()
        loss.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=5.0)
        optimizer.step()

        train_loss += loss.item() * images.size(0)
        _, predicted = outputs.max(1)
        total += labels.size(0)
        correct += predicted.eq(labels).sum().item()

    scheduler.step()
    train_acc = correct / total
    train_loss /= total

    # Evaluate
    model.eval()
    val_correct, val_total = 0, 0
    with torch.no_grad():
        for images, labels in test_loader:
            images, labels = images.to(DEVICE), labels.to(DEVICE)
            outputs = model(images)
            _, predicted = outputs.max(1)
            val_total += labels.size(0)
            val_correct += predicted.eq(labels).sum().item()

    val_acc = val_correct / val_total
    elapsed = time.time() - start

    if val_acc > best_acc:
        best_acc = val_acc
        torch.save(model.state_dict(), "best_cnn.pt")

    if (epoch + 1) % 10 == 0 or epoch == 0:
        print(f"Epoch {epoch+1:3d}/{NUM_EPOCHS} │ "
              f"Train Loss: {train_loss:.4f} │ Train Acc: {train_acc:.1%} │ "
              f"Val Acc: {val_acc:.1%} │ Best: {best_acc:.1%} │ "
              f"LR: {scheduler.get_last_lr()[0]:.2e} │ {elapsed:.1f}s")

print(f"\n✅ Best accuracy: {best_acc:.1%}")
```

### 7.6 Training Tricks Summary

| Trick | Effect | Typical Value |
|-------|--------|--------------|
| SGD + Momentum | Better generalization than Adam for vision | lr=0.1, momentum=0.9, nesterov=True |
| Cosine Annealing | Smooth LR decay with warm restarts | T_max=epochs, η_min=1e-6 |
| Weight Decay | L2 regularization prevents overfitting | 5e-4 for SGD, 1e-4 for AdamW |
| Label Smoothing | Prevents overconfidence, improves calibration | ε=0.1 |
| Gradient Clipping | Prevents gradient explosion | max_norm=5.0 |
| Data Augmentation | Increases effective training set size | Flip + crop + color jitter |
| CutMix / Mixup | Regularization via input mixing | α=1.0 (CutMix), α=0.2 (Mixup) |
| Batch Normalization | Stabilizes training, allows higher LR | Place after every conv |

---

## 8. Building a Transfer Learning Image Classifier

### 8.1 Complete Project: Plant Disease Classification

This section brings everything together into a complete, real-world image classification project using transfer learning:

```python
"""
Transfer Learning Image Classifier
──────────────────────────────────
Fine-tunes ResNet-18 for custom image classification.
Achieves strong performance with minimal data.
"""

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
import torchvision.transforms as T
from torchvision.datasets import ImageFolder
from torchvision import models
import time
import copy

# ═══════════════════════════════════════════════════════════
# CONFIGURATION
# ═══════════════════════════════════════════════════════════
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
NUM_CLASSES = 5       # e.g., 5 plant disease categories
NUM_EPOCHS = 30
BATCH_SIZE = 32

# ═══════════════════════════════════════════════════════════
# DATA TRANSFORMS
# ═══════════════════════════════════════════════════════════
# Use the same normalization as the pre-trained model
imagenet_mean = [0.485, 0.456, 0.406]
imagenet_std = [0.229, 0.224, 0.225]

train_transform = T.Compose([
    T.RandomResizedCrop(224, scale=(0.8, 1.0)),
    T.RandomHorizontalFlip(),
    T.ColorJitter(brightness=0.3, contrast=0.3, saturation=0.3, hue=0.1),
    T.RandomRotation(20),
    T.ToTensor(),
    T.Normalize(imagenet_mean, imagenet_std),
])

val_transform = T.Compose([
    T.Resize(256),
    T.CenterCrop(224),
    T.ToTensor(),
    T.Normalize(imagenet_mean, imagenet_std),
])

# ═══════════════════════════════════════════════════════════
# DATASET (assumes ImageFolder structure)
# ═══════════════════════════════════════════════════════════
# Expected directory structure:
#   data/
#   ├── train/
#   │   ├── class_1/
#   │   ├── class_2/
#   │   └── ...
#   └── val/
#       ├── class_1/
#       ├── class_2/
#       └── ...
#
# train_dataset = ImageFolder("data/train", transform=train_transform)
# val_dataset = ImageFolder("data/val", transform=val_transform)
# train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True,
#                           num_workers=4, pin_memory=True)
# val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE, shuffle=False,
#                         num_workers=4, pin_memory=True)
#
# class_names = train_dataset.classes
# print(f"Classes: {class_names}")

# For demonstration, use CIFAR-10 as a stand-in
trainset = models.resnet18  # placeholder
print(f"Using device: {DEVICE}")

# ═══════════════════════════════════════════════════════════
# MODEL SETUP
# ═══════════════════════════════════════════════════════════
model = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)

# Freeze backbone initially
for param in model.parameters():
    param.requires_grad = False

# Replace classifier head
num_features = model.fc.in_features
model.fc = nn.Sequential(
    nn.Dropout(0.3),
    nn.Linear(num_features, NUM_CLASSES),
)
model = model.to(DEVICE)

# ═══════════════════════════════════════════════════════════
# TRAINING: TWO-PHASE APPROACH
# ═══════════════════════════════════════════════════════════
criterion = nn.CrossEntropyLoss(label_smoothing=0.1)

# Phase 1: Train only the classifier head (fast, 10 epochs)
phase1_optimizer = optim.Adam(model.fc.parameters(), lr=1e-3)

# Phase 2: Fine-tune entire model (slow, 20 epochs)
phase2_optimizer = optim.AdamW([
    {"params": model.layer3.parameters(), "lr": 1e-4},
    {"params": model.layer4.parameters(), "lr": 5e-4},
    {"params": model.fc.parameters(), "lr": 1e-3},
], weight_decay=1e-4)

phase2_scheduler = CosineAnnealingLR(phase2_optimizer, T_max=20, eta_min=1e-6)


def train_phase(model, optimizer, scheduler, num_epochs, phase_name):
    """Train for one phase."""
    print(f"\n{'='*60}")
    print(f"  PHASE: {phase_name} ({num_epochs} epochs)")
    print(f"{'='*60}")

    best_model_wts = copy.deepcopy(model.state_dict())
    best_acc = 0.0

    for epoch in range(num_epochs):
        model.train()
        running_loss, running_corrects = 0.0, 0

        # [Training loop would go here — using train_loader]
        # for inputs, labels in train_loader:
        #     inputs, labels = inputs.to(DEVICE), labels.to(DEVICE)
        #     optimizer.zero_grad()
        #     outputs = model(inputs)
        #     loss = criterion(outputs, labels)
        #     loss.backward()
        #     optimizer.step()
        #     running_loss += loss.item() * inputs.size(0)
        #     running_corrects += (outputs.argmax(1) == labels).sum().item()

        # [Validation loop would go here — using val_loader]

        if scheduler:
            scheduler.step()

        # Save best
        # val_acc = running_corrects / len(val_dataset)
        # if val_acc > best_acc:
        #     best_acc = val_acc
        #     best_model_wts = copy.deepcopy(model.state_dict())

    model.load_state_dict(best_model_wts)
    return model


# Phase 1: Feature extraction
model = train_phase(model, phase1_optimizer, None, 10,
                    "Feature Extraction (head only)")

# Phase 2: Fine-tuning
# Unfreeze backbone
for param in model.parameters():
    param.requires_grad = True
# Re-freeze early layers (they detect universal features)
for param in model.layer1.parameters():
    param.requires_grad = False
for param in model.layer2.parameters():
    param.requires_grad = False

model = train_phase(model, phase2_optimizer, phase2_scheduler, 20,
                    "Fine-Tuning (layers 3, 4 + head)")
```

### 8.2 Two-Phase Training Strategy

```
Phase 1: Feature Extraction (epochs 1-10)
┌──────────────────────────────────────────────────────────┐
│  layer1 (frozen)  │  layer2 (frozen)  │  layer3 (frozen) │  layer4 (frozen)  │  fc (training)
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │  ░░░░░░░░░░░░░
│  frozen            │  frozen            │  frozen           │  frozen            │  LR: 1e-3
└──────────────────────────────────────────────────────────┘

Phase 2: Fine-Tuning (epochs 11-30)
┌──────────────────────────────────────────────────────────┐
│  layer1 (frozen)  │  layer2 (frozen)  │  layer3 (train)  │  layer4 (train)   │  fc (training)
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │  ░░░░░░░░░░░░░░  │  ░░░░░░░░░░░░░░  │  ░░░░░░░░░░░░░
│  frozen            │  frozen            │  LR: 1e-4         │  LR: 5e-4         │  LR: 1e-3
└──────────────────────────────────────────────────────────┘

░ = trainable    ▓ = frozen
```

---

## 9. Batch Normalization Deep Dive

### 9.1 How BatchNorm Works

Batch Normalization normalizes the output of each layer across the batch dimension, then applies learnable scale (γ) and shift (β) parameters:

```
For a batch of activations x = {x₁, x₂, ..., x_B}:

1. Compute batch mean:   μ_B = (1/B) Σ xᵢ
2. Compute batch variance: σ²_B = (1/B) Σ (xᵢ - μ_B)²
3. Normalize:            x̂ᵢ = (xᵢ - μ_B) / √(σ²_B + ε)
4. Scale and shift:      yᵢ = γ · x̂ᵢ + β          (learnable parameters)

Where:
  γ (weight) and β (bias) are the only learnable parameters
  ε = 1e-5 (small constant for numerical stability)
```

### 9.2 BatchNorm in CNNs

```python
# Standard placement in a CNN block
conv_block = nn.Sequential(
    nn.Conv2d(64, 128, 3, padding=1, bias=False),  # No bias when using BN
    nn.BatchNorm2d(128),                             # Normalize across batch
    nn.ReLU(inplace=True),
)

# Why no bias? BN subtracts the mean, so a bias would be redundant.
#
# Conv output: z = W·x + b    (with bias)
# BN output:  BN(z) = γ·(z - μ)/σ + β
#
# Since BN subtracts μ, the bias b is absorbed: β - γ·μ/σ acts as the new bias
# So setting bias=False in Conv saves a redundant parameter.

# BatchNorm2d tracks running statistics during training
bn = nn.BatchNorm2d(64, momentum=0.1)  # running_mean = (1-0.1)*running_mean + 0.1*batch_mean
print(bn.running_mean.shape)            # torch.Size([64])
print(bn.running_var.shape)             # torch.Size([64])

# During eval, BN uses running statistics (not batch statistics)
model.train()   # uses batch statistics
model.eval()    # uses running statistics
```

---

## 10. Common Pitfalls and Debugging

### 10.1 CNN Debugging Checklist

| Symptom | Likely Cause | Solution |
|---------|-------------|----------|
| Loss stays high / accuracy near random | Learning rate too high or too low | Run LR finder; try 1e-3 to 0.1 |
| Loss goes to NaN | LR too high, no BN, bad data | Lower LR, add BN, check data for NaN/inf |
| Train loss drops, val loss rises | Overfitting | More augmentation, dropout, weight decay, fewer epochs |
| Both train and val accuracy plateau low | Underfitting | Larger model, lower regularization, longer training |
| Training is very slow | Too many parameters, no GPU | Use GPU, reduce model size, increase batch size |
| Validation accuracy oscillates wildly | Batch size too small or LR too high | Increase batch size, reduce LR, use BN |
| Accuracy drops after a sudden spike | Learning rate too high at that point | Use warmup, reduce max LR |

### 10.2 Shape Errors in CNNs

The most common error is a shape mismatch between layers:

```python
# Debugging tool: print shapes at each layer
class DebugCNN(nn.Module):
    def __init__(self):
        super().__init__()
        self.conv1 = nn.Conv2d(3, 32, 3, padding=1)
        self.pool = nn.MaxPool2d(2, 2)
        self.conv2 = nn.Conv2d(32, 64, 3, padding=1)

    def forward(self, x):
        print(f"Input:   {x.shape}")         # (B, 3, 32, 32)
        x = self.pool(torch.relu(self.conv1(x)))
        print(f"After conv1+pool: {x.shape}") # (B, 32, 16, 16)
        x = self.pool(torch.relu(self.conv2(x)))
        print(f"After conv2+pool: {x.shape}") # (B, 64, 8, 8)
        return x

# Quick shape calculator:
def conv_output_size(h, kernel, stride=1, padding=0):
    return (h - kernel + 2 * padding) // stride + 1

def pool_output_size(h, kernel, stride=2):
    return (h - kernel) // stride + 1

# Example: 32×32 input through typical CNN
h = 32
h = conv_output_size(h, 3, 1, 1)   # Conv: 32
h = pool_output_size(h, 2, 2)       # Pool: 16
h = conv_output_size(h, 3, 1, 1)   # Conv: 16
h = pool_output_size(h, 2, 2)       # Pool: 8
h = conv_output_size(h, 3, 1, 1)   # Conv: 8
h = pool_output_size(h, 2, 2)       # Pool: 4
print(f"Final spatial size: {h}")    # 4
```

---

## 11. Architecture Design Principles

### 11.1 Designing a CNN from Scratch

```
Step 1: Choose your complexity budget
┌────────────────────────────────────────────────────────┐
│  Budget        │  Architecture Choice                   │
│  < 1M params   │  Simple CNN (3-4 conv blocks)         │
│  1M–10M        │  ResNet-18 / VGG-style               │
│  10M–50M       │  ResNet-50 / EfficientNet-B2         │
│  > 50M         │  ResNet-152 / EfficientNet-B7        │
└────────────────────────────────────────────────────────┘

Step 2: Choose input resolution
┌────────────────────────────────────────────────────────┐
│  Resolution  │  Use Case                                │
│  32×32       │  CIFAR-10/100, small icon classification│
│  64×64       │  Small object detection                  │
│  128×128     │  Face recognition, medium objects        │
│  224×224     │  Standard ImageNet, general purpose      │
│  384×384     │  High-resolution classification          │
│  512+        │  Fine-grained, medical imaging           │
└────────────────────────────────────────────────────────┘

Step 3: Choose depth
┌────────────────────────────────────────────────────────┐
│  Depth   │  Pros                                       │
│  Shallow │  Fast inference, less overfitting           │
│  Deep    │  Better representations, higher capacity    │
│  Residual│  Deep without vanishing gradients           │
└────────────────────────────────────────────────────────┘
```

### 11.2 Channel Progression Pattern

The standard channel progression in CNNs doubles channels at each spatial reduction:

```
Spatial dims:  32 → 16 → 8 → 4 → 1
Channels:       64 → 128 → 256 → 512 → (classifier)
                ↑      ↑       ↑       ↑
             block1  block2  block3  block4

Each block:
  [Conv → BN → ReLU] × N
  [MaxPool2d(2,2)] or [Conv(stride=2)]

Total parameters roughly stay constant per block
because spatial dims halve while channels double.
```

### 11.3 1×1 Convolutions

1×1 convolutions are used to change the number of channels without changing spatial dimensions — essential for bottleneck architectures:

```python
# 1×1 convolution: change channels without changing spatial size
conv1x1 = nn.Conv2d(in_channels=256, out_channels=64, kernel_size=1)
x = torch.randn(1, 256, 16, 16)
print(conv1x1(x).shape)  # torch.Size([1, 64, 16, 16])

# Bottleneck block (used in ResNet-50):
# Input:  (N, 256, 14, 14)  — 256 channels
# 1×1 conv: reduce to 64 channels   → (N, 64, 14, 14)
# 3×3 conv: process 64 channels      → (N, 64, 14, 14)
# 1×1 conv: expand to 256 channels   → (N, 256, 14, 14)
#
# Why? 3×3 conv on 256 channels: 256 × 9 × 256 = 589,824 params
# Bottleneck: 256×1×64 + 64×9×64 + 64×1×256 = 16,384 + 36,864 + 16,384 = 69,632
# That's 8.5× fewer parameters!
```

---

## Summary

This chapter covered the complete landscape of Convolutional Neural Networks in PyTorch:

| Topic | Key Takeaway |
|-------|-------------|
| **Conv2d** | Slides learnable filters over input; output channels = number of filters |
| **Output Size** | `floor((H - K + 2P) / S) + 1` determines spatial dimensions |
| **Pooling** | MaxPool for invariance, AdaptiveAvgPool for global feature summarization |
| **CNN Design** | Stack Conv→BN→ReLU blocks; double channels when halving spatial dims |
| **Batch Normalization** | Normalize across batch; always use bias=False with BN |
| **ResNet** | Skip connections enable training of deep networks by learning residuals |
| **Transfer Learning** | Feature extraction (small data) or fine-tuning (medium data) |
| **Data Augmentation** | Flip, crop, color jitter, CutMix, Mixup — scale with dataset size |
| **Training Recipe** | SGD+momentum, cosine LR, weight decay 5e-4, label smoothing 0.1 |
| **Debugging** | Print shapes at each layer; use LR finder; watch train/val gap |

---

## Practice Exercises

### Exercise 1: Implement a CNN from Scratch
Build a CNN from scratch (no `nn.Sequential`) with named layers. Include three conv blocks, each with Conv→BN→ReLU→Conv→BN→ReLU→MaxPool, followed by global average pooling and a linear classifier. Count the parameters at each stage.

### Exercise 2: Convolution Output Size Calculator
Write a function that takes input dimensions, kernel size, stride, and padding, and returns the output dimensions for a sequence of Conv2d and MaxPool2d layers. Test it against PyTorch's actual output shapes.

### Exercise 3: Residual Block Variants
Implement three variants of residual blocks: (1) basic block (2× Conv3×3), (2) bottleneck block (1×1 → 3×3 → 1×1), and (3) pre-activation residual block (BN→ReLU→Conv). Compare parameter counts for identical channel configurations.

### Exercise 4: Transfer Learning Comparison
Fine-tune ResNet-18 on CIFAR-10 with three strategies: (1) train from scratch, (2) feature extraction (freeze all, train head only), (3) fine-tune with discriminative LR. Compare accuracy and training time for each.

### Exercise 5: Augmentation Ablation
Train the same model on CIFAR-10 with progressively more augmentation: none → flip only → flip + crop → flip + crop + color jitter → full pipeline with CutMix. Plot accuracy vs. augmentation level.

### Exercise 6: Learning Rate Finder
Implement the LR range test and plot loss vs. learning rate on a ResNet-18 training on CIFAR-10. Identify the optimal starting LR and the range where loss decreases fastest.

### Exercise 7: Architecture Scaling
Train models at three scales: (1) Conv channels [32, 64, 128], (2) [64, 128, 256], (3) [128, 256, 512]. Compare accuracy, training time, and parameter count. At what scale do you see diminishing returns?

### Exercise 8: Debug a Broken CNN
Given a CNN that outputs NaN loss after 3 epochs, identify and fix the issues. Common problems to check: missing BatchNorm, learning rate too high, missing weight initialization, incorrect data normalization, or missing `.eval()` during validation.

---

*End of Chapter 6 — Next: Chapter 7 — Recurrent Neural Networks & Transformers*
