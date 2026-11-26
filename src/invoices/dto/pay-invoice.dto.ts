import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsDateString} from 'class-validator';


export class PayInvoiceDto {
  @ApiPropertyOptional({ example: '2026-12-01', description: 'Defaults to today' })
  @IsOptional()
  @IsDateString()
  paymentDate?: string;
}
