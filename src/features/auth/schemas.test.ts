import { describe, expect, it } from 'vitest';

import { FIELD_LIMITS, loginSchema, registerSchema } from './schemas';

/**
 * The client copy of the auth validation (R-T5). It mirrors the server's rules to answer without a
 * round trip; the server still decides. These assert the mirror stays faithful: email shape,
 * password bounds, name presence, and the trimming the fields promise.
 */

describe('loginSchema', () => {
  it('accepts a valid credential pair', () => {
    const result = loginSchema.safeParse({ email: 'a@b.co', password: 'secret12' });

    expect(result.success).toBe(true);
  });

  it('rejects a malformed email', () => {
    const result = loginSchema.safeParse({ email: 'not-an-email', password: 'secret12' });

    expect(result.success).toBe(false);
  });

  it('requires a non-empty password but does not impose the 8-char minimum on sign-in', () => {
    expect(loginSchema.safeParse({ email: 'a@b.co', password: '' }).success).toBe(false);
    expect(loginSchema.safeParse({ email: 'a@b.co', password: 'short' }).success).toBe(true);
  });
});

describe('registerSchema', () => {
  it('accepts a valid registration and trims the name', () => {
    const result = registerSchema.safeParse({
      name: '  Ada  ',
      email: 'ada@example.com',
      password: 'longenough',
    });

    expect(result.success).toBe(true);
    expect(result.data?.name).toBe('Ada');
  });

  it('enforces the 8-character password minimum', () => {
    const result = registerSchema.safeParse({
      name: 'Ada',
      email: 'ada@example.com',
      password: 'short',
    });

    expect(result.success).toBe(false);
  });

  it('rejects a password beyond the bcrypt 72-byte ceiling', () => {
    const result = registerSchema.safeParse({
      name: 'Ada',
      email: 'ada@example.com',
      password: 'x'.repeat(FIELD_LIMITS.password + 1),
    });

    expect(result.success).toBe(false);
  });

  it('rejects a blank name', () => {
    const result = registerSchema.safeParse({
      name: '   ',
      email: 'ada@example.com',
      password: 'longenough',
    });

    expect(result.success).toBe(false);
  });
});
