# Chapter 8: Generative Adversarial Networks

**By Manjunath Kalburgi**

---

## Introduction

Generative Adversarial Networks (GANs), introduced by Ian Goodfellow et al. in 2014, represent one of the most elegant ideas in deep learning: two neural networks locked in competition, each improving against the other. The generator learns to produce synthetic data that is indistinguishable from real data, while the discriminator learns to tell real from fake. Through this adversarial process, the generator becomes capable of producing remarkably realistic images, audio, text, and more.

GANs have transformed generative modeling. Before GANs, generative models were slow and produced blurry results. GANs produce sharp, photorealistic outputs and have found applications in image synthesis, style transfer, super-resolution, data augmentation, art generation, drug discovery, and more.

In this chapter, we will:

1. Understand the theory behind GANs — the minimax game and Nash equilibrium
2. Learn the training algorithm and loss functions
3. Implement DCGAN (Deep Convolutional GAN) for MNIST and CIFAR-10
4. Master essential training tricks for stability
5. Study advanced GAN variants and architectures
6. Understand evaluation metrics (FID, IS)
7. Build a complete image generation pipeline

---

## 1. GAN Theory

### 1.1 The Minimax Game

A GAN consists of two networks competing in a zero-sum game:

- **Generator (G):** Maps random noise `z` to synthetic data `G(z)`. It tries to fool the discriminator.
- **Discriminator (D):** Maps data (real or fake) to a probability. It tries to correctly classify real vs. fake.

The objective is a minimax game:

```
min_G max_D  V(D, G) = E_{x~p_data}[log D(x)] + E_{z~p_z}[log(1 - D(G(z)))]

Where:
  x   = real data sample
  z   = random noise vector (latent space)
  G(z) = generated (fake) sample
  D(x) = probability that x is real
```

The discriminator maximizes this: it wants `D(x)` → 1 for real data and `D(G(z))` → 0 for fake data.

The generator minimizes this: it wants `D(G(z))` → 1 (fool the discriminator).

```
Game Dynamics:

    ┌─────────────────────────────────────────────────────┐
    │                                                     │
    │   ┌───────────┐    fake     ┌───────────────┐      │
    │   │ Generator │───────────→ │Discriminator  │      │
    │   │    (G)    │            │     (D)       │      │
    │   └─────┬─────┘            └───────┬───────┘      │
    │         │                          │               │
    │    noise z                    real or fake?        │
    │   ┌─────┴─────┐            ┌───────┴───────┐      │
    │   │  Latent   │            │  Real Data    │      │
    │   │  Space    │            │  Distribution │      │
    │   └───────────┘            └───────────────┘      │
    │                                                     │
    │   G wants: D(G(z)) → 1  (fool D)                   │
    │   D wants: D(x)→1, D(G(z))→0  (be accurate)       │
    │                                                     │
    └─────────────────────────────────────────────────────┘
```

### 1.2 Nash Equilibrium

The theoretical optimum is a Nash equilibrium where:

```
At Nash Equilibrium:
  G* generates samples from the true data distribution: p_g = p_data
  D*(x) = 1/2 for all x (cannot distinguish real from fake)

Convergence proof (simplified):
  For fixed G, optimal D:
    D*_G(x) = p_data(x) / (p_data(x) + p_g(x))

  Substituting into V(D, G):
    V(D*_G, G) = -log(4) + 2 · JS(p_data || p_g)

  Where JS is the Jensen-Shannon divergence.
  Minimum of JS divergence is 0, achieved when p_g = p_data.
```

### 1.3 Mode Collapse

One of the most common GAN failures is **mode collapse** — the generator learns to produce only a few types of outputs, covering only some modes of the data distribution:

```
Mode Collapse Example (MNIST digit generation):

  Real data distribution:          Generator output (collapsed):
  ┌─────────────────────┐         ┌─────────────────────┐
  │  0 1 2 3 4 5 6 7 8 9│         │  1 1 1 7 1 1 7 1 1 │
  │  ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓│         │  ↓     ↓     ↓     │
  │ All 10 digits present│         │ Only digits 1 and 7 │
  └─────────────────────┘         └─────────────────────┘

  The generator found that "1" and "7" fool the discriminator,
  so it only generates those — ignoring 8 other modes.
```

| GAN Problem | Cause | Symptom | Solution |
|------------|-------|---------|----------|
| Mode collapse | Generator finds shortcuts that fool D | Limited variety in outputs | Minibatch discrimination, unrolled GANs |
| Training instability | D becomes too strong or too weak | Loss oscillates or diverges | Careful learning rates, spectral norm |
| Vanishing gradients | D is too good → G gets no gradient | G stops learning | Label smoothing, train D less |
| Non-convergence | Loss doesn't decrease | Oscillating loss curves | WGAN, progressive growing |
| Internal covariate shift | D distribution changes during training | Slow training | Batch normalization everywhere |

---

## 2. Training Algorithm

### 2.1 Alternating Optimization

GAN training alternates between updating D and G:

```
GAN Training Loop:

for each training step:
    ┌─────────────────────────────────────────────────┐
    │ Step 1: Train Discriminator                     │
    │                                                  │
    │   Sample real batch: x ~ p_data                  │
    │   Sample noise: z ~ p_z                          │
    │   Generate fakes: x_fake = G(z)                  │
    │                                                  │
    │   D_loss = -[log D(x) + log(1 - D(x_fake))]     │
    │                                                  │
    │   Backprop D_loss, update D                      │
    │                                                  │
    ├─────────────────────────────────────────────────┤
    │ Step 2: Train Generator                          │
    │                                                  │
    │   Sample noise: z ~ p_z                          │
    │   Generate fakes: x_fake = G(z)                  │
    │                                                  │
    │   G_loss = -log D(G(z))                          │
    │         (or equivalently: BCE(D(G(z)), label=1)) │
    │                                                  │
    │   Backprop G_loss, update G                      │
    │   (Do NOT update D in this step)                 │
    └─────────────────────────────────────────────────┘
```

### 2.2 Implementation

```python
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from torchvision import datasets, transforms
import matplotlib.pyplot as plt
import numpy as np


def train_gan(
    generator: nn.Module,
    discriminator: nn.Module,
    dataloader: DataLoader,
    device: torch.device,
    num_epochs: int = 100,
    lr_g: float = 2e-4,
    lr_d: float = 2e-4,
    latent_dim: int = 100,
    n_critic: int = 1,  # Train D this many times per G step
) -> dict:
    """
    Standard GAN training loop.

    Args:
        generator: Generator network
        discriminator: Discriminator network
        dataloader: Real data loader
        device: Training device
        num_epochs: Number of training epochs
        lr_g: Generator learning rate
        lr_d: Discriminator learning rate
        latent_dim: Dimension of latent noise vector
        n_critic: Number of D steps per G step

    Returns:
        Dictionary of training history
    """
    criterion = nn.BCELoss()

    optimizer_G = optim.Adam(generator.parameters(), lr=lr_g, betas=(0.5, 0.999))
    optimizer_D = optim.Adam(discriminator.parameters(), lr=lr_d, betas=(0.5, 0.999))

    history = {"d_loss": [], "g_loss": [], "d_real_acc": [], "d_fake_acc": []}

    for epoch in range(num_epochs):
        epoch_d_loss = 0.0
        epoch_g_loss = 0.0
        d_real_correct = 0
        d_fake_correct = 0
        total_samples = 0

        for i, (real_images, _) in enumerate(dataloader):
            batch_size = real_images.shape[0]
            real_images = real_images.to(device)

            # Labels
            real_labels = torch.ones(batch_size, 1, device=device)
            fake_labels = torch.zeros(batch_size, 1, device=device)

            # ──────────────────────────────────────────────
            # Train Discriminator
            # ──────────────────────────────────────────────
            for _ in range(n_critic):
                optimizer_D.zero_grad()

                # Real images
                real_output = discriminator(real_images)
                d_loss_real = criterion(real_output, real_labels)

                # Fake images
                z = torch.randn(batch_size, latent_dim, device=device)
                fake_images = generator(z).detach()  # Detach so G gradients don't flow to D
                fake_output = discriminator(fake_images)
                d_loss_fake = criterion(fake_output, fake_labels)

                # Total discriminator loss
                d_loss = (d_loss_real + d_loss_fake) / 2
                d_loss.backward()
                optimizer_D.step()

                # Track accuracy
                d_real_correct += (real_output > 0.5).sum().item()
                d_fake_correct += (fake_output < 0.5).sum().item()
                total_samples += batch_size

            # ──────────────────────────────────────────────
            # Train Generator
            # ──────────────────────────────────────────────
            optimizer_G.zero_grad()

            z = torch.randn(batch_size, latent_dim, device=device)
            fake_images = generator(z)
            fake_output = discriminator(fake_images)

            # G wants D to classify fakes as real
            g_loss = criterion(fake_output, real_labels)
            g_loss.backward()
            optimizer_G.step()

            epoch_d_loss += d_loss.item()
            epoch_g_loss += g_loss.item()

        # Epoch statistics
        n_batches = len(dataloader)
        history["d_loss"].append(epoch_d_loss / n_batches)
        history["g_loss"].append(epoch_g_loss / n_batches)
        history["d_real_acc"].append(d_real_correct / total_samples)
        history["d_fake_acc"].append(d_fake_correct / total_samples)

        print(
            f"Epoch [{epoch + 1}/{num_epochs}] "
            f"D_loss: {history['d_loss'][-1]:.4f} "
            f"G_loss: {history['g_loss'][-1]:.4f} "
            f"D_real_acc: {history['d_real_acc'][-1]:.3f} "
            f"D_fake_acc: {history['d_fake_acc'][-1]:.3f}"
        )

    return history
```

