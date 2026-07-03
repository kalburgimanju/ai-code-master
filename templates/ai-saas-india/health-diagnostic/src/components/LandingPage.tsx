import {
  Camera,
  Mic,
  Globe,
  WifiOff,
  ArrowRight,
  CheckCircle2,
  Shield,
  Zap,
  Activity,
  Star,
  Users,
  Stethoscope,
} from "lucide-react";

interface LandingPageProps {
  onNavigateToDemo: () => void;
}

const features = [
  {
    icon: Camera,
    title: "Image Analysis",
    description:
      "Upload a photo of skin conditions, eye redness, or rashes. Our AI analyzes visual symptoms instantly.",
  },
  {
    icon: Mic,
    title: "Audio Diagnosis",
    description:
      "Record a cough sample. Our AI can detect patterns indicative of respiratory issues from audio analysis.",
  },
  {
    icon: Globe,
    title: "Multilingual Support",
    description:
      "Available in 12+ Indian languages. Get diagnostic reports in your local language for better understanding.",
  },
  {
    icon: WifiOff,
    title: "Offline Ready",
    description:
      "Core features work offline. Once connected, sync results with cloud for detailed analysis and records.",
  },
];

const steps = [
  {
    step: "1",
    title: "Select Symptoms",
    description: "Choose your symptoms from our guided checklist or upload media.",
  },
  {
    step: "2",
    title: "AI Analysis",
    description:
      "Our AI agent analyzes your input using medical knowledge databases.",
  },
  {
    step: "3",
    title: "Get Report",
    description:
      "Receive a detailed diagnostic report with severity level and next steps.",
  },
  {
    step: "4",
    title: "Find Care",
    description:
      "Locate nearby health facilities and get referral guidance if needed.",
  },
];

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    description: "Basic health screening for individuals",
    features: [
      "5 diagnoses per month",
      "Basic symptom analysis",
      "English & Hindi support",
      "General health tips",
    ],
    cta: "Get Started Free",
    popular: false,
  },
  {
    name: "Health Worker",
    price: "₹199",
    period: "/month",
    description: "For ASHA workers and community health volunteers",
    features: [
      "Unlimited diagnoses",
      "All 12+ languages",
      "Patient history tracking",
      "Offline mode",
      "Printable reports",
      "Priority support",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Clinic",
    price: "₹999",
    period: "/month",
    description: "For clinics and primary health centers",
    features: [
      "Everything in Health Worker",
      "Multi-staff access",
      "EHR integration",
      "Bulk patient management",
      "API access",
      "Dedicated support",
      "Custom branding",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

const testimonials = [
  {
    name: "Dr. Priya Sharma",
    role: "PHC Director, Rajasthan",
    text: "This tool has helped our ASHA workers screen 3x more patients in remote villages. Early detection has improved significantly.",
    rating: 5,
  },
  {
    name: "Ramesh Kumar",
    role: "ASHA Worker, Uttar Pradesh",
    text: "I can now help patients even when there is no doctor nearby. The reports are easy to understand and share.",
    rating: 5,
  },
  {
    name: "Anita Devi",
    role: "Community Health Volunteer, Bihar",
    text: "My patients trust the screening results. It has made my work much more effective in identifying conditions early.",
    rating: 5,
  },
];

export default function LandingPage({ onNavigateToDemo }: LandingPageProps) {
  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-600 via-teal-500 to-emerald-500 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.06%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6">
                <Shield className="w-4 h-4" />
                <span className="text-sm font-medium">AI-Powered Health Screening</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Accessible Healthcare
                <br />
                <span className="text-teal-100">For Every Village</span>
              </h1>
              <p className="text-lg md:text-xl text-teal-50 mb-8 max-w-lg leading-relaxed">
                Screen for common health conditions using your smartphone. Our AI
                diagnostic agent brings early detection to rural communities across India.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={onNavigateToDemo}
                  className="bg-white text-teal-700 px-8 py-3.5 rounded-xl font-semibold text-base hover:bg-teal-50 transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-lg"
                >
                  Try Demo <ArrowRight className="w-4 h-4" />
                </button>
                <a
                  href="#how-it-works"
                  className="border-2 border-white/40 text-white px-8 py-3.5 rounded-xl font-semibold text-base hover:bg-white/10 transition-colors text-center"
                >
                  Learn More
                </a>
              </div>
              <div className="flex items-center gap-6 mt-10 text-teal-100 text-sm">
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  <span>50,000+ screenings</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4" />
                  <span>200+ health workers</span>
                </div>
              </div>
            </div>
            <div className="hidden md:flex justify-center">
              <div className="w-80 h-96 bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 p-6 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Health Screening</p>
                    <p className="text-xs text-teal-100">AI Diagnostic Report</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { label: "Severity", value: "Moderate", color: "bg-yellow-400" },
                    { label: "Confidence", value: "87%", color: "bg-teal-400" },
                    { label: "Risk Level", value: "Low", color: "bg-green-400" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="bg-white/10 rounded-lg p-3"
                    >
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-teal-100">{item.label}</span>
                        <span className="font-medium">{item.value}</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-1.5">
                        <div
                          className={`${item.color} h-1.5 rounded-full`}
                          style={{
                            width:
                              item.value === "87%"
                                ? "87%"
                                : item.value === "Moderate"
                                  ? "60%"
                                  : "30%",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 bg-white/10 rounded-lg p-3">
                  <p className="text-xs text-teal-100 mb-1">Recommendation</p>
                  <p className="text-sm font-medium">
                    Consult a dermatologist within 48 hours
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* Features */}
      <section className="py-20 bg-white" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Rural Healthcare
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Designed for low-resource settings with maximum diagnostic capability
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group p-6 rounded-2xl border border-gray-100 hover:border-teal-200 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-teal-100 transition-colors">
                  <feature.icon className="w-6 h-6 text-teal-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50" id="how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Four simple steps to get a health screening report
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, idx) => (
              <div key={step.step} className="relative text-center">
                {idx < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-teal-200 -z-0" />
                )}
                <div className="relative z-10 w-16 h-16 bg-teal-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4 shadow-lg">
                  {step.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trusted by Health Workers
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Real impact from community health professionals across India
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="bg-gray-50 rounded-2xl p-6 border border-gray-100"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 text-amber-400 fill-amber-400"
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed mb-4">
                  "{t.text}"
                </p>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-gray-50" id="pricing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple, Affordable Pricing
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Designed for individual users, health workers, and clinics
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-8 ${
                  plan.popular
                    ? "bg-teal-600 text-white ring-4 ring-teal-400 shadow-xl scale-105"
                    : "bg-white border border-gray-200"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-xs font-bold px-4 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <h3
                  className={`text-lg font-semibold mb-2 ${plan.popular ? "text-white" : "text-gray-900"}`}
                >
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span
                    className={`text-sm ${plan.popular ? "text-teal-100" : "text-gray-500"}`}
                  >
                    {plan.period}
                  </span>
                </div>
                <p
                  className={`text-sm mb-6 ${plan.popular ? "text-teal-100" : "text-gray-600"}`}
                >
                  {plan.description}
                </p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <CheckCircle2
                        className={`w-4 h-4 mt-0.5 shrink-0 ${plan.popular ? "text-teal-200" : "text-teal-500"}`}
                      />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={onNavigateToDemo}
                  className={`w-full py-3 rounded-xl font-semibold text-sm cursor-pointer transition-colors ${
                    plan.popular
                      ? "bg-white text-teal-700 hover:bg-teal-50"
                      : "bg-teal-600 text-white hover:bg-teal-700"
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
      <section className="py-20 bg-gradient-to-br from-teal-600 to-emerald-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Start Screening Patients Today
          </h2>
          <p className="text-lg text-teal-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of health workers already using our AI diagnostic agent to
            bring healthcare to underserved communities.
          </p>
          <button
            onClick={onNavigateToDemo}
            className="bg-white text-teal-700 px-8 py-3.5 rounded-xl font-semibold text-base hover:bg-teal-50 transition-colors cursor-pointer shadow-lg"
          >
            Launch Free Demo
          </button>
        </div>
      </section>
    </main>
  );
}
