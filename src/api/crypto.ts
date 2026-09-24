import { apiClient } from './client';

import type { ApiSuccess, CryptoMarketsPayload, CryptoSearchPayload } from '@/types/api';

/**
 * `/crypto` calls (ARCHITECTURE.md §7). The browser never talks to CoinGecko itself — it only ever
 * reaches this Finora endpoint, which owns the key, the cache, and the degradation (R-E4). The
 * figures are informational and NOT real-time; nothing here derives a number, it only fetches.
 */

export interface CryptoMarketsParams {
  /** A name/symbol filter. When set, the results are the matching coins, still priced. */
  search?: string;
  /** 1-based page of the top-coins list; ignored while a search is active. */
  page?: number;
}

/**
 * The markets list backing the crypto page. It uses `/crypto/markets` (not `/crypto/search`) even
 * for a search, because that path returns fully priced rows — the page shows price and 24h change
 * on every card, which the lightweight search endpoint does not carry.
 */
export async function fetchCryptoMarkets(params: CryptoMarketsParams, signal?: AbortSignal) {
  const response = await apiClient.get<ApiSuccess<CryptoMarketsPayload>>('/crypto/markets', {
    params,
    signal,
  });

  return response.data.data.coins;
}

/** The lightweight name/symbol search (`/crypto/search`), kept for a future typeahead. */
export async function fetchCryptoSearch(q: string, signal?: AbortSignal) {
  const response = await apiClient.get<ApiSuccess<CryptoSearchPayload>>('/crypto/search', {
    params: { q },
    signal,
  });

  return response.data.data.coins;
}
