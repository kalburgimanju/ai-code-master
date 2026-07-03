# Chapter 13: PyTorch Ecosystem

*By Manjunath Kalburgi*

---

PyTorch is far more than a single tensor-computation library. Over the past several years, a rich ecosystem of first-party and community libraries has grown around the core `torch` package, covering computer vision, audio, text, graphs, reinforcement learning, model serving, and high-level training abstractions. This chapter surveys the entire landscape so you can choose the right tool for every stage of a machine-learning project.

---

## 13.1 Ecosystem Overview

The diagram below shows how the major libraries relate to the central PyTorch engine.

```
┌─────────────────────────────────────────────────────────────────┐
│                      PyTorch Ecosystem                         │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────┐ │
│  │  torchvision  │  │  torchaudio   │  │     torchtext         │ │
│  │  - transforms │  │  - spectro    │  │     - tokenization    │ │
│  │  - datasets   │  │  - MFCC       │  │     - vocab           │ │
│  │  - models     │  │  - datasets   │  │     - data pipeline   │ │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬────────────┘ │
│         │                 │                      │              │
│  ┌──────┴─────────────────┴──────────────────────┴───────────┐  │
│  │                    torch (Core)                            │  │
│  │  tensor ops · autograd · nn · optim · DataLoader · CUDA   │  │
│  └──────┬─────────────────┬──────────────────────┬───────────┘  │
│         │                 │                      │              │
│  ┌──────┴───────┐  ┌─────┴────────┐  ┌─────────┴───────────┐  │
│  │   torchdata   │  │   torchrl    │  │  PyTorch Geometric   │  │
│  │  DataPipes    │  │   RL envs    │  │  GNN layers/data     │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  High-Level / Serving / Integration                      │   │
│  │  PyTorch Lightning │ TorchServe │ Hugging Face │ ONNX   │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 13.2 torchvision

`torchvision` is the most widely used companion library. It provides ready-made datasets, image transforms, pre-trained models, and utilities for object detection and segmentation.

### 13.2.1 Installation

```bash
pip install torchvision
```

### 13.2.2 Transforms

The `torchvision.transforms` module provides composable image preprocessing pipelines.

```python
from torchvision import transforms

# Training pipeline (with augmentation)
train_transform = transforms.Compose([
    transforms.RandomResizedCrop(224),
    transforms.RandomHorizontalFlip(p=0.5),
    transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
    transforms.ToTensor(),                          # HWC uint8 → CHW float32 [0,1]
    transforms.Normalize(mean=[0.485, 0.456, 0.406],   # ImageNet stats
                         std=[0.229, 0.224, 0.225]),
])

# Inference pipeline (no augmentation)
eval_transform = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std=[0.229, 0.224, 0.225]),
])
```

| Transform | Purpose | Typical Use |
|-----------|---------|-------------|
| `RandomResizedCrop` | Random crop + resize | Training augmentation |
| `RandomHorizontalFlip` | Mirror images | Training augmentation |
| `ColorJitter` | Adjust brightness/contrast/saturation/hue | Training augmentation |
| `ToTensor` | PIL → Tensor, scales to [0,1] | Every pipeline |
| `Normalize` | Channel-wise normalization | Every pipeline |
| `Resize` | Resize shortest edge | Inference |
| `CenterCrop` | Deterministic crop | Inference |
| `RandomAffine` | Rotation, translation, shear | Training augmentation |
| `GaussianBlur` | Blur augmentation | Training augmentation |
| `RandomErasing` | Cutout-style erasing | Training (after ToTensor) |

Starting from v0.15, `torchvision.transforms.v2` provides a newer API with support for bounding boxes and masks:

```python
from torchvision.transforms import v2

transforms_v2 = v2.Compose([
    v2.RandomResizedCrop(224, antialias=True),
    v2.RandomHorizontalFlip(p=0.5),
    v2.ToDtype(torch.float32, scale=True),  # replaces ToTensor
    v2.Normalize(mean=[0.485, 0.456, 0.406],
                 std=[0.229, 0.224, 0.225]),
])
```

### 13.2.3 Datasets

torchvision ships several standard vision datasets:

```python
from torchvision import datasets

# MNIST — handwritten digits (28×28, grayscale, 10 classes)
mnist = datasets.MNIST(root='./data', train=True, download=True,
                        transform=transforms.ToTensor())

