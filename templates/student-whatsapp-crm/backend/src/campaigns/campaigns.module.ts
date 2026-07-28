import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CampaignsService } from './campaigns.service';
import { CampaignsController } from './campaigns.controller';
import { Campaign } from './campaign.entity';
import { Message } from './message.entity';
import { Student } from '../students/student.entity';
import { SendConsumer } from './send.consumer';
import { StudentsModule } from '../students/students.module';

@Module({
  imports: [TypeOrmModule.forFeature([Campaign, Message, Student]), StudentsModule],
  controllers: [CampaignsController],
  providers: [CampaignsService, SendConsumer],
  exports: [CampaignsService],
})
export class CampaignsModule {}
