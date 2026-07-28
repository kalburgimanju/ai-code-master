import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ConversationsService } from './conversations.service';

@Controller('api/conversations')
export class ConversationsController {
  constructor(private readonly conversations: ConversationsService) {}

  @Get()
  list() {
    return this.conversations.list();
  }

  @Post()
  create(@Body() dto: { studentId: string }) {
    return this.conversations.getOrCreate(dto.studentId);
  }

  @Get(':id/messages')
  messages(@Param('id') id: string) {
    return this.conversations.messages(id);
  }

  @Post(':id/messages')
  add(
    @Param('id') id: string,
    @Body() dto: { body: string; sender: 'student' | 'counselor'; authorName?: string },
  ) {
    return this.conversations.addMessage(id, dto.body, dto.sender, dto.authorName);
  }

  @Post(':id/ai-reply')
  aiReply(@Param('id') id: string, @Body() dto: { message: string }) {
    return this.conversations.aiReply(id, dto.message);
  }
}
