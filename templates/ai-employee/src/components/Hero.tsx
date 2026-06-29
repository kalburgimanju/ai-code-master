import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Play, Shield, Clock, Users, Send } from 'lucide-react';
import { stats } from '../data';

interface HeroProps {
  onCreateAgent: () => void;
}

const Hero: React.FC<HeroProps> = ({ onCreateAgent }) => {
  const [typedText, setTypedText] = useState('');
  const fullText = 'How do I reset my password?';

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i <= fullText.length) {
        setTypedText(fullText.slice(0, i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 80);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-brand-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-brand-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text */}
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-medium mb-6"
            >
              <span className="flex h-2 w-2 rounded-full bg-brand-400 animate-pulse" />
              Now with GPT-4o & Claude integration
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight"
            >
              Your AI Employee.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-emerald-300">
                Ready in 60 seconds.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 text-lg text-dark-400 max-w-xl mx-auto lg:mx-0 leading-relaxed"
            >
              Describe the role. We build the agent. It works 24/7 — handling customers,
              qualifying leads, and answering questions while you sleep.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <button onClick={onCreateAgent} className="btn-primary text-lg cursor-pointer">
                <Zap size={20} />
                Create Your AI Employee
              </button>
              <button className="btn-ghost text-lg">
                <Play size={18} />
                Watch Demo
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 flex flex-wrap gap-6 justify-center lg:justify-start text-sm text-dark-400"
            >
              <span className="flex items-center gap-2">
                <Shield size={16} className="text-brand-400" />
                SOC 2 Compliant
              </span>
              <span className="flex items-center gap-2">
                <Clock size={16} className="text-brand-400" />
                14-day free trial
              </span>
              <span className="flex items-center gap-2">
                <Users size={16} className="text-brand-400" />
                1,200+ deployed
              </span>
            </motion.div>
          </div>

          {/* Right: Live agent preview */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="relative"
          >
            <div className="glass-card p-6 glow">
              {/* Widget header */}
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-emerald-300 flex items-center justify-center text-dark-900 font-bold">
                  AI
                </div>
                <div>
                  <p className="text-sm font-semibold">Support Agent</p>
                  <p className="text-xs text-brand-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
                    Online — avg response &lt;1s
                  </p>
                </div>
              </div>

              {/* Chat messages */}
              <div className="space-y-4 mb-4">
                <div className="flex justify-end">
                  <div className="bg-brand-500/20 text-white rounded-2xl rounded-br-md px-4 py-3 max-w-[80%]">
                    <p className="text-sm">{typedText}<span className="animate-pulse">|</span></p>
                  </div>
                </div>
                {typedText.length === fullText.length && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="bg-dark-700 text-dark-200 rounded-2xl rounded-bl-md px-4 py-3 max-w-[80%]">
                      <p className="text-sm">
                        You can reset your password by going to{' '}
                        <strong className="text-brand-400">Settings → Security → Reset Password</strong>.
                        I&apos;ll send the reset link to your registered email right now! 📧
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Input */}
              <div className="flex items-center gap-2 bg-dark-800 rounded-xl px-4 py-3 border border-white/5">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent text-sm text-white placeholder-dark-500 outline-none"
                  readOnly
                />
                <Send size={18} className="text-brand-400" />
              </div>
            </div>

            {/* Floating stat cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="absolute -bottom-6 -left-6 glass-card p-3 flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center">
                <Clock size={16} className="text-brand-400" />
              </div>
              <div>
                <p className="text-xs text-dark-400">Response time</p>
                <p className="text-sm font-bold">0.8s</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="absolute -top-4 -right-4 glass-card p-3 flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center">
                <Users size={16} className="text-brand-400" />
              </div>
              <div>
                <p className="text-xs text-dark-400">Conversations</p>
                <p className="text-sm font-bold">1,247</p>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 + i * 0.1 }}
              className="text-center p-4 rounded-xl glass-card"
            >
              <p className="text-2xl md:text-3xl font-extrabold text-brand-400">{stat.value}</p>
              <p className="mt-1 text-xs text-dark-400 font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
