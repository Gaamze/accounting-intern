import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './account.entity';
import { JournalLine } from '../journal-entries/journal-line.entity';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
@Module({
  // task3
  imports: [TypeOrmModule.forFeature([Account, JournalLine])],
  controllers: [AccountsController],
  providers: [AccountsService],
  exports: [AccountsService],
})
export class AccountsModule {}

