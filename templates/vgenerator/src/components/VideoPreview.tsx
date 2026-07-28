import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Download, Maximize, RotateCcw, FileText, Trash2 } from 'lucide-react';
import type { VideoProject } from '../types';

interface VideoPreviewProps {
  project: VideoProject;
  onRegenerate?: () => void;
  onDelete?: () => void;
}

export default function VideoPreview({ project, onRegenerate, onDelete }: VideoPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showScript, setShowScript] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const videoUrl = project.videoFile
    ? `/api/video/${encodeURIComponent(project.taskDir || '')}/${encodeURIComponent(project.videoFile.split('/').pop() || 'final-1.mp4')}`
    : null;

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      setIsPlaying(false);
    }
  }, [videoUrl]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
  };

  const downloadUrl = project.videoFile
    ? `/api/download/${encodeURIComponent(project.taskDir || '')}/${encodeURIComponent(project.videoFile.split('/').pop() || 'final-1.mp4')}`
    : null;

  return (
    <div className="space-y-4">
      {/* Video Player */}
      <div className="relative bg-black rounded-xl overflow-hidden border border-dark-800">
        <div className={`mx-auto ${project.settings.aspectRatio === '9:16' ? 'max-w-[360px]' : 'w-full'}`}>
          {videoUrl ? (
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full bg-black"
              style={{
                aspectRatio: project.settings.aspectRatio === '9:16' ? '9/16' : undefined,
              }}
              onEnded={handleVideoEnd}
              controls
              playsInline
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            <div
              className="flex items-center justify-center bg-dark-900"
              style={{ aspectRatio: project.settings.aspectRatio === '9:16' ? '9/16' : '16/9' }}
            >
              <p className="text-dark-500 text-sm">Video not available</p>
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-white">{project.topic}</h3>
          <p className="text-xs text-dark-400">
            {project.audioDuration ? `${Math.round(project.audioDuration)}s` : ''}
            {' · '}
            {project.settings.voiceName.includes('Neerja') ? 'Indian English Female' : 'TTS'}
            {' · '}
            {project.settings.videoSource}
            {' · '}
            {project.settings.aspectRatio}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onRegenerate && (
            <button
              onClick={onRegenerate}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-dark-300 hover:text-white bg-dark-800 hover:bg-dark-700 rounded-lg transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Regenerate
            </button>
          )}
          {downloadUrl && (
            <a
              href={downloadUrl}
              download
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-finance-600 hover:bg-finance-500 rounded-lg transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </a>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-400 hover:text-red-300 bg-dark-800 hover:bg-dark-700 rounded-lg transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Script Toggle */}
      {project.script && (
        <button
          onClick={() => setShowScript(!showScript)}
          className="flex items-center gap-1.5 text-xs font-medium text-dark-400 hover:text-dark-300 transition-colors"
        >
          <FileText className="w-3.5 h-3.5" />
          {showScript ? 'Hide Script' : 'Show Script'}
        </button>
      )}
      {showScript && project.script && (
        <div className="p-3 bg-dark-900/50 border border-dark-800 rounded-xl">
          <p className="text-xs text-dark-300 whitespace-pre-wrap">{project.script}</p>
        </div>
      )}
    </div>
  );
}
