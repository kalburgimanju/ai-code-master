import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Copy, Check, MessageSquare, CheckCircle2, Clock, Settings, Code2 } from 'lucide-react';
import { useAgentContext } from '../../context/AgentContext';
import type { AIEmployee } from '../../types';

interface Props {
  agent: AIEmployee;
  onBack: () => void;
}

const AgentDetail: React.FC<Props> = ({ agent, onBack }) => {
  const { activityFeed, updateAgent } = useAgentContext();
  const [copied, setCopied] = useState(false);
  const [model, setModel] = useState('GPT-4o');
  const [temperature, setTemperature] = useState(70);
  const agentActivity = activityFeed.filter((e) => e.agentId === agent.id);

  const embedCode = `<script src="https://cdn.myaiemployee.com/widget.js"></script>
<div id="myaiemployee-widget"
  data-agent-id="${agent.id}"
  data-theme="dark">
</div>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleStatus = () => {
    updateAgent(agent.id, {
      status: agent.status === 'active' ? 'inactive' : 'active',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-white/5 text-dark-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-400 to-emerald-300 flex items-center justify-center text-dark-900 font-bold text-lg">
            {agent.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{agent.name}</h2>
            <p className="text-sm text-dark-400">{agent.role} · {agent.department}</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <button
            onClick={toggleStatus}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              agent.status === 'active'
                ? 'bg-brand-500/20 text-brand-400 hover:bg-brand-500/30'
                : 'bg-dark-700 text-dark-400 hover:bg-dark-600'
            }`}
          >
            {agent.status === 'active' ? '● Active' : '○ Inactive'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: <MessageSquare size={18} />, label: 'Conversations', value: agent.conversations.toLocaleString(), color: 'text-blue-400' },
          { icon: <CheckCircle2 size={18} />, label: 'Resolution Rate', value: `${agent.resolutionRate}%`, color: 'text-brand-400' },
          { icon: <Clock size={18} />, label: 'Avg Response', value: `${agent.avgResponseTime}s`, color: 'text-purple-400' },
        ].map((stat) => (
          <div key={stat.label} className="bg-dark-900 rounded-xl p-4 border border-white/5">
            <div className={`${stat.color} mb-2`}>{stat.icon}</div>
            <p className="text-xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-dark-400">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* System Prompt */}
        <div className="bg-dark-900 rounded-2xl p-5 border border-white/5">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Code2 size={14} className="text-brand-400" />
            System Prompt
          </h3>
          <div className="bg-dark-800 rounded-xl p-4 text-sm text-dark-300 leading-relaxed max-h-40 overflow-y-auto">
            {agent.systemPrompt || 'No prompt configured.'}
          </div>
        </div>

        {/* Settings */}
        <div className="bg-dark-900 rounded-2xl p-5 border border-white/5">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Settings size={14} className="text-brand-400" />
            Settings
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-dark-400 mb-1">Model</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-dark-800 border border-white/10 text-white text-sm outline-none"
              >
                <option>GPT-4o</option>
                <option>Claude 3.5 Sonnet</option>
                <option>GPT-4o Mini</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-dark-400 mb-1">Temperature: {temperature}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={temperature}
                onChange={(e) => setTemperature(Number(e.target.value))}
                className="w-full accent-brand-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-dark-400">Human Handoff</span>
              <div className="w-10 h-5 rounded-full bg-brand-500 relative cursor-pointer">
                <div className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Embed Code */}
      <div className="bg-dark-900 rounded-2xl p-5 border border-white/5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white">Embed Code</h3>
          <button onClick={handleCopy} className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300">
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <pre className="bg-dark-800 rounded-xl p-4 text-xs text-dark-300 overflow-x-auto border border-white/5">
          {embedCode}
        </pre>
      </div>

      {/* Recent Activity */}
      <div className="bg-dark-900 rounded-2xl p-5 border border-white/5">
        <h3 className="text-sm font-bold text-white mb-3">Recent Activity</h3>
        {agentActivity.length === 0 ? (
          <p className="text-xs text-dark-500 py-4 text-center">No conversations yet. The agent loop will generate activity shortly.</p>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {agentActivity.slice(0, 20).map((event) => (
              <div key={event.id} className="bg-dark-800 rounded-lg p-3 border border-white/5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-white">{event.user}</span>
                  <span className="text-[10px] text-dark-500">{event.resolved ? '✅' : '⏳'} {event.duration}s</span>
                </div>
                <p className="text-[11px] text-dark-300">Q: {event.message}</p>
                <p className="text-[11px] text-dark-400">A: {event.response.slice(0, 60)}...</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AgentDetail;
