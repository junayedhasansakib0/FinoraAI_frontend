import { describe, expect, it } from 'vitest';

import {
  FIELD_LIMITS,
  isPasswordDerivedFromEmail,
  loginSchema,
  passwordStrength,
  registerSchema,
  unmetPasswordRules,
} from './schemas';

/**
 * The client copy of the auth validation (R-T5). It mirrors the server's rules to answer without a
 * round trip; the server still decides. These assert the mirror stays faithful: email shape, the
 * password complexity policy, the confirmation match, the email-derivation guard, and the trimming
 * the fields promise.
 */

/** Meets every complexity rule and is not derived from the emails used below. */
const STRONG_PASSWORD = 'Str0ng!Pass';

describe('loginSchema', () => {
  it('accepts a valid credential pair', () => {
    const result = loginSchema.safeParse({ email: 'a@b.co', password: 'secret12' });

    expect(result.success).toBe(true);
  });

  it('rejects a malformed email', () => {
    const result = loginSchema.safeParse({ email: 'not-an-email', password: 'secret12' });

    expect(result.success).toBe(false);
  });

  it('requires a non-empty password but does not impose the complexity policy on sign-in', () => {
    expect(loginSchema.safeParse({ email: 'a@b.co', password: '' }).success).toBe(false);
    expect(loginSchema.safeParse({ email: 'a@b.co', password: 'short' }).success).toBe(true);
  });
});

describe('registerSchema', () => {
  it('accepts a strong registration and trims the name', () => {
    const result = registerSchema.safeParse({
      name: '  Ada  ',
      email: 'ada@example.com',
      password: STRONG_PASSWORD,
      confirmPassword: STRONG_PASSWORD,
    });

    expect(result.success).toBe(true);
    expect(result.data?.name).toBe('Ada');
  });

  it('rejects a password that misses a character class', () => {
    const result = registerSchema.safeParse({
      name: 'Ada',
      email: 'ada@example.com',
      password: 'longenough',
      confirmPassword: 'longenough',
    });

    expect(result.success).toBe(false);
  });

  it('enforces the 8-character minimum even when every class is present', () => {
    const result = registerSchema.safeParse({
      name: 'Ada',
      email: 'ada@example.com',
      password: 'Ab1!x',
      confirmPassword: 'Ab1!x',
    });

    expect(result.success).toBe(false);
  });

  it('rejects a password beyond the bcrypt 72-byte ceiling', () => {
    const tooLong = 'Aa1!'.repeat(Math.ceil((FIELD_LIMITS.password + 1) / 4));
    const result = registerSchema.safeParse({
      name: 'Ada',
      email: 'ada@example.com',
      password: tooLong,
      confirmPassword: tooLong,
    });

    expect(result.success).toBe(false);
  });

  it('rejects a mismatched confirmation', () => {
    const result = registerSchema.safeParse({
      name: 'Ada',
      email: 'ada@example.com',
      password: STRONG_PASSWORD,
      confirmPassword: `${STRONG_PASSWORD}x`,
    });

    expect(result.success).toBe(false);
  });

  it('rejects a password based on the email address', () => {
    const result = registerSchema.safeParse({
      name: 'Jonathan',
      email: 'jonathan@example.com',
      password: 'Jonathan123!',
      confirmPassword: 'Jonathan123!',
    });

    expect(result.success).toBe(false);
  });

  it('rejects a blank name', () => {
    const result = registerSchema.safeParse({
      name: '   ',
      email: 'ada@example.com',
      password: STRONG_PASSWORD,
      confirmPassword: STRONG_PASSWORD,
    });

    expect(result.success).toBe(false);
  });
});

describe('password policy helpers', () => {
  it('reports which rules a password has not met', () => {
    expect(unmetPasswordRules(STRONG_PASSWORD)).toHaveLength(0);
    expect(unmetPasswordRules('lowercase').map((rule) => rule.label)).toEqual([
      'An uppercase letter',
      'A number',
      'A special character',
    ]);
  });

  it('grades strength from how many rules are met', () => {
    expect(passwordStrength('lower')).toBe('weak');
    expect(passwordStrength('Lower1')).toBe('fair');
    expect(passwordStrength(STRONG_PASSWORD)).toBe('strong');
  });

  it('matches whole tokens, not incidental substrings, for email derivation', () => {
    expect(isPasswordDerivedFromEmail('jonathan@example.com', 'Jonathan123!')).toBe(true);
    expect(isPasswordDerivedFromEmail('ada@example.com', STRONG_PASSWORD)).toBe(false);
  });
});
