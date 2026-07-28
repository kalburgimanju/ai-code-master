import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { StudentStatus } from '../common/student-status';

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  city?: string;

  @Column({ nullable: true })
  course?: string;

  @Column({ nullable: true })
  currentProfession?: string;

  @Column({ nullable: true })
  leadSource?: string;

  @Column({ default: 'New Lead' })
  status: StudentStatus;

  @CreateDateColumn()
  createdAt: Date;
}
