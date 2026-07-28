export interface Course {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  longDescription: string;
  features: string[];
  modules: Module[];
  couponLink: string;
  color: string;
  icon: string;
  // Curriculum specific fields
  outcome?: string;
  audience?: string;
  duration?: string;
  tools?: string[];
  blurb?: string;
  track?: string;
  n?: number;
  image?: string;
}

export interface Module {
  title: string;
  lessons: string[];
}

// Actual curriculum data
export const courses: Course[] = [
  {
    id: "builder",
    title: "AI Builder",
    subtitle: "Create Agents and Voice Agents with n8n",
    description:
      "Perhaps the most satisfying of all my courses. In three intensive weeks you become an expert at building agents with n8n and ElevenLabs.",
    longDescription:
      "Perhaps the most satisfying of all my courses. In three intensive weeks you become an expert at building agents with n8n and ElevenLabs. Technical and non-technical people are astonished by what we achieve. An integrated agentic app that once took weeks now ships in hours. We pack in APIs, agents, context engineering, security and MCP, building several high impact commercial products with a grand finale that leaves you extremely satisfied.",
    features: [
      "Build agents with n8n visual workflow builder",
      "Create voice agents that can speak and listen",
      "Integrate with OpenAI, Anthropic, and other AI APIs",
      "Deploy agents to production with no-code hosting",
      "Build real-world automation workflows",
    ],
    modules: [
      {
        title: "Introduction to AI Agents",
        lessons: [
          "What are AI Agents?",
          "n8n Setup and Configuration",
          "Your First Agent: A Simple Chatbot",
          "Understanding Agent Workflows",
        ],
      },
      {
        title: "Building Text Agents",
        lessons: [
          "Integrating OpenAI GPT Models",
          "Prompt Engineering for Agents",
          "Memory and Context Management",
          "Agent Decision Making",
        ],
      },
      {
        title: "Voice Agents",
        lessons: [
          "Speech-to-Text Integration",
          "Text-to-Speech with ElevenLabs",
          "Building a Voice Assistant",
          "Voice Agent Deployment",
        ],
      },
      {
        title: "Advanced Workflows",
        lessons: [
          "Multi-Agent Systems",
          "Conditional Logic and Branching",
          "Data Processing Pipelines",
          "Deploying Your Agents",
        ],
      },
    ],
    couponLink: process.env.NEXT_PUBLIC_COURSE_AI_BUILDER || "#",
    color: "from-blue-500 to-cyan-500",
    icon: "🤖",
    outcome: "Deliver agents for yourself and your clients",
    audience: "Everyone, from never coded to senior dev",
    duration: "3 weeks",
    tools: ["n8n", "ElevenLabs", "Agents", "Voice Agents", "MCP"],
    blurb:
      "Perhaps the most satisfying of all my courses. In three intensive weeks you become an expert at building agents with n8n and ElevenLabs. Technical and non-technical people are astonished by what we achieve. An integrated agentic app that once took weeks now ships in hours. We pack in APIs, agents, context engineering, security and MCP, building several high impact commercial products with a grand finale that leaves you extremely satisfied.",
    n: 1,
    image: "https://edwarddonner.com/wp-content/uploads/2026/06/builder.jpg",
  },
  {
    id: "aicoder",
    title: "AI Coder",
    subtitle: "Vibe Coder to Agentic Engineer",
    description:
      "Most of my courses use code to make AI agents. This one is the opposite. You use AI agents to make code.",
    longDescription:
      "This course takes you from writing simple prompts to becoming a full agentic engineer who can build complex software systems with the help of AI. You'll learn to use Claude Code, GitHub Copilot, and other cutting-edge tools to accelerate your development workflow.",
    features: [
      "Master Claude Code for software development",
      "Build full-stack applications with AI assistance",
      "Learn agentic coding patterns and best practices",
      "Deploy applications with automated CI/CD",
      "Collaborate with AI agents on complex projects",
    ],
    modules: [
      {
        title: "Vibe Coding Foundations",
        lessons: [
          "Introduction to Vibe Coding",
          "Setting Up Claude Code",
          "Your First AI-Generated Project",
          "Understanding AI Code Generation",
        ],
      },
      {
        title: "Agentic Development Patterns",
        lessons: [
          "Multi-File Project Generation",
          "Code Review with AI",
          "Refactoring and Optimization",
          "Testing AI-Generated Code",
        ],
      },
      {
        title: "Full-Stack AI Development",
        lessons: [
          "Building React Applications",
          "API Development with AI",
          "Database Design and Integration",
          "Authentication and Security",
        ],
      },
      {
        title: "Production Deployment",
        lessons: [
          "CI/CD with GitHub Actions",
          "Containerizing AI Applications",
          "Monitoring and Observability",
          "Scaling Your Applications",
        ],
      },
    ],
    couponLink: process.env.NEXT_PUBLIC_COURSE_AI_CODER || "#",
    color: "from-purple-500 to-pink-500",
    icon: "💻",
    outcome: "Rapidly deliver software with coding agents",
    audience: "Everyone, from new to programming to senior architect",
    duration: "3 weeks",
    tools: ["Claude Code", "Cursor", "Copilot", "Codex", "Antigravity"],
    blurb:
      "Most of my courses use code to make AI agents. This one is the opposite. You use AI agents to make code. A three week rollercoaster. We start gently with Cursor, Copilot, Codex and Antigravity, then build complete products from scratch. Week two gets real with Claude Code: slash commands, checkpoints, MCP, skills and plugins. Raise a Jira issue and watch your agent build it, test it and push it. Week three gets wild with sub agents and multi agents, ten of them working away while you grab a coffee. The capstone will make your jaw drop.",
    n: 2,
    image: "https://edwarddonner.com/wp-content/uploads/2026/06/aicoder.jpg",
  },
  {
    id: "leader",
    title: "AI Leader",
    subtitle: "AI Engineering MLOps Track",
    description:
      "This one is not a course. It is a briefing. A gritty, real world business workshop on generative AI and agents for leaders and founders.",
    longDescription:
      "As an AI Leader, you'll learn how to take AI models from prototype to production. This course covers MLOps best practices, model deployment strategies, team management, and how to drive AI initiatives within organizations.",
    features: [
      "MLOps pipelines and model versioning",
      "Deploying models to cloud platforms",
      "Monitoring and maintaining AI systems",
      "Leading AI teams and initiatives",
      "AI governance and compliance",
    ],
    modules: [
      {
        title: "MLOps Fundamentals",
        lessons: [
          "What is MLOps?",
          "Model Versioning and Tracking",
          "Data Pipeline Management",
          "Experiment Tracking",
        ],
      },
      {
        title: "Production Deployment",
        lessons: [
          "Containerizing AI Models",
          "Kubernetes for ML Workloads",
          "API Gateway and Load Balancing",
          "A/B Testing AI Models",
        ],
      },
      {
        title: "Monitoring and Maintenance",
        lessons: [
          "Model Performance Monitoring",
          "Data Drift Detection",
          "Alerting and Incident Response",
          "Model Retraining Strategies",
        ],
      },
      {
        title: "AI Leadership",
        lessons: [
          "Building AI Teams",
          "AI Strategy and Roadmap",
          "Ethical AI and Governance",
          "Measuring AI ROI",
        ],
      },
    ],
    couponLink: process.env.NEXT_PUBLIC_COURSE_AI_LEADER || "#",
    color: "from-green-500 to-emerald-500",
    icon: "👑",
    outcome: "Deliver commercial impact with AI",
    audience: "Everyone, business and technical",
    duration: "a briefing",
    tools: ["AI Strategy", "AI Delivery", "AI Transformation", "Build an AI business"],
    blurb:
      "This one is not a course. It is a briefing. A gritty, real world business workshop on generative AI and agents for leaders and founders, from early stage startups to global enterprises. No filler consultant decks. Three parts: be an AI strategist, be an AI decision maker, be an AI leader. Each part ends with a concrete toolkit you can put straight into action. It is a super power for engineers too, a way to demonstrate business thinking and a commercial mindset.",
    n: 3,
    image: "https://edwarddonner.com/wp-content/uploads/2026/06/leader.jpg",
  },
  {
    id: "core",
    title: "AI Engineer",
    subtitle: "Foundations of AI Engineering",
    description:
      "An intensive eight week program to build deep LLM expertise.",
    longDescription:
      "The Core Track provides essential knowledge every AI engineer needs. From the fundamentals of machine learning to advanced deep learning architectures, this track ensures you have the theoretical and practical knowledge to succeed in any AI domain.",
    features: [
      "Machine learning fundamentals",
      "Deep learning and neural networks",
      "Python for AI development",
      "Data preprocessing and analysis",
      "Model evaluation and metrics",
    ],
    modules: [
      {
        title: "Python for AI",
        lessons: [
          "Python Basics for Data Science",
          "NumPy and Pandas",
          "Data Visualization with Matplotlib",
          "Working with Jupyter Notebooks",
        ],
      },
      {
        title: "Machine Learning Fundamentals",
        lessons: [
          "Supervised vs Unsupervised Learning",
          "Linear and Logistic Regression",
          "Decision Trees and Random Forests",
          "Model Evaluation Metrics",
        ],
      },
      {
        title: "Deep Learning",
        lessons: [
          "Neural Network Architecture",
          "Convolutional Neural Networks",
          "Recurrent Neural Networks",
          "Transformers and Attention",
        ],
      },
      {
        title: "Applied AI",
        lessons: [
          "Natural Language Processing",
          "Computer Vision Basics",
          "Recommendation Systems",
          "AI Project Workflow",
        ],
      },
    ],
    couponLink: process.env.NEXT_PUBLIC_COURSE_CORE_TRACK || "#",
    color: "from-orange-500 to-red-500",
    icon: "📚",
    outcome: "Select, build and optimize LLMs",
    audience: "Technical and aspiring technical",
    duration: "8 weeks",
    tools: ["OpenAI", "Anthropic", "Gemini", "Hugging Face", "LangChain"],
    blurb:
      "An intensive eight week program to build deep LLM expertise. It begins with APIs and models, then moves through selecting open source models, RAG, fine tuning with QLoRA, and building agent platforms from scratch. It includes seriously meaty commercial projects with a shocking result in week seven. From October 2025 to January 2026 I refreshed every video and lab into a fully updated edition.",
    n: 4,
    track: "Core Track",
    image: "https://edwarddonner.com/wp-content/uploads/2026/06/core.jpg",
  },
  {
    id: "agentic",
    title: "AI Engineer",
    subtitle: "Advanced AI Agents and Multi-Agent Systems",
    description:
      "A six week journey into the most fascinating area of AI right now: autonomous agents.",
    longDescription:
      "The Agentic Track dives deep into the world of AI agents. You'll learn to build sophisticated multi-agent systems that can reason, plan, and execute complex tasks. This track covers the latest research and practical techniques for creating truly autonomous AI systems.",
    features: [
      "Advanced agent architectures",
      "Multi-agent system design",
      "Reasoning and planning algorithms",
      "Agent communication protocols",
      "Autonomous task execution",
    ],
    modules: [
      {
        title: "Agent Architectures",
        lessons: [
          "ReAct and Chain-of-Thought",
          "Tool Use and Function Calling",
          "Memory Systems for Agents",
          "Planning and Reasoning",
        ],
      },
      {
        title: "Multi-Agent Systems",
        lessons: [
          "Agent Communication",
          "Coordination and Negotiation",
          "Role Assignment and Task Distribution",
          "Emergent Behaviors",
        ],
      },
      {
        title: "Advanced Topics",
        lessons: [
          "Reinforcement Learning Agents",
          "LLM-based Planning",
          "Agent Evaluation and Testing",
          "Safety and Alignment",
        ],
      },
      {
        title: "Real-World Applications",
        lessons: [
          "Research Assistant Agents",
          "Coding Assistant Agents",
          "Business Process Automation",
          "Personal AI Assistants",
        ],
      },
    ],
    couponLink: process.env.NEXT_PUBLIC_COURSE_AGENTIC_TRACK || "#",
    color: "from-indigo-500 to-blue-500",
    icon: "🕸️",
    outcome: "Build autonomous agents",
    audience: "Technical and aspiring technical",
    duration: "6 weeks",
    tools: ["OpenAI Agents SDK", "CrewAI", "LangGraph", "AutoGen", "MCP"],
    blurb:
      "A six week journey into the most fascinating area of AI right now: autonomous agents. It covers the OpenAI Agents SDK, CrewAI, LangGraph, AutoGen and MCP, with astounding and occasionally crazy projects. It culminates in a trading floor of equity trader agents, partly coded by a team of software engineering agents. It is mind blowing.",
    n: 5,
    track: "Agentic Track",
    image: "https://edwarddonner.com/wp-content/uploads/2026/06/agentic.jpg",
  },
  {
    id: "production",
    title: "AI Engineer",
    subtitle: "Deploy AI to Production",
    description:
      "In four weeks you will ship full stack AI applications to Vercel, AWS, GCP and Azure.",
    longDescription:
      "The Production Track teaches you everything you need to know to deploy AI systems in production. From containerization and orchestration to monitoring and scaling, you'll learn industry best practices for running AI in the real world.",
    features: [
      "Containerizing AI applications",
      "Cloud deployment strategies",
      "Model serving and inference",
      "Performance optimization",
      "Production monitoring and alerting",
    ],
    modules: [
      {
        title: "Containerization",
        lessons: [
          "Docker for AI Applications",
          "Building Optimized Images",
          "Multi-stage Builds",
          "Container Security",
        ],
      },
      {
        title: "Orchestration",
        lessons: [
          "Kubernetes Basics",
          "Deploying AI Workloads",
          "Auto-scaling Strategies",
          "Resource Management",
        ],
      },
      {
        title: "Model Serving",
        lessons: [
          "Model Serving Frameworks",
          "API Design for AI",
          "Batch vs Real-time Inference",
          "GPU and TPU Optimization",
        ],
      },
      {
        title: "Monitoring and Maintenance",
        lessons: [
          "Logging and Metrics",
          "Performance Monitoring",
          "Error Handling and Retries",
          "Continuous Deployment",
        ],
      },
    ],
    couponLink: process.env.NEXT_PUBLIC_COURSE_PRODUCTION_TRACK || "#",
    color: "from-teal-500 to-green-500",
    icon: "🚀",
    outcome: "Deploy LLMs and agents at scale",
    audience: "Technical",
    duration: "4 weeks",
    tools: ["Vercel", "AWS", "GCP", "Azure", "Bedrock", "SageMaker", "LangFuse"],
    blurb:
      "In four weeks you will ship full stack AI applications to Vercel, AWS, GCP and Azure. You will be comfortable with Docker, Terraform and GitHub Actions, and you will go deep on AWS, including Lambda, App Runner, Bedrock and SageMaker. You will build RAG pipelines, deploy multi agent systems with MCP, and gain core MLOps expertise. You will also ship SaaS applications with user management and subscriptions, all at enterprise grade: scalable, secure, resilient and observable. It is intensive and a little grueling in places, but always immensely satisfying.",
    n: 6,
    track: "Production Track",
    image: "https://edwarddonner.com/wp-content/uploads/2026/06/production.jpg",
  },
];

