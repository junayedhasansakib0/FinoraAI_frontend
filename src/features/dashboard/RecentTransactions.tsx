import { Link } from 'react-router';

import { EmptyState } from '@/components/states/EmptyState';
import { AMOUNT_CLASS, signedAmount } from '@/features/transactions/amount';
import { ROUTES } from '@/lib/constants';
import { formatTransactionDate } from '@/lib/format';

import type { Transaction } from '@/types/api';

interface RecentTransactionsProps {
  transactions: Transaction[];
  currency: string;
}

const LINK_CLASS = 'text-ink underline underline-offset-4 transition-colors hover:text-ink-soft';

/**
 * The five newest rows, in the shape `/transactions` publishes them. The amounts are written by the
 * ledger's own `signedAmount`, so a row here and the same row on the ledger page cannot drift apart
 * — which is why this reaches across into `features/transactions` rather than restating the rule.
 */
export function RecentTransactions({ transactions, currency }: RecentTransactionsProps) {
  return (
    <section aria-labelledby="recent-heading">
      <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
        <h2 id="recent-heading" className="font-serif text-xl">
          Recent transactions
        </h2>
        <Link to={ROUTES.transactions} className={`text-sm ${LINK_CLASS}`}>
          All transactions
        </Link>
      </div>

      {transactions.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="Nothing recorded yet"
            message="The five newest transactions appear here once the ledger has some."
            action={
              <Link to={ROUTES.transactions} className={LINK_CLASS}>
                Add the first transaction
              </Link>
            }
          />
        </div>
      ) : (
        <ul className="mt-6 border-t border-line">
          {transactions.map((transaction) => (
            <li key={transaction.id} className="border-b border-line py-3">
              <div className="flex items-baseline justify-between gap-4">
                <span className="min-w-0 wrap-anywhere">{transaction.description ?? '—'}</span>
                <span
                  className={`shrink-0 font-medium tabular-nums ${AMOUNT_CLASS[transaction.type]}`}
                >
                  {signedAmount(transaction, currency)}
                </span>
              </div>

              <div className="mt-1 flex items-baseline justify-between gap-4 text-sm text-muted">
                <span className="min-w-0 truncate">
                  {transaction.category?.name ?? 'No category'}
                </span>
                <span className="shrink-0 tabular-nums">
                  {formatTransactionDate(transaction.date)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
