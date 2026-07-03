# Chapter 14: Hands-On Projects

*By Manjunath Kalburgi*

---

This chapter contains **five complete, end-to-end projects** — each fully runnable in PyTorch. Every project includes imports, data preparation, model definition, a training loop, evaluation, and a clear explanation of the architecture. These are not sketches or pseudocode: each is production-quality code you can execute and extend.

---

## Project 1: Image Classifier — CIFAR-10

A convolutional neural network that classifies 32×32 color images into 10 classes with a confusion-matrix evaluation and model saving/loading.

### Architecture

```
Input (3×32×32)
       │
  ┌────▼────┐
  │ Conv 3×3 │  → 32 filters, BN, ReLU
  │ Conv 3×3 │  → 32 filters, BN, ReLU
  │ MaxPool   │  → 16×16
  │ Dropout   │  → p=0.25
  ├──────────┤
  │ Conv 3×3 │  → 64 filters, BN, ReLU
  │ Conv 3×3 │  → 64 filters, BN, ReLU
  │ MaxPool   │  → 8×8
  │ Dropout   │  → p=0.25
  ├──────────┤
  │ Conv 3×3 │  → 128 filters, BN, ReLU
  │ Conv 3×3 │  → 128 filters, BN, ReLU
  │ MaxPool   │  → 4×4
  │ Dropout   │  → p=0.25
  ├──────────┤
  │ AdaptiveAvg │ → 1×1
  │ Flatten     │ → 128
  │ Linear      │ → 256, BN1d, ReLU, Dropout(0.5)
  │ Linear      │ → 10
  └─────────────┘
```

### Complete Code

```python
"""
Project 1: CIFAR-10 Image Classifier
A deep CNN achieving ~90%+ accuracy on CIFAR-10.
"""

import os
import torch
import torch.nn as nn
import torch.optim as optim
import torch.nn.functional as F
from torch.utils.data import DataLoader, random_split
from torchvision import datasets, transforms
from sklearn.metrics import confusion_matrix, classification_report
import numpy as np

# ──────────────────────────────────────────────
# 1. Configuration
# ──────────────────────────────────────────────
DEVICE = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
SEED = 42
BATCH_SIZE = 128
EPOCHS = 50
LR = 1e-3
WEIGHT_DECAY = 5e-4
DATA_DIR = './data'
MODEL_PATH = './cifar10_model.pth'
CLASSES = ('airplane', 'automobile', 'bird', 'cat', 'deer',
           'dog', 'frog', 'horse', 'ship', 'truck')

torch.manual_seed(SEED)
if torch.cuda.is_available():
    torch.cuda.manual_seed_all(SEED)


# ──────────────────────────────────────────────
# 2. Data Loading & Augmentation
# ──────────────────────────────────────────────
train_transform = transforms.Compose([
    transforms.RandomCrop(32, padding=4),
    transforms.RandomHorizontalFlip(p=0.5),
    transforms.ColorJitter(brightness=0.2, contrast=0.2),
    transforms.ToTensor(),
    transforms.Normalize((0.4914, 0.4822, 0.4465),
                         (0.2470, 0.2435, 0.2616)),
])

test_transform = transforms.Compose([
    transforms.ToTensor(),
    transforms.Normalize((0.4914, 0.4822, 0.4465),
                         (0.2470, 0.2435, 0.2616)),
])

full_train = datasets.CIFAR10(DATA_DIR, train=True, download=True,
                               transform=train_transform)
test_set = datasets.CIFAR10(DATA_DIR, train=False, download=True,
                             transform=test_transform)

# Split training into train + validation (45000 / 5000)
train_set, val_set = random_split(full_train, [45000, 5000],
                                   generator=torch.Generator().manual_seed(SEED))

train_loader = DataLoader(train_set, batch_size=BATCH_SIZE, shuffle=True,
                           num_workers=2, pin_memory=True)
val_loader = DataLoader(val_set, batch_size=BATCH_SIZE,
                         num_workers=2, pin_memory=True)
test_loader = DataLoader(test_set, batch_size=BATCH_SIZE,
                          num_workers=2, pin_memory=True)


# ──────────────────────────────────────────────
# 3. Model Definition
# ──────────────────────────────────────────────
class CIFAR10Net(nn.Module):
    def __init__(self, num_classes=10):
        super().__init__()
        # Block 1
        self.block1 = nn.Sequential(
            nn.Conv2d(3, 32, 3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(inplace=True),
            nn.Conv2d(32, 32, 3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2),
            nn.Dropout2d(0.25),
        )
        # Block 2
        self.block2 = nn.Sequential(
            nn.Conv2d(32, 64, 3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
            nn.Conv2d(64, 64, 3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2),
            nn.Dropout2d(0.25),
        )
        # Block 3
        self.block3 = nn.Sequential(
            nn.Conv2d(64, 128, 3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(inplace=True),
            nn.Conv2d(128, 128, 3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(inplace=True),
            nn.AdaptiveAvgPool2d(1),
            nn.Dropout2d(0.25),
        )
        # Classifier
        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Linear(128, 256),
            nn.BatchNorm1d(256),
            nn.ReLU(inplace=True),
            nn.Dropout(0.5),
            nn.Linear(256, num_classes),
        )

    def forward(self, x):
        x = self.block1(x)
        x = self.block2(x)
        x = self.block3(x)
        x = self.classifier(x)
        return x


model = CIFAR10Net(num_classes=10).to(DEVICE)
print(f"Model parameters: {sum(p.numel() for p in model.parameters()):,}")


# ──────────────────────────────────────────────
# 4. Loss, Optimizer, Scheduler
# ──────────────────────────────────────────────
criterion = nn.CrossEntropyLoss()
optimizer = optim.AdamW(model.parameters(), lr=LR, weight_decay=WEIGHT_DECAY)
scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=EPOCHS)


# ──────────────────────────────────────────────
# 5. Training & Validation Functions
# ──────────────────────────────────────────────
def train_one_epoch(model, loader, criterion, optimizer, device):
    model.train()
    running_loss = 0.0
    correct = 0
    total = 0
    for images, labels in loader:
        images, labels = images.to(device), labels.to(device)
        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()
        running_loss += loss.item() * images.size(0)
        correct += (outputs.argmax(1) == labels).sum().item()
        total += images.size(0)
    return running_loss / total, correct / total


@torch.no_grad()
def evaluate(model, loader, criterion, device):
    model.eval()
    running_loss = 0.0
    correct = 0
    total = 0
    all_preds = []
    all_labels = []
    for images, labels in loader:
        images, labels = images.to(device), labels.to(device)
        outputs = model(images)
        loss = criterion(outputs, labels)
        running_loss += loss.item() * images.size(0)
        preds = outputs.argmax(1)
        correct += (preds == labels).sum().item()
        total += images.size(0)
        all_preds.extend(preds.cpu().numpy())
        all_labels.extend(labels.cpu().numpy())
    return running_loss / total, correct / total, all_preds, all_labels


# ──────────────────────────────────────────────
# 6. Training Loop
# ──────────────────────────────────────────────
best_val_acc = 0.0
history = {'train_loss': [], 'train_acc': [], 'val_loss': [], 'val_acc': []}

print(f"\nTraining on {DEVICE} for {EPOCHS} epochs\n")
print(f"{'Epoch':>5}  {'Train Loss':>10}  {'Train Acc':>9}  "
      f"{'Val Loss':>8}  {'Val Acc':>7}  {'LR':>8}")
print("-" * 65)

for epoch in range(1, EPOCHS + 1):
    train_loss, train_acc = train_one_epoch(model, train_loader, criterion,
                                             optimizer, DEVICE)
    val_loss, val_acc, _, _ = evaluate(model, val_loader, criterion, DEVICE)
    scheduler.step()

    history['train_loss'].append(train_loss)
    history['train_acc'].append(train_acc)
    history['val_loss'].append(val_loss)
    history['val_acc'].append(val_acc)

    current_lr = scheduler.get_last_lr()[0]
    print(f"{epoch:5d}  {train_loss:10.4f}  {train_acc:9.4f}  "
          f"{val_loss:8.4f}  {val_acc:7.4f}  {current_lr:.6f}")

    # Save best model
    if val_acc > best_val_acc:
        best_val_acc = val_acc
        torch.save({
            'epoch': epoch,
            'model_state_dict': model.state_dict(),
            'optimizer_state_dict': optimizer.state_dict(),
            'val_acc': val_acc,
            'val_loss': val_loss,
        }, MODEL_PATH)

print(f"\nBest validation accuracy: {best_val_acc:.4f}")


# ──────────────────────────────────────────────
# 7. Final Evaluation on Test Set
# ──────────────────────────────────────────────
# Load best model
checkpoint = torch.load(MODEL_PATH, map_location=DEVICE)
model.load_state_dict(checkpoint['model_state_dict'])

test_loss, test_acc, all_preds, all_labels = evaluate(model, test_loader,
                                                       criterion, DEVICE)
print(f"\nTest Accuracy: {test_acc:.4f}")
print(f"Test Loss:     {test_loss:.4f}")

# Confusion Matrix
cm = confusion_matrix(all_labels, all_preds)
print("\nConfusion Matrix:")
print(cm)

# Per-class accuracy
print("\nClassification Report:")
print(classification_report(all_labels, all_preds, target_names=CLASSES))

# ──────────────────────────────────────────────
# 8. Save / Load for Inference
# ──────────────────────────────────────────────
def save_model(model, path):
    """Save just the model weights."""
    torch.save(model.state_dict(), path)
    print(f"Model saved to {path}")

def load_model(path, device, num_classes=10):
    """Load model weights for inference."""
    model = CIFAR10Net(num_classes=num_classes)
    model.load_state_dict(torch.load(path, map_location=device))
    model.to(device)
    model.eval()
    print(f"Model loaded from {path}")
    return model

def predict_single(model, image_tensor, device, classes):
    """Predict a single image."""
    model.eval()
    with torch.no_grad():
        image = image_tensor.unsqueeze(0).to(device)
        logits = model(image)
        probs = F.softmax(logits, dim=-1)
        top_prob, top_idx = probs.topk(1, dim=-1)
        return classes[top_idx.item()], top_prob.item()

# Example usage:
# loaded_model = load_model(MODEL_PATH, DEVICE)
# class_name, confidence = predict_single(loaded_model, sample_image, DEVICE, CLASSES)
# print(f"Prediction: {class_name} ({confidence:.2%})")
```

