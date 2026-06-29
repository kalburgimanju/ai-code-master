import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, CheckCircle2, Clock, Copy, Check, Settings, TrendingUp, Users, Sparkles } from 'lucide-react';
import { demoConversations } from '../data';

interface AgentDashboardProps {
  showCreated: boolean;
}

const AgentDashboard: React.FC<AgentDashboardProps> = ({ showCreated }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'conversations' | 'settings'>('overview');

  const agents = showCreated
    ? [
        { name: 'Support Bot', role: 'Customer Support', convs: 1247, rate: 94, status: 'active' },
        { name: 'Sales Genie', role: 'Sales', convs: 832, rate: 89, status: 'active' },
        { name: 'New Agent', role: 'Custom Role', convs: 0, rate: 100, status: 'active', isNew: true },
      ]
    : [
        { name: 'Support Bot', role: 'Customer Support', convs: 1247, rate: 94, status: 'active' },
        { name: 'Sales Genie', role: 'Sales', convs: 832, rate: 89, status: 'active' },
      ];

  const embedCode = `<script src="https://cdn.myaiemployee.com/widget.js"></script>
<div id="myaiemployee-widget"
  data-agent-id="${showCreated ? 'agent-new' : 'agent-demo'}"
  data-theme="dark">
</div>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-20 md:py-28 bg-dark-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm font-semibold text-brand-400 uppercase tracking-widest mb-3"
          >
            Dashboard
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-extrabold tracking-tight"
          >
            Command center
          </motion.h2>
          <p className="mt-4 text-lg text-dark-400 max-w-2xl mx-auto">
            Monitor your AI employees, track conversations, and manage settings — all in one place.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card overflow-hidden"
        >
          {/* Tabs */}
          <div className="flex border-b border-white/10">
            {(['overview', 'conversations', 'settings'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-6 py-4 text-sm font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? 'text-brand-400 border-b-2 border-brand-400'
                    : 'text-dark-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-6 md:p-8">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Stats grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { icon: <MessageSquare size={20} />, label: 'Total Conversations', value: '2,079', color: 'text-blue-400' },
                    { icon: <CheckCircle2 size={20} />, label: 'Resolution Rate', value: '92%', color: 'text-brand-400' },
                    { icon: <Clock size={20} />, label: 'Avg Response', value: '0.9s', color: 'text-purple-400' },
                    { icon: <TrendingUp size={20} />, label: 'Satisfaction', value: '4.8/5', color: 'text-amber-400' },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-dark-800 rounded-xl p-4 border border-white/5">
                      <div className={`mb-2 ${stat.color}`}>{stat.icon}</div>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                      <p className="text-xs text-dark-400">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Agent cards */}
                <div>
                  <h3 className="text-sm font-medium text-dark-300 mb-3">Active AI Employees</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {agents.map((agent) => (
                      <div key={agent.name} className={`bg-dark-800 rounded-xl p-4 border flex items-center gap-4 ${'isNew' in agent && agent.isNew ? 'border-brand-500/50 shadow-lg shadow-brand-500/10' : 'border-white/5'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-dark-900 font-bold text-sm ${'isNew' in agent && agent.isNew ? 'bg-gradient-to-br from-brand-400 to-emerald-300' : 'bg-gradient-to-br from-brand-400 to-emerald-300'}`}>
                          {'isNew' in agent && agent.isNew ? <Sparkles size={18} /> : <Users size={18} />}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-white text-sm">
                            {agent.name}
                            {'isNew' in agent && agent.isNew && (
                              <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-400">Just Created</span>
                            )}
                          </p>
                          <p className="text-xs text-dark-400">{agent.role}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-white">{agent.convs.toLocaleString()}</p>
                          <p className="text-xs text-dark-400">{agent.rate}% resolved</p>
                        </div>
                        <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Embed code */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-dark-300">Widget Embed Code</h3>
                    <button onClick={handleCopy} className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300">
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <pre className="bg-dark-800 rounded-xl p-4 text-xs text-dark-300 overflow-x-auto border border-white/5">
                    {embedCode}
                  </pre>
                </div>
              </div>
            )}

            {/* Conversations Tab */}
            {activeTab === 'conversations' && (
              <div className="space-y-3">
                {demoConversations.map((conv) => (
                  <div key={conv.id} className="bg-dark-800 rounded-xl p-4 border border-white/5">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{conv.user}</span>
                        {conv.resolved ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-400">Resolved</span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">Pending</span>
                        )}
                      </div>
                      <span className="text-xs text-dark-500">{conv.timestamp}</span>
                    </div>
                    <p className="text-sm text-dark-300 mb-1">👤 {conv.message}</p>
                    <p className="text-sm text-brand-400">🤖 {conv.response}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-1.5">Model</label>
                    <select className="w-full px-4 py-3 rounded-xl bg-dark-800 border border-white/10 text-white outline-none focus:border-brand-500 text-sm">
                      <option>GPT-4o (Recommended)</option>
                      <option>Claude 3.5 Sonnet</option>
                      <option>GPT-4o Mini (Faster)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-1.5">Temperature</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      defaultValue="70"
                      className="w-full accent-brand-500"
                    />
                    <div className="flex justify-between text-xs text-dark-500 mt-1">
                      <span>Precise</span>
                      <span>Creative</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-1.5">Max Tokens</label>
                    <input
                      type="number"
                      defaultValue={500}
                      className="w-full px-4 py-3 rounded-xl bg-dark-800 border border-white/10 text-white outline-none focus:border-brand-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-1.5">Human Handoff</label>
                    <div className="flex items-center gap-3 pt-2">
                      <div className="w-12 h-6 rounded-full bg-brand-500 relative cursor-pointer">
                        <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-white" />
                      </div>
                      <span className="text-sm text-dark-300">Enabled</span>
                    </div>
                  </div>
                </div>

                <button className="btn-primary cursor-pointer">
                  <Settings size={16} />
                  Save Settings
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AgentDashboard;