# CIFAR-10 — 32×32 color, 10 classes, 50k train / 10k test
cifar10 = datasets.CIFAR10(root='./data', train=True, download=True,
                            transform=train_transform)

# ImageNet (requires manual download or torchvision >= 0.15 with ffcv)
# imagenet = datasets.ImageNet(root='/data/imagenet', split='train',
#                               transform=train_transform)

# COCO (detection / segmentation)
from torchvision.datasets import COCO
# coco = COCO(root='/data/coco', annFile='.../instances_train2017.json')
```

### 13.2.4 Pre-trained Models

```python
import torch
from torchvision import models

# ---------- Image Classification ----------
resnet50 = models.resnet50(weights=models.ResNet50_Weights.IMAGENET1K_V2)
resnet50.eval()

# EfficientNet-B0
efficientnet = models.efficientnet_b0(weights=models.EfficientNet_B0_Weights.IMAGENET1K_V1)

# Vision Transformer (ViT-B/16)
vit = models.vit_b_16(weights=models.ViT_B_16_Weights.IMAGENET1K_V1)

# ---------- Object Detection ----------
# Faster R-CNN (pre-trained on COCO)
faster_rcnn = models.detection.fasterrcnn_resnet50_fpn(
    weights=models.detection.FasterRCNN_ResNet50_FPN_Weights.COCO_V1
)

# ---------- Semantic Segmentation ----------
# DeepLabV3 with ResNet-50 backbone
deeplabv3 = models.segmentation.deeplabv3_resnet50(
    weights=models.segmentation.DeepLabV3_ResNet50_Weights.COCO_V1
)

# ---------- Video Classification ----------
r3d_18 = models.video.r3d_18(weights=models.video.R3D_18_Weights.KINETICS400_V1)
```

**Model Zoo Summary:**

| Task | Models Available | Pre-trained Weights |
|------|-----------------|---------------------|
| Classification | ResNet, VGG, DenseNet, EfficientNet, ViT, Swin | ImageNet-1K / ImageNet-21K |
| Detection | Faster R-CNN, RetinaNet, FCOS, SSD, DETR | COCO |
| Segmentation | DeepLabV3, FCN, LR-ASPP | COCO / Pascal VOC |
| Video | R3D-18, R(2+1)D, CSN | Kinetics-400 |

---

## 13.3 torchaudio

`torchaudio` provides audio loading, transforms (spectrograms, MFCC), and pretrained speech models.

### 13.3.1 Installation

```bash
pip install torchaudio
```

### 13.3.2 Loading and Processing Audio

```python
import torch
import torchaudio

# Load an audio file (returns waveform tensor + sample rate)
waveform, sample_rate = torchaudio.load('speech.wav')
print(waveform.shape)    # [channels, num_samples]
print(sample_rate)        # e.g. 16000

# Resample
resampler = torchaudio.transforms.Resample(orig_freq=44100, new_freq=16000)
waveform_16k = resampler(waveform)
```

### 13.3.3 Spectrograms and MFCC

```python
# Mel Spectrogram
mel_spec = torchaudio.transforms.MelSpectrogram(
    sample_rate=16000,
    n_fft=512,
    hop_length=160,
    n_mels=80,
)
mels = mel_spec(waveform_16k)        # [1, 80, time_steps]

# Convert to log scale
log_mels = torchaudio.transforms.AmplitudeToDB()(mels)

# MFCC
mfcc_transform = torchaudio.transforms.MFCC(
    sample_rate=16000,
    n_mfcc=40,
    melkwargs={'n_fft': 512, 'hop_length': 160, 'n_mels': 80},
)
mfccs = mfcc_transform(waveform_16k)  # [1, 40, time_steps]
```

### 13.3.4 Audio Datasets

```python
from torchaudio.datasets import LIBRISPEECH, SPEECHCOMMANDS

# Speech Commands (Google) — 30 short-command classes
speech_commands = SPEECHCOMMANDS(root='./data', download=True,
                                  subset='train')

# LibriSpeech — large-scale ASR corpus
librispeech = LIBRISPEECH(root='./data', url='train-clean-100',
                           download=True)
```

### 13.3.5 Pre-trained Speech Models

```python
from torchaudio.pipelines import wav2vec2_base, Emformer_RNNT_BASE

# Wav2Vec 2.0 (self-supervised speech representations)
bundle = wav2vec2_base
model = bundle.get_model()
# model(waveform) → features

