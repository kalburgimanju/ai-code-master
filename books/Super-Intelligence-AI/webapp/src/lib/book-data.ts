// Book metadata and chapter data for Super Intelligence AI book
// Author: Manjunath Kalburgi

export interface Chapter {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  description: string;
  slug: string;
  part: string;
  estimatedPages: number;
  topics: string[];
  icon: string;
  bookId: string;
}

export interface BookInfo {
  id: string;
  title: string;
  author: string;
  subtitle: string;
  description: string;
  publishedYear: number;
  edition: string;
  totalEstimatedPages: number;
  totalChapters: number;
  color: string;
  accent: string;
}

export const BOOK_INFO: BookInfo = {
  id: "super-intelligence",
  title: "Super Intelligence AI: The Complete Guide",
  author: "Manjunath Kalburgi",
  subtitle: "Understanding, Building, and Controlling the Future of Intelligence",
  description:
    "A comprehensive guide covering the foundations, forms, explosion, development paths, capabilities, optimization, control problem, philosophical implications, research landscape, and roadmap to superintelligence.",
  publishedYear: 2025,
  edition: "First Edition",
  totalEstimatedPages: 200,
  totalChapters: 10,
  color: "#dc2626",
  accent: "#ef4444",
};

export const CHAPTERS: Chapter[] = [
  {
    id: "si-ch-01",
    number: 1,
    title: "Superintelligence Foundations",
    subtitle: "Defining the Concept of Superintelligence",
    description:
      "Explore the foundational concepts of superintelligence — its definition, history, theoretical underpinnings, and why it represents the most significant milestone in the history of intelligence.",
    slug: "si-superintelligence-foundations",
    part: "Part I: Understanding Superintelligence",
    estimatedPages: 20,
    topics: [
      "Defining superintelligence",
      "Historical context and evolution",
      "Theoretical frameworks",
      "Key milestones in AI history",
      "Why superintelligence matters",
    ],
    icon: "🧠",
    bookId: "super-intelligence",
  },
  {
    id: "si-ch-02",
    number: 2,
    title: "Forms of Superintelligence",
    subtitle: "Biological, Digital, and Collective Intelligence",
    description:
      "Understand the different forms superintelligence can take — from biological enhancements to digital minds and collective intelligence systems.",
    slug: "si-forms-of-superintelligence",
    part: "Part I: Understanding Superintelligence",
    estimatedPages: 20,
    topics: [
      "Biological superintelligence",
      "Digital superintelligence",
      "Collective intelligence",
      "Hybrid approaches",
      "Comparative analysis of forms",
    ],
    icon: "🔬",
    bookId: "super-intelligence",
  },
  {
    id: "si-ch-03",
    number: 3,
    title: "The Intelligence Explosion",
    subtitle: "How Recursively Self-Improving AI Could Transform Civilization",
    description:
      "Examine the intelligence explosion hypothesis — how an AI that can improve itself could lead to rapid, unprecedented gains in intelligence.",
    slug: "si-intelligence-explosion",
    part: "Part I: Understanding Superintelligence",
    estimatedPages: 20,
    topics: [
      "The intelligence explosion hypothesis",
      "Recursive self-improvement",
      "Takeoff scenarios",
      "Fast vs. slow takeoff",
      "Implications for civilization",
    ],
    icon: "💥",
    bookId: "super-intelligence",
  },
  {
    id: "si-ch-04",
    number: 4,
    title: "AI Development Paths",
    subtitle: "Routes to Achieving Superintelligence",
    description:
      "Map out the major development paths toward superintelligence — from scaling large language models to brain emulation and whole brain emulation.",
    slug: "si-ai-development-paths",
    part: "Part II: Building Superintelligence",
    estimatedPages: 20,
    topics: [
      "Scaling paradigms",
      "Brain-inspired computing",
      "Whole brain emulation",
      "Hybrid architectures",
      "Compute and infrastructure requirements",
    ],
    icon: "🛤️",
    bookId: "super-intelligence",
  },
  {
    id: "si-ch-05",
    number: 5,
    title: "Superintelligence Capabilities",
    subtitle: "What Superintelligent Systems Could Achieve",
    description:
      "Explore the vast capabilities that superintelligent systems could possess — from scientific discovery to creative problem-solving and beyond.",
    slug: "si-capabilities",
    part: "Part II: Building Superintelligence",
    estimatedPages: 20,
    topics: [
      "Scientific discovery",
      "Creative problem-solving",
      "Strategic planning",
      "Social intelligence",
      "Economic optimization",
    ],
    icon: "🚀",
    bookId: "super-intelligence",
  },
  {
    id: "si-ch-06",
    number: 6,
    title: "Optimization and Goal Systems",
    subtitle: "Alignment of Objectives in Advanced AI",
    description:
      "Delve into the critical challenge of aligning AI goals with human values — optimization processes, utility functions, and value loading.",
    slug: "si-optimization-goals",
    part: "Part II: Building Superintelligence",
    estimatedPages: 20,
    topics: [
      "Optimization theory",
      "Utility functions",
      "Value loading problem",
      "Goodhart's Law",
      "Reward hacking",
    ],
    icon: "🎯",
    bookId: "super-intelligence",
  },
  {
    id: "si-ch-07",
    number: 7,
    title: "The Control Problem",
    subtitle: "Ensuring Safe and Beneficial Superintelligence",
    description:
      "Tackle the central challenge of the control problem — how humanity can maintain meaningful control over systems far more intelligent than ourselves.",
    slug: "si-control-problem",
    part: "Part III: Controlling Superintelligence",
    estimatedPages: 20,
    topics: [
      "The control problem defined",
      "Corrigibility and shutdown",
      "Boxing and containment",
      "Incentive mechanisms",
      "Alignment tax",
    ],
    icon: "🔒",
    bookId: "super-intelligence",
  },
  {
    id: "si-ch-08",
    number: 8,
    title: "Philosophical Implications",
    subtitle: "Ethical, Existential, and Societal Questions",
    description:
      "Examine the profound philosophical questions raised by superintelligence — consciousness, moral status, existential risk, and the future of humanity.",
    slug: "si-philosophical-implications",
    part: "Part III: Controlling Superintelligence",
    estimatedPages: 20,
    topics: [
      "Consciousness and sentience",
      "Moral status of AI",
      "Existential risk",
      "Ethical frameworks",
      "Post-human scenarios",
    ],
    icon: "🤔",
    bookId: "super-intelligence",
  },
  {
    id: "si-ch-09",
    number: 9,
    title: "Research Landscape",
    subtitle: "Current Research Directions and Leading Institutions",
    description:
      "Survey the current research landscape — major institutions, research agendas, breakthroughs, and the collaborative efforts driving progress.",
    slug: "si-research-landscape",
    part: "Part IV: The Road Ahead",
    estimatedPages: 20,
    topics: [
      "Leading research institutions",
      "Key research agendas",
      "Recent breakthroughs",
      "Open problems",
      "Collaborative initiatives",
    ],
    icon: "📊",
    bookId: "super-intelligence",
  },
  {
    id: "si-ch-10",
    number: 10,
    title: "Roadmap to Superintelligence",
    subtitle: "A Practical Guide to the Future",
    description:
      "A practical roadmap for navigating the path to superintelligence — timelines, milestones, investment opportunities, and personal preparation.",
    slug: "si-roadmap",
    part: "Part IV: The Road Ahead",
    estimatedPages: 20,
    topics: [
      "Timeline predictions",
      "Key milestones",
      "Investment and career opportunities",
      "Personal preparation",
      "The future of intelligence",
    ],
    icon: "🗺️",
    bookId: "super-intelligence",
  },
];

