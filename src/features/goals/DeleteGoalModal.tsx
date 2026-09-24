import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { deleteGoal } from '@/api/goals';
import { describeApiFailure } from '@/api/client';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { dashboardKeys } from '@/hooks/use-dashboard';
import { formatMoney } from '@/lib/format';

import type { Goal } from '@/types/api';

interface DeleteGoalModalProps {
  goal: Goal | null;
  currency: string;
  onClose: () => void;
  onDeleted: () => void;
}

export function DeleteGoalModal({ goal, currency, onClose, onDeleted }: DeleteGoalModalProps) {
  const queryClient = useQueryClient();
  const [failure, setFailure] = useState<string | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteGoal(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['goals'] });
      void queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      onDeleted();
    },
    onError: (error) => {
      setFailure(describeApiFailure(error).message);
    },
  });

  if (goal === null) {
    return null;
  }

  return (
    <Modal open={goal !== null} onClose={onClose} title="Delete Goal">
      <div className="space-y-4">
        {failure !== null && (
          <div
            role="alert"
            className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800"
          >
            {failure}
          </div>
        )}

        <p className="text-sm text-muted">
          Are you sure you want to delete this goal? This cannot be undone.
        </p>

        <div className="rounded border border-line/60 bg-paper p-3 text-sm">
          <p className="font-medium text-ink">{goal.name}</p>
          <p className="mt-1 text-muted">
            Saved{' '}
            <span className="font-medium text-ink">{formatMoney(goal.currentAmount, currency)}</span>{' '}
            of{' '}
            <span className="font-medium text-ink">{formatMoney(goal.targetAmount, currency)}</span>
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="quiet" type="button" onClick={onClose} disabled={deleteMutation.isPending}>
            Cancel
          </Button>
          <Button
            variant="danger"
            type="button"
            onClick={() => deleteMutation.mutate(goal.id)}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete goal'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
