import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export type PaymentStatus = 'created' | 'paid' | 'failed' | 'pending';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  studentId: string;

  @Column({ type: 'float' })
  amount: number;

  @Column({ default: 'INR' })
  currency: string;

  @Column({ default: 'mock' })
  provider: string;

  @Column({ default: 'created' })
  status: PaymentStatus;

  @Column({ nullable: true })
  providerRef?: string;

  @Column({ nullable: true })
  description?: string;

  @CreateDateColumn()
  createdAt: Date;
}
