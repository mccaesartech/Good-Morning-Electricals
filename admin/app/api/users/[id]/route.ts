import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import type { AdminRole } from '@/lib/permissions';

async function requireSuperAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.rpc('get_admin_profile');
  if (!profile || profile.role !== 'superadmin') return null;
  return { supabase, user, profile };
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireSuperAdmin();
  if (!auth) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  const { full_name, role, active, custom_permissions } = body as {
    full_name?: string;
    role?: AdminRole;
    active?: boolean;
    custom_permissions?: string[] | null;
  };

  if (params.id === auth.user.id && active === false) {
    return NextResponse.json({ error: 'You cannot deactivate your own account.' }, { status: 400 });
  }

  const service = createServiceClient();
  const payload: Record<string, unknown> = { updated_by: auth.user.id };
  if (full_name !== undefined) payload.full_name = full_name;
  if (role !== undefined) payload.role = role;
  if (active !== undefined) payload.active = active;
  if (custom_permissions !== undefined) {
    payload.custom_permissions = custom_permissions?.length ? custom_permissions : null;
  }

  const { error } = await service.from('admin_users').update(payload).eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const action = active === false ? 'deactivated' : active === true ? 'activated' : 'updated';
  await service.from('activity_log').insert({
    user_id: auth.user.id,
    user_email: auth.profile.email,
    action,
    entity: 'admin_users',
    entity_id: params.id,
    summary: `Updated admin user (${action})`
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireSuperAdmin();
  if (!auth) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  if (params.id === auth.user.id) {
    return NextResponse.json({ error: 'You cannot delete your own account.' }, { status: 400 });
  }

  const service = createServiceClient();
  const { error: dbError } = await service.from('admin_users').delete().eq('id', params.id);
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });

  await service.auth.admin.deleteUser(params.id);

  await service.from('activity_log').insert({
    user_id: auth.user.id,
    user_email: auth.profile.email,
    action: 'deleted',
    entity: 'admin_users',
    entity_id: params.id,
    summary: 'Deleted admin user'
  });

  return NextResponse.json({ ok: true });
}
