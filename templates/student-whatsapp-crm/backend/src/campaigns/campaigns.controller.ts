import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';

@Controller('api/campaigns')
export class CampaignsController {
  constructor(private readonly campaigns: CampaignsService) {}

  @Post()
  create(@Body() dto: { name: string; message?: string }) {
    return this.campaigns.create(dto);
  }

  @Get()
  findAll() {
    return this.campaigns.findAll();
  }

  @Get(':id/messages')
  messages(@Param('id') id: string) {
    return this.campaigns.findMessages(id);
  }

  @Post(':id/send')
  send(@Param('id') id: string, @Query('course') course?: string) {
    return this.campaigns.send(id, { course });
  }
}
