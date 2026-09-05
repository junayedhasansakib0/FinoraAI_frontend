import { useId } from 'react';

import { formatMoney, formatPercent, isNegativeMoney } from '@/lib/format';

import type { DashboardBudget, DashboardSavings } from '@/types/api';

interface ProgressMetersProps {
  budget: DashboardBudget;
  savings: DashboardSavings;
  currency: string;
}

interface MeterProps {
  label: string;
  /** The percentage the API worked out, to one decimal. Nothing here recomputes it (R-B3). */
  percent: number;
  /** Announced in place of the bare number, so the bar says what it is a percentage of. */
  valueText: string;
  /** The same fact in writing, for everyone who is not listening. */
  caption: string;
  captionTone?: string;
}

/**
 * §3 is explicit that budget and goal progress are progress bars rather than charts, so these are
 * bars: two divs and an `aria-valuetext`, not a Recharts import.
 *
 * The bar draws a percentage and nothing more. Phase 6 owns the `ok`/`warning`/`exceeded` vocabulary
 * and the 80% threshold that goes with it, so there is no colour change here at any level — an
 * overrun shows as a negative remaining figure, which is the fact rather than a judgement of it.
 */
function Meter({ label, percent, valueText, caption, captionTone = '' }: MeterProps) {
  const labelId = useId();

  /**
   * Spending 126.5% of a budget is a real answer, but `aria-valuenow` may not exceed
   * `aria-valuemax`, and a bar cannot be wider than its track. The width is clamped; the percentage
   * a person reads and hears is not.
   */
  const filled = Math.min(percent, 100);

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <span id={labelId} className="text-sm text-muted">
          {label}
        </span>
        <span className="text-sm tabular-nums">{formatPercent(percent)}</span>
      </div>

      <div
        role="progressbar"
        aria-labelledby={labelId}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={filled}
        aria-valuetext={valueText}
        className="mt-2 h-2 w-full bg-line"
      >
        <div className="h-full bg-ink-soft" style={{ width: `${String(filled)}%` }} />
      </div>

      <p className={`mt-2 text-sm tabular-nums ${captionTone}`}>{caption}</p>
    </div>
  );
}

/** Said in place of a bar, when there is nothing yet for a percentage to be a percentage of. */
function MeterPlaceholder({ label, message }: { label: string; message: string }) {
  return (
    <div>
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 max-w-[46ch] text-sm leading-6 text-ink-soft">{message}</p>
    </div>
  );
}

export function ProgressMeters({ budget, savings, currency }: ProgressMetersProps) {
  const { amount, remaining, pctUsed } = budget;
  /** The contract nulls all three together; gathering them narrows all three at once. */
  const setBudget =
    amount !== null && remaining !== null && pctUsed !== null
      ? { amount, remaining, pctUsed }
      : null;

  return (
    <section aria-labelledby="meters-heading">
      <h2 id="meters-heading" className="font-serif text-xl">
        Budget and savings
      </h2>

      <div className="mt-6 space-y-7">
        {setBudget === null ? (
          <MeterPlaceholder
            label="Budget used this month"
            message="No overall budget is set for this month, so there is nothing to measure the spending against yet."
          />
        ) : (
          <Meter
            label="Budget used this month"
            percent={setBudget.pctUsed}
            valueText={`${formatPercent(setBudget.pctUsed)} of a ${formatMoney(
              setBudget.amount,
              currency,
            )} budget used`}
            caption={`${formatMoney(setBudget.remaining, currency)} remaining of ${formatMoney(
              setBudget.amount,
              currency,
            )}`}
            captionTone={isNegativeMoney(setBudget.remaining) ? 'text-expense' : 'text-ink-soft'}
          />
        )}

        {savings.progressPct === null ? (
          <MeterPlaceholder
            label="Savings progress"
            message="No savings goals yet. Once a goal has a target, its progress appears here."
          />
        ) : (
          <Meter
            label="Savings progress"
            percent={savings.progressPct}
            valueText={`${formatPercent(savings.progressPct)} of ${formatMoney(
              savings.targetAmount,
              currency,
            )} saved across ${String(savings.goalCount)} ${
              savings.goalCount === 1 ? 'goal' : 'goals'
            }`}
            caption={`${formatMoney(savings.savedAmount, currency)} saved of ${formatMoney(
              savings.targetAmount,
              currency,
            )}`}
            captionTone="text-ink-soft"
          />
        )}
      </div>
    </section>
  );
}