# Emformer RNN-T (online ASR)
asr_bundle = Emformer_RNNT_BASE
asr_model = asr_bundle.get_model()
labels = asr_bundle.get_labels()
```

---

## 13.4 torchtext (Legacy and Revamped)

> **Note:** As of PyTorch 2.x, `torchtext` has been deprecated from the PyTorch core distribution. The community has forked it into `torchtext-nightly` and third-party alternatives like `datasets` (Hugging Face) are now preferred. This section covers the concepts for historical reference.

### 13.4.1 Tokenization

```python
from torchtext.data.utils import get_tokenizer

# Basic English tokenizer (split on whitespace)
tokenizer = get_tokenizer('basic_english')
tokens = tokenizer("PyTorch is awesome for deep learning!")
# ['pytorch', 'is', 'awesome', 'for', 'deep', 'learning', '!']
```

### 13.4.2 Vocabulary

```python
from torchtext.vocab import build_vocab_from_iterator

def yield_tokens(data_iter):
    for text, _ in data_iter:
        yield tokenizer(text)

vocab = build_vocab_from_iterator(yield_tokens(train_iter),
                                   specials=['<unk>', '<pad>'],
                                   min_freq=2)
vocab.set_default_index(vocab['<unk>'])

# Encode a sentence
encoded = vocab(tokenizer("PyTorch is great"))
# [0, 5, 3, 12]  (0 = <unk> for unknown words)
```

### 13.4.3 Data Pipelines

```python
from torch.utils.data import DataLoader
from torch.nn.utils.rnn import pad_sequence

def collate_batch(batch):
    label_list, text_list, lengths = [], [], []
    for text, label in batch:
        label_list.append(label)
        processed = torch.tensor(vocab(tokenizer(text)), dtype=torch.int64)
        text_list.append(processed)
        lengths.append(len(processed))
    labels = torch.tensor(label_list)
    texts = pad_sequence(text_list, batch_first=True, padding_value=vocab['<pad>'])
    return texts, labels, lengths

dataloader = DataLoader(train_dataset, batch_size=32, shuffle=True,
                         collate_fn=collate_batch)
```

---

## 13.5 PyTorch Lightning

PyTorch Lightning (now part of **Lightning AI**) removes boilerplate from the training loop while keeping full PyTorch flexibility.

### 13.5.1 Installation

```bash
pip install lightning
```

### 13.5.2 LightningModule

```python
import lightning as L
import torch
import torch.nn as nn
from torchmetrics import Accuracy

class CIFAR10Net(L.LightningModule):
    def __init__(self, lr=1e-3):
        super().__init__()
        self.save_hyperparameters()
        self.features = nn.Sequential(
            nn.Conv2d(3, 32, 3, padding=1), nn.BatchNorm2d(32), nn.ReLU(),
            nn.MaxPool2d(2),
            nn.Conv2d(32, 64, 3, padding=1), nn.BatchNorm2d(64), nn.ReLU(),
            nn.MaxPool2d(2),
            nn.Conv2d(64, 128, 3, padding=1), nn.BatchNorm2d(128), nn.ReLU(),
            nn.AdaptiveAvgPool2d(1),
        )
        self.classifier = nn.Linear(128, 10)
        self.loss_fn = nn.CrossEntropyLoss()
        self.accuracy = Accuracy(task='multiclass', num_classes=10)

    def forward(self, x):
        x = self.features(x)
        x = x.view(x.size(0), -1)
        return self.classifier(x)

    def training_step(self, batch, batch_idx):
        x, y = batch
        logits = self(x)
        loss = self.loss_fn(logits, y)
        acc = self.accuracy(logits, y)
        self.log('train_loss', loss, prog_bar=True)
        self.log('train_acc', acc, prog_bar=True)
        return loss

    def validation_step(self, batch, batch_idx):
        x, y = batch
        logits = self(x)
        loss = self.loss_fn(logits, y)
        acc = self.accuracy(logits, y)
        self.log('val_loss', loss, prog_bar=True)
        self.log('val_acc', acc, prog_bar=True)

    def configure_optimizers(self):
        return torch.optim.Adam(self.parameters(), lr=self.hparams.lr)
```

### 13.5.3 LightningDataModule

```python
from torchvision import datasets, transforms
from torch.utils.data import DataLoader, random_split

