import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import AdminShell from '@/components/AdminShell';

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const profile = await requireAdmin(supabase);

  if (!profile) {
    redirect('/login?error=unauthorized');
  }

  return <AdminShell email={profile.email}>{children}</AdminShell>;
}
