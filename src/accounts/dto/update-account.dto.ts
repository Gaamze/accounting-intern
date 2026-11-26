import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

/** Only the name can change. Code and type are fixed once entries may reference the account. */
export class UpdateAccountDto {
  @ApiPropertyOptional({ example: 'Cash on hand' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;
}
