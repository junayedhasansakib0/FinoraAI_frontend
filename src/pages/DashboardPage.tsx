import { Link } from 'react-router';

import { describeApiFailure } from '@/api/client';
import { AppShell } from '@/components/layout/AppShell';
import { EmptyState } from '@/components/states/EmptyState';
import { ErrorState } from '@/components/states/ErrorState';
import { useAuth } from '@/context/auth-context';
import { CategoryBreakdownChart } from '@/features/dashboard/CategoryBreakdownChart';
import { DashboardSkeleton } from '@/features/dashboard/DashboardSkeleton';
import { IncomeExpenseChart } from '@/features/dashboard/IncomeExpenseChart';
import { KpiCards } from '@/features/dashboard/KpiCards';
import { MonthSummary } from '@/features/dashboard/MonthSummary';
import { NetTrendChart } from '@/features/dashboard/NetTrendChart';
import { ProgressMeters } from '@/features/dashboard/ProgressMeters';
import { RecentTransactions } from '@/features/dashboard/RecentTransactions';
import { useDashboardAnalytics, useDashboardSummary } from '@/hooks/use-dashboard';
import { ROUTES } from '@/lib/constants';
import { FALLBACK_CURRENCY } from '@/lib/format';

import type { DashboardSummary } from '@/types/api';

/**
 * The dashboard reads two endpoints and treats them as one view: they describe the same account at
 * the same moment, so a half-drawn dashboard would be worse than a skeleton. Every figure on the
 * page arrives already computed (R-B3) — nothing here does arithmetic, it only places and formats.
 */

/** The two charts and the breakdown share a row at desktop widths; `DashboardSkeleton` mirrors it. */
const CHART_ROW = 'grid grid-cols-1 gap-x-10 gap-y-12 lg:grid-cols-2';

/**
 * An account with no ledger, no budget and no goal has nothing to plot, and six months of empty
 * bars would say less than one sentence. Budgets and goals are Phases 6–7, so today only the first
 * clause can be false — it is written out in full so the state stays correct when they arrive.
 */
function isFirstRun(summary: DashboardSummary): boolean {
  return (
    summary.recentTransactions.length === 0 &&
    summary.budget.amount === null &&
    summary.savings.goalCount === 0
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const currency = user?.currency ?? FALLBACK_CURRENCY;

  const summary = useDashboardSummary();
  const analytics = useDashboardAnalytics();

  const isPending = summary.isPending || analytics.isPending;
  const failure = summary.error ?? analytics.error;
  const isRetrying = summary.isFetching || analytics.isFetching;

  function retry() {
    void summary.refetch();
    void analytics.refetch();
  }

  return (
    <AppShell>
      {isPending ? (
        <DashboardSkeleton />
      ) : (
        <div aria-busy={isRetrying} className="space-y-12">
          <h1 className="font-serif text-3xl sm:text-4xl">Dashboard</h1>

          {failure !== null && (
            <ErrorState
              title="Your dashboard did not load"
              message={describeApiFailure(failure).message}
              retrying={isRetrying}
              onRetry={retry}
            />
          )}

          {failure === null && summary.data !== undefined && isFirstRun(summary.data) && (
            <EmptyState
              title="Nothing to summarise yet"
              message="Record a transaction and this page fills in: balances, the month's income and expenses, six months of history, and where the money went."
              action={
                <Link
                  to={ROUTES.transactions}
                  className="text-ink underline underline-offset-4 transition-colors hover:text-ink-soft"
                >
                  Add the first transaction
                </Link>
              }
            />
          )}

          {failure === null &&
            summary.data !== undefined &&
            analytics.data !== undefined &&
            !isFirstRun(summary.data) && (
              <>
                <KpiCards
                  allTime={summary.data.allTime}
                  savings={summary.data.savings}
                  currency={currency}
                />

                <div className={CHART_ROW}>
                  <MonthSummary
                    month={summary.data.month}
                    totals={summary.data.currentMonth}
                    currency={currency}
                  />
                  <ProgressMeters
                    budget={summary.data.budget}
                    savings={summary.data.savings}
                    currency={currency}
                  />
                </div>

                <div className={CHART_ROW}>
                  <IncomeExpenseChart series={analytics.data.series} currency={currency} />
                  <NetTrendChart series={analytics.data.series} currency={currency} />
                </div>

                <div className={CHART_ROW}>
                  <CategoryBreakdownChart
                    breakdown={analytics.data.breakdown}
                    currency={currency}
                  />
                  <RecentTransactions
                    transactions={summary.data.recentTransactions}
                    currency={currency}
                  />
                </div>
              </>
            )}
        </div>
      )}
    </AppShell>
  );
}
