import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('api/payments')
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Post()
  create(
    @Body()
    dto: { studentId: string; amount: number; currency?: string; description?: string },
  ) {
    return this.payments.create(dto);
  }

  @Get()
  findAll() {
    return this.payments.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.payments.findOne(id);
  }
}
