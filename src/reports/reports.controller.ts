import { Controller, Get, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { ReportsService } from './reports.service';

@ApiTags('reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get('trial-balance')
  @ApiQuery({ name: 'asOf', required: false, example: '2026-12-31' })
  trialBalance(@Query('asOf') asOf?: string) {
    return this.reports.trialBalance(asOf ?? new Date().toISOString().slice(0, 10));
  }
}
