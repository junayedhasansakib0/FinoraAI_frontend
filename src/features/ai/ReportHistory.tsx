import { useQuery } from '@tanstack/react-query';

import { listReports } from '@/api/ai';
import { describeApiFailure } from '@/api/client';
import { EmptyState } from '@/components/states/EmptyState';
import { ErrorState } from '@/components/states/ErrorState';
import { formatTransactionDate } from '@/lib/format';

import { AI_REPORTS_QUERY_KEY, REPORT_LABELS } from './shared';

/**
 * The user's recent reports, newest first (ARCHITECTURE.md §7). Read-only: every row here was made
 * by one of the cards above, and generating a new one invalidates this query so it refreshes. Only
 * the kind and when it was made are listed — the full content stays with the card that produced it.
 */
export function ReportHistory() {
  const { data, isPending, isError, error, isFetching, refetch } = useQuery({
    queryKey: AI_REPORTS_QUERY_KEY,
    queryFn: ({ signal }) => listReports({}, signal),
  });

  const reports = data ?? [];

  return (
    <section className="space-y-5">
      <div>
        <h2 className="font-serif text-2xl">Recent reports</h2>
        <p className="mt-2 text-sm text-muted">The reports you have generated, newest first.</p>
      </div>

      {isError && (
        <ErrorState
          title="Could not load your reports"
          message={describeApiFailure(error).message}
          retrying={isFetching}
          onRetry={() => {
            void refetch();
          }}
        />
      )}

      {isPending && (
        <div className="space-y-3">
          <div className="h-12 w-full animate-pulse rounded bg-line/20" />
          <div className="h-12 w-full animate-pulse rounded bg-line/20" />
        </div>
      )}

      {!isPending && !isError && reports.length === 0 && (
        <EmptyState
          title="No reports yet"
          message="Generate a report above and it will appear here."
        />
      )}

      {!isPending && !isError && reports.length > 0 && (
        <ul className="divide-y divide-line border-y border-line">
          {reports.map((report) => (
            <li key={report.id} className="flex items-center justify-between gap-4 py-3">
              <span className="text-sm">{REPORT_LABELS[report.type]}</span>
              <span className="text-xs text-muted">{formatTransactionDate(report.createdAt)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
