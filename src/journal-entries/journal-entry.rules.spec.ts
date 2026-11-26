import { BadRequestException } from '@nestjs/common';
import { assertBalanced } from './journal-entry.rules';

// These tests FAIL until TASK 1 is done. That's expected.
describe('assertBalanced', () => {
  it('accepts a balanced entry', () => {
    expect(() =>
      assertBalanced([
        { debitCents: 50000, creditCents: 0 },
        { debitCents: 0, creditCents: 50000 },
      ]),
    ).not.toThrow();
  });

  it('accepts a balanced entry with 3 lines', () => {
    expect(() =>
      assertBalanced([
        { debitCents: 30000, creditCents: 0 },
        { debitCents: 20000, creditCents: 0 },
        { debitCents: 0, creditCents: 50000 },
      ]),
    ).not.toThrow();
  });

  it('rejects fewer than 2 lines', () => {
    expect(() => assertBalanced([{ debitCents: 100, creditCents: 0 }])).toThrow(
      BadRequestException,
    );
  });

  it('rejects a line with both debit and credit', () => {
    expect(() =>
      assertBalanced([
        { debitCents: 100, creditCents: 100 },
        { debitCents: 0, creditCents: 0 },
      ]),
    ).toThrow(BadRequestException);
  });

  it('rejects a line with zero amounts', () => {
    expect(() =>
      assertBalanced([
        { debitCents: 100, creditCents: 0 },
        { debitCents: 0, creditCents: 100 },
        { debitCents: 0, creditCents: 0 },
      ]),
    ).toThrow(BadRequestException);
  });

  it('rejects unbalanced totals', () => {
    expect(() =>
      assertBalanced([
        { debitCents: 50000, creditCents: 0 },
        { debitCents: 0, creditCents: 40000 },
      ]),
    ).toThrow(BadRequestException);
  });
});
