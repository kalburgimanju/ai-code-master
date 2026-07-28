import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export type WorkflowStatus = 'draft' | 'active' | 'paused';

@Entity('workflows')
export class Workflow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text' })
  jsonConfig: string;

  @Column({ default: 'draft' })
  status: WorkflowStatus;

  @CreateDateColumn()
  createdAt: Date;
}
