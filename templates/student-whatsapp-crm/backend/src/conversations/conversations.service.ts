import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Conversation,
  ConversationMessage,
} from './conversation.entity';
import { Student } from '../students/student.entity';
import { AIProvider } from '../common/providers/ai/ai-provider.interface';
import { ScoringService } from '../scoring/scoring.service';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectRepository(Conversation)
    private readonly convRepo: Repository<Conversation>,
    @InjectRepository(ConversationMessage)
    private readonly msgRepo: Repository<ConversationMessage>,
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    @Inject('AI_PROVIDER') private readonly ai: AIProvider,
    private readonly scoring: ScoringService,
  ) {}

  /** Return all conversations with their latest message for the inbox view. */
  async list(): Promise<Conversation[]> {
    return this.convRepo.find({ order: { lastMessageAt: 'DESC' } });
  }

  async getOrCreate(studentId: string): Promise<Conversation> {
    let conv = await this.convRepo.findOne({ where: { studentId } });
    if (!conv) {
      conv = await this.convRepo.save(this.convRepo.create({ studentId }));
    }
    return conv;
  }

  async messages(conversationId: string): Promise<ConversationMessage[]> {
    return this.msgRepo.find({
      where: { conversationId },
      order: { createdAt: 'ASC' },
    });
  }

  /** Counselor (or student) posts a message to the thread. */
  async addMessage(
    conversationId: string,
    body: string,
    sender: 'student' | 'counselor' | 'ai',
    authorName?: string,
  ): Promise<ConversationMessage> {
    const msg = await this.msgRepo.save(
      this.msgRepo.create({ conversationId, body, sender, authorName }),
    );
    await this.convRepo.update(conversationId, { lastMessageAt: new Date() });
    if (sender === 'student') {
      await this.scoring.recordEvent(
        (await this.convRepo.findOne({ where: { id: conversationId } }))!.studentId,
        'replied',
      );
    }
    return msg;
  }

  /** Generate an AI auto-reply for a student message and append it. */
  async aiReply(conversationId: string, studentMessage: string): Promise<ConversationMessage> {
    const conv = await this.convRepo.findOne({ where: { id: conversationId } });
    if (!conv) throw new Error('Conversation not found');
    const student = await this.studentRepo.findOne({
      where: { id: conv.studentId },
    });
    const answer = await this.ai.answerFAQ(studentMessage, {
      studentName: student?.name,
      course: student?.course,
      city: student?.city,
    });
    return this.addMessage(conversationId, answer, 'ai', 'AI Assistant');
  }
}
