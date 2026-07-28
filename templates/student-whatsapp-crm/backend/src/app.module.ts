import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { buildDatabaseOptions } from './common/db/database.provider';
import { QueueModule } from './common/queue/queue.module';
import { ProvidersModule } from './common/providers/providers.module';
import { StudentsModule } from './students/students.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { WorkflowsModule } from './workflows/workflows.module';
import { ConversationsModule } from './conversations/conversations.module';
import { TeamModule } from './team/team.module';
import { ScoringModule } from './scoring/scoring.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(buildDatabaseOptions()),
    QueueModule,
    ProvidersModule,
    StudentsModule,
    CampaignsModule,
    WorkflowsModule,
    ConversationsModule,
    TeamModule,
    ScoringModule,
    AnalyticsModule,
    PaymentsModule,
  ],
  providers: [{ provide: APP_PIPE, useClass: ValidationPipe }],
})
export class AppModule {}
