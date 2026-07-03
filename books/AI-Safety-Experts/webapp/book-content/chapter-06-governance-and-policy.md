# Chapter 6: Governance and Policy

> "The question is not whether AI will be regulated, but whether regulation will arrive in time to prevent the most serious harms." — Stuart Russell

---

## 6.1 AI Governance Frameworks

### The Governance Imperative

As AI systems become more powerful and pervasive, governance frameworks are essential to ensure they are developed and deployed safely, ethically, and in the public interest. AI governance encompasses the laws, regulations, standards, norms, and institutional mechanisms that shape how AI is built and used.

### Multi-Layered Governance Model

AI governance operates at multiple levels simultaneously:

```
┌──────────────────────────────────────────────────────────────┐
│                AI GOVERNANCE LAYERS                           │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Global Level                                               │
│  ├── UN AI Advisory Body                                     │
│  ├── International AI Safety Summits                         │
│  ├── OECD AI Principles                                     │
│  └── Bletchley Declaration                                   │
│                                                              │
│  Regional Level                                             │
│  ├── EU AI Act                                               │
│  ├── ASEAN AI Governance Framework                           │
│  └── African Union AI Strategy                               │
│                                                              │
│  National Level                                             │
│  ├── US AI Executive Orders                                  │
│  ├── China's AI Regulations                                  │
│  ├── UK AI Safety Institute                                  │
│  └── Japan's AI Guidelines                                   │
│                                                              │
│  Industry Level                                             │
│  ├── Frontier Model Forum standards                          │
│  ├── Responsible Scaling Policies                            │
│  ├── Voluntary commitments                                   │
│  └── Self-regulatory codes                                   │
│                                                              │
│  Organizational Level                                       │
│  ├── Internal AI ethics boards                               │
│  ├── Safety review processes                                 │
│  ├── Incident response procedures                            │
│  └── Employee training programs                              │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Core Principles of AI Governance

Most AI governance frameworks share these foundational principles:

| Principle | Description | Implementation |
|-----------|-------------|----------------|
| **Transparency** | AI decisions should be explainable | Model cards, system cards, audit trails |
| **Accountability** | Clear responsibility for AI outcomes | Liability frameworks, designated roles |
| **Fairness** | AI should not discriminate | Bias testing, equity audits |
| **Safety** | AI should not cause harm | Risk assessments, safety testing |
| **Privacy** | AI should respect personal data | Data protection, consent mechanisms |
| **Human oversight** | Humans should retain meaningful control | Human-in-the-loop, override mechanisms |
| **Robustness** | AI should be reliable and secure | Testing, red teaming, monitoring |
| **Non-maleficence** | AI should not be used for harm | Use restrictions, content filtering |

### The Governance Gap

A critical challenge in AI governance is the speed mismatch between technology development and policy creation:

```
Technology Timeline:
2020: GPT-3 released
2022: ChatGPT launches
2023: GPT-4, Claude 3, Gemini
2024: Autonomous agents, multimodal systems
2025: Frontier models approach human expert performance
2026+: Potential for superhuman capabilities

Policy Timeline:
2021: EU AI Act proposal
2023: Bletchley Declaration, US Executive Order
2024: EU AI Act enters force (partial)
2025: EU AI Act full implementation
2026+: Other nations implement frameworks

Gap: Technology advances faster than policy can respond
```

---

## 6.2 The EU AI Act

### Overview

The EU AI Act, the world's first comprehensive AI regulation, establishes a risk-based framework for governing AI systems. It entered into force in August 2024 with a phased implementation timeline.

### Risk-Based Classification

The EU AI Act classifies AI systems into four risk categories:

| Risk Level | Description | Requirements | Examples |
|-----------|-------------|-------------|----------|
| **Unacceptable** | Threatens fundamental rights | Banned | Social scoring, real-time biometric surveillance (with exceptions), emotion recognition in workplaces/schools |
| **High** | Significant impact on safety or rights | Extensive: conformity assessment, human oversight, documentation, transparency | Medical devices, hiring tools, credit scoring, law enforcement, education |
| **Limited** | Transparent to users | Transparency: inform users they're interacting with AI | Chatbots, deepfakes, emotion recognition |
| **Minimal** | No significant risk | No specific requirements | Spam filters, AI in video games |

### General-Purpose AI (GPAI) Rules

The Act includes specific provisions for general-purpose AI models like large language models:

```python
EU_GPAI_REQUIREMENTS = {
    "all_gpai_models": {
        "technical_documentation": True,
        "training_data_summary": True,
        "copyright_compliance": True,
        "downstream_transparency": True,
    },
    "systemic_risk_models": {
        # Models trained with >10^25 FLOPs
        # or meeting other systemic risk criteria
        "model_evaluation": True,
        "adversarial_testing": True,
        "incident_reporting": True,
        "cybersecurity_protection": True,
        "energy_consumption_reporting": True,
    },
}

