import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Campaign, CampaignStatus } from './campaign.entity';
import { Message } from './message.entity';
import { Student } from '../students/student.entity';
import { WhatsAppProvider } from '../common/providers/whatsapp/whatsapp-provider.interface';
import { QueuePort } from '../common/queue/queue.interface';
import { renderTemplate } from './message-template';

export const SEND_JOB = 'send-message';

@Injectable()
export class CampaignsService {
  constructor(
    @InjectRepository(Campaign)
    private readonly campaignRepo: Repository<Campaign>,
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    @Inject('WHATSAPP_PROVIDER') private readonly whatsapp: WhatsAppProvider,
    @Inject('QUEUE') private readonly queue: QueuePort,
  ) {}

  async create(dto: Partial<Campaign>): Promise<Campaign> {
    return this.campaignRepo.save(this.campaignRepo.create(dto));
  }

  async findAll(): Promise<Campaign[]> {
    return this.campaignRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Campaign | null> {
    return this.campaignRepo.findOne({ where: { id } });
  }

  /** Enqueue a broadcast send to every student (optionally filtered by course). */
  async send(id: string, filter?: { course?: string }): Promise<{ queued: number }> {
    const campaign = await this.findOne(id);
    if (!campaign) throw new Error('Campaign not found');
    const where: any = {};
    if (filter?.course) where.course = filter.course;
    const students = await this.studentRepo.find({ where });
    for (const s of students) {
      const body = renderTemplate(campaign.message ?? '', {
        name: s.name,
        course: s.course,
        city: s.city,
      });
      await this.queue.enqueue(SEND_JOB, {
        studentId: s.id,
        campaignId: campaign.id,
        to: s.phone,
        body,
      });
    }
    campaign.status = 'active';
    await this.campaignRepo.save(campaign);
    return { queued: students.length };
  }

  /** Called by the queue consumer: performs the actual WhatsApp send + records it. */
  async deliverMessage(job: {
    studentId: string;
    campaignId?: string;
    to: string;
    body: string;
  }): Promise<void> {
    const result = await this.whatsapp.sendMessage(job.to, job.body);
    await this.messageRepo.save(
      this.messageRepo.create({
        studentId: job.studentId,
        campaignId: job.campaignId,
        status: result.status,
        body: job.body,
        provider: this.whatsapp.name,
        providerMessageId: result.messageId,
        opened: true, // mock provider delivers & is considered seen
      }),
    );
  }

  async findMessages(campaignId?: string): Promise<Message[]> {
    const where: any = {};
    if (campaignId) where.campaignId = campaignId;
    return this.messageRepo.find({ where, order: { sentAt: 'DESC' } });
  }
}
