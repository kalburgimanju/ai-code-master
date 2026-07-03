import React from 'react';
import { NodeProps } from 'reactflow';
import BaseNode from './BaseNode';
import { WorkflowNodeData } from '../../types';

export default function OutputNode(props: NodeProps<WorkflowNodeData>) {
  const config = props.data.config.output;
  return (
    <BaseNode {...props} showTarget={true} showSource={false}>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-surface-500">Type:</span>
          <span className="text-surface-200">{config?.outputType || 'log'}</span>
        </div>
        {config?.message && (
          <div className="text-surface-400 truncate">{config.message}</div>
        )}
      </div>
    </BaseNode>
  );
}
