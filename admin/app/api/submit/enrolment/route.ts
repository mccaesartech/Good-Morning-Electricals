import { NextResponse } from 'next/server';
import { submitPublicEnrolment } from '@/lib/public-forms';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await submitPublicEnrolment({
      full_name: String(body?.full_name ?? ''),
      email: String(body?.email ?? ''),
      phone: String(body?.phone ?? ''),
      programme: String(body?.programme ?? ''),
      date_of_birth: body?.date_of_birth ?? null,
      education_level: body?.education_level ?? null,
      message: body?.message ?? null
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Submission failed';
    console.error('[api/submit/enrolment]', e);
    const status = message.includes('SERVICE_ROLE_KEY') ? 503 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
