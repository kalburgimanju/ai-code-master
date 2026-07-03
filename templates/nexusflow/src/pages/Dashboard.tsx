import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Workflow,
  Play,
  Activity,
  AlertCircle,
  TrendingUp,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { getWorkflows, getExecutions, generateId, saveWorkflow } from '../utils/storage';
import { Workflow as WorkflowType, Execution } from '../types';

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="card flex items-start gap-4">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${color}20` }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div>
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className="text-sm text-surface-400 mt-0.5">{label}</div>
      </div>
    </div>
  );
}

function StatusDot({ status }: { status: WorkflowType['status'] }) {
  const colors = {
    active: 'bg-emerald-500',
    draft: 'bg-surface-600',
    error: 'bg-red-500',
  };
  return <span className={`w-2 h-2 rounded-full ${colors[status]}`} />;
}

function RecentActivity({ workflows }: { workflows: WorkflowType[] }) {
  const sorted = [...workflows]
    .filter((w) => w.lastRunAt)
    .sort(
      (a, b) =>
        new Date(b.lastRunAt!).getTime() - new Date(a.lastRunAt!).getTime()
    )
    .slice(0, 5);

  if (sorted.length === 0) {
    return (
      <div className="text-center py-8 text-surface-500">
        <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No workflow runs yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sorted.map((wf) => (
        <div
          key={wf.id}
          className="flex items-center gap-3 p-3 rounded-lg bg-surface-800/50 border border-surface-800"
        >
          <StatusDot status={wf.status} />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-surface-200 truncate">
              {wf.name}
            </div>
            <div className="text-xs text-surface-500 mt-0.5">
              Ran {new Date(wf.lastRunAt!).toLocaleDateString()} at{' '}
              {new Date(wf.lastRunAt!).toLocaleTimeString()}
            </div>
          </div>
          <span className="text-xs text-surface-500">
            {wf.runCount || 0} runs
          </span>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState<WorkflowType[]>([]);
  const [executions, setExecutions] = useState<Execution[]>([]);

  useEffect(() => {
    setWorkflows(getWorkflows());
    setExecutions(getExecutions());
  }, []);

  const totalRuns = workflows.reduce((sum, w) => sum + (w.runCount || 0), 0);
  const activeWorkflows = workflows.filter((w) => w.status === 'active').length;
  const failedExecutions = executions.filter((e) => e.status === 'failed').length;
  const successRate =
    executions.length > 0
      ? Math.round(
          ((executions.length - failedExecutions) / executions.length) * 100
        )
      : 0;

  const handleCreateNew = () => {
    const id = generateId();
    const newWf: WorkflowType = {
      id,
      name: 'Untitled Workflow',
      description: '',
      nodes: [],
      edges: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      runCount: 0,
      status: 'draft',
    };
    saveWorkflow(newWf);
    navigate(`/workflow/${id}`);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-surface-400 mt-1">
            Overview of your workflows and automations
          </p>
        </div>
        <button onClick={handleCreateNew} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Workflow
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Workflow}
          label="Total Workflows"
          value={workflows.length}
          color="#818cf8"
        />
        <StatCard
          icon={Play}
          label="Active Workflows"
          value={activeWorkflows}
          color="#22c55e"
        />
        <StatCard
          icon={TrendingUp}
          label="Total Runs"
          value={totalRuns}
          color="#f59e0b"
        />
        <StatCard
          icon={Activity}
          label="Success Rate"
          value={executions.length > 0 ? `${successRate}%` : '---'}
          color="#06b6d4"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Workflows */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Workflows</h2>
            <button
              onClick={() => navigate('/workflows')}
              className="text-sm text-nexus-400 hover:text-nexus-300"
            >
              View all
            </button>
          </div>
          {workflows.length === 0 ? (
            <div className="text-center py-8">
              <Workflow className="w-10 h-10 text-surface-600 mx-auto mb-3" />
              <p className="text-surface-400 text-sm">No workflows yet</p>
              <button
                onClick={handleCreateNew}
                className="mt-3 btn-primary text-sm"
              >
                Create your first workflow
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {workflows.slice(0, 5).map((wf) => (
                <div
                  key={wf.id}
                  onClick={() => navigate(`/workflow/${wf.id}`)}
                  className="flex items-center gap-3 p-3 rounded-lg bg-surface-800/50 border border-surface-800 hover:bg-surface-800 hover:border-surface-700 transition-all cursor-pointer"
                >
                  <StatusDot status={wf.status} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-surface-200 truncate">
                      {wf.name}
                    </div>
                    <div className="text-xs text-surface-500 mt-0.5">
                      {wf.nodes.length} nodes | Updated{' '}
                      {new Date(wf.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <span className="text-xs text-surface-500">
                    {wf.nodes.length > 0
                      ? `${wf.nodes.length} nodes`
                      : 'Empty'}
                  </span>
                </div>
              ))}
              {workflows.length > 5 && (
                <button
                  onClick={() => navigate('/workflows')}
                  className="w-full text-sm text-nexus-400 hover:text-nexus-300 py-2"
                >
                  Show all {workflows.length} workflows
                </button>
              )}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4">
            Recent Activity
          </h2>
          <RecentActivity workflows={workflows} />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-4">
          Execution Summary
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center p-4 rounded-lg bg-surface-800/50 border border-surface-800">
            <CheckCircle className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
            <div className="text-lg font-bold text-white">
              {executions.filter((e) => e.status === 'completed').length}
            </div>
            <div className="text-xs text-surface-500">Successful</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-surface-800/50 border border-surface-800">
            <XCircle className="w-6 h-6 text-red-400 mx-auto mb-2" />
            <div className="text-lg font-bold text-white">{failedExecutions}</div>
            <div className="text-xs text-surface-500">Failed</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-surface-800/50 border border-surface-800">
            <Activity className="w-6 h-6 text-nexus-400 mx-auto mb-2" />
            <div className="text-lg font-bold text-white">{executions.length}</div>
            <div className="text-xs text-surface-500">Total Executions</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-surface-800/50 border border-surface-800">
            <Clock className="w-6 h-6 text-amber-400 mx-auto mb-2" />
            <div className="text-lg font-bold text-white">
              {workflows.length > 0
                ? workflows.filter((w) => w.nodes.length > 0).length
                : 0}
            </div>
            <div className="text-xs text-surface-500">Built Workflows</div>
          </div>
        </div>
      </div>
    </div>
  );
}
