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

    const { error } = await supabase.from('purchase_orders').insert({
      query: body.query,
      recommendation: body.recommendation,
      estimated_roi: body.roi,
      priority: body.priority,
      reason: body.reason,
      estimated_purchase_price: body.estimatedPurchasePrice,
      estimated_resale_price: body.estimatedResalePrice,
      market_scarcity: body.marketScarcity,
      target_source: body.targetSource,
      status: 'draft',
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error('[Purchase Orders] Error creating draft:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Purchase Orders] Exception:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Missing credentials' }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'id and status are required' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { error } = await supabase.from('purchase_orders').update({ status }).eq('id', id);

    if (error) {
      console.error('[Purchase Orders] Error updating status:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Purchase Orders] Exception:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
