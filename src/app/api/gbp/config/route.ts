import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GBPService } from '@/shared/api/gbp/gbpService';

export const runtime = 'edge';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ configured: false, config: null });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data: profiles } = await supabase
    .from('profiles')
    .select('metadata')
    .eq('role', 'admin')
    .limit(1);

  const gbpConfig = (profiles?.[0] as any)?.metadata?.gbp_config || {};

  return NextResponse.json({
    configured: !!(gbpConfig.accountId && gbpConfig.locationId),
    config: {
      accountId: gbpConfig.accountId || '',
      locationId: gbpConfig.locationId || '',
      hasToken: !!gbpConfig.accessToken,
    },
  });
}

export async function PUT(req: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Server config missing' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const body = await req.json();
  const { accountId, locationId, accessToken, refreshToken } = body;

  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('id, metadata')
    .eq('role', 'admin')
    .limit(1)
    .single();

  if (!adminProfile) {
    return NextResponse.json({ error: 'Admin profile not found' }, { status: 404 });
  }

  const metadata = (adminProfile as any).metadata || {};
  metadata.gbp_config = {
    ...(metadata.gbp_config || {}),
    ...(accountId !== undefined && { accountId }),
    ...(locationId !== undefined && { locationId }),
    ...(accessToken !== undefined && { accessToken }),
    ...(refreshToken !== undefined && { refreshToken }),
  };

  const { error } = await supabase
    .from('profiles')
    .update({ metadata })
    .eq('id', (adminProfile as any).id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
