import React from 'react';
import { motion } from 'framer-motion';
import { Code2, ExternalLink } from 'lucide-react';

const Projects: React.FC = () => {
  const projects = [
    {
      id: '1',
      title: 'E-Commerce Platform',
      description: 'A full-stack e-commerce solution with React frontend, Node.js backend, and Stripe integration. Features include product management, shopping cart, and payment processing.',
      image: '/api/placeholder/400/300',
      technologies: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Stripe', 'AWS'],
      githubUrl: 'https://github.com/example/ecommerce-platform',
      liveUrl: 'https://ecommerce-demo.example.com',
      featured: true,
    },
    {
      id: '2',
      title: 'Task Management App',
      description: 'A collaborative task management application with real-time updates, drag-and-drop functionality, and team collaboration features.',
      image: '/api/placeholder/400/300',
      technologies: ['React', 'Redux', 'Node.js', 'Socket.io', 'MongoDB'],
      githubUrl: 'https://github.com/example/task-manager',
      featured: true,
    },
    {
      id: '3',
      title: 'Weather Dashboard',
      description: 'A weather dashboard application that displays real-time weather data from multiple sources with interactive charts and forecasts.',
      image: '/api/placeholder/400/300',
      technologies: ['React', 'Chart.js', 'Weather API', 'Tailwind CSS'],
      githubUrl: 'https://github.com/example/weather-dashboard',
      liveUrl: 'https://weather-dashboard.example.com',
    },
    {
      id: '4',
      title: 'Blog Platform',
      description: 'A modern blog platform with markdown support, rich text editing, and content management system built with Next.js.',
      image: '/api/placeholder/400/300',
      technologies: ['Next.js', 'React', 'Markdown', 'Strapi', 'GraphQL'],
      githubUrl: 'https://github.com/example/blog-platform',
    },
    {
      id: '5',
      title: 'Chat Application',
      description: 'A real-time chat application with private messaging, group chats, and file sharing capabilities.',
      image: '/api/placeholder/400/300',
      technologies: ['React', 'Socket.io', 'Node.js', 'Redis', 'WebRTC'],
      githubUrl: 'https://github.com/example/chat-app',
    },
    {
      id: '6',
      title: 'Portfolio Website',
      description: 'A customizable portfolio website template built with React and Tailwind CSS, featuring dark mode and animations.',
      image: '/api/placeholder/400/300',
      technologies: ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Framer Motion'],
      githubUrl: 'https://github.com/example/portfolio-template',
      featured: true,
    },
  ];

  return (
    <section id="projects" className="py-20 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
            A collection of my best work showcasing different technologies and problem-solving approaches.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
            >
              {project.featured && (
                <div className="absolute top-4 left-4 z-10">
                  <span className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                    Featured
                  </span>
                </div>
              )}

              <div className="aspect-video bg-gradient-to-br from-blue-400 to-purple-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Code2 size={48} className="text-white/60" />
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {project.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 mb-4 line-clamp-2">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {project.technologies.slice(0, 3).map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                  {project.technologies.length > 3 && (
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs font-medium">
                      +{project.technologies.length - 3} more
                    </span>
                  )}
                </div>

                <div className="flex gap-4">
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
                  >
                    <Code2 size={16} />
                    GitHub
                  </a>
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
                    >
                      <ExternalLink size={16} />
                      Live
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;