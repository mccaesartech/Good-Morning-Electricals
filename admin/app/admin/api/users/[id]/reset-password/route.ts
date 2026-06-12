import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

async function requireSuperAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.rpc('get_admin_profile');
  if (!profile || profile.role !== 'superadmin') return null;
  return { user, profile };
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = await requireSuperAdmin();
  if (!auth) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const password = (body as { password?: string }).password;
  const service = createServiceClient();

  if (password && password.length >= 8) {
    const { error } = await service.auth.admin.updateUserById(params.id, { password });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    const { data: userRow } = await service.from('admin_users').select('email').eq('id', params.id).single();
    if (!userRow?.email) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const origin = request.headers.get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL ?? '';
    const { error } = await service.auth.resetPasswordForEmail(userRow.email, {
      redirectTo: `${origin}/admin/auth/callback?next=/login`
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await service.from('activity_log').insert({
    user_id: auth.user.id,
    user_email: auth.profile.email,
    action: 'password_reset',
    entity: 'admin_users',
    entity_id: params.id,
    summary: 'Password reset initiated for admin user'
  });

  return NextResponse.json({ ok: true });
}
