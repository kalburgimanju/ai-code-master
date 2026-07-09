import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Settings, Rocket } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    title: 'Create Your Avatar',
    description: 'Choose from 5 unique styles. Our AI generates a stunning, one-of-a-kind avatar for your brand.',
    color: 'from-blue-500 to-cyan-500',
    step: '01',
  },
  {
    icon: Settings,
    title: 'Set Preferences',
    description: 'Define your brand voice, topics, and platforms. Our agents learn your style instantly.',
    color: 'from-purple-500 to-pink-500',
    step: '02',
  },
  {
    icon: Rocket,
    title: 'AI Posts 24/7',
    description: 'Sleep, work, live — while your AI agents create content, schedule posts, and grow your audience.',
    color: 'from-green-500 to-emerald-500',
    step: '03',
  },
];

const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Three simple steps to automate your social media presence
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="relative glass rounded-2xl p-8 glow-card text-center"
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gray-900 border border-white/10 text-xs text-gray-400 font-mono">
                Step {step.step}
              </div>

              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mx-auto mb-6 mt-4`}>
                <step.icon size={28} className="text-white" />
              </div>

              <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
              <p className="text-gray-400 leading-relaxed">{step.description}</p>

              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-white/20 to-transparent" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