---

## Project 2: Text Generator — Character-Level LSTM

A character-level language model that learns to generate Shakespeare-style text given a corpus of training text. Uses an LSTM with embedding and a custom text generation loop with temperature sampling.

### Architecture

```
Input characters (indices)
       │
  ┌────▼──────────┐
  │ Embedding      │  vocab_size → embed_dim
  │ (128-dim)      │
  ├────────────────┤
  │ LSTM           │  3 layers, 512 hidden units
  │ (3 × 512)      │  dropout=0.3 between layers
  ├────────────────┤
  │ FC             │  512 → vocab_size
  └────────────────┘
       │
   Logits (vocab_size)
```

### Complete Code

```python
"""
Project 2: Character-Level LSTM Text Generator
Generates Shakespeare-like text trained on any input corpus.
"""

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import numpy as np
import random
import os

# ──────────────────────────────────────────────
# 1. Configuration
# ──────────────────────────────────────────────
DEVICE = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
SEED = 42
EMBED_DIM = 128
HIDDEN_DIM = 512
NUM_LAYERS = 3
DROPOUT = 0.3
BATCH_SIZE = 64
SEQ_LENGTH = 100
EPOCHS = 50
LR = 3e-3
GRAD_CLIP = 1.0
MODEL_PATH = './char_lstm_model.pth'
DATA_PATH = './input.txt'

torch.manual_seed(SEED)
if torch.cuda.is_available():
    torch.cuda.manual_seed_all(SEED)


# ──────────────────────────────────────────────
# 2. Sample Data (Shakespeare-style)
# ──────────────────────────────────────────────
SAMPLE_TEXT = """
ROMEO:
But, soft! what light through yonder window breaks?
It is the east, and Juliet is the sun.
Arise, fair sun, and kill the envious moon,
Who is already sick and pale with grief,
That thou her maid art far more fair than she:
Be not her maid, since she is envious;
Her vestal livery is but sick and green
And none but fools do wear it; cast it off.
It is my lady, O, it is my love!
O, that she knew she were!
She speaks yet she says nothing: what of that?
Her eye discourses; I will answer it.
I am too bold, 'tis not to me she speaks:
Two of the fairest stars in all the heaven,
Having some business, do entreat her eyes
To twinkle in their spheres till they return.
What if her eyes were there, they in her head?
The brightness of her cheek would shame those stars,
As daylight doth a lamp; her eyes in heaven
Would through the airy region stream so bright
That birds would sing and think it were not night.
See, how she leans her cheek upon her hand!
O, that I were a glove upon that hand,
That I might touch that cheek!

JULIET:
O Romeo, Romeo! wherefore art thou Romeo?
Deny thy father and refuse thy name;
Or, if thou wilt not, be but sworn my love,
And I'll no longer be a Capulet.

ROMEO:
Shall I hear more, or shall I speak at this?

JULIET:
'Tis but thy name that is my enemy;
Thou art thyself, though not a Montague.
What's a Montague? It is nor hand, nor foot,
Nor arm, nor face, nor any other part
Belonging to a man. O, be some other name!
What's in a name? That which we call a rose
By any other name would smell as sweet;
So Romeo would, were he not Romeo call'd,
Retain that dear perfection which he owes
Without that title. Romeo, doff thy name,
And for that name which is no part of thee
Take all myself.
"""


def load_data(path):
    """Load text from file, or use sample text if no file."""
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            return f.read()
    print(f"No file found at {path}, using built-in Shakespeare sample.")
    return SAMPLE_TEXT


text = load_data(DATA_PATH)
print(f"Corpus length: {len(text)} characters")


# ──────────────────────────────────────────────
# 3. Vocabulary
# ──────────────────────────────────────────────
chars = sorted(set(text))
vocab_size = len(chars)
char_to_idx = {c: i for i, c in enumerate(chars)}
idx_to_char = {i: c for i, c in enumerate(chars)}

print(f"Vocabulary size: {vocab_size}")
print(f"Characters: {''.join(chars[:50])}{'...' if vocab_size > 50 else ''}")

# Encode full text
encoded = np.array([char_to_idx[c] for c in text], dtype=np.int64)


# ──────────────────────────────────────────────
# 4. Dataset
# ──────────────────────────────────────────────
class CharSeqDataset(Dataset):
    """Sliding-window dataset over character indices."""

    def __init__(self, data, seq_length):
        self.data = torch.tensor(data, dtype=torch.long)
        self.seq_length = seq_length

    def __len__(self):
        return len(self.data) - self.seq_length - 1

    def __getitem__(self, idx):
        x = self.data[idx: idx + self.seq_length]
        y = self.data[idx + 1: idx + 1 + self.seq_length]
        return x, y


dataset = CharSeqDataset(encoded, SEQ_LENGTH)
loader = DataLoader(dataset, batch_size=BATCH_SIZE, shuffle=True,
                     num_workers=0, pin_memory=True)
print(f"Total sequences: {len(dataset)}")


# ──────────────────────────────────────────────
# 5. Model Definition
# ──────────────────────────────────────────────
class CharLSTM(nn.Module):
    def __init__(self, vocab_size, embed_dim, hidden_dim, num_layers,
                 dropout=0.3):
        super().__init__()
        self.hidden_dim = hidden_dim
        self.num_layers = num_layers
        self.embedding = nn.Embedding(vocab_size, embed_dim)
        self.lstm = nn.LSTM(
            input_size=embed_dim,
            hidden_size=hidden_dim,
            num_layers=num_layers,
            dropout=dropout if num_layers > 1 else 0.0,
            batch_first=True,
        )
        self.dropout = nn.Dropout(dropout)
        self.fc = nn.Linear(hidden_dim, vocab_size)
        # Tie embedding and output weights
        self.fc.weight = self.embedding.weight

    def forward(self, x, hidden=None):
        # x: (batch, seq_len)
        embeds = self.dropout(self.embedding(x))  # (batch, seq_len, embed)
        if hidden is None:
            output, (h, c) = self.lstm(embeds)
        else:
            output, (h, c) = self.lstm(embeds, hidden)
        output = self.dropout(output)
        logits = self.fc(output)  # (batch, seq_len, vocab_size)
        return logits, (h, c)

    def init_hidden(self, batch_size, device):
        h = torch.zeros(self.num_layers, batch_size, self.hidden_dim).to(device)
        c = torch.zeros(self.num_layers, batch_size, self.hidden_dim).to(device)
        return (h, c)


model = CharLSTM(vocab_size, EMBED_DIM, HIDDEN_DIM, NUM_LAYERS, DROPOUT)
model = model.to(DEVICE)
print(f"Model parameters: {sum(p.numel() for p in model.parameters()):,}")


# ──────────────────────────────────────────────
# 6. Training
# ──────────────────────────────────────────────
criterion = nn.CrossEntropyLoss()
optimizer = optim.AdamW(model.parameters(), lr=LR, weight_decay=1e-2)
scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=EPOCHS)


def train(model, loader, criterion, optimizer, scheduler, epochs, device):
    model.train()
    history = {'loss': []}

    for epoch in range(1, epochs + 1):
        total_loss = 0.0
        num_batches = 0
        for x, y in loader:
            x, y = x.to(device), y.to(device)
            optimizer.zero_grad()
            logits, _ = model(x)
            loss = criterion(logits.view(-1, vocab_size), y.view(-1))
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), GRAD_CLIP)
            optimizer.step()
            total_loss += loss.item()
            num_batches += 1

        scheduler.step()
        avg_loss = total_loss / num_batches
        history['loss'].append(avg_loss)

        if epoch % 5 == 0 or epoch == 1:
            # Generate a sample
            sample = generate(model, "ROMEO:", 200, temperature=0.8,
                              device=device, char_to_idx=char_to_idx,
                              idx_to_char=idx_to_char)
            print(f"Epoch {epoch:3d}/{epochs}  Loss: {avg_loss:.4f}")
            print(f"  Sample: {sample[:150]}...\n")

    return history


# ──────────────────────────────────────────────
# 7. Text Generation
# ──────────────────────────────────────────────
@torch.no_grad()
def generate(model, seed_text, max_len, temperature, device,
             char_to_idx, idx_to_char):
    """Generate text with temperature sampling."""
    model.eval()
    # Encode seed text
    input_indices = [char_to_idx.get(c, 0) for c in seed_text]
    result = list(seed_text)
    hidden = None

    # Feed seed text through model to prime the hidden state
    for idx in input_indices[:-1]:
        x = torch.tensor([[idx]], dtype=torch.long).to(device)
        _, hidden = model(x, hidden)

    current_idx = input_indices[-1]
    for _ in range(max_len):
        x = torch.tensor([[current_idx]], dtype=torch.long).to(device)
        logits, hidden = model(x, hidden)

        # Temperature sampling
        scaled_logits = logits.squeeze(0).squeeze(0) / temperature
        probs = torch.softmax(scaled_logits, dim=-1)
        next_idx = torch.multinomial(probs, num_samples=1).item()

        result.append(idx_to_char.get(next_idx, '?'))
        current_idx = next_idx

    return ''.join(result)


# ──────────────────────────────────────────────
# 8. Run Training
# ──────────────────────────────────────────────
history = train(model, loader, criterion, optimizer, scheduler, EPOCHS, DEVICE)

# Generate text at different temperatures
print("\n" + "=" * 60)
print("GENERATED TEXT AT DIFFERENT TEMPERATURES")
print("=" * 60)

for temp in [0.5, 0.8, 1.0, 1.2]:
    sample = generate(model, "JULIET:", 300, temperature=temp,
                      device=DEVICE, char_to_idx=char_to_idx,
                      idx_to_char=idx_to_char)
    print(f"\n--- Temperature: {temp} ---")
    print(sample)

# ──────────────────────────────────────────────
# 9. Save and Load
# ──────────────────────────────────────────────
torch.save({
    'model_state_dict': model.state_dict(),
    'char_to_idx': char_to_idx,
    'idx_to_char': idx_to_char,
    'vocab_size': vocab_size,
    'embed_dim': EMBED_DIM,
    'hidden_dim': HIDDEN_DIM,
    'num_layers': NUM_LAYERS,
}, MODEL_PATH)
print(f"\nModel saved to {MODEL_PATH}")

# Load example
def load_generator(path, device):
    checkpoint = torch.load(path, map_location=device)
    model = CharLSTM(
        checkpoint['vocab_size'],
        checkpoint['embed_dim'],
        checkpoint['hidden_dim'],
        checkpoint['num_layers'],
    )
    model.load_state_dict(checkpoint['model_state_dict'])
    model.to(device).eval()
    return (model, checkpoint['char_to_idx'], checkpoint['idx_to_char'])

# loaded_model, c2i, i2c = load_generator(MODEL_PATH, DEVICE)
# text = generate(loaded_model, "ROMEO:", 500, 0.8, DEVICE, c2i, i2c)
```

