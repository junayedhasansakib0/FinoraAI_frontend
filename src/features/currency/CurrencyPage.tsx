import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { describeApiFailure } from '@/api/client';
import { convertCurrency, fetchCurrencyRates } from '@/api/currency';
import { ErrorState } from '@/components/states/ErrorState';
import { UnavailableState } from '@/components/states/UnavailableState';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { TextField } from '@/components/ui/TextField';
import { useAuth } from '@/context/auth-context';

import { formatConverted, formatRate } from './format';

import type { ConvertParams } from '@/api/currency';
import type { FormEvent } from 'react';

/**
 * The currency converter: an informational tool fed only through the Finora API, never a direct
 * Frankfurter call (R-E4). Rates are ECB reference figures, cached server-side, and NOT real-time;
 * the page says so plainly (PROJECT_CONTEXT.md §4.6). The conversion itself is computed on the
 * server (R-B3) — this page only picks currencies and formats the answer. When the upstream is down
 * the API answers 503 and the page degrades to an "unavailable" notice, leaving the rest of the app
 * untouched (ARCHITECTURE.md §9).
 */

/** A sensible second currency so the two selects never start on the same code. */
function defaultTo(from: string): string {
  return from === 'EUR' ? 'USD' : 'EUR';
}

/**
 * How long rate-backed reads stay fresh (R-L4: external data ≥60s). ECB reference rates are
 * published once per working day, so this matches the server's own 6-hour Frankfurter cache window
 * rather than the app's 30s default — the client never re-asks for a figure the API still serves
 * from cache. The rates are not real-time, so this staleness is expected.
 */
const RATES_STALE_MS = 6 * 60 * 60 * 1000;

export function CurrencyPage() {
  const { user } = useAuth();
  const baseCurrency = user?.currency ?? 'USD';

  const [amount, setAmount] = useState('1');
  const [from, setFrom] = useState(baseCurrency);
  const [to, setTo] = useState(() => defaultTo(baseCurrency));
  const [submitted, setSubmitted] = useState<ConvertParams | null>(null);

  // The currency universe and the reference date come from one rates read for a fixed base.
  const ratesQuery = useQuery({
    queryKey: ['currency', 'rates', 'USD'],
    queryFn: ({ signal }) => fetchCurrencyRates('USD', signal),
    staleTime: RATES_STALE_MS,
  });

  // Enabled only once a conversion has been submitted; keyed by the exact inputs so repeats cache.
  const convertQuery = useQuery({
    queryKey: ['currency', 'convert', submitted],
    queryFn: ({ signal }) => convertCurrency(submitted as ConvertParams, signal),
    enabled: submitted !== null,
    staleTime: RATES_STALE_MS,
  });

  const ratesFailure = ratesQuery.isError ? describeApiFailure(ratesQuery.error) : null;
  const ratesUnavailable = ratesFailure?.code === 'UPSTREAM_UNAVAILABLE';

  const codes =
    ratesQuery.data === undefined
      ? []
      : [ratesQuery.data.base, ...Object.keys(ratesQuery.data.rates)].sort((a, b) =>
          a.localeCompare(b),
        );

  const convertFailure = convertQuery.isError ? describeApiFailure(convertQuery.error) : null;
  const convertUnavailable = convertFailure?.code === 'UPSTREAM_UNAVAILABLE';

  function parsedAmount(): number | null {
    const value = Number(amount);

    return amount.trim() !== '' && Number.isFinite(value) && value > 0 ? value : null;
  }

  function runConversion(nextFrom: string, nextTo: string) {
    const value = parsedAmount();

    if (value !== null) {
      setSubmitted({ from: nextFrom, to: nextTo, amount: value });
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    runConversion(from, to);
  }

  function onSwap() {
    setFrom(to);
    setTo(from);
    runConversion(to, from);
  }

  const amountIsValid = parsedAmount() !== null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl sm:text-4xl">Currency converter</h1>
        <p className="mt-2 max-w-[60ch] text-sm text-muted">
          Convert between currencies using European Central Bank reference rates. Informational only
          — the figures are cached, published once per working day, and are not real-time. Data
          provided by Frankfurter.
        </p>
      </div>

      {ratesQuery.isPending && (
        <div className="max-w-md space-y-4">
          <div className="h-10 w-full animate-pulse rounded bg-line/20" />
          <div className="h-10 w-full animate-pulse rounded bg-line/20" />
          <div className="h-10 w-full animate-pulse rounded bg-line/20" />
        </div>
      )}

      {ratesQuery.isError && ratesUnavailable && (
        <UnavailableState
          title="Currency rates are unavailable right now"
          message="The rates source could not be reached. This does not affect the rest of Finora — please try again shortly."
          retrying={ratesQuery.isFetching}
          onRetry={() => {
            void ratesQuery.refetch();
          }}
        />
      )}

      {ratesQuery.isError && !ratesUnavailable && (
        <ErrorState
          title="Could not load currency rates"
          message={ratesFailure?.message ?? 'Something went wrong loading the currency rates.'}
          retrying={ratesQuery.isFetching}
          onRetry={() => {
            void ratesQuery.refetch();
          }}
        />
      )}

      {!ratesQuery.isPending && !ratesQuery.isError && (
        <div className="max-w-md space-y-8">
          <form className="space-y-5" onSubmit={onSubmit}>
            <TextField
              label="Amount"
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={amount}
              onChange={(event) => {
                setAmount(event.target.value);
              }}
              error={
                amount.trim() !== '' && !amountIsValid
                  ? 'Enter an amount greater than zero.'
                  : undefined
              }
            />

            <Select
              label="From"
              value={from}
              onChange={(event) => {
                setFrom(event.target.value);
              }}
            >
              {codes.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </Select>

            <Select
              label="To"
              value={to}
              onChange={(event) => {
                setTo(event.target.value);
              }}
            >
              {codes.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </Select>

            <div className="flex items-center gap-3">
              <Button type="submit" variant="primary" disabled={!amountIsValid}>
                Convert
              </Button>
              <Button type="button" variant="quiet" onClick={onSwap}>
                Swap
              </Button>
            </div>
          </form>

          {submitted !== null && (
            <div>
              {convertQuery.isPending && <p className="text-sm text-muted">Converting…</p>}

              {convertQuery.isError && convertUnavailable && (
                <UnavailableState
                  title="Currency rates are unavailable right now"
                  message="The rates source could not be reached. This does not affect the rest of Finora — please try again shortly."
                  retrying={convertQuery.isFetching}
                  onRetry={() => {
                    void convertQuery.refetch();
                  }}
                />
              )}

              {convertQuery.isError && !convertUnavailable && (
                <ErrorState
                  title="Could not convert"
                  message={convertFailure?.message ?? 'Something went wrong converting that amount.'}
                  retrying={convertQuery.isFetching}
                  onRetry={() => {
                    void convertQuery.refetch();
                  }}
                />
              )}

              {convertQuery.data !== undefined && !convertQuery.isError && (
                <div className="border-l-2 border-ink pl-5">
                  <p className="text-sm text-muted">
                    {submitted.amount.toLocaleString()} {submitted.from} =
                  </p>
                  <p className="mt-1 font-serif text-3xl">
                    {formatConverted(convertQuery.data.result, submitted.to)}
                  </p>
                  <p className="mt-3 text-sm text-muted">
                    1 {submitted.from} = {formatRate(convertQuery.data.rate)} {submitted.to}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    ECB reference rate as of {convertQuery.data.date} — not real-time.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
