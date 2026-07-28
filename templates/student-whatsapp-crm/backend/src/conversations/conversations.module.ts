import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationsService } from './conversations.service';
import { ConversationsController } from './conversations.controller';
import {
  Conversation,
  ConversationMessage,
} from './conversation.entity';
import { Student } from '../students/student.entity';
import { ScoringModule } from '../scoring/scoring.module';

@Module({
  imports: [TypeOrmModule.forFeature([Conversation, ConversationMessage, Student]), ScoringModule],
  controllers: [ConversationsController],
  providers: [ConversationsService],
  exports: [ConversationsService],
})
export class ConversationsModule {}
