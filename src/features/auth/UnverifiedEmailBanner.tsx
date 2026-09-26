import { RESEND_MESSAGE, useResendVerification } from '@/features/auth/useResendVerification';

/**
 * The soft-gate reminder that rides above every signed-in page while an address is unconfirmed
 * (§5). Login is never blocked, so this only nudges — it names the address, lets the person send a
 * fresh link, and disappears the moment `emailVerified` flips. The resend outcome is generic on
 * purpose (anti-enumeration).
 */
export function UnverifiedEmailBanner({ email }: { email: string }) {
  const { state, resend } = useResendVerification(email);

  return (
    <div className="mb-8 border border-line bg-paper px-4 py-3 text-sm leading-6">
      <p className="text-ink-soft">
        Confirm <span className="text-ink">{email}</span> to secure your account. You can keep using
        Finora in the meantime.
      </p>

      {state === 'idle' || state === 'sending' ? (
        <button
          type="button"
          disabled={state === 'sending'}
          onClick={() => {
            void resend();
          }}
          className="mt-1 text-ink underline underline-offset-4 transition-colors hover:text-ink-soft disabled:opacity-40"
        >
          {state === 'sending' ? 'Sending…' : 'Resend the link'}
        </button>
      ) : (
        <p role="status" className={state === 'sent' ? 'mt-1 text-muted' : 'mt-1 text-expense'}>
          {RESEND_MESSAGE[state]}
        </p>
      )}
    </div>
  );
}
