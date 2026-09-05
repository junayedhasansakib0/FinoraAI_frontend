/**
 * The dashboard's loading state (R-F5, R-S4). The bars sit in the same grid, at the same heights, as
 * the figures that replace them, so nothing jumps when the two requests answer. The class strings
 * below mirror `DashboardPage`'s — changing one means changing the other.
 */

const CHART_ROW = 'grid grid-cols-1 gap-x-10 gap-y-12 lg:grid-cols-2';
const BAR = 'bg-line motion-safe:animate-pulse';

function ChartBlock() {
  return (
    <div className="min-w-0">
      <div className={`h-6 w-44 ${BAR}`} />
      <div className={`mt-3 h-3 w-full max-w-sm ${BAR}`} />
      <div className={`mt-6 h-60 w-full sm:h-72 ${BAR}`} />
      <div className={`mt-6 h-3 w-32 ${BAR}`} />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div role="status" className="space-y-12">
      <span className="sr-only">Loading your dashboard</span>

      <div className={`h-9 w-52 ${BAR}`} />

      <div className="grid grid-cols-1 border-y border-line sm:grid-cols-3">
        <div className="border-b border-line py-7 sm:col-span-3">
          <div className={`h-3 w-24 ${BAR}`} />
          <div className={`mt-3 h-9 w-56 ${BAR} sm:h-12`} />
        </div>
        {[0, 1, 2].map((column) => (
          <div
            key={column}
            className="border-b border-line py-5 last:border-b-0 sm:border-b-0 sm:border-l sm:border-line sm:pl-6 sm:first:border-l-0 sm:first:pl-0"
          >
            <div className={`h-3 w-20 ${BAR}`} />
            <div className={`mt-2 h-7 w-32 ${BAR}`} />
          </div>
        ))}
      </div>

      <div className={CHART_ROW}>
        <div>
          <div className={`h-6 w-40 ${BAR}`} />
          <div className={`mt-3 h-3 w-48 ${BAR}`} />
          <div className="mt-6 grid grid-cols-1 gap-y-4 sm:grid-cols-3 sm:gap-x-6">
            {[0, 1, 2].map((figure) => (
              <div key={figure}>
                <div className={`h-3 w-16 ${BAR}`} />
                <div className={`mt-2 h-6 w-28 ${BAR}`} />
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className={`h-6 w-48 ${BAR}`} />
          <div className="mt-6 space-y-7">
            {[0, 1].map((meter) => (
              <div key={meter}>
                <div className={`h-3 w-40 ${BAR}`} />
                <div className={`mt-2 h-2 w-full ${BAR}`} />
                <div className={`mt-3 h-3 w-36 ${BAR}`} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={CHART_ROW}>
        <ChartBlock />
        <ChartBlock />
      </div>

      <div className={CHART_ROW}>
        <ChartBlock />

        <div className="min-w-0">
          <div className={`h-6 w-48 ${BAR}`} />
          <div className="mt-6 border-t border-line">
            {[0, 1, 2, 3, 4].map((row) => (
              <div key={row} className="border-b border-line py-3">
                <div className="flex items-baseline justify-between gap-4">
                  <div className={`h-3 w-40 ${BAR}`} />
                  <div className={`h-3 w-20 ${BAR}`} />
                </div>
                <div className={`mt-2 h-3 w-24 ${BAR}`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
