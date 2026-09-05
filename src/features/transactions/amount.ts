import { formatMoney } from '@/lib/format';

import type { Transaction, TransactionType } from '@/types/api';

/**
 * How an amount reads. Shared by the rows and by the delete confirmation, so the figure a person
 * confirms is written exactly like the row they clicked.
 */

export const AMOUNT_CLASS: Record<TransactionType, string> = {
  income: 'text-income',
  expense: 'text-expense',
};

/** The sign carries the direction too, so the meaning does not rest on colour alone. */
export function signedAmount(transaction: Transaction, currency: string): string {
  return `${transaction.type === 'income' ? '+' : '−'}${formatMoney(transaction.amount, currency)}`;
}
