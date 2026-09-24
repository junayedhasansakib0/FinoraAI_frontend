import { useMutation, useQueryClient } from '@tanstack/react-query';

import { describeApiFailure } from '@/api/client';
import { EmptyState } from '@/components/states/EmptyState';
import { ErrorState } from '@/components/states/ErrorState';
import { UnavailableState } from '@/components/states/UnavailableState';
import { Button } from '@/components/ui/Button';
import { formatTransactionDate } from '@/lib/format';

import { ReportContentView } from './ReportContentView';
import { AI_REPORTS_QUERY_KEY } from './shared';

import type { AiReport, AiReportType } from '@/types/api';
import type { ReactNode } from 'react';

interface ReportCardProps {
  title: string;
  description: string;
  type: AiReportType;
  /** Generate, or with `refresh` force-regenerate past the server's 24h reuse (R-I6). */
  run: (refresh: boolean) => Promise<AiReport>;
  /** Extra inputs shown above the actions — the month/year picker for the monthly summary. */
  controls?: ReactNode;
  /** False disables generation (e.g. an incomplete picker); `disabledHint` says why. */
  canGenerate?: boolean;
  disabledHint?: string;
}

/** Map a report failure to the right R-F5 state: NO_DATA is empty, quota/AI-down are degraded, rest error. */
function ReportFailure({
  failure,
  onRetry,
}: {
  failure: { code: string; message: string };
  onRetry: () => void;
}) {
  if (failure.code === 'NO_DATA') {
    return <EmptyState title="Not enough data yet" message={failure.message} />;
  }
  if (failure.code === 'RATE_LIMITED') {
    return <UnavailableState title="AI limit reached" message={failure.message} />;
  }
  if (failure.code === 'AI_UNAVAILABLE' || failure.code === 'UPSTREAM_UNAVAILABLE') {
    return (
      <UnavailableState title="AI is unavailable right now" message={failure.message} onRetry={onRetry} />
    );
  }
  return <ErrorState title="Could not generate this report" message={failure.message} onRetry={onRetry} />;
}

/**
 * One report kind on the Insights page: its blurb, optional inputs, a generate/refresh action, and
 * — once run — the plain-text result with its "generated"/"reused" line and the disclaimer that
 * rides on every report (R-I5). A fresh generation invalidates the history list below.
 */
export function ReportCard({
  title,
  description,
  type,
  run,
  controls,
  canGenerate = true,
  disabledHint,
}: ReportCardProps) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (refresh: boolean) => run(refresh),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: AI_REPORTS_QUERY_KEY });
    },
  });

  const report = mutation.data ?? null;
  const failure = mutation.isError ? describeApiFailure(mutation.error) : null;

  return (
    <section className="flex flex-col border border-line p-6">
      <div>
        <h2 className="font-serif text-2xl">{title}</h2>
        <p className="mt-2 max-w-[52ch] text-sm text-muted">{description}</p>
      </div>

      {controls !== undefined && <div className="mt-5">{controls}</div>}

      <div className="mt-5 flex-1">
        {mutation.isPending && (
          <div className="space-y-3">
            <div className="h-4 w-3/4 animate-pulse rounded bg-line/20" />
            <div className="h-4 w-full animate-pulse rounded bg-line/20" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-line/20" />
          </div>
        )}

        {!mutation.isPending && failure !== null && (
          <ReportFailure
            failure={failure}
            onRetry={() => {
              mutation.mutate(false);
            }}
          />
        )}

        {!mutation.isPending && failure === null && report !== null && (
          <div className="space-y-5">
            <ReportContentView type={type} content={report.content} />
            <p className="text-xs text-muted">
              {report.cached
                ? `Reused from a report generated ${formatTransactionDate(report.createdAt)} (within 24h). Refresh to regenerate.`
                : `Generated ${formatTransactionDate(report.createdAt)}.`}
            </p>
            <p className="border-t border-line pt-4 text-xs leading-5 text-muted">
              {report.disclaimer}
            </p>
          </div>
        )}

        {!mutation.isPending && failure === null && report === null && (
          <p className="text-sm text-muted">No report generated yet.</p>
        )}
      </div>

      <div className="mt-6 flex items-center gap-3">
        {report === null ? (
          <Button
            variant="primary"
            onClick={() => {
              mutation.mutate(false);
            }}
            disabled={mutation.isPending || !canGenerate}
          >
            {mutation.isPending ? 'Generating…' : 'Generate'}
          </Button>
        ) : (
          <Button
            variant="quiet"
            onClick={() => {
              mutation.mutate(true);
            }}
            disabled={mutation.isPending || !canGenerate}
          >
            {mutation.isPending ? 'Refreshing…' : 'Refresh'}
          </Button>
        )}

        {!canGenerate && disabledHint !== undefined && (
          <span className="text-xs text-muted">{disabledHint}</span>
        )}
      </div>
    </section>
  );
}
