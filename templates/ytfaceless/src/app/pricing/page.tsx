'use client';

import { useState } from 'react';
import { Check, Zap, Crown, Rocket } from 'lucide-react';
import Link from 'next/link';

const plans = [
  {
    name: 'Starter',
    price: 0,
    period: 'Free forever',
    icon: <Zap size={24} />,
    color: 'from-dark-600 to-dark-700',
    popular: false,
    features: [
      '5 video ideas per day',
      '3 script generations per month',
      'Basic SEO keyword research',
      '1 channel analytics',
      'Community support',
    ],
    cta: 'Get Started Free',
  },
  {
    name: 'Pro',
    price: 29,
    period: '/month',
    icon: <Crown size={24} />,
    color: 'from-brand-500 to-brand-700',
    popular: true,
    features: [
      'Unlimited video ideas',
      '50 script generations per month',
      'Advanced SEO + competition analysis',
      '5 channel analytics',
      'Thumbnail generation (100/mo)',
      'Priority email support',
      'Export to Google Docs',
    ],
    cta: 'Start Pro Trial',
  },
  {
    name: 'Empire',
    price: 79,
    period: '/month',
    icon: <Rocket size={24} />,
    color: 'from-fire-500 to-accent-500',
    popular: false,
    features: [
      'Everything in Pro',
      'Unlimited script generations',
      'Unlimited channels',
      'Unlimited thumbnail generation',
      'AI voice-over generation',
      'Bulk video pipeline',
      'API access',
      'Dedicated account manager',
      'Custom integrations',
    ],
    cta: 'Go Empire',
  },
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);

  return (
    <div className="min-h-screen bg-dark-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-brand-600 to-fire-500 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-white text-sm font-medium mb-6">
            <Crown size={16} />
            Simple Pricing
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Choose Your Plan</h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Start free, upgrade when you are ready. No hidden fees, cancel anytime.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <span className={`text-sm font-medium ${!annual ? 'text-white' : 'text-white/60'}`}>Monthly</span>
            <button
              onClick={() => setAnnual(!annual)}
              className={`w-14 h-7 rounded-full p-1 transition-colors ${annual ? 'bg-white' : 'bg-white/30'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-brand-500 transition-transform ${annual ? 'translate-x-7' : ''}`} />
            </button>
            <span className={`text-sm font-medium ${annual ? 'text-white' : 'text-white/60'}`}>
              Annual <span className="text-xs px-2 py-0.5 rounded-full bg-white/20">Save 20%</span>
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => {
            const price = annual ? Math.round(plan.price * 0.8) : plan.price;
            return (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-8 transition-all ${
                  plan.popular
                    ? 'border-brand-300 shadow-xl shadow-brand-500/10 bg-white scale-105'
                    : 'border-dark-200 bg-white hover:shadow-lg'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-brand-500 to-brand-600 text-white text-xs font-bold">
                    Most Popular
                  </div>
                )}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} text-white flex items-center justify-center mb-4`}>
                  {plan.icon}
                </div>
                <h3 className="text-xl font-bold text-dark-800">{plan.name}</h3>
                <div className="mt-4 mb-6">
                  {plan.price === 0 ? (
                    <p className="text-4xl font-extrabold text-dark-800">Free</p>
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold text-dark-800">${price}</span>
                      <span className="text-sm text-dark-400">{plan.period}</span>
                    </div>
                  )}
                  {annual && plan.price > 0 && (
                    <p className="text-xs text-dark-400 mt-1">
                      <span className="line-through">${plan.price}</span> billed monthly
                    </p>
                  )}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-dark-600">
                      <Check size={16} className="text-neon-500 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`block w-full py-3 rounded-xl text-center font-semibold text-sm transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white hover:shadow-lg hover:shadow-brand-500/25'
                      : 'bg-dark-100 text-dark-700 hover:bg-dark-200'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            );
          })}
        </div>

        {/* FAQ */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-2xl font-extrabold text-dark-900 text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: 'Can I cancel anytime?', a: 'Yes, you can cancel your subscription at any time. You will keep access until the end of your billing period.' },
              { q: 'Do I need to show my face?', a: 'Absolutely not. FaceFlow is specifically designed for faceless content creation. All tools work without any camera or microphone.' },
              { q: 'How does the AI script generator work?', a: 'Enter a topic and our AI analyzes trending content in that niche to generate a hook, full outline, detailed sections, and a call-to-action — all optimized for watch time.' },
              { q: 'Can I use this for multiple channels?', a: 'The Pro plan supports up to 5 channels. The Empire plan offers unlimited channels.' },
              { q: 'Is there a free trial for paid plans?', a: 'Yes, both Pro and Empire plans come with a 7-day free trial. No credit card required to start.' },
            ].map((faq) => (
              <details key={faq.q} className="group bg-white rounded-2xl border border-dark-200 overflow-hidden">
                <summary className="px-6 py-4 cursor-pointer text-sm font-semibold text-dark-800 hover:bg-dark-50 transition-colors list-none flex items-center justify-between">
                  {faq.q}
                  <span className="text-dark-400 group-open:rotate-180 transition-transform">▾</span>
                </summary>
                <div className="px-6 pb-4">
                  <p className="text-sm text-dark-500 leading-relaxed">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
