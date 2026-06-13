type EditResult = { buffer: Buffer; mime: string } | { error: string };

export async function editImageWithPrompt(imageUrl: string, prompt: string): Promise<EditResult> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return { error: 'OPENAI_API_KEY is not configured. Add it in Vercel environment variables.' };
  }

  if (!imageUrl.startsWith('http')) {
    return { error: 'Upload an image first, then describe your edit.' };
  }

  const imageRes = await fetch(imageUrl);
  if (!imageRes.ok) {
    return { error: 'Could not download the current image for editing.' };
  }

  const imageBuffer = Buffer.from(await imageRes.arrayBuffer());
  const contentType = imageRes.headers.get('content-type') || 'image/png';
  const ext = contentType.includes('jpeg') ? 'jpg' : contentType.includes('webp') ? 'webp' : 'png';

  const form = new FormData();
  form.append('model', 'gpt-image-1');
  form.append('prompt', prompt);
  form.append('image', new Blob([imageBuffer], { type: contentType }), `image.${ext}`);
  form.append('n', '1');
  form.append('size', '1024x1024');

  const res = await fetch('https://api.openai.com/v1/images/edits', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error('[ai-image] OpenAI error:', errText);
    return { error: 'AI image edit failed. Check OPENAI_API_KEY and try a simpler prompt.' };
  }

  const data = (await res.json()) as { data?: { b64_json?: string }[] };
  const b64 = data.data?.[0]?.b64_json;
  if (!b64) {
    return { error: 'AI did not return an edited image.' };
  }

  return { buffer: Buffer.from(b64, 'base64'), mime: 'image/png' };
}
