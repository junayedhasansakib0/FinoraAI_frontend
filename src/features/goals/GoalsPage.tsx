import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { listGoals } from '@/api/goals';
import { describeApiFailure } from '@/api/client';
import { EmptyState } from '@/components/states/EmptyState';
import { ErrorState } from '@/components/states/ErrorState';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/auth-context';
import { formatMoney, formatTransactionDate, FALLBACK_CURRENCY } from '@/lib/format';
import { ContributeGoalModal } from './ContributeGoalModal';
import { DeleteGoalModal } from './DeleteGoalModal';
import { GoalFormModal } from './GoalFormModal';
import { GoalProgressBar } from './GoalProgressBar';

import type { Goal } from '@/types/api';

/** A plain-language countdown from the server's `daysRemaining`; the client does no date math. */
function deadlineLabel(goal: Goal): string {
  if (goal.completed) {
    return 'Goal reached';
  }

  if (goal.deadlineStatus === 'past-deadline') {
    const overdueDays = Math.abs(goal.daysRemaining);
    return `Overdue by ${overdueDays} day${overdueDays === 1 ? '' : 's'}`;
  }

  if (goal.daysRemaining <= 0) {
    return 'Due today';
  }

  return `${goal.daysRemaining} day${goal.daysRemaining === 1 ? '' : 's'} left`;
}

export function GoalsPage() {
  const { user } = useAuth();
  const currency = user?.currency ?? FALLBACK_CURRENCY;

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<Goal | null>(null);
  const [goalToContribute, setGoalToContribute] = useState<Goal | null>(null);
  const [goalToDelete, setGoalToDelete] = useState<Goal | null>(null);

  const { data: goals, isPending, error, refetch } = useQuery({
    queryKey: ['goals'],
    queryFn: ({ signal }) => listGoals(signal),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Savings Goals</h1>
          <p className="mt-1 text-sm text-muted">
            Set targets, track what you have saved, and watch your deadlines.
          </p>
        </div>

        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          Create goal
        </Button>
      </div>

      {isPending && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="h-44 w-full animate-pulse rounded bg-line/20" />
          <div className="h-44 w-full animate-pulse rounded bg-line/20" />
          <div className="h-44 w-full animate-pulse rounded bg-line/20" />
        </div>
      )}

      {error !== null && !isPending && (
        <ErrorState
          title="Could not load goals"
          message={describeApiFailure(error).message}
          onRetry={() => {
            void refetch();
          }}
        />
      )}

      {!isPending && error === null && (goals?.length ?? 0) === 0 && (
        <EmptyState
          title="No savings goals yet"
          message="Create a goal to set a target amount and a deadline, then track your progress toward it."
          action={
            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
              Create your first goal
            </Button>
          }
        />
      )}

      {!isPending && error === null && (goals?.length ?? 0) > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {goals?.map((goal) => (
            <div
              key={goal.id}
              className="flex flex-col gap-4 rounded border border-line bg-surface p-5 shadow-2xs"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate font-medium text-ink">{goal.name}</h2>
                  <p className="mt-0.5 text-xs text-muted">
                    Due {formatTransactionDate(goal.deadline)} · {deadlineLabel(goal)}
                  </p>
                </div>
              </div>

              <GoalProgressBar
                progressPct={goal.progressPct}
                deadlineStatus={goal.deadlineStatus}
                completed={goal.completed}
              />

              <div className="grid grid-cols-3 gap-2 border-t border-line/60 pt-3 text-xs">
                <div>
                  <span className="block text-muted">Saved</span>
                  <span className="font-medium text-ink">
                    {formatMoney(goal.currentAmount, currency)}
                  </span>
                </div>
                <div>
                  <span className="block text-muted">Target</span>
                  <span className="font-medium text-ink">
                    {formatMoney(goal.targetAmount, currency)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="block text-muted">Remaining</span>
                  <span className="font-medium text-ink">
                    {formatMoney(goal.remaining, currency)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-line/60 pt-3">
                <Button
                  size="sm"
                  variant="secondary"
                  aria-label={`Update progress for ${goal.name}`}
                  onClick={() => setGoalToContribute(goal)}
                >
                  Update progress
                </Button>
                <Button
                  size="sm"
                  variant="quiet"
                  aria-label={`Edit ${goal.name}`}
                  onClick={() => setGoalToEdit(goal)}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  aria-label={`Delete ${goal.name}`}
                  onClick={() => setGoalToDelete(goal)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <GoalFormModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        goal={null}
      />

      <GoalFormModal
        open={goalToEdit !== null}
        onClose={() => setGoalToEdit(null)}
        goal={goalToEdit}
      />

      <ContributeGoalModal
        goal={goalToContribute}
        currency={currency}
        onClose={() => setGoalToContribute(null)}
        onDone={() => setGoalToContribute(null)}
      />

      <DeleteGoalModal
        goal={goalToDelete}
        currency={currency}
        onClose={() => setGoalToDelete(null)}
        onDeleted={() => setGoalToDelete(null)}
      />
    </div>
  );
}
