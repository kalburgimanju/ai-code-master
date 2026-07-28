import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Code2, MapPin } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 dark:text-white mb-6">
              Hi, I'm <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Alex Johnson
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-4 max-w-3xl mx-auto">
              Full Stack Developer & UI/UX Designer
            </p>
            <div className="text-lg text-slate-500 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
              <p className="mb-4">
                I build exceptional digital experiences that are fast, accessible, and user-friendly.
              </p>
              <p>
                Specializing in React, Node.js, and modern web technologies.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <button className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg hover:shadow-xl">
              View My Work
            </button>
            <button className="px-8 py-4 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium">
              Get In Touch
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
          >
            <div className="flex items-center justify-center gap-3 p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
              <Briefcase size={24} className="text-blue-600" />
              <div className="text-left">
                <p className="text-sm text-slate-500 dark:text-slate-400">Experience</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">5+ Years</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
              <Code2 size={24} className="text-purple-600" />
              <div className="text-left">
                <p className="text-sm text-slate-500 dark:text-slate-400">Projects</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">50+ Completed</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
              <MapPin size={24} className="text-green-600" />
              <div className="text-left">
                <p className="text-sm text-slate-500 dark:text-slate-400">Location</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">SF Bay Area</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
          <path d="M12 5v14M19 12l-7 7-7-7"/>
        </svg>
      </div>
    </section>
  );
};

export default Hero;