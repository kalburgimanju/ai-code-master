export interface Book {
  id: string;
  slug: string;
  title: string;
  author: string;
  subtitle: string;
  description: string;
  price: number;
  coverColor: string;
  coverGradient: string;
  icon: string;
  chapters: Chapter[];
  tags: string[];
  pages: number;
}

export interface Chapter {
  slug: string;
  title: string;
  description: string;
  isPreview: boolean;
}

export const BOOKS: Book[] = [
  {
    id: "agi-complete-guide",
    slug: "agi-complete-guide",
    title: "AGI: The Complete Guide",
    author: "Manjunath Kalburgi",
    subtitle: "Understanding, Developing, and Building a Career in AGI",
    description:
      "A comprehensive guide covering everything from AGI fundamentals to practical development, career preparation, and the future of intelligence. 10 chapters spanning foundations, impact, career, and resources.",
    price: 299,
    coverColor: "#6366f1",
    coverGradient: "from-indigo-600 to-purple-600",
    icon: "🧠",
    tags: ["AGI", "AI", "Career", "Deep Learning"],
    pages: 150,
    chapters: [
      { slug: "introduction-to-agi", title: "Introduction to AGI", description: "Definition, history, and current state of AGI", isPreview: true },
      { slug: "core-concepts", title: "Core Concepts", description: "Machine learning, transformers, attention mechanisms, scaling laws", isPreview: false },
      { slug: "agi-architecture", title: "AGI Architecture", description: "Cognitive architectures, memory systems, world models", isPreview: false },
      { slug: "market-impact", title: "Market Impact", description: "How AGI will transform industries and the economy", isPreview: false },
      { slug: "developing-agi", title: "Developing AGI", description: "Research approaches, training, infrastructure, safety", isPreview: false },
      { slug: "engineer-roadmap", title: "The AGI Engineer's Roadmap", description: "A complete learning path from foundations to research", isPreview: false },
      { slug: "getting-jobs", title: "Getting Jobs in AGI", description: "Roles, resumes, portfolios, networking strategies", isPreview: false },
      { slug: "interview-preparation", title: "Interview Preparation", description: "25+ technical questions, system design, behavioral prep", isPreview: false },
      { slug: "study-materials", title: "Study Materials", description: "50+ curated resources: books, papers, courses", isPreview: false },
      { slug: "example-projects", title: "Example Projects", description: "Five hands-on projects with step-by-step guides", isPreview: false },
    ],
  },
  {
    id: "ai-safety-experts",
    slug: "ai-safety-experts",
    title: "AI Safety Experts",
    author: "Manjunath Kalburgi",
    subtitle: "A Comprehensive Guide to AI Safety Research and Practice",
    description:
      "Deep dive into AI safety research, alignment, interpretability, governance, and practical implementation. Covers the full spectrum of AI safety from fundamentals to future directions.",
    price: 349,
    coverColor: "#ef4444",
    coverGradient: "from-red-600 to-rose-600",
    icon: "🛡️",
    tags: ["AI Safety", "Alignment", "Governance", "Ethics"],
    pages: 180,
    chapters: [
      { slug: "ai-safety-fundamentals", title: "AI Safety Fundamentals", description: "Core principles and frameworks of AI safety", isPreview: true },
      { slug: "alignment-research", title: "Alignment Research", description: "Methods for aligning AI systems with human values", isPreview: false },
      { slug: "interpretability", title: "Interpretability", description: "Understanding how AI systems make decisions", isPreview: false },
      { slug: "evaluation-and-benchmarking", title: "Evaluation and Benchmarking", description: "Measuring AI safety and alignment", isPreview: false },
      { slug: "technical-safety", title: "Technical Safety", description: "Technical approaches to AI safety", isPreview: false },
      { slug: "governance-and-policy", title: "Governance and Policy", description: "Policy frameworks for AI safety", isPreview: false },
      { slug: "organizations-and-research", title: "Organizations and Research", description: "Key organizations and research initiatives", isPreview: false },
      { slug: "practical-implementation", title: "Practical Implementation", description: "Implementing safety measures in practice", isPreview: false },
      { slug: "emerging-risks", title: "Emerging Risks", description: "New and evolving AI safety challenges", isPreview: false },
      { slug: "future-of-ai-safety", title: "Future of AI Safety", description: "The roadmap ahead for AI safety", isPreview: false },
    ],
  },
  {
    id: "superintelligence",
    slug: "superintelligence",
    title: "Super Intelligence AI",
    author: "Manjunath Kalburgi",
    subtitle: "A Comprehensive Guide to the Future of Artificial Intelligence",
    description:
      "Explore superintelligence from multiple perspectives: technical, philosophical, ethical, and practical. Covers forms of superintelligence, the control problem, and the research landscape.",
    price: 399,
    coverColor: "#8b5cf6",
    coverGradient: "from-violet-600 to-indigo-600",
    icon: "🌌",
    tags: ["Superintelligence", "Philosophy", "Control Problem", "Future AI"],
    pages: 200,
    chapters: [
      { slug: "superintelligence-foundations", title: "Superintelligence: Foundations", description: "Definition, distinction from AGI, Nick Bostrom's framework", isPreview: true },
      { slug: "forms-of-superintelligence", title: "Forms of Superintelligence", description: "Speed, collective, quality superintelligence", isPreview: false },
      { slug: "intelligence-explosion", title: "Intelligence Explosion", description: "Recursive self-improvement, takeoff dynamics", isPreview: false },
      { slug: "ai-development-paths", title: "AI Development Paths", description: "Brain-computer interfaces, whole brain emulation, direct AI", isPreview: false },
      { slug: "superintelligence-capabilities", title: "Superintelligence Capabilities", description: "Strategic planning, scientific discovery, social manipulation", isPreview: false },
      { slug: "optimization-and-goal-systems", title: "Optimization and Goal Systems", description: "Instrumental convergence, paperclip maximizer", isPreview: false },
      { slug: "the-control-problem", title: "The Control Problem", description: "Why control is hard, boxing methods, off-switch game", isPreview: false },
      { slug: "philosophical-implications", title: "Philosophical Implications", description: "Consciousness, moral status, existential risk", isPreview: false },
      { slug: "research-landscape", title: "The Research Landscape", description: "Key organizations, active research areas, breakthroughs", isPreview: false },
      { slug: "roadmap-to-superintelligence", title: "Roadmap to Superintelligence", description: "Near-term milestones, policy recommendations", isPreview: false },
    ],
  },
  {
    id: "software-architecture",
    slug: "software-architecture",
    title: "Software Architecture Mastery",
    author: "Manjunath Kalburgi",
    subtitle: "Microservices, Modular Monoliths, and System Design",
    description:
      "Master software architecture patterns — from microservices to modular monoliths. Learn system design principles, scalability patterns, and how to build robust distributed systems.",
    price: 249,
    coverColor: "#10b981",
    coverGradient: "from-emerald-600 to-teal-600",
    icon: "🏗️",
    tags: ["Architecture", "Microservices", "System Design", "Backend"],
    pages: 80,
    chapters: [
      { slug: "microservices", title: "Microservices", description: "Building distributed systems with microservices architecture", isPreview: true },
      { slug: "modular-monolith", title: "Modular Monolith", description: "Balancing simplicity with scalability using modular monoliths", isPreview: false },
    ],
  },
  {
    id: "pytorch-mastery",
    slug: "pytorch-mastery",
    title: "PyTorch Mastery",
    author: "Manjunath Kalburgi",
    subtitle: "Deep Learning with PyTorch — From Basics to Advanced",
    description:
      "Complete guide to PyTorch — tensor operations, neural networks, computer vision, NLP, deployment, and the PyTorch ecosystem. Hands-on examples throughout.",
    price: 199,
    coverColor: "#f97316",
    coverGradient: "from-orange-600 to-amber-600",
    icon: "🔥",
    tags: ["PyTorch", "Deep Learning", "Neural Networks", "ML"],
    pages: 120,
    chapters: [
      { slug: "introduction", title: "Introduction to PyTorch", description: "Tensors, autograd, and getting started with PyTorch", isPreview: true },
      { slug: "ecosystem", title: "PyTorch Ecosystem", description: "TorchVision, TorchText, TorchServe, and more", isPreview: false },
    ],
  },
  {
    id: "python-mastery",
    slug: "python-mastery",
    title: "Python Mastery",
    author: "Manjunath Kalburgi",
    subtitle: "Complete Python Programming — From Beginner to Expert",
    description:
      "Master Python from fundamentals to advanced topics. Data structures, OOP, decorators, generators, async programming, testing, and real-world projects.",
    price: 149,
    coverColor: "#3b82f6",
    coverGradient: "from-blue-600 to-cyan-600",
    icon: "🐍",
    tags: ["Python", "Programming", "Data Structures", "OOP"],
    pages: 100,
    chapters: [
      { slug: "introduction", title: "Introduction to Python", description: "Python basics, setup, and your first programs", isPreview: true },
    ],
  },
];

export function getBookBySlug(slug: string): Book | undefined {
  return BOOKS.find((b) => b.slug === slug);
}

export function getPreviewChapters(book: Book): Chapter[] {
  return book.chapters.filter((c) => c.isPreview);
}

export function getChapterBySlug(book: Book, chapterSlug: string): Chapter | undefined {
  return book.chapters.find((c) => c.slug === chapterSlug);
}
