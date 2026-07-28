export interface JobPayload {
  name: string;
  data: Record<string, any>;
}

export type JobHandler = (data: Record<string, any>) => Promise<void> | void;

/**
 * Queue port. Implementations:
 * - MemoryQueue: in-process, no Redis (dev/demo). Default when REDIS_URL unset.
 * - BullMQQueue: Redis-backed (production). Used when REDIS_URL set.
 */
export interface QueuePort {
  register(name: string, handler: JobHandler): void;
  enqueue(name: string, data: Record<string, any>): Promise<void>;
  schedule(name: string, data: Record<string, any>, delayMs: number): Promise<void>;
  close(): Promise<void>;
}
