import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Account } from '../accounts/account.entity';
import { JournalEntry } from './journal-entry.entity';
import { JournalEntriesService } from './journal-entries.service';

describe('JournalEntriesService', () => {
  let service: JournalEntriesService;
  const entriesRepo = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn((dto) => dto),
    save: jest.fn(async (entity) => ({ id: 2, ...entity })),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        JournalEntriesService,
        { provide: getRepositoryToken(JournalEntry), useValue: entriesRepo },
        { provide: getRepositoryToken(Account), useValue: { find: jest.fn() } },
      ],
    }).compile();
    service = moduleRef.get(JournalEntriesService);
  });

  it('reverses an entry with swapped debits and credits', async () => {
    const original = {
      id: 1,
      reversedEntryId: null,
      lines: [
        { account: { id: 10 }, debitCents: 5000, creditCents: 0 },
        { account: { id: 20 }, debitCents: 0, creditCents: 5000 },
      ],
    };
    const reversed = { id: 2, reference: 'REV-1', reversedEntryId: 1 };

    entriesRepo.findOne
      .mockResolvedValueOnce(original)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(reversed);

    const result = await service.reverse(1, { date: '2026-11-26' });
    expect(result).toMatchObject({ id: 2, reference: 'REV-1', reversedEntryId: 1 });
  });

  it('rejects reversing an already-reversed entry', async () => {
    entriesRepo.findOne
      .mockResolvedValueOnce({ id: 1, reversedEntryId: null, lines: [] })
      .mockResolvedValueOnce({ id: 2, reversedEntryId: 1 });

    await expect(service.reverse(1, { date: '2026-11-26' })).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('rejects reversing a reversal entry', async () => {
    entriesRepo.findOne.mockResolvedValueOnce({ id: 2, reversedEntryId: 1, lines: [] });

    await expect(service.reverse(2, { date: '2026-11-26' })).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('throws NotFound for a missing entry', async () => {
    entriesRepo.findOne.mockResolvedValue(null);
    await expect(service.findOne(99)).rejects.toBeInstanceOf(NotFoundException);
  });
});