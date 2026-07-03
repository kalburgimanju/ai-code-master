# Chapter 5: Training Pipelines

*By Manjunath Kalburgi*

---

## Introduction

In the previous chapters, you learned how to define models, perform tensor operations, and build basic computational graphs. Now we tackle the heart of applied deep learning: **building complete, production-quality training pipelines**. A training pipeline is more than just a forward and backward pass — it encompasses data loading, preprocessing, augmentation, scheduling, checkpointing, mixed precision, and validation. This chapter walks through every component in detail, with runnable code and practical guidance.

---

## 5.1 Dataset Class (`torch.utils.data.Dataset`)

The `Dataset` class is the foundation of PyTorch's data loading ecosystem. It is an abstract class that you subclass to represent your data. It must implement two methods:

| Method | Signature | Purpose |
|---|---|---|
| `__len__` | `__len__(self) -> int` | Returns the total number of samples |
| `__getitem__` | `__getitem__(self, idx) -> (Tensor, Tensor)` | Returns a single sample and its label |

### How It Works with DataLoader

```
┌──────────────────────────────────────────────────────────────┐
│                     TRAINING PIPELINE                        │
│                                                              │
│  ┌───────────┐    ┌────────────┐    ┌────────────────────┐  │
│  │  Dataset   │───▶│ DataLoader │───▶│   Training Loop    │  │
│  │  (source)  │    │ (batches)  │    │ (forward/backward) │  │
│  └───────────┘    └────────────┘    └────────────────────┘  │
│                                                              │
│  __getitem__  ◀── collate_fn ──▶  list of (X_batch, y_batch)│
│  __len__         batches the                                 │
│                  individual samples                          │
└──────────────────────────────────────────────────────────────┘
```

### Minimal Custom Dataset Example

```python
import torch
from torch.utils.data import Dataset

class SimpleDataset(Dataset):
    """A toy dataset of (input, label) pairs."""

    def __init__(self, num_samples=100):
        self.num_samples = num_samples
        # Simulate data: random features and binary labels
        self.features = torch.randn(num_samples, 10)
        self.labels = torch.randint(0, 2, (num_samples,))

    def __len__(self):
        return self.num_samples

    def __getitem__(self, idx):
        return self.features[idx], self.labels[idx]


# Usage
dataset = SimpleDataset(num_samples=50)
print(f"Dataset size: {len(dataset)}")       # 50
sample_x, sample_y = dataset[0]
print(f"Sample shape: {sample_x.shape}")     # torch.Size([10])
print(f"Label: {sample_y.item()}")           # 0 or 1
```

**Key takeaway:** `__getitem__` receives a single integer index and returns one sample. The `DataLoader` calls `__getitem__` repeatedly (with batched indices) to form mini-batches.

---

## 5.2 TensorDataset — Quick Datasets from Tensors

`TensorDataset` wraps existing tensors into a `Dataset`. It is ideal for small, in-memory datasets where you already have your data as tensors.

```python
from torch.utils.data import TensorDataset, DataLoader

# Create tensors
X = torch.randn(200, 16)
y = torch.randint(0, 5, (200,))

# Wrap into a dataset
dataset = TensorDataset(X, y)

# Now iterate with a DataLoader
loader = DataLoader(dataset, batch_size=32, shuffle=True)

for X_batch, y_batch in loader:
    print(f"Batch X: {X_batch.shape}, Batch y: {y_batch.shape}")
    # Batch X: torch.Size([32, 16]), Batch y: torch.Size([32])
    break
```

**When to use TensorDataset:**

| Scenario | Recommended? |
|---|---|
| Small dataset fits in memory (e.g., < 1 GB) | ✅ Yes |
| Data already as tensors (e.g., synthetic, preprocessed) | ✅ Yes |
| Large dataset that must be streamed from disk | ❌ Use custom `Dataset` |
| Data requires per-sample transforms (e.g., random crop) | ❌ Use custom `Dataset` |

---

## 5.3 DataLoader — Detailed Parameter Guide

`DataLoader` handles batching, shuffling, parallel loading, and GPU memory optimization.

### Complete Parameter Reference

| Parameter | Type | Default | Description |
|---|---|---|---|
| `dataset` | `Dataset` | *(required)* | The dataset to load from |
| `batch_size` | `int` | `1` | Number of samples per batch |
| `shuffle` | `bool` | `False` | Reshuffle data every epoch (important for training) |
| `num_workers` | `int` | `0` | Number of subprocesses for data loading (`0` = main process) |
| `pin_memory` | `bool` | `False` | Copy tensors into pinned memory before returning (faster CPU→GPU transfer) |
| `drop_last` | `bool` | `False` | Drop the last incomplete batch (useful for consistent batch sizes) |
| `collate_fn` | `callable` | `default_collate` | Function to merge samples into a batch |
| `persistent_workers` | `bool` | `False` | Keep workers alive between epochs (avoids restart overhead) |
| `prefetch_factor` | `int` | `2` | Number of batches each worker prefetches |

### Comprehensive DataLoader Example

```python
import torch
from torch.utils.data import Dataset, DataLoader

class MyDataset(Dataset):
    def __init__(self, size=1000):
        self.X = torch.randn(size, 32)
        self.y = torch.randint(0, 10, (size,))

    def __len__(self):
        return len(self.X)

    def __getitem__(self, idx):
        return self.X[idx], self.y[idx]

dataset = MyDataset(size=1000)

# ── Standard training loader ──
train_loader = DataLoader(
    dataset,
    batch_size=64,          # 64 samples per batch
    shuffle=True,           # Shuffle every epoch
    num_workers=2,          # 2 background workers
    pin_memory=True,        # Pin memory for fast GPU transfer
    drop_last=True,         # Drop last incomplete batch
    persistent_workers=True # Keep workers alive
)

# ── Validation loader (no shuffle, no drop) ──
val_loader = DataLoader(
    dataset,
    batch_size=128,         # Larger batch for eval (no gradients)
    shuffle=False,          # No shuffling for reproducible evaluation
    num_workers=0,          # Main process is fine for small eval sets
    pin_memory=True,
    drop_last=False         # Keep all samples
)

# Iterate
for epoch in range(3):
    for batch_idx, (X_batch, y_batch) in enumerate(train_loader):
        if batch_idx == 0:
            print(
                f"Epoch {epoch}, Batch {batch_idx}: "
                f"X={X_batch.shape}, y={y_batch.shape}, "
                f"dtype={X_batch.dtype}"
            )
```

### `batch_size` Trade-offs

| batch_size | Memory | Training Speed | Gradient Quality |
|---|---|---|---|
| 1 | Very low | Slow (no parallelism) | Very noisy |
| 16–32 | Low | Moderate | Noisy but often regularizing |
| 64–256 | Moderate | Fast | Good balance |
| 512+ | High | Fastest per step | Smooth gradients (may generalize worse) |

### When to Use `num_workers > 0`

- **Disk-based datasets** (images, audio): `num_workers=4–8` keeps the GPU fed.
- **In-memory datasets** (small tensors): `num_workers=0` is fine; parallelism overhead isn't worth it.
- **macOS note:** On macOS with Python ≥ 3.8, the default multiprocessing start method is `spawn`. If you see `BrokenPipeError`, set `num_workers=0` or use `torch.multiprocessing.set_start_method('fork')` at script start.