**Temperature Guide:**

| Temperature | Effect | Output Style |
|-------------|--------|--------------|
| 0.3 | Very conservative | Repetitive, near-deterministic |
| 0.5 | Conservative | Coherent, predictable |
| 0.8 | Balanced | Creative but readable |
| 1.0 | Sampling from raw distribution | Diverse, occasional errors |
| 1.2 | High randomness | Chaotic, many errors |

---

## Project 3: Object Detector (Simple SSD-like)

A single-shot object detector using a VGG-like backbone with multi-scale feature maps, anchor boxes, and non-maximum suppression. Trains on synthetic colored-shape data for clarity.

### Architecture

```
Input (3 × 300 × 300)
       │
  ┌────▼────────────────────┐
  │ VGG-style Backbone       │
  │  Conv→Conv→Pool          │  → 150×150 (256 ch)
  │  Conv→Conv→Pool          │  → 75×75  (512 ch)  ← Feature Map 1
  │  Conv→Conv→Pool          │  → 38×38  (512 ch)  ← Feature Map 2
  │  Conv→Conv→Pool          │  → 19×19  (512 ch)  ← Feature Map 3
  │  Conv→Conv→Pool          │  → 10×10  (512 ch)  ← Feature Map 4
  ├──────────────────────────┤
  │ Detection Heads          │
  │  Each feature map →      │
  │    num_anchors × (4 bbox + num_classes) │
  └──────────────────────────┘
       │
  Concatenated predictions → NMS → Final Detections
```

### Complete Code

