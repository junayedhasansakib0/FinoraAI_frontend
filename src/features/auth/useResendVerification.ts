import { useState } from 'react';

import { resendVerification } from '@/api/auth';
import { describeApiFailure } from '@/api/client';

/**
 * The one place the "resend verification" request and its outcome states live, shared by the
 * post-registration notice, the verify-email page, and the unverified banner. The resend endpoint
 * answers generically on purpose (anti-enumeration), so `sent` means only that the request was
 * accepted — never that the address exists.
 */

const RATE_LIMITED_CODE = 'RATE_LIMITED';

export type ResendState = 'idle' | 'sending' | 'sent' | 'limited' | 'error';

/** The message shown once the request has settled; nothing renders while idle or sending. */
export const RESEND_MESSAGE: Record<Exclude<ResendState, 'idle' | 'sending'>, string> = {
  sent: 'If that address needs confirming, a new link is on its way.',
  limited: 'That is a lot of requests. Please wait a while before asking again.',
  error: 'The link could not be sent just now. Please try again in a moment.',
};

export function useResendVerification(email: string) {
  const [state, setState] = useState<ResendState>('idle');

  async function resend() {
    setState('sending');

    try {
      await resendVerification(email);
      setState('sent');
    } catch (error) {
      setState(describeApiFailure(error).code === RATE_LIMITED_CODE ? 'limited' : 'error');
    }
  }

  return { state, resend };
}