### 2.3 Loss Functions

| Loss | Formula | Pros | Cons |
|------|---------|------|------|
| **BCE (Original GAN)** | `-log(D(x)) - log(1-D(G(z)))` | Simple, original | Unstable training, vanishing gradients |
| **BCE with Logits** | `BCEWithLogitsLoss` | More numerically stable | Same theoretical issues |
| **Least Squares GAN** | `(D(x)-1)² + D(G(z))²` | More stable, vanishing gradients less common | Not zero-sum |
| **Wasserstein (WGAN)** | `E[D(x)] - E[D(G(z))]` | Meaningful loss, stable training | Requires weight clipping |
| **Hinge Loss** | `max(0, 1-D(x)) + max(0, 1+D(G(z)))` | Simple, stable | Less common |

---

## 3. Loss Function Implementations

### 3.1 Binary Cross-Entropy (Original GAN Loss)

```python
# Standard GAN loss
def gan_bce_loss(d_real: torch.Tensor, d_fake: torch.Tensor) -> tuple[torch.Tensor, torch.Tensor]:
    """
    Compute GAN losses using binary cross-entropy.

    Args:
        d_real: Discriminator output on real images
        d_fake: Discriminator output on fake images
    Returns:
        (d_loss, g_loss)
    """
    real_labels = torch.ones_like(d_real)
    fake_labels = torch.zeros_like(d_fake)

    d_loss_real = nn.functional.binary_cross_entropy(d_real, real_labels)
    d_loss_fake = nn.functional.binary_cross_entropy(d_fake, fake_labels)

    d_loss = (d_loss_real + d_loss_fake) / 2

    # For G: maximize log(D(G(z)))
    g_loss = nn.functional.binary_cross_entropy(
        d_fake, torch.ones_like(d_fake)
    )

    return d_loss, g_loss
```

### 3.2 Wasserstein Loss (WGAN)

```python
def wgan_d_loss(d_real: torch.Tensor, d_fake: torch.Tensor) -> torch.Tensor:
    """WGAN discriminator (critic) loss: maximize E[D(x)] - E[D(G(z))]."""
    return -torch.mean(d_real) + torch.mean(d_fake)


def wgan_g_loss(d_fake: torch.Tensor) -> torch.Tensor:
    """WGAN generator loss: maximize E[D(G(z))]."""
    return -torch.mean(d_fake)


def gradient_penalty(
    discriminator: nn.Module,
    real_images: torch.Tensor,
    fake_images: torch.Tensor,
    device: torch.device,
    lambda_gp: float = 10.0,
) -> torch.Tensor:
    """
    Compute gradient penalty for WGAN-GP.

    Enforces the Lipschitz constraint by penalizing the gradient norm
    of the critic's output with respect to its input.

    Args:
        discriminator: Critic network
        real_images: Real data batch
        fake_images: Fake data batch
        device: Computation device
        lambda_gp: Gradient penalty coefficient
    Returns:
        Scalar gradient penalty loss
    """
    batch_size = real_images.shape[0]

    # Random interpolation between real and fake
    alpha = torch.rand(batch_size, 1, 1, 1, device=device)
    interpolated = (alpha * real_images + (1 - alpha) * fake_images).requires_grad_(True)

    d_interpolated = discriminator(interpolated)

    # Compute gradients
    gradients = torch.autograd.grad(
        outputs=d_interpolated,
        inputs=interpolated,
        grad_outputs=torch.ones_like(d_interpolated),
        create_graph=True,
        retain_graph=True,
    )[0]

    gradients = gradients.view(batch_size, -1)
    gradient_norm = gradients.norm(2, dim=1)
    penalty = lambda_gp * ((gradient_norm - 1) ** 2).mean()

    return penalty
```

### 3.3 Hinge Loss

```python
def hinge_d_loss(d_real: torch.Tensor, d_fake: torch.Tensor) -> torch.Tensor:
    """Hinge loss for discriminator."""
    return torch.mean(torch.relu(1.0 - d_real) + torch.relu(1.0 + d_fake))


def hinge_g_loss(d_fake: torch.Tensor) -> torch.Tensor:
    """Hinge loss for generator."""
    return -torch.mean(d_fake)
```

---

## 4. DCGAN (Deep Convolutional GAN)

### 4.1 Architecture Guidelines

DCGAN (Radford et al., 2016) established architectural rules that made GAN training stable:

| DCGAN Guideline | Reason |
|----------------|--------|
| Replace pooling with strided conv (D) and transposed conv (G) | Let the network learn its own downsampling/upsampling |
| Use Batch Normalization in both G and D | Stabilizes training, prevents mode collapse |
| Remove fully connected hidden layers | Reduce parameters, improve generalization |
| Use ReLU in G (except output: tanh) | Prevent sparse gradients |
| Use LeakyReLU in D (slope 0.2) | Prevent sparse gradients, allow gradient flow |
| Use Adam optimizer with β₁=0.5 | Standard for GAN training |

### 4.2 DCGAN Architecture Diagram

```
DCGAN Generator:

  z (100-dim) → [Dense] → [Reshape 4×4×1024]
                                │
                ┌───────────────┴───────────────┐
                ↓                               ↓
        [ConvTranspose2d]              [BatchNorm + ReLU]
        4×4 → 8×8                      1024 → 512 channels
                ↓
        [ConvTranspose2d]              [BatchNorm + ReLU]
        8×8 → 16×16                    512 → 256 channels
                ↓
        [ConvTranspose2d]              [BatchNorm + ReLU]
        16×16 → 32×32                  256 → 128 channels
                ↓
        [ConvTranspose2d]              [Tanh activation]
        32×32 → 64×64                  128 → 3 channels

  Output: 64×64×3 RGB image


DCGAN Discriminator:

  Input: 64×64×3 image
        │
        ↓
  [Conv2d] 64×64 → 32×32     [LeakyReLU(0.2)]       3 → 64 channels
        ↓
  [Conv2d] 32×32 → 16×16     [BatchNorm + LeakyReLU] 64 → 128 channels
        ↓
  [Conv2d] 16×16 → 8×8       [BatchNorm + LeakyReLU] 128 → 256 channels
        ↓
  [Conv2d] 8×8 → 4×4         [BatchNorm + LeakyReLU] 256 → 512 channels
        ↓
  [Flatten] 4×4×512 = 8192
        ↓
  [Dense] → 1               [Sigmoid]
        ↓
  Output: probability (real vs fake)
```

