import { AppShell } from '@/components/layout/AppShell';
import { BudgetsPage as BudgetsFeature } from '@/features/budgets/BudgetsPage';

export default function BudgetsPage() {
  return (
    <AppShell>
      <BudgetsFeature />
    </AppShell>
  );
}
