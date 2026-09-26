import { Button } from '@/components/ui/Button';

import { RESEND_MESSAGE, useResendVerification } from './useResendVerification';

/**
 * The client mirror of the server's verified-email gate (ARCHITECTURE.md §7): shown in place of a
 * verified-only feature (Analytics, AI) while the signed-in account's email is unconfirmed. Because
 * it renders INSTEAD of the feature, none of that feature's queries mount, so no request the gate
 * would refuse ever leaves the browser. The one action that moves a person forward — sending a fresh
 * verification link — lives here and, persistently, in the page-wide `UnverifiedEmailBanner`; the
 * page unlocks on its own once `emailVerified` flips, with no reload.
 */
interface FeatureLockedProps {
  title: string;
  message: string;
  /** The address a fresh link is sent to; shown so the person knows where the link will land. */
  email: string;
}

export function FeatureLocked({ title, message, email }: FeatureLockedProps) {
  const { state, resend } = useResendVerification(email);
  const settled = state !== 'idle' && state !== 'sending';

  return (
    <section aria-labelledby="feature-locked-title" className="border-l-2 border-warning pl-5">
      <p id="feature-locked-title" className="font-serif text-xl">
        {title}
      </p>
      <p className="mt-3 max-w-[54ch] leading-7 text-ink-soft">{message}</p>
      <p className="mt-2 max-w-[54ch] text-sm leading-6 text-muted">
        Open the link we sent to <span className="text-ink-soft">{email}</span> to unlock this —
        this page updates on its own once your address is confirmed.
      </p>

      <div className="mt-6">
        <Button
          type="button"
          disabled={state === 'sending'}
          onClick={() => {
            void resend();
          }}
        >
          {state === 'sending' ? 'Sending…' : 'Resend verification email'}
        </Button>
      </div>

      {settled && (
        <p
          role="status"
          className={`mt-3 text-sm leading-6 ${state === 'sent' ? 'text-muted' : 'text-expense'}`}
        >
          {RESEND_MESSAGE[state]}
        </p>
      )}
    </section>
  );
}
