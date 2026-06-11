import type { AdminProfile } from '@/lib/auth';
import { ROLE_LABELS } from '@/lib/permissions';
import Logo from '@/components/Logo';

export default function WelcomeBanner({ profile }: { profile: AdminProfile }) {
  const name = profile.full_name || profile.email.split('@')[0];
  const roleLabel = ROLE_LABELS[profile.role] ?? profile.role;
  const lastLogin = profile.last_login_at
    ? new Date(profile.last_login_at).toLocaleString()
    : 'First login';

  return (
    <div className="welcome-banner">
      <div className="welcome-banner__logo">
        <Logo width={48} height={48} style={{ borderRadius: 10 }} alt="" />
      </div>
      <div className="welcome-banner__text">
        <h2>Welcome back, {name}</h2>
        <p>
          <span className="welcome-banner__role">{roleLabel}</span>
          <span className="welcome-banner__sep">·</span>
          Last login: {lastLogin}
        </p>
      </div>
    </div>
  );
}
