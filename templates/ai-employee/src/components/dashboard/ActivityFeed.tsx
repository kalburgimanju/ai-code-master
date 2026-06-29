import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, CheckCircle2, XCircle } from 'lucide-react';
import { useAgentContext } from '../../context/AgentContext';

const ActivityFeed: React.FC = () => {
  const { activityFeed } = useAgentContext();
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = 0;
    }
  }, [activityFeed.length]);

  const formatTime = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 5) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-900 rounded-2xl p-6 border border-white/5 h-[500px] flex flex-col"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Live Activity</h3>
        <span className="flex items-center gap-1.5 text-xs text-brand-400">
          <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
          Real-time
        </span>
      </div>

      <div ref={feedRef} className="flex-1 overflow-y-auto space-y-3 pr-2">
        {activityFeed.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-dark-500">
            <MessageSquare size={32} className="mb-2" />
            <p className="text-sm">Waiting for conversations...</p>
            <p className="text-xs mt-1">Activity will appear here as agents work</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {activityFeed.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-dark-800 rounded-xl p-3 border border-white/5"
              >
                <div className="flex items-start justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white">{event.user}</span>
                    <span className="text-[10px] text-brand-400 bg-brand-500/10 px-1.5 py-0.5 rounded">
                      {event.agentName}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {event.resolved ? (
                      <CheckCircle2 size={12} className="text-brand-400" />
                    ) : (
                      <XCircle size={12} className="text-amber-400" />
                    )}
                    <span className="text-[10px] text-dark-500">{formatTime(event.timestamp)}</span>
                  </div>
                </div>
                <p className="text-xs text-dark-300 mb-1">👤 {event.message}</p>
                <p className="text-xs text-dark-400">🤖 {event.response.slice(0, 80)}...</p>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
};

export default ActivityFeed;
