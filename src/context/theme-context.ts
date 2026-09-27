import { createContext, useContext } from 'react';

/** What the user chose. `system` follows the OS setting and updates live when it changes. */
export type ThemePreference = 'light' | 'dark' | 'system';

/** The concrete theme actually in effect once `system` has been resolved. */
export type ResolvedTheme = 'light' | 'dark';

/** The one place the localStorage key is named; mirrored by the inline script in index.html. */
export const THEME_STORAGE_KEY = 'finora-theme';

export interface ThemeContextValue {
  /** The stored choice, including `system`. */
  preference: ThemePreference;
  /** The theme in effect right now (`system` already resolved against the OS). */
  resolvedTheme: ResolvedTheme;
  setPreference: (preference: ThemePreference) => void;
}

/**
 * A usable default rather than `null`: with no provider (e.g. an isolated component test), the app
 * renders as light and the setter is a no-op, so nothing throws. The real value comes from
 * `ThemeProvider`, mounted at the app root.
 */
const DEFAULT_VALUE: ThemeContextValue = {
  preference: 'system',
  resolvedTheme: 'light',
  setPreference: () => undefined,
};

export const ThemeContext = createContext<ThemeContextValue>(DEFAULT_VALUE);

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
