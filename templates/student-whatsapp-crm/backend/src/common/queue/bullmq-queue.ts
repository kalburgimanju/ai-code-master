import { Queue, Worker } from 'bullmq';
import { Redis } from 'ioredis';
import { JobHandler, QueuePort } from './queue.interface';

/**
 * Redis-backed queue for production. Active only when REDIS_URL is set.
 */
export class BullMQQueue implements QueuePort {
  private queue: Queue;
  private workers: Worker[] = [];
  private connection: Redis;

  constructor(redisUrl: string) {
    this.connection = new Redis(redisUrl, { maxRetriesPerRequest: null });
    this.queue = new Queue('crm', { connection: this.connection });
  }

  register(name: string, handler: JobHandler): void {
    const worker = new Worker(
      'crm',
      async (job) => {
        if (job.name === name) {
          await handler(job.data);
        }
      },
      { connection: this.connection },
    );
    this.workers.push(worker);
  }

  async enqueue(name: string, data: Record<string, any>): Promise<void> {
    await this.queue.add(name, data);
  }

  async schedule(name: string, data: Record<string, any>, delayMs: number): Promise<void> {
    await this.queue.add(name, data, { delay: delayMs });
  }

  async close(): Promise<void> {
    await Promise.all(this.workers.map((w) => w.close()));
    await this.queue.close();
    this.connection.disconnect();
  }
}
