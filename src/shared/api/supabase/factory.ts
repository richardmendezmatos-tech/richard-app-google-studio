/**
 * Supabase client factory — browser-safe functions only.
 *
 * createAnonClient()    Browser/Edge components. Subject to RLS. Uses anon key.
 * createServiceClient() API routes and server jobs. Bypasses RLS. Server-only.
 *
 * For SSR (Server Components + auth callbacks), use createSSRClient() from
 * factory.server.ts — it imports next/headers and must not be bundled by the browser.
 */

import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Shared credential helpers
// ---------------------------------------------------------------------------

export function getPublicCredentials(): { url: string; anonKey: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url?.startsWith('http') || !anonKey) return null;
  return { url, anonKey };
}

export function getServiceCredentials(): { url: string; serviceKey: string } | null {
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
