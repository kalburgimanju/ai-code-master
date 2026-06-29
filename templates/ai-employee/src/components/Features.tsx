import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Globe, BarChart3, Database, Users, Palette } from 'lucide-react';
import { features } from '../data';

const iconMap: Record<string, React.ReactNode> = {
  'message-square': <MessageSquare size={24} />,
  globe: <Globe size={24} />,
  'bar-chart-3': <BarChart3 size={24} />,
  database: <Database size={24} />,
  users: <Users size={24} />,
  palette: <Palette size={24} />,
};

const Features: React.FC = () => {
  return (
    <section id="features" className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm font-semibold text-brand-400 uppercase tracking-widest mb-3"
          >
            Features
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-extrabold tracking-tight"
          >
            Everything you need
          </motion.h2>
          <p className="mt-4 text-lg text-dark-400 max-w-2xl mx-auto">
            A complete platform for building, deploying, and managing AI employees at scale.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-8 group hover:border-brand-500/30 transition-all duration-300"
            >
              <div className="p-3 rounded-2xl bg-brand-500/10 text-brand-400 w-fit mb-5 group-hover:bg-brand-500/20 transition-colors">
                {iconMap[feature.icon]}
              </div>
              <h3 className="text-lg font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-dark-400 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
