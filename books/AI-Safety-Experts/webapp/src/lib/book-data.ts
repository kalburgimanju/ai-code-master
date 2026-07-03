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
  title: "Super Intelligence Safety Experts",
  subtitle: "The Complete Guide to AI Safety and Alignment",
  author: "Manjunath Kalburgi",
  description:
    "A comprehensive guide covering AI safety fundamentals, alignment research, interpretability, evaluation, governance, and the future of keeping AI systems safe and beneficial.",
};

export const PARTS = [
  { number: 1, title: "Foundations of AI Safety" },
  { number: 2, title: "Safety in Practice" },
  { number: 3, title: "Building a Career in Safety" },
  { number: 4, title: "The Future of Safety" },
];

export const CHAPTERS: Chapter[] = [
  {
    slug: "safety-fundamentals",
    number: 1,
    title: "AI Safety Fundamentals",
    filename: "chapter-01-ai-safety-fundamentals.md",
    part: "Foundations of AI Safety",
    partNumber: 1,
    description: "Core concepts and principles of AI safety, including risk categories, the alignment problem, and why safety matters for advanced AI systems.",
  },
  {
    slug: "safety-alignment-research",
    number: 2,
    title: "Alignment Research",
    filename: "chapter-02-alignment-research.md",
    part: "Foundations of AI Safety",
    partNumber: 1,
    description: "Deep dive into alignment research approaches, including value alignment, reward modeling, constitutional AI, and scalable oversight.",
  },
  {
    slug: "safety-interpretability",
    number: 3,
    title: "Interpretability",
    filename: "chapter-03-interpretability.md",
    part: "Foundations of AI Safety",
    partNumber: 1,
    description: "Understanding how neural networks work internally, mechanistic interpretability, feature visualization, and transparency techniques.",
  },
  {
    slug: "safety-evaluation",
    number: 4,
    title: "Evaluation and Benchmarking",
    filename: "chapter-04-evaluation-and-benchmarking.md",
    part: "Safety in Practice",
    partNumber: 2,
    description: "Methods and frameworks for evaluating AI safety, red teaming, benchmarks, and safety testing methodologies.",
  },
  {
    slug: "safety-technical",
    number: 5,
    title: "Technical Safety",
    filename: "chapter-05-technical-safety.md",
    part: "Safety in Practice",
    partNumber: 2,
    description: "Technical approaches to AI safety including robustness, adversarial testing, containment, and monitoring systems.",
  },
  {
    slug: "safety-governance",
    number: 6,
    title: "Governance and Policy",
    filename: "chapter-06-governance-and-policy.md",
    part: "Safety in Practice",
    partNumber: 2,
    description: "AI governance frameworks, international policy, regulation, standards, and institutional approaches to managing AI risks.",
  },
  {
    slug: "safety-organizations",
    number: 7,
    title: "Organizations and Research",
    filename: "chapter-07-organizations-and-research.md",
    part: "Building a Career in Safety",
    partNumber: 3,
    description: "Key AI safety organizations, research labs, funding landscape, and the current state of the safety research ecosystem.",
  },
  {
    slug: "safety-implementation",
    number: 8,
    title: "Practical Implementation",
    filename: "chapter-08-practical-implementation.md",
    part: "Building a Career in Safety",
    partNumber: 3,
    description: "Hands-on guidance for implementing AI safety practices, building safety teams, and integrating safety into product development.",
  },
  {
    slug: "safety-emerging-risks",
    number: 9,
    title: "Emerging Risks",
    filename: "chapter-09-emerging-risks.md",
    part: "The Future of Safety",
    partNumber: 4,
    description: "New and emerging AI safety risks including autonomous agents, multimodal models, open-source challenges, and unforeseen capabilities.",
  },
  {
    slug: "safety-future",
    number: 10,
    title: "Future of AI Safety",
    filename: "chapter-10-future-of-ai-safety.md",
    part: "The Future of Safety",
    partNumber: 4,
    description: "The road ahead for AI safety research, long-term visions, superintelligence considerations, and building a safe AI future.",
  },
];

export function getChapterBySlug(slug: string): Chapter | undefined {
  return CHAPTERS.find((ch) => ch.slug === slug);
}

export function getChaptersByPart(partNumber: number): Chapter[] {
  return CHAPTERS.filter((ch) => ch.partNumber === partNumber);
}
