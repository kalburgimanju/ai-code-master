import React from 'react';
import { NodeProps } from 'reactflow';
import BaseNode from './BaseNode';
import { WorkflowNodeData } from '../../types';

export default function DelayNode(props: NodeProps<WorkflowNodeData>) {
  const config = props.data.config.delay;
  const duration = config?.duration || 5;
  return (
    <BaseNode {...props}>
      <div className="flex items-center gap-2">
        <span className="text-surface-500">Duration:</span>
        <span className="text-surface-200 font-medium">
          {duration < 60
            ? `${duration}s`
            : `${Math.floor(duration / 60)}m ${duration % 60}s`}
        </span>
      </div>
    </BaseNode>
  );
}
