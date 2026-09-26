import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/context/auth-context';
import { ChatPage as AiChatFeature } from '@/features/ai/chat/ChatPage';
import { FeatureLocked } from '@/features/auth/FeatureLocked';

export default function AiChatPage() {
  const { user } = useAuth();
  // AI is a verified-only surface (§7). While the account is unverified the feature — and the
  // history query it would fire — is replaced by the locked panel, so no refused request is made.
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
        <AiChatFeature />
      )}
    </AppShell>
  );
}
