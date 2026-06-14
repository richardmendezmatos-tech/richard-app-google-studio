import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

export async function GET(req: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Missing credentials' }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const tag = searchParams.get('tag');
    if (!tag) {
      return NextResponse.json({ error: 'Missing tag parameter' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .or(`make.ilike.%${tag}%,model.ilike.%${tag}%,condition.ilike.%${tag}%`)
      .limit(3);

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error('[Inventory Related] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
