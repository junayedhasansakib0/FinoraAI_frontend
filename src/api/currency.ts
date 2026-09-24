import { apiClient } from './client';

import type { ApiSuccess, CurrencyConvertPayload, CurrencyRatesPayload } from '@/types/api';

/**
 * `/currency` calls (ARCHITECTURE.md §7). The browser never talks to Frankfurter itself — it only
 * ever reaches these Finora endpoints, which own the cache and the degradation (R-E4). The figures
 * are ECB reference rates and NOT real-time; nothing here derives a number, the server does the
 * conversion math (R-B3) and this only fetches and hands the result to the page.
 */

export interface ConvertParams {
  from: string;
  to: string;
  amount: number;
}

/** The day's rates for a base currency; the converter reads the code list and `asOf` from it. */
export async function fetchCurrencyRates(base = 'USD', signal?: AbortSignal) {
  const response = await apiClient.get<ApiSuccess<CurrencyRatesPayload>>('/currency/rates', {
    params: { base },
    signal,
  });

  return response.data.data;
}

/** A single server-side conversion: `{ result, rate, date }`. */
export async function convertCurrency(params: ConvertParams, signal?: AbortSignal) {
  const response = await apiClient.get<ApiSuccess<CurrencyConvertPayload>>('/currency/convert', {
    params,
    signal,
  });

  return response.data.data;
}
