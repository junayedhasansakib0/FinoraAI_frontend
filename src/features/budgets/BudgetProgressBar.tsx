import type { BudgetStatus } from '@/types/api';

interface BudgetProgressBarProps {
  pctUsed: number | null;
  status: BudgetStatus;
  spent: string;
  budgetAmount: string;
  currency?: string;
}

const STATUS_CONFIG: Record<
  BudgetStatus,
  {
    fillClass: string;
    badgeClass: string;
    label: string;
  }
> = {
  ok: {
    fillClass: 'bg-emerald-600',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    label: 'On Track',
  },
  warning: {
    fillClass: 'bg-amber-500',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    label: 'Warning (≥80%)',
  },
  exceeded: {
    fillClass: 'bg-rose-600',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    label: 'Exceeded (>100%)',
  },
};

export function BudgetProgressBar({
  pctUsed,
  status,
  spent,
  budgetAmount,
  currency = '$',
}: BudgetProgressBarProps) {
  const percentNumber = pctUsed ?? 0;
  const clampedPercent = Math.min(Math.max(percentNumber, 0), 100);
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.ok;

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between text-xs text-muted">
        <span>
          Spent {currency}{spent} of {currency}{budgetAmount}
        </span>
        <span className="font-medium text-ink">
          {pctUsed !== null ? `${pctUsed.toFixed(1)}%` : '0%'}
        </span>
      </div>

      <div
        role="progressbar"
        aria-valuenow={percentNumber}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Budget: ${percentNumber.toFixed(1)}% used`}
        className="h-2 w-full overflow-hidden rounded-full bg-line/40"
      >
        <div
          className={`h-full rounded-full transition-all duration-300 ${config.fillClass}`}
          style={{ width: `${clampedPercent}%` }}
        />
      </div>

      <div className="flex items-center justify-end">
        <span
          className={`inline-flex items-center rounded border px-2 py-0.5 text-[11px] font-medium ${config.badgeClass}`}
        >
          {config.label}
        </span>
      </div>
    </div>
  );
}