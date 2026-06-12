import Logo from '@/components/Logo';
import ResetPasswordForm from '@/components/ResetPasswordForm';

export default function ResetPasswordPage() {
  return (
    <div className="login-page">
      <div className="login-card">
        <Logo width={72} height={72} className="login-logo" />
        <h1>Set New Password</h1>
        <p>Choose a new password for your admin account.</p>
        <ResetPasswordForm />
        <a href="/admin/login" className="back-link">← Back to Login</a>
      </div>
    </div>
  );
}
