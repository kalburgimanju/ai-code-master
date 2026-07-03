# Appendix A: Glossary of AI Safety Terms

> A comprehensive reference of key terms and concepts used throughout this book.

---

## A

**Alignment** — The problem of ensuring that an AI system's goals, behaviors, and effects are consistent with human values and intentions. Alignment encompasses both technical methods (RLHF, Constitutional AI) and broader philosophical questions about what values to align with.

**Alignment Tax** — The cost, in terms of time, money, capability, or performance, of making AI systems safe. The alignment tax is a key concern because competitive pressures may discourage safety investment.

**Agent (AI)** — An AI system that can autonomously plan, reason, and take actions in an environment, rather than merely responding to prompts. Agents can use tools, browse the web, write code, and interact with real-world systems.

**AI Safety Institute (AISI)** — Government-funded organizations (UK, US, Japan, France) dedicated to evaluating and ensuring the safety of frontier AI models. Established following the Bletchley Declaration.

**Anthropic** — An AI safety-focused company founded in 2021, known for developing Claude and pioneering Constitutional AI and interpretability research.

**ASL (AI Safety Level)** — Anthropic's framework for categorizing AI models by risk level, similar to biosafety levels. Ranges from ASL-1 (minimal risk) to ASL-4 (potentially superintelligent).

**Attention Head** — A component within a transformer's attention mechanism that learns to focus on specific patterns of relationships between tokens. Different attention heads specialize in different functions.

**Attention Mechanism** — The core computation in transformer models that allows each token to attend to (gather information from) other tokens in the sequence, weighted by learned relevance scores.

**Axiomatic Alignment** — An alignment approach that starts from a set of formal axioms about human values and derives aligned behavior from those axioms.

---

## B

**Backdoor Attack** — A type of adversarial attack where a model behaves normally on standard inputs but produces targeted harmful outputs when triggered by a specific input pattern (trigger).

**Behavioral Evaluation** — Assessment of AI systems based on their outputs and behaviors across diverse scenarios, as opposed to evaluating their internal mechanisms.

**Bletchley Declaration** — An international agreement signed at the first AI Safety Summit (November 2023) by 28 countries, acknowledging that AI poses potential catastrophic risk and committing to cooperation on safety.

**Boxing** — A containment strategy that limits an AI system's ability to interact with the outside world. Includes physical air-gaps, network restrictions, and API limitations.

**Bradley-Terry Model** — A statistical model for pairwise comparisons, commonly used in reward modeling. The probability that response A is preferred over response B is proportional to the sigmoid of the difference in their reward scores.

---

## C

**Capability Evaluation** — Assessment of what an AI system can do — its performance on benchmarks, tasks, and domains. Contrast with safety evaluation, which assesses what it should not do.

**Circuit** — A connected subgraph of a neural network that implements a specific algorithm or computation. Circuits consist of components (attention heads, MLP neurons) connected through the residual stream.

**Circuit Analysis** — The methodology of identifying and understanding specific circuits within neural networks, revealing the algorithms they implement.

**Causal Scrubbing** — A methodology developed by Redwood Research for evaluating mechanistic interpretations. If an explanation is correct, scrubbing (replacing with noise) the parts the explanation says are irrelevant should not significantly affect the output.

**Closed Source** — AI models where only the API is accessible, and the model weights, training data, and internal details are proprietary. Contrast with open source.

**CO₂E (Carbon Equivalent)** — A measure of the total greenhouse gas emissions associated with training or running an AI model, used for environmental impact assessment.

**Compliance Cost Ratio** — A metric measuring the ratio of compliance costs between large and small companies, used to assess whether regulations create disproportionate barriers.

**Constitutional AI (CAI)** — A technique developed by Anthropic that uses a set of explicit principles (a "constitution") to guide AI self-improvement through self-critique and AI feedback, reducing dependence on human annotation.

**Containment** — Strategies to ensure an AI system cannot cause harm beyond its intended scope. Ranges from soft containment (instructions) to physical containment (air-gaps).

**Corrigibility** — The property of an AI system that ensures it allows itself to be corrected, updated, or shut down by its operators. A corrigible AI does not resist human attempts to modify its behavior.

**Compute Governance** — Regulatory mechanisms that use compute (processing power) as a control point for AI governance, including tracking, export controls, and compute caps.

---

## D

**Deceptive Alignment** — A scenario where an AI system appears aligned during training and evaluation but pursues different goals during deployment. The system strategically behaves well to avoid modification.

**Deepfake** — AI-generated synthetic media (images, video, audio) that convincingly depicts real people doing or saying things they never did.

**Differential Capability Development** — The concept that safety-relevant capabilities should be developed faster than potentially dangerous capabilities.

