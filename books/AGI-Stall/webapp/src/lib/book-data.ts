// Book metadata and chapter data for AGI book
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
  id: "agi",
  title: "AGI: The Complete Guide to Artificial General Intelligence",
  author: "Manjunath Kalburgi",
  subtitle: "Understanding, Developing, and Building a Career in Artificial General Intelligence",
  description:
    "A comprehensive guide covering everything from AGI fundamentals to practical development, career preparation, and the future of intelligence.",
  publishedYear: 2025,
  edition: "First Edition",
  totalEstimatedPages: 150,
  totalChapters: 10,
  color: "#6366f1",
  accent: "#8b5cf6",
};

export const CHAPTERS: Chapter[] = [
  {
    id: "agi-ch-01", number: 1, title: "Introduction to AGI",
    subtitle: "What is Artificial General Intelligence?",
    description: "A comprehensive introduction to AGI — its definition, history, current state, and why it matters.",
    slug: "introduction-to-agi", part: "Part I: Foundations", estimatedPages: 15,
    topics: ["Definition and scope of AGI", "History of AI", "AGI vs Narrow AI", "Current state of AGI research", "Key milestones", "The race to AGI"],
    icon: "🧠", bookId: "agi",
  },
  {
    id: "agi-ch-02", number: 2, title: "Core Concepts",
    subtitle: "The Building Blocks of AI and AGI",
    description: "Master the fundamental concepts: machine learning, deep learning, transformers, attention mechanisms, scaling laws.",
    slug: "core-concepts", part: "Part I: Foundations", estimatedPages: 20,
    topics: ["Machine Learning Fundamentals", "Deep Learning Architectures", "NLP & Computer Vision", "Attention Mechanisms", "Scaling Laws", "Chain-of-Thought Reasoning"],
    icon: "⚡", bookId: "agi",
  },
  {
    id: "agi-ch-03", number: 3, title: "AGI Architecture",
    subtitle: "Designing Systems for General Intelligence",
    description: "Explore architectures for AGI: cognitive architectures, memory systems, reasoning, world models, multi-agent approaches.",
    slug: "agi-architecture", part: "Part I: Foundations", estimatedPages: 15,
    topics: ["System Architecture for AGI", "Cognitive Architecture", "Memory Systems", "World Models", "Multi-Agent Systems", "Embodied AI"],
    icon: "🏗️", bookId: "agi",
  },
  {
    id: "agi-ch-04", number: 4, title: "Market Impact",
    subtitle: "How AGI Will Transform Industries and the Economy",
    description: "Understand the massive economic and societal impact of AGI across industries and job markets.",
    slug: "market-impact", part: "Part II: Impact & Applications", estimatedPages: 20,
    topics: ["Industry transformation", "Job market disruption", "Economic impact & GDP", "New job categories", "Ethical considerations", "Startup opportunities"],
    icon: "📈", bookId: "agi",
  },
  {
    id: "agi-ch-05", number: 5, title: "Developing AGI",
    subtitle: "Approaches, Research, and Engineering",
    description: "A deep technical guide to developing AGI — research approaches, training, infrastructure, safety.",
    slug: "developing-agi", part: "Part II: Impact & Applications", estimatedPages: 20,
    topics: ["Development approaches", "Training methodologies", "Compute infrastructure", "Safety research", "Scaling strategies", "Evaluation & benchmarking"],
    icon: "🔧", bookId: "agi",
  },
  {
    id: "agi-ch-06", number: 6, title: "The AGI Engineer's Roadmap",
    subtitle: "A Complete Learning Path",
    description: "A structured roadmap for becoming an AGI engineer — from foundations to advanced research.",
    slug: "engineer-roadmap", part: "Part III: Career", estimatedPages: 15,
    topics: ["Skills required", "Foundations (Python, Math)", "Machine Learning", "Deep Learning", "Advanced ML", "AGI Research"],
    icon: "🗺️", bookId: "agi",
  },
  {
    id: "agi-ch-07", number: 7, title: "Getting Jobs in AGI",
    subtitle: "Landing Your Dream AI Role",
    description: "Navigate the AGI job market — roles, resumes, portfolios, networking, and job search strategies.",
    slug: "getting-jobs", part: "Part III: Career", estimatedPages: 15,
    topics: ["Job market overview", "Types of roles", "Resume building", "Portfolio projects", "Networking strategies", "Companies hiring"],
    icon: "💼", bookId: "agi",
  },
  {
    id: "agi-ch-08", number: 8, title: "Interview Preparation",
    subtitle: "Questions, Answers, and Strategies",
    description: "25+ technical questions with detailed answers, system design, and behavioral interview prep.",
    slug: "interview-preparation", part: "Part III: Career", estimatedPages: 20,
    topics: ["Technical interview questions", "System design", "Behavioral questions", "STAR method", "30-60-90 day plan"],
    icon: "🎯", bookId: "agi",
  },
  {
    id: "agi-ch-09", number: 9, title: "Study Materials",
    subtitle: "Books, Courses, Papers, and Resources",
    description: "A curated collection of 50+ resources: books, papers, courses, channels, and communities.",
    slug: "study-materials", part: "Part IV: Resources", estimatedPages: 15,
    topics: ["Must-read books", "Research papers", "Online courses", "YouTube channels", "Communities", "Newsletters"],
    icon: "📚", bookId: "agi",
  },
  {
    id: "agi-ch-10", number: 10, title: "Example Projects",
    subtitle: "Step-by-Step AGI Project Guides",
    description: "Five complete, hands-on projects with step-by-step implementation guides.",
    slug: "example-projects", part: "Part IV: Resources", estimatedPages: 20,
    topics: ["Custom Chatbot with RAG", "Multi-Agent Task Automation", "Autonomous Coding Assistant", "Vision-Language Model App", "Reinforcement Learning Agent"],
    icon: "🚀", bookId: "agi",
  },
];

// Legacy exports
export const ALL_CHAPTERS = CHAPTERS;

export const PARTS = [
  { title: "Part I: Foundations", description: "Understand what AGI is, how it works, and the architectures behind it.", chapters: CHAPTERS.filter((c) => c.part === "Part I: Foundations") },
  { title: "Part II: Impact & Applications", description: "Explore how AGI will transform industries and how to develop it.", chapters: CHAPTERS.filter((c) => c.part === "Part II: Impact & Applications") },
  { title: "Part III: Career", description: "Navigate your career path, prepare for interviews, and land your dream job.", chapters: CHAPTERS.filter((c) => c.part === "Part III: Career") },
  { title: "Part IV: Resources", description: "Access curated study materials and build real projects.", chapters: CHAPTERS.filter((c) => c.part === "Part IV: Resources") },
];

export function getChaptersForBook(_bookId: string): Chapter[] {
  return CHAPTERS;
}

export function getBookInfo(_bookId: string): BookInfo {
  return BOOK_INFO;
}
