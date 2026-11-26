import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountsModule } from './accounts/accounts.module';
import { DatabaseModule } from './database/database.module';
import { JournalEntriesModule } from './journal-entries/journal-entries.module';
import { ReportsModule } from './reports/reports.module';
import { InvoicesModule } from './invoices/invoices.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: process.env.DB_PATH ?? 'accounting.sqlite',
      autoLoadEntities: true,
      // Auto-creates tables from entities. Fine for learning, NEVER in production (use migrations).
      synchronize: true,
    }),
    DatabaseModule,
    AccountsModule,
    JournalEntriesModule,
    ReportsModule,
    InvoicesModule,
  ],
})
export class AppModule {}
