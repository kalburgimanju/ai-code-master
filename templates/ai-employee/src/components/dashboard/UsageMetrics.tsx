import React from 'react';
import { motion } from 'framer-motion';
import { useAgentContext } from '../../context/AgentContext';

const UsageMetrics: React.FC = () => {
  const { stats } = useAgentContext();

  const maxValue = Math.max(...stats.messagesTrend, 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-900 rounded-2xl p-6 border border-white/5"
    >
      <h3 className="text-lg font-bold text-white mb-6">Usage Metrics</h3>

      {/* Simple bar chart */}
      <div className="flex items-end gap-2 h-48 mb-4">
        {stats.messagesTrend.map((value, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(value / maxValue) * 100}%` }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className="w-full bg-brand-500/30 rounded-t-lg hover:bg-brand-500/50 transition-colors cursor-pointer group relative"
            >
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-dark-700 px-2 py-1 rounded text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {value} msgs
              </div>
            </motion.div>
            <span className="text-[10px] text-dark-500">{i + 1}</span>
          </div>
        ))}
      </div>

      <p className="text-xs text-dark-500 text-center">Messages per hour (last 12 hours)</p>
    </motion.div>
  );
};

export default UsageMetrics;
