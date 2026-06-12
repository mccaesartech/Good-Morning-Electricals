/**
 * Supabase URL + anon key for the admin app.
 * Falls back to the same values as js/supabase-config.js so Vercel deploys work
 * before dashboard env vars are configured (anon key is already public on the site).
 */
export function getSupabaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    'https://qjvglzudiriajoyoclhe.supabase.co'
  );
}

export function getSupabaseAnonKey(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    'sb_publishable_X1SAkKLhFmFZUc8N5Qzf5w_zzZGySd9'
  );
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  );
}
