import type { TooltipContentProps } from 'recharts';

/**
 * The tooltip every dashboard chart shares. It formats nothing: each chart precomputes the lines on
 * the datum it hands Recharts, so what a person reads on hover is the same string the table and the
 * KPI figures show (R-F6).
 *
 * The plot itself is `role="img"`, so nothing here is announced — the table under each chart is the
 * readable path, and this is the convenience for a pointer.
 */

export interface TooltipLine {
  name: string;
  /** Already formatted money or a percentage. */
  text: string;
  tone?: string;
}

export interface TooltipDatum {
  /** The point's own heading — a month, a category. */
  tipLabel: string;
  tipLines: TooltipLine[];
}

function datumOf(payload: TooltipContentProps['payload']): TooltipDatum | null {
  const first = payload[0];

  if (first === undefined) {
    return null;
  }

  // Recharts types the datum it hands back as `any`; this is the one place it is given a name.
  const datum = first.payload as TooltipDatum | undefined;

  return datum ?? null;
}

export function ChartTooltip({ active, payload }: TooltipContentProps) {
  const datum = active ? datumOf(payload) : null;

  if (datum === null) {
    return null;
  }

  return (
    <div className="border border-line bg-paper px-3 py-2 text-sm">
      <p className="font-medium">{datum.tipLabel}</p>

      <dl className="mt-1 space-y-1">
        {datum.tipLines.map((line) => (
          <div key={line.name} className="flex items-baseline justify-between gap-6">
            <dt className="text-muted">{line.name}</dt>
            <dd className={`tabular-nums ${line.tone ?? ''}`}>{line.text}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
