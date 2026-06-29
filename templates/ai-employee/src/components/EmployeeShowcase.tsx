import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Headphones, TrendingUp, Users, BarChart3, Send, X } from 'lucide-react';
import { agentTemplates } from '../data';

const iconMap: Record<string, React.ReactNode> = {
  headphones: <Headphones size={24} />,
  'trending-up': <TrendingUp size={24} />,
  users: <Users size={24} />,
  'bar-chart-3': <BarChart3 size={24} />,
};

const demoReplies: Record<string, string> = {
  support: 'Hi there! 👋 I\'m your support agent. I can help with order status, returns, account issues, and more. How can I assist you today?',
  sales: 'Welcome! 🎯 I\'d love to learn about your business needs. We offer AI employee solutions starting at ₹2,999/month. What challenge are you looking to solve?',
  hr: 'Hello! 👋 I\'m your HR assistant. I can help with onboarding, leave policies, benefits info, and employee handbook questions. What do you need?',
  analyst: 'Ready to analyze your data! 📊 Ask me anything about sales trends, customer behavior, or operational metrics. What would you like to know?',
};

const EmployeeShowcase: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'ai'; text: string }>>([]);

  const handleDemo = (id: string) => {
    setActiveDemo(id);
    setChatMessages([
      { role: 'ai', text: demoReplies[id] },
    ]);
  };

  const handleSend = () => {
    if (!chatInput.trim() || !activeDemo) return;
    setChatMessages((prev) => [
      ...prev,
      { role: 'user', text: chatInput },
      { role: 'ai', text: 'Thanks for your message! This is a demo of how your AI employee would respond. In production, this would be powered by your knowledge base and connected to your real systems. 🚀' },
    ]);
    setChatInput('');
  };

  return (
    <section className="py-20 md:py-28 bg-dark-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm font-semibold text-brand-400 uppercase tracking-widest mb-3"
          >
            Meet the Team
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-extrabold tracking-tight"
          >
            AI employees for every role
          </motion.h2>
          <p className="mt-4 text-lg text-dark-400 max-w-2xl mx-auto">
            Ready-made templates you can customize, or create your own from scratch.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {agentTemplates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-6 group hover:border-brand-500/30 transition-all duration-300 cursor-pointer"
              onClick={() => handleDemo(template.id)}
            >
              <div className={`p-3 rounded-2xl bg-gradient-to-br ${template.color} text-white shadow-lg w-fit mb-4`}>
                {iconMap[template.icon]}
              </div>
              <h3 className="text-lg font-bold text-white mb-1">{template.name}</h3>
              <p className="text-sm text-dark-400 mb-4">{template.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-dark-300">
                  {template.category}
                </span>
                <button className="text-sm text-brand-400 font-medium hover:text-brand-300 transition-colors">
                  Try it →
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Demo chat modal */}
        <AnimatePresence>
          {activeDemo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setActiveDemo(null)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-md glass-card overflow-hidden"
              >
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${agentTemplates.find((t) => t.id === activeDemo)?.color} flex items-center justify-center text-white font-bold text-sm`}>
                      AI
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">
                        {agentTemplates.find((t) => t.id === activeDemo)?.name}
                      </p>
                      <p className="text-xs text-brand-400">Demo Mode</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveDemo(null)}
                    className="p-1 text-dark-400 hover:text-white"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="p-4 h-80 overflow-y-auto space-y-3">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`px-4 py-3 rounded-2xl max-w-[85%] text-sm ${
                        msg.role === 'user'
                          ? 'bg-brand-500/20 text-white rounded-br-md'
                          : 'bg-dark-700 text-dark-200 rounded-bl-md'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 border-t border-white/10">
                  <div className="flex items-center gap-2 bg-dark-800 rounded-xl px-4 py-3">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Type a message..."
                      className="flex-1 bg-transparent text-sm text-white placeholder-dark-500 outline-none"
                    />
                    <button onClick={handleSend} className="text-brand-400 hover:text-brand-300">
                      <Send size={18} />
                    </button>
                  </div>
                  <p className="text-xs text-dark-500 mt-2 text-center">Demo — powered by MyAIEmployee</p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default EmployeeShowcase;
