import {
  Brain,
  CheckCircle,
  ChevronRight,
  IndianRupee,
  Mic,
  Network,
  Phone,
  ShoppingCart,
  Star,
  Store,
  Zap,
} from "lucide-react";
import { LANGUAGES } from "../data";

const iconMap = {
  mic: Mic,
  brain: Brain,
  network: Network,
  "indian-rupee": IndianRupee,
};

const FEATURES = [
  {
    icon: "mic" as const,
    title: "Voice Commerce",
    description:
      "Search and shop using your natural voice in any Indian language. Just speak like you talk to a local shopkeeper.",
  },
  {
    icon: "brain" as const,
    title: "Regional NLP",
    description:
      "Advanced natural language processing tuned for Indian languages — understands dialects, slang, and mixed-language queries.",
  },
  {
    icon: "network" as const,
    title: "ONDC Integration",
    description:
      "Connected to the Open Network for Digital Commerce. Compare prices across multiple sellers in your locality.",
  },
  {
    icon: "indian-rupee" as const,
    title: "UPI Voice-Pay",
    description:
      "Pay securely with UPI voice commands. No typing card details — just confirm with your voice and PIN.",
  },
];

const HOW_IT_WORKS = [
  {
    step: 1,
    title: "Select Language",
    description:
      "Choose from 12 Indian languages. Your entire shopping experience stays in your mother tongue.",
  },
  {
    step: 2,
    title: "Speak or Type",
    description:
      "Tell us what you need — in your language. 'Mujhe 1 litre tel chahiye' works just as well as 'I need 1L oil'.",
  },
  {
    step: 3,
    title: "Compare & Choose",
    description:
      "See products from multiple ONDC sellers with real prices, ratings, and delivery times.",
  },
  {
    step: 4,
    title: "Pay with UPI Voice",
    description:
      "Confirm your order and pay with UPI. Voice-verified for security. No app switching needed.",
  },
];

