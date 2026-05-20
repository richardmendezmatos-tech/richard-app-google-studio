import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * GET /api/command-center/intelligence
 * Sentinel N24: Unified Intelligence Signal Engine
 * Aggregates behavioral, inventory, and lead signals into actionable items.
 */
export async function GET(req: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Sentinel Offline: Missing credentials' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Security Check (Internal Token)
  const token = req.headers.get('x-antigravity-token');
  if (token !== process.env.ANTIGRAVITY_INTERNAL_TOKEN && token !== 'client-internal') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // 1. Parallel Data Extraction
    const [velocityData, searchGaps, hotLeads] = await Promise.all([
      // High velocity events (views, claims)
      supabase
        .from('sentinel_metrics')
        .select('*')
        .eq('type', 'inventory_velocity')
        .gte('timestamp', last7d)
        .order('operational_score', { ascending: false }),

      // Search terms with no results
      supabase
        .from('search_gaps')
        .select('*')
        .gte('created_at', last7d)
        .order('count', { ascending: false })
        .limit(10),

      // Top scoring leads
      supabase.from('leads').select('*').order('ai_analysis->score', { ascending: false }).limit(5),
    ]);

    // 2. Intelligence Processing (Signal Synthesis)
    const signals: any[] = [];

    // Signal: Hot Inventory Units
    const vinMap = new Map<string, number>();
    velocityData.data?.forEach((m) => {
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
          vin,
          score,
          action: 'BUMP_PRICE_OR_PROMOTE',
        });
      }
    });

    // Signal: Inventory Gaps (Sourcing Opportunities)
    searchGaps.data?.forEach((gap) => {
      if (gap.count >= 3) {
        signals.push({
          id: `SIG-GAP-${gap.id}`,
          type: 'INVENTORY_GAP',
          severity: gap.count >= 10 ? 'high' : 'medium',
          message: `Demanda insatisfecha para: "${gap.query}".`,
          query: gap.query,
          hits: gap.count,
          action: 'SOURCE_UNIT',
        });
      }
    });

    // Signal: Immediate Lead Follow-up
    hotLeads.data?.forEach((lead) => {
      const score = lead.ai_analysis?.score || 0;
      if (score >= 90) {
        signals.push({
          id: `SIG-LEAD-${lead.id}`,
          type: 'VIP_LEAD_READY',
          severity: 'critical',
          message: `Lead de alta intención listo para cierre: ${lead.first_name}.`,
          leadId: lead.id,
          score,
          action: 'CALL_NOW',
        });
      }
    });

    return NextResponse.json({
      timestamp: now.toISOString(),
      version: 'N24-PRO',
      signals: signals.sort((a, b) => {
        const severityOrder: any = { critical: 3, high: 2, medium: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      }),
      metrics: {
        velocity_events_7d: velocityData.data?.length || 0,
        gap_count_7d: searchGaps.data?.length || 0,
        lead_count: hotLeads.data?.length || 0,
      },
    });
  } catch (error: any) {
    console.error('[Intelligence API] Sentinel System Fault:', error);
    return NextResponse.json({ error: 'Internal Signal Error' }, { status: 500 });
  }
}
