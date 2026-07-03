import { Check } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    description: "Perfect for evaluating the quality agent on your line.",
    features: [
      "100 inspections/month",
      "1 product type",
      "Basic defect detection",
      "Web dashboard",
      "Community support",
    ],
    cta: "Start Free",
    highlighted: false,
  },
  {
    name: "Factory",
    price: "₹1,999",
    period: "/month",
    description: "For small factories running 1-3 production lines.",
    features: [
      "5,000 inspections/month",
      "Unlimited product types",
      "All defect types",
      "WhatsApp alerts",
      "Batch analytics",
      "Email support",
      "1 camera license",
    ],
    cta: "Start Factory Plan",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "₹4,999",
    period: "/month",
    description: "For multi-line factories and group companies.",
    features: [
      "Unlimited inspections",
      "Custom defect models",
      "Multi-camera support",
      "WhatsApp + SMS alerts",
      "Advanced analytics & reports",
      "BIS compliance reports",
      "Dedicated support",
      "API access",
      "Custom integrations",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-industrial mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Start free. Scale as your factory grows. No hidden fees.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 items-start">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-6 border-2 transition-all ${
                plan.highlighted
                  ? "bg-primary text-white border-primary shadow-xl scale-[1.02]"
                  : "bg-surface border-orange-100 hover:shadow-md"
              }`}
            >
              <h3
                className={`text-xl font-bold mb-1 ${plan.highlighted ? "text-white" : "text-industrial"}`}
              >
                {plan.name}
              </h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span
                  className={`text-3xl font-extrabold ${plan.highlighted ? "text-white" : "text-industrial"}`}
                >
                  {plan.price}
                </span>
                <span
                  className={`text-sm ${plan.highlighted ? "text-orange-200" : "text-gray-400"}`}
                >
                  {plan.period}
                </span>
              </div>
              <p
                className={`text-sm mb-6 ${plan.highlighted ? "text-orange-100" : "text-gray-500"}`}
              >
                {plan.description}
              </p>
              <ul className="space-y-3 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check
                      size={16}
                      className={`mt-0.5 flex-shrink-0 ${plan.highlighted ? "text-amber-300" : "text-primary"}`}
                    />
                    <span
                      className={
                        plan.highlighted ? "text-orange-50" : "text-gray-600"
                      }
                    >
                      {f}
                    </span>
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                  plan.highlighted
                    ? "bg-white text-primary hover:bg-amber-50"
                    : "bg-primary text-white hover:bg-primary-dark"
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
