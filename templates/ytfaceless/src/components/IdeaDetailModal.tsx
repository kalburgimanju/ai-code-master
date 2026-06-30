'use client';

import { X, FileText, Video, Eye, TrendingUp, Clock, Target, Zap } from 'lucide-react';
import type { StoredIdea } from '@/lib/idea-store';

interface Props {
  idea: StoredIdea;
  onClose: () => void;
  onGenerateScript: (idea: StoredIdea) => void;
  onRecordVideo: (idea: StoredIdea) => void;
}

const difficultyConfig = {
  Easy: { color: 'bg-neon-50 text-neon-600', label: 'Easy Production' },
  Medium: { color: 'bg-accent-50 text-accent-600', label: 'Medium Production' },
  Hard: { color: 'bg-fire-50 text-fire-600', label: 'Hard Production' },
};

const competitionConfig = {
  Low: { color: 'bg-neon-50 text-neon-600', label: 'Low Competition' },
  Medium: { color: 'bg-accent-50 text-accent-600', label: 'Medium Competition' },
  High: { color: 'bg-fire-50 text-fire-600', label: 'High Competition' },
};

export default function IdeaDetailModal({ idea, onClose, onGenerateScript, onRecordVideo }: Props) {
  const diff = difficultyConfig[idea.difficulty] || difficultyConfig.Medium;
  const comp = competitionConfig[idea.competition] || competitionConfig.Medium;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-dark-100 p-6 flex items-start justify-between">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-brand-50 text-brand-600 capitalize">{idea.niche}</span>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${comp.color}`}>{comp.label}</span>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${diff.color}`}>{diff.label}</span>
            </div>
            <h2 className="text-xl font-extrabold text-dark-900 leading-tight">{idea.title}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-dark-50 transition-colors shrink-0">
            <X size={20} className="text-dark-400" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-sm font-bold text-dark-500 uppercase tracking-wide mb-2">Description</h3>
            <p className="text-dark-700 leading-relaxed">{idea.description}</p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-dark-50 border border-dark-100 text-center">
              <Eye size={18} className="text-brand-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-dark-800">{idea.estimatedViews}</p>
              <p className="text-[10px] text-dark-400">Est. Views</p>
            </div>
            <div className="p-4 rounded-xl bg-dark-50 border border-dark-100 text-center">
              <TrendingUp size={18} className="text-fire-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-dark-800">{idea.trendScore}</p>
              <p className="text-[10px] text-dark-400">Trend Score</p>
            </div>
            <div className="p-4 rounded-xl bg-dark-50 border border-dark-100 text-center">
              <Clock size={18} className="text-neon-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-dark-800">{idea.videoLength}</p>
              <p className="text-[10px] text-dark-400">Video Length</p>
            </div>
            <div className="p-4 rounded-xl bg-dark-50 border border-dark-100 text-center">
              <Target size={18} className="text-accent-500 mx-auto mb-1" />
              <p className="text-sm font-bold text-dark-800">{idea.targetAudience}</p>
              <p className="text-[10px] text-dark-400">Target Audience</p>
            </div>
          </div>

          {/* Keywords */}
          <div>
            <h3 className="text-sm font-bold text-dark-500 uppercase tracking-wide mb-2">Keywords & Tags</h3>
            <div className="flex flex-wrap gap-2">
              {idea.keywords.map((kw) => (
                <span key={kw} className="text-xs px-3 py-1.5 rounded-full bg-dark-50 text-dark-600 border border-dark-100 font-medium">#{kw}</span>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-dark-100">
            <button
              onClick={() => onGenerateScript(idea)}
              className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold hover:shadow-lg hover:shadow-brand-500/25 transition-all"
            >
              <FileText size={20} />
              Generate Script
            </button>
            <button
              onClick={() => onRecordVideo(idea)}
              className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-fire-500 to-accent-500 text-white font-semibold hover:shadow-lg hover:shadow-fire-500/25 transition-all"
            >
              <Video size={20} />
              Record Video
            </button>
          </div>

          {/* Quick info */}
          <div className="p-4 rounded-xl bg-brand-50 border border-brand-100 text-sm text-brand-700">
            <p><strong>Generate Script:</strong> AI will create a full YouTube script with hook, sections, and CTA for this topic.</p>
            <p className="mt-1"><strong>Record Video:</strong> Start the video generation pipeline — script, voiceover, visuals, and thumbnail.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
