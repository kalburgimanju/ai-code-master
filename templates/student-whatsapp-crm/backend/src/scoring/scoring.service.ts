import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeadScore, LeadScoreEvent } from './lead-score.entity';
import {
  applyEvent,
  assignByCity,
  ConditionOp,
  evaluateCondition,
} from './scoring.logic';
import { TeamMember } from '../team/team-member.entity';

@Injectable()
export class ScoringService {
  constructor(
    @InjectRepository(LeadScore)
    private readonly leadScoreRepo: Repository<LeadScore>,
    @InjectRepository(TeamMember)
    private readonly teamRepo: Repository<TeamMember>,
  ) {}

  /** Record an engagement event and update the cumulative score. */
  async recordEvent(studentId: string, event: LeadScoreEvent): Promise<LeadScore> {
    let row = await this.leadScoreRepo.findOne({ where: { studentId } });
    if (!row) {
      row = this.leadScoreRepo.create({ studentId, score: 0 });
    }
    row.score = applyEvent(row.score, event);
    row.lastEvent = event;
    return this.leadScoreRepo.save(row);
  }

  async getScore(studentId: string): Promise<LeadScore | null> {
    return this.leadScoreRepo.findOne({ where: { studentId } });
  }

  /** Auto-assign a counselor to a student based on the student's city. */
  async autoAssign(studentId: string, city?: string): Promise<string | undefined> {
    const counselors = await this.teamRepo.find();
    const assigned = assignByCity(city, counselors);
    const row = await this.leadScoreRepo.findOne({ where: { studentId } });
    if (row) {
      row.assignedTo = assigned;
      await this.leadScoreRepo.save(row);
    }
    return assigned;
  }

  /** Evaluate a workflow condition against a student's current score. */
  async evaluateScoreCondition(
    studentId: string,
    op: ConditionOp,
    target: number,
  ): Promise<boolean> {
    const row = await this.getScore(studentId);
    return evaluateCondition(row?.score ?? 0, op, target);
  }
}
