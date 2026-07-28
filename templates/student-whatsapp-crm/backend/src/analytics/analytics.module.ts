import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { Message } from '../campaigns/message.entity';
import { Payment } from '../payments/payment.entity';
import { LeadScore } from '../scoring/lead-score.entity';
import { Student } from '../students/student.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, Payment, LeadScore, Student]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
