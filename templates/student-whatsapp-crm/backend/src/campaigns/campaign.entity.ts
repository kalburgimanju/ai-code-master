import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export type CampaignStatus = 'draft' | 'active' | 'completed' | 'paused';

@Entity('campaigns')
export class Campaign {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  message?: string;

  @Column({ default: 'draft' })
  status: CampaignStatus;

  @CreateDateColumn()
  createdAt: Date;
}
