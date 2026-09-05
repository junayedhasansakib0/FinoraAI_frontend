import { APP_NAME } from '@/lib/constants';

import type { ReactNode } from 'react';

interface AuthShellProps {
  title: string;
  intro: string;
  /** The form. */
  children: ReactNode;
  /** The sentence that points to the other auth page. */
  footer: ReactNode;
}

/** One narrow column for both auth pages: wordmark, statement, entry, way out. */
export function AuthShell({ title, intro, children, footer }: AuthShellProps) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-line">
        <div className="mx-auto w-full max-w-md px-6 py-4">
          <span className="font-semibold tracking-tight">{APP_NAME}</span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md flex-1 px-6 py-14 sm:py-20">
        <h1 className="font-serif text-3xl sm:text-4xl">{title}</h1>
        <p className="mt-4 leading-7 text-ink-soft">{intro}</p>

        <div className="mt-10">{children}</div>

        <p className="mt-8 text-sm text-muted">{footer}</p>
      </main>
    </div>
  );
}
