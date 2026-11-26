import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';
export class ReverseJournalEntryDto {
  @ApiProperty({ example: '2026-11-30' })
  @IsDateString()
  date: string;
}