class CIFAR10DataModule(L.LightningDataModule):
    def __init__(self, data_dir='./data', batch_size=64):
        super().__init__()
        self.data_dir = data_dir
        self.batch_size = batch_size
        self.transform = transforms.Compose([
            transforms.ToTensor(),
            transforms.Normalize((0.4914, 0.4822, 0.4465),
                                 (0.2470, 0.2435, 0.2616)),
        ])

    def setup(self, stage=None):
        full = datasets.CIFAR10(self.data_dir, train=True,
                                 download=True, transform=self.transform)
        self.train, self.val = random_split(full, [45000, 5000])
        self.test = datasets.CIFAR10(self.data_dir, train=False,
                                      download=True, transform=self.transform)

    def train_dataloader(self):
        return DataLoader(self.train, batch_size=self.batch_size,
                          shuffle=True, num_workers=2)

    def val_dataloader(self):
        return DataLoader(self.val, batch_size=self.batch_size, num_workers=2)

    def test_dataloader(self):
        return DataLoader(self.test, batch_size=self.batch_size, num_workers=2)
```

### 13.5.4 Trainer and Callbacks

```python
from lightning.pytorch.callbacks import ModelCheckpoint, EarlyStopping

# Callbacks
checkpoint_cb = ModelCheckpoint(monitor='val_loss', mode='min',
                                 save_top_k=3, filename='cifar10-{epoch:02d}')
early_stop_cb = EarlyStopping(monitor='val_loss', patience=5, mode='min')

# Trainer
trainer = L.Trainer(
    max_epochs=50,
    accelerator='auto',         # auto-selects GPU / TPU / CPU
    callbacks=[checkpoint_cb, early_stop_cb],
    log_every_n_steps=10,
    deterministic=True,
)

model = CIFAR10Net(lr=1e-3)
dm = CIFAR10DataModule(batch_size=64)

trainer.fit(model, datamodule=dm)
trainer.test(model, datamodule=dm)
```

### 13.5.5 Comparison: Pure PyTorch vs. Lightning

| Aspect | Pure PyTorch | Lightning |
|--------|-------------|-----------|
| Training loop | Manual `for epoch in ...` | `Trainer.fit()` handles it |
| GPU placement | Manual `.to(device)`, `.cuda()` | Automatic (`accelerator='auto'`) |
| Mixed precision | Manual `autocast` + `GradScaler` | `precision='16-mixed'` flag |
| Checkpointing | Manual `torch.save` | Built-in callbacks |
| Logging | Manual `print` or tensorboard | Automatic with `self.log()` |
| Multi-GPU / DDP | Manual `DistributedDataParallel` | `Trainer(strategy='ddp')` |
| Early stopping | Manual implementation | Callback |

---

## 13.6 Hugging Face Integration

Hugging Face has become the de facto hub for pre-trained models, datasets, and tokenizers, with deep PyTorch integration.

### 13.6.1 Installation

```bash
pip install transformers datasets tokenizers huggingface_hub
```

### 13.6.2 Using Transformers

```python
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch

# Load a pre-trained BERT model for sentiment analysis
tokenizer = AutoTokenizer.from_pretrained('bert-base-uncased')
model = AutoModelForSequenceClassification.from_pretrained(
    'bert-base-uncased', num_labels=2
)

inputs = tokenizer("This movie was absolutely fantastic!",
                    return_tensors='pt', padding=True, truncation=True)

with torch.no_grad():
    outputs = model(**inputs)
    prediction = torch.argmax(outputs.logits, dim=-1)
    print(f"Predicted class: {prediction.item()}")
```

### 13.6.3 Fine-tuning with PyTorch

```python
from transformers import AutoModelForSequenceClassification, get_linear_schedule_with_warmup
from torch.utils.data import DataLoader
from datasets import load_dataset

# Load GLUE SST-2 dataset
dataset = load_dataset('glue', 'sst2')
tokenizer = AutoTokenizer.from_pretrained('bert-base-uncased')

def tokenize_fn(examples):
    return tokenizer(examples['sentence'], padding='max_length',
                     truncation=True, max_length=128)

tokenized = dataset.map(tokenize_fn, batched=True)
tokenized.set_format('torch', columns=['input_ids', 'attention_mask', 'label'])

train_loader = DataLoader(tokenized['train'], batch_size=16, shuffle=True)
val_loader = DataLoader(tokenized['validation'], batch_size=32)

