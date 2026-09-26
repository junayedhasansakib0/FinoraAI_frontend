import { render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

// The card must degrade to nothing (not an empty frame) if the dataset is ever empty. This file
// mocks the data module for that single case, so it is kept separate from the populated suite.
vi.mock('./ayah-data', () => ({
  AYAHS: [],
  ARABIC_SOURCE: { label: 'Tanzil Uthmani', project: 'Tanzil Project', url: 'https://tanzil.net' },
  TRANSLATION_SOURCE: { translator: 'Pickthall', language: 'English', note: 'Public domain' },
}));

describe('DailyAyahCard with no verses', () => {
  afterEach(() => {
    vi.resetModules();
  });

  it('renders nothing rather than an empty card', async () => {
    const { DailyAyahCard } = await import('./DailyAyahCard');
    const { container } = render(<DailyAyahCard />);
    expect(container).toBeEmptyDOMElement();
  });
});
