import { Module } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { Invoice } from './entities/invoice.entity';
import { JournalEntriesModule } from '../journal-entries/journal-entries.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from '../accounts/account.entity';


@Module({

imports:[TypeOrmModule.forFeature([Invoice, Account]), JournalEntriesModule],

  controllers: [InvoicesController],
  providers: [InvoicesService],
})
export class InvoicesModule {}
