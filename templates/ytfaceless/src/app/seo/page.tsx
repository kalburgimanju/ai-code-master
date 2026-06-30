'use client';

import { useState } from 'react';
import { Search, TrendingUp, BarChart3, Tag, Copy, Check, Sparkles } from 'lucide-react';
import { keywords } from '@/data/content';

export default function SEOPage() {
  const [query, setQuery] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'score' | 'volume' | 'competition'>('score');

  const sorted = [...keywords].sort((a, b) => {
    if (sortBy === 'score') return b.score - a.score;
    if (sortBy === 'volume') return parseInt(b.searchVolume.replace('K', '')) - parseInt(a.searchVolume.replace('K', ''));
    const compOrder = { Low: 1, Medium: 2, High: 3 };
    return compOrder[a.competition] - compOrder[b.competition];
  });

  const filtered = sorted.filter((kw) =>
    query ? kw.keyword.toLowerCase().includes(query.toLowerCase()) : true
  );

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-neon-500';
    if (score >= 70) return 'text-accent-500';
    return 'text-fire-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 85) return 'bg-neon-50';
    if (score >= 70) return 'bg-accent-50';
    return 'bg-fire-50';
  };

  const getCompetitionColor = (c: string) => {
    if (c === 'Low') return 'bg-neon-50 text-neon-600';
    if (c === 'Medium') return 'bg-accent-50 text-accent-600';
    return 'bg-fire-50 text-fire-600';
  };

  return (
    <div className="min-h-screen bg-dark-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-sky-500 to-brand-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-white text-sm font-medium mb-6">
            <Search size={16} />
            SEO Optimization
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">SEO Tools</h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Find low-competition, high-volume keywords. Optimize your titles, descriptions, and tags for maximum reach.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Keyword Research */}
        <div className="bg-white rounded-2xl shadow-sm border border-dark-100 p-6 mb-8">
          <h2 className="text-lg font-bold text-dark-800 mb-4">Keyword Research</h2>
          <div className="flex gap-3 mb-4">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search keywords..."
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-dark-50 border border-dark-200 text-dark-800 outline-none focus:border-brand-400 text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2">
            {(['score', 'volume', 'competition'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className={`px-4 py-2 rounded-lg text-xs font-medium transition-all capitalize ${
                  sortBy === s ? 'bg-brand-500 text-white' : 'bg-dark-50 text-dark-500 hover:bg-dark-100'
                }`}
              >
                Sort by {s}
              </button>
            ))}
          </div>
        </div>

        {/* Keyword Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-dark-100 overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-100">
                  <th className="text-left px-6 py-4 text-xs font-bold text-dark-400 uppercase tracking-wide">Keyword</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-dark-400 uppercase tracking-wide">Search Volume</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-dark-400 uppercase tracking-wide">Competition</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-dark-400 uppercase tracking-wide">Score</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-dark-400 uppercase tracking-wide">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((kw) => (
                  <tr key={kw.id} className="border-b border-dark-50 hover:bg-dark-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-dark-800">{kw.keyword}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-dark-600">{kw.searchVolume}/mo</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getCompetitionColor(kw.competition)}`}>
                        {kw.competition}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-bold ${getScoreColor(kw.score)} ${getScoreBg(kw.score)} px-2.5 py-1 rounded-lg`}>
                        {kw.score}/100
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleCopy(kw.keyword, kw.id)}
                        className="flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-700 transition-colors"
                      >
                        {copied === kw.id ? <Check size={14} /> : <Copy size={14} />}
                        {copied === kw.id ? 'Copied' : 'Copy'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SEO Checklist */}
        <div className="bg-white rounded-2xl shadow-sm border border-dark-100 p-8">
          <h2 className="text-xl font-bold text-dark-800 mb-6">Video SEO Checklist</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { title: 'Title', desc: 'Include primary keyword in first 60 characters', icon: '📝' },
              { title: 'Description', desc: 'First 2 lines should have keyword + compelling reason to click', icon: '📄' },
              { title: 'Tags', desc: 'Use 15-20 tags mixing broad and specific keywords', icon: '🏷️' },
              { title: 'Thumbnail', desc: 'High contrast, readable text, emotional face or object', icon: '🖼️' },
              { title: 'First 30 Seconds', desc: 'Hook viewers immediately — this determines retention', icon: '⚡' },
              { title: 'End Screen', desc: 'Always add subscribe button + next video card', icon: '🎯' },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3 p-4 rounded-xl bg-dark-50 border border-dark-100">
                <span className="text-xl">{item.icon}</span>
                <div>
                  <p className="text-sm font-bold text-dark-800">{item.title}</p>
                  <p className="text-xs text-dark-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
