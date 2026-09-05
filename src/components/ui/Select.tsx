import { useId } from 'react';

import type { ComponentPropsWithRef, ReactNode } from 'react';

interface SelectProps extends Omit<ComponentPropsWithRef<'select'>, 'className' | 'id'> {
  label: string;
  /** Standing guidance, shown until an error replaces it. */
  hint?: string;
  error?: string;
  /** The `<option>` elements. */
  children: ReactNode;
}

/**
 * The same ledger line as `TextField` — label left, value right, one rule beneath both — around a
 * native `<select>`, so the option list, keyboard behaviour, and the mobile wheel picker all come
 * from the platform.
 */
export function Select({ label, hint, error, children, ...selectProps }: SelectProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const showHint = hint !== undefined && error === undefined;
  const describedBy = [showHint ? hintId : null, error === undefined ? null : errorId]
    .filter((value) => value !== null)
    .join(' ');

  return (
    <div>
      <div
        className={`flex items-baseline gap-4 border-b py-2.5 ${
          error === undefined ? 'border-line focus-within:border-ink' : 'border-expense'
        }`}
      >
        <label htmlFor={id} className="w-24 shrink-0 text-sm text-muted">
          {label}
        </label>
        <select
          id={id}
          aria-invalid={error === undefined ? undefined : true}
          aria-describedby={describedBy.length > 0 ? describedBy : undefined}
          className="min-w-0 flex-1 bg-transparent text-ink disabled:cursor-not-allowed disabled:opacity-40"
          {...selectProps}
        >
          {children}
        </select>
      </div>

      {showHint && (
        <p id={hintId} className="mt-2 text-sm text-muted">
          {hint}
        </p>
      )}
      {error !== undefined && (
        <p id={errorId} className="mt-2 text-sm text-expense">
          {error}
        </p>
      )}
    </div>
  );
}
