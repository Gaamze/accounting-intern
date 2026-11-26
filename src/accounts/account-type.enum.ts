export enum AccountType {
  ASSET = 'ASSET',
  LIABILITY = 'LIABILITY',
  EQUITY = 'EQUITY',
  REVENUE = 'REVENUE',
  EXPENSE = 'EXPENSE',
}

/**
 * "Normal balance" side of each account type.
 * Assets & expenses grow with debits; liabilities, equity & revenue grow with credits.
 */
export const NORMAL_BALANCE: Record<AccountType, 'DEBIT' | 'CREDIT'> = {
  [AccountType.ASSET]: 'DEBIT',
  [AccountType.EXPENSE]: 'DEBIT',
  [AccountType.LIABILITY]: 'CREDIT',
  [AccountType.EQUITY]: 'CREDIT',
  [AccountType.REVENUE]: 'CREDIT',
};
