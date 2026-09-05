/**
 * Public runtime configuration. Everything in this file is inlined into the browser bundle,
 * so no secret may ever be added here.
 */

function withoutTrailingSlash(value: string): string {
  return value.endsWith('/') ? value.slice(0, -1) : value;
}

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

/** Falls back to the relative path handled by the Vite dev proxy (see `vite.config.ts`). */
export const API_BASE_URL = withoutTrailingSlash(
  configuredApiBaseUrl && configuredApiBaseUrl.length > 0 ? configuredApiBaseUrl : '/api/v1',
);

export const REQUEST_TIMEOUT_MS = 15_000;

export const APP_NAME = 'Finora AI';

/** Every path the router knows about, in one place. */
export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  transactions: '/app/transactions',
} as const;
