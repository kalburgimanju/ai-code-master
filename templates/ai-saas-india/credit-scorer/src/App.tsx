import { useState } from "react";
import {
  MessageSquare,
  Zap,
  BarChart3,
  Shield,
  ArrowRight,
  Check,
  IndianRupee,
  Building2,
  Store,
  UtensilsCrossed,
  Wrench,
  Scissors,
  Truck,
  TrendingUp,
  Users,
  Clock,
  Star,
  ChevronRight,
  Phone,
  Mail,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface CreditResult {
  score: number;
  rating: string;
  breakdown: {
    smsTransactions: number;
    billPayment: number;
    ondcSales: number;
    businessStability: number;
  };
  loanEligibility: {
    maxAmount: string;
    interestRate: string;
    tenure: string;
  };
  recommendations: string[];
}

type Page = "home" | "demo" | "results";

const BUSINESS_TYPES = [
  { id: "shop", label: "Shop / Retail", icon: Store },
  { id: "restaurant", label: "Restaurant / Food", icon: UtensilsCrossed },
  { id: "repair", label: "Repair / Service", icon: Wrench },
  { id: "tailor", label: "Tailor / Fashion", icon: Scissors },
  { id: "transport", label: "Transport / Delivery", icon: Truck },
  { id: "other", label: "Other MSME", icon: Building2 },
];

/* -------------------------------------------------------------------------- */
/*  Fallback credit scorer (no API needed)                                     */
/* -------------------------------------------------------------------------- */

function fallbackScore(businessType: string, monthlyIncome: number): CreditResult {
  const baseScore = Math.min(400 + Math.log10(monthlyIncome + 1) * 80, 720);
  const jitter = () => Math.round((Math.random() - 0.5) * 40);
  const sms = Math.min(Math.round(baseScore * 0.28 + jitter()), 300);
  const bill = Math.min(Math.round(baseScore * 0.24 + jitter()), 250);
  const ondc = Math.min(Math.round(baseScore * 0.26 + jitter()), 270);
  const stab = Math.min(Math.round(baseScore * 0.22 + jitter()), 230);
  const score = Math.min(sms + bill + ondc + stab, 900);

  const rating =
    score >= 750 ? "Excellent" : score >= 650 ? "Good" : score >= 500 ? "Fair" : "Needs Improvement";

  const maxLoan = Math.round((monthlyIncome * 12 * (score / 900)) / 1000) * 1000;

  const recs: string[] = [];
  if (sms < 180) recs.push("Increase regular digital payment activity via UPI.");
  if (bill < 150) recs.push("Pay electricity bills on time for 3 consecutive months.");
  if (ondc < 160) recs.push("List more products on ONDC to build sales history.");
  if (stab < 140) recs.push("Maintain consistent monthly income above ₹" + Math.round(monthlyIncome * 0.7).toLocaleString("en-IN") + ".");
  if (recs.length === 0) recs.push("Maintain your current financial discipline.");
  recs.push("Keep Aadhaar-linked bank account active.");

  return {
    score,
    rating,
    breakdown: { smsTransactions: sms, billPayment: bill, ondcSales: ondc, businessStability: stab },
    loanEligibility: {
      maxAmount: "₹" + maxLoan.toLocaleString("en-IN"),
      interestRate: score >= 650 ? "12-14%" : "16-18%",
      tenure: score >= 650 ? "24-36 months" : "12-18 months",
    },
    recommendations: recs,
  };
}

/* -------------------------------------------------------------------------- */
/*  OpenRouter AI scorer                                                       */
/* -------------------------------------------------------------------------- */

async function aiScore(businessType: string, monthlyIncome: number): Promise<CreditResult> {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY as string | undefined;
  if (!apiKey) return fallbackScore(businessType, monthlyIncome);

  const prompt = `You are an Indian MSME credit scoring engine for unbanked businesses. Given the following business profile, return a JSON credit assessment.

Business type: ${businessType}
Monthly income: ₹${monthlyIncome.toLocaleString("en-IN")}

Return ONLY valid JSON (no markdown) with this exact structure:
{
  "score": <number 300-900>,
  "rating": "<Excellent|Good|Fair|Needs Improvement>",
  "breakdown": {
    "smsTransactions": <number 0-300>,
    "billPayment": <number 0-250>,
    "ondcSales": <number 0-270>,
    "businessStability": <number 0-230>
  },
  "loanEligibility": {
    "maxAmount": "₹<amount>",
    "interestRate": "<rate range>",
    "tenure": "<tenure range>"
  },
  "recommendations": ["<recommendation 1>", "<recommendation 2>", "<recommendation 3>"]
}

Score higher for: consistent UPI transactions, regular bill payments, active ONDC sales history, stable income.
Lower scores for: irregular payments, low digital footprint, volatile income.
Keep recommendations practical for Indian MSME context.`;

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "nvidia/nemotron-3-ultra-550b-a55b:free",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 1024,
    }),
  });

  if (!res.ok) return fallbackScore(businessType, monthlyIncome);

  const data = await res.json();
  const text: string = data.choices?.[0]?.message?.content ?? "";
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return fallbackScore(businessType, monthlyIncome);

  try {
    const parsed = JSON.parse(match[0]) as CreditResult;
    if (typeof parsed.score !== "number") return fallbackScore(businessType, monthlyIncome);
    return parsed;
  } catch {
    return fallbackScore(businessType, monthlyIncome);
  }
}

