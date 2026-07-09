import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Bot, Megaphone, Clock, TrendingUp, Shield } from 'lucide-react';
import { features } from '../data';

const iconMap: Record<string, React.ElementType> = {
  sparkles: Sparkles,
  bot: Bot,
  megaphone: Megaphone,
  clock: Clock,
  'trending-up': TrendingUp,
  shield: Shield,
};

const Features: React.FC = () => {
  return (
    <section id="features" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            Everything You <span className="gradient-text">Need</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            A complete AI-powered social media management suite
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => {
            const Icon = iconMap[feature.icon] || Sparkles;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl p-6 glow-card"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500/20 to-purple-500/20 flex items-center justify-center mb-4">
                  <Icon size={24} className="text-brand-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
