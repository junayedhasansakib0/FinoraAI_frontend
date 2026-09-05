import { Button } from '@/components/ui/Button';

interface ErrorStateProps {
  /** What failed, in the interface's voice. */
  title?: string;
  message: string;
  onRetry?: () => void;
  retrying?: boolean;
}

/**
 * The error half of R-F5. The retry button lives here rather than at the call sites because it is
 * the same button every time; what differs is only the sentence above it.
 */
export function ErrorState({
  title = 'That request did not go through',
  message,
  onRetry,
  retrying = false,
}: ErrorStateProps) {
  return (
    <div role="alert" className="border-l-2 border-expense pl-5">
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
