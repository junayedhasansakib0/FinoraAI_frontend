import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { updateProfile } from '@/api/auth';
import { describeApiFailure } from '@/api/client';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { TextField } from '@/components/ui/TextField';
import { useAuth } from '@/context/auth-context';

import { currencyLabel, CURRENCY_OPTIONS, TIMEZONE_OPTIONS } from './options';
import { FIELD_LIMITS, profileSchema } from './schemas';

import type { AuthUser } from '@/types/api';
import type { ProfileValues } from './schemas';

/** Puts the account's own value at the head of the list if the platform's data does not carry it. */
function withCurrent(options: readonly string[], current: string): readonly string[] {
  return options.includes(current) ? options : [current, ...options];
}

/**
 * The account's name, display currency, and timezone. Currency drives every money figure in the app
 * and timezone decides where each month begins (D9), so a change here re-formats the whole UI at
 * once through `applyUser`.
 */
export function ProfileForm({ user }: { user: AuthUser }) {
  const { applyUser } = useAuth();
  const [failure, setFailure] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user.name, currency: user.currency, timezone: user.timezone },
  });

  const submit = handleSubmit(async (values) => {
    setFailure(null);
    setSaved(false);

    try {
      const updated = await updateProfile(values);
      applyUser(updated);
      reset({ name: updated.name, currency: updated.currency, timezone: updated.timezone });
      setSaved(true);
    } catch (error) {
      setFailure(describeApiFailure(error).message);
    }
  });

  const currencies = withCurrent(CURRENCY_OPTIONS, user.currency);
  const timezones = withCurrent(TIMEZONE_OPTIONS, user.timezone);

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
          autoComplete="name"
          maxLength={FIELD_LIMITS.name}
          required
          error={errors.name?.message}
          {...register('name')}
        />
        <Select
          label="Currency"
          hint="Used to display every amount; it does not convert your existing figures."
          error={errors.currency?.message}
          {...register('currency')}
        >
          {currencies.map((code) => (
            <option key={code} value={code}>
              {currencyLabel(code)}
            </option>
          ))}
        </Select>
        <Select
          label="Timezone"
          hint="Decides where each month starts for your dashboard and budgets."
          error={errors.timezone?.message}
          {...register('timezone')}
        >
          {timezones.map((zone) => (
            <option key={zone} value={zone}>
              {zone}
            </option>
          ))}
        </Select>
      </div>

      {failure !== null && (
        <p role="alert" className="border-l-2 border-expense pl-4 text-sm leading-6 text-expense">
          {failure}
        </p>
      )}
      {saved && (
        <p role="status" className="border-l-2 border-income pl-4 text-sm leading-6 text-income">
          Profile saved.
        </p>
      )}

      <Button type="submit" variant="primary" size="lg" disabled={isSubmitting}>
        {isSubmitting ? 'Saving…' : 'Save profile'}
      </Button>
    </form>
  );
}
