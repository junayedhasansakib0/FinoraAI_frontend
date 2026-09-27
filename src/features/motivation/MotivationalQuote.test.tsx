import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchMotivationalQuote } from '@/api/quotes';

import { MotivationalQuote } from './MotivationalQuote';
import {
  CATEGORY_LABELS,
  QUOTE_FALLBACK_DISCLAIMER,
  QUOTES,
  type QuoteCategory,
} from './quotes';
import { pickDailyQuote } from './select-quote';

import type { QuoteResult } from '@/types/api';
import type { ReactNode } from 'react';

/**
 * The card fetches an AI line from `@/api/quotes` but must never depend on it: it shows the local
 * curated fallback INSTANTLY, swaps in the AI line only once the request resolves, and keeps the
 * fallback on any failure — so the page it sits on can never be blocked or broken (ARCHITECTURE.md
 * §9). The network layer is mocked (R-T4); these prove that contract, that a re-mount within the
 * cache window makes no new request, and that only the three sections exist.
 */

vi.mock('@/api/quotes', () => ({ fetchMotivationalQuote: vi.fn() }));

const mockFetch = vi.mocked(fetchMotivationalQuote);

/** A query client with retries off, matching the app's non-retrying decorative fetch. */
function newClient(): QueryClient {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

function renderQuote(category: QuoteCategory, client: QueryClient = newClient()) {
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  }

  return render(<MotivationalQuote category={category} />, { wrapper: Wrapper });
}

/** The rendered quote is the only <blockquote> in the card. */
function quoteOnScreen(container: HTMLElement): string {
  return container.querySelector('blockquote')?.textContent ?? '';
}

function aiResult(category: QuoteCategory, quote: string): QuoteResult {
  return { quote, category, source: 'ai', disclaimer: 'AI reminder — not financial advice.' };
}

describe('MotivationalQuote', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    // Default: a request that never resolves, so the card sits on its fallback for the test.
    mockFetch.mockReturnValue(new Promise<QuoteResult>(() => undefined));
  });

  afterEach(() => {
    cleanup();
  });

  it('shows the local fallback line immediately, before any network result', () => {
    const { container } = renderQuote('goals');

    expect(screen.getByText(CATEGORY_LABELS.goals)).toBeInTheDocument();
    expect(screen.getByText('Finora Reminder')).toBeInTheDocument();

    const shown = quoteOnScreen(container);
    expect(QUOTES.goals).toContain(shown);
    expect(shown).toBe(pickDailyQuote('goals', new Date()));
  });

  it('carries the fallback disclaimer for assistive tech while on the fallback', () => {
    renderQuote('budgets');
    expect(screen.getByText(QUOTE_FALLBACK_DISCLAIMER)).toBeInTheDocument();
  });

  it('swaps in the AI line, with its own disclaimer, once the request resolves', async () => {
    const line = 'Steady, mindful choices this month quietly build the future you are saving toward.';
    mockFetch.mockResolvedValue(aiResult('goals', line));

    const { container } = renderQuote('goals');
    // Fallback first…
    expect(QUOTES.goals).toContain(quoteOnScreen(container));

    // …then the AI line replaces it.
    await waitFor(() => {
      expect(quoteOnScreen(container)).toBe(line);
    });
    expect(screen.getByText('AI reminder — not financial advice.')).toBeInTheDocument();
  });

  it('keeps the fallback line when the request fails — never empties or throws', async () => {
    mockFetch.mockRejectedValue(new Error('offline'));

    const { container } = renderQuote('transactions');
    const fallback = quoteOnScreen(container);
    expect(QUOTES.transactions).toContain(fallback);

    // Let the rejected query settle; the card must still show the same fallback line.
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });
    expect(quoteOnScreen(container)).toBe(fallback);
    expect(container.querySelector('figure')).not.toBeNull();
  });

  it('makes one request across a re-mount within the cache window (no refetch)', async () => {
    const line = 'Every recorded expense is a small, clear step toward understanding your money.';
    mockFetch.mockResolvedValue(aiResult('transactions', line));
    const client = newClient();

    const first = renderQuote('transactions', client);
    await waitFor(() => {
      expect(quoteOnScreen(first.container)).toBe(line);
    });
    first.unmount();

    // Re-mounting (as navigating back would) reads the fresh cache, not the network.
    const second = renderQuote('transactions', client);
    expect(quoteOnScreen(second.container)).toBe(line);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('serves exactly the three sections, each from its own fallback set', () => {
    expect(Object.keys(QUOTES).sort()).toEqual(['budgets', 'goals', 'transactions']);

    for (const category of Object.keys(QUOTES) as QuoteCategory[]) {
      const { container, unmount } = renderQuote(category);
      expect(QUOTES[category]).toContain(quoteOnScreen(container));
      unmount();
    }
  });

  it('styles with design tokens (theme-safe) and mobile-first responsive classes', () => {
    const { container } = renderQuote('budgets');
    const figure = container.querySelector('figure');
    expect(figure).not.toBeNull();

    const markup = figure!.outerHTML;
    // Colour comes from tokens, not hard-coded hex — so the card follows the theme / dark mode.
    expect(markup).not.toMatch(/#[0-9a-fA-F]{3,6}/);
    expect(figure!.className).toContain('border-line');
    expect(markup).toContain('text-ink-soft');
    expect(markup).toContain('text-muted');
    // Mobile-first: base sizing plus an `sm:` step up, so it reflows on small screens.
    expect(markup).toContain('sm:');
  });

  it('applies extra placement classes passed by the page', () => {
    // TransactionsPage passes `className="mt-8"` for spacing; it must reach the figure.
    const { container } = render(<MotivationalQuote category="goals" className="mt-8" />, {
      wrapper: ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={newClient()}>{children}</QueryClientProvider>
      ),
    });
    expect(container.querySelector('figure')?.className).toContain('mt-8');
  });
});
