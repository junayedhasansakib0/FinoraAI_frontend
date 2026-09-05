import { formatMoney, isNegativeMoney } from '@/lib/format';

import type { DashboardAllTime, DashboardSavings } from '@/types/api';

interface KpiCardsProps {
  allTime: DashboardAllTime;
  savings: DashboardSavings;
  /** The signed-in person's currency, from their profile. */
  currency: string;
}

/**
 * The four all-time figures §4.3 asks for. The balance leads because it is the one that answers
 * "where do I stand"; income, expenses and savings are the three that explain it, so they read at
 * the smaller size beneath. Every value arrives summed by the API — nothing here is derived (R-F6).
 */
export function KpiCards({ allTime, savings, currency }: KpiCardsProps) {
  const supporting = [
    { label: 'Total income', value: allTime.income, tone: 'text-income' },
    { label: 'Total expenses', value: allTime.expense, tone: 'text-expense' },
    { label: 'Total saved', value: savings.savedAmount, tone: '' },
  ];

  return (
    <section aria-labelledby="totals-heading">
      <h2 id="totals-heading" className="sr-only">
        All-time totals
      </h2>

      {/*
        `grid-cols-1` is declared rather than assumed: an implicit track sizes to the widest item's
        min-content, and a money string has no break opportunity to shrink to.
      */}
      <dl className="grid grid-cols-1 border-y border-line sm:grid-cols-3">
        <div className="border-b border-line py-7 sm:col-span-3">
          <dt className="text-sm text-muted">Total balance</dt>
          <dd
            className={`mt-2 font-serif text-4xl tabular-nums wrap-anywhere sm:text-5xl ${
              isNegativeMoney(allTime.balance) ? 'text-expense' : ''
            }`}
          >
            {formatMoney(allTime.balance, currency)}
          </dd>
        </div>

        {supporting.map((figure) => (
          <div
            key={figure.label}
            className="border-b border-line py-5 last:border-b-0 sm:border-b-0 sm:border-l sm:border-line sm:pl-6 sm:first:border-l-0 sm:first:pl-0"
          >
            <dt className="text-sm text-muted">{figure.label}</dt>
            <dd className={`mt-1 font-serif text-2xl tabular-nums wrap-anywhere ${figure.tone}`}>
              {formatMoney(figure.value, currency)}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