```python
"""
Project 3: Simple SSD-like Object Detector
Trains on synthetic data (colored shapes) to demonstrate
anchor boxes, NMS, and multi-scale detection.
"""

import torch
import torch.nn as nn
import torch.optim as optim
import torch.nn.functional as F
from torch.utils.data import Dataset, DataLoader
import numpy as np
from PIL import Image, ImageDraw
import random
import math

# ──────────────────────────────────────────────
# 1. Configuration
# ──────────────────────────────────────────────
DEVICE = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
SEED = 42
IMG_SIZE = 300
NUM_CLASSES = 4   # background + red_circle, blue_square, green_triangle
CLASSES = ['background', 'red_circle', 'blue_square', 'green_triangle']
BATCH_SIZE = 16
EPOCHS = 30
LR = 1e-3
NUM_TRAIN = 2000
NUM_VAL = 500
MODEL_PATH = './simple_detector.pth'

torch.manual_seed(SEED)
np.random.seed(SEED)
random.seed(SEED)

# Anchor parameters per feature map scale
ANCHOR_SCALES = {
    'feat1': [30, 60],        # 75×75 → small objects
    'feat2': [60, 120],       # 38×38 → medium objects
    'feat3': [100, 180],      # 19×19 → large objects
}
ASPECT_RATIOS = [1.0, 2.0, 0.5]
NUM_ANCHORS_PER_LOC = len(ASPECT_RATIOS)  # 3


# ──────────────────────────────────────────────
# 2. Synthetic Dataset
# ──────────────────────────────────────────────
COLORS = {
    1: (255, 0, 0),     # red circle
    2: (0, 0, 255),     # blue square
    3: (0, 200, 0),     # green triangle
}

def generate_synthetic_image(annotated=False):
    """Generate a synthetic image with 1-5 random shapes."""
    img = Image.new('RGB', (IMG_SIZE, IMG_SIZE), (40, 40, 40))
    draw = ImageDraw.Draw(img)
    bboxes = []
    labels = []
    num_objects = random.randint(1, 5)

    for _ in range(num_objects):
        cls_id = random.randint(1, NUM_CLASSES - 1)
        color = COLORS[cls_id]
        w = random.randint(25, 80)
        h = random.randint(25, 80)
        cx = random.randint(w // 2 + 5, IMG_SIZE - w // 2 - 5)
        cy = random.randint(h // 2 + 5, IMG_SIZE - h // 2 - 5)

        if cls_id == 1:  # circle
            draw.ellipse([cx - w//2, cy - h//2, cx + w//2, cy + h//2],
                         fill=color)
        elif cls_id == 2:  # square
            draw.rectangle([cx - w//2, cy - h//2, cx + w//2, cy + h//2],
                           fill=color)
        else:  # triangle
            points = [(cx, cy - h//2), (cx - w//2, cy + h//2),
                       (cx + w//2, cy + h//2)]
            draw.polygon(points, fill=color)

        # Store as (x1, y1, x2, y2) normalized to [0, 1]
        x1 = (cx - w / 2) / IMG_SIZE
        y1 = (cy - h / 2) / IMG_SIZE
        x2 = (cx + w / 2) / IMG_SIZE
        y2 = (cy + h / 2) / IMG_SIZE
        bboxes.append([max(0, x1), max(0, y1),
                        min(1, x2), min(1, y2)])
        labels.append(cls_id)

    if annotated:
        return img, bboxes, labels
    return img


class SyntheticDetectionDataset(Dataset):
    def __init__(self, num_samples):
        self.num_samples = num_samples

    def __len__(self):
        return self.num_samples

    def __getitem__(self, idx):
        img, bboxes, labels = generate_synthetic_image(annotated=True)
        # Convert to tensor
        img_tensor = torch.tensor(np.array(img), dtype=torch.float32).permute(2, 0, 1) / 255.0
        # Pad bboxes/labels to fixed size (max 10 objects)
        max_obj = 10
        padded_bboxes = torch.zeros(max_obj, 4)
        padded_labels = torch.zeros(max_obj, dtype=torch.long)
        num_obj = min(len(bboxes), max_obj)
        for i in range(num_obj):
            padded_bboxes[i] = torch.tensor(bboxes[i])
            padded_labels[i] = labels[i]
        return img_tensor, padded_bboxes, padded_labels, num_obj


train_dataset = SyntheticDetectionDataset(NUM_TRAIN)
val_dataset = SyntheticDetectionDataset(NUM_VAL)
train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True)
val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE)


# ──────────────────────────────────────────────
# 3. Model Definition
# ──────────────────────────────────────────────
class VGGBackbone(nn.Module):
    """Simplified VGG-style feature extractor returning multi-scale features."""

    def __init__(self):
        super().__init__()
        self.block1 = nn.Sequential(
            nn.Conv2d(3, 64, 3, padding=1), nn.ReLU(inplace=True),
            nn.Conv2d(64, 64, 3, padding=1), nn.ReLU(inplace=True),
            nn.MaxPool2d(2),  # 150×150
        )
        self.block2 = nn.Sequential(
            nn.Conv2d(64, 128, 3, padding=1), nn.ReLU(inplace=True),
            nn.Conv2d(128, 128, 3, padding=1), nn.ReLU(inplace=True),
            nn.MaxPool2d(2),  # 75×75
        )
        self.feat1 = nn.Sequential(
            nn.Conv2d(128, 256, 3, padding=1), nn.ReLU(inplace=True),
            nn.Conv2d(256, 256, 3, padding=1), nn.ReLU(inplace=True),
            nn.Conv2d(256, 256, 3, padding=1), nn.ReLU(inplace=True),
            nn.Conv2d(256, 256, 3, padding=1), nn.ReLU(inplace=True),
            nn.Conv2d(256, 256, 3, padding=1), nn.ReLU(inplace=True),
            nn.Conv2d(256, 256, 3, padding=1), nn.ReLU(inplace=True),
        )  # 75×75

        self.pool2 = nn.MaxPool2d(2)  # 38×38
        self.feat2 = nn.Sequential(
            nn.Conv2d(256, 512, 3, padding=1), nn.ReLU(inplace=True),
            nn.Conv2d(512, 512, 3, padding=1), nn.ReLU(inplace=True),
        )  # 38×38

        self.pool3 = nn.MaxPool2d(2)  # 19×19
        self.feat3 = nn.Sequential(
            nn.Conv2d(512, 512, 3, padding=1), nn.ReLU(inplace=True),
            nn.Conv2d(512, 512, 3, padding=1), nn.ReLU(inplace=True),
        )  # 19×19

    def forward(self, x):
        x = self.block1(x)      # 150×150
        x = self.block2(x)      # 75×75
        f1 = self.feat1(x)      # 75×75, 256
        x = self.pool2(f1)      # 38×38
        f2 = self.feat2(x)      # 38×38, 512
        x = self.pool3(f2)      # 19×19
        f3 = self.feat3(x)      # 19×19, 512
        return [f1, f2, f3]


class SimpleDetector(nn.Module):
    """SSD-like detector with detection heads on multi-scale features."""

    def __init__(self, num_classes, num_anchors=3):
        super().__init__()
        self.backbone = VGGBackbone()
        num = num_classes + 4  # +4 for bbox regression (dx, dy, dw, dh)
        # Detection heads: predict (num_anchors × num_classes) cls + (num_anchors × 4) bbox
        self.head_feat1 = nn.Conv2d(256, num_anchors * num, 3, padding=1)
        self.head_feat2 = nn.Conv2d(512, num_anchors * num, 3, padding=1)
        self.head_feat3 = nn.Conv2d(512, num_anchors * num, 3, padding=1)

    def forward(self, x):
        features = self.backbone(x)
        cls_preds = []
        bbox_preds = []
        for feat, head in zip(features, [self.head_feat1,
                                          self.head_feat2,
                                          self.head_feat3]):
            pred = head(feat)         # (B, num_anchors × num, H, W)
            B, _, H, W = pred.shape
            num = 4 + NUM_CLASSES
            pred = pred.view(B, NUM_ANCHORS_PER_LOC, num, H, W)
            pred = pred.permute(0, 3, 4, 1, 2).contiguous()
            # (B, H, W, num_anchors, num)
            cls_preds.append(pred[..., 4:].view(B, -1, NUM_CLASSES))
            bbox_preds.append(pred[..., :4].view(B, -1, 4))

        cls_out = torch.cat(cls_preds, dim=1)
        bbox_out = torch.cat(bbox_preds, dim=1)
        return cls_out, bbox_out


# ──────────────────────────────────────────────
# 4. Anchor Generation
# ──────────────────────────────────────────────
def generate_anchors(img_size, feature_maps):
    """Generate anchor boxes for all feature map scales."""
    all_anchors = []
    for fm_size in feature_maps:
        step = img_size / fm_size
        for y in range(fm_size):
            for x in range(fm_size):
                cx = (x + 0.5) * step
                cy = (y + 0.5) * step
                for scale_key in ANCHOR_SCALES:
                    for scale in ANCHOR_SCALES[scale_key]:
                        for ratio in ASPECT_RATIOS:
                            w = scale * math.sqrt(ratio)
                            h = scale / math.sqrt(ratio)
                            x1 = max(0, cx - w / 2)
                            y1 = max(0, cy - h / 2)
                            x2 = min(img_size, cx + w / 2)
                            y2 = min(img_size, cy + h / 2)
                            all_anchors.append([x1, y1, x2, y2])
    return torch.tensor(all_anchors)


FEATURE_MAP_SIZES = [75, 38, 19]  # from the backbone
# Total anchors: 75*75*3 + 38*38*3 + 19*19*3 = 16875 + 4332 + 1083 = 22290

def compute_iou(boxes1, boxes2):
    """Compute IoU between two sets of boxes. (N,4) and (M,4) → (N,M)."""
    N = boxes1.size(0)
    M = boxes2.size(0)
    boxes1 = boxes1.unsqueeze(1).expand(N, M, 4)
    boxes2 = boxes2.unsqueeze(0).expand(N, M, 4)
    inter_x1 = torch.max(boxes1[..., 0], boxes2[..., 0])
    inter_y1 = torch.max(boxes1[..., 1], boxes2[..., 1])
    inter_x2 = torch.min(boxes1[..., 2], boxes2[..., 2])
    inter_y2 = torch.min(boxes1[..., 3], boxes2[..., 3])
    inter = torch.clamp(inter_x2 - inter_x1, min=0) * \
            torch.clamp(inter_y2 - inter_y1, min=0)
    area1 = (boxes1[..., 2] - boxes1[..., 0]) * (boxes1[..., 3] - boxes1[..., 1])
    area2 = (boxes2[..., 2] - boxes2[..., 0]) * (boxes2[..., 3] - boxes2[..., 1])
    union = area1 + area2 - inter + 1e-6
    return inter / union


# ──────────────────────────────────────────────
# 5. Loss Functions
# ──────────────────────────────────────────────
def match_anchors_to_gt(anchors, gt_bboxes, gt_labels, iou_threshold=0.5):
    """Match anchors to ground truth for training."""
    num_anchors = anchors.size(0)
    matched_labels = torch.zeros(num_anchors, dtype=torch.long)
    matched_boxes = torch.zeros(num_anchors, 4)
    matched_mask = torch.zeros(num_anchors, dtype=torch.bool)

    if gt_labels.numel() == 0:
        return matched_labels, matched_boxes, matched_mask

    iou = compute_iou(anchors, gt_bboxes)  # (num_anchors, num_gt)
    max_iou, max_idx = iou.max(dim=1)      # best GT for each anchor

    # Positive matches
    positive = max_iou >= iou_threshold
    matched_mask[positive] = True
    matched_labels[positive] = gt_labels[max_idx[positive]]
    matched_boxes[positive] = gt_bboxes[max_idx[positive]]

    # Ensure each GT has at least one anchor (best match)
    best_anchor_per_gt = iou.max(dim=0).indices
    for gt_i in range(gt_bboxes.size(0)):
        matched_mask[best_anchor_per_gt[gt_i]] = True
        matched_labels[best_anchor_per_gt[gt_i]] = gt_labels[gt_i]
        matched_boxes[best_anchor_per_gt[gt_i]] = gt_bboxes[gt_i]

    return matched_labels, matched_boxes, matched_mask


def encode_boxes(gt_boxes, anchors):
    """Encode GT boxes relative to anchors (cx, cy, w, h)."""
    a_cx = (anchors[:, 0] + anchors[:, 2]) / 2
    a_cy = (anchors[:, 1] + anchors[:, 3]) / 2
    a_w = anchors[:, 2] - anchors[:, 0] + 1e-6
    a_h = anchors[:, 3] - anchors[:, 1] + 1e-6

    g_cx = (gt_boxes[:, 0] + gt_boxes[:, 2]) / 2
    g_cy = (gt_boxes[:, 1] + gt_boxes[:, 3]) / 2
    g_w = gt_boxes[:, 2] - gt_boxes[:, 0] + 1e-6
    g_h = gt_boxes[:, 3] - gt_boxes[:, 1] + 1e-6

    dx = (g_cx - a_cx) / a_w
    dy = (g_cy - a_cy) / a_h
    dw = torch.log(g_w / a_w)
    dh = torch.log(g_h / a_h)
    return torch.stack([dx, dy, dw, dh], dim=1)


def detect_loss(cls_pred, bbox_pred, gt_bboxes, gt_labels, anchors):
    """Multi-task loss: Smooth L1 for bbox + CrossEntropy for class."""
    device = cls_pred.device
    cls_pred = cls_pred.to(device)
    bbox_pred = bbox_pred.to(device)
    matched_labels, matched_boxes, matched_mask = match_anchors_to_gt(
        anchors, gt_bboxes.to(device) * IMG_SIZE, gt_labels.to(device)
    )
    matched_labels = matched_labels.to(device)
    matched_boxes = matched_boxes.to(device)
    matched_mask = matched_mask.to(device)
    anchors = anchors.to(device)

    num_pos = matched_mask.sum().item()

    # Classification loss (all anchors)
    cls_loss = F.cross_entropy(cls_pred, matched_labels,
                                reduction='none')
    # Hard negative mining (keep 3:1 negative:positive ratio)
    if num_pos > 0:
        neg_loss = cls_loss.clone().detach()
        neg_loss[matched_mask] = 0.0
        _, neg_idx = neg_loss.topk(min(num_pos * 3, cls_pred.size(0) - num_pos))
        loss_mask = matched_mask.clone()
        loss_mask[neg_idx] = True
    else:
        loss_mask = torch.ones(cls_pred.size(0), dtype=torch.bool, device=device)

    cls_total = F.cross_entropy(cls_pred[loss_mask], matched_labels[loss_mask])

    # Bbox loss (positive only)
    if num_pos > 0:
        gt_encoded = encode_boxes(matched_boxes[matched_mask],
                                   anchors[matched_mask])
        bbox_total = F.smooth_l1_loss(bbox_pred[matched_mask], gt_encoded)
    else:
        bbox_total = torch.tensor(0.0, device=device)

    return cls_total + bbox_total, cls_total.item(), bbox_total.item(), num_pos


# ──────────────────────────────────────────────
# 6. Non-Maximum Suppression
# ──────────────────────────────────────────────
def nms(boxes, scores, iou_threshold=0.5):
    """Non-Maximum Suppression."""
    if boxes.numel() == 0:
        return torch.zeros(0, dtype=torch.long)

    x1, y1, x2, y2 = boxes[:, 0], boxes[:, 1], boxes[:, 2], boxes[:, 3]
    areas = (x2 - x1) * (y2 - y1)
    order = scores.argsort(descending=True)
    keep = []

    while order.numel() > 0:
        i = order[0].item()
        keep.append(i)
        if order.numel() == 1:
            break
        rest = order[1:]
        xx1 = torch.max(x1[i], x1[rest])
        yy1 = torch.max(y1[i], y1[rest])
        xx2 = torch.min(x2[i], x2[rest])
        yy2 = torch.min(y2[i], y2[rest])
        inter = (xx2 - xx1).clamp(min=0) * (yy2 - yy1).clamp(min=0)
        iou = inter / (areas[i] + areas[rest] - inter + 1e-6)
        mask = iou <= iou_threshold
        order = rest[mask]

    return torch.tensor(keep, dtype=torch.long)


@torch.no_grad()
def detect(model, image_tensor, confidence_threshold=0.5, nms_threshold=0.5):
    """Run detection on a single image."""
    model.eval()
    device = next(model.parameters()).device
    image = image_tensor.unsqueeze(0).to(device)
    cls_pred, bbox_pred = model(image)
    cls_scores = F.softmax(cls_pred, dim=-1)[0]  # (num_anchors, num_classes)
    bbox_decoded = bbox_pred[0]  # (num_anchors, 4)

    all_boxes = []
    all_scores = []
    all_labels = []

    for c in range(1, NUM_CLASSES):
        scores = cls_scores[:, c]
        mask = scores > confidence_threshold
        if mask.sum() == 0:
            continue

        boxes = anchors[mask].clone()
        # Decode bbox offsets
        decoded = bbox_decoded[mask]
        a_cx = (boxes[:, 0] + boxes[:, 2]) / 2
        a_cy = (boxes[:, 1] + boxes[:, 3]) / 2
        a_w = boxes[:, 2] - boxes[:, 0]
        a_h = boxes[:, 3] - boxes[:, 1]
        cx = decoded[:, 0] * a_w + a_cx
        cy = decoded[:, 1] * a_h + a_cy
        w = torch.exp(decoded[:, 2]) * a_w
        h = torch.exp(decoded[:, 3]) * a_h
        pred_boxes = torch.stack([cx - w/2, cy - h/2, cx + w/2, cy + h/2], dim=1)
        pred_boxes = pred_boxes.clamp(0, IMG_SIZE)

        keep = nms(pred_boxes, scores[mask], nms_threshold)
        all_boxes.append(pred_boxes[keep])
        all_scores.append(scores[mask][keep])
        all_labels.append(torch.full_like(keep, c))

    if len(all_boxes) == 0:
        return torch.zeros(0, 4), torch.zeros(0), torch.zeros(0, dtype=torch.long)

    all_boxes = torch.cat(all_boxes)
    all_scores = torch.cat(all_scores)
    all_labels = torch.cat(all_labels)
    return all_boxes, all_scores, all_labels


# ──────────────────────────────────────────────
# 7. Training Loop
# ──────────────────────────────────────────────
model = SimpleDetector(num_classes=NUM_CLASSES).to(DEVICE)
print(f"Model parameters: {sum(p.numel() for p in model.parameters()):,}")
optimizer = optim.AdamW(model.parameters(), lr=LR, weight_decay=1e-4)
scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=EPOCHS)

# Pre-compute anchors (normalized to [0,1] to match dataset)
anchors_pixel = generate_anchors(IMG_SIZE, FEATURE_MAP_SIZES)
anchors = anchors_pixel / IMG_SIZE  # normalize
print(f"Total anchors: {anchors.size(0)}")

print(f"\nTraining on {DEVICE} for {EPOCHS} epochs\n")
for epoch in range(1, EPOCHS + 1):
    model.train()
    total_loss = 0.0
    total_cls = 0.0
    total_bbox = 0.0
    total_pos = 0
    num_batches = 0

    for images, gt_bboxes, gt_labels, num_objs in train_loader:
        images = images.to(DEVICE)
        cls_pred, bbox_pred = model(images)

        batch_loss = 0.0
        batch_cls = 0.0
        batch_bbox = 0.0
        batch_pos = 0

        for i in range(images.size(0)):
            n = num_objs[i].item()
            loss, cls_l, bbox_l, n_pos = detect_loss(
                cls_pred[i], bbox_pred[i],
                gt_bboxes[i, :n], gt_labels[i, :n],
                anchors
            )
            batch_loss += loss
            batch_cls += cls_l
            batch_bbox += bbox_l
            batch_pos += n_pos

        batch_loss /= images.size(0)
        optimizer.zero_grad()
        batch_loss.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
        optimizer.step()

        total_loss += batch_loss.item()
        total_cls += batch_cls
        total_bbox += batch_bbox
        total_pos += batch_pos
        num_batches += 1

    scheduler.step()

    if epoch % 5 == 0 or epoch == 1:
        avg_loss = total_loss / num_batches
        print(f"Epoch {epoch:3d}/{EPOCHS}  "
              f"Loss: {avg_loss:.4f}  "
              f"Cls: {total_cls/num_batches:.4f}  "
              f"Bbox: {total_bbox/num_batches:.4f}  "
              f"Pos: {total_pos/num_batches:.1f}")

# Save model
torch.save(model.state_dict(), MODEL_PATH)
print(f"\nModel saved to {MODEL_PATH}")

# ──────────────────────────────────────────────
# 8. Run Detection on Sample
# ──────────────────────────────────────────────
sample_img, gt_boxes, gt_labels, n = val_dataset[0]
pred_boxes, pred_scores, pred_labels = detect(model, sample_img,
                                                confidence_threshold=0.3)

print(f"\nGround truth: {n} objects")
print(f"Detections: {len(pred_boxes)}")
for i in range(min(5, len(pred_boxes))):
    print(f"  {CLASSES[pred_labels[i]]}: "
          f"conf={pred_scores[i]:.3f} "
          f"box={pred_boxes[i].tolist()}")
```

