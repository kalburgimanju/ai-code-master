# Appendix A: Glossary of Terms

---

## A

**A2A (Agent-to-Agent Protocol)** — An open protocol introduced by Google in 2025 that enables AI agents built on different frameworks to discover, communicate, and collaborate with each other across organizational boundaries.

**Agent** — An AI system that can perceive its environment, make decisions, and take actions to achieve goals autonomously or semi-autonomously. In the context of LLMs, an agent wraps an LLM with tools, memory, and control loops to perform multi-step tasks.

**Agent Card** — A metadata document (typically at `/.well-known/agent.json`) that describes an A2A-compatible agent's capabilities, skills, endpoint, and authentication requirements.

**Agent Loop** — The core execution cycle of an agent: observe → think → act → observe. Also known as the ReAct loop.

**Agentic** — Describes systems or workflows that leverage AI agents to perform tasks autonomously, often involving tool use, planning, and multi-step reasoning.

**Anthropic** — The AI company that created Claude. Provides the Claude API, Claude Code, and the MCP protocol.

**Async/Await** — A programming pattern for handling concurrent operations without blocking. Essential for agent systems that make multiple simultaneous API calls.

**Autonomous Agent** — An agent that can set its own sub-goals, manage its own execution, and recover from failures without human intervention.

---

## B

**Backpressure** — A mechanism for slowing down or rejecting requests when a system is overloaded, preventing cascading failures.

**Benchmark** — A standardized test or evaluation suite used to measure agent performance against known metrics.

**Budget Manager** — A component that tracks token usage and API costs, preventing runaway spending.

---

## C

**Caching (Prompt)** — The practice of reusing precomputed KV-cache states for repeated prompt prefixes, significantly reducing input token costs.

**Chain-of-Thought (CoT)** — A prompting technique where the model is encouraged to show its reasoning step by step before providing a final answer.

**Circuit Breaker** — A resilience pattern that detects when a downstream service is failing and temporarily stops calling it, preventing cascading failures.

**Claude** — A family of large language models created by Anthropic, including Claude Haiku, Sonnet, and Opus variants.

**Claude Code** — Anthropic's CLI tool for AI-assisted coding, providing an agentic interface for software development tasks.

**Context Engineering** — The discipline of designing what information goes into an LLM's context window, including system prompts, tools, memory, and conversation history.

**Context Window** — The maximum number of tokens an LLM can process in a single request, including both input and output.

**Continuous Batching** — A serving technique where inference requests are dynamically grouped and processed together, improving GPU utilization.

**Conversation History** — The sequence of user and assistant messages in a multi-turn interaction.

---

## D

**DAG (Directed Acyclic Graph)** — A graph structure with directed edges and no cycles, used to model task dependencies in planning agents.

**Deduplication** — The process of identifying and removing duplicate results, findings, or data points.

**Deployment** — The process of making an agent system available for production use, including infrastructure setup, configuration, and monitoring.

**Embedding** — A dense vector representation of text or data, used for semantic search, similarity comparison, and retrieval.

---

## E

**Edge Deployment** — Running inference or agent logic on infrastructure geographically close to users to reduce latency.

**Episodic Memory** — Memory of specific past events and experiences, as opposed to general knowledge.

**Eval (Evaluation)** — A systematic process for measuring agent performance using predefined metrics, test cases, and quality criteria.

**Extended Thinking** — A Claude feature where the model uses additional internal reasoning tokens before generating a response, improving quality on complex tasks.

---

## F

**Fact Grounding** — The practice of anchoring agent responses in verifiable facts from retrieved sources rather than relying solely on the model's training data.

**Fan-out/Fan-in** — A parallel processing pattern where a task is split into subtasks (fan-out), processed independently, and then combined (fan-in).

**Few-Shot Prompting** — Including a small number of examples in the prompt to guide the model's output format and behavior.

**Function Calling** — The ability of an LLM to generate structured calls to predefined functions or tools, rather than just text.

