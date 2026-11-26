import { Injectable, NotImplementedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { JournalLine } from '../journal-entries/journal-line.entity';
import { InjectRepository } from '@nestjs/typeorm';
export interface TrialBalanceRow {
  code: string;
  name: string;
  type: string;
  debitCents: number;
  creditCents: number;
}

export interface TrialBalance {
  asOf: string;
  rows: TrialBalanceRow[];
  totalDebitCents: number;
  totalCreditCents: number;
  isBalanced: boolean;
}

@Injectable()
export class ReportsService {
  /**
   * TASK 5: Trial balance.
   * For every account, sum debits and credits of all lines with entry.date <= asOf.
   * Put the net balance on ONE side (debit column if debits > credits, else credit column).
   * Skip accounts with zero balance. Totals of both columns must be equal.
   *
   * Hint: inject Repository<JournalLine> and use the QueryBuilder with GROUP BY,
   * or load lines and reduce in TypeScript first, then optimize.
   */
  constructor(
    @InjectRepository(JournalLine)
    private readonly journalLines : Repository <JournalLine>){}

     async trialBalance(asOf: string): Promise<TrialBalance> {
      const results = await this.journalLines
        .createQueryBuilder('line')
        .innerJoin('line.entry', 'entry')
        .innerJoin('line.account', 'account')
        .select('account.code', 'code')
        .addSelect('account.name', 'name')
        .addSelect('account.type', 'type')
        .addSelect('SUM(line.debitCents)', 'debit')
        .addSelect('SUM(line.creditCents)', 'credit')
        .where('entry.date <= :asOf', { asOf })
        .groupBy('account.id')
        .orderBy ('account.code', 'ASC')
        .getRawMany();
    const rows: TrialBalanceRow[] = [];
    let totalDebitCents = 0;
    let totalCreditCents = 0;

     for (const item of results) {
      const difference = Number(item.debit) - Number(item.credit);

      if (difference === 0) continue;

      const debitCents = difference > 0 ? difference : 0;
      const creditCents = difference < 0 ? -difference : 0;

      rows.push({
        code: item.code,
        name: item.name,
        type: item.type,
        debitCents,
        creditCents,
      });
      totalDebitCents += debitCents;
      totalCreditCents += creditCents;
    }

    return {
      asOf,
      rows,
      totalDebitCents,
      totalCreditCents,
      isBalanced: totalDebitCents === totalCreditCents,
    };
  }

    // trialBalance(asOf: string): Promise<TrialBalance> {
    //   throw new NotImplementedException(`Trial balance as of ${asOf} is not implemented yet (TASK 5)`);
    // }
}
