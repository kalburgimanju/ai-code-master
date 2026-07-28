import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../campaigns/message.entity';
import { Payment } from '../payments/payment.entity';
import { LeadScore } from '../scoring/lead-score.entity';
import { Student } from '../students/student.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(LeadScore)
    private readonly scoreRepo: Repository<LeadScore>,
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
  ) {}

  /** Aggregate the headline metrics for the dashboard. */
  async overview() {
    const messages = await this.messageRepo.find();
    const payments = await this.paymentRepo.find();
    const students = await this.studentRepo.find();

    const sent = messages.length;
    const delivered = messages.filter((m) => m.status === 'delivered' || m.status === 'sent').length;
    const opened = messages.filter((m) => m.opened).length;
    const replied = messages.filter((m) => m.replied).length;
    const clicked = messages.filter((m) => m.clicked).length;
    const enrolled = students.filter((s) => s.status === 'Enrolled').length;
    const paidCount = students.filter((s) => s.status === 'Paid').length;
    const revenue = payments
      .filter((p) => p.status === 'paid' || p.status === 'created')
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      students: students.length,
      messagesSent: sent,
      delivered,
      deliveryRate: sent ? +(delivered / sent).toFixed(2) : 0,
      opened,
      clicked,
      replied,
      responseRate: sent ? +(replied / sent).toFixed(2) : 0,
      enrolled,
      paidCount,
      enrollmentRate: students.length ? +(enrolled / students.length).toFixed(2) : 0,
      revenue: +revenue.toFixed(2),
      avgLeadScore:
        (await this.scoreRepo.find()).reduce((s, r) => s + r.score, 0) /
        (students.length || 1),
    };
  }

  /** Daily message volume for charts. */
  async messagesOverTime() {
    const messages = await this.messageRepo.find();
    const byDay = new Map<string, number>();
    for (const m of messages) {
      const day = new Date(m.sentAt).toISOString().slice(0, 10);
      byDay.set(day, (byDay.get(day) ?? 0) + 1);
    }
    return [...byDay.entries()].map(([date, count]) => ({ date, count }));
  }
}
