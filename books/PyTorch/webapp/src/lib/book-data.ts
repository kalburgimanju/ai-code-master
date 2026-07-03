export interface Chapter {
  slug: string;
  number: number;
  title: string;
  filename: string;
  part: string;
  partNumber: number;
  description: string;
}

export const BOOK = {
  title: "PyTorch Mastery",
  subtitle: "The Complete Guide to Deep Learning with PyTorch",
  author: "Manjunath Kalburgi",
  description:
    "A comprehensive guide covering PyTorch fundamentals, neural networks, computer vision, NLP, generative models, reinforcement learning, distributed training, deployment, and hands-on projects.",
};

export const PARTS = [
  { number: 1, title: "Foundations" },
  { number: 2, title: "Core Architectures" },
  { number: 3, title: "Advanced Topics" },
  { number: 4, title: "Projects & Ecosystem" },
];

export const CHAPTERS: Chapter[] = [
  {
    slug: "pt-introduction",
    number: 1,
    title: "Introduction to PyTorch",
    filename: "chapter-01-introduction.md",
    part: "Foundations",
    partNumber: 1,
    description:
      "What is PyTorch, its history, comparison with other frameworks, installation, and your first tensors.",
  },
  {
    slug: "pt-tensors",
    number: 2,
    title: "Tensors & Operations",
    filename: "chapter-02-tensors.md",
    part: "Foundations",
    partNumber: 1,
    description:
      "Tensor creation, data types, operations, broadcasting, GPU tensors, and comprehensive reference.",
  },
  {
    slug: "pt-autograd",
    number: 3,
    title: "Autograd & Differentiation",
    filename: "chapter-03-autograd.md",
    part: "Foundations",
    partNumber: 1,
    description:
      "Computation graphs, automatic differentiation, backward(), gradients, hooks, and custom autograd functions.",
  },
  {
    slug: "pt-nn-module",
    number: 4,
    title: "Neural Networks with nn.Module",
    filename: "chapter-04-nn-module.md",
    part: "Foundations",
    partNumber: 1,
    description:
      "Building layers, forward pass, loss functions, optimizers, and your first complete training loop.",
  },
  {
    slug: "pt-training",
    number: 5,
    title: "Training Pipelines",
    filename: "chapter-05-training.md",
    part: "Core Architectures",
    partNumber: 2,
    description:
      "Data loading with DataLoader, transforms, batching, learning rate schedulers, and checkpointing.",
  },
  {
    slug: "pt-cnns",
    number: 6,
    title: "Convolutional Neural Networks",
    filename: "chapter-06-cnns.md",
    part: "Core Architectures",
    partNumber: 2,
    description:
      "Conv2d, pooling, classic architectures, transfer learning, and an image classification project.",
  },
  {
    slug: "pt-rnns-transformers",
    number: 7,
    title: "Recurrent Neural Networks & Transformers",
    filename: "chapter-07-rnns.md",
    part: "Core Architectures",
    partNumber: 2,
    description:
      "RNN, LSTM, GRU, attention mechanisms, and transformer architecture implementation.",
  },
  {
    slug: "pt-gans",
    number: 8,
    title: "Generative Adversarial Networks",
    filename: "chapter-08-gans.md",
    part: "Advanced Topics",
    partNumber: 3,
    description:
      "GAN theory, DCGAN, training tricks, and a complete image generation project.",
  },
  {
    slug: "pt-reinforcement",
    number: 9,
    title: "Reinforcement Learning",
    filename: "chapter-09-reinforcement.md",
    part: "Advanced Topics",
    partNumber: 3,
    description:
      "DQN, PPO, policy gradients, and building RL agents with PyTorch.",
  },
  {
    slug: "pt-distributed",
    number: 10,
    title: "Distributed Training",
    filename: "chapter-10-distributed.md",
    part: "Advanced Topics",
    partNumber: 3,
    description:
      "DataParallel, DistributedDataParallel, mixed precision, and FSDP.",
  },
  {
    slug: "pt-deployment",
    number: 11,
    title: "Model Deployment",
    filename: "chapter-11-deployment.md",
    part: "Advanced Topics",
    partNumber: 3,
    description:
      "TorchScript, ONNX, quantization, serving with Flask/TorchServe, and production deployment.",
  },
  {
    slug: "pt-advanced",
    number: 12,
    title: "Advanced Topics",
    filename: "chapter-12-advanced.md",
    part: "Advanced Topics",
    partNumber: 3,
    description:
      "Custom autograd, C++ extensions, torch.compile, memory management, and profiling.",
  },
  {
    slug: "pt-ecosystem",
    number: 13,
    title: "PyTorch Ecosystem",
    filename: "chapter-13-ecosystem.md",
    part: "Projects & Ecosystem",
    partNumber: 4,
    description:
      "torchvision, torchaudio, PyTorch Lightning, Hugging Face integration, and the broader ecosystem.",
  },
  {
    slug: "pt-projects",
    number: 14,
    title: "Hands-On Projects",
    filename: "chapter-14-projects.md",
    part: "Projects & Ecosystem",
    partNumber: 4,
    description:
      "5 complete projects: Image Classifier, Text Generator, Object Detector, Style Transfer, and Recommendation System.",
  },
];

export function getChapterBySlug(slug: string): Chapter | undefined {
  return CHAPTERS.find((ch) => ch.slug === slug);
}

export function getChaptersByPart(partNumber: number): Chapter[] {
  return CHAPTERS.filter((ch) => ch.partNumber === partNumber);
}
