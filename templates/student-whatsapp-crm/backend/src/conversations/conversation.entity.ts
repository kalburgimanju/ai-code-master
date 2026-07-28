import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export type Sender = 'student' | 'counselor' | 'ai';

@Entity('conversations')
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  studentId: string;

  @Column({ nullable: true })
  assignedTo?: string;

  @Column({ default: 'open' })
  status: string;

  @CreateDateColumn()
  lastMessageAt: Date;
}

@Entity('conversation_messages')
export class ConversationMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  conversationId: string;

  @Column()
  sender: Sender;

  @Column({ type: 'text' })
  body: string;

  @Column({ type: 'text', nullable: true })
  authorName?: string;

  @CreateDateColumn()
  createdAt: Date;
}
