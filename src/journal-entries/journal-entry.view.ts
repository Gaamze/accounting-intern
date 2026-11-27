
import { JournalEntry } from './journal-entry.entity';
import { JournalLine } from './journal-line.entity';

/**
 * The entry itself PLUS the list of account codes it touches.
 */
export interface JournalEntryResponse extends JournalEntry {
  affectedAccountCodes: string[];
}

/** Unique account codes used by the lines */
export function getAffectedAccountCodes(lines: Pick<JournalLine, 'account'>[] | undefined): string[] {
  const codes = (lines ?? [])
    .map((line) => line.account?.code)
    .filter((code): code is string => Boolean(code));
  return [...new Set(codes)].sort();
}

/** entry that was loaded  */
export function toResponse(entry: JournalEntry): JournalEntryResponse {
  return { ...entry, affectedAccountCodes: getAffectedAccountCodes(entry.lines) };
}
