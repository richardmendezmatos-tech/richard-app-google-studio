import { NextRequest, NextResponse } from 'next/server';
import { getSitemaps, getSearchAnalytics } from '@/shared/api/seo/gscService';

export const runtime = 'nodejs';


export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sitemapsRes = await getSitemaps();
    if (!sitemapsRes.ok) {
      return NextResponse.json(sitemapsRes.error, { status: sitemapsRes.error.code });
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const fmt = (d: Date) => d.toISOString().split('T')[0];

    const analyticsRes = await getSearchAnalytics({
      startDate: fmt(thirtyDaysAgo),
      endDate: fmt(now),
      dimensions: ['query'],
      rowLimit: 20,
    });

    const analyticsRes28 = await getSearchAnalytics({
      startDate: fmt(new Date(now.getTime() - 56 * 24 * 60 * 60 * 1000)),
      endDate: fmt(new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000)),
      dimensions: ['query'],
      rowLimit: 20,
    });

    const sitemap = sitemapsRes.data.find((s) => s.path.includes('sitemap.xml'));

    return NextResponse.json({
      sitemap: sitemap || null,
      sitemapCount: sitemapsRes.data.length,
      analytics: analyticsRes.ok ? analyticsRes.data : [],
      analyticsPrevious: analyticsRes28.ok ? analyticsRes28.data : [],
      lastUpdated: now.toISOString(),
    });
  } catch (err: any) {
    console.error('[GSC API] Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
