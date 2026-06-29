import React from 'react';
import { motion } from 'framer-motion';
import { Bot, MessageSquare, CheckCircle2, Clock, TrendingUp, Zap } from 'lucide-react';
import { useAgentContext } from '../../context/AgentContext';

const StatsCards: React.FC = () => {
  const { stats } = useAgentContext();

  const cards = [
    { icon: <Bot size={20} />, label: 'Total Agents', value: stats.activeAgents.toString(), color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { icon: <MessageSquare size={20} />, label: 'Conversations Today', value: stats.messagesToday.toString(), color: 'text-brand-400', bg: 'bg-brand-500/10' },
    { icon: <TrendingUp size={20} />, label: 'Conversations/Hour', value: stats.conversationsPerHour.toString(), color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { icon: <CheckCircle2 size={20} />, label: 'Avg Resolution', value: `${stats.avgResolutionRate}%`, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { icon: <Clock size={20} />, label: 'Avg Response Time', value: `${stats.avgResponseTime}s`, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { icon: <Zap size={20} />, label: 'Total Conversations', value: stats.totalConversations.toLocaleString(), color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="bg-dark-900 rounded-2xl p-4 border border-white/5"
        >
          <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center ${card.color} mb-3`}>
            {card.icon}
          </div>
          <p className="text-2xl font-bold text-white">{card.value}</p>
          <p className="text-xs text-dark-400 mt-1">{card.label}</p>
        </motion.div>
      ))}
    </div>
  );
};

export default StatsCards;
