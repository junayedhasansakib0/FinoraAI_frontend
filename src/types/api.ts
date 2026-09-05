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
