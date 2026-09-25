import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/auth-context';
import { PasswordForm } from '@/features/settings/PasswordForm';
import { ProfileForm } from '@/features/settings/ProfileForm';

import type { ReactNode } from 'react';

/** One settings section: a titled column on the right of its explanation on wide screens. */
function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="grid gap-6 border-t border-line pt-10 md:grid-cols-[18rem_1fr] md:gap-10">
      <div>
        <h2 className="font-serif text-2xl">{title}</h2>
        <p className="mt-2 max-w-[40ch] text-sm leading-6 text-muted">{description}</p>
      </div>
      <div className="max-w-md">{children}</div>
    </section>
  );
}

export default function SettingsPage() {
  const { user, signOut } = useAuth();

  return (
    <AppShell>
      <div className="space-y-12">
        <header>
          <h1 className="font-serif text-3xl sm:text-4xl">Settings</h1>
          <p className="mt-3 max-w-[54ch] leading-7 text-ink-soft">
            Your account details and how the app displays your money.
          </p>
        </header>

        {user === null ? null : (
          <>
            <SettingsSection
              title="Profile"
              description="Your name, the currency every amount is shown in, and the timezone your months are counted in."
            >
              <ProfileForm user={user} />
            </SettingsSection>

            <SettingsSection
              title="Password"
              description="Change your password. This signs you out everywhere else, but keeps this device signed in."
            >
              <PasswordForm />
            </SettingsSection>

            <SettingsSection
              title="Session"
              description="Sign out of this device. Your data stays exactly as you left it."
            >
              <Button
                variant="secondary"
                size="lg"
                onClick={() => {
                  void signOut();
                }}
              >
                Sign out
              </Button>
            </SettingsSection>
          </>
        )}
      </div>
    </AppShell>
  );
}
