import type { SupabaseClient } from '@supabase/supabase-js';
import type { AdminRole, Permission } from '@/lib/permissions';

export type AdminProfile = {
  id: string;
  email: string;
  full_name: string | null;
  role: AdminRole;
  active: boolean;
  last_login_at: string | null;
  custom_permissions: Permission[] | null;
  permissions: Permission[];
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
