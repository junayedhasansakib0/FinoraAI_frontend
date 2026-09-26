import { z } from 'zod';

/**
 * Mirrors `server/src/modules/auth/auth.validation.ts` and `server/src/lib/password-policy.ts`
 * (§6/§8 shared validation rules). This copy answers without a round trip and drives the live
 * strength meter; the server's copy is the one that decides (R-V1). The two repositories never
 * import across the boundary (R-N7), so these rules are kept in step by hand.
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

/** One password rule: the checklist label shown live, and the test that satisfies it. */
export interface PasswordRule {
  readonly label: string;
  readonly test: (password: string) => boolean;
}

/**
 * The four character-class requirements plus the length floor (§6), mirrored from the server's
 * `PASSWORD_RULES`. Labels are phrased for the live checklist; order matches the server so the
 * two lists read the same.
 */
export const PASSWORD_RULES: readonly PasswordRule[] = [
  { label: `At least ${String(PASSWORD_MIN)} characters`, test: (p) => p.length >= PASSWORD_MIN },
  { label: 'A lowercase letter', test: (p) => /[a-z]/.test(p) },
  { label: 'An uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'A number', test: (p) => /\d/.test(p) },
  { label: 'A special character', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

/** The unmet rules, in order. Empty means the password satisfies the whole policy. */
export function unmetPasswordRules(password: string): PasswordRule[] {
  return PASSWORD_RULES.filter((rule) => !rule.test(password));
}

/** A coarse label for the meter, from how many rules a non-empty password meets. */
export type PasswordStrength = 'weak' | 'fair' | 'strong';

export function passwordStrength(password: string): PasswordStrength {
  const met = PASSWORD_RULES.length - unmetPasswordRules(password).length;

  if (met <= 2) {
    return 'weak';
  }

  return met < PASSWORD_RULES.length ? 'fair' : 'strong';
}

/**
 * Mirror of the server's `isPasswordDerivedFromEmail` (§8): rejects a password that is just the
 * email dressed up. Compares whole normalised tokens for equality, never substrings, so a strong
 * passphrase that merely contains a short fragment is not blocked.
 */
export function isPasswordDerivedFromEmail(emailValue: string, password: string): boolean {
  const lowerPassword = password.toLowerCase();
  const [localRaw = '', domainRaw = ''] = emailValue.toLowerCase().split('@');
  const domainBase = domainRaw.split('.')[0] ?? '';

  const tokens = new Set(
    [localRaw, localRaw.replace(/[._+-]/g, ''), domainBase, ...localRaw.split(/[._+-]/)].filter(
      (token) => token.length >= 3,
    ),
  );

  const lettersOnly = lowerPassword.replace(/[^a-z]/g, '');

  for (const token of tokens) {
    const tokenLetters = token.replace(/[^a-z]/g, '');
    if (
      lowerPassword === token ||
      lettersOnly === token ||
      (tokenLetters.length >= 3 && lettersOnly === tokenLetters)
    ) {
      return true;
    }
  }

  return false;
}

export const loginSchema = z.object({
  email,
  password: z
    .string()
    .min(1, 'Enter your password.')
    .max(PASSWORD_MAX, `Use ${String(PASSWORD_MAX)} characters or fewer.`),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Enter your name.')
      .max(NAME_MAX, `Use ${String(NAME_MAX)} characters or fewer.`),
    email,
    password: z
      .string()
      .max(PASSWORD_MAX, `Use ${String(PASSWORD_MAX)} characters or fewer.`)
      .superRefine((value, ctx) => {
        const unmet = unmetPasswordRules(value);
        if (unmet.length > 0) {
          ctx.addIssue({
            code: 'custom',
            message: `Add ${unmet.map((rule) => rule.label.toLowerCase()).join(', ')}.`,
          });
        }
      }),
    confirmPassword: z.string().min(1, 'Re-enter your password.'),
  })
  .superRefine((value, ctx) => {
    if (value.confirmPassword !== value.password) {
      ctx.addIssue({ code: 'custom', path: ['confirmPassword'], message: 'Passwords do not match.' });
    }

    // The password must not simply be the email dressed up (§8). Attached to the password field so
    // the message lands where the person can fix it; the server enforces the same rule.
    if (isPasswordDerivedFromEmail(value.email, value.password)) {
      ctx.addIssue({
        code: 'custom',
        path: ['password'],
        message: "Choose a password that isn't based on your email.",
      });
    }
  });

export const FIELD_LIMITS = {
  name: NAME_MAX,
  email: EMAIL_MAX,
  password: PASSWORD_MAX,
} as const;

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
