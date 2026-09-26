import { Link } from 'react-router';

import { describeApiFailure, EMAIL_VERIFICATION_REQUIRED_CODE } from '@/api/client';
import { AppShell } from '@/components/layout/AppShell';
import { EmptyState } from '@/components/states/EmptyState';
import { ErrorState } from '@/components/states/ErrorState';
import { useAuth } from '@/context/auth-context';
import { FeatureLocked } from '@/features/auth/FeatureLocked';
import { DailyAyahCard } from '@/features/ayah/DailyAyahCard';
import { CategoryBreakdownChart } from '@/features/dashboard/CategoryBreakdownChart';
import { DashboardSkeleton } from '@/features/dashboard/DashboardSkeleton';
import { IncomeExpenseChart } from '@/features/dashboard/IncomeExpenseChart';
import { KpiCards } from '@/features/dashboard/KpiCards';
import { MonthSummary } from '@/features/dashboard/MonthSummary';
import { NetTrendChart } from '@/features/dashboard/NetTrendChart';
import { ProgressMeters } from '@/features/dashboard/ProgressMeters';
import { RecentTransactions } from '@/features/dashboard/RecentTransactions';
import { RefreshingIndicator } from '@/features/dashboard/RefreshingIndicator';
import { useDashboardAnalytics, useDashboardSummary } from '@/hooks/use-dashboard';
import { ANALYTICS_MONTHS, ROUTES } from '@/lib/constants';
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

  // The month's summary stays open to unverified accounts; the analytics charts are the gated
  // "insights" surface (§7), so when the account is unverified that request is not made and a locked
  // panel takes the charts' place. A disabled query never leaves `pending`/`fetching`, so both are
  // read only when analytics is actually enabled.
  const locked = user !== null && !user.emailVerified;

  const summary = useDashboardSummary();
  const analytics = useDashboardAnalytics(ANALYTICS_MONTHS, { enabled: !locked });

  const isPending = summary.isPending || (!locked && analytics.isPending);
  const failure = summary.error ?? (locked ? null : analytics.error);
  const failureInfo = failure !== null ? describeApiFailure(failure) : null;
  const isRetrying = summary.isFetching || (!locked && analytics.isFetching);

  function retry() {
    void summary.refetch();
    if (!locked) {
      void analytics.refetch();
    }
  }

  return (
    <AppShell>
      {isPending ? (
        <DashboardSkeleton />
      ) : (
        <div aria-busy={isRetrying} className="space-y-12">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="font-serif text-3xl sm:text-4xl">Dashboard</h1>
            {/* A background refetch (e.g. after a transaction write) is signalled here so the
                still-cached figures below are not mistaken for the refreshed ones. The initial
                load never reaches this branch — it shows `DashboardSkeleton` above. */}
            <RefreshingIndicator active={failure === null && isRetrying} />
          </div>

          {/* A calm reflection, independent of the finance data — placed at the top of the
              dashboard as an intentional section, shown on both the empty and the populated view
              and hidden only while loading or after a load error. It fetches nothing (bundled
              dataset), so it cannot affect dashboard load time or push the finances down while data
              is still arriving. */}
          {failure === null && <DailyAyahCard />}

          {failureInfo !== null &&
            (failureInfo.code === EMAIL_VERIFICATION_REQUIRED_CODE && user !== null ? (
              <FeatureLocked
                title="Analytics are locked"
                message="Verify your email to unlock your financial insights and analytics."
                email={user.email}
              />
            ) : (
              <ErrorState
                title="Your dashboard did not load"
                message={failureInfo.message}
                retrying={isRetrying}
                onRetry={retry}
              />
            ))}

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

                {locked && user !== null ? (
                  // The charts are the gated surface; the ledger below stays open. The panel sits
                  // where the trends would be, so the page reads as complete rather than broken.
                  <>
                    <FeatureLocked
                      title="Analytics are locked"
                      message="Verify your email to unlock your financial insights and analytics."
                      email={user.email}
                    />
                    <RecentTransactions
                      transactions={summary.data.recentTransactions}
                      currency={currency}
                    />
                  </>
                ) : (
                  analytics.data !== undefined && (
                    <>
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
                  )
                )}
              </>
            )}
        </div>
      )}
    </AppShell>
  );
}
