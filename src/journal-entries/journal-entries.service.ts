import { BadRequestException, Injectable, NotFoundException,ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Account } from '../accounts/account.entity';
import { CreateJournalEntryDto } from './dto/create-journal-entry.dto';
import { JournalEntry } from './journal-entry.entity';
import { assertBalanced } from './journal-entry.rules';
import { ListJournalEntriesQueryDto } from './dto/ListJournalEntriesQueryDto';
import {Between,MoreThanOrEqual,LessThanOrEqual} from 'typeorm';
import { ReverseJournalEntryDto } from './dto/reverse-journal-entry.dto';


@Injectable()
export class JournalEntriesService {
  constructor(
    @InjectRepository(JournalEntry) private readonly entries: Repository<JournalEntry>,
    @InjectRepository(Account) private readonly accounts: Repository<Account>,
  ) {}

  async create(dto: CreateJournalEntryDto): Promise<JournalEntry> {
    assertBalanced(dto.lines);

    // Make sure every referenced account exists and is active.
    const ids = [...new Set(dto.lines.map((l) => l.accountId))];
    const found = await this.accounts.find({ where: { id: In(ids) } });
    for (const id of ids) {
      const acc = found.find((a) => a.id === id);
      if (!acc) throw new BadRequestException(`Account ${id} does not exist`);
      if (!acc.isActive) throw new BadRequestException(`Account ${acc.code} is inactive`);
    }

    // cascade: true on `lines` saves the entry and its lines in one transaction.
    const entry = this.entries.create({
      date: dto.date,
      description: dto.description,
      reference: dto.reference ?? null,
      lines: dto.lines.map((l) => ({
        account: { id: l.accountId },
        debitCents: l.debitCents,
        creditCents: l.creditCents,
      })),
    });

    

    const saved = await this.entries.save(entry);
    return this.findOne(saved.id);
  }


  // task 2 
  findAll(query: ListJournalEntriesQueryDto): Promise<JournalEntry[]> {

    if (query.from && query.to && query.from > query.to) {
    throw new BadRequestException('From date cannot be after to date');
  }
  let date;

  if (query.from && query.to) {
    date = Between(query.from, query.to);
  } else if (query.from) {
    date = MoreThanOrEqual(query.from);
  } else if (query.to) {
    date = LessThanOrEqual(query.to);
  }

    return this.entries.find({ where: date ? { date: date } : {},order: { date: 'DESC', id: 'DESC' } });
  }

  async findOne(id: number): Promise<JournalEntry> {
    const entry = await this.entries.findOne({ where: { id } });
    if (!entry) throw new NotFoundException(`Journal entry ${id} not found`);
    return entry;
  }



  // task 4 
  async reverse(id: number, dto: ReverseJournalEntryDto): Promise<JournalEntry> {
  const original = await this.findOne(id);

  // Decision: a reversal can't itself be reversed (see note below).
  if (original.reversedEntryId !== null) {
    throw new ConflictException(`Entry ${id} is a reversal and cannot be reversed`);
  }

  const alreadyReversed = await this.entries.findOne({ where: { reversedEntryId: id } });
  if (alreadyReversed) {
    throw new ConflictException(`Entry ${id} was already reversed by entry ${alreadyReversed.id}`);
  }

  const reversal = this.entries.create({
    date: dto.date,
    description: `Reversal of entry #${id}`,
    reference: `REV-${id}`,
    reversedEntryId: id,
    lines: original.lines.map((l) => ({
      account: { id: l.account.id },
      debitCents: l.creditCents, // swapped
      creditCents: l.debitCents, // swapped
    })),
  });

  const saved = await this.entries.save(reversal);
  return this.findOne(saved.id);
}

  // Posted journal entries are NEVER edited or deleted.
  // Mistakes are fixed with a reversing entry -> TASK 4.
}
