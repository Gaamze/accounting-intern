import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class JournalLineDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  accountId: number;

  @ApiProperty({ example: 50000, description: 'Amount in cents (50000 = 500.00)' })
  @IsInt()
  @Min(0)
  debitCents: number;

  @ApiProperty({ example: 0, description: 'Amount in cents' })
  @IsInt()
  @Min(0)
  creditCents: number;
}

export class CreateJournalEntryDto {
  @ApiProperty({ example: '2026-11-24' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: 'Owner invests cash into the business' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ example: 'INV-0001' })
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiProperty({ type: [JournalLineDto] })
  @ValidateNested({ each: true })
  @Type(() => JournalLineDto)
  @ArrayMinSize(2)
  lines: JournalLineDto[];
}
