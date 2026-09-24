import { z } from 'zod';

/**
 * Mirrors `server/src/modules/goals/goals.validation.ts` (§7 shared validation rules). This copy
 * answers without a round trip; the server's copy is the one that decides (R-F3).
 *
 * Every field stays the string the DOM yields, so the resolver's input and output types are the
 * same shape — the amounts in particular never become numbers on the client, the one place a
 * float could round the value the person typed (R-F6). The submit handler passes the strings
 * straight to the API.
 */

const MONEY_MIN = 0.01;
const MONEY_MAX = 999_999_999.99;
/** Nine digits and two decimals, the widest value the API stores. */
const MONEY_PATTERN = /^\d{1,9}(?:\.\d{1,2})?$/;

const MONEY_MAX_LABEL = MONEY_MAX.toLocaleString('en-US', { minimumFractionDigits: 2 });

function money(min: number, message: string) {
  return z
    .string()
    .trim()
    .refine(
      (value) => MONEY_PATTERN.test(value) && Number(value) >= min && Number(value) <= MONEY_MAX,
      message,
    );
}

/** A goal's target is at least one whole unit; the shared floor of a cent is for progress. */
const targetAmount = money(
  1,
  `Enter a target between 1.00 and ${MONEY_MAX_LABEL}, using at most two decimals.`,
);

const currentAmount = money(
  MONEY_MIN,
  `Enter an amount between ${MONEY_MIN.toFixed(2)} and ${MONEY_MAX_LABEL}, using at most two decimals.`,
);

const NAME_MAX_LENGTH = 60;
const name = z.string().trim().min(1, 'Name is required').max(NAME_MAX_LENGTH, 'Name is too long');

const ISO_DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * A `<input type="date">` yields `YYYY-MM-DD`. It closes at the last millisecond of that day in
 * UTC, matching the server, so a deadline of today still counts as in the future.
 */
const deadline = z
  .string()
  .trim()
  .refine((value) => ISO_DATE_ONLY.test(value) && !Number.isNaN(Date.parse(value)), 'Enter a date')
  .refine(
    (value) => new Date(`${value}T23:59:59.999Z`).getTime() > Date.now(),
    'The deadline must be in the future',
  );

export const goalFormSchema = z.object({
  name,
  targetAmount,
  /** Optional on the form; an empty string means "leave at zero" and is dropped before submit. */
  currentAmount: z.union([currentAmount, z.literal('')]),
  deadline,
});

export type GoalFormValues = z.infer<typeof goalFormSchema>;

/** The contribute / progress-update form sends an absolute saved amount — never a delta (R-B3). */
export const goalProgressSchema = z.object({
  currentAmount,
});

export type GoalProgressValues = z.infer<typeof goalProgressSchema>;
