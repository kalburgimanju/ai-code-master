import React from 'react';
import { motion } from 'framer-motion';
import { PenTool, Cpu, Rocket } from 'lucide-react';

const steps = [
  {
    icon: <PenTool size={28} />,
    number: '01',
    title: 'Describe the Role',
    description: 'Write a prompt like you\'re briefing a new hire. Tell us what the AI employee should do, how it should behave, and what it needs to know.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: <Cpu size={28} />,
    number: '02',
    title: 'We Build the Agent',
    description: 'Our AI platform creates a trained, context-aware agent in seconds. It learns from your knowledge base and is ready to handle real conversations.',
    color: 'from-brand-400 to-emerald-300',
  },
  {
    icon: <Rocket size={28} />,
    number: '03',
    title: 'Deploy & Scale',
    description: 'Embed on your site, connect to Slack or WhatsApp, or use the API. Your AI employee works 24/7 and scales infinitely.',
    color: 'from-purple-500 to-pink-500',
  },
];

const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm font-semibold text-brand-400 uppercase tracking-widest mb-3"
          >
            How It Works
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-extrabold tracking-tight"
          >
            Three steps to your AI employee
          </motion.h2>
          <p className="mt-4 text-lg text-dark-400 max-w-2xl mx-auto">
            No coding. No training data. No months of setup. Just describe what you need.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="relative glass-card p-8 group hover:border-brand-500/30 transition-all duration-300"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className={`p-3 rounded-2xl bg-gradient-to-br ${step.color} text-white shadow-lg`}>
                  {step.icon}
                </div>
                <span className="text-4xl font-extrabold text-white/5">{step.number}</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
              <p className="text-dark-400 leading-relaxed">{step.description}</p>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-px bg-white/10" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
