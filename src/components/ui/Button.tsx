import type { ComponentPropsWithRef } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'quiet' | 'danger' | 'text';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<ComponentPropsWithRef<'button'>, 'className'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** For the one button that ends a form, which spans the column it sits in. */
  fullWidth?: boolean;
}

/**
 * Square corners, one weight of rule, colour only where it means something: the same buttons the
 * auth pages already hand-rolled, in one place now that four screens need them.
 */
const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: 'border border-ink bg-ink font-medium text-paper hover:bg-ink-soft',
  secondary: 'border border-ink font-medium hover:bg-ink hover:text-paper',
  quiet: 'border border-line hover:border-ink',
  danger: 'border border-expense bg-expense font-medium text-paper hover:bg-expense/90',
  text: 'text-muted underline decoration-line underline-offset-4 hover:text-ink',
};

/** `text` pays no border, so it keeps only the vertical rhythm and none of the side padding. */
const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5',
  md: 'px-4 py-2',
  lg: 'px-4 py-3',
};

const BASE_CLASS =
  'inline-flex items-center justify-center gap-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40';

export function Button({
  variant = 'secondary',
  size = 'md',
  fullWidth = false,
  type = 'button',
  ...buttonProps
}: ButtonProps) {
  const padding = variant === 'text' ? 'py-1' : SIZE_CLASS[size];
  const className = [BASE_CLASS, VARIANT_CLASS[variant], padding, fullWidth ? 'w-full' : null]
    .filter((part) => part !== null)
    .join(' ');

  return <button type={type} className={className} {...buttonProps} />;
}
