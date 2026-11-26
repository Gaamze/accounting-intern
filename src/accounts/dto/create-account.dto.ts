import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, Matches } from 'class-validator';
import { AccountType } from '../account-type.enum';

export class CreateAccountDto {
  @ApiProperty({ example: '1000' })
  @Matches(/^\d{4}$/, { message: 'code must be exactly 4 digits' })
  code: string;

  @ApiProperty({ example: 'Cash' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: AccountType })
  @IsEnum(AccountType)
  type: AccountType;
}
