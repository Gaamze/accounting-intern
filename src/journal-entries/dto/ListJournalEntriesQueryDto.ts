import {
  IsDateString,
  IsOptional,
} from 'class-validator';

export class ListJournalEntriesQueryDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}