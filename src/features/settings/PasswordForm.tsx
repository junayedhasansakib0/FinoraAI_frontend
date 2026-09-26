import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { changePassword } from '@/api/auth';
import { describeApiFailure } from '@/api/client';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { useAuth } from '@/context/auth-context';
import { PasswordStrengthMeter } from '@/features/auth/PasswordStrengthMeter';

import { FIELD_LIMITS, passwordSchema, PASSWORD_HINT } from './schemas';

import type { PasswordValues } from './schemas';

/**
 * Changes the account password. The API bumps `tokenVersion`, so every other device is signed out;
 * this session's cookies are re-issued in the same response and its user is refreshed via `applyUser`
 * so it stays signed in.
 */
export function PasswordForm() {
  const { applyUser } = useAuth();
  const [failure, setFailure] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const submit = handleSubmit(async ({ currentPassword, newPassword }) => {
    setFailure(null);
    setSaved(false);

    try {
      const updated = await changePassword({ currentPassword, newPassword });
      applyUser(updated);
      reset({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSaved(true);
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
          label="Current"
          type="password"
          autoComplete="current-password"
          maxLength={FIELD_LIMITS.password}
          required
          error={errors.currentPassword?.message}
          {...register('currentPassword')}
        />
        <div>
          <TextField
            label="New"
            type="password"
            autoComplete="new-password"
            hint={PASSWORD_HINT}
            maxLength={FIELD_LIMITS.password}
            required
            error={errors.newPassword?.message}
            {...register('newPassword')}
          />
          <PasswordStrengthMeter password={watch('newPassword')} />
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
      {saved && (
        <p role="status" className="border-l-2 border-income pl-4 text-sm leading-6 text-income">
          Password changed. Your other devices have been signed out.
        </p>
      )}

      <Button type="submit" variant="primary" size="lg" disabled={isSubmitting}>
        {isSubmitting ? 'Changing…' : 'Change password'}
      </Button>
    </form>
  );
}
