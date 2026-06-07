import { NextResponse } from 'next/server';
import { GBPService } from '@/shared/api/gbp/gbpService';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ reviewId: string }> },
) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const { reviewId } = await params;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Server config missing' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data: profiles } = await supabase
    .from('profiles')
    .select('metadata')
    .eq('role', 'admin')
    .limit(1);
  const gbpConfig = (profiles?.[0] as any)?.metadata?.gbp_config || {};

  if (!gbpConfig.accountId || !gbpConfig.locationId || !gbpConfig.accessToken) {
    return NextResponse.json({ error: 'GBP not configured' }, { status: 400 });
  }

  const body = await req.json();
  const { replyText } = body;

  if (!replyText) {
    return NextResponse.json({ error: 'replyText required' }, { status: 400 });
  }

  const gbp = new GBPService(gbpConfig);
  const success = await gbp.replyToReview(reviewId, replyText);

  if (!success) {
    return NextResponse.json({ error: 'Failed to post reply' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
