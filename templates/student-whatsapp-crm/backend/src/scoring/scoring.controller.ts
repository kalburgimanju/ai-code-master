import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ScoringService } from './scoring.service';
import { LeadScoreEvent } from './lead-score.entity';

@Controller('api/scoring')
export class ScoringController {
  constructor(private readonly scoring: ScoringService) {}

  @Get(':studentId')
  async get(@Param('studentId') studentId: string) {
    return this.scoring.getScore(studentId);
  }

  @Post(':studentId/event')
  async record(
    @Param('studentId') studentId: string,
    @Query('event') event: LeadScoreEvent,
  ) {
    return this.scoring.recordEvent(studentId, event);
  }

  @Post(':studentId/assign')
  async assign(
    @Param('studentId') studentId: string,
    @Query('city') city: string,
  ) {
    const assigned = await this.scoring.autoAssign(studentId, city);
    return { studentId, assignedTo: assigned };
  }
}
