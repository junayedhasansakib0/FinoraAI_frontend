import type { AiReportType, SuggestedBudget } from '@/types/api';

/**
 * Renders a report's `content` as plain text (R-I4/R-I5). The content is validated on the server,
 * but it is still model output and stays untrusted here: it is only ever placed in React text nodes
 * (which escape it) — never `dangerouslySetInnerHTML`, never a URL, never executed. The wire types
 * it as `unknown`, so every field is narrowed defensively before it reaches the screen; a missing or
 * wrong-typed field simply renders nothing rather than throwing.
 */

function record(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {};
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function asStringList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : [];
}

function asSuggestedBudgets(value: unknown): SuggestedBudget[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((entry) => {
      const row = record(entry);
      return {
        category: asString(row.category),
        amount: asString(row.amount),
        rationale: asString(row.rationale),
      };
    })
    .filter((budget) => budget.category.length > 0 || budget.rationale.length > 0);
}

function Summary({ text }: { text: string }) {
  if (text.length === 0) return null;

  return <p className="leading-7 text-ink-soft">{text}</p>;
}

function Bullets({ label, items }: { label: string; items: string[] }) {
  if (items.length === 0) return null;

  return (
    <div>
      <h4 className="text-sm font-medium">{label}</h4>
      <ul className="mt-2 space-y-1.5">
        {items.map((item, index) => (
          <li key={`${label}-${String(index)}`} className="flex gap-2 text-sm text-ink-soft">
            <span aria-hidden className="text-muted">
              —
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SuggestedBudgets({ budgets }: { budgets: SuggestedBudget[] }) {
  if (budgets.length === 0) return null;

  return (
    <div>
      <h4 className="text-sm font-medium">Suggested budgets</h4>
      <ul className="mt-2 space-y-3">
        {budgets.map((budget, index) => (
          <li key={`budget-${String(index)}`} className="border-l-2 border-line pl-3 text-sm">
            <p className="text-ink">
              {budget.category}
              {budget.amount.length > 0 && <span className="text-muted"> · {budget.amount}</span>}
            </p>
            {budget.rationale.length > 0 && (
              <p className="mt-1 leading-6 text-ink-soft">{budget.rationale}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Narrow the untrusted content to the shape its report kind promises, then render it as text. */
export function ReportContentView({ type, content }: { type: AiReportType; content: unknown }) {
  const data = record(content);
  const summary = asString(data.summary);

  switch (type) {
    case 'SPENDING_ANALYSIS':
      return (
        <div className="space-y-5">
          <Summary text={summary} />
          <Bullets label="Spending patterns" items={asStringList(data.spendingPatterns)} />
          <Bullets label="Notable categories" items={asStringList(data.notableCategories)} />
          <Bullets label="Savings opportunities" items={asStringList(data.savingsOpportunities)} />
        </div>
      );
    case 'MONTHLY_SUMMARY':
      return (
        <div className="space-y-5">
          <Summary text={summary} />
          <Bullets label="Observations" items={asStringList(data.observations)} />
          <Bullets label="Recommendations" items={asStringList(data.recommendations)} />
        </div>
      );
    case 'SAVINGS_RECOMMENDATIONS':
      return (
        <div className="space-y-5">
          <Summary text={summary} />
          <Bullets label="Recommendations" items={asStringList(data.recommendations)} />
          <Bullets label="Goal notes" items={asStringList(data.goalNotes)} />
        </div>
      );
    case 'BUDGET_RECOMMENDATIONS':
      return (
        <div className="space-y-5">
          <Summary text={summary} />
          <SuggestedBudgets budgets={asSuggestedBudgets(data.suggestedBudgets)} />
          <Bullets label="Adjustments" items={asStringList(data.adjustments)} />
        </div>
      );
  }
}
