import type { AiReportType } from '@/types/api';

/** Shared bits the AI Insights cards and the history list both lean on. */

/** The one query key the history read is stored under, so a fresh report can invalidate it. */
export const AI_REPORTS_QUERY_KEY = ['ai', 'reports'] as const;

/** Human labels for the four report kinds (ARCHITECTURE.md §7); the wire keeps the enum. */
export const REPORT_LABELS: Record<AiReportType, string> = {
  SPENDING_ANALYSIS: 'Spending analysis',
  MONTHLY_SUMMARY: 'Monthly summary',
  SAVINGS_RECOMMENDATIONS: 'Savings recommendations',
  BUDGET_RECOMMENDATIONS: 'Budget recommendations',
};

/** A month name on its own ("September"), on the UTC calendar so it never slips a month. */
const monthNameFormatter = new Intl.DateTimeFormat(undefined, { month: 'long', timeZone: 'UTC' });

export function monthName(month: number): string {
  return monthNameFormatter.format(new Date(Date.UTC(2000, month - 1, 1)));
}
