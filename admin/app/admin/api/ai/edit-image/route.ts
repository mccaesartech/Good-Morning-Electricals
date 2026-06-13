import { NextResponse } from 'next/server';
import { editImageWithPrompt } from '@/lib/ai-image';
import { requireAdmin } from '@/lib/admin-auth';
import { uploadImageBuffer } from '@/lib/storage-server';

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (!auth) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const body = await request.json();
    const imageUrl = String(body?.imageUrl ?? '').trim();
    const prompt = String(body?.prompt ?? '').trim();
    const folder = String(body?.folder ?? 'gallery').trim();

    if (!imageUrl || !prompt) {
      return NextResponse.json({ error: 'Image URL and edit prompt are required.' }, { status: 400 });
    }

    const edited = await editImageWithPrompt(imageUrl, prompt);
    if ('error' in edited) {
      return NextResponse.json({ error: edited.error }, { status: 400 });
    }

    const uploaded = await uploadImageBuffer(edited.buffer, folder, edited.mime);
    if ('error' in uploaded) {
      return NextResponse.json({ error: uploaded.error }, { status: 500 });
    }

    return NextResponse.json({ ok: true, url: uploaded.url, path: uploaded.path });
  } catch (e) {
    console.error('[api/ai/edit-image]', e);
    return NextResponse.json({ error: 'AI image edit failed' }, { status: 500 });
  }
}
