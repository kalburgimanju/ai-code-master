'use client';
import { Play, Pause, Save, Trash2, RotateCcw, ArrowLeft, Zap, CheckCircle, Clock, AlertCircle, Download, Upload } from 'lucide-react';

interface FlowToolbarProps {
  flowName: string;
  flowStatus: 'draft' | 'running' | 'completed' | 'error' | string;
  nodeCount: number;
  edgeCount: number;
  onRun: () => void;
  onStop: () => void;
  onSave: () => void;
  onClear: () => void;
  onBack: () => void;
  onExport: () => void;
}

export default function FlowToolbar({
  flowName, flowStatus, nodeCount, edgeCount,
  onRun, onStop, onSave, onClear, onBack, onExport,
}: FlowToolbarProps) {
  const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    draft: { label: 'Draft', color: 'bg-dark-700 text-dark-400', icon: Clock },
    running: { label: 'Running...', color: 'bg-finance-600/20 text-finance-400', icon: Zap },
    completed: { label: 'Completed', color: 'bg-prop-600/20 text-prop-400', icon: CheckCircle },
    error: { label: 'Error', color: 'bg-red-600/20 text-red-400', icon: AlertCircle },
  };

  const status = statusConfig[flowStatus];
  const StatusIcon = status.icon;

  return (
    <div className="h-12 bg-dark-900/95 backdrop-blur-sm border-b border-dark-800 flex items-center justify-between px-4 shrink-0">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-1.5 text-dark-400 hover:text-white hover:bg-dark-800 rounded-lg transition-all" title="Back to Marketing">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="h-5 w-px bg-dark-700" />
        <h1 className="text-sm font-semibold text-white">{flowName || 'Untitled Flow'}</h1>
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${status.color}`}>
          <StatusIcon className="w-3 h-3" />
          {status.label}
        </span>
        <div className="flex items-center gap-2 text-[10px] text-dark-500">
          <span>{nodeCount} nodes</span>
          <span>•</span>
          <span>{edgeCount} connections</span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <button onClick={onExport} className="px-3 py-1.5 text-xs text-dark-400 hover:text-dark-200 hover:bg-dark-800 rounded-lg transition-all flex items-center gap-1.5">
          <Download className="w-3.5 h-3.5" /> Export
        </button>
        <button onClick={onSave} className="px-3 py-1.5 text-xs text-dark-400 hover:text-dark-200 hover:bg-dark-800 rounded-lg transition-all flex items-center gap-1.5">
          <Save className="w-3.5 h-3.5" /> Save
        </button>
        <button onClick={onClear} className="px-3 py-1.5 text-xs text-dark-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all flex items-center gap-1.5">
          <Trash2 className="w-3.5 h-3.5" /> Clear
        </button>
        <div className="h-5 w-px bg-dark-700" />
        {flowStatus === 'running' ? (
          <button onClick={onStop} className="px-4 py-1.5 text-xs font-medium bg-red-600 hover:bg-red-500 text-white rounded-lg transition-all flex items-center gap-1.5">
            <Pause className="w-3.5 h-3.5" /> Stop
          </button>
        ) : (
          <button
            onClick={onRun}
            disabled={nodeCount === 0 || flowStatus === 'running'}
            className="px-4 py-1.5 text-xs font-medium bg-prop-600 hover:bg-prop-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5" /> Run Flow
          </button>
        )}
      </div>
    </div>
  );
}
