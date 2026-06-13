import { createServiceClient } from '@/lib/supabase/service';

const BUCKET = 'website-assets';

const ALLOWED_FOLDERS = new Set([
  'branding',
  'hero',
  'about',
  'admissions',
  'programmes',
  'facilities',
  'staff',
  'gallery'
]);

export async function uploadImageBuffer(
  buffer: Buffer,
  folder: string,
  mime = 'image/png'
): Promise<{ url: string; path: string } | { error: string }> {
  if (!ALLOWED_FOLDERS.has(folder)) {
    return { error: `Invalid upload folder: ${folder}` };
  }

  const ext = mime.includes('jpeg') || mime.includes('jpg') ? 'jpg' : mime.includes('webp') ? 'webp' : 'png';
  const path = `${folder}/ai-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const service = createServiceClient();
  const { error } = await service.storage.from(BUCKET).upload(path, buffer, {
    contentType: mime,
    cacheControl: '3600',
    upsert: false
  });

  if (error) return { error: error.message };

  const { data } = service.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, path };
}