### 4.3 Complete DCGAN Implementation

```python
import torch
import torch.nn as nn


class DCGANGenerator(nn.Module):
    """
    DCGAN Generator: maps latent noise z to a synthetic image.

    Input: (batch, latent_dim) → Output: (batch, channels, height, width)
    """

    def __init__(
        self,
        latent_dim: int = 100,
        channels: int = 3,
        features_g: int = 64,
    ):
        super().__init__()
        self.latent_dim = latent_dim

        # Input: (batch, latent_dim, 1, 1)
        self.main = nn.Sequential(
            # Layer 1: latent_dim → features_g * 8, 4x4
            nn.ConvTranspose2d(latent_dim, features_g * 8, 4, 1, 0, bias=False),
            nn.BatchNorm2d(features_g * 8),
            nn.ReLU(True),

            # Layer 2: features_g * 8 → features_g * 4, 8x8
            nn.ConvTranspose2d(features_g * 8, features_g * 4, 4, 2, 1, bias=False),
            nn.BatchNorm2d(features_g * 4),
            nn.ReLU(True),

            # Layer 3: features_g * 4 → features_g * 2, 16x16
            nn.ConvTranspose2d(features_g * 4, features_g * 2, 4, 2, 1, bias=False),
            nn.BatchNorm2d(features_g * 2),
            nn.ReLU(True),

            # Layer 4: features_g * 2 → features_g, 32x32
            nn.ConvTranspose2d(features_g * 2, features_g, 4, 2, 1, bias=False),
            nn.BatchNorm2d(features_g),
            nn.ReLU(True),

            # Layer 5: features_g → channels, 64x64
            nn.ConvTranspose2d(features_g, channels, 4, 2, 1, bias=False),
            nn.Tanh(),  # Output in [-1, 1]
        )

        # Initialize weights
        self.apply(self._init_weights)

    @staticmethod
    def _init_weights(m: nn.Module):
        if isinstance(m, (nn.Conv2d, nn.ConvTranspose2d)):
            nn.init.normal_(m.weight, 0.0, 0.02)
        elif isinstance(m, nn.BatchNorm2d):
            nn.init.normal_(m.weight, 1.0, 0.02)
            nn.init.constant_(m.bias, 0)

    def forward(self, z: torch.Tensor) -> torch.Tensor:
        """
        Args:
            z: (batch, latent_dim)
        Returns:
            fake_images: (batch, channels, 64, 64)
        """
        return self.main(z.view(-1, self.latent_dim, 1, 1))


class DCGANDiscriminator(nn.Module):
    """
    DCGAN Discriminator: classifies images as real or fake.

    Input: (batch, channels, 64, 64) → Output: (batch, 1)
    """

    def __init__(self, channels: int = 3, features_d: int = 64):
        super().__init__()

        self.main = nn.Sequential(
            # Layer 1: channels → features_d, 32x32
            nn.Conv2d(channels, features_d, 4, 2, 1, bias=False),
            nn.LeakyReLU(0.2, inplace=True),

            # Layer 2: features_d → features_d * 2, 16x16
            nn.Conv2d(features_d, features_d * 2, 4, 2, 1, bias=False),
            nn.BatchNorm2d(features_d * 2),
            nn.LeakyReLU(0.2, inplace=True),

            # Layer 3: features_d * 2 → features_d * 4, 8x8
            nn.Conv2d(features_d *  2, features_d * 4, 4, 2, 1, bias=False),
            nn.BatchNorm2d(features_d * 4),
            nn.LeakyReLU(0.2, inplace=True),

            # Layer 4: features_d * 4 → features_d * 8, 4x4
            nn.Conv2d(features_d * 4, features_d * 8, 4, 2, 1, bias=False),
            nn.BatchNorm2d(features_d * 8),
            nn.LeakyReLU(0.2, inplace=True),

            # Output: 1 channel, 1x1
            nn.Conv2d(features_d * 8, 1, 4, 1, 0, bias=False),
            nn.Sigmoid(),
        )

        # Initialize weights
        self.apply(self._init_weights)

    @staticmethod
    def _init_weights(m: nn.Module):
        if isinstance(m, (nn.Conv2d, nn.ConvTranspose2d)):
            nn.init.normal_(m.weight, 0.0, 0.02)
        elif isinstance(m, nn.BatchNorm2d):
            nn.init.normal_(m.weight, 1.0, 0.02)
            nn.init.constant_(m.bias, 0)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        Args:
            x: (batch, channels, 64, 64)
        Returns:
            validity: (batch, 1) probability of being real
        """
        return self.main(x).view(-1, 1)


def train_dcgan_mnist():
    """
    Train a DCGAN on MNIST (grayscale, so we adapt channels).
    """
    import torch
    from torchvision import datasets, transforms
    from torch.utils.data import DataLoader
    import matplotlib.pyplot as plt
    import os

    # Hyperparameters
    LATENT_DIM = 100
    BATCH_SIZE = 128
    EPOCHS = 50
    LR = 2e-4
    DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    IMG_CHANNELS = 1  # Grayscale for MNIST

    # Data
    transform = transforms.Compose([
        transforms.Resize(64),
        transforms.ToTensor(),
        transforms.Normalize([0.5], [0.5]),  # Scale to [-1, 1]
    ])

    dataset = datasets.MNIST(
        root="./data", train=True, download=True, transform=transform
    )
    dataloader = DataLoader(dataset, batch_size=BATCH_SIZE, shuffle=True,
                            num_workers=2, drop_last=True)

    # Models
    G = DCGANGenerator(LATENT_DIM, IMG_CHANNELS, features_g=64).to(DEVICE)
    D = DCGANDiscriminator(IMG_CHANNELS, features_d=64).to(DEVICE)

    print(f"Generator params:     {sum(p.numel() for p in G.parameters()):,}")
    print(f"Discriminator params: {sum(p.numel() for p in D.parameters()):,}")

    # Optimizers
    opt_G = torch.optim.Adam(G.parameters(), lr=LR, betas=(0.5, 0.999))
    opt_D = torch.optim.Adam(D.parameters(), lr=LR, betas=(0.5, 0.999))

    criterion = nn.BCELoss()

    # Fixed noise for visualization
    fixed_noise = torch.randn(64, LATENT_DIM, 1, 1, device=DEVICE)

    os.makedirs("dcgan_samples", exist_ok=True)

    for epoch in range(EPOCHS):
        for i, (real_imgs, _) in enumerate(dataloader):
            batch_size = real_imgs.shape[0]
            real_imgs = real_imgs.to(DEVICE)

            real_labels = torch.ones(batch_size, 1, device=DEVICE)
            fake_labels = torch.zeros(batch_size, 1, device=DEVICE)

            # ── Train D ──
            z = torch.randn(batch_size, LATENT_DIM, 1, 1, device=DEVICE)
            fake_imgs = G(z).detach()

            d_real = D(real_imgs)
            d_fake = D(fake_imgs)

            d_loss = (criterion(d_real, real_labels) + criterion(d_fake, fake_labels)) / 2

            opt_D.zero_grad()
            d_loss.backward()
            opt_D.step()

            # ── Train G ──
            z = torch.randn(batch_size, LATENT_DIM, 1, 1, device=DEVICE)
            fake_imgs = G(z)
            d_fake = D(fake_imgs)

            g_loss = criterion(d_fake, real_labels)  # G wants D to output 1

            opt_G.zero_grad()
            g_loss.backward()
            opt_G.step()

        print(f"Epoch [{epoch + 1}/{EPOCHS}] D_loss: {d_loss.item():.4f} G_loss: {g_loss.item():.4f}")

        # Save sample images
        with torch.no_grad():
            fake_samples = G(fixed_noise).cpu()
            # Save a grid of images
            from torchvision.utils import save_image
            save_image(fake_samples, f"dcgan_samples/epoch_{epoch + 1:03d}.png",
                       normalize=True, nrow=8)

    return G, D


# Run training
# generator, discriminator = train_dcgan_mnist()
```

