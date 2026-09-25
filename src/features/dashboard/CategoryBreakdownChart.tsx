import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { ChartFrame } from '@/components/charts/ChartFrame';
import { ChartTooltip } from '@/components/charts/ChartTooltip';
import { CATEGORY_COLORS, CHART_PAPER, REMAINDER_COLOR } from '@/components/charts/colors';
import { formatMoney, formatMonthLong, formatPercent } from '@/lib/format';

import type { ChartTableRow } from '@/components/charts/ChartFrame';
import type { TooltipDatum } from '@/components/charts/ChartTooltip';
import type { CategoryBreakdown } from '@/types/api';

interface CategoryBreakdownChartProps {
  breakdown: CategoryBreakdown;
  currency: string;
}

interface Slice extends TooltipDatum {
  key: string;
  label: string;
  /** A radius, not a sum: the ring is the only thing this number draws (R-B3). */
  value: number;
  color: string;
  amount: string;
  /** The API works the share out to one decimal; `other` has none, so it reads as a dash. */
  share: string | null;
}

const UNCATEGORISED = 'Uncategorised';

function sliceLines(amount: string, share: string | null) {
  const lines = [{ name: 'Spent', text: amount }];

  if (share !== null) {
    lines.push({ name: 'Share', text: share });
  }

  return lines;
}

/**
 * §3's third chart: where this month's expenses went. The API publishes the eight largest categories
 * and rolls the rest into `other`, so the ring always adds up to the month's expense total (R-B8),
 * and spending whose category has since been deleted arrives as a slice with no name (R-D7).
 *
 * A category is an identity rather than a direction, so the slice colours are deliberately not the
 * income/expense pair — see `charts/colors.ts`. The key below the ring names every slice with its
 * share, so no slice is identified by colour alone.
 */
export function CategoryBreakdownChart({ breakdown, currency }: CategoryBreakdownChartProps) {
  const monthName = formatMonthLong(breakdown.month, breakdown.year);

  const slices: Slice[] = breakdown.categories.map((category, index) => {
    const label = category.name ?? UNCATEGORISED;
    const amount = formatMoney(category.total, currency);
    const share = category.share === null ? null : formatPercent(category.share);

    return {
      key: category.categoryId ?? UNCATEGORISED,
      label,
      value: Number(category.total),
      color: CATEGORY_COLORS.at(index % CATEGORY_COLORS.length) ?? REMAINDER_COLOR,
      amount,
      share,
      tipLabel: label,
      tipLines: sliceLines(amount, share),
    };
  });

  if (breakdown.other.categoryCount > 0) {
    const label = `Other (${String(breakdown.other.categoryCount)} ${
      breakdown.other.categoryCount === 1 ? 'category' : 'categories'
    })`;
    const amount = formatMoney(breakdown.other.total, currency);

    slices.push({
      key: 'other',
      label,
      value: Number(breakdown.other.total),
      color: REMAINDER_COLOR,
      amount,
      share: null,
      tipLabel: label,
      tipLines: sliceLines(amount, null),
    });
  }

  if (slices.length === 0) {
    return (
      <section className="min-w-0">
        <h2 className="font-serif text-xl">Spending by category</h2>
        <p className="mt-2 max-w-[54ch] text-sm leading-6 text-muted">
          No expenses in {monthName} yet, so there is nothing to break down. The ring appears with
          the first one.
        </p>
      </section>
    );
  }

  const rows: ChartTableRow[] = slices.map((slice) => ({
    label: slice.label,
    values: [slice.amount, slice.share ?? '—'],
  }));

  return (
    <ChartFrame
      title="Spending by category"
      summary={`${formatMoney(breakdown.total, currency)} of expenses in ${monthName}, largest share first.`}
      plotLabel={`Donut chart of ${monthName} expenses by category, totalling ${formatMoney(
        breakdown.total,
        currency,
      )}. The same figures are in the key and the table below.`}
      columns={['Category', 'Spent', 'Share']}
      rows={rows}
      plotClassName="h-56 sm:h-64"
      legend={
        <ul className="grid grid-cols-1 gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
          {slices.map((slice) => (
            <li key={slice.key} className="flex items-baseline gap-3">
              <span
                aria-hidden="true"
                className="mt-1.5 size-2.5 shrink-0"
                style={{ backgroundColor: slice.color }}
              />
              <span className="min-w-0 flex-1 wrap-anywhere">{slice.label}</span>
              <span className="shrink-0 tabular-nums text-muted">
                {slice.share ?? slice.amount}
              </span>
            </li>
          ))}
        </ul>
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        {/* `accessibilityLayer` off for the same reason as the bar chart: see IncomeExpenseChart. */}
        <PieChart accessibilityLayer={false}>
          <Pie
            data={slices}
            dataKey="value"
            nameKey="label"
            /**
             * Recharts defaults `rootTabIndex` to 0, which puts the ring in the tab order. Inside a
             * `role="img"` wrapper that element is pruned from the accessibility tree, so a keyboard
             * user would stop on something that announces nothing. The key and the table below are
             * the readable path (R-F7), so the ring itself is not a tab stop.
             */
            rootTabIndex={-1}
            innerRadius="56%"
            outerRadius="88%"
            paddingAngle={1}
            /* The paper colour, so the gap between slices reads as a gap rather than a grey ring. */
            stroke={CHART_PAPER}
            strokeWidth={2}
            isAnimationActive={false}
          >
            {slices.map((slice) => (
              <Cell key={slice.key} fill={slice.color} />
            ))}
          </Pie>
          <Tooltip content={ChartTooltip} />
        </PieChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}
