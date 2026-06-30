'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useMediaRecorder } from '@/hooks/useMediaRecorder';
import VideoRecorder from '@/components/VideoRecorder';
import VideoPreview from '@/components/VideoPreview';
import UploadForm from '@/components/UploadForm';
import ChannelStatus from '@/components/ChannelStatus';
import UploadHistory from '@/components/UploadHistory';

interface UploadRecord {
  id: string;
  title: string;
  status: 'uploading' | 'completed' | 'failed';
  youtubeUrl: string;
  privacy: string;
  createdAt: string;
}

interface Channel {
  id: string;
  name: string;
  youtubeChannelId: string;
  thumbnailUrl: string;
  subscriberCount: string;
}

type AppView = 'record' | 'preview' | 'upload';

function DashboardContent() {
  const [channel, setChannel] = useState<Channel | null>(null);
  const [uploads, setUploads] = useState<UploadRecord[]>([]);
  const [view, setView] = useState<AppView>('record');

  const {
    stream,
    recordedBlob,
    recordedUrl,
    state,
    duration,
    error,
    startCamera,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    downloadVideo,
    reset,
  } = useMediaRecorder();

  const fetchChannel = useCallback(async () => {
    try {
      const res = await fetch('/api/youtube/channel');
      const data = await res.json();
      setChannel(data.channel);
    } catch {
      console.error('Failed to fetch channel');
    }
  }, []);

  useEffect(() => {
    fetchChannel();
  }, [fetchChannel]);

  // Check OAuth redirect params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connected = params.get('connected');
    const errorParam = params.get('error');

    if (connected === 'true') {
      fetchChannel();
      window.history.replaceState({}, '', '/');
    }
    if (errorParam) {
      alert(`YouTube connection failed: ${decodeURIComponent(errorParam)}`);
      window.history.replaceState({}, '', '/');
    }
  }, [fetchChannel]);

  // When recording stops, auto-switch to preview
  useEffect(() => {
    if (state === 'stopped' && recordedBlob) {
      setView('preview');
    }
  }, [state, recordedBlob]);

  function handleRecordAgain() {
    reset();
    setView('record');
  }

  function handleShowUpload() {
    setView('upload');
  }

  function handleUploadSuccess() {
    setView('preview');
  }

  const isRecording = state === 'recording' || state === 'paused';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-dark-900">AI Video Generator</h1>
        <p className="text-sm text-dark-400 mt-1">
          Record a video and upload it to YouTube in one click.
        </p>
      </div>

      {/* Channel Status */}
      <ChannelStatus />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Camera / Recording / Preview */}
        <div>
          {(view === 'record' || isRecording) && (
            <VideoRecorder
              stream={stream}
              state={state}
              duration={duration}
              error={error}
              onStartCamera={startCamera}
              onStartRecording={startRecording}
              onPauseRecording={pauseRecording}
              onResumeRecording={resumeRecording}
              onStopRecording={stopRecording}
            />
          )}

          {(view === 'preview' || view === 'upload') && recordedBlob && recordedUrl && (
            <VideoPreview
              recordedUrl={recordedUrl}
              recordedBlob={recordedBlob}
              onUpload={handleShowUpload}
              onRecordAgain={handleRecordAgain}
              onDownload={downloadVideo}
            />
          )}
        </div>

        {/* Right: Upload Form or placeholder */}
        <div>
          {view === 'upload' && recordedBlob && channel ? (
            <UploadForm
              videoBlob={recordedBlob}
              channelId={channel.id}
              onSuccess={handleUploadSuccess}
            />
          ) : view === 'upload' && recordedBlob && !channel ? (
            <div className="bg-white rounded-2xl border border-dark-200 p-8 text-center">
              <p className="text-sm text-dark-500">
                Please connect your YouTube channel first before uploading.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dark-200 p-8 text-center">
              <p className="text-sm text-dark-400">
                {state === 'stopped'
                  ? 'Click &ldquo;Upload to YouTube&rdquo; to proceed.'
                  : 'Record a video to see upload options here.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Upload History */}
      <UploadHistory uploads={uploads} />
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-dark-100 rounded w-1/3" />
        <div className="h-4 bg-dark-100 rounded w-1/2" />
        <div className="h-64 bg-dark-100 rounded-2xl" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <DashboardContent />
    </Suspense>
  );
}
