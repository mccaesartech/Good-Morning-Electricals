import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import AdminShell from '@/components/AdminShell';
import { ProfileProvider } from '@/components/ProfileProvider';

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const profile = await requireAdmin(supabase);

  if (!profile) {
    redirect('/login?error=unauthorized');
  }

  return (
    <ProfileProvider profile={profile}>
      <AdminShell profile={profile}>{children}</AdminShell>
    </ProfileProvider>
  );
}
