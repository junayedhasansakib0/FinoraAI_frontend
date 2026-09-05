import { formatMoney } from '@/lib/format';

import type { TransactionTotals as Totals } from '@/types/api';

interface TransactionTotalsProps {
  totals: Totals;
  /** The signed-in person's currency, from their profile. */
  currency: string;
}

/**
 * Both figures arrive summed by the API for the whole filter (§7). Nothing here adds, subtracts,
 * or nets them: the client only formats money (R-F6), so there is no total line either.
 */
export function TransactionTotals({ totals, currency }: TransactionTotalsProps) {
  return (
    <section aria-live="polite" className="border-y border-line py-5">
      {/*
        Two columns only from 640px up: at 360px each half is ~120px, which a seven-figure sum in a
        24px serif overruns, and a money string has nowhere to wrap. Stacked, each figure has the
        full column — declared as `grid-cols-1`, so the track is the container rather than the
        figure's own min-content.
      */}
      <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
        <div>
          <dt className="text-sm text-muted">Total income</dt>
          <dd className="mt-1 font-serif text-2xl tabular-nums text-income sm:text-3xl">
            {formatMoney(totals.income, currency)}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-muted">Total expense</dt>
          <dd className="mt-1 font-serif text-2xl tabular-nums text-expense sm:text-3xl">
            {formatMoney(totals.expense, currency)}
          </dd>
        </div>
      </dl>

      <p className="mt-4 text-sm text-muted">
        Both sums cover every transaction that matches the filters, not only this page.
      </p>
    </section>
  );
}
