import type { Ayah } from './ayah-data';

/**
 * Pure selection helpers for the Ayah card. Kept free of React and of `Date.now()` at call sites
 * (the date is passed in) so the card renders deterministically and the tests inject time (R-T6).
 */

/** Milliseconds in one day. */
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * The index for a given calendar day: days since the Unix epoch, taken modulo the set size, using
 * the browser's LOCAL day. Two renders on the same local day pick the same verse; the verse only
 * turns over at local midnight. This is display-only rotation, not month math, so the local day is
 * the right unit — no user-timezone service is involved.
 */
export function dailyIndex(date: Date, count: number): number {
  if (count <= 0) return 0;
  const localMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const day = Math.floor(localMidnight / MS_PER_DAY);
  return ((day % count) + count) % count;
}

/** The next verse in the cycle, wrapping — used by the optional "Another ayah" control. */
export function nextIndex(current: number, count: number): number {
  if (count <= 0) return 0;
  return (current + 1) % count;
}

/** Canonical "surah:ayah" reference, e.g. `2:152`. */
export function ayahReference(ayah: Ayah): string {
  return `${ayah.surahNumber}:${ayah.ayahNumber}`;
}