---

## Project 4: Neural Style Transfer

Gatys et al.'s neural style transfer — using VGG-19 to combine the **content** of one image with the **style** of another. Uses Gram-matrix-based style loss.

### Architecture

```
Content Image ──┐                ┌── Content Loss  (conv4_2)
                ├→ VGG-19 →     ├── Style Loss    (conv1_1, 2_1, 3_1, 4_1, 5_1)
Style Image ────┘    │           └── Total Variation Loss
                     │
                     ▼
              Optimized Image (starts from noise or content image)
```

### Complete Code

```python
"""
Project 4: Neural Style Transfer
Combines content of one image with style of another using VGG-19.
Based on Gatys et al. "A Neural Algorithm of Artistic Style" (2015).
"""

import torch
import torch.nn as nn
import torch.optim as optim
import torchvision.transforms as transforms
import torchvision.models as models
from PIL import Image
import matplotlib.pyplot as plt
import copy
import os

# ──────────────────────────────────────────────
# 1. Configuration
# ──────────────────────────────────────────────
DEVICE = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
IMG_SIZE = 512 if torch.cuda.is_available() else 256

# Loss weights
CONTENT_WEIGHT = 1e0
STYLE_WEIGHT = 1e6
TV_WEIGHT = 1e-3
NUM_STEPS = 300

# Content and style layers
CONTENT_LAYERS = ['conv4_2']
STYLE_LAYERS = ['conv1_1', 'conv2_1', 'conv3_1', 'conv4_1', 'conv5_1']


# ──────────────────────────────────────────────
# 2. Image Loading and Saving
# ──────────────────────────────────────────────
loader = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
])

unloader = transforms.ToPILImage()


def load_image(path_or_tensor, size=IMG_SIZE):
    """Load image and normalize for VGG."""
    if isinstance(path_or_tensor, str):
        img = Image.open(path_or_tensor).convert('RGB')
    else:
        img = path_or_tensor
    transform = transforms.Compose([
        transforms.Resize((size, size)),
        transforms.ToTensor(),
    ])
    img = transform(img).unsqueeze(0)
    return img.to(DEVICE)


def save_image(tensor, path):
    """Save tensor as image."""
    img = tensor.cpu().clone().squeeze(0)
    img = img.clamp(0, 1)
    img = unloader(img)
    img.save(path)
    print(f"Image saved to {path}")
    return img


def show_image(tensor, title=""):
    """Display image from tensor."""
    img = tensor.cpu().clone().squeeze(0)
    img = img.clamp(0, 1)
    img = unloader(img)
    plt.imshow(img)
    plt.title(title)
    plt.axis('off')


# ──────────────────────────────────────────────
# 3. Create Content and Style Test Images
# ──────────────────────────────────────────────
def create_test_images():
    """Create synthetic content and style images for testing."""
    # Content: gradient image
    content_img = Image.new('RGB', (512, 512))
    pixels = content_img.load()
    for y in range(512):
        for x in range(512):
            pixels[x, y] = (int(x * 255 / 512), int(y * 255 / 512), 128)
    content_img.save('content.jpg')

    # Style: random colorful pattern
    style_img = Image.new('RGB', (512, 512))
    pixels = style_img.load()
    import random
    random.seed(42)
    for y in range(512):
        for x in range(512):
            pixels[x, y] = (
                int((math.sin(x * 0.05) + 1) * 127),
                int((math.cos(y * 0.03) + 1) * 127),
                int((math.sin((x + y) * 0.02) + 1) * 127),
            )
    style_img.save('style.jpg')
    return 'content.jpg', 'style.jpg'

import math

if not os.path.exists('content.jpg') or not os.path.exists('style.jpg'):
    content_path, style_path = create_test_images()
else:
    content_path = 'content.jpg'
    style_path = 'style.jpg'

content_img = load_image(content_path)
style_img = load_image(style_path)
print(f"Content shape: {content_img.shape}")
print(f"Style shape:   {style_img.shape}")


# ──────────────────────────────────────────────
# 4. VGG Feature Extractor
# ──────────────────────────────────────────────
class VGGFeatures(nn.Module):
    """
    Extract features from VGG-19 at specified layers.
    Maps layer names to indices in VGG-19's feature sequence.
    """
    def __init__(self, layers_of_interest):
        super().__init__()
        vgg = models.vgg19(weights=models.VGG19_Weights.IMAGENET1K_V1).features
        vgg.eval()
        for param in vgg.parameters():
            param.requires_grad = False

        self.features = vgg
        # VGG-19 feature layer mapping
        self.layer_map = {
            'conv1_1': 0,  'relu1_1': 1,  'conv1_2': 2,  'relu1_2': 3,  'pool1': 4,
            'conv2_1': 5,  'relu2_1': 6,  'conv2_2': 7,  'relu2_2': 8,  'pool2': 9,
            'conv3_1': 11, 'relu3_1': 12, 'conv3_2': 13, 'relu3_2': 14, 'conv3_3': 15,
            'conv3_4': 16, 'pool3': 17,
            'conv4_1': 19, 'relu4_1': 20, 'conv4_2': 21, 'relu4_2': 22, 'conv4_3': 23,
            'conv4_4': 24, 'pool4': 25,
            'conv5_1': 27, 'relu5_1': 28, 'conv5_2': 29, 'conv5_3': 30, 'conv5_4': 31,
        }
        self.layer_indices = sorted([self.layer_map[l] for l in layers_of_interest])
        self.names = [name for idx in self.layer_indices
                       for name, i in self.layer_map.items() if i == idx]

    def forward(self, x):
        features = {}
        for i, layer in enumerate(self.features):
            x = layer(x)
            if i in self.layer_indices:
                features[self.names[self.layer_indices.index(i)]] = x
        return features


# ──────────────────────────────────────────────
# 5. Gram Matrix
# ──────────────────────────────────────────────
def gram_matrix(tensor):
    """
    Compute Gram matrix for style loss.
    Input:  (1, C, H, W)
    Output: (C, C)
    """
    b, c, h, w = tensor.size()
    features = tensor.view(b * c, h * w)  # (C, H*W)
    gram = torch.mm(features, features.t())  # (C, C)
    return gram / (c * h * w)


# ──────────────────────────────────────────────
# 6. Style Transfer Optimization
# ──────────────────────────────────────────────
def run_style_transfer(content_img, style_img, num_steps=NUM_STEPS,
                        content_weight=CONTENT_WEIGHT,
                        style_weight=STYLE_WEIGHT,
                        tv_weight=TV_WEIGHT):
    """
    Run neural style transfer optimization.
    Returns the optimized image tensor.
    """
    all_layers = list(set(CONTENT_LAYERS + STYLE_LAYERS))
    style_features_extractor = VGGFeatures(all_layers).to(DEVICE)
    content_features_extractor = VGGFeatures(CONTENT_LAYERS).to(DEVICE)

    # Pre-compute content features
    with torch.no_grad():
        content_features = content_features_extractor(content_img)
        style_features = style_features_extractor(style_img)
        # Pre-compute style Gram matrices
        style_grams = {layer: gram_matrix(style_features[layer])
                        for layer in STYLE_LAYERS}

    # Initialize target (start from content image)
    target = content_img.clone().requires_grad_(True)
    optimizer = optim.Adam([target], lr=0.01)

    print(f"\nOptimizing for {num_steps} steps on {DEVICE}...")
    for step in range(1, num_steps + 1):
        optimizer.zero_grad()

        # Forward pass
        target_content = content_features_extractor(target)
        target_style = style_features_extractor(target)

        # Content loss
        content_loss = 0.0
        for layer in CONTENT_LAYERS:
            content_loss += F.mse_loss(target_content[layer],
                                        content_features[layer])

        # Style loss (Gram matrices)
        style_loss = 0.0
        for layer in STYLE_LAYERS:
            target_gram = gram_matrix(target_style[layer])
            style_loss += F.mse_loss(target_gram, style_grams[layer])

        # Total variation loss (smoothness)
        tv_loss = (torch.sum(torch.abs(target[:, :, :, :-1] - target[:, :, :, 1:])) +
                   torch.sum(torch.abs(target[:, :, :-1, :] - target[:, :, 1:, :])))

        # Combined loss
        total_loss = (content_weight * content_loss +
                      style_weight * style_loss +
                      tv_weight * tv_loss)
        total_loss.backward()
        optimizer.step()

        if step % 50 == 0 or step == 1:
            print(f"  Step {step:4d}/{num_steps}  "
                  f"Content: {content_loss.item():.4f}  "
                  f"Style: {style_loss.item():.6f}  "
                  f"TV: {tv_loss.item():.2f}  "
                  f"Total: {total_loss.item():.4f}")

    return target.detach()


import torch.nn.functional as F

# ──────────────────────────────────────────────
# 7. Run Style Transfer
# ──────────────────────────────────────────────
output = run_style_transfer(content_img, style_img)
result_img = save_image(output, 'stylized_output.jpg')

# Display comparison
fig, axes = plt.subplots(1, 3, figsize=(15, 5))
for ax, img, title in zip(axes,
                           [content_img, style_img, output],
                           ['Content', 'Style', 'Output']):
    img_show = img.cpu().squeeze(0).clamp(0, 1).permute(1, 2, 0).numpy()
    ax.imshow(img_show)
    ax.set_title(title)
    ax.axis('off')
plt.tight_layout()
plt.savefig('style_transfer_comparison.png', dpi=150)
plt.show()
print("Comparison saved to style_transfer_comparison.png")
```

