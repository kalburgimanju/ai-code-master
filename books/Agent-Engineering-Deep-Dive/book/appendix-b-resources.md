# Appendix B: Key Papers and Resources

---

## Foundational Papers

### ReAct and Tool Use

- **Yao, S. et al. (2023).** "ReAct: Synergizing Reasoning and Acting in Language Models." *ICLR 2023.* — The foundational paper introducing the ReAct pattern that interleaves reasoning traces with action execution.

- **Schick, T. et al. (2024).** "Toolformer: Language Models Can Teach Themselves to Use Tools." *NeurIPS 2023.* — Demonstrates that LLMs can learn to use tools autonomously through self-supervised training.

- **Parisi, A. et al. (2023).** "TALM: Tool Augmented Language Models." *arXiv.* — Describes augmenting language models with tool-calling capabilities for mathematical reasoning and knowledge retrieval.

### Reasoning and Planning

- **Wei, J. et al. (2022).** "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models." *NeurIPS 2022.* — Introduced chain-of-thought prompting, showing that step-by-step reasoning dramatically improves performance on complex tasks.

- **Wang, L. et al. (2023).** "Self-Consistency Improves Chain of Thought Reasoning in Language Models." *ICLR 2023.* — Demonstrates that sampling multiple reasoning paths and selecting the most consistent answer improves accuracy.

- **Lightman, H. et al. (2023).** "Let's Verify Step by Step." *ICLR 2024.* — Shows that process-based reward models outperform outcome-based models for mathematical reasoning verification.

- **Yao, S. et al. (2024).** "Tree of Thoughts: Deliberate Problem Solving with Large Language Models." *NeurIPS 2023.* — Extends chain-of-thought to tree-structured exploration of reasoning paths.

### Multi-Agent Systems

- **Wu, Q. et al. (2023).** "AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversation." *arXiv.* — Introduces AutoGen, a framework for building multi-agent conversational systems.

- **Hong, S. et al. (2023).** "MetaGPT: Meta Programming for A Multi-Agent Collaborative Framework." *ICLR 2024.* — Proposes a multi-agent framework that assigns specific roles to agents based on software engineering practices.

- **Shinn, N. et al. (2023).** "Reflexion: Language Agents with Verbal Reinforcement Learning." *NeurIPS 2023.* — Introduces verbal reinforcement learning where agents learn from self-reflection.

### Evaluation and Benchmarking

- **Zhong, W. et al. (2024).** "AgentBench: Evaluating LLMs as Agents." *ICLR 2024.* — A comprehensive benchmark for evaluating LLM agents across diverse environments.

- **Wang, G. et al. (2024).** "Voyager: An Open-Ended Embodied Agent with Large Language Models." *NeurIPS 2023.* — Demonstrates open-ended learning in Minecraft using LLM-powered agents with skill libraries.

- **Liu, X. et al. (2023).** "AgentBench: A Comprehensive Benchmark for Evaluating LLMs as Agents." *arXiv.* — Extended evaluation framework covering reasoning, tool use, and embodied tasks.

### Memory and Retrieval

- **Lewis, P. et al. (2020).** "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks." *NeurIPS 2020.* — The foundational RAG paper combining retrieval and generation.

- **Zhong, W. et al. (2024).** "MemoryBank: Enhancing Large Language Models with Long-Term Memory." *AAAI 2024.* — Proposes persistent memory systems for LLMs using a forgetting curve model.

- **Xu, P. et al. (2023).** "Raise a Child in Large Language Model: Towards Effective and Generalizable Fine-tuning." *arXiv.* — Demonstrates lifelong learning approaches for maintaining agent knowledge.

### Prompt Engineering

- **White, J. et al. (2023).** "A Prompt Pattern Catalog to Enhance Prompt Engineering with ChatGPT." *arXiv.* — A catalog of prompt engineering patterns for various use cases.

- **Zhou, Y. et al. (2023).** "Large Language Models Are Human-Level Prompt Engineers." *ICLR 2024.* — Shows that LLMs can automatically optimize their own prompts.

- **Mu, J. et al. (2024).** "The Unlocking Spell on Base LLMs: Rethinking Alignment via In-Context Learning (ACL 2024)." — Explores how base LLMs can be improved through context without fine-tuning.

---

## Protocol Specifications

### Model Context Protocol (MCP)

- **Anthropic (2024).** "Model Context Protocol Specification." https://spec.modelcontextprotocol.io — The official MCP specification defining the client-server protocol for connecting AI models to tools and data.

- **Anthropic (2024).** "MCP: An Open Protocol for Connecting AI Models to External Data Sources." Blog post announcing MCP and its design principles.

### Agent-to-Agent Protocol (A2A)

- **Google (2025).** "Agent2Agent Protocol (A2A)." https://github.com/google/A2A — The open specification for agent-to-agent communication, including agent cards, task lifecycle, and transport mechanisms.

