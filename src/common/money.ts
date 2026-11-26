/**
 * Money is stored as INTEGER CENTS everywhere (e.g. 12.50 -> 1250).
 * Floating point numbers cannot represent most decimals exactly (0.1 + 0.2 !== 0.3),
 * which is unacceptable in accounting.
 */
export const toCents = (amount: number): number => Math.round(amount * 100);
export const fromCents = (cents: number): number => cents / 100;
