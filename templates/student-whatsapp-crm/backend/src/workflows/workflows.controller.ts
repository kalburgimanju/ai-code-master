import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { WorkflowsService } from './workflows.service';

@Controller('api/workflows')
export class WorkflowsController {
  constructor(private readonly workflows: WorkflowsService) {}

  @Post()
  create(@Body() dto: { name: string; jsonConfig: string }) {
    return this.workflows.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: { jsonConfig: string }) {
    return this.workflows.update(id, dto.jsonConfig);
  }

  @Get()
  findAll() {
    return this.workflows.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workflows.findOne(id);
  }

  @Post(':id/run')
  run(@Param('id') id: string, @Body() dto: { studentId: string }) {
    return this.workflows.run(id, dto.studentId);
  }
}
