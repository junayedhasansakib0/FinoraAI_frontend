import { describe, expect, it } from 'vitest';

import { CATEGORY_LABELS, isQuoteCategory, QUOTES, type QuoteCategory } from './quotes';
import { daysSinceEpoch, dailyIndex, pickDailyQuote } from './select-quote';

const CATEGORIES = Object.keys(QUOTES) as QuoteCategory[];

describe('quote data', () => {
  it('has a label and at least a few quotes for every category', () => {
    for (const category of CATEGORIES) {
      expect(QUOTES[category].length).toBeGreaterThanOrEqual(4);
      expect(CATEGORY_LABELS[category]).toBeTruthy();
    }
  });

  it('keeps each category’s quotes distinct from the others (no shared lines)', () => {
    for (const category of CATEGORIES) {
      const others = CATEGORIES.filter((c) => c !== category).flatMap((c) => QUOTES[c]);
      for (const quote of QUOTES[category]) {
        expect(others).not.toContain(quote);
      }
    }
  });

  it('carries no famous-person attribution and no guaranteed-outcome language', () => {
    const banned = /\b(guaranteed|get rich|— [A-Z]|according to [A-Z])/i;
    for (const category of CATEGORIES) {
      for (const quote of QUOTES[category]) {
        expect(quote).not.toMatch(banned);
      }
    }
  });
});

describe('dailyIndex', () => {
  it('is stable for two moments on the same local day', () => {
    const morning = new Date(2026, 8, 26, 6, 0, 0);
    const night = new Date(2026, 8, 26, 23, 59, 0);
    expect(dailyIndex(6, morning)).toBe(dailyIndex(6, night));
  });

  it('advances by exactly one step (mod count) the next day', () => {
    const today = new Date(2026, 8, 26, 12, 0, 0);
    const tomorrow = new Date(2026, 8, 27, 12, 0, 0);
    const count = 6;
    expect(dailyIndex(count, tomorrow)).toBe((dailyIndex(count, today) + 1) % count);
  });

  it('always returns an index inside the set across many days', () => {
    for (let d = 0; d < 60; d += 1) {
      const value = dailyIndex(6, new Date(2026, 0, 1 + d));
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(6);
    }
  });

  it('guards against an empty set', () => {
    expect(dailyIndex(0, new Date())).toBe(0);
  });

  it('offsets shift the index deterministically', () => {
    const date = new Date(2026, 8, 26, 12, 0, 0);
    expect(dailyIndex(6, date, 6)).toBe(dailyIndex(6, date, 0));
    expect(dailyIndex(6, date, 1)).toBe((dailyIndex(6, date, 0) + 1) % 6);
  });
});

describe('daysSinceEpoch', () => {
  it('matches for the same local day and differs the next', () => {
    const a = daysSinceEpoch(new Date(2026, 8, 26, 1, 0, 0));
    const b = daysSinceEpoch(new Date(2026, 8, 26, 22, 0, 0));
    const c = daysSinceEpoch(new Date(2026, 8, 27, 1, 0, 0));
    expect(a).toBe(b);
    expect(c).toBe(a + 1);
  });
});

describe('pickDailyQuote', () => {
  const date = new Date(2026, 8, 26, 12, 0, 0);

  it('returns a quote drawn only from the requested category', () => {
    for (const category of CATEGORIES) {
      const quote = pickDailyQuote(category, date);
      expect(quote).not.toBeNull();
      expect(QUOTES[category]).toContain(quote as string);
    }
  });

  it('is deterministic: the same category and day give the same quote', () => {
    const first = pickDailyQuote('goals', date);
    const again = pickDailyQuote('goals', new Date(2026, 8, 26, 23, 30, 0));
    expect(again).toBe(first);
  });

  it('returns null for an unknown category', () => {
    expect(pickDailyQuote('not-a-category', date)).toBeNull();
    expect(isQuoteCategory('not-a-category')).toBe(false);
  });
});
