import { AppShell } from '@/components/layout/AppShell';
import { AiInsightsPage as AiInsightsFeature } from '@/features/ai/AiInsightsPage';

export default function AiInsightsPage() {
  return (
    <AppShell>
      <AiInsightsFeature />
    </AppShell>
  );
}
