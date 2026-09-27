import { useTheme } from '@/context/theme-context';

function SunIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-[18px]"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-[18px]"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
    </svg>
  );
}

/**
 * A compact light/dark switch: it shows the theme in effect (sun for light, moon for dark) and, on
 * click, sets the opposite as an explicit preference. The three-way choice including "System" lives
 * in Settings; this is the one-tap toggle in the app frame.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setPreference } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const label = isDark ? 'Switch to light theme' : 'Switch to dark theme';

  return (
    <button
      type="button"
      onClick={() => {
        setPreference(isDark ? 'light' : 'dark');
      }}
      aria-label={label}
      title={label}
      className={[
        'inline-flex items-center justify-center border border-line p-2 text-muted transition-colors hover:border-ink hover:text-ink',
        className ?? '',
      ]
        .filter((part) => part.length > 0)
        .join(' ')}
    >
      {isDark ? <MoonIcon /> : <SunIcon />}
    </button>
  );
}