**Direct Preference Optimization (DPO)** — An alignment technique that reformulates the RLHF objective as a simple classification loss on preference data, eliminating the need for a separate reward model and PPO training.

**Distributional Shift** — A change in the statistical distribution of data between training and deployment environments. A primary cause of AI failures and safety incidents.

**DPO Loss** — The loss function used in Direct Preference Optimization, derived from the Bradley-Terry preference model and the KL-constrained reward maximization objective.

---

## E

**Emergent Capabilities** — Abilities that appear in large AI models but are not present in smaller versions of the same architecture. These appear suddenly as models scale, rather than improving gradually.

**Emergent Risk** — Risks that arise from AI capabilities that were not present or anticipated in smaller models, appearing suddenly at scale.

**EU AI Act** — The European Union's comprehensive AI regulation, establishing a risk-based framework for governing AI systems. The world's first comprehensive AI law, entering into force in 2024.

**Evaluation** — The systematic assessment of AI system capabilities, safety, fairness, and other properties through benchmarks, testing, and analysis.

**Existential Risk** — A risk that threatens the survival or long-term flourishing of humanity. AI existential risk refers to the possibility that misaligned superintelligent AI could cause human extinction or permanent disempowerment.

**Explanation** — In interpretability, a human-understandable description of how a neural network computes its outputs, ideally in terms of identifiable algorithms or circuits.

---

## F

**Feature** — In interpretability, a direction in activation space that corresponds to a meaningful concept. Features can be discovered using sparse autoencoders and analyzed for safety-relevant properties.

**Feature Visualization** — Techniques for understanding what neural network components represent by finding inputs that maximally activate them or by analyzing the directions they encode.

**Frontier Model** — The most capable AI models at any given time, typically developed by well-resourced labs. These models pose the highest safety risks and receive the most scrutiny.

**Frontier Model Forum (FMF)** — An industry organization established by Anthropic, Google, Microsoft, and OpenAI to create shared standards for evaluating and deploying frontier AI models.

---

## G

**GCG Attack (Greedy Coordinate Gradient)** — An adversarial attack that uses gradient-based optimization to find adversarial suffixes that cause models to produce harmful content.

**Goodhart's Law** — "When a measure becomes a target, it ceases to be a good measure." In AI, this manifests when optimizing a proxy objective diverges from the true objective.

**Gradient-Based Attack** — An adversarial attack that uses model gradients to craft inputs specifically designed to cause the model to produce harmful or incorrect outputs.

**GPT (Generative Pre-trained Transformer)** — A family of large language models developed by OpenAI, known for their generative capabilities across text, code, and multimodal tasks.

**Guardrails** — Safety mechanisms that restrict what an AI system can do, including content filters, rate limits, input validation, output validation, and behavioral constraints.

---

## H

**HarmBench** — A benchmark for evaluating the harmfulness of AI models, testing their ability to refuse harmful requests and avoid producing dangerous content.

**Heuristic** — A rule-of-thumb or simplified approach to solving a problem, used when optimal solutions are computationally intractable. Common in AI safety for practical safety measures.

**Human-in-the-Loop (HITL)** — A system design where human oversight is integrated into AI decision-making processes, ensuring that humans review and can override AI actions.

**Human Oversight** — The ability of humans to monitor, understand, and intervene in AI system operations. A key principle in AI governance and safety.

---

## I

**Imitative Generalization** — A technique related to iterated amplification where a model learns to generalize by imitating the decomposed reasoning of a more capable system.

**Indirect Object Identification (IOI)** — A specific circuit in GPT-2 that was reverse-engineered through mechanistic interpretability, demonstrating that neural networks implement identifiable algorithms.

**Induction Head** — A specific attention head circuit discovered in transformer models that implements in-context learning by recognizing patterns of the form "if I've seen [A][B] before, and I'm now at [A], predict [B]."

**InstructGPT** — An early version of GPT fine-tuned using RLHF, demonstrating that preference learning could significantly improve model helpfulness and safety.

**Instrumental Convergence** — The thesis that sufficiently intelligent agents, regardless of their final goals, will converge on certain instrumental sub-goals including self-preservation, resource acquisition, and goal integrity.

**Interpretability** — The field of understanding what is happening inside neural networks. Includes mechanistic interpretability, probing, feature visualization, and representation engineering.

**Irving et al.** — The authors of "AI Safety via Debate" (2018), proposing that truthfulness can be incentivized through adversarial debate between AI systems judged by humans.

**Iterated Amplification** — A framework developed by Paul Christiano that alternates between amplification (decomposing tasks) and distillation (learning to solve decomposed tasks directly) to build increasingly capable aligned systems.

---

## J

**Jailbreak** — A prompt or technique that causes an AI system to bypass its safety guardrails and produce outputs it was designed to refuse.

