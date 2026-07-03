import React, { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronUp, Settings2 } from 'lucide-react';
import { WorkflowNodeData, NodeConfig, OPENROUTER_DEFAULT_MODELS } from '../../types';

interface ConfigPanelProps {
  nodeId: string;
  data: WorkflowNodeData;
  onUpdate: (nodeId: string, data: Partial<WorkflowNodeData>) => void;
  onClose: () => void;
}

export default function ConfigPanel({ nodeId, data, onUpdate, onClose }: ConfigPanelProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [localConfig, setLocalConfig] = useState<NodeConfig>(data.config || {});

  useEffect(() => {
    setLocalConfig(data.config || {});
  }, [data.config, nodeId]);

  const updateConfig = (path: string, value: any) => {
    const newConfig = { ...localConfig };
    // Split path like "trigger.triggerType"
    const keys = path.split('.');
    let obj: any = newConfig;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!obj[keys[i]]) obj[keys[i]] = {};
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;
    setLocalConfig(newConfig);
    onUpdate(nodeId, { config: newConfig, label: data.label });
  };

  const updateLabel = (label: string) => {
    onUpdate(nodeId, { label, config: localConfig });
  };

  const renderField = (
    label: string,
    name: string,
    type: 'text' | 'textarea' | 'number' | 'select',
    value: string | number | undefined,
    options?: { value: string; label: string }[],
    placeholder?: string
  ) => {
    const baseClass = 'w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-surface-200 placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-nexus-500/50 focus:border-nexus-500 transition-all text-sm';

    return (
      <div className="mb-3">
        <label className="block text-xs font-medium text-surface-400 mb-1">{label}</label>
        {type === 'textarea' ? (
          <textarea
            className={`${baseClass} min-h-[80px] resize-y font-mono text-xs`}
            value={value ?? ''}
            onChange={(e) => updateConfig(name, e.target.value)}
            placeholder={placeholder}
            rows={3}
          />
        ) : type === 'select' ? (
          <select
            className={`${baseClass} appearance-none`}
            value={value ?? ''}
            onChange={(e) => updateConfig(name, e.target.value)}
          >
            {options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : type === 'number' ? (
          <input
            type="number"
            className={baseClass}
            value={value ?? ''}
            onChange={(e) => updateConfig(name, Number(e.target.value))}
            placeholder={placeholder}
            min={0}
            step="any"
          />
        ) : (
          <input
            type="text"
            className={baseClass}
            value={value ?? ''}
            onChange={(e) => updateConfig(name, e.target.value)}
            placeholder={placeholder}
          />
        )}
      </div>
    );
  };

  const toggleExpand = (section: string) => {
    setExpanded((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const sectionHeader = (title: string, key: string) => (
    <button
      onClick={() => toggleExpand(key)}
      className="flex items-center justify-between w-full text-sm font-medium text-surface-300 py-2 hover:text-surface-200"
    >
      {title}
      {expanded[key] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
    </button>
  );

  const nodeType = data.type;

  return (
    <div className="w-80 bg-surface-900 border-l border-surface-800 h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-surface-800 shrink-0">
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-surface-400" />
          <span className="text-sm font-semibold text-surface-200">Configuration</span>
        </div>
        <button onClick={onClose} className="btn-ghost p-1">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Common: Label */}
        <div>
          <label className="block text-xs font-medium text-surface-400 mb-1">Node Label</label>
          <input
            type="text"
            className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-surface-200 placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-nexus-500/50 focus:border-nexus-500 transition-all text-sm"
            value={data.label}
            onChange={(e) => updateLabel(e.target.value)}
          />
        </div>

        {/* Trigger Config */}
        {nodeType === 'trigger' && (
          <div>
            {sectionHeader('Trigger Settings', 'trigger')}
            {expanded.trigger && (
              <div className="space-y-1 mt-1">
                {renderField(
                  'Trigger Type',
                  'trigger.triggerType',
                  'select',
                  localConfig.trigger?.triggerType,
                  [
                    { value: 'manual', label: 'Manual' },
                    { value: 'scheduled', label: 'Scheduled (Cron)' },
                    { value: 'webhook', label: 'Webhook' },
                  ]
                )}
                {localConfig.trigger?.triggerType === 'scheduled' &&
                  renderField('Cron Expression', 'trigger.schedule', 'text', localConfig.trigger?.schedule, undefined, '*/5 * * * *')}
              </div>
            )}
          </div>
        )}

        {/* AI Agent Config */}
        {nodeType === 'agent' && (
          <div>
            {sectionHeader('AI Agent Settings', 'agent')}
            {expanded.agent && (
              <div className="space-y-1 mt-1">
                {renderField(
                  'Model',
                  'agent.model',
                  'select',
                  localConfig.agent?.model,
                  OPENROUTER_DEFAULT_MODELS.map((m) => ({
                    value: m.id,
                    label: `${m.name} (${m.provider})`,
                  }))
                )}
                {renderField(
                  'System Prompt',
                  'agent.systemPrompt',
                  'textarea',
                  localConfig.agent?.systemPrompt,
                  undefined,
                  'You are a helpful AI assistant...'
                )}
                {renderField(
                  'User Prompt',
                  'agent.userPrompt',
                  'textarea',
                  localConfig.agent?.userPrompt,
                  undefined,
                  '{{input}} or your custom prompt'
                )}
                {renderField('Temperature', 'agent.temperature', 'number', localConfig.agent?.temperature)}
                {renderField('Max Tokens', 'agent.maxTokens', 'number', localConfig.agent?.maxTokens)}
              </div>
            )}
          </div>
        )}

        {/* HTTP Action Config */}
        {nodeType === 'action' && (
          <div>
            {sectionHeader('Action Settings', 'action')}
            {expanded.action && (
              <div className="space-y-1 mt-1">
                {renderField(
                  'Action Type',
                  'action.actionType',
                  'select',
                  localConfig.action?.actionType,
                  [
                    { value: 'http', label: 'HTTP Request' },
                    { value: 'transform', label: 'Transform Data' },
                  ]
                )}
                {localConfig.action?.actionType === 'http' ? (
                  <>
                    {renderField('URL', 'action.url', 'text', localConfig.action?.url, undefined, 'https://api.example.com/data')}
                    {renderField(
                      'Method',
                      'action.method',
                      'select',
                      localConfig.action?.method,
                      [
                        { value: 'GET', label: 'GET' },
                        { value: 'POST', label: 'POST' },
                        { value: 'PUT', label: 'PUT' },
                        { value: 'DELETE', label: 'DELETE' },
                      ]
                    )}
                    {renderField('Headers (JSON)', 'action.headers', 'textarea', localConfig.action?.headers, undefined, '{"Authorization": "Bearer {{token}}"}')}
                    {localConfig.action?.method !== 'GET' &&
                      renderField('Body', 'action.body', 'textarea', localConfig.action?.body, undefined, '{"key": "{{value}}"}')}
                  </>
                ) : (
                  <>
                    {renderField('Transform Expression', 'action.transformExpression', 'textarea', localConfig.action?.transformExpression, undefined, 'vars.input.map(x => x.name)')}
                    <p className="text-xs text-surface-500 mt-1">
                      Use <code className="text-nexus-400">vars.*</code> to access variables from previous nodes.
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Condition Config */}
        {nodeType === 'condition' && (
          <div>
            {sectionHeader('Condition Settings', 'condition')}
            {expanded.condition && (
              <div className="space-y-1 mt-1">
                {renderField('Condition Expression', 'condition.expression', 'text', localConfig.condition?.expression, undefined, '{{value}} > 100')}
                <p className="text-xs text-surface-500 mt-1">
                  Use <code className="text-nexus-400">{'{{nodeId.output}}'}</code> variables. The condition should evaluate to <code className="text-nexus-400">true</code> or <code className="text-nexus-400">false</code>.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Delay Config */}
        {nodeType === 'delay' && (
          <div>
            {sectionHeader('Delay Settings', 'delay')}
            {expanded.delay && (
              <div className="space-y-1 mt-1">
                {renderField('Duration (seconds)', 'delay.duration', 'number', localConfig.delay?.duration)}
              </div>
            )}
          </div>
        )}

        {/* Output Config */}
        {nodeType === 'output' && (
          <div>
            {sectionHeader('Output Settings', 'output')}
            {expanded.output && (
              <div className="space-y-1 mt-1">
                {renderField(
                  'Output Type',
                  'output.outputType',
                  'select',
                  localConfig.output?.outputType,
                  [
                    { value: 'log', label: 'Log to Console' },
                    { value: 'return', label: 'Return Data' },
                  ]
                )}
                {renderField('Output Message', 'output.message', 'textarea', localConfig.output?.message, undefined, 'Workflow output: {{data}}')}
              </div>
            )}
          </div>
        )}

        {/* Variable Tips */}
        {nodeType !== 'trigger' && (
          <div className="mt-4 p-3 bg-nexus-500/10 border border-nexus-500/20 rounded-lg">
            <p className="text-xs text-nexus-400 font-medium mb-1">Variable Access</p>
            <p className="text-xs text-surface-400">
              Use <code className="text-nexus-400">{'{{nodeId.output}}'}</code> to access output from previous nodes. Replace <code className="text-nexus-400">nodeId</code> with the actual node ID.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