### `pin_memory` Deep Dive

When `pin_memory=True`, the DataLoader allocates page-locked (pinned) memory for tensors. This enables **asynchronous CPU→GPU copy** via CUDA streams, overlapping data transfer with computation.

```python
# Without pin_memory: synchronous copy blocks the GPU
# With pin_memory:    non-blocking copy overlaps with compute

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

for X_batch, y_batch in train_loader:
    # .to(device, non_blocking=True) leverages pinned memory
    X_batch = X_batch.to(device, non_blocking=True)
    y_batch = y_batch.to(device, non_blocking=True)
    # Computation can begin while data is still transferring
    output = model(X_batch)
```

---

## 5.4 Custom Datasets for Images, Text, and CSV

### Image Dataset

```python
import os
from PIL import Image
import torch
from torch.utils.data import Dataset
from torchvision import transforms

class ImageClassificationDataset(Dataset):
    """Load images from a directory structure:
    root/
      class_0/
        img1.jpg
        img2.jpg
      class_1/
        img3.jpg
    """

    def __init__(self, root_dir, transform=None):
        self.root_dir = root_dir
        self.transform = transform
        self.samples = []
        self.class_to_idx = {}

        # Scan directory structure
        for idx, class_name in enumerate(sorted(os.listdir(root_dir))):
            class_dir = os.path.join(root_dir, class_name)
            if not os.path.isdir(class_dir):
                continue
            self.class_to_idx[class_name] = idx
            for fname in sorted(os.listdir(class_dir)):
                if fname.lower().endswith(('.jpg', '.jpeg', '.png', '.bmp')):
                    self.samples.append((os.path.join(class_dir, fname), idx))

        print(f"Found {len(self.samples)} images in {len(self.class_to_idx)} classes")

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        img_path, label = self.samples[idx]
        image = Image.open(img_path).convert("RGB")
        if self.transform:
            image = self.transform(image)
        return image, label


# Define transforms
train_transform = transforms.Compose([
    transforms.Resize((256, 256)),
    transforms.RandomCrop(224),
    transforms.RandomHorizontalFlip(p=0.5),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std=[0.229, 0.224, 0.225]),
])

dataset = ImageClassificationDataset("data/train", transform=train_transform)
loader = torch.utils.data.DataLoader(dataset, batch_size=32, shuffle=True)
```

### Text Dataset

```python
import torch
from torch.utils.data import Dataset

class TextClassificationDataset(Dataset):
    """Simple text classification dataset."""

    def __init__(self, texts, labels, vocab=None, max_len=128):
        self.texts = texts
        self.labels = labels
        self.max_len = max_len

        # Build vocabulary if not provided
        if vocab is None:
            self.vocab = self._build_vocab(texts)
        else:
            self.vocab = vocab

    def _build_vocab(self, texts):
        """Build a word-to-index mapping."""
        vocab = {"<PAD>": 0, "<UNK>": 1}
        for text in texts:
            for word in text.lower().split():
                if word not in vocab:
                    vocab[word] = len(vocab)
        return vocab

    def _numericalize(self, text):
        """Convert text to a sequence of indices."""
        tokens = text.lower().split()
        indices = [
            self.vocab.get(token, self.vocab["<UNK>"])
            for token in tokens
        ]
        # Truncate or pad to max_len
        if len(indices) >= self.max_len:
            indices = indices[:self.max_len]
        else:
            indices = indices + [self.vocab["<PAD>"]] * (self.max_len - len(indices))
        return torch.tensor(indices, dtype=torch.long)

    def __len__(self):
        return len(self.texts)

    def __getitem__(self, idx):
        text_tensor = self._numericalize(self.texts[idx])
        label = torch.tensor(self.labels[idx], dtype=torch.long)
        return text_tensor, label


# Usage
texts = [
    "this movie is great",
    "terrible waste of time",
    "absolutely wonderful acting",
    "boring and predictable plot",
]
labels = [1, 0, 1, 0]  # 1=positive, 0=negative

dataset = TextClassificationDataset(texts, labels, max_len=10)
sample_text, sample_label = dataset[0]
print(f"Text tensor shape: {sample_text.shape}")  # torch.Size([10])
print(f"Label: {sample_label.item()}")             # 1
```

### CSV Dataset

```python
import csv
import torch
from torch.utils.data import Dataset

class CSVDataset(Dataset):
    """Load a CSV file where the last column is the target."""

    def __init__(self, csv_path, feature_cols, target_col, transform=None):
        self.transform = transform
        self.feature_cols = feature_cols
        self.target_col = target_col

        # Read CSV
        with open(csv_path, "r") as f:
            reader = csv.DictReader(f)
            self.rows = list(reader)

        # Extract features and targets as tensors
        self.features = torch.tensor(
            [[float(row[c]) for c in feature_cols] for row in self.rows],
            dtype=torch.float32,
        )
        self.targets = torch.tensor(
            [float(row[target_col]) for row in self.rows],
            dtype=torch.float32,
        )
        print(f"Loaded {len(self.rows)} samples with {len(feature_cols)} features")

    def __len__(self):
        return len(self.rows)

    def __getitem__(self, idx):
        x = self.features[idx]
        y = self.targets[idx]
        if self.transform:
            x = self.transform(x)
        return x, y


# --- Create a sample CSV for demonstration ---
import tempfile, os

csv_content = """feature_1,feature_2,feature_3,target
1.2,3.4,5.6,10.2
2.3,4.5,6.7,13.5
3.4,5.6,7.8,16.8
4.5,6.7,8.9,20.1
5.6,7.8,9.0,22.4
6.7,8.9,10.1,25.7
7.8,9.0,11.2,28.0
8.9,10.1,12.3,31.3
"""

csv_path = tempfile.mktemp(suffix=".csv")
with open(csv_path, "w") as f:
    f.write(csv_content)

dataset = CSVDataset(
    csv_path=csv_path,
    feature_cols=["feature_1", "feature_2", "feature_3"],
    target_col="target",
)

X_sample, y_sample = dataset[0]
print(f"Features: {X_sample}")   # tensor([1.2000, 3.4000, 5.6000])
print(f"Target: {y_sample}")     # tensor(10.2000)

os.remove(csv_path)
```

---

## 5.5 `torchvision.transforms` — Complete Reference

Transforms are applied to images during data loading. They compose into a pipeline using `transforms.Compose`.

### All Common Transforms

| Transform | Purpose | Key Parameters |
|---|---|---|
| `Compose` | Chain multiple transforms | `transforms` (list) |
| `Resize` | Resize image to given size | `size` (int or tuple) |
| `CenterCrop` | Crop center region | `size` (int or tuple) |
| `RandomCrop` | Random spatial crop | `size`, `padding` |
| `RandomHorizontalFlip` | Random horizontal mirror | `p` (probability) |
| `RandomVerticalFlip` | Random vertical mirror | `p` (probability) |
| `ToTensor` | PIL→Tensor, scales to [0,1] | — |
| `Normalize` | Per-channel mean/std | `mean`, `std` |
| `ColorJitter` | Random color perturbation | `brightness`, `contrast`, `saturation`, `hue` |
| `Grayscale` | Convert to grayscale | `num_output_channels` |
| `RandomRotation` | Random rotation | `degrees` |
| `RandomResizedCrop` | Crop + resize | `size`, `scale`, `ratio` |

