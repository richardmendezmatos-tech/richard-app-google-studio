import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

function createServerClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase URL or Service Role Key missing for server-side operations.');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function createBrowserClientSafe(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ [Supabase] Missing environment variables');
    return null;
  }

  return createBrowserClient(supabaseUrl, supabaseKey);
}

let instance: SupabaseClient | null = null;

function getInstance(): SupabaseClient {
  if (instance) return instance;

  if (typeof window === 'undefined') {
    instance = createServerClient();
  } else {
    const browser = createBrowserClientSafe();
    if (!browser) throw new Error('Supabase URL or anon key missing for browser operations.');
    instance = browser;
  }

  return instance;
}

const supabaseProxy = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    const target = getInstance();
    const value = target[prop as keyof typeof target];
    if (typeof value === 'function') {
      return value.bind(target);
    }
    return value;
  },
});

export { supabaseProxy as supabase };
