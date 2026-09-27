import { apiClient } from './client';

import type { ApiSuccess, MotivationalQuoteCategory, QuoteResult } from '@/types/api';

/** `/quotes` calls (ARCHITECTURE.md §7). Decorative and non-blocking — see `MotivationalQuote`. */

/**
 * Fetch the current motivational reminder for one section. The server always answers 200 for a
 * valid category — an AI line when one is cached, a curated fallback otherwise (§9) — so it never
 * returns an application error here. Any thrown error is therefore transport-only (offline, timeout);
 * the caller treats it as "keep showing the local fallback", never as a page failure.
 */
export async function fetchMotivationalQuote(
  category: MotivationalQuoteCategory,
  signal?: AbortSignal,
): Promise<QuoteResult> {
  const response = await apiClient.get<ApiSuccess<QuoteResult>>(
    `/quotes/${encodeURIComponent(category)}`,
    { signal },
  );

  return response.data.data;
}
