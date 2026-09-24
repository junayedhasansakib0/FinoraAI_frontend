import { formatChange, formatCoinPrice, formatMarketCap } from './format';

import type { CryptoCoin } from '@/types/api';

/**
 * One coin, as a card in the markets grid. The 24h change is coloured (green up, red down) but its
 * meaning never rests on colour alone: the leading +/- sign and an aria-hidden arrow carry the
 * direction too, and the whole figure has a spoken label. Prices are informational USD reference
 * numbers, not the user's money.
 */
export function CoinCard({ coin }: { coin: CryptoCoin }) {
  const isUp = coin.change24h !== null && coin.change24h > 0;
  const isDown = coin.change24h !== null && coin.change24h < 0;

  const changeColor = isUp ? 'text-income' : isDown ? 'text-expense' : 'text-muted';
  const arrow = isUp ? '▲' : isDown ? '▼' : '';
  const changeText = formatChange(coin.change24h);

  return (
    <div className="flex flex-col gap-4 rounded border border-line bg-surface p-5 shadow-2xs">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden="true"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line text-xs font-semibold uppercase tracking-wide text-ink-soft"
          >
            {coin.symbol.slice(0, 4)}
          </span>
          <div className="min-w-0">
            <h2 className="truncate font-medium text-ink">{coin.name}</h2>
            <p className="text-xs uppercase tracking-wide text-muted">{coin.symbol}</p>
          </div>
        </div>

        {coin.rank !== null && (
          <span className="shrink-0 text-xs text-muted" aria-label={`Market cap rank ${String(coin.rank)}`}>
            #{coin.rank}
          </span>
        )}
      </div>

      <div className="flex items-end justify-between gap-3 border-t border-line/60 pt-3">
        <div>
          <span className="block text-xs text-muted">Price</span>
          <span className="font-medium text-ink">{formatCoinPrice(coin.price)}</span>
        </div>

        <div className="text-right">
          <span className="block text-xs text-muted">24h</span>
          <span className={`font-medium ${changeColor}`} aria-label={`24-hour change ${changeText}`}>
            {arrow !== '' && <span aria-hidden="true">{arrow} </span>}
            {changeText}
          </span>
        </div>
      </div>

      <div className="border-t border-line/60 pt-3 text-xs">
        <span className="text-muted">Market cap </span>
        <span className="font-medium text-ink">{formatMarketCap(coin.marketCap)}</span>
      </div>
    </div>
  );
}
