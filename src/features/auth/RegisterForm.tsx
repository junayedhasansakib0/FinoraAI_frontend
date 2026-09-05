import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { describeApiFailure } from '@/api/client';
import { TextField } from '@/components/ui/TextField';
import { useAuth } from '@/context/auth-context';

import { FIELD_LIMITS, PASSWORD_HINT, registerSchema } from './schemas';

import type { RegisterValues } from './schemas';

/** The API answers a taken email with CONFLICT, which belongs on the email field, not above it. */
const TAKEN_EMAIL_CODE = 'CONFLICT';

export function RegisterForm() {
  const { signUp } = useAuth();
  const [failure, setFailure] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const submit = handleSubmit(async (values) => {
    setFailure(null);

    try {
      await signUp(values);
    } catch (error) {
      const { code, message } = describeApiFailure(error);

      if (code === TAKEN_EMAIL_CODE) {
        setError('email', { message }, { shouldFocus: true });
        return;
      }

      setFailure(message);
    }
  });

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
        <TextField
          label="Password"
          type="password"
          autoComplete="new-password"
          maxLength={FIELD_LIMITS.password}
          required
          hint={PASSWORD_HINT}
          error={errors.password?.message}
          {...register('password')}
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