### Complete Transform Pipeline Example

```python
from torchvision import transforms
from PIL import Image
import torch

# ── Training transforms (with augmentation) ──
train_transform = transforms.Compose([
    transforms.Resize((256, 256)),                    # Resize to 256×256
    transforms.CenterCrop(224),                       # Center crop to 224×224
    transforms.RandomHorizontalFlip(p=0.5),           # 50% chance horizontal flip
    transforms.ColorJitter(                            # Random color changes
        brightness=0.2,
        contrast=0.2,
        saturation=0.2,
        hue=0.1,
    ),
    transforms.ToTensor(),                            # PIL → Tensor [0, 1]
    transforms.Normalize(                             # ImageNet normalization
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225],
    ),
])

# ── Validation transforms (no augmentation) ──
val_transform = transforms.Compose([
    transforms.Resize((224, 224)),                    # Direct resize to 224×224
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225],
    ),
])

# Create a dummy image and apply transforms
dummy_image = Image.new("RGB", (300, 400), color=(128, 64, 32))

train_output = train_transform(dummy_image)
val_output = val_transform(dummy_image)

print(f"Train output shape: {train_output.shape}")  # torch.Size([3, 224, 224])
print(f"Val output shape:   {val_output.shape}")    # torch.Size([3, 224, 224])
print(f"Value range:        [{train_output.min():.3f}, {train_output.max():.3f}]")
```

### Individual Transform Demonstrations

```python
from torchvision import transforms
from PIL import Image

# Create a test image
img = Image.new("RGB", (300, 200), color=(100, 150, 200))

# ── Resize ──
resize = transforms.Resize((128, 128))
print(f"Resize:         {resize(img).size}")           # (128, 128)

# Resize maintaining aspect ratio (shortest side = 128)
resize_aspect = transforms.Resize(128)
print(f"Resize (ratio): {resize_aspect(img).size}")    # varies

# ── CenterCrop ──
crop = transforms.CenterCrop(100)
print(f"CenterCrop:     {crop(img).size}")             # (100, 100)

# ── ToTensor ──
to_tensor = transforms.ToTensor()
tensor = to_tensor(img)
print(f"ToTensor:       shape={tensor.shape}, dtype={tensor.dtype}, "
      f"range=[{tensor.min():.1f}, {tensor.max():.1f}]")
# shape=torch.Size([3, 200, 300]), dtype=torch.float32, range=[0.0, 0.8]

# ── Normalize ──
normalize = transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5])
normalized = normalize(tensor)
print(f"Normalized:     range=[{normalized.min():.2f}, {normalized.max():.2f}]")
# range=[-1.00, 1.00]

# ── RandomHorizontalFlip ──
flip = transforms.RandomHorizontalFlip(p=1.0)  # p=1.0 for deterministic demo
flipped = flip(tensor)
print(f"Flipped shape:  {flipped.shape}")             # Same shape

# ── ColorJitter ──
jitter = transforms.ColorJitter(brightness=0.5, contrast=0.5, saturation=0.5, hue=0.2)
jittered = jitter(tensor)
print(f"Jittered:       shape={jittered.shape}")
```

---

## 5.6 Data Augmentation Strategies

Data augmentation artificially increases the diversity of your training data, reducing overfitting.

### Common Augmentation Techniques

```python
from torchvision import transforms

# ── Standard augmentation for natural images ──
standard_augment = transforms.Compose([
    transforms.RandomResizedCrop(224, scale=(0.8, 1.0)),
    transforms.RandomHorizontalFlip(p=0.5),
    transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std=[0.229, 0.224, 0.225]),
])

# ── Aggressive augmentation for small datasets ──
aggressive_augment = transforms.Compose([
    transforms.RandomResizedCrop(224, scale=(0.6, 1.0)),
    transforms.RandomHorizontalFlip(p=0.5),
    transforms.RandomVerticalFlip(p=0.2),
    transforms.RandomRotation(degrees=15),
    transforms.ColorJitter(brightness=0.3, contrast=0.3, saturation=0.3, hue=0.1),
    transforms.RandomGrayscale(p=0.1),
    transforms.GaussianBlur(kernel_size=3, sigma=(0.1, 2.0)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std=[0.229, 0.224, 0.225]),
])

# ── Medical / satellite imagery augmentation ──
geometric_augment = transforms.Compose([
    transforms.RandomRotation(degrees=90),       # 90-degree rotational invariance
    transforms.RandomHorizontalFlip(p=0.5),
    transforms.RandomVerticalFlip(p=0.5),
    transforms.RandomAffine(degrees=0, translate=(0.1, 0.1)),
    transforms.ToTensor(),
])

# ── Text augmentation (token-level) ──
import random

def text_augment(text, p=0.1):
    """Simple token-level augmentation: random deletion."""
    tokens = text.split()
    augmented = [t for t in tokens if random.random() > p]
    return " ".join(augmented) if augmented else text

original = "the quick brown fox jumps over the lazy dog"
augmented = text_augment(original, p=0.3)
print(f"Original:  {original}")
print(f"Augmented: {augmented}")
```

### Augmentation Strategy by Dataset Size

| Dataset Size | Recommended Augmentation |
|---|---|
| < 1,000 images | Aggressive: rotation, flip, color jitter, random erasing, mixup |
| 1,000–10,000 | Moderate: flip, resize/crop, color jitter |
| 10,000–100,000 | Light: flip, random crop, normalize |
| > 100,000 | Minimal or none; rely on model capacity |

---

## 5.7 Text Tokenization Basics

### Vocabulary Building and Numericalization

