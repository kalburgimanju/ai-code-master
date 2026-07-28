import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScoringService } from './scoring.service';
import { ScoringController } from './scoring.controller';
import { LeadScore } from './lead-score.entity';
import { TeamMember } from '../team/team-member.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LeadScore, TeamMember])],
  controllers: [ScoringController],
  providers: [ScoringService],
  exports: [ScoringService],
})
export class ScoringModule {}
