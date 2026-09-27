import { isQuoteCategory, QUOTES, type QuoteCategory } from './quotes';

/**
 * Pure, React-free selection for the motivational quotes. The date is passed in (never read from
 * `Date.now()` here) so the choice is deterministic and the tests can inject time (R-T6). No value
 * here changes within a calendar day, which is what keeps the on-screen quote stable across renders.
 */

/** Milliseconds in one day. */
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * A small, stable per-category offset so the sections do not all rotate in lockstep (otherwise every
 * card would sit at the same index on a given day). Derived from the category name, so it is fixed
 * and needs no maintenance as categories are added.
 */
function categoryOffset(category: QuoteCategory): number {
  let sum = 0;
  for (let i = 0; i < category.length; i += 1) {
    sum += category.charCodeAt(i);
  }
  return sum;
}

/**
 * Whole days since the Unix epoch for the LOCAL calendar day of `date`. Two moments on the same
 * local day return the same number; it only changes at local midnight. This is display-only
 * rotation, not month math, so the local day is the correct unit — no timezone service is involved.
 */
export function daysSinceEpoch(date: Date): number {
  const localMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  return Math.floor(localMidnight / MS_PER_DAY);
}

/**
 * The index into a set of `count` items for the given day, offset so different categories do not
 * align. Always returns a value in `[0, count)`; guards an empty set.
 */
export function dailyIndex(count: number, date: Date, offset = 0): number {
  if (count <= 0) return 0;
  const day = daysSinceEpoch(date) + offset;
  return ((day % count) + count) % count;
}

/**
 * The quote to show for `category` on the local day of `date`. Returns `null` for an unknown
 * category or an empty set, so the component can render nothing rather than a broken card.
 */
export function pickDailyQuote(category: string, date: Date): string | null {
  if (!isQuoteCategory(category)) return null;

  const quotes = QUOTES[category];
  if (quotes.length === 0) return null;

  const index = dailyIndex(quotes.length, date, categoryOffset(category));
  return quotes[index] ?? null;
}
