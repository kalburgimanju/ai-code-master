import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

const CTA: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) setSubmitted(true);
  };

  return (
    <section id="contact" className="py-20 md:py-28">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card p-12 md:p-16 text-center relative overflow-hidden"
        >
          {/* Background glow */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-brand-500/10 rounded-full blur-[100px]" />
          </div>

          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            Stop hiring.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-emerald-300">
              Start deploying.
            </span>
          </h2>
          <p className="text-lg text-dark-400 max-w-xl mx-auto mb-8">
            Join 1,200+ businesses that replaced human overhead with AI employees.
            Start your 14-day free trial today.
          </p>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center gap-3 text-brand-400"
            >
              <CheckCircle2 size={24} />
              <span className="text-lg font-semibold">Check your email — we sent your invite!</span>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your work email"
                className="flex-1 px-5 py-3.5 rounded-xl bg-dark-800 border border-white/10 text-white placeholder-dark-500 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all text-sm"
              />
              <button type="submit" className="btn-primary !py-3.5 cursor-pointer">
                Get Started Free
                <ArrowRight size={18} />
              </button>
            </form>
          )}

          <p className="mt-4 text-xs text-dark-500">
            No credit card required · 14-day free trial · Cancel anytime
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
