import axios, { type InternalAxiosRequestConfig } from 'axios';

import { apiClient } from './client';

/**
 * Silent session renewal (ARCHITECTURE.md §6): a 401 triggers one `POST /auth/refresh`, then
 * the original request is retried exactly once. Concurrent 401s share a single refresh so a
 * page that fires several requests at boot does not rotate cookies several times over.
 */

const REFRESH_PATH = '/auth/refresh';

/**
 * A 401 from these means the credentials were wrong or the refresh cookie itself is dead, so
 * renewing would either loop or hide a real answer. `/auth/logout` is deliberately absent: a
 * 401 there only means the access cookie aged out, and the cookies still need clearing server
 * side, so that call is allowed to renew and retry like any other.
 */
const NEVER_REFRESHED = [REFRESH_PATH, '/auth/login', '/auth/register'];

interface RetriableConfig extends InternalAxiosRequestConfig {
  retriedAfterRefresh?: boolean;
}

let refreshInFlight: Promise<void> | null = null;
let onExpired: (() => void) | null = null;

/** Lets AuthContext clear the user when renewal fails. Returns an unsubscribe function. */
export function onSessionExpired(handler: () => void): () => void {
  onExpired = handler;

  return () => {
    if (onExpired === handler) {
      onExpired = null;
    }
  };
}

function refreshSession(): Promise<void> {
  refreshInFlight ??= apiClient
    .post(REFRESH_PATH)
    .then(() => undefined)
    .finally(() => {
      refreshInFlight = null;
    });

  return refreshInFlight;
}

export function installAuthInterceptor(): void {
  apiClient.interceptors.response.use(
    (response) => response,
    async (error: unknown) => {
      if (!axios.isAxiosError(error) || error.response?.status !== 401) {
        throw error;
      }

      const config = error.config as RetriableConfig | undefined;
      const url = config?.url ?? '';

      if (!config || config.retriedAfterRefresh === true) {
        throw error;
      }

      if (NEVER_REFRESHED.some((path) => url.startsWith(path))) {
        throw error;
      }

      config.retriedAfterRefresh = true;

      try {
        await refreshSession();
      } catch {
        onExpired?.();
        throw error;
      }

      return apiClient.request(config);
    },
  );
}
