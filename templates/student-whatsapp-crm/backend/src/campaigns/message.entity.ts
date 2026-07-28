import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export type MessageStatus = 'queued' | 'sent' | 'delivered' | 'failed';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  studentId: string;

  @Column({ nullable: true })
  campaignId?: string;

  @Column({ default: 'queued' })
  status: MessageStatus;

  @Column({ type: 'text', nullable: true })
  body?: string;

  @Column({ nullable: true })
  provider?: string;

  @Column({ nullable: true })
  providerMessageId?: string;

  @Column({ default: false })
  opened: boolean;

  @Column({ default: false })
  replied: boolean;

  @Column({ default: false })
  clicked: boolean;

  @CreateDateColumn()
  sentAt: Date;
}
