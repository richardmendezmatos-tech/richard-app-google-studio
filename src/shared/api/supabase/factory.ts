/**
 * Single source of truth for all Supabase client creation.
 *
 * Three modes — pick the right one:
 *
 *   createAnonClient()    Browser/Edge components. Subject to RLS. Uses anon key.
 *                         Safe to call from client components and public API routes.
 *
 *   createSSRClient()     Server Components and auth callback routes that need to read
 *                         or refresh the user session from cookies. Uses anon key + cookies().
 *                         Must be awaited. Do NOT use in API routes — no cookie jar there.
 *
 *   createServiceClient() API routes, cron jobs, server-side mutations. Bypasses RLS.
 *                         Uses SUPABASE_SERVICE_ROLE_KEY. Never expose to the browser.
 */

import { createBrowserClient } from '@supabase/ssr';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import type { SupabaseClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Shared URL / key helpers
// ---------------------------------------------------------------------------

function getPublicCredentials(): { url: string; anonKey: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url?.startsWith('http') || !anonKey) return null;
  return { url, anonKey };
}

function getServiceCredentials(): { url: string; serviceKey: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url?.startsWith('http') || !serviceKey) return null;
  return { url, serviceKey };
}

// ---------------------------------------------------------------------------
// createAnonClient — browser, anon key, singleton
// ---------------------------------------------------------------------------

let _anonClient: SupabaseClient | null = null;

export function createAnonClient(): SupabaseClient {
  if (_anonClient) return _anonClient;
  const creds = getPublicCredentials();
  if (!creds) {
    console.error('❌ [Supabase] Missing NEXT_PUBLIC_SUPABASE_URL or anon key');
    return null as any;
  }
  _anonClient = createBrowserClient(creds.url, creds.anonKey);
  return _anonClient;
}

// ---------------------------------------------------------------------------
// createSSRClient — server, anon key + cookies, for RSC / auth callbacks
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// createServiceClient — server only, service role, bypasses RLS
// ---------------------------------------------------------------------------

export function createServiceClient(): SupabaseClient {
  const creds = getServiceCredentials();
  if (!creds) {
    console.error('❌ [Supabase Service] Missing URL or SUPABASE_SERVICE_ROLE_KEY');
    return null as any;
  }
  return createClient(creds.url, creds.serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
