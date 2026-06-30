'use client';

import { Users, Eye, Video, DollarSign, ToggleLeft, ToggleRight } from 'lucide-react';
import type { Channel } from '@/types';

interface Props {
  channel: Channel;
  onToggleActive?: (id: string, active: boolean) => void;
}

export default function ChannelCard({ channel, onToggleActive }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-dark-100 p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-dark-800">{channel.name}</h3>
          <p className="text-xs text-dark-400 mt-1">{channel.niche} · {channel.youtubeChannelId.slice(0, 12)}...</p>
        </div>
        <button
          onClick={() => onToggleActive?.(channel.id, !channel.isActive)}
          className="flex items-center gap-1"
        >
          {channel.isActive ? (
            <ToggleRight size={28} className="text-neon-500" />
          ) : (
            <ToggleLeft size={28} className="text-dark-300" />
          )}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <Users size={16} className="text-brand-500 mx-auto mb-1" />
          <p className="text-sm font-bold text-dark-800">{(channel.subscriberCount / 1000).toFixed(1)}K</p>
          <p className="text-[10px] text-dark-400">Subscribers</p>
        </div>
        <div className="text-center">
          <Eye size={16} className="text-fire-500 mx-auto mb-1" />
          <p className="text-sm font-bold text-dark-800">{(channel.totalViews / 1000000).toFixed(1)}M</p>
          <p className="text-[10px] text-dark-400">Views</p>
        </div>
        <div className="text-center">
          <Video size={16} className="text-neon-500 mx-auto mb-1" />
          <p className="text-sm font-bold text-dark-800">{channel.videoCount}</p>
          <p className="text-[10px] text-dark-400">Videos</p>
        </div>
      </div>

      <div className="pt-4 border-t border-dark-100 flex items-center justify-between text-xs text-dark-400">
        <span>Upload at {channel.uploadHourUtc}:00 UTC</span>
        <span className={`px-2 py-0.5 rounded-full ${channel.isActive ? 'bg-neon-50 text-neon-600' : 'bg-dark-50 text-dark-400'}`}>
          {channel.isActive ? 'Active' : 'Paused'}
        </span>
      </div>
    </div>
  );
}
