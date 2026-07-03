import React from 'react';
import { NodeProps } from 'reactflow';
import BaseNode from './BaseNode';
import { WorkflowNodeData } from '../../types';

export default function ActionNode(props: NodeProps<WorkflowNodeData>) {
  const config = props.data.config.action;
  return (
    <BaseNode {...props}>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          {config?.actionType === 'http' ? (
            <>
              <span className="text-surface-500">HTTP</span>
              <span className="text-xs font-mono text-surface-400">{config?.method || 'GET'}</span>
              <span className="text-surface-200 text-xs truncate max-w-[120px]">
                {config?.url || 'No URL'}
              </span>
            </>
          ) : (
            <>
              <span className="text-surface-500">Transform</span>
              <span className="text-surface-200 truncate">
                {config?.transformExpression || 'No expression'}
              </span>
            </>
          )}
        </div>
      </div>
    </BaseNode>
  );
}
