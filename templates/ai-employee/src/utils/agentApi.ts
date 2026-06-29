import type { AIEmployee } from '../types';

// Simulated API — in production, these would hit your backend
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function createAgent(params: {
  name: string;
  role: string;
  department: string;
  systemPrompt: string;
  knowledgeBase: string;
}): Promise<AIEmployee> {
  await delay(2000);
  return {
    id: `agent-${Date.now()}`,
    name: params.name,
    role: params.role,
    department: params.department,
    avatar: '',
    status: 'active',
    conversations: 0,
    resolutionRate: 95,
    avgResponseTime: '1.2s',
    createdAt: new Date().toISOString(),
    systemPrompt: params.systemPrompt,
    knowledgeBase: params.knowledgeBase,
  };
}

export async function fetchAgents(): Promise<AIEmployee[]> {
  await delay(800);
  return [
    {
      id: 'agent-1',
      name: 'Support Bot',
      role: 'Customer Support',
      department: 'Support',
      avatar: '',
      status: 'active',
      conversations: 1247,
      resolutionRate: 94,
      avgResponseTime: '0.8s',
      createdAt: '2026-05-15T10:00:00Z',
      systemPrompt: '',
      knowledgeBase: '',
    },
    {
      id: 'agent-2',
      name: 'Sales Genie',
      role: 'Sales',
      department: 'Sales',
      avatar: '',
      status: 'active',
      conversations: 832,
      resolutionRate: 89,
      avgResponseTime: '1.1s',
      createdAt: '2026-06-01T10:00:00Z',
      systemPrompt: '',
      knowledgeBase: '',
    },
  ];
}