def assess_gpai_compliance(model_info: dict) -> dict:
    """
    Assess a GPAI model's compliance with EU AI Act requirements.
    """
    compliance = {}

    # Check if model is systemic risk
    training_flops = model_info.get("training_flops", 0)
    is_systemic_risk = training_flops > 10**25

    # Base requirements for all GPAI
    base_requirements = EU_GPAI_REQUIREMENTS["all_gpai_models"]
    for req, required in base_requirements.items():
        compliance[req] = {
            "required": required,
            "met": model_info.get(f"compliant_{req}", False),
        }

    # Additional requirements for systemic risk models
    if is_systemic_risk:
        systemic_requirements = (
            EU_GPAI_REQUIREMENTS["systemic_risk_models"]
        )
        for req, required in systemic_requirements.items():
            compliance[req] = {
                "required": required,
                "met": model_info.get(f"compliant_{req}", False),
            }

    # Calculate overall compliance
    total = len(compliance)
    met = sum(1 for v in compliance.values() if v["met"])

    return {
        "is_systemic_risk": is_systemic_risk,
        "compliance_details": compliance,
        "overall_compliance": met / total if total > 0 else 0,
        "non_compliant_items": [
            k for k, v in compliance.items()
            if v["required"] and not v["met"]
        ],
    }
```

### Penalties

| Violation | Maximum Fine |
|-----------|-------------|
| Prohibited AI practices | €35 million or 7% of global annual turnover |
| High-risk AI requirements | €15 million or 3% of global annual turnover |
| GPAI obligations | €15 million or 3% of global annual turnover |
| Providing incorrect information to authorities | €7.5 million or 1% of global annual turnover |

---

## 6.3 US AI Executive Orders and Policy

### Executive Order on AI Safety (October 2023)

The Biden administration's Executive Order on Safe, Secure, and Trustworthy AI established sweeping requirements for AI development and deployment:

```python
US_AI_POLICY_REQUIREMENTS = {
    "safety_reporting": {
        "description": "Companies must report safety test results "
                       "for powerful AI systems",
        "threshold": "Models trained using >10^26 FLOPs",
        "requirements": [
            "Report safety test results to Commerce Department",
            "Share red team results",
            "Report on model capabilities and limitations",
        ],
    },
    "dual_use_foundation_models": {
        "description": "Models with potential for both beneficial "
                       "and harmful applications",
        "requirements": [
            "Must notify government before public release",
            "Must conduct safety evaluations",
            "Must implement security protections",
        ],
    },
    "ai_safety_standards": {
        "description": "NIST to develop AI safety standards",
        "timeline": "Within 270 days of executive order",
        "focus_areas": [
            "Red teaming protocols",
            "Safety evaluation benchmarks",
            "Deployment risk assessment",
            "Incident reporting procedures",
        ],
    },
    "sector_specific_guidance": {
        "healthcare": "FDA guidance on AI in medical devices",
        "critical_infrastructure": "Sector-specific safety requirements",
        "education": "AI use guidelines in educational settings",
        "employment": "AI fairness in hiring and workplace",
    },
}
```

### The NIST AI Risk Management Framework

The National Institute of Standards and Technology (NIST) AI Risk Management Framework (AI RMF) provides a voluntary framework for managing AI risks:

```
NIST AI RMF Functions:

GOVERN
├── Establish AI risk management culture
├── Define roles and responsibilities
├── Create policies and procedures
└── Manage AI risks across the organization

