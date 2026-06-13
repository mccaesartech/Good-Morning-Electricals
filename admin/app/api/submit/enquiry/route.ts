import { NextResponse } from 'next/server';
import { submitPublicEnquiry } from '@/lib/public-forms';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await submitPublicEnquiry({
      full_name: String(body?.full_name ?? ''),
      email: String(body?.email ?? ''),
      phone: body?.phone ?? null,
      programme: body?.programme ?? null,
      message: String(body?.message ?? '')
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Submission failed';
    console.error('[api/submit/enquiry]', e);
    const status = message.includes('SERVICE_ROLE_KEY') ? 503 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
