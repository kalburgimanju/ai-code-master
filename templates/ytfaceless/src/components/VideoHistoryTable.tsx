'use client';

import { ExternalLink, CheckCircle2, XCircle, Loader2, Clock } from 'lucide-react';
import type { Video } from '@/types';

interface Props {
  videos: Video[];
}

const statusConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  uploaded: { icon: <CheckCircle2 size={14} />, color: 'bg-neon-50 text-neon-600', label: 'Uploaded' },
  failed: { icon: <XCircle size={14} />, color: 'bg-fire-50 text-fire-600', label: 'Failed' },
  combined: { icon: <Loader2 size={14} className="animate-spin" />, color: 'bg-brand-50 text-brand-600', label: 'Combining' },
  video_generated: { icon: <Loader2 size={14} className="animate-spin" />, color: 'bg-brand-50 text-brand-600', label: 'Generating Video' },
  voiceover_generated: { icon: <Loader2 size={14} className="animate-spin" />, color: 'bg-brand-50 text-brand-600', label: 'Generating Voice' },
  script_generated: { icon: <Loader2 size={14} className="animate-spin" />, color: 'bg-brand-50 text-brand-600', label: 'Script Ready' },
  trending_fetched: { icon: <Clock size={14} />, color: 'bg-dark-50 text-dark-500', label: 'Pending' },
  idea_selected: { icon: <Clock size={14} />, color: 'bg-dark-50 text-dark-500', label: 'Idea Selected' },
  thumbnail_generated: { icon: <Loader2 size={14} className="animate-spin" />, color: 'bg-brand-50 text-brand-600', label: 'Thumbnail Ready' },
};

export default function VideoHistoryTable({ videos }: Props) {
  if (videos.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-3">🎬</div>
        <p className="text-dark-500 text-sm">No videos yet. Connect a channel and start the pipeline!</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-dark-100">
            <th className="text-left px-4 py-3 text-xs font-bold text-dark-400 uppercase tracking-wide">Title</th>
            <th className="text-left px-4 py-3 text-xs font-bold text-dark-400 uppercase tracking-wide">Status</th>
            <th className="text-left px-4 py-3 text-xs font-bold text-dark-400 uppercase tracking-wide">Cost</th>
            <th className="text-left px-4 py-3 text-xs font-bold text-dark-400 uppercase tracking-wide">Date</th>
            <th className="text-left px-4 py-3 text-xs font-bold text-dark-400 uppercase tracking-wide">Link</th>
          </tr>
        </thead>
        <tbody>
          {videos.map((v) => {
            const cfg = statusConfig[v.status] || statusConfig.trending_fetched;
            return (
              <tr key={v.id} className="border-b border-dark-50 hover:bg-dark-50/50 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-dark-800 max-w-[300px] truncate">{v.title || 'Untitled'}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${cfg.color}`}>
                    {cfg.icon}
                    {cfg.label}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-dark-600">${(v.estimatedCostCents / 100).toFixed(2)}</td>
                <td className="px-4 py-3 text-xs text-dark-400">{new Date(v.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  {v.youtubeUrl ? (
                    <a href={v.youtubeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700">
                      <ExternalLink size={12} /> Watch
                    </a>
                  ) : (
                    <span className="text-xs text-dark-300">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
