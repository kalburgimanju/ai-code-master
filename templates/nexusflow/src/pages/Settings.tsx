import React, { useState, useEffect } from 'react';
import { Key, CheckCircle, XCircle, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { getSettings, saveSettings } from '../utils/storage';
import { validateApiKey, fetchAvailableModels } from '../utils/openRouter';
import { OPENROUTER_DEFAULT_MODELS } from '../types';

export default function Settings() {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [validating, setValidating] = useState(false);
  const [valid, setValid] = useState<boolean | null>(null);
  const [saved, setSaved] = useState(false);
  const [availableModels, setAvailableModels] = useState<{ id: string; name: string; provider: string }[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);

  useEffect(() => {
    const settings = getSettings();
    if (settings.openRouterKey) {
      setApiKey(settings.openRouterKey);
      setValid(true);
    }
  }, []);

  const handleSave = () => {
    saveSettings({ openRouterKey: apiKey });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleValidate = async () => {
    if (!apiKey.trim()) return;
    setValidating(true);
    setValid(null);
    try {
      const isValid = await validateApiKey(apiKey);
      setValid(isValid);
      if (isValid) {
        saveSettings({ openRouterKey: apiKey });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch {
      setValid(false);
    } finally {
      setValidating(false);
    }
  };

  const handleFetchModels = async () => {
    if (!apiKey.trim()) return;
    setLoadingModels(true);
    try {
      const models = await fetchAvailableModels(apiKey);
      setAvailableModels(models.slice(0, 20));
    } catch {
      // ignore
    } finally {
      setLoadingModels(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-surface-400 mt-1">
          Configure API keys and preferences for NexusFlow
        </p>
      </div>

      {/* OpenRouter API Key */}
      <div className="card space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-nexus-600/20 flex items-center justify-center">
            <Key className="w-5 h-5 text-nexus-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">OpenRouter API Key</h2>
            <p className="text-sm text-surface-400">
              Required to run AI Agent nodes. Get a key from{' '}
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-nexus-400 hover:text-nexus-300 underline"
              >
                openrouter.ai/keys
              </a>
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setValid(null);
                  setSaved(false);
                }}
                placeholder="sk-or-v1-..."
                className="input pr-10 font-mono text-sm"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300"
              >
                {showKey ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Validation indicator */}
          {valid !== null && (
            <div
              className={`flex items-center gap-2 text-sm ${
                valid ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {valid ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  API key is valid
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4" />
                  Invalid API key
                </>
              )}
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={handleValidate}
              disabled={!apiKey.trim() || validating}
              className="btn-primary text-sm"
            >
              {validating ? 'Validating...' : 'Validate & Save'}
            </button>
            <button onClick={handleSave} className="btn-secondary text-sm">
              {saved ? 'Saved ✓' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      {/* Model Explorer */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Available Models</h2>
            <p className="text-sm text-surface-400">
              Models available through your OpenRouter API key
            </p>
          </div>
          <button
            onClick={handleFetchModels}
            disabled={!apiKey.trim() || loadingModels}
            className="btn-ghost flex items-center gap-1 text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loadingModels ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {availableModels.length > 0 ? (
          <div className="max-h-64 overflow-y-auto space-y-1">
            {availableModels.map((model) => (
              <div
                key={model.id}
                className="flex items-center justify-between p-2 rounded-lg bg-surface-800/50"
              >
                <div className="min-w-0">
                  <div className="text-sm text-surface-200 truncate">
                    {model.name}
                  </div>
                  <div className="text-xs text-surface-500 font-mono truncate">
                    {model.id}
                  </div>
                </div>
                <span className="badge-info text-[10px] shrink-0 ml-2">
                  {model.provider}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-surface-500 text-sm">
            {apiKey
              ? 'Click "Refresh" to load available models'
              : 'Add your API key above to explore models'}
          </div>
        )}

        {/* Built-in Models Reference */}
        <div>
          <h3 className="text-sm font-medium text-surface-300 mb-2">
            Default Models (always available)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {OPENROUTER_DEFAULT_MODELS.map((model) => (
              <div
                key={model.id}
                className="flex items-center gap-2 p-2 rounded-lg bg-surface-800/30 border border-surface-800"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-nexus-500 shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs text-surface-300 truncate">{model.name}</div>
                  <div className="text-[10px] text-surface-500">{model.provider}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="card space-y-3">
        <h2 className="text-lg font-semibold text-white">Tips</h2>
        <ul className="space-y-2 text-sm text-surface-400">
          <li className="flex items-start gap-2">
            <span className="text-nexus-400 mt-0.5">•</span>
            <span>
              Drag nodes from the palette onto the canvas to build your workflow
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-nexus-400 mt-0.5">•</span>
            <span>
              Connect nodes by dragging from the bottom handle to another node's top handle
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-nexus-400 mt-0.5">•</span>
            <span>
              Click a node to configure its settings in the right panel
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-nexus-400 mt-0.5">•</span>
            <span>
              Use {'{{nodeId.output}}'} syntax to pass data between nodes. The output of each node is accessible by its ID
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-nexus-400 mt-0.5">•</span>
            <span>
              For AI Agent nodes, make sure to set a valid OpenRouter API key in Settings
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
