import React from 'react';
import { NodeProps } from 'reactflow';
import BaseNode from './BaseNode';
import { WorkflowNodeData } from '../../types';

export default function AgentNode(props: NodeProps<WorkflowNodeData>) {
  const config = props.data.config.agent;
  return (
    <BaseNode {...props}>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-surface-500">Model:</span>
          <span className="text-surface-200 font-mono text-xs truncate max-w-[130px]">
            {config?.model || 'Not set'}
          </span>
        </div>
        {config?.systemPrompt && (
          <div className="text-surface-500 truncate">
            <span className="text-surface-600">System: </span>
            {config.systemPrompt.slice(0, 60)}
            {config.systemPrompt.length > 60 ? '...' : ''}
          </div>
        )}
      </div>
    </BaseNode>
  );
}