export const ALL_CHAPTERS = CHAPTERS;

export const PARTS = [
  {
    title: "Part I: Understanding Superintelligence",
    description: "Build a solid foundation in what superintelligence is and the forms it can take.",
    chapters: CHAPTERS.filter(
      (c) => c.part === "Part I: Understanding Superintelligence"
    ),
  },
  {
    title: "Part II: Building Superintelligence",
    description: "Explore the development paths, capabilities, and optimization challenges of building superintelligence.",
    chapters: CHAPTERS.filter(
      (c) => c.part === "Part II: Building Superintelligence"
    ),
  },
  {
    title: "Part III: Controlling Superintelligence",
    description: "Address the control problem and philosophical implications of creating superintelligence.",
    chapters: CHAPTERS.filter(
      (c) => c.part === "Part III: Controlling Superintelligence"
    ),
  },
  {
    title: "Part IV: The Road Ahead",
    description: "Survey the research landscape and chart a roadmap to the future of intelligence.",
    chapters: CHAPTERS.filter(
      (c) => c.part === "Part IV: The Road Ahead"
    ),
  },
];

export function getChaptersForBook(_bookId: string): Chapter[] {
  return CHAPTERS;
}

export function getBookInfo(_bookId: string): BookInfo {
  return BOOK_INFO;
}
