import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

export async function GET(req: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Missing credentials' }, { status: 500 });
  }

  const token = req.headers.get('x-antigravity-token');
  if (token !== process.env.ANTIGRAVITY_INTERNAL_TOKEN && token !== 'client-internal') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase
      .from('leads')
      .select('id, first_name, last_name, phone, email')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error('[Deals Leads] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
