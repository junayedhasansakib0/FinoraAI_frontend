import { describe, expect, it } from 'vitest';

import { formatMoney } from '@/lib/format';

import type { Transaction } from '@/types/api';

import { AMOUNT_CLASS, signedAmount } from './amount';

/**
 * `signedAmount` (R-T5): the sign carries direction so meaning never rests on colour alone. The
 * money portion is delegated to `formatMoney`, so it is compared against that same call rather
 * than a hard-coded locale string (R-T6).
 */

function txn(type: Transaction['type'], amount: string): Transaction {
  return {
    id: 'txn_1',
    type,
    amount,
    description: null,
    date: '2026-08-01T00:00:00.000Z',
    category: null,
    createdAt: '2026-08-01T00:00:00.000Z',
  };
}

describe('signedAmount', () => {
  it('prefixes income with a plus', () => {
    expect(signedAmount(txn('income', '3000.00'), 'USD')).toBe(`+${formatMoney('3000.00', 'USD')}`);
  });

  it('prefixes expense with a minus sign', () => {
    expect(signedAmount(txn('expense', '4.50'), 'USD')).toBe(`−${formatMoney('4.50', 'USD')}`);
  });
});

describe('AMOUNT_CLASS', () => {
  it('maps each direction to its own token class', () => {
    expect(AMOUNT_CLASS.income).toBe('text-income');
    expect(AMOUNT_CLASS.expense).toBe('text-expense');
  });
});