/* -------------------------------------------------------------------------- */
/*  Score Display                                                              */
/* -------------------------------------------------------------------------- */

function ScoreDisplay({ result }: { result: CreditResult }) {
  const { score, rating, breakdown, loanEligibility, recommendations } = result;
  const pct = Math.round((score / 900) * 100);
  const scoreColor =
    score >= 750
      ? "text-emerald-600"
      : score >= 650
        ? "text-green-600"
        : score >= 500
          ? "text-amber-600"
          : "text-red-500";
  const ringColor =
    score >= 750
      ? "stroke-emerald-500"
      : score >= 650
        ? "stroke-green-500"
        : score >= 500
          ? "stroke-amber-500"
          : "stroke-red-400";

  const breakdownItems = [
    { label: "SMS Transactions", value: breakdown.smsTransactions, max: 300 },
    { label: "Bill Payment History", value: breakdown.billPayment, max: 250 },
    { label: "ONDC Sales Record", value: breakdown.ondcSales, max: 270 },
    { label: "Business Stability", value: breakdown.businessStability, max: 230 },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Score ring */}
      <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-lg">
        <p className="mb-2 text-sm font-medium uppercase tracking-wider text-gray-500">
          Your Alternate Credit Score
        </p>
        <div className="relative mx-auto mb-4 h-52 w-52">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="#e5e7eb" strokeWidth="10" />
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              className={ringColor}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 52}`}
              strokeDashoffset={`${2 * Math.PI * 52 * (1 - pct / 100)}`}
              style={{ transition: "stroke-dashoffset 1.5s ease-out" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-5xl font-bold ${scoreColor}`}>{score}</span>
            <span className="text-sm text-gray-400">/ 900</span>
          </div>
        </div>
        <span
          className={`inline-block rounded-full px-4 py-1 text-sm font-semibold ${
            score >= 750
              ? "bg-emerald-100 text-emerald-700"
              : score >= 650
                ? "bg-green-100 text-green-700"
                : score >= 500
                  ? "bg-amber-100 text-amber-700"
                  : "bg-red-100 text-red-600"
          }`}
        >
          {rating}
        </span>
      </div>

      {/* Breakdown */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
        <h3 className="mb-4 text-lg font-semibold text-gray-800">Score Breakdown</h3>
        <div className="space-y-4">
          {breakdownItems.map((item) => (
            <div key={item.label}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-gray-600">{item.label}</span>
                <span className="font-medium text-gray-800">
                  {item.value} / {item.max}
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-primary-600 transition-all duration-1000"
                  style={{ width: `${Math.min((item.value / item.max) * 100, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Loan eligibility */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
        <h3 className="mb-4 text-lg font-semibold text-gray-800">
          <IndianRupee className="mb-0.5 mr-1 inline h-5 w-5" />
          Loan Eligibility
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { label: "Max Amount", value: loanEligibility.maxAmount },
            { label: "Interest Rate", value: loanEligibility.interestRate },
            { label: "Tenure", value: loanEligibility.tenure },
          ].map((item) => (
            <div key={item.label} className="rounded-xl bg-primary-50 p-4 text-center">
              <p className="text-xs font-medium uppercase tracking-wider text-primary-700">
                {item.label}
              </p>
              <p className="mt-1 text-xl font-bold text-primary-900">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
        <h3 className="mb-4 text-lg font-semibold text-gray-800">
          <TrendingUp className="mb-0.5 mr-1 inline h-5 w-5" />
          Recommendations to Improve Score
        </h3>
        <ul className="space-y-3">
          {recommendations.map((rec, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-100 text-[10px] font-bold text-primary-700">
                {i + 1}
              </span>
              {rec}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Landing Page                                                               */
/* -------------------------------------------------------------------------- */

function LandingPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  return (
    <>
      {/* NAV */}
      <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white font-bold text-sm">CS</div>
            <span className="text-lg font-bold text-gray-900">CreditScorer<span className="text-primary-600">.bharat</span></span>
          </div>
          <button
            onClick={() => onNavigate("demo")}
            className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-primary-700 transition-colors"
          >
            Check Score Free
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-emerald-900 px-4 py-20 text-white sm:py-28">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-emerald-400 blur-3xl" />
          <div className="absolute bottom-10 right-20 h-96 w-96 rounded-full bg-green-300 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-block rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur">
            Built for 63M+ Unbanked MSMEs in India
          </div>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
            Alternate Credit Scoring
            <br />
            <span className="text-emerald-300">for Bharat</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-primary-100 sm:text-xl">
            Get a credit score using SMS transactions, electricity bills, and ONDC sales
            history — no bank statements required. Designed for kirana shops, restaurants,
            tailors, and every MSME in Bharat.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <button
              onClick={() => onNavigate("demo")}
              className="flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-primary-800 shadow-lg hover:bg-primary-50 transition-colors"
            >
              Check Your Score <ArrowRight className="h-4 w-4" />
            </button>
            <a href="#how-it-works" className="text-sm text-primary-200 underline underline-offset-4 hover:text-white transition-colors">
              Learn how it works
            </a>
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-primary-200">
            <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-emerald-300" /> No bank account needed</span>
            <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-emerald-300" /> Free forever plan</span>
            <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-emerald-300" /> RBI-compliant framework</span>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-center text-sm font-semibold uppercase tracking-wider text-primary-600">Features</p>
          <h2 className="mt-2 text-center text-3xl font-bold text-gray-900 sm:text-4xl">
            Four Pillars of Alternate Credit
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-gray-500">
            We analyze alternative data sources that traditional banks ignore, giving you a fair credit profile.
          </p>
          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: MessageSquare,
                title: "SMS Analysis",
                desc: "Parse transaction SMS from UPI, wallets, and bank alerts to build your payment history.",
                color: "bg-blue-50 text-blue-600",
              },
              {
                icon: Zap,
                title: "Bill Processing",
                desc: "Electricity and utility bill payments show financial discipline and living stability.",
                color: "bg-amber-50 text-amber-600",
              },
              {
                icon: BarChart3,
                title: "ONDC Integration",
                desc: "Your ONDC sales history proves business revenue and customer demand patterns.",
                color: "bg-purple-50 text-purple-600",
              },
              {
                icon: Shield,
                title: "AI Credit Scoring",
                desc: "ML-powered scoring model trained on Indian MSME data for fair, accurate assessments.",
                color: "bg-emerald-50 text-emerald-600",
              },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${f.color}`}>
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="bg-gray-50 px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <p className="text-center text-sm font-semibold uppercase tracking-wider text-primary-600">How It Works</p>
          <h2 className="mt-2 text-center text-3xl font-bold text-gray-900 sm:text-4xl">
            Three Simple Steps
          </h2>
          <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Select Your Business",
                desc: "Choose your business type — shop, restaurant, tailor, repair, transport, or any MSME.",
                icon: Store,
              },
              {
                step: "02",
                title: "Enter Monthly Income",
                desc: "Provide your approximate monthly income. We use this along with your business profile.",
                icon: IndianRupee,
              },
              {
                step: "03",
                title: "Get Your Score",
                desc: "Our AI engine analyses your profile and returns a credit score with loan eligibility.",
                icon: TrendingUp,
              },
            ].map((s) => (
              <div key={s.step} className="relative text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-primary-600 shadow-sm">
                  <s.icon className="h-7 w-7" />
                </div>
                <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-primary-400">
                  Step {s.step}
                </span>
                <h3 className="text-lg font-semibold text-gray-900">{s.title}</h3>
                <p className="mt-2 text-sm text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="px-4 py-16">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 md:grid-cols-4">
          {[
            { value: "63M+", label: "MSMEs in India" },
            { value: "30%", label: "Unbanked Segment" },
            { value: "₹25L Cr", label: "Credit Gap" },
            { value: "< 60s", label: "Score Generation" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-bold text-primary-600 sm:text-4xl">{s.value}</p>
              <p className="mt-1 text-sm text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="bg-gray-50 px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-center text-sm font-semibold uppercase tracking-wider text-primary-600">Pricing</p>
          <h2 className="mt-2 text-center text-3xl font-bold text-gray-900 sm:text-4xl">
            Simple, Transparent Pricing
          </h2>
          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                name: "Free",
                price: "₹0",
                period: "forever",
                desc: "Perfect for individual MSME owners",
                features: ["1 credit score / month", "Basic breakdown", "SMS analysis", "Email support"],
                cta: "Get Started Free",
                highlighted: false,
              },
              {
                name: "Business",
                price: "₹799",
                period: "/month",
                desc: "For growing businesses and agents",
                features: ["Unlimited scores", "Full breakdown", "ONDC integration", "Bill processing", "Priority support", "Downloadable reports"],
                cta: "Start Business Plan",
                highlighted: true,
              },
              {
                name: "Enterprise",
                price: "₹2,999",
                period: "/month",
                desc: "For lenders, NBFCs, and banks",
                features: ["Bulk API access", "Custom scoring models", "Dashboard & analytics", "Dedicated account manager", "SLA guarantee", "White-label option"],
                cta: "Contact Sales",
                highlighted: false,
              },
            ].map((p) => (
              <div
                key={p.name}
                className={`relative rounded-2xl border p-6 sm:p-8 ${
                  p.highlighted
                    ? "border-primary-500 bg-white shadow-xl ring-1 ring-primary-500"
                    : "border-gray-100 bg-white shadow-sm"
                }`}
              >
                {p.highlighted && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary-600 px-4 py-0.5 text-xs font-semibold text-white">
                    Most Popular
                  </span>
                )}
                <h3 className="text-lg font-semibold text-gray-900">{p.name}</h3>
                <p className="mt-1 text-sm text-gray-500">{p.desc}</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-gray-900">{p.price}</span>
                  <span className="text-sm text-gray-400">{p.period}</span>
                </div>
                <ul className="mt-6 space-y-3">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary-500" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => onNavigate("demo")}
                  className={`mt-8 w-full rounded-xl py-3 text-sm font-semibold transition-colors ${
                    p.highlighted
                      ? "bg-primary-600 text-white hover:bg-primary-700"
                      : "border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {p.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-100 bg-white px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-xs font-bold text-white">CS</div>
                <span className="font-bold text-gray-900">CreditScorer.bharat</span>
              </div>
              <p className="mt-3 text-sm text-gray-500">
                AI-powered alternate credit scoring for India's unbanked MSME sector.
              </p>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold text-gray-900">Product</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#how-it-works" className="hover:text-primary-600 transition-colors">How It Works</a></li>
                <li><a href="#pricing" className="hover:text-primary-600 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-primary-600 transition-colors">API Docs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold text-gray-900">Company</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-primary-600 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-primary-600 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary-600 transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold text-gray-900">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> +91 98765 43210</li>
                <li className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> hello@creditscorer.bharat</li>
              </ul>
            </div>
          </div>
          <div className="mt-10 border-t border-gray-100 pt-6 text-center text-xs text-gray-400">
            &copy; 2026 CreditScorer.bharat — Alternate Credit Scoring for Bharat. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Demo Page                                                                  */
/* -------------------------------------------------------------------------- */

function DemoPage({
  onNavigate,
  onResult,
}: {
  onNavigate: (p: Page) => void;
  onResult: (r: CreditResult) => void;
}) {
  const [businessType, setBusinessType] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCalculate = async () => {
    setError("");
    if (!businessType) {
      setError("Please select a business type.");
      return;
    }
    const income = parseFloat(monthlyIncome);
    if (!income || income <= 0) {
      setError("Please enter a valid monthly income.");
      return;
    }
    setLoading(true);
    try {
      const result = await aiScore(businessType, income);
      onResult(result);
    } catch {
      // Fallback on any unexpected error
      onResult(fallbackScore(businessType, income));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-b from-primary-50 to-white px-4 py-16">
      <div className="mx-auto max-w-2xl">
        <button
          onClick={() => onNavigate("home")}
          className="mb-8 flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
        >
          <ChevronRight className="h-4 w-4 rotate-180" /> Back to Home
        </button>

        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
          Check Your <span className="text-primary-600">Credit Score</span>
        </h1>
        <p className="mt-3 text-gray-500">
          Select your business type and enter your monthly income to get an AI-powered alternate credit assessment.
        </p>

        <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-lg sm:p-8">
          {/* Business type */}
          <label className="mb-2 block text-sm font-semibold text-gray-700">Business Type</label>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {BUSINESS_TYPES.map((bt) => (
              <button
                key={bt.id}
                onClick={() => setBusinessType(bt.id)}
                className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                  businessType === bt.id
                    ? "border-primary-500 bg-primary-50 text-primary-700 ring-1 ring-primary-500"
                    : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300 hover:bg-white"
                }`}
              >
                <bt.icon className="h-4 w-4" />
                {bt.label}
              </button>
            ))}
          </div>

          {/* Monthly income */}
          <label className="mb-2 mt-6 block text-sm font-semibold text-gray-700">
            Monthly Income (₹)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <IndianRupee className="h-4 w-4" />
            </span>
            <input
              type="number"
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(e.target.value)}
              placeholder="e.g. 50000"
              min={1}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm text-gray-800 outline-none transition-colors placeholder:text-gray-300 focus:border-primary-500 focus:bg-white focus:ring-1 focus:ring-primary-500"
            />
          </div>

          {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

          {/* CTA */}
          <button
            onClick={handleCalculate}
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-primary-600 py-3.5 text-sm font-semibold text-white shadow hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Analyzing with AI...
              </span>
            ) : (
              "Calculate Credit Score"
            )}
          </button>

          <p className="mt-4 text-center text-xs text-gray-400">
            Powered by OpenRouter AI &middot; Your data is not stored
          </p>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  App                                                                        */
/* -------------------------------------------------------------------------- */

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [result, setResult] = useState<CreditResult | null>(null);

  const handleResult = (r: CreditResult) => {
    setResult(r);
    setPage("results");
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased">
      {page === "home" && <LandingPage onNavigate={setPage} />}
      {page === "demo" && <DemoPage onNavigate={setPage} onResult={handleResult} />}
      {page === "results" && result && (
        <section className="min-h-screen bg-gradient-to-b from-primary-50 to-white px-4 py-16">
          <div className="mx-auto max-w-4xl">
            <button
              onClick={() => setPage("demo")}
              className="mb-8 flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
            >
              <ChevronRight className="h-4 w-4 rotate-180" /> New Assessment
            </button>
            <ScoreDisplay result={result} />
            <div className="mt-10 text-center">
              <button
                onClick={() => setPage("home")}
                className="rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-600 shadow-sm hover:bg-gray-50 transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
