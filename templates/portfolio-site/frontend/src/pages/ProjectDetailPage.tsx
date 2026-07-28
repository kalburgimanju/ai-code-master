import React from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ExternalLink, Github, Calendar, Users, Tag, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/common/Card';
import { sampleProjects } from '../utils/data';

const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const project = sampleProjects.find((p) => p.id === projectId);

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Project Not Found</h1>
          <p className="text-slate-600 dark:text-slate-400">
            The project you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Projects
          </button>
        </motion.div>

        {/* Project Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-5xl font-bold text-slate-900 dark:text-white mb-4">
                {project.title}
              </h1>
              <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400">
                <div className="flex items-center">
                  <Calendar size={16} className="mr-1" />
                  {project.date}
                </div>
                <div className="flex items-center">
                  <Tag size={16} className="mr-1" />
                  {project.category}
                </div>
                <div className="flex items-center">
                  <Users size={16} className="mr-1" />
                  {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </div>
              </div>
            </div>
            {project.featured && (
              <span className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-full">
                Featured Project
              </span>
            )}
          </div>

          <p className="text-xl text-slate-600 dark:text-slate-300">
            {project.description}
          </p>
        </motion.div>

        {/* Project Image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-12"
        >
          <img
            src={project.image}
            alt={project.title}
            className="w-full h-96 object-cover rounded-xl"
          />
        </motion.div>

        {/* Project Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid lg:grid-cols-3 gap-8"
        >
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                  Project Overview
                </h2>
                <p className="text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
                  {project.description}
                </p>

                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                  Key Features
                </h3>
                <ul className="space-y-2 text-slate-600 dark:text-slate-300 mb-8">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></div>
                    <span>Built with {project.technologies.join(', ')}</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></div>
                    <span>Production-ready implementation</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></div>
                    <span>Advanced AI/ML capabilities</span>
                  </li>
                </ul>

                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                  Technologies Used
                </h3>
                <div className="flex flex-wrap gap-2 mb-8">
                  {project.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Links */}
            <Card>
              <CardHeader>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Project Links
                </h3>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <Github size={20} className="mr-3 text-slate-600 dark:text-slate-400" />
                      <span className="font-medium text-slate-900 dark:text-white">GitHub Repository</span>
                      <ExternalLink size={16} className="ml-auto text-slate-400" />
                    </a>
                  )}
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <ExternalLink size={20} className="mr-3 text-green-600" />
                      <span className="font-medium text-slate-900 dark:text-white">Live Demo</span>
                      <ExternalLink size={16} className="ml-auto text-slate-400" />
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Project Tags */}
            <Card>
              <CardHeader>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Tags
                </h3>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Status */}
            <Card>
              <CardHeader>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Status
                </h3>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div
                    className={`w-3 h-3 rounded-full mr-3 ${
                      project.status === 'production'
                        ? 'bg-green-500'
                        : project.status === 'completed'
                        ? 'bg-blue-500'
                        : project.status === 'published'
                        ? 'bg-purple-500'
                        : project.status === 'draft'
                        ? 'bg-yellow-500'
                        : 'bg-gray-500'
                    }`}
                  ></div>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;