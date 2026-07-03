import {
  Search,
  FileText,
  BookOpen,
  PenTool,
  ArrowRight,
  Check,
  Zap,
  Shield,
  Clock,
  ChevronRight,
} from "lucide-react";
import type { Page } from "./App";

interface LandingPageProps {
  setPage: (page: Page) => void;
}

export default function LandingPage({ setPage }: LandingPageProps) {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(201,162,39,0.08)_0%,_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(49,78,104,0.3)_0%,_transparent_60%)]" />

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
          <div className="animate-fade-in-up max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-sm text-accent">
              <Zap className="h-4 w-4" />
              AI-Powered Legal Research
            </div>
            <h1 className="font-[family-name:var(--font-heading)] text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              <span className="text-white">Research Indian Case Law</span>
              <br />
              <span className="bg-gradient-to-r from-accent to-accent-light bg-clip-text text-transparent">
                with AI Precision
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-navy-300 sm:text-xl">
              Search Supreme Court &amp; High Court judgments in seconds. Get AI-generated
              summaries, ratio decidendi, citation formats, and key legal principles — all in
              one platform built for the Indian legal system.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <button
                onClick={() => setPage("demo")}
                className="group flex items-center gap-2 rounded-lg bg-accent px-8 py-3.5 text-base font-semibold text-navy-950 shadow-lg shadow-accent/20 transition hover:bg-accent-light hover:shadow-accent/30"
              >
                Start Free Research
                <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
              </button>
              <a
                href="#features"
                className="flex items-center gap-2 rounded-lg border border-navy-600 px-8 py-3.5 text-base font-semibold text-navy-200 transition hover:border-navy-400 hover:text-white"
              >
                Learn More
              </a>
            </div>
            <div className="mt-10 flex items-center gap-6 text-sm text-navy-400">
              <span className="flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-accent" /> Confidential
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-accent" /> Instant Results
              </span>
              <span className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-accent" /> 1950–2026 Coverage
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-navy-800 bg-navy-900/50 py-10">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 sm:px-6 md:grid-cols-4 lg:px-8">
          {[
            { value: "5,00,000+", label: "Judgments Indexed" },
            { value: "38", label: "Courts Covered" },
            { value: "10,000+", label: "Legal Topics" },
            { value: "< 5s", label: "Average Query Time" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-[family-name:var(--font-heading)] text-3xl font-bold text-accent">
                {stat.value}
              </div>
              <div className="mt-1 text-sm text-navy-300">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-white sm:text-4xl">
              Powerful Features for Legal Professionals
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-navy-300">
              Everything you need to conduct thorough legal research on Indian case law, powered
              by advanced AI.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-xl border border-navy-800 bg-surface/50 p-6 transition hover:border-accent/40 hover:bg-surface"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-accent/10 text-accent transition group-hover:bg-accent/20">
                  {feature.icon}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-navy-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-y border-navy-800 bg-navy-900/30 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-white sm:text-4xl">
              How It Works
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-navy-300">
              Three simple steps to get the legal research you need.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step, i) => (
              <div key={step.title} className="relative text-center">
                {i < steps.length - 1 && (
                  <div className="absolute left-[60%] top-10 hidden w-[80%] border-t border-dashed border-navy-600 md:block" />
                )}
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-accent/50 bg-navy-900 text-xl font-bold text-accent">
                  {i + 1}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">{step.title}</h3>
                <p className="text-sm text-navy-300">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-14 text-center">
            <button
              onClick={() => setPage("demo")}
              className="group inline-flex items-center gap-2 rounded-lg bg-accent px-8 py-3.5 font-semibold text-navy-950 transition hover:bg-accent-light"
            >
              Try It Now <ChevronRight className="h-5 w-5 transition group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-white sm:text-4xl">
              Simple, Transparent Pricing
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-navy-300">
              Start free, scale when you need to. No hidden charges.
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-8 transition ${
                  plan.popular
                    ? "border-accent bg-gradient-to-b from-accent/5 to-transparent shadow-lg shadow-accent/10"
                    : "border-navy-700 bg-surface/50"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-accent px-4 py-1 text-xs font-bold text-navy-950">
                    MOST POPULAR
                  </div>
                )}
                <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold text-white">
                  {plan.name}
                </h3>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  {plan.period && (
                    <span className="ml-1 text-sm text-navy-400">/ {plan.period}</span>
                  )}
                </div>
                <p className="mt-2 text-sm text-navy-300">{plan.description}</p>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-navy-200">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => setPage("demo")}
                  className={`mt-8 w-full rounded-lg py-3 text-sm font-semibold transition ${
                    plan.popular
                      ? "bg-accent text-navy-950 hover:bg-accent-light"
                      : "border border-navy-600 text-navy-200 hover:border-navy-400 hover:text-white"
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-navy-800 bg-gradient-to-br from-navy-900 to-navy-950 py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-white sm:text-4xl">
            Ready to Transform Your Legal Research?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-navy-300">
            Join thousands of Indian lawyers who are already using AI to research case law faster
            and more accurately.
          </p>
          <button
            onClick={() => setPage("demo")}
            className="group mt-8 inline-flex items-center gap-2 rounded-lg bg-accent px-10 py-4 text-lg font-semibold text-navy-950 shadow-lg shadow-accent/20 transition hover:bg-accent-light"
          >
            Get Started Free
            <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
          </button>
        </div>
      </section>
    </>
  );
}

const features = [
  {
    icon: <Search className="h-6 w-6" />,
    title: "Judgment Search",
    description:
      "Search across 5 lakh+ Supreme Court and High Court judgments using natural language queries or specific legal references.",
  },
  {
    icon: <FileText className="h-6 w-6" />,
    title: "Citation Generation",
    description:
      "Auto-generate proper Indian legal citations in standard format — AIR, SCC, SCR and neutral citations.",
  },
  {
    icon: <BookOpen className="h-6 w-6" />,
    title: "Case Summaries",
    description:
      "Get AI-generated case summaries with ratio decidendi, facts, issues, and holdings in seconds.",
  },
  {
    icon: <PenTool className="h-6 w-6" />,
    title: "Legal Draft Assistant",
    description:
      "Generate legal drafts, petitions, and written submissions with proper case references and legal principles.",
  },
];

const steps = [
  {
    title: "Enter Your Query",
    description:
      'Type a legal question, statute reference, or case topic — e.g. "Section 138 NI Act" or "Article 21 right to privacy".',
  },
  {
    title: "AI Researches & Analyses",
    description:
      "Our AI searches through indexed judgments, identifies relevant cases, and extracts key legal principles and ratio decidendi.",
  },
  {
    title: "Get Structured Results",
    description:
      "Receive formatted case summaries, citations, key principles, and related judgments — ready to use in your pleadings.",
  },
];

const plans = [
  {
    name: "Starter",
    price: "Free",
    period: null,
    description: "For individual lawyers getting started with AI research.",
    popular: false,
    cta: "Start Free",
    features: [
      "10 queries per day",
      "Basic judgment search",
      "Case summaries",
      "Standard citations",
      "Email support",
    ],
  },
  {
    name: "Professional",
    price: "₹999",
    period: "month",
    description: "For active practitioners who need unlimited research.",
    popular: true,
    cta: "Subscribe Now",
    features: [
      "Unlimited queries",
      "Advanced search filters",
      "Legal draft generation",
      "Priority API access",
      "Downloadable reports",
      "WhatsApp support",
    ],
  },
  {
    name: "Enterprise",
    price: "₹4,999",
    period: "month",
    description: "For law firms and legal departments.",
    popular: false,
    cta: "Contact Sales",
    features: [
      "Everything in Professional",
      "Team collaboration (10 seats)",
      "Custom API integration",
      "Bulk research tools",
      "Dedicated account manager",
      "SLA guarantee",
    ],
  },
];
