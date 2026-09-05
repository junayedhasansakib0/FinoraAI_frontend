import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { describeApiFailure } from '@/api/client';
import { ErrorState } from '@/components/states/ErrorState';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { TextField } from '@/components/ui/TextField';
import { useCategories, useCreateCategory } from '@/hooks/use-categories';

import { CategoryRow } from './CategoryRow';
import { createCategorySchema, FIELD_LIMITS } from './schemas';

import type { CreateCategoryValues } from './schemas';
import type { TransactionType } from '@/types/api';

interface CategoryManagerModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * §3 puts category management on `/app/settings`, which Phase 13 builds. Until then it opens from
 * the transactions page, where the categories are actually used, and has no route of its own.
 */

const GROUPS: Array<{ type: TransactionType; label: string }> = [
  { type: 'expense', label: 'Expense' },
  { type: 'income', label: 'Income' },
];

const SKELETON_ROWS = [0, 1, 2];

function ListSkeleton() {
  return (
    <div role="status" className="mt-4 space-y-3">
      <span className="sr-only">Loading categories</span>
      {SKELETON_ROWS.map((row) => (
        <div key={row} className="h-3 w-full bg-line motion-safe:animate-pulse" />
      ))}
    </div>
  );
}

/** Adding is the one thing here that is not about an existing row, so it gets its own form. */
function CreateCategoryForm() {
  const createCategory = useCreateCategory();
  const [failure, setFailure] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateCategoryValues>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: { name: '', type: 'expense' },
  });

  const submit = handleSubmit(async (values) => {
    setFailure(null);

    try {
      await createCategory.mutateAsync(values);
      // The type is kept: adding several categories of one kind in a row is the common case.
      reset({ name: '', type: values.type });
    } catch (error) {
      setFailure(describeApiFailure(error).message);
    }
  });

  return (
    <form
      noValidate
      className="space-y-4"
      onSubmit={(event) => {
        void submit(event);
      }}
    >
      <TextField
        label="Name"
        autoComplete="off"
        maxLength={FIELD_LIMITS.name}
        required
        error={errors.name?.message}
        {...register('name')}
      />

      <Select label="Type" error={errors.type?.message} {...register('type')}>
        <option value="expense">Expense</option>
        <option value="income">Income</option>
      </Select>

      {failure !== null && (
        <p role="alert" className="border-l-2 border-expense pl-4 text-sm leading-6 text-expense">
          {failure}
        </p>
      )}

      <div className="flex justify-end">
        <Button type="submit" variant="secondary" size="sm" disabled={isSubmitting}>
          {isSubmitting ? 'Adding…' : 'Add category'}
        </Button>
      </div>
    </form>
  );
}

function CategoryManager() {
  const { data: categories, isPending, isError, error, isFetching, refetch } = useCategories();

  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-sm font-medium">Add a category</h3>
        <div className="mt-4">
          <CreateCategoryForm />
        </div>
      </section>

      {isPending && <ListSkeleton />}

      {isError && (
        <ErrorState
          title="Your categories did not load"
          message={describeApiFailure(error).message}
          retrying={isFetching}
          onRetry={() => {
            void refetch();
          }}
        />
      )}

      {categories !== undefined &&
        GROUPS.map((group) => {
          const rows = categories.filter((category) => category.type === group.type);

          return (
            <section key={group.type}>
              <h3 className="text-sm font-medium">{group.label}</h3>

              {rows.length === 0 ? (
                <p className="mt-4 text-sm text-muted">Nothing here yet.</p>
              ) : (
                <ul className="mt-2 border-t border-line">
                  {rows.map((category) => (
                    <CategoryRow key={category.id} category={category} />
                  ))}
                </ul>
              )}
            </section>
          );
        })}
    </div>
  );
}

export function CategoryManagerModal({ open, onClose }: CategoryManagerModalProps) {
  return (
    <Modal open={open} title="Categories" onClose={onClose}>
      <CategoryManager />
    </Modal>
  );
}