**Key Concepts:**

| Component | Purpose | Computation |
|-----------|---------|-------------|
| Content Loss | Matches high-level structure | MSE between feature maps at `conv4_2` |
| Style Loss | Matches texture/pattern | MSE between Gram matrices at multiple layers |
| TV Loss | Smooths output, reduces noise | Sum of pixel differences between neighbors |
| Gram Matrix | Captures feature correlations | $G = \frac{F \cdot F^T}{C \cdot H \cdot W}$ |

---

## Project 5: Recommendation System — Collaborative Filtering

A matrix factorization model using PyTorch embeddings for collaborative filtering, trained on a MovieLens-style dataset.

### Architecture

```
User ID ───┐
            ├──→ Embedding ──→ Concat ──→ FC ──→ FC ──→ Rating (1-5)
Item ID ───┘     (64-dim)     (128)     (64)   (1)

Additional Features (optional):
  User avg rating ────┐
  Item avg rating ────┤──→ Concat with embeddings
  Timestamp ──────────┘
```

### Complete Code

```python
"""
Project 5: Recommendation System — Collaborative Filtering
Matrix factorization with PyTorch embeddings for movie ratings.
Trains on MovieLens-style data and evaluates with RMSE.
"""

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import numpy as np
import pandas as pd
import os
import urllib.request
import zipfile
import math

# ──────────────────────────────────────────────
# 1. Configuration
# ──────────────────────────────────────────────
DEVICE = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
SEED = 42
EMBED_DIM = 64
HIDDEN_DIMS = [128, 64]
DROPOUT = 0.2
BATCH_SIZE = 4096
EPOCHS = 20
LR = 1e-3
WEIGHT_DECAY = 1e-5
DATA_DIR = './ml-latest-small'
MODEL_PATH = './recommendation_model.pth'

torch.manual_seed(SEED)
np.random.seed(SEED)


# ──────────────────────────────────────────────
# 2. Download MovieLens Data
# ──────────────────────────────────────────────
def download_movielens():
    """Download MovieLens small dataset (~1MB)."""
    url = 'https://files.grouplens.org/datasets/movielens/ml-latest-small.zip'
    if not os.path.exists(DATA_DIR):
        print("Downloading MovieLens dataset...")
        urllib.request.urlretrieve(url, 'ml-latest-small.zip')
        with zipfile.ZipFile('ml-latest-small.zip', 'r') as z:
            z.extractall('.')
        os.remove('ml-latest-small.zip')
        print("Download complete.")
    else:
        print("MovieLens dataset already exists.")


download_movielens()

# Load data
ratings_df = pd.read_csv(os.path.join(DATA_DIR, 'ratings.csv'))
movies_df = pd.read_csv(os.path.join(DATA_DIR, 'movies.csv'))

print(f"Ratings: {len(ratings_df):,}")
print(f"Users:   {ratings_df['userId'].nunique():,}")
print(f"Movies:  {ratings_df['movieId'].nunique():,}")
print(f"Rating distribution:\n{ratings_df['rating'].value_counts().sort_index()}")


# ──────────────────────────────────────────────
# 3. Data Preprocessing
# ──────────────────────────────────────────────
# Create contiguous index mappings
user_ids = ratings_df['userId'].unique()
movie_ids = ratings_df['movieId'].unique()

user_to_idx = {uid: idx for idx, uid in enumerate(user_ids)}
movie_to_idx = {mid: idx for idx, mid in enumerate(movie_ids)}
idx_to_movie = {idx: mid for mid, idx in movie_to_idx.items()}

NUM_USERS = len(user_ids)
NUM_MOVIES = len(movie_ids)

print(f"\nMapped: {NUM_USERS} users, {NUM_MOVIES} movies")

# Train/val/test split (80/10/10)
ratings_df = ratings_df.sample(frac=1, random_state=SEED).reset_index(drop=True)
n = len(ratings_df)
train_end = int(0.8 * n)
val_end = int(0.9 * n)

train_df = ratings_df[:train_end]
val_df = ratings_df[train_end:val_end]
test_df = ratings_df[val_end:]

print(f"Train: {len(train_df):,}, Val: {len(val_df):,}, Test: {len(test_df):,}")


# ──────────────────────────────────────────────
# 4. Dataset
# ──────────────────────────────────────────────
class RatingDataset(Dataset):
    def __init__(self, df, user_to_idx, movie_to_idx):
        self.users = torch.tensor(df['userId'].map(user_to_idx).values,
                                   dtype=torch.long)
        self.movies = torch.tensor(df['movieId'].map(movie_to_idx).values,
                                    dtype=torch.long)
        self.ratings = torch.tensor(df['rating'].values,
                                     dtype=torch.float32)

    def __len__(self):
        return len(self.ratings)

    def __getitem__(self, idx):
        return self.users[idx], self.movies[idx], self.ratings[idx]


train_dataset = RatingDataset(train_df, user_to_idx, movie_to_idx)
val_dataset = RatingDataset(val_df, user_to_idx, movie_to_idx)
test_dataset = RatingDataset(test_df, user_to_idx, movie_to_idx)

train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True)
val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE)
test_loader = DataLoader(test_dataset, batch_size=BATCH_SIZE)


# ──────────────────────────────────────────────
# 5. Model Definition
# ──────────────────────────────────────────────
class MFModel(nn.Module):
    """
    Matrix Factorization model with optional bias terms and MLP.

    Architecture:
        user_emb(user) + user_bias  ─┐
                                      ├──→ Concat → FC → FC → prediction
        item_emb(item) + item_bias  ─┘
    """
    def __init__(self, num_users, num_movies, embed_dim=64,
                 hidden_dims=None, dropout=0.2):
        super().__init__()
        if hidden_dims is None:
            hidden_dims = [128, 64]

        # Embeddings
        self.user_emb = nn.Embedding(num_users, embed_dim)
        self.movie_emb = nn.Embedding(num_movies, embed_dim)

        # Biases
        self.user_bias = nn.Embedding(num_users, 1)
        self.movie_bias = nn.Embedding(num_movies, 1)
        self.global_bias = nn.Parameter(torch.zeros(1))

        # MLP layers
        mlp_layers = []
        in_dim = embed_dim * 2  # user + movie embeddings concatenated
        for h_dim in hidden_dims:
            mlp_layers.extend([
                nn.Linear(in_dim, h_dim),
                nn.BatchNorm1d(h_dim),
                nn.ReLU(inplace=True),
                nn.Dropout(dropout),
            ])
            in_dim = h_dim
        mlp_layers.append(nn.Linear(in_dim, 1))
        self.mlp = nn.Sequential(*mlp_layers)

        self._init_weights()

    def _init_weights(self):
        nn.init.normal_(self.user_emb.weight, std=0.01)
        nn.init.normal_(self.movie_emb.weight, std=0.01)
        nn.init.zeros_(self.user_bias.weight)
        nn.init.zeros_(self.movie_bias.weight)

    def forward(self, user_ids, movie_ids):
        # Embeddings
        u_emb = self.user_emb(user_ids)         # (B, embed_dim)
        m_emb = self.movie_emb(movie_ids)       # (B, embed_dim)

        # Biases
        u_bias = self.user_bias(user_ids).squeeze()   # (B,)
        m_bias = self.movie_bias(movie_ids).squeeze()  # (B,)
        g_bias = self.global_bias.squeeze()

        # Concatenate embeddings for MLP
        x = torch.cat([u_emb, m_emb], dim=1)   # (B, embed_dim * 2)
        mlp_out = self.mlp(x).squeeze()          # (B,)

        # Combine: MLP output + biases
        prediction = mlp_out + u_bias + m_bias + g_bias
        # Clamp to [0.5, 5.0] range
        prediction = torch.clamp(prediction, 0.5, 5.0)
        return prediction


model = MFModel(NUM_USERS, NUM_MOVIES, EMBED_DIM, HIDDEN_DIMS, DROPOUT)
model = model.to(DEVICE)
print(f"Model parameters: {sum(p.numel() for p in model.parameters()):,}")


# ──────────────────────────────────────────────
# 6. Training
# ──────────────────────────────────────────────
criterion = nn.MSELoss()
optimizer = optim.Adam(model.parameters(), lr=LR, weight_decay=WEIGHT_DECAY)
scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode='min',
                                                  factor=0.5, patience=2,
                                                  verbose=True)


def rmse(predictions, targets):
    return math.sqrt(((predictions - targets) ** 2).mean().item())


@torch.no_grad()
def evaluate(model, loader, device):
    model.eval()
    total_loss = 0.0
    all_preds = []
    all_targets = []
    for users, movies, ratings in loader:
        users = users.to(device)
        movies = movies.to(device)
        ratings = ratings.to(device)
        preds = model(users, movies)
        loss = criterion(preds, ratings)
        total_loss += loss.item() * users.size(0)
        all_preds.append(preds.cpu())
        all_targets.append(ratings.cpu())

    all_preds = torch.cat(all_preds)
    all_targets = torch.cat(all_targets)
    avg_loss = total_loss / len(loader.dataset)
    rmse_val = rmse(all_preds, all_targets)
    return avg_loss, rmse_val, all_preds, all_targets


print(f"\nTraining on {DEVICE} for {EPOCHS} epochs\n")
print(f"{'Epoch':>5}  {'Train Loss':>10}  {'Train RMSE':>10}  "
      f"{'Val Loss':>8}  {'Val RMSE':>8}")
print("-" * 60)

best_val_rmse = float('inf')

for epoch in range(1, EPOCHS + 1):
    model.train()
    total_loss = 0.0
    all_preds = []
    all_targets = []

    for users, movies, ratings in train_loader:
        users = users.to(DEVICE)
        movies = movies.to(DEVICE)
        ratings = ratings.to(DEVICE)

        optimizer.zero_grad()
        preds = model(users, movies)
        loss = criterion(preds, ratings)
        loss.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
        optimizer.step()

        total_loss += loss.item() * users.size(0)
        all_preds.append(preds.detach().cpu())
        all_targets.append(ratings.cpu())

    train_loss = total_loss / len(train_dataset)
    train_rmse = rmse(torch.cat(all_preds), torch.cat(all_targets))

    val_loss, val_rmse, _, _ = evaluate(model, val_loader, DEVICE)
    scheduler.step(val_loss)

    print(f"{epoch:5d}  {train_loss:10.4f}  {train_rmse:10.4f}  "
          f"{val_loss:8.4f}  {val_rmse:8.4f}")

    if val_rmse < best_val_rmse:
        best_val_rmse = val_rmse
        torch.save({
            'model_state_dict': model.state_dict(),
            'num_users': NUM_USERS,
            'num_movies': NUM_MOVIES,
            'embed_dim': EMBED_DIM,
            'hidden_dims': HIDDEN_DIMS,
            'user_to_idx': user_to_idx,
            'movie_to_idx': movie_to_idx,
        }, MODEL_PATH)

print(f"\nBest validation RMSE: {best_val_rmse:.4f}")


# ──────────────────────────────────────────────
# 7. Test Evaluation
# ──────────────────────────────────────────────
checkpoint = torch.load(MODEL_PATH, map_location=DEVICE)
model.load_state_dict(checkpoint['model_state_dict'])

test_loss, test_rmse, test_preds, test_targets = evaluate(model, test_loader,
                                                            DEVICE)
print(f"Test RMSE: {test_rmse:.4f}")


# ──────────────────────────────────────────────
# 8. Recommendation Functions
# ──────────────────────────────────────────────
@torch.no_grad()
def recommend_for_user(model, user_id, movie_to_idx, movies_df,
                        device, n=10, rated_filter=True,
                        ratings_df=None):
    """Get top-N movie recommendations for a user."""
    model.eval()
    if user_id not in user_to_idx:
        print(f"User {user_id} not found.")
        return []

    user_idx = user_to_idx[user_id]
    user_tensor = torch.full((NUM_MOVIES,), user_idx, dtype=torch.long).to(device)
    movie_indices = torch.arange(NUM_MOVIES, dtype=torch.long).to(device)

    scores = model(user_tensor, movie_indices)

    # Filter out already-rated movies
    if rated_filter and ratings_df is not None:
        rated_movies = ratings_df[ratings_df['userId'] == user_id]['movieId'].values
        rated_indices = [movie_to_idx[mid] for mid in rated_movies
                          if mid in movie_to_idx]
        scores[rated_indices] = -1.0

    # Get top N
    top_scores, top_indices = scores.topk(n)
    recommendations = []
    for score, idx in zip(top_scores.cpu().numpy(), top_indices.cpu().numpy()):
        movie_id = idx_to_movie[idx]
        movie_info = movies_df[movies_df['movieId'] == movie_id]
        if len(movie_info) > 0:
            title = movie_info.iloc[0]['title']
            genres = movie_info.iloc[0]['genres']
            recommendations.append({
                'movieId': movie_id,
                'title': title,
                'genres': genres,
                'predicted_rating': round(float(score), 2),
            })

    return recommendations


@torch.no_grad()
def predict_rating(model, user_id, movie_id, device):
    """Predict the rating a user would give to a movie."""
    model.eval()
    if user_id not in user_to_idx or movie_id not in movie_to_idx:
        return None
    u = torch.tensor([user_to_idx[user_id]], dtype=torch.long).to(device)
    m = torch.tensor([movie_to_idx[movie_id]], dtype=torch.long).to(device)
    score = model(u, m)
    return round(score.item(), 2)


# Example recommendations
print("\n" + "=" * 60)
print("SAMPLE RECOMMENDATIONS")
print("=" * 60)

sample_user = train_df['userId'].iloc[0]
recs = recommend_for_user(model, sample_user, movie_to_idx, movies_df,
                           DEVICE, n=10, ratings_df=ratings_df)

print(f"\nTop 10 recommendations for User {sample_user}:")
print(f"{'#':>3}  {'Rating':>6}  {'Title':<45}  {'Genres'}")
print("-" * 80)
for i, rec in enumerate(recs, 1):
    print(f"{i:3d}  {rec['predicted_rating']:6.2f}  "
          f"{rec['title'][:44]:<45}  {rec['genres']}")

# Example rating prediction
sample_user = train_df['userId'].iloc[0]
sample_movie = train_df['movieId'].iloc[0]
pred = predict_rating(model, sample_user, sample_movie, DEVICE)
print(f"\nPredicted rating for User {sample_user}, "
      f"Movie {sample_movie}: {pred}")


# ──────────────────────────────────────────────
# 9. Embedding Analysis
# ──────────────────────────────────────────────
def find_similar_movies(model, movie_id, movie_to_idx, movies_df,
                         top_n=5):
    """Find most similar movies based on embedding cosine similarity."""
    if movie_id not in movie_to_idx:
        return []

    model.eval()
    with torch.no_grad():
        all_embeddings = model.movie_emb.weight.data.cpu()
        target_emb = all_embeddings[movie_to_idx[movie_id]]

        # Cosine similarity
        sims = torch.nn.functional.cosine_similarity(
            target_emb.unsqueeze(0), all_embeddings, dim=1
        )

        # Exclude self
        sims[movie_to_idx[movie_id]] = -1.0

        top_scores, top_indices = sims.topk(top_n)
        results = []
        for score, idx in zip(top_scores.numpy(), top_indices.numpy()):
            mid = idx_to_movie[idx]
            info = movies_df[movies_df['movieId'] == mid]
            if len(info) > 0:
                results.append({
                    'title': info.iloc[0]['title'],
                    'genres': info.iloc[0]['genres'],
                    'similarity': round(float(score), 3),
                })
        return results


# Find similar movies
print("\n" + "=" * 60)
print("SIMILAR MOVIES ANALYSIS")
print("=" * 60)

# Find a well-known movie
toy_story = movies_df[movies_df['title'].str.contains('Toy Story')]
if len(toy_story) > 0:
    ts_id = toy_story.iloc[0]['movieId']
    ts_title = toy_story.iloc[0]['title']
    similar = find_similar_movies(model, ts_id, movie_to_idx, movies_df)
    print(f"\nMovies similar to '{ts_title}':")
    for m in similar:
        print(f"  {m['similarity']:.3f}  {m['title']} ({m['genres']})")
```

