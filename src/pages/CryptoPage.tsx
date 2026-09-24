import { AppShell } from '@/components/layout/AppShell';
import { CryptoPage as CryptoFeature } from '@/features/crypto/CryptoPage';

export default function CryptoPage() {
  return (
    <AppShell>
      <CryptoFeature />
    </AppShell>
  );
}
