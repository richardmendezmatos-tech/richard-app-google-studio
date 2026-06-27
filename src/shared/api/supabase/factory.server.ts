/**
 * Server-only Supabase factory. Imports next/headers — never bundle this in the browser.
 *
 * createSSRClient() — server, anon key + cookies, for RSC / auth callbacks.
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getPublicCredentials } from './factory';

export async function createSSRClient(): Promise<SupabaseClient> {
  const creds = getPublicCredentials();
  if (!creds) {
    console.error('❌ [Supabase SSR] Missing NEXT_PUBLIC_SUPABASE_URL or anon key');
    return null as any;
  }
  const cookieStore = await cookies();
  return createServerClient(creds.url, creds.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component — safe to ignore if proxy refreshes sessions.
        }
      },
    },
  });
}
