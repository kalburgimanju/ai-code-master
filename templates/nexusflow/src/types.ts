export type NodeType = 'trigger' | 'agent' | 'action' | 'condition' | 'delay' | 'output';

export interface Position {
  x: number;
  y: number;
}

export interface TriggerConfig {
  triggerType: 'manual' | 'scheduled' | 'webhook';
  schedule?: string;
}

export interface AgentConfig {
  model: string;
  systemPrompt: string;
  userPrompt: string;
  temperature: number;
  maxTokens: number;
}

export interface ActionConfig {
  actionType: 'http' | 'transform';
  url?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers: string; // JSON string
  body?: string;
  transformExpression?: string;
}

export interface ConditionConfig {
  expression: string;
}

export interface DelayConfig {
  duration: number; // seconds
}

export interface OutputConfig {
  outputType: 'log' | 'return';
  message?: string;
}

export interface NodeConfig {
  trigger?: TriggerConfig;
  agent?: AgentConfig;
  action?: ActionConfig;
  condition?: ConditionConfig;
  delay?: DelayConfig;
  output?: OutputConfig;
}

export interface WorkflowNodeData {
  label: string;
  type: NodeType;
  config: NodeConfig;
  icon?: string;
}

export interface WorkflowNode {
  id: string;
  type: string;
  position: Position;
  data: WorkflowNodeData;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  createdAt: string;
  updatedAt: string;
  lastRunAt?: string;
  runCount: number;
  status: 'draft' | 'active' | 'error';
}

export interface ExecutionStep {
  nodeId: string;
  nodeLabel: string;
  nodeType: NodeType;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt?: string;
  completedAt?: string;
  input?: any;
  output?: any;
  error?: string;
}

export interface Execution {
  id: string;
  workflowId: string;
  workflowName: string;
  startedAt: string;
  completedAt?: string;
  status: 'running' | 'completed' | 'failed';
  steps: ExecutionStep[];
  triggerType?: string;
  error?: string;
}

export interface VariableMap {
  [key: string]: any;
}

export interface PaletteItem {
  type: NodeType;
  label: string;
  icon: string;
  color: string;
  description: string;
  defaultConfig: NodeConfig;
}

export const OPENROUTER_DEFAULT_MODELS = [
  { id: 'openai/gpt-4o', name: 'GPT-4o', provider: 'OpenAI' },
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI' },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic' },
  { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku', provider: 'Anthropic' },
  { id: 'google/gemini-2.0-flash-001', name: 'Gemini 2.0 Flash', provider: 'Google' },
  { id: 'google/gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'Google' },
  { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B', provider: 'Meta' },
  { id: 'mistralai/mistral-7b-instruct', name: 'Mistral 7B', provider: 'Mistral' },
  { id: 'deepseek/deepseek-chat', name: 'DeepSeek Chat', provider: 'DeepSeek' },
  { id: 'cohere/command-r-plus', name: 'Command R+', provider: 'Cohere' },
];

export const NODE_PALETTE: PaletteItem[] = [
  {
    type: 'trigger',
    label: 'Trigger',
    icon: 'Zap',
    color: '#f59e0b',
    description: 'Start workflow manually, on schedule, or via webhook',
    defaultConfig: { trigger: { triggerType: 'manual' } },
  },
  {
    type: 'agent',
    label: 'AI Agent',
    icon: 'Brain',
    color: '#818cf8',
    description: 'Run an AI model via OpenRouter with custom prompts',
    defaultConfig: {
      agent: {
        model: 'openai/gpt-4o-mini',
        systemPrompt: 'You are a helpful AI assistant.',
        userPrompt: '{{input}}',
        temperature: 0.7,
        maxTokens: 1024,
      },
    },
  },
  {
    type: 'action',
    label: 'HTTP Request',
    icon: 'Globe',
    color: '#22c55e',
    description: 'Make an HTTP request to any API',
    defaultConfig: {
      action: {
        actionType: 'http',
        url: '',
        method: 'GET',
        headers: '{}',
        body: '',
      },
    },
  },
  {
    type: 'condition',
    label: 'Condition',
    icon: 'GitBranch',
    color: '#f97316',
    description: 'Branch workflow based on a condition',
    defaultConfig: {
      condition: { expression: '{{value}} === true' },
    },
  },
  {
    type: 'delay',
    label: 'Delay',
    icon: 'Clock',
    color: '#06b6d4',
    description: 'Wait for a specified duration before continuing',
    defaultConfig: {
      delay: { duration: 5 },
    },
  },
  {
    type: 'output',
    label: 'Output',
    icon: 'Output',
    color: '#ec4899',
    description: 'Log or return data from the workflow',
    defaultConfig: {
      output: { outputType: 'log', message: 'Workflow completed' },
    },
  },
];
