import { AppShell } from '@/components/layout/AppShell';
import { CurrencyPage as CurrencyFeature } from '@/features/currency/CurrencyPage';

export default function CurrencyPage() {
  return (
    <AppShell>
      <CurrencyFeature />
    </AppShell>
  );
}
