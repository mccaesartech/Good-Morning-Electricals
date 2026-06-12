export const BASE_PATH = '/admin';

export function assetUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${BASE_PATH}${normalized}`;
}

/** Public marketing site root (not the /admin app). */
export function publicSiteUrl(refresh = false): string {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '');
  const origin = base || (typeof window !== 'undefined' ? window.location.origin : '');
  const path = refresh ? '/?refresh=1' : '/';
  return origin ? `${origin}${path}` : path;
}

export type ContentStatus = 'draft' | 'published';

export const STATUS_OPTIONS: { value: ContentStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' }
];
