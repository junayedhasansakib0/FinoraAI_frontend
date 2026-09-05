import { Link } from 'react-router';

import { AuthShell } from '@/features/auth/AuthShell';
import { RegisterForm } from '@/features/auth/RegisterForm';
import { ROUTES } from '@/lib/constants';

export default function RegisterPage() {
  return (
    <AuthShell
      title="Create your account"
      intro="You start with fifteen spending and income categories, ready to edit."
      footer={
        <>
          Already have an account?{' '}
          <Link
            to={ROUTES.login}
            className="text-ink underline underline-offset-4 transition-colors hover:text-ink-soft"
          >
            Sign in
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
