import { BadRequestException } from '@nestjs/common';

export interface LineAmounts {
  debitCents: number;
  creditCents: number;
}

/**
 * TASK 1: implement the double-entry rules.
 *
 * Throw a BadRequestException (with a clear message) when:
 *   1. there are fewer than 2 lines
 *   2. a line has BOTH a debit and a credit greater than 0
 *   3. a line has NEITHER (both are 0)
 *   4. total debits !== total credits
 *
 * When everything is fine, return nothing.
 * Run `npm test -- journal-entry.rules` until all tests pass.
 */
export function assertBalanced(lines: LineAmounts[]): void {
  // TODO: your code here
  if (lines.length < 2) {
    throw new BadRequestException(
      'At least 2 lines required'
    );
  }

  let totaldebit = 0;
  let totalcredits = 0;

  for (const line of lines) {
    if (line.debitCents > 0 && line.creditCents > 0) {
      throw new BadRequestException(
        "A line can't have both debit and credit"
      );
    }

    if (line.debitCents === 0 && line.creditCents === 0) {
      throw new BadRequestException(
        'A line must have a debit or credit'
      );
    }

    totaldebit += line.debitCents;
    totalcredits += line.creditCents;
  }

  if (totaldebit !== totalcredits) {
    throw new BadRequestException(
      'Debits must equal credits'
    );
  }
}

 



  

// //   void lines;
// //   void BadRequestException;
// // }
