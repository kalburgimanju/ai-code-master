# Appendix B: Recommended Reading

> A curated bibliography organized by topic, with brief annotations for each work.

---

## Foundational Books

| Title | Author(s) | Year | Description |
|-------|-----------|------|-------------|
| *Superintelligence: Paths, Dangers, Strategies* | Nick Bostrom | 2014 | The foundational text on existential risk from AI. Introduces the orthogonality thesis, instrumental convergence, and the control problem. Essential reading for understanding why AI safety matters. |
| *Human Compatible: AI and the Problem of Control* | Stuart Russell | 2019 | A accessible introduction to AI safety by one of the field's founders. Proposes a new framework for AI development based on provably beneficial machines. |
| *The Alignment Problem* | Brian Christian | 2020 | A journalistic account of the alignment problem, covering the history, key researchers, and technical challenges. Excellent for non-technical readers. |
| *AI Safety Landscape* | Anthropic | 2023 | A comprehensive overview of the AI safety research landscape, covering alignment, interpretability, evaluation, and governance. |
| *Concrete Problems in AI Safety* | Amodei et al. | 2016 | A landmark paper that defined five practical research problems in AI safety, helping to ground the field in actionable research. |

## Alignment Research

### RLHF and Preference Learning

| Title | Author(s) | Year | Key Contribution |
|-------|-----------|------|-----------------|
| "Deep Reinforcement Learning from Human Preferences" | Christiano et al. | 2017 | Foundational paper introducing RLHF. Demonstrated that human preferences could train reward models to guide AI behavior. |
| "Training Language Models to Follow Instructions with Human Feedback" (InstructGPT) | Ouyang et al. | 2022 | Showed that RLHF could produce instruction-following models, leading directly to ChatGPT. |
| "Constitutional AI: Harmlessness from AI Feedback" | Bai et al. | 2022 | Introduced Constitutional AI, reducing dependence on human feedback through self-critique and AI-generated preferences. |
| "Direct Preference Optimization: Your Language Model Is Secretly a Reward Model" | Rafailov et al. | 2023 | Showed that RLHF could be simplified to a classification loss, eliminating the reward model and PPO training. |
| "KTO: Model Alignment as Prospect Theoretic Optimization" | Ethayarajh et al. | 2024 | Introduced KTO, which requires only binary feedback rather than pairwise comparisons. |
| "Scaling Laws for Reward Model Overoptimization" | Gao et al. | 2023 | Demonstrated that reward models become overoptimistic at scale, leading to reward hacking. |

### Scalable Oversight

| Title | Author(s) | Year | Key Contribution |
|-------|-----------|------|-----------------|
| "AI Safety via Debate" | Irving, Christiano, Amodei | 2018 | Proposed using adversarial debate between AI systems as a scalable oversight mechanism. |
| "Supervising Strong Learners by Amplifying Weak Experts" | Christiano et al. | 2018 | Introduced the amplification framework for scaling human oversight. |
| "Scalable Agent Alignment via Reward Modeling" | Leike et al. | 2018 | Proposed recursive reward modeling as a path to scalable oversight. |
| "Weak-to-Strong Generalization" | Burns et al. | 2023 | Studied whether weak models can effectively supervise stronger models, with mixed results. |

## Interpretability

| Title | Author(s) | Year | Key Contribution |
|-------|-----------|------|-----------------|
| "A Mathematical Framework for Transformer Circuits" | Elhage et al. | 2021-2022 | Foundational work on understanding transformer circuits, including induction heads and the residual stream. |
| "In-context Learning and Induction Heads" | Olsson et al. | 2022 | Discovered the first major interpretability circuit in transformers: induction heads. |
| "Toy Models of Superposition" | Elhage et al. | 2022 | Formalized the superposition problem, explaining how networks encode more features than dimensions. |
| "Scaling Monosemanticity: Extracting Interpretable Features from Claude 3 Sonnet" | Anthropic | 2024 | Landmark paper demonstrating that sparse autoencoders can discover millions of interpretable features in production models. |
| "Towards Monosemanticity: Decomposing Language Models with Dictionary Learning" | Cunningham et al. | 2023 | Showed that sparse autoencoders can decompose neural network activations into interpretable features. |
| "Representation Engineering: A Top-Down Approach to AI Transparency" | Zou et al. | 2023 | Introduced representation engineering as a practical approach to controlling model behavior through activation manipulation. |
| "Interpretability in the Wild" | Wang et al. | 2022 | Demonstrated how to reverse-engineer a real circuit (indirect object identification) in GPT-2. |

## Evaluation and Benchmarking

