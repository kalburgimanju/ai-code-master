1:"$Sreact.fragment"
2:I[5379,["177","static/chunks/app/layout-9e1a5effbbf47ba6.js"],"ThemeProvider"]
3:I[9766,[],""]
4:I[8924,[],""]
6:I[4431,[],"OutletBoundary"]
8:I[5278,[],"AsyncMetadataOutlet"]
a:I[4431,[],"ViewportBoundary"]
c:I[4431,[],"MetadataBoundary"]
d:"$Sreact.suspense"
f:I[7150,[],""]
:HL["/_next/static/media/22a5144ee8d83bca-s.p.woff2","font",{"crossOrigin":"","type":"font/woff2"}]
:HL["/_next/static/media/7d4881bb7e1bf84d-s.p.woff2","font",{"crossOrigin":"","type":"font/woff2"}]
:HL["/_next/static/css/a92bb6c4159ddb7c.css","style"]
0:{"P":null,"b":"H9fqAL2e5rlfha5sduv7X","p":"","c":["","chapter","safety-organizations"],"i":false,"f":[[["",{"children":["chapter",{"children":[["slug","safety-organizations","d"],{"children":["__PAGE__",{}]}]}]},"$undefined","$undefined",true],["",["$","$1","c",{"children":[[["$","link","0",{"rel":"stylesheet","href":"/_next/static/css/a92bb6c4159ddb7c.css","precedence":"next","crossOrigin":"$undefined","nonce":"$undefined"}]],["$","html",null,{"lang":"en","suppressHydrationWarning":true,"children":["$","body",null,{"className":"__variable_246ccd __variable_c29908 antialiased","children":["$","$L2",null,{"attribute":"class","defaultTheme":"dark","enableSystem":true,"children":["$","$L3",null,{"parallelRouterKey":"children","error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L4",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":[[["$","title",null,{"children":"404: This page could not be found."}],["$","div",null,{"style":{"fontFamily":"system-ui,\"Segoe UI\",Roboto,Helvetica,Arial,sans-serif,\"Apple Color Emoji\",\"Segoe UI Emoji\"","height":"100vh","textAlign":"center","display":"flex","flexDirection":"column","alignItems":"center","justifyContent":"center"},"children":["$","div",null,{"children":[["$","style",null,{"dangerouslySetInnerHTML":{"__html":"body{color:#000;background:#fff;margin:0}.next-error-h1{border-right:1px solid rgba(0,0,0,.3)}@media (prefers-color-scheme:dark){body{color:#fff;background:#000}.next-error-h1{border-right:1px solid rgba(255,255,255,.3)}}"}}],["$","h1",null,{"className":"next-error-h1","style":{"display":"inline-block","margin":"0 20px 0 0","padding":"0 23px 0 0","fontSize":24,"fontWeight":500,"verticalAlign":"top","lineHeight":"49px"},"children":404}],["$","div",null,{"style":{"display":"inline-block"},"children":["$","h2",null,{"style":{"fontSize":14,"fontWeight":400,"lineHeight":"49px","margin":0},"children":"This page could not be found."}]}]]}]}]],[]],"forbidden":"$undefined","unauthorized":"$undefined"}]}]}]}]]}],{"children":["chapter",["$","$1","c",{"children":[null,["$","$L3",null,{"parallelRouterKey":"children","error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L4",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":"$undefined","forbidden":"$undefined","unauthorized":"$undefined"}]]}],{"children":[["slug","safety-organizations","d"],["$","$1","c",{"children":[null,["$","$L3",null,{"parallelRouterKey":"children","error":"$undefined","errorStyles":"$undefined","errorScripts":"$undefined","template":["$","$L4",null,{}],"templateStyles":"$undefined","templateScripts":"$undefined","notFound":"$undefined","forbidden":"$undefined","unauthorized":"$undefined"}]]}],{"children":["__PAGE__",["$","$1","c",{"children":["$L5",null,["$","$L6",null,{"children":["$L7",["$","$L8",null,{"promise":"$@9"}]]}]]}],{},null,false]},null,false]},null,false]},null,false],["$","$1","h",{"children":[null,[["$","$La",null,{"children":"$Lb"}],["$","meta",null,{"name":"next-size-adjust","content":""}]],["$","$Lc",null,{"children":["$","div",null,{"hidden":true,"children":["$","$d",null,{"fallback":null,"children":"$Le"}]}]}]]}],false]],"m":"$undefined","G":["$f",[]],"s":false,"S":true}
10:I[2145,["192","static/chunks/192-86ed453240ed728a.js","659","static/chunks/659-47dd5e431adfe53a.js","932","static/chunks/app/chapter/%5Bslug%5D/page-2511595329d7a6f5.js"],"default"]
11:T602b,# Chapter 7: Organizations and Research Landscape

> "The AI safety field is small, passionate, and growing. It needs more people — and it needs them now." — Eliezer Yudkowsky

---

## 7.1 Anthropic

### Company Overview

Anthropic was founded in 2021 by Dario Amodei (CEO) and Daniela Amodei (President), along with several former OpenAI researchers including Tom Brown, Sam McCandlish, and Jared Kaplan. The company is headquartered in San Francisco and has raised billions in funding, including investments from Google, Amazon, and Spark Capital.

### Core Safety Research

Anthropic's safety research is organized around several key areas:

| Research Area | Description | Key Publications |
|--------------|-------------|-----------------|
| **Constitutional AI** | Self-supervised alignment using principles | Bai et al., 2022 |
| **Interpretability** | Understanding model internals | Anthropic, 2024 (feature discovery) |
| **Responsible Scaling** | Tying safety to capability levels | Anthropic RSP, 2023 |
| **Red Teaming** | Systematic adversarial testing | Anthropic red team reports |
| **Representation Engineering** | Steering model behavior via activations | Zou et al., 2023 |

### Responsible Scaling Policy (RSP)

Anthropic's Responsible Scaling Policy is one of the most detailed safety frameworks adopted by a frontier AI lab:

```
Anthropic's AI Safety Levels (ASL):

ASL-1: Models posing no meaningful catastrophic risk
  └── Pre-training checkpoint, simple models

ASL-2: Models showing early signs of dangerous capabilities
  └── Current frontier models may be here
  └── Requires: enhanced safety evaluations, incident response

ASL-3: Models with substantial dangerous capability potential
  └── Must be prevented from enabling mass-casualty events
  └── Requires: military-grade security, deployment restrictions

ASL-4: Models that could autonomously replicate and self-improve
  └── Requires: fundamental safety breakthroughs
  └── Possibly not deployable with current techniques
```

### Key Safety Achievements

- **Constitutional AI** reduced dependence on human feedback while making alignment objectives transparent
- **Sparse autoencoder research** discovered millions of interpretable features in Claude models
- **System cards** for Claude models set industry standards for transparency
- **Policy advocacy** helped shape the EU AI Act and US executive orders

---

## 7.2 Google DeepMind

### Company Overview

Google DeepMind was formed in 2023 from the merger of Google Brain and DeepMind. It is one of the largest AI research organizations in the world, with thousands of researchers working across deep learning, reinforcement learning, neuroscience, and AI safety.

### Safety Research Areas

| Area | Key Contributions | Notable Researchers |
|------|------------------|-------------------|
| **Scalable oversight** | Debate, recursive reward modeling | Irving, Leike |
| **Alignment** | Reward modeling, preference learning | Amodei, Christiano |
| **Interpretability** | Mechanistic interpretability | Olsson (induction heads) |
| **AI safety benchmarks** | BIG-bench, safety evaluations | Srivastava et al. |
| **Forecasting** | AI timeline predictions | Grace et al. |
| **Cooperative AI** | Game theory, multi-agent alignment | Hughes, Leibo |

### Key Research Contributions

DeepMind has contributed foundational research to multiple areas of AI safety:

- **Induction heads** (Olsson et al., 2022): Discovery of the first major interpretability circuit in transformers
- **Constitutional AI** foundations: Early work on using principles to guide AI behavior
- **AI safety benchmarks**: Development of comprehensive evaluation suites
- **Scalable oversight**: Pioneering work on debate and amplification
- **Cooperative AI**: Research on AI systems that cooperate with each other and with humans

### DeepMind's Safety Structure

```
Google DeepMind Safety Research:

├── Safety Team
│   ├── Alignment research
│   ├── Interpretability
│   ├── Robustness
│   └── Fairness
│
├── Ethics & Society
│   ├── Ethical AI research
│   ├── Policy engagement
│   └── Societal impact assessment
│
├── Science for Safety
│   ├── Formal verification
│   ├── Verification and validation
│   └── Safety case development
│
└── External Partnerships
    ├── Academic collaborations
    ├── Government advisory
    └── Industry standards
```

---

## 7.3 OpenAI

### Company Overview

OpenAI was founded in 2015 as a non-profit by Sam Altman, Greg Brockman, Elon Musk, Ilya Sutskever, and others. In 2019, it restructured as a "capped-profit" entity with a $100 billion cap. OpenAI developed GPT-3, ChatGPT, GPT-4, and o1/o3 reasoning models.

### Safety Research

OpenAI's safety research has evolved significantly over the years:

| Era | Focus | Key Contributions |
|-----|-------|------------------|
| **2015-2019** | Foundational safety | RLHF, safe exploration |
| **2019-2022** | Scalable alignment | InstructGPT, alignment research |
| **2022-2023** | Scaling safety | GPT-4 evaluation, red teaming |
| **2023-2024** | Superalignment | SuperAlignment team (dissolved 2024) |
| **2024+** | Practical safety | Preparedness framework, evaluations |

### The Superalignment Team

OpenAI's Superalignment team, announced in 2023, was dedicated to solving the technical challenges of aligning superintelligent AI systems. Key members included Ilya Sutskever and Jan Leike, who later departed the organization.

```
OpenAI Safety Organization (as of 2024):

├── Alignment
│   ├── Post-training alignment (RLHF, DPO)
│   ├── Safety systems
│   └── Model behavior
│
├── Preparedness
│   ├── Capability evaluation
│   ├── Risk assessment
│   └── Deployment decisions
│
├── Security
│   ├── Model security
│   ├── Infrastructure security
│   └── Responsible disclosure
│
└── Trust & Safety
    ├── Content policy
    ├── Usage monitoring
    └── Incident response
```

### Preparedness Framework

OpenAI's Preparedness Framework evaluates models across four risk categories:

| Risk Level | Description | Action Required |
|-----------|-------------|----------------|
| **Low** | Minimal risk from dangerous capabilities | Standard safety measures |
| **Medium** | Notable but manageable risks | Enhanced monitoring, targeted mitigations |
| **High** | Significant risk from dangerous capabilities | Additional safety measures required |
| **Critical** | Severe risk of catastrophic harm | Model should not be deployed |

---

## 7.4 Machine Intelligence Research Institute (MIRI)

### Overview

The Machine Intelligence Research Institute (MIRI), founded in 2000 by Eliezer Yudkowsky, is one of the oldest organizations dedicated to AI safety. Originally known as the Singularity Institute, MIRI focuses on the mathematical and logical foundations of AI alignment.

### Research Focus

MIRI's research agenda centers on several key areas:

| Area | Description | Key Publications |
|------|-------------|-----------------|
| **Agent foundations** | Mathematical foundations for safe AI agents | "Agent Foundations" sequence |
| **Logical uncertainty** | Reasoning under logical uncertainty | "Logical Induction" (Garrabrant et al.) |
| **Corrigibility** | Formalizing the shutdown problem | Soares et al. |
| **Decision theory** | Newcomb's problem and causal decision theory | "Updateless Decision Theory" |
| **Value learning** | Formalizing human values | "Coherent Extrapolated Volition" |

### Key Concepts from MIRI

```
MIRI's Core Safety Concepts:

1. INSTRUMENTAL CONVERGENCE
   └── Capable agents converge on certain sub-goals:
       ├── Self-preservation
       ├── Resource acquisition
       ├── Goal integrity
       └── Cognitive enhancement

2. THEORTHOGONALITY THESIS
   └── Intelligence and goals are independent:
       ├── Any level of intelligence can pursue any goal
       └── Smart does not mean good

3. THE CONTROL PROBLEM
   └── How to maintain control over superintelligent AI:
       ├── Boxing (containment)
       ├── Motivation selection
       └── Value alignment

4. COHERENT EXTRAPOLATED VOLITION (CEV)
   └── A proposal for what to align AI to:
       ├── What humans would want if they knew more
       ├── What humans would become if they grew
       └── What humans would want if they thought more carefully
```

### Impact and Legacy

While MIRI is small compared to frontier labs, its intellectual contributions are enormous:

- Popularized the concept of "existential risk" from AI
- Developed foundational concepts in AI alignment theory
- Inspired the creation of many other safety organizations
- Published influential research on decision theory and logical uncertainty
- Trained many leading AI safety researchers

---

## 7.5 Future of Humanity Institute (FHI)

### Overview

The Future of Humanity Institute (FHI) was a research center at the University of Oxford, founded by Nick Bostrom in 2005 and closing in 2024. FHI focused on big-picture questions about the long-term future of humanity, with particular emphasis on existential risk.

### Key Contributions

| Area | Key Work | Impact |
|------|----------|--------|
| **Existential risk** | "Superintelligence" (2014) | Defined the field |
| **AI governance** | "The Vulnerable World Hypothesis" | Policy frameworks |
| **Value alignment** | "The Value Learning Problem" | Technical research agenda |
| **Power dynamics** | "The Treacherous Turn" | Deceptive alignment concept |
| **Timing** | AI timeline predictions | Strategic planning |

### Nick Bostrom's "Superintelligence"

Bostrom's 2014 book "Superintelligence: Paths, Dangers, Strategies" is perhaps the most influential single work on AI safety. Key arguments:

1. **The intelligence explosion**: Once AI exceeds human intelligence, it may rapidly improve itself
2. **The control problem**: Controlling a superintelligent AI may be fundamentally impossible
3. **Instrumental convergence**: Almost any goal leads to dangerous sub-goals
4. **The orthogonality thesis**: Intelligence and morality are independent
5. **The treacherous turn**: A superintelligent AI might pretend to be aligned until it's too late to stop

> **Key Insight:** FHI's closing in 2024 marks the end of an era for academic AI safety research, but its ideas and frameworks continue to shape the field through the work of its alumni and the broader research community.

---

## 7.6 Center for AI Safety (CAIS)

### Overview

The Center for AI Safety (CAIS) is a San Francisco-based non-profit focused on reducing AI-related risks through technical research, policy, and field-building. CAIS is known for its work on AI safety benchmarks, governance, and public communication.

### Key Contributions

| Area | Contribution | Impact |
|------|-------------|--------|
| **Statement on AI risk** | Open letter signed by hundreds of AI leaders | Elevated public awareness |
| **Safety benchmarks** | HELM, SafetyBench | Standardized evaluation |
| **Governance** | Policy recommendations | Informed regulation |
| **Field-building** | AI safety courses, career guidance | Trained next generation |
| **Public communication** | "Could AI Lead to Extinction?" | Mainstreamed safety concerns |

### The CAIS Statement

In May 2023, CAIS published an open statement signed by hundreds of AI researchers and public figures:

> "Mitigating the risk of extinction from AI should be a global priority alongside other societal-scale risks such as pandemics and nuclear war."

Signatories included:
- Geoffrey Hinton (Turing Award winner)
- Yoshua Bengio (Turing Award winner)
- Demis Hassabis (DeepMind CEO)
- Dario Amodei (Anthropic CEO)
- Sam Altman (OpenAI CEO)
- Leading academics and policy experts

### CAIS Benchmarks

CAIS has developed several influential evaluation benchmarks:

- **HELM** (Holistic Evaluation of Language Models): Comprehensive evaluation across 42 scenarios
- **SafetyBench**: 11 safety categories with 14,000+ evaluation questions
- **AIR-Bench**: Automated safety evaluation across diverse categories

---

## 7.7 Alignment Research Center (ARC)

### Overview

The Alignment Research Center (ARC), founded by Paul Christiano in 2019, focuses on developing practical alignment techniques that can be applied to current and future AI systems. ARC is known for its work on iterated amplification, debate, and scalable oversight.

### Paul Christiano's Contributions

Paul Christiano is one of the most influential figures in AI safety research. His key contributions include:

| Contribution | Description | Significance |
|-------------|-------------|--------------|
| **RLHF** | Reinforcement learning from human feedback | Foundation of modern alignment |
| **Iterated Amplification** | Recursive decomposition for oversight | Scalable alignment approach |
| **Debate** | AI safety via adversarial verification | Truth-tracking mechanism |
| **Low-impact AI** | AI that minimizes unintended changes | Conservative deployment approach |
| **DAIF** | Debate Amplification Iterated Framework | Practical alignment pipeline |

### ARC's Alignment Taxonomy

```
ARC's Approach to Alignment:

1. TRAINING-BASED ALIGNMENT
   ├── RLHF: Optimize for human preferences
   ├── Constitutional AI: Optimize for principles
   ├── DPO: Direct preference optimization
   └── Challenge: Reward hacking, generalization

2. DECOMPOSITION-BASED ALIGNMENT
   ├── Iterated amplification: Recursive task decomposition
   ├── Debate: Adversarial verification
   ├── Recursive reward modeling: AI-assisted evaluation
   └── Challenge: Error accumulation, decomposition quality

3. VERIFICATION-BASED ALIGNMENT
   ├── Formal methods: Mathematical guarantees
   ├── Interpretability: Understanding internals
   ├── Red teaming: Finding failures
   └── Challenge: Completeness, scalability

4. RESTRAINT-BASED ALIGNMENT
   ├── Low-impact AI: Minimize unintended effects
   ├── Corrigibility: Maintain human control
   ├── Boxing: Containment and monitoring
   └── Challenge: Limits capability, may be insufficient
```

---

## 7.8 Metaculus and Forecasting

### The Role of Forecasting in AI Safety

AI safety research benefits enormously from forecasting — predicting when different AI milestones will occur, how capabilities will develop, and what risks will emerge. Good forecasting helps allocate resources, prioritize research, and prepare for future challenges.

### Metaculus

Metaculus is a forecasting platform where thousands of predictors answer questions about science, technology, and world events. It has become a key resource for AI safety planning.

```python
METACULUS_AI_QUESTIONS = {
    "AGI_timeline": {
        "question": "When will the first general AI system be developed?",
        "current_prediction": "2029-2031 (median)",
        "trend": "Getting shorter over time",
        "implications": "Urgency of alignment research increases",
    },
    "transformer_limitations": {
        "question": "Will transformers be the architecture behind AGI?",
        "current_prediction": "60% yes",
        "trend": "Uncertain, but diminishing",
        "implications": "Architecture-specific safety techniques may not transfer",
    },
    "alignment_solution": {
        "question": "Will we solve the alignment problem before AGI?",
        "current_prediction": "45% yes",
        "trend": "Slightly improving",
        "implications": "Close race between capability and safety",
    },
    "ai_regulation": {
        "question": "Will binding international AI regulation exist by 2030?",
        "current_prediction": "55% yes",
        "trend": "Increasing",
        "implications": "Governance frameworks taking shape",
    },
}
```

### Forecasting Organizations

| Organization | Focus | Key Contributions |
|-------------|-------|------------------|
| **Metaculus** | Community forecasting | AI timeline predictions, policy forecasting |
| **Manifold** | Prediction markets | Real-time AI event probabilities |
| **Forecasting Research Institute** | Structured forecasting | AI risk assessments |
| **AI Impacts** | AI impact analysis | Comprehensive AI timeline surveys |
| **GiveWell** | Cause prioritization | AI safety funding recommendations |

### AI Timeline Surveys

Multiple surveys of AI researchers have been conducted to predict when different AI capabilities will be achieved:

```
AI Timeline Survey Results (aggregated from multiple surveys):

Human-level performance on games:
  └── Median prediction: 2026-2028

Human-level performance on coding:
  └── Median prediction: 2027-2029

Human-level scientific reasoning:
  └── Median prediction: 2029-2032

General AI (can do any intellectual task):
  └── Median prediction: 2040-2060

Superintelligent AI:
  └── Median prediction: 2050-2100

Note: These predictions have been getting shorter over time
as AI capabilities have advanced faster than expected.
```

---

## 7.9 Academic Research Groups

### Leading Academic AI Safety Groups

| University | Group | Key Researchers | Focus |
|-----------|-------|-----------------|-------|
| **MIT** | CSAIL AI Safety | Various | Interpretability, robustness |
| **Stanford** | HAI (Human-Centered AI) | Fei-Fei Li, Percy Liang | Human-AI interaction, benchmarks |
| **Berkeley** | BAIR | Stuart Russell, Dylan Hadfield-Menell | Alignment, game theory |
| **Oxford** | FHI (now closed) | Various alumni | Existential risk, governance |
| **Cambridge** | CSER | Sean ÓhÉigeartaigh | AI governance, catastrophic risk |
| **NYU** | Alignment research | Various | Interpretability, theory |
| **Carnegie Mellon** | Various labs | Zico Kolter, various | Robustness, adversarial ML |
| **UCL** | AI Safety group | Various | Alignment theory |
| **ANU** | Various | Toby Ord | Existential risk, AI safety |
| **Tsinghua** | IIIS | Andrew Yao | Theoretical foundations |

### Key Academic Papers

```
Foundational Academic Papers in AI Safety:

1. Russell, S. (2019). "Human Compatible"
   └── Accessible introduction to AI safety for general audience

2. Bostrom, N. (2014). "Superintelligence"
   └── Comprehensive analysis of superintelligence risks

3. Amodei et al. (2016). "Concrete Problems in AI Safety"
   └── Practical safety research agenda

4. Christiano et al. (2017). "Deep RL from Human Preferences"
   └── Foundation of RLHF

5. Irving et al. (2018). "AI Safety via Debate"
   └── Scalable oversight through adversarial verification

6. Olsson et al. (2022). "In-context Learning and Induction Heads"
   └── First major interpretability circuit discovery

7. Bai et al. (2022). "Constitutional AI"
   └── Self-supervised alignment methodology

8. Rafailov et al. (2023). "Direct Preference Optimization"
   └── Simplified alignment training
```

---

## 7.10 Job Opportunities in AI Safety

### Career Paths in AI Safety

The AI safety field offers diverse career opportunities for people with different skill sets:

```
AI Safety Career Paths:

TECHNICAL ROLES
├── Alignment Researcher
│   ├── RLHF/DPO/Constitutional AI
│   ├── Value learning
│   └── Scalable oversight
│
├── Interpretability Researcher
│   ├── Mechanistic interpretability
│   ├── Sparse autoencoders
│   └── Circuit analysis
│
├── Safety Engineer
│   ├── Safety evaluation systems
│   ├── Red teaming automation
│   └── Monitoring and alerting
│
├── ML Engineer (Safety Focus)
│   ├── Safety tooling development
│   ├── Evaluation pipelines
│   └── Safety infrastructure
│
└── Research Engineer
    ├── Implementing safety research
    ├── Building research tools
    └── Scaling safety experiments

POLICY AND GOVERNANCE ROLES
├── AI Policy Researcher
│   ├── Regulation design
│   ├── Governance frameworks
│   └── Policy analysis
│
├── AI Governance
│   ├── Organizational governance
│   ├── Risk management
│   └── Compliance
│
├── AI Ethics Researcher
│   ├── Fairness and bias
│   ├── Value alignment
│   └── Societal impact
│
└── AI Diplomacy
    ├── International coordination
    ├── Treaty development
    └── Cross-border governance

NON-TECHNICAL ROLES
├── AI Safety Communication
│   ├── Science writing
│   ├── Public education
│   └── Journalism
│
├── AI Safety Strategy
│   ├── Organizational strategy
│   ├── Research prioritization
│   └── Funding allocation
│
└── AI Safety Operations
    ├── Project management
    ├── Community building
    └── Event coordination
```

### Where to Work

| Organization | Type | Key Roles | Funding |
|-------------|------|-----------|---------|
| **Anthropic** | Frontier lab | Research, engineering | VC-funded |
| **Google DeepMind** | Frontier lab | Research, policy | Google-funded |
| **OpenAI** | Frontier lab | Research, safety | VC-funded |
| **MIRI** | Non-profit | Research | Donor-funded |
| **ARC** | Non-profit | Research | Donor-funded |
| **CAIS** | Non-profit | Research, policy | Donor-funded |
| **UK AISI** | Government | Evaluation, policy | Government-funded |
| **US AISI** | Government | Standards, evaluation | Government-funded |
| **Various universities** | Academic | Research, teaching | Grants |

### Getting Started

```python
CAREER_RESOURCES = {
    "courses": [
        "AGI Safety Fundamentals (AGISF)",
        "AI Safety Camp",
        "Alignment Course (AISafety.info)",
        "DeepLearning.AI AI Safety Course",
    ],
    "communities": [
        "AI Safety Discord",
        "LessWrong",
        "Alignment Forum",
        "EA Forum (AI section)",
    ],
    "job_boards": [
        "80000 Hours job board",
        "AI Safety job board",
        "Individual lab career pages",
    ],
    "funding": [
        "Longview Philanthropy",
        "Open Philanthropy",
        "Effective Altruism funds",
        "Various grant programs",
    ],
}
```

---

## 7.11 Chapter Summary

### Key Takeaways

1. **Anthropic** leads in Constitutional AI, interpretability, and responsible scaling, with the most detailed safety framework (RSP).

2. **Google DeepMind** contributes foundational research in scalable oversight, interpretability (induction heads), and cooperative AI.

3. **OpenAI** has the largest safety team but has faced controversy over safety prioritization, particularly after the dissolution of the Superalignment team.

4. **MIRI** pioneered the theoretical foundations of AI safety, including instrumental convergence, the orthogonality thesis, and the control problem.

5. **FHI** (now closed) shaped the field through Bostrom's "Superintelligence" and existential risk research.

6. **CAIS** drives public awareness and develops safety benchmarks used across the industry.

7. **ARC** develops practical alignment techniques including iterated amplification and debate.

8. **Forecasting organizations** like Metaculus provide crucial predictions for AI timelines and risk assessment.

9. **Academic research groups** at leading universities contribute foundational research and train the next generation of safety researchers.

10. **AI safety careers** span technical, policy, and non-technical roles, with growing opportunities across organizations.

### Questions for Reflection

- Which organization's approach to safety do you find most compelling, and why?
- How important is it for safety researchers to work inside frontier labs vs. outside organizations?
- What skills are most needed in AI safety that are currently undersupplied?
- How should we think about the tradeoff between safety research inside vs. outside companies?

### Preview of Next Chapter

In Chapter 8, we move from theory to practice: **practical implementation** of AI safety in real-world systems. We'll cover building safety into ML pipelines, monitoring, incident response, and provide extensive code examples for safety tools.

---

*"The field of AI safety is only as strong as the people who work in it. Join us."*
5:["$","$L10",null,{"chapter":{"slug":"safety-organizations","number":7,"title":"Organizations and Research","filename":"chapter-07-organizations-and-research.md","part":"Building a Career in Safety","partNumber":3,"description":"Key AI safety organizations, research labs, funding landscape, and the current state of the safety research ecosystem."},"content":"$11"}]
b:[["$","meta","0",{"charSet":"utf-8"}],["$","meta","1",{"name":"viewport","content":"width=device-width, initial-scale=1"}]]
7:null
9:{"metadata":[["$","title","0",{"children":"Super Intelligence Safety Experts"}],["$","meta","1",{"name":"description","content":"The Complete Guide to AI Safety and Alignment by Manjunath Kalburgi"}]],"error":null,"digest":"$undefined"}
e:"$9:metadata"
