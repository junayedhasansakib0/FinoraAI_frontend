import { Link } from 'react-router';

import { AuthShell } from '@/features/auth/AuthShell';
import { LoginForm } from '@/features/auth/LoginForm';
import { ROUTES } from '@/lib/constants';

export default function LoginPage() {
  return (
    <AuthShell
      title="Sign in"
      intro="Your balances, budgets, and goals are where you left them."
      footer={
        <>
          New to Finora?{' '}
          <Link
            to={ROUTES.register}
            className="text-ink underline underline-offset-4 transition-colors hover:text-ink-soft"
          >
            Create an account
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