```python
from collections import Counter

class SimpleTokenizer:
    """Minimal tokenizer: vocabulary building + numericalization."""

    PAD_TOKEN = "<PAD>"
    UNK_TOKEN = "<UNK>"
    SOS_TOKEN = "<SOS>"
    EOS_TOKEN = "<EOS>"

    def __init__(self, vocab_size=None):
        self.vocab_size = vocab_size
        self.word2idx = {}
        self.idx2word = {}
        self.word_counts = Counter()

    def build_vocab(self, texts, min_freq=1):
        """Build vocabulary from a list of texts."""
        # Count words
        for text in texts:
            self.word_counts.update(text.lower().split())

        # Add special tokens first
        special = [self.PAD_TOKEN, self.UNK_TOKEN, self.SOS_TOKEN, self.EOS_TOKEN]
        self.word2idx = {token: idx for idx, token in enumerate(special)}

        # Add words meeting minimum frequency
        for word, count in self.word_counts.most_common():
            if count >= min_freq and word not in self.word2idx:
                self.word2idx[word] = len(self.word2idx)

        # Truncate to vocab_size if specified
        if self.vocab_size:
            words = sorted(self.word2idx.items(), key=lambda x: x[1])
            words = words[:self.vocab_size]
            self.word2idx = {w: i for i, (w, _) in enumerate(words)}

        self.idx2word = {idx: word for word, idx in self.word2idx.items()}
        print(f"Vocabulary size: {len(self.word2idx)}")
        return self

    def encode(self, text, max_len=None, add_sos=False, add_eos=False):
        """Convert text to list of indices."""
        tokens = text.lower().split()
        indices = [self.word2idx.get(t, self.word2idx[self.UNK_TOKEN]) for t in tokens]

        if add_sos:
            indices.insert(0, self.word2idx[self.SOS_TOKEN])
        if add_eos:
            indices.append(self.word2idx[self.EOS_TOKEN])
        if max_len:
            indices = indices[:max_len]
        return indices

    def decode(self, indices):
        """Convert list of indices back to text."""
        return " ".join(
            self.idx2word.get(i, self.UNK_TOKEN) for i in indices
        )


# ── Demo ──
corpus = [
    "the cat sat on the mat",
    "the dog sat on the log",
    "the cat chased the dog",
    "a bird flew over the tree",
]

tokenizer = SimpleTokenizer()
tokenizer.build_vocab(corpus, min_freq=1)

encoded = tokenizer.encode("the cat sat on the mat", max_len=10, add_sos=True, add_eos=True)
decoded = tokenizer.decode(encoded)
print(f"Encoded: {encoded}")
print(f"Decoded: {decoded}")

# Batch encoding with padding
def collate_texts(texts, tokenizer, max_len=8):
    """Encode and pad a batch of texts."""
    encoded = [tokenizer.encode(t, max_len=max_len) for t in texts]
    padded = [
        e + [tokenizer.word2idx[tokenizer.PAD_TOKEN]] * (max_len - len(e))
        for e in encoded
    ]
    return torch.tensor(padded, dtype=torch.long)

batch = collate_texts(
    ["the cat", "the dog sat on the mat"],
    tokenizer,
    max_len=8,
)
print(f"Batch shape: {batch.shape}")  # torch.Size([2, 8])
print(f"Batch tensor:\n{batch}")
```

---

## 5.8 Batch Collation with Custom `collate_fn`

The `collate_fn` determines how individual samples are merged into a batch. The default `collate_fn` stacks tensors, but you often need custom logic for variable-length data.

### Custom Collate for Variable-Length Sequences

```python
import torch
from torch.utils.data import Dataset, DataLoader
from torch.nn.utils.rnn import pad_sequence

class SeqDataset(Dataset):
    """Dataset of variable-length sequences."""

    def __init__(self, sequences, labels):
        self.sequences = [torch.tensor(s, dtype=torch.long) for s in sequences]
        self.labels = [torch.tensor(l, dtype=torch.long) for l in labels]

    def __len__(self):
        return len(self.sequences)

    def __getitem__(self, idx):
        return self.sequences[idx], self.labels[idx]


def pad_collate_fn(batch):
    """Custom collate: pad sequences to max length in batch."""
    sequences, labels = zip(*batch)

    # Pad sequences to the longest in the batch
    padded_seqs = pad_sequence(sequences, batch_first=True, padding_value=0)
    labels = torch.stack(labels)

    # Also return original lengths for packed sequences
    lengths = torch.tensor([len(s) for s in sequences])

    return padded_seqs, labels, lengths


# Variable-length sequences
sequences = [
    [1, 2, 3],                # length 3
    [4, 5],                    # length 2
    [6, 7, 8, 9, 10],         # length 5
    [11, 12, 13],              # length 3
]
labels = [0, 1, 0, 1]

dataset = SeqDataset(sequences, labels)
loader = DataLoader(dataset, batch_size=2, collate_fn=pad_collate_fn)

for padded, labels, lengths in loader:
    print(f"Padded shape: {padded.shape}")
    print(f"Labels:       {labels}")
    print(f"Lengths:      {lengths}")
    # Padded shape: torch.Size([2, 5])  -- longest in this batch
    # Labels:       tensor([0, 1])
    # Lengths:      tensor([3, 2])
    break
```

### Custom Collate for Dict-Structured Data

```python
def dict_collate_fn(batch):
    """Collate a batch of dicts into a dict of tensors."""
    keys = batch[0].keys()
    collated = {}
    for key in keys:
        values = [item[key] for item in batch]
        if isinstance(values[0], torch.Tensor):
            collated[key] = torch.stack(values)
        else:
            collated[key] = torch.tensor(values)
    return collated


# Example
dict_dataset = [
    {"features": torch.randn(5), "label": 0, "weight": 1.0},
    {"features": torch.randn(5), "label": 1, "weight": 0.8},
]

collated = dict_collate_fn(dict_dataset)
print(collated.keys())
# dict_keys(['features', 'label', 'weight'])
print(f"Features: {collated['features'].shape}")  # torch.Size([2, 5])
print(f"Labels:   {collated['label']}")            # tensor([0, 1])
```

---

## 5.9 Learning Rate Schedulers

Schedulers adjust the learning rate during training to improve convergence and final performance.

### Comparison Table

| Scheduler | Key Idea | Best For | Hyperparameters |
|---|---|---|---|
| `StepLR` | Multiply by γ every γ epochs | Simple baselines | `step_size`, `gamma` |
| `MultiStepLR` | Multiply by γ at specific epochs | Milestone-based training | `milestones`, `gamma` |
| `CosineAnnealingLR` | Cosine decay to min_lr | General purpose, stable | `T_max`, `eta_min` |
| `ReduceLROnPlateau` | Reduce when metric plateaus | Adaptive, validation-driven | `patience`, `factor` |
| `OneCycleLR` | One cycle of warmup + annealing | Fast training (Smith 2017) | `max_lr`, `epochs`, `steps_per_epoch` |
| `CyclicLR` | Triangular cycling between bounds | Exploring loss landscape | `base_lr`, `max_lr`, `step_size_up` |

### Visual Representation of Schedules

```
Learning
Rate
  │
  │  ╭──╮  StepLR              ╭─────╮ MultiStepLR
  │──╯  ╰───────╮──────────╮──╯     ╰──────╮
  │             ╰──────────╰─────────────────╯
  │
  │  ╲         CosineAnnealingLR
  │   ╲─────────────────────────╲
  │    ╲                         ╲────────────
  │
  │      ╱╲        OneCycleLR
  │     ╱  ╲
  │    ╱    ╲
  │───╱      ╲──────────────────────────────
  │
  │  ╱╲  ╱╲  CyclicLR
  │ ╱  ╲╱  ╲╱╲
  │╱          ╲──────────────────────────────
  └──────────────────────────────────────── Epochs
```

### Complete Examples

