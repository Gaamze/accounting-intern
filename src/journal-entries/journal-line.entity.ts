import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Account } from '../accounts/account.entity';
import { JournalEntry } from './journal-entry.entity';

/** A single debit OR credit against one account. Amounts are in cents. */
@Entity('journal_lines')
export class JournalLine {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => JournalEntry, (entry) => entry.lines, { onDelete: 'CASCADE' })
  entry: JournalEntry;

  @ManyToOne(() => Account, { eager: true, nullable: false })
  account: Account;

  @Column({ type: 'integer', default: 0 })
  debitCents: number;

  @Column({ type: 'integer', default: 0 })
  creditCents: number;
}
