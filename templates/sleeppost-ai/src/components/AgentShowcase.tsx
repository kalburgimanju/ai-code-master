import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Megaphone, DollarSign, Clock } from 'lucide-react';

const agents = [
  {
    icon: Sparkles,
    name: 'Content Agent',
    description: 'Generates platform-optimized posts, captions, and hashtags using AI. Learns your brand voice over time.',
    color: 'from-blue-500 to-cyan-500',
    stat: '1,000+ posts/day',
  },
  {
    icon: Megaphone,
    name: 'Marketing Agent',
    description: 'Autonomously creates campaigns, writes blog posts, and promotes your brand across channels.',
    color: 'from-purple-500 to-pink-500',
    stat: '24/7 campaign mode',
  },
  {
    icon: DollarSign,
    name: 'Revenue Agent',
    description: 'Tracks earnings, manages subscriptions, and provides AI-driven pricing optimization.',
    color: 'from-green-500 to-emerald-500',
    stat: '+40% avg revenue',
  },
  {
    icon: Clock,
    name: 'Scheduler Agent',
    description: 'Picks optimal posting times per platform. Manages your content calendar automatically.',
    color: 'from-orange-500 to-amber-500',
    stat: '5x engagement boost',
  },
];

const AgentShowcase: React.FC = () => {
  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            4 Autonomous <span className="gradient-text">AI Agents</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Each agent works independently, collaborating to grow your online presence
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {agents.map((agent, i) => (
            <motion.div
              key={agent.name}
              initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-2xl p-6 glow-card flex gap-5"
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${agent.color} flex items-center justify-center shrink-0`}>
                <agent.icon size={24} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-white">{agent.name}</h3>
                  <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-xs font-medium">Active</span>
                </div>
                <p className="text-gray-400 text-sm mb-3 leading-relaxed">{agent.description}</p>
                <p className="text-brand-400 text-sm font-medium">{agent.stat}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AgentShowcase;
