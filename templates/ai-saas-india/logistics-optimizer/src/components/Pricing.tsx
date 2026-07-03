import { Check, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const plans = [
  {
    name: 'Starter',
    price: '₹0',
    period: 'forever',
    description: 'Perfect for testing and small fleets',
    features: [
      '5 optimized routes / day',
      '2 city support',
      'Basic traffic data',
      'CSV export',
      'Community support',
    ],
    cta: 'Start Free',
    popular: false,
  },
  {
    name: 'Growth',
    price: '₹4,999',
    period: '/month',
    description: 'For growing delivery operations',
    features: [
      '500 optimized routes / day',
      'All 8+ cities',
      'Real-time traffic + weather',
      'Festival calendar integration',
      'Fleet dashboard',
      'API access',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: '₹19,999',
    period: '/month',
    description: 'For large-scale logistics companies',
    features: [
      'Unlimited routes',
      'Custom city onboarding',
      'Predictive ML models',
      'White-label dashboard',
      'Dedicated account manager',
      'SLA guarantee',
      'On-premise deployment',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-cyan-400 font-semibold text-sm uppercase tracking-wider">Pricing</span>
          <h2 className="text-3xl sm:text-5xl font-bold text-white mt-3 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Pay only for the scale you need. No hidden fees. No delivery commissions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`glass-card p-8 relative ${
                plan.popular
                  ? 'border-cyan-500/50 shadow-[0_0_40px_-10px_rgba(8,145,178,0.3)]'
                  : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-cyan-500 text-white text-xs font-bold">
                  <Zap className="w-3 h-3" /> Most Popular
                </div>
              )}

              <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
              <p className="text-slate-400 text-sm mb-4">{plan.description}</p>

              <div className="mb-6">
                <span className="text-4xl font-black text-white">{plan.price}</span>
                <span className="text-slate-400 text-sm">{plan.period}</span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-slate-300">
                    <Check className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              {plan.popular ? (
                <Link to="/demo" className="btn-primary w-full">
                  {plan.cta}
                </Link>
              ) : (
                <Link to="/demo" className="btn-secondary w-full">
                  {plan.cta}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
