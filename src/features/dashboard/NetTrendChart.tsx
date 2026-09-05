import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
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

interface NetTrendChartProps {
  series: AnalyticsPoint[];
  currency: string;
}

interface AreaDatum extends TooltipDatum {
  label: string;
  balance: number;
}

/**
 * §3's second chart: the net-balance trend. Each point is the balance at that month's close, which
 * the API built by carrying every row from before the window — so the line starts where the account
 * actually stood, not at zero.
 *
 * One series, so there is no legend to disambiguate: the heading names it and the zero rule shows
 * which side of nothing the line is on.
 */
export function NetTrendChart({ series, currency }: NetTrendChartProps) {
  const data: AreaDatum[] = series.map((point) => ({
    label: formatMonthShort(point.month, point.year),
    /** A coordinate, and the only number derived from an amount on this screen (R-B3). */
    balance: Number(point.balance),
    tipLabel: formatMonthLong(point.month, point.year),
    tipLines: [
      { name: 'Balance', text: formatMoney(point.balance, currency) },
      { name: 'Net this month', text: formatMoney(point.net, currency) },
    ],
  }));

  const rows: ChartTableRow[] = series.map((point) => ({
    label: formatMonthLong(point.month, point.year),
    values: [formatMoney(point.net, currency), formatMoney(point.balance, currency)],
  }));

  const first = series.at(0);
  const last = series.at(-1);
  const closing = last === undefined ? '' : ` It closes at ${formatMoney(last.balance, currency)}.`;
  const range =
    first === undefined || last === undefined
      ? ''
      : ` from ${formatMonthLong(first.month, first.year)} to ${formatMonthLong(last.month, last.year)}`;

  return (
    <ChartFrame
      title="Net balance trend"
      summary={`Where the balance stood at the close of each month${range}.`}
      plotLabel={`Area chart of the running net balance at the close of each month${range}.${closing} The same figures are in the table below.`}
      columns={['Month', 'Net', 'Balance']}
      rows={rows}
      plotClassName="h-60 sm:h-72"
    >
      <ResponsiveContainer width="100%" height="100%">
        {/* `accessibilityLayer` off for the same reason as the bar chart: see IncomeExpenseChart. */}
        <AreaChart
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
          {/* Without this a balance below zero would read as a small positive one. */}
          <ReferenceLine y={0} stroke={CHART_TEXT} />
          <Tooltip content={ChartTooltip} cursor={{ stroke: CHART_TEXT }} />
          <Area
            type="linear"
            dataKey="balance"
            name="Balance"
            stroke={SERIES_COLORS.balance}
            strokeWidth={2}
            fill={SERIES_COLORS.balance}
            fillOpacity={0.12}
            dot={{ r: 3, fill: SERIES_COLORS.balance, strokeWidth: 0 }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}
