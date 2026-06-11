'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');
  const redirectTo = searchParams.get('redirect') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(
    errorParam === 'unauthorized'
      ? 'Your account is not authorized to access the admin dashboard.'
      : ''
  );
  const [resetMsg, setResetMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResetMsg('');

    const supabase = createClient();

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase.rpc('get_admin_profile');

    if (profileError || !profile) {
      await supabase.auth.signOut();
      setError('Your account is not authorized to access the admin dashboard.');
      setLoading(false);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  async function handleReset() {
    if (!email) {
      setError('Enter your email address first, then click Forgot password.');
      return;
    }
    setError('');
    setResetMsg('');
    const supabase = createClient();
    const redirectUrl = `${window.location.origin}/admin/auth/callback?next=/login`;
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl
    });
    if (resetError) {
      setError(resetError.message);
    } else {
      setResetMsg('Password reset email sent. Check your inbox.');
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="alert alert-error">{error}</div>}
      {resetMsg && <div className="alert alert-success">{resetMsg}</div>}

      <div className="form-field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          placeholder="admin@example.com"
        />
      </div>

      <div className="form-field">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          placeholder="Enter your password"
        />
      </div>

      <button type="submit" className="btn btn-gold" disabled={loading}>
        {loading ? 'Signing in…' : 'Sign In'}
      </button>

      <button type="button" className="reset-link" onClick={handleReset}>
        Forgot password?
      </button>
    </form>
  );
}
