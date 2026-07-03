import {
  FileText,
  Search,
  FileJson,
  Zap,
  Check,
  ArrowRight,
  Upload,
  Cpu,
  Download,
  Star,
} from "lucide-react";

interface LandingPageProps {
  onNavigateToDemo: () => void;
}

const features = [
  {
    icon: FileText,
    title: "Invoice Extraction",
    description:
      "Upload or paste your invoice text and our AI automatically extracts all line items, amounts, tax details, and GSTIN numbers.",
  },
  {
    icon: Search,
    title: "HSN Code Mapping",
    description:
      "Automatically map every product and service to its correct HSN code using our trained AI with 99%+ accuracy.",
  },
  {
    icon: FileJson,
    title: "GSTR-1 JSON Generation",
    description:
      "Generate ready-to-upload GSTR-1 JSON files that comply with GSTN schema. No manual data entry needed.",
  },
  {
    icon: Zap,
    title: "GST Filing Automation",
    description:
      "End-to-end automation from invoice to filing. Schedule recurring filings and never miss a deadline.",
  },
];

const steps = [
  {
    icon: Upload,
    step: "01",
    title: "Upload Invoices",
    description: "Paste invoice text or upload your invoice PDFs. Our AI reads and understands every detail.",
  },
  {
    icon: Cpu,
    step: "02",
    title: "AI Processes Data",
    description: "Our AI extracts line items, maps HSN codes, calculates taxes, and validates GSTIN numbers.",
  },
  {
    icon: Download,
    step: "03",
    title: "Get GSTR-1 Ready Files",
    description: "Download your GSTR-1 JSON or CSV ready for direct upload to the GST portal.",
  },
];

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "/month",
    description: "Perfect for trying out the platform",
    features: [
      "10 invoices per month",
      "Basic HSN mapping",
      "GSTR-1 JSON export",
      "Email support",
    ],
    cta: "Get Started Free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "₹999",
    period: "/month",
    description: "For growing businesses and accountants",
    features: [
      "500 invoices per month",
      "Advanced HSN mapping",
      "GSTR-1 & GSTR-3B export",
      "Bulk invoice processing",
      "Priority support",
      "GSTIN validation",
    ],
    cta: "Start Pro Plan",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "₹4999",
    period: "/month",
    description: "For CA firms and large organizations",
    features: [
      "Unlimited invoices",
      "Multi-client management",
      "All GST returns (GSTR-1/3B/9)",
      "API access",
      "Dedicated account manager",
      "Custom integrations",
      "Audit trail",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

function LandingPage({ onNavigateToDemo }: LandingPageProps) {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-900 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 text-sm">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              Trusted by 2,000+ Indian businesses
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Automate Your GST Filing with{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-300">
                AI Intelligence
              </span>
            </h1>
            <p className="text-lg md:text-xl text-indigo-100 mb-8 max-w-2xl">
              From invoice extraction to GSTR-1 JSON generation — let AI handle your GST compliance.
              Built for Indian MSMEs, CAs, and accountants.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={onNavigateToDemo}
                className="inline-flex items-center justify-center gap-2 bg-white text-primary-700 px-8 py-3.5 rounded-xl font-semibold text-lg hover:bg-indigo-50 transition-colors shadow-lg cursor-pointer"
              >
                Try Free Demo
                <ArrowRight className="w-5 h-5" />
              </button>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm text-white px-8 py-3.5 rounded-xl font-semibold text-lg hover:bg-white/20 transition-colors border border-white/20"
              >
                Learn More
              </a>
            </div>
            <p className="mt-4 text-sm text-indigo-200">
              No credit card required. 10 free invoices per month.
            </p>
          </div>
        </div>
        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" className="w-full">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for GST Compliance
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our AI agent handles the entire GST workflow — from reading invoices to filing returns.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group p-8 rounded-2xl border border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-14 h-14 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center mb-5 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 md:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Three simple steps to automate your GST compliance.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.step} className="relative text-center">
                  {i < steps.length - 1 && (
                    <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary-300 to-primary-100" />
                  )}
                  <div className="relative z-10 w-24 h-24 mx-auto rounded-2xl bg-white shadow-lg border border-gray-100 flex items-center justify-center mb-6">
                    <Icon className="w-10 h-10 text-primary-600" />
                  </div>
                  <span className="inline-block text-sm font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded-full mb-3">
                    Step {step.step}
                  </span>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed max-w-sm mx-auto">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Start free, upgrade as you grow. All prices in INR.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative p-8 rounded-2xl border-2 transition-all duration-300 ${
                  plan.highlighted
                    ? "border-primary-600 shadow-xl scale-[1.02]"
                    : "border-gray-200 hover:border-primary-200"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-sm font-semibold px-4 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-500 text-sm mb-4">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-500">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-primary-600 mt-0.5 shrink-0" />
                      <span className="text-gray-600">{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={onNavigateToDemo}
                  className={`w-full py-3 rounded-xl font-semibold transition-colors cursor-pointer ${
                    plan.highlighted
                      ? "bg-primary-600 text-white hover:bg-primary-700"
                      : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-primary-600 to-indigo-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Automate Your GST Filing?
          </h2>
          <p className="text-lg text-indigo-100 mb-8 max-w-2xl mx-auto">
            Join thousands of Indian businesses saving hours every month with AI-powered GST automation.
          </p>
          <button
            onClick={onNavigateToDemo}
            className="inline-flex items-center gap-2 bg-white text-primary-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-indigo-50 transition-colors shadow-lg cursor-pointer"
          >
            Start Free Demo Now
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <svg className="w-7 h-7" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="#4f46e5" />
                <text x="16" y="22" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">
                  GST
                </text>
              </svg>
              GST Automation Agent
            </div>
            <p className="text-sm">
              &copy; {new Date().getFullYear()} GST Automation Agent. Built for Indian MSMEs.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
