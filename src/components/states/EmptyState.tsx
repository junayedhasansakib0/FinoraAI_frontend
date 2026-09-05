import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  message: string;
  /** The way out of the empty screen — a different button on every screen, so it is passed in. */
  action?: ReactNode;
}

/** The empty half of R-F5: says what is missing, then offers the one action that fills it. */
export function EmptyState({ title, message, action }: EmptyStateProps) {
  return (
    <div className="border-l-2 border-line pl-5">
      <p className="font-serif text-xl">{title}</p>
      <p className="mt-3 max-w-[54ch] leading-7 text-ink-soft">{message}</p>

      {action !== undefined && <div className="mt-6">{action}</div>}
    </div>
  );
}
