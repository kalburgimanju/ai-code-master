import React from 'react';
import { motion } from 'framer-motion';
import { Code2, User } from 'lucide-react';

const Skills: React.FC = () => {
  const skills = [
    { name: 'Frontend', level: 'Expert' as const, icon: '💻' },
    { name: 'Backend', level: 'Advanced' as const, icon: '🖥️' },
    { name: 'Database', level: 'Advanced' as const, icon: '💾' },
    { name: 'DevOps', level: 'Intermediate' as const, icon: '☁️' },
    { name: 'Mobile', level: 'Intermediate' as const, icon: '📱' },
    { name: 'UI/UX', level: 'Advanced' as const, icon: '🎨' },
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Expert': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
      case 'Advanced': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
      case 'Intermediate': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
      case 'Beginner': return 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300';
      default: return 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300';
    }
  };

  return (
    <section id="skills" className="py-20 bg-white dark:bg-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Technical Skills</h2>
          <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
          <p className="text-slate-600 dark:text-slate-300 mt-6 max-w-2xl mx-auto">
            A comprehensive overview of my technical abilities and proficiency levels.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {skills.map((skill, index) => (
            <motion.div
              key={skill.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-slate-50 dark:bg-slate-700 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
            >
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-2xl">{skill.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  {skill.name}
                </h3>
                <div className="mb-4">
                  <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getLevelColor(skill.level)}`}
>
                    {skill.level}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-700 dark:to-slate-600 rounded-2xl p-12">
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">
              Always Learning & Growing
            </h3>
            <p className="text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed mb-8">
              Technology evolves rapidly, and I believe in continuous learning. I'm currently exploring topics like AI/ML, cloud-native architecture, and modern JavaScript frameworks to stay ahead of the curve.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <span className="px-6 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors cursor-pointer">
                View Full Stack
              </span>
              <span className="px-6 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-full font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer">
                Download Skills PDF
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Skills;