# Chapter 10: Distributed Training

By Manjunath Kalburgi

---

## Table of Contents

1. [Why Distributed Training](#1-why-distributed-training)
2. [Parallelism Strategies](#2-parallelism-strategies)
3. [DataParallel (DP)](#3-dataparallel-dp)
4. [DistributedDataParallel (DDP)](#4-distributeddataddp-ddp)
5. [Process Groups](#5-process-groups)
6. [Rank and World Size](#6-rank-and-world-size)
7. [torchrun](#7-torchrun)
8. [DDP Setup Boilerplate](#8-ddp-setup-boilerplate)
9. [Gradient Synchronization (AllReduce)](#9-gradient-synchronization-allreduce)
10. [Communication Backends Comparison](#10-communication-backends-comparison)
11. [Mixed Precision Training](#11-mixed-precision-training)
12. [FSDP (Fully Sharded Data Parallel)](#12-fsdp-fully-sharded-data-parallel)
13. [Model Parallelism Basics](#13-model-parallelism-basics)
14. [DeepSpeed Integration](#14-deepspeed-integration)
15. [Profiling Distributed Training](#15-profiling-distributed-training)
16. [Common Pitfalls](#16-common-pitfalls)
17. [Complete Multi-GPU Training Example](#17-complete-multi-gpu-training-example)
18. [Summary](#18-summary)
19. [Practice Exercises](#19-practice-exercises)

---

## 1. Why Distributed Training

Training modern deep learning models has become increasingly expensive in terms of time, memory, and computational resources. Several forces drive the need for distributed training:

**Data Volume**: Datasets like LAION-5B contain billions of image-text pairs. Training on the full dataset with a single GPU would take years.

**Model Size**: Large language models (LLMs) like GPT-4 are estimated to have over a trillion parameters. A single GPU typically holds 16–80 GB of memory — far too little to even store such models, let alone train them.

**Training Time**: Training a state-of-the-art vision transformer on ImageNet at full scale can take weeks on a single GPU. Distributing across GPUs reduces this to hours or days.

**Cost Efficiency**: Using multiple smaller GPUs (e.g., NVIDIA A10G) can be cheaper and more available than a single H100 while delivering comparable aggregate throughput.

```
Single GPU Training:
┌──────────────────────────────────────────────────┐
│                  GPU 0                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │  Model   │→ │ Forward  │→ │   Loss &     │   │
│  │  Params  │  │  Pass    │  │  Backward    │   │
│  └──────────┘  └──────────┘  └──────────────┘   │
│  Training time: ~14 days                         │
│  Memory: 40 GB                                   │
└──────────────────────────────────────────────────┘

Distributed Training (4 GPUs):
┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐
│   GPU 0   │ │   GPU 1   │ │   GPU 2   │ │   GPU 3   │
│  Quarter  │ │  Quarter  │ │  Quarter  │ │  Quarter  │
│  of data  │ │  of data  │ │  of data  │ │  of data  │
└─────┬─────┘ └─────┬─────┘ └─────┬─────┘ └─────┬─────┘
      │              │              │              │
      └──────────────┴──────┬───────┴──────────────┘
                            │
                    Gradient Sync
                    (AllReduce)
                            │
                    Training time: ~3.5 days
                    Memory: 10 GB per GPU
```

### When Do You Need Distributed Training?

| Scenario | Single GPU Feasible? | Recommended Approach |
|---|---|---|
| Model < 4 GB, dataset < 1M samples | Yes | Single GPU |
| Model 4–40 GB, moderate dataset | Yes, but slow | DDP (multi-GPU) |
| Model > 40 GB (exceeds single GPU memory) | No | FSDP or Model Parallelism |
| Billion-parameter LLMs | No | FSDP + DeepSpeed + TP |
| Billions of training samples | Feasible but slow | DDP with large batch sizes |
| Real-time / low-latency fine-tuning | Depends | DDP for throughput |

---

## 2. Parallelism Strategies

There are three primary parallelism strategies in distributed deep learning. Each addresses a different bottleneck.

### Data Parallelism

Every GPU holds a complete copy of the model. The training data is split across GPUs. Each GPU computes gradients on its local data shard, then gradients are averaged across all GPUs via AllReduce.

```
Data Parallelism (4 GPUs):

     Full Training Dataset
     ┌──────────────────────────────────┐
     │ Batch 1 │ Batch 2 │ Batch 3 │ B4 │
     └────┬─────┴────┬─────┴────┬────┴───┘
          │           │          │         │
          ▼           ▼          ▼         ▼
      ┌───────┐  ┌───────┐ ┌───────┐ ┌───────┐
      │ GPU 0 │  │ GPU 1 │ │ GPU 2 │ │ GPU 3 │
      │Model 0│  │Model 1│ │Model 2│ │Model 3│
      │(copy) │  │(copy) │ │(copy) │ │(copy) │
      └───┬───┘  └───┬───┘ └───┬───┘ └───┬───┘
          │           │          │         │
          ▼           ▼          ▼         ▼
        grad 0     grad 1     grad 2    grad 3
          │           │          │         │
          └───────────┴────┬─────┴─────────┘
                           │
                     ┌─────▼─────┐
                     │ AllReduce  │
                     │ (avg grad) │
                     └─────┬─────┘
                           │
            ┌──────────────┼──────────────┐
            ▼              ▼              ▼
       Update GPU0    Update GPU1    Update GPU2    ...
```

**Pros**: Simple, near-linear speedup, no code changes beyond wrapping the model.
**Cons**: Each GPU holds a full model copy (high memory), limited by the largest model that fits on one GPU.

### Model Parallelism

The model itself is split across GPUs. Different layers (or parts of layers) reside on different GPUs.

```
Model Parallelism (4 GPUs):

  Input
   │
   ▼
┌──────────┐
│  GPU 0   │  Layers 0–5
│ Layer 0  │
│ Layer 1  │
│ ...      │
│ Layer 5  │
└────┬─────┘
     │ activations
     ▼
┌──────────┐
│  GPU 1   │  Layers 6–11
│ Layer 6  │
│ ...      │
│ Layer 11 │
└────┬─────┘
     │
     ▼
┌──────────┐
│  GPU 2   │  Layers 12–17
│ ...      │
└────┬─────┘
     │
     ▼
┌──────────┐
│  GPU 3   │  Layers 18–23
│ ...      │
└────┬─────┘
     │
     ▼
  Output
```

**Pros**: Can train models too large for a single GPU.
**Cons**: GPU idling (only one GPU active at a time during forward pass), complex to implement, poor pipeline utilization.

### Pipeline Parallelism

An evolution of model parallelism where micro-batches are pipelined across GPUs so that while GPU 0 processes micro-batch 2, GPU 1 processes micro-batch 1.

```
Pipeline Parallelism (4 GPUs, 4 micro-batches):

Time →
       T1        T2        T3        T4        T5        T6        T7
GPU 0: [MB1 Fwd] [MB2 Fwd] [MB3 Fwd] [MB4 Fwd] [MB4 Bwd] [MB3 Bwd] [MB2 Bwd]
GPU 1:           [MB1 Fwd] [MB2 Fwd] [MB3 Fwd] [MB4 Fwd] [MB4 Bwd] [MB3 Bwd]
GPU 2:                     [MB1 Fwd] [MB2 Fwd] [MB3 Fwd] [MB4 Fwd] [MB4 Bwd]
GPU 3:                               [MB1 Fwd] [MB2 Fwd] [MB3 Fwd] [MB4 Fwd]

F = Forward, B = Backward, MB = Micro-Batch
```

**Pros**: Better GPU utilization than naive model parallelism.
**Cons**: Requires careful micro-batch scheduling, gradient accumulation complexity.

### Strategy Comparison Table

| Feature | Data Parallelism | Model Parallelism | Pipeline Parallelism |
|---|---|---|---|
| Split what? | Data | Model layers | Model layers |
| Communication | AllReduce gradients | Point-to-point activations | Point-to-point activations |
| GPU memory | Full model per GPU | Partial model per GPU | Partial model per GPU |
| GPU utilization | High | Low (sequential) | Medium-High |
| Implementation complexity | Low | Medium | High |
| Best for | Models fitting in 1 GPU | Models exceeding 1 GPU | Large models, many GPUs |
| PyTorch API | `DistributedDataParallel` | Manual or `tensor_parallel` | `PipelineDriver` (Titanium) |

---

## 3. DataParallel (DP)

`torch.nn.DataParallel` is the simplest multi-GPU wrapper in PyTorch. It replicates the model on each GPU, scatters the input, runs parallel forward passes, and gathers the output.

### Basic Usage

```python
import torch
import torch.nn as nn

# Define a simple model
class SimpleNet(nn.Module):
    def __init__(self, input_dim=784, hidden_dim=256, output_dim=10):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(input_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, output_dim),
        )

    def forward(self, x):
        return self.net(x)

# Wrap with DataParallel — uses GPU 0 as the "master"
model = SimpleNet()
if torch.cuda.device_count() > 1:
    print(f"Using {torch.cuda.device_count()} GPUs with DataParallel")
    model = nn.DataParallel(model, device_ids=[0, 1, 2, 3])

model = model.cuda()

# Dummy data
x = torch.randn(128, 784).cuda()
y = torch.randint(0, 10, (128,)).cuda()

# Standard training loop — DP handles distribution transparently
criterion = nn.CrossEntropyLoss()
optimizer = torch.optim.SGD(model.parameters(), lr=0.01)

output = model(x)               # Forward: scatter → parallel forward → gather
loss = criterion(output, y)     # Loss computed on GPU 0
loss.backward()                 # Gradients synchronized automatically
optimizer.step()
optimizer.zero_grad()

print(f"Loss: {loss.item():.4f}")
```

### How DataParallel Works

```
DataParallel Forward Pass (GPU 0 is master):

  Input batch (128 samples)
         │
    ┌────▼────┐
    │ Scatter │  Split along batch dim
    │ on GPU0 │  [32, 32, 32, 32] samples
    └────┬────┘
         │
    ┌────┼────────────────┬───────────────┬──────────────┐
    ▼    ▼                ▼               ▼              │
 ┌──────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
 │GPU 0 │ │  GPU 1   │ │  GPU 2   │ │  GPU 3   │       │
 │Fwd   │ │  Fwd     │ │  Fwd     │ │  Fwd     │       │
 └──┬───┘ └────┬─────┘ └────┬─────┘ └────┬─────┘       │
    │           │            │            │              │
    │    ┌──────┘            │            │              │
    │    │   ┌───────────────┘            │              │
    │    │   │   ┌────────────────────────┘              │
    ▼    ▼   ▼   ▼                                      │
 ┌──────────────┐                                        │
 │  Gather on   │  Concatenate outputs on GPU 0          │
 │    GPU 0     │ ←──────────────────────────────────────┘
 └──────────────┘
    │
    ▼
 Output (128, 10) on GPU 0
```

### Limitations of DataParallel

```python
# LIMITATION 1: GPU 0 memory bottleneck
# GPU 0 holds the gather buffer and runs the master process
# This means GPU 0 uses ~30-50% more memory than other GPUs

# LIMITATION 2: GIL contention on CPU
# The master process (GPU 0) must gather results, creating
# a CPU bottleneck with many GPUs

# LIMITATION 3: No control over gradient synchronization
# Synchronous only, no overlap optimization

# LIMITATION 4: Inefficient for uneven workloads
# If one GPU's shard is larger, all others wait

# LIMITATION 5: Limited to a single machine
# Cannot span multiple nodes

# For all these reasons, prefer DistributedDataParallel (DDP)
# which avoids all of these issues.
```

> **Rule of thumb**: Never use `DataParallel` for serious training. Always use `DistributedDataParallel` instead. DP is only useful for quick prototyping on a single machine.

---

## 4. DistributedDataParallel (DDP)

`DistributedDataParallel` is the gold standard for multi-GPU training in PyTorch. Each GPU runs its own process with its own optimizer, and gradient synchronization is done via efficient NCCL AllReduce operations.

### Full Architecture

```
DDP Architecture (4 GPUs, 4 processes):

  ┌─────────────────────────────────────────────────────────────┐
  │                     CPU (Host)                              │
  │                                                             │
  │  Process 0        Process 1        Process 2    Process 3   │
  │  ┌──────────┐     ┌──────────┐     ┌────────┐  ┌────────┐ │
  │  │DDP Wrapper│     │DDP Wrapper│     │DDP Wr. │  │DDP Wr. │ │
  │  │┌────────┐│     │┌────────┐│     │┌──────┐│  │┌──────┐│ │
  │  ││ Model  ││     ││ Model  ││     ││Model ││  ││Model ││ │
  │  ││(copy)  ││     ││(copy)  ││     ││(copy)││  ││(copy)││ │
  │  │└────────┘│     │└────────┘│     │└──────┘│  │└──────┘│ │
  │  │┌────────┐│     │┌────────┐│     │┌──────┐│  │┌──────┐│ │
  │  ││Optimizer│     ││Optimizer│     ││Optim.││  ││Optim.││ │
  │  │└────────┘│     │└────────┘│     │└──────┘│  │└──────┘│ │
  │  └────┬─────┘     └────┬─────┘     └───┬────┘  └───┬────┘ │
  │       │                │                │           │       │
  └───────┼────────────────┼────────────────┼───────────┼───────┘
          │                │                │           │
          ▼                ▼                ▼           ▼
      ┌──────┐         ┌──────┐         ┌──────┐  ┌──────┐
      │GPU 0 │         │GPU 1 │         │GPU 2 │  │GPU 3 │
      │Data  │         │Data  │         │Data  │  │Data  │
      │Shard │         │Shard │         │Shard │  │Shard │
      └──┬───┘         └──┬───┘         └──┬───┘  └──┬───┘
         │                │                │          │
         └────────────────┼────────────────┴──────────┘
                          │
                   ┌──────▼──────┐
                   │  Gradient   │
                   │ AllReduce   │
                   │  (NCCL)     │
                   └──────┬──────┘
                          │
                 All GPUs have identical gradients
```

### Gradient Bucketing in DDP

DDP does not wait for all gradients to be computed before starting communication. Instead, it organizes parameters into **buckets** and begins AllReduce as soon as a bucket's gradients are ready.

```
Gradient Bucketing & Overlap:

  Backward Pass (computed layer by layer, bottom to top):
  ┌─────────────────────────────────────────────────┐
  │ Layer 4 grad │ Layer 3 grad │ Layer 2 │ Layer 1 │
  │ (ready 1st)  │ (ready 2nd)  │         │         │
  └──────┬───────┴──────┬───────┘         │         │
         │              │                  │         │
  ┌──────▼───────┐  ┌───▼──────────┐      │         │
  │   Bucket 1   │  │   Bucket 2   │      │         │
  │  (Layer 4,3) │  │  (Layer 2,1) │      │         │
  │ AllReduce!   │  │ AllReduce!   │      │         │
  └──────────────┘  └──────────────┘      │         │

  Timeline:
  GPU compute: [Layer4 Bwd][Layer3 Bwd][Layer2 Bwd][Layer1 Bwd]
  NCCL comm:              [Bucket1 AR ][Bucket2 AR     ]
                            ↑ Overlap!    ↑ Overlap!

  → Communication is "hidden" behind computation
  → By default, buckets are ~25MB each (bucket_cap_mb=25)
```

---

## 5. Process Groups

A **process group** is a collection of processes that can communicate with each other. In DDP, all processes in a training run belong to the same process group.

### Communication Backends

PyTorch supports three main backends:

| Backend | GPU Support | CPU Support | Speed | Best For |
|---|---|---|---|---|
| `nccl` | ✅ Excellent | ❌ | Fastest | Multi-GPU training |
| `gloo` | ✅ (limited) | ✅ | Moderate | CPU-only, heterogeneous |
| `mpi` | ✅ | ✅ | Fast | HPC clusters, InfiniBand |

### Creating and Managing Process Groups

```python
import os
import torch
import torch.distributed as dist
import torch.multiprocessing as mp


def init_process_group_example(rank: int, world_size: int):
    """
    Initialize a distributed process group.

    Args:
        rank: The unique ID of the current process (0 to world_size-1).
        world_size: Total number of processes participating.
    """
    # Set the address and port for rendezvous (how processes find each other)
    os.environ["MASTER_ADDR"] = "localhost"
    os.environ["MASTER_PORT"] = "12355"

    # Initialize the process group
    # - backend: "nccl" for GPU, "gloo" for CPU
    # - rank: this process's unique identifier
    # - world_size: total number of processes
    dist.init_process_group(
        backend="nccl",     # Use NCCL for GPU communication
        rank=rank,
        world_size=world_size,
    )

    # Set the device for this process
    torch.cuda.set_device(rank)

    print(f"Process {rank}/{world_size} initialized on GPU {rank}")

    # ---- Your training code goes here ----

    # Clean up when done
    dist.destroy_process_group()


def main():
    world_size = torch.cuda.device_count()
    if world_size < 2:
        print("Need at least 2 GPUs for this example")
        return

    mp.spawn(
        init_process_group_example,
        args=(world_size,),
        nprocs=world_size,
        join=True,
    )


if __name__ == "__main__":
    main()
```

### Using Environment Variables

In production, you typically set process group configuration via environment variables rather than passing them directly:

```bash
# These are set by torchrun (see Section 7)
export MASTER_ADDR=localhost
export MASTER_PORT=12355
export RANK=0
export WORLD_SIZE=4
export LOCAL_RANK=0
```

```python
# Then in your code, just call:
dist.init_process_group(backend="nccl")

# dist uses the environment variables automatically
# No need to pass rank/world_size manually
```

### Creating Sub-Process Groups

For complex multi-node setups or when you need different communication groups:

```python
import torch.distributed as dist

# Create a process group for tensor parallelism
# Uses ranks 0 and 1 for tensor-parallel group 0
tp_group_0 = dist.new_group(ranks=[0, 1])

# Uses ranks 2 and 3 for tensor-parallel group 1
tp_group_1 = dist.new_group(ranks=[2, 3])

# IMPORTANT: All processes must call new_group, even if not part of the group
# Create a dummy group on ranks not in tp_group_0
dummy_group = dist.new_group(ranks=[2, 3])  # ranks 0,1 call this too (with ranks they're NOT in)

# Use the group for communication
tensor = torch.ones(4).cuda()
dist.all_reduce(tensor, group=tp_group_0)  # Only reduces within tp_group_0

# Destroy sub-groups (but not the default group)
dist.destroy_process_group(tp_group_0)
dist.destroy_process_group(tp_group_1)
```

---

## 6. Rank and World Size

Understanding **rank** and **world size** is fundamental to distributed training.

- **World Size**: The total number of processes (typically one per GPU).
- **Rank**: The unique integer ID assigned to each process (0 to world_size - 1).
- **Local Rank**: The rank of the process within the current node (0 to num_gpus_on_this_node - 1).

```
2-Node Training Setup:

  Node 0 (4 GPUs)              Node 1 (4 GPUs)
  ┌──────────────────┐         ┌──────────────────┐
  │ Rank 0 (Local 0) │         │ Rank 4 (Local 0) │
  │ Rank 1 (Local 1) │         │ Rank 5 (Local 1) │
  │ Rank 2 (Local 2) │         │ Rank 6 (Local 2) │
  │ Rank 3 (Local 3) │         │ Rank 7 (Local 3) │
  └──────────────────┘         └──────────────────┘

  World Size = 8 (total processes across all nodes)
  Node 0 ranks: [0, 1, 2, 3]
  Node 1 ranks: [4, 5, 6, 7]
  Local ranks:  0-3 on each node
```

### Code Example: Using Rank and World Size

```python
import os
import torch
import torch.distributed as dist
from torch.utils.data import DataLoader, DistributedSampler


def setup_distributed():
    """Initialize the distributed environment."""
    dist.init_process_group(backend="nccl")

    rank = dist.get_rank()
    world_size = dist.get_world_size()
    local_rank = int(os.environ.get("LOCAL_RANK", 0))

    torch.cuda.set_device(local_rank)

    return rank, world_size, local_rank


def create_distributed_dataloader(dataset, batch_size, rank, world_size):
    """
    Create a DataLoader with DistributedSampler.

    The sampler ensures each process gets a unique, non-overlapping
    subset of the data, and each process sees the same data order
    (important for reproducibility).
    """
    sampler = DistributedSampler(
        dataset,
        num_replicas=world_size,  # Total number of processes
        rank=rank,                # This process's rank
        shuffle=True,             # Shuffle data differently each epoch
        seed=42,                  # Consistent shuffle across processes
    )

    dataloader = DataLoader(
        dataset,
        batch_size=batch_size,    # Per-process batch size
        sampler=sampler,
        num_workers=4,
        pin_memory=True,          # Faster CPU→GPU transfer
        drop_last=True,           # Ensure equal batch sizes across GPUs
    )

    return dataloader, sampler


def cleanup():
    """Destroy the process group."""
    dist.destroy_process_group()


def train(rank, world_size, local_rank):
    """Main training function running on each GPU."""
    # Setup
    dist.init_process_group(backend="nccl")
    torch.cuda.set_device(local_rank)
    device = torch.device(f"cuda:{local_rank}")

    # Only print from rank 0 to avoid duplicate output
    if rank == 0:
        print(f"Training with {world_size} GPUs")

    # Create model and move to correct device
    model = torch.nn.Linear(1024, 10).to(device)

    # Wrap with DDP
    model = torch.nn.parallel.DistributedDataParallel(
        model,
        device_ids=[local_rank],
    )

    # Create dummy dataset and distributed dataloader
    dataset = torch.utils.data.TensorDataset(
        torch.randn(10000, 1024),
        torch.randint(0, 10, (10000,)),
    )

    sampler = DistributedSampler(
        dataset, num_replicas=world_size, rank=rank, shuffle=True
    )
    dataloader = DataLoader(
        dataset, batch_size=256, sampler=sampler, drop_last=True
    )

    optimizer = torch.optim.SGD(model.parameters(), lr=0.01)

    # Training loop
    for epoch in range(5):
        sampler.set_epoch(epoch)  # IMPORTANT: ensures different shuffling per epoch

        for batch_idx, (data, target) in enumerate(dataloader):
            data, target = data.to(device), target.to(device)

            optimizer.zero_grad()
            output = model(data)
            loss = torch.nn.functional.cross_entropy(output, target)
            loss.backward()
            optimizer.step()

        if rank == 0:
            print(f"Epoch {epoch}: loss = {loss.item():.4f}")

    cleanup()
```

---

## 7. torchrun

`torchrun` is the recommended way to launch distributed training scripts. It replaces the deprecated `torch.distributed.launch` and `python -m torch.distributed.run`.

### Key Advantages Over the Old Launcher

- Automatic `RANK`, `LOCAL_RANK`, `WORLD_SIZE` environment variable setup
- Elastic training support (fault tolerance, automatic restart)
- Proper process management and cleanup
- Works on single-node and multi-node

### Command Examples

```bash
# Single node, 4 GPUs
torchrun --nproc_per_node=4 train.py

# Single node, all available GPUs
torchrun --nproc_per_node=auto train.py

# Multi-node (2 nodes, 4 GPUs each)
# On node 0 (master):
torchrun \
    --nproc_per_node=4 \
    --nnodes=2 \
    --node_rank=0 \
    --master_addr="192.168.1.1" \
    --master_port=29500 \
    train.py

# On node 1:
torchrun \
    --nproc_per_node=4 \
    --nnodes=2 \
    --node_rank=1 \
    --master_addr="192.168.1.1" \
    --master_port=29500 \
    train.py

# With mixed precision and gradient accumulation
torchrun \
    --nproc_per_node=4 \
    --master_port=29500 \
    train.py \
    --batch_size 64 \
    --lr 3e-4 \
    --accumulation_steps 4

# Elastic training (auto-restart on failure)
torchrun \
    --nproc_per_node=4 \
    --nnodes=1:4 \           # Min 1, max 4 nodes
    --rdzv_backend=c10d \    # Rendezvous backend
    --rdzv_endpoint=localhost:29500 \
    train.py
```

### Accessing Rank Information in Your Script

```python
import os
import torch.distributed as dist

# torchrun sets these environment variables automatically
local_rank = int(os.environ.get("LOCAL_RANK", 0))
rank = int(os.environ.get("RANK", 0))
world_size = int(os.environ.get("WORLD_SIZE", 1))

# Or use the dist API after init_process_group
dist.init_process_group(backend="nccl")
rank = dist.get_rank()
world_size = dist.get_world_size()
local_rank = int(os.environ["LOCAL_RANK"])  # Still from env

print(f"I am rank {rank} of {world_size}, local rank {local_rank}")
```

---

## 8. DDP Setup Boilerplate

Here is a complete, production-ready DDP training script that you can adapt for any project.

```python
#!/usr/bin/env python3
"""
Complete DDP Training Boilerplate

Launch with:
    torchrun --nproc_per_node=4 ddp_train.py
"""

import os
import time
import argparse
from pathlib import Path

import torch
import torch.nn as nn
import torch.distributed as dist
from torch.nn.parallel import DistributedDataParallel as DDP
from torch.utils.data import DataLoader, DistributedSampler
from torch.utils.tensorboard import SummaryWriter


# ── Model ────────────────────────────────────────────────────────

class ResidualBlock(nn.Module):
    """Simple residual block for demonstration."""

    def __init__(self, dim: int):
        super().__init__()
        self.block = nn.Sequential(
            nn.Linear(dim, dim),
            nn.LayerNorm(dim),
            nn.GELU(),
            nn.Linear(dim, dim),
            nn.LayerNorm(dim),
        )

    def forward(self, x):
        return x + self.block(x)


class TransformerModel(nn.Module):
    """Small transformer-like model for text classification."""

    def __init__(self, vocab_size: int = 30000, d_model: int = 512,
                 num_classes: int = 10, num_layers: int = 6):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, d_model)
        self.pos_encoding = nn.Embedding(512, d_model)
        self.layers = nn.ModuleList([ResidualBlock(d_model) for _ in range(num_layers)])
        self.classifier = nn.Linear(d_model, num_classes)

    def forward(self, input_ids: torch.Tensor) -> torch.Tensor:
        seq_len = input_ids.size(1)
        positions = torch.arange(seq_len, device=input_ids.device).unsqueeze(0)
        x = self.embedding(input_ids) + self.pos_encoding(positions)
        for layer in self.layers:
            x = layer(x)
        # Pool: mean over sequence length
        x = x.mean(dim=1)
        return self.classifier(x)


# ── Setup / Teardown ────────────────────────────────────────────

def setup(rank: int, world_size: int):
    """Initialize the process group and set the device."""
    os.environ["MASTER_ADDR"] = os.environ.get("MASTER_ADDR", "localhost")
    os.environ["MASTER_PORT"] = os.environ.get("MASTER_PORT", "29500")

    dist.init_process_group(backend="nccl", rank=rank, world_size=world_size)
    torch.cuda.set_device(rank)
    # Ensure batch norm / layer norm works correctly across processes
    torch.cuda.empty_cache()


def cleanup():
    """Destroy the process group."""
    dist.destroy_process_group()


# ── Data ─────────────────────────────────────────────────────────

def create_synthetic_dataset(num_samples: int = 100000, seq_len: int = 128,
                             vocab_size: int = 30000, num_classes: int = 10):
    """Create a synthetic dataset for demonstration."""
    input_ids = torch.randint(0, vocab_size, (num_samples, seq_len))
    labels = torch.randint(0, num_classes, (num_samples,))
    return torch.utils.data.TensorDataset(input_ids, labels)


def create_dataloaders(rank: int, world_size: int, batch_size: int = 64,
                       num_samples: int = 100000):
    """Create distributed train and validation dataloaders."""
    train_dataset = create_synthetic_dataset(num_samples)
    val_dataset = create_synthetic_dataset(num_samples // 10)

    train_sampler = DistributedSampler(
        train_dataset, num_replicas=world_size, rank=rank, shuffle=True
    )
    val_sampler = DistributedSampler(
        val_dataset, num_replicas=world_size, rank=rank, shuffle=False
    )

    train_loader = DataLoader(
        train_dataset, batch_size=batch_size, sampler=train_sampler,
        num_workers=4, pin_memory=True, drop_last=True, persistent_workers=True,
    )
    val_loader = DataLoader(
        val_dataset, batch_size=batch_size * 2, sampler=val_sampler,
        num_workers=2, pin_memory=True, drop_last=False,
    )

    return train_loader, val_loader, train_sampler


# ── Training Loop ────────────────────────────────────────────────

def train_epoch(model, loader, sampler, optimizer, scaler, device, epoch):
    """Train for one epoch with optional mixed precision."""
    model.train()
    sampler.set_epoch(epoch)  # Shuffle differently each epoch

    total_loss = 0.0
    correct = 0
    total = 0
    num_batches = len(loader)

    for batch_idx, (input_ids, labels) in enumerate(loader):
        input_ids = input_ids.to(device, non_blocking=True)
        labels = labels.to(device, non_blocking=True)

        optimizer.zero_grad(set_to_none=True)

        # Mixed precision forward pass
        with torch.cuda.amp.autocast():
            output = model(input_ids)
            loss = nn.functional.cross_entropy(output, labels)

        # Scaled backward pass
        scaler.scale(loss).backward()
        scaler.step(optimizer)
        scaler.update()

        total_loss += loss.item()
        _, predicted = output.max(1)
        correct += predicted.eq(labels).sum().item()
        total += labels.size(0)

        # Progress logging (only rank 0)
        if batch_idx % 100 == 0 and dist.get_rank() == 0:
            print(
                f"  Epoch {epoch} [{batch_idx}/{num_batches}] "
                f"Loss: {loss.item():.4f}"
            )

    # Aggregate metrics across all processes
    metrics = torch.tensor([total_loss, correct, total], dtype=torch.float64, device=device)
    dist.all_reduce(metrics, op=dist.ReduceOp.SUM)

    avg_loss = metrics[0].item() / num_batches
    accuracy = metrics[1].item() / metrics[2].item()

    return avg_loss, accuracy


def validate(model, loader, device):
    """Validate the model."""
    model.eval()
    total_loss = 0.0
    correct = 0
    total = 0

    with torch.no_grad():
        for input_ids, labels in loader:
            input_ids = input_ids.to(device, non_blocking=True)
            labels = labels.to(device, non_blocking=True)

            output = model(input_ids)
            loss = nn.functional.cross_entropy(output, labels)

            total_loss += loss.item()
            _, predicted = output.max(1)
            correct += predicted.eq(labels).sum().item()
            total += labels.size(0)

    return total_loss / len(loader), correct / total


# ── Main ─────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--epochs", type=int, default=10)
    parser.add_argument("--batch_size", type=int, default=64)
    parser.add_argument("--lr", type=float, default=3e-4)
    parser.add_argument("--d_model", type=int, default=512)
    parser.add_argument("--num_layers", type=int, default=6)
    parser.add_argument("--checkpoint_dir", type=str, default="checkpoints")
    args = parser.parse_args()

    # torchrun sets these environment variables
    rank = int(os.environ["RANK"])
    local_rank = int(os.environ["LOCAL_RANK"])
    world_size = int(os.environ["WORLD_SIZE"])
    device = torch.device(f"cuda:{local_rank}")

    # Initialize
    setup(rank, world_size)

    if rank == 0:
        print(f"Training with {world_size} GPUs")
        Path(args.checkpoint_dir).mkdir(parents=True, exist_ok=True)

    # Create model
    model = TransformerModel(
        d_model=args.d_model,
        num_layers=args.num_layers,
    ).to(device)

    # Wrap with DDP
    model = DDP(model, device_ids=[local_rank], output_device=local_rank)

    # Optimizer
    optimizer = torch.optim.AdamW(model.parameters(), lr=args.lr, weight_decay=0.01)
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(
        optimizer, T_max=args.epochs, eta_min=1e-6
    )
    scaler = torch.cuda.amp.GradScaler()

    # Data
    train_loader, val_loader, train_sampler = create_dataloaders(
        rank, world_size, args.batch_size
    )

    # Training loop
    best_val_loss = float("inf")

    for epoch in range(args.epochs):
        train_loss, train_acc = train_epoch(
            model, train_loader, train_sampler, optimizer, scaler, device, epoch
        )
        scheduler.step()

        val_loss, val_acc = validate(model, val_loader, device)

        # Reduce validation metrics across all processes
        val_metrics = torch.tensor([val_loss, val_acc], device=device)
        dist.all_reduce(val_metrics, op=dist.ReduceOp.SUM)
        val_loss = val_metrics[0].item() / world_size
        val_acc = val_metrics[1].item() / world_size

        if rank == 0:
            print(
                f"Epoch {epoch}: train_loss={train_loss:.4f} "
                f"train_acc={train_acc:.4f} val_loss={val_loss:.4f} "
                f"val_acc={val_acc:.4f}"
            )

            # Save checkpoint
            if val_loss < best_val_loss:
                best_val_loss = val_loss
                checkpoint = {
                    "epoch": epoch,
                    "model_state_dict": model.module.state_dict(),
                    "optimizer_state_dict": optimizer.state_dict(),
                    "val_loss": val_loss,
                    "val_acc": val_acc,
                }
                torch.save(checkpoint, Path(args.checkpoint_dir) / "best_model.pt")
                print(f"  Saved best model (val_loss={val_loss:.4f})")

    cleanup()


if __name__ == "__main__":
    main()
```

---

## 9. Gradient Synchronization (AllReduce)

AllReduce is the core communication primitive in DDP. It computes the element-wise sum (or average) of tensors across all processes and distributes the result to everyone.

### How AllReduce Works

The most common algorithm used is **Ring AllReduce**:

```
Ring AllReduce (4 GPUs, gradient vector [g0, g1, g2, g3]):

Step 1: Scatter-Reduce (N-1 steps)
─────────────────────────────────────
  GPU 0 has: [g0, g1, g2, g3]
  GPU 1 has: [g0, g1, g2, g3]
  GPU 2 has: [g0, g1, g2, g3]
  GPU 3 has: [g0, g1, g2, g3]

  After Step 1: (each GPU reduces one chunk from neighbor)
  GPU 0: [g0+g3, g1,    g2,    g3   ]
  GPU 1: [g0,    g1+g0, g2,    g3   ]
  GPU 2: [g0,    g1,    g2+g1, g3   ]
  GPU 3: [g0,    g1,    g2,    g3+g2]

  After Steps 2 & 3: (each chunk has been fully reduced)
  GPU 0: [Σg0, Σg1, Σg2, Σg3]  ← partial
  GPU 1: [Σg0, Σg1, Σg2, Σg3]  ← partial
  GPU 2: [Σg0, Σg1, Σg2, Σg3]  ← partial
  GPU 3: [Σg0, Σg1, Σg2, Σg3]  ← partial

Step 2: AllGather (N-1 steps)
─────────────────────────────
  Propagate full reduced result to all GPUs.

  Final result on all GPUs:
  [Σg0/N, Σg1/N, Σg2/N, Σg3/N]  ← averaged gradients

Total communication: 2(N-1)/N × data_size ≈ 2× data_size
(N independent of number of GPUs!)
```

### DDP Bucketing Implementation Detail

```python
# DDP gradient buckets are configured via these parameters:
model = DDP(
    model,
    device_ids=[local_rank],

    # Gradient bucketing parameters:
    bucket_cap_mb=25,          # Each bucket holds ~25 MB of gradients
    find_unused_parameters=False,  # Set True if some params aren't used
                                  # in every forward pass
    gradient_as_bucket_view=True,  # Save memory: gradient tensor IS the
                                  # bucket buffer (no copy)

    # Static graph: if your model's computation graph is the same
    # every iteration (common case), enable this for optimizations:
    static_graph=False,

    # Broadcast buffers: sync batch norm running stats from rank 0
    broadcast_buffers=True,

    # Process group (default group if not specified)
    process_group=None,
)

# DDP automatically:
# 1. Registers hooks on each parameter's .grad
# 2. When .backward() computes a gradient, the hook fires
# 3. The hook marks the parameter's bucket as "ready"
# 4. When all parameters in a bucket are ready, AllReduce is launched
# 5. The reduced gradient is written into the .grad tensors
```

### Measuring Gradient Sync Time

```python
import torch.distributed as dist


def measure_allreduce_time(device, size_mb=100, num_iterations=100):
    """Measure the time for AllReduce of a given tensor size."""
    tensor = torch.randn(size_mb * 1024 * 1024 // 4, device=device)

    # Warm up
    for _ in range(10):
        dist.all_reduce(tensor)

    torch.cuda.synchronize()
    start = time.time()

    for _ in range(num_iterations):
        dist.all_reduce(tensor)

    torch.cuda.synchronize()
    elapsed = time.time() - start

    avg_time_ms = (elapsed / num_iterations) * 1000
    bandwidth_gbps = (size_mb * 2) / (avg_time_ms / 1000) / 1024  # GB/s

    print(f"AllReduce {size_mb} MB: {avg_time_ms:.3f} ms, "
          f"bandwidth: {bandwidth_gbps:.2f} GB/s")

    return avg_time_ms
```

---

## 10. Communication Backends Comparison

| Feature | NCCL | Gloo | MPI |
|---|---|---|---|
| **Full Name** | NVIDIA Collective Communications Library | Google's Collective Communications Library | Message Passing Interface |
| **GPU Support** | ✅ Native, optimized | ⚠️ Limited | ✅ Via NCCL or direct |
| **CPU Support** | ❌ | ✅ | ✅ |
| **Multi-Node GPU** | ✅ Excellent | ✅ | ✅ Excellent |
| **InfiniBand** | ✅ RDMA | ✅ | ✅ RDMA |
| **Latency (intra-node)** | ~1-5 μs | ~50-100 μs | ~10-30 μs |
| **Bandwidth (intra-node)** | ~600+ GB/s (NVLink) | ~25 GB/s | ~25-100 GB/s |
| **Best For** | Multi-GPU training | CPU-only / debugging | HPC clusters |
| **Installation** | Comes with PyTorch CUDA | Included in PyTorch | Requires MPI installation |
| **Fault Tolerance** | Limited | Limited | Better (MPI features) |
| **Point-to-Point** | ✅ | ✅ | ✅ |
| **AllReduce** | ✅ Optimized | ✅ | ✅ Optimized |
| **Setup Complexity** | Low | Low | Medium-High |

### When to Use Each Backend

```python
import torch.distributed as dist

# NCCL: Multi-GPU training (default choice)
dist.init_process_group(backend="nccl")
# → Use when: you have multiple GPUs, especially on one node
# → Requires: NVIDIA GPUs, CUDA

# Gloo: CPU-only or heterogeneous setups
dist.init_process_group(backend="gloo")
# → Use when: no GPUs, debugging, or mixed CPU/GPU
# → Requires: nothing special
# → Good for: debugging DDP logic on CPU

# MPI: HPC clusters with InfiniBand
dist.init_process_group(backend="mpi")
# → Use when: you have an MPI installation and want best multi-node perf
# → Requires: mpi4py or compatible MPI
# → Good for: large multi-node clusters

# Automatic selection based on available hardware
def auto_select_backend():
    if torch.cuda.is_available() and torch.cuda.device_count() > 1:
        return "nccl"
    elif dist.is_mpi_available():
        return "mpi"
    else:
        return "gloo"
```

---

## 11. Mixed Precision Training

Mixed precision training uses FP16 (half precision) for forward and backward passes to save memory and speed up computation, while maintaining FP32 master weights for numerical stability.

### Why Mixed Precision?

| Aspect | FP32 | FP16 / BF16 |
|---|---|---|
| Memory per parameter | 4 bytes | 2 bytes |
| Memory savings | Baseline | 50% reduction |
| Compute speed (Tensor Cores) | Baseline | 2-3× faster |
| Numerical range | ±3.4 × 10³⁸ | FP16: ±65504, BF16: ±3.4 × 10³⁸ |
| Loss of precision | None | Minimal for most tasks |

### Full Code Example

```python
import torch
import torch.nn as nn
import torch.cuda.amp as amp


def train_with_mixed_precision():
    """Complete mixed precision training example."""
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    # Model
    model = nn.Sequential(
        nn.Linear(1024, 2048),
        nn.ReLU(),
        nn.Linear(2048, 2048),
        nn.ReLU(),
        nn.Linear(2048, 10),
    ).to(device)

    # Optimizer (always FP32)
    optimizer = torch.optim.AdamW(model.parameters(), lr=3e-4)

    # GradScaler: scales gradients to prevent underflow in FP16
    scaler = torch.cuda.amp.GradScaler()

    # Data
    x = torch.randn(256, 1024, device=device)
    y = torch.randint(0, 10, (256,), device=device)

    # Training step
    optimizer.zero_grad(set_to_none=True)

    # Forward pass in mixed precision
    with torch.cuda.amp.autocast(dtype=torch.float16):
        output = model(x)
        loss = nn.functional.cross_entropy(output, y)
        # loss computation benefits from FP16 (faster matmuls)

    # Backward pass with gradient scaling
    scaler.scale(loss).backward()

    # Unscale gradients before clipping (important!)
    scaler.unscale_(optimizer)

    # Gradient clipping (in FP32 after unscaling)
    torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)

    # Optimizer step (Scaler handles the FP16 → FP32 weight update)
    scaler.step(optimizer)
    scaler.update()  # Adjust scale factor for next iteration

    print(f"Loss: {loss.item():.4f}")
    return loss.item()


# ── BF16 (BFloat16) Alternative ────────────────────────────────

def train_with_bf16():
    """
    BFloat16: wider range than FP16 (same exponent bits as FP32),
    so GradScaler is NOT needed.
    Available on Ampere+ GPUs (A100, H100, RTX 3090+).
    """
    device = torch.device("cuda")

    model = nn.Linear(4096, 10).to(device)
    optimizer = torch.optim.AdamW(model.parameters(), lr=3e-4)

    x = torch.randn(256, 4096, device=device)
    y = torch.randint(0, 10, (256,), device=device)

    optimizer.zero_grad(set_to_none=True)

    with torch.cuda.amp.autocast(dtype=torch.bfloat16):
        output = model(x)
        loss = nn.functional.cross_entropy(output, y)

    # No GradScaler needed with BF16!
    loss.backward()
    torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
    optimizer.step()

    print(f"BF16 Loss: {loss.item():.4f}")


# ── Mixed Precision with DDP ────────────────────────────────────

def train_ddp_mixed_precision(rank, world_size):
    """DDP + Mixed Precision combined."""
    dist.init_process_group(backend="nccl", rank=rank, world_size=world_size)
    torch.cuda.set_device(rank)

    model = nn.Linear(1024, 10).to(rank)
    model = nn.parallel.DistributedDataParallel(model, device_ids=[rank])

    optimizer = torch.optim.SGD(model.parameters(), lr=0.01)
    scaler = torch.cuda.amp.GradScaler()

    for step in range(100):
        x = torch.randn(64, 1024, device=rank)
        y = torch.randint(0, 10, (64,), device=rank)

        optimizer.zero_grad(set_to_none=True)

        with torch.cuda.amp.autocast():
            loss = nn.functional.cross_entropy(model(x), y)

        scaler.scale(loss).backward()

        # Before step: unscale for gradient clipping
        scaler.unscale_(optimizer)
        torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)

        scaler.step(optimizer)
        scaler.update()

    dist.destroy_process_group()
```

### GradScaler: How It Works

```
Mixed Precision Gradient Scaling:

  FP32 Master Weights
         │
    ┌────▼────┐
    │  Copy   │  FP16 copy for forward/backward
    └────┬────┘
         │
  ┌──────▼──────┐
  │ FP16 Forward │  Faster computation (Tensor Cores)
  └──────┬──────┘
         │
  ┌──────▼──────┐
  │ FP16 Backward│
  └──────┬──────┘
         │
  ┌──────▼──────┐
  │ Scale Loss  │  Multiply by large scale (e.g., 65536)
  │ × 65536     │  to prevent gradient underflow to zero
  └──────┬──────┘
         │
  ┌──────▼──────┐
  │ Unscale     │  Divide gradients by scale
  └──────┬──────┘
         │
    ┌────▼────┐
    │  NaN?   │──── Yes ──→ Skip step, halve scale
    └────┬────┘
         │ No
    ┌────▼────┐
    │ Clip &  │
    │ Update  │  Apply FP32 weight update
    └─────────┘
```

---

## 12. FSDP (Fully Sharded Data Parallel)

FSDP shards model parameters, gradients, and optimizer states across all GPUs, allowing you to train models much larger than what fits on a single GPU.

### DDP vs FSDP Memory Usage

```
DDP Memory Layout (4 GPUs):
─────────────────────────────
GPU 0: [Full Model] + [Full Optimizer] + [Gradients] + [Activations]
GPU 1: [Full Model] + [Full Optimizer] + [Gradients] + [Activations]
GPU 2: [Full Model] + [Full Optimizer] + [Gradients] + [Activations]
GPU 3: [Full Model] + [Full Optimizer] + [Gradients] + [Activations]
→ Each GPU holds 100% of parameters

FSDP Memory Layout (4 GPUs):
─────────────────────────────
GPU 0: [1/4 Params] + [1/4 Optimizer] + [1/4 Gradients] + [Full Act.]
GPU 1: [1/4 Params] + [1/4 Optimizer] + [1/4 Gradients] + [Full Act.]
GPU 2: [1/4 Params] + [1/4 Optimizer] + [1/4 Gradients] + [Full Act.]
GPU 3: [1/4 Params] + [1/4 Optimizer] + [1/4 Gradients] + [Full Act.]
→ Each GPU holds 25% of parameters (gathered on-demand during fwd/bwd)
```

### FSDP Configuration Example

```python
import torch
import torch.nn as nn
import torch.distributed as dist
from torch.distributed.fsdp import (
    FullyShardedDataParallel as FSDP,
    MixedPrecision,
    ShardingStrategy,
    CPUOffload,
)
from torch.distributed.fsdp.wrap import (
    size_based_auto_wrap_policy,
    transformer_auto_wrap_policy,
)
import functools


# ── Define Model ─────────────────────────────────────────────────

class TransformerBlock(nn.Module):
    def __init__(self, d_model=1024, nhead=8, dim_ff=4096):
        super().__init__()
        self.attn = nn.MultiheadAttention(d_model, nhead, batch_first=True)
        self.ff = nn.Sequential(
            nn.Linear(d_model, dim_ff),
            nn.GELU(),
            nn.Linear(dim_ff, d_model),
        )
        self.norm1 = nn.LayerNorm(d_model)
        self.norm2 = nn.LayerNorm(d_model)

    def forward(self, x):
        # Self-attention with residual
        attn_out, _ = self.attn(x, x, x)
        x = self.norm1(x + attn_out)
        # Feed-forward with residual
        ff_out = self.ff(x)
        x = self.norm2(x + ff_out)
        return x


class LargeTransformer(nn.Module):
    def __init__(self, vocab_size=50000, d_model=1024, num_layers=24):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, d_model)
        self.layers = nn.ModuleList([
            TransformerBlock(d_model) for _ in range(num_layers)
        ])
        self.head = nn.Linear(d_model, vocab_size)

    def forward(self, x):
        x = self.embedding(x)
        for layer in self.layers:
            x = layer(x)
        return self.head(x)


# ── FSDP Setup ──────────────────────────────────────────────────

def setup_fsdp_model(rank, world_size):
    """Create an FSDP-wrapped model with full configuration."""
    dist.init_process_group(backend="nccl", rank=rank, world_size=world_size)
    torch.cuda.set_device(rank)

    # Mixed precision policy
    bf16_policy = MixedPrecision(
        param_dtype=torch.bfloat16,       # Parameters in BF16
        reduce_dtype=torch.bfloat16,      # Gradient reduction in BF16
        buffer_dtype=torch.bfloat16,      # Buffers (e.g., BN running stats)
    )

    # Auto-wrap policy: wrap each TransformerBlock as a separate FSDP unit
    auto_wrap_policy = functools.partial(
        transformer_auto_wrap_policy,
        transformer_layer_cls={TransformerBlock},
    )

    # Create the model
    model = LargeTransformer(vocab_size=50000, d_model=1024, num_layers=24)

    # Wrap with FSDP
    fsdp_model = FSDP(
        model,
        auto_wrap_policy=auto_wrap_policy,
        mixed_precision=bf16_policy,
        sharding_strategy=ShardingStrategy.FULL_SHARD,  # Shard params + grads + optim
        # ShardingStrategy.SHARD_GRAD_OP  # Shard grads + optim only (less comm)
        # ShardingStrategy.NO_SHARD        # Same as DDP (for debugging)

        device_id=rank,
        use_orig_params=True,            # Required for some optimizers
        sync_module_states=True,         # Sync initial weights from rank 0

        # Optional: offload to CPU for very large models
        # cpu_offload=CPUOffload(offload_params=True),

        # Limit outstanding all-gathers for memory savings
        limit_all_gathers=True,
    )

    return fsdp_model


# ── Checkpointing with FSDP ─────────────────────────────────────

def save_fsdp_checkpoint(model, optimizer, epoch, path):
    """Save FSDP checkpoint using full state dict."""
    from torch.distributed.fsdp import FullStateDictConfig, StateDictType

    cfg = FullStateDictConfig(offload_to_cpu=True, rank0_only=True)

    with FSDP.state_dict_type(model, StateDictType.FULL_STATE_DICT, cfg):
        state_dict = {
            "model": model.state_dict(),
            "optimizer": optimizer.state_dict(),
            "epoch": epoch,
        }

    if dist.get_rank() == 0:
        torch.save(state_dict, path)
        print(f"Saved checkpoint to {path}")


def load_fsdp_checkpoint(model, optimizer, path):
    """Load FSDP checkpoint."""
    from torch.distributed.fsdp import FullStateDictConfig, StateDictType

    cfg = FullStateDictConfig(offload_to_cpu=True, rank0_only=True)

    with FSDP.state_dict_type(model, StateDictType.FULL_STATE_DICT, cfg):
        checkpoint = torch.load(path, map_location="cpu")
        model.load_state_dict(checkpoint["model"])
        if optimizer is not None:
            optimizer.load_state_dict(checkpoint["optimizer"])

    return checkpoint.get("epoch", 0)
```

### FSDP vs DDP Comparison

| Feature | DDP | FSDP |
|---|---|---|
| Parameters per GPU | 100% | 1/N (N = num GPUs) |
| Optimizer states per GPU | 100% | 1/N |
| Gradient memory per GPU | 100% | 1/N |
| Communication volume | AllReduce (2× model size) | AllGather + ReduceScatter (3× model size) |
| Activation memory | Same | Same |
| GPU memory efficiency | Low | High |
| Communication overhead | Low | Higher |
| Best for | Models < GPU memory | Models > GPU memory |
| Checkpointing | Simple | Requires special handling |

---

## 13. Model Parallelism Basics

When a model is too large to fit on any single GPU even with FSDP, or when you want to exploit tensor-level parallelism within layers, you split the model itself across GPUs.

### Manual Layer Splitting

```python
import torch
import torch.nn as nn


class ModelParallelMLP(nn.Module):
    """
    Manually splits an MLP across 2 GPUs.

    GPU 0: layers[0] (input → hidden)
    GPU 1: layers[1] (hidden → output)
    """

    def __init__(self, input_dim=4096, hidden_dim=16384, output_dim=10):
        super().__init__()

        # Define layers on specific devices
        self.layer0 = nn.Sequential(
            nn.Linear(input_dim, hidden_dim),
            nn.ReLU(),
        ).to("cuda:0")  # GPU 0

        self.layer1 = nn.Sequential(
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(),
        ).to("cuda:1")  # GPU 1

        self.output = nn.Linear(hidden_dim, output_dim).to("cuda:1")  # GPU 1

    def forward(self, x):
        # Forward pass crosses GPU boundaries
        x = x.to("cuda:0")           # Move input to GPU 0
        x = self.layer0(x)           # Compute on GPU 0
        x = x.to("cuda:1")           # Transfer to GPU 1 (inter-GPU comm!)
        x = self.layer1(x)           # Compute on GPU 1
        x = self.output(x)           # Compute on GPU 1
        return x


# Usage
model = ModelParallelMLP()
x = torch.randn(32, 4096)
output = model(x)  # Automatically transfers data between GPUs
print(f"Output shape: {output.shape}, device: {output.device}")
```

### Pipeline Parallelism with Micro-Batching

```python
import torch
import torch.nn as nn
from torch import Tensor
from typing import List


class Stage0(nn.Module):
    """Layers 0-3, runs on GPU 0."""
    def __init__(self):
        super().__init__()
        self.layers = nn.Sequential(
            nn.Linear(512, 1024),
            nn.ReLU(),
            nn.Linear(1024, 1024),
            nn.ReLU(),
        )

    def forward(self, x: Tensor) -> Tensor:
        return self.layers(x)


class Stage1(nn.Module):
    """Layers 4-7, runs on GPU 1."""
    def __init__(self):
        super().__init__()
        self.layers = nn.Sequential(
            nn.Linear(1024, 1024),
            nn.ReLU(),
            nn.Linear(1024, 512),
            nn.ReLU(),
        )

    def forward(self, x: Tensor) -> Tensor:
        return self.layers(x)


def manual_pipeline_forward(model_parts: List[nn.Module], x: Tensor,
                            microbatch_size: int = 16) -> Tensor:
    """
    Simple pipeline parallelism: split input into micro-batches,
    process each through all stages sequentially.
    """
    total_batch = x.size(0)
    micro_batches = torch.chunk(x, total_batch // microbatch_size, dim=0)

    outputs = []
    for mb in micro_batches:
        # Forward through all stages
        for stage in model_parts:
            mb = mb.to(stage.layers[0].weight.device)
            mb = stage(mb)
        outputs.append(mb)

    return torch.cat(outputs, dim=0)


# Usage
stage0 = Stage0().to("cuda:0")
stage1 = Stage1().to("cuda:1")
model_parts = [stage0, stage1]

x = torch.randn(64, 512)
output = manual_pipeline_forward(model_parts, x, microbatch_size=16)
print(f"Pipeline output shape: {output.shape}")
```

### Tensor Parallelism (Column/Row Splitting)

```python
import torch
import torch.nn as nn


def column_parallel_linear(input_features: int, output_features: int,
                           num_splits: int = 2):
    """
    Split a Linear layer's output dimension across GPUs.

    Original: y = xW + b   (W is [input, output])
    Split:    y0 = xW0 + b0  (W0 is [input, output/2])  on GPU 0
              y1 = xW1 + b1  (W1 is [input, output/2])  on GPU 1
              y = [y0, y1]   (concatenated)
    """
    half_out = output_features // num_splits

    w0 = torch.randn(input_features, half_out, device="cuda:0") * 0.02
    w1 = torch.randn(input_features, half_out, device="cuda:1") * 0.02
    b0 = torch.zeros(half_out, device="cuda:0")
    b1 = torch.zeros(half_out, device="cuda:1")

    x = torch.randn(1, input_features)

    # Parallel computation
    y0 = x.to("cuda:0") @ w0 + b0  # GPU 0
    y1 = x.to("cuda:1") @ w1 + b1  # GPU 1

    # Gather results
    y = torch.cat([y0, y1], dim=-1)  # Back to single GPU or wherever needed

    return y


result = column_parallel_linear(1024, 4096, num_splits=2)
print(f"Column parallel output shape: {result.shape}")
```

---

## 14. DeepSpeed Integration

DeepSpeed is a library from Microsoft that provides advanced distributed training optimizations, including ZeRO (Zero Redundancy Optimizer) for memory-efficient training.

### ZeRO Stages

```
ZeRO Memory Optimization Stages:
──────────────────────────────────────────────────────

Parameter Count: P = 1 billion
Optimizer: Adam (FP32 params + momentum + variance = 12 bytes/param)

Stage 0 (DDP):
  Each GPU holds: P params + 12P optimizer states + P grads
  Memory: ~16 bytes × P = 16 GB per GPU

Stage 1: Partition Optimizer States
  Each GPU holds: P params + 12P/N optimizer states + P grads
  Memory: 4P + 12P/N + 4P = 8P + 12P/N
  For N=64: ~4.2 GB per GPU

Stage 2: Partition Optimizer States + Gradients
  Each GPU holds: P params + 12P/N optimizer + P/N grads
  Memory: 4P + 12P/N + 4P/N = 4P + 16P/N
  For N=64: ~4.5 GB per GPU

Stage 3: Partition Optimizer States + Gradients + Parameters
  Each GPU holds: P/N params + 12P/N optimizer + P/N grads
  Memory: 4P/N + 12P/N + 4P/N = 20P/N
  For N=64: ~0.31 GB per GPU
  (Parameters gathered on-demand during forward/backward)
```

### DeepSpeed Configuration

```json
{
    "train_batch_size": 256,
    "train_micro_batch_size_per_gpu": 16,
    "gradient_accumulation_steps": 4,
    "steps_per_print": 100,

    "optimizer": {
        "type": "AdamW",
        "params": {
            "lr": 3e-4,
            "betas": [0.9, 0.999],
            "eps": 1e-8,
            "weight_decay": 1e-2
        }
    },

    "scheduler": {
        "type": "WarmupDecayLR",
        "params": {
            "warmup_min_lr": 0,
            "warmup_max_lr": 3e-4,
            "warmup_num_steps": 1000,
            "total_num_steps": 100000
        }
    },

    "bf16": {
        "enabled": true
    },

    "zero_optimization": {
        "stage": 3,
        "offload_optimizer": {
            "device": "cpu",
            "pin_memory": true
        },
        "offload_param": {
            "device": "cpu",
            "pin_memory": true
        },
        "overlap_comm": true,
        "contiguous_gradients": true,
        "sub_group_size": 1e9,
        "reduce_bucket_size": "auto",
        "stage3_prefetch_bucket_size": "auto",
        "stage3_param_persistence_threshold": "auto",
        "stage3_max_live_parameters": 1e9,
        "stage3_max_reuse_distance": 1e9,
        "stage3_gather_16bit_weights_on_model_save": true
    },

    "gradient_clipping": 1.0,
    "wall_clock_breakdown": true
}
```

### Integration with PyTorch Training

```python
import torch
import torch.nn as nn
import deepspeed
from torch.utils.data import DataLoader, Dataset


class SimpleDataset(Dataset):
    """Synthetic dataset for demonstration."""
    def __init__(self, size=10000, input_dim=1024, num_classes=10):
        self.x = torch.randn(size, input_dim)
        self.y = torch.randint(0, num_classes, (size,))

    def __len__(self):
        return len(self.x)

    def __getitem__(self, idx):
        return self.x[idx], self.y[idx]


def create_model():
    """Create a simple model for DeepSpeed training."""
    return nn.Sequential(
        nn.Linear(1024, 4096),
        nn.ReLU(),
        nn.Linear(4096, 4096),
        nn.ReLU(),
        nn.Linear(4096, 10),
    )


def train_with_deepspeed():
    """Full DeepSpeed training loop."""
    # Create model
    model = create_model()

    # Create dataset and dataloader
    dataset = SimpleDataset(size=50000)

    # DeepSpeed handles initialization automatically
    model_engine, optimizer, train_dataloader, lr_scheduler = deepspeed.initialize(
        model=model,
        model_parameters=model.parameters(),
        training_data=dataset,
        config="ds_config.json",  # The JSON config above
    )

    criterion = nn.CrossEntropyLoss()

    # Training loop
    model_engine.train()
    for epoch in range(10):
        total_loss = 0.0
        for batch_idx, (x, y) in enumerate(train_dataloader):
            x = x.to(model_engine.device)
            y = y.to(model_engine.device)

            output = model_engine(x)
            loss = criterion(output, y)

            model_engine.backward(loss)     # DeepSpeed backward (handles FP16 scaling)
            model_engine.step()             # DeepSpeed optimizer step

            total_loss += loss.item()

            if batch_idx % 100 == 0:
                print(
                    f"Epoch {epoch}, Step {batch_idx}, "
                    f"Loss: {loss.item():.4f}"
                )

        avg_loss = total_loss / len(train_dataloader)
        if model_engine.local_rank == 0:
            print(f"Epoch {epoch}: avg_loss = {avg_loss:.4f}")

    # Save checkpoint
    model_engine.save_checkpoint("ds_checkpoints", tag=f"epoch_{epoch}")


def load_deepspeed_checkpoint():
    """Load a DeepSpeed checkpoint."""
    model = create_model()
    model_engine, _, _, _ = deepspeed.initialize(
        model=model,
        config="ds_config.json",
    )

    # Load checkpoint
    load_path, client_state = model_engine.load_checkpoint(
        "ds_checkpoints",
        tag="epoch_9",
    )
    print(f"Loaded checkpoint from step {load_path}")


if __name__ == "__main__":
    # Launch with: deepspeed --num_gpus=4 train_script.py
    train_with_deepspeed()
```

### DDP vs DeepSpeed ZeRO Comparison

| Feature | DDP | ZeRO Stage 1 | ZeRO Stage 2 | ZeRO Stage 3 |
|---|---|---|---|---|
| Optimizer states | Replicated | Partitioned | Partitioned | Partitioned |
| Gradients | Replicated | Replicated | Partitioned | Partitioned |
| Parameters | Replicated | Replicated | Replicated | Partitioned |
| Communication | AllReduce | AllReduce | AllReduce + ReduceScatter | AllGather + ReduceScatter |
| Memory (1B params, Adam) | 16 GB | ~12 GB | ~4.5 GB | ~0.3 GB |
| Communication overhead | 1× | 1× | 1.5× | 3× |
| CPU offload | No | Yes (optional) | Yes (optional) | Yes (optional) |

---

## 15. Profiling Distributed Training

Profiling distributed training helps identify bottlenecks in computation, communication, and data loading.

### Basic Profiling with torch.profiler

```python
import torch
import torch.nn as nn
import torch.distributed as dist
from torch.profiler import (
    profile,
    record_function,
    ProfilerActivity,
    tensorboard_trace_handler,
)


def profile_ddp_training(rank, world_size):
    """Profile a DDP training step."""
    dist.init_process_group(backend="nccl", rank=rank, world_size=world_size)
    torch.cuda.set_device(rank)

    model = nn.Sequential(
        nn.Linear(2048, 4096),
        nn.ReLU(),
        nn.Linear(4096, 4096),
        nn.ReLU(),
        nn.Linear(4096, 10),
    ).to(rank)

    model = nn.parallel.DistributedDataParallel(model, device_ids=[rank])
    optimizer = torch.optim.SGD(model.parameters(), lr=0.01)

    x = torch.randn(64, 2048, device=rank)
    y = torch.randint(0, 10, (64,), device=rank)

    # Warm up
    for _ in range(3):
        optimizer.zero_grad()
        loss = nn.functional.cross_entropy(model(x), y)
        loss.backward()
        optimizer.step()

    torch.cuda.synchronize()

    # Profile
    log_dir = f"./profiler_logs/rank_{rank}"
    with profile(
        activities=[ProfilerActivity.CPU, ProfilerActivity.CUDA],
        schedule=torch.profiler.schedule(wait=1, warmup=1, active=3, repeat=1),
        on_trace_ready=tensorboard_trace_handler(log_dir),
        record_shapes=True,
        profile_memory=True,
        with_stack=True,
    ) as prof:
        for step in range(5):
            with record_function("forward"):
                optimizer.zero_grad()
                output = model(x)
                loss = nn.functional.cross_entropy(output, y)

            with record_function("backward"):
                loss.backward()

            with record_function("optimizer_step"):
                optimizer.step()

            prof.step()

    # Print summary (only rank 0)
    if rank == 0:
        print("\n=== CUDA Kernel Times ===")
        print(prof.key_averages().table(sort_by="cuda_time_total", row_limit=20))

        print("\n=== CPU Time ===")
        print(prof.key_averages().table(sort_by="cpu_time_total", row_limit=20))

        print("\n=== Memory Usage ===")
        print(prof.key_averages().table(
            sort_by="cuda_memory_usage", row_limit=10
        ))

    dist.destroy_process_group()
```

### Analyzing Communication vs Computation

```python
def analyze_communication_overlap(rank, world_size):
    """Profile to check if gradient communication overlaps with computation."""
    dist.init_process_group(backend="nccl", rank=rank, world_size=world_size)
    torch.cuda.set_device(rank)

    model = nn.Sequential(
        nn.Linear(1024, 4096),
        nn.ReLU(),
        nn.Linear(4096, 4096),
        nn.ReLU(),
        nn.Linear(4096, 10),
    ).to(rank)
    model = nn.parallel.DistributedDataParallel(model, device_ids=[rank])

    x = torch.randn(64, 1024, device=rank)
    y = torch.randint(0, 10, (64,), device=rank)

    # Enable profiling to see NCCL operations
    with profile(
        activities=[ProfilerActivity.CPU, ProfilerActivity.CUDA],
        record_shapes=True,
        profile_memory=True,
        with_stack=True,
    ) as prof:
        for _ in range(5):
            optimizer = torch.optim.SGD(model.parameters(), lr=0.01)
            optimizer.zero_grad()
            loss = nn.functional.cross_entropy(model(x), y)
            loss.backward()
            optimizer.step()

    if rank == 0:
        # Look for NCCL AllReduce operations
        nccl_events = [
            e for e in prof.key_averages()
            if "nccl" in e.key.lower() or "all_reduce" in e.key.lower()
        ]
        print("\n=== NCCL Communication Events ===")
        for event in nccl_events:
            print(f"  {event.key}: CPU time={event.cpu_time_total/1000:.2f} ms, "
                  f"CUDA time={event.cuda_time_total/1000:.2f} ms, "
                  f"calls={event.count}")

        # If NCCL CUDA time is much less than compute CUDA time,
        # communication is well-overlapped with computation.

    dist.destroy_process_group()


if __name__ == "__main__":
    import sys
    rank = int(sys.argv[1]) if len(sys.argv) > 1 else 0
    world_size = int(sys.argv[2]) if len(sys.argv) > 2 else 1
    analyze_communication_overlap(rank, world_size)
```

### Key Metrics to Monitor

| Metric | What It Tells You | Good Target |
|---|---|---|
| GPU Compute Utilization | % of time GPU is doing useful work | >80% |
| GPU Memory Utilization | % of GPU memory used | 70-90% |
| NCCL AllReduce Time | Time spent in gradient sync | <20% of step time |
| Data Loading Time | Time spent loading next batch | <10% of step time |
| Kernel Launch Overhead | Time between CPU launch and GPU execution | <5% of step time |
| Communication Overlap | % of NCCL ops hidden behind compute | >80% |

---

## 16. Common Pitfalls

### Pitfall 1: Uneven Batching

```python
# BAD: Drop the remainder unevenly
train_sampler = DistributedSampler(dataset, shuffle=True)
train_loader = DataLoader(dataset, batch_size=32, sampler=train_sampler)
# If dataset size is not divisible by (batch_size × world_size),
# some GPUs get an extra batch, causing a synchronization hang!

# SOLUTION: Use drop_last=True
train_loader = DataLoader(
    dataset, batch_size=32, sampler=train_sampler, drop_last=True
)

# OR: Pad the dataset to be evenly divisible
remainder = len(dataset) % (batch_size * world_size)
if remainder != 0:
    # Add padding samples
    padding = batch_size * world_size - remainder
    dataset = torch.utils.data.ConcatDataset([dataset, dataset[:padding]])
```

### Pitfall 2: Forgetting sampler.set_epoch()

```python
# BAD: Dataloader uses same shuffle order every epoch
for epoch in range(10):
    for batch in train_loader:
        train(batch)
    # DDP DistributedSampler has a fixed seed per epoch
    # Without set_epoch, each epoch sees the same data order!
    # This degrades training quality.

# SOLUTION: Call set_epoch before each epoch
for epoch in range(10):
    train_sampler.set_epoch(epoch)  # ← Critical!
    for batch in train_loader:
        train(batch)
```

### Pitfall 3: Not Using the Correct Device

```python
# BAD: Hardcoded device
model = model.to("cuda:0")  # Always goes to GPU 0!

# SOLUTION: Use LOCAL_RANK from environment
local_rank = int(os.environ["LOCAL_RANK"])
model = model.to(f"cuda:{local_rank}")
# OR
torch.cuda.set_device(local_rank)
model = model.cuda()
```

### Pitfall 4: All Processes Saving Checkpoints

```python
# BAD: Every process saves a checkpoint (disk space explosion, corruption)
torch.save(model.state_dict(), "model.pt")  # All 8 GPUs write to same file!

# SOLUTION: Only rank 0 saves
if dist.get_rank() == 0:
    torch.save(model.module.state_dict(), "model.pt")

# For DDP, use model.module to get the unwrapped model
```

### Pitfall 5: Using rank Instead of local_rank

```python
# BAD: Confusing rank with local_rank
rank = dist.get_rank()  # Global rank (0 to N-1 across all nodes)
torch.cuda.set_device(rank)  # May try to set device to non-existent GPU!

# On a 2-node setup with 4 GPUs each:
# Node 0: rank 0,1,2,3 → local_rank 0,1,2,3  ✓
# Node 1: rank 4,5,6,7 → local_rank 0,1,2,3  ← WRONG! rank=4 but only 4 GPUs!

# SOLUTION: Always use LOCAL_RANK for device assignment
local_rank = int(os.environ["LOCAL_RANK"])
torch.cuda.set_device(local_rank)
model = model.to(local_rank)
model = DDP(model, device_ids=[local_rank])
```

### Pitfall 6: Synchronization Overhead with Too Many GPUs

```python
# Problem: Adding more GPUs doesn't always speed up training
# AllReduce communication grows with model size and number of GPUs

# SOLUTION 1: Use gradient accumulation to keep effective batch size
# constant while reducing per-GPU communication
accumulation_steps = 4
optimizer.zero_grad()

for i, (x, y) in enumerate(dataloader):
    loss = model(x, y) / accumulation_steps
    loss.backward()  # Gradients accumulated (not synced yet)
    if (i + 1) % accumulation_steps == 0:
        optimizer.step()  # AllReduce happens here
        optimizer.zero_grad()

# SOLUTION 2: Profile to find the communication bottleneck
# If GPU utilization < 50%, you likely have too many GPUs for the model size
```

### Pitfall 7: Memory Imbalance

```python
# Problem: GPU 0 uses more memory because it handles gathers, logging, etc.

# SOLUTION 1: Don't log from GPU 0 during training steps
# SOLUTION 2: Use FSDP to evenly distribute memory
# SOLUTION 3: Move checkpoint saving off-GPU
if rank == 0:
    # Save using CPU memory, not GPU
    cpu_state = {k: v.cpu() for k, v in model.module.state_dict().items()}
    torch.save(cpu_state, "checkpoint.pt")

# SOLUTION 4: Profile memory per GPU to identify imbalance
for i in range(torch.cuda.device_count()):
    allocated = torch.cuda.memory_allocated(i) / 1e9
    reserved = torch.cuda.memory_reserved(i) / 1e9
    print(f"GPU {i}: allocated={allocated:.2f} GB, reserved={reserved:.2f} GB")
```

---

## 17. Complete Multi-GPU Training Example

Here is a complete, end-to-end training script that brings together everything from this chapter: DDP, mixed precision, gradient accumulation, checkpointing, and logging.

```python
#!/usr/bin/env python3
"""
Complete Multi-GPU Training Example
────────────────────────────────────
Features:
  - DistributedDataParallel (DDP)
  - Mixed precision (AMP)
  - Gradient accumulation
  - Cosine LR schedule with warmup
  - Checkpointing (best model + periodic)
  - Metrics aggregation across processes
  - Progress logging (rank 0 only)

Launch:
    torchrun --nproc_per_node=4 complete_training.py \
        --epochs 20 --batch_size 64 --lr 5e-4 --accumulation_steps 4
"""

import os
import time
import argparse
from pathlib import Path
from typing import Optional, Tuple

import torch
import torch.nn as nn
import torch.nn.functional as F
import torch.distributed as dist
from torch.nn.parallel import DistributedDataParallel as DDP
from torch.utils.data import Dataset, DataLoader, DistributedSampler


# ═══════════════════════════════════════════════════════════════════
#  Model Definition
# ═══════════════════════════════════════════════════════════════════

class PreActBlock(nn.Module):
    """Pre-activation residual block."""
    def __init__(self, channels: int):
        super().__init__()
        self.bn1 = nn.BatchNorm2d(channels)
        self.conv1 = nn.Conv2d(channels, channels, 3, padding=1, bias=False)
        self.bn2 = nn.BatchNorm2d(channels)
        self.conv2 = nn.Conv2d(channels, channels, 3, padding=1, bias=False)

    def forward(self, x):
        out = F.relu(self.bn1(x))
        shortcut = x
        out = self.conv1(out)
        out = self.conv2(out)
        return out + shortcut


class ResNetCIFAR(nn.Module):
    """ResNet-20 for CIFAR-10."""
    def __init__(self, num_classes: int = 10):
        super().__init__()
        self.conv1 = nn.Conv2d(3, 16, 3, padding=1, bias=False)
        self.layer1 = self._make_layer(16, 3)
        self.layer2 = self._make_layer(32, 3)
        self.layer3 = self._make_layer(64, 3)
        self.fc = nn.Linear(64, num_classes)

    def _make_layer(self, channels: int, num_blocks: int):
        return nn.Sequential(*[PreActBlock(channels) for _ in range(num_blocks)])

    def forward(self, x):
        x = self.conv1(x)
        x = self.layer1(x)
        x = F.avg_pool2d(x, 8)
        x = x.view(x.size(0), -1)
        x = self.fc(x)
        return x


# ═══════════════════════════════════════════════════════════════════
#  Synthetic Dataset (replace with real CIFAR-10 in practice)
# ═══════════════════════════════════════════════════════════════════

class SyntheticCIFAR(Dataset):
    """Synthetic dataset mimicking CIFAR-10 shape."""
    def __init__(self, size: int = 50000):
        self.size = size

    def __len__(self):
        return self.size

    def __getitem__(self, idx):
        return (
            torch.randn(3, 32, 32),       # Random image
            torch.randint(0, 10, (1,)).item(),  # Random label
        )


# ═══════════════════════════════════════════════════════════════════
#  Learning Rate Scheduler
# ═══════════════════════════════════════════════════════════════════

class WarmupCosineScheduler:
    """Cosine decay with linear warmup."""
    def __init__(self, optimizer, warmup_steps: int, total_steps: int,
                 min_lr: float = 1e-6):
        self.optimizer = optimizer
        self.warmup_steps = warmup_steps
        self.total_steps = total_steps
        self.min_lr = min_lr
        self.base_lrs = [pg["lr"] for pg in optimizer.param_groups]
        self.current_step = 0

    def step(self):
        self.current_step += 1
        if self.current_step <= self.warmup_steps:
            # Linear warmup
            factor = self.current_step / max(1, self.warmup_steps)
        else:
            # Cosine decay
            progress = (self.current_step - self.warmup_steps) / max(
                1, self.total_steps - self.warmup_steps
            )
            factor = max(0.0, 0.5 * (1.0 + __import__("math").cos(__import__("math").pi * progress)))

        for pg, base_lr in zip(self.optimizer.param_groups, self.base_lrs):
            pg["lr"] = max(self.min_lr, base_lr * factor)


# ═══════════════════════════════════════════════════════════════════
#  Metrics Aggregation
# ═══════════════════════════════════════════════════════════════════

class DistributedMetrics:
    """Collect and average metrics across all processes."""
    def __init__(self):
        self.reset()

    def reset(self):
        self._loss_sum = 0.0
        self._correct = 0
        self._total = 0

    def update(self, loss: float, correct: int, total: int):
        self._loss_sum += loss
        self._correct += correct
        self._total += total

    def compute(self) -> Tuple[float, float]:
        """Aggregate across all processes and return (avg_loss, accuracy)."""
        metrics = torch.tensor(
            [self._loss_sum, self._correct, self._total],
            dtype=torch.float64,
            device=torch.cuda.current_device(),
        )
        dist.all_reduce(metrics, op=dist.ReduceOp.SUM)
        world_size = dist.get_world_size()
        avg_loss = metrics[0].item() / world_size
        accuracy = metrics[1].item() / max(1, metrics[2].item())
        return avg_loss, accuracy


# ═══════════════════════════════════════════════════════════════════
#  Training Functions
# ═══════════════════════════════════════════════════════════════════

def train_one_epoch(
    model: DDP,
    dataloader: DataLoader,
    sampler: DistributedSampler,
    optimizer: torch.optim.Optimizer,
    scaler: torch.cuda.amp.GradScaler,
    scheduler: WarmupCosineScheduler,
    device: torch.device,
    epoch: int,
    accumulation_steps: int,
    rank: int,
) -> Tuple[float, float]:
    """Train for one epoch with gradient accumulation and AMP."""
    model.train()
    sampler.set_epoch(epoch)

    metrics = DistributedMetrics()
    num_batches = len(dataloader)
    t0 = time.time()

    optimizer.zero_grad(set_to_none=True)

    for batch_idx, (images, labels) in enumerate(dataloader):
        images = images.to(device, non_blocking=True)
        labels = labels.to(device, non_blocking=True)

        # Mixed precision forward
        with torch.cuda.amp.autocast(dtype=torch.float16):
            output = model(images)
            loss = F.cross_entropy(output, labels)
            loss = loss / accumulation_steps  # Scale loss for accumulation

        # Scaled backward
        scaler.scale(loss).backward()

        # Step optimizer every accumulation_steps
        if (batch_idx + 1) % accumulation_steps == 0:
            scaler.unscale_(optimizer)
            torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
            scaler.step(optimizer)
            scaler.update()
            optimizer.zero_grad(set_to_none=True)
            scheduler.step()

        # Accumulate metrics (use unscaled loss for logging)
        batch_loss = loss.item() * accumulation_steps
        _, predicted = output.max(1)
        correct = predicted.eq(labels).sum().item()
        metrics.update(batch_loss * labels.size(0), correct, labels.size(0))

        # Progress logging (rank 0 only)
        if rank == 0 and batch_idx % 200 == 0:
            elapsed = time.time() - t0
            lr = optimizer.param_groups[0]["lr"]
            print(
                f"  [{batch_idx:>5d}/{num_batches}] "
                f"loss={batch_loss:.4f}  lr={lr:.2e}  "
                f"time={elapsed:.1f}s"
            )

    avg_loss, accuracy = metrics.compute()
    return avg_loss, accuracy


@torch.no_grad()
def validate(
    model: DDP,
    dataloader: DataLoader,
    device: torch.device,
) -> Tuple[float, float]:
    """Validate the model."""
    model.eval()
    total_loss = 0.0
    correct = 0
    total = 0

    for images, labels in dataloader:
        images = images.to(device, non_blocking=True)
        labels = labels.to(device, non_blocking=True)

        with torch.cuda.amp.autocast(dtype=torch.float16):
            output = model(images)
            loss = F.cross_entropy(output, labels)

        total_loss += loss.item() * labels.size(0)
        _, predicted = output.max(1)
        correct += predicted.eq(labels).sum().item()
        total += labels.size(0)

    # Average across processes
    metrics = torch.tensor(
        [total_loss, correct, total],
        dtype=torch.float64,
        device=device,
    )
    dist.all_reduce(metrics, op=dist.ReduceOp.SUM)
    world_size = dist.get_world_size()

    avg_loss = metrics[0].item() / max(1, metrics[2].item())
    accuracy = metrics[1].item() / max(1, metrics[2].item())
    return avg_loss, accuracy


# ═══════════════════════════════════════════════════════════════════
#  Checkpointing
# ═══════════════════════════════════════════════════════════════════

def save_checkpoint(
    model: DDP,
    optimizer: torch.optim.Optimizer,
    scheduler: WarmupCosineScheduler,
    epoch: int,
    val_loss: float,
    path: Path,
    rank: int,
):
    """Save checkpoint (rank 0 only)."""
    if rank != 0:
        return

    checkpoint = {
        "epoch": epoch,
        "model_state_dict": model.module.state_dict(),
        "optimizer_state_dict": optimizer.state_dict(),
        "val_loss": val_loss,
    }
    torch.save(checkpoint, path)
    print(f"  ✓ Saved checkpoint to {path} (val_loss={val_loss:.4f})")


# ═══════════════════════════════════════════════════════════════════
#  Main
# ═══════════════════════════════════════════════════════════════════

def main():
    parser = argparse.ArgumentParser(description="Multi-GPU Training")
    parser.add_argument("--epochs", type=int, default=20)
    parser.add_argument("--batch_size", type=int, default=64,
                        help="Per-GPU batch size")
    parser.add_argument("--lr", type=float, default=5e-4)
    parser.add_argument("--accumulation_steps", type=int, default=4)
    parser.add_argument("--checkpoint_dir", type=str, default="checkpoints")
    parser.add_argument("--dataset_size", type=int, default=50000)
    args = parser.parse_args()

    # ── Distributed Setup ──────────────────────────────────────
    rank = int(os.environ["RANK"])
    local_rank = int(os.environ["LOCAL_RANK"])
    world_size = int(os.environ["WORLD_SIZE"])
    device = torch.device(f"cuda:{local_rank}")

    dist.init_process_group(backend="nccl")
    torch.cuda.set_device(device)

    if rank == 0:
        print(f"{'='*60}")
        print(f"  Multi-GPU Training")
        print(f"  GPUs: {world_size}")
        print(f"  Batch per GPU: {args.batch_size}")
        print(f"  Effective batch: {args.batch_size * world_size * args.accumulation_steps}")
        print(f"  Epochs: {args.epochs}")
        print(f"{'='*60}")
        Path(args.checkpoint_dir).mkdir(parents=True, exist_ok=True)

    # ── Model ──────────────────────────────────────────────────
    model = ResNetCIFAR(num_classes=10).to(device)
    model = DDP(model, device_ids=[local_rank])

    total_params = sum(p.numel() for p in model.parameters())
    if rank == 0:
        print(f"  Model parameters: {total_params:,}")

    # ── Optimizer & Scheduler ──────────────────────────────────
    optimizer = torch.optim.AdamW(
        model.parameters(), lr=args.lr, weight_decay=5e-4
    )
    total_steps = (args.dataset_size // (args.batch_size * world_size)) * args.epochs
    warmup_steps = total_steps // 10
    scheduler = WarmupCosineScheduler(optimizer, warmup_steps, total_steps)
    scaler = torch.cuda.amp.GradScaler()

    # ── Data ───────────────────────────────────────────────────
    dataset = SyntheticCIFAR(size=args.dataset_size)
    sampler = DistributedSampler(
        dataset, num_replicas=world_size, rank=rank, shuffle=True
    )
    dataloader = DataLoader(
        dataset, batch_size=args.batch_size, sampler=sampler,
        num_workers=4, pin_memory=True, drop_last=True, persistent_workers=True,
    )

    # Also create a val loader (not shown for brevity, same pattern)

    # ── Training Loop ──────────────────────────────────────────
    best_val_loss = float("inf")

    for epoch in range(args.epochs):
        epoch_start = time.time()

        train_loss, train_acc = train_one_epoch(
            model, dataloader, sampler, optimizer, scaler, scheduler,
            device, epoch, args.accumulation_steps, rank,
        )

        epoch_time = time.time() - epoch_start

        if rank == 0:
            current_lr = optimizer.param_groups[0]["lr"]
            print(
                f"Epoch {epoch:>2d}: "
                f"train_loss={train_loss:.4f}  "
                f"train_acc={train_acc:.4f}  "
                f"lr={current_lr:.2e}  "
                f"time={epoch_time:.1f}s"
            )

        # Save periodic checkpoint
        if (epoch + 1) % 5 == 0:
            save_checkpoint(
                model, optimizer, scheduler, epoch, train_loss,
                Path(args.checkpoint_dir) / f"checkpoint_epoch_{epoch}.pt",
                rank,
            )

    # Save final checkpoint
    save_checkpoint(
        model, optimizer, scheduler, args.epochs - 1, train_loss,
        Path(args.checkpoint_dir) / "final_model.pt",
        rank,
    )

    if rank == 0:
        print(f"\nTraining complete! Total time: "
              f"{(time.time() - epoch_start) / 60:.1f} min")

    dist.destroy_process_group()


if __name__ == "__main__":
    main()
```

---

## 18. Summary

### Key Takeaways

| Topic | Key Point |
|---|---|
| **Why Distributed** | Models too large for one GPU, datasets too large for single-GPU training time |
| **DataParallel (DP)** | Simple but inefficient — always prefer DDP |
| **DistributedDataParallel (DDP)** | Standard for multi-GPU: each process has its own optimizer, AllReduce syncs gradients |
| **FSDP** | Shards parameters, gradients, and optimizer states across GPUs — for models exceeding single-GPU memory |
| **Mixed Precision** | Use FP16 or BF16 for 2-3× speedup with ~50% memory savings; GradScaler prevents gradient underflow in FP16 |
| **torchrun** | The correct launcher for distributed training; handles rank/world_size setup |
| **Gradient Bucketing** | DDP overlaps AllReduce with backward computation for efficiency |
| **NCCL** | Always use for multi-GPU; Gloo for CPU-only; MPI for HPC |
| **DeepSpeed ZeRO** | Stage 3 can train models with 20× fewer memory than DDP |
| **Profiling** | Use `torch.profiler` to identify communication vs computation bottlenecks |

### Decision Tree

```
Do you need distributed training?
│
├─ Can the model + optimizer fit on 1 GPU?
│  ├─ Yes → Do you need faster training?
│  │        ├─ Yes → DDP (multiple GPUs, single node)
│  │        └─ No  → Single GPU training
│  └─ No  → Do you need the model larger than 1 GPU?
│           ├─ Yes → Can it fit with FSDP?
│           │        ├─ Yes → FSDP
│           │        └─ No  → FSDP + DeepSpeed ZeRO Stage 3
│           └─ No  → FSDP or Model Parallelism
│
└─ Multi-node training needed?
   ├─ Yes → DDP/FSDP across nodes, NCCL + InfiniBand
   └─ No  → Single node, multiple GPUs
```

### Quick Reference Commands

```bash
# Standard single-node multi-GPU training
torchrun --nproc_per_node=4 train.py

# Multi-node training (run on each node)
torchrun --nproc_per_node=8 --nnodes=2 --node_rank=$NODE_RANK \
    --master_addr=MASTER_IP --master_port=29500 train.py

# With DeepSpeed
deepspeed --num_gpus=4 train.py --deepspeed_config ds_config.json

# Profile a training step
torchrun --nproc_per_node=1 train.py --profile

# Debug on CPU (DDP with gloo backend)
torchrun --nproc_per_node=2 train.py --backend gloo
```

---

## 19. Practice Exercises

### Exercise 1: Single-Node DDP (Beginner)

**Goal**: Convert a single-GPU training script to use DDP.

**Task**: Take this single-GPU template and make it work with 2+ GPUs:

```python
# starter.py (single GPU)
import torch
import torch.nn as nn

model = nn.Sequential(nn.Linear(256, 128), nn.ReLU(), nn.Linear(128, 10))
optimizer = torch.optim.SGD(model.parameters(), lr=0.01)

for step in range(100):
    x = torch.randn(32, 256).cuda()
    y = torch.randint(0, 10, (32,)).cuda()
    loss = nn.functional.cross_entropy(model(x), y)
    loss.backward()
    optimizer.step()
    optimizer.zero_grad()
    if step % 10 == 0:
        print(f"Step {step}: loss={loss.item():.4f}")
```

**Requirements**:
1. Add proper process group initialization
2. Wrap model with `DistributedDataParallel`
3. Use `torchrun` to launch
4. Only print from rank 0
5. Add `destroy_process_group()` cleanup

**Verify**: Run with `torchrun --nproc_per_node=2 starter.py` and confirm both GPUs are utilized.

---

### Exercise 2: Distributed Data Loading (Intermediate)

**Goal**: Implement proper `DistributedSampler` usage.

**Task**: Create a distributed DataLoader for a dataset of 10,000 samples with batch size 32 across 4 GPUs. Ensure:
1. Each GPU sees a unique subset of data (no overlap)
2. Data order differs per epoch (shuffling)
3. The `set_epoch()` call is in the right place
4. `drop_last=True` prevents synchronization hangs
5. Calculate how many samples each GPU processes per epoch

**Expected answer**: Each GPU processes `10000 // 4 = 2500` samples (or `2500 // 32 = 78` batches with `drop_last=True`).

---

### Exercise 3: Mixed Precision Training (Intermediate)

**Task**: Add mixed precision training to the DDP script from Exercise 1.

**Requirements**:
1. Add `torch.cuda.amp.GradScaler` and `autocast`
2. Decide whether to use FP16 (with GradScaler) or BF16 (without GradScaler)
3. Add gradient clipping (unscale first, then clip)
4. Measure and report the memory usage with and without mixed precision

**Bonus**: Compare training speed (samples/second) between FP32 and mixed precision.

```python
# Starter code to complete:
def train_step_with_amp(model, x, y, optimizer, scaler):
    optimizer.zero_grad(set_to_none=True)

    # TODO: Add autocast context manager

    # TODO: Add scaled loss backward

    # TODO: Add unscale, clip, step, update

    return loss.item()
```

---

### Exercise 4: FSDP for Large Models (Advanced)

**Goal**: Train a model that doesn't fit on a single GPU using FSDP.

**Task**: Create a model with ~2 billion parameters and train it on 4 GPUs using FSDP.

**Requirements**:
1. Define a model (e.g., 24-layer transformer with d_model=2048)
2. Verify total parameters exceed single-GPU memory (use FP16, this is ~4 GB, so use a larger model or smaller batch to demonstrate)
3. Wrap with FSDP using `transformer_auto_wrap_policy`
4. Enable mixed precision (BF16)
5. Save and load an FSDP checkpoint correctly using `StateDictType.FULL_STATE_DICT`

**Verify**: Run `nvidia-smi` during training — confirm each GPU uses roughly 1/N of the model parameters.

---

### Exercise 5: Gradient Accumulation Analysis (Advanced)

**Task**: Implement gradient accumulation in DDP and analyze its effect on training.

**Requirements**:
1. Implement gradient accumulation with `accumulation_steps = 4`
2. Show mathematically why this is equivalent to a larger batch size
3. Add a check: make sure gradients are only synchronized when `optimizer.step()` is called
4. Profile the difference: does gradient accumulation reduce communication overhead?

**Bonus**: Run a convergence experiment comparing:
- Batch size 64, no accumulation
- Batch size 16, accumulation_steps=4 (same effective batch size)
- Do they converge identically? Why or why not?

---

### Exercise 6: Multi-Node Training Simulation (Expert)

**Task**: Set up a multi-node training configuration and test it locally using multiple terminal windows (simulating multiple nodes).

**Requirements**:
1. Write a script that accepts `--node_rank`, `--nnodes`, `--master_addr` arguments
2. Configure NCCL to work over TCP (for local testing)
3. Test with 2 "nodes" of 2 GPUs each (4 total)
4. Implement a custom metric aggregation that handles stragglers (what if one node is slower?)
5. Add timeout handling for process group initialization

```bash
# Expected launch commands (in separate terminals):
# Terminal 0 (master):
torchrun --nproc_per_node=2 --nnodes=2 --node_rank=0 \
    --master_addr=127.0.0.1 --master_port=29500 train.py

# Terminal 1 (worker):
torchrun --nproc_per_node=2 --nnodes=2 --node_rank=1 \
    --master_addr=127.0.0.1 --master_port=29500 train.py
```

---

### Exercise 7: DeepSpeed Integration (Expert)

**Task**: Convert the DDP script to use DeepSpeed with ZeRO Stage 2.

**Requirements**:
1. Create a `ds_config.json` with ZeRO Stage 2, gradient clipping, and warmup scheduler
2. Replace the manual optimizer with `deepspeed.initialize()`
3. Use `model_engine.backward()` and `model_engine.step()` instead of manual backward/step
4. Add checkpoint saving with `model_engine.save_checkpoint()`
5. Verify memory savings by comparing GPU memory with DDP vs DeepSpeed

**Bonus**: Test ZeRO Stage 3 with CPU offload and measure the trade-off between memory savings and training speed.

---

### Exercise 8: Profiling and Optimization (Expert)

**Task**: Profile a distributed training run and identify the bottleneck.

**Requirements**:
1. Use `torch.profiler` with TensorBoard trace export
2. Identify the top 5 most time-consuming CUDA kernels
3. Measure the ratio of AllReduce time to total step time
4. Check if gradient communication is overlapping with computation
5. Suggest and implement one optimization based on your findings (e.g., increasing `bucket_cap_mb`, adjusting batch size, or switching to BF16)

```python
# Analyze the profiler output:
# - If AllReduce takes >30% of step time → communication bound
#   → Reduce model size per GPU (FSDP), or increase batch size
# - If CUDA compute is <50% utilization → data loading or overhead bound
#   → Increase num_workers, use pin_memory, or check data pipeline
# - If GPU memory is near limit → use mixed precision or FSDP
```

---

*End of Chapter 10 — Distributed Training*
