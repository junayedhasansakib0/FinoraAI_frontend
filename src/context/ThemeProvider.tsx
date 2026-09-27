import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  ThemeContext,
  THEME_STORAGE_KEY,
  type ResolvedTheme,
  type ThemePreference,
} from './theme-context';

import type { ReactNode } from 'react';

const MEDIA_QUERY = '(prefers-color-scheme: dark)';

function readStoredPreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }
  } catch {
    /* Storage unavailable (private mode, blocked) — fall through to the default. */
  }
  return 'system';
}

function readSystemTheme(): ResolvedTheme {
  try {
    return window.matchMedia(MEDIA_QUERY).matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

function resolve(preference: ThemePreference, system: ResolvedTheme): ResolvedTheme {
  return preference === 'system' ? system : preference;
}

/**
 * Owns the theme choice: reads the stored preference, tracks the OS setting so `system` stays live
 * without a reload, applies the resolved theme to `<html>` (the same `data-theme` the pre-hydration
 * script in index.html sets), and persists changes. Mounted once at the app root.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>(readStoredPreference);
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(readSystemTheme);

  useEffect(() => {
    let mql: MediaQueryList;
    try {
      mql = window.matchMedia(MEDIA_QUERY);
    } catch {
      return;
    }

    const onChange = (event: MediaQueryListEvent) => {
      setSystemTheme(event.matches ? 'dark' : 'light');
    };

    mql.addEventListener('change', onChange);
    return () => {
      mql.removeEventListener('change', onChange);
    };
  }, []);

  const resolvedTheme = resolve(preference, systemTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', resolvedTheme);
    root.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* Storage unavailable — the choice still applies for this session. */
    }
  }, []);

  const value = useMemo(
    () => ({ preference, resolvedTheme, setPreference }),
    [preference, resolvedTheme, setPreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
