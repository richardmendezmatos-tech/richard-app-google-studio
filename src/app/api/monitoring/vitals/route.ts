import { NextResponse } from 'next/server';
import { createClient } from '@/shared/api/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { metric, value, rating, page } = body;

    if (!metric || value === undefined) {
      return NextResponse.json({ error: 'metric and value required' }, { status: 400 });
    }

    const sb = await createClient();
    const { error } = await sb.from('web_vitals').insert({
      metric,
      value,
      rating: rating || 'needs-improvement',
      page: page || 'unknown',
      session_id: request.headers.get('x-session-id') || null,
    });

    if (error) {
      console.error('[WebVitals] Failed to store:', error);
      return NextResponse.json({ error: 'Failed to store' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[WebVitals] POST error:', err);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const metric = url.searchParams.get('metric');
  const limit = parseInt(url.searchParams.get('limit') || '50', 10);

  const sb = await createClient();
  let query = sb.from('web_vitals').select('*').order('timestamp', { ascending: false }).limit(limit);

  if (metric) {
    query = query.eq('metric', metric);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
