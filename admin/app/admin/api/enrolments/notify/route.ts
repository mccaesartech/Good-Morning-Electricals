import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { notifyEnrolmentStatusChange } from '@/lib/notifications';

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.rpc('get_admin_profile');
  if (!profile) return null;
  return { supabase, user, profile };
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (!auth) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const body = await request.json();
    const status = body?.status as 'contacted' | 'admitted' | 'pending';
    const record = body?.record as {
      full_name: string;
      email: string;
      phone: string;
      programme: string;
    };

    if (!record?.email || !status) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    if (!['contacted', 'admitted', 'pending'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    await notifyEnrolmentStatusChange(record, status);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[api/enrolments/notify]', e);
    return NextResponse.json({ error: 'Notification failed' }, { status: 500 });
  }
}
