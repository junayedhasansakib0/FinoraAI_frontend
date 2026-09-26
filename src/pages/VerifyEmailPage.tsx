import { APP_NAME } from '@/lib/constants';
import { VerifyEmailView } from '@/features/auth/VerifyEmailView';

/**
 * The dedicated `/verify-email` destination (§5). It borrows the auth pages' narrow column but not
 * `AuthShell`, because the view owns its own per-state `<h1>` and a second static heading would
 * compete with it. Reachable signed in or out — the route sits outside both guards.
 */
export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-line">
        <div className="mx-auto w-full max-w-md px-6 py-4">
          <span className="font-semibold tracking-tight">{APP_NAME}</span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md flex-1 px-6 py-14 sm:py-20">
        <VerifyEmailView />
      </main>
    </div>
  );
}
