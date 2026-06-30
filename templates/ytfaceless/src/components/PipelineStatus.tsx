'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Circle, Loader2, XCircle } from 'lucide-react';
import type { PipelineStage } from '@/types';

const STAGE_LABELS: Record<PipelineStage, string> = {
  trending_fetched: 'Trends',
  idea_selected: 'Idea',
  script_generated: 'Script',
  voiceover_generated: 'Voice',
  video_generated: 'Video',
  thumbnail_generated: 'Thumb',
  combined: 'Combine',
  uploaded: 'Upload',
  failed: 'Failed',
};

interface Props {
  videoId: string;
  onComplete?: () => void;
}

export default function PipelineStatus({ videoId, onComplete }: Props) {
  const [stages, setStages] = useState<{ stage: PipelineStage; status: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch(`/api/pipeline/status?videoId=${videoId}`);
        const data = await res.json();
        if (data.progress) {
          setStages(data.progress);
          const allDone = data.progress.every((s: { status: string }) => s.status === 'completed');
          if (allDone) onComplete?.();
        }
      } catch { /* ignore */ }
      setLoading(false);
    };
    poll();
    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, [videoId, onComplete]);

  if (loading) return <Loader2 className="animate-spin text-brand-500" size={20} />;

  const activeStages = stages.filter((s) => s.stage !== 'failed');

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {activeStages.map((s, i) => (
        <div key={s.stage} className="flex items-center gap-1">
          {i > 0 && <span className="text-dark-300 text-xs">→</span>}
          <span className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
            s.status === 'completed' ? 'bg-neon-50 text-neon-600' :
            s.status === 'in_progress' ? 'bg-brand-50 text-brand-600' :
            s.status === 'failed' ? 'bg-fire-50 text-fire-600' :
            'bg-dark-50 text-dark-400'
          }`}>
            {s.status === 'completed' ? <CheckCircle2 size={12} /> :
             s.status === 'in_progress' ? <Loader2 size={12} className="animate-spin" /> :
             s.status === 'failed' ? <XCircle size={12} /> :
             <Circle size={12} />}
            {STAGE_LABELS[s.stage]}
          </span>
        </div>
      ))}
    </div>
  );
}
