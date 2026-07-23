export type NodeType = 'trigger' | 'ai_model' | 'content' | 'social' | 'action';

export interface Port {
  id: string;
  label: string;
  direction: 'input' | 'output';
}

export interface NodeDefinition {
  type: NodeType;
  subtype: string;
  label: string;
  icon: string;
  color: string;
  gradient: string;
  description: string;
  inputs: Port[];
  outputs: Port[];
  config: Record<string, { label: string; type: 'text' | 'select' | 'textarea' | 'number' | 'toggle'; options?: string[]; default: any }>;
}

export interface FlowNode {
  id: string;
  type: NodeType;
  subtype: string;
  label: string;
  x: number;
  y: number;
  config: Record<string, any>;
  status: 'idle' | 'pending' | 'running' | 'done' | 'error';
  error?: string;
}

export interface FlowEdge {
  id: string;
  fromNodeId: string;
  fromPortId: string;
  toNodeId: string;
  toPortId: string;
}

export interface Flow {
  id: string;
  name: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  status: 'draft' | 'running' | 'completed' | 'error';
  createdAt: string;
  updatedAt: string;
}

export const NODE_CATEGORIES: { label: string; type: NodeType; color: string }[] = [
  { label: 'Triggers', type: 'trigger', color: 'from-amber-500 to-orange-500' },
  { label: 'AI Models', type: 'ai_model', color: 'from-purple-500 to-pink-500' },
  { label: 'Content Tools', type: 'content', color: 'from-cyan-500 to-blue-500' },
  { label: 'Social Media', type: 'social', color: 'from-blue-500 to-indigo-500' },
  { label: 'Actions', type: 'action', color: 'from-green-500 to-emerald-500' },
];
