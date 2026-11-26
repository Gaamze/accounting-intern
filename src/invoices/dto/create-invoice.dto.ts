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


export class CreateInvoiceDto {
  @ApiProperty({ example: 'INV-0001' })
  @IsString()
  @IsNotEmpty()
  number: string;


  @ApiProperty({ example: 'Customer Customer' })
  @IsString()
  @IsNotEmpty()
  customerName: string;


  @ApiProperty({ example: 50000, description: 'Amount in cents (50000 = 500.00)' })
  @IsInt()
  @Min(1)
  amountCents: number;

  

  @ApiProperty({ example: '2026-11-25' })
  @IsDateString()
  issueDate: string;

  @ApiProperty({ example: '2026-12-25' })
  @IsDateString()
  dueDate: string;


}




