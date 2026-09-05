import { useId } from 'react';

import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { TextField } from '@/components/ui/TextField';
import { useCategories } from '@/hooks/use-categories';

import { hasActiveFilters } from './filters';
import { FIELD_LIMITS } from './schemas';

import type { SortOrder, TransactionFilters as Filters, TransactionSort } from '@/api/transactions';
import type { TransactionType } from '@/types/api';

interface TransactionFiltersProps {
  /** The values in the fields, before debouncing — the page owns them. */
  filters: Filters;
  onChange: (patch: Partial<Filters>) => void;
  onClear: () => void;
}

/** Reading the value back out of a `<select>` narrows a string, so nothing is cast. */
function asType(value: string): TransactionType | undefined {
  return value === 'income' || value === 'expense' ? value : undefined;
}

function asSort(value: string): TransactionSort {
  return value === 'amount' ? 'amount' : 'date';
}

function asOrder(value: string): SortOrder {
  return value === 'asc' ? 'asc' : 'desc';
}

/** A cleared field becomes absent, so it is dropped from the query string instead of sent empty. */
function orUndefined(value: string): string | undefined {
  return value.trim().length === 0 ? undefined : value;
}

const ORDER_LABELS: Record<TransactionSort, Record<SortOrder, string>> = {
  date: { desc: 'Newest first', asc: 'Oldest first' },
  amount: { desc: 'Largest first', asc: 'Smallest first' },
};

export function TransactionFilters({ filters, onChange, onClear }: TransactionFiltersProps) {
  const headingId = useId();
  const { data: categories } = useCategories();

  const sort = filters.sort ?? 'date';
  const order = filters.order ?? 'desc';
  const hasFilters = hasActiveFilters(filters);

  /** Only the chosen direction's categories can match, so the other direction is not offered. */
  const selectable = (categories ?? []).filter(
    (category) => filters.type === undefined || category.type === filters.type,
  );

  function changeType(value: string) {
    const type = asType(value);
    const selected = categories?.find((category) => category.id === filters.categoryId);
    const keepCategory = type === undefined || selected === undefined || selected.type === type;

    onChange({ type, categoryId: keepCategory ? filters.categoryId : undefined });
  }

  return (
    <section aria-labelledby={headingId} className="border border-line bg-white p-5 sm:p-6">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id={headingId} className="text-sm font-medium">
          Filters
        </h2>
        {hasFilters && (
          <Button variant="text" onClick={onClear}>
            Clear all
          </Button>
        )}
      </div>

      {/*
        `grid-cols-1` is explicit rather than implied: without a declared track, the single column
        is sized by its widest field's min-content — a browser's default input width, wider than a
        360px screen — instead of by the card. `minmax(0, 1fr)` is what lets the fields shrink.
      */}
      <div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="sm:col-span-2 lg:col-span-3">
          <TextField
            label="Search"
            type="search"
            placeholder="Description"
            maxLength={FIELD_LIMITS.description}
            value={filters.search ?? ''}
            onChange={(event) => {
              onChange({ search: orUndefined(event.target.value) });
            }}
          />
        </div>

        <Select
          label="Type"
          value={filters.type ?? ''}
          onChange={(event) => {
            changeType(event.target.value);
          }}
        >
          <option value="">Income and expense</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </Select>

        <Select
          label="Category"
          value={filters.categoryId ?? ''}
          onChange={(event) => {
            onChange({ categoryId: orUndefined(event.target.value) });
          }}
        >
          <option value="">All categories</option>
          {selectable.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>

        <TextField
          label="From"
          type="date"
          value={filters.from ?? ''}
          onChange={(event) => {
            onChange({ from: orUndefined(event.target.value) });
          }}
        />
        <TextField
          label="To"
          type="date"
          value={filters.to ?? ''}
          onChange={(event) => {
            onChange({ to: orUndefined(event.target.value) });
          }}
        />

        <TextField
          label="Min amount"
          inputMode="decimal"
          placeholder="0.00"
          value={filters.minAmount ?? ''}
          onChange={(event) => {
            onChange({ minAmount: orUndefined(event.target.value) });
          }}
        />
        <TextField
          label="Max amount"
          inputMode="decimal"
          placeholder="0.00"
          value={filters.maxAmount ?? ''}
          onChange={(event) => {
            onChange({ maxAmount: orUndefined(event.target.value) });
          }}
        />

        <Select
          label="Sort by"
          value={sort}
          onChange={(event) => {
            onChange({ sort: asSort(event.target.value) });
          }}
        >
          <option value="date">Date</option>
          <option value="amount">Amount</option>
        </Select>

        <Select
          label="Order"
          value={order}
          onChange={(event) => {
            onChange({ order: asOrder(event.target.value) });
          }}
        >
          <option value="desc">{ORDER_LABELS[sort].desc}</option>
          <option value="asc">{ORDER_LABELS[sort].asc}</option>
        </Select>
      </div>
    </section>
  );
}
