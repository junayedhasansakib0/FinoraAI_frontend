/**
 * Chart colours as literal hex. A `var()` cannot be resolved in an SVG presentation attribute, and
 * Recharts needs a concrete colour to paint both a slice and its legend swatch, so these repeat the
 * `@theme` values in `index.css` and the two must be changed together.
 */

/** The three semantic series (R-S3): income, expense, and the neutral petrol used for a balance. */
export const SERIES_COLORS = {
  income: '#0e7a5f',
  expense: '#a8322a',
  balance: '#0c2a31',
} as const;

/** Axis lines and the grid — the same hairline as every border in the interface. */
export const CHART_LINE = '#c4d2d5';

/** Axis tick labels, at the same muted weight as the small print around them. */
export const CHART_TEXT = '#4f7078';

/** The page background (`--color-paper`), used to draw the gap between adjacent pie slices. */
export const CHART_PAPER = '#f5f6f7';

/**
 * Category slices, in the order they are handed out. A category is an identity rather than a
 * direction, so these deliberately avoid the income, expense and warning colours: borrowing one
 * would make "Rent" read as a warning. Dark and light alternate so two adjacent slices never look
 * like one, and the palest is reserved for the rolled-up remainder.
 */
export const CATEGORY_COLORS = [
  '#0c2a31',
  '#c9a227',
  '#1f7a8c',
  '#8a6d1e',
  '#5b6e73',
  '#3f9aa8',
  '#155e63',
  '#93a7ab',
] as const;

/** "Other" and spending whose category is gone: present, named, and not competing for attention. */
export const REMAINDER_COLOR = '#c4d2d5';
