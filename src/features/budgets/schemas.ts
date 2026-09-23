import { z } from 'zod';

/**
 * Mirrors `server/src/modules/budgets/budgets.validation.ts` (§7 shared validation rules). This
 * copy answers without a round trip; the server's copy is the one that decides (R-F3).
 *
 * Every field stays the string the DOM yields, so the resolver's input and output types are the
 * same shape — the amount in particular never becomes a number on the client, which is the one
 * place a float could round the value the person typed (R-F6). The submit handler converts month
 * and year to the numbers the API expects.
 */

const MONEY_MIN = 0.01;
const MONEY_MAX = 999_999_999.99;
/** Nine digits and two decimals, the widest value the API stores. */
const MONEY_PATTERN = /^\d{1,9}(?:\.\d{1,2})?$/;

const AMOUNT_MESSAGE = `Enter an amount between ${MONEY_MIN.toFixed(2)} and ${MONEY_MAX.toLocaleString('en-US', { minimumFractionDigits: 2 })}, using at most two decimals.`;

const amount = z
  .string()
  .trim()
  .refine(
    (value) =>
      MONEY_PATTERN.test(value) && Number(value) >= MONEY_MIN && Number(value) <= MONEY_MAX,
    AMOUNT_MESSAGE,
  );

/** The month select only ever offers 1–12, so this guards against a tampered value, not a typo. */
const month = z.string().refine((value) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= 12;
}, 'Month must be between 1 and 12');

const year = z
  .string()
  .trim()
  .refine((value) => {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed >= 2000 && parsed <= 2100;
  }, 'Year must be between 2000 and 2100');

export const budgetFormSchema = z.object({
  amount,
  month,
  year,
  categoryId: z.string().optional(),
});

export type BudgetFormValues = z.infer<typeof budgetFormSchema>;
