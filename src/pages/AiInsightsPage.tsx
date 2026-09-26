import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/context/auth-context';
import { AiInsightsPage as AiInsightsFeature } from '@/features/ai/AiInsightsPage';
import { FeatureLocked } from '@/features/auth/FeatureLocked';

export default function AiInsightsPage() {
  const { user } = useAuth();
  // AI is a verified-only surface (§7). While the account is unverified the feature — and every
  // query it would fire — is replaced by the locked panel, so no refused request is ever made.
  const locked = user !== null && !user.emailVerified;

  return (
    <AppShell>
      {locked && user !== null ? (
        <FeatureLocked
          title="AI features are locked"
          message="Verify your email to start using Finora AI."
          email={user.email}
        />
      ) : (
        <AiInsightsFeature />
      )}
    </AppShell>
  );
}
