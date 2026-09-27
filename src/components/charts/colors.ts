import { useTheme } from '@/context/theme-context';

import type { ResolvedTheme } from '@/context/theme-context';

/**
 * Chart colours as literal hex. A `var()` cannot be resolved in an SVG presentation attribute, and
 * Recharts needs a concrete colour to paint both a slice and its legend swatch — so the palette
 * cannot ride on the CSS variables the rest of the interface uses for theming. Instead each theme
 * gets its own literal set here, and `useChartColors()` returns the one in effect. The two sets
 * mirror the light `@theme` block and the `:root[data-theme='dark']` block in `index.css`, and the
 * two files must be changed together.
 */
export interface ChartColors {
  /** The three semantic series (R-S3): income, expense, and the neutral used for a balance. */
  series: { income: string; expense: string; balance: string };
  /** Axis lines and the grid — the same hairline as every border in the interface. */
  line: string;
  /** Axis tick labels, at the same muted weight as the small print around them. */
  text: string;
  /** The page background, used to draw the gap between adjacent pie slices. */
  paper: string;
  /**
   * Category slices, in the order they are handed out. A category is an identity rather than a
   * direction, so these avoid the income/expense/warning colours: borrowing one would make "Rent"
   * read as a warning. Adjacent hues alternate so two slices never look like one.
   */
  categories: readonly string[];
  /** "Other" and spending whose category is gone: present, named, not competing for attention. */
  remainder: string;
}

const LIGHT: ChartColors = {
  series: { income: '#0e7a5f', expense: '#a8322a', balance: '#0c2a31' },
  line: '#c4d2d5',
  text: '#4f7078',
  paper: '#f5f6f7',
  categories: ['#0c2a31', '#c9a227', '#1f7a8c', '#8a6d1e', '#5b6e73', '#3f9aa8', '#155e63', '#93a7ab'],
  remainder: '#c4d2d5',
};

const DARK: ChartColors = {
  // Balance turns to a light petrol so the line and its fill stay visible on the dark ground; the
  // income/expense pair is the brightened dark-theme pair from index.css.
  series: { income: '#3bbd91', expense: '#e46b62', balance: '#cbd7d7' },
  line: '#2c4a52',
  text: '#93a7ab',
  paper: '#0c1f24',
  // The near-black first slice would vanish on dark, so it becomes the same light petrol; brass and
  // the teals already read well against the dark ground and carry over.
  categories: ['#cbd7d7', '#d9b13f', '#4fb6cc', '#c39a3e', '#8fa3a8', '#5fc0cf', '#3f9aa8', '#a9bbbe'],
  remainder: '#5b7a82',
};

const PALETTES: Record<ResolvedTheme, ChartColors> = { light: LIGHT, dark: DARK };

/** The chart palette for the theme currently in effect. Call inside a chart component. */
export function useChartColors(): ChartColors {
  return PALETTES[useTheme().resolvedTheme];
}
