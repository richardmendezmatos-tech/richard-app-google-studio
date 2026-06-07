import { NextResponse } from 'next/server';
import { GBPService } from '@/shared/api/gbp/gbpService';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({
      connected: false,
      stats: [
        { label: 'Map Views', value: '—', change: '', icon: 'map' },
        { label: 'Search Views', value: '—', change: '', icon: 'search' },
        { label: 'Calls', value: '—', change: '', icon: 'phone' },
        { label: 'Website Clicks', value: '—', change: '', icon: 'click' },
        { label: 'Directions', value: '—', change: '', icon: 'directions' },
      ],
    });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data: profiles } = await supabase
    .from('profiles')
    .select('metadata')
    .eq('role', 'admin')
    .limit(1);
  const gbpConfig = (profiles?.[0] as any)?.metadata?.gbp_config || {};

  if (!gbpConfig.accountId || !gbpConfig.locationId || !gbpConfig.accessToken) {
    return NextResponse.json({
      connected: false,
      stats: [
        { label: 'Map Views', value: '—', change: '—', icon: 'map' },
        { label: 'Search Views', value: '—', change: '—', icon: 'search' },
        { label: 'Calls', value: '—', change: '—', icon: 'phone' },
        { label: 'Website Clicks', value: '—', change: '—', icon: 'click' },
        { label: 'Directions', value: '—', change: '—', icon: 'directions' },
      ],
    });
  }

  const gbp = new GBPService(gbpConfig);
  const insights = await gbp.getInsights();

  if (!insights) {
    return NextResponse.json({
      connected: true,
      stats: [
        { label: 'Map Views', value: 'N/A', change: '', icon: 'map' },
        { label: 'Search Views', value: 'N/A', change: '', icon: 'search' },
        { label: 'Calls', value: 'N/A', change: '', icon: 'phone' },
        { label: 'Website Clicks', value: 'N/A', change: '', icon: 'click' },
        { label: 'Directions', value: 'N/A', change: '', icon: 'directions' },
      ],
    });
  }

  const metrics = insights.insights || [];
  const findMetric = (key: string) =>
    metrics.find((m: any) => m.metric === key)?.aggregations?.[0]?.value || 0;

  const stats = [
    { label: 'Map Views', value: String(findMetric('BUSINESS_IMPRESSIONS_MAPS')), change: '', icon: 'map' },
    { label: 'Search Views', value: String(findMetric('BUSINESS_IMPRESSIONS_SEARCH')), change: '', icon: 'search' },
    { label: 'Calls', value: String(findMetric('BUSINESS_CONVERSIONS_CALLS')), change: '', icon: 'phone' },
    { label: 'Website Clicks', value: String(findMetric('BUSINESS_CONVERSIONS_WEBSITE')), change: '', icon: 'click' },
    { label: 'Directions', value: String(findMetric('BUSINESS_CONVERSIONS_DIRECTIONS')), change: '', icon: 'directions' },
  ];

  return NextResponse.json({ connected: true, stats }, {
    headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600' },
  });
}
