import { Select } from '@/components/ui/Select';
import { useTheme } from '@/context/theme-context';

import type { ThemePreference } from '@/context/theme-context';

const OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'Match system' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

/**
 * The full theme choice, including "Match system". The quick light/dark switch in the app frame
 * (see `ThemeToggle`) sets an explicit preference; this is where a person returns to following the
 * device setting. The value is stored per device, not on the account.
 */
export function AppearanceForm() {
  const { preference, setPreference } = useTheme();

  return (
    <Select
      label="Theme"
      hint="“Match system” follows your device’s light or dark setting. Saved on this device."
      value={preference}
      onChange={(event) => {
        setPreference(event.target.value as ThemePreference);
      }}
    >
      {OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </Select>
  );
}
