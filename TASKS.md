# Intern Tasks

Work through these in order. Make one git branch and one Pull Request per task,
and ask for a review before starting the next one.

## TASK 0: Get to know the project (day 1)

1. Run the project and open Swagger at `/docs`.
2. List the accounts with `GET /accounts`, then filter with `GET /accounts?type=ASSET`.
3. Create a journal entry using the example in README.md.
4. Read the whole `accounts/` folder top to bottom. Be ready to explain:
   what a DTO is, what `ValidationPipe` does, why the controller has no logic,
   and why accounts are deactivated instead of deleted.
5. Try sending invalid data (a 3-digit code, an unknown type). Where does the error come from?

## TASK 1: The double-entry rules

Right now the API accepts unbalanced entries. Try it: debit 500, credit 400. It saves!

Implement `assertBalanced()` in `src/journal-entries/journal-entry.rules.ts`.
Done when `npm test` is fully green and an unbalanced request returns `400`.

## TASK 2: Filter journal entries by date

Add optional query params: `GET /journal-entries?from=2026-01-01&to=2026-03-31`.

- Create a `ListJournalEntriesQueryDto` with `@IsOptional() @IsDateString()` fields.
- Use it in the controller with `@Query() query: ListJournalEntriesQueryDto`.
- In the service, use TypeORM's `Between`, `MoreThanOrEqual` and `LessThanOrEqual`.
- Return `400` if `from` is after `to`.

## TASK 3: Account balance

Add `GET /accounts/:id/balance` returning:

```json
{ "account": { ... }, "totalDebitCents": 100000, "totalCreditCents": 30000,
  "normalSide": "DEBIT", "balanceCents": 70000 }
```

- Use `NORMAL_BALANCE` from `account-type.enum.ts` to decide the sign.
- Sum in the database with the QueryBuilder (`SUM(...)`), don't load every line into memory.
- An account with no entries returns zeros, not an error.

## TASK 4: Reversing entries

Add `POST /journal-entries/:id/reverse` with body `{ "date": "2026-11-30" }`.

- Create a NEW entry with every line's debit and credit swapped.
- Description: `Reversal of entry #<id>`, reference: `REV-<id>`.
- Add a nullable `reversedEntryId` column on `JournalEntry` to link the two.
- An entry that was already reversed cannot be reversed again (`409 Conflict`).
- Think about it: should a reversal itself be reversible?

## TASK 5: Trial balance report

Implement `ReportsService.trialBalance()` (see comments in the file).
`GET /reports/trial-balance?asOf=2026-12-31` must return each account's net balance
in either the debit or credit column, plus totals. If TASK 1 is done right,
`isBalanced` will always be `true`.

## TASK 6 (stretch): Invoices module

Build a new `invoices/` module from scratch using `nest g resource invoices`.

- Invoice: `number` (unique, e.g. INV-0001), `customerName`, `amountCents`,
  `issueDate`, `dueDate`, `status` (`DRAFT` | `POSTED` | `PAID`).
- `POST /invoices` creates a DRAFT.
- `POST /invoices/:id/post` creates a journal entry
  (debit 1100 Accounts Receivable, credit 4000 Sales Revenue) and sets status POSTED.
- `POST /invoices/:id/pay` creates a journal entry
  (debit 1000 Cash, credit 1100 Accounts Receivable) and sets status PAID.
- Reuse `JournalEntriesService` (export/import modules, don't duplicate logic).
- Invalid status changes (paying a DRAFT, posting twice) return `409`.

## TASK 7: Tests

Write unit tests for TASK 3 and TASK 4 services, using
`accounts/accounts.service.spec.ts` as a template.

## Rules of the road

- Money is always integer cents. Never `number` with decimals, never `float`.
- Controllers stay thin: validate, call the service, return.
- No hard deletes of financial data.
- Commit messages: `feat(journal): add reversing entries`, `fix(accounts): ...`.
