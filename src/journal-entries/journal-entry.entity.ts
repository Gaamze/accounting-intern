import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, Index } from 'typeorm';
import { JournalLine } from './journal-line.entity';

/** One business event (e.g. "Paid rent"), made of 2+ debit/credit lines. */
@Entity('journal_entries')
export class JournalEntry {
  @PrimaryGeneratedColumn()
  id: number;

  /** Accounting date in YYYY-MM-DD. */
  @Column()
  date: string;

  @Column()
  description: string;

  /** Optional external reference, e.g. an invoice number. */
  @Column({ type: 'varchar', nullable: true })
  reference: string | null;

  @OneToMany(() => JournalLine, (line) => line.entry, { cascade: true, eager: true })
  lines: JournalLine[];

  @CreateDateColumn()
  createdAt: Date;

  @Index({unique: true})
  @Column({type: 'integer', nullable: true})
  reversedEntryId:number | null;
}
