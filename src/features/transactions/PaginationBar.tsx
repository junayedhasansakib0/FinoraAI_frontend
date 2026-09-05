import { Button } from '@/components/ui/Button';

interface PaginationBarProps {
  /** Straight from the list envelope (§7). */
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}

/**
 * Previous and next only. A row of numbered pages would need ellipsis rules to survive a long
 * ledger, and the envelope already says where you are.
 */
export function PaginationBar({ page, totalPages, total, onPageChange }: PaginationBarProps) {
  const countLabel = `${String(total)} ${total === 1 ? 'transaction' : 'transactions'}`;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 py-4">
      <p className="text-sm text-muted tabular-nums">{countLabel}</p>

      {totalPages > 1 && (
        <nav aria-label="Pagination" className="flex items-center gap-4">
          <Button
            variant="quiet"
            size="sm"
            disabled={page <= 1}
            onClick={() => {
              onPageChange(page - 1);
            }}
          >
            Previous
          </Button>

          <p aria-live="polite" className="text-sm text-muted tabular-nums">
            Page {page} of {totalPages}
          </p>

          <Button
            variant="quiet"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => {
              onPageChange(page + 1);
            }}
          >
            Next
          </Button>
        </nav>
      )}
    </div>
  );
}
