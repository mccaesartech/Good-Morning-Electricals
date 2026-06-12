'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { adminPath } from '@/lib/constants';

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.rpc('write_activity_log', {
      p_action: 'logout',
      p_entity: 'admin_users',
      p_entity_id: null,
      p_summary: 'Admin logged out',
      p_metadata: {}
    });
    await supabase.auth.signOut();
    router.push(adminPath('/login'));
    router.refresh();
  }

  return (
    <button type="button" className="btn btn-danger btn-sm" onClick={handleLogout} style={{ width: '100%' }}>
      Logout
    </button>
  );
}