MAP
├── Identify context and stakeholders
├── Document AI system characteristics
├── Identify potential impacts
└── Assess AI risks in context

MEASURE
├── Select appropriate metrics
├── Evaluate identified risks
├── Measure AI system performance
├── Track risks over time

MANAGE
├── Prioritize risks based on assessment
├── Develop risk response strategies
├── Implement controls
├── Monitor and update risk posture
```

---

## 6.4 China's AI Regulations

China has implemented a series of increasingly specific AI regulations, taking a different approach from the EU's comprehensive framework.

### Key Regulations

| Regulation | Date | Focus | Key Requirements |
|-----------|------|-------|-----------------|
| **Deep Synthesis Provisions** | Jan 2023 | Deepfakes | Labeling, consent, registration |
| **Generative AI Measures** | Aug 2023 | Generative AI | Content filtering, data labeling, security review |
| **Algorithm Recommendation** | Mar 2022 | Algorithms | Registration, transparency, opt-out options |
| **Deep Learning Framework** | Sep 2024 | Foundation models | Security assessment, content moderation |

### China's Approach

China's approach emphasizes:
1. **Content control**: AI must align with "socialist core values"
2. **Security review**: Mandatory security assessments before deployment
3. **Data governance**: Strict requirements on training data
4. **Registration**: All algorithms and AI services must be registered
5. **Graduated regulation**: Different rules for different risk levels

---

## 6.5 International Coordination

### The AI Safety Summit Series

The Bletchley Park AI Safety Summit (November 2023) marked a turning point in international AI governance coordination:

**Key Outcomes:**
- The Bletchley Declaration: 28 countries agreed that AI poses potential catastrophic risk
- Establishment of AI Safety Institutes in multiple countries
- Agreement on the need for shared safety testing methodologies
- Commitment to continued international dialogue

### International Organizations

| Organization | Focus | Members | Key Activities |
|-------------|-------|---------|----------------|
| **OECD AI Policy Observatory** | Policy guidance | 46 countries | AI principles, policy tracking |
| **UNESCO** | Ethical AI | 193 countries | Recommendation on AI Ethics |
| **Global Partnership on AI (GPAI)** | Research & innovation | 29 countries | AI projects, policy recommendations |
| **UK AI Safety Institute** | Safety testing | UK-led | Frontier model evaluation |
| **US AI Safety Institute** | Safety standards | US-led | NIST standards development |
| **Japan AI Safety Institute** | Safety evaluation | Japan-led | Technical safety research |

### The Challenge of International Coordination

```
International AI Governance Challenges:

1. COMPETITION DYNAMICS
   ├── AI race between nations
   ├── Concern that safety regulation slows competitiveness
   └── Need for coordination to prevent race to the bottom

2. DIFFERENT VALUES
   ├── Western democracies: individual rights, privacy
   ├── China: state control, social harmony
   └── Need for frameworks that bridge value differences

3. ENFORCEMENT
   ├── No global AI regulator
   ├── National sovereignty limits international enforcement
   └── Need for cooperative enforcement mechanisms

4. SPEED OF DEVELOPMENT
   ├── Technology outpaces policy
   ├── International negotiations are slow
   └── Need for adaptive, principles-based approaches

5. DEFINITION PROBLEMS
   ├── What counts as "frontier" AI?
   ├── How to measure dangerous capabilities?
   └── Need for common technical standards
