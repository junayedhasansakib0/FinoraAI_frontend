import { useState } from 'react';

import { describeApiFailure } from '@/api/client';
import { AppShell } from '@/components/layout/AppShell';
import { EmptyState } from '@/components/states/EmptyState';
import { ErrorState } from '@/components/states/ErrorState';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/auth-context';
import { CategoryManagerModal } from '@/features/categories-settings/CategoryManagerModal';
import { DeleteTransactionModal } from '@/features/transactions/DeleteTransactionModal';
import { DEFAULT_FILTERS, hasActiveFilters } from '@/features/transactions/filters';
import { PaginationBar } from '@/features/transactions/PaginationBar';
import { TransactionFilters } from '@/features/transactions/TransactionFilters';
import { TransactionFormModal } from '@/features/transactions/TransactionFormModal';
import { TransactionsTable } from '@/features/transactions/TransactionsTable';
import { TransactionTotals } from '@/features/transactions/TransactionTotals';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useTransactions } from '@/hooks/use-transactions';
import { FALLBACK_CURRENCY } from '@/lib/format';

import type { TransactionFilters as Filters } from '@/api/transactions';
import type { Transaction } from '@/types/api';

/**
 * The ledger. Filter values live here rather than inside the filter bar, so the query, the totals,
 * the table, and the empty state all read the same answer to "what is being asked for" (§3).
 */

/** Long enough that a typed word costs one request, short enough to still feel immediate. */
const TEXT_FILTER_DELAY_MS = 300;

/** `'new'` while adding, the row itself while editing, `null` while the form is closed. */
type FormTarget = Transaction | 'new';

interface LedgerEmptyProps {
  isFiltered: boolean;
  /** The filter matches rows, just none on the page being read — usually after a delete. */
  isPastEnd: boolean;
  onAdd: () => void;
  onClearFilters: () => void;
  onFirstPage: () => void;
}

/** Three ways to be looking at no rows, and each one has its own way out (R-F5). */
function LedgerEmpty({
  isFiltered,
  isPastEnd,
  onAdd,
  onClearFilters,
  onFirstPage,
}: LedgerEmptyProps) {
  if (isPastEnd) {
    return (
      <EmptyState
        title="Nothing on this page"
        message="The ledger is shorter than the page you were reading. The rows are still there, further back."
        action={
          <Button variant="secondary" onClick={onFirstPage}>
            Back to the first page
          </Button>
        }
      />
    );
  }

  if (isFiltered) {
    return (
      <EmptyState
        title="Nothing matches these filters"
        message="Widen the dates or the amounts, or clear the filters to read the whole ledger again."
        action={
          <Button variant="secondary" onClick={onClearFilters}>
            Clear all filters
          </Button>
        }
      />
    );
  }

  return (
    <EmptyState
      title="The ledger is empty"
      message="Record the first transaction and it will appear here, counted in the totals above."
      action={
        <Button variant="primary" onClick={onAdd}>
          Add transaction
        </Button>
      }
    />
  );
}

export default function TransactionsPage() {
  const { user } = useAuth();
  const currency = user?.currency ?? FALLBACK_CURRENCY;

  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [formTarget, setFormTarget] = useState<FormTarget | null>(null);
  const [deleting, setDeleting] = useState<Transaction | null>(null);
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  /**
   * The typed filters trail the fields by a moment; selects, sort, and page apply at once.
   * Debouncing the whole object instead would settle on a new identity every render.
   */
  const search = useDebouncedValue(filters.search, TEXT_FILTER_DELAY_MS);
  const minAmount = useDebouncedValue(filters.minAmount, TEXT_FILTER_DELAY_MS);
  const maxAmount = useDebouncedValue(filters.maxAmount, TEXT_FILTER_DELAY_MS);
  const query: Filters = { ...filters, search, minAmount, maxAmount };

  const { data, isPending, isError, error, isFetching, refetch } = useTransactions(query);

  /** A narrowed or reordered ledger makes the page you were on meaningless, so it returns to 1. */
  function changeFilters(patch: Partial<Filters>) {
    setFilters((current) => ({ ...current, ...patch, page: 1 }));
  }

  function clearFilters() {
    setFilters(DEFAULT_FILTERS);
  }

  function goToPage(page: number) {
    setFilters((current) => ({ ...current, page }));
  }

  function addTransaction() {
    setFormTarget('new');
  }

  function editTransaction(transaction: Transaction) {
    setFormTarget(transaction);
  }

  function closeForm() {
    setFormTarget(null);
  }

  function askDelete(transaction: Transaction) {
    setDeleting(transaction);
  }

  function closeDelete() {
    setDeleting(null);
  }

  /** The row that just went may have been the only one on this page, which would leave it blank. */
  function afterDelete() {
    if (data !== undefined && data.items.length === 1 && data.page > 1) {
      goToPage(data.page - 1);
    }

    setDeleting(null);
  }

  function openCategories() {
    setCategoriesOpen(true);
  }

  function closeCategories() {
    setCategoriesOpen(false);
  }

  const isFiltered = hasActiveFilters(query);

  return (
    <AppShell>
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <h1 className="font-serif text-3xl sm:text-4xl">Transactions</h1>

        <div className="flex flex-wrap items-center gap-4">
          <Button variant="quiet" onClick={openCategories}>
            Manage categories
          </Button>
          <Button variant="primary" onClick={addTransaction}>
            Add transaction
          </Button>
        </div>
      </div>

      <div className="mt-8">
        <TransactionFilters filters={filters} onChange={changeFilters} onClear={clearFilters} />
      </div>

      {data !== undefined && (
        <div className="mt-8">
          <TransactionTotals totals={data.totals} currency={currency} />
        </div>
      )}

      <div className="mt-8">
        {isError && (
          <ErrorState
            title="Your transactions did not load"
            message={describeApiFailure(error).message}
            retrying={isFetching}
            onRetry={() => {
              void refetch();
            }}
          />
        )}

        {isPending && (
          <TransactionsTable
            transactions={[]}
            currency={currency}
            isPending
            isFetching={false}
            onEdit={editTransaction}
            onDelete={askDelete}
          />
        )}

        {data !== undefined && data.items.length === 0 && !isError && (
          <LedgerEmpty
            isFiltered={isFiltered}
            isPastEnd={data.total > 0}
            onAdd={addTransaction}
            onClearFilters={clearFilters}
            onFirstPage={() => {
              goToPage(1);
            }}
          />
        )}

        {data !== undefined && data.items.length > 0 && (
          <>
            <TransactionsTable
              transactions={data.items}
              currency={currency}
              isPending={false}
              isFetching={isFetching}
              onEdit={editTransaction}
              onDelete={askDelete}
            />
            <PaginationBar
              page={data.page}
              totalPages={data.totalPages}
              total={data.total}
              onPageChange={goToPage}
            />
          </>
        )}
      </div>

      <TransactionFormModal
        open={formTarget !== null}
        transaction={formTarget === 'new' ? null : formTarget}
        onClose={closeForm}
      />

      <DeleteTransactionModal
        transaction={deleting}
        currency={currency}
        onClose={closeDelete}
        onDeleted={afterDelete}
      />

      <CategoryManagerModal open={categoriesOpen} onClose={closeCategories} />
    </AppShell>
  );
}
