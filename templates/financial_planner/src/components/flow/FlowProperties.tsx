'use client';
import { FlowNode } from './types';
import { getNodeDefinition } from './nodeDefinitions';
import { X, Settings, Play, Clock, CheckCircle, XCircle } from 'lucide-react';

interface FlowPropertiesProps {
  node: FlowNode | null;
  onUpdate: (id: string, config: Record<string, any>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  idle: { label: 'Idle', color: 'text-dark-500', icon: Settings },
  pending: { label: 'Pending', color: 'text-yellow-400', icon: Clock },
  running: { label: 'Running', color: 'text-finance-400', icon: Play },
  done: { label: 'Completed', color: 'text-prop-400', icon: CheckCircle },
  error: { label: 'Error', color: 'text-red-400', icon: XCircle },
};

export default function FlowProperties({ node, onUpdate, onDelete, onClose }: FlowPropertiesProps) {
  if (!node) return null;

  const def = getNodeDefinition(node.type, node.subtype);
  if (!def) return null;

  const status = statusConfig[node.status];
  const StatusIcon = status.icon;

  const handleConfigChange = (key: string, value: any) => {
    onUpdate(node.id, { ...node.config, [key]: value });
  };

  return (
    <div className="w-72 bg-dark-900/95 backdrop-blur-sm border-l border-dark-800 flex flex-col shrink-0 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-dark-800 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <Settings className="w-4 h-4 text-finance-400" /> Properties
        </h2>
        <button onClick={onClose} className="p-1 text-dark-400 hover:text-white rounded-lg hover:bg-dark-800">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Node Info */}
        <div className="p-3 rounded-xl bg-dark-800/50 border border-dark-700">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${def.gradient} flex items-center justify-center`}>
              <span className="text-xs text-white font-bold">{node.label.charAt(0)}</span>
            </div>
            <div>
              <p className="text-sm font-medium text-white">{node.label}</p>
              <p className="text-[10px] text-dark-500">{def.type} / {def.subtype}</p>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            <StatusIcon className={`w-3 h-3 ${status.color}`} />
            <span className={`text-[10px] ${status.color}`}>{status.label}</span>
          </div>
          {node.error && (
            <div className="mt-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-[10px] text-red-400">{node.error}</p>
            </div>
          )}
        </div>

        {/* Config Fields */}
        {Object.keys(def.config).length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-medium text-dark-400 uppercase tracking-wider">Configuration</h3>
            {Object.entries(def.config).map(([key, cfg]) => (
              <div key={key}>
                <label className="block text-[11px] font-medium text-dark-400 mb-1">{cfg.label}</label>
                {cfg.type === 'text' && (
                  <input
                    type="text"
                    value={node.config[key] || ''}
                    onChange={e => handleConfigChange(key, e.target.value)}
                    className="w-full px-3 py-1.5 bg-dark-800 border border-dark-700 rounded-lg text-xs text-white placeholder-dark-500 focus:outline-none focus:border-finance-500 transition-all"
                  />
                )}
                {cfg.type === 'textarea' && (
                  <textarea
                    value={node.config[key] || ''}
                    onChange={e => handleConfigChange(key, e.target.value)}
                    rows={3}
                    className="w-full px-3 py-1.5 bg-dark-800 border border-dark-700 rounded-lg text-xs text-white placeholder-dark-500 focus:outline-none focus:border-finance-500 transition-all resize-none"
                  />
                )}
                {cfg.type === 'number' && (
                  <input
                    type="number"
                    value={node.config[key] || 0}
                    onChange={e => handleConfigChange(key, Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-dark-800 border border-dark-700 rounded-lg text-xs text-white focus:outline-none focus:border-finance-500 transition-all"
                  />
                )}
                {cfg.type === 'select' && (
                  <select
                    value={node.config[key] || ''}
                    onChange={e => handleConfigChange(key, e.target.value)}
                    className="w-full px-3 py-1.5 bg-dark-800 border border-dark-700 rounded-lg text-xs text-white focus:outline-none focus:border-finance-500 transition-all cursor-pointer appearance-none"
                  >
                    {cfg.options?.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                )}
                {cfg.type === 'toggle' && (
                  <button
                    onClick={() => handleConfigChange(key, !node.config[key])}
                    className={`relative w-10 h-5 rounded-full transition-all ${node.config[key] ? 'bg-finance-600' : 'bg-dark-700'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${node.config[key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Ports Info */}
        <div className="space-y-2">
          <h3 className="text-xs font-medium text-dark-400 uppercase tracking-wider">Ports</h3>
          {def.inputs.length > 0 && (
            <div>
              <p className="text-[10px] text-dark-500 mb-1">Inputs</p>
              {def.inputs.map(p => (
                <div key={p.id} className="flex items-center gap-2 py-1">
                  <div className="w-2 h-2 rounded-full bg-finance-500" />
                  <span className="text-[11px] text-dark-300">{p.label}</span>
                </div>
              ))}
            </div>
          )}
          {def.outputs.length > 0 && (
            <div>
              <p className="text-[10px] text-dark-500 mb-1">Outputs</p>
              {def.outputs.map(p => (
                <div key={p.id} className="flex items-center gap-2 py-1">
                  <div className="w-2 h-2 rounded-full bg-prop-500" />
                  <span className="text-[11px] text-dark-300">{p.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-dark-800">
        <button
          onClick={() => onDelete(node.id)}
          className="w-full px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-all"
        >
          Delete Node
        </button>
      </div>
    </div>
  );
}
