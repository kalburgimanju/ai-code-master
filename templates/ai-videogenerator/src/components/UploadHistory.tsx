'use client';

import { ExternalLink } from 'lucide-react';

interface UploadRecord {
  id: string;
  title: string;
  status: 'uploading' | 'completed' | 'failed';
  youtubeUrl: string;
  privacy: string;
  createdAt: string;
}

interface UploadHistoryProps {
  uploads: UploadRecord[];
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    completed: 'bg-neon-50 text-neon-600',
    uploading: 'bg-sky-50 text-sky-600',
    failed: 'bg-fire-50 text-fire-600',
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-dark-100 text-dark-500'}`}>
      {status === 'uploading' && (
        <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
      )}
      {status}
    </span>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function UploadHistory({ uploads }: UploadHistoryProps) {
  if (uploads.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-dark-200 p-8 text-center">
        <p className="text-sm text-dark-400">No uploads yet. Record a video to get started!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-dark-200 overflow-hidden">
      <div className="p-4 border-b border-dark-100">
        <h3 className="text-sm font-semibold text-dark-900">Upload History</h3>
      </div>

      <div className="divide-y divide-dark-100">
        {uploads.map((upload) => (
          <div key={upload.id} className="px-4 py-3 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-dark-900 truncate">{upload.title}</p>
              <p className="text-xs text-dark-400 mt-0.5">{formatDate(upload.createdAt)}</p>
            </div>
            <StatusBadge status={upload.status} />
            <span className="text-xs text-dark-300 capitalize">{upload.privacy}</span>
            {upload.youtubeUrl && (
              <a
                href={upload.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-dark-400 hover:text-brand-500 transition-colors shrink-0"
              >
                <ExternalLink size={16} />
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
