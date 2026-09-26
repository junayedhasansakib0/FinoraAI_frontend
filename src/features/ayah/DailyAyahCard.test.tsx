import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AYAHS } from './ayah-data';
import { DailyAyahCard } from './DailyAyahCard';
import { nextIndex } from './select-ayah';

/** Read the Arabic verse currently on screen — it is the only right-to-left region. */
function arabicOnScreen(container: HTMLElement): string {
  return container.querySelector('[dir="rtl"]')?.textContent ?? '';
}

describe('DailyAyahCard', () => {
  beforeEach(() => {
    // Fix "today" so selection is deterministic regardless of when the suite runs (R-T6).
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 26, 9, 0, 0));
    // The card must never reach the network; a real call here would be a defect.
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('renders a real verse with its Arabic, translation, reference and sources', () => {
    const { container } = render(<DailyAyahCard />);

    const arabic = arabicOnScreen(container);
    const shown = AYAHS.find((a) => a.arabic === arabic);
    expect(shown).toBeDefined();

    const arabicEl = container.querySelector('[dir="rtl"]');
    expect(arabicEl).toHaveAttribute('dir', 'rtl');
    expect(arabicEl).toHaveAttribute('lang', 'ar');

    expect(screen.getByText(shown!.translation)).toBeInTheDocument();
    expect(
      screen.getByText(`${shown!.surahNumber}:${shown!.ayahNumber}`, { exact: false }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Pickthall/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Tanzil/i })).toHaveAttribute('href', 'https://tanzil.net');
  });

  it('never touches the network', () => {
    render(<DailyAyahCard />);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('shows the same verse on re-render for the same day', () => {
    const first = render(<DailyAyahCard />);
    const arabicFirst = arabicOnScreen(first.container);
    cleanup();
    const second = render(<DailyAyahCard />);
    expect(arabicOnScreen(second.container)).toBe(arabicFirst);
  });

  it('steps to the next verse when "Another ayah" is used, without any fetch', () => {
    const { container } = render(<DailyAyahCard />);
    const before = arabicOnScreen(container);
    const currentIndex = AYAHS.findIndex((a) => a.arabic === before);
    const expected = AYAHS[nextIndex(currentIndex, AYAHS.length)]!.arabic;

    fireEvent.click(screen.getByRole('button', { name: /another ayah/i }));

    expect(arabicOnScreen(container)).toBe(expected);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });
});
