import { NextResponse } from 'next/server';
import { GBPService } from '@/shared/api/gbp/gbpService';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ connected: false, reviews: [] });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data: profiles } = await supabase
    .from('profiles')
    .select('metadata')
    .eq('role', 'admin')
    .limit(1);
  const gbpConfig = (profiles?.[0] as any)?.metadata?.gbp_config || {};

  if (!gbpConfig.accountId || !gbpConfig.locationId || !gbpConfig.accessToken) {
    return NextResponse.json({ connected: false, reviews: [] });
  }

  const gbp = new GBPService(gbpConfig);
  const reviews = await gbp.getReviews();

  return NextResponse.json({
    connected: true,
    reviews: reviews.map((r: any) => ({
      id: r.reviewId || r.name?.split('/').pop(),
      name: r.comment?.author?.displayName || 'Cliente',
      text: r.comment?.text || '',
      stars: r.starRating || 5,
      createTime: r.createTime || r.comment?.timestamp,
      reviewer: r.comment?.author,
    })),
  }, {
    headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600' },
  });
}
