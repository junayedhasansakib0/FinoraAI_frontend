import { useState } from 'react';

import {
  generateBudgetRecommendations,
  generateMonthlySummary,
  generateSavingsRecommendations,
  generateSpendingAnalysis,
} from '@/api/ai';
import { Select } from '@/components/ui/Select';

import { ReportCard } from './ReportCard';
import { ReportHistory } from './ReportHistory';
import { monthName } from './shared';

/**
 * The AI Insights page: the four aggregate-based reports (ARCHITECTURE.md §7, R-I1), each behind its
 * own generate/refresh card, plus the history of what has been generated. All figures are drawn from
 * server-side aggregates and every report renders as plain text with its disclaimer (R-I4/R-I5); the
 * page itself does no financial math (R-B3). The monthly summary is the only report that takes an
 * input — the month it covers — so it carries a month/year picker.
 */

const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export function AiInsightsPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const years = [now.getFullYear(), now.getFullYear() - 1, now.getFullYear() - 2];

  return (
    <div className="space-y-10">
      <header>
        <h1 className="font-serif text-3xl sm:text-4xl">AI Insights</h1>
        <p className="mt-2 max-w-[60ch] text-sm text-muted">
          Plain-language reports drawn from your own aggregated figures. Informational only — not
          financial advice. A report is reused for 24 hours; refresh to generate a new one.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <ReportCard
          title="Spending analysis"
          description="Where your money has gone across recent months, and where there may be room to save."
          type="SPENDING_ANALYSIS"
          run={(refresh) => generateSpendingAnalysis(refresh)}
        />

        <ReportCard
          title="Monthly summary"
          description="A recap of one month's income, spending, and what stood out."
          type="MONTHLY_SUMMARY"
          run={(refresh) => generateMonthlySummary({ month, year }, refresh)}
          controls={
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Month"
                value={String(month)}
                onChange={(event) => {
                  setMonth(Number(event.target.value));
                }}
              >
                {MONTHS.map((value) => (
                  <option key={value} value={value}>
                    {monthName(value)}
                  </option>
                ))}
              </Select>
              <Select
                label="Year"
                value={String(year)}
                onChange={(event) => {
                  setYear(Number(event.target.value));
                }}
              >
                {years.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </Select>
            </div>
          }
        />

        <ReportCard
          title="Savings recommendations"
          description="How your saving is tracking against your goals, with ways to reach them sooner."
          type="SAVINGS_RECOMMENDATIONS"
          run={(refresh) => generateSavingsRecommendations(refresh)}
        />

        <ReportCard
          title="Budget recommendations"
          description="Suggested budgets for your categories, based on how you have actually been spending."
          type="BUDGET_RECOMMENDATIONS"
          run={(refresh) => generateBudgetRecommendations(refresh)}
        />
      </div>

      <ReportHistory />
    </div>
  );
}
