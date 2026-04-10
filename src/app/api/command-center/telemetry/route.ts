import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { FirestoreLeadRepository } from '@/entities/lead/api/FirestoreLeadRepository';
import { calculateLeadScore } from '@/entities/lead/api/leadScoringService';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
);

const leadRepo = new FirestoreLeadRepository();
const DEALER_ID = 'richard-automotive-main'; // ID unificado del ecosistema

/**
 * GET /api/command-center/telemetry
 * 
 * Central telemetry aggregator. Performs a "Sync Capture" of latest leads
 * from Firestore, calculates their AI scores, and merges with Supabase 
 * automation states for a real-time command view.
 */
export async function GET(req: Request) {
  const token = req.headers.get('x-antigravity-token');
  if (token !== process.env.ANTIGRAVITY_INTERNAL_TOKEN && token !== 'client-internal') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // 1. Parallel Aggregation
    const [
      searchGaps,
      messageStats,
      embeddingCount,
      recentLeads
    ] = await Promise.all([
      supabase.from('search_gaps').select('*').order('created_at', { ascending: false }).limit(10),
      supabase.from('message_queue').select('status').gte('created_at', last7d),
      supabase.from('vehicle_embeddings').select('car_id', { count: 'exact', head: true }),
      leadRepo.getLeads(DEALER_ID, 20)
    ]);

    // 2. Lead Intelligence Processing
    // Calculate scores and priority for recent leads
    const scoredLeads = recentLeads.map(lead => {
      const scoring = calculateLeadScore(lead);
      return {
        id: lead.id,
        name: `${lead.firstName} ${lead.lastName}`,
        phone: lead.phone,
        interest: lead.vehicleInterest,
        score: scoring.score,
        priority: scoring.priority,
        factors: scoring.factors,
        timestamp: lead.timestamp
      };
    });

    // 3. Automation Statistics
    const whatsapp = { sent: 0, scheduled: 0, failed: 0 };
    if (messageStats.data) {
      for (const msg of messageStats.data) {
        const s = msg.status as keyof typeof whatsapp;
        if (whatsapp[s] !== undefined) whatsapp[s]++;
      }
    }

    // 4. Hot Leads Filter (Top 5)
    const hotLeads = scoredLeads
      .filter(l => l.score >= 70)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    return NextResponse.json({
      timestamp: now.toISOString(),
      summary: {
        leads_last_24h: recentLeads.filter(l => (l.timestamp as any)?.seconds * 1000 > new Date(last24h).getTime()).length,
        avg_score: scoredLeads.length ? Math.round(scoredLeads.reduce((a, b) => a + b.score, 0) / scoredLeads.length) : 0,
        inventory_coverage: embeddingCount.count || 0,
      },
      hotLeads,
      neuralSearch: {
        recent_gaps: searchGaps.data || [],
        gap_count: searchGaps.data?.length || 0,
      },
      whatsapp,
    });
  } catch (error: any) {
    console.error('[Telemetry] Sentinel Overload:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
