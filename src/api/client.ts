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
 * The server's verified-email gate answers with this code (ARCHITECTURE.md §7). The client mirrors
 * the gate so these requests are not made when the account is known-unverified, but a page keeps the
 * constant to recognise the answer and show its locked state instead of a generic error (R-F5).
 */
export const EMAIL_VERIFICATION_REQUIRED_CODE = 'EMAIL_VERIFICATION_REQUIRED';

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

/** One predicate about one field, as `VALIDATION_ERROR` and friends carry them (§7, R-V6). */
export interface ApiFieldError {
  field: string;
  message: string;
}

function isFieldErrorList(value: unknown): value is ApiFieldError[] {
  return (
    Array.isArray(value) &&
    value.every((entry: unknown) => {
      if (typeof entry !== 'object' || entry === null) {
        return false;
      }

      const candidate = entry as Partial<ApiFieldError>;

      return typeof candidate.field === 'string' && typeof candidate.message === 'string';
    })
  );
}

/**
 * The field-level half of a rejected write, so a form can put each message on the input that
 * caused it (R-F3). Empty when the failure was not about specific fields.
 */
export function describeFieldErrors(error: unknown): ApiFieldError[] {
  if (axios.isAxiosError(error)) {
    const body: unknown = error.response?.data;

    if (isApiFailure(body) && isFieldErrorList(body.error.details)) {
      return body.error.details;
    }
  }

  return [];
}