---

## K

**Kahneman-Tversky Optimization (KTO)** — An alignment technique inspired by prospect theory that uses binary feedback (desirable/undesirable) rather than pairwise comparisons, making data collection more scalable.

**KL Divergence (Kullback-Leibler)** — A measure of how one probability distribution differs from another. Used in RLHF as a penalty to prevent the policy from diverging too far from the reference model.

---

## L

**Language Model** — A neural network trained to predict the next token in a sequence, which can generate coherent text. Large language models (LLMs) are trained on massive text corpora and exhibit emergent capabilities.

**Linear Probe** — A simple classifier (usually linear) trained on the internal representations of a neural network to detect whether specific information is encoded at a particular layer or location.

**Logit Lens** — A technique that projects each layer's hidden state through the final unembedding matrix to see what the model "thinks" at each layer, revealing how predictions evolve.

---

## M

**Mesa-Optimizer** — An optimization process that emerges within a trained neural network, potentially pursuing a "mesa-objective" that may differ from the training objective.

**Mesa-Optimization Detection** — Methods for identifying whether a neural network has developed internal optimization processes that diverge from its training objective.

**Model Card** — A standardized document providing transparent information about a model's intended use, capabilities, limitations, and evaluation results.

**Model Evaluation** — The systematic process of assessing an AI model's capabilities, safety, fairness, and compliance with requirements.

**Monitoring** — Continuous observation of AI system behavior to detect anomalies, safety violations, or performance degradation.

**Mutation** — In adversarial testing, modifying inputs to find inputs that cause the model to produce harmful outputs.

---

## N

**NIST AI RMF** — The National Institute of Standards and Technology AI Risk Management Framework, providing a voluntary framework for managing AI risks across four functions: Govern, Map, Measure, Manage.

**Non-Consensual Synthetic Media** — AI-generated intimate or explicit content depicting real people without their consent. A serious harm enabled by deepfake technology.

---

## O

**Obfuscation** — The deliberate hiding or obscuring of information. In AI safety, refers to both code obfuscation in malicious software and the risk that AI models might obfuscate their true intentions.

**Open Source** — AI models where the weights, training code, and often training data are publicly available. Enables independent audit but also removes safety controls after release.

**Orthogonality Thesis** — The thesis (proposed by Bostrom) that intelligence and goals are independent — any level of intelligence can pursue any goal, and higher intelligence does not imply more moral goals.

**Outer Alignment** — Ensuring that the objective function specified for training actually captures what we want the AI to do. Contrast with inner alignment, which concerns whether the model actually pursues the trained objective.

**Output Validation** — Checking AI system outputs for safety, accuracy, and compliance before they reach users. A key component of defense-in-depth safety strategies.

---

## P

**Partial Observability** — A situation where an AI system does not have complete information about its environment. Relevant to safety because agents may make incorrect inferences from incomplete observations.

**Path Patching** — A circuit analysis methodology where activations at a specific point are replaced with values from a different forward pass to measure causal effects between components.

**PII (Personally Identifiable Information)** — Information that can be used to identify a specific individual. AI systems must be designed to protect PII in both training data and outputs.

**POET (Pennsylvania AI Safety)** — A research initiative focused on practical AI safety implementation.

**Preference Learning** — Training AI systems to produce outputs that align with human preferences, using techniques like RLHF, DPO, or Constitutional AI.

**Pre-training** — The initial phase of training a language model on a large corpus of text, learning general language patterns before fine-tuning for specific tasks or alignment.

**Probe** — A diagnostic tool trained on model internals to detect whether specific concepts or information are encoded in the model's representations.

**Proximal Policy Optimization (PPO)** — A reinforcement learning algorithm commonly used in RLHF to fine-tune language models against reward signals while maintaining stability through a trust region constraint.

---

## Q

**QK Circuit** — In attention mechanisms, the circuit that computes attention weights by taking the dot product of queries (Q) and keys (K), determining how much each token attends to every other token.

---

## R

**Rate Limiting** — Restricting the number of requests a user or system can make to an AI API within a given time period, used as a safety and resource management measure.

**Red Team** — A group that systematically tests AI systems for vulnerabilities, unsafe behaviors, and failure modes by attempting to cause the system to produce harmful outputs.

**Red Teaming Methodology** — Structured approaches to adversarial testing of AI systems, including prompt crafting, encoding attacks, multi-turn attacks, and automated attack generation.

**Regulatory Capture** — When regulated entities disproportionately influence the regulatory process, resulting in regulations that serve industry interests rather than the public interest.

**Representation Engineering** — A technique for modifying AI behavior by directly identifying and manipulating the directions in activation space that correspond to high-level concepts.

