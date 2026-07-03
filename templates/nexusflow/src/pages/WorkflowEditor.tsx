import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Save,
  Play,
  StopCircle,
  ChevronLeft,
  Trash2,
  History,
} from 'lucide-react';
import Canvas from '../components/Canvas';
import NodePalette from '../components/NodePalette';
import {
  getWorkflow,
  saveWorkflow,
  deleteWorkflow,
  getExecutions,
  generateId,
} from '../utils/storage';
import { executeWorkflow } from '../utils/workflowEngine';
import {
  Workflow,
  WorkflowNode,
  Execution,
  ExecutionStep,
  PaletteItem,
} from '../types';

export default function WorkflowEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [currentExecution, setCurrentExecution] = useState<Execution | null>(null);
  const [saving, setSaving] = useState(false);
  const [unsaved, setUnsaved] = useState(false);

  // Load workflow
  useEffect(() => {
    if (!id) return;
    const wf = getWorkflow(id);
    if (!wf) {
      navigate('/workflows');
      return;
    }
    setWorkflow(wf);
    setName(wf.name);
    setDescription(wf.description);
    setExecutions(getExecutions(id));
  }, [id]);

  const handleSave = useCallback(() => {
    if (!workflow) return;
    setSaving(true);
    const updated = {
      ...workflow,
      name,
      description,
      updatedAt: new Date().toISOString(),
    };
    saveWorkflow(updated);
    setWorkflow(updated);
    setUnsaved(false);
    setTimeout(() => setSaving(false), 500);
  }, [workflow, name, description]);

  // Auto-save when workflow changes
  useEffect(() => {
    if (unsaved && workflow) {
      const timer = setTimeout(() => handleSave(), 2000);
      return () => clearTimeout(timer);
    }
  }, [unsaved, workflow]);

  const handleCanvasChange = useCallback(
    (nodes: WorkflowNode[], edges: any[]) => {
      if (!workflow) return;
      setWorkflow((prev) =>
        prev
          ? { ...prev, nodes, edges, updatedAt: new Date().toISOString() }
          : prev
      );
      setUnsaved(true);
    },
    [workflow]
  );

  const handleRun = useCallback(async () => {
    if (!workflow || isRunning) return;

    // Save first
    handleSave();

    setIsRunning(true);
    setShowHistory(true);

    // Create initial execution
    const initialExecution: Execution = {
      id: generateId(),
      workflowId: workflow.id,
      workflowName: workflow.name,
      startedAt: new Date().toISOString(),
      status: 'running',
      steps: workflow.nodes.map((n) => ({
        nodeId: n.id,
        nodeLabel: n.data.label,
        nodeType: n.data.type,
        status: 'pending' as const,
      })),
    };
    setCurrentExecution(initialExecution);

    try {
      const execution = await executeWorkflow(
        workflow,
        { triggered: true, timestamp: new Date().toISOString() },
        (step, allSteps) => {
          setCurrentExecution((prev) =>
            prev
              ? {
                  ...prev,
                  steps: allSteps,
                  status: allSteps.some((s) => s.status === 'failed')
                    ? 'failed'
                    : allSteps.every((s) => s.status === 'completed' || s.status === 'failed')
                    ? 'completed'
                    : 'running',
                  completedAt:
                    allSteps.every((s) => s.status !== 'pending' && s.status !== 'running')
                      ? new Date().toISOString()
                      : undefined,
                }
              : prev
          );
        }
      );
      setCurrentExecution(execution);
      setExecutions((prev) => [execution, ...prev.slice(0, 49)]);
    } catch (error: any) {
      setCurrentExecution((prev) =>
        prev
          ? {
              ...prev,
              status: 'failed',
              completedAt: new Date().toISOString(),
              error: error.message,
            }
          : prev
      );
    } finally {
      setIsRunning(false);
    }
  }, [workflow, isRunning, handleSave]);

  const handleDelete = () => {
    if (!workflow || !confirm('Delete this workflow permanently?')) return;
    deleteWorkflow(workflow.id);
    navigate('/workflows');
  };

  if (!workflow) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-surface-500 animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="h-12 border-b border-surface-800 flex items-center justify-between px-3 bg-surface-900/80 backdrop-blur-sm shrink-0 gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <button
            onClick={() => navigate('/workflows')}
            className="btn-ghost p-1.5"
            title="Back"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setUnsaved(true);
            }}
            className="bg-transparent text-surface-200 font-semibold text-sm border-none outline-none focus:bg-surface-800 px-2 py-1 rounded max-w-[200px]"
            placeholder="Workflow name"
          />
          {unsaved && (
            <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
              Unsaved
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`btn-ghost p-1.5 ${showHistory ? 'text-nexus-400 bg-nexus-500/10' : ''}`}
            title="Execution History"
          >
            <History className="w-4 h-4" />
          </button>
          <button onClick={handleSave} className="btn-ghost p-1.5" title="Save">
            <Save className="w-4 h-4" />
          </button>
          <button
            onClick={handleRun}
            disabled={isRunning || workflow.nodes.length === 0}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              isRunning
                ? 'bg-red-500/20 text-red-400 cursor-not-allowed'
                : 'bg-nexus-600 hover:bg-nexus-500 text-white'
            }`}
          >
            {isRunning ? (
              <>
                <StopCircle className="w-4 h-4" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Run
              </>
            )}
          </button>
          <button onClick={handleDelete} className="btn-ghost p-1.5 text-red-400 hover:text-red-300 ml-2" title="Delete">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 flex min-h-0">
        {/* Left: Node Palette */}
        <div className="w-64 border-r border-surface-800 p-3 overflow-y-auto bg-surface-900/50 shrink-0 hidden lg:block">
          <NodePalette onDragStart={() => {}} />
        </div>

        {/* Center: Canvas */}
        <div className="flex-1 min-w-0">
          <Canvas
            workflow={workflow}
            onChange={handleCanvasChange}
            execution={currentExecution}
          />
        </div>

        {/* Right: Execution History */}
        {showHistory && (
          <div className="w-72 border-l border-surface-800 bg-surface-900 overflow-y-auto shrink-0 hidden lg:block">
            <div className="p-3 border-b border-surface-800">
              <h3 className="text-sm font-semibold text-surface-200">
                Execution History
              </h3>
            </div>
            {executions.length === 0 ? (
              <div className="p-6 text-center">
                <History className="w-6 h-6 text-surface-600 mx-auto mb-2" />
                <p className="text-xs text-surface-500">No executions yet</p>
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {executions.map((exec) => (
                  <button
                    key={exec.id}
                    onClick={() => setCurrentExecution(exec)}
                    className={`w-full text-left p-2 rounded-lg text-xs transition-colors ${
                      currentExecution?.id === exec.id
                        ? 'bg-nexus-500/10 border border-nexus-500/20'
                        : 'hover:bg-surface-800 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`font-medium ${
                          exec.status === 'completed'
                            ? 'text-emerald-400'
                            : exec.status === 'failed'
                            ? 'text-red-400'
                            : 'text-nexus-400'
                        }`}
                      >
                        {exec.status}
                      </span>
                      <span className="text-surface-500">
                        {exec.steps.filter((s) => s.status === 'completed').length}/
                        {exec.steps.length}
                      </span>
                    </div>
                    <div className="text-surface-500 mt-0.5">
                      {new Date(exec.startedAt).toLocaleString()}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
