# Accounting Intern API

A small double-entry accounting backend built with **NestJS + TypeORM + SQLite**.
It mirrors the core ideas of our production accounting system so you can learn the
domain and the codebase patterns before working on the real thing.

## Setup

Requirements: Node.js 20+.

```bash
npm install
npm run start:dev
```

- API: http://localhost:3000
- Swagger (try every endpoint from the browser): http://localhost:3000/docs
- The database is a single file, `accounting.sqlite`. Delete it to start fresh.
  A default chart of accounts is inserted automatically on first start.

Run tests with `npm test`. Some tests fail on purpose until you finish TASK 1.

## Project structure

```
src/
  main.ts                 app bootstrap, global ValidationPipe, Swagger
  app.module.ts           root module + database connection
  common/money.ts         money helpers (we store CENTS, never floats)
  database/               seed data (default chart of accounts)
  accounts/               COMPLETE reference module - read this first
  journal-entries/        double-entry bookkeeping (TASK 1, 2, 4)
  reports/                financial reports (TASK 5)
```

Every feature follows the same NestJS pattern:

| File | Responsibility |
| --- | --- |
| `*.entity.ts` | Database table definition (TypeORM) |
| `dto/*.dto.ts` | Shape + validation of incoming request bodies |
| `*.controller.ts` | HTTP routes only, no business logic |
| `*.service.ts` | Business logic and database access |
| `*.module.ts` | Wires the above together |
| `*.spec.ts` | Unit tests |

## Accounting in 2 minutes

- **Account**: a bucket that tracks money, e.g. Cash (1000) or Rent Expense (5000).
  There are 5 types: ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE.
- **Journal entry**: one business event, like "paid rent". It has 2+ **lines**.
  Each line is either a **debit** or a **credit** to one account.
- **The golden rule**: in every entry, total debits = total credits.
- **Normal balance**: assets and expenses increase with debits; liabilities, equity
  and revenue increase with credits.
- Posted entries are **never edited or deleted**. Mistakes are fixed with a new,
  reversing entry. This keeps a complete audit trail.

Example: owner puts 1,000.00 into the business

| Account | Debit | Credit |
| --- | --- | --- |
| 1000 Cash | 1000.00 | |
| 3000 Owner's Equity | | 1000.00 |

As an API request (amounts in cents):

```json
POST /journal-entries
{
  "date": "2026-11-24",
  "description": "Owner invests cash",
  "lines": [
    { "accountId": 1, "debitCents": 100000, "creditCents": 0 },
    { "accountId": 4, "debitCents": 0, "creditCents": 100000 }
  ]
}
```

Your tasks are in **TASKS.md**.
