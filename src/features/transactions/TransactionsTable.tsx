import { Button } from '@/components/ui/Button';
import { formatTransactionDate } from '@/lib/format';

import { AMOUNT_CLASS, signedAmount } from './amount';

import type { Transaction } from '@/types/api';

interface TransactionsTableProps {
  transactions: Transaction[];
  currency: string;
  /** True only on a first load, when there is nothing on screen to keep. */
  isPending: boolean;
  /** True while a refetch runs behind rows that are already on screen. */
  isFetching: boolean;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}

interface RowActionsProps {
  transaction: Transaction;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}

/**
 * §3 asks for a table from 768px and cards below. Both markups are written out rather than one
 * being restyled into the other: a table forced to `display: block` loses the row and column
 * semantics that make it worth using, and a card has no columns to announce anyway. Only ever one
 * of the two is in the layout.
 */

const EMPTY_VALUE = '—';
const NO_CATEGORY = 'No category';
const SKELETON_ROWS = [0, 1, 2, 3, 4];

/** Read out of context, a row action still has to say which row it acts on. */
function rowLabel(transaction: Transaction): string {
  return `${transaction.description ?? 'transaction'} on ${formatTransactionDate(transaction.date)}`;
}

function RowActions({ transaction, onEdit, onDelete }: RowActionsProps) {
  const label = rowLabel(transaction);

  return (
    <div className="flex items-center gap-4">
      <Button
        variant="text"
        aria-label={`Edit ${label}`}
        onClick={() => {
          onEdit(transaction);
        }}
      >
        Edit
      </Button>
      <Button
        variant="text"
        aria-label={`Delete ${label}`}
        onClick={() => {
          onDelete(transaction);
        }}
      >
        Delete
      </Button>
    </div>
  );
}

/** The loading state of R-F5: bars where the values will be, at both widths. */
function ListSkeleton() {
  return (
    <div role="status" className="border-t border-line">
      <span className="sr-only">Loading transactions</span>
      {SKELETON_ROWS.map((row) => (
        <div key={row} className="flex items-center gap-6 border-b border-line py-4">
          <div className="h-3 w-20 bg-line motion-safe:animate-pulse" />
          <div className="h-3 flex-1 bg-line motion-safe:animate-pulse" />
          <div className="h-3 w-16 bg-line motion-safe:animate-pulse" />
        </div>
      ))}
    </div>
  );
}

export function TransactionsTable({
  transactions,
  currency,
  isPending,
  isFetching,
  onEdit,
  onDelete,
}: TransactionsTableProps) {
  if (isPending) {
    return <ListSkeleton />;
  }

  return (
    <div
      aria-busy={isFetching}
      className={isFetching ? 'opacity-60 transition-opacity' : 'transition-opacity'}
    >
      <table className="hidden w-full border-collapse md:table">
        <caption className="sr-only">Transactions matching the current filters</caption>
        <thead>
          <tr className="border-b border-line text-left text-sm text-muted">
            <th scope="col" className="py-3 pr-6 font-medium">
              Date
            </th>
            <th scope="col" className="py-3 pr-6 font-medium">
              Description
            </th>
            <th scope="col" className="py-3 pr-6 font-medium">
              Category
            </th>
            <th scope="col" className="py-3 pr-6 text-right font-medium">
              Amount
            </th>
            <th scope="col" className="py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id} className="border-b border-line align-baseline">
              <td className="py-4 pr-6 text-sm tabular-nums whitespace-nowrap text-muted">
                {formatTransactionDate(transaction.date)}
              </td>
              {/*
                `wrap-anywhere` on the two free-text columns: a description or a category name can
                be one unbroken 60-character token, and a table cannot shrink below its cells'
                min-content, so without it one row widens the table past the viewport.
              */}
              <td className="py-4 pr-6 wrap-anywhere">{transaction.description ?? EMPTY_VALUE}</td>
              <td className="py-4 pr-6 text-sm wrap-anywhere">
                {transaction.category?.name ?? <span className="text-muted">{NO_CATEGORY}</span>}
              </td>
              <td
                className={`py-4 pr-6 text-right font-medium tabular-nums whitespace-nowrap ${AMOUNT_CLASS[transaction.type]}`}
              >
                {signedAmount(transaction, currency)}
              </td>
              <td className="py-4">
                <RowActions transaction={transaction} onEdit={onEdit} onDelete={onDelete} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="border-t border-line md:hidden">
        {transactions.map((transaction) => (
          <li key={transaction.id} className="border-b border-line py-4">
            <div className="flex items-baseline justify-between gap-4">
              <span className="min-w-0 break-words">{transaction.description ?? EMPTY_VALUE}</span>
              <span
                className={`shrink-0 font-medium tabular-nums ${AMOUNT_CLASS[transaction.type]}`}
              >
                {signedAmount(transaction, currency)}
              </span>
            </div>

            <div className="mt-1 flex items-baseline justify-between gap-4 text-sm text-muted">
              <span className="min-w-0 truncate">{transaction.category?.name ?? NO_CATEGORY}</span>
              <span className="shrink-0 tabular-nums">
                {formatTransactionDate(transaction.date)}
              </span>
            </div>

            <div className="mt-2">
              <RowActions transaction={transaction} onEdit={onEdit} onDelete={onDelete} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