### 4.4 CIFAR-10 Variant

```python
def train_dcgan_cifar10():
    """Train DCGAN on CIFAR-10 (color images)."""
    from torchvision import datasets, transforms
    from torch.utils.data import DataLoader
    from torchvision.utils import save_image

    LATENT_DIM = 100
    BATCH_SIZE = 128
    EPOCHS = 100
    LR = 2e-4
    DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    IMG_CHANNELS = 3  # RGB for CIFAR-10

    transform = transforms.Compose([
        transforms.Resize(64),
        transforms.ToTensor(),
        transforms.Normalize([0.5, 0.5, 0.5], [0.5, 0.5, 0.5]),
    ])

    dataset = datasets.CIFAR10(root="./data", train=True, download=True, transform=transform)
    dataloader = DataLoader(dataset, batch_size=BATCH_SIZE, shuffle=True,
                            num_workers=2, drop_last=True)

    G = DCGANGenerator(LATENT_DIM, IMG_CHANNELS, features_g=64).to(DEVICE)
    D = DCGANDiscriminator(IMG_CHANNELS, features_d=64).to(DEVICE)

    opt_G = torch.optim.Adam(G.parameters(), lr=LR, betas=(0.5, 0.999))
    opt_D = torch.optim.Adam(D.parameters(), lr=LR, betas=(0.5, 0.999))

    criterion = nn.BCELoss()
    fixed_noise = torch.randn(64, LATENT_DIM, 1, 1, device=DEVICE)

    import os
    os.makedirs("dcgan_cifar10", exist_ok=True)

    for epoch in range(EPOCHS):
        for real_imgs, _ in dataloader:
            batch_size = real_imgs.shape[0]
            real_imgs = real_imgs.to(DEVICE)

            real_labels = torch.ones(batch_size, 1, device=DEVICE)
            fake_labels = torch.zeros(batch_size, 1, device=DEVICE)

            # Train D
            z = torch.randn(batch_size, LATENT_DIM, 1, 1, device=DEVICE)
            fake_imgs = G(z).detach()

            d_loss = (criterion(D(real_imgs), real_labels) +
                      criterion(D(fake_imgs), fake_labels)) / 2

            opt_D.zero_grad()
            d_loss.backward()
            opt_D.step()

            # Train G
            z = torch.randn(batch_size, LATENT_DIM, 1, 1, device=DEVICE)
            fake_imgs = G(z)
            g_loss = criterion(D(fake_imgs), real_labels)

            opt_G.zero_grad()
            g_loss.backward()
            opt_G.step()

        print(f"Epoch [{epoch + 1}/{EPOCHS}] D: {d_loss.item():.4f} G: {g_loss.item():.4f}")

        with torch.no_grad():
            samples = G(fixed_noise).cpu()
            save_image(samples, f"dcgan_cifar10/epoch_{epoch + 1:03d}.png",
                       normalize=True, nrow=8)

    return G, D
```

---

## 5. Training Tricks for Stable GAN Training

### 5.1 Label Smoothing

Instead of using hard labels (1.0 and 0.0), smooth them slightly. This prevents the discriminator from becoming too confident:

```python
def label_smoothing_loss(
    d_real: torch.Tensor,
    d_fake: torch.Tensor,
    real_label_smooth: float = 0.9,  # Instead of 1.0
    fake_label: float = 0.0,
) -> tuple[torch.Tensor, torch.Tensor]:
    """
    GAN loss with label smoothing for the real class.

    Label smoothing prevents D from becoming overconfident,
    which helps maintain gradient flow to G.
    """
    real_labels = torch.full_like(d_real, real_label_smooth)
    fake_labels = torch.full_like(d_fake, fake_label)

    d_loss = (nn.functional.binary_cross_entropy(d_real, real_labels)
            + nn.functional.binary_cross_entropy(d_fake, fake_labels)) / 2

    # One-sided label smoothing: only smooth real labels for D
    # For G, still target 1.0 (or sometimes 0.0 for "one-sided")
    g_loss = nn.functional.binary_cross_entropy(d_fake, torch.ones_like(d_fake))

    return d_loss, g_loss
```

### 5.2 Spectral Normalization

Spectral normalization constrains the Lipschitz constant of the discriminator, which stabilizes training (used in ProGAN and BigGAN):

```python
import torch.nn as nn


class SpectralNormDiscriminator(nn.Module):
    """Discinator with spectral normalization on all Conv layers."""

    def __init__(self, channels: int = 3, features_d: int = 64):
        super().__init__()

        self.main = nn.Sequential(
            # SpectralNorm applied automatically via nn.utils.spectral_norm
            nn.utils.spectral_norm(
                nn.Conv2d(channels, features_d, 4, 2, 1, bias=False)
            ),
            nn.LeakyReLU(0.2, inplace=True),

            nn.utils.spectral_norm(
                nn.Conv2d(features_d, features_d * 2, 4, 2, 1, bias=False)
            ),
            nn.LeakyReLU(0.2, inplace=True),

            nn.utils.spectral_norm(
                nn.Conv2d(features_d * 2, features_d * 4, 4, 2, 1, bias=False)
            ),
            nn.LeakyReLU(0.2, inplace=True),

            nn.utils.spectral_norm(
                nn.Conv2d(features_d * 4, features_d * 8, 4, 2, 1, bias=False)
            ),
            nn.LeakyReLU(0.2, inplace=True),

            nn.Conv2d(features_d * 8, 1, 4, 1, 0, bias=False),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.main(x).view(-1, 1)


# Apply spectral norm to existing model
discriminator = DCGANDiscriminator(channels=3)
for module in discriminator.modules():
    if isinstance(module, nn.Conv2d):
        nn.utils.spectral_norm(module)
```

### 5.3 Two Time-Scale Update Rule (TTUR)

Using different learning rates for G and D:

```python
# TTUR: D learns faster than G
opt_G = torch.optim.Adam(G.parameters(), lr=1e-4, betas=(0.5, 0.999))
opt_D = torch.optim.Adam(D.parameters(), lr=4e-4, betas=(0.5, 0.999))
```

### 5.4 Instance Noise

Adding noise that decreases over training helps the discriminator:

```python
def add_instance_noise(
    x: torch.Tensor, sigma: float = 0.1
) -> torch.Tensor:
    """Add Gaussian noise to images."""
    return x + torch.randn_like(x) * sigma


# Noise schedule: decrease sigma over training
def get_noise_sigma(epoch: int, max_epochs: int, start_sigma: float = 0.1) -> float:
    """Linear decay of noise sigma."""
    return start_sigma * max(0, 1 - epoch / (max_epochs * 0.5))
```

### 5.5 Training Tricks Comparison

| Technique | What It Does | Effect on Training | Recommended For |
|-----------|-------------|-------------------|-----------------|
| Label smoothing (D) | Target 0.9 instead of 1.0 for reals | Prevents overconfident D | All GANs |
| One-sided label smoothing | Only smooth real labels | Reduces D dominance | All GANs |
| Spectral normalization | Constrains weight norms | Stabilizes D, prevents mode collapse | ProGAN, BigGAN |
| TTUR | Different LRs for D and G | Balances training speeds | All GANs |
| Instance noise | Add Gaussian noise | Smooths D decision boundary | Early training stages |
| Gradient penalty | Penalize gradient norm (WGAN-GP) | Enforces Lipschitz constraint | WGAN-GP |
| Two-sided label smoothing | Smooth both real and fake labels | D less confident on both | Experimental |
| Feature matching | Match intermediate features | Reduces mode collapse | Improved GAN |
| Minibatch discrimination | D sees batch statistics | Reduces mode collapse | Mode-seeking tasks |

