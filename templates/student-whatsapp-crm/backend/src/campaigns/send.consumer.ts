import { Inject, OnModuleInit } from '@nestjs/common';
import { CampaignsService, SEND_JOB } from './campaigns.service';
import { QueuePort } from '../common/queue/queue.interface';

/**
 * Binds the send-message handler to the queue on startup. Works with both the
 * in-memory queue and BullMQ.
 */
export class SendConsumer implements OnModuleInit {
  constructor(
    private readonly campaigns: CampaignsService,
    @Inject('QUEUE') private readonly queue: QueuePort,
  ) {}

  onModuleInit() {
    this.queue.register(SEND_JOB, (data) =>
      this.campaigns.deliverMessage(data as any),
    );
  }
}
