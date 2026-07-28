import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Grid, List } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { sampleProjects } from '../utils/data';

const ProjectsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const categories = Array.from(new Set(sampleProjects.map((project) => project.category)));
  const statuses = Array.from(new Set(sampleProjects.map((project) => project.status)));

  const filteredProjects = sampleProjects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.technologies.some((tech) => tech.toLowerCase().includes(searchTerm.toLowerCase())) ||
      project.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = !selectedCategory || project.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

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
          <h1 className="text-5xl font-bold text-slate-900 dark:text-white mb-4">Projects</h1>
          <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
          <p className="text-slate-600 dark:text-slate-300 mt-6 max-w-2xl mx-auto">
            Showcasing innovative AI/ML solutions, web applications, and development projects with detailed implementations and live demos.
          </p>
        </motion.div>

        {/* Search and Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-6 mb-12"
        >
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <Input
                  type="text"
                  placeholder="Search projects by title, description, technologies, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex-1">
              <select
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(e.target.value || null)}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                }`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                }`}
              >
                <List size={20} />
              </button>
            </div>
          </div>

          {/* Active Filters */}
          {(selectedCategory || searchTerm) && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              {selectedCategory && (
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                  <Filter size={14} className="text-blue-600" />
                  <span className="text-sm font-medium text-blue-600">Category: {selectedCategory}</span>
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    ×
                  </button>
                </div>
              )}
              {searchTerm && (
                <div className="flex items-center gap-2 px-3 py-1 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                  <Search size={14} className="text-purple-600" />
                  <span className="text-sm font-medium text-purple-600">Search: {searchTerm}</span>
                  <button
                    onClick={() => setSearchTerm('')}
                    className="text-purple-600 hover:text-purple-700"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Results Count */}
        <div className="flex justify-between items-center mb-8">
          <p className="text-slate-600 dark:text-slate-400">
            Found {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}
          </p>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            View: {viewMode}
          </div>
        </div>

        {/* Projects Display */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                onClick={() => window.location.href = `/projects/${project.id}`}
                className="cursor-pointer"
              >
                <Card hover className="h-full">
                  <div className="flex flex-col h-full">
                    <div className="relative">
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-48 object-cover rounded-t-xl"
                      />
                      {project.featured && (
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                            Featured
                          </span>
                        </div>
                      )}
                    </div>
                    <CardHeader>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 line-clamp-2">
                        {project.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-2">
                        {project.description}
                      </p>
                    </CardHeader>
                    <CardContent className="flex-grow">
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
                    </CardContent>
                    <div className="p-6 pt-0">
                      <div className="flex justify-between items-center mb-4">
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          {project.date}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          {project.status}
                        </div>
                      </div>
                      <div className="flex gap-4">
                        {project.githubUrl && (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.069 1.835 2.809 1.304 3.495.997.108-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.31.468-2.381 1.234-3.221-.135-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.203 2.874.1 3.176.77-.84 1.235-1.915 1.235-3.221 0-4.597-2.813-5.626-5.467-5.931.43-.371.823-1.096.823-2.211 0-1.588-.015-2.866-.015-2.866-2.078-1.305-3.587-3.334-3.587-5.68 0-2.18 1.2-3.948 2.91-4.63.27-.20.585-.394.585-.685 0-.532-.01-1.002-.01-1.002-.41.11-.8.29-1.15.5.6-.62 1.58-.97 2.47-.97.89 0 1.86.35 2.47.97.35.41.53.8.53 1.2 0 .7-.01.99-.01.99 0 .39-.11.69-.52.83-.1.52-.21.97-.21 1.77z" />
                              </svg>
                            </a>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = `/projects/${project.id}`;
                          }}
                          className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
                        >
                          View Details
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="cursor-pointer"
                onClick={() => window.location.href = `/projects/${project.id}`}
              >
                <Card hover>
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/3">
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-48 md:h-full object-cover rounded-t-xl md:rounded-l-xl md:rounded-tr-none"
                      />
                    </div>
                    <div className="md:w-2/3 flex flex-col">
                      <CardHeader>
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                            {project.title}
                          </h3>
                          {project.featured && (
                            <span className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                              Featured
                            </span>
                          )}
                        </div>
                        <p className="text-slate-600 dark:text-slate-300">
                          {project.description}
                        </p>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <div className="flex flex-wrap gap-2 mb-4">
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
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-slate-500 dark:text-slate-400">
                            {project.date} • {project.category}
                          </div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">
                            {project.status}
                          </div>
                        </div>
                        <div className="flex gap-4 mt-4">
                          {project.githubUrl && (
                            <a
                              href={project.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.069 1.835 2.809 1.304 3.495.997.108-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.31.468-2.381 1.234-3.221-.135-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.203 2.874.1 3.176.77-.84 1.235-1.915 1.235-3.221 0-4.597-2.813-5.626-5.467-5.931.43-.371.823-1.096.823-2.211 0-1.588-.015-2.866-.015-2.866-2.078-1.305-3.587-3.334-3.587-5.68 0-2.18 1.2-3.948 2.91-4.63.27-.20.585-.394.585-.685 0-.532-.01-1.002-.01-1.002-.41.11-.8.29-1.15.5.6-.62 1.58-.97 2.47-.97.89 0 1.86.35 2.47.97.35.41.53.8.53 1.2 0 .7-.01.99-.01.99 0 .39-.11.69-.52.83-.1.52-.21.97-.21 1.77z" />
                            </a>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.location.href = `/projects/${project.id}`;
                            }}
                            className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
                          >
                            View Details
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {filteredProjects.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Search size={64} className="mx-auto text-slate-400 mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              No projects found
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Try adjusting your search criteria or filters.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ProjectsPage;