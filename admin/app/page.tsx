import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getAdminProfile } from '@/lib/auth';

export default async function AdminRootPage() {
  const supabase = await createClient();
  const profile = await getAdminProfile(supabase);

  if (profile) {
    redirect('/dashboard');
  }

  redirect('/login');
}
