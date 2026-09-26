import { z } from 'zod';

import { unmetPasswordRules } from '@/features/auth/schemas';

/**
 * Mirrors the profile and password rules in `server/src/modules/auth/auth.validation.ts` (§7). This
 * copy answers the form without a round trip; the server's copy is the one that decides (R-N7). The
 * new-password strength rules are shared with the register form via `@/features/auth/schemas` so a
 * change here and a sign-up there never drift apart.
 */

const NAME_MAX = 60;
/** bcrypt reads at most 72 bytes, so the API rejects anything longer. */
const PASSWORD_MAX = 72;

export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Enter your name.')
    .max(NAME_MAX, `Use ${String(NAME_MAX)} characters or fewer.`),
  currency: z
    .string()
    .trim()
    .toUpperCase()
    .pipe(z.string().regex(/^[A-Z]{3}$/, 'Choose a valid three-letter currency code.')),
  timezone: z.string().trim().min(1, 'Choose a timezone.'),
});

export const passwordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, 'Enter your current password.')
      .max(PASSWORD_MAX, `Use ${String(PASSWORD_MAX)} characters or fewer.`),
    newPassword: z
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
    confirmPassword: z.string().min(1, 'Re-enter the new password.'),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: 'The two passwords do not match.',
    path: ['confirmPassword'],
  })
  .refine((values) => values.newPassword !== values.currentPassword, {
    message: 'Choose a password different from the current one.',
    path: ['newPassword'],
  });

export const FIELD_LIMITS = {
  name: NAME_MAX,
  password: PASSWORD_MAX,
} as const;

/** The static note under the new-password field; the live strength meter covers the rules. */
export const PASSWORD_HINT = 'Changing it signs out your other devices.';

export type ProfileValues = z.infer<typeof profileSchema>;
export type PasswordValues = z.infer<typeof passwordSchema>;

