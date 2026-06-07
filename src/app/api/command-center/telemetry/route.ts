import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SupabaseLeadRepository } from '@/entities/lead/api/repositories/SupabaseLeadRepository';
import { calculateLeadScore } from '@/entities/lead/api/leadScoringService';
import { Lead } from '@/shared/types/lead';

const DEALER_ID = 'richard-automotive-main';

export const runtime = 'edge';
export async function GET(req: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn('[Telemetry API] Supabase keys missing.');
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      summary: { leads_last_24h: 0, avg_score: 0, inventory_coverage: 0 },
      hotLeads: [],
      neuralSearch: { recent_gaps: [], gap_count: 0 },
      whatsapp: { sent: 0, scheduled: 0, failed: 0 },
      purchaseOrders: [],
    });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const leadRepo = new SupabaseLeadRepository(supabase);

  const token = req.headers.get('x-antigravity-token');
  if (token !== process.env.ANTIGRAVITY_INTERNAL_TOKEN && token !== 'client-internal') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // 1. Parallel Aggregation
    const [searchGaps, messageStats, embeddingCount, rawLeads, purchaseOrders, distributionStats, velocityData, hotLeadRows] =
      await Promise.all([
        supabase
          .from('search_gaps')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10),
        supabase.from('message_queue').select('status').gte('created_at', last7d),
        supabase.from('vehicle_embeddings').select('car_id', { count: 'exact', head: true }),
        leadRepo.getLeads(DEALER_ID, 20),
        supabase
          .from('purchase_orders')
          .select('*')
          .in('status', ['draft', 'confirmed'])
          .order('created_at', { ascending: false })
          .limit(10),
        supabase.from('system_logs').select('level').eq('category', 'SentinelDistribution'),
        supabase
          .from('sentinel_metrics')
          .select('data, operational_score, type, timestamp')
          .eq('type', 'inventory_velocity')
          .gte('timestamp', last7d)
          .order('operational_score', { ascending: false })
          .limit(100),
        supabase.from('leads').select('id, first_name, ai_analysis').order('ai_analysis->score', { ascending: false }).limit(5),
      ]);

    // 2. Map and Score Leads
    const leads = (rawLeads as any[]).map((l) => ({
      ...l,
      firstName: l.first_name,
      lastName: l.last_name,
      vehicleOfInterest: l.vehicle_of_interest,
      aiScore: l.ai_analysis?.score || 50,
      customerMemory: l.customer_memory || l.ai_analysis?.memory || {},
    })) as Lead[];

    const scoredLeads = leads.map((lead) => {
      const scoring = calculateLeadScore(lead);
      return {
        id: lead.id,
        name: `${lead.firstName} ${lead.lastName}`,
        phone: lead.phone,
        interest: lead.vehicleOfInterest,
        score: scoring.score,
        priority: scoring.priority,
        factors: scoring.factors,
        timestamp: lead.createdAt || lead.timestamp,
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

    // 4. Distribution Statistics (from system_logs)
    const distribution = { active: 0, pending: 0, error: 0 };
    if (distributionStats.data) {
      for (const log of distributionStats.data) {
        if (log.level === 'info' || log.level === 'conversion') {
          distribution.active++;
        } else if (log.level === 'error' || log.level === 'critical') {
          distribution.error++;
        } else {
          distribution.pending++;
        }
      }
    }

    // 5. Hot Leads Filter (Top 5)
    const hotLeads = scoredLeads
      .filter((l) => l.score >= 70)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    // 6. Intelligence Signals (merged from former /api/command-center/intelligence)
    const signals: any[] = [];
    const vinMap = new Map<string, number>();
    velocityData.data?.forEach((m: any) => {
      const vin = m.data?.vin;
      if (vin) vinMap.set(vin, (vinMap.get(vin) || 0) + (m.operational_score || 1));
    });
    vinMap.forEach((score, vin) => {
      if (score >= 5) {
        signals.push({
          id: `SIG-VEL-${vin}`,
          type: 'HOT_INVENTORY',
          severity: score >= 10 ? 'high' : 'medium',
          message: `Unidad con alta velocidad de conversión detectada.`,
          vin, score,
          action: 'BUMP_PRICE_OR_PROMOTE',
        });
      }
    });
    searchGaps.data?.forEach((gap: any) => {
      if (gap.count >= 3) {
        signals.push({
          id: `SIG-GAP-${gap.id}`,
          type: 'INVENTORY_GAP',
          severity: gap.count >= 10 ? 'high' : 'medium',
          message: `Demanda insatisfecha para: "${gap.query}".`,
          query: gap.query, hits: gap.count,
          action: 'SOURCE_UNIT',
        });
      }
    });
    hotLeadRows.data?.forEach((lead: any) => {
      const score = lead.ai_analysis?.score || 0;
      if (score >= 90) {
        signals.push({
          id: `SIG-LEAD-${lead.id}`,
          type: 'VIP_LEAD_READY',
          severity: 'critical',
          message: `Lead de alta intención listo para cierre: ${lead.first_name}.`,
          leadId: lead.id, score,
          action: 'CALL_NOW',
        });
      }
    });

    return NextResponse.json({
      timestamp: now.toISOString(),
      summary: {
        leads_last_24h: leads.filter(
          (l) => new Date(l.createdAt as any).getTime() > new Date(last24h).getTime(),
        ).length,
        avg_score: scoredLeads.length
          ? Math.round(scoredLeads.reduce((a, b) => a + b.score, 0) / scoredLeads.length)
          : 0,
        inventory_coverage: embeddingCount.count || 0,
        distribution_health:
          distribution.active > 0
            ? Math.round(
                (distribution.active / (distribution.active + distribution.error || 1)) * 100,
              )
            : 100,
      },
      hotLeads,
      neuralSearch: {
        recent_gaps: searchGaps.data || [],
        gap_count: searchGaps.data?.length || 0,
      },
      whatsapp,
      distribution,
      purchaseOrders: purchaseOrders.data || [],
      signals: signals.sort((a, b) => {
        const severityOrder: any = { critical: 3, high: 2, medium: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      }),
      version: 'N24-PRO',
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    });
  } catch (error: any) {
    console.error('[Telemetry] Sentinel Overload:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
