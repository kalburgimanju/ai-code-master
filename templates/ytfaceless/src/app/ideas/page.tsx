'use client';

import { useState } from 'react';
import { TrendingUp, Search, Zap, Filter, Eye, BarChart3 } from 'lucide-react';
import { videoIdeas, type VideoIdea } from '@/data/content';

const niches = ['All', 'Tech & AI', 'Psychology', 'Motivation', 'Society', 'Finance', 'Culture', 'Entertainment', 'Productivity'];
const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

export default function IdeasPage() {
  const [selectedNiche, setSelectedNiche] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = videoIdeas.filter((idea) => {
    if (selectedNiche !== 'All' && idea.niche !== selectedNiche) return false;
    if (selectedDifficulty !== 'All' && idea.difficulty !== selectedDifficulty) return false;
    if (searchQuery && !idea.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-dark-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-brand-600 to-fire-500 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-white text-sm font-medium mb-6">
            <TrendingUp size={16} />
            Trending Ideas
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Video Ideas</h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            High-view potential topics discovered by AI. Filter by niche, difficulty, or search for specific keywords.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search & Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-dark-100 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search video ideas..."
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-dark-50 border border-dark-200 text-dark-800 outline-none focus:border-brand-400 text-sm"
              />
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <p className="text-xs font-semibold text-dark-400 uppercase tracking-wide mb-2">Niche</p>
              <div className="flex flex-wrap gap-2">
                {niches.map((n) => (
                  <button
                    key={n}
                    onClick={() => setSelectedNiche(n)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedNiche === n
                        ? 'bg-brand-500 text-white shadow-sm'
                        : 'bg-dark-50 text-dark-500 hover:bg-dark-100'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-dark-400 uppercase tracking-wide mb-2">Difficulty</p>
              <div className="flex flex-wrap gap-2">
                {difficulties.map((d) => (
                  <button
                    key={d}
                    onClick={() => setSelectedDifficulty(d)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedDifficulty === d
                        ? 'bg-brand-500 text-white shadow-sm'
                        : 'bg-dark-50 text-dark-500 hover:bg-dark-100'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-dark-500">No ideas match your filters. Try adjusting your criteria.</p>
            </div>
          ) : (
            filtered.map((idea) => (
              <div key={idea.id} className="bg-white rounded-2xl shadow-sm border border-dark-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-brand-50 text-brand-600">{idea.niche}</span>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        idea.difficulty === 'Easy' ? 'bg-neon-50 text-neon-600' :
                        idea.difficulty === 'Medium' ? 'bg-accent-50 text-accent-600' :
                        'bg-fire-50 text-fire-600'
                      }`}>
                        {idea.difficulty}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-dark-800 mb-2">{idea.title}</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {idea.tags.map((tag) => (
                        <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-dark-50 text-dark-500 border border-dark-100">#{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xs text-dark-400">Est. Views</p>
                      <p className="text-lg font-bold text-brand-600 flex items-center gap-1">
                        <Eye size={16} />
                        {idea.estimatedViews}
                      </p>
                    </div>
                    <button className="px-5 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-colors">
                      Generate Script
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Stats */}
        <div className="mt-12 grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-dark-100 p-6 text-center">
            <BarChart3 size={24} className="text-brand-500 mx-auto mb-2" />
            <p className="text-2xl font-extrabold text-dark-800">{filtered.length}</p>
            <p className="text-xs text-dark-400">Ideas Found</p>
          </div>
          <div className="bg-white rounded-2xl border border-dark-100 p-6 text-center">
            <Eye size={24} className="text-fire-500 mx-auto mb-2" />
            <p className="text-2xl font-extrabold text-dark-800">2.1M</p>
            <p className="text-xs text-dark-400">Total Potential Views</p>
          </div>
          <div className="bg-white rounded-2xl border border-dark-100 p-6 text-center">
            <Zap size={24} className="text-neon-500 mx-auto mb-2" />
            <p className="text-2xl font-extrabold text-dark-800">82%</p>
            <p className="text-xs text-dark-400">Avg. Success Rate</p>
          </div>
        </div>
      </div>
    </div>
  );
}
