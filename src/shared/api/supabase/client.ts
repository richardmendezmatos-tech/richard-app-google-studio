import { createBrowserClient } from '@supabase/ssr';
import { type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

export function createClient() {
  if (client) return client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl?.startsWith('http') || !supabaseKey) {
    console.error('❌ [Supabase Client] Missing or invalid environment variables');
    return null as any;
  }

  client = createBrowserClient(supabaseUrl, supabaseKey);

  return client;
}

export function getClient() {
  return createClient();
}
