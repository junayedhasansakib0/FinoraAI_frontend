import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthContext } from '@/context/auth-context';

import type { AuthContextValue } from '@/context/auth-context';
import type { AuthUser, DashboardAnalytics, DashboardSummary } from '@/types/api';
import type { ReactNode } from 'react';

/**
 * The verified-email access gate, seen from the client (ARCHITECTURE.md §7, PART A). It proves the
 * gate is enforced in the UI the way the server enforces it: an unverified account is shown a calm
 * locked state in place of every verified-only surface (Analytics, both AI pages, the dashboard
 * charts), and — the point of the gate on the client — the request that surface would make is never
 * fired, so the browser makes no call it knows will be refused. The network is mocked (R-T4).
 */

const { fetchDashboardSummary, fetchDashboardAnalytics } = vi.hoisted(() => ({
  fetchDashboardSummary: vi.fn(),
  fetchDashboardAnalytics: vi.fn(),
}));

const ai = vi.hoisted(() => ({
  listReports: vi.fn(() => Promise.resolve([])),
  postChat: vi.fn(),
  generateSpendingAnalysis: vi.fn(),
  generateMonthlySummary: vi.fn(),
  generateSavingsRecommendations: vi.fn(),
  generateBudgetRecommendations: vi.fn(),
}));

vi.mock('@/api/dashboard', () => ({ fetchDashboardSummary, fetchDashboardAnalytics }));
vi.mock('@/api/ai', () => ai);

// `vi.mock` is hoisted above these imports, so the pages load with the mocks already in place. They
// are imported statically (not lazily per test) so the one-time cost of pulling in the chart-heavy
// modules falls at file load rather than inside a single test's timeout budget under full-suite load.
import Dashboard from './DashboardPage';
import Analytics from './AnalyticsPage';
import AiInsights from './AiInsightsPage';
import AiChat from './AiChatPage';

const BASE: AuthUser = {
  id: 'usr_1',
  name: 'Ada',
  email: 'ada@example.com',
  currency: 'USD',
  timezone: 'UTC',
  emailVerified: true,
  createdAt: '2026-01-01T00:00:00.000Z',
};

const VERIFIED: AuthUser = { ...BASE, emailVerified: true };
const UNVERIFIED: AuthUser = { ...BASE, emailVerified: false };

/** A populated summary (has a recent transaction, so the dashboard is past its first-run state). */
const SUMMARY: DashboardSummary = {
  month: { month: 9, year: 2026, timezone: 'UTC' },
  allTime: { income: '100.00', expense: '40.00', balance: '60.00' },
  currentMonth: { income: '100.00', expense: '40.00', net: '60.00' },
  budget: { amount: null, remaining: null, pctUsed: null },
  savings: { goalCount: 0, targetAmount: '0.00', savedAmount: '0.00', progressPct: null },
  recentTransactions: [
    {
      id: 't1',
      type: 'expense',
      amount: '40.00',
      description: 'Groceries',
      date: '2026-09-01T00:00:00.000Z',
      category: { id: 'c1', name: 'Food' },
      createdAt: '2026-09-01T00:00:00.000Z',
    },
  ],
};

const ANALYTICS: DashboardAnalytics = {
  months: 6,
  timezone: 'UTC',
  series: [
    { month: 9, year: 2026, income: '100.00', expense: '40.00', net: '60.00', balance: '60.00' },
  ],
  breakdown: {
    month: 9,
    year: 2026,
    total: '40.00',
    categories: [{ categoryId: 'c1', name: 'Food', total: '40.00', share: 100 }],
    other: { categoryCount: 0, total: '0.00' },
  },
};

function authValue(user: AuthUser): AuthContextValue {
  return {
    user,
    isRestoringSession: false,
    signIn: () => Promise.resolve(),
    signOut: () => Promise.resolve(),
    applyUser: () => undefined,
  };
}

function renderPage(page: ReactNode, user: AuthUser) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={authValue(user)}>
        <MemoryRouter>{page}</MemoryRouter>
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  fetchDashboardSummary.mockResolvedValue(SUMMARY);
  fetchDashboardAnalytics.mockResolvedValue(ANALYTICS);
  ai.listReports.mockResolvedValue([]);
});

describe('verified-email gate (client) — Analytics', () => {
  it('locks the page and makes no analytics request for an unverified account', async () => {
    renderPage(<Analytics />, UNVERIFIED);

    expect(await screen.findByText('Analytics are locked')).toBeInTheDocument();
    expect(
      screen.getByText('Verify your email to unlock your financial insights and analytics.'),
    ).toBeInTheDocument();
    expect(fetchDashboardAnalytics).not.toHaveBeenCalled();
  });

  it('requests analytics for a verified account', async () => {
    renderPage(<Analytics />, VERIFIED);

    await waitFor(() => {
      expect(fetchDashboardAnalytics).toHaveBeenCalled();
    });
    expect(screen.queryByText('Analytics are locked')).not.toBeInTheDocument();
  });
});

describe('verified-email gate (client) — AI', () => {
  it('locks AI Insights and loads no report history for an unverified account', async () => {
    renderPage(<AiInsights />, UNVERIFIED);

    expect(await screen.findByText('AI features are locked')).toBeInTheDocument();
    expect(screen.getByText('Verify your email to start using Finora AI.')).toBeInTheDocument();
    expect(ai.listReports).not.toHaveBeenCalled();
  });

  it('locks AI Chat and loads no history for an unverified account', async () => {
    renderPage(<AiChat />, UNVERIFIED);

    expect(await screen.findByText('AI features are locked')).toBeInTheDocument();
    expect(ai.listReports).not.toHaveBeenCalled();
  });

  it('mounts AI Insights and loads history for a verified account', async () => {
    renderPage(<AiInsights />, VERIFIED);

    await waitFor(() => {
      expect(ai.listReports).toHaveBeenCalled();
    });
    expect(screen.queryByText('AI features are locked')).not.toBeInTheDocument();
  });
});

describe('verified-email gate (client) — Dashboard', () => {
  it('keeps the summary but locks the charts and skips analytics for an unverified account', async () => {
    renderPage(<Dashboard />, UNVERIFIED);

    // The gated charts are replaced by the locked panel...
    expect(await screen.findByText('Analytics are locked')).toBeInTheDocument();
    // ...while the open summary still renders (the recent-transactions ledger is summary data).
    expect(screen.getByText('Groceries')).toBeInTheDocument();
    // ...and no refused analytics request was made.
    expect(fetchDashboardAnalytics).not.toHaveBeenCalled();
    expect(fetchDashboardSummary).toHaveBeenCalled();
    expect(screen.queryByText('Your dashboard did not load')).not.toBeInTheDocument();
  });

  it('requests analytics for a verified account', async () => {
    renderPage(<Dashboard />, VERIFIED);

    await waitFor(() => {
      expect(fetchDashboardAnalytics).toHaveBeenCalled();
    });
  });
});
