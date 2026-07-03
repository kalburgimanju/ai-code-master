import React, { useState } from 'react';
import { BookOpen, Music, Video, FileText, Search } from 'lucide-react';
import { getAllResources } from '../data';

const ResourcesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'book' | 'audio' | 'video' | 'learning-video'>('all');

  const resources = getAllResources();
  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          resource.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'all' || resource.type === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const filterTabs = [
    { id: 'all', label: 'All Resources', icon: FileText },
    { id: 'book', label: 'Books', icon: BookOpen },
    { id: 'audio', label: 'Audio', icon: Music },
    { id: 'video', label: 'Videos', icon: Video },
    { id: 'learning-video', label: 'Learning Videos', icon: Video },
  ];

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-slate-800 mb-6 text-center">
          Learning Resources
        </h1>
        <p className="text-slate-600 text-center max-w-3xl mx-auto mb-12">
          Access books, audio lessons, videos, and learning materials for Sanskrit study.
        </p>

        {/* Search and Filters */}
        <div className="mb-8">
          {/* Search */}
          <div className="relative max-w-md mx-auto mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sanskritBlue-500 focus:border-transparent"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-2">
            {filterTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeFilter === tab.id
                      ? 'bg-sanskritBlue-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredResources.length > 0 ? (
            filteredResources.map((resource) => {
              const Icon = resource.type === 'book' ? BookOpen :
                           resource.type === 'audio' ? Music :
                           resource.type === 'video' ? Video : FileText;
              return (
                <div key={resource.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                  <div className="bg-sanskritBlue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-sanskritBlue-600" />
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-2">{resource.title}</h3>
                  <p className="text-sm text-slate-600 mb-3">{resource.description}</p>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{resource.type}</span>
                    {resource.duration && <span>{resource.duration}</span>}
                  </div>
                  <a
                    href={resource.url}
                    className="mt-3 inline-flex items-center justify-center w-full px-3 py-2 bg-sanskritBlue-500 text-white text-sm font-medium rounded-lg hover:bg-sanskritBlue-600 transition-colors"
                  >
                    View Resource
                  </a>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-slate-500">No resources found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResourcesPage;