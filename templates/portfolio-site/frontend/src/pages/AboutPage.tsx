import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Mail, Calendar, Code2, Book, Users, Award } from 'lucide-react';
import { Card, CardContent } from '../components/common/Card';
import { sampleExperience, sampleSkills } from '../utils/data';

const AboutPage: React.FC = () => {
  const skillCategories = Array.from(new Set(sampleSkills.map((skill) => skill.category)));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold text-slate-900 dark:text-white mb-4">About Me</h1>
          <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
          <p className="text-slate-600 dark:text-slate-300 mt-6 max-w-3xl mx-auto">
            Passionate technologist and AI enthusiast dedicated to making complex AI concepts accessible to everyone through comprehensive books and innovative software solutions.
          </p>
        </motion.div>

        {/* Personal Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Who I Am</h2>
                  <div className="space-y-4 text-slate-600 dark:text-slate-300">
                    <p>
                      I'm Manjunath Kalburgi, a technologist and author with a passion for making complex AI concepts accessible to everyone. With over 6 years of experience in the tech industry, I've dedicated myself to both practical implementation and knowledge sharing.
                    </p>
                    <p>
                      My journey began with foundational software development, evolving into specialized AI/ML work where I now build intelligent agents and systems that solve real-world problems.
                    </p>
                    <p>
                      As an author, I've written comprehensive guides covering everything from practical automation to theoretical AI agent development. My books are designed to bridge the gap between complex technical concepts and practical understanding.
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center text-slate-600 dark:text-slate-300">
                    <Calendar size={20} className="mr-3 text-blue-600" />
                    <span>Started: 2015 (9+ years experience)</span>
                  </div>
                  <div className="flex items-center text-slate-600 dark:text-slate-300">
                    <MapPin size={20} className="mr-3 text-blue-600" />
                    <span>Bangalore, India</span>
                  </div>
                  <div className="flex items-center text-slate-600 dark:text-slate-300">
                    <Mail size={20} className="mr-3 text-blue-600" />
                    <span>manjunath.kalburgi@example.com</span>
                  </div>
                  <div className="flex items-center text-slate-600 dark:text-slate-300">
                    <Users size={20} className="mr-3 text-blue-600" />
                    <span>Current: TechCorp Solutions</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Skills Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-4xl font-bold text-center text-slate-900 dark:text-white mb-12">
            Technical Expertise
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skillCategories.map((category, categoryIndex) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      {category === 'AI & ML' && <Code2 size={24} className="text-purple-600 mr-3" />}
                      {category === 'Frontend' && <Code2 size={24} className="text-blue-600 mr-3" />}
                      {category === 'Backend' && <Code2 size={24} className="text-green-600 mr-3" />}
                      {category === 'DevOps' && <Code2 size={24} className="text-orange-600 mr-3" />}
                      {category === 'Languages' && <Book size={24} className="text-red-600 mr-3" />}
                      {category === 'Animation' && <Code2 size={24} className="text-pink-600 mr-3" />}
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                        {category}
                      </h3>
                    </div>
                    <div className="space-y-4">
                      {sampleSkills
                        .filter((skill) => skill.category === category)
                        .map((skill) => (
                          <div key={skill.id}>
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium text-slate-900 dark:text-white">
                                {skill.name}
                              </span>
                              <span className="text-sm text-slate-500 dark:text-slate-400">
                                {skill.level}
                              </span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${skill.proficiency}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
                              <span>{skill.proficiency}% proficiency</span>
                              <span>{skill.yearsOfExperience} years</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Experience Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold text-center text-slate-900 dark:text-white mb-12">
            Professional Journey
          </h2>
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-slate-300 dark:bg-slate-700"></div>
            <div className="space-y-12">
              {sampleExperience.map((exp, index) => (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                >
                  <div className="w-5/12"></div>
                  <div className="w-2/12 flex justify-center">
                    <div className="w-4 h-4 bg-blue-600 rounded-full border-4 border-white dark:border-slate-900 z-10"></div>
                  </div>
                  <div className="w-5/12">
                    <Card hover className="mb-8">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                              {exp.title}
                            </h3>
                            <p className="text-lg text-blue-600 dark:text-blue-400 font-medium">
                              {exp.company}
                            </p>
                            <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 mt-2">
                              <Calendar size={16} className="mr-1" />
                              {exp.startDate} - {exp.endDate}
                            </div>
                          </div>
                          {exp.isCurrent && (
                            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 text-xs font-semibold rounded-full">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 mb-4">
                          {exp.description}
                        </p>
                        <div className="space-y-2 mb-4">
                          {exp.achievements.map((achievement, achIndex) => (
                            <div key={achIndex} className="flex items-start">
                              <Award size={16} className="text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-slate-600 dark:text-slate-300">
                                {achievement}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {exp.technologies.map((tech) => (
                            <span
                              key={tech}
                              className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs font-medium"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AboutPage;