| Title | Author(s) | Year | Key Contribution |
|-------|-----------|------|-----------------|
| "Model Cards for Model Reporting" | Mitchell et al. | 2019 | Introduced model cards as a standard for transparent model documentation. |
| "Holistic Evaluation of Language Models" (HELM) | Liang et al. | 2022 | Comprehensive evaluation framework covering 42 scenarios across multiple dimensions. |
| "Sleeper Agents: Training Deceptive LLMs that Persist Through Safety Training" | Hubinger et al. | 2024 | Demonstrated that AI systems can learn deceptive behaviors that survive safety training. |
| "Frontier AI Regulation: Managing Emerging Risks to Public Safety" | Anderljung et al. | 2023 | Comprehensive analysis of regulatory approaches for frontier AI models. |

## Technical Safety

| Title | Author(s) | Year | Key Contribution |
|-------|-----------|------|-----------------|
| "Risks from Learned Optimization in Advanced Machine Learning" | Hubinger et al. | 2019 | Introduced the mesa-optimization framework and the concept of deceptive alignment. |
| "The Alignment Problem from a Deep Learning Perspective" | Ngo et al. | 2024 | Comprehensive survey of alignment challenges from the perspective of deep learning. |
| "Goodhart's Taxonomy" | Manheim & Garrabrant | 2018 | Detailed taxonomy of Goodhart's Law variants relevant to AI alignment. |
| "Reward Hacking" | Skalse et al. | 2022 | Formal analysis of reward hacking and its implications for alignment. |

## Governance and Policy

| Title | Author(s) | Year | Key Contribution |
|-------|-----------|------|-----------------|
| "The EU Artificial Intelligence Act" | European Commission | 2024 | The text of the world's first comprehensive AI regulation. |
| "Managing AI Risks in an Era of Rapid Progress" | Anthropic et al. | 2023 | Joint report on AI governance from leading AI labs and researchers. |
| "Governing AI: A Blueprint for the Future" | Madan & Ashraf | 2023 | Comprehensive governance framework for AI development and deployment. |
| "International AI Governance: A Research Agenda" | Calzati | 2023 | Academic survey of international AI governance proposals. |

## Existential Risk and Long-Term Safety

| Title | Author(s) | Year | Key Contribution |
|-------|-----------|------|-----------------|
| "The Precipice: Existential Risk and the Future of Humanity" | Toby Ord | 2020 | Comprehensive analysis of existential risks, with AI as a central concern. |
| "The King in Yellow" | Eliezer Yudkowsky | Various | Blog posts and papers on AI safety from one of the field's founders. Available on LessWrong. |
| "The List of Lethalities" | Eliezer Yudkowsky | 2022 | A stark assessment of the technical challenges remaining for safe superintelligence. |
| "Could Advanced AI Systems Represent Existential Risk?" | Bostrom | 2023 | Updated analysis of superintelligence risk scenarios. |

## Books for General Audiences

| Title | Author(s) | Year | Description |
|-------|-----------|------|-------------|
| *Life 3.0: Being Human in the Age of Artificial Intelligence* | Max Tegmark | 2017 | Explores the future of AI and its impact on humanity, including safety considerations. |
| *The Coming Wave* | Mustafa Suleyman | 2023 | Written by the DeepMind co-founder, examines the power and peril of AI and other technologies. |
| *AI 2041: Ten Vectors for Our Future* | Kai-Fu Lee & Chen Qiufan | 2021 | Ten short stories imagining AI's impact by 2041, each with technical analysis. |
| *Atlas of AI* | Kate Crawford | 2021 | Examines the political and social costs of AI, including labor exploitation and environmental impact. |
| *Weapons of Math Destruction* | Cathy O'Neil | 2016 | Early warning about algorithmic bias and the dangers of opaque decision systems. |

## Journals and Venues

| Venue | Focus | Frequency |
|-------|-------|-----------|
| **NeurIPS Safety Workshop** | AI Safety at NeurIPS | Annual |
| **ICML AI Safety Workshop** | AI Safety at ICML | Annual |
| **AIES (Conference on AI, Ethics, and Society)** | AI Ethics | Annual |
| **FAccT (Conference on Fairness, Accountability, and Transparency)** | Fairness and transparency | Annual |
| **Alignment Forum** | AI Safety research | Continuous |
| **LessWrong** | AI Safety and rationality | Continuous |
| **arXiv (cs.AI, cs.CL, cs.LG)** | Preprints | Continuous |

---

*Note: This reading list is current as of July 2026. The AI safety field evolves rapidly, and new important works appear regularly. Readers are encouraged to follow the Alignment Forum, LessWrong, and major ML conferences for the latest research.*
