import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from './account.entity';
import { AccountType } from './account-type.enum';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { JournalLine } from '../journal-entries/journal-line.entity';
import { NORMAL_BALANCE } from './account-type.enum';


@Injectable()
export class AccountsService {
  constructor(@InjectRepository(Account) private readonly repo: Repository<Account>,
              @InjectRepository(JournalLine) private readonly journalLines: Repository<JournalLine>) {}

  async create(dto: CreateAccountDto): Promise<Account> {
    const exists = await this.repo.findOne({ where: { code: dto.code } });
    if (exists) throw new ConflictException(`Account with code ${dto.code} already exists`);
    return this.repo.save(this.repo.create(dto));
  }

  findAll(type?: AccountType): Promise<Account[]> {
    return this.repo.find({ where: type ? { type } : {}, order: { code: 'ASC' } });
  }

  async findOne(id: number): Promise<Account> {
    const account = await this.repo.findOne({ where: { id } });
    if (!account) throw new NotFoundException(`Account ${id} not found`);
    return account;
  }

  // task3
  async getBalance (id: number)
  {
    const account =await this.findOne(id);
    const totals = await this.journalLines
    .createQueryBuilder('line')
    .select('COALESCE(SUM(line.debitCents), 0)', 'totalDebitCents')
    .addSelect('COALESCE(SUM(line.creditCents), 0)', 'totalCreditCents')
    .where('line.accountId = :id', { id })
    .getRawOne();

    const totalDebitCents = Number(totals.totalDebitCents);
  const totalCreditCents = Number(totals.totalCreditCents);

  const normalSide = NORMAL_BALANCE[account.type];

  const balanceCents =
    normalSide === 'DEBIT'
      ? totalDebitCents - totalCreditCents
      : totalCreditCents - totalDebitCents;

      return {
    account,
    totalDebitCents,
    totalCreditCents,
    normalSide,
    balanceCents,
  };

  }


  async update(id: number, dto: UpdateAccountDto): Promise<Account> {
    const account = await this.findOne(id);
    Object.assign(account, dto);
    return this.repo.save(account);
  }

  /** Accounts are never hard-deleted in accounting: history must stay intact. */
  async deactivate(id: number): Promise<Account> {
    const account = await this.findOne(id);
    account.isActive = false;
    return this.repo.save(account);
  }
}