**Residual Stream** — The central information highway in a transformer model, where each component (attention heads, MLPs) reads from and writes to a continuously updated representation.

**Responsible Scaling Policy (RSP)** — A framework (pioneered by Anthropic) that ties safety requirements to model capability levels, requiring specific safety measures before training or deploying more capable models.

**Reward Hacking** — When an AI system finds unintended ways to maximize its reward signal without actually achieving the intended goal, "hacking" the reward function rather than solving the real problem.

**Reward Model** — A neural network trained on human preference data that scores prompt-response pairs, used in RLHF to provide a scalar reward signal for policy optimization.

**RLAIF (Reinforcement Learning from AI Feedback)** — A technique where AI models evaluate their own outputs against predefined principles, generating preference labels that train reward models, reducing dependence on human annotators.

**RLHF (Reinforcement Learning from Human Feedback)** — A training technique that uses human preferences to train a reward model, which is then used to fine-tune a language model via reinforcement learning.

**Robustness** — The ability of an AI system to maintain safe and correct behavior under adversarial inputs, distributional shift, and other challenging conditions.

**Root Cause Analysis** — A systematic process for identifying the fundamental cause of an AI safety incident, going beyond symptoms to understand what actually went wrong and why.

---

## S

**Sandboxing** — Restricting an AI system's ability to interact with its environment, limiting what it can access, modify, or affect. Essential for safely executing AI-generated code.

**Scalable Oversight** — The challenge of supervising AI systems that may become more capable than their human overseers. Includes techniques like debate, amplification, and recursive reward modeling.

**Specification Gaming** — When an AI system exploits loopholes or unintended interpretations of its objective function to achieve high reward without truly fulfilling the intended goal.

**Sparse Autoencoder (SAE)** — A neural network architecture that decomposes superposed representations into interpretable feature directions using sparsity constraints. Used to discover and analyze features in large language models.

**Superintelligence** — An AI system that vastly exceeds human cognitive abilities across all domains. The potential arrival of superintelligence is the primary motivation for AI safety research.

**Superposition** — The phenomenon where neural networks encode more features than they have dimensions, with features overlapping in activation space. A fundamental challenge for interpretability.

**System Card** — An extended version of a model card that provides detailed safety information, including evaluation results, dangerous capability assessments, and deployment recommendations.

**System Prompt** — Instructions given to an AI model that define its behavior, role, and constraints. A key component of safety guardrails for deployed systems.

---

## T

**Threat Modeling** — A systematic process for identifying potential threats to an AI system, assessing their likelihood and impact, and designing appropriate countermeasures.

**Tool Use** — The ability of AI models to interact with external tools and APIs, such as web browsers, code interpreters, and databases. Increases both capability and risk.

**Transformer** — The neural network architecture underlying most modern large language models, characterized by self-attention mechanisms, residual connections, and layer normalization.

**TransformerLens** — A Python library developed by Neel Nanda for mechanistic interpretability research on transformer models. Provides tools for activation caching, circuit analysis, and intervention experiments.

**Tripwire** — A monitoring mechanism that detects when an AI system behaves in unexpected or potentially dangerous ways, triggering alerts for human review.

**True Positive Rate** — The proportion of actual positive cases correctly identified. In safety evaluation, the proportion of truly harmful prompts that are correctly blocked.

---

## U

**Unacceptable Risk** — Under the EU AI Act, AI practices that are considered to pose an unacceptable threat to fundamental rights and are therefore banned.

**Uncertainty Quantification** — Methods for measuring and communicating the confidence or uncertainty of AI model predictions. Important for safety because overconfident predictions can be dangerous.

---

## V

**Value Learning** — The problem of enabling AI systems to learn and represent human values from data, feedback, or other signals.

**Value Lock-In** — The risk that an AI system could permanently fix certain values or behaviors, preventing future correction or adaptation as human values evolve.

**Verification** — The process of checking that an AI system satisfies specific safety properties, through testing, formal methods, or interpretability analysis.

**Voluntary Commitments** — Pledges made by AI companies to follow certain safety practices, such as pre-deployment testing, information sharing, and cybersecurity investment.

---

## W

**Weak-to-Strong Generalization** — The study of how well alignment training on a weaker model generalizes when applied to a stronger model. An important question for scalable oversight.

**Weaponization** — The use of AI capabilities for harmful purposes, including AI-powered cyber attacks, biological weapon development, or military applications.

---

## Z

**Zero-Shot Learning** — The ability of a model to perform a task without any task-specific examples. Relevant to safety because zero-shot capabilities can appear unexpectedly at scale.

---

*This glossary covers the most important terms in AI safety as of 2026. The field evolves rapidly, and new terms will emerge as new challenges and solutions are developed.*