export const instructor = {
  name: process.env.NEXT_PUBLIC_INSTRUCTOR_NAME || "Manjunath Kalburgi",
  title: process.env.NEXT_PUBLIC_INSTRUCTOR_TITLE || "AI Engineering Instructor",
  bio:
    process.env.NEXT_PUBLIC_INSTRUCTOR_BIO ||
    "I'm a tech leader and entrepreneur with a love for coding and data science.",
  email: process.env.NEXT_PUBLIC_EMAIL || "manjunath@example.com",
  linkedin: process.env.NEXT_PUBLIC_LINKEDIN || "https://linkedin.com/in/kalburgimanju",
  twitter: process.env.NEXT_PUBLIC_TWITTER || "https://x.com/kalburgimanju",
  avatar: "/avatar.png",
};

export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || "The Complete AI Curriculum",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://example.com",
  totalEnrollments: parseInt(
    process.env.NEXT_PUBLIC_TOTAL_ENROLLMENTS || "0",
    10
  ),
  totalCountries: parseInt(
    process.env.NEXT_PUBLIC_TOTAL_COUNTRIES || "0",
    10
  ),
  proficientUrl:
    process.env.NEXT_PUBLIC_PROFICIENT_URL ||
    "https://example.com/proficient/",
  youtubeId: process.env.NEXT_PUBLIC_YOUTUBE_ID || "wqqXAJYpn2s",
};
