import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl } from '@/lib/supabase/env';

const SERVICE_KEY_MESSAGE =
  'SUPABASE_SERVICE_ROLE_KEY is not set. Add it in Vercel → Settings → Environment Variables, then redeploy.';

export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || getSupabaseUrl();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!key) {
    throw new Error(SERVICE_KEY_MESSAGE);
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}