### 5.6 Feature Matching

```python
def feature_matching_loss(
    real_features: torch.Tensor,
    fake_features: torch.Tensor,
) -> torch.Tensor:
    """
    Feature matching: G tries to match the mean statistics
    of intermediate features in D.

    Instead of fooling D's output, G tries to match D's
    internal representation of real and fake data.
    """
    real_mean = real_features.mean(dim=0)
    fake_mean = fake_features.mean(dim=0)
    return torch.mean((real_mean - fake_mean) ** 2)
```

---

## 6. Advanced GAN Variants

### 6.1 WGAN-GP (Wasserstein GAN with Gradient Penalty)

WGAN-GP provides more stable training with a meaningful loss metric:

```python
def train_wgan_gp(
    generator: nn.Module,
    discriminator: nn.Module,
    dataloader: torch.utils.data.DataLoader,
    device: torch.device,
    num_epochs: int = 100,
    latent_dim: int = 100,
    n_critic: int = 5,      # Train D more than G
    lambda_gp: float = 10.0,
    lr: float = 1e-4,
) -> dict:
    """
    WGAN-GP training loop.

    Key differences from standard GAN:
    - No sigmoid in D (critic outputs unbounded scores)
    - Use WGAN loss (Earth Mover distance approximation)
    - Gradient penalty enforces Lipschitz constraint
    - D is called "critic" (not binary classifier)
    """
    opt_G = torch.optim.Adam(generator.parameters(), lr=lr, betas=(0.0, 0.9))
    opt_D = torch.optim.Adam(discriminator.parameters(), lr=lr, betas=(0.0, 0.9))

    history = {"d_loss": [], "g_loss": [], "gp": []}

    for epoch in range(num_epochs):
        epoch_d_loss = 0.0
        epoch_g_loss = 0.0
        epoch_gp = 0.0

        for i, (real_imgs, _) in enumerate(dataloader):
            batch_size = real_imgs.shape[0]
            real_imgs = real_imgs.to(device)

            # ── Train Critic (n_critic times) ──
            for _ in range(n_critic):
                optimizer_d.zero_grad()

                z = torch.randn(batch_size, latent_dim, device=device)
                fake_imgs = generator(z).detach()

                # Wasserstein loss
                d_real = discriminator(real_imgs).mean()
                d_fake = discriminator(fake_imgs).mean()

                # Gradient penalty
                gp = gradient_penalty(discriminator, real_imgs, fake_imgs, device, lambda_gp)

                d_loss = d_fake - d_real + gp

                opt_D.zero_grad()
                d_loss.backward()
                opt_D.step()

                epoch_d_loss += d_loss.item()
                epoch_gp += gp.item()

            # ── Train Generator ──
            z = torch.randn(batch_size, latent_dim, device=device)
            fake_imgs = generator(z)
            g_loss = -discriminator(fake_imgs).mean()

            opt_G.zero_grad()
            g_loss.backward()
            opt_G.step()

            epoch_g_loss += g_loss.item()

        n_batches = len(dataloader)
        n_d_steps = n_critic * n_batches
        history["d_loss"].append(epoch_d_loss / n_d_steps)
        history["g_loss"].append(epoch_g_loss / n_batches)
        history["gp"].append(epoch_gp / n_d_steps)

        print(
            f"Epoch [{epoch + 1}/{num_epochs}] "
            f"D_loss: {history['d_loss'][-1]:.4f} "
            f"G_loss: {history['g_loss'][-1]:.4f} "
            f"GP: {history['gp'][-1]:.4f}"
        )

    return history
```

### 6.2 Conditional GAN (cGAN)

Conditional GANs generate data conditioned on a label (e.g., "generate a digit 7"):

```python
class ConditionalGenerator(nn.Module):
    """Generator conditioned on a class label."""

    def __init__(
        self,
        latent_dim: int = 100,
        num_classes: int = 10,
        embed_dim: int = 100,
        channels: int = 1,
        features_g: int = 64,
    ):
        super().__init__()
        self.label_embedding = nn.Embedding(num_classes, embed_dim)
        self.latent_dim = latent_dim

        # Input: latent_dim + embed_dim
        self.main = nn.Sequential(
            nn.ConvTranspose2d(latent_dim + embed_dim, features_g * 8, 4, 1, 0, bias=False),
            nn.BatchNorm2d(features_g * 8),
            nn.ReLU(True),

            nn.ConvTranspose2d(features_g * 8, features_g * 4, 4, 2, 1, bias=False),
            nn.BatchNorm2d(features_g * 4),
            nn.ReLU(True),

            nn.ConvTranspose2d(features_g * 4, features_g * 2, 4, 2, 1, bias=False),
            nn.BatchNorm2d(features_g * 2),
            nn.ReLU(True),

            nn.ConvTranspose2d(features_g * 2, features_g, 4, 2, 1, bias=False),
            nn.BatchNorm2d(features_g),
            nn.ReLU(True),

            nn.ConvTranspose2d(features_g, channels, 4, 2, 1, bias=False),
            nn.Tanh(),
        )

    def forward(self, z: torch.Tensor, labels: torch.Tensor) -> torch.Tensor:
        """
        Args:
            z: (batch, latent_dim)
            labels: (batch,) class labels
        Returns:
            fake_images: (batch, channels, 64, 64)
        """
        label_emb = self.label_embedding(labels)  # (batch, embed_dim)
        # Concatenate noise and label embedding
        gen_input = torch.cat([z, label_emb], dim=1)
        return self.main(gen_input.view(-1, self.latent_dim + 100, 1, 1))


class ConditionalDiscriminator(nn.Module):
    """Discriminator conditioned on a class label."""

    def __init__(
        self,
        num_classes: int = 10,
        embed_dim: int = 100,
        channels: int = 1,
        features_d: int = 64,
        img_size: int = 64,
    ):
        super().__init__()
        self.label_embedding = nn.Embedding(num_classes, embed_dim)
        self.img_size = img_size

        # Embed label and broadcast to image size
        self.label_proj = nn.Sequential(
            nn.Linear(embed_dim, channels * img_size * img_size),
            nn.LeakyReLU(0.2, inplace=True),
        )

        self.main = nn.Sequential(
            nn.Conv2d(channels * 2, features_d, 4, 2, 1, bias=False),
            nn.LeakyReLU(0.2, inplace=True),

            nn.Conv2d(features_d, features_d * 2, 4, 2, 1, bias=False),
            nn.BatchNorm2d(features_d * 2),
            nn.LeakyReLU(0.2, inplace=True),

            nn.Conv2d(features_d * 2, features_d * 4, 4, 2, 1, bias=False),
            nn.BatchNorm2d(features_d * 4),
            nn.LeakyReLU(0.2, inplace=True),

            nn.Conv2d(features_d * 4, features_d * 8, 4, 2, 1, bias=False),
            nn.BatchNorm2d(features_d * 8),
            nn.LeakyReLU(0.2, inplace=True),

            nn.Conv2d(features_d * 8, 1, 4, 1, 0, bias=False),
            nn.Sigmoid(),
        )

    def forward(self, img: torch.Tensor, labels: torch.Tensor) -> torch.Tensor:
        """
        Args:
            img: (batch, channels, 64, 64)
            labels: (batch,) class labels
        Returns:
            validity: (batch, 1)
        """
        label_emb = self.label_embedding(labels)
        label_img = self.label_proj(label_emb)
        label_img = label_img.view(-1, img.shape[1], self.img_size, self.img_size)

        # Concatenate image and label projection
        d_input = torch.cat([img, label_img], dim=1)
        return self.main(d_input).view(-1, 1)


# Conditional generation
def generate_class_specific(
    generator: ConditionalGenerator,
    class_label: int,
    num_samples: int = 16,
    latent_dim: int = 100,
    device: torch.device = torch.device("cpu"),
) -> torch.Tensor:
    """Generate images of a specific class."""
    generator.eval()
    with torch.no_grad():
        z = torch.randn(num_samples, latent_dim, device=device)
        labels = torch.full((num_samples,), class_label, dtype=torch.long, device=device)
        fake_images = generator(z, labels)
    return fake_images
```

