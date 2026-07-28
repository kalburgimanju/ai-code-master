import { Global, Module } from '@nestjs/common';
import { BullMQQueue } from './bullmq-queue';
import { MemoryQueue } from './memory-queue';
import { QueuePort } from './queue.interface';

/**
 * Provides the queue port. Uses BullMQ+Redis when REDIS_URL is configured,
 * otherwise the in-memory queue so the platform runs with no infrastructure.
 */
@Global()
@Module({
  providers: [
    {
      provide: 'QUEUE',
      useFactory: (): QueuePort => {
        const redisUrl = process.env.REDIS_URL;
        if (redisUrl) {
          return new BullMQQueue(redisUrl);
        }
        return new MemoryQueue();
      },
    },
  ],
  exports: ['QUEUE'],
})
export class QueueModule {}
