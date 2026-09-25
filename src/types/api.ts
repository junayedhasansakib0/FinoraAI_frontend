/**
 * Response types mirrored by hand from the API contract in `ARCHITECTURE.md` §7. The client
 * is a separate repository and never imports server code (R-N7), so these must be updated
 * alongside the contract.
 */

export interface ApiSuccess<TData> {
  success: true;
  data: TData;
}

export interface ApiFailure {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/** `User` as returned by `/auth/*` — no token, no password hash, ever (§6). */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  currency: string;
  timezone: string;
  /** ISO-8601 timestamp. */
  createdAt: string;
}

export interface SessionPayload {
  user: AuthUser;
}

/** The two directions money can move; every category and transaction carries one (§5). */
export type TransactionType = 'income' | 'expense';

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  /** True for the rows seeded from the starter catalog at signup. */
  isDefault: boolean;
}

export interface CategoriesPayload {
  categories: Category[];
}

export interface CategoryPayload {
  category: Category;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  /** Sent as a string with exactly two decimals; never parsed into a float (R-B3, R-D2). */
  amount: string;
  description: string | null;
  /** ISO-8601 timestamp. */
  date: string;
  /** Null once the category it used has been deleted (R-D7). */
  category: { id: string; name: string } | null;
  createdAt: string;
}

export interface TransactionPayload {
  transaction: Transaction;
}

/** Income and expense sums for the whole filter, not just the page on screen (§7). */
export interface TransactionTotals {
  income: string;
  expense: string;
}

