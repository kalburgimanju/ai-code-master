'use client';

import { Download, Upload, RotateCcw } from 'lucide-react';

interface VideoPreviewProps {
  recordedUrl: string;
  recordedBlob: Blob;
  onUpload: () => void;
  onRecordAgain: () => void;
  onDownload: () => void;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default function VideoPreview({
  recordedUrl,
  recordedBlob,
  onUpload,
  onRecordAgain,
  onDownload,
}: VideoPreviewProps) {
  return (
    <div className="bg-white rounded-2xl border border-dark-200 overflow-hidden">
      <div className="p-4 border-b border-dark-100">
        <h3 className="text-sm font-semibold text-dark-900">Recording Complete</h3>
        <p className="text-xs text-dark-400 mt-1">
          {formatFileSize(recordedBlob.size)}
        </p>
      </div>

      {/* Video playback */}
      <div className="aspect-video bg-dark-900">
        <video
          src={recordedUrl}
          controls
          className="w-full h-full object-contain"
        />
      </div>

      {/* Action buttons */}
      <div className="p-4 flex flex-wrap items-center gap-3">
        <button
          onClick={onUpload}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-fire-500 text-white text-sm font-semibold hover:shadow-lg hover:shadow-brand-500/25 transition-all"
        >
          <Upload size={18} />
          Upload to YouTube
        </button>
        <button
          onClick={onDownload}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-dark-100 text-dark-700 text-sm font-medium hover:bg-dark-200 transition-colors"
        >
          <Download size={16} />
          Download
        </button>
        <button
          onClick={onRecordAgain}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-dark-100 text-dark-700 text-sm font-medium hover:bg-dark-200 transition-colors"
        >
          <RotateCcw size={16} />
          Record Again
        </button>
      </div>
    </div>
  );
}
