import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap } from 'lucide-react';
import { pricingTiers } from '../data';

const Pricing: React.FC = () => {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="py-20 md:py-28 bg-dark-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm font-semibold text-brand-400 uppercase tracking-widest mb-3"
          >
            Pricing
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-extrabold tracking-tight"
          >
            Simple, transparent pricing
          </motion.h2>
          <p className="mt-4 text-lg text-dark-400 max-w-2xl mx-auto">
            Start free for 14 days. No credit card required.
          </p>

          {/* Annual toggle */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-8 inline-flex items-center gap-3 bg-white/5 rounded-full px-4 py-2 border border-white/10"
          >
            <span className={`text-sm font-medium ${!annual ? 'text-white' : 'text-dark-400'}`}>Monthly</span>
            <button
              onClick={() => setAnnual(!annual)}
              className={`relative w-12 h-6 rounded-full transition-colors ${annual ? 'bg-brand-500' : 'bg-dark-600'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${annual ? 'left-7' : 'left-1'}`} />
            </button>
            <span className={`text-sm font-medium ${annual ? 'text-white' : 'text-dark-400'}`}>
              Annual
              <span className="ml-1.5 text-xs text-brand-400 font-bold">Save 20%</span>
            </span>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {pricingTiers.map((tier, index) => {
            const price = annual ? tier.annualPrice : tier.monthlyPrice;
            return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative p-8 rounded-3xl border-2 transition-all duration-300 ${
                  tier.highlighted
                    ? 'border-brand-500 shadow-xl shadow-brand-500/10 scale-[1.02] bg-dark-800'
                    : 'border-white/10 bg-dark-900 hover:border-white/20'
                }`}
              >
                {tier.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-brand-500 to-emerald-400 text-dark-900 text-xs font-bold flex items-center gap-1">
                    <Zap size={12} /> Most Popular
                  </div>
                )}

                <h3 className="text-xl font-bold text-white mb-2">{tier.name}</h3>
                <p className="text-sm text-dark-400 mb-6">{tier.description}</p>

                <div className="mb-6">
                  <span className="text-4xl font-extrabold text-white">₹{price.toLocaleString('en-IN')}</span>
                  <span className="text-sm text-dark-400 ml-1">/month</span>
                </div>

                <p className="text-sm text-dark-400 mb-6">
                  {tier.employees} AI Employee{tier.employees > 1 ? 's' : ''} · {tier.messages.toLocaleString()} msgs/mo
                </p>

                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm text-dark-300">
                      <Check size={18} className="text-brand-400 mt-0.5 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-3 rounded-xl font-semibold transition-all cursor-pointer ${
                    tier.highlighted ? 'btn-primary !w-full' : 'btn-secondary !w-full'
                  }`}
                >
                  {tier.cta}
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
