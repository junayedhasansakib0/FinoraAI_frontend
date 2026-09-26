import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ANALYTICS_MONTHS } from '@/lib/constants';

import { dashboardKeys } from './use-dashboard';
import {
  transactionKeys,
  useCreateTransaction,
  useDeleteTransaction,
  useUpdateTransaction,
} from './use-transactions';

import type { ReactNode } from 'react';

/**
 * The dashboard "doesn't update after adding a transaction" bug is a cache-freshness contract, so
 * it is pinned here rather than left to manual checking: a successful create, edit or delete must
 * retire BOTH the transactions list and every dashboard figure, so the next time either is shown
 * it is refetched from the authoritative server rather than read stale from cache. The network is
 * mocked (R-T4) — this asserts the invalidation wiring, not the API.
 */

vi.mock('@/api/transactions', () => ({
  createTransaction: vi.fn(() => Promise.resolve({ id: 't1' })),
  updateTransaction: vi.fn(() => Promise.resolve({ id: 't1' })),
  deleteTransaction: vi.fn(() => Promise.resolve()),
  fetchTransactions: vi.fn(() => Promise.resolve({ items: [] })),
}));

/**
 * A client with retries off, pre-seeded with the exact caches a write must retire — shaped like
 * the entries the real pages create (a filtered transactions page, both dashboard endpoints), and
 * left inactive (no component observes them), so invalidation marks them stale without firing a
 * refetch we would then have to mock a response for.
 */
function seededClient(): QueryClient {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  queryClient.setQueryData(transactionKeys.page({}), { seeded: true });
  queryClient.setQueryData(dashboardKeys.summary(), { seeded: true });
  queryClient.setQueryData(dashboardKeys.analytics(ANALYTICS_MONTHS), { seeded: true });

  return queryClient;
}

function wrapperFor(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

function expectLedgerRetired(queryClient: QueryClient) {
  expect(queryClient.getQueryState(transactionKeys.page({}))?.isInvalidated).toBe(true);
  expect(queryClient.getQueryState(dashboardKeys.summary())?.isInvalidated).toBe(true);
  expect(queryClient.getQueryState(dashboardKeys.analytics(ANALYTICS_MONTHS))?.isInvalidated).toBe(
    true,
  );
}

describe('ledger mutations invalidate the transactions and dashboard caches', () => {
  it('retires both caches after a create', async () => {
    const queryClient = seededClient();
    const { result } = renderHook(() => useCreateTransaction(), {
      wrapper: wrapperFor(queryClient),
    });

    await result.current.mutateAsync({
      type: 'expense',
      amount: '12.50',
      categoryId: 'c1',
      date: '2026-09-26',
    });

    expectLedgerRetired(queryClient);
  });

  it('retires both caches after an edit', async () => {
    const queryClient = seededClient();
    const { result } = renderHook(() => useUpdateTransaction(), {
      wrapper: wrapperFor(queryClient),
    });

    await result.current.mutateAsync({ id: 't1', input: { amount: '99.00' } });

    expectLedgerRetired(queryClient);
  });

  it('retires both caches after a delete', async () => {
    const queryClient = seededClient();
    const { result } = renderHook(() => useDeleteTransaction(), {
      wrapper: wrapperFor(queryClient),
    });

    await result.current.mutateAsync('t1');

    expectLedgerRetired(queryClient);
  });
});
