import { z } from 'zod';

/**
 * Mirrors `server/src/modules/auth/auth.validation.ts` (§7 shared validation rules). This copy
 * exists to answer without a round trip; the server's copy is the one that decides.
 */

const NAME_MAX = 60;
const EMAIL_MAX = 254;
const PASSWORD_MIN = 8;
/** bcrypt reads at most 72 bytes, so the API rejects anything longer. */
const PASSWORD_MAX = 72;

const email = z
  .string()
  .trim()
  .pipe(z.email('Enter a valid email address.').max(EMAIL_MAX, 'That email address is too long.'));

export const loginSchema = z.object({
  email,
  password: z
    .string()
    .min(1, 'Enter your password.')
    .max(PASSWORD_MAX, `Use ${String(PASSWORD_MAX)} characters or fewer.`),
});

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Enter your name.')
    .max(NAME_MAX, `Use ${String(NAME_MAX)} characters or fewer.`),
  email,
  password: z
    .string()
    .min(PASSWORD_MIN, `Use at least ${String(PASSWORD_MIN)} characters.`)
    .max(PASSWORD_MAX, `Use ${String(PASSWORD_MAX)} characters or fewer.`),
});

export const FIELD_LIMITS = {
  name: NAME_MAX,
  email: EMAIL_MAX,
  password: PASSWORD_MAX,
} as const;

export const PASSWORD_HINT = `At least ${String(PASSWORD_MIN)} characters.`;

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