# Model and optimizer
model = AutoModelForSequenceClassification.from_pretrained(
    'bert-base-uncased', num_labels=2
)
optimizer = torch.optim.AdamW(model.parameters(), lr=2e-5, weight_decay=0.01)

total_steps = len(train_loader) * 3  # 3 epochs
scheduler = get_linear_schedule_with_warmup(
    optimizer, num_warmup_steps=int(0.1 * total_steps),
    num_training_steps=total_steps
)

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model.to(device)

# Training loop
for epoch in range(3):
    model.train()
    total_loss = 0
    for batch in train_loader:
        batch = {k: v.to(device) for k, v in batch.items()}
        outputs = model(**batch)
        loss = outputs.loss
        loss.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
        optimizer.step()
        scheduler.step()
        optimizer.zero_grad()
        total_loss += loss.item()
    print(f"Epoch {epoch+1}/3 — Avg Loss: {total_loss/len(train_loader):.4f}")

# Evaluation
model.eval()
correct = 0
with torch.no_grad():
    for batch in val_loader:
        batch = {k: v.to(device) for k, v in batch.items()}
        outputs = model(**batch)
        preds = torch.argmax(outputs.logits, dim=-1)
        correct += (preds == batch['labels']).sum().item()
print(f"Validation Accuracy: {correct / len(tokenized['validation']):.4f}")
```

### 13.6.4 Hugging Face Hub

```python
from huggingface_hub import HfApi, snapshot_download

# List models on the Hub
api = HfApi()
models = api.list_models(search="image-classification", limit=5)
for m in models:
    print(m.id)

# Download a model directory
snapshot_download(repo_id="google/vit-base-patch16-224",
                  local_dir="./vit_model")
```

---

## 13.7 torchdata

`torchdata` introduces **DataPipes** — composable, lazy data-loading primitives that replace the older `IterableDataset` pattern for complex pipelines.

### 13.7.1 Installation

```bash
pip install torchdata
```

### 13.7.2 DataPipes

```python
from torchdata.datapipes.iter import (
    FileOpener, IterDataPipe, MapDataPipe, HTTPReader, S3FileLoader,
)
import torch

# Map-style DataPipe (random access)
class MyDataset(MapDataPipe):
    def __init__(self, data, targets):
        self.data = data
        self.targets = targets

    def __getitem__(self, index):
        return self.data[index], self.targets[index]

    def __len__(self):
        return len(self.data)

# Iterable-style DataPipe (sequential)
from torchdata.datapipes.iter import IterableWrapper

dp = IterableWrapper(range(100))
dp = dp.filter(lambda x: x % 2 == 0)     # keep even numbers
dp = dp.map(lambda x: x ** 2)            # square them
dp = dp.batch(8)                          # batch into groups of 8

for batch in dp:
    print(batch)
    break
# [0, 4, 16, 36, 64, 100, 144, 196]
```

### 13.7.3 Integration with DataLoader

```python
from torch.utils.data import DataLoader

# DataPipes can be used directly with DataLoader
dataset = MyDataset(torch.randn(1000, 32), torch.randint(0, 10, (1000,)))
loader = DataLoader(dataset, batch_size=32, shuffle=True)

for x, y in loader:
    print(x.shape, y.shape)
    break
# torch.Size([32, 32]) torch.Size([32])
```

---

## 13.8 PyTorch Geometric (PyG)

PyTorch Geometric (PyG) is the leading library for **graph neural networks** (GNNs).

### 13.8.1 Installation

```bash
pip install torch-geometric
```

### 13.8.2 Core Concepts

In PyG, a graph is represented as a `Data` object:

```python
from torch_geometric.data import Data
import torch

# A graph with 4 nodes and 5 edges
edge_index = torch.tensor([
    [0, 1, 1, 2, 3],   # source nodes
    [1, 0, 2, 1, 2],   # target nodes
], dtype=torch.long)

x = torch.randn(4, 16)       # 4 nodes, 16-dim features each
edge_attr = torch.randn(5, 8) # 5 edges, 8-dim features each

graph = Data(x=x, edge_index=edge_index, edge_attr=edge_attr)
print(graph)
# Data(x=[4, 16], edge_index=[2, 5], edge_attr=[5, 8])
```

### 13.8.3 Example: Node Classification with GCN

```python
from torch_geometric.nn import GCNConv
from torch_geometric.datasets import Planetoid
from torch_geometric.transforms import NormalizeFeatures

