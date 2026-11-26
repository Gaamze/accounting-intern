import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from '../accounts/account.entity';
import { AccountType } from '../accounts/account-type.enum';

/** Inserts a small default chart of accounts the first time the app starts. */
@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(@InjectRepository(Account) private readonly accounts: Repository<Account>) {}

  async onApplicationBootstrap() {
    if ((await this.accounts.count()) > 0) return;

    await this.accounts.save([
      { code: '1000', name: 'Cash', type: AccountType.ASSET },
      { code: '1100', name: 'Accounts Receivable', type: AccountType.ASSET },
      { code: '2000', name: 'Accounts Payable', type: AccountType.LIABILITY },
      { code: '3000', name: "Owner's Equity", type: AccountType.EQUITY },
      { code: '4000', name: 'Sales Revenue', type: AccountType.REVENUE },
      { code: '5000', name: 'Rent Expense', type: AccountType.EXPENSE },
      { code: '5100', name: 'Salaries Expense', type: AccountType.EXPENSE },
    ]);
    this.logger.log('Seeded default chart of accounts');
  }
}