```python
import torch
import torch.nn as nn
from torch.optim.lr_scheduler import (
    StepLR,
    MultiStepLR,
    CosineAnnealingLR,
    ReduceLROnPlateau,
    OneCycleLR,
    CyclicLR,
)

model = nn.Linear(10, 2)

# ── 1. StepLR: decay by gamma every step_size epochs ──
optimizer = torch.optim.SGD(model.parameters(), lr=0.1)
scheduler = StepLR(optimizer, step_size=10, gamma=0.1)

print("StepLR schedule:")
for epoch in range(30):
    scheduler.step()
    if epoch % 10 == 0:
        print(f"  Epoch {epoch:2d}: lr = {scheduler.get_last_lr()[0]:.6f}")
# Epoch  0: lr = 0.100000
# Epoch 10: lr = 0.010000
# Epoch 20: lr = 0.001000

# ── 2. MultiStepLR: decay at specific epochs ──
optimizer = torch.optim.SGD(model.parameters(), lr=0.1)
scheduler = MultiStepLR(optimizer, milestones=[30, 60, 90], gamma=0.1)

print("\nMultiStepLR schedule:")
for epoch in range(100):
    scheduler.step()
    if epoch in [0, 29, 30, 59, 60, 89, 90]:
        print(f"  Epoch {epoch:2d}: lr = {scheduler.get_last_lr()[0]:.6f}")
# Epoch  0: lr = 0.100000
# Epoch 29: lr = 0.100000
# Epoch 30: lr = 0.010000
# Epoch 59: lr = 0.010000
# Epoch 60: lr = 0.001000

# ── 3. CosineAnnealingLR ──
optimizer = torch.optim.SGD(model.parameters(), lr=0.1)
scheduler = CosineAnnealingLR(optimizer, T_max=50, eta_min=1e-5)

print("\nCosineAnnealingLR schedule:")
for epoch in range(0, 51, 10):
    lr = scheduler.get_last_lr()[0]
    print(f"  Epoch {epoch:2d}: lr = {lr:.6f}")
    for _ in range(10):
        scheduler.step()

# ── 4. ReduceLROnPlateau (validation-driven) ──
optimizer = torch.optim.SGD(model.parameters(), lr=0.1)
scheduler = ReduceLROnPlateau(optimizer, mode="min", factor=0.1, patience=5)

print("\nReduceLROnPlateau (simulated):")
fake_losses = [1.0, 0.9, 0.85, 0.83, 0.82, 0.82, 0.82, 0.82, 0.82, 0.81]
for epoch, loss in enumerate(fake_losses):
    scheduler.step(loss)
    print(f"  Epoch {epoch}: loss={loss:.3f}, lr={optimizer.param_groups[0]['lr']:.6f}")

# ── 5. OneCycleLR (must step per BATCH, not per epoch) ──
optimizer = torch.optim.SGD(model.parameters(), lr=0.01)
scheduler = OneCycleLR(optimizer, max_lr=0.1, steps_per_epoch=10, epochs=5)

print("\nOneCycleLR schedule (first 10 steps):")
for step in range(20):
    scheduler.step()
    if step % 5 == 0:
        print(f"  Step {step:2d}: lr = {optimizer.param_groups[0]['lr']:.6f}")

# ── 6. CyclicLR ──
optimizer = torch.optim.SGD(model.parameters(), lr=0.001)
scheduler = CyclicLR(optimizer, base_lr=0.001, max_lr=0.01, step_size_up=5)

print("\nCyclicLR schedule:")
for step in range(25):
    scheduler.step()
    if step % 5 == 0:
        print(f"  Step {step:2d}: lr = {optimizer.param_groups[0]['lr']:.6f}")
```

### Scheduler Usage Pattern

```python
# Per-epoch schedulers (StepLR, MultiStepLR, CosineAnnealingLR, ReduceLROnPlateau)
for epoch in range(num_epochs):
    train(...)
    val_loss = validate(...)
    scheduler.step()                    # StepLR, MultiStepLR, CosineAnnealingLR
    scheduler.step(val_loss)            # ReduceLROnPlateau (pass metric!)

# Per-batch schedulers (OneCycleLR, CyclicLR)
for epoch in range(num_epochs):
    for X_batch, y_batch in train_loader:
        loss = train_step(X_batch, y_batch)
        scheduler.step()                # Called after each optimizer.step()
```

---

## 5.10 Checkpointing

Checkpointing saves model state during training so you can resume training or deploy the best model.

### Save and Load `state_dict`

```python
import torch
import torch.nn as nn

class MyModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.fc1 = nn.Linear(20, 64)
        self.fc2 = nn.Linear(64, 10)

    def forward(self, x):
        x = torch.relu(self.fc1(x))
        return self.fc2(x)

model = MyModel()
optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
epoch = 10
loss = 0.235

# ═══════════════════════════════════════════════════════════
# 1. Save checkpoint (state_dict — RECOMMENDED)
# ═══════════════════════════════════════════════════════════
checkpoint = {
    "epoch": epoch,
    "model_state_dict": model.state_dict(),
    "optimizer_state_dict": optimizer.state_dict(),
    "loss": loss,
}
torch.save(checkpoint, "checkpoint.pt")
print("Checkpoint saved.")

# ═══════════════════════════════════════════════════════════
# 2. Load checkpoint
# ═══════════════════════════════════════════════════════════
model_new = MyModel()
optimizer_new = torch.optim.Adam(model_new.parameters(), lr=0.001)

checkpoint = torch.load("checkpoint.pt", weights_only=False)
model_new.load_state_dict(checkpoint["model_state_dict"])
optimizer_new.load_state_dict(checkpoint["optimizer_state_dict"])
start_epoch = checkpoint["epoch"] + 1
best_loss = checkpoint["loss"]

print(f"Resumed from epoch {start_epoch}, loss={best_loss:.4f}")
```

### Save and Load Entire Model

```python
# ═══════════════════════════════════════════════════════════
# 3. Save entire model (NOT recommended — fragile to class changes)
# ═══════════════════════════════════════════════════════════
torch.save(model, "model_full.pt")

model_loaded = torch.load("model_full.pt", weights_only=False)
print(f"Loaded model: {model_loaded}")
```

### Best Model Saving

```python
import copy

class TrainingState:
    """Manages checkpointing and best model tracking."""

    def __init__(self, model, optimizer, save_path="best_model.pt"):
        self.model = model
        self.optimizer = optimizer
        self.save_path = save_path
        self.best_val_loss = float("inf")
        self.best_model_state = None

    def update(self, val_loss, epoch):
        """Save best model if validation loss improved."""
        if val_loss < self.best_val_loss:
            self.best_val_loss = val_loss
            self.best_model_state = copy.deepcopy(self.model.state_dict())
            self._save_checkpoint(epoch, val_loss)
            print(f"  ★ New best model saved (val_loss={val_loss:.4f})")
            return True
        return False

    def _save_checkpoint(self, epoch, val_loss):
        torch.save({
            "epoch": epoch,
            "model_state_dict": self.model.state_dict(),
            "optimizer_state_dict": self.optimizer.state_dict(),
            "val_loss": val_loss,
        }, self.save_path)

    def load_best(self):
        """Load the best model weights."""
        if self.best_model_state is not None:
            self.model.load_state_dict(self.best_model_state)
        else:
            checkpoint = torch.load(self.save_path, weights_only=False)
            self.model.load_state_dict(checkpoint["model_state_dict"])
        return self.model


# Usage in training loop
model = MyModel()
optimizer = torch.optim.Adam(model.parameters())
state = TrainingState(model, optimizer)

# Simulate varying validation losses
for epoch, val_loss in enumerate([0.5, 0.3, 0.35, 0.2, 0.25, 0.18]):
    improved = state.update(val_loss, epoch)

state.load_best()
print(f"Best val loss: {state.best_val_loss}")
```

---

## 5.11 Early Stopping

Early stopping halts training when validation performance stops improving, preventing overfitting.

