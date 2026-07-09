import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Clock, Zap } from 'lucide-react';
import GradientButton from './shared/GradientButton';

const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm mb-6">
              <Sparkles size={14} />
              AI-Powered Social Media Management
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight mb-6">
              Your Social Media{' '}
              <span className="gradient-text">While You Sleep</span>
            </h1>

            <p className="text-xl text-gray-400 mb-8 max-w-lg">
              Create AI avatars, generate engaging content, and grow your online presence — all while you rest. Our autonomous agents work 24/7.
            </p>

            <div className="flex flex-wrap gap-4 mb-12">
              <GradientButton size="lg">
                Start Free <ArrowRight size={20} />
              </GradientButton>
              <GradientButton size="lg" variant="secondary">
                See Demo
              </GradientButton>
            </div>

            <div className="flex items-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-brand-400" />
                <span>24/7 Automation</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-yellow-400" />
                <span>5 Platforms</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-purple-400" />
                <span>AI Avatars</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative w-full aspect-square max-w-md mx-auto">
              {/* Animated avatar grid */}
              <div className="absolute inset-0 grid grid-cols-3 gap-4 p-8">
                {[
                  'from-blue-500 to-cyan-500',
                  'from-purple-500 to-pink-500',
                  'from-green-500 to-emerald-500',
                  'from-orange-500 to-amber-500',
                  'from-brand-500 to-indigo-500',
                  'from-pink-500 to-rose-500',
                  'from-teal-500 to-cyan-500',
                  'from-violet-500 to-purple-500',
                  'from-red-500 to-orange-500',
                ].map((gradient, i) => (
                  <motion.div
                    key={i}
                    className={`rounded-2xl bg-gradient-to-br ${gradient} p-1`}
                    animate={{
                      y: [0, -10, 0],
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      duration: 3,
                      delay: i * 0.3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    <div className="w-full h-full rounded-xl bg-gray-900/80 flex items-center justify-center">
                      <svg viewBox="0 0 80 80" className="w-12 h-12">
                        <circle cx="40" cy="30" r="15" fill="currentColor" className="text-white/30" />
                        <ellipse cx="40" cy="65" rx="25" ry="18" fill="currentColor" className="text-white/20" />
                      </svg>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Floating notification */}
              <motion.div
                className="absolute -top-4 -right-4 glass rounded-xl px-4 py-3 shadow-xl"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                    <span className="text-green-400 text-sm">+47</span>
                  </div>
                  <div>
                    <p className="text-white text-xs font-medium">New followers</p>
                    <p className="text-gray-400 text-xs">while you slept</p>
                  </div>
                </div>
              </motion.div>

              {/* Floating post notification */}
              <motion.div
                className="absolute -bottom-4 -left-4 glass rounded-xl px-4 py-3 shadow-xl"
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 5, repeat: Infinity, delay: 1 }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center">
                    <Sparkles size={14} className="text-brand-400" />
                  </div>
                  <div>
                    <p className="text-white text-xs font-medium">AI Post Generated</p>
                    <p className="text-gray-400 text-xs">Engagement: +23%</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