const PRICING_PLANS = [
  {
    name: "Starter",
    price: 0,
    period: "forever",
    description: "Perfect for trying out voice shopping",
    features: [
      "5 voice searches per day",
      "3 languages",
      "Basic product comparison",
      "ONDC price display",
    ],
    cta: "Start Free",
    highlighted: false,
  },
  {
    name: "Shopkeeper",
    price: 99,
    period: "/month",
    description: "For regular shoppers who want the best deals",
    features: [
      "Unlimited voice searches",
      "All 12 languages",
      "Advanced NLP with slang support",
      "Price alerts & deals",
      "UPI voice-pay integration",
      "Order history in your language",
    ],
    cta: "Start Shopping",
    highlighted: true,
  },
  {
    name: "Business",
    price: 499,
    period: "/month",
    description: "For sellers and shops on ONDC",
    features: [
      "Everything in Shopkeeper",
      "Multi-language product listings",
      "Voice-based inventory management",
      "Customer analytics dashboard",
      "API access for ONDC integration",
      "Dedicated support in your language",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

interface LandingPageProps {
  onNavigate: (page: "home" | "demo") => void;
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <Mic className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">
                VoiceCommerce
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a
                href="#features"
                className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors"
              >
                How It Works
              </a>
              <a
                href="#pricing"
                className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors"
              >
                Pricing
              </a>
              <button
                onClick={() => onNavigate("demo")}
                className="px-5 py-2.5 bg-primary-600 text-white rounded-xl font-semibold text-sm hover:bg-primary-700 transition-all shadow-md hover:shadow-lg"
              >
                Try Demo
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-gradient relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-400/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-8">
              <Zap className="w-4 h-4 text-warm-300" />
              <span className="text-sm font-medium text-white/90">
                ONDC Powered • 12 Languages • Voice-First
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-6">
              Shop in Your
              <br />
              <span className="text-warm-300">Mother Tongue</span>
            </h1>

            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed">
              India's first voice-first commerce assistant. Speak in Hindi,
              Kannada, Tamil, or any of 12 languages — and shop on ONDC like you
              talk to your local kirana store.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => onNavigate("demo")}
                className="group px-8 py-4 bg-white text-primary-700 rounded-2xl font-bold text-lg hover:bg-warm-50 transition-all shadow-xl hover:shadow-2xl flex items-center gap-2"
              >
                <Mic className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Try Voice Search
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <a
                href="#features"
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-2xl font-semibold text-lg hover:bg-white/20 transition-all"
              >
                Learn More
              </a>
            </div>

            {/* Language pills */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
              {LANGUAGES.slice(0, 8).map((lang) => (
                <span
                  key={lang.code}
                  className="px-3 py-1 bg-white/10 backdrop-blur-sm border border-white/15 rounded-full text-sm text-white/80 hover:bg-white/20 transition-colors cursor-default"
                >
                  {lang.nativeName}
                </span>
              ))}
              <span className="px-3 py-1 bg-white/10 backdrop-blur-sm border border-white/15 rounded-full text-sm text-white/80">
                +4 more
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="bg-primary-50 border-y border-primary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "12+", label: "Languages Supported" },
              { value: "50M+", label: "Potential Users" },
              { value: "1000+", label: "ONDC Sellers" },
              { value: "0%", label: "Commission Fee" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl md:text-4xl font-extrabold gradient-text">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500 mt-1 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold mb-4">
              Features
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Built for <span className="gradient-text">Bharat</span>
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Every feature designed for the real India — where people prefer
              speaking over typing and trust local sellers.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            {FEATURES.map((feature) => {
              const Icon = iconMap[feature.icon];
              return (
                <div
                  key={feature.title}
                  className="group bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:border-primary-200 transition-all duration-300"
                >
                  <div className="flex items-start gap-5">
                    <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gray-500 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold mb-4">
              How It Works
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Four Simple Steps
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              No app downloads, no complex registrations. Just speak and shop.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {HOW_IT_WORKS.map((item, idx) => (
              <div key={item.step} className="relative text-center">
                {/* Connector line */}
                {idx < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary-300 to-primary-100" />
                )}
                <div className="relative z-10 w-20 h-20 bg-gradient-to-br from-primary-500 to-accent-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-2xl font-extrabold text-white">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 md:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold mb-4">
              Pricing
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Simple, <span className="gradient-text">Honest</span> Pricing
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Start free. Upgrade when you're ready. No hidden charges — we
              believe in transparency.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {PRICING_PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`relative bg-white rounded-3xl p-8 shadow-sm border-2 transition-all duration-300 hover:shadow-xl ${
                  plan.highlighted
                    ? "border-primary-500 shadow-lg scale-[1.02]"
                    : "border-gray-100 hover:border-primary-200"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 bg-gradient-to-r from-primary-500 to-accent-500 text-white text-sm font-bold rounded-full shadow-md">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {plan.description}
                  </p>
                </div>
                <div className="mb-8">
                  <span className="text-5xl font-extrabold text-gray-900">
                    {plan.price === 0 ? "Free" : `₹${plan.price}`}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-gray-500 ml-1">{plan.period}</span>
                  )}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-600">{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => onNavigate("demo")}
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                    plan.highlighted
                      ? "bg-primary-600 text-white hover:bg-primary-700 shadow-md hover:shadow-lg"
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

      {/* CTA Section */}
      <section className="py-20 md:py-28 hero-gradient relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-20 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">
            Ready to Shop in Your Language?
          </h2>
          <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto">
            Join thousands of Indians who are discovering the joy of shopping in
            their mother tongue. Try our voice demo now.
          </p>
          <button
            onClick={() => onNavigate("demo")}
            className="group px-10 py-5 bg-white text-primary-700 rounded-2xl font-bold text-lg hover:bg-warm-50 transition-all shadow-xl hover:shadow-2xl inline-flex items-center gap-3"
          >
            <Mic className="w-6 h-6 group-hover:scale-110 transition-transform" />
            Launch Voice Demo
            <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                  <Mic className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">VoiceCommerce</span>
              </div>
              <p className="text-gray-400 leading-relaxed max-w-sm">
                Making digital commerce accessible to every Indian, in their own
                language. Powered by ONDC.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a
                    href="#features"
                    className="hover:text-primary-400 transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="hover:text-primary-400 transition-colors"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate("demo")}
                    className="hover:text-primary-400 transition-colors"
                  >
                    Demo
                  </button>
                </li>
                <li>
                  <a href="#" className="hover:text-primary-400 transition-colors">
                    API Docs
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>+91 1800-ONDC-HELP</span>
                </li>
                <li className="flex items-center gap-2">
                  <Store className="w-4 h-4" />
                  <span>Seller Portal</span>
                </li>
                <li className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4" />
                  <span>ONDC Network</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              © 2026 VoiceCommerce. Made in India, for India.
            </p>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <span>Built with</span>
              <Star className="w-4 h-4 text-primary-400 fill-primary-400" />
              <span>for ONDC</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