```

---

## 6.6 Voluntary Commitments and Industry Standards

### Major Industry Commitments

In the absence of comprehensive regulation, many AI companies have made voluntary safety commitments:

```python
VOLUNTARY_COMMITMENTS = {
    "white_house_commitments_2023": {
        "signatories": [
            "Amazon", "Anthropic", "Google", "Inflection",
            "Meta", "Microsoft", "OpenAI",
        ],
        "commitments": [
            "Internal and external security testing before release",
            "Share information on AI risks with governments",
            "Invest in cybersecurity and insider threat protection",
            "Develop technical mechanisms to indicate AI-generated content",
            "Report AI system capabilities and limitations",
            "Invest in responsible AI research",
            "Develop and deploy AI systems to address societal challenges",
        ],
    },
    "frontier_model_forum": {
        "members": ["Anthropic", "Google", "Microsoft", "OpenAI"],
        "objectives": [
            "Share best practices for safe AI development",
            "Develop safety evaluation methodologies",
            "Support research on AI safety",
            "Coordinate incident response",
        ],
    },
    "responsible_scaling_policies": {
        "anthropic": {
            "commitment": "Tie safety requirements to model capabilities",
            "levels": ["ASL-1 through ASL-4"],
            "key_feature": "Must meet safety requirements before "
                          "training models above current capability level",
        },
        "openai": {
            "commitment": "Preparedness framework with safety levels",
            "levels": ["Low", "Medium", "High", "Critical"],
            "key_feature": "Models above 'High' threshold require "
                          "additional safety measures before deployment",
        },
    },
}
```

### Limitations of Voluntary Commitments

| Limitation | Description |
|-----------|-------------|
| **No enforcement** | Companies can withdraw from commitments |
| **Self-assessment** | Companies evaluate their own safety |
| **Competitive pressure** | Race dynamics may override commitments |
| **Scope limitations** | Don't cover smaller companies or open-source |
| **Measurement challenges** | No agreed-upon metrics for compliance |

---

## 6.7 Regulatory Capture Risks

### What Is Regulatory Capture?

Regulatory capture occurs when the regulated entities disproportionately influence the regulatory process, resulting in regulations that serve industry interests rather than the public interest.

### Risks Specific to AI Governance

```
AI Regulatory Capture Risks:

1. REVOLVING DOOR
   ├── Industry experts move to regulatory positions
   ├── Regulators move to industry positions
   └── Creates sympathy for industry perspectives

2. INFORMATION ASYMMETRY
   ├── Companies understand technology better than regulators
   ├── Regulators depend on companies for technical expertise
   └── Companies can frame issues to their advantage

3. LOBBYING AND POLITICAL INFLUENCE
   ├── Massive lobbying budgets from tech companies
   ├── Campaign contributions
   └── Revolving door creates relationships

4. DEFINING THE NARRATIVE
   ├── Companies shape public perception of AI risks
   ├── Emphasis on benefits over risks
   └── Framing regulation as innovation-killing

5. SELF-REGULATION AS SUBSTITUTE
   ├── Voluntary commitments used to avoid binding regulation
   ├── Industry standards set by incumbents
   └── "Innovation sandboxes" that weaken oversight
```

### Mitigating Regulatory Capture

```python
class RegulatoryCaptureDetector:
    """
    Monitor for signs of regulatory capture in AI governance.
    """

    def assess_capture_risk(self, regulatory_context: dict) -> dict:
        """
        Assess the risk of regulatory capture based on
        observable indicators.
        """
        risks = []

        # Check: revolving door
        personnel_overlap = regulatory_context.get(
            "personnel_overlap_score", 0
        )
        if personnel_overlap > 0.3:
            risks.append({
                "type": "revolving_door",
                "severity": "high",
                "score": personnel_overlap,
                "description": (
                    f"Significant personnel movement between "
                    f"industry and regulators "
                    f"(overlap: {personnel_overlap:.2f})"
                ),
            })

        # Check: industry funding of regulatory body
        industry_funding = regulatory_context.get(
            "industry_funding_percentage", 0
        )
        if industry_funding > 0.2:
            risks.append({
                "type": "industry_funding",
                "severity": "medium",
                "score": industry_funding,
                "description": (
                    f"Regulatory body receives "
                    f"{industry_funding*100:.1f}% "
                    f"of funding from industry"
                ),
            })

        # Check: regulatory complexity favoring incumbents
        compliance_cost = regulatory_context.get(
            "compliance_cost_ratio", 0
        )
        if compliance_cost > 0.5:
            risks.append({
                "type": "barrier_to_entry",
                "severity": "medium",
                "score": compliance_cost,
                "description": (
                    f"Compliance costs disproportionately "
                    f"burden smaller companies "
                    f"(ratio: {compliance_cost:.2f})"
                ),
            })

        # Check: self-regulation dominance
        self_regulation = regulatory_context.get(
            "self_regulation_percentage", 0
        )
        if self_regulation > 0.5:
            risks.append({
                "type": "self_regulation",
                "severity": "high",
                "score": self_regulation,
                "description": (
                    f"{self_regulation*100:.1f}% of governance "
                    f"is through voluntary self-regulation"
                ),
            })

        overall_risk = (
            sum(r["score"] for r in risks) / len(risks)
            if risks else 0
        )

        return {
            "overall_capture_risk": overall_risk,
            "risk_level": (
                "high" if overall_risk > 0.5
                else "medium" if overall_risk > 0.3
                else "low"
            ),
            "identified_risks": risks,
            "recommendations": self._generate_recommendations(risks),
        }

    def _generate_recommendations(
        self, risks: list[dict]
    ) -> list[str]:
        """Generate recommendations to mitigate capture risks."""
        recommendations = []

        risk_types = [r["type"] for r in risks]

        if "revolving_door" in risk_types:
            recommendations.append(
                "Implement cooling-off periods for personnel "
                "moving between industry and regulatory roles"
            )

        if "industry_funding" in risk_types:
            recommendations.append(
                "Diversify funding sources for regulatory bodies "
                "to reduce industry dependence"
            )

        if "self_regulation" in risk_types:
            recommendations.append(
                "Establish binding regulatory requirements "
                "alongside voluntary commitments"
            )

        if "barrier_to_entry" in risk_types:
            recommendations.append(
                "Create tiered compliance requirements based "
                "on company size and risk level"
            )

        return recommendations