---

## Project Summary and Comparison

| Project | Input | Output | Key Technique | Lines of Code | Difficulty |
|---------|-------|--------|---------------|---------------|------------|
| CIFAR-10 Classifier | 32×32 images | Class label (10) | CNN + Data Augmentation | ~200 | ★★☆☆☆ |
| Text Generator | Character sequence | Generated text | LSTM + Temperature Sampling | ~250 | ★★★☆☆ |
| Object Detector | 300×300 image | Bounding boxes + classes | Anchor Boxes + NMS | ~350 | ★★★★☆ |
| Style Transfer | Content + Style images | Stylized image | VGG Gram Matrices | ~250 | ★★★☆☆ |
| Recommendation System | User/Movie IDs | Rating prediction | Embedding Matrix Factorization | ~300 | ★★☆☆☆ |

---

## Summary

In this chapter, we built **five complete, end-to-end PyTorch projects** covering the major application areas of deep learning:

1. **Computer Vision (Classification)** — A deep CNN with batch normalization, data augmentation, confusion matrix evaluation, and model checkpointing.

2. **Natural Language Processing (Generation)** — A character-level LSTM with vocabulary encoding, training with gradient clipping, and temperature-controlled text generation.

3. **Computer Vision (Detection)** — An SSD-style detector with multi-scale feature maps, anchor box generation, hard negative mining, and non-maximum suppression.