# Cora citation network (2708 nodes, 5429 edges, 7 classes)
dataset = Planetoid(root='./data/Cora', name='Cora',
                     transform=NormalizeFeatures())
data = dataset[0]

class GCN(torch.nn.Module):
    def __init__(self, in_channels, hidden_channels, out_channels):
        super().__init__()
        self.conv1 = GCNConv(in_channels, hidden_channels)
        self.conv2 = GCNConv(hidden_channels, out_channels)

    def forward(self, x, edge_index):
        x = self.conv1(x, edge_index).relu()
        x = self.conv2(x, edge_index)
        return x

model = GCN(dataset.num_features, 64, dataset.num_classes)
optimizer = torch.optim.Adam(model.parameters(), lr=0.01, weight_decay=5e-4)

# Training
model.train()
for epoch in range(200):
    optimizer.zero_grad()
    out = model(data.x, data.edge_index)
    loss = torch.nn.functional.cross_entropy(
        out[data.train_mask], data.y[data.train_mask]
    )
    loss.backward()
    optimizer.step()

# Evaluation
model.eval()
with torch.no_grad():
    pred = model(data.x, data.edge_index).argmax(dim=-1)
    correct = (pred[data.test_mask] == data.y[data.test_mask]).sum()
    acc = int(correct) / int(data.test_mask.sum())
    print(f'Test Accuracy: {acc:.4f}')
    # Test Accuracy: ~0.81
```

---

## 13.9 TorchServe

**TorchServe** is the official model-serving framework for PyTorch, providing REST API endpoints, model versioning, and multi-model management.

### 13.9.1 Installation

```bash
pip install torchserve torch-model-archiver
```

### 13.9.2 Packaging a Model

```python
# save_model.py
import torch
import torch.nn as nn

class SimpleNet(nn.Module):
    def __init__(self):
        super().__init__()
        self.fc = nn.Linear(784, 10)

    def forward(self, x):
        return self.fc(x)

model = SimpleNet()
torch.jit.script(model)  # or torch.jit.trace
model.save('model.pt')
```

```bash
# Package the model into a .mar file
torch-model-archiver --model-name mnist \
    --version 1.0 \
    --model-file model.py \
    --serialized-file model.pt \
    --handler image_classifier \
    --export-path ./model-store
```

### 13.9.3 Serving

```bash
# Start TorchServe
torchserve --start --model-store ./model-store \
    --models mnist=mnist.mar \
    --ts-config config.properties

# Make a prediction
curl http://localhost:8080/predictions/mnist -T test_image.jpg
```

---

## 13.10 torchrl (Reinforcement Learning)

`torchrl` provides composable, PyTorch-native abstractions for reinforcement learning.

### 13.10.1 Installation

```bash
pip install torchrl
```

### 13.10.2 Core Abstractions

```python
import torch
from torchrl.envs import GymEnv, TransformedEnv, ResizeObservation
from torchrl.modules import ProbabilisticActor, ValueOperator
from torchrl.collectors import MultiSyncDataCollector
from torchrl.objectives import DDPGLoss
from torchrl.trainers import ReplayBuffer

# Create an environment
env = GymEnv("Pendulum-v1")
env = TransformedEnv(env, ResizeObservation(env, (84, 84)))

# Define actor (policy network)
from torchrl.modules import TanhNormalPolicy

actor_net = ...  # CNN or MLP
policy = ProbabilisticActor(
    module=actor_net,
    in_keys=["observation"],
    out_keys=["action"],
    distribution_class=torch.distributions.Normal,
)

