import { Workflow, Execution } from '../types';

const STORAGE_PREFIX = 'nexusflow_';

export function getWorkflows(): Workflow[] {
  try {
    const data = localStorage.getItem(`${STORAGE_PREFIX}workflows`);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function getWorkflow(id: string): Workflow | null {
  const workflows = getWorkflows();
  return workflows.find((w) => w.id === id) ?? null;
}

export function saveWorkflow(workflow: Workflow): void {
  const workflows = getWorkflows();
  const index = workflows.findIndex((w) => w.id === workflow.id);
  if (index >= 0) {
    workflows[index] = { ...workflow, updatedAt: new Date().toISOString() };
  } else {
    workflows.push({
      ...workflow,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      runCount: 0,
      status: 'draft',
    });
  }
  localStorage.setItem(`${STORAGE_PREFIX}workflows`, JSON.stringify(workflows));
}

export function deleteWorkflow(id: string): void {
  const workflows = getWorkflows().filter((w) => w.id !== id);
  localStorage.setItem(`${STORAGE_PREFIX}workflows`, JSON.stringify(workflows));
}

export function getExecutions(workflowId?: string): Execution[] {
  try {
    const data = localStorage.getItem(`${STORAGE_PREFIX}executions`);
    const executions: Execution[] = data ? JSON.parse(data) : [];
    if (workflowId) {
      return executions.filter((e) => e.workflowId === workflowId);
    }
    return executions;
  } catch {
    return [];
  }
}

export function saveExecution(execution: Execution): void {
  const executions = getExecutions();
  const index = executions.findIndex((e) => e.id === execution.id);
  if (index >= 0) {
    executions[index] = execution;
  } else {
    executions.unshift(execution);
  }
  localStorage.setItem(
    `${STORAGE_PREFIX}executions`,
    JSON.stringify(executions.slice(0, 50))
  );
}

export function getSettings(): { openRouterKey: string } {
  try {
    const data = localStorage.getItem(`${STORAGE_PREFIX}settings`);
    return data
      ? JSON.parse(data)
      : { openRouterKey: '' };
  } catch {
    return { openRouterKey: '' };
  }
}

export function saveSettings(settings: { openRouterKey: string }): void {
  localStorage.setItem(`${STORAGE_PREFIX}settings`, JSON.stringify(settings));
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
