'use client';

import { useState, useEffect } from 'react';
import { Activity, Loader2, DollarSign, CheckCircle2, XCircle, Clock } from 'lucide-react';
import PipelineStatus from '@/components/PipelineStatus';
import VideoHistoryTable from '@/components/VideoHistoryTable';
import type { Video } from '@/types';

export default function PipelinePage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCost, setTotalCost] = useState(0);

  const fetchData = async () => {
    try {
      const [videosRes, costRes] = await Promise.all([
        fetch('/api/pipeline/status'),
        fetch('/api/pipeline/status'),
      ]);
      const videosData = await videosRes.json();
      const costData = await costRes.json();
      setVideos(videosData.videos || []);
      setTotalCost(costData.totalCost || 0);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const running = videos.filter((v) => !['uploaded', 'failed'].includes(v.status));
  const completed = videos.filter((v) => v.status === 'uploaded');
  const failed = videos.filter((v) => v.status === 'failed');

  return (
    <div className="min-h-screen bg-dark-50">
      <div className="bg-gradient-to-br from-neon-500 to-sky-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-white text-sm font-medium mb-6">
            <Activity size={16} />
            Pipeline Monitor
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Pipeline Status</h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Real-time view of your content pipeline. Watch videos go from idea to YouTube.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-dark-100 p-5 text-center">
            <Loader2 size={20} className="text-brand-500 mx-auto mb-2" />
            <p className="text-2xl font-extrabold text-dark-800">{running.length}</p>
            <p className="text-xs text-dark-400">Running</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-dark-100 p-5 text-center">
            <CheckCircle2 size={20} className="text-neon-500 mx-auto mb-2" />
            <p className="text-2xl font-extrabold text-dark-800">{completed.length}</p>
            <p className="text-xs text-dark-400">Uploaded</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-dark-100 p-5 text-center">
            <XCircle size={20} className="text-fire-500 mx-auto mb-2" />
            <p className="text-2xl font-extrabold text-dark-800">{failed.length}</p>
            <p className="text-xs text-dark-400">Failed</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-dark-100 p-5 text-center">
            <DollarSign size={20} className="text-accent-500 mx-auto mb-2" />
            <p className="text-2xl font-extrabold text-dark-800">${(totalCost / 100).toFixed(2)}</p>
            <p className="text-xs text-dark-400">Total Cost</p>
          </div>
        </div>

        {/* Running pipelines */}
        {running.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-dark-800 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
              Currently Running
            </h2>
            <div className="space-y-3">
              {running.map((v) => (
                <div key={v.id} className="bg-white rounded-2xl shadow-sm border border-dark-100 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-dark-800">{v.title || 'Processing...'}</h3>
                    <span className="text-xs text-dark-400">{new Date(v.startedAt).toLocaleTimeString()}</span>
                  </div>
                  <PipelineStatus videoId={v.id} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All videos */}
        <div className="bg-white rounded-2xl shadow-sm border border-dark-100 p-6">
          <h2 className="text-lg font-bold text-dark-800 mb-4">Upload History</h2>
          {loading ? (
            <div className="text-center py-12"><Loader2 className="animate-spin text-brand-500 mx-auto" size={24} /></div>
          ) : (
            <VideoHistoryTable videos={videos} />
          )}
        </div>
      </div>
    </div>
  );
}
