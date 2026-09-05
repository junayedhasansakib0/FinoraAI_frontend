import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { ChartFrame } from '@/components/charts/ChartFrame';
import { ChartTooltip } from '@/components/charts/ChartTooltip';
import { CHART_LINE, CHART_TEXT, SERIES_COLORS } from '@/components/charts/colors';
import { formatAxisAmount, formatMoney, formatMonthLong, formatMonthShort } from '@/lib/format';

import type { ChartTableRow } from '@/components/charts/ChartFrame';
import type { TooltipDatum } from '@/components/charts/ChartTooltip';
import type { AnalyticsPoint } from '@/types/api';

interface IncomeExpenseChartProps {
  series: AnalyticsPoint[];
  currency: string;
}

interface BarDatum extends TooltipDatum {
  label: string;
  income: number;
  expense: number;
}

/**
 * §3's first chart: income against expenses, one pair of bars per month. Income green and expense
 * red are the same two colours the ledger uses for the same two meanings (R-S3), and the legend
 * names them so the pairing does not rest on colour alone.
 */
export function IncomeExpenseChart({ series, currency }: IncomeExpenseChartProps) {
  const data: BarDatum[] = series.map((point) => ({
    label: formatMonthShort(point.month, point.year),
    /**
     * `Number` here and nowhere else: a bar's height is a coordinate, and it is the only thing
     * derived from the amount. Every figure a person reads is the API's own string (R-B3, R-F6).
     */
    income: Number(point.income),
    expense: Number(point.expense),
    tipLabel: formatMonthLong(point.month, point.year),
    tipLines: [
      { name: 'Income', text: formatMoney(point.income, currency), tone: 'text-income' },
      { name: 'Expenses', text: formatMoney(point.expense, currency), tone: 'text-expense' },
    ],
  }));

  const rows: ChartTableRow[] = series.map((point) => ({
    label: formatMonthLong(point.month, point.year),
    values: [formatMoney(point.income, currency), formatMoney(point.expense, currency)],
  }));

  const first = series.at(0);
  const last = series.at(-1);
  const range =
    first === undefined || last === undefined
      ? ''
      : ` from ${formatMonthLong(first.month, first.year)} to ${formatMonthLong(last.month, last.year)}`;

  return (
    <ChartFrame
      title="Income and expenses"
      summary={`What came in against what went out, month by month${range}.`}
      plotLabel={`Grouped bar chart of income against expenses for each month${range}. The same figures are in the table below.`}
      columns={['Month', 'Income', 'Expenses']}
      rows={rows}
      plotClassName="h-60 sm:h-72"
      /**
       * The key is HTML in the frame's own slot, not Recharts' `<Legend>`, for the reason the donut's
       * is: `<Legend>` draws inside the `role="img"` wrapper, where a screen reader never reaches the
       * two words that say which colour is which. Recharts 3 also builds its payload from the order
       * its children register in and makes it read-only, which listed Expenses first while the income
       * bar is drawn first — here the order is the order of the bars.
       */
      legend={
        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {[
            { label: 'Income', color: SERIES_COLORS.income },
            { label: 'Expenses', color: SERIES_COLORS.expense },
          ].map((entry) => (
            <li key={entry.label} className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="size-2.5 shrink-0"
                style={{ backgroundColor: entry.color }}
              />
              {entry.label}
            </li>
          ))}
        </ul>
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        {/*
          `accessibilityLayer` is off deliberately. It gives the plot `role="application"` and
          `tabIndex=0`, and a focusable element inside a `role="img"` wrapper is pruned from the
          accessibility tree — focus would land somewhere that announces nothing. The table under
          the chart is the readable path instead (R-F7).
        */}
        <BarChart
          data={data}
          accessibilityLayer={false}
          margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
        >
          <CartesianGrid vertical={false} stroke={CHART_LINE} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={{ stroke: CHART_LINE }}
            tick={{ fill: CHART_TEXT, fontSize: 12 }}
          />
          <YAxis
            width={48}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatAxisAmount}
            tick={{ fill: CHART_TEXT, fontSize: 12 }}
          />
          <Tooltip content={ChartTooltip} cursor={{ fill: CHART_LINE, fillOpacity: 0.35 }} />
          {/* Animation stays off: it would replay on every refetch, and it answers no one's action. */}
          <Bar
            dataKey="income"
            name="Income"
            fill={SERIES_COLORS.income}
            maxBarSize={28}
            isAnimationActive={false}
          />
          <Bar
            dataKey="expense"
            name="Expenses"
            fill={SERIES_COLORS.expense}
            maxBarSize={28}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}
