import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { describeApiFailure } from '@/api/client';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { useDeleteCategory, useRenameCategory } from '@/hooks/use-categories';

import { FIELD_LIMITS, renameCategorySchema } from './schemas';

import type { RenameCategoryValues } from './schemas';
import type { Category } from '@/types/api';

/** Idle until a person asks for something; the row is its own smallest unit of state. */
type RowMode = 'idle' | 'renaming' | 'confirming';

interface CategoryRowProps {
  category: Category;
}

interface RenameFormProps {
  category: Category;
  onDone: () => void;
  onFailure: (message: string) => void;
}

/** Mounted only while renaming, so the field always opens on the name as it stands. */
function RenameForm({ category, onDone, onFailure }: RenameFormProps) {
  const renameCategory = useRenameCategory();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RenameCategoryValues>({
    resolver: zodResolver(renameCategorySchema),
    defaultValues: { name: category.name },
  });

  const submit = handleSubmit(async ({ name }) => {
    if (name === category.name) {
      onDone();
      return;
    }

    try {
      await renameCategory.mutateAsync({ id: category.id, name });
      onDone();
    } catch (error) {
      onFailure(describeApiFailure(error).message);
    }
  });

  return (
    <form
      noValidate
      // The label is a fixed 24 wide, so on a 360px screen the field and both buttons on one line
      // leave the input a few pixels. Below 640px the buttons take their own line instead.
      className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4"
      onSubmit={(event) => {
        void submit(event);
      }}
    >
      <div className="min-w-0 sm:flex-1">
        <TextField
          label="Name"
          autoFocus
          autoComplete="off"
          maxLength={FIELD_LIMITS.name}
          required
          error={errors.name?.message}
          {...register('name')}
        />
      </div>

      <div className="flex items-center justify-end gap-4">
        <Button type="submit" variant="secondary" size="sm" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Save'}
        </Button>
        <Button variant="quiet" size="sm" onClick={onDone} disabled={isSubmitting}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function CategoryRow({ category }: CategoryRowProps) {
  const [mode, setMode] = useState<RowMode>('idle');
  const [failure, setFailure] = useState<string | null>(null);
  const deleteCategory = useDeleteCategory();

  /** A rejected write leaves the row where it started, with the reason under it. */
  function fail(message: string) {
    setFailure(message);
    setMode('idle');
  }

  function start(next: RowMode) {
    setFailure(null);
    setMode(next);
  }

  async function remove() {
    setFailure(null);

    try {
      await deleteCategory.mutateAsync(category.id);
    } catch (error) {
      fail(describeApiFailure(error).message);
    }
  }

  return (
    <li className="border-b border-line py-3">
      {mode === 'renaming' ? (
        <RenameForm
          category={category}
          onDone={() => {
            setMode('idle');
          }}
          onFailure={fail}
        />
      ) : (
        <>
          <div className="flex items-baseline justify-between gap-4">
            <span className="min-w-0 break-words">{category.name}</span>

            {mode === 'idle' && (
              <div className="flex shrink-0 items-center gap-4">
                <Button
                  variant="text"
                  aria-label={`Rename ${category.name}`}
                  onClick={() => {
                    start('renaming');
                  }}
                >
                  Rename
                </Button>
                <Button
                  variant="text"
                  aria-label={`Delete ${category.name}`}
                  onClick={() => {
                    start('confirming');
                  }}
                >
                  Delete
                </Button>
              </div>
            )}
          </div>

          {mode === 'confirming' && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-l-2 border-expense pl-4">
              <p className="text-sm leading-6 text-ink-soft">
                Delete this category? Its transactions stay in the ledger, without a category.
              </p>
              <div className="flex shrink-0 items-center gap-4">
                <Button
                  variant="danger"
                  size="sm"
                  disabled={deleteCategory.isPending}
                  onClick={() => {
                    void remove();
                  }}
                >
                  {deleteCategory.isPending ? 'Deleting…' : 'Delete'}
                </Button>
                <Button
                  variant="quiet"
                  size="sm"
                  onClick={() => {
                    setMode('idle');
                  }}
                >
                  Keep
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {failure !== null && (
        <p role="alert" className="mt-2 text-sm leading-6 text-expense">
          {failure}
        </p>
      )}
    </li>
  );
}
