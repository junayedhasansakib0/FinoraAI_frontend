import { AppShell } from '@/components/layout/AppShell';
import { ChatPage as AiChatFeature } from '@/features/ai/chat/ChatPage';

export default function AiChatPage() {
  return (
    <AppShell>
      <AiChatFeature />
    </AppShell>
  );
}
