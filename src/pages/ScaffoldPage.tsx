import { useEffect, useState } from 'react';

import { describeRequestFailure } from '@/api/client';
import { fetchHealth } from '@/api/health';
import { useAuth } from '@/context/auth-context';
import { API_BASE_URL, APP_NAME } from '@/lib/constants';
import { formatServerTime, formatUptime } from '@/lib/format';
import type { HealthStatus } from '@/types/api';

type ApiState =
  | { phase: 'checking' }
  | { phase: 'online'; health: HealthStatus }
  | { phase: 'unreachable'; reason: string };

type Phase = ApiState['phase'];

const PHASE_LABEL: Record<Phase, string> = {
  checking: 'checking',
  online: 'online',
  unreachable: 'unreachable',
};

/** The ledger's left rule is the page's one loud element, so it carries the state. */
const RULE_CLASS: Record<Phase, string> = {
  checking: 'border-line',
  online: 'border-brass',
  unreachable: 'border-expense',
};

const EMPTY_VALUE = '—';

function LedgerRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-6 border-b border-line py-3">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="text-sm font-medium text-ink tabular-nums">{value}</dd>
    </div>
  );
}

export default function ScaffoldPage() {
  const { user, signOut } = useAuth();
  const [state, setState] = useState<ApiState>({ phase: 'checking' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let currentRequest = true;

    fetchHealth(controller.signal)
      .then((health) => {
        if (currentRequest) {
          setState({ phase: 'online', health });
        }
      })
      .catch((error: unknown) => {
        if (currentRequest) {
          setState({ phase: 'unreachable', reason: describeRequestFailure(error) });
        }
      });

    return () => {
      currentRequest = false;
      controller.abort();
    };
  }, [attempt]);

  const health = state.phase === 'online' ? state.health : null;

  function checkAgain() {
    setState({ phase: 'checking' });
    setAttempt((previous) => previous + 1);
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-line">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-6 py-4">
          <span className="font-semibold tracking-tight">{APP_NAME}</span>
          <button
            type="button"
            onClick={() => {
              void signOut();
            }}
            className="border border-line px-3 py-1.5 text-sm transition-colors hover:border-ink"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16 sm:py-24">
        <h1 className="max-w-[20ch] font-serif text-3xl sm:text-display">
          The server does the math.
        </h1>
        <p className="mt-6 max-w-[54ch] leading-7 text-ink-soft">
          Balances, budgets, and forecasts are computed in the Finora API. This page asks for them
          and formats the answer, nothing more.
        </p>

        <section aria-live="polite" className="mt-14">
          <dl className={`border-l-2 pl-5 ${RULE_CLASS[state.phase]}`}>
            <LedgerRow label="Signed in as" value={user?.email ?? EMPTY_VALUE} />
            <LedgerRow label="API" value={PHASE_LABEL[state.phase]} />
            <LedgerRow
              label="Uptime"
              value={health ? formatUptime(health.uptimeSeconds) : EMPTY_VALUE}
            />
            <LedgerRow
              label="Server time"
              value={health ? formatServerTime(health.timestamp) : EMPTY_VALUE}
            />
            <LedgerRow label="Endpoint" value={`${API_BASE_URL}/health`} />
          </dl>

          {state.phase === 'unreachable' && (
            <p className="mt-5 max-w-[54ch] text-sm leading-6 text-expense">
              {state.reason} Start the API with{' '}
              <code className="bg-white px-1.5 py-0.5 font-mono text-[0.8125rem]">npm run dev</code>{' '}
              in the server repository, then check again.
            </p>
          )}

          <button
            type="button"
            onClick={checkAgain}
            disabled={state.phase === 'checking'}
            className="mt-8 border border-ink px-4 py-2 text-sm font-medium transition-colors hover:bg-ink hover:text-paper disabled:cursor-not-allowed disabled:opacity-40"
          >
            Check again
          </button>
        </section>
      </main>
    </div>
  );
}
