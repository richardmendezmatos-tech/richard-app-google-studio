import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

export async function POST(req: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Missing credentials' }, { status: 500 });
  }

  try {
    const body = await req.json();
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error } = await supabase.from('hot_leads').insert({
      vehicle_id: body.vehicleId,
      vehicle_name: body.vehicleName,
      vehicle_price: body.vehiclePrice,
      monthly_payment: body.monthlyPayment,
      down_payment: body.downPayment,
      trade_in: body.tradeIn,
      term: body.term,
      credit_tier: body.creditTier,
      source: body.source,
      timestamp: new Date().toISOString(),
    });

    if (error) {
      console.error('[Leads Capture] Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Leads Capture] Exception:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
