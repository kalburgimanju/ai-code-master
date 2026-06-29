import React from 'react';
import { motion } from 'framer-motion';
import { Check, Zap } from 'lucide-react';
import { pricingTiers } from '../data';

interface PricingProps {
  onEnroll: (name: string) => void;
}

const Pricing: React.FC<PricingProps> = ({ onEnroll }) => {
  return (
    <section id="pricing" className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm font-semibold text-brand-600 uppercase tracking-widest mb-3"
          >
            Pricing
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="section-heading"
          >
            Simple, transparent pricing
          </motion.h2>
          <p className="section-sub">
            Choose the plan that fits your learning style. All plans include lifetime access to materials.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {pricingTiers.map((tier, index) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative p-8 rounded-3xl border-2 transition-all duration-300 ${
                tier.highlighted
                  ? 'border-brand-500 shadow-xl shadow-brand-500/10 scale-[1.02]'
                  : 'border-slate-200 shadow-sm hover:shadow-md'
              }`}
            >
              {tier.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-brand-600 to-purple-600 text-white text-xs font-bold flex items-center gap-1">
                  <Zap size={12} /> Most Popular
                </div>
              )}

              <h3 className="text-xl font-bold text-slate-900 mb-2">{tier.name}</h3>
              <p className="text-sm text-slate-500 mb-6">{tier.description}</p>

              <div className="mb-6">
                <span className="text-4xl font-extrabold text-slate-900">
                  ₹{tier.price.toLocaleString('en-IN')}
                </span>
                <span className="text-sm text-slate-500 ml-1">/{tier.period}</span>
              </div>

              <ul className="space-y-3 mb-8">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-slate-600">
                    <Check size={18} className="text-green-500 mt-0.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => onEnroll(`${tier.name} Plan`)}
                className={`w-full py-3 rounded-xl font-semibold transition-all cursor-pointer ${
                  tier.highlighted
                    ? 'btn-primary !w-full'
                    : 'btn-secondary !w-full'
                }`}
              >
                {tier.cta}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
