import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  Node,
  Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { get, post } from '../api/client';
import { Workflow } from '../types';
import { PageHeader } from '../components/StatCard';
import { Input, Textarea, Button } from '../components/ui';

const STEP_COLORS: Record<string, string> = {
  send: '#6366f1',
  wait: '#f59e0b',
  condition: '#10b981',
  branch: '#10b981',
  assign: '#ec4899',
  end: '#94a3b8',
};

function StepNode({ data }: any) {
  const color = STEP_COLORS[data.type] ?? '#6366f1';
  return (
    <div
      className="px-3 py-2 rounded-lg text-white text-xs shadow"
      style={{ background: color, minWidth: 140 }}
    >
      <Handle type="target" position={Position.Top} />
      <p className="font-semibold uppercase">{data.type}</p>
      <p className="opacity-90">{data.label}</p>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

const nodeTypes = { step: StepNode };

export default function WorkflowsPage() {
  const qc = useQueryClient();
  const [name, setName] = useState('');
  const [json, setJson] = useState(
    JSON.stringify(
      {
        trigger: { type: 'student_imported' },
        steps: [
          { id: 's1', type: 'send', message: 'Welcome {name}!' },
          { id: 's2', type: 'wait', durationMs: 86400000 },
          { id: 's3', type: 'condition', field: 'leadScore', op: '>=', value: 20, then: 's4', else: 's5' },
          { id: 's4', type: 'assign', to: 'counselor_by_city' },
          { id: 's5', type: 'send', message: 'Special offer on {course}!' },
          { id: 's6', type: 'end' },
        ],
      },
      null,
      2,
    ),
  );
  const [runStudent, setRunStudent] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { data } = useQuery({
    queryKey: ['workflows'],
    queryFn: () => get<Workflow[]>('/workflows'),
  });

  const create = useMutation({
    mutationFn: () => post('/workflows', { name, jsonConfig: json }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workflows'] }),
    onError: (e: any) => setError(e?.response?.data?.message ?? 'Invalid config'),
  });

  const run = useMutation({
    mutationFn: (wf: Workflow) => post(`/workflows/${wf.id}/run`, { studentId: runStudent }),
  });

  const graph = useMemo(() => {
    const selected = data?.[0];
    if (!selected) return { nodes: [], edges: [] };
    let config: any;
    try {
      config = JSON.parse(selected.jsonConfig);
    } catch {
      return { nodes: [], edges: [] };
    }
    const nodes: Node[] = config.steps.map((s: any, i: number) => ({
      id: s.id,
      type: 'step',
      position: { x: 80, y: i * 90 },
      data: {
        type: s.type,
        label: s.message ?? s.to ?? `${s.field} ${s.op} ${s.value}`,
      },
    }));
    const edges: Edge[] = [];
    for (let i = 0; i < config.steps.length - 1; i++) {
      const s = config.steps[i];
      if (s.type === 'condition') {
        edges.push({ id: `e-${s.id}-then`, source: s.id, target: s.then, label: 'yes', animated: true });
        if (s.else) edges.push({ id: `e-${s.id}-else`, source: s.id, target: s.else, label: 'no', animated: true });
      } else {
        edges.push({ id: `e-${s.id}`, source: s.id, target: config.steps[i + 1].id, animated: true });
      }
    }
    return { nodes, edges };
  }, [data]);

  return (
    <div>
      <PageHeader title="Workflows" subtitle="Drag-and-drop automation builder" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <h3 className="text-sm font-semibold mb-3">New Workflow</h3>
            <Input
              className="mb-3 w-full"
              placeholder="Workflow name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Textarea
              rows={12}
              value={json}
              onChange={(e) => setJson(e.target.value)}
              className="font-mono text-xs"
            />
            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
            <Button className="mt-3" disabled={!name || create.isPending} onClick={() => create.mutate()}>
              Save Workflow
            </Button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <h3 className="text-sm font-semibold mb-3">Run a Workflow</h3>
            <div className="flex gap-2">
              <Input
                className="flex-1"
                placeholder="Student ID"
                value={runStudent}
                onChange={(e) => setRunStudent(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {(data ?? []).map((wf) => (
                <Button
                  key={wf.id}
                  disabled={!runStudent || run.isPending}
                  onClick={() => run.mutate(wf)}
                >
                  Run: {wf.name}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm h-[480px] overflow-hidden">
          <ReactFlow nodes={graph.nodes} edges={graph.edges} nodeTypes={nodeTypes} fitView>
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}
