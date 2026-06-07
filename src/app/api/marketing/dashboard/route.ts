import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({
      leads: [],
      leadCount: 0,
      leadSourceData: [],
      conversionFunnelData: [],
      blogPostCount: 0,
      emailStats: { sent: 0, scheduled: 0, failed: 0 },
      distributionStats: { active: 0, pending: 0, error: 0, health: 100 },
      recentCampaigns: [],
    });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const now = new Date();
  const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  try {
    const [leadsResult, blogResult, emailResult, distResult, campaignsResult] =
      await Promise.all([
        supabase.from('leads').select('*').limit(1000),
        supabase.from('blog_posts').select('id', { count: 'exact', head: true }),
        supabase.from('message_queue').select('status, type').gte('created_at', last30d),
        supabase
          .from('distribution_logs')
          .select('level')
          .gte('created_at', last30d),
        supabase
          .from('blog_posts')
          .select('id, title, created_at, published')
          .order('created_at', { ascending: false })
          .limit(10),
      ]);

    const leads = (leadsResult.data || []).map((l: any) => ({
      id: l.id,
      type: l.type || l.source || 'web',
      status: l.status || 'new',
      name: `${l.first_name || ''} ${l.last_name || ''}`.trim(),
      firstName: l.first_name || '',
      lastName: l.last_name || '',
      email: l.email || '',
      phone: l.phone || '',
      vehicleOfInterest: l.vehicle_of_interest || '',
      source: l.source || l.type || 'web',
      createdAt: l.created_at,
    }));

    const leadSourceData = countBy(leads, (l: any) =>
      l.type === 'whatsapp' ? 'WhatsApp' : 'Web/Otros',
    );
    const conversionFunnelData = [
      { name: 'Nuevo', value: leads.length },
      {
        name: 'Contactado',
        value: leads.filter(
          (l: any) =>
            l.status === 'contacted' || l.status === 'negotiation' || l.status === 'sold',
        ).length,
      },
      {
        name: 'Negociación',
        value: leads.filter((l: any) => l.status === 'negotiation' || l.status === 'sold').length,
      },
      { name: 'Cierre', value: leads.filter((l: any) => l.status === 'sold').length },
    ];

    const emailStats = { sent: 0, scheduled: 0, failed: 0 };
    if (emailResult.data) {
      for (const msg of emailResult.data) {
        const s = msg.status as keyof typeof emailStats;
        if (emailStats[s] !== undefined) emailStats[s]++;
      }
    }

    const distributionStats = { active: 0, pending: 0, error: 0, health: 100 };
    if (distResult.data) {
      for (const log of distResult.data) {
        if (log.level === 'info') distributionStats.active++;
        else if (log.level === 'error') distributionStats.error++;
        else distributionStats.pending++;
      }
      distributionStats.health =
        distributionStats.active + distributionStats.error > 0
          ? Math.round(
              (distributionStats.active /
                (distributionStats.active + distributionStats.error || 1)) *
                100,
            )
          : 100;
    }

    const leadStatusData = countBy(leads, (l: any) => l.status || 'unknown');

    return NextResponse.json({
      leads,
      leadCount: leads.length,
      leadSourceData,
      conversionFunnelData,
      leadStatusData,
      blogPostCount: blogResult.count || 0,
      emailStats,
      distributionStats,
      recentCampaigns: (campaignsResult.data || []).map((p: any) => ({
        id: p.id,
        title: p.title,
        date: p.created_at,
        published: p.published,
      })),
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    });
  } catch (error: any) {
    console.error('[Marketing Dashboard API] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

function countBy<T>(items: T[], keyFn: (item: T) => string): { name: string; value: number }[] {
  const counts: Record<string, number> = {};
  for (const item of items) {
    const key = keyFn(item);
    counts[key] = (counts[key] || 0) + 1;
  }
  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}
