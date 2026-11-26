import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Account } from '../accounts/account.entity';
import { JournalEntriesService } from '../journal-entries/journal-entries.service';
import { Invoice, InvoiceStatus } from './entities/invoice.entity';
import { InvoicesService } from './invoices.service';

describe('InvoicesService', () => {
  let service: InvoicesService;
  const invoicesRepo = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn((dto) => dto),
    save: jest.fn(async (entity) => ({ id: 1, ...entity })),
  };
  const accountsRepo = { findOne: jest.fn() };
  const journalService = { create: jest.fn() };
  // Fake transaction: just run the callback with a manager that returns our fake repo.
  const manager = { getRepository: jest.fn(() => invoicesRepo) };
  const dataSource = { transaction: jest.fn(async (cb) => cb(manager)) };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        InvoicesService,
        { provide: getRepositoryToken(Invoice), useValue: invoicesRepo },
        { provide: getRepositoryToken(Account), useValue: accountsRepo },
        { provide: JournalEntriesService, useValue: journalService },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();
    service = moduleRef.get(InvoicesService);
  });

  it('posts a DRAFT invoice and creates a journal entry', async () => {
    invoicesRepo.findOne.mockResolvedValue({
      id: 1,
      number: 'INV-1',
      issueDate: '2026-11-26',
      amountCents: 10000,
      status: InvoiceStatus.DRAFT,
    });
    accountsRepo.findOne.mockResolvedValue({ id: 5 });

    const result = await service.post(1);
    expect(journalService.create).toHaveBeenCalledTimes(1);
    expect(result.status).toBe(InvoiceStatus.POSTED);
  });

  it('rejects posting an invoice that is not DRAFT', async () => {
    invoicesRepo.findOne.mockResolvedValue({
      id: 1,
      number: 'INV-1',
      status: InvoiceStatus.POSTED,
    });
    await expect(service.post(1)).rejects.toBeInstanceOf(ConflictException);
  });

  it('pays a POSTED invoice and creates a journal entry', async () => {
    invoicesRepo.findOne.mockResolvedValue({
      id: 1,
      number: 'INV-1',
      amountCents: 10000,
      status: InvoiceStatus.POSTED,
    });
    accountsRepo.findOne.mockResolvedValue({ id: 5 });

    const result = await service.pay(1);
    expect(journalService.create).toHaveBeenCalledTimes(1);
    expect(result.status).toBe(InvoiceStatus.PAID);
  });

  it('rejects paying an invoice that is not POSTED', async () => {
    invoicesRepo.findOne.mockResolvedValue({
      id: 1,
      number: 'INV-1',
      status: InvoiceStatus.DRAFT,
    });
    await expect(service.pay(1)).rejects.toBeInstanceOf(ConflictException);
  });

  it('throws NotFound for a missing invoice', async () => {
    invoicesRepo.findOne.mockResolvedValue(null);
    await expect(service.findOne(99)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('keeps the invoice DRAFT if creating the journal entry fails', async () => {
    const invoice = { id: 1, number: 'INV-1', issueDate: '2026-11-26', amountCents: 100, status: InvoiceStatus.DRAFT };
    invoicesRepo.findOne.mockResolvedValue(invoice);
    accountsRepo.findOne.mockResolvedValue({ id: 5 });
    journalService.create.mockRejectedValueOnce(new Error('boom'));

    await expect(service.post(1)).rejects.toThrow('boom');
    expect(invoicesRepo.save).not.toHaveBeenCalled();
    expect(invoice.status).toBe(InvoiceStatus.DRAFT);
  });

  it('uses the given payment date', async () => {
    invoicesRepo.findOne.mockResolvedValue({
      id: 1, number: 'INV-1', issueDate: '2026-11-01', amountCents: 100, status: InvoiceStatus.POSTED,
    });
    accountsRepo.findOne.mockResolvedValue({ id: 5 });

    await service.pay(1, '2026-12-01');
    expect(journalService.create.mock.calls[0][0].date).toBe('2026-12-01');
  });

  it('rejects a payment date before the issue date', async () => {
    invoicesRepo.findOne.mockResolvedValue({
      id: 1, number: 'INV-1', issueDate: '2026-11-10', amountCents: 100, status: InvoiceStatus.POSTED,
    });
    await expect(service.pay(1, '2026-11-01')).rejects.toBeInstanceOf(BadRequestException);
  });
});
