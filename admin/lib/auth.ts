import type { SupabaseClient } from '@supabase/supabase-js';

export type AdminProfile = {
  id: string;
  email: string;
  full_name: string | null;
  role: 'superadmin' | 'editor';
  active: boolean;
};

export async function getAdminProfile(supabase: SupabaseClient): Promise<AdminProfile | null> {
  const { data, error } = await supabase.rpc('get_admin_profile');
  if (error || !data) return null;
  return data as AdminProfile;
}

export async function requireAdmin(supabase: SupabaseClient): Promise<AdminProfile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  return getAdminProfile(supabase);
}
