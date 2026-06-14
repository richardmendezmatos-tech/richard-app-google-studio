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
    const { email, source } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { error } = await supabase.from('subscribers').insert([
      { email, source: source || 'blog' },
    ]);

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ success: true, existed: true });
      }
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Subscribers] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
