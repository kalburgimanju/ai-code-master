import {
  Workflow,
  WorkflowNode,
  WorkflowEdge,
  Execution,
  ExecutionStep,
  NodeConfig,
  VariableMap,
} from '../types';
import { callOpenRouter } from './openRouter';
import { getSettings, saveExecution, generateId, saveWorkflow } from './storage';

function getNodeById(nodes: WorkflowNode[], id: string): WorkflowNode | undefined {
  return nodes.find((n) => n.id === id);
}

function getOutgoingEdges(edges: WorkflowEdge[], nodeId: string): WorkflowEdge[] {
  return edges.filter((e) => e.source === nodeId);
}

function getIncomingEdges(edges: WorkflowEdge[], nodeId: string): WorkflowEdge[] {
  return edges.filter((e) => e.target === nodeId);
}

// Simple template engine: replace {{path.to.value}} with actual values
function interpolateVariables(template: string, vars: VariableMap): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (_, path) => {
    const keys = (path as string).trim().split('.');
    let value: any = vars;
    for (const key of keys) {
      if (value == null || typeof value !== 'object') return `{{${path}}}`;
      value = value[key];
    }
    return value != null ? String(value) : `{{${path}}}`;
  });
}

function evaluateCondition(expression: string, vars: VariableMap): boolean {
  try {
    // Replace {{variables}} with actual values, then evaluate
    const compiled = expression.replace(/\{\{([^}]+)\}\}/g, (_, path) => {
      const keys = (path as string).trim().split('.');
      let value: any = vars;
      for (const key of keys) {
        if (value == null || typeof value !== 'object') return 'undefined';
        value = value[key];
      }
      if (typeof value === 'string') return JSON.stringify(value);
      return String(value ?? 'undefined');
    });
    // Safe evaluation using Function constructor
    return new Function(`return (${compiled});`)();
  } catch {
    return false;
  }
}

async function executeNode(
  node: WorkflowNode,
  inputVars: VariableMap,
  apiKey: string,
  onLog: (step: Partial<ExecutionStep>) => void
): Promise<{ output: VariableMap; success: boolean; error?: string }> {
  const config = node.data.config;
  const output: VariableMap = {};
  const now = () => new Date().toISOString();

  onLog({
    nodeId: node.id,
    status: 'running',
    startedAt: now(),
    input: { ...inputVars },
  });

  try {
    switch (node.data.type) {
      case 'trigger': {
        // Triggers just pass through input
        Object.assign(output, inputVars);
        break;
      }

      case 'agent': {
        if (!apiKey) {
          throw new Error('OpenRouter API key not configured. Add it in Settings.');
        }
        const agent = config.agent!;
        const systemPrompt = interpolateVariables(agent.systemPrompt, inputVars);
        const userPrompt = interpolateVariables(agent.userPrompt, inputVars);

        const response = await callOpenRouter(apiKey, {
          model: agent.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: agent.temperature,
          max_tokens: agent.maxTokens,
        });

        output.result = response;
        output.model = agent.model;
        break;
      }

      case 'action': {
        const action = config.action!;
        if (action.actionType === 'http') {
          const url = interpolateVariables(action.url || '', inputVars);
          const body = action.body
            ? interpolateVariables(action.body, inputVars)
            : undefined;
          let headers: Record<string, string> = {};
          try {
            headers = JSON.parse(action.headers || '{}');
          } catch {}

          const fetchOptions: RequestInit = {
            method: action.method || 'GET',
            headers: {
              'Content-Type': 'application/json',
              ...headers,
            },
          };

          if (body && action.method !== 'GET') {
            fetchOptions.body = body;
          }

          const response = await fetch(url, fetchOptions);
          const contentType = response.headers.get('content-type') || '';
          const responseData = contentType.includes('application/json')
            ? await response.json()
            : await response.text();

          output.statusCode = response.status;
          output.response = responseData;
          output.headers = Object.fromEntries(response.headers.entries());
        } else if (action.actionType === 'transform') {
          // Transform evaluates a JavaScript expression with input vars
          try {
            const expr = interpolateVariables(
              action.transformExpression || '{{input}}',
              inputVars
            );
            output.result = new Function('vars', `with(vars) { return (${expr}); }`)(
              inputVars
            );
          } catch (e: any) {
            throw new Error(`Transform error: ${e.message}`);
          }
        }
        break;
      }

      case 'condition': {
        const condition = config.condition!;
        const expr = interpolateVariables(condition.expression, inputVars);
        const result = evaluateCondition(expr, inputVars);
        output.condition = result;
        output.conditionExpression = expr;
        break;
      }

      case 'delay': {
        const delay = config.delay!;
        await new Promise((resolve) => setTimeout(resolve, delay.duration * 1000));
        output.elapsed = delay.duration;
        Object.assign(output, inputVars);
        break;
      }

      case 'output': {
        const out = config.output!;
        const msg = out.message ? interpolateVariables(out.message, inputVars) : '';
        output.message = msg;
        output.data = inputVars;
        if (out.outputType === 'log') {
          console.log('[NexusFlow Output]', msg, inputVars);
        }
        break;
      }
    }

    onLog({
      nodeId: node.id,
      status: 'completed',
      completedAt: now(),
      output: { ...output },
    });

    return { output, success: true };
  } catch (error: any) {
    const errorMsg = error.message || 'Unknown error';
    onLog({
      nodeId: node.id,
      status: 'failed',
      completedAt: now(),
      error: errorMsg,
    });
    return { output, success: false, error: errorMsg };
  }
}