```

---

## 6.8 Open Source vs Closed Source Debate

### The Debate

The question of whether AI models should be open-sourced or kept proprietary is one of the most contentious in AI governance:

| Perspective | Arguments For Open Source | Arguments Against |
|------------|--------------------------|-------------------|
| **Safety** | More eyes find more bugs | Bad actors can remove safety features |
| **Innovation** | Accelerates research | Concentrates power in those who fine-tune |
| **Power dynamics** | Democratizes access | Most users can't evaluate risks |
| **Competition** | Prevents monopolies | Race to deploy unsafe models |
| **Transparency** | Enables independent audit | Hard to control misuse after release |

### The Spectrum of Openness

```python
OPENNESS_SPECTRUM = {
    "fully_closed": {
        "description": "No access to model weights or internals",
        "access": "API only",
        "examples": ["GPT-4", "Claude 3"],
        "safety_controls": [
            "Full provider control",
            "Input/output filtering",
            "Usage monitoring",
        ],
        "risks": [
            "Single point of failure",
            "Provider misalignment",
            "No independent verification",
        ],
    },
    "gated_access": {
        "description": "Weights available to approved researchers",
        "access": "Application process",
        "examples": ["LLaMA (initial release)", "Gemini (research)"],
        "safety_controls": [
            "Usage agreements",
            "Research-only restrictions",
            "Reporting requirements",
        ],
        "risks": [
            "Leakage to unrestricted access",
            "Limited safety verification",
            "Gatekeeping bias",
        ],
    },
    "open_weights": {
        "description": "Model weights publicly available",
        "access": "Download and use",
        "examples": ["LLaMA 3", "Mistral", "Gemma"],
        "safety_controls": [
            "License restrictions",
            "Community norms",
            "Responsible use guidelines",
        ],
        "risks": [
            "Fine-tuning can remove safety",
            "Hard to prevent misuse",
            "No recall mechanism",
        ],
    },
    "fully_open": {
        "description": "Weights, training code, and data available",
        "access": "Complete transparency",
        "examples": ["Pythia", "OLMo", "BLOOM"],
        "safety_controls": [
            "Community review",
            "Transparent development",
            "Collaborative safety research",
        ],
        "risks": [
            "Maximum misuse potential",
            "No control after release",
            "Complete transparency of capabilities",
        ],
    },
}
```

### Regulatory Approaches to Open Source

| Jurisdiction | Approach | Key Provisions |
|-------------|----------|----------------|
| **EU AI Act** | Exempts open-source from most GPAI requirements | Unless model poses systemic risk |
| **US** | Voluntary commitments apply mainly to closed-source | Open-source community developing norms |
| **China** | Requires security assessment for all models | Including open-source deployments |

---

## 6.9 Compute Governance

### Compute as a Control Point

Compute (processing power) is increasingly seen as a key lever for AI governance because:

1. **Training frontier models requires massive compute** — limiting compute access can limit dangerous model development
2. **Compute is physically observable** — unlike data or algorithms, compute can be tracked and measured
3. **Compute supply chains are concentrated** — a small number of companies control the most advanced chips

### Compute Governance Mechanisms

```python
COMPUTE_GOVERNANCE_FRAMEWORK = {
    "tracking_and_monitoring": {
        "description": "Track compute usage for large-scale training",
        "requirements": [
            "Report training runs above threshold FLOPs",
            "Provide compute infrastructure details",
            "Disclose training duration and efficiency",
        ],
        "threshold_examples": {
            "US_executive_order": "10^26 FLOPs",
            "EU_AI_Act_systemic": "10^25 FLOPs",
            "proposed_threshold": "10^23 FLOPs",
        },
    },
    "export_controls": {
        "description": "Restrict export of advanced AI chips",
        "current_policies": [
            "US CHIPS Act restrictions on China",
            "Netherlands ASML export controls",
            "Japan semiconductor equipment restrictions",
        ],
        "targets": [
            "Advanced GPU clusters (H100, A100)",
            "Manufacturing equipment for cutting-edge chips",
            "Cloud computing access from restricted entities",
        ],
    },
    "compute_caps": {
        "description": "Proposed limits on training compute",
        "proposals": [
            "Maximum FLOPs for unregulated training",
            "Graduated requirements above thresholds",
            "Licensing for supercomputing resources",
        ],
        "challenges": [
            "Enforcement difficulties",
            "International coordination needed",
            "Distributed training complicates measurement",
        ],
    },
}
```

### The Compute Governance Dilemma

```
Arguments for compute governance:
├── Provides a concrete, measurable control point
├── Can prevent training of most dangerous models
├── Supply chain concentration enables enforcement
└── Physical infrastructure is observable

