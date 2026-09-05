import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { describeApiFailure, describeFieldErrors } from '@/api/client';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { TextField } from '@/components/ui/TextField';
import { useCategories } from '@/hooks/use-categories';
import { useCreateTransaction, useUpdateTransaction } from '@/hooks/use-transactions';
import { toDateInputValue } from '@/lib/format';

import { FIELD_LIMITS, transactionSchema } from './schemas';

import type { TransactionValues } from './schemas';
import type { Transaction } from '@/types/api';
import type { ChangeEvent } from 'react';

interface TransactionFormModalProps {
  open: boolean;
  /** The row being edited, or `null` when adding. */
  transaction: Transaction | null;
  onClose: () => void;
}

/** Labels the server does not know about, used to turn its field predicates into sentences. */
const FIELD_LABELS = {
  type: 'Type',
  amount: 'Amount',
  categoryId: 'Category',
  description: 'Description',
  date: 'Date',
} as const;

type FormField = keyof typeof FIELD_LABELS;

function isFormField(field: string): field is FormField {
  return Object.hasOwn(FIELD_LABELS, field);
}

/** `Amount` + `must be between …` reads as one sentence, which is how §7 words its details. */
function asSentence(field: FormField, message: string): string {
  const trimmed = message.trim();

  return `${FIELD_LABELS[field]} ${/[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`}`;
}

/** Today on the UTC calendar, which is the calendar transaction dates are stored against. */
function todayInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}

function defaultValues(transaction: Transaction | null): TransactionValues {
  if (transaction === null) {
    return {
      type: 'expense',
      amount: '',
      categoryId: '',
      description: '',
      date: todayInputValue(),
    };
  }

  return {
    type: transaction.type,
    amount: transaction.amount,
    categoryId: transaction.category?.id ?? '',
    description: transaction.description ?? '',
    date: toDateInputValue(transaction.date),
  };
}

/**
 * Mounted by `Modal` only while it is open, so every opening starts from these defaults rather
 * than from whatever the last edit left behind.
 */
function TransactionForm({
  transaction,
  onDone,
}: {
  transaction: Transaction | null;
  onDone: () => void;
}) {
  const { data: categories } = useCategories();
  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();
  const [failure, setFailure] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    getValues,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<TransactionValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: defaultValues(transaction),
  });

  /** Subscribed to rather than read through `watch`, so a keystroke elsewhere is not a re-render. */
  const type = useWatch({ control, name: 'type' });
  const selectable = (categories ?? []).filter((category) => category.type === type);
  const typeField = register('type');

  /** A category from the other direction can only ever be rejected, so it is dropped here. */
  function changeType(event: ChangeEvent<HTMLSelectElement>) {
    void typeField.onChange(event);

    const selected = categories?.find((category) => category.id === getValues('categoryId'));

    if (selected !== undefined && selected.type !== event.target.value) {
      setValue('categoryId', '');
    }
  }

  /** Field-level details land on their field; anything else is shown above the buttons (R-F3). */
  function applyFailure(error: unknown) {
    const details = describeFieldErrors(error);
    let placed = 0;

    for (const detail of details) {
      if (isFormField(detail.field)) {
        setError(detail.field, { message: asSentence(detail.field, detail.message) });
        placed += 1;
      }
    }

    if (placed === 0) {
      setFailure(describeApiFailure(error).message);
    }
  }

  const submit = handleSubmit(async (values) => {
    setFailure(null);

    try {
      if (transaction === null) {
        await createTransaction.mutateAsync(values);
      } else {
        // A day left untouched keeps the time it was booked at, instead of being reset to
        // midnight by the date-only value the input can express.
        const untouched = values.date === toDateInputValue(transaction.date);

        await updateTransaction.mutateAsync({
          id: transaction.id,
          input: { ...values, date: untouched ? transaction.date : values.date },
        });
      }

      onDone();
    } catch (error) {
      applyFailure(error);
    }
  });

  return (
    <form
      noValidate
      className="space-y-6"
      onSubmit={(event) => {
        void submit(event);
      }}
    >
      <div className="space-y-4">
        <Select label="Type" {...typeField} onChange={changeType} error={errors.type?.message}>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </Select>

        <TextField
          label="Amount"
          inputMode="decimal"
          placeholder="0.00"
          autoComplete="off"
          required
          error={errors.amount?.message}
          {...register('amount')}
        />

        <Select
          label="Category"
          required
          hint={
            selectable.length === 0
              ? 'No categories for this direction yet — add one under Manage categories.'
              : undefined
          }
          error={errors.categoryId?.message}
          {...register('categoryId')}
        >
          <option value="">Choose a category</option>
          {selectable.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>

        <TextField
          label="Date"
          type="date"
          required
          error={errors.date?.message}
          {...register('date')}
        />

        <TextField
          label="Description"
          maxLength={FIELD_LIMITS.description}
          autoComplete="off"
          hint="Optional."
          error={errors.description?.message}
          {...register('description')}
        />
      </div>

      {failure !== null && (
        <p role="alert" className="border-l-2 border-expense pl-4 text-sm leading-6 text-expense">
          {failure}
        </p>
      )}

      <div className="flex items-center justify-end gap-4">
        <Button variant="quiet" onClick={onDone} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Save transaction'}
        </Button>
      </div>
    </form>
  );
}

export function TransactionFormModal({ open, transaction, onClose }: TransactionFormModalProps) {
  return (
    <Modal
      open={open}
      title={transaction === null ? 'Add transaction' : 'Edit transaction'}
      onClose={onClose}
    >
      <TransactionForm transaction={transaction} onDone={onClose} />
    </Modal>
  );
}
