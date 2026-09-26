import { useState } from 'react';
import { Link } from 'react-router';

import { describeApiFailure, EMAIL_VERIFICATION_REQUIRED_CODE } from '@/api/client';
import { AppShell } from '@/components/layout/AppShell';
import { EmptyState } from '@/components/states/EmptyState';
import { ErrorState } from '@/components/states/ErrorState';
import { useAuth } from '@/context/auth-context';
import { FeatureLocked } from '@/features/auth/FeatureLocked';
import { CategoryBreakdownChart } from '@/features/dashboard/CategoryBreakdownChart';
import { IncomeExpenseChart } from '@/features/dashboard/IncomeExpenseChart';
import { NetTrendChart } from '@/features/dashboard/NetTrendChart';
import { useDashboardAnalytics } from '@/hooks/use-dashboard';
import { ROUTES } from '@/lib/constants';
import { FALLBACK_CURRENCY } from '@/lib/format';

import type { AnalyticsPoint } from '@/types/api';

/**
 * The analytics page reuses the `/dashboard/analytics` endpoint (§5, §7) — the same figures the
 * dashboard plots, given room to breathe and a longer window to choose. Every number arrives
 * already computed (R-B3); this page only picks the range and lays the charts out.
 */

/** The server serves at most twelve months (R-N5); these are the two windows offered. */
const RANGES = [6, 12] as const;

const CHART_ROW = 'grid grid-cols-1 gap-x-10 gap-y-12 lg:grid-cols-2';
const BAR = 'bg-line motion-safe:animate-pulse';

function hasActivity(series: AnalyticsPoint[]): boolean {
  return series.some((point) => point.income !== '0.00' || point.expense !== '0.00');
}

function AnalyticsSkeleton() {
  return (
    <div role="status" className={CHART_ROW}>
      <span className="sr-only">Loading your analytics</span>
      {[0, 1, 2].map((block) => (
        <div key={block} className="min-w-0">
          <div className={`h-6 w-44 ${BAR}`} />
          <div className={`mt-3 h-3 w-full max-w-sm ${BAR}`} />
          <div className={`mt-6 h-60 w-full sm:h-72 ${BAR}`} />
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const currency = user?.currency ?? FALLBACK_CURRENCY;
  const [months, setMonths] = useState<number>(RANGES[0]);

  // Analytics is a verified-only surface (§7). When the account is known-unverified the request is
  // not made at all (`enabled: false`) — the locked panel is shown in its place.
  const locked = user !== null && !user.emailVerified;
  const analytics = useDashboardAnalytics(months, { enabled: !locked });
  const isRetrying = analytics.isFetching;
  const failure = analytics.error !== null ? describeApiFailure(analytics.error) : null;

  return (
    <AppShell>
      <div aria-busy={isRetrying} className="space-y-10">
        <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl">Analytics</h1>
            <p className="mt-3 max-w-[54ch] leading-7 text-ink-soft">
              Income against expenses, your net trend, and where this month went.
            </p>
          </div>

          {!locked && (
            <div
              role="group"
              aria-label="Months of history"
              className="flex shrink-0 border border-line"
            >
              {RANGES.map((range) => {
                const active = range === months;

                return (
                  <button
                    key={range}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      setMonths(range);
                    }}
                    className={`px-4 py-2 text-sm transition-colors ${
                      active ? 'bg-ink text-paper' : 'text-muted hover:text-ink'
                    }`}
                  >
                    {range} months
                  </button>
                );
              })}
            </div>
          )}
        </header>

        {locked && user !== null ? (
          <FeatureLocked
            title="Analytics are locked"
            message="Verify your email to unlock your financial insights and analytics."
            email={user.email}
          />
        ) : analytics.isPending ? (
          <AnalyticsSkeleton />
        ) : failure !== null ? (
          failure.code === EMAIL_VERIFICATION_REQUIRED_CODE && user !== null ? (
            <FeatureLocked
              title="Analytics are locked"
              message="Verify your email to unlock your financial insights and analytics."
              email={user.email}
            />
          ) : (
            <ErrorState
              title="Your analytics did not load"
              message={failure.message}
              retrying={isRetrying}
              onRetry={() => {
                void analytics.refetch();
              }}
            />
          )
        ) : analytics.data !== undefined && !hasActivity(analytics.data.series) ? (
          <EmptyState
            title="Nothing to chart yet"
            message="Once you have recorded some income and expenses, this page plots how they move over time and where your money goes."
            action={
              <Link
                to={ROUTES.transactions}
                className="text-ink underline underline-offset-4 transition-colors hover:text-ink-soft"
              >
                Add a transaction
              </Link>
            }
          />
        ) : analytics.data !== undefined ? (
          <>
            <div className={CHART_ROW}>
              <IncomeExpenseChart series={analytics.data.series} currency={currency} />
              <NetTrendChart series={analytics.data.series} currency={currency} />
            </div>
            <div className={CHART_ROW}>
              <CategoryBreakdownChart breakdown={analytics.data.breakdown} currency={currency} />
            </div>
          </>
        ) : null}
      </div>
    </AppShell>
  );
}
