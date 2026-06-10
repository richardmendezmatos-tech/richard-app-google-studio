import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/shared/api/supabase/serverClient';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { searchTerm, context } = await req.json();
    const sb = createServerSupabaseClient();
    await sb.from('sentinel_metrics').insert({
      type: 'search_gap',
      data: { searchTerm, context, timestamp: new Date().toISOString() },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
