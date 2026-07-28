import {
  getStep,
  nextStep,
  parseConfig,
  WorkflowConfig,
} from '../src/workflows/workflow-engine.service';

const config: WorkflowConfig = {
  trigger: { type: 'student_imported' },
  steps: [
    { id: 's1', type: 'send', message: 'Welcome {name}' },
    { id: 's2', type: 'wait', durationMs: 86400000 },
    { id: 's3', type: 'condition', field: 'leadScore', op: '>=', value: 20, then: 's4', else: 's5' },
    { id: 's4', type: 'assign', to: 'counselor_by_city' },
    { id: 's5', type: 'send', message: 'Offer' },
    { id: 's6', type: 'end' },
  ],
};

describe('Workflow engine', () => {
  it('parses valid config and rejects invalid', () => {
    expect(parseConfig(JSON.stringify(config)).steps.length).toBe(6);
    expect(() => parseConfig(JSON.stringify({ trigger: {}, steps: [] }))).toThrow();
  });

  it('advances sequentially through send/wait/assign steps', () => {
    expect(nextStep(getStep(config, 's1')!, config, { studentId: 'x', leadScore: 0 })).toBe('s2');
    expect(nextStep(getStep(config, 's4')!, config, { studentId: 'x', leadScore: 0 })).toBe('s5');
  });

  it('branches on condition by lead score', () => {
    const high = nextStep(getStep(config, 's3')!, config, { studentId: 'x', leadScore: 30 });
    const low = nextStep(getStep(config, 's3')!, config, { studentId: 'x', leadScore: 5 });
    expect(high).toBe('s4');
    expect(low).toBe('s5');
  });

  it('returns null past the last step', () => {
    expect(nextStep(getStep(config, 's6')!, config, { studentId: 'x', leadScore: 0 })).toBeNull();
  });

  it('finds steps by id', () => {
    expect(getStep(config, 's3')?.type).toBe('condition');
    expect(getStep(config, 'zzz')).toBeUndefined();
  });
});
