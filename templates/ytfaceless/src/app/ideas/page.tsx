'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { TrendingUp, Search, Eye, Loader2, AlertCircle, Download, Clock, Zap, Pause, Play, Trash2, HardDrive, FileText, Video, ChevronRight, X } from 'lucide-react';
import { loadFromStorage, mergeAndSave, clearStorage, downloadJSON, downloadCSV, type StoredIdea } from '@/lib/idea-store';
import IdeaDetailModal from '@/components/IdeaDetailModal';

const INTERVAL_SECONDS = 120;
const AUTO_EXPORT_EVERY = 5;
const niches = ['All', 'AI', 'startups', 'realestate', 'automation', 'productivity', 'finance', 'tech', 'psychology', 'motivation', 'entertainment'];

const difficultyConfig: Record<string, { color: string }> = {
  Easy: { color: 'bg-neon-50 text-neon-600' },
  Medium: { color: 'bg-accent-50 text-accent-600' },
  Hard: { color: 'bg-fire-50 text-fire-600' },
};

export default function IdeasPage() {
  const router = useRouter();
  const [ideas, setIdeas] = useState<StoredIdea[]>([]);
  const [generating, setGenerating] = useState(false);
  const [autoMode, setAutoMode] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNiche, setSelectedNiche] = useState('All');
  const [countdown, setCountdown] = useState(INTERVAL_SECONDS);
  const [lastBatchCount, setLastBatchCount] = useState(0);
  const [generationCount, setGenerationCount] = useState(0);
  const [selectedIdea, setSelectedIdea] = useState<StoredIdea | null>(null);
  const [generatingScript, setGeneratingScript] = useState<string | null>(null);
  const [scriptResult, setScriptResult] = useState<{ title: string; wordCount: number } | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

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
      const current = loadFromStorage();
      const merged = mergeAndSave(current, newIdeas);
      setIdeas(merged);
      setLastBatchCount(newIdeas.length);
      setCountdown(INTERVAL_SECONDS);

      setGenerationCount((prev) => {
        const next = prev + 1;
        if (next >= AUTO_EXPORT_EVERY) {
          setTimeout(() => {
            downloadJSON(merged);
            downloadCSV(merged);
          }, 500);
          return 0;
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
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
      setAutoMode(false);
      setCountdown(INTERVAL_SECONDS);
    } else {
      setAutoMode(true);
      setCountdown(INTERVAL_SECONDS);
      generateNow();
      intervalRef.current = setInterval(() => { generateNow(); }, INTERVAL_SECONDS * 1000);
      countdownRef.current = setInterval(() => { setCountdown((prev) => (prev <= 1 ? INTERVAL_SECONDS : prev - 1)); }, 1000);
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

  const clearAll = () => { clearStorage(); setIdeas([]); setLastBatchCount(0); };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const nicheCount = (niche: string) => niche === 'All' ? ideas.length : ideas.filter((i) => i.niche.toLowerCase() === niche.toLowerCase()).length;

  const handleGenerateScript = async (idea: StoredIdea) => {
    setGeneratingScript(idea.id);
    setScriptResult(null);
    try {
      const res = await fetch('/api/scripts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: idea.title, niche: idea.niche, duration: 600 }),
      });
      if (res.ok) {
        const data = await res.json();
        setScriptResult({ title: data.script.title, wordCount: data.script.wordCount });
        setTimeout(() => router.push('/scripts'), 1500);
      }
    } catch { /* ignore */ }
    setGeneratingScript(null);
  };

  const handleRecordVideo = (idea: StoredIdea) => {
    router.push(`/scripts?topic=${encodeURIComponent(idea.title)}&niche=${encodeURIComponent(idea.niche)}`);
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
            AI discovers 30 trending topics every 2 minutes. Click any idea to view details, generate scripts, or record videos.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Script generation toast */}
        {scriptResult && (
          <div className="mb-6 p-4 rounded-xl bg-neon-50 border border-neon-200 flex items-center gap-3 text-sm text-neon-700">
            <FileText size={16} />
            <span>Script generated: <strong>{scriptResult.title}</strong> ({scriptResult.wordCount} words) — redirecting to Scripts page...</span>
            <button onClick={() => setScriptResult(null)} className="ml-auto"><X size={14} /></button>
          </div>
        )}

        {/* Control Panel */}
        <div className="bg-white rounded-2xl shadow-sm border border-dark-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
            <div className="flex items-center gap-4">
              <button
                onClick={toggleAutoMode}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all ${
                  autoMode ? 'bg-fire-500 text-white hover:bg-fire-600 shadow-lg shadow-fire-500/25' : 'bg-gradient-to-r from-brand-500 to-fire-500 text-white hover:shadow-lg'
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

            <div className="flex items-center gap-6 text-sm">
              <div className="text-center">
                <p className="text-2xl font-extrabold text-dark-800">{ideas.length}</p>
                <p className="text-xs text-dark-400">Total</p>
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

            <button onClick={generateNow} disabled={generating}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-dark-100 text-dark-700 text-sm font-semibold hover:bg-dark-200 disabled:opacity-50 transition-colors">
              {generating ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
              {generating ? 'Generating...' : 'Generate Now'}
            </button>

            <div className="flex items-center gap-2">
              <button onClick={() => downloadJSON(ideas)} disabled={ideas.length === 0}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-dark-50 border border-dark-200 text-dark-600 text-xs font-medium hover:bg-dark-100 transition-colors disabled:opacity-50">
                <Download size={14} /> JSON
              </button>
              <button onClick={() => downloadCSV(ideas)} disabled={ideas.length === 0}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-dark-50 border border-dark-200 text-dark-600 text-xs font-medium hover:bg-dark-100 transition-colors disabled:opacity-50">
                <Download size={14} /> Excel
              </button>
              <button onClick={clearAll} disabled={ideas.length === 0}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-fire-50 border border-fire-200 text-fire-600 text-xs font-medium hover:bg-fire-100 transition-colors disabled:opacity-50">
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-fire-50 border border-fire-100 flex items-center gap-2 text-sm text-fire-700">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          {autoMode && (
            <div className="mt-4 p-3 rounded-xl bg-brand-50 border border-brand-100 text-sm text-brand-700 flex items-center gap-2">
              <HardDrive size={14} />
              <p>Auto-generating 30 ideas every 2 minutes. Click any idea to view details and generate scripts.</p>
            </div>
          )}
        </div>

        {/* Search & Niche filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-dark-100 p-6 mb-8">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ideas..."
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-dark-50 border border-dark-200 text-dark-800 outline-none focus:border-brand-400 text-sm" />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {niches.map((n) => (
              <button key={n} onClick={() => setSelectedNiche(n)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedNiche === n ? 'bg-brand-500 text-white shadow-sm' : 'bg-dark-50 text-dark-500 hover:bg-dark-100'}`}>
                {n} {nicheCount(n) > 0 && <span className="ml-1 opacity-60">({nicheCount(n)})</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Ideas grid */}
        {generating && ideas.length === 0 ? (
          <div className="text-center py-16"><Loader2 className="animate-spin text-brand-500 mx-auto" size={32} /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dark-100">
            <div className="text-5xl mb-4">💡</div>
            <h3 className="text-xl font-bold text-dark-800 mb-2">No ideas yet</h3>
            <p className="text-dark-500">Click &quot;Start Auto-Generate&quot; to discover 30 trending topics.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((idea) => {
              const dc = difficultyConfig[idea.difficulty] || difficultyConfig.Medium;
              return (
                <div key={idea.id}
                  className="bg-white rounded-2xl shadow-sm border border-dark-100 p-5 hover:shadow-md hover:border-brand-200 transition-all cursor-pointer group"
                  onClick={() => setSelectedIdea(idea)}>
                  {/* Top row: niche + competition + difficulty */}
                  <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-brand-50 text-brand-600 capitalize">{idea.niche}</span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      idea.competition === 'Low' ? 'bg-neon-50 text-neon-600' : idea.competition === 'Medium' ? 'bg-accent-50 text-accent-600' : 'bg-fire-50 text-fire-600'
                    }`}>{idea.competition}</span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${dc.color}`}>{idea.difficulty}</span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-dark-800 mb-2 leading-snug group-hover:text-brand-600 transition-colors line-clamp-2">{idea.title}</h3>

                  {/* Description */}
                  <p className="text-xs text-dark-500 leading-relaxed mb-3 line-clamp-3">{idea.description}</p>

                  {/* Keywords */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {idea.keywords.slice(0, 3).map((kw) => (
                      <span key={kw} className="text-[10px] px-2 py-0.5 rounded-full bg-dark-50 text-dark-400">#{kw}</span>
                    ))}
                    {idea.keywords.length > 3 && <span className="text-[10px] text-dark-400">+{idea.keywords.length - 3}</span>}
                  </div>

                  {/* Stats row */}
                  <div className="flex items-center justify-between text-xs text-dark-400 mb-3">
                    <span className="flex items-center gap-1"><Eye size={12} /> {idea.estimatedViews}</span>
                    <span className="flex items-center gap-1"><TrendingUp size={12} /> {idea.trendScore}</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {idea.videoLength}</span>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleGenerateScript(idea); }}
                      disabled={generatingScript === idea.id}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-brand-50 text-brand-600 text-xs font-semibold hover:bg-brand-100 transition-colors disabled:opacity-50">
                      {generatingScript === idea.id ? <Loader2 size={12} className="animate-spin" /> : <FileText size={12} />}
                      {generatingScript === idea.id ? 'Generating...' : 'Script'}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRecordVideo(idea); }}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-fire-50 text-fire-600 text-xs font-semibold hover:bg-fire-100 transition-colors">
                      <Video size={12} />
                      Record
                    </button>
                    <div className="flex items-center px-2 rounded-xl bg-dark-50 text-dark-400 group-hover:bg-brand-50 group-hover:text-brand-500 transition-colors">
                      <ChevronRight size={14} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedIdea && (
        <IdeaDetailModal
          idea={selectedIdea}
          onClose={() => setSelectedIdea(null)}
          onGenerateScript={(idea) => { setSelectedIdea(null); handleGenerateScript(idea); }}
          onRecordVideo={(idea) => { setSelectedIdea(null); handleRecordVideo(idea); }}
        />
      )}
    </div>
  );
}
