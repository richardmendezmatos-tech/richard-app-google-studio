import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
);

/**
 * GET /api/command-center/telemetry
 * 
 * Aggregates real-time metrics for the Command Center dashboard:
 * - Lead velocity (last 24h, 7d, 30d)
 * - Neural Search queries & gaps
 * - WhatsApp delivery stats
 * - Inventory embedding coverage
 */
export async function GET(req: Request) {
  const token = req.headers.get('x-antigravity-token');
  if (token !== process.env.ANTIGRAVITY_INTERNAL_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

    // Parallel data fetching for speed
    const [
      leadsToday,
      leads7d,
      leads30d,
      searchGaps,
      messageStats,
      embeddingCount,
    ] = await Promise.all([
      supabase.from('leads').select('id', { count: 'exact', head: true }).gte('created_at', last24h),
      supabase.from('leads').select('id', { count: 'exact', head: true }).gte('created_at', last7d),
      supabase.from('leads').select('id', { count: 'exact', head: true }).gte('created_at', last30d),
      supabase.from('search_gaps').select('*').order('created_at', { ascending: false }).limit(20),
      supabase.from('message_queue').select('status').gte('created_at', last7d),
      supabase.from('vehicle_embeddings').select('car_id', { count: 'exact', head: true }),
    ]);

    // Compute message delivery breakdown
    const msgBreakdown = { sent: 0, scheduled: 0, failed: 0 };
    if (messageStats.data) {
      for (const msg of messageStats.data) {
        const s = msg.status as keyof typeof msgBreakdown;
        if (msgBreakdown[s] !== undefined) msgBreakdown[s]++;
      }
    }

    return NextResponse.json({
      timestamp: now.toISOString(),
      leads: {
        last_24h: leadsToday.count || 0,
        last_7d: leads7d.count || 0,
        last_30d: leads30d.count || 0,
      },
      neuralSearch: {
        recent_gaps: searchGaps.data || [],
        gap_count: searchGaps.data?.length || 0,
      },
      whatsapp: msgBreakdown,
      inventory: {
        vehicles_with_embeddings: embeddingCount.count || 0,
      },
    });
  } catch (error: any) {
    console.error('[Telemetry] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