Arguments against compute governance:
├── May slow beneficial AI research
├── Difficult to enforce across jurisdictions
├── Distributed training may bypass thresholds
├── Open-source models trained before restrictions
└── May entrench existing power structures

Balance: Compute governance should target the most dangerous
capabilities while allowing beneficial research to continue
```

---

## 6.10 Model Evaluations for Deployment Decisions

### Evaluation-Driven Deployment

One of the most practical applications of AI safety governance is using model evaluations to inform deployment decisions. This section describes how organizations can structure evaluation-driven deployment processes.

```python
from dataclasses import dataclass, field
from enum import Enum

class DeploymentDecision(Enum):
    APPROVE = "approve"
    APPROVE_WITH_CONDITIONS = "approve_with_conditions"
    DELAY = "delay"
    REJECT = "reject"

@dataclass
class DeploymentReadinessReport:
    """Comprehensive deployment readiness assessment."""
    model_name: str
    version: str
    evaluation_date: str

    # Safety evaluation results
    safety_scores: dict[str, float] = field(default_factory=dict)
    dangerous_capabilities: dict[str, dict] = field(
        default_factory=dict
    )
    red_team_results: dict = field(default_factory=dict)

    # Compliance assessment
    regulatory_compliance: dict[str, bool] = field(
        default_factory=dict
    )
    policy_compliance: dict[str, bool] = field(
        default_factory=dict
    )

    # Risk assessment
    identified_risks: list[dict] = field(default_factory=list)
    mitigations: list[dict] = field(default_factory=list)

    # Recommendation
    decision: DeploymentDecision = DeploymentDecision.DELAY
    conditions: list[str] = field(default_factory=list)
    justification: str = ""

