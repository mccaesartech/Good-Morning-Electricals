import { createClient } from '@/lib/supabase/client';

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

export function getPublicUrl(path: string): string {
  const supabase = createClient();
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadImage(
  file: File,
  folder: string
): Promise<{ url: string; path: string } | { error: string }> {
  if (!ALLOWED_FOLDERS.has(folder)) {
    return { error: `Invalid upload folder: ${folder}` };
  }

  if (file.size > 5 * 1024 * 1024) {
    return { error: 'Image must be 5 MB or smaller.' };
  }

  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
  if (!allowed.includes(file.type)) {
    return { error: 'Only JPEG, PNG, WebP, and SVG images are allowed.' };
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const supabase = createClient();
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false
  });

  if (error) {
    return { error: error.message };
  }

  const { logActivity } = await import('@/lib/activity');
  await logActivity('uploaded', 'website-assets', `Uploaded image: ${path}`);

  return { url: getPublicUrl(path), path };
}
