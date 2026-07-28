import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workflow } from './workflow.entity';
import {
  ExecutionContext,
  getStep,
  nextStep,
  parseConfig,
  WorkflowConfig,
  WorkflowStep,
} from './workflow-engine.service';
import { QueuePort } from '../common/queue/queue.interface';
import { WhatsAppProvider } from '../common/providers/whatsapp/whatsapp-provider.interface';
import { ScoringService } from '../scoring/scoring.service';
import { StudentsService } from '../students/students.service';
import { renderTemplate } from '../campaigns/message-template';
import { SEND_JOB } from '../campaigns/campaigns.service';

export const WORKFLOW_STEP_JOB = 'workflow-step';

@Injectable()
export class WorkflowsService {
  constructor(
    @InjectRepository(Workflow)
    private readonly workflowRepo: Repository<Workflow>,
    @Inject('QUEUE') private readonly queue: QueuePort,
    @Inject('WHATSAPP_PROVIDER') private readonly whatsapp: WhatsAppProvider,
    private readonly scoring: ScoringService,
    private readonly students: StudentsService,
  ) {}

  async create(dto: { name: string; jsonConfig: string }): Promise<Workflow> {
    parseConfig(dto.jsonConfig); // validate on save
    return this.workflowRepo.save(this.workflowRepo.create(dto));
  }

  async update(id: string, jsonConfig: string): Promise<Workflow> {
    const wf = await this.workflowRepo.findOne({ where: { id } });
    if (!wf) throw new Error('Workflow not found');
    parseConfig(jsonConfig);
    wf.jsonConfig = jsonConfig;
    return this.workflowRepo.save(wf);
  }

  async findAll(): Promise<Workflow[]> {
    return this.workflowRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Workflow | null> {
    return this.workflowRepo.findOne({ where: { id } });
  }

  /** Trigger a workflow for a single student, starting at the first step. */
  async run(workflowId: string, studentId: string): Promise<{ started: boolean }> {
    const wf = await this.findOne(workflowId);
    if (!wf) throw new Error('Workflow not found');
    const config = parseConfig(wf.jsonConfig);
    const student = await this.students.findOne(studentId);
    const scoreRow = await this.scoring.getScore(studentId);
    const ctx: ExecutionContext = {
      studentId,
      leadScore: scoreRow?.score ?? 0,
      city: student?.city,
      campaignId: undefined,
    };
    const first = config.steps[0];
    await this.queue.enqueue(WORKFLOW_STEP_JOB, {
      workflowId,
      stepId: first.id,
      ctx,
    });
    return { started: true };
  }

  /** Executes one step and schedules the next. Called by the queue consumer. */
  async executeStep(job: {
    workflowId: string;
    stepId: string;
    ctx: ExecutionContext;
  }): Promise<void> {
    const wf = await this.findOne(job.workflowId);
    if (!wf) return;
    const config = parseConfig(wf.jsonConfig);
    const step = getStep(config, job.stepId);
    if (!step) return;
    const student = await this.students.findOne(job.ctx.studentId);

    switch (step.type) {
      case 'send': {
        const body = renderTemplate(step.message ?? '', {
          name: student?.name,
          course: student?.course,
          city: student?.city,
        });
        await this.queue.enqueue(SEND_JOB, {
          studentId: job.ctx.studentId,
          campaignId: job.ctx.campaignId,
          to: student?.phone ?? '',
          body,
        });
        break;
      }
      case 'assign': {
        if (step.to === 'counselor_by_city') {
          await this.scoring.autoAssign(job.ctx.studentId, job.ctx.city);
        }
        break;
      }
      case 'wait': {
        const next = nextStep(step, config, job.ctx);
        if (next) {
          await this.queue.schedule(
            WORKFLOW_STEP_JOB,
            { workflowId: job.workflowId, stepId: next, ctx: job.ctx },
            step.durationMs ?? 0,
          );
        }
        return; // do not fall through to sequential next
      }
      default:
        break;
    }

    const next = nextStep(step, config, job.ctx);
    if (next) {
      await this.queue.enqueue(WORKFLOW_STEP_JOB, {
        workflowId: job.workflowId,
        stepId: next,
        ctx: job.ctx,
      });
    }
  }
}
