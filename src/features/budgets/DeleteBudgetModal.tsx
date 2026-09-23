import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { deleteBudget } from '@/api/budgets';
import { describeApiFailure } from '@/api/client';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { dashboardKeys } from '@/hooks/use-dashboard';
import { formatMoney } from '@/lib/format';

import type { Budget } from '@/types/api';

interface DeleteBudgetModalProps {
  budget: Budget | null;
  currency: string;
  onClose: () => void;
  onDeleted: () => void;
}

export function DeleteBudgetModal({
  budget,
  currency,
  onClose,
  onDeleted,
}: DeleteBudgetModalProps) {
  const queryClient = useQueryClient();
  const [failure, setFailure] = useState<string | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteBudget(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['budgets'] });
      void queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      onDeleted();
    },
    onError: (error) => {
      setFailure(describeApiFailure(error).message);
    },
  });

  if (budget === null) {
    return null;
  }

  const scopeName =
    budget.categoryId === null
      ? 'Overall monthly budget'
      : (budget.categoryName ?? 'Category budget');

  return (
    <Modal open={budget !== null} onClose={onClose} title="Delete Budget">
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
          Are you sure you want to delete this budget? Tracking for this scope will be removed.
        </p>

        <div className="rounded border border-line/60 bg-paper p-3 text-sm">
          <p className="font-medium text-ink">{scopeName}</p>
          <p className="mt-1 text-muted">
            Budget:{' '}
            <span className="font-medium text-ink">{formatMoney(budget.amount, currency)}</span>
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button
            variant="quiet"
            type="button"
            onClick={onClose}
            disabled={deleteMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            type="button"
            onClick={() => deleteMutation.mutate(budget.id)}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete budget'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
