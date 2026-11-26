import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Account } from './account.entity';
import { AccountType } from './account-type.enum';
import { AccountsService } from './accounts.service';
import { JournalLine } from '../journal-entries/journal-line.entity';

/** Example unit test with a mocked repository. Use it as a template for your own tests. */
describe('AccountsService', () => {
  let service: AccountsService;
  const repo = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn((dto) => dto),
    save: jest.fn(async (entity) => ({ id: 1, ...entity })),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
providers: [
  AccountsService,
  { provide: getRepositoryToken(Account), useValue: repo },
  { provide: getRepositoryToken(JournalLine), useValue: {} },
],    }).compile();
    service = moduleRef.get(AccountsService);
  });

  it('creates an account when the code is free', async () => {
    repo.findOne.mockResolvedValue(null);
    const result = await service.create({ code: '1000', name: 'Cash', type: AccountType.ASSET });
    expect(result).toMatchObject({ id: 1, code: '1000' });
  });

  it('rejects a duplicate code', async () => {
    repo.findOne.mockResolvedValue({ id: 5, code: '1000' });
    await expect(
      service.create({ code: '1000', name: 'Cash', type: AccountType.ASSET }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('throws NotFound for a missing account', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.findOne(99)).rejects.toBeInstanceOf(NotFoundException);
  });
});