### 6.3 Progressive Growing GAN (ProGAN)

Progressive growing gradually increases the resolution during training:

```
Progressive Growing Timeline:

Phase 1: 4×4 pixels     → D/G have 1 block
Phase 2: 8×8 pixels     → Fade in new block (0→1 weight)
Phase 3: 16×16 pixels   → Fade in new block
Phase 4: 32×32 pixels   → Fade in new block
Phase 5: 64×64 pixels   → Fade in new block
Phase 6: 128×128 pixels → Fade in new block
...

Fade-in (alpha ramp 0→1):
    output = (1 - α) × low_res + α × high_res
    α increases linearly from 0 to 1 over training steps
```

```python
class ProGANGeneratorBlock(nn.Module):
    """Single block for progressive growing GAN with fade-in."""

    def __init__(self, in_channels: int, out_channels: int):
        super().__init__()
        self.conv1 = nn.Conv2d(in_channels, out_channels, 3, padding=1)
        self.conv2 = nn.Conv2d(out_channels, out_channels, 3, padding=1)
        self.upsample = nn.Upsample(scale_factor=2, mode="nearest")
        self.lrelu = nn.LeakyReLU(0.2, inplace=True)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = self.lrelu(self.conv1(x))
        x = self.lrelu(self.conv2(x))
        return x


class ProGANGenerator(nn.Module):
    """
    Progressive GAN generator. Starts at low resolution and grows.

    Args:
        latent_dim: Dimension of latent space
        max_channels: Maximum channel count (at highest resolution)
        start_channels: Starting channel count
    """

    def __init__(self, latent_dim: int = 512, max_channels: int = 512, start_channels: int = 16):
        super().__init__()
        self.latent_dim = latent_dim
        self.blocks = nn.ModuleList()
        self.to_rgb = nn.ModuleList()

        channels = [start_channels]
        while start_channels < max_channels:
            start_channels *= 2
            channels.append(start_channels)

        # Initial block (4×4)
        self.initial = nn.Sequential(
            nn.ConvTranspose2d(latent_dim, channels[0] * 4, 4, 1, 0),
            nn.BatchNorm2d(channels[0] * 4),
            nn.LeakyReLU(0.2, inplace=True),
        )
        self.to_rgb.append(nn.Conv2d(channels[0], 3, 1))

        # Progressive blocks
        for i in range(1, len(channels)):
            block = ProGANGeneratorBlock(channels[i - 1], channels[i])
            self.blocks.append(block)
            self.to_rgb.append(nn.Conv2d(channels[i], 3, 1))

        self.active_blocks = 1  # Number of active blocks
        self.alpha = 1.0        # Fade-in parameter

    def forward(self, z: torch.Tensor) -> torch.Tensor:
        x = self.initial(z.view(-1, self.latent_dim, 1, 1))

        # Apply active blocks
        for i in range(min(self.active_blocks, len(self.blocks))):
            if i < self.active_blocks - 1:
                x = self.blocks[i](x)
            else:
                # Last block: fade-in
                x = self.blocks[i](x) * self.alpha

        # Apply to_rgb for current resolution
        x = self.to_rgb[min(self.active_blocks - 1, len(self.to_rgb) - 1)](x)

        return torch.tanh(x)
```

### 6.4 StyleGAN Concepts

StyleGAN introduces several innovations that enable unprecedented image quality:

```
StyleGAN Architecture:

    z (latent) → Mapping Network → w (style vector)
         │              │
         │              ├→ Style 1 (after each conv block)
         │              ├→ Style 2
         │              ├→ Style 3
         │              └→ Style 4
         │
    Random noise → [per-pixel noise injection at each layer]
         │
    Constant input (4×4×512) → [Adaptive Instance Norm] → Style
                                                ↓
                                    ┌──────────────────┐
                                    │  Synthesis Network │
                                    │  (grows progressively) │
                                    └──────────────────┘
                                                ↓
                                         Generated Image

Key innovations:
  - Mapping network: z → w (8 FC layers, disentangles latent space)
  - Adaptive Instance Normalization (AdaIN): injects style at each layer
  - Noise injection: adds stochastic variation (hair, texture details)
  - Style mixing: use different w vectors at different layers
```

---

## 7. Monitoring Training

### 7.1 Loss Curves

```python
import matplotlib.pyplot as plt


def plot_gan_training(history: dict, save_path: str = "gan_loss_curves.png"):
    """Plot GAN training loss curves and accuracy."""
    fig, axes = plt.subplots(1, 3, figsize=(18, 5))

    # D Loss
    axes[0].plot(history["d_loss"], label="D Loss", color="blue")
    axes[0].set_title("Discriminator Loss")
    axes[0].set_xlabel("Epoch")
    axes[0].set_ylabel("Loss")
    axes[0].legend()
    axes[0].grid(True, alpha=0.3)

    # G Loss
    axes[1].plot(history["g_loss"], label="G Loss", color="red")
    axes[1].set_title("Generator Loss")
    axes[1].set_xlabel("Epoch")
    axes[1].set_ylabel("Loss")
    axes[1].legend()
    axes[1].grid(True, alpha=0.3)

    # D Accuracy
    if "d_real_acc" in history:
        axes[2].plot(history["d_real_acc"], label="D Real Acc", color="green")
        axes[2].plot(history["d_fake_acc"], label="D Fake Acc", color="orange")
        axes[2].axhline(y=0.5, color="gray", linestyle="--", label="Random (0.5)")
        axes[2].set_title("Discriminator Accuracy")
        axes[2].set_xlabel("Epoch")
        axes[2].set_ylabel("Accuracy")
        axes[2].legend()
        axes[2].grid(True, alpha=0.3)

    plt.tight_layout()
    plt.savefig(save_path, dpi=150, bbox_inches="tight")
    plt.close()


def visualize_samples(generator: torch.Tensor, latent_dim: int, device: torch.device,
                      epoch: int, save_path: str = "samples"):
    """Generate and save a grid of samples."""
    from torchvision.utils import save_image
    import os

    os.makedirs(save_path, exist_ok=True)
    generator.eval()
    with torch.no_grad():
        z = torch.randn(64, latent_dim, device=device)
        samples = generator(z)
        save_image(
            samples,
            f"{save_path}/epoch_{epoch:04d}.png",
            normalize=True,
            nrow=8,
        )
    generator.train()
```

### 7.2 What to Monitor

| Metric | Healthy Range | Problem Sign | Fix |
|--------|--------------|-------------|-----|
| D loss | ~ln(2) ≈ 0.69 | → 0 (too strong) | Label smoothing, train D less |
| D loss | Low and stable | → ∞ (too weak) | Increase D capacity, lower D LR |
| G loss | Moderate, decreasing | → 0 (too easy) | D is too weak, increase D capacity |
| G loss | High, not decreasing | Not learning | Increase G LR, check architecture |
| D real accuracy | ~0.5-0.7 | > 0.95 | D overfits, reduce D training |
| D fake accuracy | ~0.5-0.7 | > 0.95 | G too weak, reduce D training |
| D real accuracy | ~0.5 | ≈ 0.5 consistently | Both networks failing, check code |

---

## 8. Evaluation Metrics

### 8.1 Fréchet Inception Distance (FID)

FID is the gold standard for evaluating GAN image quality. It measures the distance between feature distributions of real and generated images:

```
FID Calculation:

1. Pass real images through InceptionV3 → extract features
2. Pass generated images through InceptionV3 → extract features
3. Compute:
   FID = ||μ_r - μ_g||² + Tr(Σ_r + Σ_g - 2(Σ_r Σ_g)^(1/2))

Where:
  μ_r, Σ_r = mean and covariance of real features
  μ_g, Σ_g = mean and covariance of generated features

Lower FID = better quality and diversity
  FID = 0: distributions are identical
  FID < 10: excellent quality
  FID < 50: good quality
  FID > 100: poor quality
```

