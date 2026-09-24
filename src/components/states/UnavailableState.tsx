import { Button } from '@/components/ui/Button';

interface UnavailableStateProps {
  /** What is temporarily out of reach, in the interface's voice. */
  title?: string;
  message: string;
  onRetry?: () => void;
  retrying?: boolean;
}

/**
 * A degraded-source state, distinct from an outright error (ErrorState): the app is fine, but an
 * external data source is unreachable right now (ARCHITECTURE.md §9). It reads as a status rather
 * than an alarm — `role="status"` — because nothing the person did went wrong, and it is expected
 * to recover on its own. The neutral rule keeps it visually calmer than the red error rule.
 */
export function UnavailableState({
  title = 'This data is unavailable right now',
  message,
  onRetry,
  retrying = false,
}: UnavailableStateProps) {
  return (
    <div role="status" className="border-l-2 border-warning pl-5">
      <p className="font-serif text-xl">{title}</p>
      <p className="mt-3 max-w-[54ch] leading-7 text-ink-soft">{message}</p>

      {onRetry !== undefined && (
        <div className="mt-6">
          <Button onClick={onRetry} disabled={retrying}>
            {retrying ? 'Trying again…' : 'Try again'}
          </Button>
        </div>
      )}
    </div>
  );
}
