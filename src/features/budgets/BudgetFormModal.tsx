import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { createBudget, updateBudget } from '@/api/budgets';
import { describeApiFailure } from '@/api/client';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { TextField } from '@/components/ui/TextField';
import { useCategories } from '@/hooks/use-categories';
import { dashboardKeys } from '@/hooks/use-dashboard';
import { budgetFormSchema, type BudgetFormValues } from './schemas';

import type { Budget } from '@/types/api';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

interface BudgetFormModalProps {
  open: boolean;
  onClose: () => void;
  budget: Budget | null;
  defaultMonth?: number;
  defaultYear?: number;
}

function defaultValues(
  budget: Budget | null,
  defaultMonth?: number,
  defaultYear?: number,
): BudgetFormValues {
  const now = new Date();
  if (budget === null) {
    return {
      amount: '',
      month: String(defaultMonth ?? now.getMonth() + 1),
      year: String(defaultYear ?? now.getFullYear()),
      categoryId: '',
    };
  }

  return {
    amount: budget.amount,
    month: String(budget.month),
    year: String(budget.year),
    categoryId: budget.categoryId ?? '',
  };
}

function BudgetForm({
  budget,
  onDone,
  defaultMonth,
  defaultYear,
}: {
  budget: Budget | null;
  onDone: () => void;
  defaultMonth?: number;
  defaultYear?: number;
}) {
  const queryClient = useQueryClient();
  const { data: categories } = useCategories();
  const [failure, setFailure] = useState<string | null>(null);

  const isEditing = budget !== null;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: defaultValues(budget, defaultMonth, defaultYear),
  });

  const expenseCategories = (categories ?? []).filter((cat) => cat.type === 'expense');

  const createMutation = useMutation({
    mutationFn: (values: BudgetFormValues) =>
      createBudget({
        amount: values.amount,
        month: Number(values.month),
        year: Number(values.year),
        categoryId: values.categoryId && values.categoryId !== '' ? values.categoryId : null,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['budgets'] });
      void queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      onDone();
    },
    onError: (error) => {
      setFailure(describeApiFailure(error).message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (values: BudgetFormValues) =>
      updateBudget(budget!.id, { amount: values.amount }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['budgets'] });
      void queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      onDone();
    },
    onError: (error) => {
      setFailure(describeApiFailure(error).message);
    },
  });

  const onSubmit = (values: BudgetFormValues) => {
    setFailure(null);
    if (isEditing) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  };

  return (
    <form
      onSubmit={(event) => {
        void handleSubmit(onSubmit)(event);
      }}
      className="space-y-4"
    >
      {failure !== null && (
        <div
          role="alert"
          className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800"
        >
          {failure}
        </div>
      )}

      {isEditing ? (
        <div className="rounded border border-line/60 bg-paper p-3 text-sm text-muted">
          <p>
            <span className="font-medium text-ink">Scope:</span>{' '}
            {budget.categoryId === null
              ? 'Overall monthly budget'
              : (budget.categoryName ?? 'Category')}
          </p>
          <p className="mt-1">
            <span className="font-medium text-ink">Period:</span>{' '}
            {MONTH_NAMES[budget.month - 1]} {budget.year}
          </p>
        </div>
      ) : (
        <>
          <Select
            label="Category"
            error={errors.categoryId?.message}
            {...register('categoryId')}
          >
            <option value="">Overall monthly budget</option>
            {expenseCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>

          <div className="grid grid-cols-2 gap-4">
            <Select label="Month" error={errors.month?.message} {...register('month')}>
              {MONTH_NAMES.map((name, index) => (
                <option key={index + 1} value={index + 1}>
                  {name}
                </option>
              ))}
            </Select>

            <TextField
              label="Year"
              type="number"
              placeholder="2026"
              error={errors.year?.message}
              {...register('year')}
            />
          </div>
        </>
      )}

      <TextField
        label="Budget amount"
        type="text"
        inputMode="decimal"
        placeholder="0.00"
        error={errors.amount?.message}
        {...register('amount')}
      />

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="quiet" type="button" onClick={onDone}>
          Cancel
        </Button>
        <Button
          variant="primary"
          type="submit"
          disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
        >
          {isSubmitting || createMutation.isPending || updateMutation.isPending
            ? 'Saving...'
            : isEditing
              ? 'Update budget'
              : 'Create budget'}
        </Button>
      </div>
    </form>
  );
}

export function BudgetFormModal({
  open,
  onClose,
  budget,
  defaultMonth,
  defaultYear,
}: BudgetFormModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={budget !== null ? 'Edit Budget' : 'Create Budget'}
    >
      <BudgetForm
        budget={budget}
        onDone={onClose}
        defaultMonth={defaultMonth}
        defaultYear={defaultYear}
      />
    </Modal>
  );
}