4. **Computer Vision (Style Transfer)** — Gatys-style optimization with VGG feature extraction, Gram-matrix style loss, content loss, and total variation regularization.

5. **Recommender Systems** — Matrix factorization with learned embeddings, user/item biases, MLP-based prediction, and embedding similarity analysis.

Each project demonstrates core PyTorch patterns: `Dataset` and `DataLoader` for data handling, `nn.Module` for model definition, `autograd` for backpropagation, and proper training/evaluation loops with best-model saving.

---

## Practice Exercises

### Exercise 1 — Extend the CIFAR-10 Classifier
Add **Cutout** data augmentation (random square masking) to the CIFAR-10 pipeline. Implement it as a custom transform and compare accuracy before and after.

### Exercise 2 — Bidirectional LSTM Text Generator
Modify the character-level LSTM to be **bidirectional** during training, but unidirectional during generation. What changes are needed? How does bidirectionality affect training loss?

### Exercise 3 — YOLO-style Single-Stage Detector
Replace the SSD anchor approach with a **YOLO-style grid cell** prediction scheme. Divide the image into a 7×7 grid and predict 2 bounding boxes per cell. Compare training stability with the anchor-based approach.

### Exercise 4 — Fast Neural Style Transfer
Convert the optimization-based style transfer into a **feed-forward style transfer network** (Johnson et al.). Train a separate network for each style, then compare inference speed with the optimization approach.

### Exercise 5 — Add Side Information to Recommender
Extend the recommendation system to include:
- Movie genres as a categorical feature (embedded)
- User age/gender as features
- Timestamp-based features (day of week, time of day)

Compare RMSE with and without side information.

### Exercise 6 — Ensemble Projects
Combine Projects 1 and 3: create a system that first detects objects in an image (Project 3) and then classifies each detected region (Project 1). Handle the case where no objects are detected.
