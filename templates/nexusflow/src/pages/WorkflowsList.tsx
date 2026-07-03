import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Trash2,
  Play,
  MoreHorizontal,
  FileText,
  Clock,
} from 'lucide-react';
import { getWorkflows, deleteWorkflow, generateId, saveWorkflow } from '../utils/storage';
import { Workflow } from '../types';

function StatusBadge({ status }: { status: Workflow['status'] }) {
  const colors = {
    active: 'badge-success',
    draft: 'badge-draft',
    error: 'badge-error',
  };
  return <span className={colors[status]}>{status}</span>;
}

export default function WorkflowsList() {
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setWorkflows(getWorkflows());
  }, []);

  const handleCreate = () => {
    const id = generateId();
    const newWf: Workflow = {
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

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Delete this workflow?')) {
      deleteWorkflow(id);
      setWorkflows((prev) => prev.filter((w) => w.id !== id));
    }
  };

  const filtered = workflows.filter(
    (w) =>
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Workflows</h1>
          <p className="text-surface-400 mt-1">
            Create and manage your automation workflows
          </p>
        </div>
        <button onClick={handleCreate} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Workflow
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
        <input
          type="text"
          placeholder="Search workflows..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-10"
        />
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="w-12 h-12 text-surface-600 mx-auto mb-4" />
          <p className="text-surface-400 text-lg">
            {search ? 'No workflows match your search' : 'No workflows yet'}
          </p>
          <p className="text-surface-500 text-sm mt-1">
            {search
              ? 'Try a different search term'
              : 'Create your first workflow to get started'}
          </p>
          {!search && (
            <button onClick={handleCreate} className="mt-4 btn-primary">
              Create Workflow
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((wf) => (
            <div
              key={wf.id}
              onClick={() => navigate(`/workflow/${wf.id}`)}
              className="card flex items-start gap-4 hover:bg-surface-800/80 transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-nexus-600/20 flex items-center justify-center shrink-0">
                <Play className="w-5 h-5 text-nexus-400 fill-nexus-400/30" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-white truncate">
                    {wf.name}
                  </h3>
                  <StatusBadge status={wf.status} />
                </div>
                <p className="text-sm text-surface-400 mt-1 line-clamp-1">
                  {wf.description || 'No description'}
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-surface-500">
                  <span>{wf.nodes.length} nodes</span>
                  <span>Created {new Date(wf.createdAt).toLocaleDateString()}</span>
                  {wf.runCount > 0 && (
                    <span className="flex items-center gap-1">
                      <Play className="w-3 h-3" />
                      {wf.runCount} runs
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/workflow/${wf.id}`);
                  }}
                  className="btn-ghost p-2"
                  title="Edit"
                >
                  <Play className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => handleDelete(e, wf.id)}
                  className="btn-ghost p-2 text-red-400 hover:text-red-300"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
