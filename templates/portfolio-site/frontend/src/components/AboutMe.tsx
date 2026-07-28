import React from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Calendar, Award, Book, Code2, Users } from 'lucide-react';
import { Card, CardContent } from './common/Card';

export const AboutMe: React.FC = () => {
  return (
    <section id="about" className="py-20 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">About Me</h2>
          <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
          <p className="text-slate-600 dark:text-slate-300 mt-6 max-w-2xl mx-auto">
            Passionate technologist and AI enthusiast dedicated to making complex AI concepts accessible to everyone
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="lg:col-span-1"
          >
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">MK</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  Manjunath Kalburgi
                </h3>
                <p className="text-blue-600 dark:text-blue-400 font-medium mb-4">
                  Tech Entrepreneur & Author
                </p>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center text-slate-600 dark:text-slate-300">
                    <MapPin size={16} className="mr-2" />
                    Bangalore, India
                  </div>
                  <div className="flex items-center text-slate-600 dark:text-slate-300">
                    <Mail size={16} className="mr-2" />
                    manjunath.kalburgi@example.com
                  </div>
                  <div className="flex items-center text-slate-600 dark:text-slate-300">
                    <Calendar size={16} className="mr-2" />
                    9+ years experience
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            <Card>
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                  My Story
                </h3>
                <div className="space-y-4 text-slate-600 dark:text-slate-300">
                  <p>
                    I'm Manjunath Kalburgi, a passionate technologist and author with a mission to make complex AI concepts accessible to everyone through comprehensive books and innovative software solutions.
                  </p>
                  <p>
                    With over 9 years of experience in the tech industry, I've evolved from foundational software development to specialized AI/ML work, building intelligent agents and systems that solve real-world problems.
                  </p>
                  <p>
                    As an author, I've written two comprehensive guides: "AI Agents: The Complete Guide" and "Customer Experience Automation." These books bridge the gap between complex technical concepts and practical understanding, enabling readers to build and deploy AI solutions.
                  </p>
                  <p>
                    My current focus is on creating educational platforms that combine theoretical knowledge with practical implementation, helping others navigate the rapidly evolving landscape of artificial intelligence.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-6 mt-8">
                  <div className="flex items-center">
                    <Book size={20} className="text-blue-600 mr-3" />
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">2 Books Published</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">AI & Business Automation</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Code2 size={20} className="text-purple-600 mr-3" />
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">10+ Projects</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Live AI/ML Solutions</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Users size={20} className="text-green-600 mr-3" />
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">500+ Readers</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Global Community</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Award size={20} className="text-yellow-600 mr-3" />
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">Best AI Book 2024</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Industry Recognition</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
};