import React from 'react';
import { NodeProps } from 'reactflow';
import BaseNode from './BaseNode';
import { WorkflowNodeData } from '../../types';

export default function TriggerNode(props: NodeProps<WorkflowNodeData>) {
  const config = props.data.config.trigger;
  const triggerType = config?.triggerType || 'manual';
  const triggerLabels: Record<string, string> = {
    manual: '▶ Manual trigger',
    scheduled: '⏰ Scheduled (cron)',
    webhook: '🔗 Webhook',
  };
  return (
    <BaseNode {...props}>
      <div className="flex items-center gap-2">
        <span className="text-surface-300">{triggerLabels[triggerType]}</span>
      </div>
    </BaseNode>
  );
}