```python
import numpy as np
import copy

class EarlyStopping:
    """Stop training when validation loss stops improving.

    Args:
        patience: Number of epochs to wait after last improvement
        min_delta: Minimum improvement threshold
        restore_best_weights: If True, restore best weights on stop
        verbose: Print messages on improvement
    """

    def __init__(self, patience=7, min_delta=1e-4, restore_best_weights=True, verbose=True):
        self.patience = patience
        self.min_delta = min_delta
        self.restore_best_weights = restore_best_weights
        self.verbose = verbose

        self.counter = 0
        self.best_loss = float("inf")
        self.best_weights = None
        self.early_stop = False

    def __call__(self, val_loss, model):
        # Check if this is a meaningful improvement
        if val_loss < self.best_loss - self.min_delta:
            self.best_loss = val_loss
            self.counter = 0
            if self.restore_best_weights:
                self.best_weights = copy.deepcopy(model.state_dict())
            if self.verbose:
                print(f"  ✓ EarlyStopping: improved ({val_loss:.6f}), patience reset")
        else:
            self.counter += 1
            if self.verbose:
                print(
                    f"  ✗ EarlyStopping: no improvement "
                    f"({self.counter}/{self.patience})"
                )
            if self.counter >= self.patience:
                self.early_stop = True
                if self.restore_best_weights and self.best_weights is not None:
                    model.load_state_dict(self.best_weights)
                    if self.verbose:
                        print(f"  ↩ Restored best weights (loss={self.best_loss:.6f})")

    def reset(self):
        """Reset early stopping state."""
        self.counter = 0
        self.best_loss = float("inf")
        self.best_weights = None
        self.early_stop = False


# ── Demo: training with early stopping ──
torch.manual_seed(42)
model = nn.Linear(10, 1)
criterion = nn.MSELoss()
optimizer = torch.optim.SGD(model.parameters(), lr=0.01)
early_stopper = EarlyStopping(patience=5, min_delta=1e-3, verbose=True)

# Simulate validation losses that improve then plateau
fake_val_losses = [1.0, 0.8, 0.6, 0.5, 0.45, 0.44, 0.44, 0.44, 0.44, 0.44]

for epoch, val_loss in enumerate(fake_val_losses):
    print(f"\nEpoch {epoch}: val_loss={val_loss:.4f}")
    early_stopper(val_loss, model)
    if early_stopper.early_stop:
        print(f"\n⛔ Early stopping triggered at epoch {epoch}")
        break
```

---

## 5.12 Gradient Accumulation

Gradient accumulation simulates large batch sizes when GPU memory is limited. You accumulate gradients over multiple small batches before performing an optimizer step.

```
┌─────────────────────────────────────────────────────────┐
│           GRADIENT ACCUMULATION                          │
│                                                         │
│  micro_batch_1 ──▶ loss.backward()  ─┐                  │
│  micro_batch_2 ──▶ loss.backward()  ─┤ accumulate       │
│  micro_batch_3 ──▶ loss.backward()  ─┤ gradients        │
│  micro_batch_4 ──▶ loss.backward()  ─┘                  │
│                                          │               │
│                                          ▼               │
│                         optimizer.step() + zero_grad()   │
│                                                         │
│  Effective batch = micro_batch × accumulation_steps      │
│  e.g., 4 × 8 = effective batch of 32                    │
└─────────────────────────────────────────────────────────┘
```

```python
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset

# ── Setup ──
torch.manual_seed(42)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

model = nn.Sequential(
    nn.Linear(64, 128),
    nn.ReLU(),
    nn.Linear(128, 10),
).to(device)

criterion = nn.CrossEntropyLoss()
optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)

# Hyperparameters
micro_batch_size = 8
accumulation_steps = 4
effective_batch_size = micro_batch_size * accumulation_steps  # 32

# ── Fake dataset ──
dataset = TensorDataset(
    torch.randn(256, 64),
    torch.randint(0, 10, (256,))
)
loader = DataLoader(dataset, batch_size=micro_batch_size, shuffle=True)

# ── Training loop with gradient accumulation ──
model.train()
optimizer.zero_grad()

for step, (X, y) in enumerate(loader):
    X, y = X.to(device), y.to(device)

    # Forward pass
    loss = criterion(model(X), y)
    loss = loss / accumulation_steps  # Scale loss by accumulation steps

    # Backward pass (gradients accumulate in .grad)
    loss.backward()

    # Step optimizer every `accumulation_steps` micro-batches
    if (step + 1) % accumulation_steps == 0:
        # Optional: gradient clipping
        torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)

        optimizer.step()
        optimizer.zero_grad()
        print(f"  Optimizer step at micro-batch {step + 1}")

print(f"\nEffective batch size: {effective_batch_size}")
```

### Loss Scaling Note

The loss is divided by `accumulation_steps` so that the accumulated gradient is equivalent to a single large-batch gradient:

```python
# Without scaling: gradients are accumulation_steps× too large
loss = criterion(model(X), y) / accumulation_steps  # ✅ Correct
```

---

## 5.13 Mixed Precision Training with AMP

Mixed precision uses `float16` for forward/backward passes (faster on modern GPUs) while keeping master weights in `float32` for stability.

```
┌──────────────────────────────────────────────────────────────┐
│            MIXED PRECISION TRAINING FLOW                     │
│                                                              │
│  float32 master weights                                      │
│       │                                                      │
│       ▼                                                      │
│  ┌──────────────────┐                                        │
│  │  autocast()       │ ◀── Automatic float16 operations      │
│  │  Forward pass     │     (matmul, convolutions, etc.)      │
│  └──────┬───────────┘                                        │
│         │ float32 loss                                       │
│         ▼                                                    │
│  ┌──────────────────┐                                        │
│  │  GradScaler      │ ◀── Scales loss to prevent underflow   │
│  │  .scale(loss)    │                                        │
│  │  .backward()     │                                        │
│  └──────┬───────────┘                                        │
│         │                                                    │
│         ▼                                                    │
│  ┌──────────────────┐                                        │
│  │  .unscale_()     │ ◀── Unscale gradients back to float32  │
│  │  .step()         │     Check for inf/nan                  │
│  │  .update()       │ ◀── Adjust scale factor                │
│  └──────────────────┘                                        │
└──────────────────────────────────────────────────────────────┘
```

```python
import torch
import torch.nn as nn
from torch.cuda.amp import autocast, GradScaler

# ── Setup ──
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

model = nn.Sequential(
    nn.Linear(256, 512),
    nn.ReLU(),
    nn.Linear(512, 256),
    nn.ReLU(),
    nn.Linear(256, 10),
).to(device)

criterion = nn.CrossEntropyLoss()
optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)
scaler = GradScaler()

# ── Fake data ──
X_train = torch.randn(512, 256, device=device)
y_train = torch.randint(0, 10, (512,), device=device)

# ── Mixed precision training loop ──
model.train()
for epoch in range(3):
    for i in range(0, len(X_train), 32):
        X_batch = X_train[i:i+32]
        y_batch = y_train[i:i+32]

        optimizer.zero_grad()

        # Forward pass with autocast
        with autocast(device_type=device.type):
            output = model(X_batch)
            loss = criterion(output, y_batch)

        # Backward pass with gradient scaling
        scaler.scale(loss).backward()
        scaler.unscale_(optimizer)
        torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
        scaler.step(optimizer)
        scaler.update()

    print(f"Epoch {epoch}: loss = {loss.item():.4f}")

# ── Check if AMP is available ──
print(f"\nAMP available: {torch.cuda.is_available()}")
if torch.cuda.is_available():
    print(f"GPU: {torch.cuda.get_device_name()}")
    print(f"GPU memory: {torch.cuda.get_device_properties(0).total_mem / 1e9:.1f} GB")
```

