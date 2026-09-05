import { useId } from 'react';

import type { ComponentPropsWithRef } from 'react';

interface TextFieldProps extends Omit<ComponentPropsWithRef<'input'>, 'className' | 'id'> {
  label: string;
  /** Standing guidance, shown until an error replaces it. */
  hint?: string;
  error?: string;
}

/**
 * A field written like a ledger line: label on the left, value on the right, one rule beneath
 * both. The rule is the only part that moves — ink while the field has focus, red when the
 * entry was rejected.
 */
export function TextField({ label, hint, error, ...inputProps }: TextFieldProps) {
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
        <input
          id={id}
          aria-invalid={error === undefined ? undefined : true}
          aria-describedby={describedBy.length > 0 ? describedBy : undefined}
          className="min-w-0 flex-1 bg-transparent text-ink"
          {...inputProps}
        />
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