---

## G

**GDPR (General Data Protection Regulation)** — European Union regulation governing data privacy and protection, relevant to agents processing personal data.

**Graceful Degradation** — The ability of a system to continue operating at reduced functionality when components fail, rather than failing completely.

**Grounding** — Connecting an LLM's output to factual, verifiable sources to reduce hallucination.

---

## H

**Hallucination** — When an LLM generates plausible-sounding but factually incorrect or fabricated information.

**Harness Engineering** — The discipline of building the scaffolding, guardrails, and control systems that wrap around an LLM to make it behave reliably in production.

**Health Check** — A periodic test that verifies a service is running and responsive, used for load balancing and automatic restarts.

**HIPAA (Health Insurance Portability and Accountability Act)** — US regulation governing the protection of health information, relevant to healthcare agents.

---

## I

**Inference** — The process of running input through a trained model to generate output. In the context of LLMs, it means generating text (or tool calls) from prompts.

**Input-Required** — An A2A task state indicating the remote agent needs more information before it can continue.

**Integration Test** — A test that verifies multiple components work together correctly, often involving real external services.

---

## J

**JSON-RPC** — A remote procedure call protocol encoded in JSON, used as the wire format for A2A communication.

**JWT (JSON Web Token)** — A compact, URL-safe means of representing claims between two parties, commonly used for API authentication.

---

## K

**K-V Cache** — Key-Value cache, a technique for storing intermediate attention states during LLM inference to avoid redundant computation.

---

## L

**Latency** — The time between a request and the corresponding response. Critical for user experience in interactive agent systems.

**LLM (Large Language Model)** — A neural network trained on large text corpora that can generate, understand, and reason about natural language.

**LLM-as-Judge** — Using an LLM to evaluate the output of another LLM, commonly used in agent evaluation pipelines.

**Load Balancer** — A component that distributes incoming requests across multiple service instances to improve throughput and reliability.

**Long-Context Model** — An LLM with a large context window (100K+ tokens), enabling processing of extensive documents or long conversations.

---

## M

**MCP (Model Context Protocol)** — An open protocol created by Anthropic for connecting AI models to external data sources, tools, and services through a standardized client-server interface.

**Memory Taxonomy** — A classification of different memory types in agent systems: short-term, long-term, episodic, semantic, and procedural.

**Microservices** — An architectural style where an application is composed of small, independent services that communicate over a network.

**Model Router** — A component that selects the most appropriate LLM for a given task based on complexity, cost, and capability requirements.

**Multi-Agent System** — A system composed of multiple AI agents that collaborate, communicate, or compete to solve complex tasks.

---

## N

**Negative Prompting** — Instructing a model what NOT to do, complementing positive instructions about desired behavior.

---

## O

**Observability** — The ability to understand the internal state of a system from its external outputs, achieved through logging, metrics, and tracing.

**One-Shot Prompting** — Including a single example in the prompt to guide the model's output format.

**Orchestration** — The coordination of multiple agents or components to accomplish complex tasks, managing dependencies, parallelism, and result synthesis.

---

## P

**Parallel Execution** — Running multiple tasks simultaneously to reduce overall completion time.

**Partial JSON Parsing** — Parsing incomplete JSON data as it streams in, enabling early processing before the full response is available.

**PII (Personally Identifiable Information)** — Data that can identify a specific individual, requiring special handling for privacy compliance.

**Planning Agent** — An agent that explicitly generates a multi-step plan before executing actions, rather than deciding one step at a time.

**POCO (Plain Old CLR Object)** — A simple class without special behavior, used to represent data structures. (Analogous to POJO in Java.)

**Prompt** — The input text provided to an LLM to guide its generation. Includes system prompts, user messages, and tool results.

**Prompt Compression** — Techniques for reducing the number of tokens in a prompt while preserving its essential meaning.

