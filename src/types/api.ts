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
