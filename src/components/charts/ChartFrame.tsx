import type { ReactNode } from 'react';

/**
 * The frame every chart on the dashboard sits in, so all three carry the same text alternative
 * (R-F7): a heading, one sentence saying what the plot shows, an `aria-label` standing in for the
 * plot itself, and the same numbers as a table anyone can open.
 *
 * The plot is `role="img"`, which stops a screen reader walking the hundreds of `<text>`, `<path>`
 * and `<tspan>` nodes Recharts emits — read in order they are noise, and the table below is the
 * readable form of the same figures.
 */

export interface ChartTableRow {
  /** The row's own heading — a month, a category. */
  label: string;
  /** One per column after the first, already formatted (R-F6). */
  values: string[];
}

interface ChartFrameProps {
  title: string;
  /** One sentence, shown to everyone rather than hidden for screen readers alone. */
  summary: string;
  /** What is announced in place of the plot: the shape of it, and the headline figure. */
  plotLabel: string;
  /** The first heading names the row column; the rest name the value columns. */
  columns: string[];
  rows: ChartTableRow[];
  /** Tailwind height for the plot. `ResponsiveContainer` needs a parent with a resolved height. */
  plotClassName?: string;
  /**
   * A key rendered outside the plot, for charts whose slices are only identifiable by colour. It
   * sits outside the `role="img"` wrapper on purpose: a legend is text, and text should be read.
   */
  legend?: ReactNode;
  children: ReactNode;
}

export function ChartFrame({
  title,
  summary,
  plotLabel,
  columns,
  rows,
  plotClassName = 'h-64',
  legend,
  children,
}: ChartFrameProps) {
  const [rowHeading, ...valueHeadings] = columns;

  return (
    <section className="min-w-0">
      <h2 className="font-serif text-xl">{title}</h2>
      <p className="mt-2 max-w-[60ch] text-sm leading-6 text-muted">{summary}</p>

      <div role="img" aria-label={plotLabel} className={`mt-6 ${plotClassName}`}>
        {children}
      </div>

      {legend !== undefined && <div className="mt-5">{legend}</div>}

      <details className="mt-4 border-t border-line pt-3 text-sm">
        <summary className="cursor-pointer text-muted hover:text-ink">Show the numbers</summary>

        <table className="mt-3 w-full border-collapse">
          <caption className="sr-only">{title}, as a table</caption>
          <thead>
            <tr className="border-b border-line text-left text-muted">
              <th scope="col" className="py-2 pr-4 font-medium">
                {rowHeading}
              </th>
              {valueHeadings.map((heading) => (
                <th key={heading} scope="col" className="py-2 pl-4 text-right font-medium">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b border-line">
                <th scope="row" className="py-2 pr-4 text-left font-normal wrap-anywhere">
                  {row.label}
                </th>
                {row.values.map((value, index) => (
                  <td
                    key={valueHeadings[index] ?? index}
                    className="py-2 pl-4 text-right tabular-nums whitespace-nowrap"
                  >
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </section>
  );
}
