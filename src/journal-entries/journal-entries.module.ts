import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from '../accounts/account.entity';
import { JournalEntriesController } from './journal-entries.controller';
import { JournalEntriesService } from './journal-entries.service';
import { JournalEntry } from './journal-entry.entity';
import { JournalLine } from './journal-line.entity';

@Module({
  imports: [TypeOrmModule.forFeature([JournalEntry, JournalLine, Account])],
  controllers: [JournalEntriesController],
  providers: [JournalEntriesService],
  exports: [JournalEntriesService],
})
export class JournalEntriesModule {}
