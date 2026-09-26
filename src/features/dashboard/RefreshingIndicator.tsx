/**
 * Shown beside the Dashboard heading while an invalidated dashboard query is refetching in the
 * background — most visibly right after a transaction is created, edited or deleted. Until that
 * refetch lands, the page still shows the PREVIOUS cached figures (TanStack Query keeps them on
 * screen rather than flashing a skeleton), so this makes the refresh visible and stops the person
 * reading stale numbers as the final ones. It is intentionally absent on the very first load,
 * where `DashboardSkeleton` stands in for the whole view instead; the caller passes `active` only
 * when data is already on screen and being refreshed.
 */
export function RefreshingIndicator({ active }: { active: boolean }) {
  if (!active) {
    return null;
  }

  return (
    <p role="status" className="flex items-center gap-2 text-sm text-muted">
      <span aria-hidden="true" className="size-2 rounded-full bg-muted motion-safe:animate-pulse" />
      Refreshing…
    </p>
  );
}
