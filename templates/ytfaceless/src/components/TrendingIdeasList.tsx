'use client';

import { TrendingUp, Eye, Zap, RefreshCw } from 'lucide-react';
import type { Idea } from '@/types';

interface Props {
  ideas: Idea[];
  onRefresh?: () => void;
  loading?: boolean;
}

const competitionColor: Record<string, string> = {
  Low: 'bg-neon-50 text-neon-600',
  Medium: 'bg-accent-50 text-accent-600',
  High: 'bg-fire-50 text-fire-600',
};

export default function TrendingIdeasList({ ideas, onRefresh, loading }: Props) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-dark-800">Trending Ideas</h3>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-50 text-brand-600 text-xs font-medium hover:bg-brand-100 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Discover
          </button>
        )}
      </div>

      {ideas.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-dark-100">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-dark-500 text-sm">No trending ideas yet. Click Discover to find topics!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {ideas.slice(0, 10).map((idea) => (
            <div key={idea.id} className="bg-white rounded-xl border border-dark-100 p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-fire-500 flex items-center justify-center text-white shrink-0">
                  <TrendingUp size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-dark-800 truncate">{idea.title}</h4>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-brand-50 text-brand-600">{idea.niche}</span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${competitionColor[idea.competition]}`}>{idea.competition}</span>
                    <span className="text-[10px] text-dark-400 flex items-center gap-0.5">
                      <Eye size={10} /> {idea.estimatedViews}
                    </span>
                    <span className="text-[10px] text-dark-400 flex items-center gap-0.5">
                      <Zap size={10} /> {Math.round(idea.trendScore)}
                    </span>
                  </div>
                  {idea.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {idea.keywords.slice(0, 3).map((kw) => (
                        <span key={kw} className="text-[10px] px-1.5 py-0.5 rounded bg-dark-50 text-dark-400">#{kw}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
