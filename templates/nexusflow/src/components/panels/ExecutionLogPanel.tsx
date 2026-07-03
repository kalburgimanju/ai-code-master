import React from 'react';
import {
  X, Terminal, CheckCircle, XCircle, Clock, Loader2,
} from 'lucide-react';
import { Execution, ExecutionStep } from '../../types';

interface ExecutionLogPanelProps {
  execution: Execution | null;
  onClose: () => void;
}

function StepIcon({ status }: { status: ExecutionStep['status'] }) {
  switch (status) {
    case 'completed':
      return <CheckCircle className="w-4 h-4 text-emerald-400" />;
    case 'failed':
      return <XCircle className="w-4 h-4 text-red-400" />;
    case 'running':
      return <Loader2 className="w-4 h-4 text-nexus-400 animate-spin" />;
    case 'pending':
      return <Clock className="w-4 h-4 text-surface-600" />;
  }
}

function StatusBadge({ status }: { status: Execution['status'] }) {
  const colors = {
    running: 'bg-nexus-500/20 text-nexus-400',
    completed: 'bg-emerald-500/20 text-emerald-400',
    failed: 'bg-red-500/20 text-red-400',
  };
  return (
    <span className={`badge ${colors[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default function ExecutionLogPanel({ execution, onClose }: ExecutionLogPanelProps) {
  if (!execution) {
    return (
      <div className="w-80 bg-surface-900 border-l border-surface-800 h-full flex items-center justify-center">
        <div className="text-center p-6">
          <Terminal className="w-8 h-8 text-surface-600 mx-auto mb-2" />
          <p className="text-sm text-surface-500">No execution logs yet</p>
          <p className="text-xs text-surface-600 mt-1">
            Run the workflow to see execution details here
          </p>
        </div>
      </div>
    );
  }

  const duration = execution.startedAt && execution.completedAt
    ? Math.round(
        (new Date(execution.completedAt).getTime() -
          new Date(execution.startedAt).getTime()) /
          1000
      )
    : null;

  return (
    <div className="w-80 bg-surface-900 border-l border-surface-800 h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-surface-800 shrink-0">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-surface-400" />
          <span className="text-sm font-semibold text-surface-200">Execution Log</span>
        </div>
        <button onClick={onClose} className="btn-ghost p-1">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Summary */}
      <div className="p-4 border-b border-surface-800 space-y-2 shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-xs text-surface-500">Status</span>
          <StatusBadge status={execution.status} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-surface-500">Duration</span>
          <span className="text-xs text-surface-300">
            {duration !== null ? `${duration}s` : '---'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-surface-500">Steps</span>
          <span className="text-xs text-surface-300">
            {execution.steps.filter((s) => s.status === 'completed').length}/
            {execution.steps.length}
          </span>
        </div>
        {execution.error && (
          <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-400">
            {execution.error}
          </div>
        )}
      </div>

      {/* Steps */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-3 space-y-2">
          <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wide">
            Step Log
          </h4>
          {execution.steps.map((step) => (
            <div
              key={step.nodeId}
              className={`p-3 rounded-lg border ${
                step.status === 'failed'
                  ? 'bg-red-500/5 border-red-500/20'
                  : step.status === 'completed'
                  ? 'bg-surface-800/50 border-surface-700'
                  : step.status === 'running'
                  ? 'bg-nexus-500/5 border-nexus-500/20'
                  : 'bg-surface-800/30 border-surface-800'
              }`}
            >
              <div className="flex items-start gap-2">
                <StepIcon status={step.status} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-surface-200 truncate">
                    {step.nodeLabel}
                  </div>
                  <div className="text-[10px] text-surface-500 uppercase mt-0.5">
                    {step.nodeType}
                  </div>
                  {step.error && (
                    <div className="mt-1.5 text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded">
                      {step.error}
                    </div>
                  )}
                  {step.output && step.status === 'completed' && (
                    <details className="mt-1.5">
                      <summary className="text-xs text-surface-500 cursor-pointer hover:text-surface-300">
                        Output
                      </summary>
                      <pre className="mt-1 text-[10px] text-surface-400 font-mono bg-surface-950 p-2 rounded overflow-x-auto max-h-32 overflow-y-auto">
                        {JSON.stringify(step.output, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
