import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase } from 'lucide-react';

interface Experience {
  id: string;
  company: string;
  position: string;
  duration: string;
  description: string;
  technologies: string[];
}

const Experience: React.FC = () => {
  const experiences: Experience[] = [
    {
      id: '1',
      company: 'TechCorp Solutions',
      position: 'Senior Full Stack Developer',
      duration: 'Jan 2021 - Present',
      description: 'Led development of enterprise-scale web applications using React, Node.js, and PostgreSQL. Mentored junior developers and implemented CI/CD pipelines that reduced deployment time by 40%.',
      technologies: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS', 'Docker'],
    },
    {
      id: '2',
      company: 'Digital Innovations LLC',
      position: 'Full Stack Developer',
      duration: 'Jun 2018 - Dec 2020',
      description: 'Developed and maintained multiple client-facing web applications. Implemented responsive designs and improved application performance by 35% through code optimization.',
      technologies: ['JavaScript', 'React', 'Express.js', 'MongoDB', 'Redux'],
    },
    {
      id: '3',
      company: 'Startup Hub',
      position: 'Junior Web Developer',
      duration: 'Mar 2017 - May 2018',
      description: 'Started career in web development, working on various client projects. Learned industry best practices and contributed to open source projects.',
      technologies: ['HTML', 'CSS', 'JavaScript', 'PHP'],
    },
  ];

  return (
    <section id="experience" className="py-20 bg-white dark:bg-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Work Experience</h2>
          <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
        </motion.div>

        <div className="relative">
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-blue-200 dark:bg-blue-800"></div>

          {experiences.map((exp, index) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className={`relative flex items-center mb-12 ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
            >
              <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-600 rounded-full border-4 border-white dark:border-slate-800 z-10"></div>

              <div className={`w-5/12 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8'}`}>\n                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex items-center gap-2 mb-2 text-blue-600 dark:text-blue-400">
                    <Briefcase size={16} />
                    <span className="text-sm font-medium">{exp.duration}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                    {exp.position}
                  </h3>
                  <h4 className="text-lg text-slate-700 dark:text-slate-300 mb-4">
                    {exp.company}
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                    {exp.description}
                  </p>
                  <div className="flex flex-wrap gap-2 justify-end">
                    {exp.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Experience;