import type { AgentType } from '../types';

export interface AgentTask {
  id: string;
  type: AgentType;
  action: string;
  details: string;
  timestamp: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

export abstract class BaseAgent {
  protected intervalId: ReturnType<typeof setInterval> | null = null;
  protected isRunning = false;
  protected tasksCompleted = 0;

  constructor(
    public readonly type: AgentType,
    public readonly name: string,
    protected intervalMs: number
  ) {}

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.intervalId = setInterval(() => this.tick(), this.intervalMs);
    this.tick(); // Run immediately
  }

  stop(): void {
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  protected abstract tick(): Promise<void>;

  getTasksCompleted(): number {
    return this.tasksCompleted;
  }

  getStatus(): 'running' | 'paused' | 'idle' {
    return this.isRunning ? 'running' : 'idle';
  }
}
