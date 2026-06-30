'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Search, Eye, BarChart3, RefreshCw, Loader2, AlertCircle } from 'lucide-react';

interface Idea {
  id: string;
  title: string;
  niche: string;
  estimatedViews: string;
  difficulty: string;
  keywords: string[];
}

const niches = ['All', 'Tech & AI', 'Psychology', 'Motivation', 'Society', 'Finance', 'Culture', 'Entertainment', 'Productivity'];
const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

export default function IdeasPage() {
  const [selectedNiche, setSelectedNiche] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [discovering, setDiscovering] = useState(false);
  const [error, setError] = useState('');

  const fetchIdeas = async () => {
    try {
      const res = await fetch('/api/ideas');
      const data = await res.json();
      setIdeas(data.ideas || []);
    } catch {
      // Fallback to mock data if API unavailable
      setIdeas([
        { id: '1', title: '10 AI Tools Nobody Is Talking About in 2026', niche: 'Tech & AI', estimatedViews: '150K-500K', difficulty: 'Easy', keywords: ['ai tools', 'passive income', 'side hustle'] },
        { id: '2', title: 'Dark Psychology Tricks That Actually Work', niche: 'Psychology', estimatedViews: '200K-1M', difficulty: 'Medium', keywords: ['psychology', 'manipulation', 'body language'] },
        { id: '3', title: 'Why Most People Die With Regret', niche: 'Motivation', estimatedViews: '300K-2M', difficulty: 'Easy', keywords: ['motivation', 'regret', 'life advice'] },
        { id: '4', title: 'The Dark Side of Social Media', niche: 'Society', estimatedViews: '100K-400K', difficulty: 'Medium', keywords: ['social media', 'mental health'] },
        { id: '5', title: '5 Passive Income Ideas for Introverts', niche: 'Finance', estimatedViews: '250K-800K', difficulty: 'Easy', keywords: ['passive income', 'introvert', 'money'] },
        { id: '6', title: 'How Japan Solves Problems Nobody Else Can', niche: 'Culture', estimatedViews: '100K-500K', difficulty: 'Hard', keywords: ['Japan', 'innovation', 'culture'] },
      ]);
    }
    setLoading(false);
  };

  const handleDiscover = async () => {
    setDiscovering(true);
    setError('');
    try {
      const res = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niches: ['tech', 'psychology', 'motivation', 'finance', 'entertainment'] }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Discovery failed');
        return;
      }
      await fetchIdeas();
    } catch {
      setError('Network error');
    }
    setDiscovering(false);
  };

  useEffect(() => { fetchIdeas(); }, []);

  const filtered = ideas.filter((idea) => {
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
        {/* Search & Discover */}
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
            <button
              onClick={handleDiscover}
              disabled={discovering}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-fire-500 text-white font-semibold text-sm hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {discovering ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
              {discovering ? 'Discovering...' : 'Discover New Ideas'}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-fire-50 border border-fire-100 flex items-center gap-2 text-sm text-fire-700">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

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
          {loading ? (
            <div className="text-center py-16"><Loader2 className="animate-spin text-brand-500 mx-auto" size={32} /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-dark-500">No ideas match your filters. Try adjusting or discover new topics.</p>
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
                      {idea.keywords.map((tag) => (
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
                    <a href="/scripts" className="px-5 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-colors">
                      Generate Script
                    </a>
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
            <TrendingUp size={24} className="text-neon-500 mx-auto mb-2" />
            <p className="text-2xl font-extrabold text-dark-800">82%</p>
            <p className="text-xs text-dark-400">Avg. Success Rate</p>
          </div>
        </div>
      </div>
    </div>
  );
}
