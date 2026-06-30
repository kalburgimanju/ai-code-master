'use client';

import { useState, useEffect, useRef } from 'react';
import { TrendingUp, Search, Eye, RefreshCw, Loader2, AlertCircle, Download, Clock, Zap, Pause, Play, Trash2, HardDrive } from 'lucide-react';
import { loadFromStorage, mergeAndSave, clearStorage, downloadJSON, downloadCSV, type StoredIdea } from '@/lib/idea-store';

const INTERVAL_SECONDS = 120;
const AUTO_EXPORT_EVERY = 5; // Auto-export every 5 generations
const niches = ['All', 'AI', 'startups', 'realestate', 'automation', 'productivity', 'finance', 'tech', 'psychology', 'motivation', 'entertainment'];

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<StoredIdea[]>([]);
  const [generating, setGenerating] = useState(false);
  const [autoMode, setAutoMode] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNiche, setSelectedNiche] = useState('All');
  const [countdown, setCountdown] = useState(INTERVAL_SECONDS);
  const [lastBatchCount, setLastBatchCount] = useState(0);
  const [generationCount, setGenerationCount] = useState(0);
  const [autoExportEnabled, setAutoExportEnabled] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // Load ideas from localStorage on mount
  useEffect(() => {
    setIdeas(loadFromStorage());
  }, []);

  const generateNow = async () => {
    setGenerating(true);
    setError('');
    try {
      const res = await fetch('/api/auto-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niches: niches.filter((n) => n !== 'All') }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Generation failed');
        return;
      }
      const data = await res.json();
      const newIdeas: StoredIdea[] = data.ideas || [];

      // Merge with existing, save to localStorage
      const current = loadFromStorage();
      const merged = mergeAndSave(current, newIdeas);
      setIdeas(merged);
      setLastBatchCount(newIdeas.length);
      setCountdown(INTERVAL_SECONDS);

      // Auto-export to files every N generations
      setGenerationCount((prev) => {
        const next = prev + 1;
        if (autoExportEnabled && next >= AUTO_EXPORT_EVERY) {
          // Auto-download both JSON and CSV
          setTimeout(() => {
            downloadJSON(merged);
            downloadCSV(merged);
          }, 500); // Small delay so state updates first
          return 0; // Reset counter
        }
        return next;
      });
    } catch {
      setError('Network error — try again');
    }
    setGenerating(false);
  };

  const toggleAutoMode = () => {
    if (autoMode) {
      // Stop
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
      setAutoMode(false);
      setCountdown(INTERVAL_SECONDS);
    } else {
      // Start
      setAutoMode(true);
      setCountdown(INTERVAL_SECONDS);
      generateNow();

      intervalRef.current = setInterval(() => {
        generateNow();
      }, INTERVAL_SECONDS * 1000);

      countdownRef.current = setInterval(() => {
        setCountdown((prev) => (prev <= 1 ? INTERVAL_SECONDS : prev - 1));
      }, 1000);
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  const filtered = ideas.filter((idea) => {
    if (selectedNiche !== 'All' && idea.niche.toLowerCase() !== selectedNiche.toLowerCase()) return false;
    if (searchQuery && !idea.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const clearAll = () => {
    clearStorage();
    setIdeas([]);
    setLastBatchCount(0);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const nicheCount = (niche: string) => {
    if (niche === 'All') return ideas.length;
    return ideas.filter((i) => i.niche.toLowerCase() === niche.toLowerCase()).length;
  };

  return (
    <div className="min-h-screen bg-dark-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-brand-600 to-fire-500 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-white text-sm font-medium mb-6">
            <TrendingUp size={16} />
            Auto Idea Generation
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Video Ideas</h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            AI discovers 30 trending topics every 2 minutes. Ideas persist in your browser and can be exported as JSON/Excel files.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Control Panel */}
        <div className="bg-white rounded-2xl shadow-sm border border-dark-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
            {/* Auto mode toggle */}
            <div className="flex items-center gap-4">
              <button
                onClick={toggleAutoMode}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all ${
                  autoMode
                    ? 'bg-fire-500 text-white hover:bg-fire-600 shadow-lg shadow-fire-500/25'
                    : 'bg-gradient-to-r from-brand-500 to-fire-500 text-white hover:shadow-lg'
                }`}
              >
                {autoMode ? <Pause size={18} /> : <Play size={18} />}
                {autoMode ? 'Stop Auto' : 'Start Auto-Generate'}
              </button>
              {autoMode && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neon-50 border border-neon-200">
                  <span className="w-2 h-2 rounded-full bg-neon-500 animate-pulse" />
                  <span className="text-sm font-medium text-neon-700">Live</span>
                  <Clock size={14} className="text-neon-500" />
                  <span className="text-sm font-mono font-bold text-neon-700">{formatTime(countdown)}</span>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 text-sm">
              <div className="text-center">
                <p className="text-2xl font-extrabold text-dark-800">{ideas.length}</p>
                <p className="text-xs text-dark-400">Total Stored</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-extrabold text-dark-800">{filtered.length}</p>
                <p className="text-xs text-dark-400">Showing</p>
              </div>
              {lastBatchCount > 0 && (
                <div className="text-center">
                  <p className="text-2xl font-extrabold text-neon-600">+{lastBatchCount}</p>
                  <p className="text-xs text-dark-400">Last Batch</p>
                </div>
              )}
            </div>

            {/* Generate button */}
            <button
              onClick={generateNow}
              disabled={generating}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-dark-100 text-dark-700 text-sm font-semibold hover:bg-dark-200 disabled:opacity-50 transition-colors"
            >
              {generating ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
              {generating ? 'Generating...' : 'Generate Now'}
            </button>

            {/* Download + Clear */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => downloadJSON(ideas)}
                disabled={ideas.length === 0}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-dark-50 border border-dark-200 text-dark-600 text-xs font-medium hover:bg-dark-100 transition-colors disabled:opacity-50"
                title="Save ideas as JSON file on your computer"
              >
                <Download size={14} />
                Save JSON
              </button>
              <button
                onClick={() => downloadCSV(ideas)}
                disabled={ideas.length === 0}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-dark-50 border border-dark-200 text-dark-600 text-xs font-medium hover:bg-dark-100 transition-colors disabled:opacity-50"
                title="Save ideas as Excel/CSV file on your computer"
              >
                <Download size={14} />
                Save Excel
              </button>
              <button
                onClick={clearAll}
                disabled={ideas.length === 0}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-fire-50 border border-fire-200 text-fire-600 text-xs font-medium hover:bg-fire-100 transition-colors disabled:opacity-50"
                title="Clear all stored ideas"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          {/* Status messages */}
          {error && (
            <div className="mt-4 p-3 rounded-xl bg-fire-50 border border-fire-100 flex items-center gap-2 text-sm text-fire-700">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          {autoMode && (
            <div className="mt-4 p-3 rounded-xl bg-brand-50 border border-brand-100 text-sm text-brand-700 flex items-center gap-2">
              <HardDrive size={14} />
              <p>Auto-generating 30 ideas every 2 minutes across <strong>10 niches</strong>. Ideas are saved to your browser storage automatically. Export as JSON or Excel anytime.</p>
            </div>
          )}

          {ideas.length > 0 && !autoMode && (
            <div className="mt-4 p-3 rounded-xl bg-neon-50 border border-neon-100 text-sm text-neon-700 flex items-center gap-2">
              <HardDrive size={14} />
              <p><strong>{ideas.length} ideas</strong> stored in your browser. Click &quot;Save JSON&quot; or &quot;Save Excel&quot; to download a file to your computer.</p>
            </div>
          )}
        </div>

        {/* Niche filter chips */}
        <div className="bg-white rounded-2xl shadow-sm border border-dark-100 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ideas..."
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-dark-50 border border-dark-200 text-dark-800 outline-none focus:border-brand-400 text-sm"
              />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
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
                {n} {nicheCount(n) > 0 && <span className="ml-1 opacity-60">({nicheCount(n)})</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Ideas list */}
        <div className="space-y-3">
          {generating && ideas.length === 0 && (
            <div className="text-center py-16"><Loader2 className="animate-spin text-brand-500 mx-auto" size={32} /></div>
          )}
          {!generating && filtered.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-dark-100">
              <div className="text-5xl mb-4">💡</div>
              <h3 className="text-xl font-bold text-dark-800 mb-2">No ideas yet</h3>
              <p className="text-dark-500 mb-6">Click &quot;Start Auto-Generate&quot; or &quot;Generate Now&quot; to discover 30 trending topics.</p>
            </div>
          )}
          {filtered.map((idea) => (
            <div key={idea.id} className="bg-white rounded-2xl shadow-sm border border-dark-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-brand-50 text-brand-600 capitalize">{idea.niche}</span>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      idea.competition === 'Low' ? 'bg-neon-50 text-neon-600' :
                      idea.competition === 'Medium' ? 'bg-accent-50 text-accent-600' :
                      'bg-fire-50 text-fire-600'
                    }`}>
                      {idea.competition}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      idea.source === 'ai_generated' ? 'bg-brand-100 text-brand-700' : 'bg-dark-100 text-dark-500'
                    }`}>
                      {idea.source === 'ai_generated' ? 'AI Generated' : 'Fallback'}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-dark-800 mb-2">{idea.title}</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {idea.keywords.map((kw) => (
                      <span key={kw} className="text-xs px-2 py-0.5 rounded-full bg-dark-50 text-dark-500 border border-dark-100">#{kw}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-6 shrink-0">
                  <div className="text-right">
                    <p className="text-xs text-dark-400">Est. Views</p>
                    <p className="text-lg font-bold text-brand-600 flex items-center gap-1">
                      <Eye size={16} />
                      {idea.estimatedViews}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-dark-400">Score</p>
                    <p className="text-lg font-bold text-dark-800">{idea.trendScore}</p>
                  </div>
                  <div className="text-right text-xs text-dark-400">
                    {new Date(idea.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
