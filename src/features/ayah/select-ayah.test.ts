import { describe, expect, it } from 'vitest';

import { AYAHS } from './ayah-data';
import { ayahReference, dailyIndex, nextIndex } from './select-ayah';

describe('dailyIndex', () => {
  it('is stable for the same calendar day', () => {
    const morning = new Date(2026, 8, 26, 6, 0, 0);
    const night = new Date(2026, 8, 26, 23, 59, 0);
    expect(dailyIndex(morning, 11)).toBe(dailyIndex(night, 11));
  });

  it('advances by exactly one step (mod count) the next day', () => {
    const today = new Date(2026, 8, 26, 12, 0, 0);
    const tomorrow = new Date(2026, 8, 27, 12, 0, 0);
    expect(dailyIndex(tomorrow, 11)).toBe(nextIndex(dailyIndex(today, 11), 11));
  });

  it('always returns an index inside the set', () => {
    for (let d = 0; d < 40; d += 1) {
      const value = dailyIndex(new Date(2026, 0, 1 + d), AYAHS.length);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(AYAHS.length);
    }
  });

  it('guards against an empty set', () => {
    expect(dailyIndex(new Date(), 0)).toBe(0);
  });
});

describe('nextIndex', () => {
  it('wraps at the end of the set', () => {
    expect(nextIndex(10, 11)).toBe(0);
    expect(nextIndex(0, 11)).toBe(1);
  });
});

describe('ayahReference', () => {
  it('formats as surah:ayah', () => {
    expect(ayahReference({ ...AYAHS[0]!, surahNumber: 2, ayahNumber: 152 })).toBe('2:152');
  });
});
