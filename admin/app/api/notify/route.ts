import { NextResponse } from 'next/server';
import { notifyEnquirySubmitted, notifyEnrolmentSubmitted } from '@/lib/notifications';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const type = body?.type as string;
    const record = body?.record as Record<string, string | null | undefined>;

    if (!record?.full_name || !record?.email) {
      return NextResponse.json({ error: 'Invalid notification payload' }, { status: 400 });
    }

    if (type === 'enrolment') {
      if (!record.phone || !record.programme) {
        return NextResponse.json({ error: 'Enrolment requires phone and programme' }, { status: 400 });
      }
      const result = await notifyEnrolmentSubmitted({
        full_name: String(record.full_name),
        email: String(record.email),
        phone: String(record.phone),
        programme: String(record.programme),
        message: record.message ?? null
      });
      return NextResponse.json({ ok: true, ...result });
    }

    if (type === 'enquiry') {
      await notifyEnquirySubmitted({
        full_name: String(record.full_name),
        email: String(record.email),
        phone: record.phone ?? null,
        programme: record.programme ?? null,
        message: record.message ?? null
      });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: 'Unknown notification type' }, { status: 400 });
  } catch (e) {
    console.error('[api/notify]', e);
    return NextResponse.json({ error: 'Notification failed' }, { status: 500 });
  }
}
