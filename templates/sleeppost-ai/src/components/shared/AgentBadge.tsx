import React from 'react';
import type { AgentType } from '../../types';

interface AgentBadgeProps {
  type: AgentType;
  status: 'running' | 'paused' | 'idle';
  size?: 'sm' | 'md';
}

const typeColors: Record<AgentType, string> = {
  content: 'from-blue-500 to-cyan-500',
  marketing: 'from-purple-500 to-pink-500',
  revenue: 'from-green-500 to-emerald-500',
  scheduler: 'from-orange-500 to-amber-500',
};

const statusColors: Record<string, string> = {
  running: 'bg-green-400',
  paused: 'bg-yellow-400',
  idle: 'bg-gray-400',
};

const AgentBadge: React.FC<AgentBadgeProps> = ({ type, status, size = 'md' }) => {
  const sizeClass = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm';

  return (
    <span className={`inline-flex items-center gap-2 rounded-full ${sizeClass} bg-white/5 border border-white/10`}>
      <span className={`w-2 h-2 rounded-full ${statusColors[status]} ${status === 'running' ? 'animate-pulse' : ''}`} />
      <span className={`bg-gradient-to-r ${typeColors[type]} bg-clip-text text-transparent font-medium capitalize`}>
        {type}
      </span>
    </span>
  );
};

export default AgentBadge;
