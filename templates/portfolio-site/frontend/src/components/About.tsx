import React from 'react';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';

const About: React.FC = () => {
  const personalInfo = {
    name: 'Alex Johnson',
    title: 'Full Stack Developer',
    email: 'alex@example.com',
    location: 'San Francisco, CA',
    availability: 'Open to work',
  };

  const bio = "I'm a passionate full stack developer with over 5 years of experience building web applications. I specialize in React, Node.js, and cloud technologies. I love turning complex problems into elegant, user-friendly solutions.";

  const quickFacts = [
    { icon: User, label: '5+ Years Experience' },
    { icon: '💻', label: 'Full Stack Dev' },
    { icon: '☁️', label: 'Cloud Architecture' },
    { icon: '🎯', label: 'Performance Focused' },
  ];

  return (
    <section id="about" className="py-20 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">About Me</h2>
          <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="relative">
              <div className="w-80 h-80 mx-auto lg:mx-0 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-600 p-1">
                <div className="w-full h-full rounded-2xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                  <User size={80} className="text-slate-400" />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              {personalInfo.name}
            </h3>
            <p className="text-xl text-blue-600 dark:text-blue-400 mb-6">
              {personalInfo.title}
            </p>
            <p className="text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
              {bio}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {quickFacts.map((fact, index) => (
                <motion.div
                  key={fact.label}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm"
                >
                  <span className="text-2xl">{fact.icon}</span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    {fact.label}
                  </span>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4">
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Download Resume
              </button>
              <button className="px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium">
                View Projects
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;