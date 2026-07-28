import type { VideoProject } from '../types';

interface GenerationProgressProps {
  project: VideoProject;
}

const STAGE_LABELS: Record<string, string> = {
  script: '✍️ Generating script...',
  terms: '🔍 Analyzing content...',
  audio: '🎙️ Creating voiceover...',
  subtitle: '💬 Adding subtitles...',
  materials: '🎬 Downloading footage...',
  video: '🎞️ Rendering video...',
};

const STAGE_ORDER = ['script', 'terms', 'audio', 'subtitle', 'materials', 'video'];

function getStageIndex(stage: string): number {
  return STAGE_ORDER.indexOf(stage);
}

export default function GenerationProgress({ project }: GenerationProgressProps) {
  const currentStageIdx = getStageIndex(project.stage);

  return (
    <div className="w-full">
      {/* Progress Bar */}
      <div className="w-full h-2 bg-dark-800 rounded-full overflow-hidden mb-6">
        <div
          className="h-full bg-gradient-to-r from-finance-500 to-prop-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${project.progress}%` }}
        />
      </div>

      {/* Stages */}
      <div className="space-y-3">
        {STAGE_ORDER.map((stage, idx) => {
          const isComplete = currentStageIdx > idx;
          const isCurrent = currentStageIdx === idx;
          const isPending = currentStageIdx < idx;

          return (
            <div
              key={stage}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                isCurrent
                  ? 'bg-finance-600/10 border border-finance-500/20'
                  : isComplete
                  ? 'bg-emerald-600/5 border border-emerald-500/10'
                  : 'bg-dark-900/50 border border-dark-800'
              }`}
            >
              {/* Status Icon */}
              <div className="relative w-6 h-6 flex items-center justify-center shrink-0">
                {isComplete ? (
                  <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : isCurrent ? (
                  <div className="w-5 h-5 rounded-full border-2 border-finance-500 border-t-transparent animate-spin" />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-dark-800 border border-dark-700" />
                )}
              </div>

              {/* Label */}
              <span
                className={`text-sm ${
                  isComplete
                    ? 'text-emerald-400'
                    : isCurrent
                    ? 'text-white font-medium'
                    : 'text-dark-500'
                }`}
              >
                {STAGE_LABELS[stage] || stage}
              </span>
            </div>
          );
        })}
      </div>

      {/* Error State */}
      {project.status === 'failed' && project.error && (
        <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-xl">
          <p className="text-xs text-red-400">{project.error}</p>
        </div>
      )}
    </div>
  );
}