---

## Frameworks and Tools

### Agent Frameworks

- **LangChain** (https://github.com/langchain-ai/langchain) — A framework for building LLM-powered applications with chains, agents, and retrieval.

- **LangGraph** (https://github.com/langchain-ai/langgraph) — A library for building stateful, multi-actor applications with LLMs using graph-based workflows.

- **CrewAI** (https://github.com/joaomdmoura/crewAI) — A framework for orchestrating role-playing AI agents that collaborate to accomplish tasks.

- **AutoGen** (https://github.com/microsoft/autogen) — Microsoft's framework for building multi-agent conversational AI systems.

- **Dspy** (https://github.com/stanfordnlp/dspy) — A framework for programming (not prompting) foundation models, with modules for reasoning and retrieval.

### MCP Implementations

- **Anthropic MCP Servers** (https://github.com/modelcontextprotocol/servers) — Official collection of MCP servers for filesystem, GitHub, PostgreSQL, and more.

- **MCP TypeScript SDK** (https://github.com/modelcontextprotocol/typescript-sdk) — Official TypeScript SDK for building MCP clients and servers.

- **MCP Python SDK** (https://github.com/modelcontextprotocol/python-sdk) — Official Python SDK for building MCP clients and servers.

### Evaluation Tools

- **Inspect AI** (https://github.com/UKGovernmentBEIS/inspect_ai) — A framework for evaluating AI agents with standardized benchmarks and metrics.

- **DeepEval** (https://github.com/confident-ai/deepeval) — An open-source evaluation framework for LLM applications with built-in metrics.

- **Ragas** (https://github.com/explodinggradients/ragas) — Evaluation framework specifically for RAG (Retrieval-Augmented Generation) systems.

### Infrastructure

- **vLLM** (https://github.com/vllm-project/vllm) — A high-throughput LLM serving engine with continuous batching and PagedAttention.

- **TensorRT-LLM** (https://github.com/NVIDIA/TensorRT-LLM) — NVIDIA's library for optimizing and deploying LLMs on GPUs.

- **Ollama** (https://github.com/ollama/ollama) — A tool for running LLMs locally, supporting various open-source models.

---

## API References

- **Anthropic API Reference** (https://docs.anthropic.com/en/api) — Complete documentation for the Claude API, including messages, tool use, and streaming.

- **OpenAI API Reference** (https://platform.openai.com/docs/api-reference) — Documentation for GPT models and the OpenAI API.

- **Google AI API Reference** (https://ai.google.dev/docs) — Documentation for Gemini models and the Google AI API.

---

## Courses and Tutorials

- **Anthropic's Prompt Engineering Interactive Tutorial** (https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering) — Interactive notebook-based tutorial covering prompt engineering techniques.

- **DeepLearning.AI "AI Agentic Systems"** (https://www.deeplearning.ai/) — Andrew Ng's courses on building AI agents and agentic workflows.

- **LangChain Documentation** (https://python.langchain.com/docs/) — Comprehensive tutorials and guides for building LLM applications.

---

## Blogs and Research Groups

- **Anthropic Research** (https://www.anthropic.com/research) — Anthropic's research publications on AI safety and capabilities.

- **Google DeepMind Blog** (https://deepmind.google/discover/blog/) — Research updates from Google DeepMind on AI and agent systems.

- **OpenAI Blog** (https://openai.com/blog) — OpenAI's research publications and product updates.

- **Simon Willison's Blog** (https://simonwillison.net/) — Extensive coverage of LLM tools, APIs, and practical applications.

- **Lilian Weng's Blog** (https://lilianweng.github.io/) — In-depth technical blog posts on LLM agents, prompting, and AI systems.

---

## Books

- **Building LLM Apps** by Valentina Alto (2024) — Practical guide to building production applications with large language models.

- **AI Engineering** by Chip Huyen (2024) — Comprehensive coverage of building AI systems, from data pipelines to deployment.

- **Designing Machine Learning Systems** by Chip Huyen (2022) — Foundational text on ML system design principles applicable to agent systems.

---

## Communities

- **Anthropic Discord** — Community discussions about Claude, MCP, and agent development.

- **LangChain Discord** — Community support for LangChain and LangGraph developers.

- **r/LocalLLaMA** (Reddit) — Community for running and optimizing open-source LLMs locally.

---

## Version History

This appendix was compiled as of July 2026. The field of agent engineering evolves rapidly — check the respective repositories and websites for the latest updates.

| Resource | Last Verified |
|---|---|
| MCP Specification | July 2026 |
| A2A Protocol | July 2026 |
| Anthropic API | July 2026 |
| Framework versions | July 2026 |

---

*End of Appendix B. Thank you for reading Agent Engineering Deep Dive.*
