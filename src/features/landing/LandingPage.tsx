import { Link } from 'react-router';

import { useAuth } from '@/context/auth-context';
import { APP_NAME, ROUTES } from '@/lib/constants';

/**
 * The public front door (§10). It never calls the API — it is reachable signed out, so it only
 * describes the product and points at the way in. The calls to action change with the session: a
 * signed-in visitor is offered their dashboard, everyone else the sign-up.
 */

interface Feature {
  title: string;
  body: string;
}

const FEATURES: Feature[] = [
  {
    title: 'Every transaction, one ledger',
    body: 'Record income and expenses against your own categories, and filter or search the whole history in a click.',
  },
  {
    title: 'Budgets that keep score',
    body: 'Set a monthly limit per category and watch each one move from on-track to warning to over — no arithmetic on your side.',
  },
  {
    title: 'Goals with a deadline',
    body: 'Name what you are saving for, set a target and a date, and see how many days and how much are left.',
  },
  {
    title: 'A dashboard that adds up',
    body: 'Balances, this month at a glance, and six or twelve months of trend — every figure computed on the server and shown in your currency.',
  },
  {
    title: 'Currency and crypto, in context',
    body: 'Convert between currencies at reference rates and track coins you follow. Informational reference data, never presented as real-time.',
  },
  {
    title: 'An assistant that reads the aggregates',
    body: 'Ask about your spending and get a grounded, plain-language answer — built from summaries only, and always marked informational, not advice.',
  },
];

export function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-line">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 py-4">
          <span className="font-semibold tracking-tight">{APP_NAME}</span>

          <nav aria-label="Account" className="flex items-center gap-5 text-sm">
            {user === null ? (
              <>
                <Link
                  to={ROUTES.login}
                  className="text-muted transition-colors hover:text-ink"
                >
                  Sign in
                </Link>
                <Link
                  to={ROUTES.register}
                  className="border border-ink bg-ink px-4 py-2 font-medium text-paper transition-colors hover:bg-ink-soft"
                >
                  Create account
                </Link>
              </>
            ) : (
              <Link
                to={ROUTES.dashboard}
                className="border border-ink bg-ink px-4 py-2 font-medium text-paper transition-colors hover:bg-ink-soft"
              >
                Go to dashboard
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto w-full max-w-6xl px-6 py-20 sm:py-28">
          <p className="text-sm tracking-wide text-brass uppercase">Personal finance, quietly done</p>
          <h1 className="mt-5 max-w-[18ch] font-serif text-4xl leading-tight sm:text-display">
            Know where your money stands, and where it is going.
          </h1>
          <p className="mt-6 max-w-[58ch] text-lg leading-8 text-ink-soft">
            {APP_NAME} keeps your transactions, budgets, and goals in one calm, private ledger — and
            adds an assistant that explains the trends without ever seeing a single line of it.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            {user === null ? (
              <>
                <Link
                  to={ROUTES.register}
                  className="border border-ink bg-ink px-5 py-3 font-medium text-paper transition-colors hover:bg-ink-soft"
                >
                  Get started — it's free
                </Link>
                <Link
                  to={ROUTES.login}
                  className="border border-ink px-5 py-3 font-medium transition-colors hover:bg-ink hover:text-paper"
                >
                  Sign in
                </Link>
              </>
            ) : (
              <Link
                to={ROUTES.dashboard}
                className="border border-ink bg-ink px-5 py-3 font-medium text-paper transition-colors hover:bg-ink-soft"
              >
                Open your dashboard
              </Link>
            )}
          </div>
        </section>

        <section
          aria-labelledby="features-heading"
          className="border-t border-line bg-paper"
        >
          <div className="mx-auto w-full max-w-6xl px-6 py-16 sm:py-20">
            <h2 id="features-heading" className="font-serif text-2xl sm:text-3xl">
              Everything the money side needs
            </h2>

            <ul className="mt-10 grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature) => (
                <li key={feature.title} className="border-t border-line pt-5">
                  <h3 className="font-serif text-xl">{feature.title}</h3>
                  <p className="mt-3 leading-7 text-ink-soft">{feature.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="border-t border-line">
          <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-6 px-6 py-16">
            <h2 className="max-w-[24ch] font-serif text-2xl sm:text-3xl">
              Start with today's first transaction.
            </h2>
            {user === null ? (
              <Link
                to={ROUTES.register}
                className="border border-ink bg-ink px-5 py-3 font-medium text-paper transition-colors hover:bg-ink-soft"
              >
                Create your account
              </Link>
            ) : (
              <Link
                to={ROUTES.transactions}
                className="border border-ink bg-ink px-5 py-3 font-medium text-paper transition-colors hover:bg-ink-soft"
              >
                Add a transaction
              </Link>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto w-full max-w-6xl px-6 py-8 text-sm text-muted">
          <p>
            {APP_NAME}. Informational only — not financial advice. Your figures stay yours.
          </p>
        </div>
      </footer>
    </div>
  );
}
