import { Suspense } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import LoginForm from '@/components/LoginForm';

export default function LoginPage() {
  return (
    <div className="login-page">
      <div className="login-card">
        <Logo width={72} height={72} className="login-logo" />
        <h1>Admin Dashboard</h1>
        <p>Good Morning Electrical Engineering Academy</p>
        <Suspense fallback={<p>Loading…</p>}>
          <LoginForm />
        </Suspense>
        <Link href="/" className="back-link">
          ← Back to Website
        </Link>
      </div>
    </div>
  );
}
