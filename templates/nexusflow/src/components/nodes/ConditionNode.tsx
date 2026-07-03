import React from 'react';
import { NodeProps } from 'reactflow';
import BaseNode from './BaseNode';
import { WorkflowNodeData } from '../../types';

export default function ConditionNode(props: NodeProps<WorkflowNodeData>) {
  const config = props.data.config.condition;
  return (
    <BaseNode
      {...props}
      showSource={false}
      handles={{ top: true, bottom: true, left: true, right: true }}
    >
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-surface-400">If:</span>
          <span className="text-surface-200 font-mono text-xs ml-2 truncate max-w-[120px]">
            {config?.expression || '{{condition}}'}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-1 text-[10px]">
          <span className="text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">true →</span>
          <span className="text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">false →</span>
        </div>
      </div>
    </BaseNode>
  );
}
