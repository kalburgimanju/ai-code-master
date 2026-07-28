import { JobHandler, QueuePort, JobPayload } from './queue.interface';

/**
 * In-process queue with no external dependencies. Delayed jobs use setTimeout.
 * Used for local dev/demo where Redis is unavailable.
 */
export class MemoryQueue implements QueuePort {
  private handlers = new Map<string, JobHandler>();

  register(name: string, handler: JobHandler): void {
    this.handlers.set(name, handler);
  }

  async enqueue(name: string, data: Record<string, any>): Promise<void> {
    await this.dispatch(name, data);
  }

  async schedule(name: string, data: Record<string, any>, delayMs: number): Promise<void> {
    setTimeout(() => {
      void this.dispatch(name, data);
    }, delayMs);
  }

  private async dispatch(name: string, data: Record<string, any>): Promise<void> {
    const handler = this.handlers.get(name);
    if (!handler) {
      // No handler registered yet (e.g. consumer not bound). Store-and-retry would
      // be needed in prod; for demo we log and drop.
      console.warn(`[memory-queue] no handler for job "${name}"`);
      return;
    }
    try {
      await handler(data);
    } catch (err) {
      console.error(`[memory-queue] handler for "${name}" failed:`, err);
    }
  }

  async close(): Promise<void> {
    this.handlers.clear();
  }
}
