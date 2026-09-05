import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { describeApiFailure } from '@/api/client';
import { TextField } from '@/components/ui/TextField';
import { useAuth } from '@/context/auth-context';

import { FIELD_LIMITS, loginSchema } from './schemas';

import type { LoginValues } from './schemas';

/**
 * A successful sign-in is not followed by a redirect here: the route guard owns where a
 * signed-in person belongs, and it moves them as soon as the context holds a user.
 */
export function LoginForm() {
  const { signIn } = useAuth();
  const [failure, setFailure] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const submit = handleSubmit(async (values) => {
    setFailure(null);

    try {
      await signIn(values);
    } catch (error) {
      setFailure(describeApiFailure(error).message);
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
          autoComplete="current-password"
          maxLength={FIELD_LIMITS.password}
          required
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
        {isSubmitting ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
