import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Megaphone, DollarSign, Clock } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import AgentBadge from '../shared/AgentBadge';
import type { AgentType } from '../../types';

const iconMap: Record<AgentType, React.ElementType> = {
  content: Sparkles,
  marketing: Megaphone,
  revenue: DollarSign,
  scheduler: Clock,
};

const AgentStatus: React.FC = () => {
  const { agents, activity } = useApp();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-white">Agent Status</h3>

      <div className="grid grid-cols-2 gap-3">
        {agents.map((agent, i) => {
          const Icon = iconMap[agent.type];
          return (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-xl p-4 glow-card"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                  <Icon size={16} className="text-brand-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{agent.name}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <AgentBadge type={agent.type} status={agent.status} size="sm" />
                <span className="text-gray-500 text-xs">{agent.tasksCompleted} tasks</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="glass rounded-xl p-4">
        <h4 className="text-white text-sm font-medium mb-3">Recent Activity</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {activity.slice(0, 8).map((event) => (
            <div key={event.id} className="flex items-start gap-3 text-xs">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-1.5 shrink-0" />
              <div>
                <p className="text-gray-300">
                  <span className="text-white font-medium">{event.agentName}</span> {event.action}
                </p>
                <p className="text-gray-500">{event.details}</p>
              </div>
            </div>
          ))}
          {activity.length === 0 && (
            <p className="text-gray-500 text-xs">Agents are starting up...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentStatus;
