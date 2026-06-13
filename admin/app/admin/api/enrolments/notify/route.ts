import { NextResponse } from 'next/server';
import { notifyEnrolmentStatusChange, type EnrolmentNotifyStatus } from '@/lib/notifications';
import { requireAdmin } from '@/lib/admin-auth';

const NOTIFY_STATUSES: EnrolmentNotifyStatus[] = [
  'pending',
  'contacted',
  'admitted',
  'rejected',
  'archived'
];

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (!auth) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const body = await request.json();
    const status = body?.status as EnrolmentNotifyStatus;
    const record = body?.record as {
      full_name: string;
      email: string;
      phone: string;
      programme: string;
    };

    if (!record?.email || !status) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    if (!NOTIFY_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    await notifyEnrolmentStatusChange(record, status);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[api/enrolments/notify]', e);
    return NextResponse.json({ error: 'Notification failed' }, { status: 500 });
  }
}