function topologicalSort(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): WorkflowNode[] {
  const inDegree: Record<string, number> = {};
  const adjacency: Record<string, string[]> = {};

  for (const node of nodes) {
    inDegree[node.id] = 0;
    adjacency[node.id] = [];
  }

  for (const edge of edges) {
    if (adjacency[edge.source]) {
      adjacency[edge.source].push(edge.target);
    }
    if (inDegree[edge.target] !== undefined) {
      inDegree[edge.target]++;
    }
  }

  const queue: string[] = [];
  for (const [id, deg] of Object.entries(inDegree)) {
    if (deg === 0) queue.push(id);
  }

  const sorted: WorkflowNode[] = [];
  while (queue.length > 0) {
    const id = queue.shift()!;
    const node = getNodeById(nodes, id);
    if (node) sorted.push(node);

    for (const neighbor of adjacency[id] || []) {
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) queue.push(neighbor);
    }
  }

  return sorted;
}

export async function executeWorkflow(
  workflow: Workflow,
  triggerInput: VariableMap = {},
  onStepUpdate?: (step: ExecutionStep, allSteps: ExecutionStep[]) => void
): Promise<Execution> {
  const settings = getSettings();
  const apiKey = settings.openRouterKey;

  const execution: Execution = {
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

  saveExecution(execution);

  // Also update workflow's last run info
  workflow.lastRunAt = execution.startedAt;
  workflow.runCount = (workflow.runCount || 0) + 1;
  saveWorkflow(workflow);

  const sortedNodes = topologicalSort(workflow.nodes, workflow.edges);
  let currentVars: VariableMap = { input: triggerInput, ...triggerInput };
  let allSuccess = true;

  for (const node of sortedNodes) {
    // Update step to running
    execution.steps = execution.steps.map((s) =>
      s.nodeId === node.id
        ? {
            ...s,
            status: 'running',
            startedAt: new Date().toISOString(),
            input: { ...currentVars },
          }
        : s
    );
    onStepUpdate?.(
      execution.steps.find((s) => s.nodeId === node.id)!,
      execution.steps
    );

    const result = await executeNode(node, currentVars, apiKey, (stepUpdate) => {
      execution.steps = execution.steps.map((s) =>
        s.nodeId === stepUpdate.nodeId ? { ...s, ...stepUpdate } : s
      );
      onStepUpdate?.(
        execution.steps.find((s) => s.nodeId === node.id)!,
        execution.steps
      );
    });

    if (!result.success) {
      allSuccess = false;
      break;
    }

    // For condition nodes, propagate the condition result and route-only
    if (node.data.type === 'condition') {
      currentVars = {
        ...currentVars,
        [`${node.id}.condition`]: result.output.condition,
      };
    } else {
      currentVars = {
        ...currentVars,
        [`${node.id}.output`]: result.output,
      };
    }
  }

  execution.status = allSuccess ? 'completed' : 'failed';
  execution.completedAt = new Date().toISOString();
  execution.steps = execution.steps.map((s) =>
    s.status === 'running'
      ? { ...s, status: allSuccess ? 'completed' : 'failed', completedAt: new Date().toISOString() }
      : s
  );

  saveExecution(execution);

  // Update workflow status
  workflow.status = allSuccess ? 'active' : 'error';
  saveWorkflow(workflow);

  onStepUpdate?.(
    execution.steps.find((s) => s.nodeId === sortedNodes[sortedNodes.length - 1]?.id)!,
    execution.steps
  );

  return execution;
}

export function getWorkflowInputSchema(workflow: Workflow): string[] {
  // Extract input variable names from node configs
  const triggerNode = workflow.nodes.find((n) => n.data.type === 'trigger');
  if (!triggerNode) return [];

  const triggerConfig = triggerNode.data.config.trigger;
  if (triggerConfig?.triggerType === 'webhook') {
    return ['payload', 'headers', 'query'];
  }

  return ['input'];
}
