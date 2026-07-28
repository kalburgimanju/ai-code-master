import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { TeamService } from './team.service';
import { TeamMember } from './team-member.entity';

@Controller('api/team')
export class TeamController {
  constructor(private readonly team: TeamService) {}

  @Post()
  create(@Body() dto: Partial<TeamMember>) {
    return this.team.create(dto);
  }

  @Get()
  findAll() {
    return this.team.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.team.findOne(id);
  }
}