### 8.2 Inception Score (IS)

IS measures image quality and diversity:

```
IS = exp(E_x[KL(p(y|x) || p(y))])

Where:
  p(y|x) = conditional label distribution (from InceptionV3)
  p(y)   = marginal label distribution

High IS = sharp images (confident predictions) + diverse (uniform p(y))
  IS > 5: good
  IS > 8: very good
  IS > 10: excellent
```

### 8.3 Computing FID

```python
import torch
import torch.nn as nn
from torchvision import models, transforms
import numpy as np
from scipy import linalg


class FIDEvaluator:
    """
    Compute Fréchet Inception Distance (FID) between
    real and generated image distributions.
    """

    def __init__(self, device: torch.device = torch.device("cpu")):
        self.device = device
        # Load InceptionV3 (pretrained)
        inception = models.inception_v3(
            weights=models.Inception_V3_Weights.DEFAULT
        )
        inception.fc = nn.Identity()  # Remove classification head
        self.inception = inception.to(device).eval()

        self.transform = transforms.Compose([
            transforms.Resize((299, 299)),
            transforms.Normalize(mean=[0.485, 0.456, 0.406],
                                 std=[0.229, 0.224, 0.225]),
        ])

    @torch.no_grad()
    def get_features(self, images: torch.Tensor) -> torch.Tensor:
        """Extract features from InceptionV3."""
        images = images.to(self.device)
        # Resize to 299×299 for Inception
        images = torch.nn.functional.interpolate(
            images, size=(299, 299), mode="bilinear", align_corners=False
        )
        features = self.inception(images)
        return features

    def compute_fid(
        self,
        real_images: torch.Tensor,
        fake_images: torch.Tensor,
        batch_size: int = 64,
    ) -> float:
        """
        Compute FID score.

        Args:
            real_images: Real images tensor (N, C, H, W) in [0, 1]
            fake_images: Generated images tensor (N, C, H, W) in [0, 1]
            batch_size: Batch size for feature extraction

        Returns:
            FID score (lower is better)
        """
        self.inception.eval()

        real_features_list = []
        fake_features_list = []

        # Extract features in batches
        for i in range(0, len(real_images), batch_size):
            batch = real_images[i: i + batch_size]
            features = self.get_features(batch)
            real_features_list.append(features.cpu().numpy())

        for i in range(0, len(fake_images), batch_size):
            batch = fake_images[i: i + batch_size]
            features = self.get_features(batch)
            fake_features_list.append(features.cpu().numpy())

        real_features = np.concatenate(real_features_list, axis=0)
        fake_features = np.concatenate(fake_features_list, axis=0)

        # Compute statistics
        mu_real = np.mean(real_features, axis=0)
        mu_fake = np.mean(fake_features, axis=0)
        sigma_real = np.cov(real_features, rowvar=False)
        sigma_fake = np.cov(fake_features, rowvar=False)

        # Compute FID
        diff = mu_real - mu_fake

        # Product of covariance matrices
        covmean, _ = linalg.sqrtm(sigma_real @ sigma_fake, disp=False)

        if np.iscomplexobj(covmean):
            covmean = covmean.real

        fid = diff @ diff + np.trace(sigma_real + sigma_fake - 2 * covmean)

        return float(fid)


def compute_is(
    generator: nn.Module,
    latent_dim: int,
    device: torch.device,
    num_samples: int = 5000,
    splits: int = 10,
) -> tuple[float, float]:
    """
    Compute Inception Score.

    Returns:
        (mean IS, std IS)
    """
    import torchvision.models as models

    inception = models.inception_v3(
        weights=models.Inception_V3_Weights.DEFAULT
    ).to(device).eval()

    all_probs = []
    batch_size = 64

    with torch.no_grad():
        for _ in range(0, num_samples, batch_size):
            current_batch = min(batch_size, num_samples - _)
            z = torch.randn(current_batch, latent_dim, device=device)
            fake_images = generator(z)
            fake_images = torch.nn.functional.interpolate(
                fake_images, size=(299, 299), mode="bilinear"
            )
            logits = inception(fake_images)
            probs = torch.softmax(logits, dim=1)
            all_probs.append(probs.cpu().numpy())

    all_probs = np.concatenate(all_probs, axis=0)

    # Compute IS per split
    split_scores = []
    for k in range(splits):
        part = all_probs[k * (num_samples // splits): (k + 1) * (num_samples // splits)]
        py = np.mean(part, axis=0)
        scores = []
        for i in range(part.shape[0]):
            pyx = part[i]
            scores.append(np.sum(pyx * (np.log(pyx + 1e-16) - np.log(py + 1e-16))))
        split_scores.append(np.exp(np.mean(scores)))

    return np.mean(split_scores), np.std(split_scores)
```

---

## 9. Complete Image Generation Pipeline

```python
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torchvision import datasets, transforms
from torchvision.utils import save_image
import os


class GANPipeline:
    """
    Complete pipeline for training and using a GAN.
    Handles data loading, training, evaluation, and generation.
    """

    def __init__(
        self,
        generator: nn.Module,
        discriminator: nn.Module,
        latent_dim: int = 100,
        device: torch.device | None = None,
        output_dir: str = "gan_output",
    ):
        self.device = device or torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.generator = generator.to(self.device)
        self.discriminator = discriminator.to(self.device)
        self.latent_dim = latent_dim
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)

        self.history = {"d_loss": [], "g_loss": []}

    def setup_data(
        self,
        dataset_name: str = "mnist",
        batch_size: int = 128,
        img_size: int = 64,
    ) -> DataLoader:
        """Setup data loader for training."""
        transform = transforms.Compose([
            transforms.Resize(img_size),
            transforms.ToTensor(),
            transforms.Normalize([0.5], [0.5]),
        ])

        if dataset_name == "mnist":
            dataset = datasets.MNIST(
                root="./data", train=True, download=True, transform=transform
            )
        elif dataset_name == "cifar10":
            dataset = datasets.CIFAR10(
                root="./data", train=True, download=True, transform=transform
            )
        else:
            raise ValueError(f"Unknown dataset: {dataset_name}")

        return DataLoader(
            dataset, batch_size=batch_size, shuffle=True,
            num_workers=2, drop_last=True, pin_memory=True,
        )

    def train_step(
        self,
        real_batch: torch.Tensor,
        criterion: nn.Module,
        opt_g: torch.optim.Optimizer,
        opt_d: torch.optim.Optimizer,
    ) -> tuple[float, float]:
        """Single training step."""
        batch_size = real_batch.shape[0]
        real_batch = real_batch.to(self.device)

        real_labels = torch.ones(batch_size, 1, device=self.device)
        fake_labels = torch.zeros(batch_size, 1, device=self.device)

        # Train Discriminator
        z = torch.randn(batch_size, self.latent_dim, device=self.device)
        fake_batch = self.generator(z).detach()

        d_real = self.discriminator(real_batch)
        d_fake = self.discriminator(fake_batch)
        d_loss = (criterion(d_real, real_labels) + criterion(d_fake, fake_labels)) / 2

        opt_d.zero_grad()
        d_loss.backward()
        opt_d.step()

        # Train Generator
        z = torch.randn(batch_size, self.latent_dim, device=self.device)
        fake_batch = self.generator(z)
        d_fake = self.discriminator(fake_batch)
        g_loss = criterion(d_fake, real_labels)

        opt_g.zero_grad()
        g_loss.backward()
        opt_g.step()

        return d_loss.item(), g_loss.item()

    def train(
        self,
        dataloader: DataLoader,
        num_epochs: int = 100,
        lr: float = 2e-4,
        sample_interval: int = 5,
    ) -> dict:
        """Full training loop."""
        opt_g = torch.optim.Adam(
            self.generator.parameters(), lr=lr, betas=(0.5, 0.999)
        )
        opt_d = torch.optim.Adam(
            self.discriminator.parameters(), lr=lr, betas=(0.5, 0.999)
        )
        criterion = nn.BCELoss()

        fixed_noise = torch.randn(64, self.latent_dim, device=self.device)

        for epoch in range(num_epochs):
            epoch_d, epoch_g = 0.0, 0.0

            for real_imgs, _ in dataloader:
                d_loss, g_loss = self.train_step(real_imgs, criterion, opt_g, opt_d)
                epoch_d += d_loss
                epoch_g += g_loss

            avg_d = epoch_d / len(dataloader)
            avg_g = epoch_g / len(dataloader)
            self.history["d_loss"].append(avg_d)
            self.history["g_loss"].append(avg_g)

            print(f"Epoch [{epoch + 1}/{num_epochs}] D: {avg_d:.4f} G: {avg_g:.4f}")

            if (epoch + 1) % sample_interval == 0:
                with torch.no_grad():
                    samples = self.generator(fixed_noise)
                    save_image(
                        samples,
                        f"{self.output_dir}/epoch_{epoch + 1:04d}.png",
                        normalize=True, nrow=8,
                    )

        return self.history

    @torch.no_grad()
    def generate(
        self, num_samples: int = 16, save_path: str | None = None
    ) -> torch.Tensor:
        """Generate samples."""
        self.generator.eval()
        z = torch.randn(num_samples, self.latent_dim, device=self.device)
        samples = self.generator(z)

        if save_path:
            save_image(samples, save_path, normalize=True, nrow=int(num_samples ** 0.5))

        return samples.cpu()

    @torch.no_grad()
    def interpolate(
        self, z1: torch.Tensor, z2: torch.Tensor, steps: int = 10
    ) -> torch.Tensor:
        """Latent space interpolation between two points."""
        self.generator.eval()
        interpolations = []
        for alpha in torch.linspace(0, 1, steps):
            z = (1 - alpha) * z1 + alpha * z2
            img = self.generator(z.unsqueeze(0))
            interpolations.append(img)

        return torch.cat(interpolations, dim=0).cpu()


# Usage
gan = GANPipeline(
    generator=DCGANGenerator(latent_dim=100, channels=1),
    discriminator=DCGANDiscriminator(channels=1),
    latent_dim=100,
)
dataloader = gan.setup_data("mnist", batch_size=128, img_size=64)
history = gan.train(dataloader, num_epochs=50)
samples = gan.generate(num_samples=16, save_path="gan_output/generated.png")
```

