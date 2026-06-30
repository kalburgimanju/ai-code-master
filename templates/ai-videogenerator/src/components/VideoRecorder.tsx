'use client';

import { useRef, useEffect } from 'react';
import { Video, Circle, Pause, Play, Square } from 'lucide-react';
import type { RecordingState } from '@/types';

interface VideoRecorderProps {
  stream: MediaStream | null;
  state: RecordingState;
  duration: number;
  error: string | null;
  onStartCamera: () => Promise<void>;
  onStartRecording: () => void;
  onPauseRecording: () => void;
  onResumeRecording: () => void;
  onStopRecording: () => void;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default function VideoRecorder({
  stream,
  state,
  duration,
  error,
  onStartCamera,
  onStartRecording,
  onPauseRecording,
  onResumeRecording,
  onStopRecording,
}: VideoRecorderProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-dark-200 p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-fire-50 flex items-center justify-center mx-auto mb-4">
          <Video size={28} className="text-fire-500" />
        </div>
        <h3 className="text-lg font-semibold text-dark-900 mb-2">Camera Access Error</h3>
        <p className="text-dark-500 text-sm mb-4">{error}</p>
        <button
          onClick={onStartCamera}
          className="px-5 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!stream) {
    return (
      <div className="bg-white rounded-2xl border border-dark-200 p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-4">
          <Video size={28} className="text-brand-500" />
        </div>
        <h3 className="text-lg font-semibold text-dark-900 mb-2">Start Recording</h3>
        <p className="text-dark-500 text-sm mb-6">
          Click below to enable your camera and start recording a video.
        </p>
        <button
          onClick={onStartCamera}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-fire-500 text-white text-sm font-semibold hover:shadow-lg hover:shadow-brand-500/25 transition-all"
        >
          Enable Camera
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-dark-200 overflow-hidden">
      {/* Video preview */}
      <div className="relative aspect-video bg-dark-900">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
        />
        {/* Recording indicator */}
        {state === 'recording' && (
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1.5 rounded-full text-sm font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
            REC {formatDuration(duration)}
          </div>
        )}
        {state === 'paused' && (
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-yellow-500 text-white px-3 py-1.5 rounded-full text-sm font-medium">
            PAUSED
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-4 flex items-center justify-center gap-4">
        {state === 'idle' && (
          <button
            onClick={onStartRecording}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-fire-500 text-white text-sm font-semibold hover:bg-fire-600 transition-colors"
          >
            <Circle size={18} className="fill-white" />
            Start Recording
          </button>
        )}
        {state === 'recording' && (
          <>
            <button
              onClick={onPauseRecording}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-dark-100 text-dark-700 text-sm font-medium hover:bg-dark-200 transition-colors"
            >
              <Pause size={18} />
              Pause
            </button>
            <button
              onClick={onStopRecording}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-fire-500 text-white text-sm font-semibold hover:bg-fire-600 transition-colors"
            >
              <Square size={16} className="fill-white" />
              Stop
            </button>
          </>
        )}
        {state === 'paused' && (
          <>
            <button
              onClick={onResumeRecording}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neon-500 text-white text-sm font-semibold hover:bg-neon-600 transition-colors"
            >
              <Play size={18} className="fill-white" />
              Resume
            </button>
            <button
              onClick={onStopRecording}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-fire-500 text-white text-sm font-semibold hover:bg-fire-600 transition-colors"
            >
              <Square size={16} className="fill-white" />
              Stop
            </button>
          </>
        )}
      </div>
    </div>
  );
}
