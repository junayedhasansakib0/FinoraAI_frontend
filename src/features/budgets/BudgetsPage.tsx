import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { listBudgets } from '@/api/budgets';
import { describeApiFailure } from '@/api/client';
import { EmptyState } from '@/components/states/EmptyState';
import { ErrorState } from '@/components/states/ErrorState';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/auth-context';
import { formatMoney, FALLBACK_CURRENCY } from '@/lib/format';
import { BudgetFormModal } from './BudgetFormModal';
import { BudgetProgressBar } from './BudgetProgressBar';
import { DeleteBudgetModal } from './DeleteBudgetModal';

import type { Budget } from '@/types/api';

const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

const YEARS = [2024, 2025, 2026, 2027, 2028];

export function BudgetsPage() {
  const { user } = useAuth();
  const currency = user?.currency ?? FALLBACK_CURRENCY;

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [budgetToEdit, setBudgetToEdit] = useState<Budget | null>(null);
  const [budgetToDelete, setBudgetToDelete] = useState<Budget | null>(null);

  const {
    data: budgets,
    isPending,
    error,
    refetch,
  } = useQuery({
    queryKey: ['budgets', { month: selectedMonth, year: selectedYear }],
    queryFn: ({ signal }) =>
      listBudgets({ month: selectedMonth, year: selectedYear }, signal),
  });

  const monthLabel = MONTHS.find((m) => m.value === selectedMonth)?.label ?? 'Month';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Budgets</h1>
          <p className="mt-1 text-sm text-muted">
            Track monthly spending limits and prevent overspending.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <select
              aria-label="Filter by month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="rounded border border-line bg-surface px-3 py-1.5 text-sm font-medium text-ink shadow-xs focus:border-ink focus:outline-hidden"
            >
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>

            <select
              aria-label="Filter by year"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="rounded border border-line bg-surface px-3 py-1.5 text-sm font-medium text-ink shadow-xs focus:border-ink focus:outline-hidden"
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <Button
            variant="primary"
            onClick={() => setShowCreateModal(true)}
          >
            Create budget
          </Button>
        </div>
      </div>

      {isPending && (
        <div className="space-y-3">
          <div className="h-12 w-full animate-pulse rounded bg-line/30" />
          <div className="h-20 w-full animate-pulse rounded bg-line/20" />
          <div className="h-20 w-full animate-pulse rounded bg-line/20" />
        </div>
      )}

      {error !== null && !isPending && (
        <ErrorState
          title="Could not load budgets"
          message={describeApiFailure(error).message}
          onRetry={() => {
            void refetch();
          }}
        />
      )}

      {!isPending && error === null && (budgets?.length ?? 0) === 0 && (
        <EmptyState
          title={`No budgets for ${monthLabel} ${selectedYear}`}
          message="Set monthly spending limits for categories or an overall spending ceiling to monitor expenses."
          action={
            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
              Create your first budget
            </Button>
          }
        />
      )}

      {!isPending && error === null && (budgets?.length ?? 0) > 0 && (
        <>
          {/* Desktop & Tablet Table (≥768px) */}
          <div className="hidden md:block overflow-x-auto rounded border border-line bg-surface shadow-2xs">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-paper text-xs uppercase tracking-wider text-muted">
                  <th scope="col" className="px-5 py-3 font-medium">
                    Category / Scope
                  </th>
                  <th scope="col" className="px-5 py-3 text-right font-medium">
                    Budget
                  </th>
                  <th scope="col" className="px-5 py-3 text-right font-medium">
                    Spent
                  </th>
                  <th scope="col" className="px-5 py-3 text-right font-medium">
                    Remaining
                  </th>
                  <th scope="col" className="w-72 px-5 py-3 font-medium">
                    Progress
                  </th>
                  <th scope="col" className="px-5 py-3 text-right font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {budgets?.map((budget) => {
                  const isOverall = budget.categoryId === null;
                  return (
                    <tr key={budget.id} className="hover:bg-paper/50">
                      <td className="px-5 py-4 font-medium text-ink">
                        {isOverall ? (
                          <span className="inline-flex items-center gap-1.5 font-semibold">
                            <span className="h-2 w-2 rounded-full bg-ink" />
                            Overall budget
                          </span>
                        ) : (
                          budget.categoryName ?? '—'
                        )}
                      </td>
                      <td className="px-5 py-4 text-right tabular-nums text-ink">
                        {formatMoney(budget.amount, currency)}
                      </td>
                      <td className="px-5 py-4 text-right tabular-nums text-ink">
                        {formatMoney(budget.spent, currency)}
                      </td>
                      <td className="px-5 py-4 text-right tabular-nums">
                        <span
                          className={
                            Number(budget.remaining) < 0
                              ? 'font-medium text-rose-600'
                              : 'text-ink'
                          }
                        >
                          {formatMoney(budget.remaining, currency)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <BudgetProgressBar
                          pctUsed={budget.pctUsed}
                          status={budget.status}
                          spent={budget.spent}
                          budgetAmount={budget.amount}
                          currency={currency === 'USD' ? '$' : `${currency} `}
                        />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="quiet"
                            aria-label={`Edit budget for ${isOverall ? 'Overall' : budget.categoryName}`}
                            onClick={() => setBudgetToEdit(budget)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            aria-label={`Delete budget for ${isOverall ? 'Overall' : budget.categoryName}`}
                            onClick={() => setBudgetToDelete(budget)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards (<768px) */}
          <div className="space-y-4 md:hidden">
            {budgets?.map((budget) => {
              const isOverall = budget.categoryId === null;
              return (
                <div
                  key={budget.id}
                  className="rounded border border-line bg-surface p-4 shadow-2xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-ink">
                        {isOverall ? 'Overall monthly budget' : (budget.categoryName ?? 'Category')}
                      </h3>
                      <p className="text-xs text-muted">
                        Budget: {formatMoney(budget.amount, currency)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="quiet"
                        onClick={() => setBudgetToEdit(budget)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => setBudgetToDelete(budget)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>

                  <BudgetProgressBar
                    pctUsed={budget.pctUsed}
                    status={budget.status}
                    spent={budget.spent}
                    budgetAmount={budget.amount}
                    currency={currency === 'USD' ? '$' : `${currency} `}
                  />

                  <div className="grid grid-cols-2 gap-2 border-t border-line/60 pt-2 text-xs">
                    <div>
                      <span className="text-muted">Spent: </span>
                      <span className="font-medium text-ink">
                        {formatMoney(budget.spent, currency)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-muted">Remaining: </span>
                      <span
                        className={
                          Number(budget.remaining) < 0
                            ? 'font-medium text-rose-600'
                            : 'font-medium text-ink'
                        }
                      >
                        {formatMoney(budget.remaining, currency)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <BudgetFormModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        budget={null}
        defaultMonth={selectedMonth}
        defaultYear={selectedYear}
      />

      <BudgetFormModal
        open={budgetToEdit !== null}
        onClose={() => setBudgetToEdit(null)}
        budget={budgetToEdit}
      />

      <DeleteBudgetModal
        budget={budgetToDelete}
        currency={currency}
        onClose={() => setBudgetToDelete(null)}
        onDeleted={() => setBudgetToDelete(null)}
      />
    </div>
  );
}