import { useEffect, useState } from 'react';

/**
 * Holds a fast-changing value still for `delayMs`, so a keystroke in a filter field does not
 * become a request of its own. The returned value trails the one passed in; nothing else differs.
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [settled, setSettled] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSettled(value);
    }, delayMs);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delayMs]);

  return settled;
}
