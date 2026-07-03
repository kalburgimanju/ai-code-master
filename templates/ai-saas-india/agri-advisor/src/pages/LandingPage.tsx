import {
  Satellite,
  Leaf,
  CloudSun,
  Globe,
  ChevronRight,
  Sprout,
  BarChart3,
  ShieldCheck,
  Phone,
} from "lucide-react";
import type { Page } from "../App";

interface Props {
  onNavigate: (page: Page) => void;
}

const FEATURES = [
  {
    icon: Satellite,
    title: "Satellite Monitoring",
    desc: "Real-time NDVI and crop stress analysis using ISRO and Sentinel satellite data to track field health from space.",
  },
  {
    icon: Leaf,
    title: "Crop Health Analysis",
    desc: "AI-powered diagnosis of nutrient deficiencies, disease onset, and growth anomalies before they become visible.",
  },
  {
    icon: CloudSun,
    title: "Weather Integration",
    desc: "Hyper-local weather forecasts and IMD alerts integrated with crop calendars for optimal planting and harvest timing.",
  },
  {
    icon: Globe,
    title: "Regional Language Support",
    desc: "Get expert advice in Hindi, Tamil, Telugu, Bengali, Marathi, Kannada and more — farming guidance in your language.",
  },
];

const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Select Your Farm Details",
    desc: "Choose your state, crop type, and soil conditions from our comprehensive Indian agriculture database.",
  },
  {
    step: "2",
    title: "AI Analyzes Your Data",
    desc: "Our AI combines satellite imagery, weather data, soil reports, and agricultural research for your specific location.",
  },
  {
    step: "3",
    title: "Get Actionable Advice",
    desc: "Receive tailored recommendations for irrigation, fertilization, pest control, and yield optimization.",
  },
];

const PRICING_PLANS = [
  {
    name: "Kisan",
    price: "Free",
    period: "",
    desc: "Perfect for small farmers getting started with precision agriculture",
    features: [
      "5 queries per month",
      "Basic crop analysis",
      "Weather alerts",
      "Hindi & English",
    ],
    cta: "Start Free",
    highlight: false,
  },
  {
    name: "Krishi Pro",
    price: "₹499",
    period: "/month",
    desc: "For progressive farmers and agricultural cooperatives",
    features: [
      "Unlimited queries",
      "Satellite NDVI maps",
      "Pest outbreak alerts",
      "All regional languages",
      "Soil health reports",
      "Market price insights",
    ],
    cta: "Start Free Trial",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    desc: "For agri-businesses, FPOs, and government programs",
    features: [
      "Everything in Krishi Pro",
      "API access",
      "Bulk farm analysis",
      "Custom dashboards",
      "Dedicated support",
      "Multi-language voice interface",
    ],
    cta: "Contact Sales",
    highlight: false,
  },
];

export default function LandingPage({ onNavigate }: Props) {
  return (
    <div>
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-primary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sprout className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold text-primary-800">
              AI Agronomist
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-primary transition-colors">
              Features
            </a>
            <a
              href="#how-it-works"
              className="hover:text-primary transition-colors"
            >
              How It Works
            </a>
            <a href="#pricing" className="hover:text-primary transition-colors">
              Pricing
            </a>
          </div>
          <button
            onClick={() => onNavigate("demo")}
            className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-primary-dark transition-colors shadow-sm"
          >
            Try Demo
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-primary-100">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-primary-light rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-800 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <Satellite className="w-4 h-4" />
              Satellite-Powered Precision Farming
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
              Smart Farming Advice for{" "}
              <span className="text-primary">Indian Farmers</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
              Get AI-powered crop recommendations, soil analysis, and weather
              alerts using satellite data — in your regional language. From Punjab
              to Tamil Nadu, grow smarter with technology.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => onNavigate("demo")}
                className="bg-primary text-white px-8 py-3.5 rounded-xl text-lg font-semibold hover:bg-primary-dark transition-all shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 flex items-center justify-center gap-2"
              >
                Get Farming Advice
                <ChevronRight className="w-5 h-5" />
              </button>
              <a
                href="#how-it-works"
                className="border-2 border-primary-200 text-primary-700 px-8 py-3.5 rounded-xl text-lg font-semibold hover:bg-primary-50 transition-colors flex items-center justify-center gap-2"
              >
                Learn More
              </a>
            </div>
            <div className="flex items-center gap-6 mt-10 text-sm text-gray-500">
              <div className="flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-primary" />
                10,000+ farmers served
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-primary" />
                ISRO satellite data
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-primary" />
                Works on any phone
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for{" "}
              <span className="text-primary">Precision Agriculture</span>
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Combining cutting-edge AI with India's agricultural expertise to
              deliver personalized farming guidance.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group p-8 rounded-2xl border border-gray-100 hover:border-primary-200 hover:shadow-lg hover:shadow-primary-50 transition-all bg-gradient-to-br from-white to-primary-50/30"
              >
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-white transition-colors">
                  <f.icon className="w-6 h-6 text-primary group-hover:text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {f.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-500">
              Three simple steps to smarter farming decisions
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-5 shadow-lg shadow-primary/25">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple, Affordable Pricing
            </h2>
            <p className="text-lg text-gray-500">
              Plans designed for every scale of Indian agriculture
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {PRICING_PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 border-2 transition-all ${
                  plan.highlight
                    ? "border-primary bg-gradient-to-b from-primary-50 to-white shadow-xl shadow-primary/10 scale-[1.02]"
                    : "border-gray-100 hover:border-primary-100"
                }`}
              >
                {plan.highlight && (
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-3">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                <div className="mt-3 mb-2">
                  <span className="text-4xl font-extrabold text-gray-900">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-gray-400 text-sm">{plan.period}</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mb-6">{plan.desc}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feat) => (
                    <li
                      key={feat}
                      className="flex items-start gap-2 text-sm text-gray-600"
                    >
                      <ShieldCheck className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => onNavigate("demo")}
                  className={`w-full py-3 rounded-xl text-sm font-semibold transition-colors ${
                    plan.highlight
                      ? "bg-primary text-white hover:bg-primary-dark shadow-md shadow-primary/20"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary-900 text-primary-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Sprout className="w-6 h-6 text-primary-300" />
              <span className="text-lg font-bold text-white">
                AI Agronomist
              </span>
            </div>
            <p className="text-sm text-primary-300 text-center">
              Empowering Indian farmers with satellite-powered AI agriculture
              advice. Made with{" "}
              <span className="text-red-400">♥</span> for Indian agriculture.
            </p>
            <p className="text-xs text-primary-400">
              © 2026 AI Agronomist India
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