---

## 10. Comprehensive GAN Variants Comparison

| GAN Variant | Year | Key Innovation | Loss Function | Best For | Complexity |
|------------|------|---------------|---------------|----------|-----------|
| GAN | 2014 | Adversarial training | BCE | Foundation | Low |
| DCGAN | 2016 | Convolutional architecture | BCE | Image synthesis | Low |
| WGAN | 2017 | Wasserstein distance | WDM | Stable training | Medium |
| WGAN-GP | 2017 | Gradient penalty | WDM + GP | Stable training | Medium |
| Conditional | 2014 | Class conditioning | BCE | Controlled generation | Low |
| InfoGAN | 2016 | Disentangled representations | BCE + MI | Interpretable generation | Medium |
| ProGAN | 2017 | Progressive growing | Hinge | High-res images | High |
| SAGAN | 2018 | Self-attention in GAN | Hinge | Global coherence | High |
| BigGAN | 2018 | Large-scale training | Hinge | ImageNet generation | Very High |
| StyleGAN | 2019 | Style mapping + AdaIN | R1 regularization | Photorealistic faces | Very High |
| StyleGAN2 | 2020 | Weight demodulation | R1 + Path Length | Better quality | Very High |
| StyleGAN3 | 2021 | Alias-free design | R1 + E_4 | Texture stability | Very High |
| LSGAN | 2016 | Least squares loss | MSE | Less mode collapse | Low |
| EBGAN | 2016 | Energy-based D | Margin-based | Robust training | Medium |
| ACGAN | 2017 | Auxiliary classifier | BCE + CE | Class-conditional | Medium |

---

## 11. Summary

- **GANs** consist of a generator and discriminator competing in a minimax game; at equilibrium, the generator produces data indistinguishable from real data
- **Mode collapse** occurs when the generator only learns to produce a few output types — techniques like minibatch discrimination and WGAN help address this
- **DCGAN** establishes practical architectural guidelines: strided convolutions instead of pooling, batch normalization, ReLU/LeakyReLU activations, and Adam with β₁=0.5
- **Loss functions** matter greatly: BCE is the original but unstable; WGAN (Wasserstein) provides a meaningful loss metric; hinge loss offers simplicity and stability
- **Training tricks** including label smoothing, spectral normalization, gradient penalty, TTUR, instance noise, and feature matching are essential for stable training
- **WGAN-GP** replaces weight clipping with gradient penalty, providing much more stable training and meaningful loss curves
- **Conditional GANs** enable controlled generation by conditioning on class labels or other information
- **Progressive growing** enables training at higher resolutions by starting small and gradually increasing image size
- **StyleGAN** introduces mapping networks, AdaIN, and noise injection for photorealistic image generation with disentangled latent spaces
- **FID** is the standard evaluation metric — it measures the distance between feature distributions of real and generated images
- **Monitoring** loss curves and accuracy is crucial — D accuracy around 50-70% indicates balanced training
- **Best practices**: Use Adam with β₁=0.5, train D more often than G (n_critic=5 for WGAN), normalize inputs to [-1, 1], use spectral normalization for D, and always train with gradient clipping

---

## 12. Practice Exercises

### Exercise 1: DCGAN on Fashion-MNIST
Implement and train a DCGAN on Fashion-MNIST. Compare the training stability and sample quality with the MNIST version. Which clothing items are harder to generate?

### Exercise 2: WGAN-GP vs Standard GAN
Train both a standard GAN (BCE loss) and a WGAN-GP on the same dataset. Compare training curves, sample quality, and mode coverage. Which one is more stable?

### Exercise 3: Label Smoothing Experiments
Train GANs with different label smoothing values (0.0, 0.1, 0.2, 0.3) and compare results. At what point does excessive smoothing hurt D too much?

### Exercise 4: Conditional GAN for Font Generation
Implement a conditional GAN that generates characters (0-9, A-Z) conditioned on the class label. Create a grid showing all generated classes.

### Exercise 5: Latent Space Exploration
Train a DCGAN and explore the latent space by interpolating between two random vectors. Save the interpolation as an animation or grid. Can you find smooth transitions?

### Exercise 6: Feature Matching GAN
Implement a GAN with feature matching loss instead of the standard discriminator output. Compare mode coverage with the standard GAN.

### Exercise 7: Compute FID
Implement FID computation and evaluate your trained GAN at different training checkpoints. Plot FID vs. training epoch. Does lower loss always mean better FID?

### Exercise 8: Spectral Normalization Impact
Compare GAN training with and without spectral normalization on D. Measure training stability (loss variance), convergence speed, and sample quality.

### Exercise 9: Minibatch Discrimination
Implement minibatch discrimination in the discriminator. Train on a dataset with many modes (like CIFAR-10) and measure mode coverage compared to a baseline.

### Exercise 10: Progressive Growing
Implement a simplified progressive growing GAN (4×4 → 8×8 → 16×16). Train on CIFAR-10 and compare with a fixed-resolution DCGAN. How does the training time vs. quality tradeoff change?

### Exercise 11: GAN Training Diagnostics
Create a diagnostic dashboard that monitors D/G loss ratio, gradient norms, activation statistics, and sample diversity. Use it to debug a poorly trained GAN.

---

*In the next chapter, we explore Reinforcement Learning — training agents to make sequential decisions by interacting with environments and maximizing cumulative rewards.*
