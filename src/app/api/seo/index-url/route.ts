import { NextResponse } from 'next/server';
import { submitUrlToGoogle, submitUrlIndexNow, submitUrlsBatch } from '@/shared/api/seo/gscService';
import { SITE_CONFIG } from '@/shared/config/siteConfig';

export const runtime = 'nodejs';

/**
 * POST /api/seo/index-url
 * Submit one or more URLs to Google Indexing API + IndexNow for immediate indexing.
 *
 * Body: { url?: string; urls?: string[]; type?: 'URL_UPDATED' | 'URL_DELETED' }
 * Header: Authorization: Bearer <CRON_SECRET>
 */
export async function POST(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const type = body.type || 'URL_UPDATED';

    // Accept either a single url or a batch
    const rawUrls: string[] = body.urls || (body.url ? [body.url] : []);
    if (rawUrls.length === 0) {
      return NextResponse.json({ error: 'url or urls required' }, { status: 400 });
    }

    // Ensure absolute URLs
    const urls = rawUrls.map((u) =>
      u.startsWith('http') ? u : `${SITE_CONFIG.url}${u.startsWith('/') ? '' : '/'}${u}`,
    );

    const [googleResult, indexNowResults] = await Promise.allSettled([
      submitUrlsBatch(urls, type),
      Promise.allSettled(urls.map((u) => submitUrlIndexNow(u))),
    ]);

    const google =
      googleResult.status === 'fulfilled'
        ? googleResult.value
        : { submitted: 0, failed: urls.length, errors: [String(googleResult.reason)] };

    const indexNowOk =
      indexNowResults.status === 'fulfilled'
        ? indexNowResults.value.filter((r) => r.status === 'fulfilled').length
        : 0;

    return NextResponse.json({
      ok: true,
      urls,
      google,
      indexNow: { submitted: indexNowOk, total: urls.length },
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('[SEO index-url] Error:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
