import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkflowsService } from './workflows.service';
import { WorkflowsController } from './workflows.controller';
import { Workflow } from './workflow.entity';
import { WorkflowExecutorConsumer } from './workflow-executor.consumer';
import { ScoringModule } from '../scoring/scoring.module';
import { CampaignsModule } from '../campaigns/campaigns.module';
import { StudentsModule } from '../students/students.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workflow]),
    ScoringModule,
    CampaignsModule,
    StudentsModule,
  ],
  controllers: [WorkflowsController],
  providers: [WorkflowsService, WorkflowExecutorConsumer],
  exports: [WorkflowsService],
})
export class WorkflowsModule {}