def evaluate_deployment_readiness(
    model_info: dict,
    evaluation_results: dict,
    policy: dict,
) -> DeploymentReadinessReport:
    """
    Evaluate whether a model is ready for deployment.
    """
    report = DeploymentReadinessReport(
        model_name=model_info["name"],
        version=model_info["version"],
        evaluation_date=model_info["eval_date"],
    )

    # Check safety benchmarks
    safety_thresholds = policy.get("safety_thresholds", {})
    for benchmark, threshold in safety_thresholds.items():
        score = evaluation_results.get("benchmarks", {}).get(
            benchmark, 0
        )
        report.safety_scores[benchmark] = score

        if score < threshold:
            report.identified_risks.append({
                "type": "safety_benchmark_failure",
                "benchmark": benchmark,
                "score": score,
                "threshold": threshold,
                "severity": "high",
            })

    # Check dangerous capabilities
    capability_thresholds = policy.get(
        "capability_thresholds", {}
    )
    for capability, threshold in capability_thresholds.items():
        score = evaluation_results.get("capabilities", {}).get(
            capability, {}
        ).get("score", 0)
        report.dangerous_capabilities[capability] = {
            "score": score,
            "threshold": threshold,
            "exceeds": score > threshold,
        }

        if score > threshold:
            report.identified_risks.append({
                "type": "dangerous_capability",
                "capability": capability,
                "score": score,
                "threshold": threshold,
                "severity": "critical",
            })

    # Check red team results
    red_team = evaluation_results.get("red_team", {})
    critical_vulnerabilities = red_team.get(
        "critical_vulnerabilities", 0
    )
    if critical_vulnerabilities > 0:
        report.identified_risks.append({
            "type": "critical_red_team_vulnerabilities",
            "count": critical_vulnerabilities,
            "severity": "critical",
        })

    # Check regulatory compliance
    for regulation, required in policy.get(
        "required_compliance", {}
    ).items():
        compliant = evaluation_results.get(
            "compliance", {}
        ).get(regulation, False)
        report.regulatory_compliance[regulation] = compliant

        if required and not compliant:
            report.identified_risks.append({
                "type": "regulatory_non_compliance",
                "regulation": regulation,
                "severity": "high",
            })

    # Make deployment decision
    critical_risks = [
        r for r in report.identified_risks
        if r["severity"] == "critical"
    ]
    high_risks = [
        r for r in report.identified_risks
        if r["severity"] == "high"
    ]

    if critical_risks:
        report.decision = DeploymentDecision.REJECT
        report.justification = (
            f"Model has {len(critical_risks)} critical risks "
            f"that must be resolved before deployment."
        )
    elif high_risks:
        report.decision = DeploymentDecision.DELAY
        report.justification = (
            f"Model has {len(high_risks)} high-severity risks. "
            f"Address these before deployment."
        )
    else:
        report.decision = DeploymentDecision.APPROVE
        report.justification = (
            "Model meets all safety and compliance requirements."
        )

    return report
```

---

## 6.11 Chapter Summary

### Key Takeaways

1. **AI governance** requires multi-layered approaches spanning international, national, regional, industry, and organizational levels.

2. **The EU AI Act** establishes the world's first comprehensive risk-based AI regulation, with specific provisions for general-purpose AI models.

3. **US policy** relies on executive orders, NIST frameworks, and sector-specific guidance rather than comprehensive legislation.

4. **China's approach** emphasizes content control and security review, with mandatory registration and assessment requirements.

5. **International coordination** is essential but challenging due to competition dynamics, different values, and enforcement limitations.

6. **Voluntary commitments** provide a starting point but lack enforcement mechanisms and may be insufficient without binding regulation.

7. **Regulatory capture** is a significant risk in AI governance, requiring proactive measures to maintain regulatory independence.

8. **The open-source debate** has no easy answers — the right approach likely depends on model capability and risk level.

9. **Compute governance** offers a tangible control point but faces enforcement and international coordination challenges.

10. **Evaluation-driven deployment** provides a practical framework for making deployment decisions based on evidence.

### Questions for Reflection

- How do we balance innovation incentives with safety requirements in AI regulation?
- Should open-source AI models be subject to the same regulations as proprietary models?
- How can we prevent AI governance from being captured by the industry it regulates?
- What role should developing nations play in shaping international AI governance?

### Preview of Next Chapter

In Chapter 7, we survey the **organizations and research landscape** of AI safety — from frontier labs like Anthropic and DeepMind to research institutes like MIRI and ARC. Understanding who is doing what is essential for anyone entering the field.

---

*"Good governance of AI is not about stopping progress. It's about ensuring progress serves everyone."*
