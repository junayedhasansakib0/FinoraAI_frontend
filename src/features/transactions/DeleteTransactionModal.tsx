import { useState } from 'react';

import { describeApiFailure } from '@/api/client';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useDeleteTransaction } from '@/hooks/use-transactions';
import { formatTransactionDate } from '@/lib/format';

import { AMOUNT_CLASS, signedAmount } from './amount';

import type { Transaction } from '@/types/api';

interface DeleteTransactionModalProps {
  /** The row awaiting an answer, or `null` when none is. */
  transaction: Transaction | null;
  currency: string;
  onClose: () => void;
  /** Called instead of `onClose` once the row is gone, so the page can follow it. */
  onDeleted: () => void;
}

interface ConfirmProps {
  transaction: Transaction;
  currency: string;
  onClose: () => void;
  onDeleted: () => void;
}

/**
 * The row is echoed back rather than named in the sentence: a person who clicked Delete on the
 * wrong line recognises the figure faster than a description repeated mid-paragraph.
 */
function Confirm({ transaction, currency, onClose, onDeleted }: ConfirmProps) {
  const deleteTransaction = useDeleteTransaction();
  const [failure, setFailure] = useState<string | null>(null);

  async function remove() {
    setFailure(null);

    try {
      await deleteTransaction.mutateAsync(transaction.id);
      onDeleted();
    } catch (error) {
      setFailure(describeApiFailure(error).message);
    }
  }

  return (
    <div>
      <p className="leading-7 text-ink-soft">
        This takes the transaction out of the ledger and out of every total that counted it. It
        cannot be undone.
      </p>

      <div className="mt-5 border-l-2 border-line pl-4">
        <p className={`font-serif text-xl tabular-nums ${AMOUNT_CLASS[transaction.type]}`}>
          {signedAmount(transaction, currency)}
        </p>
        <p className="mt-1 text-sm text-muted">{formatTransactionDate(transaction.date)}</p>
        {transaction.description !== null && (
          <p className="mt-1 text-sm break-words text-muted">{transaction.description}</p>
        )}
      </div>

      {failure !== null && (
        <p
          role="alert"
          className="mt-5 border-l-2 border-expense pl-4 text-sm leading-6 text-expense"
        >
          {failure}
        </p>
      )}

      <div className="mt-6 flex items-center justify-end gap-4">
        <Button variant="quiet" onClick={onClose} disabled={deleteTransaction.isPending}>
          Keep
        </Button>
        <Button
          variant="danger"
          disabled={deleteTransaction.isPending}
          onClick={() => {
            void remove();
          }}
        >
          {deleteTransaction.isPending ? 'Deleting…' : 'Delete transaction'}
        </Button>
      </div>
    </div>
  );
}

export function DeleteTransactionModal({
  transaction,
  currency,
  onClose,
  onDeleted,
}: DeleteTransactionModalProps) {
  return (
    <Modal open={transaction !== null} title="Delete transaction" onClose={onClose}>
      {transaction !== null && (
        <Confirm
          transaction={transaction}
          currency={currency}
          onClose={onClose}
          onDeleted={onDeleted}
        />
      )}
    </Modal>
  );
}
