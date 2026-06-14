import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Missing credentials' }, { status: 500 });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase
      .from('inventory')
      .select('vin, make, model, year, price, images, condition')
      .eq('status', 'AVAILABLE')
      .order('price', { ascending: true })
      .limit(20);

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error('[Inventory Available] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
