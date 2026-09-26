import { Button } from '@/components/ui/Button';

import { RESEND_MESSAGE, useResendVerification } from './useResendVerification';

/**
 * Shown after a successful registration (§5 frontend UX). The account already exists and the
 * session can be activated at will — login is a soft gate — so this panel tells the person to
 * confirm their address, lets them ask for a fresh link, and hands them into the app on "Continue".
 * The resend response is deliberately generic (anti-enumeration), so success here means only that
 * the request was accepted, never that the address was found.
 */
export function CheckEmailNotice({ email, onContinue }: { email: string; onContinue: () => void }) {
  const { state, resend } = useResendVerification(email);

  const tone = state === 'error' || state === 'limited' ? 'text-expense' : 'text-muted';

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h2 className="text-lg font-medium tracking-tight">Check your email</h2>
        <p className="text-sm leading-6 text-muted">
          We sent a confirmation link to <span className="text-ink">{email}</span>. Open it to
          verify your address. You can start using Finora now and confirm any time.
        </p>
      </div>

      {state !== 'idle' && state !== 'sending' && (
        <p role="status" className={`border-l-2 border-line pl-4 text-sm leading-6 ${tone}`}>
          {RESEND_MESSAGE[state]}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="primary"
          size="lg"
          onClick={() => {
            onContinue();
          }}
        >
          Continue to Finora
        </Button>
        <Button
          type="button"
          variant="quiet"
          size="lg"
          disabled={state === 'sending'}
          onClick={() => {
            void resend();
          }}
        >
          {state === 'sending' ? 'Sending…' : 'Resend link'}
        </Button>
      </div>
    </div>
  );
}
