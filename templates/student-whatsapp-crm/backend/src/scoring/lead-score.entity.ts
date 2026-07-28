import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type LeadScoreEvent =
  | 'opened'
  | 'clicked'
  | 'replied'
  | 'webinar'
  | 'manual';

@Entity('lead_scores')
export class LeadScore {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  studentId: string;

  @Column({ default: 0 })
  score: number;

  @Column({ nullable: true })
  lastEvent?: LeadScoreEvent;

  @Column({ nullable: true })
  assignedTo?: string;

  @UpdateDateColumn()
  updatedAt: Date;
}
