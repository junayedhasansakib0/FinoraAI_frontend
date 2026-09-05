import { QueryClient } from '@tanstack/react-query';
import axios from 'axios';

/**
 * The single query client for the app (ARCHITECTURE.md §3). Reads are retried twice with
 * exponential backoff; mutations are never retried, because a write that timed out may already
 * have been applied on the server.
 */

const RETRY_ATTEMPTS = 2;
const RETRY_BASE_DELAY_MS = 500;
const RETRY_MAX_DELAY_MS = 5_000;

/** Only a transport failure or a server fault can be fixed by asking again. */
function isRetryable(error: unknown): boolean {
  if (!axios.isAxiosError(error)) {
    return false;
  }

  const status = error.response?.status;

  return status === undefined || status >= 500;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => failureCount < RETRY_ATTEMPTS && isRetryable(error),
      retryDelay: (failureCount) =>
        Math.min(RETRY_BASE_DELAY_MS * 2 ** failureCount, RETRY_MAX_DELAY_MS),
      /** The API is the only source of truth; re-asking inside half a minute buys nothing. */
      staleTime: 30_000,
    },
    mutations: { retry: 0 },
  },
});
