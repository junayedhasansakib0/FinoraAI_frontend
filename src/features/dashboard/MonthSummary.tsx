import { formatMoney, formatMonthLong, isNegativeMoney } from '@/lib/format';

import type { DashboardMonth, DashboardMonthTotals } from '@/types/api';

interface MonthSummaryProps {
  month: DashboardMonth;
  totals: DashboardMonthTotals;
  currency: string;
}

/**
 * The current month's flows. Which month that is was decided on the server, on the account
 * holder's own calendar (D9) — the browser's clock is never consulted, so someone in Dhaka reading
 * at 03:00 sees the month their bank would agree with. The zone is named because it is what makes
 * the figures reproducible.
 */
export function MonthSummary({ month, totals, currency }: MonthSummaryProps) {
  const figures = [
    { label: 'Income', value: totals.income, tone: 'text-income' },
    { label: 'Expenses', value: totals.expense, tone: 'text-expense' },
    { label: 'Net', value: totals.net, tone: isNegativeMoney(totals.net) ? 'text-expense' : '' },
  ];

  return (
    <section aria-labelledby="month-heading">
      <h2 id="month-heading" className="font-serif text-xl">
        {formatMonthLong(month.month, month.year)}
      </h2>
      <p className="mt-2 text-sm text-muted">
        Counted on the calendar of {month.timezone.replace(/_/g, ' ')}.
      </p>

      <dl className="mt-6 grid grid-cols-1 gap-y-4 sm:grid-cols-3 sm:gap-x-6">
        {figures.map((figure) => (
          <div key={figure.label}>
            <dt className="text-sm text-muted">{figure.label}</dt>
            <dd className={`mt-1 font-serif text-xl tabular-nums wrap-anywhere ${figure.tone}`}>
              {formatMoney(figure.value, currency)}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
