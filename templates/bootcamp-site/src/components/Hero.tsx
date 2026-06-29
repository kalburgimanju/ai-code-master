import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Star } from 'lucide-react';
import { stats } from '../data';

const Hero: React.FC = () => {
  return (
    <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-brand-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[400px] bg-purple-200/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-sm font-medium mb-6"
          >
            <span className="flex h-2 w-2 rounded-full bg-brand-500 animate-pulse" />
            New cohorts starting July 2026
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight"
          >
            Learn to build with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-purple-600 to-brand-500">
              AI agents
            </span>
            <br />
            by your side
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed"
          >
            Intensive, mentor-led bootcamps that teach you to leverage AI for real-world product
            development. Ship faster, learn deeper, career up.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <a href="#bootcamps" className="btn-primary text-lg">
              Explore Bootcamps
              <ArrowRight size={20} />
            </a>
            <a href="#demo" className="btn-secondary text-lg">
              <Play size={18} />
              Watch Demo
            </a>
          </motion.div>

          {/* Trust */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-8 flex items-center justify-center gap-1 text-slate-400 text-sm"
          >
            <Star size={16} className="text-yellow-400 fill-yellow-400" />
            <Star size={16} className="text-yellow-400 fill-yellow-400" />
            <Star size={16} className="text-yellow-400 fill-yellow-400" />
            <Star size={16} className="text-yellow-400 fill-yellow-400" />
            <Star size={16} className="text-yellow-400 fill-yellow-400" />
            <span className="ml-2 text-slate-500 font-medium">4.9/5 from 2,400+ students</span>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
        >
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className="text-center p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <motion.p
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + i * 0.1 }}
                className="text-3xl md:text-4xl font-extrabold text-brand-700"
              >
                {stat.value}
              </motion.p>
              <p className="mt-1 text-sm text-slate-500 font-medium">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
