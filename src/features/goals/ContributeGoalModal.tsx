import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { updateGoal } from '@/api/goals';
import { describeApiFailure } from '@/api/client';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { TextField } from '@/components/ui/TextField';
import { dashboardKeys } from '@/hooks/use-dashboard';
import { formatMoney } from '@/lib/format';
import { goalProgressSchema, type GoalProgressValues } from './schemas';

import type { Goal } from '@/types/api';

interface ContributeGoalModalProps {
  goal: Goal | null;
  currency: string;
  onClose: () => void;
  onDone: () => void;
}

function ContributeForm({
  goal,
  currency,
  onDone,
}: {
  goal: Goal;
  currency: string;
  onDone: () => void;
}) {
  const queryClient = useQueryClient();
  const [failure, setFailure] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<GoalProgressValues>({
    resolver: zodResolver(goalProgressSchema),
    defaultValues: { currentAmount: goal.currentAmount },
  });

  const mutation = useMutation({
    /** An absolute saved total, never a delta: the client does no money arithmetic (R-B3). */
    mutationFn: (values: GoalProgressValues) =>
      updateGoal(goal.id, { currentAmount: values.currentAmount }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['goals'] });
      void queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      onDone();
    },
    onError: (error) => setFailure(describeApiFailure(error).message),
  });

  const onSubmit = (values: GoalProgressValues) => {
    setFailure(null);
    mutation.mutate(values);
  };

  const pending = isSubmitting || mutation.isPending;

  return (
    <form
      onSubmit={(event) => {
        void handleSubmit(onSubmit)(event);
      }}
      className="space-y-4"
    >
      {failure !== null && (
        <div role="alert" className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          {failure}
        </div>
      )}

      <div className="rounded border border-line/60 bg-paper p-3 text-sm text-muted">
        <p>
          <span className="font-medium text-ink">{goal.name}</span>
        </p>
        <p className="mt-1">
          Target:{' '}
          <span className="font-medium text-ink">{formatMoney(goal.targetAmount, currency)}</span>
        </p>
      </div>

      <TextField
        label="Saved total"
        type="text"
        inputMode="decimal"
        placeholder="0.00"
        hint="Enter the total amount saved so far, not the amount you are adding."
        error={errors.currentAmount?.message}
        {...register('currentAmount')}
      />

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="quiet" type="button" onClick={onDone}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" disabled={pending}>
          {pending ? 'Saving...' : 'Update progress'}
        </Button>
      </div>
    </form>
  );
}

export function ContributeGoalModal({ goal, currency, onClose, onDone }: ContributeGoalModalProps) {
  return (
    <Modal open={goal !== null} onClose={onClose} title="Update Progress">
      {goal !== null && <ContributeForm goal={goal} currency={currency} onDone={onDone} />}
    </Modal>
  );
}