### AMP Performance Tips

| Tip | Explanation |
|---|---|
| Use `autocast` not `half()` | `autocast` selectively applies float16 only where beneficial |
| Always use `GradScaler` | Prevents gradient underflow in float16 |
| Keep master weights in float32 | Ensures parameter updates remain precise |
| Don't use AMP with `double()` | Float64 is incompatible with autocast |
| Checkpoint with `model.state_dict()` | Saves float32 weights regardless of AMP |

---

## 5.14 Complete Training Pipeline

This section brings everything together into a single, complete, runnable training pipeline with validation, checkpointing, early stopping, learning rate scheduling, gradient accumulation, and mixed precision.

```python
"""
Complete PyTorch Training Pipeline
──────────────────────────────────
Demonstrates: Dataset, DataLoader, transforms, schedulers,
              checkpointing, early stopping, gradient accumulation,
              mixed precision, and validation.
"""

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset
from torch.optim.lr_scheduler import CosineAnnealingLR
from torch.cuda.amp import autocast, GradScaler
import copy
import time

# ═══════════════════════════════════════════════════════════
# 1. CONFIGURATION
# ═══════════════════════════════════════════════════════════
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
NUM_EPOCHS = 20
BATCH_SIZE = 64
MICRO_BATCH_SIZE = 32
ACCUMULATION_STEPS = BATCH_SIZE // MICRO_BATCH_SIZE
LEARNING_RATE = 1e-3
WEIGHT_DECAY = 1e-4
PATIENCE = 5
MIN_DELTA = 1e-4
USE_AMP = torch.cuda.is_available()

print(f"Device: {DEVICE}")
print(f"Effective batch size: {BATCH_SIZE} "
      f"(micro={MICRO_BATCH_SIZE} × accum={ACCUMULATION_STEPS})")
print(f"Mixed precision: {USE_AMP}")

# ═══════════════════════════════════════════════════════════
# 2. DATA PREPARATION
# ═══════════════════════════════════════════════════════════
torch.manual_seed(42)

# Simulate a classification dataset
X_train = torch.randn(2000, 64)
y_train = torch.randint(0, 10, (2000,))
X_val = torch.randn(400, 64)
y_val = torch.randint(0, 10, (400,))

train_dataset = TensorDataset(X_train, y_train)
val_dataset = TensorDataset(X_val, y_val)

train_loader = DataLoader(
    train_dataset,
    batch_size=MICRO_BATCH_SIZE,
    shuffle=True,
    num_workers=0,
    pin_memory=(DEVICE.type == "cuda"),
    drop_last=True,
)

val_loader = DataLoader(
    val_dataset,
    batch_size=128,
    shuffle=False,
    num_workers=0,
    pin_memory=(DEVICE.type == "cuda"),
)

# ═══════════════════════════════════════════════════════════
# 3. MODEL DEFINITION
# ═══════════════════════════════════════════════════════════
class Classifier(nn.Module):
    def __init__(self, input_dim=64, num_classes=10):
        super().__init__()
        self.network = nn.Sequential(
            nn.Linear(input_dim, 128),
            nn.BatchNorm1d(128),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(128, 64),
            nn.BatchNorm1d(64),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(64, num_classes),
        )

    def forward(self, x):
        return self.network(x)

model = Classifier().to(DEVICE)

# ═══════════════════════════════════════════════════════════
# 4. LOSS, OPTIMIZER, SCHEDULER
# ═══════════════════════════════════════════════════════════
criterion = nn.CrossEntropyLoss()
optimizer = optim.AdamW(model.parameters(), lr=LEARNING_RATE, weight_decay=WEIGHT_DECAY)
scheduler = CosineAnnealingLR(optimizer, T_max=NUM_EPOCHS, eta_min=1e-6)
scaler = GradScaler(enabled=USE_AMP)

# ═══════════════════════════════════════════════════════════
# 5. EARLY STOPPING
# ═══════════════════════════════════════════════════════════
class EarlyStopping:
    def __init__(self, patience=7, min_delta=1e-4):
        self.patience = patience
        self.min_delta = min_delta
        self.counter = 0
        self.best_loss = float("inf")
        self.best_weights = None
        self.should_stop = False

    def __call__(self, val_loss, model):
        if val_loss < self.best_loss - self.min_delta:
            self.best_loss = val_loss
            self.counter = 0
            self.best_weights = copy.deepcopy(model.state_dict())
        else:
            self.counter += 1
            if self.counter >= self.patience:
                self.should_stop = True
                if self.best_weights is not None:
                    model.load_state_dict(self.best_weights)

early_stopping = EarlyStopping(patience=PATIENCE, min_delta=MIN_DELTA)

# ═══════════════════════════════════════════════════════════
# 6. TRAINING & VALIDATION FUNCTIONS
# ═══════════════════════════════════════════════════════════
def train_one_epoch(model, loader, criterion, optimizer, scaler, accumulation_steps):
    """Train for one epoch with gradient accumulation and optional AMP."""
    model.train()
    total_loss = 0.0
    correct = 0
    total = 0

    optimizer.zero_grad()

    for step, (X_batch, y_batch) in enumerate(loader):
        X_batch = X_batch.to(DEVICE, non_blocking=True)
        y_batch = y_batch.to(DEVICE, non_blocking=True)

        # Mixed precision forward
        with autocast(device_type=DEVICE.type, enabled=USE_AMP):
            output = model(X_batch)
            loss = criterion(output, y_batch) / accumulation_steps

        # Backward with gradient scaling
        scaler.scale(loss).backward()

        # Step optimizer after accumulating enough micro-batches
        if (step + 1) % accumulation_steps == 0:
            scaler.unscale_(optimizer)
            torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
            scaler.step(optimizer)
            scaler.update()
            optimizer.zero_grad()

        total_loss += loss.item() * accumulation_steps
        _, predicted = output.max(1)
        total += y_batch.size(0)
        correct += predicted.eq(y_batch).sum().item()

    avg_loss = total_loss / len(loader)
    accuracy = correct / total
    return avg_loss, accuracy


@torch.no_grad()
def validate(model, loader, criterion):
    """Validate the model."""
    model.eval()
    total_loss = 0.0
    correct = 0
    total = 0

    for X_batch, y_batch in loader:
        X_batch = X_batch.to(DEVICE, non_blocking=True)
        y_batch = y_batch.to(DEVICE, non_blocking=True)

        with autocast(device_type=DEVICE.type, enabled=USE_AMP):
            output = model(X_batch)
            loss = criterion(output, y_batch)

        total_loss += loss.item()
        _, predicted = output.max(1)
        total += y_batch.size(0)
        correct += predicted.eq(y_batch).sum().item()

    avg_loss = total_loss / len(loader)
    accuracy = correct / total
    return avg_loss, accuracy


# ═══════════════════════════════════════════════════════════
# 7. MAIN TRAINING LOOP
# ═══════════════════════════════════════════════════════════
print(f"\n{'='*70}")
print(f"{'Epoch':>6} | {'Train Loss':>10} | {'Train Acc':>9} | "
      f"{'Val Loss':>8} | {'Val Acc':>7} | {'LR':>10} | {'Time':>6}")
print(f"{'='*70}")

best_val_acc = 0.0

for epoch in range(NUM_EPOCHS):
    start_time = time.time()

    # Train
    train_loss, train_acc = train_one_epoch(
        model, train_loader, criterion, optimizer, scaler, ACCUMULATION_STEPS
    )

    # Validate
    val_loss, val_acc = validate(model, val_loader, criterion)

    # Learning rate schedule
    current_lr = optimizer.param_groups[0]["lr"]
    scheduler.step()

    # Timing
    elapsed = time.time() - start_time

    # Print metrics
    print(
        f"{epoch+1:6d} | {train_loss:10.4f} | {train_acc:8.1%} | "
        f"{val_loss:8.4f} | {val_acc:6.1%} | {current_lr:10.6f} | {elapsed:5.1f}s"
    )

    # Track best model
    if val_acc > best_val_acc:
        best_val_acc = val_acc
        torch.save({
            "epoch": epoch,
            "model_state_dict": model.state_dict(),
            "optimizer_state_dict": optimizer.state_dict(),
            "scheduler_state_dict": scheduler.state_dict(),
            "val_acc": val_acc,
            "val_loss": val_loss,
        }, "best_model.pt")

    # Early stopping
    early_stopping(val_loss, model)
    if early_stopping.should_stop:
        print(f"\n⛔ Early stopping at epoch {epoch + 1}")
        break

print(f"\n{'='*70}")
print(f"Best validation accuracy: {best_val_acc:.1%}")

# ═══════════════════════════════════════════════════════════
# 8. RESUME FROM CHECKPOINT
# ═══════════════════════════════════════════════════════════
checkpoint = torch.load("best_model.pt", weights_only=False)
model.load_state_dict(checkpoint["model_state_dict"])
print(f"\nLoaded best model from epoch {checkpoint['epoch']+1} "
      f"with val_acc={checkpoint['val_acc']:.1%}")
```

