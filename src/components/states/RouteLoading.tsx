import { AppShell } from '@/components/layout/AppShell';

/**
 * The gap between following a nav link and that route's chunk arriving (R-L4). The frame comes from
 * the entry bundle, so the header and nav are painted straight away and only the main column
 * changes when the page lands — no layout shift while the download runs.
 */
export function RouteLoading() {
  return (
    <AppShell>
      <div role="status">
        <span className="sr-only">Loading the page</span>
        <div className="h-9 w-52 bg-line motion-safe:animate-pulse" />
        <div className="mt-8 h-3 w-full max-w-xl bg-line motion-safe:animate-pulse" />
      </div>
    </AppShell>
  );
}