# Collector gathers experience from environments
collector = MultiSyncDataCollector(
    [env],
    policy,
    frames_per_batch=1024,
    total_frames=100_000,
)
```

---

## 13.11 Integration Comparison Table

| Library | Domain | Key Features | GPU Support | Pre-trained Models |
|---------|--------|-------------|-------------|-------------------|
| **torchvision** | Computer Vision | Transforms, datasets, models, detection, segmentation | Yes | ResNet, EfficientNet, ViT, Faster R-CNN, DeepLabV3 |
| **torchaudio** | Audio / Speech | Spectrograms, MFCC, audio I/O, ASR models | Yes | Wav2Vec 2.0, HuBERT, Emformer RNN-T |
| **torchtext** (deprecated) | NLP | Tokenization, vocab, data pipeline | Yes | None (use transformers instead) |
| **Lightning** | All | Training abstraction, callbacks, logging | Yes | N/A (trains any model) |
| **Transformers (HF)** | NLP / Vision / Audio | 200k+ models, tokenizers, training scripts | Yes | BERT, GPT, T5, ViT, Whisper, Wav2Vec |
| **torchdata** | Data Loading | DataPipes, composable pipelines | Yes | N/A |
| **PyG** | Graphs | GNN layers, graph datasets, message passing | Yes | Cora, PubMed, OGB benchmarks |
| **TorchServe** | Deployment | REST API, model versioning, batching | Yes | N/A (serves any model) |
| **torchrl** | Reinforcement Learning | Environments, collectors, replay buffers, losses | Yes | N/A |

---

## 13.12 Choosing the Right Tool

```
                        What is your task?
                             │
            ┌────────────────┼──────────────────┐
            │                │                  │
      Image / Video      Text / NLP       Audio / Speech
            │                │                  │
      torchvision     transformers /        torchaudio
                       HF datasets          (speech models)
            │                │                  │
            └────────┬───────┘                  │
                     │                          │
              Need to train efficiently?        │
                     │                          │
              PyTorch Lightning                 │
                     │                          │
                     └──────────┬───────────────┘
                                │
                          Deploy to production
                                │
                          TorchServe / ONNX Runtime
```

---

## 13.13 Summary

| Topic | Key Takeaway |
|-------|-------------|
| torchvision | First-class vision transforms, datasets (MNIST, CIFAR, ImageNet), and pre-trained models for classification, detection, and segmentation |
| torchaudio | Audio loading, mel spectrograms, MFCC, and pretrained ASR models (Wav2Vec 2.0, Emformer) |
| torchtext | Legacy NLP pipeline — replaced by Hugging Face `datasets` + `transformers` in practice |
| Lightning | Eliminates training-loop boilerplate; one `Trainer` call replaces hundreds of lines |
| Hugging Face | 200k+ pre-trained models, tokenizers, datasets — native PyTorch tensors |
| torchdata | Composable DataPipes for complex, lazy data-loading pipelines |
| PyG | The graph neural network library — GCN, GAT, message passing, graph datasets |
| TorchServe | Production model serving with REST APIs, versioning, and A/B testing |
| torchrl | Reinforcement learning with composable envs, collectors, and replay buffers |

---

## 13.14 Practice Exercises

### Exercise 1 — Explore torchvision Models
Load three different pre-trained models from `torchvision.models` (e.g., ResNet-50, EfficientNet-B0, ViT-B/16). Print the total number of parameters and the architecture of the final classification layer for each. Determine which model has the fewest parameters.

### Exercise 2 — Audio Pipeline with torchaudio
Create a complete audio processing pipeline:
1. Generate a synthetic sine wave at 440 Hz (1 second duration).
2. Apply a MelSpectrogram transform.
3. Apply AmplitudeToDB.
4. Visualize the resulting spectrogram using matplotlib.
5. Convert back to waveform using Griffin-Lim.

### Exercise 3 — Lightning Module
Rewrite any previous chapter's training loop (e.g., the CIFAR-10 CNN) as a `LightningModule` with `LightningDataModule`. Add:
- `ModelCheckpoint` callback saving the top 3 models by validation loss.
- `EarlyStopping` with patience of 5 epochs.
- Run training for 20 epochs and report the final test accuracy.

### Exercise 4 — Hugging Face Fine-tuning
Fine-tune `distilbert-base-uncased` on the AG News dataset (4-class news classification). Use the `datasets` library to load data and the `transformers` library for the model. Train for 3 epochs and report accuracy.

### Exercise 5 — Graph Neural Network
Load the Cora dataset using PyTorch Geometric. Implement a 3-layer GCN with hidden dimension 128 and train it for 300 epochs. Compare the test accuracy with a 2-layer GCN. Report both results and explain any differences.

### Exercise 6 — torchdata DataPipe
Implement an `IterDataPipe` that:
1. Reads lines from a large text file.
2. Tokenizes each line.
3. Filters out lines shorter than 5 tokens.
4. Pads sequences to a fixed length.
5. Batches and returns the data.

Connect it to a `DataLoader` and iterate over the first 5 batches.
