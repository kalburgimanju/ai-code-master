import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Book, Code2, User, Star } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/common/Card';

const HomePage: React.FC = () => {
  const featuredBooks = [
    {
      id: 'ai-agents',
      title: 'AI Agents: The Complete Guide',
      description: 'Build, Deploy, and Scale Intelligent AI Agents from Scratch',
      coverImage: '/api/placeholder/200/300',
      rating: 4.5,
      reviews: 128,
    },
    {
      id: 'cx-automation',
      title: 'Customer Experience Automation',
      description: 'A practical guide covering customer journey optimization, automation tools, and omnichannel customer engagement strategies.',
      coverImage: '/api/placeholder/200/300',
      rating: 4.2,
      reviews: 89,
    },
  ];

  const featuredProjects = [
    {
      id: 'ai-pm-lesson-platform',
      title: 'AI Product Manager Learning Platform',
      description: 'A comprehensive learning platform for AI Product Managers featuring resume analysis, prompt engineering tools, and industry insights.',
      technologies: ['React', 'TypeScript', 'FastAPI', 'OpenRouter API'],
      githubUrl: 'https://github.com/your-username/ai-pm-lesson-platform',
      featured: true,
    },
    {
      id: 'ats-resume-analyzer',
      title: 'ATS Resume Analyzer',
      description: 'AI-powered application that analyzes resumes against job descriptions to calculate compatibility scores.',
      technologies: ['Python', 'spaCy', 'Sentence Transformers', 'FastAPI'],
      githubUrl: 'https://github.com/your-username/ats-resume-analyzer',
      featured: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-blue-950 dark:to-purple-950">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-white mb-6">
              Manjunath Kalburgi
            </h1>
            <p className="text-xl sm:text-2xl text-slate-600 dark:text-slate-300 mb-4 max-w-3xl mx-auto">
              Passionate technologist and AI enthusiast making complex AI concepts accessible to everyone
            </p>
            <p className="text-lg text-slate-500 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
              Author of "AI Agents: The Complete Guide" and "Customer Experience Automation" | Developer of innovative AI/ML solutions
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/books">
                <button className="inline-flex items-center px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl">
                  <Book className="mr-2" size={20} />
                  Explore Books
                </button>
              </Link>
              <Link to="/about">
                <button className="inline-flex items-center px-8 py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  <User className="mr-2" size={20} />
                  About Me
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Books Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Featured Books</h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
            <p className="text-slate-600 dark:text-slate-300 mt-6 max-w-2xl mx-auto">
              Comprehensive guides covering AI agents, customer experience automation, and the future of intelligent systems.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {featuredBooks.map((book, index) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card hover className="h-full">
                  <div className="flex flex-col h-full">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-4">
                        <Book size={32} className="text-blue-600 dark:text-blue-400" />
                        <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                          <Star size={16} className="text-yellow-500 mr-1" />
                          {book.rating} ({book.reviews} reviews)
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                        {book.title}
                      </h3>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-slate-600 dark:text-slate-300 mb-6">
                        {book.description}
                      </p>
                    </CardContent>
                    <div className="p-6 pt-0">
                      <Link
                        to={`/books/${book.id}`}
                        className="inline-flex items-center text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                      >
                        Read More
                        <ArrowRight size={16} className="ml-1" />
                      </Link>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/books">
              <button className="inline-flex items-center px-6 py-3 text-blue-600 dark:text-blue-400 font-semibold border border-blue-600 dark:border-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                View All Books
                <ArrowRight size={16} className="ml-2" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Featured Projects</h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
            <p className="text-slate-600 dark:text-slate-300 mt-6 max-w-2xl mx-auto">
              Showcasing innovative AI/ML solutions and development projects.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card hover className="h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-4">
                      <Code2 size={32} className="text-purple-600 dark:text-purple-400" />
                      {project.featured && (
                        <span className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                          Featured
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                      {project.title}
                    </h3>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-slate-600 dark:text-slate-300 mb-4">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                  <div className="p-6 pt-0">
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                    >
                      View Project
                      <ArrowRight size={16} className="ml-1" />
                    </a>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/projects">
              <button className="inline-flex items-center px-6 py-3 text-blue-600 dark:text-blue-400 font-semibold border border-blue-600 dark:border-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                View All Projects
                <ArrowRight size={16} className="ml-2" />
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;