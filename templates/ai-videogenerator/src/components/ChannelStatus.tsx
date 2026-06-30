'use client';

import { useState, useEffect } from 'react';
import { Youtube, Link as LinkIcon, Unlink, Users } from 'lucide-react';

interface Channel {
  id: string;
  name: string;
  youtubeChannelId: string;
  thumbnailUrl: string;
  subscriberCount: string;
}

export default function ChannelStatus() {
  const [channel, setChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);

  useEffect(() => {
    fetchChannel();
  }, []);

  async function fetchChannel() {
    try {
      const res = await fetch('/api/youtube/channel');
      const data = await res.json();
      setChannel(data.channel);
    } catch {
      console.error('Failed to fetch channel');
    } finally {
      setLoading(false);
    }
  }

  async function handleDisconnect() {
    if (!window.confirm('Are you sure you want to disconnect your YouTube channel?')) {
      return;
    }
    setDisconnecting(true);
    try {
      await fetch('/api/youtube/disconnect', { method: 'POST' });
      setChannel(null);
    } catch {
      console.error('Failed to disconnect');
    } finally {
      setDisconnecting(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-dark-200 p-6">
        <div className="animate-pulse flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-dark-100" />
          <div className="flex-1">
            <div className="h-4 bg-dark-100 rounded w-1/3 mb-2" />
            <div className="h-3 bg-dark-100 rounded w-1/4" />
          </div>
        </div>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="bg-white rounded-2xl border border-dark-200 p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-fire-50 flex items-center justify-center shrink-0">
            <Youtube size={24} className="text-fire-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-dark-900">Connect Your YouTube Channel</h3>
            <p className="text-xs text-dark-400 mt-0.5">
              Link your channel to upload videos directly.
            </p>
          </div>
          <a
            href="/api/youtube/auth"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-fire-500 text-white text-sm font-semibold hover:bg-fire-600 transition-colors shrink-0"
          >
            <LinkIcon size={16} />
            Connect
          </a>
        </div>
      </div>
    );
  }

  const subCount = parseInt(channel.subscriberCount) || 0;
  const formattedSubs = subCount >= 1_000_000
    ? `${(subCount / 1_000_000).toFixed(1)}M`
    : subCount >= 1_000
      ? `${(subCount / 1_000).toFixed(1)}K`
      : subCount.toString();

  return (
    <div className="bg-white rounded-2xl border border-dark-200 p-6">
      <div className="flex items-center gap-4">
        {channel.thumbnailUrl ? (
          <img
            src={channel.thumbnailUrl}
            alt={channel.name}
            className="w-12 h-12 rounded-full object-cover border border-dark-100"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-neon-50 flex items-center justify-center shrink-0">
            <Youtube size={24} className="text-neon-500" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-dark-900 truncate">{channel.name}</h3>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-neon-50 text-neon-600 text-xs font-medium shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-neon-500" />
              Connected
            </span>
          </div>
          <div className="flex items-center gap-1 mt-0.5 text-xs text-dark-400">
            <Users size={12} />
            {formattedSubs} subscribers
          </div>
        </div>
        <button
          onClick={handleDisconnect}
          disabled={disconnecting}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-100 text-dark-600 text-xs font-medium hover:bg-dark-200 transition-colors shrink-0 disabled:opacity-50"
        >
          <Unlink size={14} />
          {disconnecting ? 'Disconnecting...' : 'Disconnect'}
        </button>
      </div>
    </div>
  );
}
