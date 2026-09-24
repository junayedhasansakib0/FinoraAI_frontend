import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { createGoal, updateGoal } from '@/api/goals';
import { describeApiFailure } from '@/api/client';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { TextField } from '@/components/ui/TextField';
import { dashboardKeys } from '@/hooks/use-dashboard';
import { toDateInputValue } from '@/lib/format';
import { goalFormSchema, type GoalFormValues } from './schemas';

import type { GoalUpdateInput } from '@/api/goals';
import type { Goal } from '@/types/api';

interface GoalFormModalProps {
  open: boolean;
  onClose: () => void;
  goal: Goal | null;
}

function defaultValues(goal: Goal | null): GoalFormValues {
  if (goal === null) {
    return { name: '', targetAmount: '', currentAmount: '', deadline: '' };
  }

  return {
    name: goal.name,
    targetAmount: goal.targetAmount,
    currentAmount: goal.currentAmount,
    deadline: toDateInputValue(goal.deadline),
  };
}

function GoalForm({ goal, onDone }: { goal: Goal | null; onDone: () => void }) {
  const queryClient = useQueryClient();
  const [failure, setFailure] = useState<string | null>(null);

  const isEditing = goal !== null;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<GoalFormValues>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: defaultValues(goal),
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['goals'] });
    void queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    onDone();
  };

  const createMutation = useMutation({
    mutationFn: (values: GoalFormValues) =>
      createGoal({
        name: values.name,
        targetAmount: values.targetAmount,
        currentAmount: values.currentAmount === '' ? undefined : values.currentAmount,
        deadline: values.deadline,
      }),
    onSuccess: invalidate,
    onError: (error) => setFailure(describeApiFailure(error).message),
  });

  const updateMutation = useMutation({
    mutationFn: (values: GoalFormValues) => {
      const patch: GoalUpdateInput = {
        name: values.name,
        targetAmount: values.targetAmount,
        deadline: values.deadline,
      };
      if (values.currentAmount !== '') {
        patch.currentAmount = values.currentAmount;
      }
      return updateGoal(goal!.id, patch);
    },
    onSuccess: invalidate,
    onError: (error) => setFailure(describeApiFailure(error).message),
  });

  const onSubmit = (values: GoalFormValues) => {
    setFailure(null);
    if (isEditing) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  };

  const pending = isSubmitting || createMutation.isPending || updateMutation.isPending;

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

      <TextField
        label="Name"
        type="text"
        placeholder="Emergency fund"
        error={errors.name?.message}
        {...register('name')}
      />

      <TextField
        label="Target"
        type="text"
        inputMode="decimal"
        placeholder="0.00"
        error={errors.targetAmount?.message}
        {...register('targetAmount')}
      />

      <TextField
        label="Saved"
        type="text"
        inputMode="decimal"
        placeholder="0.00"
        hint={isEditing ? undefined : 'Optional — how much you have already put aside.'}
        error={errors.currentAmount?.message}
        {...register('currentAmount')}
      />

      <TextField
        label="Deadline"
        type="date"
        error={errors.deadline?.message}
        {...register('deadline')}
      />

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="quiet" type="button" onClick={onDone}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" disabled={pending}>
          {pending ? 'Saving...' : isEditing ? 'Update goal' : 'Create goal'}
        </Button>
      </div>
    </form>
  );
}

export function GoalFormModal({ open, onClose, goal }: GoalFormModalProps) {
  return (
    <Modal open={open} onClose={onClose} title={goal !== null ? 'Edit Goal' : 'Create Goal'}>
      <GoalForm goal={goal} onDone={onClose} />
    </Modal>
  );
}
