import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Trash2, AlertTriangle } from 'lucide-react';
import { useAgentContext } from '../context/AgentContext';

const SettingsPage: React.FC = () => {
  const { agents, activityFeed } = useAgentContext();
  const [defaultModel, setDefaultModel] = useState('GPT-4o');
  const [defaultTemp, setDefaultTemp] = useState(70);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClearData = () => {
    if (confirm('This will delete all agents and activity data. Are you sure?')) {
      localStorage.removeItem('myai_agents');
      localStorage.removeItem('myai_activity');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-dark-400 text-sm mt-1">Configure global settings for your AI employees.</p>
      </div>

      {/* Default Model Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-dark-900 rounded-2xl p-6 border border-white/5 space-y-5"
      >
        <h3 className="text-lg font-bold text-white">Default Agent Settings</h3>
        <p className="text-xs text-dark-400">These settings apply to newly created agents.</p>

        <div>
          <label className="block text-sm font-medium text-dark-300 mb-1.5">Default Model</label>
          <select
            value={defaultModel}
            onChange={(e) => setDefaultModel(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-dark-800 border border-white/10 text-white outline-none focus:border-brand-500 text-sm"
          >
            <option>GPT-4o (Recommended)</option>
            <option>Claude 3.5 Sonnet</option>
            <option>GPT-4o Mini (Faster)</option>
            <option>Llama 3.1 70B (Open Source)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-dark-300 mb-1.5">Default Temperature: {defaultTemp}%</label>
          <input
            type="range"
            min="0"
            max="100"
            value={defaultTemp}
            onChange={(e) => setDefaultTemp(Number(e.target.value))}
            className="w-full accent-brand-500"
          />
          <div className="flex justify-between text-[10px] text-dark-500 mt-1">
            <span>Precise (0%)</span>
            <span>Creative (100%)</span>
          </div>
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm text-white">Human Handoff</p>
            <p className="text-xs text-dark-400">Transfer to human when AI is unsure</p>
          </div>
          <div className="w-12 h-6 rounded-full bg-brand-500 relative cursor-pointer">
            <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-white" />
          </div>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 text-dark-900 font-semibold text-sm hover:bg-brand-400 transition-colors"
        >
          <Save size={16} />
          {saved ? 'Saved!' : 'Save Settings'}
        </button>
      </motion.div>

      {/* Account Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-dark-900 rounded-2xl p-6 border border-white/5"
      >
        <h3 className="text-lg font-bold text-white mb-4">Account Overview</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-dark-800 rounded-xl p-4 border border-white/5">
            <p className="text-dark-400">Total Agents</p>
            <p className="text-2xl font-bold text-white">{agents.length}</p>
          </div>
          <div className="bg-dark-800 rounded-xl p-4 border border-white/5">
            <p className="text-dark-400">Total Conversations</p>
            <p className="text-2xl font-bold text-white">{agents.reduce((s, a) => s + a.conversations, 0).toLocaleString()}</p>
          </div>
          <div className="bg-dark-800 rounded-xl p-4 border border-white/5">
            <p className="text-dark-400">Activity Events</p>
            <p className="text-2xl font-bold text-white">{activityFeed.length.toLocaleString()}</p>
          </div>
          <div className="bg-dark-800 rounded-xl p-4 border border-white/5">
            <p className="text-dark-400">Plan</p>
            <p className="text-2xl font-bold text-brand-400">Growth</p>
          </div>
        </div>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-dark-900 rounded-2xl p-6 border border-red-500/20"
      >
        <h3 className="text-lg font-bold text-red-400 mb-2 flex items-center gap-2">
          <AlertTriangle size={18} />
          Danger Zone
        </h3>
        <p className="text-xs text-dark-400 mb-4">
          This will permanently delete all your AI employees and activity data. This action cannot be undone.
        </p>
        <button
          onClick={handleClearData}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors"
        >
          <Trash2 size={14} />
          Delete All Data
        </button>
      </motion.div>
    </div>
  );
};

export default SettingsPage;
