import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { fetchCryptoMarkets } from '@/api/crypto';
import { describeApiFailure } from '@/api/client';
import { EmptyState } from '@/components/states/EmptyState';
import { ErrorState } from '@/components/states/ErrorState';
import { UnavailableState } from '@/components/states/UnavailableState';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { CoinCard } from './CoinCard';

import type { CryptoCoin } from '@/types/api';

/**
 * The crypto page: an informational market dashboard fed only through the Finora API, never a
 * direct CoinGecko call (R-E4). The data is cached server-side and is NOT real-time; the page says
 * so plainly and offers nothing to trade with (PROJECT_CONTEXT.md §4.7, §7). When the upstream is
 * down the server answers 503 and this page degrades to an "unavailable" notice rather than an
 * error, leaving the rest of the app untouched (ARCHITECTURE.md §9).
 */

/** Matches the ledger's debounce: a typed word costs one request, not one per keystroke. */
const SEARCH_DELAY_MS = 300;

/** The server serves the top coins in pages of this size and caps the page number at 10. */
const PER_PAGE = 50;
const MAX_PAGE = 10;

export function CryptoPage() {
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);

  const search = useDebouncedValue(searchInput.trim(), SEARCH_DELAY_MS);
  const isSearching = search.length > 0;

  // A search ignores the page entirely; the top-coins list is the only paged view.
  const params = isSearching ? { search } : { page };

  const { data, isPending, isError, error, isFetching, refetch } = useQuery({
    queryKey: ['crypto', 'markets', params],
    queryFn: ({ signal }) => fetchCryptoMarkets(params, signal),
  });

  const coins: CryptoCoin[] = data ?? [];
  const failure = isError ? describeApiFailure(error) : null;
  const isUnavailable = failure?.code === 'UPSTREAM_UNAVAILABLE';

  function changeSearch(value: string) {
    setSearchInput(value);
    setPage(1);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl">Cryptocurrency</h1>
          <p className="mt-2 max-w-[60ch] text-sm text-muted">
            Popular coins by market capitalisation. Informational only — not investment advice, and
            there is nothing to trade here. Figures are cached and are not real-time. Data provided
            by CoinGecko.
          </p>
        </div>

        <Button
          variant="quiet"
          onClick={() => {
            void refetch();
          }}
          disabled={isFetching}
        >
          {isFetching ? 'Refreshing…' : 'Refresh'}
        </Button>
      </div>

      <div className="max-w-md">
        <TextField
          type="search"
          label="Search"
          placeholder="Bitcoin, ETH, solana…"
          hint="Search by coin name or symbol."
          value={searchInput}
          onChange={(event) => {
            changeSearch(event.target.value);
          }}
        />
      </div>

      <div>
        {isError && isUnavailable && (
          <UnavailableState
            title="Market data is unavailable right now"
            message="The market data source could not be reached. This does not affect the rest of Finora — please try again shortly."
            retrying={isFetching}
            onRetry={() => {
              void refetch();
            }}
          />
        )}

        {isError && !isUnavailable && (
          <ErrorState
            title="Could not load market data"
            message={failure?.message ?? 'Something went wrong loading the market data.'}
            retrying={isFetching}
            onRetry={() => {
              void refetch();
            }}
          />
        )}

        {isPending && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="h-40 w-full animate-pulse rounded bg-line/20" />
            <div className="h-40 w-full animate-pulse rounded bg-line/20" />
            <div className="h-40 w-full animate-pulse rounded bg-line/20" />
          </div>
        )}

        {!isPending && !isError && coins.length === 0 && (
          <EmptyState
            title={isSearching ? 'No coins match your search' : 'No market data'}
            message={
              isSearching
                ? 'No coin matched that name or symbol. Try a different term.'
                : 'There is no market data to show right now. Try refreshing in a moment.'
            }
          />
        )}

        {!isPending && !isError && coins.length > 0 && (
          <>
            <div
              className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${
                isFetching ? 'opacity-60 transition-opacity' : ''
              }`}
            >
              {coins.map((coin) => (
                <CoinCard key={coin.id} coin={coin} />
              ))}
            </div>

            {!isSearching && (
              <div className="mt-8 flex items-center justify-between gap-4">
                <Button
                  variant="quiet"
                  size="sm"
                  disabled={page <= 1 || isFetching}
                  onClick={() => {
                    setPage((current) => Math.max(1, current - 1));
                  }}
                >
                  Previous
                </Button>

                <span className="text-sm text-muted">Page {page}</span>

                <Button
                  variant="quiet"
                  size="sm"
                  disabled={page >= MAX_PAGE || coins.length < PER_PAGE || isFetching}
                  onClick={() => {
                    setPage((current) => Math.min(MAX_PAGE, current + 1));
                  }}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