### Pipeline Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                    COMPLETE TRAINING PIPELINE                          │
│                                                                        │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────────┐     │
│  │   Dataset     │───▶│  DataLoader   │───▶│  Training Loop       │     │
│  │  (custom or   │    │  - batching   │    │                      │     │
│  │   TensorData) │    │  - shuffling  │    │  ┌────────────────┐  │     │
│  └──────────────┘    │  - pin_memory │    │  │  AMP autocast  │  │     │
│                       │  - workers    │    │  │  GradScaler    │  │     │
│  ┌──────────────┐    └──────────────┘    │  └───────┬────────┘  │     │
│  │  Transforms   │                       │          │            │     │
│  │  - Resize     │                       │  ┌───────▼────────┐  │     │
│  │  - Normalize  │                       │  │  Forward Pass   │  │     │
│  │  - Augment    │                       │  └───────┬────────┘  │     │
│  └──────────────┘                       │          │            │     │
│                                          │  ┌───────▼────────┐  │     │
│  ┌──────────────┐    ┌──────────────┐   │  │ Loss / Scale   │  │     │
│  │  Scheduler    │◀──│  Optimizer    │◀──│  └───────┬────────┘  │     │
│  │  - Cosine     │   │  - AdamW     │   │          │            │     │
│  │  - Step       │   │  - GradClip  │   │  ┌───────▼────────┐  │     │
│  └──────────────┘    └──────────────┘   │  │  Backward Pass  │  │     │
│                                          │  └───────┬────────┘  │     │
│  ┌──────────────┐    ┌──────────────┐   │          │            │     │
│  │  EarlyStop    │◀──│  Validation   │◀──│  ┌───────▼────────┐  │     │
│  │  - patience   │   │  - metrics   │   │  │  Grad Accum     │  │     │
│  │  - restore    │   │  - eval mode │   │  │  optimizer.step │  │     │
│  └──────────────┘    └──────────────┘   │  └────────────────┘  │     │
│                                          └──────────────────────┘     │
│  ┌──────────────┐                                                     │
│  │  Checkpointing│  Save best model, resume training                   │
│  └──────────────┘                                                     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Summary

This chapter covered every component of a production-grade PyTorch training pipeline:

| Component | Key Takeaway |
|---|---|
| **Dataset** | Subclass `Dataset`, implement `__getitem__` and `__len__` |
| **TensorDataset** | Quick wrapper for in-memory tensor data |
| **DataLoader** | Batching, shuffling, parallel loading, pinned memory |
| **Custom Datasets** | Images (PIL + file paths), text (tokenization + padding), CSV |
| **Transforms** | Compose pipelines; use `ToTensor` + `Normalize` as baseline |
| **Augmentation** | Scale aggression with dataset size; flip, crop, color jitter |
| **Tokenization** | Build vocab → numericalize → pad to batch |
| **collate_fn** | Custom batching for variable-length data (e.g., `pad_sequence`) |
| **Schedulers** | CosineAnnealing for general use; ReduceLROnPlateau for adaptive |
| **Checkpointing** | Save `state_dict` dict (not whole model); save optimizer + epoch |
| **Early Stopping** | Monitor val_loss; restore best weights on plateau |
| **Gradient Accumulation** | Divide loss by steps; effective batch = micro × accumulation |
| **AMP** | `autocast` + `GradScaler` for 2× speedup on modern GPUs |
| **Complete Pipeline** | Combine all pieces; always separate train/val; track best model |

---

## Practice Exercises

### Exercise 1: Custom Dataset
Create a `Dataset` subclass that loads text files from a directory where each subfolder name is the class label. Implement `__getitem__` to return a tokenized tensor and integer label.

### Exercise 2: DataLoader Tuning
Experiment with different `num_workers` values (0, 2, 4, 8) on an image dataset. Measure the time per epoch and plot the results. At what point does adding more workers stop helping?

### Exercise 3: Augmentation Comparison
Train the same model on CIFAR-10 with three augmentation strategies: none, moderate, aggressive. Compare validation accuracy and convergence speed. Which strategy gives the best generalization?

### Exercise 4: Scheduler Comparison
Train a model with `StepLR`, `CosineAnnealingLR`, and `ReduceLROnPlateau`. Plot the learning rate over time and compare final validation accuracy. When does each scheduler shine?

### Exercise 5: Gradient Accumulation
Verify that training with `batch_size=32, accumulation_steps=1` produces equivalent results to `batch_size=8, accumulation_steps=4` over the same number of epochs. Plot the loss curves to compare.

### Exercise 6: Mixed Precision Benchmarking
Measure training time and GPU memory usage with and without AMP on a ResNet-18. What is the speedup? Does accuracy change?

### Exercise 7: Early Stopping Sensitivity
Test early stopping with `patience ∈ {3, 5, 10, 20}` and `min_delta ∈ {1e-3, 1e-4, 1e-5}`. How do these hyperparameters affect the number of epochs trained and final validation accuracy?

### Exercise 8: Build a Complete Pipeline
Build a complete training pipeline from scratch for image classification on a dataset of your choice. Include all components: custom Dataset, transforms (train vs. val), DataLoader, model, optimizer, scheduler, gradient accumulation, AMP, early stopping, checkpointing, and a validation loop. Aim for maximum test accuracy.

---

*End of Chapter 5 — Next: Chapter 6 — Advanced Training Techniques*
