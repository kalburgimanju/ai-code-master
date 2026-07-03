import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import {
  Zap, Brain, Globe, GitBranch, Clock, FileOutput,
} from 'lucide-react';
import { WorkflowNodeData, NodeType } from '../../types';

const iconMap: Record<string, React.ElementType> = {
  Zap, Brain, Globe, GitBranch, Clock, Output: FileOutput,
};

const colorMap: Record<NodeType, string> = {
  trigger: '#f59e0b',
  agent: '#818cf8',
  action: '#22c55e',
  condition: '#f97316',
  delay: '#06b6d4',
  output: '#ec4899',
};

const typeLabelMap: Record<NodeType, string> = {
  trigger: 'Trigger',
  agent: 'AI Agent',
  action: 'Action',
  condition: 'Condition',
  delay: 'Delay',
  output: 'Output',
};

interface BaseNodeProps extends NodeProps<WorkflowNodeData> {
  children?: React.ReactNode;
  showSource?: boolean;
  showTarget?: boolean;
  handles?: { top?: boolean; bottom?: boolean; left?: boolean; right?: boolean };
}

export default function BaseNode({
  data,
  selected,
  children,
  showSource = true,
  showTarget = true,
  handles,
}: BaseNodeProps) {
  const Icon = iconMap[data.type] || Brain;
  const color = colorMap[data.type] || '#64748b';
  const typeLabel = typeLabelMap[data.type] || data.type;

  return (
    <div
      className={`node-entrance bg-surface-900 border-2 min-w-[200px] max-w-[280px] rounded-xl ${
        selected ? 'border-nexus-500 shadow-lg shadow-nexus-500/20' : 'border-surface-700'
      }`}
    >
      {/* Handle - Target (top) */}
      {(handles?.top || showTarget) && (
        <Handle
          type="target"
          position={Position.Top}
          className="!w-3 !h-3 !border-2 !border-surface-900 !bg-surface-600"
        />
      )}

      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-surface-800">
        <div
          className="w-6 h-6 rounded-md flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          {Icon && <Icon className="w-3.5 h-3.5" style={{ color }} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-white truncate">{data.label}</div>
          <div className="text-xs text-surface-500">{typeLabel}</div>
        </div>
      </div>

      {/* Body */}
      <div className="px-3 py-2 text-xs text-surface-400">
        {children || <span className="italic text-surface-600">No configuration</span>}
      </div>

      {/* Handle - Source (bottom) */}
      {(handles?.bottom || showSource) && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!w-3 !h-3 !border-2 !border-surface-900 !bg-nexus-500"
        />
      )}

      {/* Optional side handles for conditions */}
      {handles?.left && (
        <Handle
          type="source"
          position={Position.Left}
          id="false"
          className="!w-3 !h-3 !border-2 !border-surface-900 !bg-red-500"
          style={{ top: '50%' }}
        />
      )}
      {handles?.right && (
        <Handle
          type="source"
          position={Position.Right}
          id="true"
          className="!w-3 !h-3 !border-2 !border-surface-900 !bg-emerald-500"
          style={{ top: '50%' }}
        />
      )}
    </div>
  );
}