**Push Notification** — In A2A, a mechanism for remote agents to notify clients of task completion without requiring polling.

---

## Q

**Quantization** — Reducing the numerical precision of model weights (e.g., from FP16 to INT4) to decrease memory usage and increase inference speed.

**Query** — A request or search term used to retrieve information from a knowledge base, database, or search engine.

---

## R

**Rate Limiting** — Controlling the rate of requests to prevent abuse and ensure fair resource allocation.

**ReAct (Reason + Act)** — A prompting pattern where an LLM alternates between reasoning about what to do and taking actions via tool calls.

**Reflection** — The process where an agent evaluates its own output before presenting it, catching errors and improving quality.

**Registry** — A central service for discovering and matchmaking A2A-compatible agents.

**Retrieval-Augmented Generation (RAG)** — A technique that enhances LLM output by retrieving relevant documents or data before generating a response.

**Retry Logic** — A resilience pattern that automatically retries failed operations, typically with exponential backoff.

**ROI (Return on Investment)** — A measure of the benefit gained relative to the cost incurred, used to prioritize optimization efforts.

---

## S

**Sandbox** — An isolated environment for executing potentially dangerous operations (like code execution) without affecting the host system.

**SDK (Software Development Kit)** — A collection of tools, libraries, and documentation for building applications on a platform (e.g., Anthropic SDK for Claude API).

**Semantic Search** — Searching for information based on meaning rather than exact keyword matching, typically using embeddings.

**Semaphore** — A synchronization primitive used to control access to a shared resource, commonly used for limiting concurrent operations.

**Single-Agent Architecture** — An agent system with one LLM reasoning loop, as opposed to multi-agent systems.

**SSE (Server-Sent Events)** — A standard for pushing real-time updates from server to client over HTTP, used for streaming agent responses.

**Streaming** — Delivering LLM output token-by-token as it's generated, reducing perceived latency.

**Structured Output** — Agent responses in a predefined format (JSON, YAML) rather than free-form text, enabling reliable downstream processing.

**Supervisor Pattern** — A multi-agent architecture where a coordinator agent delegates tasks to specialist agents and synthesizes results.

**System Prompt** — Instructions provided to the LLM before the conversation begins, defining the agent's role, capabilities, and constraints.

---

## T

**Task** — A unit of work in A2A, representing a delegated action with a defined lifecycle (submitted → working → completed/failed).

**Temperature** — A parameter controlling the randomness of LLM output. Lower values produce more deterministic output; higher values produce more creative output.

**Token** — The basic unit of text processing in LLMs. Approximately 4 characters in English. Both input and output are measured in tokens.

**Token Budget** — A limit on the number of tokens an agent can use per request or per session, controlling cost and latency.

**Tool** — An external function or service that an LLM can call to interact with the world (e.g., search, code execution, database queries).

**Tool Call** — A structured request from the LLM to execute a specific tool with provided arguments.

**Tool Description** — Metadata about a tool that helps the LLM decide when and how to use it, including name, description, and parameter schema.

**Tool Registry** — A central component that maps tool names to their implementations and manages tool metadata.

**Trace** — A record of the sequence of operations in a distributed system, used for debugging and performance analysis.

---

## U

**Underfitting** — When a model fails to capture the underlying patterns in data, producing poor results. In agent context, an insufficiently capable model for a given task.

---

## V

**Validation** — The process of verifying that agent output meets expected criteria, including format, correctness, and safety.

**Vector Database** — A database optimized for storing and searching high-dimensional vectors (embeddings), used for semantic search and retrieval.

---

## W

**Workflow** — A predefined sequence of steps or agents orchestrated to accomplish a complex task, often with branching logic and error handling.

---

## Y

**Zero-Shot Prompting** — Prompting an LLM to perform a task without providing any examples, relying entirely on the model's training.

---

*This glossary covers terms used throughout this book. For protocol-level definitions, see the respective specification documents for MCP and A2A.*
