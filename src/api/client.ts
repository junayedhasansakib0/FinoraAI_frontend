import axios from 'axios';

import { API_BASE_URL, REQUEST_TIMEOUT_MS } from '@/lib/constants';
import type { ApiFailure } from '@/types/api';

/**
 * The single axios instance for the app. `withCredentials` is required because the API
 * authenticates with httpOnly cookies (`ARCHITECTURE.md` §6) — no token is ever readable
 * from JavaScript. `installAuthInterceptor` (see `./interceptors`) adds silent renewal.
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
  withCredentials: true,
  headers: { Accept: 'application/json' },
});

/** Turns a failed request into one sentence a person can act on. */
export function describeRequestFailure(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      return `The API answered with status ${String(error.response.status)}.`;
    }
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return 'The API did not answer in time.';
    }
    return 'The API could not be reached.';
  }

  return 'The request failed before it reached the API.';
}

function isApiFailure(value: unknown): value is ApiFailure {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Partial<ApiFailure>;

  return (
    candidate.success === false &&
    typeof candidate.error?.code === 'string' &&
    typeof candidate.error.message === 'string'
  );
}

/** A transport failure has no code of its own; forms only need to tell it apart from the rest. */
export const NETWORK_ERROR_CODE = 'NETWORK_ERROR';

/**
 * The API writes its `error.message` for the person who will read it (§7), so surface it as
 * sent instead of inventing a second vocabulary on the client.
 */
export function describeApiFailure(error: unknown): { code: string; message: string } {
  if (axios.isAxiosError(error)) {
    const body: unknown = error.response?.data;

    if (isApiFailure(body)) {
      return { code: body.error.code, message: body.error.message };
    }
  }

  return { code: NETWORK_ERROR_CODE, message: describeRequestFailure(error) };
}
