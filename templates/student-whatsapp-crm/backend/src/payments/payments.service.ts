import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './payment.entity';
import { PaymentProvider } from '../common/providers/payment/payment-provider.interface';
import { StudentsService } from '../students/students.service';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    @Inject('PAYMENT_PROVIDER') private readonly provider: PaymentProvider,
    private readonly students: StudentsService,
  ) {}

  /** Create a payment via the configured provider and store the record. */
  async create(dto: {
    studentId: string;
    amount: number;
    currency?: string;
    description?: string;
  }): Promise<Payment> {
    const student = await this.students.findOne(dto.studentId);
    const result = await this.provider.createPayment({
      studentId: dto.studentId,
      amount: dto.amount,
      currency: dto.currency ?? 'INR',
    });
    const payment = this.paymentRepo.create({
      studentId: dto.studentId,
      amount: dto.amount,
      currency: dto.currency ?? 'INR',
      provider: this.provider.name,
      providerRef: result.providerRef,
      status: result.status,
      description: dto.description ?? student?.course,
    });
    return this.paymentRepo.save(payment);
  }

  async findAll(): Promise<Payment[]> {
    return this.paymentRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Payment | null> {
    return this.paymentRepo.findOne({ where: { id } });
  }
}
