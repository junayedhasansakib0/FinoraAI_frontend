import { z } from 'zod';

/**
 * Mirrors `server/src/modules/transactions/transactions.validation.ts` (§7 shared validation
 * rules). This copy answers without a round trip; the server's copy is the one that decides
 * (R-F3).
 */

const DESCRIPTION_MAX = 280;
const MONEY_MIN = 0.01;
const MONEY_MAX = 999_999_999.99;
/** Nine digits and two decimals, the widest value the API stores. */
const MONEY_PATTERN = /^\d{1,9}(?:\.\d{1,2})?$/;

/** The same one-day tolerance the API allows, computed the same way, so the edges agree (R-V3). */
const FUTURE_DATE_TOLERANCE_MS = 24 * 60 * 60 * 1000;
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

const AMOUNT_MESSAGE = `Enter an amount between ${MONEY_MIN.toFixed(2)} and ${MONEY_MAX.toLocaleString('en-US', { minimumFractionDigits: 2 })}, using at most two decimals.`;

/**
 * The amount stays a string from the keystroke to the request body: parsing it into a number here
 * would be the one place a float could round the value the person typed (R-F6).
 */
const amount = z
  .string()
  .trim()
  .refine(
    (value) =>
      MONEY_PATTERN.test(value) && Number(value) >= MONEY_MIN && Number(value) <= MONEY_MAX,
    AMOUNT_MESSAGE,
  );

/**
 * `<input type="date">` only ever yields `YYYY-MM-DD`, so that is the one shape checked here even
 * though the API also accepts a date and time with an offset.
 */
const date = z
  .string()
  .trim()
  .refine((value) => DATE_ONLY.test(value) && !Number.isNaN(Date.parse(value)), 'Enter a date.')
  .refine(
    (value) => Date.parse(`${value}T00:00:00.000Z`) <= Date.now() + FUTURE_DATE_TOLERANCE_MS,
    'A transaction cannot be dated more than a day ahead.',
  );

export const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount,
  categoryId: z.string().min(1, 'Choose a category.'),
  /** Always sent, empty included: on an edit, an omitted field means "leave it as it was". */
  description: z.string().trim().max(DESCRIPTION_MAX, 'That description is too long.'),
  date,
});

export const FIELD_LIMITS = { description: DESCRIPTION_MAX } as const;

export type TransactionValues = z.infer<typeof transactionSchema>;