export interface TransactionPage {
  items: Transaction[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  totals: TransactionTotals;
}

/** The month the dashboard figures were cut in, on the account holder's own calendar (D9). */
export interface DashboardMonth {
  /** 1–12. */
  month: number;
  year: number;
  /** The zone the server actually used: the profile's, unless it could not be applied. */
  timezone: string;
}

export interface DashboardAllTime {
  income: string;
  expense: string;
  /** Income − expense, so it reads negative when more has gone out than came in. */
  balance: string;
}

export interface DashboardMonthTotals {
  income: string;
  expense: string;
  net: string;
}

/**
 * The overall budget for the current month. All three fields are null when none is set. What has
 * been spent is `currentMonth.expense`; the server does not publish it twice.
 */
export interface DashboardBudget {
  amount: string | null;
  remaining: string | null;
  pctUsed: number | null;
}

export interface DashboardSavings {
  goalCount: number;
  targetAmount: string;
  savedAmount: string;
  /** Null while there is no goal for it to be a percentage of. */
  progressPct: number | null;
}

export interface DashboardSummary {
  month: DashboardMonth;
  allTime: DashboardAllTime;
  currentMonth: DashboardMonthTotals;
  budget: DashboardBudget;
  savings: DashboardSavings;
  /** The five newest, in the same row shape `/transactions` publishes. */
  recentTransactions: Transaction[];
}

export interface AnalyticsPoint {
  month: number;
  year: number;
  income: string;
  expense: string;
  /** That month on its own. */
  net: string;
  /** The running balance at the month's close, carrying every row from before the window. */
  balance: string;
}

export interface BreakdownSlice {
  /** Null for spending whose category has since been deleted (R-D7). */
  categoryId: string | null;
  name: string | null;
  total: string;
  /** Percentage of the month's expenses, to one decimal. */
  share: number | null;
}

export interface CategoryBreakdown {
  month: number;
  year: number;
  total: string;
  categories: BreakdownSlice[];
  /** Everything past the published slices, so they still add up to `total`. */
  other: { categoryCount: number; total: string };
}

export interface DashboardAnalytics {
  months: number;
  timezone: string;
  /** Oldest month first, always `months` long, ending with the current one. */
  series: AnalyticsPoint[];
  breakdown: CategoryBreakdown;
}

/** Budget status thresholds (R-D6, ARCHITECTURE.md §7). */
export type BudgetStatus = 'ok' | 'warning' | 'exceeded';

export interface Budget {
  id: string;
  categoryId: string | null;
  amount: string;
  month: number;
  year: number;
  spent: string;
  remaining: string;
  pctUsed: number | null;
  status: BudgetStatus;
  categoryName: string | null;
}

export interface BudgetPayload {
  budget: Budget;
}

export interface BudgetsPayload {
  budgets: Budget[];
}

/** A goal is either still being saved for, or its deadline has passed (ARCHITECTURE.md §7). */
export type GoalDeadlineStatus = 'on-track' | 'past-deadline';

export interface Goal {
  id: string;
  name: string;
  /** All money is a two-decimal string; the client formats but never does the arithmetic (R-B3). */
  targetAmount: string;
  currentAmount: string;
  /** Target − current, floored at zero by the server. */
  remaining: string;
  /** Percentage of the target reached, capped at 100 even when over-saved. */
  progressPct: number;
  /** ISO-8601 instant the goal is due by. */
  deadline: string;
  /** Whole days from now to the deadline; negative once the deadline has passed. */
  daysRemaining: number;
  deadlineStatus: GoalDeadlineStatus;
  /** True once the current amount reaches or passes the target. */
  completed: boolean;
}

export interface GoalPayload {
  goal: Goal;
}

export interface GoalsPayload {
  goals: Goal[];
}

/**
 * Informational crypto market data from CoinGecko, proxied by the server (§7). It is NOT the
 * user's money-of-record: prices are external reference numbers quoted in USD, so they arrive as
 * `number`, not the two-decimal money strings the ledger uses. Any figure CoinGecko omits is null.
 */
export interface CryptoCoin {
  id: string;
  symbol: string;
  name: string;
  /** USD spot price; null when the upstream did not quote one. */
  price: number | null;
  /** Percentage move over the last 24h, already worked out upstream. */
  change24h: number | null;
  marketCap: number | null;
  /** Market-cap rank, 1 being the largest. */
  rank: number | null;
}

export interface CryptoMarketsPayload {
  coins: CryptoCoin[];
}

/** A lightweight search hit from `/crypto/search` — enough to name and rank a coin, no price. */
export interface CryptoSearchCoin {
  id: string;
  symbol: string;
  name: string;
  rank: number | null;
}

export interface CryptoSearchPayload {
  coins: CryptoSearchCoin[];
}

/**
 * Currency converter data from Frankfurter, proxied by the server (§7). Rates are ECB reference
 * numbers quoted against a base currency — informational and NOT real-time — so, like crypto
 * prices, they arrive as `number`, not the two-decimal money strings the ledger uses (R-B3). All
 * conversion math is done on the server; the client only formats what it is given.
 */
export interface CurrencyRatesPayload {
  base: string;
  /** The ECB working day the rates belong to, `YYYY-MM-DD`. */
  asOf: string;
  rates: Record<string, number>;
}

export interface CurrencyConvertPayload {
  result: number;
  rate: number;
  /** The ECB working day the rate belongs to, `YYYY-MM-DD`. */
  date: string;
}

/**
 * AI report kinds (ARCHITECTURE.md §7 AI, §8). Each maps to one `/ai` endpoint. The `QA` kind the
 * server schema allows is Phase 12's business and is deliberately absent here.
 */
export const AI_REPORT_TYPES = [
  'SPENDING_ANALYSIS',
  'MONTHLY_SUMMARY',
  'SAVINGS_RECOMMENDATIONS',
  'BUDGET_RECOMMENDATIONS',
] as const;

export type AiReportType = (typeof AI_REPORT_TYPES)[number];

/**
 * The Q&A kind (Phase 12): produced by `POST /ai/chat` from a free-text question, never by the four
 * report generators, so it is deliberately kept out of `AI_REPORT_TYPES`. It appears only in stored
 * history, which is why the history filter and `AiReport.type` below span it via `AiReportHistoryType`.
 */
export const QA_REPORT_TYPE = 'QA' as const;

/** Every kind that can appear in stored history: the four reports plus QA (ARCHITECTURE.md §7). */
export const AI_HISTORY_TYPES = [...AI_REPORT_TYPES, QA_REPORT_TYPE] as const;

export type AiReportHistoryType = (typeof AI_HISTORY_TYPES)[number];

/**
 * The validated shapes of `AiReport.content`, one per kind (server: `reports.schema.ts`). Every
 * field is a plain string or list of strings so the client renders them as text, never HTML
 * (R-I4/R-I5). Content still arrives typed as `unknown` on the wire and is narrowed before render.
 */
export interface SpendingAnalysisContent {
  summary: string;
  spendingPatterns: string[];
  notableCategories: string[];
  savingsOpportunities: string[];
}

export interface MonthlySummaryContent {
  summary: string;
  observations: string[];
  recommendations: string[];
}

export interface SavingsRecommendationsContent {
  summary: string;
  recommendations: string[];
  goalNotes: string[];
}

/** One suggested budget line; `amount` is a plain display string, never used for client math (R-B3). */
export interface SuggestedBudget {
  category: string;
  amount: string;
  rationale: string;
}

export interface BudgetRecommendationsContent {
  summary: string;
  suggestedBudgets: SuggestedBudget[];
  adjustments: string[];
}

/**
 * A stored Q&A exchange's `content` (Phase 12): the question the user asked and the model's answer,
 * both plain strings the client renders as text, never HTML (R-I4/R-I5). Like report content it
 * arrives typed as `unknown` on the wire and is narrowed defensively before render.
 */
export interface QaContent {
  question: string;
  answer: string;
}

/**
 * A generated AI report as it comes off the wire (§7). `content` is the model's validated output —
 * always rendered as plain text (R-I5). `disclaimer` rides on every report so the "informational,
 * not advice" line cannot be dropped (R-I5). `cached` is true when the row was reused rather than
 * freshly generated (the 24h reuse rule, R-I6). `type` spans QA because stored history can hold a
 * Q&A row, whose `content` is a `QaContent` rather than a report `*Content`.
 */
export interface AiReport {
  id: string;
  type: AiReportHistoryType;
  /** Narrowed to the matching *Content interface at render time; untrusted until then (R-I4). */
  content: unknown;
  /** ISO-8601 timestamp. */
  createdAt: string;
  disclaimer: string;
  cached: boolean;
}

/** `GET /ai/reports` payload: the user's recent reports, newest first. */
export interface AiReportsPayload {
  reports: AiReport[];
}

/**
 * `POST /ai/chat` response (Phase 12, §7): the plain-text answer grounded in the user's aggregates,
 * the id of the persisted QA report, and the disclaimer that rides on every AI response (R-I5). The
 * answer is rendered as text, never HTML (R-I4/R-I5).
 */
export interface ChatAnswer {
  answer: string;
  reportId: string;
  disclaimer: string;
}
