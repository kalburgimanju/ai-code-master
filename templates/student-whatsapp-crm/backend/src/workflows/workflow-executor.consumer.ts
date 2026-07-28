import { Inject, OnModuleInit } from '@nestjs/common';
import { WorkflowsService, WORKFLOW_STEP_JOB } from './workflows.service';
import { QueuePort } from '../common/queue/queue.interface';

/** Binds the workflow-step handler to the queue on startup. */
export class WorkflowExecutorConsumer implements OnModuleInit {
  constructor(
    private readonly workflows: WorkflowsService,
    @Inject('QUEUE') private readonly queue: QueuePort,
  ) {}

  onModuleInit() {
    this.queue.register(WORKFLOW_STEP_JOB, (data) =>
      this.workflows.executeStep(data as any),
    );
  }
}
