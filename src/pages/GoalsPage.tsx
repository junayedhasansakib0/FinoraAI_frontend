import { AppShell } from '@/components/layout/AppShell';
import { GoalsPage as GoalsFeature } from '@/features/goals/GoalsPage';

export default function GoalsPage() {
  return (
    <AppShell>
      <GoalsFeature />
    </AppShell>
  );
}
