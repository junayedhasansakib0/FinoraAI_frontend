import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { fetchMotivationalQuote } from '@/api/quotes';

import { CATEGORY_LABELS, QUOTE_FALLBACK_DISCLAIMER, type QuoteCategory } from './quotes';
import { pickDailyQuote } from './select-quote';

interface MotivationalQuoteProps {
  /** Which section this quote belongs to; selects the set and the endpoint category. */
  category: QuoteCategory;
  /** Optional extra classes for placement (margins) from the page that mounts it. */
  className?: string;
}

/** ~12h fresh: matches the server's cache window, so the client never re-asks for a line the API
 *  is still serving from its own cache. ~24h in cache before it is dropped. */
const QUOTE_STALE_MS = 12 * 60 * 60 * 1000;
const QUOTE_GC_MS = 24 * 60 * 60 * 1000;

/**
 * A small, contextual motivational quote for a finance section (Transactions, Budgets, Goals). It is
 * intentionally quiet — a hairline-bordered panel with a short eyebrow label, the quote in the
 * editorial serif, and a neutral "Finora Reminder" attribution — so it sits beneath the data rather
 * than competing with it, and never reads as a promotional card.
 *
 * It renders the local curated fallback INSTANTLY (chosen by the local calendar day, memoized on the
 * category so it does not change on re-render) and, in the background, fetches an AI-generated line
 * from `GET /quotes/:category`. On success the AI line replaces the fallback; on any error the
 * fallback stays. `staleTime`/`refetchOnMount:false`/`retry:false` mean navigating back to the page
 * makes no new request within the cache window and a failure is not retried — so the card can never
 * block, delay, or break the page's own data (ARCHITECTURE.md §9). All colour comes from the design
 * tokens (no hard-coded palette), so it follows the theme. AI text is rendered only as a plain React
 * text node, never HTML (R-I4).
 */
export function MotivationalQuote({ category, className }: MotivationalQuoteProps) {
  // `new Date()` is read once, at first render for this category — stable for the session's day.
  const fallback = useMemo(() => pickDailyQuote(category, new Date()), [category]);

  const { data } = useQuery({
    queryKey: ['motivational-quote', category],
    queryFn: ({ signal }) => fetchMotivationalQuote(category, signal),
    staleTime: QUOTE_STALE_MS,
    gcTime: QUOTE_GC_MS,
    refetchOnMount: false,
    retry: false,
  });

  // AI line when it has arrived, otherwise the local fallback shown from the first paint.
  const quote = data?.quote ?? fallback;

  // Only when there is genuinely nothing to show (unknown category / empty set) — render nothing
  // rather than an empty frame. For the three real sections this never happens.
  if (quote === null || quote === undefined) return null;

  const label = CATEGORY_LABELS[category];
  const disclaimer = data?.disclaimer ?? QUOTE_FALLBACK_DISCLAIMER;

  const classes = [
    'border border-line bg-paper px-4 py-3.5 sm:px-5 sm:py-4',
    className ?? '',
  ]
    .filter((part) => part !== '')
    .join(' ');

  return (
    <figure className={classes}>
      <p className="text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted sm:text-xs">
        {label}
      </p>
      <blockquote className="mt-2 font-serif text-sm leading-relaxed text-ink-soft sm:text-base">
        {quote}
      </blockquote>
      <figcaption className="mt-2 text-[0.7rem] text-muted sm:text-xs">Finora Reminder</figcaption>
      {/* The disclaimer (R-I5) is carried for assistive tech without enlarging the quiet card. */}
      <span className="sr-only">{disclaimer}</span>
    </figure>
  );
}
