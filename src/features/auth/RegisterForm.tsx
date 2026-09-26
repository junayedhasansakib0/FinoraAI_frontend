import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';

import { registerAccount } from '@/api/auth';
import { describeApiFailure, describeFieldErrors } from '@/api/client';
import { TextField } from '@/components/ui/TextField';
import { useAuth } from '@/context/auth-context';
import { ROUTES } from '@/lib/constants';

import { CheckEmailNotice } from './CheckEmailNotice';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';
import { FIELD_LIMITS, registerSchema } from './schemas';

import type { RegisterValues } from './schemas';
import type { AuthUser } from '@/types/api';

/** The API answers a taken email with CONFLICT, which belongs on the email field, not above it. */
const TAKEN_EMAIL_CODE = 'CONFLICT';
/** The two fields the server attaches validation details to (disposable email, weak/derived password). */
const FIELD_NAMES = new Set<keyof RegisterValues>(['name', 'email', 'password', 'confirmPassword']);

/**
 * Registration is now a two-step flow (§5). Creating the account does not sign the person in
 * straight away: it shows the "check your email" panel first, then activates the session (via
 * `applyUser`) only when they choose to continue. Verification itself is a soft gate — the account
 * works unverified — so nothing here blocks on it.
 */
export function RegisterForm() {
  const { applyUser } = useAuth();
  const navigate = useNavigate();
  const [failure, setFailure] = useState<string | null>(null);
  const [registered, setRegistered] = useState<AuthUser | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  const submit = handleSubmit(async ({ name, email, password }) => {
    setFailure(null);

    try {
      const user = await registerAccount({ name, email, password });
      setRegistered(user);
    } catch (error) {
      const fieldErrors = describeFieldErrors(error);
      if (fieldErrors.length > 0) {
        for (const { field, message } of fieldErrors) {
          if (FIELD_NAMES.has(field as keyof RegisterValues)) {
            setError(field as keyof RegisterValues, { message });
          }
        }
        return;
      }

      const { code, message } = describeApiFailure(error);
      if (code === TAKEN_EMAIL_CODE) {
        setError('email', { message }, { shouldFocus: true });
        return;
      }

      setFailure(message);
    }
  });

  if (registered !== null) {
    return (
      <CheckEmailNotice
        email={registered.email}
        onContinue={() => {
          applyUser(registered);
          void navigate(ROUTES.dashboard, { replace: true });
        }}
      />
    );
  }

  const password = watch('password');

  return (
    <form
      noValidate
      className="space-y-8"
      onSubmit={(event) => {
        void submit(event);
      }}
    >
      <div className="space-y-5">
        <TextField
          label="Name"
          type="text"
          autoComplete="name"
          maxLength={FIELD_LIMITS.name}
          required
          error={errors.name?.message}
          {...register('name')}
        />
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          autoCapitalize="off"
          spellCheck={false}
          maxLength={FIELD_LIMITS.email}
          required
          error={errors.email?.message}
          {...register('email')}
        />
        <div>
          <TextField
            label="Password"
            type="password"
            autoComplete="new-password"
            maxLength={FIELD_LIMITS.password}
            required
            error={errors.password?.message}
            {...register('password')}
          />
          <PasswordStrengthMeter password={password} />
        </div>
        <TextField
          label="Confirm"
          type="password"
          autoComplete="new-password"
          maxLength={FIELD_LIMITS.password}
          required
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
      </div>

      {failure !== null && (
        <p role="alert" className="border-l-2 border-expense pl-4 text-sm leading-6 text-expense">
          {failure}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full border border-ink bg-ink px-4 py-3 text-sm font-medium text-paper transition-colors hover:bg-ink-soft disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isSubmitting ? 'Creating account…' : 'Create account'}
      </button>
    </form>
  );
}
