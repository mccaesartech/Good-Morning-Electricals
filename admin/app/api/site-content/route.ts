import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/** Public endpoint: returns published CMS content for the marketing site. */
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const res = await fetch(`${url}/rest/v1/rpc/get_published_site_content`, {
    method: 'POST',
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: '{}',
    cache: 'no-store'
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    return NextResponse.json(
      { error: 'Failed to load published content', detail },
      { status: res.status }
    );
  }

  const data = await res.json();
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      Pragma: 'no-cache'
    }
  });
}
