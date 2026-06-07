import { NextResponse } from 'next/server';
import { createClient } from '@/shared/api/supabase/server';
import { paginateCursor } from '@/shared/api/supabase/cursorPagination';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const sb = await createClient();

    if (body.metrics && Array.isArray(body.metrics)) {
      const rows = body.metrics.map((m: any) => ({
        metric: m.metric,
        value: m.value,
        rating: m.rating || 'needs-improvement',
        page: body.page || m.page || 'unknown',
        session_id: request.headers.get('x-session-id') || null,
      }));
      const { error } = await sb.from('web_vitals').insert(rows);
      if (error) {
        console.error('[WebVitals] Batch insert failed:', error);
        return NextResponse.json({ error: 'Failed to store' }, { status: 500 });
      }
      return NextResponse.json({ ok: true, count: rows.length });
    }

    const { metric, value, rating, page } = body;
    if (!metric || value === undefined) {
      return NextResponse.json({ error: 'metric and value required' }, { status: 400 });
    }
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
  const cursor = url.searchParams.get('cursor');
  const limit = parseInt(url.searchParams.get('limit') || '50', 10);

  const sb = await createClient();
  let query = sb.from('web_vitals');

  if (metric) {
    query = query.eq('metric', metric) as any;
  }

  try {
    const result = await paginateCursor<any>(query as any, 'web_vitals', {
      limit,
      cursor: cursor ?? '',
      sortField: 'timestamp',
      sortDir: 'desc',
    });
    return NextResponse.json({ data: result.data, nextCursor: result.nextCursor });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
