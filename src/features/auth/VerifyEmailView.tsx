import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

import { fetchCurrentUser, verifyEmail } from '@/api/auth';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/auth-context';
import { ROUTES } from '@/lib/constants';

import { RESEND_MESSAGE, useResendVerification } from './useResendVerification';

/**
 * Redeems the token from a verification email (§5). The endpoint never errors on a bad token — it
 * answers with a status the page renders — so a thrown request here means a transport/server fault,
 * shown as its own "try again" state. An already-signed-in, already-verified visitor is told so
 * without spending the one-time token.
 */

type ViewState = 'verifying' | 'verified' | 'already' | 'expired' | 'invalid' | 'error';

const COPY: Record<ViewState, { title: string; body: string }> = {
  verifying: { title: 'Verifying your email', body: 'One moment while we confirm your link.' },
  verified: { title: 'Email verified', body: 'Your address is confirmed. Thanks for that.' },
  already: { title: 'Already verified', body: "This address was confirmed already — you're all set." },
  expired: {
    title: 'This link has expired',
    body: 'Verification links last 24 hours. Ask for a fresh one and try again.',
  },
  invalid: {
    title: "This link isn't valid",
    body: 'The link may be incomplete or already used. Ask for a fresh one and try again.',
  },
  error: {
    title: 'Something went wrong',
    body: "We couldn't check the link just now. Please try again in a moment.",
  },
};

export function VerifyEmailView() {
  const [params] = useSearchParams();
  const token = params.get('token')?.trim() ?? '';
  const { user, applyUser } = useAuth();
  const navigate = useNavigate();
  const started = useRef(false);
  const [state, setState] = useState<ViewState>(() => {
    if (user?.emailVerified === true) {
      return 'already';
    }
    return token.length === 0 ? 'invalid' : 'verifying';
  });
  const { state: resend, resend: requestResend } = useResendVerification(user?.email ?? '');

  useEffect(() => {
    if (state !== 'verifying' || started.current) {
      return;
    }
    started.current = true;

    let active = true;
    verifyEmail(token)
      .then((status) => {
        if (!active) {
          return;
        }
        setState(status === 'verified' ? 'verified' : status === 'expired' ? 'expired' : 'invalid');

        // A fresh verification unlocks the verified-only features (Analytics, AI) at once, with no
        // page reload: refetch the current user and adopt it into the in-memory session so the gate,
        // which reads `emailVerified`, sees the new value. Fire-and-forget — verification already
        // succeeded, so a failed refresh must not change the shown result; it only defers the in-app
        // unlock to the next navigation. Skipped when signed out (nothing to refresh, no failing call).
        if (status === 'verified' && user !== null) {
          fetchCurrentUser()
            .then((refreshed) => {
              applyUser(refreshed);
            })
            .catch(() => {
              // Stay verified on screen; the unlock lands on the next `GET /auth/me`.
            });
        }
      })
      .catch(() => {
        if (active) {
          setState('error');
        }
      });

    return () => {
      active = false;
    };
  }, [state, token, user, applyUser]);

  const copy = COPY[state];
  const showResend = user !== null && (state === 'expired' || state === 'invalid');
  const continueTo = user === null ? ROUTES.login : ROUTES.dashboard;
  const continueLabel = user === null ? 'Go to sign in' : 'Continue to Finora';

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h1 className="font-serif text-3xl sm:text-4xl">{copy.title}</h1>
        <p role="status" className="leading-7 text-ink-soft">
          {copy.body}
        </p>
      </div>

      {resend !== 'idle' && resend !== 'sending' && (
        <p
          role="status"
          className={`border-l-2 border-line pl-4 text-sm leading-6 ${
            resend === 'sent' ? 'text-muted' : 'text-expense'
          }`}
        >
          {RESEND_MESSAGE[resend]}
        </p>
      )}

      {state !== 'verifying' && (
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="primary"
            size="lg"
            onClick={() => {
              void navigate(continueTo, { replace: true });
            }}
          >
            {continueLabel}
          </Button>

          {showResend && (
            <Button
              type="button"
              variant="quiet"
              size="lg"
              disabled={resend === 'sending'}
              onClick={() => {
                void requestResend();
              }}
            >
              {resend === 'sending' ? 'Sending…' : 'Resend link'}
            </Button>
          )}

          {state === 'error' && (
            <Button
              type="button"
              variant="quiet"
              size="lg"
              onClick={() => {
                started.current = false;
                setState('verifying');
              }}
            >
              Try again
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
