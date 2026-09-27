/**
 * The client's OWN curated fallback quotes for the motivational card (R-N7: the client and server
 * are separate repositories and never share code, so each keeps its own copy). These are shown
 * INSTANTLY on first render and kept whenever the AI-generated line from `GET /quotes/:category`
 * has not arrived, fails, or the request errors — so the card, and the page it sits on, can never
 * be blocked or broken by generation (ARCHITECTURE.md §9). A successful fetch swaps the AI line in;
 * see `MotivationalQuote.tsx`.
 *
 * The card sits on exactly three sections — Transactions, Budgets and Goals — matching the server's
 * category set; Dashboard keeps its own separate Ayah card and no longer carries this one.
 *
 * CONTENT RULES (deliberate, not incidental) — the same rules the server holds the model to:
 * - All copy below is original to Finora — no famous-person attributions, no quotations of real
 *   people. The only attribution shown in the UI is the neutral "Finora Reminder" label.
 * - Nothing promises or implies guaranteed financial outcomes ("get rich", "always", "guaranteed").
 *   The tone is calm and observational — awareness and habit, not hype.
 * - Lines are short and plain so they sit quietly beneath the financial data.
 *
 * To add or edit a fallback line, change only the relevant array here.
 */

/** The finance sections that can display a contextual quote — the three the server also serves. */
export type QuoteCategory = 'transactions' | 'budgets' | 'goals';

/**
 * The disclaimer used for the fallback line when no AI response (which carries its own) is in hand.
 * Mirrors the server's `QUOTE_DISCLAIMER` in intent (R-I5); kept as the client's own copy (R-N7).
 */
export const QUOTE_FALLBACK_DISCLAIMER =
  'A general motivational reminder — for encouragement only, not financial advice.';

/**
 * Fallback quotes by category. Each array is self-contained — a category only ever shows its own
 * lines — so the sets are kept meaningfully distinct. Order is not significant: selection is by
 * calendar day (see `select-quote.ts`). Keep several lines per category so a given quote recurs only
 * every few days rather than daily.
 */
export const QUOTES: Record<QuoteCategory, readonly string[]> = {
  transactions: [
    'Every expense tells a story about your priorities.',
    'Track your spending today to understand your choices tomorrow.',
    'What gets recorded gets understood.',
    'Noticing the small purchases is where clarity often begins.',
    'A recorded expense is a lesson you can return to later.',
    'Seeing where your money goes is the first step to directing it.',
  ],
  budgets: [
    'A budget is not a restriction; it is a plan for where your money should go.',
    'Spend with intention, save with purpose.',
    'Knowing your limits can make spending feel lighter, not heavier.',
    'A plan for your money is really a plan for your choices.',
    'Separating needs from wants is where most budgets begin.',
    'A budget you can keep is worth more than a perfect one you cannot.',
  ],
  goals: [
    'Small progress toward a meaningful goal is still progress.',
    'Consistency turns financial goals into achievable milestones.',
    'A goal with a deadline is a plan you can actually follow.',
    'Patience is part of every goal worth reaching.',
    'Steady steps tend to outlast sudden bursts of effort.',
    'The goal you revisit often is the goal you keep moving toward.',
  ],
};

/**
 * The short, contextual eyebrow shown above each quote — the "small contextual label" of the card.
 * Kept separate from the nav labels so the reminder reads naturally (e.g. "Spending", not the
 * "Transactions" route name). "Finora Reminder" is added by the component as the attribution.
 */
export const CATEGORY_LABELS: Record<QuoteCategory, string> = {
  transactions: 'Spending',
  budgets: 'Budgeting',
  goals: 'Goals',
};

/** True when `value` is a category the quote system knows about (runtime guard for the component). */
export function isQuoteCategory(value: string): value is QuoteCategory {
  return Object.prototype.hasOwnProperty.call(QUOTES, value);
}
