import { ConditionOp, evaluateCondition } from '../scoring/scoring.logic';

export type StepType = 'send' | 'wait' | 'condition' | 'branch' | 'assign' | 'end';

export interface WorkflowStep {
  id: string;
  type: StepType;
  message?: string; // for 'send'
  durationMs?: number; // for 'wait'
  field?: string; // for 'condition' (e.g. 'leadScore')
  op?: ConditionOp; // for 'condition'
  value?: number; // for 'condition'
  then?: string; // for 'branch' / 'condition' true path
  else?: string; // for 'branch' / 'condition' false path
  to?: string; // for 'assign'
}

export interface WorkflowConfig {
  trigger: { type: string };
  steps: WorkflowStep[];
}

export interface ExecutionContext {
  studentId: string;
  leadScore: number;
  city?: string;
  campaignId?: string;
}

/**
 * Pure: given a step and context, return the id of the next step.
 * No I/O — fully unit-testable.
 */
export function nextStep(
  step: WorkflowStep,
  config: WorkflowConfig,
  ctx: ExecutionContext,
): string | null {
  switch (step.type) {
    case 'send':
    case 'wait':
    case 'assign':
    case 'end':
      return nextById(config, step.id);
    case 'condition': {
      const fieldValue = step.field === 'leadScore' ? ctx.leadScore : (ctx as any)[step.field ?? ''];
      const pass = evaluateCondition(Number(fieldValue ?? 0), step.op ?? '>=', step.value ?? 0);
      return pass ? step.then ?? null : step.else ?? null;
    }
    case 'branch':
      return step.then ?? null;
    default:
      return null;
  }
}

function nextById(config: WorkflowConfig, id: string): string | null {
  const idx = config.steps.findIndex((s) => s.id === id);
  if (idx < 0 || idx + 1 >= config.steps.length) return null;
  return config.steps[idx + 1].id;
}

/** Pure: parse + basic structural validation of a workflow config. */
export function parseConfig(json: string): WorkflowConfig {
  const config = JSON.parse(json) as WorkflowConfig;
  if (!config.trigger || !Array.isArray(config.steps) || config.steps.length === 0) {
    throw new Error('Invalid workflow config: requires trigger and non-empty steps');
  }
  return config;
}

/** Pure: find a step by id. */
export function getStep(config: WorkflowConfig, id: string): WorkflowStep | undefined {
  return config.steps.find((s) => s.id === id);
}
