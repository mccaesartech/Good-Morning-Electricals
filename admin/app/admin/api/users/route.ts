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

export async function GET() {
  const auth = await requireSuperAdmin();
  if (!auth) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  let service;
  try {
    service = createServiceClient();
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
  const { data, error } = await service
    .from('admin_users')
    .select('id, email, full_name, role, active, last_login_at, custom_permissions, created_at')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ users: data });
}

export async function POST(request: Request) {
  const auth = await requireSuperAdmin();
  if (!auth) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  const { email, password, full_name, role, custom_permissions } = body as {
    email: string;
    password: string;
    full_name?: string;
    role: AdminRole;
    custom_permissions?: string[] | null;
  };

  if (!email || !password || !role) {
    return NextResponse.json({ error: 'Email, password, and role are required.' }, { status: 400 });
  }

  let service;
  try {
    service = createServiceClient();
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }

  const { data: authUser, error: createError } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });

  if (createError || !authUser.user) {
    return NextResponse.json({ error: createError?.message ?? 'Failed to create user' }, { status: 500 });
  }

  const { error: insertError } = await service.from('admin_users').insert({
    id: authUser.user.id,
    email,
    full_name: full_name ?? null,
    role,
    active: true,
    custom_permissions: custom_permissions?.length ? custom_permissions : null,
    created_by: auth.user.id
  });

  if (insertError) {
    await service.auth.admin.deleteUser(authUser.user.id);
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  await service.from('activity_log').insert({
    user_id: auth.user.id,
    user_email: auth.profile.email,
    action: 'created',
    entity: 'admin_users',
    entity_id: authUser.user.id,
    summary: `Created admin user: ${email} (${role})`
  });

  return NextResponse.json({ id: authUser.user.id });
}
