import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Settings, MessageSquare, CheckCircle2, Clock } from 'lucide-react';
import { useAgentContext } from '../../context/AgentContext';
import CreateAgentInline from './CreateAgentInline';
import AgentDetail from './AgentDetail';

const AgentList: React.FC = () => {
  const { agents, removeAgent } = useAgentContext();
  const [showCreate, setShowCreate] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  const selected = agents.find((a) => a.id === selectedAgent);

  if (selected) {
    return (
      <AgentDetail
        agent={selected}
        onBack={() => setSelectedAgent(null)}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Your AI Employees</h3>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 text-dark-900 font-semibold text-sm hover:bg-brand-400 transition-colors"
        >
          <Plus size={16} />
          Add New Agent
        </button>
      </div>

      {showCreate && (
        <CreateAgentInline onClose={() => setShowCreate(false)} />
      )}

      {agents.length === 0 && !showCreate ? (
        <div className="bg-dark-900 rounded-2xl p-12 border border-white/5 text-center">
          <div className="text-4xl mb-4">🤖</div>
          <h4 className="text-lg font-bold text-white mb-2">No agents yet</h4>
          <p className="text-dark-400 text-sm mb-6">Create your first AI employee to get started.</p>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-500 text-dark-900 font-semibold hover:bg-brand-400 transition-colors mx-auto"
          >
            <Plus size={18} />
            Create AI Employee
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <motion.div
              key={agent.id}
              layout
              className="bg-dark-900 rounded-2xl p-5 border border-white/5 hover:border-brand-500/30 transition-all cursor-pointer group"
              onClick={() => setSelectedAgent(agent.id)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-emerald-300 flex items-center justify-center text-dark-900 font-bold text-sm">
                    {agent.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{agent.name}</p>
                    <p className="text-xs text-dark-400">{agent.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${agent.status === 'active' ? 'bg-brand-400 animate-pulse' : agent.status === 'training' ? 'bg-amber-400 animate-pulse' : 'bg-dark-500'}`} />
                  <span className="text-[10px] text-dark-400 capitalize">{agent.status}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center">
                  <MessageSquare size={14} className="text-blue-400 mx-auto mb-1" />
                  <p className="text-sm font-bold text-white">{agent.conversations.toLocaleString()}</p>
                  <p className="text-[10px] text-dark-500">Conversations</p>
                </div>
                <div className="text-center">
                  <CheckCircle2 size={14} className="text-brand-400 mx-auto mb-1" />
                  <p className="text-sm font-bold text-white">{agent.resolutionRate}%</p>
                  <p className="text-[10px] text-dark-500">Resolution</p>
                </div>
                <div className="text-center">
                  <Clock size={14} className="text-purple-400 mx-auto mb-1" />
                  <p className="text-sm font-bold text-white">{agent.avgResponseTime}s</p>
                  <p className="text-[10px] text-dark-500">Avg Time</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); setSelectedAgent(agent.id); }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 text-dark-300 text-xs font-medium hover:bg-white/10 transition-colors"
                >
                  <Settings size={12} />
                  Manage
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); removeAgent(agent.id); }}
                  className="p-2 rounded-xl bg-white/5 text-dark-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default AgentList;
