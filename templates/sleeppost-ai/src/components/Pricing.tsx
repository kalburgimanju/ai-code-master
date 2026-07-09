import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { pricingTiers } from '../data';
import GradientButton from './shared/GradientButton';

const Pricing: React.FC = () => {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            Simple <span className="gradient-text">Pricing</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
            Start free, upgrade when you are ready
          </p>

          <div className="inline-flex items-center gap-3 glass rounded-full p-1">
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                !annual ? 'bg-brand-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                annual ? 'bg-brand-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Annual <span className="text-green-400 text-xs">Save 17%</span>
            </button>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {pricingTiers.map((tier, i) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative glass rounded-2xl p-8 ${
                tier.highlighted ? 'border-2 border-brand-500/50 glow-card' : 'glow-card'
              }`}
            >
              {tier.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-brand-500 to-purple-500 text-white text-xs font-bold">
                  Most Popular
                </div>
              )}

              <h3 className="text-xl font-bold text-white mb-2">{tier.name}</h3>
              <p className="text-gray-400 text-sm mb-6">{tier.description}</p>

              <div className="mb-6">
                <span className="text-4xl font-bold text-white">
                  ${annual ? Math.round(tier.annualPrice / 12) : tier.monthlyPrice}
                </span>
                <span className="text-gray-400 text-sm">/month</span>
                {annual && tier.monthlyPrice > 0 && (
                  <p className="text-green-400 text-xs mt-1">
                    Billed ${tier.annualPrice}/year
                  </p>
                )}
              </div>

              <div className="flex gap-2 mb-6 text-sm">
                <span className="px-3 py-1 rounded-full bg-white/5 text-gray-300">{tier.posts}</span>
                <span className="px-3 py-1 rounded-full bg-white/5 text-gray-300">{tier.avatars}</span>
              </div>

              <ul className="space-y-3 mb-8">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-gray-300">
                    <Check size={16} className="text-green-400 mt-0.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <GradientButton
                variant={tier.highlighted ? 'primary' : 'secondary'}
                className="w-full"
              >
                {tier.cta}
              </GradientButton>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
