import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { setApiKey as saveApiKey, hasApiKey } from '../utils/openrouter';
import { Key, Check, AlertCircle } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const { apiKey, setApiKey: setCtxApiKey } = useApp();
  const [keyInput, setKeyInput] = useState(apiKey);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    saveApiKey(keyInput);
    setCtxApiKey(keyInput);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400">
          Configure your API keys and preferences.
        </p>
      </div>

      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center">
            <Key size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">OpenRouter API Key</h2>
            <p className="text-gray-400 text-sm">Required for real AI-generated content</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          {hasApiKey() ? (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-400/10 text-green-400 text-xs font-medium">
              <Check size={12} /> API Key configured
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-400/10 text-yellow-400 text-xs font-medium">
              <AlertCircle size={12} /> Using simulated content
            </span>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">API Key</label>
            <input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="sk-or-v1-..."
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 font-mono text-sm"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              className="px-6 py-2.5 rounded-xl bg-brand-500 text-white font-medium text-sm hover:bg-brand-600 transition-colors"
            >
              {saved ? 'Saved!' : 'Save Key'}
            </button>
            {apiKey && (
              <button
                onClick={() => { setKeyInput(''); saveApiKey(''); setCtxApiKey(''); }}
                className="px-4 py-2.5 rounded-xl bg-red-500/10 text-red-400 text-sm hover:bg-red-500/20 transition-colors"
              >
                Remove Key
              </button>
            )}
          </div>

          <p className="text-gray-500 text-xs">
            Get your free API key at{' '}
            <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-brand-400 hover:underline">
              openrouter.ai/keys
            </a>
          </p>
        </div>
      </div>

      <div className="glass rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Agent Configuration</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
            <div>
              <p className="text-white text-sm font-medium">Content Agent Interval</p>
              <p className="text-gray-400 text-xs">How often new posts are generated</p>
            </div>
            <span className="text-brand-400 text-sm font-medium">30s</span>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
            <div>
              <p className="text-white text-sm font-medium">Marketing Agent Interval</p>
              <p className="text-gray-400 text-xs">How often marketing campaigns are created</p>
            </div>
            <span className="text-purple-400 text-sm font-medium">60s</span>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
            <div>
              <p className="text-white text-sm font-medium">Scheduler Agent Interval</p>
              <p className="text-gray-400 text-xs">How often scheduled posts are processed</p>
            </div>
            <span className="text-orange-400 text-sm font-medium">10s</span>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
            <div>
              <p className="text-white text-sm font-medium">Revenue Agent Interval</p>
              <p className="text-gray-400 text-xs">How often revenue metrics are updated</p>
            </div>
            <span className="text-green-400 text-sm font-medium">15s</span>
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Data Management</h2>
        <div className="space-y-3">
          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            className="w-full p-3 rounded-xl bg-red-500/10 text-red-400 text-sm hover:bg-red-500/20 transition-colors text-left"
          >
            Clear All Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
