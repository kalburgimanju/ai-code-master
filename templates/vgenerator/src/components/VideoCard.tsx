import { Clock, Play, CheckCircle, XCircle, Loader2, FileVideo } from 'lucide-react';
import type { VideoProject } from '../types';

interface VideoCardProps {
  project: VideoProject;
  onClick: () => void;
}

export default function VideoCard({ project, onClick }: VideoCardProps) {
  const statusConfig = {
    pending: { icon: Clock, color: 'text-dark-400', bg: 'bg-dark-800' },
    generating: { icon: Loader2, color: 'text-finance-400', bg: 'bg-finance-600/10' },
    completed: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-600/10' },
    failed: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-900/20' },
  };

  const config = statusConfig[project.status];

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 bg-dark-900 border border-dark-800 hover:border-dark-700 rounded-xl transition-all group"
    >
      <div className="flex items-start gap-3">
        {/* Thumbnail placeholder */}
        <div className={`w-16 h-24 rounded-lg ${config.bg} flex items-center justify-center shrink-0 border border-dark-700`}>
          {project.status === 'completed' ? (
            <FileVideo className={`w-6 h-6 ${config.color}`} />
          ) : (
            <config.icon className={`w-6 h-6 ${config.color} ${project.status === 'generating' ? 'animate-spin' : ''}`} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white truncate group-hover:text-finance-400 transition-colors">
            {project.topic}
          </h3>
          <p className="text-xs text-dark-400 mt-1">
            {project.audioDuration ? `${Math.round(project.audioDuration)}s` : ''}
            {project.settings.voiceName.includes('Neerja') ? ' · Indian English' : ''}
            {' · '}
            {project.settings.aspectRatio}
          </p>

          {/* Status Badge */}
          <div className="flex items-center gap-1.5 mt-2">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${config.bg} ${config.color}`}>
              <config.icon className={`w-3 h-3 ${project.status === 'generating' ? 'animate-spin' : ''}`} />
              {project.status === 'pending' ? 'Queued' : project.status === 'generating' ? project.stage || 'Generating' : project.status === 'completed' ? 'Ready' : 'Failed'}
            </span>
            <span className="text-[10px] text-dark-500">
              {new Date(project.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Arrow */}
        <div className="text-dark-600 group-hover:text-dark-400 transition-colors">
          <Play className="w-4 h-4" />
        </div>
      </div>
    </button>
  );
}
